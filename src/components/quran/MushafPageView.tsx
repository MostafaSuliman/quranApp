import { useState } from 'react'
import { getMushafPageImageUrl, type MushafStyle } from '@/services/quran-com'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { toArabicIndic, formatPageNumber, formatJuzNumber } from '@/utils/numerals'
import { useSettingsStore } from '@/stores/settings'
import { cn } from '@/utils/cn'

interface MushafPageViewProps {
  pageNumber: number
  juzNumber?: number
  className?: string
}

/**
 * Display an authentic Mushaf page image from trusted API
 * Shows Quran exactly as it appears in the printed Mushaf
 */
export function MushafPageView({
  pageNumber,
  juzNumber,
  className,
}: MushafPageViewProps) {
  const mushafStyle = useSettingsStore((s) => s.mushafStyle)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const imageUrl = getMushafPageImageUrl(pageNumber, mushafStyle)

  const handleImageLoad = () => {
    setLoading(false)
    setError(null)
  }

  const handleImageError = () => {
    setLoading(false)
    setError('تعذر تحميل صورة الصفحة')
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Page header info */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">
        {juzNumber && (
          <span className="arabic-ui">{formatJuzNumber(juzNumber)}</span>
        )}
        <span className="arabic-ui">{formatPageNumber(pageNumber)}</span>
      </div>

      {/* Mushaf page image */}
      <div className="relative flex-1 overflow-hidden bg-white dark:bg-neutral-900">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ErrorMessage
              message={error}
              onRetry={() => {
                setLoading(true)
                setError(null)
              }}
            />
          </div>
        )}

        <img
          src={imageUrl}
          alt={`صفحة ${toArabicIndic(pageNumber)} من المصحف الشريف`}
          className={cn(
            'mx-auto max-h-full w-auto object-contain transition-opacity duration-300',
            loading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Page number at bottom */}
      <div className="py-3 text-center">
        <span className="inline-block rounded-full bg-neutral-100 px-4 py-1 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 arabic-ui">
          {toArabicIndic(pageNumber)}
        </span>
      </div>
    </div>
  )
}

interface MushafStyleSelectorProps {
  value: MushafStyle
  onChange: (style: MushafStyle) => void
}

const mushafStyles: { value: MushafStyle; label: string }[] = [
  { value: 'madani', label: 'مصحف المدينة' },
  { value: 'indopak', label: 'المصحف الهندي' },
  { value: 'tajweed', label: 'مصحف التجويد' },
]

/**
 * Selector for Mushaf style
 */
export function MushafStyleSelector({ value, onChange }: MushafStyleSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {mushafStyles.map((style) => (
        <button
          key={style.value}
          onClick={() => onChange(style.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm transition-colors arabic-ui',
            value === style.value
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
          )}
        >
          {style.label}
        </button>
      ))}
    </div>
  )
}
