import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ayah } from '../types/quran'
import MushafVerseFlow from './MushafVerseFlow'
import { ComponentErrorBoundary } from './ErrorBoundary'
import '../styles/mushaf.css'

interface MushafPageViewProps {
  ayahs: Ayah[]
  currentPage: number
  selectedAyah?: Ayah | null
  playingAyah?: {
    surahNumber: number | null
    ayahNumber: number | null
  }
  onAyahClick?: (ayah: Ayah) => void
  onPageChange?: (direction: 'prev' | 'next') => void
  showControls?: boolean
  className?: string
}

interface SurahInfo {
  number: number
  name: string
  englishName: string
  revelationType: 'Meccan' | 'Medinan'
  totalVerses: number
}

/**
 * Traditional Mushaf Page View Component
 * Renders Quran pages in authentic traditional Mushaf layout
 * with 15-line structure and proper Arabic typography
 */
const MushafPageView: React.FC<MushafPageViewProps> = ({
  ayahs = [],
  currentPage,
  selectedAyah,
  playingAyah,
  onAyahClick,
  onPageChange,
  showControls = true,
  className = ''
}) => {
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null)
  const [showBismillah, setShowBismillah] = useState(false)

  // Convert numbers to Arabic-Indic numerals
  const toArabicNumerals = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('')
  }

  // Calculate Juz (Para) number from page
  const getJuzNumber = (page: number): number => {
    return Math.ceil(page / 20)
  }

  // Get surah information from first ayah
  useEffect(() => {
    if (ayahs.length > 0) {
      const firstAyah = ayahs[0]
      
      // Check if we should show Bismillah (new surah starting, not Al-Fatiha or At-Tawbah)
      const shouldShowBismillah = 
        firstAyah.numberInSurah === 1 && 
        firstAyah.surah !== 1 && 
        firstAyah.surah !== 9

      setShowBismillah(shouldShowBismillah)

      // Set surah info (in a real app, this would come from a surah metadata store)
      setSurahInfo({
        number: firstAyah.surah,
        name: getSurahName(firstAyah.surah),
        englishName: getSurahEnglishName(firstAyah.surah),
        revelationType: getSurahRevelationType(firstAyah.surah),
        totalVerses: getSurahVerseCount(firstAyah.surah)
      })
    }
  }, [ayahs])

  // Helper functions (in a real app, these would be imported from a data service)
  const getSurahName = (surahNumber: number): string => {
    const surahNames: Record<number, string> = {
      1: 'الفاتحة',
      2: 'البقرة',
      3: 'آل عمران',
      4: 'النساء',
      5: 'المائدة',
      // Add more as needed - this is a simplified version
    }
    return surahNames[surahNumber] || `سورة ${toArabicNumerals(surahNumber)}`
  }

  const getSurahEnglishName = (surahNumber: number): string => {
    const surahNames: Record<number, string> = {
      1: 'Al-Fatihah',
      2: 'Al-Baqarah',
      3: 'Ali Imran',
      4: 'An-Nisa',
      5: 'Al-Ma\'idah',
      // Add more as needed
    }
    return surahNames[surahNumber] || `Surah ${surahNumber}`
  }

  const getSurahRevelationType = (surahNumber: number): 'Meccan' | 'Medinan' => {
    // Simplified - in reality this would come from proper metadata
    const medinanSurahs = [2, 3, 4, 5, 8, 9, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 110]
    return medinanSurahs.includes(surahNumber) ? 'Medinan' : 'Meccan'
  }

  const getSurahVerseCount = (surahNumber: number): number => {
    // Simplified verse counts - in reality this would come from proper metadata
    const verseCounts: Record<number, number> = {
      1: 7, 2: 286, 3: 200, 4: 176, 5: 120,
      // Add more as needed
    }
    return verseCounts[surahNumber] || 0
  }

  const handleKeyboard = (event: React.KeyboardEvent) => {
    if (!onPageChange) return
    
    if (event.key === 'ArrowLeft') {
      onPageChange('next')
    } else if (event.key === 'ArrowRight') {
      onPageChange('prev')
    }
  }

  return (
    <div 
      className={`relative ${className}`}
      onKeyDown={handleKeyboard}
      tabIndex={0}
      role="document"
      aria-label={`Mushaf page ${currentPage}`}
    >
      {/* Traditional Mushaf Page Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="traditional-mushaf-page mushaf-page-enter"
      >
        {/* Traditional Border Decorations */}
        <div className="mushaf-border-decoration" />

        {/* Juz Information */}
        <div className="mushaf-juz-info">
          <span>الجزء {toArabicNumerals(getJuzNumber(currentPage))}</span>
        </div>

        {/* Surah Header (if new surah starts on this page) */}
        {surahInfo && ayahs[0]?.numberInSurah === 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mushaf-surah-header"
          >
            <div className="mushaf-surah-name">
              سورة {surahInfo.name}
            </div>
            <div className="mushaf-surah-info">
              {surahInfo.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • 
              {toArabicNumerals(surahInfo.totalVerses)} آية
            </div>
          </motion.div>
        )}

        {/* Bismillah (if starting new surah, except Al-Fatiha and At-Tawbah) */}
        {showBismillah && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mushaf-bismillah"
          >
            <div className="mushaf-bismillah-text">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </div>
          </motion.div>
        )}

        {/* Verse Flow Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative flex-1"
          style={{ 
            minHeight: showBismillah ? '400px' : '480px',
            marginTop: showBismillah ? '16px' : '24px'
          }}
        >
          <MushafVerseFlow
            ayahs={ayahs}
            onAyahClick={onAyahClick}
            selectedAyah={selectedAyah}
            playingAyah={playingAyah}
            linesPerPage={15}
            className="h-full"
          />
        </motion.div>

        {/* Traditional Page Number */}
        <div className="mushaf-page-number">
          {toArabicNumerals(currentPage)}
        </div>
      </motion.div>

      {/* Page Navigation Controls */}
      {showControls && onPageChange && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-between items-center mt-6 px-4"
        >
          <button
            onClick={() => onPageChange('prev')}
            disabled={currentPage <= 1}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gold-400 text-gold-700 dark:text-gold-400 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous page"
          >
            <span className="text-lg">←</span>
            <span className="font-medium">السابقة</span>
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              صفحة {toArabicNumerals(currentPage)} من ٦٠٤
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              الجزء {toArabicNumerals(getJuzNumber(currentPage))}
            </div>
          </div>

          <button
            onClick={() => onPageChange('next')}
            disabled={currentPage >= 604}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gold-400 text-gold-700 dark:text-gold-400 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next page"
          >
            <span className="font-medium">التالية</span>
            <span className="text-lg">→</span>
          </button>
        </motion.div>
      )}

      {/* Keyboard Navigation Hint */}
      {showControls && (
        <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
          استخدم الأسهم ← → للتنقل بين الصفحات
        </div>
      )}
    </div>
  )
}

// Wrap with Error Boundary
const MushafPageViewWithErrorBoundary: React.FC<MushafPageViewProps> = (props) => (
  <ComponentErrorBoundary 
    componentName="Mushaf Page View"
    enableGracefulDegradation={true}
    showMinimal={false}
  >
    <MushafPageView {...props} />
  </ComponentErrorBoundary>
)

export default MushafPageViewWithErrorBoundary