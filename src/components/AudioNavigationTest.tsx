import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  PlayIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAudioStore } from '../stores/audioStore'
import { useAudioNavigationStore } from '../stores/audioNavigationStore'
import { useAudioAwareNavigation, useNavigationGuard } from '../contexts/AudioNavigationProvider'
import { usePreferencesStore } from '../stores/preferencesStore'

interface TestResult {
  test: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message?: string
  timestamp?: number
}

const AudioNavigationTest: React.FC = () => {
  const location = useLocation()
  const { preferences } = usePreferencesStore()
  const { 
    loadAyahAudio, 
    play, 
    pause, 
    isPlaying, 
    currentAyahNumber,
    currentSurahNumber,
    currentReciter
  } = useAudioStore()
  
  const { 
    defaultAction, 
    isNavigationModalOpen,
    audioStateBeforeNavigation 
  } = useAudioNavigationStore()
  
  const { navigate: audioAwareNavigate } = useAudioAwareNavigation()
  const { hasAudioContent, willShowModal, canNavigateFreely } = useNavigationGuard()
  
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [currentTestIndex, setCurrentTestIndex] = useState(0)

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, ...updates, timestamp: Date.now() } : result
    ))
  }

  const tests = [
    {
      name: 'Audio Store Integration',
      description: 'Test basic audio loading and playback',
      test: async () => {
        if (!currentReciter) {
          throw new Error('No reciter available')
        }
        
        await loadAyahAudio(1, 1, currentReciter)
        
        if (!currentAyahNumber || !currentSurahNumber) {
          throw new Error('Audio not loaded properly')
        }
        
        return 'Audio loaded successfully'
      }
    },
    {
      name: 'Audio Playback Control',
      description: 'Test play/pause/stop functionality',
      test: async () => {
        await play()
        
        if (!isPlaying) {
          throw new Error('Audio not playing')
        }
        
        pause()
        
        if (isPlaying) {
          throw new Error('Audio not paused')
        }
        
        return 'Playback controls working'
      }
    },
    {
      name: 'Navigation Guard Detection',
      description: 'Test navigation guard state detection',
      test: async () => {
        // Start audio
        await play()
        
        if (!hasAudioContent) {
          throw new Error('Navigation guard not detecting audio content')
        }
        
        if (defaultAction === 'ask' && !willShowModal) {
          throw new Error('Modal should show when default action is ask')
        }
        
        return 'Navigation guard working correctly'
      }
    },
    {
      name: 'Audio State Persistence',
      description: 'Test audio state saving and restoration',
      test: async () => {
        const { saveAudioState, restoreAudioState, clearAudioState } = useAudioNavigationStore.getState()
        
        // Save current state
        const audioStore = useAudioStore.getState()
        saveAudioState(audioStore)
        
        const savedState = useAudioNavigationStore.getState().audioStateBeforeNavigation
        
        if (!savedState) {
          throw new Error('Audio state not saved')
        }
        
        // Clear and restore
        clearAudioState()
        restoreAudioState()
        
        return 'Audio state persistence working'
      }
    },
    {
      name: 'Preference Synchronization',
      description: 'Test preferences sync with navigation store',
      test: async () => {
        const { updateAudioNavigationAction } = usePreferencesStore.getState()
        
        // Change preference
        updateAudioNavigationAction('continue')
        
        // Small delay for async sync
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const navStore = useAudioNavigationStore.getState()
        
        if (navStore.defaultAction !== 'continue') {
          throw new Error('Preferences not synced to navigation store')
        }
        
        return 'Preference synchronization working'
      }
    },
    {
      name: 'Modal Component Integration',
      description: 'Test modal component state management',
      test: async () => {
        const { openNavigationModal, closeNavigationModal } = useAudioNavigationStore.getState()
        
        // Test modal opening
        const modalPromise = openNavigationModal('/test', '/target')
        
        if (!isNavigationModalOpen) {
          throw new Error('Modal not opened')
        }
        
        // Close modal
        closeNavigationModal('continue')
        
        const result = await modalPromise
        
        if (!result) {
          throw new Error('Modal did not return expected result')
        }
        
        return 'Modal integration working'
      }
    }
  ]

  const runAllTests = async () => {
    setIsRunningTests(true)
    setCurrentTestIndex(0)
    
    // Initialize test results
    const initialResults: TestResult[] = tests.map((test) => ({
      test: test.name,
      status: 'pending'
    }))
    
    setTestResults(initialResults)
    
    // Run tests sequentially
    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i)
      updateTestResult(i, { status: 'running' })
      
      try {
        const message = await tests[i].test()
        updateTestResult(i, { status: 'passed', message })
      } catch (error) {
        updateTestResult(i, { 
          status: 'failed', 
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsRunningTests(false)
    setCurrentTestIndex(-1)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'running':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ClockIcon className="w-5 h-5 text-blue-500" />
          </motion.div>
        )
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />
    }
  }

  const passedTests = testResults.filter(r => r.status === 'passed').length
  const failedTests = testResults.filter(r => r.status === 'failed').length

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {preferences.uiLanguage === 'ar' ? 'اختبار نظام التنقل الصوتي' : 'Audio Navigation System Test'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {preferences.uiLanguage === 'ar' 
            ? 'اختبار شامل لجميع مكونات نظام التنقل الصوتي' 
            : 'Comprehensive test suite for audio navigation system components'}
        </p>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {preferences.uiLanguage === 'ar' ? 'الحالة الحالية' : 'Current Status'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {preferences.uiLanguage === 'ar' ? 'يشغل صوت:' : 'Audio Playing:'}
            </span>
            <div className={`font-medium ${isPlaying ? 'text-green-600' : 'text-gray-500'}`}>
              {isPlaying ? (preferences.uiLanguage === 'ar' ? 'نعم' : 'Yes') : (preferences.uiLanguage === 'ar' ? 'لا' : 'No')}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {preferences.uiLanguage === 'ar' ? 'الإجراء الافتراضي:' : 'Default Action:'}
            </span>
            <div className="font-medium text-blue-600 dark:text-blue-400">
              {defaultAction}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {preferences.uiLanguage === 'ar' ? 'محتوى صوتي:' : 'Audio Content:'}
            </span>
            <div className={`font-medium ${hasAudioContent ? 'text-green-600' : 'text-gray-500'}`}>
              {hasAudioContent ? (preferences.uiLanguage === 'ar' ? 'متوفر' : 'Available') : (preferences.uiLanguage === 'ar' ? 'غير متوفر' : 'None')}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {preferences.uiLanguage === 'ar' ? 'سيظهر نافذة:' : 'Will Show Modal:'}
            </span>
            <div className={`font-medium ${willShowModal ? 'text-blue-600' : 'text-gray-500'}`}>
              {willShowModal ? (preferences.uiLanguage === 'ar' ? 'نعم' : 'Yes') : (preferences.uiLanguage === 'ar' ? 'لا' : 'No')}
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6 flex flex-wrap gap-3">
        <motion.button
          onClick={runAllTests}
          disabled={isRunningTests}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-teal-700 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRunningTests 
            ? (preferences.uiLanguage === 'ar' ? 'جاري التشغيل...' : 'Running Tests...') 
            : (preferences.uiLanguage === 'ar' ? 'تشغيل جميع الاختبارات' : 'Run All Tests')}
        </motion.button>

        <motion.button
          onClick={async () => {
            if (currentReciter) {
              await loadAyahAudio(1, 1, currentReciter)
              await play()
            }
          }}
          className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlayIcon className="w-5 h-5" />
        </motion.button>

        <motion.button
          onClick={() => audioAwareNavigate('/mushaf')}
          className="px-4 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{preferences.uiLanguage === 'ar' ? 'اختبار التنقل' : 'Test Navigation'}</span>
          <ArrowRightIcon className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {preferences.uiLanguage === 'ar' ? 'نتائج الاختبارات' : 'Test Results'}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {passedTests}/{testResults.length} {preferences.uiLanguage === 'ar' ? 'نجح' : 'Passed'}
              {failedTests > 0 && (
                <span className="text-red-500 ml-2">
                  ({failedTests} {preferences.uiLanguage === 'ar' ? 'فشل' : 'Failed'})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {testResults.map((result, index) => (
              <motion.div
                key={result.test}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentTestIndex === index 
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                    : result.status === 'passed'
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : result.status === 'failed'
                    ? 'border-red-200 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-700'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {result.test}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {tests[index]?.description}
                    </p>
                    {result.message && (
                      <p className={`text-sm ${
                        result.status === 'passed' 
                          ? 'text-green-700 dark:text-green-400' 
                          : result.status === 'failed'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {result.message}
                      </p>
                    )}
                    {result.timestamp && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {preferences.uiLanguage === 'ar' ? 'معلومات التشخيص' : 'Debug Information'}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>Current Path: {location.pathname}</div>
          <div>Modal Open: {isNavigationModalOpen ? 'Yes' : 'No'}</div>
          <div>Audio State Saved: {audioStateBeforeNavigation ? 'Yes' : 'No'}</div>
          <div>Can Navigate Freely: {canNavigateFreely ? 'Yes' : 'No'}</div>
          {currentAyahNumber && currentSurahNumber && (
            <div>Current Audio: Surah {currentSurahNumber}, Ayah {currentAyahNumber}</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AudioNavigationTest
