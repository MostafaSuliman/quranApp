import { create } from 'zustand'
import { useAudioSettingsStore } from './audioSettingsStore'
import { useAudioQueueStore } from './audioQueueStore'

/**
 * Audio Player Store
 *
 * Manages the core playback functionality:
 * - Play/pause/stop controls
 * - Seeking and time tracking
 * - Volume control
 * - Audio element lifecycle
 *
 * Dependencies: audioSettingsStore (for speed/volume settings)
 * No circular dependencies - only uses audioSettingsStore
 */
interface AudioPlayerState {
  // Playback state
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  progress: number

  // Audio element
  currentAudio: HTMLAudioElement | null

  // Error handling
  error: string | null

  // Actions
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void

  // Event handlers
  handleTimeUpdate: () => void
  handleMetadataLoaded: () => void
  handleAudioError: (event: any) => void

  // Internal
  setAudioElement: (audio: HTMLAudioElement | null) => void
  setError: (error: string | null) => void
  clearError: () => void
  cleanup: () => void
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  // Initial state
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  progress: 0,
  currentAudio: null,
  error: null,

  // Play audio
  play: async () => {
    const state = get()
    if (!state.currentAudio) {
      set({ error: 'No audio loaded' })
      return
    }

    try {
      set({ isLoading: true, error: null })

      // Get settings from audio settings store
      const { playbackSpeed, volume } = useAudioSettingsStore.getState()

      // Apply settings to audio element
      state.currentAudio.playbackRate = playbackSpeed
      state.currentAudio.volume = volume

      await state.currentAudio.play()
      set({ isPlaying: true, isLoading: false })
      console.log('▶️ Audio playing')
    } catch (error) {
      console.error('Error playing audio:', error)
      set({
        error: 'Failed to play audio. Please try again.',
        isPlaying: false,
        isLoading: false
      })
    }
  },

  // Pause audio
  pause: () => {
    const { currentAudio } = get()
    if (currentAudio) {
      currentAudio.pause()
      set({ isPlaying: false })
      console.log('⏸️ Audio paused')
    }
  },

  // Stop and reset
  stop: () => {
    const { currentAudio } = get()
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      set({
        isPlaying: false,
        currentTime: 0,
        progress: 0
      })
      console.log('⏹️ Audio stopped')
    }
  },

  // Seek to time
  seek: (time: number) => {
    const { currentAudio } = get()
    if (currentAudio) {
      currentAudio.currentTime = time
      set({
        currentTime: time,
        progress: (time / currentAudio.duration) * 100
      })
      console.log('⏩ Seeked to', time)
    }
  },

  // Event handlers
  handleTimeUpdate: () => {
    const state = get()
    if (state.currentAudio) {
      const currentTime = state.currentAudio.currentTime
      const duration = state.currentAudio.duration || 0
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0

      set({ currentTime, progress })

      try {
        useAudioQueueStore.getState().enforceLoop(currentTime)
      } catch (error) {
        console.warn('Audio loop enforcement failed', error)
      }
    }
  },

  handleMetadataLoaded: () => {
    const state = get()
    if (state.currentAudio) {
      set({ duration: state.currentAudio.duration || 0 })
      console.log('📊 Metadata loaded, duration:', state.currentAudio.duration)
    }
  },

  handleAudioError: (event: any) => {
    console.error('Audio error:', event)

    // Provide specific error messages
    let errorMessage = 'Audio playback error. Please try again.'

    if (event?.target?.error?.code === 2) {
      errorMessage = 'Audio file not found or network error.'
    } else if (event?.target?.error?.code === 3) {
      errorMessage = 'Audio decoding failed.'
    } else if (event?.target?.error?.code === 4) {
      errorMessage = 'Audio format not supported.'
    } else if (event?.type === 'error' && event?.target?.src) {
      errorMessage = 'Cannot access audio. Please check your connection.'
    }

    set({
      error: errorMessage,
      isPlaying: false,
      isLoading: false
    })
  },

  // Internal methods
  setAudioElement: (audio: HTMLAudioElement | null) => {
    const currentAudio = get().currentAudio

    // Clean up previous audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.removeEventListener('timeupdate', get().handleTimeUpdate)
      currentAudio.removeEventListener('loadedmetadata', get().handleMetadataLoaded)
      currentAudio.removeEventListener('error', get().handleAudioError)
    }

    // Set up new audio
    if (audio) {
      audio.addEventListener('timeupdate', get().handleTimeUpdate)
      audio.addEventListener('loadedmetadata', get().handleMetadataLoaded)
      audio.addEventListener('error', get().handleAudioError)
    }

    set({
      currentAudio: audio,
      currentTime: 0,
      duration: 0,
      progress: 0,
      isPlaying: false
    })
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  cleanup: () => {
    const { currentAudio } = get()
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.removeEventListener('timeupdate', get().handleTimeUpdate)
      currentAudio.removeEventListener('loadedmetadata', get().handleMetadataLoaded)
      currentAudio.removeEventListener('error', get().handleAudioError)
    }

    set({
      isPlaying: false,
      currentAudio: null,
      currentTime: 0,
      progress: 0,
      error: null
    })
  }
}))

// Subscribe to audio settings changes
useAudioSettingsStore.subscribe(
  (state) => ({ speed: state.playbackSpeed, volume: state.volume }),
  ({ speed, volume }) => {
    console.log('🔄 Audio settings changed, updating player:', { speed, volume })
    const audio = useAudioPlayerStore.getState().currentAudio
    if (audio) {
      audio.playbackRate = speed
      audio.volume = volume
    }
  }
)
