/**
 * AsyncStorage wrapper for React Native
 * Stores ONLY references and progress data, never Quranic text
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PageProgress, DailyProgress, UserStats } from '@/types'

// Storage keys
const KEYS = {
  PAGE_PROGRESS: 'page_progress_',
  DAILY_PROGRESS: 'daily_progress_',
  USER_STATS: 'user_stats',
  API_CACHE: 'api_cache_',
  BOOKMARKS: 'bookmarks',
  SETTINGS: 'settings_',
}

// Page Progress operations
export async function getPageProgress(pageNumber: number): Promise<PageProgress | undefined> {
  try {
    const data = await AsyncStorage.getItem(`${KEYS.PAGE_PROGRESS}${pageNumber}`)
    return data ? JSON.parse(data) : undefined
  } catch (error) {
    console.error('Failed to get page progress:', error)
    return undefined
  }
}

export async function setPageProgress(progress: PageProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${KEYS.PAGE_PROGRESS}${progress.pageNumber}`,
      JSON.stringify(progress)
    )
  } catch (error) {
    console.error('Failed to set page progress:', error)
  }
}

export async function getAllPageProgress(): Promise<PageProgress[]> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const progressKeys = keys.filter(k => k.startsWith(KEYS.PAGE_PROGRESS))
    const items = await AsyncStorage.multiGet(progressKeys)
    return items
      .map(([_, value]) => (value ? JSON.parse(value) : null))
      .filter(Boolean) as PageProgress[]
  } catch (error) {
    console.error('Failed to get all page progress:', error)
    return []
  }
}

export async function getPagesByStatus(status: string): Promise<PageProgress[]> {
  const allProgress = await getAllPageProgress()
  return allProgress.filter(p => p.status === status)
}

// Daily Progress operations
export async function getDailyProgress(date: string): Promise<DailyProgress | undefined> {
  try {
    const data = await AsyncStorage.getItem(`${KEYS.DAILY_PROGRESS}${date}`)
    return data ? JSON.parse(data) : undefined
  } catch (error) {
    console.error('Failed to get daily progress:', error)
    return undefined
  }
}

export async function setDailyProgress(progress: DailyProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${KEYS.DAILY_PROGRESS}${progress.date}`,
      JSON.stringify(progress)
    )
  } catch (error) {
    console.error('Failed to set daily progress:', error)
  }
}

export async function getRecentDailyProgress(days: number = 30): Promise<DailyProgress[]> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const progressKeys = keys
      .filter(k => k.startsWith(KEYS.DAILY_PROGRESS))
      .sort()
      .slice(-days)
    const items = await AsyncStorage.multiGet(progressKeys)
    return items
      .map(([_, value]) => (value ? JSON.parse(value) : null))
      .filter(Boolean) as DailyProgress[]
  } catch (error) {
    console.error('Failed to get recent daily progress:', error)
    return []
  }
}

// User Stats operations
export async function getUserStats(): Promise<UserStats | undefined> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_STATS)
    return data ? JSON.parse(data) : undefined
  } catch (error) {
    console.error('Failed to get user stats:', error)
    return undefined
  }
}

export async function setUserStats(stats: UserStats): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats))
  } catch (error) {
    console.error('Failed to set user stats:', error)
  }
}

// API Cache operations
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(`${KEYS.API_CACHE}${key}`)
    if (!data) return null

    let cached: { data: T; expiresAt: number }
    try {
      cached = JSON.parse(data)
    } catch (parseError) {
      // Cache is corrupted, remove it
      console.warn(`Corrupted cache for key ${key}, removing...`)
      await AsyncStorage.removeItem(`${KEYS.API_CACHE}${key}`)
      return null
    }

    // Check if expired
    if (!cached.expiresAt || Date.now() > cached.expiresAt) {
      await AsyncStorage.removeItem(`${KEYS.API_CACHE}${key}`)
      return null
    }

    // Validate cached data exists
    if (cached.data === undefined || cached.data === null) {
      await AsyncStorage.removeItem(`${KEYS.API_CACHE}${key}`)
      return null
    }

    return cached.data as T
  } catch (error) {
    console.error('Failed to get cached data:', error)
    // Clear potentially corrupted cache
    try {
      await AsyncStorage.removeItem(`${KEYS.API_CACHE}${key}`)
    } catch {}
    return null
  }
}

export async function setCachedData(
  key: string,
  data: unknown,
  ttlMs: number = 24 * 60 * 60 * 1000 // 24 hours default
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${KEYS.API_CACHE}${key}`,
      JSON.stringify({
        data,
        cachedAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
      })
    )
  } catch (error) {
    console.error('Failed to set cached data:', error)
  }
}

// Bookmarks operations
export interface Bookmark {
  id: string
  pageNumber: number
  surahNumber: number
  ayahNumber: number
  label: string
  createdAt: string
}

export async function getBookmarks(): Promise<Bookmark[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.BOOKMARKS)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to get bookmarks:', error)
    return []
  }
}

export async function addBookmark(bookmark: Omit<Bookmark, 'id'>): Promise<void> {
  try {
    const bookmarks = await getBookmarks()
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
    }
    bookmarks.push(newBookmark)
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks))
  } catch (error) {
    console.error('Failed to add bookmark:', error)
  }
}

export async function deleteBookmark(id: string): Promise<void> {
  try {
    const bookmarks = await getBookmarks()
    const filtered = bookmarks.filter(b => b.id !== id)
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete bookmark:', error)
  }
}

// Settings operations
export async function getSetting<T>(key: string): Promise<T | undefined> {
  try {
    const data = await AsyncStorage.getItem(`${KEYS.SETTINGS}${key}`)
    return data ? JSON.parse(data) : undefined
  } catch (error) {
    console.error('Failed to get setting:', error)
    return undefined
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(`${KEYS.SETTINGS}${key}`, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to set setting:', error)
  }
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    console.error('Failed to clear all data:', error)
  }
}
