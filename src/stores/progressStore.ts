import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  UserProgress,
  Badge,
  DailyStats,
  WeeklyStats,
  Achievement,
  ActivityDay
} from '../types/quran'
import { queueProgressSync } from '../services/syncClient'

const safeQueueProgressSync = (payload: Record<string, unknown>) => {
  try {
    queueProgressSync(payload)
  } catch (error) {
    if (import.meta?.env?.DEV) {
      console.debug('Progress sync skipped:', error)
    }
  }
}

interface ProgressState extends UserProgress {
  // Additional UI state
  isLoading: boolean
  error: string | null
  
  // Computed properties
  todaysStats: DailyStats | null
  weeklyStats: WeeklyStats | null
  monthlyStats: WeeklyStats | null
  studyHistory: StudyHistory
  availableBadges: Badge[]
  achievements: Achievement[]
  
  // Actions
  initialize: () => Promise<void>
  updateProgress: (ayahNumbers: number[]) => void
  incrementStreak: () => void
  resetStreak: () => void
  updateStreak: () => void
  addXP: (amount: number) => void
  addReadingTime: (minutes: number) => void
  completeLesson: (lessonId: string, xpReward: number) => void
  unlockBadge: (badgeId: string) => void
  updateDailyGoal: (goal: number) => void
  recordStudySession: (ayahsStudied: number, timeSpent: number) => void
  resetProgress: () => void
  
  // Stats and analytics
  getTodaysStats: () => DailyStats
  getWeeklyStats: () => WeeklyStats
  getMonthlyStats: () => WeeklyStats
  getLifetimeStats: () => WeeklyStats
  getActivityHeatmap: (days?: number) => ActivityDay[]
  getStreakInfo: () => { current: number, longest: number, freezesAvailable: number, isAtRisk: boolean }
  getLevelInfo: () => { currentLevel: number, xpForNext: number, progress: number }
  getLevelProgress: () => { currentXP: number, xpNeeded: number, percentage: number, xpRemaining: number }
  
  // Badge and achievement system
  checkForNewBadges: () => Badge[]
  checkForNewAchievements: () => Achievement[]
  
  // Utility
  reset: () => void
  setError: (error: string | null) => void
}

// Badge definitions
const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_day',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🌟',
    category: 'milestone',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    isUnlocked: false
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    category: 'streak',
    requirement: 30,
    isUnlocked: false
  },
  {
    id: 'first_surah',
    name: 'First Surah Complete',
    description: 'Complete your first full surah',
    icon: '📖',
    category: 'completion',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'hundred_ayahs',
    name: 'Century Scholar',
    description: 'Memorize 100 ayahs',
    icon: '💯',
    category: 'milestone',
    requirement: 100,
    isUnlocked: false
  },
  {
    id: 'juz_amma',
    name: 'Juz Amma Master',
    description: 'Complete Juz Amma (30th part)',
    icon: '🕌',
    category: 'special',
    requirement: 1,
    isUnlocked: false
  }
]

const XP_PER_LEVEL = 1000
const STREAK_FREEZE_EARN_DAYS = 7

type StudyHistory = Record<string, DailyStats>

const getDateKey = (date: Date | string): string => {
  if (typeof date === 'string') {
    return date.split('T')[0]
  }

  return date.toISOString().split('T')[0]
}

const createEmptyDailyStats = (date: string): DailyStats => ({
  date,
  ayahsStudied: 0,
  lessonsCompleted: 0,
  timeSpent: 0,
  xpEarned: 0,
  streakActive: false
})

const updateHistoryEntry = (
  history: StudyHistory,
  date: string,
  mutator: (current: DailyStats) => DailyStats
) => {
  const current = history[date] ?? createEmptyDailyStats(date)
  const updatedDay = mutator(current)
  return {
    updatedHistory: { ...history, [date]: updatedDay },
    updatedDay
  }
}

const computeAggregateStats = (history: StudyHistory, days: number): WeeklyStats => {
  const today = new Date()
  const records: DailyStats[] = []

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = getDateKey(date)
    records.push(history[key] ?? createEmptyDailyStats(key))
  }

  const totalAyahsStudied = records.reduce((sum, stat) => sum + stat.ayahsStudied, 0)
  const totalLessonsCompleted = records.reduce((sum, stat) => sum + stat.lessonsCompleted, 0)
  const totalTimeSpent = records.reduce((sum, stat) => sum + stat.timeSpent, 0)
  const totalXpEarned = records.reduce((sum, stat) => sum + stat.xpEarned, 0)
  const daysActive = records.filter(stat => stat.ayahsStudied > 0 || stat.timeSpent > 0 || stat.lessonsCompleted > 0 || stat.xpEarned > 0).length
  const averageSessionLength = daysActive > 0 ? Number((totalTimeSpent / daysActive).toFixed(1)) : 0

  return {
    weekStart: records[0]?.date ?? getDateKey(today),
    weekEnd: records[records.length - 1]?.date ?? getDateKey(today),
    totalAyahsStudied,
    totalLessonsCompleted,
    totalTimeSpent,
    totalXpEarned,
    averageSessionLength,
    daysActive
  }
}

const computeLifetimeStats = (history: StudyHistory): WeeklyStats => {
  const entries = Object.values(history)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  if (entries.length === 0) {
    const today = getDateKey(new Date())
    return {
      weekStart: today,
      weekEnd: today,
      totalAyahsStudied: 0,
      totalLessonsCompleted: 0,
      totalTimeSpent: 0,
      totalXpEarned: 0,
      averageSessionLength: 0,
      daysActive: 0
    }
  }

  const totalAyahsStudied = entries.reduce((sum, stat) => sum + stat.ayahsStudied, 0)
  const totalLessonsCompleted = entries.reduce((sum, stat) => sum + stat.lessonsCompleted, 0)
  const totalTimeSpent = entries.reduce((sum, stat) => sum + stat.timeSpent, 0)
  const totalXpEarned = entries.reduce((sum, stat) => sum + stat.xpEarned, 0)
  const daysActive = entries.filter(stat => stat.ayahsStudied > 0 || stat.timeSpent > 0 || stat.lessonsCompleted > 0 || stat.xpEarned > 0).length
  const averageSessionLength = daysActive > 0 ? Number((totalTimeSpent / daysActive).toFixed(1)) : 0

  return {
    weekStart: entries[0].date,
    weekEnd: entries[entries.length - 1].date,
    totalAyahsStudied,
    totalLessonsCompleted,
    totalTimeSpent,
    totalXpEarned,
    averageSessionLength,
    daysActive
  }
}

const computeActivityHeatmap = (history: StudyHistory, days: number): ActivityDay[] => {
  const today = new Date()
  const records: DailyStats[] = []

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = getDateKey(date)
    records.push(history[key] ?? createEmptyDailyStats(key))
  }

  const maxAyahs = Math.max(...records.map(stat => stat.ayahsStudied), 0)
  const maxTime = Math.max(...records.map(stat => stat.timeSpent), 0)

  return records.map(stat => {
    const ayahScore = maxAyahs > 0 ? stat.ayahsStudied / maxAyahs : 0
    const timeScore = maxTime > 0 ? stat.timeSpent / maxTime : 0
    const intensity = Math.max(ayahScore, timeScore)

    return {
      date: stat.date,
      ayahsStudied: stat.ayahsStudied,
      lessonsCompleted: stat.lessonsCompleted,
      timeSpent: stat.timeSpent,
      xpEarned: stat.xpEarned,
      intensity: Number(intensity.toFixed(2))
    }
  })
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial Progress State
      userId: '',
      memorizedAyahs: [],
      currentSurah: 1,
      currentAyah: 1,
      streak: 0,
      lastStudyDate: '',
      totalXP: 0,
      level: 1,
      dailyGoal: 5, // 5 ayahs per day default
      completedLessons: [],
      badges: [],
      preferences: {
        preferredReciter: '7', // Abdul Basit
        playbackSpeed: 1.0,
        showTransliteration: true,
        showTranslation: true,
        translationLanguage: 'en',
        notificationTime: '19:00', // After Maghrib
        defaultReadingMode: 'learning',
        darkMode: false,
        animationsEnabled: true
      },
      
      // UI State
      isLoading: false,
      error: null,
      todaysStats: null,
      weeklyStats: null,
      monthlyStats: null,
      studyHistory: {},
      availableBadges: DEFAULT_BADGES.map(badge => ({ ...badge })),
      achievements: [],

      // Initialize progress store
      initialize: async () => {
        set({ isLoading: true })
        
        try {
          const state = get()
          
          // Generate today's stats
          const todaysStats = state.getTodaysStats()
          const weeklyStats = state.getWeeklyStats()
          const monthlyStats = state.getMonthlyStats()
          
          // Check for new badges and achievements
          const newBadges = state.checkForNewBadges()
          state.checkForNewAchievements()
          
          set({ 
            todaysStats,
            weeklyStats,
            monthlyStats,
            isLoading: false
          })
          
          // Unlock any earned badges
          newBadges.forEach(badge => {
            if (!state.badges.find(b => b.id === badge.id)) {
              state.unlockBadge(badge.id)
            }
          })
          
        } catch (error) {
          console.error('Failed to initialize progress store:', error)
          set({ 
            error: 'Failed to load progress data',
            isLoading: false
          })
        }
      },

      // Update memorized ayahs
      updateProgress: (ayahNumbers: number[]) => {
        set(state => {
          const newMemorizedAyahs = [
            ...state.memorizedAyahs,
            ...ayahNumbers.filter(num => !state.memorizedAyahs.includes(num))
          ]
          
          return {
            memorizedAyahs: newMemorizedAyahs,
            lastStudyDate: new Date().toISOString()
          }
        })
      },

      // Streak management
      incrementStreak: () => {
        set(state => ({
          streak: state.streak + 1,
          lastStudyDate: new Date().toISOString()
        }))
      },

      resetStreak: () => {
        set({ streak: 0 })
      },

      updateStreak: () => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        const lastStudyDay = state.lastStudyDate ? state.lastStudyDate.split('T')[0] : ''
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        if (lastStudyDay === today) {
          // Already studied today, maintain streak
          return
        } else if (lastStudyDay === yesterdayStr) {
          // Studied yesterday, increment streak
          state.incrementStreak()
        } else {
          // Streak broken, reset
          state.resetStreak()
        }
      },

      // XP and leveling
      addXP: (amount: number) => {
        set(state => {
          const newTotalXP = state.totalXP + amount
          const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1
          const today = getDateKey(new Date())
          const { updatedHistory, updatedDay } = updateHistoryEntry(
            state.studyHistory,
            today,
            current => ({
              ...current,
              xpEarned: current.xpEarned + amount
            })
          )
          const weeklyStats = computeAggregateStats(updatedHistory, 7)
          const monthlyStats = computeAggregateStats(updatedHistory, 30)
          
          return {
            totalXP: newTotalXP,
            level: newLevel,
            studyHistory: updatedHistory,
            todaysStats: updatedDay,
            weeklyStats,
            monthlyStats
          }
        })

        const snapshot = get()
        safeQueueProgressSync({
          event: 'xp-earned',
          amount,
          totalXP: snapshot.totalXP,
          level: snapshot.level,
          date: getDateKey(new Date())
        })
      },

      addReadingTime: (minutes: number) => {
        set(state => {
          const today = getDateKey(new Date())
          const { updatedHistory, updatedDay } = updateHistoryEntry(
            state.studyHistory,
            today,
            current => ({
              ...current,
              timeSpent: current.timeSpent + minutes
            })
          )
          const weeklyStats = computeAggregateStats(updatedHistory, 7)
          const monthlyStats = computeAggregateStats(updatedHistory, 30)

          return {
            studyHistory: updatedHistory,
            todaysStats: updatedDay,
            weeklyStats,
            monthlyStats,
            lastStudyDate: new Date().toISOString()
          }
        })

        safeQueueProgressSync({
          event: 'reading-time',
          minutes,
          date: getDateKey(new Date())
        })
      },

      // Lesson completion
      completeLesson: (lessonId: string, xpReward: number) => {
        set(state => {
          if (state.completedLessons.includes(lessonId)) {
            return state // Already completed
          }
          
          const newCompletedLessons = [...state.completedLessons, lessonId]
          const newTotalXP = state.totalXP + xpReward
          const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1
          const today = getDateKey(new Date())
          const { updatedHistory, updatedDay } = updateHistoryEntry(
            state.studyHistory,
            today,
            current => ({
              ...current,
              lessonsCompleted: current.lessonsCompleted + 1,
              xpEarned: current.xpEarned + xpReward,
              streakActive: true
            })
          )
          const weeklyStats = computeAggregateStats(updatedHistory, 7)
          const monthlyStats = computeAggregateStats(updatedHistory, 30)
          
          return {
            completedLessons: newCompletedLessons,
            totalXP: newTotalXP,
            level: newLevel,
            studyHistory: updatedHistory,
            todaysStats: updatedDay,
            weeklyStats,
            monthlyStats,
            lastStudyDate: new Date().toISOString()
          }
        })

        const snapshot = get()
        safeQueueProgressSync({
          event: 'lesson-complete',
          lessonId,
          xpReward,
          totalXP: snapshot.totalXP,
          date: getDateKey(new Date())
        })
      },

      // Badge system
      unlockBadge: (badgeId: string) => {
        set(state => {
          const badge = DEFAULT_BADGES.find(b => b.id === badgeId)
          if (!badge || state.badges.find(b => b.id === badgeId)) {
            return state // Badge not found or already unlocked
          }
          
          const unlockedBadge: Badge = {
            ...badge,
            isUnlocked: true,
            earnedAt: new Date().toISOString()
          }
          
          return {
            badges: [...state.badges, unlockedBadge]
          }
        })
      },

      // Settings
      updateDailyGoal: (goal: number) => {
        set({ dailyGoal: Math.max(1, Math.min(goal, 50)) }) // 1-50 range
      },

      resetProgress: () => {
        set({
          memorizedAyahs: [],
          currentSurah: 1,
          currentAyah: 1,
          streak: 0,
          lastStudyDate: '',
          totalXP: 0,
          level: 1,
          completedLessons: [],
          badges: [],
          todaysStats: null,
          weeklyStats: null,
          monthlyStats: null,
          studyHistory: {},
          availableBadges: DEFAULT_BADGES.map(badge => ({ ...badge })),
          achievements: [],
          error: null
        })
      },

      // Study session recording
      recordStudySession: (ayahsStudied: number, timeSpent: number) => {
        const today = getDateKey(new Date())

        set(state => {
          const { updatedHistory, updatedDay } = updateHistoryEntry(
            state.studyHistory,
            today,
            current => ({
              ...current,
              ayahsStudied: current.ayahsStudied + ayahsStudied,
              timeSpent: current.timeSpent + timeSpent,
              streakActive: true
            })
          )

          const weeklyStats = computeAggregateStats(updatedHistory, 7)
          const monthlyStats = computeAggregateStats(updatedHistory, 30)

          return {
            studyHistory: updatedHistory,
            todaysStats: updatedDay,
            weeklyStats,
            monthlyStats,
            lastStudyDate: new Date().toISOString()
          }
        })

        const snapshot = get()
        safeQueueProgressSync({
          event: 'study-session',
          date: today,
          ayahsStudied,
          timeSpent,
          streak: snapshot.streak,
          totalXP: snapshot.totalXP
        })
      },

      // Analytics
      getTodaysStats: (): DailyStats => {
        const today = getDateKey(new Date())
        const state = get()

        return state.studyHistory[today] ?? createEmptyDailyStats(today)
      },

      getWeeklyStats: (): WeeklyStats => {
        const state = get()
        return state.weeklyStats ?? computeAggregateStats(state.studyHistory, 7)
      },

      getMonthlyStats: (): WeeklyStats => {
        const state = get()
        return state.monthlyStats ?? computeAggregateStats(state.studyHistory, 30)
      },

      getLifetimeStats: (): WeeklyStats => {
        const state = get()
        return computeLifetimeStats(state.studyHistory)
      },

      getActivityHeatmap: (days = 7): ActivityDay[] => {
        const state = get()
        return computeActivityHeatmap(state.studyHistory, days)
      },

      getStreakInfo: () => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        const lastStudyDay = state.lastStudyDate ? state.lastStudyDate.split('T')[0] : ''
        const isAtRisk = lastStudyDay !== today && state.streak > 0
        
        return {
          current: state.streak,
          longest: state.streak, // Would track historical longest
          freezesAvailable: Math.floor(state.streak / STREAK_FREEZE_EARN_DAYS),
          isAtRisk
        }
      },

      getLevelProgress: () => {
        const state = get()
        const currentLevelXP = (state.level - 1) * XP_PER_LEVEL
        const nextLevelXP = state.level * XP_PER_LEVEL
        const progressXP = state.totalXP - currentLevelXP
        const xpRemaining = nextLevelXP - state.totalXP
        const percentage = (progressXP / XP_PER_LEVEL) * 100
        
        return {
          currentXP: progressXP,
          xpNeeded: XP_PER_LEVEL,
          percentage,
          xpRemaining
        }
      },

      getLevelInfo: () => {
        const state = get()
        const currentLevelXP = (state.level - 1) * XP_PER_LEVEL
        const nextLevelXP = state.level * XP_PER_LEVEL
        const progressXP = state.totalXP - currentLevelXP
        const xpForNext = nextLevelXP - state.totalXP
        const progress = (progressXP / XP_PER_LEVEL) * 100
        
        return {
          currentLevel: state.level,
          xpForNext,
          progress
        }
      },

      // Badge and achievement checking
      checkForNewBadges: (): Badge[] => {
        const state = get()
        const newBadges: Badge[] = []
        
        DEFAULT_BADGES.forEach(badge => {
          const alreadyUnlocked = state.badges.find(b => b.id === badge.id)
          if (alreadyUnlocked) return
          
          let requirementMet = false
          
          switch (badge.id) {
            case 'first_day':
              requirementMet = state.completedLessons.length >= 1
              break
            case 'week_warrior':
              requirementMet = state.streak >= 7
              break
            case 'month_master':
              requirementMet = state.streak >= 30
              break
            case 'hundred_ayahs':
              requirementMet = state.memorizedAyahs.length >= 100
              break
            default:
              break
          }
          
          if (requirementMet) {
            newBadges.push(badge)
          }
        })
        
        return newBadges
      },

      checkForNewAchievements: (): Achievement[] => {
        // Placeholder for achievement system
        return []
      },

      // Utility
      reset: () => {
        set({
          memorizedAyahs: [],
          currentSurah: 1,
          currentAyah: 1,
          streak: 0,
          lastStudyDate: '',
          totalXP: 0,
          level: 1,
          completedLessons: [],
          badges: [],
          todaysStats: null,
          weeklyStats: null,
          monthlyStats: null,
          studyHistory: {},
          achievements: [],
          availableBadges: DEFAULT_BADGES.map(badge => ({ ...badge })),
          error: null
        })

        safeQueueProgressSync({
          event: 'progress-reset',
          date: getDateKey(new Date())
        })
      },

      setError: (error: string | null) => set({ error })
    }),
    {
      name: 'progress-store',
      storage: createJSONStorage(() => localStorage),
      // Persist all progress data
      partialize: (state) => ({
        userId: state.userId,
        memorizedAyahs: state.memorizedAyahs,
        currentSurah: state.currentSurah,
        currentAyah: state.currentAyah,
        streak: state.streak,
        lastStudyDate: state.lastStudyDate,
        totalXP: state.totalXP,
        level: state.level,
        dailyGoal: state.dailyGoal,
        completedLessons: state.completedLessons,
        badges: state.badges,
        preferences: state.preferences,
        studyHistory: state.studyHistory
      })
    }
  )
)
