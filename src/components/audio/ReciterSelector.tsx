import { useEffect } from 'react'
import { Check } from 'lucide-react'
import { useAudioStore } from '@/stores/audio'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { cn } from '@/utils/cn'

interface ReciterSelectorProps {
  selectedId: string
  onSelect: (reciterId: string) => void
  className?: string
}

/**
 * Selector for Quran reciters
 * Reciter list is fetched from API - never hardcoded
 */
export function ReciterSelector({
  selectedId,
  onSelect,
  className,
}: ReciterSelectorProps) {
  const {
    reciters,
    recitersLoading,
    loadReciters,
  } = useAudioStore()

  useEffect(() => {
    if (reciters.length === 0 && !recitersLoading) {
      loadReciters()
    }
  }, [reciters.length, recitersLoading, loadReciters])

  if (recitersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (reciters.length === 0) {
    return (
      <ErrorMessage
        message="تعذر تحميل قائمة القراء"
        onRetry={loadReciters}
      />
    )
  }

  // Group reciters by language/type
  const arabicReciters = reciters.filter((r) =>
    r.identifier.startsWith('ar.')
  )

  return (
    <div className={cn('space-y-2', className)}>
      {arabicReciters.map((reciter) => (
        <button
          key={reciter.identifier}
          onClick={() => onSelect(reciter.identifier)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg border p-3 text-right transition-colors',
            selectedId === reciter.identifier
              ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/30'
              : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
          )}
        >
          {/* Selection indicator */}
          <div
            className={cn(
              'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
              selectedId === reciter.identifier
                ? 'border-primary-500 bg-primary-500'
                : 'border-neutral-300 dark:border-neutral-600'
            )}
          >
            {selectedId === reciter.identifier && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>

          {/* Reciter info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
              {reciter.name}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {reciter.englishName}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

interface ReciterCardProps {
  reciter: {
    identifier: string
    name: string
    englishName: string
  }
  isSelected: boolean
  onSelect: () => void
}

export function ReciterCard({ reciter, isSelected, onSelect }: ReciterCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/30'
          : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
      )}
    >
      {/* Avatar placeholder */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800">
        <span className="text-lg font-semibold text-primary-700 dark:text-primary-200">
          {reciter.name.charAt(0)}
        </span>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
          {reciter.name}
        </p>
      </div>

      {isSelected && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  )
}
