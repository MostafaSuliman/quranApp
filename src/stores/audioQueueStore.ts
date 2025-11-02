import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Reciter } from '../types/quran'
import { quranApi } from '../utils/quranApi'
import { useAudioPlayerStore } from './audioPlayerStore'
import { useAudioSettingsStore } from './audioSettingsStore'
import { useAudioDownloadStore } from './audioDownloadStore'

export type RepeatMode = 'none' | 'one' | 'three' | 'five' | 'infinite'

const revokeObjectUrl = (url: string | null) => {
  if (!url) return
  if (typeof window === 'undefined' || typeof URL === 'undefined' || !URL.revokeObjectURL) return
  try {
    URL.revokeObjectURL(url)
  } catch (error) {
    console.warn('Failed to revoke cached audio URL', error)
  }
}

/**
 * Audio Queue Store
 *
 * Manages queue and navigation functionality:
 * - Current track (surah, ayah, reciter)
 * - Next/previous navigation
 * - Repeat modes
 * - Auto-play settings
 * - Loading audio URLs
 *
 * Dependencies:
 * - audioPlayerStore (for playback control)
 * - audioSettingsStore (for reciter settings)
 * No circular dependencies
 */
interface AudioQueueState {
  // Current track
  currentSurahNumber: number | null
  currentAyahNumber: number | null
  audioUrl: string | null
  cachedObjectUrl: string | null

  // Repeat settings
  repeatMode: RepeatMode
  currentRepetition: number
  maxRepetitions: number
  autoPlayNext: boolean

  // Loop (A-B) settings
  loopStart: number | null
  loopEnd: number | null
  loopActive: boolean
  loopLastTriggeredAt: number | null

  // Waveform state
  waveformReady: boolean
  waveformData: number[] | null

  // Actions
  setRepeatMode: (mode: RepeatMode) => void
  setAutoPlayNext: (autoPlay: boolean) => void
  setLoopPoint: (point: 'start' | 'end', time: number) => void
  toggleLoopActive: (force?: boolean) => void
  clearLoop: () => void

  // Load audio
  loadAyahAudio: (surahNumber: number, ayahNumber: number, reciter?: Reciter) => Promise<void>
  loadChapterAudio: (surahNumber: number, reciter?: Reciter) => Promise<void>

  // Navigation
  playNext: () => Promise<void>
  playPrevious: () => Promise<void>

  // Waveform
  setWaveformData: (data: number[]) => void
  setWaveformReady: (ready: boolean) => void

  // Event handlers
  handleAudioEnded: () => void
  enforceLoop: (currentTime: number) => void

  // Utility
  reset: () => void
}

export const useAudioQueueStore = create<AudioQueueState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSurahNumber: null,
      currentAyahNumber: null,
      audioUrl: null,
      cachedObjectUrl: null,

      repeatMode: 'none',
      currentRepetition: 0,
      maxRepetitions: 1,
      autoPlayNext: false,

      loopStart: null,
      loopEnd: null,
      loopActive: false,
      loopLastTriggeredAt: null,

      waveformReady: false,
      waveformData: null,

      // Set repeat mode
      setRepeatMode: (mode: RepeatMode) => {
        let maxRepetitions = 1

        switch (mode) {
          case 'none':
            maxRepetitions = 1
            break
          case 'one':
            maxRepetitions = 1
            break
          case 'three':
            maxRepetitions = 3
            break
          case 'five':
            maxRepetitions = 5
            break
          case 'infinite':
            maxRepetitions = Infinity
            break
        }

        set({
          repeatMode: mode,
          maxRepetitions,
          currentRepetition: 0
        })
        console.log('🔁 Repeat mode set to:', mode)
      },

      setAutoPlayNext: (autoPlay: boolean) => {
        set({ autoPlayNext: autoPlay })
        console.log('⏭️ Auto-play next:', autoPlay)
      },

      setLoopPoint: (point: 'start' | 'end', time: number) => {
        if (Number.isNaN(time)) return
        set((state) => {
          const clampedTime = Math.max(0, time)
          if (point === 'start') {
            const updatedEnd = state.loopEnd !== null && state.loopEnd <= clampedTime ? null : state.loopEnd
            return {
              loopStart: clampedTime,
              loopEnd: updatedEnd,
              loopActive: false,
              loopLastTriggeredAt: null
            }
          }

          if (state.loopStart === null || clampedTime <= state.loopStart) {
            return {
              loopEnd: null,
              loopActive: false,
              loopLastTriggeredAt: null
            }
          }

          return {
            loopEnd: clampedTime,
            loopActive: true,
            loopLastTriggeredAt: null
          }
        })
      },

      toggleLoopActive: (force?: boolean) => {
        set((state) => {
          const nextActive = force !== undefined ? force : !state.loopActive
          if (!state.loopStart || !state.loopEnd || state.loopEnd <= state.loopStart) {
            return {
              loopActive: false,
              loopLastTriggeredAt: null
            }
          }
          return {
            loopActive: nextActive,
            loopLastTriggeredAt: null
          }
        })
      },

      clearLoop: () => {
        set({
          loopStart: null,
          loopEnd: null,
          loopActive: false,
          loopLastTriggeredAt: null
        })
      },

      // Load ayah audio
      loadAyahAudio: async (surahNumber: number, ayahNumber: number, reciter?: Reciter) => {
        const playerStore = useAudioPlayerStore.getState()
        const settingsStore = useAudioSettingsStore.getState()
        const downloadStore = useAudioDownloadStore.getState()

        try {
          playerStore.setError(null)

          // Use provided reciter or get from settings
          const selectedReciter = reciter || settingsStore.preferredReciter
          if (!selectedReciter) {
            throw new Error('No reciter selected')
          }

          const audioUrl = quranApi.getAudioUrl(selectedReciter.id, surahNumber, ayahNumber)
          console.log('📥 Loading audio URL:', audioUrl)

          // Revoke previous object URL if applicable
          const currentState = get()
          if (currentState.cachedObjectUrl) {
            revokeObjectUrl(currentState.cachedObjectUrl)
          }

          const cachedObjectUrl = await downloadStore.getCachedObjectUrl(audioUrl)

          // Create new audio element
          const audio = new Audio()
          audio.preload = 'metadata'
          audio.crossOrigin = 'anonymous'
          audio.src = cachedObjectUrl ?? audioUrl

          // Set in player store (this handles cleanup of previous audio)
          playerStore.setAudioElement(audio)

          // Update queue state
          set({
            audioUrl,
            currentSurahNumber: surahNumber,
            currentAyahNumber: ayahNumber,
            currentRepetition: 0,
            waveformReady: false,
            autoPlayNext: false, // Reset for single ayah
            cachedObjectUrl,
            loopActive: cachedObjectUrl ? get().loopActive : get().loopActive,
            loopLastTriggeredAt: null
          })

          // Update reciter in settings if provided
          if (reciter) {
            settingsStore.setReciter(reciter)
          }

          console.log('✅ Audio loaded:', { surahNumber, ayahNumber, reciter: selectedReciter.name })
        } catch (error) {
          console.error('Error loading audio:', error)
          playerStore.setError('Failed to load audio. Please check your connection.')
        }
      },

      // Load chapter audio
      loadChapterAudio: async (surahNumber: number, reciter?: Reciter) => {
        const playerStore = useAudioPlayerStore.getState()
        const settingsStore = useAudioSettingsStore.getState()
        const downloadStore = useAudioDownloadStore.getState()

        try {
          playerStore.setError(null)

          const selectedReciter = reciter || settingsStore.preferredReciter
          if (!selectedReciter) {
            throw new Error('No reciter selected')
          }

          const audioUrl = quranApi.getChapterAudioUrl(selectedReciter.id, surahNumber)
          console.log('📥 Loading chapter audio URL:', audioUrl)

          const currentState = get()
          if (currentState.cachedObjectUrl) {
            revokeObjectUrl(currentState.cachedObjectUrl)
          }

          const cachedObjectUrl = await downloadStore.getCachedObjectUrl(audioUrl)

          const audio = new Audio()
          audio.preload = 'metadata'
          audio.crossOrigin = 'anonymous'
          audio.src = cachedObjectUrl ?? audioUrl

          playerStore.setAudioElement(audio)

          set({
            audioUrl,
            currentSurahNumber: surahNumber,
            currentAyahNumber: null, // Full chapter
            currentRepetition: 0,
            waveformReady: false,
            cachedObjectUrl,
            loopLastTriggeredAt: null
          })

          if (reciter) {
            settingsStore.setReciter(reciter)
          }

          console.log('✅ Chapter audio loaded:', { surahNumber, reciter: selectedReciter.name })
        } catch (error) {
          console.error('Error loading chapter audio:', error)
          playerStore.setError('Failed to load chapter audio. Please check your connection.')
        }
      },

      // Play next ayah
      playNext: async () => {
        const state = get()
        if (!state.currentSurahNumber || !state.currentAyahNumber) return

        await get().loadAyahAudio(state.currentSurahNumber, state.currentAyahNumber + 1)

        if (state.autoPlayNext) {
          const playerStore = useAudioPlayerStore.getState()
          await playerStore.play()
        }
      },

      // Play previous ayah
      playPrevious: async () => {
        const state = get()
        if (!state.currentSurahNumber || !state.currentAyahNumber || state.currentAyahNumber <= 1) {
          return
        }

        await get().loadAyahAudio(state.currentSurahNumber, state.currentAyahNumber - 1)

        if (state.autoPlayNext) {
          const playerStore = useAudioPlayerStore.getState()
          await playerStore.play()
        }
      },

      // Waveform
      setWaveformData: (data: number[]) => {
        set({ waveformData: data })
      },

      setWaveformReady: (ready: boolean) => {
        set({ waveformReady: ready })
      },

      // Handle when audio finishes playing
      handleAudioEnded: () => {
        const state = get()
        const playerStore = useAudioPlayerStore.getState()

        if (state.loopActive && state.loopStart !== null) {
          const audio = playerStore.currentAudio
          if (audio) {
            audio.currentTime = state.loopStart
            playerStore.play().catch(() => undefined)
            return
          }
        }

        // Handle repeat logic
        if (state.repeatMode !== 'none' && state.currentRepetition < state.maxRepetitions - 1) {
          set({ currentRepetition: state.currentRepetition + 1 })
          setTimeout(() => playerStore.play(), 500)
          return
        }

        // Reset repetition counter
        set({ currentRepetition: 0 })

        // Auto-play next if enabled
        if (state.autoPlayNext && state.currentAyahNumber) {
          console.log('⏭️ Auto-playing next ayah')
          setTimeout(() => get().playNext(), 1000)
        } else {
          console.log('⏹️ Playback completed')
        }
      },

      enforceLoop: (currentTime: number) => {
        const state = get()
        if (!state.loopActive || state.loopStart === null || state.loopEnd === null) {
          return
        }

        if (state.loopEnd <= state.loopStart) {
          return
        }

        const threshold = Math.max(0, state.loopEnd - 0.08)
        if (currentTime < threshold) {
          return
        }

        const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
        if (state.loopLastTriggeredAt && now - state.loopLastTriggeredAt < 120) {
          return
        }

        const playerStore = useAudioPlayerStore.getState()
        const audio = playerStore.currentAudio
        if (!audio) return

        audio.currentTime = state.loopStart
        if (playerStore.isPlaying) {
          audio.play().catch(() => undefined)
        }

        set({ loopLastTriggeredAt: now })
      },

      // Reset queue
      reset: () => {
        const currentState = get()
        if (currentState.cachedObjectUrl) {
          revokeObjectUrl(currentState.cachedObjectUrl)
        }
        set({
          currentSurahNumber: null,
          currentAyahNumber: null,
          audioUrl: null,
          currentRepetition: 0,
          waveformReady: false,
          waveformData: null,
          cachedObjectUrl: null,
          loopStart: null,
          loopEnd: null,
          loopActive: false,
          loopLastTriggeredAt: null
        })
      }
    }),
    {
      name: 'audio-queue-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        repeatMode: state.repeatMode,
        autoPlayNext: state.autoPlayNext,
        loopStart: state.loopStart,
        loopEnd: state.loopEnd,
        loopActive: state.loopActive
      })
    }
  )
)

// Subscribe to audio ended events from player
// We need to set up the 'ended' event listener on the audio element
const setupAudioEndedListener = () => {
  const unsubscribe = useAudioPlayerStore.subscribe(
    (state) => state.currentAudio,
    (currentAudio, previousAudio) => {
      // Remove listener from previous audio
      if (previousAudio) {
        previousAudio.removeEventListener('ended', useAudioQueueStore.getState().handleAudioEnded)
      }

      // Add listener to new audio
      if (currentAudio) {
        currentAudio.addEventListener('ended', useAudioQueueStore.getState().handleAudioEnded)
      }
    }
  )

  return unsubscribe
}

// Initialize the listener
if (typeof window !== 'undefined') {
  setupAudioEndedListener()
}
