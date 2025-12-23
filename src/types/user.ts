/**
 * User Types
 * All user data - authentication, preferences, and profiles
 */

// User profile from authentication
export interface User {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignIn: string | null;
  provider: AuthProvider;
}

export type AuthProvider = 'email' | 'apple' | 'google' | 'anonymous';

// Authentication state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// User preferences
export interface UserPreferences {
  // Display settings
  theme: ThemeMode;
  fontSize: FontSize;
  fontFamily: string;
  showTranslation: boolean;
  translationLanguage: string;

  // Audio settings
  defaultReciterId: string | null;
  playbackSpeed: number;
  backgroundPlayback: boolean;

  // Reading settings
  lastReadPage: number;
  lastReadSurah: number;
  lastReadAyah: number;

  // Memorization settings
  dailyGoal: number; // pages per day
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm format

  // Onboarding
  hasCompletedOnboarding: boolean;

  // Locale
  appLanguage: AppLanguage;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AppLanguage = 'ar' | 'en';

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  fontFamily: 'Amiri',
  showTranslation: false,
  translationLanguage: 'en',
  defaultReciterId: null,
  playbackSpeed: 1.0,
  backgroundPlayback: true,
  lastReadPage: 1,
  lastReadSurah: 1,
  lastReadAyah: 1,
  dailyGoal: 1,
  reminderEnabled: false,
  reminderTime: '06:00',
  hasCompletedOnboarding: false,
  appLanguage: 'ar',
};

// Bookmark
export interface Bookmark {
  id: string;
  pageNumber: number;
  surahNumber: number;
  ayahNumber: number;
  label?: string;
  color?: string;
  createdAt: string;
}
