import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DailyGoal, SessionTime } from '@/types'
import type { MushafStyle } from '@/services/quran-com'

interface SettingsState {
  // Display settings
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  mushafStyle: MushafStyle
  showTranslation: boolean
  translationId: number | null

  // Audio settings
  selectedReciterId: string
  playbackSpeed: number
  defaultRepeatCount: number
  autoPlayNext: boolean

  // Memorization settings
  dailyGoal: DailyGoal
  preferredSessionTimes: SessionTime[]
  targetRepetitions: number // 35-50 recommended
  enableSpacedRepetition: boolean

  // Notification settings
  notificationsEnabled: boolean
  reminderTime: string | null // HH:mm format
  streakReminders: boolean

  // Onboarding
  onboardingComplete: boolean
  showTutorialTips: boolean

  // Language
  uiLanguage: 'ar' | 'en'
}

interface SettingsActions {
  // Display actions
  setTheme: (theme: SettingsState['theme']) => void
  setFontSize: (size: SettingsState['fontSize']) => void
  setMushafStyle: (style: MushafStyle) => void
  setShowTranslation: (show: boolean) => void
  setTranslationId: (id: number | null) => void

  // Audio actions
  setSelectedReciterId: (id: string) => void
  setPlaybackSpeed: (speed: number) => void
  setDefaultRepeatCount: (count: number) => void
  setAutoPlayNext: (enabled: boolean) => void

  // Memorization actions
  setDailyGoal: (goal: DailyGoal) => void
  setPreferredSessionTimes: (times: SessionTime[]) => void
  setTargetRepetitions: (count: number) => void
  setEnableSpacedRepetition: (enabled: boolean) => void

  // Notification actions
  setNotificationsEnabled: (enabled: boolean) => void
  setReminderTime: (time: string | null) => void
  setStreakReminders: (enabled: boolean) => void

  // Onboarding actions
  completeOnboarding: () => void
  setShowTutorialTips: (show: boolean) => void

  // Language
  setUiLanguage: (lang: 'ar' | 'en') => void

  // Reset
  resetSettings: () => void
}

const initialState: SettingsState = {
  // Display defaults
  theme: 'system',
  fontSize: 'medium',
  mushafStyle: 'madani',
  showTranslation: false,
  translationId: null,

  // Audio defaults
  selectedReciterId: 'ar.alafasy', // Default to Mishary Rashid Alafasy
  playbackSpeed: 1,
  defaultRepeatCount: 3,
  autoPlayNext: true,

  // Memorization defaults
  dailyGoal: 0.5, // نصف صفحة
  preferredSessionTimes: ['morning', 'afternoon', 'evening'],
  targetRepetitions: 40, // Middle of 35-50 range
  enableSpacedRepetition: true,

  // Notification defaults
  notificationsEnabled: true,
  reminderTime: '06:00',
  streakReminders: true,

  // Onboarding defaults
  onboardingComplete: false,
  showTutorialTips: true,

  // Language
  uiLanguage: 'ar',
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialState,

      // Display actions
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setMushafStyle: (mushafStyle) => set({ mushafStyle }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setTranslationId: (translationId) => set({ translationId }),

      // Audio actions
      setSelectedReciterId: (selectedReciterId) => set({ selectedReciterId }),
      setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
      setDefaultRepeatCount: (defaultRepeatCount) => set({ defaultRepeatCount }),
      setAutoPlayNext: (autoPlayNext) => set({ autoPlayNext }),

      // Memorization actions
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setPreferredSessionTimes: (preferredSessionTimes) => set({ preferredSessionTimes }),
      setTargetRepetitions: (targetRepetitions) => set({ targetRepetitions }),
      setEnableSpacedRepetition: (enableSpacedRepetition) => set({ enableSpacedRepetition }),

      // Notification actions
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setStreakReminders: (streakReminders) => set({ streakReminders }),

      // Onboarding actions
      completeOnboarding: () => set({ onboardingComplete: true }),
      setShowTutorialTips: (showTutorialTips) => set({ showTutorialTips }),

      // Language
      setUiLanguage: (uiLanguage) => set({ uiLanguage }),

      // Reset
      resetSettings: () => set(initialState),
    }),
    {
      name: 'quran-app-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Selectors for common use cases
export const useTheme = () => useSettingsStore((state) => state.theme)
export const useFontSize = () => useSettingsStore((state) => state.fontSize)
export const useSelectedReciterId = () => useSettingsStore((state) => state.selectedReciterId)
export const useDailyGoal = () => useSettingsStore((state) => state.dailyGoal)
export const useOnboardingComplete = () => useSettingsStore((state) => state.onboardingComplete)
