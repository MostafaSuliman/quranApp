import React from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useAudioStore } from '../stores/audioStore'
import { useAudioSync } from '../hooks/useAudioSync'

/**
 * Test component to verify audio settings synchronization
 * This component can be temporarily added to the settings page to test functionality
 */
const AudioSettingsTest: React.FC = () => {
  const { preferences, updateReciter, updatePlaybackSpeed } = usePreferencesStore()
  const { 
    currentReciter, 
    playbackSpeed: audioPlaybackSpeed, 
    isUpdatingSettings, 
    settingsUpdateSuccess,
    error 
  } = useAudioStore()
  
  // Use the audio sync hook for comprehensive sync monitoring
  const { isSyncing, syncSuccess, syncError, isSynced } = useAudioSync()

  // Test data
  const testReciters = [
    { id: '1', name: 'Mishary Rashid Alafasy' },
    { id: '7', name: 'Abdul Basit Abdul Samad' },
    { id: '2', name: 'Abdur Rahman As-Sudais' }
  ]

  const testPlaybackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Audio Settings Synchronization Test
      </h3>
      
      {/* Status Display */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300">Preferences Store:</h4>
          <p>Reciter ID: {preferences.preferredReciter}</p>
          <p>Speed: {preferences.playbackSpeed}x</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300">Audio Store:</h4>
          <p>Reciter: {currentReciter?.name || 'None'}</p>
          <p>Speed: {audioPlaybackSpeed}x</p>
        </div>
      </div>

      {/* Sync Status */}
      <div className="space-y-2">
        <div className={`p-3 rounded border ${
          isSyncing || isUpdatingSettings
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : syncSuccess || settingsUpdateSuccess
              ? 'bg-green-50 border-green-200 text-green-700'
              : syncError || error
                ? 'bg-red-50 border-red-200 text-red-700'
                : isSynced
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <div className="font-medium">
            {(isSyncing || isUpdatingSettings) && '🔄 Syncing...'}
            {(syncSuccess || settingsUpdateSuccess) && '✅ Successfully synced!'}
            {(syncError || error) && `❌ Error: ${syncError || error}`}
            {!isSyncing && !isUpdatingSettings && !syncSuccess && !settingsUpdateSuccess && !syncError && !error && (
              isSynced ? '🔗 Synchronized' : '⚠️ Out of sync'
            )}
          </div>
        </div>
        
        {/* Enhanced sync status from useAudioSync hook */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>Hook Status: {isSynced ? '✅ Synced' : '❌ Not synced'}</div>
          <div>Hook Syncing: {isSyncing ? '🔄 Yes' : '⏹️ No'}</div>
          {syncError && <div className="text-red-600">Hook Error: {syncError}</div>}
        </div>
      </div>

      {/* Test Controls */}
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Test Reciter Change:</h4>
          <div className="flex gap-2">
            {testReciters.map((reciter) => (
              <button
                key={reciter.id}
                onClick={() => updateReciter(reciter.id)}
                disabled={isUpdatingSettings || isSyncing}
                className={`px-3 py-1 text-xs rounded border transition-colors ${
                  preferences.preferredReciter === reciter.id
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${(isUpdatingSettings || isSyncing) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {reciter.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Test Speed Change:</h4>
          <div className="flex gap-2">
            {testPlaybackSpeeds.map((speed) => (
              <button
                key={speed}
                onClick={() => updatePlaybackSpeed(speed)}
                disabled={isUpdatingSettings || isSyncing}
                className={`px-3 py-1 text-xs rounded border transition-colors ${
                  preferences.playbackSpeed === speed
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${(isUpdatingSettings || isSyncing) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Verification:</h4>
        <div className="text-sm space-y-1">
          <div className={`${
            preferences.preferredReciter === currentReciter?.id 
              ? 'text-green-600' : 'text-red-600'
          }`}>
            Reciter Sync: {preferences.preferredReciter === currentReciter?.id ? '✅ Synced' : '❌ Out of sync'}
          </div>
          <div className={`${
            preferences.playbackSpeed === audioPlaybackSpeed 
              ? 'text-green-600' : 'text-red-600'
          }`}>
            Speed Sync: {preferences.playbackSpeed === audioPlaybackSpeed ? '✅ Synced' : '❌ Out of sync'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioSettingsTest