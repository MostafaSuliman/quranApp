import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAudioStore } from '../stores/audioStore'
import { useAudioNavigationStore, NavigationAction } from '../stores/audioNavigationStore'
import AudioNavigationModal from '../components/AudioNavigationModal'
import GlobalAudioPopup from '../components/GlobalAudioPopup'

interface AudioNavigationContextType {
  isNavigationBlocked: boolean
  blockNavigation: () => void
  unblockNavigation: () => void
  handleNavigationAction: (action: NavigationAction, remember?: boolean) => void
  showGlobalAudioPopup: boolean
  setShowGlobalAudioPopup: (show: boolean) => void
}

const AudioNavigationContext = createContext<AudioNavigationContextType>({
  isNavigationBlocked: false,
  blockNavigation: () => {},
  unblockNavigation: () => {},
  handleNavigationAction: () => {},
  showGlobalAudioPopup: false,
  setShowGlobalAudioPopup: () => {}
})

export const useAudioNavigation = () => useContext(AudioNavigationContext)

interface AudioNavigationProviderProps {
  children: React.ReactNode
}

const AudioNavigationProvider: React.FC<AudioNavigationProviderProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { isPlaying, currentAyahNumber, currentSurahNumber } = useAudioStore()
  const { 
    defaultAction, 
    showModalOnNavigation,
    isNavigationModalOpen,
    pendingNavigation,
    interceptNavigation,
    closeNavigationModal,
    updateDefaultAction,
    restoreAudioState,
    clearAudioState
  } = useAudioNavigationStore()
  
  const [isNavigationBlocked, setIsNavigationBlocked] = useState(false)
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [showGlobalAudioPopup, setShowGlobalAudioPopup] = useState(false)
  const previousPath = useRef(location.pathname)
  const isNavigating = useRef(false)
  const navigationPromise = useRef<Promise<boolean> | null>(null)
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track location changes and intercept when audio is playing
  useEffect(() => {
    const currentPath = location.pathname
    const prevPath = previousPath.current

    // Skip if we're already handling navigation or paths are the same
    if (isNavigating.current || currentPath === prevPath) {
      return
    }

    // Check if audio is active (playing or loaded)
    const hasActiveAudio = isPlaying || (currentAyahNumber && currentSurahNumber)

    if (!hasActiveAudio) {
      previousPath.current = currentPath
      setShowGlobalAudioPopup(false)
      return
    }

    // Skip if user has set "continue" as default and modal is disabled
    if (defaultAction === 'continue' && !showModalOnNavigation) {
      previousPath.current = currentPath
      // Show global popup instead of modal
      setShowGlobalAudioPopup(true)
      return
    }

    // We need to potentially intercept this navigation
    if (hasActiveAudio) {
      // Block this navigation and show modal
      handleNavigationIntercept(prevPath, currentPath)
    } else {
      previousPath.current = currentPath
    }
  }, [location.pathname, isPlaying, currentAyahNumber, currentSurahNumber, defaultAction, showModalOnNavigation])

  // Monitor audio state and show/hide global popup accordingly
  useEffect(() => {
    const hasActiveAudio = isPlaying || (currentAyahNumber && currentSurahNumber)
    
    // Clear any existing timeout
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current)
      audioTimeoutRef.current = null
    }

    if (hasActiveAudio && !isNavigationModalOpen) {
      // Check if we're on a page that doesn't have audio controls
      const audioEnabledPages = ['/lesson', '/mushaf']
      const currentPageHasAudioControls = audioEnabledPages.some(page => 
        location.pathname.includes(page)
      )
      
      // Only show popup if not on an audio-enabled page
      if (!currentPageHasAudioControls) {
        setShowGlobalAudioPopup(true)
      }
    } else if (!hasActiveAudio) {
      // Hide popup after a delay when audio stops
      audioTimeoutRef.current = setTimeout(() => {
        setShowGlobalAudioPopup(false)
      }, 2000)
    }

    return () => {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current)
      }
    }
  }, [isPlaying, currentAyahNumber, currentSurahNumber, location.pathname, isNavigationModalOpen])

  // Handle navigation interception
  const handleNavigationIntercept = async (fromPath: string, toPath: string) => {
    if (isNavigating.current) return
    
    isNavigating.current = true
    setIsNavigationBlocked(true)
    setPendingPath(toPath)

    try {
      // Go back to previous path temporarily
      window.history.replaceState(null, '', fromPath)
      
      // Check if we should show modal or use default action
      const shouldProceed = await interceptNavigation(fromPath, toPath)
      
      if (shouldProceed) {
        // Allow navigation to proceed
        previousPath.current = toPath
        navigate(toPath, { replace: true })
      } else {
        // Navigation was cancelled, stay on current page
        previousPath.current = fromPath
      }
    } catch (error) {
      console.error('Navigation interception error:', error)
      // On error, allow navigation to proceed
      previousPath.current = toPath
      navigate(toPath, { replace: true })
    } finally {
      isNavigating.current = false
      setIsNavigationBlocked(false)
      setPendingPath(null)
    }
  }

  // Handle navigation actions from modal
  const handleNavigationAction = (action: NavigationAction, remember?: boolean) => {
    if (!pendingNavigation) return

    const { from, to } = pendingNavigation

    // Update default action if user wants to remember
    if (remember && action !== 'ask') {
      updateDefaultAction(action)
    }

    // Handle the action
    let shouldProceed = true
    
    switch (action) {
      case 'stop':
        // Audio will be stopped by the store
        clearAudioState()
        break
        
      case 'pause':
        // Audio will be paused by the store
        // State is already saved by the store
        break
        
      case 'continue':
        // Audio continues playing
        // State is already saved by the store
        break
        
      default:
        shouldProceed = false
    }

    // Close modal and proceed with navigation
    closeNavigationModal(action)
    
    if (shouldProceed && to) {
      previousPath.current = to
      navigate(to, { replace: true })
    }
  }

  // Restore audio state when returning to a page
  useEffect(() => {
    const audioState = useAudioNavigationStore.getState().audioStateBeforeNavigation
    
    // Only restore if we have saved state and we're on a page that supports audio
    const supportsAudio = ['/lesson', '/mushaf'].some(path => location.pathname.includes(path))
    
    if (audioState && supportsAudio && !isPlaying) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        restoreAudioState()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [location.pathname, restoreAudioState, isPlaying])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isNavigating.current) {
        isNavigating.current = false
      }
    }
  }, [])

  const contextValue: AudioNavigationContextType = {
    isNavigationBlocked,
    blockNavigation: () => setIsNavigationBlocked(true),
    unblockNavigation: () => setIsNavigationBlocked(false),
    handleNavigationAction,
    showGlobalAudioPopup,
    setShowGlobalAudioPopup
  }

  return (
    <AudioNavigationContext.Provider value={contextValue}>
      {children}
      
      {/* Navigation Modal */}
      {isNavigationModalOpen && pendingNavigation && (
        <AudioNavigationModal
          isOpen={isNavigationModalOpen}
          onClose={() => closeNavigationModal()}
          currentPage={pendingNavigation.from}
          targetPage={pendingNavigation.to}
          onAction={handleNavigationAction}
        />
      )}

      {/* Global Audio Control Popup */}
      <GlobalAudioPopup
        isVisible={showGlobalAudioPopup && !isNavigationModalOpen}
        onClose={() => setShowGlobalAudioPopup(false)}
      />
    </AudioNavigationContext.Provider>
  )
}

export default AudioNavigationProvider

// Hook for components to use navigation features
export const useNavigationGuard = () => {
  const { isNavigationBlocked } = useAudioNavigation()
  const { isPlaying, currentAyahNumber, currentSurahNumber } = useAudioStore()
  const { defaultAction, showModalOnNavigation } = useAudioNavigationStore()
  
  const hasAudioContent = isPlaying || (currentAyahNumber && currentSurahNumber)
  const willShowModal = hasAudioContent && (defaultAction === 'ask' || showModalOnNavigation)
  
  return {
    isNavigationBlocked,
    hasAudioContent,
    willShowModal,
    canNavigateFreely: !hasAudioContent || (!showModalOnNavigation && defaultAction !== 'ask')
  }
}

// Hook for programmatic navigation with audio awareness
export const useAudioAwareNavigation = () => {
  const navigate = useNavigate()
  const { interceptNavigation } = useAudioNavigationStore()
  const { isPlaying, currentAyahNumber, currentSurahNumber } = useAudioStore()
  const location = useLocation()
  
  const navigateWithAudioCheck = async (to: string, options?: { replace?: boolean }) => {
    const hasAudioContent = isPlaying || (currentAyahNumber && currentSurahNumber)
    
    if (!hasAudioContent) {
      // No audio content, navigate normally
      navigate(to, options)
      return true
    }
    
    // Check with audio navigation system
    const shouldProceed = await interceptNavigation(location.pathname, to)
    
    if (shouldProceed) {
      navigate(to, options)
      return true
    }
    
    return false
  }
  
  return {
    navigate: navigateWithAudioCheck,
    navigateImmediately: navigate // For cases where audio check should be bypassed
  }
}