import { create } from 'zustand'
import { Audio, AVPlaybackStatus } from 'expo-av'
import type { VerseReference } from '@/types'
import { getAyahAudioUrl } from '@/services/alquran-cloud'

interface AudioState {
  // Playback state
  isPlaying: boolean
  isLoading: boolean
  sound: Audio.Sound | null

  // Current playback
  currentAyah: VerseReference | null
  reciterId: string

  // Playback settings
  playbackSpeed: number
  repeatCount: number
  currentRepeat: number
  autoPlayNext: boolean

  // Loop settings
  loopStart: VerseReference | null
  loopEnd: VerseReference | null
  isLooping: boolean

  // Progress
  positionMs: number
  durationMs: number

  // Error
  error: string | null
}

interface AudioActions {
  // Playback controls
  playAyah: (surahNumber: number, ayahNumber: number, reciterId: string) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  stop: () => Promise<void>
  seek: (positionMs: number) => Promise<void>

  // Settings
  setPlaybackSpeed: (speed: number) => Promise<void>
  setRepeatCount: (count: number) => void
  setAutoPlayNext: (enabled: boolean) => void
  setReciterId: (id: string) => void

  // Loop controls
  setLoopRange: (start: VerseReference | null, end: VerseReference | null) => void
  toggleLoop: () => void

  // Cleanup
  cleanup: () => Promise<void>
}

const initialState: AudioState = {
  isPlaying: false,
  isLoading: false,
  sound: null,
  currentAyah: null,
  reciterId: 'ar.alafasy',
  playbackSpeed: 1,
  repeatCount: 1,
  currentRepeat: 0,
  autoPlayNext: true,
  loopStart: null,
  loopEnd: null,
  isLooping: false,
  positionMs: 0,
  durationMs: 0,
  error: null,
}

export const useAudioStore = create<AudioState & AudioActions>()((set, get) => ({
  ...initialState,

  playAyah: async (surahNumber, ayahNumber, reciterId) => {
    const { sound: currentSound } = get()

    set({ isLoading: true, error: null })

    try {
      // Cleanup previous sound
      if (currentSound) {
        await currentSound.unloadAsync()
      }

      // Get audio URL from API
      const audioUrl = await getAyahAudioUrl(surahNumber, ayahNumber, reciterId)

      // Create new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, rate: get().playbackSpeed },
        (status) => onPlaybackStatusUpdate(status, set, get)
      )

      set({
        sound,
        currentAyah: {
          surahNumber,
          ayahNumber,
          pageNumber: 0, // Will be updated from API data
          juz: 0,
        },
        reciterId,
        isPlaying: true,
        isLoading: false,
        currentRepeat: 0,
      })
    } catch (error) {
      console.error('Failed to play ayah:', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to play audio',
      })
    }
  },

  pause: async () => {
    const { sound } = get()
    if (sound) {
      await sound.pauseAsync()
      set({ isPlaying: false })
    }
  },

  resume: async () => {
    const { sound } = get()
    if (sound) {
      await sound.playAsync()
      set({ isPlaying: true })
    }
  },

  stop: async () => {
    const { sound } = get()
    if (sound) {
      await sound.stopAsync()
      set({ isPlaying: false, positionMs: 0 })
    }
  },

  seek: async (positionMs) => {
    const { sound } = get()
    if (sound) {
      await sound.setPositionAsync(positionMs)
      set({ positionMs })
    }
  },

  setPlaybackSpeed: async (speed) => {
    const { sound } = get()
    if (sound) {
      await sound.setRateAsync(speed, true)
    }
    set({ playbackSpeed: speed })
  },

  setRepeatCount: (count) => {
    set({ repeatCount: count })
  },

  setAutoPlayNext: (enabled) => {
    set({ autoPlayNext: enabled })
  },

  setReciterId: (id) => {
    set({ reciterId: id })
  },

  setLoopRange: (start, end) => {
    set({ loopStart: start, loopEnd: end })
  },

  toggleLoop: () => {
    set((state) => ({ isLooping: !state.isLooping }))
  },

  cleanup: async () => {
    const { sound } = get()
    if (sound) {
      await sound.unloadAsync()
    }
    set(initialState)
  },
}))

// Playback status update handler
function onPlaybackStatusUpdate(
  status: AVPlaybackStatus,
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState & AudioActions
) {
  if (!status.isLoaded) {
    if (status.error) {
      set({ error: status.error, isPlaying: false })
    }
    return
  }

  set({
    positionMs: status.positionMillis,
    durationMs: status.durationMillis || 0,
    isPlaying: status.isPlaying,
  })

  // Handle playback finished
  if (status.didJustFinish) {
    const { repeatCount, currentRepeat, autoPlayNext, currentAyah, reciterId } = get()

    // Check if we need to repeat
    if (currentRepeat < repeatCount - 1) {
      set({ currentRepeat: currentRepeat + 1 })
      get().seek(0)
      get().resume()
    } else if (autoPlayNext && currentAyah) {
      // Play next ayah
      get().playAyah(
        currentAyah.surahNumber,
        currentAyah.ayahNumber + 1,
        reciterId
      )
    } else {
      set({ isPlaying: false })
    }
  }
}

// Selectors
export const useIsPlaying = () => useAudioStore((s) => s.isPlaying)
export const useCurrentAyah = () => useAudioStore((s) => s.currentAyah)
export const useAudioProgress = () =>
  useAudioStore((s) => ({
    position: s.positionMs,
    duration: s.durationMs,
  }))
