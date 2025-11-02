// Core Quran data types
export interface Ayah {
  number: number
  text: string
  numberInSurah: number
  surah: number
  juz: number
  manzil: number
  page: number
  ruku: number
  hizbQuarter: number
  sajda?: {
    recommended: boolean
    obligatory: boolean
  }
  audio?: string
  translation?: string
  transliteration?: string
}

export interface Surah {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
  ayahs: Ayah[]
}

export interface Reciter {
  id: string
  name: string
  englishName: string
  photo?: string
  style: string
  audioFormat: string
}

export interface QuranPage {
  number: number
  ayahs: Ayah[]
  surahInfo: {
    number: number
    name: string
    startAyah?: number
    endAyah?: number
  }[]
}

// User progress and learning types
export interface UserProgress {
  userId: string
  memorizedAyahs: number[]
  currentSurah: number
  currentAyah: number
  streak: number
  lastStudyDate: string
  totalXP: number
  level: number
  dailyGoal: number
  completedLessons: string[]
  badges: Badge[]
  preferences: UserPreferences
  studyHistory?: Record<string, DailyStats>
}

export interface UserPreferences {
  preferredReciter: string
  playbackSpeed: number
  showTransliteration: boolean
  showTranslation: boolean
  translationLanguage: string
  uiLanguage: 'ar' | 'en'
  notificationTime: string
  defaultReadingMode: 'learning' | 'mushaf'
  darkMode: boolean
  animationsEnabled: boolean
  // Audio navigation preferences
  audioNavigationAction?: 'ask' | 'stop' | 'continue' | 'pause'
  showAudioNavigationModal?: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'completion' | 'milestone' | 'special'
  requirement: number
  earnedAt?: string
  isUnlocked: boolean
}

export interface Lesson {
  id: string
  title: string
  surahNumber: number
  startAyah: number
  endAyah: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number // in minutes
  exercises: Exercise[]
  isCompleted: boolean
  completedAt?: string
  xpReward: number
}

export interface Exercise {
  id: string
  type: 'listen' | 'repeat' | 'fill-blank' | 'order' | 'match'
  question: string
  correctAnswer: string
  options?: string[]
  ayahNumber: number
  isCompleted: boolean
}

// Audio and repetition types
export interface RepetitionSettings {
  ayahNumber: number
  count: number
  pauseBetween: number // seconds
  isActive: boolean
  currentRepetition: number
}

export interface AudioState {
  isPlaying: boolean
  currentAyah: number | null
  currentTime: number
  duration: number
  isLoading: boolean
  selectedReciter: string
  playbackSpeed: number
  repetitionSettings: RepetitionSettings | null
}

// API response types for Quran.com API
export interface QuranApiResponse<T> {
  data: T
  pagination?: {
    perPage: number
    currentPage: number
    nextPage: number | null
    totalPages: number
    totalRecords: number
  }
  meta?: {
    filters: Record<string, any>
    translationName?: string
    authorName?: string
  }
}

export interface AudioApiResponse {
  audioFiles: AudioFile[]
}

export interface AudioFile {
  id: number
  chapterNumber: number
  fileSize: number
  format: string
  totalFiles: number
  audioUrl: string
}

// Reading modes
export type ReadingMode = 'learning' | 'mushaf'

export interface ReadingModeConfig {
  mode: ReadingMode
  showTransliteration: boolean
  showTranslation: boolean
  fontSize: 'small' | 'medium' | 'large'
  highlightCurrentAyah: boolean
  autoScroll: boolean
}

// Gamification types
export interface Achievement {
  id: string
  name: string
  description: string
  xpReward: number
  badgeIcon: string
  category: string
  isUnlocked: boolean
  unlockedAt?: string
  progress: number
  target: number
}

export interface DailyStats {
  date: string
  ayahsStudied: number
  lessonsCompleted: number
  timeSpent: number // in minutes
  xpEarned: number
  streakActive: boolean
}

export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalAyahsStudied: number
  totalLessonsCompleted: number
  totalTimeSpent: number
  totalXpEarned: number
  averageSessionLength: number
  daysActive: number
}

export interface ActivityDay {
  date: string
  ayahsStudied: number
  lessonsCompleted: number
  timeSpent: number
  xpEarned: number
  intensity: number // 0-1 scaled for heatmap visualisation
}

// Donation types
export interface DonationOption {
  amount: number
  label: string
  description: string
  isPopular?: boolean
}

export interface Donation {
  id: string
  amount: number
  currency: string
  donorName?: string
  isAnonymous: boolean
  message?: string
  createdAt: string
  status: 'pending' | 'completed' | 'failed'
}

// Islamic Content Types (Hadith, Duas, Prayer Times)
export interface Hadith {
  id: string
  collection: string // Bukhari, Muslim, Abu Dawud, etc.
  book: string
  chapter: string
  hadithNumber: string
  arabicText: string
  englishTranslation: string
  narrator: string
  grade: string // Sahih, Hasan, Daif
  reference: string
  isFavorited?: boolean
  tags?: string[]
}

export interface Dua {
  id: string
  title: string
  arabicText: string
  transliteration: string
  englishTranslation: string
  source: string // Quran verse reference or Hadith reference
  category: string // morning, evening, before_eating, etc.
  audio?: string
  isFavorited?: boolean
  timesRecited?: number
}

export interface PrayerTimes {
  date: string
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  location: {
    city: string
    country: string
    latitude: number
    longitude: number
    timezone?: string
  }
  method?: number // Calculation method
  nextPrayer?: string
  timeToNextPrayer?: string
}

export interface IslamicLocation {
  latitude: number
  longitude: number
  city?: string
  country?: string
  timezone?: string
  address?: string
}

// Islamic content preferences and settings
export interface IslamicContentPreferences {
  preferredHadithCollection: 'sahih-bukhari' | 'sahih-muslim' | 'abu-dawood' | 'jami-at-tirmidhi' | 'sunan-an-nasai' | 'sunan-ibn-majah'
  enableArabicFirst: boolean
  showTransliteration: boolean
  dailyHadithNotification: boolean
  dailyDuaReminder: boolean
  prayerTimeNotifications: boolean
  preferredDuaCategories: string[]
  cacheExpiryHours: number
  notificationTimes: {
    hadith: string // Time for daily hadith notification
    duas: string // Time for daily dua reminder
    prayers: boolean // Enable prayer time notifications
  }
}

// Favorites system for Islamic content
export interface IslamicFavorites {
  hadiths: string[] // Array of hadith IDs
  duas: string[] // Array of dua IDs
  collections: string[] // Favorite hadith collections
  categories: string[] // Favorite dua categories
}

// Islamic content cache structure
export interface IslamicContentCache<T> {
  data: T
  timestamp: number
  expiry: number
  source: 'api' | 'fallback' | 'local'
}

// Error handling for Islamic content
export interface IslamicContentError {
  code: string
  message: string
  timestamp: number
  source: 'hadith' | 'dua' | 'prayer' | 'location' | 'network'
  retryable: boolean
  details?: any
}
