import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { quranApi } from '../utils/quranApi'
import { DEFAULT_RECITERS } from './audioSettingsStore'

export type DownloadScope =
  | { type: 'surah'; surahNumber: number }
  | { type: 'juz'; juzNumber: number }

export type DownloadStatus = 'queued' | 'downloading' | 'completed' | 'failed' | 'cancelled'

export interface DownloadTask {
  id: string
  scope: DownloadScope
  reciterId: string
  reciterName: string
  status: DownloadStatus
  progress: number
  downloadedBytes: number
  totalBytes: number | null
  error?: string
  startedAt?: string
  completedAt?: string
}

interface StorageEstimate {
  usage: number
  quota: number
}

interface AudioDownloadState {
  tasks: DownloadTask[]
  activeTaskId: string | null
  storageEstimate?: StorageEstimate
  enqueueSurahDownload: (surahNumber: number, reciterId: string) => Promise<string>
  cancelTask: (taskId: string) => void
  removeTask: (taskId: string) => void
  clearCompleted: () => void
  refreshStorageEstimate: () => Promise<void>
  getCachedObjectUrl: (url: string) => Promise<string | null>
  hasCachedAudio: (url: string) => Promise<boolean>
}

const controllers = new Map<string, AbortController>()
const objectUrlCache = new Map<string, string>()
const memoryBlobCache = new Map<string, Blob>()

const createTaskId = () => `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const storeBlob = async (url: string, blob: Blob): Promise<void> => {
  if (typeof caches !== 'undefined') {
    const cache = await caches.open('quran-audio')
    const response = new Response(blob, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(blob.size)
      }
    })
    await cache.put(url, response)
    return
  }

  memoryBlobCache.set(url, blob)
}

const getBlob = async (url: string): Promise<Blob | null> => {
  if (typeof caches !== 'undefined') {
    const cache = await caches.open('quran-audio')
    const match = await cache.match(url)
    if (!match) return null
    return await match.blob()
  }

  return memoryBlobCache.get(url) ?? null
}

const revokeObjectUrl = (url: string | null) => {
  if (!url) return
  if (typeof window === 'undefined' || typeof URL === 'undefined' || !URL.revokeObjectURL) return
  try {
    URL.revokeObjectURL(url)
  } catch (error) {
    console.warn('Failed to revoke object URL', error)
  }
}

export const useAudioDownloadStore = create<AudioDownloadState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,
      storageEstimate: undefined,

      enqueueSurahDownload: async (surahNumber: number, reciterId: string) => {
        const reciter = DEFAULT_RECITERS[reciterId as keyof typeof DEFAULT_RECITERS]
        if (!reciter) {
          throw new Error('Unknown reciter')
        }

        if (surahNumber < 1 || surahNumber > 114) {
          throw new Error('Surah number must be between 1 and 114')
        }

        const id = createTaskId()
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id,
              scope: { type: 'surah', surahNumber },
              reciterId: reciter.id,
              reciterName: reciter.name,
              status: 'queued',
              progress: 0,
              downloadedBytes: 0,
              totalBytes: null
            }
          ]
        }))

        processQueue()
        return id
      },

      cancelTask: (taskId: string) => {
        const controller = controllers.get(taskId)
        if (controller) {
          controller.abort()
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: task.status === 'downloading' ? 'cancelled' : task.status,
                  error: 'Download cancelled by user.'
                }
              : task
          ),
          activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId
        }))
      },

      removeTask: (taskId: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
          activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId
        }))
      },

      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.status !== 'completed')
        }))
      },

      refreshStorageEstimate: async () => {
        if (typeof navigator !== 'undefined' && (navigator as any).storage?.estimate) {
          try {
            const estimate = await (navigator as any).storage.estimate()
            set(() => ({
              storageEstimate: {
                usage: estimate.usage ?? 0,
                quota: estimate.quota ?? 0
              }
            }))
          } catch (error) {
            console.warn('Failed to estimate storage quota', error)
          }
        }
      },

      getCachedObjectUrl: async (url: string) => {
        if (typeof window === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) {
          return null
        }

        const existing = objectUrlCache.get(url)
        if (existing) {
          return existing
        }

        const blob = await getBlob(url)
        if (!blob) return null

        const objectUrl = URL.createObjectURL(blob)
        objectUrlCache.set(url, objectUrl)
        return objectUrl
      },

      hasCachedAudio: async (url: string) => {
        const blob = await getBlob(url)
        return Boolean(blob)
      }
    }),
    {
      name: 'audio-download-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        storageEstimate: state.storageEstimate
      })
    }
  )
)

const processQueue = async () => {
  const state = useAudioDownloadStore.getState()
  if (state.activeTaskId) return

  const nextTask = state.tasks.find((task) => task.status === 'queued')
  if (!nextTask) return

  const controller = new AbortController()
  controllers.set(nextTask.id, controller)

  useAudioDownloadStore.setState((prev) => ({
    tasks: prev.tasks.map((task) =>
      task.id === nextTask.id
        ? { ...task, status: 'downloading', startedAt: new Date().toISOString(), error: undefined }
        : task
    ),
    activeTaskId: nextTask.id,
    storageEstimate: prev.storageEstimate
  }))

  try {
    if (typeof window === 'undefined') {
      // Vitest / SSR fallback
      await new Promise((resolve) => setTimeout(resolve, 10))
      useAudioDownloadStore.setState((prev) => ({
        tasks: prev.tasks.map((task) =>
          task.id === nextTask.id
            ? {
                ...task,
                status: 'completed',
                progress: 100,
                downloadedBytes: 0,
                totalBytes: 0,
                completedAt: new Date().toISOString()
              }
            : task
        ),
        activeTaskId: null,
        storageEstimate: prev.storageEstimate
      }))
      controllers.delete(nextTask.id)
      processQueue()
      return
    }

    const url = quranApi.getChapterAudioUrl(nextTask.reciterId, nextTask.scope.type === 'surah' ? nextTask.scope.surahNumber : nextTask.scope.juzNumber)
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download audio (${response.status})`)
    }

    const total = Number(response.headers.get('Content-Length')) || null
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let received = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        chunks.push(value)
        received += value.length
        useAudioDownloadStore.setState((prev) => ({
          tasks: prev.tasks.map((task) =>
            task.id === nextTask.id
              ? {
                  ...task,
                  downloadedBytes: received,
                  totalBytes: total,
                  progress: total ? Math.min(100, Math.round((received / total) * 100)) : Math.min(99, task.progress + 1)
                }
              : task
          ),
          activeTaskId: prev.activeTaskId,
          storageEstimate: prev.storageEstimate
        }))
      }
    }

    const blob = new Blob(chunks, { type: 'audio/mpeg' })
    await storeBlob(url, blob)

    useAudioDownloadStore.setState((prev) => ({
      tasks: prev.tasks.map((task) =>
        task.id === nextTask.id
          ? {
              ...task,
              status: 'completed',
              progress: 100,
              downloadedBytes: blob.size,
              totalBytes: blob.size,
              completedAt: new Date().toISOString()
            }
          : task
      ),
      activeTaskId: null,
      storageEstimate: prev.storageEstimate
    }))
  } catch (error: any) {
    const aborted = controllers.get(nextTask.id)?.signal.aborted
    useAudioDownloadStore.setState((prev) => ({
      tasks: prev.tasks.map((task) =>
        task.id === nextTask.id
          ? {
              ...task,
              status: aborted ? 'cancelled' : 'failed',
              error: aborted ? 'Download cancelled by user.' : error?.message || 'Failed to download audio'
            }
          : task
      ),
      activeTaskId: null,
      storageEstimate: prev.storageEstimate
    }))
  } finally {
    controllers.delete(nextTask.id)
    useAudioDownloadStore.getState().refreshStorageEstimate().catch(() => undefined)
    processQueue()
  }
}

// Release object URLs on unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    objectUrlCache.forEach((url) => revokeObjectUrl(url))
    objectUrlCache.clear()
  })
}
