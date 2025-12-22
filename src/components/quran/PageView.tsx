import { useEffect, useState } from 'react'
import type { Ayah } from '@/types'
import { AyahList } from './AyahDisplay'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { useQuranStore } from '@/stores/quran'
import { toArabicIndic, formatPageNumber, formatJuzNumber } from '@/utils/numerals'
import { cn } from '@/utils/cn'

interface PageViewProps {
  pageNumber: number
  hideLevel?: 'none' | 'last-word' | 'half' | 'full'
  onAyahClick?: (ayah: Ayah) => void
  className?: string
}

/**
 * Display a single Quran page with all its Ayahs
 * Text is fetched from API - never hardcoded
 */
export function PageView({
  pageNumber,
  hideLevel = 'none',
  onAyahClick,
  className,
}: PageViewProps) {
  const {
    currentPageAyahs,
    pageLoading,
    pageError,
    currentJuz,
    goToPage,
  } = useQuranStore()

  const [loadedPage, setLoadedPage] = useState<number | null>(null)

  // Load page data when page number changes
  useEffect(() => {
    if (loadedPage !== pageNumber) {
      goToPage(pageNumber)
      setLoadedPage(pageNumber)
    }
  }, [pageNumber, loadedPage, goToPage])

  if (pageLoading) {
    return (
      <div className={cn('flex min-h-[60vh] items-center justify-center', className)}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (pageError) {
    return (
      <div className={cn('flex min-h-[60vh] items-center justify-center', className)}>
        <ErrorMessage
          message={pageError}
          onRetry={() => goToPage(pageNumber)}
        />
      </div>
    )
  }

  // Group ayahs by surah for proper display
  const surahGroups = groupAyahsBySurah(currentPageAyahs)

  return (
    <div className={cn('px-4 py-6 sm:px-6', className)}>
      {/* Page header info */}
      <div className="mb-6 flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
        <span className="arabic-ui">{formatJuzNumber(currentJuz)}</span>
        <span className="arabic-ui">{formatPageNumber(pageNumber)}</span>
      </div>

      {/* Ayahs grouped by Surah */}
      <div className="space-y-8">
        {surahGroups.map((group) => (
          <div key={group.surahNumber}>
            {/* Surah header - only show if surah starts on this page */}
            {group.startsOnPage && group.surahName && (
              <SurahHeader
                surahName={group.surahName}
                surahNumber={group.surahNumber}
              />
            )}

            {/* Ayahs */}
            <AyahList
              ayahs={group.ayahs}
              hideLevel={hideLevel}
              onAyahClick={onAyahClick}
            />
          </div>
        ))}
      </div>

      {/* Page number at bottom */}
      <div className="mt-8 text-center">
        <span className="inline-block rounded-full bg-neutral-100 px-4 py-1 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 arabic-ui">
          {toArabicIndic(pageNumber)}
        </span>
      </div>
    </div>
  )
}

interface SurahGroup {
  surahNumber: number
  surahName: string | null
  startsOnPage: boolean
  ayahs: Ayah[]
}

/**
 * Group ayahs by their Surah for proper display
 */
function groupAyahsBySurah(ayahs: Ayah[]): SurahGroup[] {
  const groups: SurahGroup[] = []
  let currentGroup: SurahGroup | null = null

  for (const ayah of ayahs) {
    const surahNumber = ayah.surah?.number || 0

    if (!currentGroup || currentGroup.surahNumber !== surahNumber) {
      // Check if this is the start of the surah (ayah 1)
      const startsOnPage = ayah.numberInSurah === 1

      currentGroup = {
        surahNumber,
        surahName: ayah.surah?.name || null,
        startsOnPage,
        ayahs: [],
      }
      groups.push(currentGroup)
    }

    currentGroup.ayahs.push(ayah)
  }

  return groups
}

interface SurahHeaderProps {
  surahName: string
  surahNumber: number
}

/**
 * Display Surah header with name (Bismillah is part of text from API)
 */
function SurahHeader({ surahName, surahNumber }: SurahHeaderProps) {
  return (
    <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-4 text-center dark:border-primary-800 dark:bg-primary-900/30">
      <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-200 quran-text">
        {surahName}
      </h2>
      <span className="mt-1 text-sm text-primary-600 dark:text-primary-400 arabic-ui">
        سورة رقم {toArabicIndic(surahNumber)}
      </span>
    </div>
  )
}
