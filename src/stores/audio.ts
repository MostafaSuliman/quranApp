import { create } from 'zustand'
import type { VerseReference, Reciter } from '@/types'
import { getAudioEditions, getAyahAudioUrl } from '@/services/alquran-cloud'

interface AudioState {
  // Audio element
  audioElement: HTMLAudioElement | null

  // Playback state
  isPlaying: boolean
  isLoading: boolean
  error: string | null

  // Current playback
  currentVerse: VerseReference | null
  currentAudioUrl: string | null

  // Reciter
  reciters: Reciter[]
  recitersLoading: boolean
  selectedReciterId: string

  // Playback settings
  playbackSpeed: number // 0.75, 1, 1.25, etc.
  volume: number // 0-1

  // Repeat/Loop settings
  repeatMode: 'off' | 'verse' | 'range'
  repeatCount: number // How many times to repeat
  currentRepeat: number // Current repeat count
  loopStart: VerseReference | null
  loopEnd: VerseReference | null

  // Queue
  queue: VerseReference[]
  queueIndex: number
}

interface AudioActions {
  // Initialization
  initAudio: () => void
  loadReciters: () => Promise<void>

  // Playback controls
  playVerse: (verse: VerseReference) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void

  // Queue management
  setQueue: (verses: VerseReference[]) => void
  playNext: () => Promise<void>
  playPrevious: () => Promise<void>

  // Reciter selection
  setReciter: (reciterId: string) => void

  // Settings
  setPlaybackSpeed: (speed: number) => void
  setVolume: (volume: number) => void

  // Repeat/Loop
  setRepeatMode: (mode: AudioState['repeatMode']) => void
  setRepeatCount: (count: number) => void
  setLoopRange: (start: VerseReference | null, end: VerseReference | null) => void

  // Cleanup
  cleanup: () => void
}

export const useAudioStore = create<AudioState & AudioActions>()((set, get) => ({
  // Initial state
  audioElement: null,
  isPlaying: false,
  isLoading: false,
  error: null,

  currentVerse: null,
  currentAudioUrl: null,

  reciters: [],
  recitersLoading: false,
  selectedReciterId: 'ar.alafasy',

  playbackSpeed: 1,
  volume: 1,

  repeatMode: 'off',
  repeatCount: 1,
  currentRepeat: 0,
  loopStart: null,
  loopEnd: null,

  queue: [],
  queueIndex: 0,

  // Initialize audio element
  initAudio: () => {
    if (get().audioElement) return

    const audio = new Audio()

    // Event handlers
    audio.onended = () => {
      const state = get()

      // Handle repeat
      if (state.repeatMode === 'verse' && state.currentRepeat < state.repeatCount - 1) {
        set({ currentRepeat: state.currentRepeat + 1 })
        audio.currentTime = 0
        audio.play()
        return
      }

      // Reset repeat counter
      set({ currentRepeat: 0 })

      // Play next in queue
      if (state.queueIndex < state.queue.length - 1) {
        get().playNext()
      } else if (state.repeatMode === 'range' && state.loopStart) {
        // Loop back to start of range
        set({ queueIndex: 0 })
        const firstVerse = state.queue[0]
        if (firstVerse) {
          get().playVerse(firstVerse)
        }
      } else {
        set({ isPlaying: false })
      }
    }

    audio.onerror = () => {
      set({
        isPlaying: false,
        isLoading: false,
        error: 'Failed to play audio',
      })
    }

    audio.onloadstart = () => set({ isLoading: true })
    audio.oncanplay = () => set({ isLoading: false })

    set({ audioElement: audio })
  },

  // Load available reciters
  loadReciters: async () => {
    set({ recitersLoading: true })

    try {
      const reciters = await getAudioEditions()
      set({ reciters, recitersLoading: false })
    } catch (error) {
      set({
        recitersLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load reciters',
      })
    }
  },

  // Play a specific verse
  playVerse: async (verse: VerseReference) => {
    const { audioElement, selectedReciterId } = get()

    if (!audioElement) {
      get().initAudio()
    }

    const audio = get().audioElement
    if (!audio) return

    set({ isLoading: true, error: null, currentVerse: verse })

    try {
      const audioUrl = await getAyahAudioUrl(
        verse.surahNumber,
        verse.ayahNumber,
        selectedReciterId
      )

      audio.src = audioUrl
      audio.playbackRate = get().playbackSpeed
      audio.volume = get().volume

      await audio.play()

      set({
        isPlaying: true,
        isLoading: false,
        currentAudioUrl: audioUrl,
      })
    } catch (error) {
      set({
        isPlaying: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to play verse',
      })
    }
  },

  // Pause playback
  pause: () => {
    const { audioElement } = get()
    if (audioElement) {
      audioElement.pause()
      set({ isPlaying: false })
    }
  },

  // Resume playback
  resume: () => {
    const { audioElement } = get()
    if (audioElement && audioElement.src) {
      audioElement.play()
      set({ isPlaying: true })
    }
  },

  // Stop playback
  stop: () => {
    const { audioElement } = get()
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
      set({
        isPlaying: false,
        currentVerse: null,
        currentAudioUrl: null,
        currentRepeat: 0,
      })
    }
  },

  // Set queue of verses to play
  setQueue: (verses: VerseReference[]) => {
    set({ queue: verses, queueIndex: 0 })
  },

  // Play next verse in queue
  playNext: async () => {
    const { queue, queueIndex } = get()
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1
      set({ queueIndex: nextIndex })
      const nextVerse = queue[nextIndex]
      if (nextVerse) {
        await get().playVerse(nextVerse)
      }
    }
  },

  // Play previous verse in queue
  playPrevious: async () => {
    const { queue, queueIndex } = get()
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1
      set({ queueIndex: prevIndex })
      const prevVerse = queue[prevIndex]
      if (prevVerse) {
        await get().playVerse(prevVerse)
      }
    }
  },

  // Set reciter
  setReciter: (reciterId: string) => {
    set({ selectedReciterId: reciterId })
  },

  // Set playback speed
  setPlaybackSpeed: (speed: number) => {
    const { audioElement } = get()
    if (audioElement) {
      audioElement.playbackRate = speed
    }
    set({ playbackSpeed: speed })
  },

  // Set volume
  setVolume: (volume: number) => {
    const { audioElement } = get()
    if (audioElement) {
      audioElement.volume = volume
    }
    set({ volume })
  },

  // Set repeat mode
  setRepeatMode: (repeatMode) => {
    set({ repeatMode, currentRepeat: 0 })
  },

  // Set repeat count
  setRepeatCount: (repeatCount) => {
    set({ repeatCount })
  },

  // Set loop range
  setLoopRange: (start, end) => {
    set({ loopStart: start, loopEnd: end })
  },

  // Cleanup
  cleanup: () => {
    const { audioElement } = get()
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ''
    }
    set({
      audioElement: null,
      isPlaying: false,
      currentVerse: null,
      currentAudioUrl: null,
    })
  },
}))

// Selectors
export const useIsPlaying = () => useAudioStore((s) => s.isPlaying)
export const useCurrentVerse = () => useAudioStore((s) => s.currentVerse)
export const useReciters = () => useAudioStore((s) => s.reciters)
export const useAudioReciterId = () => useAudioStore((s) => s.selectedReciterId)
