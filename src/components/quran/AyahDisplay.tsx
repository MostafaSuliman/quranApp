import { memo } from 'react'
import type { Ayah } from '@/types'
import { toArabicIndic } from '@/utils/numerals'
import { cn } from '@/utils/cn'
import { useSettingsStore } from '@/stores/settings'

interface AyahDisplayProps {
  ayah: Ayah
  isPlaying?: boolean
  isHighlighted?: boolean
  isHidden?: boolean // For memorization mode
  hideLevel?: 'none' | 'last-word' | 'half' | 'full'
  onClick?: () => void
  onLongPress?: () => void
}

const fontSizeClasses = {
  small: 'text-quran-sm',
  medium: 'text-quran-base',
  large: 'text-quran-lg',
  xlarge: 'text-quran-xl',
}

/**
 * Display a single Ayah with proper styling
 * Text is received from API - never hardcoded
 */
export const AyahDisplay = memo(function AyahDisplay({
  ayah,
  isPlaying = false,
  isHighlighted = false,
  isHidden = false,
  hideLevel = 'none',
  onClick,
  onLongPress,
}: AyahDisplayProps) {
  const fontSize = useSettingsStore((s) => s.fontSize)

  // Get the text to display based on hide level
  const getDisplayText = () => {
    if (isHidden || hideLevel === 'full') {
      return '...'
    }

    const words = ayah.text.split(' ')

    if (hideLevel === 'last-word' && words.length > 1) {
      return words.slice(0, -1).join(' ') + ' ___'
    }

    if (hideLevel === 'half' && words.length > 1) {
      const midpoint = Math.ceil(words.length / 2)
      return words.slice(0, midpoint).join(' ') + ' ...'
    }

    return ayah.text
  }

  return (
    <span
      className={cn(
        'inline quran-text transition-colors cursor-pointer',
        fontSizeClasses[fontSize],
        isPlaying && 'verse-playing',
        isHighlighted && 'verse-highlight',
        isHidden && 'text-neutral-300 dark:text-neutral-700'
      )}
      onClick={onClick}
      onContextMenu={(e) => {
        if (onLongPress) {
          e.preventDefault()
          onLongPress()
        }
      }}
    >
      {getDisplayText()}
      <AyahMarker number={ayah.numberInSurah} />
    </span>
  )
})

interface AyahMarkerProps {
  number: number
}

/**
 * Ayah end marker with Arabic-Indic numeral
 */
export function AyahMarker({ number }: AyahMarkerProps) {
  return (
    <span className="ayah-marker" aria-label={`الآية ${toArabicIndic(number)}`}>
      {toArabicIndic(number)}
    </span>
  )
}

interface AyahListProps {
  ayahs: Ayah[]
  currentAyahNumber?: number
  playingAyahNumber?: number
  hideLevel?: 'none' | 'last-word' | 'half' | 'full'
  onAyahClick?: (ayah: Ayah) => void
  onAyahLongPress?: (ayah: Ayah) => void
}

/**
 * Display a list of Ayahs (e.g., for a page or surah)
 */
export function AyahList({
  ayahs,
  currentAyahNumber,
  playingAyahNumber,
  hideLevel = 'none',
  onAyahClick,
  onAyahLongPress,
}: AyahListProps) {
  const fontSize = useSettingsStore((s) => s.fontSize)

  if (ayahs.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'quran-text leading-loose',
        fontSizeClasses[fontSize]
      )}
      dir="rtl"
      lang="ar"
    >
      {ayahs.map((ayah) => (
        <AyahDisplay
          key={`${ayah.surah?.number || 0}-${ayah.numberInSurah}`}
          ayah={ayah}
          isHighlighted={ayah.numberInSurah === currentAyahNumber}
          isPlaying={ayah.numberInSurah === playingAyahNumber}
          hideLevel={hideLevel}
          onClick={() => onAyahClick?.(ayah)}
          onLongPress={() => onAyahLongPress?.(ayah)}
        />
      ))}
    </div>
  )
}
