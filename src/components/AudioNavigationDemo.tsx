import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAudioStore } from '../stores/audioStore'
import { useAudioNavigationStore } from '../stores/audioNavigationStore'
import { useAudioNavigation } from '../contexts/AudioNavigationProvider'

const AudioNavigationDemo: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [testStatus, setTestStatus] = useState<string>('')
  
  const {
    isPlaying,
    currentAyahNumber,
    currentSurahNumber,
    currentReciter,
    loadAyahAudio,
    togglePlayPause,
    stop,
    cleanup,
    autoPlayNext,
    setAutoPlayNext
  } = useAudioStore()

  const {
    defaultAction,
    showModalOnNavigation,
    setDefaultAction,
    setShowModalOnNavigation
  } = useAudioNavigationStore()

  const {
    showGlobalAudioPopup,
    setShowGlobalAudioPopup
  } = useAudioNavigation()

  // Test scenarios
  const testScenarios = [
    {
      id: 1,
      title: "Load and Play Ayah",
      description: "Load Surah 1, Ayah 1 and start playing",
      action: async () => {
        setTestStatus("Loading Al-Fatiha, Ayah 1...")
        try {
          await loadAyahAudio(1, 1)
          await togglePlayPause()
          setTestStatus("✅ Audio loaded and playing")
        } catch (error) {
          setTestStatus("❌ Failed to load audio")
        }
      }
    },
    {
      id: 2,
      title: "Navigate with Audio",
      description: "Navigate to different pages while audio is playing",
      action: () => {
        if (!isPlaying && !currentAyahNumber) {
          setTestStatus("⚠️ Start playing audio first")
          return
        }
        
        const pages = ['/', '/progress', '/settings', '/mushaf']
        const currentPageIndex = pages.indexOf(location.pathname)
        const nextPage = pages[(currentPageIndex + 1) % pages.length]
        
        setTestStatus(`🔄 Navigating to ${nextPage}...`)
        navigate(nextPage)
      }
    },
    {
      id: 3,
      title: "Toggle Global Popup",
      description: "Manually show/hide the global audio popup",
      action: () => {
        setShowGlobalAudioPopup(!showGlobalAudioPopup)
        setTestStatus(`Global popup ${showGlobalAudioPopup ? 'hidden' : 'shown'}`)
      }
    },
    {
      id: 4,
      title: "Test Auto-Play Settings",
      description: "Toggle auto-play next ayah setting",
      action: () => {
        setAutoPlayNext(!autoPlayNext)
        setTestStatus(`Auto-play next: ${!autoPlayNext ? 'enabled' : 'disabled'}`)
      }
    },
    {
      id: 5,
      title: "Stop and Cleanup",
      description: "Stop audio and clean up all resources",
      action: () => {
        stop()
        cleanup()
        setTestStatus("🛑 Audio stopped and cleaned up")
      }
    }
  ]

  const navigationActions = [
    { key: 'ask' as const, label: 'Ask Every Time', description: 'Show modal for each navigation' },
    { key: 'continue' as const, label: 'Continue Playing', description: 'Keep audio playing during navigation' },
    { key: 'pause' as const, label: 'Pause Audio', description: 'Pause audio when navigating' },
    { key: 'stop' as const, label: 'Stop Audio', description: 'Stop audio when navigating' }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🎵 Audio Navigation System Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the enhanced audio navigation features
        </p>
      </div>

      {/* Current Status */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                   rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📊 Current Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Audio Playing:</span>
              <span className={`font-medium ${isPlaying ? 'text-green-600' : 'text-gray-500'}`}>
                {isPlaying ? '▶️ Yes' : '⏸️ No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Ayah:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentSurahNumber && currentAyahNumber 
                  ? `Surah ${currentSurahNumber}, Ayah ${currentAyahNumber}`
                  : 'None loaded'
                }
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Reciter:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentReciter?.name || 'None selected'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Global Popup:</span>
              <span className={`font-medium ${showGlobalAudioPopup ? 'text-green-600' : 'text-gray-500'}`}>
                {showGlobalAudioPopup ? '👁️ Visible' : '🙈 Hidden'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Auto-Play Next:</span>
              <span className={`font-medium ${autoPlayNext ? 'text-green-600' : 'text-gray-500'}`}>
                {autoPlayNext ? '⏭️ Enabled' : '⏹️ Disabled'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Page:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {location.pathname}
              </span>
            </div>
          </div>
        </div>

        {testStatus && (
          <motion.div
            className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              📝 Test Status: {testStatus}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Test Scenarios */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          🧪 Test Scenarios
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testScenarios.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              onClick={scenario.action}
              className="p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 
                         dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {scenario.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scenario.description}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Navigation Settings */}
      <motion.div
        className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 
                   rounded-xl p-6 border border-emerald-200 dark:border-emerald-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          ⚙️ Navigation Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Default Navigation Action:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {navigationActions.map((action) => (
                <motion.button
                  key={action.key}
                  onClick={() => setDefaultAction(action.key)}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    defaultAction === action.key
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {action.label}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-emerald-200 dark:border-emerald-700">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Modal on Navigation
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Display confirmation modal when navigating with active audio
              </p>
            </div>
            
            <motion.button
              onClick={() => setShowModalOnNavigation(!showModalOnNavigation)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                showModalOnNavigation ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                animate={{ x: showModalOnNavigation ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📋 How to Test
        </h2>
        
        <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li><strong>1.</strong> Click "Load and Play Ayah" to start audio playback</li>
          <li><strong>2.</strong> Use "Navigate with Audio" to test navigation behavior</li>
          <li><strong>3.</strong> Try different navigation settings to see how they affect behavior</li>
          <li><strong>4.</strong> When audio is playing and you navigate, watch for:</li>
          <ul className="ml-6 mt-2 space-y-1 list-disc">
            <li>🔴 Navigation modal (if enabled)</li>
            <li>🟢 Global audio popup (on non-audio pages)</li>
            <li>⏸️ Audio controls in the popup</li>
          </ul>
          <li><strong>5.</strong> Test that audio doesn't auto-continue to next ayah (unless enabled)</li>
        </ol>
      </motion.div>
    </div>
  )
}

export default AudioNavigationDemo
