import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react'
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

// Memoized subcomponents for better performance
const ErrorDisplay = memo(({ error, onClear }: { error: string | null; onClear: () => void }) => (
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
            onClick={onClear}
            className="text-red-500 hover:text-red-700 ml-2"
            aria-label="Clear error"
          >
            ✕
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
))
ErrorDisplay.displayName = 'ErrorDisplay'

const SettingsIndicator = memo(({ isUpdating, success }: { isUpdating: boolean; success: boolean }) => (
  <AnimatePresence>
    {isUpdating && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
      >
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
          <span className="text-xs text-blue-700 dark:text-blue-300">Updating audio settings...</span>
        </div>
      </motion.div>
    )}
    {success && (
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
))
SettingsIndicator.displayName = 'SettingsIndicator'

const CurrentTrackInfo = memo(({
  surahNumber,
  ayahNumber,
  reciterName,
  isUpdating
}: {
  surahNumber?: number
  ayahNumber?: number
  reciterName?: string
  isUpdating: boolean
}) => {
  if (!surahNumber && !ayahNumber) return null

  return (
    <div className="mb-4 text-center">
      <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {surahNumber && `Surah ${surahNumber}`}
        {ayahNumber && `, Ayah ${ayahNumber}`}
      </div>
      {reciterName && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Reciter: {reciterName}
          {isUpdating && (
            <span className="ml-2 text-blue-500 animate-pulse">⟳</span>
          )}
        </div>
      )}
    </div>
  )
})
CurrentTrackInfo.displayName = 'CurrentTrackInfo'

const ProgressBar = memo(({
  progress,
  currentTime,
  duration,
  onProgressClick,
  onSeek
}: {
  progress: number
  currentTime: number
  duration: number
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onSeek: (time: number) => void
}) => {
  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const seekAmount = e.key === 'ArrowRight' ? 10 : -10
      onSeek(Math.max(0, Math.min(duration, currentTime + seekAmount)))
    }
  }, [currentTime, duration, onSeek])

  return (
    <div className="mb-4">
      <div
        role="progressbar"
        aria-label="Audio playback progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer
                   overflow-hidden touch-manipulation"
        onClick={onProgressClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400" aria-live="off">
        <span aria-label={`Current time ${formatTime(currentTime)}`}>{formatTime(currentTime)}</span>
        <span aria-label={`Total duration ${formatTime(duration)}`}>{formatTime(duration)}</span>
      </div>
    </div>
  )
})
ProgressBar.displayName = 'ProgressBar'

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

  // Memoized callbacks
  const handleProgressClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickProgress = (clickX / rect.width) * 100
    const seekTime = (clickProgress / 100) * duration
    seek(seekTime)
  }, [duration, seek])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }, [setVolume])

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev)
  }, [])

  const toggleVolumeSlider = useCallback(() => {
    setShowVolumeSlider(prev => !prev)
  }, [])

  const cycleRepeatMode = useCallback(() => {
    const modes: RepeatMode[] = ['none', 'one', 'three', 'five', 'infinite']
    const currentIndex = modes.indexOf(repeatMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setRepeatMode(modes[nextIndex])
  }, [repeatMode, setRepeatMode])

  const increaseSpeed = useCallback(() => {
    const speedOptions: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = speedOptions.indexOf(playbackSpeed)
    if (currentIndex < speedOptions.length - 1) {
      setPlaybackSpeed(speedOptions[currentIndex + 1])
    }
  }, [playbackSpeed, setPlaybackSpeed])

  const decreaseSpeed = useCallback(() => {
    const speedOptions: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = speedOptions.indexOf(playbackSpeed)
    if (currentIndex > 0) {
      setPlaybackSpeed(speedOptions[currentIndex - 1])
    }
  }, [playbackSpeed, setPlaybackSpeed])

  const toggleAutoPlayNext = useCallback(() => {
    setAutoPlayNext(!autoPlayNext)
  }, [autoPlayNext, setAutoPlayNext])

  // Memoized repeat mode display
  const repeatDisplay = useMemo(() => {
    const getRepeatModeDisplay = (mode: RepeatMode) => {
      switch (mode) {
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
    }
    return getRepeatModeDisplay(repeatMode)
  }, [repeatMode])

  // Initialize audio when ayah/surah props change
  useEffect(() => {
    if (ayahNumber && surahNumber && currentReciter) {
      if (currentAyahNumber !== ayahNumber || currentSurahNumber !== surahNumber) {
        loadAyahAudio(surahNumber, ayahNumber, currentReciter)
      }
    }
  }, [ayahNumber, surahNumber, currentReciter, loadAyahAudio, currentAyahNumber, currentSurahNumber])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
      <ErrorDisplay error={error} onClear={clearError} />
      <SettingsIndicator isUpdating={isUpdatingSettings} success={settingsUpdateSuccess} />

      {!compact && (
        <CurrentTrackInfo
          surahNumber={currentSurahNumber ?? undefined}
          ayahNumber={currentAyahNumber ?? undefined}
          reciterName={currentReciter?.name}
          isUpdating={isUpdatingSettings}
        />
      )}

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

      {(!showWaveform || compact) && (
        <ProgressBar
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          onProgressClick={handleProgressClick}
          onSeek={seek}
        />
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <motion.button
          onClick={playPrevious}
          disabled={isLoading || !currentAyahNumber || currentAyahNumber <= 1}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                     min-w-[44px] min-h-[44px] flex items-center justify-center
                     touch-manipulation active:scale-95"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Play previous ayah"
        >
          <BackwardIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" aria-hidden="true" />
        </motion.button>

        <motion.button
          onClick={togglePlayPause}
          disabled={isLoading || !currentSurahNumber}
          className="p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500
                     shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-emerald-600 hover:to-teal-600 transition-colors
                     min-w-[56px] min-h-[56px] flex items-center justify-center
                     touch-manipulation active:scale-95"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          aria-pressed={isPlaying}
        >
          {isLoading ? (
            <motion.div
              className="w-7 h-7"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              aria-label="Loading"
            >
              <ArrowPathIcon className="w-7 h-7" aria-hidden="true" />
            </motion.div>
          ) : isPlaying ? (
            <PauseIcon className="w-7 h-7" aria-hidden="true" />
          ) : (
            <PlayIcon className="w-7 h-7" aria-hidden="true" />
          )}
        </motion.button>

        <motion.button
          onClick={playNext}
          disabled={isLoading}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                     min-w-[44px] min-h-[44px] flex items-center justify-center
                     touch-manipulation active:scale-95"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Play next ayah"
        >
          <ForwardIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <motion.button
              onClick={toggleVolumeSlider}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                         min-w-[44px] min-h-[44px] flex items-center justify-center
                         touch-manipulation active:scale-95"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={volume === 0 ? "Unmute audio" : "Adjust volume"}
              aria-expanded={showVolumeSlider}
              aria-controls="volume-slider"
            >
              {volume === 0 ? (
                <SpeakerXMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" aria-hidden="true" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" aria-hidden="true" />
              )}
            </motion.button>

            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  id="volume-slider"
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                             bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[140px]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  role="region"
                  aria-label="Volume control"
                >
                  <label htmlFor="volume-range" className="sr-only">Volume level</label>
                  <input
                    id="volume-range"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 touch-manipulation"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(volume * 100)}
                    aria-label={`Volume at ${Math.round(volume * 100)} percent`}
                  />
                  <div className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400" aria-live="polite">
                    {Math.round(volume * 100)}%
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Repeat Mode */}
        <motion.button
          onClick={cycleRepeatMode}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                      min-w-[44px] min-h-[44px] flex items-center justify-center
                      touch-manipulation active:scale-95 ${repeatDisplay.color}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={repeatDisplay.label}
          aria-label={`Repeat mode: ${repeatDisplay.label}`}
        >
          <span className="text-xl" aria-hidden="true">{repeatDisplay.icon}</span>
        </motion.button>

        {/* Speed Control */}
        <div className="flex items-center space-x-1" role="group" aria-label="Playback speed controls">
          <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[35px] text-center" aria-live="polite">
            {playbackSpeed}x
          </span>
          <div className="flex flex-col gap-0.5">
            <motion.button
              onClick={increaseSpeed}
              disabled={playbackSpeed >= 2}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded
                         disabled:opacity-50 disabled:cursor-not-allowed
                         min-w-[32px] min-h-[32px] flex items-center justify-center
                         touch-manipulation active:scale-95"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Increase playback speed"
            >
              <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            </motion.button>
            <motion.button
              onClick={decreaseSpeed}
              disabled={playbackSpeed <= 0.5}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded
                         disabled:opacity-50 disabled:cursor-not-allowed
                         min-w-[32px] min-h-[32px] flex items-center justify-center
                         touch-manipulation active:scale-95"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Decrease playback speed"
            >
              <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            </motion.button>
          </div>
        </div>

        {/* Settings Button */}
        <motion.button
          onClick={toggleSettings}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                     min-w-[44px] min-h-[44px] flex items-center justify-center
                     touch-manipulation active:scale-95"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Audio settings"
          aria-expanded={showSettings}
          aria-controls="audio-settings-panel"
        >
          <Cog6ToothIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            id="audio-settings-panel"
            className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            role="region"
            aria-label="Audio settings panel"
          >
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Audio Settings
            </h3>

            {/* Auto-play Next */}
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="autoplay-toggle" className="text-sm text-gray-600 dark:text-gray-400">
                Auto-play Next
              </label>
              <motion.button
                id="autoplay-toggle"
                onClick={toggleAutoPlayNext}
                className={`relative w-14 h-8 rounded-full transition-colors
                           min-w-[56px] min-h-[32px] touch-manipulation active:scale-95 ${
                  autoPlayNext ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
                role="switch"
                aria-checked={autoPlayNext}
                aria-label={`Auto-play next ayah ${autoPlayNext ? 'enabled' : 'disabled'}`}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: autoPlayNext ? 28 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  aria-hidden="true"
                />
              </motion.button>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <strong>Keyboard Shortcuts:</strong><br />
              Space: Play/Pause • ←/→: Seek 10s • ↑/↓: Volume • M: Mute • R: Repeat mode
            </div>
          </motion.div>
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
