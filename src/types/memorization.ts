/**
 * Memorization Types
 * Designed to support the Five Fortresses (Sabaq, Sabqi, Manzil) system
 *
 * IMPORTANT: Store ONLY references (page numbers, surah numbers, ayah numbers).
 * NEVER store Quranic text.
 */

// Page memorization status
export type PageStatus = 'not_started' | 'in_progress' | 'memorized';

// Memorization strength (self-assessment)
export type MemorizationStrength = 'weak' | 'medium' | 'strong';

// Individual page memorization record
export interface PageMemorization {
  pageNumber: number; // 1-604
  status: PageStatus;
  strength: MemorizationStrength | null;
  repetitionCount: number;
  listeningTimeSeconds: number;
  preparationCompleted: boolean;
  lastReviewedAt: string | null; // ISO date string
  reviewHistory: ReviewRecord[];
}

// Review record for a page
export interface ReviewRecord {
  date: string; // ISO date string
  type: ReviewType;
  selfAssessment: MemorizationStrength;
  duration: number; // seconds
}

export type ReviewType = 'sabaq' | 'sabqi' | 'manzil' | 'general';

// Three-tier review system positions
export interface ReviewPositions {
  // Current new memorization position (page number)
  sabaqPage: number;

  // Sabqi range - recent pages for frequent review (last ~20 pages)
  sabqiStartPage: number;
  sabqiEndPage: number;

  // Manzil - all previously memorized pages for weekly cycle
  manzilCurrentDay: number; // 1-7 for daily rotation
  manzilPagesPerDay: number[];
}

// Daily session tracking for Five Fortresses
export interface DailySession {
  date: string; // ISO date string

  // First Fortress: Listening to new page
  newPageListeningCompleted: boolean;
  newPageNumber: number | null;

  // Second Fortress: Looking at page while listening
  lookingWhileListeningCompleted: boolean;

  // Third Fortress: Reading with recording
  readingWithRecordingCompleted: boolean;

  // Fourth Fortress: Memorization and repetition
  memorizationCompleted: boolean;
  repetitionsCompleted: number;

  // Fifth Fortress: Connection and review
  connectionReviewCompleted: boolean;

  // Summary
  totalTimeMinutes: number;
  completed: boolean;
}

// Streak tracking
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  totalDaysPracticed: number;
}

// Points/Gamification (prepared for Part 2)
export interface GamificationData {
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  weeklyPoints: number;
  monthlyPoints: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null;
  iconName: string;
}

// Complete memorization progress state
export interface MemorizationProgress {
  // Page-by-page tracking (604 pages)
  pages: Record<number, PageMemorization>;

  // Review system positions
  reviewPositions: ReviewPositions;

  // Streak data
  streakData: StreakData;

  // Gamification (Part 2)
  gamificationData: GamificationData;

  // Sessions
  todaySession: DailySession | null;
  sessionHistory: DailySession[];

  // Summary stats
  totalPagesMemorized: number;
  totalReviewSessions: number;
  totalListeningTimeSeconds: number;
}

// Default initial memorization state
export const DEFAULT_MEMORIZATION_PROGRESS: MemorizationProgress = {
  pages: {},
  reviewPositions: {
    sabaqPage: 1,
    sabqiStartPage: 1,
    sabqiEndPage: 1,
    manzilCurrentDay: 1,
    manzilPagesPerDay: [],
  },
  streakData: {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    totalDaysPracticed: 0,
  },
  gamificationData: {
    totalPoints: 0,
    level: 1,
    achievements: [],
    weeklyPoints: 0,
    monthlyPoints: 0,
  },
  todaySession: null,
  sessionHistory: [],
  totalPagesMemorized: 0,
  totalReviewSessions: 0,
  totalListeningTimeSeconds: 0,
};
