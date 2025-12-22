import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useSettingsStore } from '@/stores/settings'
import { toArabicIndic } from '@/utils/numerals'
import { cn } from '@/utils/cn'
import type { DailyGoal } from '@/types'
import {
  BookOpen,
  Target,
  Headphones,
  RefreshCw,
  Calendar,
  ChevronLeft,
  Check,
} from 'lucide-react'

type OnboardingStep = 'welcome' | 'goal' | 'fortresses' | 'ready'

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const { dailyGoal, setDailyGoal, completeOnboarding } = useSettingsStore()
  const navigate = useNavigate()

  const steps: OnboardingStep[] = ['welcome', 'goal', 'fortresses', 'ready']
  const currentIndex = steps.indexOf(currentStep)

  const goNext = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]!)
    }
  }

  const goBack = () => {
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]!)
    }
  }

  const handleComplete = () => {
    completeOnboarding()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* Progress indicator */}
      <div className="flex gap-2 p-4">
        {steps.map((step, index) => (
          <div
            key={step}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              index <= currentIndex
                ? 'bg-primary-600'
                : 'bg-neutral-200 dark:bg-neutral-800'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {currentStep === 'welcome' && <WelcomeStep />}
        {currentStep === 'goal' && (
          <GoalStep value={dailyGoal} onChange={setDailyGoal} />
        )}
        {currentStep === 'fortresses' && <FortressesStep />}
        {currentStep === 'ready' && <ReadyStep />}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 p-6 safe-bottom">
        {currentIndex > 0 && (
          <Button variant="outline" onClick={goBack} className="flex-1 arabic-ui">
            السابق
          </Button>
        )}

        {currentStep === 'ready' ? (
          <Button variant="primary" onClick={handleComplete} className="flex-1 arabic-ui">
            ابدأ الآن
          </Button>
        ) : (
          <Button variant="primary" onClick={goNext} className="flex-1 arabic-ui">
            التالي
            <ChevronLeft className="mr-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
        <BookOpen className="h-12 w-12 text-primary-600 dark:text-primary-400" />
      </div>

      <h1 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100 quran-text">
        حفظ القرآن الكريم
      </h1>

      <p className="mb-6 text-lg text-neutral-600 dark:text-neutral-400 arabic-ui leading-relaxed">
        تطبيق مجاني لمساعدتك على حفظ كتاب الله باستخدام المنهج التقليدي المعتمد في حلقات التحفيظ
      </p>

      <div className="space-y-3 text-right w-full max-w-xs">
        <FeatureItem icon={Target} text="منهج الحصون الخمسة للحفظ المتقن" />
        <FeatureItem icon={RefreshCw} text="نظام المراجعة الثلاثي" />
        <FeatureItem icon={Headphones} text="استماع لكبار القراء" />
      </div>
    </div>
  )
}

interface GoalStepProps {
  value: DailyGoal
  onChange: (goal: DailyGoal) => void
}

function GoalStep({ value, onChange }: GoalStepProps) {
  const goals: { value: DailyGoal; label: string; description: string }[] = [
    { value: 0.25, label: 'ربع صفحة', description: 'مناسب للمبتدئين' },
    { value: 0.5, label: 'نصف صفحة', description: 'الهدف المعتاد' },
    { value: 1, label: 'صفحة كاملة', description: 'للمتقدمين' },
    { value: 2, label: 'صفحتان', description: 'للحفاظ المكثف' },
  ]

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 mx-auto dark:bg-gold-900/30">
          <Target className="h-8 w-8 text-gold-600 dark:text-gold-400" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
          اختر هدفك اليومي
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 arabic-ui">
          كم تريد أن تحفظ كل يوم؟
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <button
            key={goal.value}
            onClick={() => onChange(goal.value)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border-2 p-4 text-right transition-colors',
              value === goal.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
            )}
          >
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 arabic-ui">
                {goal.label}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
                {goal.description}
              </p>
            </div>
            {value === goal.value && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function FortressesStep() {
  const fortresses = [
    {
      icon: Headphones,
      name: 'الحصن الأول',
      title: 'الاستماع والقراءة',
      color: 'blue',
    },
    {
      icon: BookOpen,
      name: 'الحصن الثاني',
      title: 'التحضير',
      color: 'purple',
    },
    {
      icon: Target,
      name: 'الحصن الثالث',
      title: 'الحفظ الجديد',
      color: 'primary',
    },
    {
      icon: RefreshCw,
      name: 'الحصن الرابع',
      title: 'المراجعة القريبة',
      color: 'gold',
    },
    {
      icon: Calendar,
      name: 'الحصن الخامس',
      title: 'المراجعة البعيدة',
      color: 'green',
    },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    gold: 'bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
          الحصون الخمسة
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 arabic-ui">
          خمس طبقات لحماية حفظك
        </p>
      </div>

      <div className="space-y-3">
        {fortresses.map((fortress, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClasses[fortress.color])}>
              <fortress.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
                {fortress.name}
              </p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
                {fortress.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReadyStep() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100 arabic-ui">
        أنت جاهز للبدء!
      </h2>

      <p className="mb-8 text-neutral-600 dark:text-neutral-400 arabic-ui leading-relaxed">
        نسأل الله أن يعينك على حفظ كتابه الكريم وأن يجعله حجة لك لا عليك
      </p>

      <div className="rounded-xl bg-primary-50 p-4 text-right dark:bg-primary-900/30">
        <p className="text-primary-800 dark:text-primary-200 quran-text text-lg leading-loose">
          "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
        </p>
        <p className="mt-2 text-sm text-primary-600 dark:text-primary-400 arabic-ui">
          رواه البخاري
        </p>
      </div>
    </div>
  )
}

interface FeatureItemProps {
  icon: typeof Target
  text: string
}

function FeatureItem({ icon: Icon, text }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
        <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
      <span className="text-neutral-700 dark:text-neutral-300 arabic-ui">{text}</span>
    </div>
  )
}
