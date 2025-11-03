import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Reciter } from '../types/quran'
import { quranApi } from '../utils/quranApi'

export type RepeatMode = 'none' | 'one' | 'three' | 'five' | 'infinite'
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2

interface AudioPlayerState {
  // Audio state
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  progress: number
  volume: number
  playbackSpeed: PlaybackSpeed
  
  // Content state
  currentAudio: HTMLAudioElement | null
  currentAyahNumber: number | null
  currentSurahNumber: number | null
  currentReciter: Reciter | null
  audioUrl: string | null
  
  // Repeat settings
  repeatMode: RepeatMode
  currentRepetition: number
  maxRepetitions: number
  autoPlayNext: boolean
  
  // Waveform state
  waveformReady: boolean
  waveformData: number[] | null
  
  // Settings sync state
  isUpdatingSettings: boolean
  settingsUpdateSuccess: boolean
  
  // Error handling
  error: string | null
  
  // Actions
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
  setRepeatMode: (mode: RepeatMode) => void
  setAutoPlayNext: (autoPlay: boolean) => void
  
  // Load audio
  loadAyahAudio: (surahNumber: number, ayahNumber: number, reciter?: Reciter) => Promise<void>
  loadChapterAudio: (surahNumber: number, reciter?: Reciter) => Promise<void>
  
  // Player controls
  playNext: () => Promise<void>
  playPrevious: () => Promise<void>
  togglePlayPause: () => Promise<void>
  
  // Waveform
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
  
  // Settings feedback
  clearSettingsState: () => void
  
  // Keyboard shortcuts
  handleKeyPress: (key: string) => void
}

export const useAudioStore = create<AudioPlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      progress: 0,
      volume: 0.8,
      playbackSpeed: 1,
      
      currentAudio: null,
      currentAyahNumber: null,
      currentSurahNumber: null,
      currentReciter: null,
      audioUrl: null,
      
      repeatMode: 'none',
      currentRepetition: 0,
      maxRepetitions: 1,
      autoPlayNext: false, // Disabled by default to prevent unwanted continuation
      
      waveformReady: false,
      waveformData: null,
      
      isUpdatingSettings: false,
      settingsUpdateSuccess: false,
      
      error: null,

      // Audio control actions
      play: async () => {
        const state = get()
        if (!state.currentAudio || !state.audioUrl) {
          set({ error: 'No audio loaded' })
          return
        }

        try {
          set({ isLoading: true, error: null })
          
          // Set playback speed
          state.currentAudio.playbackRate = state.playbackSpeed
          state.currentAudio.volume = state.volume
          
          await state.currentAudio.play()
          set({ isPlaying: true, isLoading: false })
        } catch (error) {
          console.error('Error playing audio:', error)
          set({ 
            error: 'Failed to play audio. Please try again.',
            isPlaying: false,
            isLoading: false 
          })
        }
      },

      pause: () => {
        const { currentAudio } = get()
        if (currentAudio) {
          currentAudio.pause()
          set({ isPlaying: false })
        }
      },

      stop: () => {
        const { currentAudio } = get()
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
          set({ 
            isPlaying: false, 
            currentTime: 0, 
            progress: 0,
            currentRepetition: 0
          })
        }
      },

      seek: (time: number) => {
        const { currentAudio } = get()
        if (currentAudio) {
          currentAudio.currentTime = time
          set({ currentTime: time, progress: (time / currentAudio.duration) * 100 })
        }
      },

      setVolume: (volume: number) => {
        const { currentAudio } = get()
        const clampedVolume = Math.max(0, Math.min(1, volume))
        
        if (currentAudio) {
          currentAudio.volume = clampedVolume
        }
        
        set({ volume: clampedVolume })
      },

      setPlaybackSpeed: (speed: PlaybackSpeed) => {
        const { currentAudio } = get()
        if (currentAudio) {
          currentAudio.playbackRate = speed
        }
        set({ playbackSpeed: speed })
        
        // Note: Preferences store will be updated separately to avoid circular dependency
      },

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
      },

      setAutoPlayNext: (autoPlay: boolean) => {
        set({ autoPlayNext: autoPlay })
      },

      // Load audio functions
      loadAyahAudio: async (surahNumber: number, ayahNumber: number, reciter?: Reciter) => {
        set({ isLoading: true, error: null })
        
        try {
          // Use current reciter if none provided
          const state = get()
          const selectedReciter = reciter || state.currentReciter
          
          if (!selectedReciter) {
            throw new Error('No reciter selected')
          }

          const audioUrl = quranApi.getAudioUrl(selectedReciter.id, surahNumber, ayahNumber)
          
          // Log the audio URL for debugging
          console.log('Loading audio URL:', audioUrl)
          
          // Clean up previous audio
          if (state.currentAudio) {
            state.currentAudio.pause()
            state.currentAudio.removeEventListener('timeupdate', get().handleTimeUpdate)
            state.currentAudio.removeEventListener('ended', get().handleAudioEnded)
            state.currentAudio.removeEventListener('loadedmetadata', get().handleMetadataLoaded)
            state.currentAudio.removeEventListener('error', get().handleAudioError)
          }

          // Create new audio element
          const audio = new Audio()
          audio.preload = 'metadata'
          audio.crossOrigin = 'anonymous' // Enable CORS
          
          // Add event listeners
          audio.addEventListener('timeupdate', get().handleTimeUpdate)
          audio.addEventListener('ended', get().handleAudioEnded)
          audio.addEventListener('loadedmetadata', get().handleMetadataLoaded)
          audio.addEventListener('error', get().handleAudioError)
          
          // Test audio URL accessibility before setting
          audio.src = audioUrl
          
          set({
            currentAudio: audio,
            audioUrl,
            currentSurahNumber: surahNumber,
            currentAyahNumber: ayahNumber,
            currentReciter: selectedReciter,
            currentTime: 0,
            duration: 0,
            progress: 0,
            currentRepetition: 0,
            waveformReady: false,
            isLoading: false,
            // Reset auto-play next to false for single ayah loading
            autoPlayNext: false
          })
          
        } catch (error) {
          console.error('Error loading audio:', error)
          set({ 
            error: 'Failed to load audio. Please check your connection.',
            isLoading: false 
          })
        }
      },

      loadChapterAudio: async (surahNumber: number, reciter?: Reciter) => {
        set({ isLoading: true, error: null })
        
        try {
          const state = get()
          const selectedReciter = reciter || state.currentReciter
          
          if (!selectedReciter) {
            throw new Error('No reciter selected')
          }

          const audioUrl = quranApi.getChapterAudioUrl(selectedReciter.id, surahNumber)
          
          // Clean up previous audio
          if (state.currentAudio) {
            state.currentAudio.pause()
            state.currentAudio.removeEventListener('timeupdate', get().handleTimeUpdate)
            state.currentAudio.removeEventListener('ended', get().handleAudioEnded)
            state.currentAudio.removeEventListener('loadedmetadata', get().handleMetadataLoaded)
            state.currentAudio.removeEventListener('error', get().handleAudioError)
          }

          const audio = new Audio()
          audio.preload = 'metadata'
          audio.crossOrigin = 'anonymous' // Enable CORS
          
          audio.addEventListener('timeupdate', get().handleTimeUpdate)
          audio.addEventListener('ended', get().handleAudioEnded)
          audio.addEventListener('loadedmetadata', get().handleMetadataLoaded)
          audio.addEventListener('error', get().handleAudioError)
          
          // Set audio source
          audio.src = audioUrl
          
          set({
            currentAudio: audio,
            audioUrl,
            currentSurahNumber: surahNumber,
            currentAyahNumber: null, // Full chapter
            currentReciter: selectedReciter,
            currentTime: 0,
            duration: 0,
            progress: 0,
            currentRepetition: 0,
            waveformReady: false,
            isLoading: false
          })
          
        } catch (error) {
          console.error('Error loading chapter audio:', error)
          set({ 
            error: 'Failed to load chapter audio. Please check your connection.',
            isLoading: false 
          })
        }
      },

      // Player navigation
      playNext: async () => {
        const state = get()
        if (!state.currentSurahNumber || !state.currentAyahNumber) return
        
        // Load next ayah audio
        await get().loadAyahAudio(state.currentSurahNumber, state.currentAyahNumber + 1)
        if (state.autoPlayNext) {
          await get().play()
        }
      },

      playPrevious: async () => {
        const state = get()
        if (!state.currentSurahNumber || !state.currentAyahNumber || state.currentAyahNumber <= 1) return
        
        await get().loadAyahAudio(state.currentSurahNumber, state.currentAyahNumber - 1)
        if (state.autoPlayNext) {
          await get().play()
        }
      },

      togglePlayPause: async () => {
        const { isPlaying } = get()
        if (isPlaying) {
          get().pause()
        } else {
          await get().play()
        }
      },

      // Waveform functions
      setWaveformData: (data: number[]) => {
        set({ waveformData: data })
      },

      setWaveformReady: (ready: boolean) => {
        set({ waveformReady: ready })
      },

      // Event handlers
      handleTimeUpdate: () => {
        const state = get()
        if (state.currentAudio) {
          const currentTime = state.currentAudio.currentTime
          const duration = state.currentAudio.duration || 0
          const progress = duration > 0 ? (currentTime / duration) * 100 : 0
          
          set({ currentTime, progress })
        }
      },

      handleMetadataLoaded: () => {
        const state = get()
        if (state.currentAudio) {
          set({ duration: state.currentAudio.duration || 0 })
        }
      },

      handleAudioEnded: () => {
        const state = get()
        
        // Handle repeat logic
        if (state.repeatMode !== 'none' && state.currentRepetition < state.maxRepetitions - 1) {
          set({ currentRepetition: state.currentRepetition + 1 })
          setTimeout(() => get().play(), 500) // Small pause between repetitions
          return
        }
        
        // Reset repetition counter and stop playing
        set({ currentRepetition: 0, isPlaying: false })
        
        // Only auto-play next if explicitly enabled by user
        // This prevents unwanted continuation when user just wants to hear one ayah
        if (state.autoPlayNext && state.currentAyahNumber) {
          console.log('Auto-playing next ayah (user enabled)')
          setTimeout(() => get().playNext(), 1000)
        } else {
          console.log('Audio playback completed - not auto-playing next ayah')
        }
      },

      handleAudioError: (event: any) => {
        console.error('Audio error:', event)
        
        // Provide more specific error messages
        let errorMessage = 'Audio playback error. Please try again.'
        
        if (event?.target?.error?.code === 2) {
          errorMessage = 'Audio file not found or network error.'
        } else if (event?.target?.error?.code === 3) {
          errorMessage = 'Audio decoding failed.'
        } else if (event?.target?.error?.code === 4) {
          errorMessage = 'Audio format not supported.'
        } else if (event?.type === 'error' && event?.target?.src) {
          // CORS or network error
          errorMessage = 'Cannot access audio. Please check your connection.'
        }
        
        set({ 
          error: errorMessage,
          isPlaying: false,
          isLoading: false 
        })
      },

      // Keyboard shortcuts
      handleKeyPress: (key: string) => {
        const state = get()
        
        switch (key.toLowerCase()) {
          case ' ':
          case 'spacebar':
            get().togglePlayPause()
            break
          case 'arrowleft':
            get().seek(Math.max(0, state.currentTime - 10))
            break
          case 'arrowright':
            get().seek(Math.min(state.duration, state.currentTime + 10))
            break
          case 'arrowup':
            get().setVolume(Math.min(1, state.volume + 0.1))
            break
          case 'arrowdown':
            get().setVolume(Math.max(0, state.volume - 0.1))
            break
          case 'm':
            get().setVolume(state.volume > 0 ? 0 : 0.8)
            break
          case 'r':
            // Cycle through repeat modes
            const repeatModes: RepeatMode[] = ['none', 'one', 'three', 'five', 'infinite']
            const currentIndex = repeatModes.indexOf(state.repeatMode)
            const nextIndex = (currentIndex + 1) % repeatModes.length
            get().setRepeatMode(repeatModes[nextIndex])
            break
        }
      },

      // Utility functions
      setError: (error: string | null) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => {
        const { currentAudio } = get()
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.removeEventListener('timeupdate', get().handleTimeUpdate)
          currentAudio.removeEventListener('ended', get().handleAudioEnded)
          currentAudio.removeEventListener('loadedmetadata', get().handleMetadataLoaded)
          currentAudio.removeEventListener('error', get().handleAudioError)
        }
        
        set({
          isPlaying: false,
          isLoading: false,
          currentTime: 0,
          duration: 0,
          progress: 0,
          currentAudio: null,
          currentAyahNumber: null,
          currentSurahNumber: null,
          audioUrl: null,
          currentRepetition: 0,
          waveformReady: false,
          waveformData: null,
          error: null
        })
      },

      // Initialization
      initializeAudio: () => {
        console.log('🔄 Initializing audio store')
        const state = get()
        
        // Sync with preferences store using dynamic import to avoid circular dependency
        import('./preferencesStore').then(({ usePreferencesStore }) => {
          try {
            const preferencesState = usePreferencesStore.getState()
            const preferences = preferencesState.preferences
            
            console.log('📋 Syncing with preferences on initialization:', {
              preferredReciter: preferences.preferredReciter,
              playbackSpeed: preferences.playbackSpeed,
              currentReciter: state.currentReciter?.id,
              currentSpeed: state.playbackSpeed
            })
          
            // Sync playback speed from preferences
            if (preferences.playbackSpeed !== state.playbackSpeed) {
              console.log(`📊 Initial speed sync: ${state.playbackSpeed} → ${preferences.playbackSpeed}`)
              set({ playbackSpeed: preferences.playbackSpeed as PlaybackSpeed })
            }
            
            // Set reciter based on preferences
            if (preferences.preferredReciter) {
              // Map reciter ID to reciter object
              const reciters = {
                '1': { id: '1', name: 'Mishary Rashid Alafasy', englishName: 'Mishary Rashid Alafasy', style: 'Clear & Melodious', audioFormat: 'mp3' },
                '2': { id: '2', name: 'Abdur Rahman As-Sudais', englishName: 'Abdur Rahman As-Sudais', style: 'Madinah Style', audioFormat: 'mp3' },
                '3': { id: '3', name: 'Maher Al Mueaqly', englishName: 'Maher Al Mueaqly', style: 'Emotional', audioFormat: 'mp3' },
                '4': { id: '4', name: 'Saad Al Ghamidi', englishName: 'Saad Al Ghamidi', style: 'Slow & Clear', audioFormat: 'mp3' },
                '5': { id: '5', name: 'Ahmed Al Ajmy', englishName: 'Ahmed Al Ajmy', style: 'Melodious', audioFormat: 'mp3' },
                '6': { id: '6', name: 'Hani Ar-Rifai', englishName: 'Hani Ar-Rifai', style: 'Beautiful Voice', audioFormat: 'mp3' },
                '7': { id: '7', name: 'Abdul Basit Abdul Samad', englishName: 'Abdul Basit Abdul Samad', style: 'Murattal', audioFormat: 'mp3' }
              }
              
              const selectedReciter = reciters[preferences.preferredReciter as keyof typeof reciters]
              if (selectedReciter && (!state.currentReciter || state.currentReciter.id !== preferences.preferredReciter)) {
                console.log(`🎙️ Initial reciter sync: ${state.currentReciter?.id || 'none'} → ${preferences.preferredReciter}`)
                set({ currentReciter: selectedReciter as Reciter })
              }
            }
            
            console.log('✅ Audio store initialization sync completed')
          } catch (error) {
            console.warn('⚠️ Failed to sync audio settings with preferences:', error)
          }
        }).catch(error => {
          console.warn('⚠️ Failed to load preferences store:', error)
        })
        
        // Fallback to default reciter if none set
        if (!state.currentReciter) {
          console.log('🎙️ Setting default reciter (Mishary Rashid Alafasy)')
          const defaultReciter: Reciter = {
            id: '1', // Mishary Rashid Alafasy (known working reciter)
            name: 'Mishary Rashid Alafasy',
            englishName: 'Mishary Rashid Alafasy',
            style: 'Clear & Melodious',
            audioFormat: 'mp3'
          }
          set({ currentReciter: defaultReciter })
        }
        
        console.log('✅ Audio store initialized')
      },
      
      // Force sync with preferences (to be called when settings change)
      syncWithPreferences: async (preferences: any) => {
        const state = get()
        let needsReload = false
        let needsSpeedUpdate = false
        const wasPlaying = state.isPlaying
        const currentTime = state.currentTime
        
        console.log('🔄 Syncing audio store with preferences:', {
          currentReciter: state.currentReciter?.id,
          newReciter: preferences.preferredReciter,
          currentSpeed: state.playbackSpeed,
          newSpeed: preferences.playbackSpeed
        })
        
        // Set loading state
        set({ isUpdatingSettings: true, settingsUpdateSuccess: false, error: null })
        
        try {
          // Update playback speed if different
          if (preferences.playbackSpeed !== state.playbackSpeed) {
            console.log(`📊 Updating playback speed: ${state.playbackSpeed} → ${preferences.playbackSpeed}`)
            needsSpeedUpdate = true
            
            // Update store state immediately
            set({ playbackSpeed: preferences.playbackSpeed as PlaybackSpeed })
            
            // Apply to current audio immediately if available
            if (state.currentAudio) {
              state.currentAudio.playbackRate = preferences.playbackSpeed
              console.log('✅ Applied playback speed to current audio element')
            }
          }
          
          // Update reciter if different
          if (preferences.preferredReciter && state.currentReciter?.id !== preferences.preferredReciter) {
            console.log(`🎙️ Updating reciter: ${state.currentReciter?.id} → ${preferences.preferredReciter}`)
            
            const reciters = {
              '1': { id: '1', name: 'Mishary Rashid Alafasy', englishName: 'Mishary Rashid Alafasy', style: 'Clear & Melodious', audioFormat: 'mp3' },
              '2': { id: '2', name: 'Abdur Rahman As-Sudais', englishName: 'Abdur Rahman As-Sudais', style: 'Madinah Style', audioFormat: 'mp3' },
              '3': { id: '3', name: 'Maher Al Mueaqly', englishName: 'Maher Al Mueaqly', style: 'Emotional', audioFormat: 'mp3' },
              '4': { id: '4', name: 'Saad Al Ghamidi', englishName: 'Saad Al Ghamidi', style: 'Slow & Clear', audioFormat: 'mp3' },
              '5': { id: '5', name: 'Ahmed Al Ajmy', englishName: 'Ahmed Al Ajmy', style: 'Melodious', audioFormat: 'mp3' },
              '6': { id: '6', name: 'Hani Ar-Rifai', englishName: 'Hani Ar-Rifai', style: 'Beautiful Voice', audioFormat: 'mp3' },
              '7': { id: '7', name: 'Abdul Basit Abdul Samad', englishName: 'Abdul Basit Abdul Samad', style: 'Murattal', audioFormat: 'mp3' }
            }
            
            const selectedReciter = reciters[preferences.preferredReciter as keyof typeof reciters]
            if (selectedReciter) {
              // Update store state immediately
              set({ currentReciter: selectedReciter as Reciter })
              needsReload = true
              console.log('✅ Updated current reciter in store')
            } else {
              console.warn('⚠️ Unknown reciter ID:', preferences.preferredReciter)
            }
          }
          
          // If audio is currently loaded and reciter changed, reload with new reciter
          if (needsReload && state.currentSurahNumber && state.currentAyahNumber) {
            console.log('🔄 Reloading audio with new reciter')
            
            // Pause current audio first
            if (state.currentAudio && wasPlaying) {
              state.currentAudio.pause()
              console.log('⏸️ Paused current audio')
            }
            
            // Get the updated state after reciter change
            const updatedState = get()
            
            // Reload with new reciter
            await updatedState.loadAyahAudio(
              updatedState.currentSurahNumber, 
              updatedState.currentAyahNumber, 
              updatedState.currentReciter
            )
            
            console.log('✅ Reloaded audio with new reciter')
            
            // Restore playback state if it was playing
            if (wasPlaying) {
              const finalState = get()
              if (finalState.currentAudio) {
                // Apply the correct playback speed to the new audio
                finalState.currentAudio.playbackRate = preferences.playbackSpeed
                
                // Try to restore previous time position
                if (currentTime > 0 && finalState.currentAudio.duration > 0) {
                  finalState.currentAudio.currentTime = Math.min(currentTime, finalState.currentAudio.duration)
                }
                
                // Resume playback
                await finalState.play()
                console.log('▶️ Resumed playback with new settings')
              }
            }
          } else if (needsSpeedUpdate && state.currentAudio && !needsReload) {
            // If only speed changed and no reload needed, just apply the speed
            const finalState = get()
            if (finalState.currentAudio) {
              finalState.currentAudio.playbackRate = preferences.playbackSpeed
              console.log('⚡ Applied speed change to existing audio')
            }
          }
          
          // Set success state
          set({ isUpdatingSettings: false, settingsUpdateSuccess: true })
          console.log('✅ Audio settings sync completed successfully')
          
          // Clear success indicator after 3 seconds
          setTimeout(() => {
            set({ settingsUpdateSuccess: false })
          }, 3000)
          
        } catch (error) {
          console.error('❌ Error syncing audio with preferences:', error)
          set({ 
            error: 'Failed to apply audio settings. Please try again.',
            isUpdatingSettings: false,
            settingsUpdateSuccess: false
          })
        }
      },
      
      // Clear settings state
      clearSettingsState: () => {
        set({
          isUpdatingSettings: false,
          settingsUpdateSuccess: false,
          error: null
        })
      },
      
      // Cleanup audio when navigating away
      cleanup: () => {
        const state = get()
        if (state.currentAudio) {
          state.currentAudio.pause()
          state.currentAudio.removeEventListener('timeupdate', get().handleTimeUpdate)
          state.currentAudio.removeEventListener('ended', get().handleAudioEnded)
          state.currentAudio.removeEventListener('loadedmetadata', get().handleMetadataLoaded)
          state.currentAudio.removeEventListener('error', get().handleAudioError)
        }
        
        set({
          isPlaying: false,
          currentAudio: null,
          currentTime: 0,
          progress: 0,
          isUpdatingSettings: false,
          settingsUpdateSuccess: false,
          error: null
        })
      }
    }),
    {
      name: 'audio-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences, not audio state
      partialize: (state) => ({
        volume: state.volume,
        playbackSpeed: state.playbackSpeed,
        repeatMode: state.repeatMode,
        autoPlayNext: state.autoPlayNext,
        currentReciter: state.currentReciter
      })
    }
  )
)