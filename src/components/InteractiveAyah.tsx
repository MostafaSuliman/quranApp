import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ayah } from '../types/quran'
import QuranText from './QuranText'
import { AutoAyahHighlighter, RevealButton } from './AyahHighlighter'
import { useMemorization } from '../hooks/useMemorization'
import { useAudioStore } from '../stores/audioStore'

interface InteractiveAyahProps {
  ayah: Ayah
  showTranslation?: boolean
  showTransliteration?: boolean
  showAyahInfo?: boolean
  showAyahNumber?: boolean
  style?: 'card' | 'inline' | 'mushaf'
  size?: 'small' | 'medium' | 'large'
  className?: string
  animate?: boolean
  
  // Interaction props
  onAyahClick?: (ayah: Ayah) => void
  onAyahPlay?: (ayah: Ayah) => void
  onAyahSelect?: (ayah: Ayah, selected: boolean) => void
  
  // Audio integration
  isPlaying?: boolean
  autoScrollOnPlay?: boolean
  
  // Memorization integration
  enableMemorization?: boolean
  
  // Touch and accessibility
  enableKeyboardNavigation?: boolean
  tabIndex?: number
}

const InteractiveAyah: React.FC<InteractiveAyahProps> = ({
  ayah,
  showTranslation = false,
  showTransliteration = false,
  showAyahInfo = true,
  showAyahNumber = true,
  style = 'card',
  size = 'medium',
  className = '',
  animate = false,
  onAyahClick,
  onAyahPlay,
  onAyahSelect,
  isPlaying = false,
  autoScrollOnPlay = true,
  enableMemorization = true,
  enableKeyboardNavigation = true,
  tabIndex
}) => {
  // Local state
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const ayahRef = useRef<HTMLDivElement>(null)

  // Audio integration
  const { currentAyahNumber, currentSurahNumber } = useAudioStore()
  const isCurrentlyPlaying = isPlaying && 
    currentAyahNumber === ayah.numberInSurah && 
    currentSurahNumber === ayah.surah

  // Memorization integration
  const {
    isMemorizationMode,
    isAyahHidden,
    isAyahSelected,
    hideAyah,
    revealAyah,
    toggleAyahSelection,
    getAyahMasteryLevel
  } = useMemorization(ayah.surah)

  const hidden = enableMemorization && isAyahHidden(ayah.surah, ayah.numberInSurah)
  const selected = enableMemorization && isAyahSelected(ayah.numberInSurah)
  const masteryLevel = enableMemorization ? getAyahMasteryLevel(ayah.surah, ayah.numberInSurah) : 0

  // Auto-scroll when playing
  useEffect(() => {
    if (isCurrentlyPlaying && autoScrollOnPlay && ayahRef.current) {
      ayahRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [isCurrentlyPlaying, autoScrollOnPlay])

  // Event handlers
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    if (isMemorizationMode) {
      if (hidden) {
        revealAyah(ayah.surah, ayah.numberInSurah)
      } else if (e.shiftKey || e.ctrlKey) {
        // Multi-select mode
        toggleAyahSelection(ayah.numberInSurah)
        onAyahSelect?.(ayah, !selected)
      } else {
        // Single click in memorization mode
        onAyahClick?.(ayah)
      }
    } else {
      onAyahClick?.(ayah)
    }
  }, [
    isMemorizationMode, 
    hidden, 
    selected, 
    ayah, 
    revealAyah, 
    toggleAyahSelection, 
    onAyahClick, 
    onAyahSelect
  ])

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onAyahPlay?.(ayah)
  }, [onAyahPlay, ayah])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (enableMemorization && !hidden) {
      hideAyah(ayah.surah, ayah.numberInSurah)
    }
  }, [enableMemorization, hidden, hideAyah, ayah])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation) return
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        handleClick(e as any)
        break
      case 'p':
      case 'P':
        e.preventDefault()
        onAyahPlay?.(ayah)
        break
      case 'h':
      case 'H':
        if (enableMemorization) {
          e.preventDefault()
          if (hidden) {
            revealAyah(ayah.surah, ayah.numberInSurah)
          } else {
            hideAyah(ayah.surah, ayah.numberInSurah)
          }
        }
        break
      case 's':
      case 'S':
        if (enableMemorization && isMemorizationMode) {
          e.preventDefault()
          toggleAyahSelection(ayah.numberInSurah)
          onAyahSelect?.(ayah, !selected)
        }
        break
    }
  }, [
    enableKeyboardNavigation,
    handleClick,
    onAyahPlay,
    ayah,
    enableMemorization,
    hidden,
    revealAyah,
    hideAyah,
    isMemorizationMode,
    selected,
    toggleAyahSelection,
    onAyahSelect
  ])

  // Touch handlers for mobile
  const handleTouchStart = useCallback(() => {
    setIsPressed(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false)
  }, [])

  // Container styling based on style prop
  const getContainerClasses = () => {
    const baseClasses = 'group relative'
    
    switch (style) {
      case 'card':
        return `${baseClasses} p-4 rounded-xl transition-all duration-300`
      case 'mushaf':
        return `${baseClasses} p-3 transition-all duration-200`
      case 'inline':
        return `${baseClasses} py-2 transition-all duration-200`
      default:
        return baseClasses
    }
  }

  // Get surah name helper
  const getSurahName = (surahNumber: number): string => {
    const surahNames: { [key: number]: string } = {
      1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa', 5: 'Al-Maidah',
      99: 'Az-Zalzalah', 110: 'An-Nasr', 111: 'Al-Masad', 112: 'Al-Ikhlas',
      113: 'Al-Falaq', 114: 'An-Nas'
    }
    return surahNames[surahNumber] || `Surah ${surahNumber}`
  }

  const content = (
    <div
      ref={ayahRef}
      className={`${getContainerClasses()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowControls(false)
      }}
      onMouseOver={() => setShowControls(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex ?? (enableKeyboardNavigation ? 0 : undefined)}
      role="button"
      aria-label={`Ayah ${ayah.numberInSurah} of ${getSurahName(ayah.surah)}${hidden ? ' (hidden)' : ''}${isCurrentlyPlaying ? ' (playing)' : ''}`}
      aria-pressed={selected}
      aria-expanded={!hidden}
    >
      <AutoAyahHighlighter
        isHovered={isHovered || isPressed}
        isSelected={selected}
        isPlaying={isCurrentlyPlaying}
        isHidden={hidden}
        inMemorizationMode={isMemorizationMode}
        masteryLevel={masteryLevel}
        isAnimated={animate}
      >
        {/* Ayah Header */}
        {showAyahInfo && !hidden && (
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-600 dark:to-amber-700 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md">
                {ayah.numberInSurah}
              </div>
              <span className="font-medium">
                {getSurahName(ayah.surah)} • Ayah {ayah.numberInSurah}
              </span>
            </div>

            {/* Controls */}
            <AnimatePresence>
              {(showControls || isCurrentlyPlaying) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  {/* Audio control */}
                  <motion.button
                    onClick={handlePlayClick}
                    className="p-2 rounded-lg bg-emerald-100 dark:bg-amber-900/20 text-emerald-700 dark:text-amber-400 hover:bg-emerald-200 dark:hover:bg-amber-900/40 transition-colors"
                    whileTap={{ scale: 0.95 }}
                    aria-label={isCurrentlyPlaying ? 'Pause audio' : 'Play audio'}
                  >
                    {isCurrentlyPlaying ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </motion.button>

                  {/* Memorization controls */}
                  {enableMemorization && isMemorizationMode && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleAyahSelection(ayah.numberInSurah)
                        onAyahSelect?.(ayah, !selected)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        selected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      aria-label={selected ? 'Unselect ayah' : 'Select ayah'}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-4">
          {/* Arabic Text */}
          <div className="relative">
            {hidden ? (
              <div className="flex items-center justify-center py-8 space-x-3">
                <div className="text-gray-400 dark:text-gray-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                </div>
                <RevealButton
                  onClick={() => revealAyah(ayah.surah, ayah.numberInSurah)}
                />
              </div>
            ) : (
              <QuranText
                text={ayah.text}
                size={size}
                style={style === 'mushaf' ? 'mushaf' : 'regular'}
                showAyahNumber={showAyahNumber}
                ayahNumber={ayah.numberInSurah}
                isPlaying={isCurrentlyPlaying}
                className="text-center"
              />
            )}
          </div>

          {/* Transliteration */}
          {showTransliteration && ayah.transliteration && !hidden && (
            <motion.div
              initial={animate ? { opacity: 0, y: 10 } : {}}
              animate={animate ? { opacity: 1, y: 0 } : {}}
              className="text-center"
            >
              <p className="text-gray-600 dark:text-gray-400 italic text-lg leading-relaxed ltr-text">
                {ayah.transliteration}
              </p>
            </motion.div>
          )}

          {/* Translation */}
          {showTranslation && ayah.translation && !hidden && (
            <motion.div
              initial={animate ? { opacity: 0, y: 10 } : {}}
              animate={animate ? { opacity: 1, y: 0 } : {}}
              transition={animate ? { delay: 0.1 } : {}}
              className="text-center"
            >
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed ltr-text">
                {ayah.translation}
              </p>
            </motion.div>
          )}
        </div>

        {/* Metadata Footer */}
        {style === 'card' && !hidden && (
          <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <span>Page {ayah.page} • Juz {ayah.juz}</span>
            <div className="flex items-center space-x-2">
              {ayah.sajda && (
                <span className="text-emerald-600 dark:text-amber-400 font-medium">
                  {ayah.sajda.obligatory ? 'Sajda Wajib' : 'Sajda Mustahab'}
                </span>
              )}
              {enableMemorization && masteryLevel > 0 && (
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  Mastery: {Math.round(masteryLevel)}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* Playing indicator for inline/mushaf styles */}
        {isCurrentlyPlaying && style !== 'card' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute top-2 right-2 text-amber-500 text-xl z-20"
          >
            🔊
          </motion.div>
        )}
      </AutoAyahHighlighter>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}

export default InteractiveAyah