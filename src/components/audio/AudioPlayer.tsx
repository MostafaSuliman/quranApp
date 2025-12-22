import { useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAudioStore } from '@/stores/audio'
import { toArabicIndic } from '@/utils/numerals'
import { cn } from '@/utils/cn'

interface AudioPlayerProps {
  className?: string
}

/**
 * Main audio player component for Quran recitation
 */
export function AudioPlayer({ className }: AudioPlayerProps) {
  const {
    isPlaying,
    isLoading,
    currentVerse,
    playbackSpeed,
    volume,
    repeatMode,
    repeatCount,
    currentRepeat,
    pause,
    resume,
    stop,
    playNext,
    playPrevious,
    setPlaybackSpeed,
    setVolume,
    setRepeatMode,
    setRepeatCount,
    initAudio,
  } = useAudioStore()

  // Initialize audio on mount
  useEffect(() => {
    initAudio()
  }, [initAudio])

  if (!currentVerse) {
    return null // Don't show player if nothing is playing
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      resume()
    }
  }

  const cycleRepeatMode = () => {
    if (repeatMode === 'off') {
      setRepeatMode('verse')
    } else if (repeatMode === 'verse') {
      setRepeatMode('range')
    } else {
      setRepeatMode('off')
    }
  }

  return (
    <div
      className={cn(
        'fixed bottom-16 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95',
        className
      )}
    >
      {/* Current verse info */}
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
          سورة {toArabicIndic(currentVerse.surahNumber)} - الآية{' '}
          {toArabicIndic(currentVerse.ayahNumber)}
        </span>

        {repeatMode !== 'off' && (
          <span className="text-primary-600 dark:text-primary-400 arabic-ui">
            تكرار {toArabicIndic(currentRepeat + 1)}/{toArabicIndic(repeatCount)}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 pb-4">
        {/* Previous */}
        <Button
          variant="ghost"
          size="icon"
          onClick={playPrevious}
          aria-label="السابق"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="primary"
          size="icon-lg"
          onClick={handlePlayPause}
          disabled={isLoading}
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          className="rounded-full"
        >
          {isLoading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 mr-[-2px]" />
          )}
        </Button>

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          onClick={playNext}
          aria-label="التالي"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        {/* Repeat */}
        <Button
          variant={repeatMode !== 'off' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={cycleRepeatMode}
          aria-label="تكرار"
        >
          {repeatMode === 'verse' ? (
            <Repeat1 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          ) : (
            <Repeat
              className={cn(
                'h-5 w-5',
                repeatMode === 'range' && 'text-primary-600 dark:text-primary-400'
              )}
            />
          )}
        </Button>
      </div>
    </div>
  )
}

interface MiniPlayerProps {
  className?: string
}

/**
 * Compact audio player for display in other contexts
 */
export function MiniPlayer({ className }: MiniPlayerProps) {
  const { isPlaying, currentVerse, pause, resume } = useAudioStore()

  if (!currentVerse) return null

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => (isPlaying ? pause() : resume())}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <span className="flex-1 text-sm text-neutral-600 dark:text-neutral-400 arabic-ui truncate">
        سورة {toArabicIndic(currentVerse.surahNumber)} - الآية{' '}
        {toArabicIndic(currentVerse.ayahNumber)}
      </span>
    </div>
  )
}

interface PlaybackSpeedSelectorProps {
  value: number
  onChange: (speed: number) => void
}

const speeds = [0.75, 1, 1.25, 1.5, 2]

export function PlaybackSpeedSelector({ value, onChange }: PlaybackSpeedSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {speeds.map((speed) => (
        <button
          key={speed}
          onClick={() => onChange(speed)}
          className={cn(
            'rounded-lg px-3 py-1 text-sm transition-colors',
            value === speed
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
          )}
        >
          {speed}x
        </button>
      ))}
    </div>
  )
}

interface RepeatCountSelectorProps {
  value: number
  onChange: (count: number) => void
}

const repeatCounts = [1, 3, 5, 7, 10, 15, 20]

export function RepeatCountSelector({ value, onChange }: RepeatCountSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {repeatCounts.map((count) => (
        <button
          key={count}
          onClick={() => onChange(count)}
          className={cn(
            'rounded-lg px-3 py-1 text-sm transition-colors arabic-ui',
            value === count
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
          )}
        >
          {toArabicIndic(count)}
        </button>
      ))}
    </div>
  )
}
