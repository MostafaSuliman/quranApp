import { useEffect } from 'react'
import { useQuranStore } from '@/stores/quran'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { toArabicIndic } from '@/utils/numerals'
import { cn } from '@/utils/cn'

interface SurahListProps {
  onSurahSelect?: (surahNumber: number) => void
  className?: string
}

/**
 * Display list of all Surahs with metadata from API
 * Surah names are fetched dynamically, never hardcoded
 */
export function SurahList({ onSurahSelect, className }: SurahListProps) {
  const {
    surahs,
    chapters,
    surahsLoading,
    surahsError,
    loadSurahs,
    goToSurah,
  } = useQuranStore()

  useEffect(() => {
    if (surahs.length === 0 && !surahsLoading) {
      loadSurahs()
    }
  }, [surahs.length, surahsLoading, loadSurahs])

  const handleSurahClick = (surahNumber: number) => {
    if (onSurahSelect) {
      onSurahSelect(surahNumber)
    } else {
      goToSurah(surahNumber)
    }
  }

  if (surahsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (surahsError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorMessage message={surahsError} onRetry={loadSurahs} />
      </div>
    )
  }

  // Use chapters from Quran.com for more detailed info, fallback to AlQuran Cloud surahs
  const displayData = chapters.length > 0 ? chapters : surahs

  return (
    <div className={cn('divide-y divide-neutral-100 dark:divide-neutral-800', className)}>
      {displayData.map((item, index) => {
        const surahNumber = 'number' in item ? item.number : item.id
        const arabicName = 'name' in item ? item.name : item.name_arabic
        const englishName = 'englishName' in item ? item.englishName : item.name_simple
        const versesCount = 'numberOfAyahs' in item ? item.numberOfAyahs : item.verses_count
        const revelationType = 'revelationType' in item
          ? item.revelationType
          : item.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'

        return (
          <button
            key={surahNumber}
            onClick={() => handleSurahClick(surahNumber)}
            className="flex w-full items-center gap-4 px-4 py-3 text-right transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            {/* Surah number */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {toArabicIndic(surahNumber)}
              </span>
            </div>

            {/* Surah info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 quran-text truncate">
                  {arabicName}
                </h3>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {englishName}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex flex-col items-end text-sm text-neutral-500 dark:text-neutral-400">
              <span className="arabic-ui">
                {toArabicIndic(versesCount)} آية
              </span>
              <span className="text-xs arabic-ui">
                {revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

interface JuzListProps {
  onJuzSelect?: (juzNumber: number) => void
  className?: string
}

/**
 * Display list of all 30 Juz
 */
export function JuzList({ onJuzSelect, className }: JuzListProps) {
  const { goToJuz } = useQuranStore()

  const handleJuzClick = (juzNumber: number) => {
    if (onJuzSelect) {
      onJuzSelect(juzNumber)
    } else {
      goToJuz(juzNumber)
    }
  }

  // Juz names in Arabic (ordinal for 1-10, numeral for rest)
  const juzNames: Record<number, string> = {
    1: 'الجزء الأول',
    2: 'الجزء الثاني',
    3: 'الجزء الثالث',
    4: 'الجزء الرابع',
    5: 'الجزء الخامس',
    6: 'الجزء السادس',
    7: 'الجزء السابع',
    8: 'الجزء الثامن',
    9: 'الجزء التاسع',
    10: 'الجزء العاشر',
  }

  return (
    <div className={cn('grid grid-cols-2 gap-3 p-4 sm:grid-cols-3', className)}>
      {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => (
        <button
          key={juzNumber}
          onClick={() => handleJuzClick(juzNumber)}
          className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-700 dark:hover:bg-primary-900/30"
        >
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {toArabicIndic(juzNumber)}
          </span>
          <span className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 arabic-ui">
            {juzNames[juzNumber] || `الجزء ${toArabicIndic(juzNumber)}`}
          </span>
        </button>
      ))}
    </div>
  )
}
