import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { PageProgress, DailyProgress, UserStats } from '@/types'

/**
 * IndexedDB storage for offline-first functionality
 * Stores ONLY references and progress data, never Quranic text
 */

interface QuranAppDB extends DBSchema {
  // Page progress tracking
  pageProgress: {
    key: number // pageNumber
    value: PageProgress
    indexes: {
      'by-status': string
      'by-next-review': string
    }
  }

  // Daily progress history
  dailyProgress: {
    key: string // date string YYYY-MM-DD
    value: DailyProgress
  }

  // User statistics
  userStats: {
    key: string // 'stats'
    value: UserStats
  }

  // Cached API responses (for offline use)
  apiCache: {
    key: string // cache key (e.g., 'surahs', 'reciters', 'page-42')
    value: {
      data: unknown
      cachedAt: number
      expiresAt: number
    }
  }

  // Downloaded audio files metadata
  audioDownloads: {
    key: string // reciterId-surahNumber-ayahNumber
    value: {
      reciterId: string
      surahNumber: number
      ayahNumber: number
      url: string
      downloadedAt: number
    }
  }

  // Bookmarks
  bookmarks: {
    key: number // auto-increment
    value: {
      id?: number
      pageNumber: number
      surahNumber: number
      ayahNumber: number
      label: string
      createdAt: string
    }
  }

  // Settings
  settings: {
    key: string
    value: unknown
  }
}

const DB_NAME = 'quran-app'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<QuranAppDB> | null = null

/**
 * Get or create the database instance
 */
export async function getDB(): Promise<IDBPDatabase<QuranAppDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<QuranAppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Page progress store
      if (!db.objectStoreNames.contains('pageProgress')) {
        const pageStore = db.createObjectStore('pageProgress', { keyPath: 'pageNumber' })
        pageStore.createIndex('by-status', 'status')
        pageStore.createIndex('by-next-review', 'nextReviewAt')
      }

      // Daily progress store
      if (!db.objectStoreNames.contains('dailyProgress')) {
        db.createObjectStore('dailyProgress', { keyPath: 'date' })
      }

      // User stats store
      if (!db.objectStoreNames.contains('userStats')) {
        db.createObjectStore('userStats')
      }

      // API cache store
      if (!db.objectStoreNames.contains('apiCache')) {
        db.createObjectStore('apiCache')
      }

      // Audio downloads store
      if (!db.objectStoreNames.contains('audioDownloads')) {
        db.createObjectStore('audioDownloads')
      }

      // Bookmarks store
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true })
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings')
      }
    },
  })

  return dbInstance
}

// Page Progress operations
export async function getPageProgress(pageNumber: number): Promise<PageProgress | undefined> {
  const db = await getDB()
  return db.get('pageProgress', pageNumber)
}

export async function setPageProgress(progress: PageProgress): Promise<void> {
  const db = await getDB()
  await db.put('pageProgress', progress)
}

export async function getAllPageProgress(): Promise<PageProgress[]> {
  const db = await getDB()
  return db.getAll('pageProgress')
}

export async function getPagesByStatus(status: string): Promise<PageProgress[]> {
  const db = await getDB()
  return db.getAllFromIndex('pageProgress', 'by-status', status)
}

// Daily Progress operations
export async function getDailyProgress(date: string): Promise<DailyProgress | undefined> {
  const db = await getDB()
  return db.get('dailyProgress', date)
}

export async function setDailyProgress(progress: DailyProgress): Promise<void> {
  const db = await getDB()
  await db.put('dailyProgress', progress)
}

export async function getRecentDailyProgress(days: number = 30): Promise<DailyProgress[]> {
  const db = await getDB()
  const all = await db.getAll('dailyProgress')
  return all.slice(-days)
}

// User Stats operations
export async function getUserStats(): Promise<UserStats | undefined> {
  const db = await getDB()
  return db.get('userStats', 'stats')
}

export async function setUserStats(stats: UserStats): Promise<void> {
  const db = await getDB()
  await db.put('userStats', stats, 'stats')
}

// API Cache operations
export async function getCachedData<T>(key: string): Promise<T | null> {
  const db = await getDB()
  const cached = await db.get('apiCache', key)

  if (!cached) return null

  // Check if expired
  if (Date.now() > cached.expiresAt) {
    await db.delete('apiCache', key)
    return null
  }

  return cached.data as T
}

export async function setCachedData(
  key: string,
  data: unknown,
  ttlMs: number = 24 * 60 * 60 * 1000 // 24 hours default
): Promise<void> {
  const db = await getDB()
  await db.put('apiCache', {
    data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  }, key)
}

// Settings operations
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get('settings', key) as Promise<T | undefined>
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put('settings', value, key)
}

// Bookmarks operations
export async function addBookmark(bookmark: Omit<QuranAppDB['bookmarks']['value'], 'id'>): Promise<number> {
  const db = await getDB()
  return db.add('bookmarks', bookmark as QuranAppDB['bookmarks']['value'])
}

export async function getBookmarks(): Promise<QuranAppDB['bookmarks']['value'][]> {
  const db = await getDB()
  return db.getAll('bookmarks')
}

export async function deleteBookmark(id: number): Promise<void> {
  const db = await getDB()
  await db.delete('bookmarks', id)
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await Promise.all([
    db.clear('pageProgress'),
    db.clear('dailyProgress'),
    db.clear('userStats'),
    db.clear('apiCache'),
    db.clear('audioDownloads'),
    db.clear('bookmarks'),
    db.clear('settings'),
  ])
}
