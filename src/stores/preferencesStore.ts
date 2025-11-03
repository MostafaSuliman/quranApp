import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { UserPreferences } from '../types/quran'

interface PreferencesState {
  preferences: UserPreferences
  isLoading: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => void
  updateReciter: (reciterId: string) => void
  updatePlaybackSpeed: (speed: number) => void
  updateTranslationSettings: (settings: {
    showTransliteration?: boolean
    showTranslation?: boolean
    translationLanguage?: string
  }) => void
  updateUILanguage: (language: 'ar' | 'en') => void
  updateNotificationTime: (time: string) => void
  updateReadingMode: (mode: 'learning' | 'mushaf') => void
  toggleDarkMode: () => void
  toggleAnimations: () => void
  // Audio navigation preferences
  updateAudioNavigationAction: (action: 'ask' | 'stop' | 'continue' | 'pause') => void
  toggleAudioNavigationModal: () => void
  updateAudioNavigationSettings: (settings: {
    audioNavigationAction?: 'ask' | 'stop' | 'continue' | 'pause'
    showAudioNavigationModal?: boolean
  }) => void
  resetToDefaults: () => void
  setError: (error: string | null) => void
}

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredReciter: '1', // Mishary Rashid Alafasy (known working reciter)
  playbackSpeed: 1.0,
  showTransliteration: true,
  showTranslation: true,
  translationLanguage: 'en',
  uiLanguage: 'ar', // Arabic as default UI language
  notificationTime: '19:00', // 7 PM (after Maghrib typically)
  defaultReadingMode: 'learning',
  darkMode: false,
  animationsEnabled: true,
  // Audio navigation preferences
  audioNavigationAction: 'ask',
  showAudioNavigationModal: true
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Initial State
      preferences: DEFAULT_PREFERENCES,
      isLoading: false,
      error: null,

      // Initialize preferences store
      initialize: async () => {
        set({ isLoading: true })
        
        try {
          const currentPrefs = get().preferences
          
          // Apply preferences to DOM immediately on load
          // This ensures settings take effect right away
          if (currentPrefs.darkMode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          
          // Apply animation settings
          if (!currentPrefs.animationsEnabled) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms')
          } else {
            document.documentElement.style.removeProperty('--animation-duration')
          }
          
          // Apply language and direction settings
          document.documentElement.lang = currentPrefs.uiLanguage
          document.documentElement.dir = currentPrefs.uiLanguage === 'ar' ? 'rtl' : 'ltr'
          
          // Check system theme preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          
          // Only update dark mode if user hasn't explicitly set it AND it differs from system
          if (currentPrefs.darkMode === DEFAULT_PREFERENCES.darkMode && systemPrefersDark !== currentPrefs.darkMode) {
            set(state => {
              const newState = {
                preferences: {
                  ...state.preferences,
                  darkMode: systemPrefersDark
                },
                isLoading: false
              }
              
              // Apply to DOM immediately
              if (systemPrefersDark) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
              
              return newState
            })
          } else {
            set({ isLoading: false })
          }
          
          // Sync audio navigation preferences with audio navigation store
          try {
            const { useAudioNavigationStore } = await import('./audioNavigationStore')
            const audioNavStore = useAudioNavigationStore.getState()
            
            if (currentPrefs.audioNavigationAction) {
              audioNavStore.setDefaultAction(currentPrefs.audioNavigationAction)
            }
            
            if (currentPrefs.showAudioNavigationModal !== undefined) {
              audioNavStore.setShowModalOnNavigation(currentPrefs.showAudioNavigationModal)
            }
          } catch (error) {
            console.warn('Failed to sync audio navigation preferences:', error)
          }
          
          // Listen for system theme changes
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const state = get()
            // Only auto-update if user hasn't manually set dark mode
            if (state.preferences.darkMode === DEFAULT_PREFERENCES.darkMode) {
              state.updatePreferences({ darkMode: e.matches })
            }
          })
          
        } catch (error) {
          console.error('Failed to initialize preferences:', error)
          set({ 
            error: 'Failed to load preferences',
            isLoading: false
          })
        }
      },

      // Update multiple preferences at once
      updatePreferences: (updates: Partial<UserPreferences>) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            ...updates
          }
        }))
      },

      // Update specific preference: reciter
      updateReciter: (reciterId: string) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            preferredReciter: reciterId
          }
        }))

        // Emit event instead of direct import (breaks circular dependency)
        import('./audio/audioEventBus').then(({ audioEventBus }) => {
          audioEventBus.emit('reciter:updated', { reciterId, reciter: null })
        }).catch(error => {
          console.error('Failed to emit reciter update event:', error)
          set({ error: 'Failed to update audio settings. Please try again.' })
        })
      },

      // Update playback speed with validation
      updatePlaybackSpeed: (speed: number) => {
        // Clamp speed between 0.5x and 2.0x
        const clampedSpeed = Math.max(0.5, Math.min(2.0, speed))

        set(state => ({
          preferences: {
            ...state.preferences,
            playbackSpeed: clampedSpeed
          }
        }))

        // Emit event instead of direct import (breaks circular dependency)
        import('./audio/audioEventBus').then(({ audioEventBus }) => {
          audioEventBus.emit('playback-speed:updated', { speed: clampedSpeed })
        }).catch(error => {
          console.error('Failed to emit playback speed update event:', error)
          set({ error: 'Failed to update audio settings. Please try again.' })
        })
      },

      // Update translation settings
      updateTranslationSettings: (settings: {
        showTransliteration?: boolean
        showTranslation?: boolean
        translationLanguage?: string
      }) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            ...settings
          }
        }))
      },

      // Update notification time with validation
      updateNotificationTime: (time: string) => {
        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(time)) {
          set({ error: 'Invalid time format. Please use HH:MM format.' })
          return
        }
        
        set(state => ({
          preferences: {
            ...state.preferences,
            notificationTime: time
          },
          error: null
        }))
      },

      // Update default reading mode
      updateReadingMode: (mode: 'learning' | 'mushaf') => {
        set(state => ({
          preferences: {
            ...state.preferences,
            defaultReadingMode: mode
          }
        }))
      },

      // Update UI language and direction
      updateUILanguage: (language: 'ar' | 'en') => {
        set(state => {
          // Apply language and direction to document immediately
          document.documentElement.lang = language
          document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
          
          return {
            preferences: {
              ...state.preferences,
              uiLanguage: language
            }
          }
        })
      },

      // Toggle dark mode
      toggleDarkMode: () => {
        set(state => {
          const newDarkMode = !state.preferences.darkMode
          
          // Apply to document immediately
          if (newDarkMode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          
          return {
            preferences: {
              ...state.preferences,
              darkMode: newDarkMode
            }
          }
        })
      },

      // Toggle animations
      toggleAnimations: () => {
        set(state => {
          const newAnimationsEnabled = !state.preferences.animationsEnabled
          
          // Apply reduced motion class if animations disabled
          if (!newAnimationsEnabled) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms')
          } else {
            document.documentElement.style.removeProperty('--animation-duration')
          }
          
          return {
            preferences: {
              ...state.preferences,
              animationsEnabled: newAnimationsEnabled
            }
          }
        })
      },

      // Audio navigation preferences
      updateAudioNavigationAction: (action: 'ask' | 'stop' | 'continue' | 'pause') => {
        set(state => ({
          preferences: {
            ...state.preferences,
            audioNavigationAction: action
          }
        }))
        
        // Sync with audio navigation store
        import('./audioNavigationStore').then(({ useAudioNavigationStore }) => {
          const audioNavStore = useAudioNavigationStore.getState()
          audioNavStore.setDefaultAction(action)
        }).catch(error => {
          console.warn('Failed to sync audio navigation action:', error)
        })
      },

      toggleAudioNavigationModal: () => {
        set(state => {
          const newShowModal = !state.preferences.showAudioNavigationModal
          
          // Sync with audio navigation store
          import('./audioNavigationStore').then(({ useAudioNavigationStore }) => {
            const audioNavStore = useAudioNavigationStore.getState()
            audioNavStore.setShowModalOnNavigation(newShowModal)
          }).catch(error => {
            console.warn('Failed to sync audio navigation modal setting:', error)
          })
          
          return {
            preferences: {
              ...state.preferences,
              showAudioNavigationModal: newShowModal
            }
          }
        })
      },

      updateAudioNavigationSettings: (settings: {
        audioNavigationAction?: 'ask' | 'stop' | 'continue' | 'pause'
        showAudioNavigationModal?: boolean
      }) => {
        set(state => {
          const updatedPreferences = {
            ...state.preferences,
            ...settings
          }
          
          // Sync with audio navigation store
          import('./audioNavigationStore').then(({ useAudioNavigationStore }) => {
            const audioNavStore = useAudioNavigationStore.getState()
            
            if (settings.audioNavigationAction) {
              audioNavStore.setDefaultAction(settings.audioNavigationAction)
            }
            
            if (settings.showAudioNavigationModal !== undefined) {
              audioNavStore.setShowModalOnNavigation(settings.showAudioNavigationModal)
            }
          }).catch(error => {
            console.warn('Failed to sync audio navigation settings:', error)
          })
          
          return {
            preferences: updatedPreferences
          }
        })
      },

      // Reset to default preferences
      resetToDefaults: () => {
        set({ 
          preferences: { ...DEFAULT_PREFERENCES },
          error: null
        })
        
        // Apply dark mode to document
        if (DEFAULT_PREFERENCES.darkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        // Apply default language and direction
        document.documentElement.lang = DEFAULT_PREFERENCES.uiLanguage
        document.documentElement.dir = DEFAULT_PREFERENCES.uiLanguage === 'ar' ? 'rtl' : 'ltr'
      },

      // Error handling
      setError: (error: string | null) => set({ error })
    }),
    {
      name: 'preferences-store',
      storage: createJSONStorage(() => localStorage),
      // Persist all preferences
      partialize: (state) => ({
        preferences: state.preferences
      })
    }
  )
)

// Helper hook for getting specific preference values
export const usePreference = <K extends keyof UserPreferences>(key: K) => {
  return usePreferencesStore(state => state.preferences[key])
}

// Helper hook for getting multiple preferences
export const usePreferences = <K extends keyof UserPreferences>(keys: K[]) => {
  return usePreferencesStore(state => 
    keys.reduce((acc, key) => {
      acc[key] = state.preferences[key]
      return acc
    }, {} as Pick<UserPreferences, K>)
  )
}