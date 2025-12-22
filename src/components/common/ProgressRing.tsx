import { cn } from '@/utils/cn'
import { toArabicIndic } from '@/utils/numerals'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  showPercentage?: boolean
  className?: string
  color?: 'primary' | 'gold' | 'success'
  label?: string
}

const colorClasses = {
  primary: 'text-primary-600 dark:text-primary-400',
  gold: 'text-gold-500 dark:text-gold-400',
  success: 'text-green-600 dark:text-green-400',
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  showPercentage = true,
  className,
  color = 'primary',
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        className="progress-ring"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-neutral-200 dark:text-neutral-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn('progress-ring-circle', colorClasses[color])}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-lg font-bold', colorClasses[color])}>
            {toArabicIndic(Math.round(progress))}٪
          </span>
          {label && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 arabic-ui">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface LinearProgressProps {
  progress: number // 0-100
  className?: string
  color?: 'primary' | 'gold' | 'success'
  showLabel?: boolean
  height?: 'sm' | 'md' | 'lg'
}

const heightClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const bgColorClasses = {
  primary: 'bg-primary-600 dark:bg-primary-400',
  gold: 'bg-gold-500 dark:bg-gold-400',
  success: 'bg-green-600 dark:bg-green-400',
}

export function LinearProgress({
  progress,
  className,
  color = 'primary',
  showLabel = false,
  height = 'md',
}: LinearProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
            التقدم
          </span>
          <span className={cn('font-medium', colorClasses[color])}>
            {toArabicIndic(Math.round(progress))}٪
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700',
          heightClasses[height]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            bgColorClasses[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
