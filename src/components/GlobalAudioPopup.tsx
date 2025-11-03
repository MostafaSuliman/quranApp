import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useAudioStore } from '../stores/audioStore'
import type { PlaybackSpeed } from '../stores/audio'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useUIText } from '../utils/uiText'
import { useLocation } from 'react-router-dom'

interface GlobalAudioPopupProps {
  isVisible: boolean
  onClose: () => void
  className?: string
}

const GlobalAudioPopup: React.FC<GlobalAudioPopupProps> = ({
  isVisible,
  onClose,
  className = ''
}) => {
  const location = useLocation()
  const uiText = useUIText()
  const { preferences } = usePreferencesStore()
  const { 
    isPlaying,
    currentTime,
    duration,
    currentAyahNumber,
    currentSurahNumber,
    currentReciter,
    volume,
    playbackSpeed,
    togglePlayPause,
    stop,
    setVolume,
    setPlaybackSpeed,
    cleanup
  } = useAudioStore()

  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-hide popup when audio stops playing
  useEffect(() => {
    if (!isPlaying && !currentAyahNumber && !currentSurahNumber) {
      const hideTimer = setTimeout(() => {
        onClose()
      }, 3000) // Hide after 3 seconds of no audio

      return () => clearTimeout(hideTimer)
    }
  }, [isPlaying, currentAyahNumber, currentSurahNumber, onClose])

  // Format time for display
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get page display name
  const getPageDisplayName = (path: string) => {
    if (path.includes('/lesson')) return uiText.text.learn
    if (path.includes('/mushaf')) return uiText.text.mushaf
    if (path.includes('/progress')) return uiText.text.progress
    if (path.includes('/settings')) return uiText.text.settings
    if (path === '/') return uiText.text.home
    return 'Page'
  }

  const handleStop = () => {
    stop()
    cleanup()
    onClose()
  }

  const handleVolumeChange = (change: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + change))
    setVolume(newVolume)
  }

  const handleSpeedChange = (change: number) => {
    const speeds: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const newIndex = Math.max(0, Math.min(speeds.length - 1, currentIndex + change))
    setPlaybackSpeed(speeds[newIndex])
  }

  if (!isVisible || (!isPlaying && !currentAyahNumber && !currentSurahNumber)) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed top-4 right-4 z-50 ${className}`}
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
      >
        {/* Main Popup Card */}
        <motion.div
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 
                     border border-emerald-200 dark:border-gray-700 rounded-2xl shadow-2xl backdrop-blur-sm
                     overflow-hidden min-w-[280px]"
          layout
          animate={{ height: isExpanded ? 'auto' : 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-emerald-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <SpeakerWaveIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {preferences.uiLanguage === 'ar' ? 'تشغيل الصوت' : 'Audio Playing'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getPageDisplayName(location.pathname)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Expand/Collapse Button */}
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </motion.button>

              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Current Audio Info */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <motion.div
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                  }`}
                />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentSurahNumber && `Surah ${currentSurahNumber}`}
                  {currentAyahNumber && `, Ayah ${currentAyahNumber}`}
                </div>
              </div>
              
              {currentReciter && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {preferences.uiLanguage === 'ar' ? 'القارئ: ' : 'Reciter: '}{currentReciter.name}
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              {/* Play/Pause Button */}
              <motion.button
                onClick={togglePlayPause}
                className="flex items-center justify-center w-10 h-10 bg-emerald-500 hover:bg-emerald-600 
                           text-white rounded-full shadow-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5 ml-0.5" />
                )}
              </motion.button>

              {/* Stop Button */}
              <motion.button
                onClick={handleStop}
                className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 
                           text-white rounded-full shadow-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <StopIcon className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Extended Controls */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 border-t border-emerald-100 dark:border-gray-700 pt-3"
                >
                  {/* Volume Control */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Volume</span>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => handleVolumeChange(-0.1)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        whileTap={{ scale: 0.9 }}
                      >
                        <MinusIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                      
                      <div className="text-xs font-medium text-gray-900 dark:text-white min-w-[35px] text-center">
                        {Math.round(volume * 100)}%
                      </div>
                      
                      <motion.button
                        onClick={() => handleVolumeChange(0.1)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        whileTap={{ scale: 0.9 }}
                      >
                        <PlusIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Speed Control */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Speed</span>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => handleSpeedChange(-1)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        whileTap={{ scale: 0.9 }}
                      >
                        <MinusIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                      
                      <div className="text-xs font-medium text-gray-900 dark:text-white min-w-[35px] text-center">
                        {playbackSpeed}x
                      </div>
                      
                      <motion.button
                        onClick={() => handleSpeedChange(1)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        whileTap={{ scale: 0.9 }}
                      >
                        <PlusIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-emerald-100 dark:border-gray-700">
                    {preferences.uiLanguage === 'ar' 
                      ? 'يمكنك التحكم في الصوت من أي صفحة' 
                      : 'Audio controls available from any page'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GlobalAudioPopup
