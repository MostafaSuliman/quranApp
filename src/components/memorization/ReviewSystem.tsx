import { useMemorizationStore } from '@/stores/memorization'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { LinearProgress } from '@/components/common/ProgressRing'
import { toArabicIndic, formatPageNumber } from '@/utils/numerals'
import { cn } from '@/utils/cn'
import { Book, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react'

/**
 * Three-Tier Review System Component
 * السبق - السبقي - المنزل
 */
export function ReviewSystemOverview() {
  const {
    todayProgress,
    getMemorizedPages,
    getSabqiPages,
    getManzilSchedule,
    getTotalJuzMemorized,
  } = useMemorizationStore()

  const memorizedCount = getMemorizedPages().length
  const sabqiPages = getSabqiPages()
  const manzilSchedule = getManzilSchedule()
  const totalJuz = getTotalJuzMemorized()

  // Get today's Manzil pages
  const todayIndex = new Date().getDay()
  const todayManzil = manzilSchedule.find((d) => d.dayIndex === todayIndex)

  return (
    <div className="space-y-4">
      {/* Sabaq Card - New Memorization */}
      <SabaqCard
        isComplete={todayProgress?.sabaqComplete || false}
      />

      {/* Sabqi Card - Recent Review */}
      <SabqiCard
        pages={sabqiPages}
        isComplete={todayProgress?.sabqiComplete || false}
        reviewedToday={todayProgress?.pagesReviewed || 0}
      />

      {/* Manzil Card - Old Review */}
      <ManzilCard
        todayPages={todayManzil?.pages || []}
        isComplete={todayProgress?.manzilComplete || false}
        cycleDay={todayIndex + 1}
        totalDays={7}
      />
    </div>
  )
}

interface SabaqCardProps {
  isComplete: boolean
}

/**
 * السبق - Today's new memorization portion
 */
function SabaqCard({ isComplete }: SabaqCardProps) {
  const { fortressProgress } = useMemorizationStore()
  const todayProgress = fortressProgress.memorization.todayProgress

  const targetReps = fortressProgress.memorization.targetReps
  const currentReps = todayProgress?.repetitions || 0
  const progress = Math.min(100, (currentReps / targetReps) * 100)

  return (
    <Card className={cn(isComplete && 'border-green-300 dark:border-green-700')}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/50">
          <Book className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <CardTitle className="arabic-ui">السبق</CardTitle>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
            الحفظ الجديد لهذا اليوم
          </p>
        </div>
        {isComplete && (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        )}
      </CardHeader>

      <CardContent>
        {todayProgress ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
                {formatPageNumber(todayProgress.page)}
              </span>
              <span className="font-medium text-primary-600 dark:text-primary-400 arabic-ui">
                {toArabicIndic(currentReps)}/{toArabicIndic(targetReps)} تكرار
              </span>
            </div>
            <LinearProgress progress={progress} color="primary" />
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
            لم تبدأ حفظ اليوم بعد
          </p>
        )}

        {!isComplete && (
          <Button className="mt-4 w-full arabic-ui" variant="primary">
            {todayProgress ? 'متابعة الحفظ' : 'ابدأ الحفظ'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface SabqiCardProps {
  pages: number[]
  isComplete: boolean
  reviewedToday: number
}

/**
 * السبقي - Recent memorization review (last 20 pages)
 */
function SabqiCard({ pages, isComplete, reviewedToday }: SabqiCardProps) {
  const totalPages = pages.length
  const progress = totalPages > 0 ? (reviewedToday / totalPages) * 100 : 0

  return (
    <Card className={cn(isComplete && 'border-green-300 dark:border-green-700')}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 dark:bg-gold-900/50">
          <RefreshCw className="h-5 w-5 text-gold-600 dark:text-gold-400" />
        </div>
        <div className="flex-1">
          <CardTitle className="arabic-ui">السبقي</CardTitle>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
            مراجعة الحفظ الأخير ({toArabicIndic(totalPages)} صفحة)
          </p>
        </div>
        {isComplete && (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        )}
      </CardHeader>

      <CardContent>
        {totalPages > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
                المراجعة اليومية
              </span>
              <span className="font-medium text-gold-600 dark:text-gold-400 arabic-ui">
                {toArabicIndic(reviewedToday)}/{toArabicIndic(totalPages)} صفحة
              </span>
            </div>
            <LinearProgress progress={progress} color="gold" />
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
            لا توجد صفحات للمراجعة حتى الآن
          </p>
        )}

        {!isComplete && totalPages > 0 && (
          <Button className="mt-4 w-full arabic-ui" variant="secondary">
            ابدأ المراجعة
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface ManzilCardProps {
  todayPages: number[]
  isComplete: boolean
  cycleDay: number
  totalDays: number
}

/**
 * المنزل - Old memorization weekly cycle
 */
function ManzilCard({ todayPages, isComplete, cycleDay, totalDays }: ManzilCardProps) {
  const totalPages = todayPages.length

  return (
    <Card className={cn(isComplete && 'border-green-300 dark:border-green-700')}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
          <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <CardTitle className="arabic-ui">المنزل</CardTitle>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
            اليوم {toArabicIndic(cycleDay)} من {toArabicIndic(totalDays)}
          </p>
        </div>
        {isComplete && (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        )}
      </CardHeader>

      <CardContent>
        {totalPages > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
                صفحات اليوم
              </span>
              <span className="font-medium text-purple-600 dark:text-purple-400 arabic-ui">
                {toArabicIndic(totalPages)} صفحة
              </span>
            </div>

            {/* Show page range */}
            {totalPages > 0 && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
                من {formatPageNumber(todayPages[0]!)} إلى{' '}
                {formatPageNumber(todayPages[totalPages - 1]!)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
            لا توجد صفحات للمنزل - أكمل حفظ ٢٠ صفحة أولاً
          </p>
        )}

        {!isComplete && totalPages > 0 && (
          <Button className="mt-4 w-full arabic-ui" variant="outline">
            ابدأ المنزل
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
