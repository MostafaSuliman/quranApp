import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type NavigationAction = 'ask' | 'stop' | 'continue' | 'pause'

interface NavigationContext {
  fromPage: string
  toPage: string
  timestamp: number
  audioState: {
    isPlaying: boolean
    currentTime: number
    surahNumber?: number
    ayahNumber?: number
    reciter?: string
  }
}

interface AudioNavigationState {
  // User preferences
  defaultAction: NavigationAction
  showModalOnNavigation: boolean
  
  // Navigation state
  isNavigationModalOpen: boolean
  pendingNavigation: {
    to: string
    from: string
    resolve?: (proceed: boolean) => void
  } | null
  
  // Navigation history for analytics
  navigationHistory: NavigationContext[]
  
  // Audio state management
  audioStateBeforeNavigation: {
    isPlaying: boolean
    currentTime: number
    volume: number
    surahNumber?: number
    ayahNumber?: number
  } | null
  
  // Actions
  setDefaultAction: (action: NavigationAction) => void
  updateDefaultAction: (action: NavigationAction) => void
  setShowModalOnNavigation: (show: boolean) => void
  
  // Navigation management
  interceptNavigation: (from: string, to: string) => Promise<boolean>
  openNavigationModal: (from: string, to: string) => Promise<boolean>
  closeNavigationModal: (action?: NavigationAction) => void
  
  // Audio state management
  saveAudioState: (audioState: any) => void
  restoreAudioState: () => void
  clearAudioState: () => void
  
  // History management
  addNavigationRecord: (context: NavigationContext) => void
  clearNavigationHistory: () => void
  getNavigationStats: () => {
    totalNavigations: number
    actionBreakdown: Record<NavigationAction, number>
    commonRoutes: Array<{ from: string; to: string; count: number }>
  }
  
  // Utility
  reset: () => void
}

export const useAudioNavigationStore = create<AudioNavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      defaultAction: 'ask',
      showModalOnNavigation: true,
      isNavigationModalOpen: false,
      pendingNavigation: null,
      navigationHistory: [],
      audioStateBeforeNavigation: null,

      // User preferences
      setDefaultAction: (action: NavigationAction) => {
        set({ defaultAction: action })
      },

      updateDefaultAction: (action: NavigationAction) => {
        set({ defaultAction: action })
        
        // If user selects 'ask', ensure modal will show
        if (action === 'ask') {
          set({ showModalOnNavigation: true })
        }
      },

      setShowModalOnNavigation: (show: boolean) => {
        set({ showModalOnNavigation: show })
        
        // If disabling modal, set a default action
        if (!show && get().defaultAction === 'ask') {
          set({ defaultAction: 'continue' })
        }
      },

      // Navigation management
      interceptNavigation: async (from: string, to: string): Promise<boolean> => {
        const state = get()
        
        // Don't intercept if modal is disabled and we have a default action
        if (!state.showModalOnNavigation && state.defaultAction !== 'ask') {
          // Handle the action immediately
          return get().handleNavigationAction(state.defaultAction, from, to)
        }
        
        // Open modal and wait for user decision
        return get().openNavigationModal(from, to)
      },

      openNavigationModal: (from: string, to: string): Promise<boolean> => {
        return new Promise((resolve) => {
          set({
            isNavigationModalOpen: true,
            pendingNavigation: { from, to, resolve }
          })
        })
      },

      closeNavigationModal: (action?: NavigationAction) => {
        const state = get()
        
        if (state.pendingNavigation) {
          const { from, to, resolve } = state.pendingNavigation
          
          if (action && resolve) {
            const shouldProceed = get().handleNavigationAction(action, from, to)
            resolve(shouldProceed)
          } else if (resolve) {
            resolve(false) // Cancel navigation
          }
        }
        
        set({
          isNavigationModalOpen: false,
          pendingNavigation: null
        })
      },

      // Handle navigation action (internal method)
      handleNavigationAction: (action: NavigationAction, from: string, to: string): boolean => {
        const audioStore = require('./audioStore').useAudioStore.getState()
        
        // Record navigation context
        get().addNavigationRecord({
          fromPage: from,
          toPage: to,
          timestamp: Date.now(),
          audioState: {
            isPlaying: audioStore.isPlaying,
            currentTime: audioStore.currentTime,
            surahNumber: audioStore.currentSurahNumber,
            ayahNumber: audioStore.currentAyahNumber,
            reciter: audioStore.currentReciter?.name
          }
        })
        
        switch (action) {
          case 'stop':
            // Stop audio and clear state
            audioStore.stop()
            get().clearAudioState()
            return true
            
          case 'pause':
            // Pause audio and save state
            get().saveAudioState(audioStore)
            audioStore.pause()
            return true
            
          case 'continue':
            // Save state but keep playing
            get().saveAudioState(audioStore)
            return true
            
          case 'ask':
          default:
            // This shouldn't happen in normal flow
            return false
        }
      },

      // Audio state management
      saveAudioState: (audioState: any) => {
        set({
          audioStateBeforeNavigation: {
            isPlaying: audioState.isPlaying,
            currentTime: audioState.currentTime,
            volume: audioState.volume,
            surahNumber: audioState.currentSurahNumber,
            ayahNumber: audioState.currentAyahNumber
          }
        })
      },

      restoreAudioState: () => {
        const state = get()
        const audioStore = require('./audioStore').useAudioStore.getState()
        
        if (state.audioStateBeforeNavigation) {
          const { 
            isPlaying, 
            currentTime, 
            volume, 
            surahNumber, 
            ayahNumber 
          } = state.audioStateBeforeNavigation
          
          // Restore volume
          if (volume !== undefined) {
            audioStore.setVolume(volume)
          }
          
          // If there was audio loaded, try to restore it
          if (surahNumber && ayahNumber) {
            audioStore.loadAyahAudio(surahNumber, ayahNumber).then(() => {
              // Restore playback position
              if (currentTime > 0) {
                audioStore.seek(currentTime)
              }
              
              // Resume playback if it was playing
              if (isPlaying) {
                audioStore.play()
              }
            }).catch(error => {
              console.warn('Failed to restore audio state:', error)
            })
          }
        }
      },

      clearAudioState: () => {
        set({ audioStateBeforeNavigation: null })
      },

      // History management
      addNavigationRecord: (context: NavigationContext) => {
        set(state => ({
          navigationHistory: [...state.navigationHistory.slice(-49), context] // Keep last 50 records
        }))
      },

      clearNavigationHistory: () => {
        set({ navigationHistory: [] })
      },

      getNavigationStats: () => {
        const history = get().navigationHistory
        
        // Count total navigations
        const totalNavigations = history.length
        
        // Count actions (this would need to be tracked separately in real implementation)
        const actionBreakdown: Record<NavigationAction, number> = {
          ask: 0,
          stop: 0,
          continue: 0,
          pause: 0
        }
        
        // Count common routes
        const routeCounts: Record<string, number> = {}
        history.forEach(record => {
          const route = `${record.fromPage}→${record.toPage}`
          routeCounts[route] = (routeCounts[route] || 0) + 1
        })
        
        const commonRoutes = Object.entries(routeCounts)
          .map(([route, count]) => {
            const [from, to] = route.split('→')
            return { from, to, count }
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
        
        return {
          totalNavigations,
          actionBreakdown,
          commonRoutes
        }
      },

      // Utility
      reset: () => {
        set({
          defaultAction: 'ask',
          showModalOnNavigation: true,
          isNavigationModalOpen: false,
          pendingNavigation: null,
          navigationHistory: [],
          audioStateBeforeNavigation: null
        })
      }
    }),
    {
      name: 'audio-navigation-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences and navigation history
      partialize: (state) => ({
        defaultAction: state.defaultAction,
        showModalOnNavigation: state.showModalOnNavigation,
        navigationHistory: state.navigationHistory.slice(-20) // Persist last 20 records
      })
    }
  )
)

// Add the missing method to the store after creation
const store = useAudioNavigationStore.getState()
// @ts-ignore - Adding method after store creation
store.handleNavigationAction = function(action: NavigationAction, from: string, to: string): boolean {
  const audioStore = require('./audioStore').useAudioStore.getState()
  
  // Record navigation context
  this.addNavigationRecord({
    fromPage: from,
    toPage: to,
    timestamp: Date.now(),
    audioState: {
      isPlaying: audioStore.isPlaying,
      currentTime: audioStore.currentTime,
      surahNumber: audioStore.currentSurahNumber,
      ayahNumber: audioStore.currentAyahNumber,
      reciter: audioStore.currentReciter?.name
    }
  })
  
  switch (action) {
    case 'stop':
      audioStore.stop()
      this.clearAudioState()
      return true
      
    case 'pause':
      this.saveAudioState(audioStore)
      audioStore.pause()
      return true
      
    case 'continue':
      this.saveAudioState(audioStore)
      return true
      
    case 'ask':
    default:
      return false
  }
}