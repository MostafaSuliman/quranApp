import { useEffect } from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useAudioStore } from '../stores/audioStore'

/**
 * Hook to ensure audio settings are properly synchronized with preferences
 * This provides a centralized way to handle audio-preference synchronization
 */
export const useAudioSync = () => {
  const { preferences } = usePreferencesStore()
  const { 
    currentReciter, 
    playbackSpeed, 
    syncWithPreferences, 
    initializeAudio,
    isUpdatingSettings,
    settingsUpdateSuccess,
    error
  } = useAudioStore()

  // Initialize audio store on mount
  useEffect(() => {
    console.log('🎵 useAudioSync: Initializing audio store')
    initializeAudio()
  }, [initializeAudio])

  // Sync when preferences change
  useEffect(() => {
    const needsSync = (
      preferences.preferredReciter !== currentReciter?.id ||
      preferences.playbackSpeed !== playbackSpeed
    )

    if (needsSync) {
      console.log('🔄 useAudioSync: Preferences changed, syncing...', {
        reciterChanged: preferences.preferredReciter !== currentReciter?.id,
        speedChanged: preferences.playbackSpeed !== playbackSpeed
      })
      
      syncWithPreferences(preferences)
    }
  }, [preferences.preferredReciter, preferences.playbackSpeed, currentReciter?.id, playbackSpeed, syncWithPreferences])

  // Return sync status for UI feedback
  return {
    isSyncing: isUpdatingSettings,
    syncSuccess: settingsUpdateSuccess,
    syncError: error,
    isSynced: (
      preferences.preferredReciter === currentReciter?.id &&
      preferences.playbackSpeed === playbackSpeed
    )
  }
}