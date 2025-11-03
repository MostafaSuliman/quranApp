import { useEffect } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { usePreferencesStore } from '../stores/preferencesStore';

/**
 * Custom hook to ensure audio system is properly initialized
 * and synchronized with user preferences
 */
export const useAudioInitialization = () => {
  const { initializeAudio, syncWithPreferences, currentReciter } = useAudioStore();
  const { preferences } = usePreferencesStore();

  useEffect(() => {
    // Initialize audio system when component mounts
    if (!currentReciter) {
      initializeAudio();
    }

    // Sync with current preferences
    syncWithPreferences(preferences);
  }, [initializeAudio, syncWithPreferences, preferences, currentReciter]);

  return {
    isInitialized: !!currentReciter,
  };
};

export default useAudioInitialization;
