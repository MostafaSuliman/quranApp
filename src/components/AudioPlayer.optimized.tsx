import React, { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useAudioStore, RepeatMode, PlaybackSpeed } from '../stores/audioStore'
import WaveformVisualization from './WaveformVisualization'
import { ComponentErrorBoundary } from './ErrorBoundary'

interface AudioPlayerProps {
  className?: string
  compact?: boolean
  showWaveform?: boolean
  ayahNumber?: number
  surahNumber?: number
}

// Memoized components for better performance
const VolumeSlider = memo<{
  volume: number
  onVolumeChange: (volume: number) => void
  showVolumeSlider: boolean
}>(({ volume, onVolumeChange, showVolumeSlider }) => (
  <AnimatePresence>
    {showVolumeSlider && (
      <motion.div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                   bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-[120px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
          {Math.round(volume * 100)}%
        </div>
      </motion.div>
    )}
  </AnimatePresence>
))
VolumeSlider.displayName = 'VolumeSlider'

const ProgressBar = memo<{
  progress: number
  currentTime: number
  duration: number
  onProgressClick: (event: React.MouseEvent<HTMLDivElement>) => void
  formatTime: (seconds: number) => string
}>(({ progress, currentTime, duration, onProgressClick, formatTime }) => (
  <div className="mb-4">
    <div
      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer
                 overflow-hidden"
      onClick={onProgressClick}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  </div>
))
ProgressBar.displayName = 'ProgressBar'

const ErrorDisplay = memo<{
  error: string | null
  onClearError: () => void
}>(({ error, onClearError }) => (
  <AnimatePresence>
    {error && (
      <motion.div
        className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700
                   rounded-lg text-red-700 dark:text-red-300 text-sm"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={onClearError}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            ✕
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
))
ErrorDisplay.displayName = 'ErrorDisplay'

const SettingsPanel = memo<{
  autoPlayNext: boolean
  onAutoPlayToggle: () => void
}>(({ autoPlayNext, onAutoPlayToggle }) => (
  <motion.div
    className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
  >
    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
      Audio Settings
    </h3>

    {/* Auto-play Next */}
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-600 dark:text-gray-400">Auto-play Next</span>
      <motion.button
        onClick={onAutoPlayToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          autoPlayNext ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ x: autoPlayNext ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>

    {/* Keyboard Shortcuts Info */}
    <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <strong>Keyboard Shortcuts:</strong><br />
      Space: Play/Pause • ←/→: Seek 10s • ↑/↓: Volume • M: Mute • R: Repeat mode
    </div>
  </motion.div>
))
SettingsPanel.displayName = 'SettingsPanel'

const AudioPlayer: React.FC<AudioPlayerProps> = memo(({
  className = '',
  compact = false,
  showWaveform = true,
  ayahNumber,
  surahNumber
}) => {
  const {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    progress,
    volume,
    playbackSpeed,
    repeatMode,
    autoPlayNext,
    currentAyahNumber,
    currentSurahNumber,
    currentReciter,
    isUpdatingSettings,
    settingsUpdateSuccess,
    error,
    seek,
    setVolume,
    setPlaybackSpeed,
    setRepeatMode,
    setAutoPlayNext,
    loadAyahAudio,
    playNext,
    playPrevious,
    togglePlayPause,
    handleKeyPress,
    clearError
  } = useAudioStore()

  const [showSettings, setShowSettings] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)

  // Memoized format time function
  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // Memoized progress click handler
  const handleProgressClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickProgress = (clickX / rect.width) * 100
    const seekTime = (clickProgress / 100) * duration
    seek(seekTime)
  }, [duration, seek])

  // Memoized repeat mode display
  const repeatDisplay = useMemo(() => {
    switch (repeatMode) {
      case 'none':
        return { icon: '⭯', label: 'No Repeat', color: 'text-gray-400' }
      case 'one':
        return { icon: '🔂', label: 'Repeat Once', color: 'text-blue-500' }
      case 'three':
        return { icon: '3️⃣', label: 'Repeat 3x', color: 'text-green-500' }
      case 'five':
        return { icon: '5️⃣', label: 'Repeat 5x', color: 'text-yellow-500' }
      case 'infinite':
        return { icon: '🔁', label: 'Repeat ∞', color: 'text-purple-500' }
    }
  }, [repeatMode])

  // Memoized speed options
  const speedOptions = useMemo<PlaybackSpeed[]>(() =>
    [0.5, 0.75, 1, 1.25, 1.5, 2],
    []
  )

  // Memoized repeat mode handler
  const handleRepeatModeToggle = useCallback(() => {
    const modes: RepeatMode[] = ['none', 'one', 'three', 'five', 'infinite']
    const currentIndex = modes.indexOf(repeatMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setRepeatMode(modes[nextIndex])
  }, [repeatMode, setRepeatMode])

  // Memoized speed increase handler
  const handleSpeedIncrease = useCallback(() => {
    const currentIndex = speedOptions.indexOf(playbackSpeed)
    if (currentIndex < speedOptions.length - 1) {
      setPlaybackSpeed(speedOptions[currentIndex + 1])
    }
  }, [playbackSpeed, speedOptions, setPlaybackSpeed])

  // Memoized speed decrease handler
  const handleSpeedDecrease = useCallback(() => {
    const currentIndex = speedOptions.indexOf(playbackSpeed)
    if (currentIndex > 0) {
      setPlaybackSpeed(speedOptions[currentIndex - 1])
    }
  }, [playbackSpeed, speedOptions, setPlaybackSpeed])

  // Memoized volume toggle handler
  const handleVolumeToggle = useCallback(() => {
    setShowVolumeSlider(prev => !prev)
  }, [])

  // Memoized settings toggle handler
  const handleSettingsToggle = useCallback(() => {
    setShowSettings(prev => !prev)
  }, [])

  // Memoized auto-play toggle handler
  const handleAutoPlayToggle = useCallback(() => {
    setAutoPlayNext(!autoPlayNext)
  }, [autoPlayNext, setAutoPlayNext])

  // Initialize audio when ayah/surah props change
  useEffect(() => {
    if (ayahNumber && surahNumber && currentReciter) {
      if (currentAyahNumber !== ayahNumber || currentSurahNumber !== surahNumber) {
        loadAyahAudio(surahNumber, ayahNumber, currentReciter)
      }
    }
  }, [ayahNumber, surahNumber, currentReciter, loadAyahAudio, currentAyahNumber, currentSurahNumber])

  // Keyboard shortcuts with cleanup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not typing in an input
      if ((event.target as Element)?.tagName === 'INPUT' || (event.target as Element)?.tagName === 'TEXTAREA') {
        return
      }

      event.preventDefault()
      handleKeyPress(event.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  return (
    <motion.div
      ref={playerRef}
      className={`bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900
                  border border-emerald-200 dark:border-gray-700 rounded-2xl shadow-xl backdrop-blur-sm
                  ${compact ? 'p-4' : 'p-6'} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Error Display */}
      <ErrorDisplay error={error} onClearError={clearError} />

      {/* Settings Update Indicator */}
      <AnimatePresence>
        {isUpdatingSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-700 dark:text-blue-300">Updating audio settings...</span>
            </div>
          </motion.div>
        )}
        {settingsUpdateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-xs text-green-700 dark:text-green-300">Audio settings updated!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Track Info */}
      {!compact && (currentAyahNumber || currentSurahNumber) && (
        <div className="mb-4 text-center">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {currentSurahNumber && `Surah ${currentSurahNumber}`}
            {currentAyahNumber && `, Ayah ${currentAyahNumber}`}
          </div>
          {currentReciter && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Reciter: {currentReciter.name}
              {isUpdatingSettings && (
                <span className="ml-2 text-blue-500 animate-pulse">
                  ⟳
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Waveform Visualization */}
      {showWaveform && !compact && (
        <div className="mb-6">
          <WaveformVisualization
            audioUrl={currentSurahNumber && currentAyahNumber ? `${currentSurahNumber}/${currentAyahNumber}` : null}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            className="h-20"
          />
        </div>
      )}

      {/* Progress Bar (fallback when no waveform) */}
      {(!showWaveform || compact) && (
        <ProgressBar
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          onProgressClick={handleProgressClick}
          formatTime={formatTime}
        />
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {/* Previous Button */}
        <motion.button
          onClick={playPrevious}
          disabled={isLoading || !currentAyahNumber || currentAyahNumber <= 1}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BackwardIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>

        {/* Play/Pause Button */}
        <motion.button
          onClick={togglePlayPause}
          disabled={isLoading || !currentSurahNumber}
          className="p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500
                     shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-emerald-600 hover:to-teal-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <motion.div
              className="w-6 h-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <ArrowPathIcon className="w-6 h-6" />
            </motion.div>
          ) : isPlaying ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </motion.button>

        {/* Next Button */}
        <motion.button
          onClick={playNext}
          disabled={isLoading}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ForwardIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <motion.button
              onClick={handleVolumeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>

            {/* Volume Slider */}
            <VolumeSlider
              volume={volume}
              onVolumeChange={setVolume}
              showVolumeSlider={showVolumeSlider}
            />
          </div>
        </div>

        {/* Repeat Mode */}
        <motion.button
          onClick={handleRepeatModeToggle}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                      ${repeatDisplay.color}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={repeatDisplay.label}
        >
          <span className="text-lg">{repeatDisplay.icon}</span>
        </motion.button>

        {/* Speed Control */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[30px] text-center">
            {playbackSpeed}x
          </span>
          <div className="flex flex-col">
            <motion.button
              onClick={handleSpeedIncrease}
              disabled={playbackSpeed >= 2}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded
                         disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronUpIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <motion.button
              onClick={handleSpeedDecrease}
              disabled={playbackSpeed <= 0.5}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded
                         disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDownIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Settings Button */}
        <motion.button
          onClick={handleSettingsToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            autoPlayNext={autoPlayNext}
            onAutoPlayToggle={handleAutoPlayToggle}
          />
        )}
      </AnimatePresence>

      {/* Islamic Pattern Decoration */}
      <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40" className="text-emerald-500">
          <path
            d="M20 4 L24 12 L32 8 L28 16 L36 20 L28 24 L32 32 L24 28 L20 36 L16 28 L8 32 L12 24 L4 20 L12 16 L8 8 L16 12 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </motion.div>
  )
})

AudioPlayer.displayName = 'AudioPlayer'

// Wrap AudioPlayer with error boundary
const AudioPlayerWithErrorBoundary: React.FC<AudioPlayerProps> = (props) => (
  <ComponentErrorBoundary
    componentName="Audio Player"
    enableGracefulDegradation={true}
    hideOnError={false}
  >
    <AudioPlayer {...props} />
  </ComponentErrorBoundary>
)

export default AudioPlayerWithErrorBoundary
