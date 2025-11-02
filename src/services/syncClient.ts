interface SyncEvent<TPayload> {
  id: string
  type: 'progress'
  payload: TPayload
  createdAt: string
}

const STORAGE_KEY = 'quranapp-sync-queue'

const getQueue = <TPayload,>(): SyncEvent<TPayload>[] => {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SyncEvent<TPayload>[]
  } catch (error) {
    console.warn('Failed to parse sync queue', error)
    return []
  }
}

const saveQueue = <TPayload,>(queue: SyncEvent<TPayload>[]) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.warn('Failed to persist sync queue', error)
  }
}

const generateId = () => `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const queueProgressSync = (payload: Record<string, unknown>) => {
  const event: SyncEvent<Record<string, unknown>> = {
    id: generateId(),
    type: 'progress',
    payload,
    createdAt: new Date().toISOString()
  }

  const queue = getQueue<Record<string, unknown>>()
  queue.push(event)
  saveQueue(queue)
  flushSyncQueue().catch(() => undefined)
}

export const flushSyncQueue = async () => {
  const queue = getQueue<Record<string, unknown>>()
  if (queue.length === 0) return

  const remaining: typeof queue = []

  for (const event of queue) {
    const shouldAttemptNetwork = typeof navigator !== 'undefined' ? navigator.onLine : false

    if (!shouldAttemptNetwork) {
      remaining.push(event)
      continue
    }

    if (import.meta.env.DEV) {
      // In development we simulate success to avoid failing due to lack of backend
      console.debug('[sync] Mock synced event', event)
      continue
    }

    try {
      const response = await fetch('/api/sync/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event.payload)
      })

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`)
      }
    } catch (error) {
      console.warn('Progress sync failed; will retry later', error)
      remaining.push(event)
    }
  }

  saveQueue(remaining)
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushSyncQueue().catch(() => undefined)
  })
}
