import { useState, useCallback, useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Memorization state for individual ayahs
export interface MemorizationState {
  ayahId: string // Format: "surah-ayah" (e.g., "2-255")
  isHidden: boolean
  hideCount: number
  revealCount: number
  lastHidden: number // timestamp
  lastRevealed: number // timestamp
  masteryLevel: number // 0-100
}

// Memorization session statistics
export interface MemorizationSession {
  sessionId: string
  startTime: number
  endTime?: number
  ayahsStudied: string[]
  totalHides: number
  totalReveals: number
  averageRevealTime: number // milliseconds
  surahNumber: number
}

// Memorization store interface
interface MemorizationStore {
  // State
  memorizedAyahs: Record<string, MemorizationState>
  currentSession: MemorizationSession | null
  isMemorizationMode: boolean
  selectedAyahsForHiding: Set<string>
  
  // Actions
  toggleMemorizationMode: () => void
  hideAyah: (surahNumber: number, ayahNumber: number) => void
  revealAyah: (surahNumber: number, ayahNumber: number) => void
  toggleAyahVisibility: (surahNumber: number, ayahNumber: number) => void
  isAyahHidden: (surahNumber: number, ayahNumber: number) => boolean
  selectAyahForHiding: (surahNumber: number, ayahNumber: number) => void
  unselectAyahForHiding: (surahNumber: number, ayahNumber: number) => void
  hideSelectedAyahs: () => void
  revealAllAyahs: () => void
  getMemorizationProgress: (surahNumber: number) => {
    totalAyahs: number
    hiddenAyahs: number
    masteredAyahs: number
    averageMastery: number
  }
  startMemorizationSession: (surahNumber: number) => void
  endMemorizationSession: () => void
  getAyahMasteryLevel: (surahNumber: number, ayahNumber: number) => number
  updateAyahMastery: (surahNumber: number, ayahNumber: number, performance: number) => void
}

// Create memorization store
export const useMemorizationStore = create<MemorizationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      memorizedAyahs: {},
      currentSession: null,
      isMemorizationMode: false,
      selectedAyahsForHiding: new Set(),

      // Toggle memorization mode
      toggleMemorizationMode: () => {
        const { isMemorizationMode } = get()
        set({ isMemorizationMode: !isMemorizationMode })
        
        if (!isMemorizationMode) {
          // Clear selection when entering memorization mode
          set({ selectedAyahsForHiding: new Set() })
        }
      },

      // Hide a specific ayah
      hideAyah: (surahNumber: number, ayahNumber: number) => {
        const ayahId = `${surahNumber}-${ayahNumber}`
        const { memorizedAyahs, currentSession } = get()
        
        const currentState = memorizedAyahs[ayahId] || {
          ayahId,
          isHidden: false,
          hideCount: 0,
          revealCount: 0,
          lastHidden: 0,
          lastRevealed: 0,
          masteryLevel: 0
        }

        const updatedState: MemorizationState = {
          ...currentState,
          isHidden: true,
          hideCount: currentState.hideCount + 1,
          lastHidden: Date.now()
        }

        set({
          memorizedAyahs: {
            ...memorizedAyahs,
            [ayahId]: updatedState
          }
        })

        // Update session stats
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              totalHides: currentSession.totalHides + 1,
              ayahsStudied: currentSession.ayahsStudied.includes(ayahId) 
                ? currentSession.ayahsStudied 
                : [...currentSession.ayahsStudied, ayahId]
            }
          })
        }
      },

      // Reveal a specific ayah
      revealAyah: (surahNumber: number, ayahNumber: number) => {
        const ayahId = `${surahNumber}-${ayahNumber}`
        const { memorizedAyahs, currentSession } = get()
        
        const currentState = memorizedAyahs[ayahId]
        if (!currentState || !currentState.isHidden) return

        const revealTime = Date.now()
        const timeHidden = revealTime - currentState.lastHidden
        
        // Calculate performance based on reveal time (faster = better memorization)
        const performanceScore = Math.max(0, 100 - (timeHidden / 1000)) // 1 point per second
        
        const updatedState: MemorizationState = {
          ...currentState,
          isHidden: false,
          revealCount: currentState.revealCount + 1,
          lastRevealed: revealTime,
          masteryLevel: Math.min(100, currentState.masteryLevel + Math.max(1, performanceScore / 10))
        }

        set({
          memorizedAyahs: {
            ...memorizedAyahs,
            [ayahId]: updatedState
          }
        })

        // Update session stats
        if (currentSession) {
          const totalRevealTime = currentSession.averageRevealTime * currentSession.totalReveals + timeHidden
          set({
            currentSession: {
              ...currentSession,
              totalReveals: currentSession.totalReveals + 1,
              averageRevealTime: totalRevealTime / (currentSession.totalReveals + 1)
            }
          })
        }
      },

      // Toggle ayah visibility
      toggleAyahVisibility: (surahNumber: number, ayahNumber: number) => {
        const ayahId = `${surahNumber}-${ayahNumber}`
        const { memorizedAyahs } = get()
        const currentState = memorizedAyahs[ayahId]
        
        if (currentState?.isHidden) {
          get().revealAyah(surahNumber, ayahNumber)
        } else {
          get().hideAyah(surahNumber, ayahNumber)
        }
      },

      // Check if ayah is hidden
      isAyahHidden: (surahNumber: number, ayahNumber: number) => {
        const ayahId = `${surahNumber}-${ayahNumber}`
        const { memorizedAyahs } = get()
        return memorizedAyahs[ayahId]?.isHidden || false
      },

      // Select ayah for bulk hiding
      selectAyahForHiding: (surahNumber: number, ayahNumber: number) => {
        const ayahId = `${surahNumber}-${ayahNumber}`
        const { selectedAyahsForHiding } = get()
        const newSelection = new Set(selectedAyahsForHiding)
        newSelection.add(ayahId)
        set({ selectedAyahsForHiding: newSelection })
      },

      // Unselect ayah for bulk hiding
      unselectAyahForHiding: (surahNumber: number, ayahNumber: number) => {
        const ayahId = `${surahNumber}-${ayahNumber}`
        const { selectedAyahsForHiding } = get()
        const newSelection = new Set(selectedAyahsForHiding)
        newSelection.delete(ayahId)
        set({ selectedAyahsForHiding: newSelection })
      },

      // Hide all selected ayahs
      hideSelectedAyahs: () => {
        const { selectedAyahsForHiding } = get()
        selectedAyahsForHiding.forEach(ayahId => {
          const [surahStr, ayahStr] = ayahId.split('-')
          get().hideAyah(parseInt(surahStr), parseInt(ayahStr))
        })
        set({ selectedAyahsForHiding: new Set() })
      },

      // Reveal all ayahs in current context
      revealAllAyahs: () => {
        const { memorizedAyahs } = get()
        const updatedAyahs = { ...memorizedAyahs }
        
        Object.keys(updatedAyahs).forEach(ayahId => {
          if (updatedAyahs[ayahId].isHidden) {
            updatedAyahs[ayahId] = {
              ...updatedAyahs[ayahId],
              isHidden: false,
              lastRevealed: Date.now()
            }
          }
        })
        
        set({ memorizedAyahs: updatedAyahs })
      },

      // Get memorization progress for a surah
      getMemorizationProgress: (surahNumber: number) => {
        const { memorizedAyahs } = get()
        const surahAyahs = Object.values(memorizedAyahs).filter(
          state => state.ayahId.startsWith(`${surahNumber}-`)
        )
        
        const totalAyahs = surahAyahs.length
        const hiddenAyahs = surahAyahs.filter(state => state.isHidden).length
        const masteredAyahs = surahAyahs.filter(state => state.masteryLevel >= 80).length
        const averageMastery = totalAyahs > 0 
          ? surahAyahs.reduce((sum, state) => sum + state.masteryLevel, 0) / totalAyahs 
          : 0
        
        return {
          totalAyahs,
          hiddenAyahs,
          masteredAyahs,
          averageMastery
        }
      },

      // Start a memorization session
      startMemorizationSession: (surahNumber: number) => {
        const sessionId = `session-${Date.now()}`
        set({
          currentSession: {
            sessionId,
            startTime: Date.now(),
            ayahsStudied: [],
            totalHides: 0,
            totalReveals: 0,
            averageRevealTime: 0,
            surahNumber
          }
        })
      },

      // End current memorization session
      endMemorizationSession: () => {
        const { currentSession } = get()
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              endTime: Date.now()
            }
          })
          
          // Clear session after saving
          setTimeout(() => {
            set({ currentSession: null })
          }, 100)
        }
      },

      // Get ayah mastery level
      getAyahMasteryLevel: (surahNumber: number, ayahNumber: number) => {
        const ayahId = `${surahNumber}-${ayahNumber}`
        const { memorizedAyahs } = get()
        return memorizedAyahs[ayahId]?.masteryLevel || 0
      },

      // Update ayah mastery based on performance
      updateAyahMastery: (surahNumber: number, ayahNumber: number, performance: number) => {
        const ayahId = `${surahNumber}-${ayahNumber}`
        const { memorizedAyahs } = get()
        
        const currentState = memorizedAyahs[ayahId] || {
          ayahId,
          isHidden: false,
          hideCount: 0,
          revealCount: 0,
          lastHidden: 0,
          lastRevealed: 0,
          masteryLevel: 0
        }

        const updatedState: MemorizationState = {
          ...currentState,
          masteryLevel: Math.max(0, Math.min(100, currentState.masteryLevel + performance))
        }

        set({
          memorizedAyahs: {
            ...memorizedAyahs,
            [ayahId]: updatedState
          }
        })
      }
    }),
    {
      name: 'memorization-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        memorizedAyahs: state.memorizedAyahs,
        isMemorizationMode: state.isMemorizationMode
      })
    }
  )
)

// Hook for interactive memorization features
export const useMemorization = (surahNumber?: number) => {
  const store = useMemorizationStore()
  const [selectedAyahs, setSelectedAyahs] = useState<Set<string>>(new Set())

  // Auto-start session when memorization mode is enabled
  useEffect(() => {
    if (store.isMemorizationMode && surahNumber && !store.currentSession) {
      store.startMemorizationSession(surahNumber)
    }
  }, [store.isMemorizationMode, surahNumber, store.currentSession])

  // Helper functions
  const toggleAyahSelection = useCallback((ayahNumber: number) => {
    if (!surahNumber) return
    
    const ayahId = `${surahNumber}-${ayahNumber}`
    const newSelection = new Set(selectedAyahs)
    
    if (newSelection.has(ayahId)) {
      newSelection.delete(ayahId)
      store.unselectAyahForHiding(surahNumber, ayahNumber)
    } else {
      newSelection.add(ayahId)
      store.selectAyahForHiding(surahNumber, ayahNumber)
    }
    
    setSelectedAyahs(newSelection)
  }, [surahNumber, selectedAyahs, store])

  const isAyahSelected = useCallback((ayahNumber: number) => {
    if (!surahNumber) return false
    const ayahId = `${surahNumber}-${ayahNumber}`
    return selectedAyahs.has(ayahId)
  }, [surahNumber, selectedAyahs])

  const clearSelection = useCallback(() => {
    setSelectedAyahs(new Set())
  }, [])

  const hideSelectedAyahs = useCallback(() => {
    store.hideSelectedAyahs()
    clearSelection()
  }, [store, clearSelection])

  // Get progress for current surah
  const progress = useMemo(() => {
    if (!surahNumber) return null
    return store.getMemorizationProgress(surahNumber)
  }, [surahNumber, store.memorizedAyahs])

  return {
    // State
    isMemorizationMode: store.isMemorizationMode,
    currentSession: store.currentSession,
    selectedAyahs,
    progress,
    
    // Ayah-specific actions
    isAyahHidden: store.isAyahHidden,
    hideAyah: store.hideAyah,
    revealAyah: store.revealAyah,
    toggleAyahVisibility: store.toggleAyahVisibility,
    getAyahMasteryLevel: store.getAyahMasteryLevel,
    
    // Selection actions
    toggleAyahSelection,
    isAyahSelected,
    clearSelection,
    hideSelectedAyahs,
    
    // Global actions
    toggleMemorizationMode: store.toggleMemorizationMode,
    revealAllAyahs: store.revealAllAyahs,
    startMemorizationSession: store.startMemorizationSession,
    endMemorizationSession: store.endMemorizationSession
  }
}