/**
 * Settings Store
 * Manages user preferences and app settings
 */

import { create } from 'zustand';
import type { UserPreferences, FontSize, AppLanguage } from '../types/user';
import { DEFAULT_PREFERENCES } from '../types/user';
import { storageService } from '../services/storage';

interface SettingsState {
  preferences: UserPreferences;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}

interface SettingsStore extends SettingsState {
  // Actions
  initialize: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
  setShowTranslation: (show: boolean) => Promise<void>;
  setTranslationLanguage: (language: string) => Promise<void>;
  setAppLanguage: (language: AppLanguage) => Promise<void>;
  setReminderEnabled: (enabled: boolean) => Promise<void>;
  setReminderTime: (time: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetPreferences: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state
  preferences: DEFAULT_PREFERENCES,
  isLoading: true,
  hasCompletedOnboarding: false,

  // Initialize
  initialize: async () => {
    try {
      set({ isLoading: true });

      const [preferences, onboardingCompleted] = await Promise.all([
        storageService.loadPreferences(),
        storageService.isOnboardingCompleted(),
      ]);

      set({
        preferences,
        hasCompletedOnboarding: onboardingCompleted,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error initializing settings:', error);
      set({ isLoading: false });
    }
  },

  // Update preferences
  updatePreferences: async (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...get().preferences, ...updates };
    set({ preferences: newPreferences });
    await storageService.savePreferences(newPreferences);
  },

  // Set font size
  setFontSize: async (size: FontSize) => {
    await get().updatePreferences({ fontSize: size });
  },

  // Set daily goal
  setDailyGoal: async (goal: number) => {
    await get().updatePreferences({ dailyGoal: goal });
  },

  // Set show translation
  setShowTranslation: async (show: boolean) => {
    await get().updatePreferences({ showTranslation: show });
  },

  // Set translation language
  setTranslationLanguage: async (language: string) => {
    await get().updatePreferences({ translationLanguage: language });
  },

  // Set app language
  setAppLanguage: async (language: AppLanguage) => {
    await get().updatePreferences({ appLanguage: language });
  },

  // Set reminder enabled
  setReminderEnabled: async (enabled: boolean) => {
    await get().updatePreferences({ reminderEnabled: enabled });
  },

  // Set reminder time
  setReminderTime: async (time: string) => {
    await get().updatePreferences({ reminderTime: time });
  },

  // Complete onboarding
  completeOnboarding: async () => {
    await storageService.setOnboardingCompleted(true);
    await get().updatePreferences({ hasCompletedOnboarding: true });
    set({ hasCompletedOnboarding: true });
  },

  // Reset to default preferences
  resetPreferences: async () => {
    set({ preferences: DEFAULT_PREFERENCES });
    await storageService.savePreferences(DEFAULT_PREFERENCES);
  },
}));
