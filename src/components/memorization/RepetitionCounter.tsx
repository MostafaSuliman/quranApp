import { useState } from 'react'
import { Plus, Minus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ProgressRing } from '@/components/common/ProgressRing'
import { toArabicIndic } from '@/utils/numerals'
import { cn } from '@/utils/cn'

interface RepetitionCounterProps {
  current: number
  target: number
  onIncrement: () => void
  onDecrement: () => void
  onReset: () => void
  className?: string
}

/**
 * Counter for tracking repetitions during memorization
 * Targets: 35-50 repetitions per verse
 */
export function RepetitionCounter({
  current,
  target,
  onIncrement,
  onDecrement,
  onReset,
  className,
}: RepetitionCounterProps) {
  const progress = Math.min(100, (current / target) * 100)
  const isComplete = current >= target

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Progress Ring */}
      <ProgressRing
        progress={progress}
        size={120}
        strokeWidth={8}
        color={isComplete ? 'success' : 'primary'}
        showPercentage={false}
      />

      {/* Count Display */}
      <div className="text-center">
        <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          {toArabicIndic(current)}
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
          من {toArabicIndic(target)} تكرار
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={onDecrement}
          disabled={current === 0}
          aria-label="تقليل"
        >
          <Minus className="h-5 w-5" />
        </Button>

        <Button
          variant="primary"
          size="icon-lg"
          onClick={onIncrement}
          className="rounded-full h-16 w-16"
          aria-label="زيادة"
        >
          <Plus className="h-8 w-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          disabled={current === 0}
          aria-label="إعادة تعيين"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Milestone indicators */}
      <RepetitionMilestones current={current} />
    </div>
  )
}

interface RepetitionMilestonesProps {
  current: number
}

/**
 * Visual milestones for repetition progress
 */
function RepetitionMilestones({ current }: RepetitionMilestonesProps) {
  const milestones = [
    { count: 20, label: 'إخفاء آخر كلمة', action: 'last-word' },
    { count: 35, label: 'إخفاء النصف', action: 'half' },
    { count: 50, label: 'اختبار كامل', action: 'full' },
  ]

  return (
    <div className="flex items-center gap-2">
      {milestones.map((milestone, index) => (
        <div
          key={milestone.count}
          className={cn(
            'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-center transition-colors',
            current >= milestone.count
              ? 'bg-primary-100 dark:bg-primary-900/50'
              : 'bg-neutral-100 dark:bg-neutral-800'
          )}
        >
          <span
            className={cn(
              'text-lg font-bold',
              current >= milestone.count
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-400 dark:text-neutral-500'
            )}
          >
            {toArabicIndic(milestone.count)}
          </span>
          <span
            className={cn(
              'text-xs arabic-ui',
              current >= milestone.count
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-400 dark:text-neutral-500'
            )}
          >
            {milestone.label}
          </span>
        </div>
      ))}
    </div>
  )
}

interface SimpleCounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  className?: string
}

/**
 * Simple counter input
 */
export function SimpleCounter({
  value,
  onChange,
  min = 0,
  max = 100,
  label,
  className,
}: SimpleCounterProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && (
        <span className="text-sm text-neutral-600 dark:text-neutral-400 arabic-ui">
          {label}
        </span>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="w-12 text-center text-lg font-semibold">
          {toArabicIndic(value)}
        </span>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
