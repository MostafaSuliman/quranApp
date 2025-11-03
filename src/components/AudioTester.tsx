import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAudioStore } from '../stores/audioStore'
import AudioPlayer from './AudioPlayer'

interface AudioTesterProps {
  onClose: () => void
}

const AudioTester: React.FC<AudioTesterProps> = ({ onClose }) => {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isVisible] = useState(true)
  
  const { 
    initializeAudio, 
    loadAyahAudio, 
    togglePlayPause,
    currentReciter,
    error,
    clearError 
  } = useAudioStore()

  useEffect(() => {
    // Initialize audio with default reciter
    initializeAudio()
    addTestResult('🎵 Audio system initialized')
    
    if (currentReciter) {
      addTestResult(`✅ Default reciter set: ${currentReciter.name}`)
    }
  }, [initializeAudio, currentReciter])

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBasicAudio = async () => {
    try {
      clearError()
      addTestResult('🧪 Testing basic audio loading...')
      
      // Test loading Al-Fatiha, verse 1
      await loadAyahAudio(1, 1)
      addTestResult('✅ Audio loaded successfully: Surah Al-Fatiha, Ayah 1')
      
    } catch (error) {
      addTestResult(`❌ Audio loading failed: ${error}`)
    }
  }

  const testPlayback = async () => {
    try {
      addTestResult('🎵 Testing audio playback...')
      await togglePlayPause()
      addTestResult('✅ Playback toggled successfully')
    } catch (error) {
      addTestResult(`❌ Playback failed: ${error}`)
    }
  }

  const testDifferentAyah = async () => {
    try {
      clearError()
      addTestResult('🧪 Testing different ayah...')
      
      // Test loading Al-Baqarah, verse 1
      await loadAyahAudio(2, 1)
      addTestResult('✅ Audio loaded: Surah Al-Baqarah, Ayah 1')
      
    } catch (error) {
      addTestResult(`❌ Failed to load different ayah: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
    clearError()
  }

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🎵 Audio Integration Tester</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-emerald-100 mt-2">
            Test Quran recitation audio functionality
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Audio Player */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Audio Player
            </h3>
            <AudioPlayer compact={true} showWaveform={false} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-red-700 dark:text-red-300">{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Test Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Test Controls
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={testBasicAudio}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🧪 Test Basic Loading
              </button>
              <button
                onClick={testPlayback}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🎵 Test Playback
              </button>
              <button
                onClick={testDifferentAyah}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📖 Test Different Ayah
              </button>
              <button
                onClick={clearResults}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🗑️ Clear Results
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Test Results
            </h3>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 h-40 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center">No test results yet. Run some tests!</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🚀 Quick Test Guide
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Click "Test Basic Loading" to load Al-Fatiha verse 1</li>
              <li>2. Click "Test Playback" to start/stop audio</li>
              <li>3. Use the audio player controls above</li>
              <li>4. Try keyboard shortcuts: Space (play/pause), ← → (seek)</li>
              <li>5. Test different ayahs with "Test Different Ayah"</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AudioTester