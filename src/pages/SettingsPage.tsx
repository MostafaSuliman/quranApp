import { PageHeader } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useSettingsStore } from '@/stores/settings'
import { MushafStyleSelector } from '@/components/quran/MushafPageView'
import { toArabicIndic } from '@/utils/numerals'
import { cn } from '@/utils/cn'
import {
  Sun,
  Moon,
  Monitor,
  Type,
  Volume2,
  Target,
  Bell,
  Globe,
  Info,
  ChevronLeft,
} from 'lucide-react'
import type { DailyGoal } from '@/types'

export function SettingsPage() {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    mushafStyle,
    setMushafStyle,
    dailyGoal,
    setDailyGoal,
    targetRepetitions,
    setTargetRepetitions,
    notificationsEnabled,
    setNotificationsEnabled,
    uiLanguage,
    setUiLanguage,
  } = useSettingsStore()

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="الإعدادات" />

      {/* Display Settings */}
      <div className="px-4 pb-6">
        <Card>
          <CardHeader>
            <CardTitle className="arabic-ui">العرض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <SettingRow
              icon={theme === 'dark' ? Moon : Sun}
              label="المظهر"
              value={theme === 'dark' ? 'داكن' : theme === 'light' ? 'فاتح' : 'تلقائي'}
            >
              <ThemeSelector value={theme} onChange={setTheme} />
            </SettingRow>

            {/* Font Size */}
            <SettingRow
              icon={Type}
              label="حجم الخط"
              value={fontSizeLabels[fontSize] || 'متوسط'}
            >
              <FontSizeSelector value={fontSize} onChange={setFontSize} />
            </SettingRow>

            {/* Mushaf Style */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Globe className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
                  نوع المصحف
                </span>
              </div>
              <MushafStyleSelector value={mushafStyle} onChange={setMushafStyle} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memorization Settings */}
      <div className="px-4 pb-6">
        <Card>
          <CardHeader>
            <CardTitle className="arabic-ui">الحفظ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily Goal */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
                  الهدف اليومي
                </span>
              </div>
              <DailyGoalSelector value={dailyGoal} onChange={setDailyGoal} />
            </div>

            {/* Target Repetitions */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 dark:bg-gold-900/30">
                    <Volume2 className="h-5 w-5 text-gold-600 dark:text-gold-400" />
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
                    عدد التكرارات المستهدف
                  </span>
                </div>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {toArabicIndic(targetRepetitions)}
                </span>
              </div>
              <RepetitionSlider value={targetRepetitions} onChange={setTargetRepetitions} />
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 arabic-ui">
                الموصى به: ٣٥-٥٠ تكرار لكل آية
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <div className="px-4 pb-6">
        <Card>
          <CardHeader>
            <CardTitle className="arabic-ui">الإشعارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
                  تفعيل الإشعارات
                </span>
              </div>
              <Toggle
                checked={notificationsEnabled}
                onChange={setNotificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <div className="px-4 pb-6">
        <Card>
          <CardHeader>
            <CardTitle className="arabic-ui">حول التطبيق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-600 dark:text-neutral-400 arabic-ui">
                الإصدار
              </span>
              <span className="font-medium arabic-ui">١.٠.٠</span>
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
              تطبيق حفظ القرآن الكريم - مجاني وبدون إعلانات
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 arabic-ui">
              يستخدم منهج الحصون الخمسة للدكتور سعيد أبو العلا حمزة
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface SettingRowProps {
  icon: typeof Sun
  label: string
  value: string
  children: React.ReactNode
}

function SettingRow({ icon: Icon, label, value, children }: SettingRowProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </div>
          <span className="font-medium text-neutral-900 dark:text-neutral-100 arabic-ui">
            {label}
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}

interface ThemeSelectorProps {
  value: 'light' | 'dark' | 'system'
  onChange: (theme: 'light' | 'dark' | 'system') => void
}

function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const options: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'فاتح' },
    { value: 'dark', icon: Moon, label: 'داكن' },
    { value: 'system', icon: Monitor, label: 'تلقائي' },
  ]

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-lg p-3 transition-colors',
            value === option.value
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          )}
        >
          <option.icon className="h-5 w-5" />
          <span className="text-xs arabic-ui">{option.label}</span>
        </button>
      ))}
    </div>
  )
}

const fontSizeLabels: Record<string, string> = {
  small: 'صغير',
  medium: 'متوسط',
  large: 'كبير',
  xlarge: 'كبير جداً',
}

interface FontSizeSelectorProps {
  value: 'small' | 'medium' | 'large' | 'xlarge'
  onChange: (size: 'small' | 'medium' | 'large' | 'xlarge') => void
}

function FontSizeSelector({ value, onChange }: FontSizeSelectorProps) {
  const sizes: ('small' | 'medium' | 'large' | 'xlarge')[] = ['small', 'medium', 'large', 'xlarge']

  return (
    <div className="flex gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm transition-colors arabic-ui',
            value === size
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          )}
        >
          {fontSizeLabels[size]}
        </button>
      ))}
    </div>
  )
}

const dailyGoalLabels: Record<DailyGoal, string> = {
  0.25: 'ربع صفحة',
  0.5: 'نصف صفحة',
  1: 'صفحة كاملة',
  2: 'صفحتان',
}

interface DailyGoalSelectorProps {
  value: DailyGoal
  onChange: (goal: DailyGoal) => void
}

function DailyGoalSelector({ value, onChange }: DailyGoalSelectorProps) {
  const goals: DailyGoal[] = [0.25, 0.5, 1, 2]

  return (
    <div className="flex gap-2">
      {goals.map((goal) => (
        <button
          key={goal}
          onClick={() => onChange(goal)}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm transition-colors arabic-ui',
            value === goal
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          )}
        >
          {dailyGoalLabels[goal]}
        </button>
      ))}
    </div>
  )
}

interface RepetitionSliderProps {
  value: number
  onChange: (value: number) => void
}

function RepetitionSlider({ value, onChange }: RepetitionSliderProps) {
  return (
    <input
      type="range"
      min={20}
      max={60}
      step={5}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full accent-primary-600"
    />
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        checked ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
          checked ? 'right-0.5' : 'right-5'
        )}
      />
    </button>
  )
}
