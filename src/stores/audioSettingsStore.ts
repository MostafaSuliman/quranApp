import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Reciter } from '../types/quran'
import { storeLogger as logger } from '../services/logger'
import { audioEventBus } from './audio/audioEventBus'

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2

/**
 * Shared Audio Settings Store
 *
 * This store manages audio-specific settings that are shared between
 * audioPlayerStore and preferencesStore, eliminating circular dependencies.
 *
 * Design Pattern: Single Source of Truth for Audio Settings
 * - Both audio and preferences stores subscribe to this store
 * - No circular imports - only unidirectional dependencies
 * - Settings changes emit events that other stores can react to
 */
interface AudioSettingsState {
  // Settings
  preferredReciter: Reciter | null
  playbackSpeed: PlaybackSpeed
  volume: number

  // Actions
  setReciter: (reciter: Reciter) => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
  setVolume: (volume: number) => void

  // Initialization
  initializeFromPreferences: (reciterId: string, speed: number) => void

  // Utility
  reset: () => void
}

// Default reciters mapping
const DEFAULT_RECITERS = {
  '1': { id: '1', name: 'Mishary Rashid Alafasy', englishName: 'Mishary Rashid Alafasy', style: 'Clear & Melodious', audioFormat: 'mp3' as const },
  '2': { id: '2', name: 'Abdur Rahman As-Sudais', englishName: 'Abdur Rahman As-Sudais', style: 'Madinah Style', audioFormat: 'mp3' as const },
  '3': { id: '3', name: 'Maher Al Mueaqly', englishName: 'Maher Al Mueaqly', style: 'Emotional', audioFormat: 'mp3' as const },
  '4': { id: '4', name: 'Saad Al Ghamidi', englishName: 'Saad Al Ghamidi', style: 'Slow & Clear', audioFormat: 'mp3' as const },
  '5': { id: '5', name: 'Ahmed Al Ajmy', englishName: 'Ahmed Al Ajmy', style: 'Melodious', audioFormat: 'mp3' as const },
  '6': { id: '6', name: 'Hani Ar-Rifai', englishName: 'Hani Ar-Rifai', style: 'Beautiful Voice', audioFormat: 'mp3' as const },
  '7': { id: '7', name: 'Abdul Basit Abdul Samad', englishName: 'Abdul Basit Abdul Samad', style: 'Murattal', audioFormat: 'mp3' as const }
} as const

export const useAudioSettingsStore = create<AudioSettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferredReciter: DEFAULT_RECITERS['1'], // Default to Mishary
      playbackSpeed: 1,
      volume: 0.8,

      // Update reciter
      setReciter: (reciter: Reciter) => {
        logger.info('Audio Settings: Updating reciter', { reciterName: reciter.name, reciterId: reciter.id })
        set({ preferredReciter: reciter })
      },

      // Update playback speed with validation
      setPlaybackSpeed: (speed: PlaybackSpeed) => {
        const clampedSpeed = Math.max(0.5, Math.min(2.0, speed)) as PlaybackSpeed
        logger.info('Audio Settings: Updating playback speed', { speed: clampedSpeed })
        set({ playbackSpeed: clampedSpeed })
      },

      // Update volume with validation
      setVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume))
        logger.debug('Audio Settings: Updating volume', { volume: clampedVolume })
        set({ volume: clampedVolume })
      },

      // Initialize from preferences store
      initializeFromPreferences: (reciterId: string, speed: number) => {
        logger.info('Audio Settings: Initializing from preferences', { reciterId, speed })

        // Get reciter object from ID
        const reciter = DEFAULT_RECITERS[reciterId as keyof typeof DEFAULT_RECITERS]
        if (reciter) {
          set({
            preferredReciter: reciter,
            playbackSpeed: speed as PlaybackSpeed
          })
        } else {
          logger.warn('Unknown reciter ID, using default', { reciterId })
        }
      },

      // Reset to defaults
      reset: () => {
        set({
          preferredReciter: DEFAULT_RECITERS['1'],
          playbackSpeed: 1,
          volume: 0.8
        })
      }
    }),
    {
      name: 'audio-settings-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferredReciter: state.preferredReciter,
        playbackSpeed: state.playbackSpeed,
        volume: state.volume
      })
    }
  )
)

// Helper function to get reciter by ID
export const getReciterById = (reciterId: string): Reciter | null => {
  return DEFAULT_RECITERS[reciterId as keyof typeof DEFAULT_RECITERS] || null
}

// Export reciters for use in other components
export { DEFAULT_RECITERS }
