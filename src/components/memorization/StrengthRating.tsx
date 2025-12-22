import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import type { StrengthRating as StrengthRatingType } from '@/types'
import { cn } from '@/utils/cn'

interface StrengthRatingProps {
  value?: StrengthRatingType | null
  onChange: (rating: StrengthRatingType) => void
  className?: string
}

/**
 * Self-assessment strength rating component
 * قوي (strong) / متوسط (medium) / ضعيف (weak)
 */
export function StrengthRating({ value, onChange, className }: StrengthRatingProps) {
  const options: { rating: StrengthRatingType; label: string; icon: typeof CheckCircle2; color: string }[] = [
    {
      rating: 'strong',
      label: 'قوي',
      icon: CheckCircle2,
      color: 'green',
    },
    {
      rating: 'medium',
      label: 'متوسط',
      icon: AlertCircle,
      color: 'yellow',
    },
    {
      rating: 'weak',
      label: 'ضعيف',
      icon: XCircle,
      color: 'red',
    },
  ]

  return (
    <div className={cn('flex gap-3', className)}>
      {options.map((option) => {
        const isSelected = value === option.rating
        const Icon = option.icon

        return (
          <button
            key={option.rating}
            onClick={() => onChange(option.rating)}
            className={cn(
              'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
              isSelected && option.color === 'green' && 'border-green-500 bg-green-50 dark:bg-green-900/30',
              isSelected && option.color === 'yellow' && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30',
              isSelected && option.color === 'red' && 'border-red-500 bg-red-50 dark:bg-red-900/30',
              !isSelected && 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
            )}
          >
            <Icon
              className={cn(
                'h-8 w-8',
                isSelected && option.color === 'green' && 'text-green-500',
                isSelected && option.color === 'yellow' && 'text-yellow-500',
                isSelected && option.color === 'red' && 'text-red-500',
                !isSelected && 'text-neutral-400 dark:text-neutral-500'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium arabic-ui',
                isSelected && option.color === 'green' && 'text-green-700 dark:text-green-300',
                isSelected && option.color === 'yellow' && 'text-yellow-700 dark:text-yellow-300',
                isSelected && option.color === 'red' && 'text-red-700 dark:text-red-300',
                !isSelected && 'text-neutral-600 dark:text-neutral-400'
              )}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

interface StrengthBadgeProps {
  rating: StrengthRatingType
  size?: 'sm' | 'md'
}

/**
 * Display strength rating as a badge
 */
export function StrengthBadge({ rating, size = 'md' }: StrengthBadgeProps) {
  const labels: Record<StrengthRatingType, string> = {
    strong: 'قوي',
    medium: 'متوسط',
    weak: 'ضعيف',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium arabic-ui',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        rating === 'strong' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        rating === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
        rating === 'weak' && 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
      )}
    >
      {labels[rating]}
    </span>
  )
}
