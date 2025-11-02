/**
 * Audio Store (Orchestrator)
 *
 * This is a lightweight facade/orchestrator that combines:
 * - audioPlayerStore (playback controls)
 * - audioQueueStore (queue management, navigation)
 * - audioSettingsStore (reciter, speed, volume settings)
 *
 * Benefits:
 * - No circular dependencies
 * - Each store has a single responsibility
 * - Easier to test and maintain
 * - Backward compatible with existing code
 */

import { create } from 'zustand'
import { Reciter } from '../types/quran'
import {
  useAudioPlayerStore,
  useAudioQueueStore,
  useAudioSettingsStore,
  type RepeatMode,
  type PlaybackSpeed
} from './audio' // barrel export
import { audioLogger as logger } from '../services/logger'

/**
 * Combined Audio State
 *
 * This provides a unified interface that delegates to the specialized stores
 */
interface AudioPlayerState {
  // Playback state (from audioPlayerStore)
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  progress: number
  volume: number
  playbackSpeed: PlaybackSpeed

  // Content state (from audioQueueStore)
  currentAudio: HTMLAudioElement | null
  currentAyahNumber: number | null
  currentSurahNumber: number | null
  currentReciter: Reciter | null
  audioUrl: string | null

  // Repeat settings (from audioQueueStore)
  repeatMode: RepeatMode
  currentRepetition: number
  maxRepetitions: number
  autoPlayNext: boolean
  loopStart: number | null
  loopEnd: number | null
  loopActive: boolean

  // Waveform state (from audioQueueStore)
  waveformReady: boolean
  waveformData: number[] | null

  // Settings sync state (deprecated - for backward compatibility)
  isUpdatingSettings: boolean
  settingsUpdateSuccess: boolean

  // Error handling (from audioPlayerStore)
  error: string | null

  // Actions - Playback controls
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
  setRepeatMode: (mode: RepeatMode) => void
  setAutoPlayNext: (autoPlay: boolean) => void
  setLoopPoint: (point: 'start' | 'end', time: number) => void
  toggleLoopActive: (force?: boolean) => void
  clearLoop: () => void
  seekBy: (deltaSeconds: number) => void

  // Actions - Load audio
  loadAyahAudio: (surahNumber: number, ayahNumber: number, reciter?: Reciter) => Promise<void>
  loadChapterAudio: (surahNumber: number, reciter?: Reciter) => Promise<void>

  // Actions - Player controls
  playNext: () => Promise<void>
  playPrevious: () => Promise<void>
  togglePlayPause: () => Promise<void>

  // Actions - Waveform
  setWaveformData: (data: number[]) => void
  setWaveformReady: (ready: boolean) => void

  // Event handlers
  handleTimeUpdate: () => void
  handleAudioEnded: () => void
  handleMetadataLoaded: () => void
  handleAudioError: (event: any) => void

  // Utility
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void

  // Initialization
  initializeAudio: () => void
  syncWithPreferences: (preferences: any) => void
  cleanup: () => void

  // Settings feedback (deprecated)
  clearSettingsState: () => void

  // Keyboard shortcuts
  handleKeyPress: (key: string) => void
}

/**
 * Audio Store - Orchestrator Pattern
 *
 * This store acts as a facade that delegates to specialized stores.
 * It maintains backward compatibility while eliminating circular dependencies.
 */
export const useAudioStore = create<AudioPlayerState>((set, get) => {
  const playerStore = useAudioPlayerStore.getState()
  const queueStore = useAudioQueueStore.getState()
  const settingsStore = useAudioSettingsStore.getState()

  return {
    // Derived state - delegates to specialized stores
    get isPlaying() {
      return useAudioPlayerStore.getState().isPlaying
    },
    get isLoading() {
      return useAudioPlayerStore.getState().isLoading
    },
    get currentTime() {
      return useAudioPlayerStore.getState().currentTime
    },
    get duration() {
      return useAudioPlayerStore.getState().duration
    },
    get progress() {
      return useAudioPlayerStore.getState().progress
    },
    get volume() {
      return useAudioSettingsStore.getState().volume
    },
    get playbackSpeed() {
      return useAudioSettingsStore.getState().playbackSpeed
    },
    get currentAudio() {
      return useAudioPlayerStore.getState().currentAudio
    },
    get currentAyahNumber() {
      return useAudioQueueStore.getState().currentAyahNumber
    },
    get currentSurahNumber() {
      return useAudioQueueStore.getState().currentSurahNumber
    },
    get currentReciter() {
      return useAudioSettingsStore.getState().preferredReciter
    },
    get audioUrl() {
      return useAudioQueueStore.getState().audioUrl
    },
    get repeatMode() {
      return useAudioQueueStore.getState().repeatMode
    },
    get currentRepetition() {
      return useAudioQueueStore.getState().currentRepetition
    },
    get maxRepetitions() {
      return useAudioQueueStore.getState().maxRepetitions
    },
    get autoPlayNext() {
      return useAudioQueueStore.getState().autoPlayNext
    },
    get loopStart() {
      return useAudioQueueStore.getState().loopStart
    },
    get loopEnd() {
      return useAudioQueueStore.getState().loopEnd
    },
    get loopActive() {
      return useAudioQueueStore.getState().loopActive
    },
    get waveformReady() {
      return useAudioQueueStore.getState().waveformReady
    },
    get waveformData() {
      return useAudioQueueStore.getState().waveformData
    },
    get error() {
      return useAudioPlayerStore.getState().error
    },

    // Deprecated settings sync state (for backward compatibility)
    isUpdatingSettings: false,
    settingsUpdateSuccess: false,

    // Delegated actions - Playback
    play: () => useAudioPlayerStore.getState().play(),
    pause: () => useAudioPlayerStore.getState().pause(),
    stop: () => useAudioPlayerStore.getState().stop(),
    seek: (time: number) => useAudioPlayerStore.getState().seek(time),

    // Settings actions
    setVolume: (volume: number) => useAudioSettingsStore.getState().setVolume(volume),
    setPlaybackSpeed: (speed: PlaybackSpeed) => useAudioSettingsStore.getState().setPlaybackSpeed(speed),
    setRepeatMode: (mode: RepeatMode) => useAudioQueueStore.getState().setRepeatMode(mode),
    setAutoPlayNext: (autoPlay: boolean) => useAudioQueueStore.getState().setAutoPlayNext(autoPlay),
    setLoopPoint: (point: 'start' | 'end', time: number) => useAudioQueueStore.getState().setLoopPoint(point, time),
    toggleLoopActive: (force?: boolean) => useAudioQueueStore.getState().toggleLoopActive(force),
    clearLoop: () => useAudioQueueStore.getState().clearLoop(),
    seekBy: (deltaSeconds: number) => {
      const player = useAudioPlayerStore.getState()
      const target = Math.max(0, Math.min((player.currentAudio?.duration ?? player.duration) || 0, player.currentTime + deltaSeconds))
      player.seek(target)
    },

    // Queue actions
    loadAyahAudio: (surahNumber: number, ayahNumber: number, reciter?: Reciter) =>
      useAudioQueueStore.getState().loadAyahAudio(surahNumber, ayahNumber, reciter),
    loadChapterAudio: (surahNumber: number, reciter?: Reciter) =>
      useAudioQueueStore.getState().loadChapterAudio(surahNumber, reciter),
    playNext: () => useAudioQueueStore.getState().playNext(),
    playPrevious: () => useAudioQueueStore.getState().playPrevious(),

    // Combined actions
    togglePlayPause: async () => {
      const isPlaying = useAudioPlayerStore.getState().isPlaying
      if (isPlaying) {
        useAudioPlayerStore.getState().pause()
      } else {
        await useAudioPlayerStore.getState().play()
      }
    },

    // Waveform
    setWaveformData: (data: number[]) => useAudioQueueStore.getState().setWaveformData(data),
    setWaveformReady: (ready: boolean) => useAudioQueueStore.getState().setWaveformReady(ready),

    // Event handlers - delegate to appropriate stores
    handleTimeUpdate: () => useAudioPlayerStore.getState().handleTimeUpdate(),
    handleAudioEnded: () => useAudioQueueStore.getState().handleAudioEnded(),
    handleMetadataLoaded: () => useAudioPlayerStore.getState().handleMetadataLoaded(),
    handleAudioError: (event: any) => useAudioPlayerStore.getState().handleAudioError(event),

    // Error handling
    setError: (error: string | null) => useAudioPlayerStore.getState().setError(error),
    clearError: () => useAudioPlayerStore.getState().clearError(),

    // Reset all stores
    reset: () => {
      useAudioPlayerStore.getState().cleanup()
      useAudioQueueStore.getState().reset()
    },

    // Initialize audio - sync with settings
    initializeAudio: () => {
      logger.info('Initializing audio orchestrator')

      // Settings store is already initialized via persistence
      // No need for complex sync logic - stores are independently managed

      logger.info('Audio orchestrator initialized successfully')
    },

    // Sync with preferences (backward compatibility)
    syncWithPreferences: async (preferences: any) => {
      logger.info('Syncing with preferences (deprecated - use audioSettingsStore directly)')

      try {
        // Update settings store
        if (preferences.playbackSpeed !== undefined) {
          useAudioSettingsStore.getState().setPlaybackSpeed(preferences.playbackSpeed)
        }

        if (preferences.preferredReciter) {
          const { getReciterById } = await import('./audioSettingsStore')
          const reciter = getReciterById(preferences.preferredReciter)
          if (reciter) {
            useAudioSettingsStore.getState().setReciter(reciter)

            // Reload audio if currently playing
            const queueState = useAudioQueueStore.getState()
            const playerState = useAudioPlayerStore.getState()

            if (queueState.currentSurahNumber && queueState.currentAyahNumber) {
              const wasPlaying = playerState.isPlaying
              const currentTime = playerState.currentTime

              await queueState.loadAyahAudio(
                queueState.currentSurahNumber,
                queueState.currentAyahNumber,
                reciter
              )

              if (wasPlaying) {
                const audio = useAudioPlayerStore.getState().currentAudio
                if (audio && currentTime > 0) {
                  audio.currentTime = Math.min(currentTime, audio.duration || 0)
                }
                await playerState.play()
              }
            }
          }
        }

        logger.info('Preferences sync completed successfully')
      } catch (error) {
        logger.error('Failed to sync preferences', { error })
        useAudioPlayerStore.getState().setError('Failed to apply settings')
      }
    },

    // Cleanup
    cleanup: () => {
      useAudioPlayerStore.getState().cleanup()
      useAudioQueueStore.getState().reset()
    },

    // Deprecated methods (for backward compatibility)
    clearSettingsState: () => {
      logger.warn('clearSettingsState is deprecated')
    },

    // Keyboard shortcuts
    handleKeyPress: (key: string) => {
      const playerState = useAudioPlayerStore.getState()
      const queueState = useAudioQueueStore.getState()
      const settingsState = useAudioSettingsStore.getState()

      switch (key.toLowerCase()) {
        case ' ':
        case 'spacebar':
          get().togglePlayPause()
          break
        case 'arrowleft':
          get().seekBy(-10)
          break
        case 'arrowright':
          get().seekBy(10)
          break
        case 'arrowup':
          settingsState.setVolume(Math.min(1, settingsState.volume + 0.1))
          break
        case 'arrowdown':
          settingsState.setVolume(Math.max(0, settingsState.volume - 0.1))
          break
        case 'm':
          settingsState.setVolume(settingsState.volume > 0 ? 0 : 0.8)
          break
        case 'r':
          const repeatModes: RepeatMode[] = ['none', 'one', 'three', 'five', 'infinite']
          const currentIndex = repeatModes.indexOf(queueState.repeatMode)
          const nextIndex = (currentIndex + 1) % repeatModes.length
          queueState.setRepeatMode(repeatModes[nextIndex])
          break
        case 'a':
          queueState.setLoopPoint('start', playerState.currentTime)
          break
        case 'b':
          queueState.setLoopPoint('end', playerState.currentTime)
          break
        case 'l':
          queueState.toggleLoopActive()
          break
        case 's':
          playerState.stop()
          break
      }
    }
  }
})

// Export types
export type { RepeatMode, PlaybackSpeed }
