import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { ReviewSystemOverview } from '@/components/memorization/ReviewSystem'
import { FiveFortressesOverview } from '@/components/memorization/FiveFortresses'
import { RepetitionCounter } from '@/components/memorization/RepetitionCounter'
import { StrengthRating } from '@/components/memorization/StrengthRating'
import { PageView } from '@/components/quran/PageView'
import { ProgressRing } from '@/components/common/ProgressRing'
import { useMemorizationStore } from '@/stores/memorization'
import { useSettingsStore } from '@/stores/settings'
import { toArabicIndic, formatPageNumber } from '@/utils/numerals'
import { cn } from '@/utils/cn'
import type { StrengthRating as StrengthRatingType, SessionType } from '@/types'
import { Play, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react'

type MemorizeTab = 'overview' | 'session'

export function MemorizePage() {
  const [activeTab, setActiveTab] = useState<MemorizeTab>('overview')
  const [sessionMode, setSessionMode] = useState<SessionType | null>(null)

  const {
    loadProgress,
    loadStats,
    todayProgress,
    getMemorizedPages,
    getSabqiPages,
    getTotalJuzMemorized,
  } = useMemorizationStore()

  useEffect(() => {
    loadProgress()
    loadStats()
  }, [loadProgress, loadStats])

  const memorizedPages = getMemorizedPages().length
  const sabqiPages = getSabqiPages()
  const totalJuz = getTotalJuzMemorized()

  const startSession = (type: SessionType) => {
    setSessionMode(type)
    setActiveTab('session')
  }

  if (activeTab === 'session' && sessionMode) {
    return (
      <MemorizationSession
        sessionType={sessionMode}
        onComplete={() => {
          setSessionMode(null)
          setActiveTab('overview')
        }}
        onBack={() => {
          setSessionMode(null)
          setActiveTab('overview')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="الحفظ والمراجعة"
        description="تطبيق منهج الحصون الخمسة للحفظ المتقن"
      />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 px-4 pb-6">
        <StatCard
          value={toArabicIndic(memorizedPages)}
          label="صفحة محفوظة"
        />
        <StatCard
          value={toArabicIndic(totalJuz)}
          label="جزء"
        />
        <StatCard
          value={toArabicIndic(todayProgress?.totalRepetitions || 0)}
          label="تكرار اليوم"
        />
      </div>

      {/* Daily Tasks */}
      <div className="px-4 pb-6">
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
          مهام اليوم
        </h2>
        <ReviewSystemOverview />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6">
        <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            title="حفظ جديد"
            description="ابدأ حفظ صفحة جديدة"
            color="primary"
            onClick={() => startSession('memorization')}
          />
          <ActionCard
            title="مراجعة السبقي"
            description={`${toArabicIndic(sabqiPages.length)} صفحة`}
            color="gold"
            onClick={() => startSession('recent_review')}
          />
          <ActionCard
            title="اختبار ذاتي"
            description="اختبر حفظك"
            color="purple"
            onClick={() => startSession('recent_review')}
          />
          <ActionCard
            title="استماع"
            description="استمع للتلاوة"
            color="blue"
            onClick={() => startSession('listening')}
          />
        </div>
      </div>

      {/* Five Fortresses Overview */}
      <div className="px-4 pb-6">
        <FiveFortressesOverview />
      </div>
    </div>
  )
}

interface StatCardProps {
  value: string
  label: string
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="rounded-xl bg-primary-50 p-3 text-center dark:bg-primary-900/30">
      <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
        {value}
      </div>
      <div className="text-xs text-primary-600 dark:text-primary-400 arabic-ui">
        {label}
      </div>
    </div>
  )
}

interface ActionCardProps {
  title: string
  description: string
  color: 'primary' | 'gold' | 'purple' | 'blue'
  onClick: () => void
}

const colorClasses = {
  primary: 'bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50',
  gold: 'bg-gold-100 dark:bg-gold-900/30 hover:bg-gold-200 dark:hover:bg-gold-900/50',
  purple: 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50',
  blue: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50',
}

function ActionCard({ title, description, color, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-xl p-4 text-right transition-colors',
        colorClasses[color]
      )}
    >
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 arabic-ui">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 arabic-ui">
        {description}
      </p>
    </button>
  )
}

interface MemorizationSessionProps {
  sessionType: SessionType
  onComplete: () => void
  onBack: () => void
}

function MemorizationSession({ sessionType, onComplete, onBack }: MemorizationSessionProps) {
  const [currentRepetitions, setCurrentRepetitions] = useState(0)
  const [hideLevel, setHideLevel] = useState<'none' | 'last-word' | 'half' | 'full'>('none')
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState<StrengthRatingType | null>(null)

  const {
    startSession,
    endSession,
    incrementRepetition,
    currentPage,
    fortressProgress,
    getInProgressPages,
    getSabqiPages,
  } = useMemorizationStore()

  const targetRepetitions = useSettingsStore((s) => s.targetRepetitions)

  // Get the page to work on
  const sessionPage = sessionType === 'memorization'
    ? (getInProgressPages()[0] || 1)
    : (getSabqiPages()[0] || 1)

  // Update hide level based on repetitions
  useEffect(() => {
    if (currentRepetitions >= 50) {
      setHideLevel('full')
    } else if (currentRepetitions >= 35) {
      setHideLevel('half')
    } else if (currentRepetitions >= 20) {
      setHideLevel('last-word')
    } else {
      setHideLevel('none')
    }
  }, [currentRepetitions])

  const handleIncrement = () => {
    setCurrentRepetitions((c) => c + 1)
    incrementRepetition()
  }

  const handleComplete = () => {
    if (sessionType === 'recent_review' || sessionType === 'old_review') {
      setShowRating(true)
    } else {
      onComplete()
    }
  }

  const handleRatingSubmit = (selectedRating: StrengthRatingType) => {
    setRating(selectedRating)
    onComplete()
  }

  const sessionTitles: Record<SessionType, string> = {
    listening: 'الاستماع',
    preparation: 'التحضير',
    memorization: 'الحفظ الجديد',
    recent_review: 'مراجعة السبقي',
    old_review: 'مراجعة المنزل',
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon-sm" onClick={onBack}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold arabic-ui">
              {sessionTitles[sessionType]}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
              {formatPageNumber(sessionPage)}
            </p>
          </div>

          {/* Hide/Show toggle */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setHideLevel(hideLevel === 'full' ? 'none' : 'full')}
          >
            {hideLevel === 'full' ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center arabic-ui">
                قيّم حفظك لهذه الصفحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StrengthRating
                value={rating}
                onChange={handleRatingSubmit}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Page content */}
      <PageView
        pageNumber={sessionPage}
        hideLevel={hideLevel}
        className="flex-1"
      />

      {/* Repetition counter (for memorization) */}
      {sessionType === 'memorization' && (
        <div className="fixed bottom-20 left-0 right-0 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
          <RepetitionCounter
            current={currentRepetitions}
            target={targetRepetitions}
            onIncrement={handleIncrement}
            onDecrement={() => setCurrentRepetitions((c) => Math.max(0, c - 1))}
            onReset={() => setCurrentRepetitions(0)}
          />

          {currentRepetitions >= targetRepetitions && (
            <Button
              className="mt-4 w-full arabic-ui"
              variant="primary"
              onClick={handleComplete}
            >
              <CheckCircle2 className="ml-2 h-5 w-5" />
              إتمام الحفظ
            </Button>
          )}
        </div>
      )}

      {/* Complete button (for review) */}
      {(sessionType === 'recent_review' || sessionType === 'old_review') && (
        <div className="fixed bottom-20 left-0 right-0 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
          <Button
            className="w-full arabic-ui"
            variant="primary"
            onClick={handleComplete}
          >
            إتمام المراجعة
          </Button>
        </div>
      )}
    </div>
  )
}
