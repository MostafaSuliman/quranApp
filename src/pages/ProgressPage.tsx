import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { ProgressRing, LinearProgress } from '@/components/common/ProgressRing'
import { useMemorizationStore } from '@/stores/memorization'
import { toArabicIndic, formatPercentage } from '@/utils/numerals'
import { cn } from '@/utils/cn'
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  BookOpen,
  Clock,
  Flame,
} from 'lucide-react'

const TOTAL_PAGES = 604
const TOTAL_JUZ = 30

export function ProgressPage() {
  const {
    loadProgress,
    loadStats,
    stats,
    todayProgress,
    getMemorizedPages,
    getInProgressPages,
    getWeakPages,
    getTotalJuzMemorized,
  } = useMemorizationStore()

  useEffect(() => {
    loadProgress()
    loadStats()
  }, [loadProgress, loadStats])

  const memorizedPages = getMemorizedPages()
  const inProgressPages = getInProgressPages()
  const weakPages = getWeakPages()
  const totalJuz = getTotalJuzMemorized()

  const memorizedPercentage = (memorizedPages.length / TOTAL_PAGES) * 100
  const juzPercentage = (totalJuz / TOTAL_JUZ) * 100

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="التقدم والإحصائيات"
        description="تتبع رحلتك في حفظ القرآن الكريم"
      />

      {/* Main progress rings */}
      <div className="flex justify-center gap-8 px-4 pb-8">
        <div className="text-center">
          <ProgressRing
            progress={memorizedPercentage}
            size={100}
            strokeWidth={8}
            color="primary"
            label="صفحات"
          />
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 arabic-ui">
            {toArabicIndic(memorizedPages.length)}/{toArabicIndic(TOTAL_PAGES)}
          </p>
        </div>

        <div className="text-center">
          <ProgressRing
            progress={juzPercentage}
            size={100}
            strokeWidth={8}
            color="gold"
            label="أجزاء"
          />
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 arabic-ui">
            {toArabicIndic(totalJuz)}/{toArabicIndic(TOTAL_JUZ)}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        <StatCard
          icon={Flame}
          label="أيام متتالية"
          value={toArabicIndic(stats?.currentStreak || 0)}
          color="orange"
        />
        <StatCard
          icon={Award}
          label="أطول سلسلة"
          value={toArabicIndic(stats?.longestStreak || 0)}
          color="purple"
        />
        <StatCard
          icon={Target}
          label="إجمالي التكرار"
          value={toArabicIndic(stats?.totalRepetitions || 0)}
          color="blue"
        />
        <StatCard
          icon={Calendar}
          label="جلسات المراجعة"
          value={toArabicIndic(stats?.totalReviewSessions || 0)}
          color="green"
        />
      </div>

      {/* Today's progress */}
      <div className="px-4 pb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 arabic-ui">
              <Clock className="h-5 w-5 text-primary-600" />
              تقدم اليوم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressItem
              label="السبق (الحفظ الجديد)"
              isComplete={todayProgress?.sabaqComplete || false}
            />
            <ProgressItem
              label="السبقي (المراجعة القريبة)"
              isComplete={todayProgress?.sabqiComplete || false}
            />
            <ProgressItem
              label="المنزل (المراجعة البعيدة)"
              isComplete={todayProgress?.manzilComplete || false}
            />

            <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
                  تكرارات اليوم
                </span>
                <span className="font-medium arabic-ui">
                  {toArabicIndic(todayProgress?.totalRepetitions || 0)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
                  صفحات مراجعة
                </span>
                <span className="font-medium arabic-ui">
                  {toArabicIndic(todayProgress?.pagesReviewed || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page status breakdown */}
      <div className="px-4 pb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 arabic-ui">
              <BookOpen className="h-5 w-5 text-primary-600" />
              حالة الصفحات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow
              label="محفوظة"
              count={memorizedPages.length}
              total={TOTAL_PAGES}
              color="green"
            />
            <StatusRow
              label="قيد الحفظ"
              count={inProgressPages.length}
              total={TOTAL_PAGES}
              color="yellow"
            />
            <StatusRow
              label="تحتاج تقوية"
              count={weakPages.length}
              total={memorizedPages.length || 1}
              color="red"
            />
            <StatusRow
              label="لم تبدأ"
              count={TOTAL_PAGES - memorizedPages.length - inProgressPages.length}
              total={TOTAL_PAGES}
              color="gray"
            />
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      {stats && stats.milestones.length > 0 && (
        <div className="px-4 pb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 arabic-ui">
                <Award className="h-5 w-5 text-gold-500" />
                الإنجازات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.milestones.slice(-5).map((milestone, index) => (
                  <MilestoneItem key={index} milestone={milestone} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: typeof Flame
  label: string
  value: string
  color: 'orange' | 'purple' | 'blue' | 'green'
}

const statColorClasses = {
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className={cn('mb-2 inline-flex rounded-lg p-2', statColorClasses[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </div>
      <div className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
        {label}
      </div>
    </div>
  )
}

interface ProgressItemProps {
  label: string
  isComplete: boolean
}

function ProgressItem({ label, isComplete }: ProgressItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
        {label}
      </span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium arabic-ui',
          isComplete
            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
        )}
      >
        {isComplete ? 'مكتمل' : 'غير مكتمل'}
      </span>
    </div>
  )
}

interface StatusRowProps {
  label: string
  count: number
  total: number
  color: 'green' | 'yellow' | 'red' | 'gray'
}

const statusColorClasses = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  gray: 'bg-neutral-300 dark:bg-neutral-600',
}

function StatusRow({ label, count, total, color }: StatusRowProps) {
  const percentage = (count / total) * 100

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
          {label}
        </span>
        <span className="font-medium arabic-ui">
          {toArabicIndic(count)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className={cn('h-full rounded-full transition-all', statusColorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface MilestoneItemProps {
  milestone: {
    type: 'juz' | 'surah' | 'streak' | 'pages'
    value: number
    achievedAt: string
  }
}

function MilestoneItem({ milestone }: MilestoneItemProps) {
  const labels: Record<string, string> = {
    juz: 'إتمام جزء',
    surah: 'إتمام سورة',
    streak: 'سلسلة أيام',
    pages: 'صفحات محفوظة',
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 dark:bg-gold-900/30">
        <Award className="h-5 w-5 text-gold-600 dark:text-gold-400" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
          {labels[milestone.type]} {toArabicIndic(milestone.value)}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {new Date(milestone.achievedAt).toLocaleDateString('ar-SA')}
        </p>
      </div>
    </div>
  )
}
