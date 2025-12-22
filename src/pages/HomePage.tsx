import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Book, Image, List, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react'
import { PageHeader } from '@/components/layout/Header'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { PageView } from '@/components/quran/PageView'
import { MushafPageView } from '@/components/quran/MushafPageView'
import { SurahList, JuzList } from '@/components/quran/SurahList'
import { AudioPlayer } from '@/components/audio/AudioPlayer'
import { useQuranStore } from '@/stores/quran'
import { toArabicIndic, formatPageNumber } from '@/utils/numerals'
import { cn } from '@/utils/cn'

type ViewMode = 'mushaf' | 'text' | 'surah-list' | 'juz-list'

export function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('text')
  const {
    currentPage,
    currentJuz,
    viewMode: storeViewMode,
    setViewMode: setStoreViewMode,
    nextPage,
    previousPage,
    isBookmarked,
    toggleBookmark,
    loadSurahs,
  } = useQuranStore()

  const navigate = useNavigate()

  // Load surahs on mount
  useEffect(() => {
    loadSurahs()
  }, [loadSurahs])

  const handleSurahSelect = (surahNumber: number) => {
    setViewMode('text')
  }

  const handleJuzSelect = (juzNumber: number) => {
    setViewMode('text')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* View mode tabs */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
            المصحف الشريف
          </h1>

          {/* Bookmark button (when in reading mode) */}
          {(viewMode === 'text' || viewMode === 'mushaf') && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toggleBookmark(currentPage)}
              aria-label={isBookmarked(currentPage) ? 'إزالة الإشارة المرجعية' : 'إضافة إشارة مرجعية'}
            >
              <Bookmark
                className={cn(
                  'h-5 w-5',
                  isBookmarked(currentPage)
                    ? 'fill-gold-500 text-gold-500'
                    : 'text-neutral-500'
                )}
              />
            </Button>
          )}
        </div>

        {/* View mode tabs */}
        <div className="flex border-t border-neutral-100 dark:border-neutral-800">
          <ViewModeTab
            icon={Book}
            label="نص"
            isActive={viewMode === 'text'}
            onClick={() => setViewMode('text')}
          />
          <ViewModeTab
            icon={Image}
            label="مصحف"
            isActive={viewMode === 'mushaf'}
            onClick={() => setViewMode('mushaf')}
          />
          <ViewModeTab
            icon={List}
            label="سور"
            isActive={viewMode === 'surah-list'}
            onClick={() => setViewMode('surah-list')}
          />
          <ViewModeTab
            icon={List}
            label="أجزاء"
            isActive={viewMode === 'juz-list'}
            onClick={() => setViewMode('juz-list')}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {viewMode === 'text' && (
          <PageView pageNumber={currentPage} />
        )}

        {viewMode === 'mushaf' && (
          <MushafPageView pageNumber={currentPage} juzNumber={currentJuz} />
        )}

        {viewMode === 'surah-list' && (
          <SurahList onSurahSelect={handleSurahSelect} />
        )}

        {viewMode === 'juz-list' && (
          <JuzList onJuzSelect={handleJuzSelect} />
        )}
      </div>

      {/* Page navigation (when in reading mode) */}
      {(viewMode === 'text' || viewMode === 'mushaf') && (
        <PageNavigation
          currentPage={currentPage}
          onPrevious={previousPage}
          onNext={nextPage}
        />
      )}

      {/* Audio player */}
      <AudioPlayer />
    </div>
  )
}

interface ViewModeTabProps {
  icon: typeof Book
  label: string
  isActive: boolean
  onClick: () => void
}

function ViewModeTab({ icon: Icon, label, isActive, onClick }: ViewModeTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 py-2 transition-colors',
        isActive
          ? 'border-b-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
          : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs arabic-ui">{label}</span>
    </button>
  )
}

interface PageNavigationProps {
  currentPage: number
  onPrevious: () => void
  onNext: () => void
}

function PageNavigation({ currentPage, onPrevious, onNext }: PageNavigationProps) {
  return (
    <div className="sticky bottom-16 flex items-center justify-between border-t border-neutral-200 bg-white/95 px-4 py-2 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
      {/* Next page (RTL - appears on left) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={currentPage >= 604}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Current page */}
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 arabic-ui">
        {formatPageNumber(currentPage)}
      </span>

      {/* Previous page (RTL - appears on right) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={currentPage <= 1}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
