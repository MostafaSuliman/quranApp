import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type {
  PageProgress,
  DailyProgress,
  UserStats,
  StrengthRating,
  SessionType,
  ReviewEntry,
  Milestone,
  FortressProgress,
} from '@/types'
import {
  getPageProgress,
  setPageProgress,
  getAllPageProgress,
  getDailyProgress,
  setDailyProgress,
  getUserStats,
  setUserStats,
} from '@/utils/storage'
import { getTodayString } from '@/utils/date'

// Constants
const PAGES_PER_JUZ = 20

interface MemorizationState {
  // Page progress
  pageProgress: Map<number, PageProgress>
  progressLoading: boolean

  // Current session
  currentSessionType: SessionType | null
  currentPage: number | null
  sessionRepetitions: number

  // Daily tracking
  todayProgress: DailyProgress | null
  currentStreak: number

  // Five Fortresses progress
  fortressProgress: FortressProgress

  // Statistics
  stats: UserStats | null
  statsLoading: boolean
}

interface MemorizationActions {
  // Initialization
  loadProgress: () => Promise<void>
  loadStats: () => Promise<void>

  // Page progress
  markPageStatus: (
    pageNumber: number,
    status: 'not_started' | 'in_progress' | 'memorized'
  ) => Promise<void>
  recordRepetition: (pageNumber: number, count?: number) => Promise<void>
  ratePageStrength: (pageNumber: number, rating: StrengthRating) => Promise<void>

  // Session management
  startSession: (type: SessionType, pageNumber: number) => void
  endSession: () => Promise<void>
  incrementRepetition: () => void

  // Daily progress
  updateDailyProgress: (updates: Partial<DailyProgress>) => Promise<void>
  completeSabaq: () => Promise<void>
  completeSabqi: () => Promise<void>
  completeManzil: () => Promise<void>

  // Fortress tracking
  updateFortressProgress: (updates: Partial<FortressProgress>) => void

  // Statistics
  calculateStats: () => Promise<UserStats>
  recordMilestone: (type: Milestone['type'], value: number) => Promise<void>

  // Queries
  getMemorizedPages: () => number[]
  getInProgressPages: () => number[]
  getWeakPages: () => number[]
  getSabqiPages: () => number[] // Last 20 memorized pages
  getManzilSchedule: () => { dayIndex: number; pages: number[] }[]
  getTotalJuzMemorized: () => number

  // Helpers
  getPageProgressByNumber: (pageNumber: number) => PageProgress | undefined
  needsReview: (pageNumber: number) => boolean
}

const createInitialPageProgress = (pageNumber: number): PageProgress => ({
  pageNumber,
  status: 'not_started',
  repetitionCount: 0,
  lastReviewedAt: null,
  strengthRating: null,
  reviewHistory: [],
  memorizedAt: null,
  nextReviewAt: null,
})

const createInitialDailyProgress = (): DailyProgress => ({
  date: getTodayString(),
  sabaqComplete: false,
  sabqiComplete: false,
  manzilComplete: false,
  totalRepetitions: 0,
  pagesReviewed: 0,
  newPagesMemorized: 0,
  listeningMinutes: 0,
  streak: 0,
})

const createInitialFortressProgress = (): FortressProgress => ({
  listening: {
    dailyGoalJuz: 1,
    completedToday: 0,
    totalListened: 0,
    lastSession: null,
  },
  preparation: {
    weeklyPages: [],
    nightlyPage: null,
    warmupComplete: false,
  },
  memorization: {
    targetReps: 40,
    todayProgress: null,
  },
  recentReview: {
    last20Pages: [],
    weakPages: [],
    reviewedToday: [],
  },
  oldReview: {
    cycleDay: 1,
    cycleTotalDays: 7,
    pagesPerDay: 20,
    todayComplete: false,
  },
})

const createInitialStats = (): UserStats => ({
  totalPagesMemorized: 0,
  totalJuzMemorized: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalRepetitions: 0,
  totalReviewSessions: 0,
  joinedAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  milestones: [],
})

export const useMemorizationStore = create<MemorizationState & MemorizationActions>()(
  persist(
    (set, get) => ({
      // Initial state
      pageProgress: new Map(),
      progressLoading: false,

      currentSessionType: null,
      currentPage: null,
      sessionRepetitions: 0,

      todayProgress: null,
      currentStreak: 0,

      fortressProgress: createInitialFortressProgress(),

      stats: null,
      statsLoading: false,

      // Load progress from AsyncStorage
      loadProgress: async () => {
        set({ progressLoading: true })

        try {
          const allProgress = await getAllPageProgress()
          const progressMap = new Map<number, PageProgress>()

          for (const p of allProgress) {
            progressMap.set(p.pageNumber, p)
          }

          // Load today's progress
          const today = getTodayString()
          let todayProgress = await getDailyProgress(today)
          if (!todayProgress) {
            todayProgress = createInitialDailyProgress()
          }

          set({
            pageProgress: progressMap,
            todayProgress,
            progressLoading: false,
          })
        } catch (error) {
          console.error('Failed to load progress:', error)
          set({ progressLoading: false })
        }
      },

      // Load statistics
      loadStats: async () => {
        set({ statsLoading: true })

        try {
          let stats = await getUserStats()
          if (!stats) {
            stats = createInitialStats()
          }

          set({ stats, statsLoading: false })
        } catch (error) {
          console.error('Failed to load stats:', error)
          set({ statsLoading: false })
        }
      },

      // Mark page status
      markPageStatus: async (pageNumber, status) => {
        const { pageProgress } = get()
        let progress = pageProgress.get(pageNumber)

        if (!progress) {
          progress = createInitialPageProgress(pageNumber)
        }

        const updatedProgress: PageProgress = {
          ...progress,
          status,
          memorizedAt: status === 'memorized' ? new Date().toISOString() : progress.memorizedAt,
        }

        pageProgress.set(pageNumber, updatedProgress)
        set({ pageProgress: new Map(pageProgress) })

        await setPageProgress(updatedProgress)

        // Update stats if marking as memorized
        if (status === 'memorized') {
          await get().calculateStats()
        }
      },

      // Record repetition
      recordRepetition: async (pageNumber, count = 1) => {
        const { pageProgress, todayProgress } = get()
        let progress = pageProgress.get(pageNumber)

        if (!progress) {
          progress = createInitialPageProgress(pageNumber)
        }

        const updatedProgress: PageProgress = {
          ...progress,
          repetitionCount: progress.repetitionCount + count,
          lastReviewedAt: new Date().toISOString(),
        }

        pageProgress.set(pageNumber, updatedProgress)
        set({ pageProgress: new Map(pageProgress) })

        await setPageProgress(updatedProgress)

        // Update daily progress
        if (todayProgress) {
          await get().updateDailyProgress({
            totalRepetitions: todayProgress.totalRepetitions + count,
          })
        }
      },

      // Rate page strength
      ratePageStrength: async (pageNumber, rating) => {
        const { pageProgress } = get()
        let progress = pageProgress.get(pageNumber)

        if (!progress) {
          progress = createInitialPageProgress(pageNumber)
        }

        const reviewEntry: ReviewEntry = {
          date: new Date().toISOString(),
          rating,
          repetitions: get().sessionRepetitions,
          sessionType: get().currentSessionType || 'recent_review',
        }

        const updatedProgress: PageProgress = {
          ...progress,
          strengthRating: rating,
          lastReviewedAt: new Date().toISOString(),
          reviewHistory: [...progress.reviewHistory, reviewEntry],
        }

        pageProgress.set(pageNumber, updatedProgress)
        set({ pageProgress: new Map(pageProgress) })

        await setPageProgress(updatedProgress)

        // Update weak pages tracking
        const { fortressProgress } = get()
        if (rating === 'weak') {
          if (!fortressProgress.recentReview.weakPages.includes(pageNumber)) {
            set({
              fortressProgress: {
                ...fortressProgress,
                recentReview: {
                  ...fortressProgress.recentReview,
                  weakPages: [...fortressProgress.recentReview.weakPages, pageNumber],
                },
              },
            })
          }
        } else {
          set({
            fortressProgress: {
              ...fortressProgress,
              recentReview: {
                ...fortressProgress.recentReview,
                weakPages: fortressProgress.recentReview.weakPages.filter((p) => p !== pageNumber),
              },
            },
          })
        }
      },

      // Start a session
      startSession: (type, pageNumber) => {
        set({
          currentSessionType: type,
          currentPage: pageNumber,
          sessionRepetitions: 0,
        })
      },

      // End session
      endSession: async () => {
        const { currentPage, sessionRepetitions, todayProgress } = get()

        if (currentPage && sessionRepetitions > 0) {
          await get().recordRepetition(currentPage, sessionRepetitions)
        }

        // Update review count
        if (todayProgress) {
          await get().updateDailyProgress({
            pagesReviewed: todayProgress.pagesReviewed + 1,
          })
        }

        set({
          currentSessionType: null,
          currentPage: null,
          sessionRepetitions: 0,
        })
      },

      // Increment repetition counter
      incrementRepetition: () => {
        set((state) => ({
          sessionRepetitions: state.sessionRepetitions + 1,
        }))
      },

      // Update daily progress
      updateDailyProgress: async (updates) => {
        const { todayProgress } = get()
        const current = todayProgress || createInitialDailyProgress()

        const updated: DailyProgress = {
          ...current,
          ...updates,
          date: getTodayString(),
        }

        set({ todayProgress: updated })
        await setDailyProgress(updated)
      },

      // Mark Sabaq complete
      completeSabaq: async () => {
        const { todayProgress } = get()
        if (todayProgress) {
          await get().updateDailyProgress({
            sabaqComplete: true,
            newPagesMemorized: todayProgress.newPagesMemorized + 1,
          })
        }
      },

      // Mark Sabqi complete
      completeSabqi: async () => {
        await get().updateDailyProgress({ sabqiComplete: true })
      },

      // Mark Manzil complete
      completeManzil: async () => {
        await get().updateDailyProgress({ manzilComplete: true })
      },

      // Update fortress progress
      updateFortressProgress: (updates) => {
        set((state) => ({
          fortressProgress: {
            ...state.fortressProgress,
            ...updates,
          },
        }))
      },

      // Calculate and save stats
      calculateStats: async () => {
        const memorizedPages = get().getMemorizedPages()
        const totalJuz = Math.floor(memorizedPages.length / PAGES_PER_JUZ)

        const currentStats = get().stats || createInitialStats()

        const updatedStats: UserStats = {
          ...currentStats,
          totalPagesMemorized: memorizedPages.length,
          totalJuzMemorized: totalJuz,
          lastActiveAt: new Date().toISOString(),
        }

        set({ stats: updatedStats })
        await setUserStats(updatedStats)

        return updatedStats
      },

      // Record milestone
      recordMilestone: async (type, value) => {
        const { stats } = get()
        if (!stats) return

        const milestone: Milestone = {
          type,
          value,
          achievedAt: new Date().toISOString(),
          celebrated: false,
        }

        const updatedStats: UserStats = {
          ...stats,
          milestones: [...stats.milestones, milestone],
        }

        set({ stats: updatedStats })
        await setUserStats(updatedStats)
      },

      // Get memorized pages
      getMemorizedPages: () => {
        const { pageProgress } = get()
        return Array.from(pageProgress.values())
          .filter((p) => p.status === 'memorized')
          .map((p) => p.pageNumber)
          .sort((a, b) => a - b)
      },

      // Get in-progress pages
      getInProgressPages: () => {
        const { pageProgress } = get()
        return Array.from(pageProgress.values())
          .filter((p) => p.status === 'in_progress')
          .map((p) => p.pageNumber)
          .sort((a, b) => a - b)
      },

      // Get weak pages
      getWeakPages: () => {
        const { pageProgress } = get()
        return Array.from(pageProgress.values())
          .filter((p) => p.strengthRating === 'weak')
          .map((p) => p.pageNumber)
          .sort((a, b) => a - b)
      },

      // Get Sabqi pages (last 20 memorized)
      getSabqiPages: () => {
        const memorized = get().getMemorizedPages()
        return memorized.slice(-20)
      },

      // Get Manzil weekly schedule
      getManzilSchedule: () => {
        const memorized = get().getMemorizedPages()
        const sabqiPages = get().getSabqiPages()

        // Exclude Sabqi pages from Manzil
        const manzilPages = memorized.filter((p) => !sabqiPages.includes(p))

        if (manzilPages.length === 0) {
          return []
        }

        // Divide into 7 days
        const pagesPerDay = Math.ceil(manzilPages.length / 7)
        const schedule: { dayIndex: number; pages: number[] }[] = []

        for (let i = 0; i < 7; i++) {
          const start = i * pagesPerDay
          const end = Math.min(start + pagesPerDay, manzilPages.length)
          schedule.push({
            dayIndex: i,
            pages: manzilPages.slice(start, end),
          })
        }

        return schedule
      },

      // Get total Juz memorized
      getTotalJuzMemorized: () => {
        const memorized = get().getMemorizedPages()
        return Math.floor(memorized.length / PAGES_PER_JUZ)
      },

      // Get page progress
      getPageProgressByNumber: (pageNumber) => {
        return get().pageProgress.get(pageNumber)
      },

      // Check if page needs review
      needsReview: (pageNumber) => {
        const progress = get().pageProgress.get(pageNumber)
        if (!progress || progress.status !== 'memorized') return false

        // Check if last review was more than 7 days ago
        if (!progress.lastReviewedAt) return true

        const lastReview = new Date(progress.lastReviewedAt)
        const daysSince = Math.floor(
          (Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Weak pages need review after 2 days, others after 7
        return progress.strengthRating === 'weak' ? daysSince >= 2 : daysSince >= 7
      },
    }),
    {
      name: 'quran-memorization',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        fortressProgress: state.fortressProgress,
        currentStreak: state.currentStreak,
      }),
    }
  )
)

// Selectors
export const usePageProgressMap = () => useMemorizationStore((s) => s.pageProgress)
export const useTodayProgress = () => useMemorizationStore((s) => s.todayProgress)
export const useFortressProgress = () => useMemorizationStore((s) => s.fortressProgress)
export const useMemorizationStats = () => useMemorizationStore((s) => s.stats)
export const useCurrentSession = () =>
  useMemorizationStore((s) => ({
    type: s.currentSessionType,
    page: s.currentPage,
    repetitions: s.sessionRepetitions,
  }))
