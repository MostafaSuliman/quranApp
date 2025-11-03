import React from 'react'
import { motion } from 'framer-motion'
import { Ayah } from '../types/quran'
import QuranText from './QuranText'
import InteractiveAyah from './InteractiveAyah'

// Helper function to get surah names (simplified for common surahs)
const getSurahName = (surahNumber: number): string => {
  const surahNames: { [key: number]: string } = {
    1: 'Al-Fatiha',
    2: 'Al-Baqarah',
    3: 'Ali Imran',
    4: 'An-Nisa',
    5: 'Al-Maidah',
    99: 'Az-Zalzalah',
    110: 'An-Nasr',
    111: 'Al-Masad',
    112: 'Al-Ikhlas',
    113: 'Al-Falaq',
    114: 'An-Nas'
  }
  return surahNames[surahNumber] || `${surahNumber}`
}

interface AyahDisplayProps {
  ayah: Ayah
  showTranslation?: boolean
  showTransliteration?: boolean
  showAyahInfo?: boolean
  showAyahNumber?: boolean
  isHighlighted?: boolean
  isPlaying?: boolean
  style?: 'card' | 'inline' | 'mushaf'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
  onPlay?: () => void
  className?: string
  animate?: boolean
  
  // New interactive props
  interactive?: boolean
  enableMemorization?: boolean
  onAyahSelect?: (ayah: Ayah, selected: boolean) => void
  autoScrollOnPlay?: boolean
}

const AyahDisplay: React.FC<AyahDisplayProps> = ({
  ayah,
  showTranslation = false,
  showTransliteration = false,
  showAyahInfo = true,
  showAyahNumber = true,
  isHighlighted = false,
  isPlaying = false,
  style = 'card',
  size = 'medium',
  onClick,
  onPlay,
  className = '',
  animate = false,
  interactive = false,
  enableMemorization = false,
  onAyahSelect,
  autoScrollOnPlay = true
}) => {
  // Use InteractiveAyah when interactive features are enabled
  if (interactive) {
    return (
      <InteractiveAyah
        ayah={ayah}
        showTranslation={showTranslation}
        showTransliteration={showTransliteration}
        showAyahInfo={showAyahInfo}
        showAyahNumber={showAyahNumber}
        style={style}
        size={size}
        className={className}
        animate={animate}
        onAyahClick={onClick}
        onAyahPlay={onPlay}
        onAyahSelect={onAyahSelect}
        isPlaying={isPlaying}
        autoScrollOnPlay={autoScrollOnPlay}
        enableMemorization={enableMemorization}
        enableKeyboardNavigation={true}
      />
    )
  }

  const containerClass = () => {
    let classes = 'transition-all duration-300'
    
    switch (style) {
      case 'card':
        classes += ' bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 space-y-4'
        break
      case 'mushaf':
        classes += ' space-y-3 p-4'
        break
      case 'inline':
        classes += ' space-y-2'
        break
    }
    
    if (onClick) {
      classes += ' cursor-pointer hover:shadow-lg transform hover:scale-105'
    }
    
    if (isHighlighted) {
      classes += ' ring-2 ring-primary-500 dark:ring-gold-400'
    }
    
    if (isPlaying) {
      classes += ' ring-2 ring-gold-500 bg-gold-50 dark:bg-gold-900/20'
    }
    
    return `${classes} ${className}`
  }
  
  const content = (
    <div className={containerClass()} onClick={onClick}>
      {/* Ayah info header */}
      {showAyahInfo && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-primary-600 dark:bg-gold-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {ayah.numberInSurah}
            </div>
            <span>
              Surah {getSurahName(ayah.surah)} - Ayah {ayah.numberInSurah}
            </span>
          </div>
          
          {/* Audio play button */}
          {onPlay && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                onPlay()
              }}
              className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-gold-400 hover:bg-primary-200 dark:hover:bg-primary-900/40"
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </motion.button>
          )}
        </div>
      )}
      
      {/* Arabic text (primary content) */}
      <div className="space-y-4">
        <QuranText
          text={ayah.text}
          size={size}
          style={style === 'mushaf' ? 'mushaf' : 'regular'}
          showAyahNumber={showAyahNumber}
          ayahNumber={ayah.numberInSurah}
          isPlaying={isPlaying}
          className="text-center"
        />
        
        {/* Transliteration (secondary content) */}
        {showTransliteration && ayah.transliteration && (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 italic text-lg leading-relaxed">
              {ayah.transliteration}
            </p>
          </div>
        )}
        
        {/* Translation (tertiary content) */}
        {showTranslation && ayah.translation && (
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed ltr-text">
              {ayah.translation}
            </p>
          </div>
        )}
      </div>
      
      {/* Additional metadata */}
      {style === 'card' && (
        <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span>Page {ayah.page} • Juz {ayah.juz}</span>
          {ayah.sajda && (
            <span className="text-primary-600 dark:text-gold-400 font-medium">
              {ayah.sajda.obligatory ? 'Sajda Wajib' : 'Sajda Mustahab'}
            </span>
          )}
        </div>
      )}
      
      {/* Playing indicator overlay */}
      {isPlaying && style !== 'inline' && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute top-4 right-4 text-gold-500 text-xl"
        >
          🔊
        </motion.div>
      )}
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

export default AyahDisplay