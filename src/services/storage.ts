/**
 * Storage Service
 * Handles local data persistence using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserPreferences, Bookmark } from '../types/user';
import type { MemorizationProgress } from '../types/memorization';
import { DEFAULT_PREFERENCES } from '../types/user';
import { DEFAULT_MEMORIZATION_PROGRESS } from '../types/memorization';

// Storage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: '@quranapp:preferences',
  MEMORIZATION_PROGRESS: '@quranapp:memorization',
  BOOKMARKS: '@quranapp:bookmarks',
  CACHED_DATA_PREFIX: '@quranapp:cache:',
  AUTH_SESSION: '@quranapp:auth_session',
  ONBOARDING_COMPLETED: '@quranapp:onboarding_completed',
} as const;

class StorageService {
  /**
   * Save user preferences
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }

  /**
   * Load user preferences
   */
  async loadPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Save memorization progress
   */
  async saveMemorizationProgress(progress: MemorizationProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.MEMORIZATION_PROGRESS,
        JSON.stringify(progress)
      );
    } catch (error) {
      console.error('Error saving memorization progress:', error);
      throw new Error('Failed to save memorization progress');
    }
  }

  /**
   * Load memorization progress
   */
  async loadMemorizationProgress(): Promise<MemorizationProgress> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEMORIZATION_PROGRESS);
      if (data) {
        return { ...DEFAULT_MEMORIZATION_PROGRESS, ...JSON.parse(data) };
      }
      return DEFAULT_MEMORIZATION_PROGRESS;
    } catch (error) {
      console.error('Error loading memorization progress:', error);
      return DEFAULT_MEMORIZATION_PROGRESS;
    }
  }

  /**
   * Save bookmarks
   */
  async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
      throw new Error('Failed to save bookmarks');
    }
  }

  /**
   * Load bookmarks
   */
  async loadBookmarks(): Promise<Bookmark[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  /**
   * Cache data with key
   */
  async cacheData<T>(key: string, data: T, expiresIn?: number): Promise<void> {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : null,
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.CACHED_DATA_PREFIX + key,
        JSON.stringify(cacheEntry)
      );
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_DATA_PREFIX + key);
      if (!data) return null;

      const cacheEntry = JSON.parse(data);

      // Check if cache has expired
      if (cacheEntry.expiresAt && Date.now() > cacheEntry.expiresAt) {
        await this.removeCachedData(key);
        return null;
      }

      return cacheEntry.data as T;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Remove cached data
   */
  async removeCachedData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHED_DATA_PREFIX + key);
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  }

  /**
   * Check if onboarding has been completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return data === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        completed.toString()
      );
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  }

  /**
   * Clear all app data
   */
  async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith('@quranapp:'));
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear data');
    }
  }

  /**
   * Get storage usage info
   */
  async getStorageInfo(): Promise<{ totalKeys: number; keys: string[] }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith('@quranapp:'));
      return {
        totalKeys: appKeys.length,
        keys: appKeys,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { totalKeys: 0, keys: [] };
    }
  }
}

export const storageService = new StorageService();
