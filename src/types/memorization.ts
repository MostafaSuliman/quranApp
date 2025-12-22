/**
 * Memorization tracking types
 * Implements the Three-Tier Review Method and Five Fortresses system
 */

// Page memorization status
export type MemorizationStatus = 'not_started' | 'in_progress' | 'memorized'

// Self-assessment strength rating
export type StrengthRating = 'strong' | 'medium' | 'weak' // قوي | متوسط | ضعيف

// Daily goal options (in pages)
export type DailyGoal = 0.25 | 0.5 | 1 | 2 // ربع صفحة | نصف صفحة | صفحة كاملة | صفحتان

// Session time preference
export type SessionTime = 'morning' | 'afternoon' | 'evening' // الصباح | الظهر | المساء

// Page progress tracking (stored locally by page reference)
export interface PageProgress {
  pageNumber: number // 1-604
  status: MemorizationStatus
  repetitionCount: number
  lastReviewedAt: string | null // ISO date string
  strengthRating: StrengthRating | null
  reviewHistory: ReviewEntry[]
  memorizedAt: string | null // ISO date string when marked as memorized
  nextReviewAt: string | null // Spaced repetition scheduled date
}

// Review history entry
export interface ReviewEntry {
  date: string // ISO date string
  rating: StrengthRating
  repetitions: number
  sessionType: SessionType
}

// Session types based on Five Fortresses
export type SessionType =
  | 'listening'      // الحصن الأول - القراءة والاستماع
  | 'preparation'    // الحصن الثاني - التحضير
  | 'memorization'   // الحصن الثالث - الحفظ الجديد
  | 'recent_review'  // الحصن الرابع - المراجعة القريبة
  | 'old_review'     // الحصن الخامس - المراجعة البعيدة

// Three-Tier Review System
export interface ReviewSystem {
  // السبق - Today's new portion
  sabaq: {
    pages: number[] // Page numbers for today's new memorization
    targetRepetitions: number // Usually 35-50
    currentRepetitions: number
  }

  // السبقي - Recent memorization (last ~20 pages)
  sabqi: {
    pages: number[] // Recent pages needing review
    completedToday: boolean
    pagesReviewedToday: number[]
  }

  // المنزل - Old memorization weekly cycle
  manzil: {
    totalPages: number[] // All memorized pages
    weeklySchedule: ManzilDaySchedule[]
    currentDayIndex: number // 0-6 for day of week
    cycleNumber: number // Which cycle through all memorization
  }
}

// Manzil daily schedule
export interface ManzilDaySchedule {
  dayIndex: number // 0-6 (Sunday-Saturday)
  pages: number[] // Pages to review on this day
  completed: boolean
}

// Five Fortresses progress tracking
export interface FortressProgress {
  // الحصن الأول - Listening & Reading
  listening: {
    dailyGoalJuz: number // 1-2 juz
    completedToday: number // Juz completed today
    totalListened: number // Lifetime pages listened
    lastSession: string | null
  }

  // الحصن الثاني - Preparation
  preparation: {
    weeklyPages: number[] // Pages prepared this week
    nightlyPage: number | null // Tomorrow's page (listened 10-15 times)
    warmupComplete: boolean // Fast recitation 15 times done
  }

  // الحصن الثالث - New Memorization
  memorization: {
    targetReps: number // 35-50
    todayProgress: {
      page: number
      repetitions: number
      sessions: MemorizationSession[]
    } | null
  }

  // الحصن الرابع - Recent Review (السبقي)
  recentReview: {
    last20Pages: number[]
    weakPages: number[] // Pages marked as weak
    reviewedToday: number[]
  }

  // الحصن الخامس - Old Review (المنزل)
  oldReview: {
    cycleDay: number // 1-7
    cycleTotalDays: number
    pagesPerDay: number
    todayComplete: boolean
  }
}

// Memorization session (for spaced repetition throughout day)
export interface MemorizationSession {
  time: SessionTime
  repetitions: number
  completed: boolean
}

// Daily progress summary
export interface DailyProgress {
  date: string // ISO date string (YYYY-MM-DD)
  sabaqComplete: boolean
  sabqiComplete: boolean
  manzilComplete: boolean
  totalRepetitions: number
  pagesReviewed: number
  newPagesMemorized: number
  listeningMinutes: number
  streak: number // Consecutive days
}

// User statistics
export interface UserStats {
  totalPagesMemorized: number
  totalJuzMemorized: number // Calculated from pages
  currentStreak: number
  longestStreak: number
  totalRepetitions: number
  totalReviewSessions: number
  joinedAt: string
  lastActiveAt: string
  milestones: Milestone[]
}

// Achievement milestone
export interface Milestone {
  type: 'juz' | 'surah' | 'streak' | 'pages'
  value: number
  achievedAt: string
  celebrated: boolean
}

// Review amount guidelines based on total memorized
export interface ReviewGuideline {
  totalJuzRange: [number, number]
  dailySabqiPages: number
  weeklyManzilDivision: 'all' | 'divide'
}

// Predefined review guidelines
export const REVIEW_GUIDELINES: ReviewGuideline[] = [
  { totalJuzRange: [1, 3], dailySabqiPages: 5, weeklyManzilDivision: 'all' },
  { totalJuzRange: [4, 7], dailySabqiPages: 10, weeklyManzilDivision: 'all' },
  { totalJuzRange: [7, 15], dailySabqiPages: 20, weeklyManzilDivision: 'divide' },
  { totalJuzRange: [15, 20], dailySabqiPages: 30, weeklyManzilDivision: 'divide' },
  { totalJuzRange: [20, 30], dailySabqiPages: 60, weeklyManzilDivision: 'divide' },
]

// Get review guideline based on total juz memorized
export function getReviewGuideline(totalJuz: number): ReviewGuideline {
  return REVIEW_GUIDELINES.find(
    g => totalJuz >= g.totalJuzRange[0] && totalJuz <= g.totalJuzRange[1]
  ) || REVIEW_GUIDELINES[REVIEW_GUIDELINES.length - 1]!
}
