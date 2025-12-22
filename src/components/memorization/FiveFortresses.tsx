import { useMemorizationStore } from '@/stores/memorization'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { ProgressRing, LinearProgress } from '@/components/common/ProgressRing'
import { toArabicIndic, formatJuzNumber } from '@/utils/numerals'
import { cn } from '@/utils/cn'
import { Headphones, Eye, Brain, RefreshCw, Calendar, Lock } from 'lucide-react'

interface FortressInfo {
  id: number
  arabicName: string
  englishName: string
  description: string
  icon: typeof Headphones
  color: string
}

const fortresses: FortressInfo[] = [
  {
    id: 1,
    arabicName: 'الحصن الأول',
    englishName: 'القراءة والاستماع',
    description: 'بناء الألفة من خلال الاستماع والقراءة اليومية',
    icon: Headphones,
    color: 'blue',
  },
  {
    id: 2,
    arabicName: 'الحصن الثاني',
    englishName: 'التحضير',
    description: 'تحضير الجزء الجديد قبل الحفظ',
    icon: Eye,
    color: 'purple',
  },
  {
    id: 3,
    arabicName: 'الحصن الثالث',
    englishName: 'الحفظ الجديد',
    description: 'الحفظ النشط مع التكرار العالي',
    icon: Brain,
    color: 'primary',
  },
  {
    id: 4,
    arabicName: 'الحصن الرابع',
    englishName: 'المراجعة القريبة',
    description: 'اختبار ذاتي للصفحات الأخيرة',
    icon: RefreshCw,
    color: 'gold',
  },
  {
    id: 5,
    arabicName: 'الحصن الخامس',
    englishName: 'المراجعة البعيدة',
    description: 'دورة أسبوعية لكل الحفظ السابق',
    icon: Calendar,
    color: 'green',
  },
]

/**
 * Five Fortresses (الحصون الخمسة) Overview Component
 */
export function FiveFortressesOverview() {
  const { fortressProgress } = useMemorizationStore()

  const getFortressProgress = (id: number): number => {
    switch (id) {
      case 1: // Listening
        return fortressProgress.listening.dailyGoalJuz > 0
          ? (fortressProgress.listening.completedToday / fortressProgress.listening.dailyGoalJuz) * 100
          : 0
      case 2: // Preparation
        return fortressProgress.preparation.warmupComplete ? 100 : 0
      case 3: // Memorization
        return fortressProgress.memorization.todayProgress
          ? (fortressProgress.memorization.todayProgress.repetitions / fortressProgress.memorization.targetReps) * 100
          : 0
      case 4: // Recent Review
        return fortressProgress.recentReview.last20Pages.length > 0
          ? (fortressProgress.recentReview.reviewedToday.length / Math.min(5, fortressProgress.recentReview.last20Pages.length)) * 100
          : 0
      case 5: // Old Review
        return fortressProgress.oldReview.todayComplete ? 100 : 0
      default:
        return 0
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
        الحصون الخمسة
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 arabic-ui">
        خمس طبقات لحماية الحفظ - منهج الدكتور سعيد أبو العلا حمزة
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fortresses.map((fortress) => (
          <FortressCard
            key={fortress.id}
            fortress={fortress}
            progress={getFortressProgress(fortress.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface FortressCardProps {
  fortress: FortressInfo
  progress: number
}

function FortressCard({ fortress, progress }: FortressCardProps) {
  const Icon = fortress.icon
  const isComplete = progress >= 100

  const colorClasses: Record<string, { bg: string; text: string; ring: string }> = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      ring: 'text-blue-500',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      ring: 'text-purple-500',
    },
    primary: {
      bg: 'bg-primary-100 dark:bg-primary-900/30',
      text: 'text-primary-600 dark:text-primary-400',
      ring: 'text-primary-500',
    },
    gold: {
      bg: 'bg-gold-100 dark:bg-gold-900/30',
      text: 'text-gold-600 dark:text-gold-400',
      ring: 'text-gold-500',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      ring: 'text-green-500',
    },
  }

  const colors = colorClasses[fortress.color] ?? {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'text-primary-500',
  }

  return (
    <Card className={cn(isComplete && 'border-green-300 dark:border-green-700')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colors.bg)}>
            <Icon className={cn('h-5 w-5', colors.text)} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 arabic-ui">
              {fortress.arabicName}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
              {fortress.englishName}
            </p>
          </div>

          <ProgressRing
            progress={progress}
            size={48}
            strokeWidth={4}
            showPercentage={false}
            color={isComplete ? 'success' : 'primary'}
          />
        </div>

        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 arabic-ui">
          {fortress.description}
        </p>

        <LinearProgress
          progress={progress}
          height="sm"
          className="mt-3"
          color={isComplete ? 'success' : 'primary'}
        />
      </CardContent>
    </Card>
  )
}

/**
 * Detailed Fortress Progress for each fortress type
 */
export function FortressListeningProgress() {
  const { fortressProgress } = useMemorizationStore()
  const { listening } = fortressProgress

  return (
    <Card>
      <CardHeader>
        <CardTitle className="arabic-ui">الحصن الأول - القراءة والاستماع</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
            الهدف اليومي
          </span>
          <span className="font-medium arabic-ui">
            {formatJuzNumber(listening.dailyGoalJuz)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
            المكتمل اليوم
          </span>
          <span className="font-medium arabic-ui">
            {toArabicIndic(listening.completedToday)} جزء
          </span>
        </div>

        <LinearProgress
          progress={(listening.completedToday / listening.dailyGoalJuz) * 100}
          showLabel
        />
      </CardContent>
    </Card>
  )
}

export function FortressPreparationProgress() {
  const { fortressProgress } = useMemorizationStore()
  const { preparation } = fortressProgress

  return (
    <Card>
      <CardHeader>
        <CardTitle className="arabic-ui">الحصن الثاني - التحضير</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
            صفحات الأسبوع
          </span>
          <span className="font-medium arabic-ui">
            {toArabicIndic(preparation.weeklyPages.length)} صفحة
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
            التسخين (١٥ تكرار سريع)
          </span>
          <span className={cn(
            'font-medium arabic-ui',
            preparation.warmupComplete ? 'text-green-600' : 'text-neutral-400'
          )}>
            {preparation.warmupComplete ? 'مكتمل' : 'غير مكتمل'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
