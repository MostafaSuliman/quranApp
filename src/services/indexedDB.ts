/**
 * IndexedDB Service for Offline Quran Storage
 *
 * Database: QuranAppDB
 * Version: 1
 *
 * Stores:
 * - quran_surahs: Complete surah information
 * - quran_ayahs: Individual ayah data with translations
 * - translations: Translation metadata
 * - bookmarks: User bookmarks
 * - audio_cache: Audio file metadata
 *
 * Size Estimate: ~22MB for complete Quran with translations
 */

import { Surah, Ayah, Reciter } from '../types/quran'

const DB_NAME = 'QuranAppDB'
const DB_VERSION = 1

// Store names
export const STORES = {
  SURAHS: 'quran_surahs',
  AYAHS: 'quran_ayahs',
  TRANSLATIONS: 'translations',
  BOOKMARKS: 'bookmarks',
  AUDIO_CACHE: 'audio_cache',
  RECITERS: 'reciters',
  PAGES: 'quran_pages'
} as const

export interface QuranDBSchema {
  quran_surahs: {
    key: number
    value: Surah & { lastUpdated: number }
  }
  quran_ayahs: {
    key: string // Format: "surah:ayah" (e.g., "1:1")
    value: Ayah & { lastUpdated: number }
    indexes: {
      bySurah: number
      byPage: number
      byJuz: number
    }
  }
  quran_pages: {
    key: number
    value: {
      pageNumber: number
      ayahs: Ayah[]
      lastUpdated: number
    }
  }
  translations: {
    key: string
    value: {
      id: string
      name: string
      language: string
      data: Record<string, string>
      lastUpdated: number
    }
  }
  bookmarks: {
    key: string
    value: {
      id: string
      surah: number
      ayah: number
      note?: string
      createdAt: number
    }
  }
  audio_cache: {
    key: string // Format: "reciter:surah:ayah"
    value: {
      url: string
      blob?: Blob
      size: number
      lastAccessed: number
    }
  }
  reciters: {
    key: string
    value: Reciter & { lastUpdated: number }
  }
}

export class IndexedDBService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error)
        reject(new Error(`Failed to open IndexedDB: ${request.error}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.SURAHS)) {
          db.createObjectStore(STORES.SURAHS, { keyPath: 'number' })
        }

        if (!db.objectStoreNames.contains(STORES.AYAHS)) {
          const ayahStore = db.createObjectStore(STORES.AYAHS, { keyPath: 'id' })
          ayahStore.createIndex('bySurah', 'surah', { unique: false })
          ayahStore.createIndex('byPage', 'page', { unique: false })
          ayahStore.createIndex('byJuz', 'juz', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.PAGES)) {
          db.createObjectStore(STORES.PAGES, { keyPath: 'pageNumber' })
        }

        if (!db.objectStoreNames.contains(STORES.TRANSLATIONS)) {
          db.createObjectStore(STORES.TRANSLATIONS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORES.BOOKMARKS)) {
          db.createObjectStore(STORES.BOOKMARKS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORES.AUDIO_CACHE)) {
          db.createObjectStore(STORES.AUDIO_CACHE, { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains(STORES.RECITERS)) {
          db.createObjectStore(STORES.RECITERS, { keyPath: 'id' })
        }

        console.log('IndexedDB schema created/updated')
      }
    })

    return this.initPromise
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Failed to initialize database')
    }
    return this.db
  }

  // ===== SURAH OPERATIONS =====

  /**
   * Save a surah to the database
   */
  async saveSurah(surah: Surah): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.SURAHS], 'readwrite')
    const store = transaction.objectStore(STORES.SURAHS)

    const data = {
      ...surah,
      lastUpdated: Date.now()
    }

    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Save multiple surahs at once
   */
  async saveSurahs(surahs: Surah[]): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.SURAHS], 'readwrite')
    const store = transaction.objectStore(STORES.SURAHS)

    return new Promise((resolve, reject) => {
      const timestamp = Date.now()
      let completed = 0

      surahs.forEach(surah => {
        const data = { ...surah, lastUpdated: timestamp }
        const request = store.put(data)

        request.onsuccess = () => {
          completed++
          if (completed === surahs.length) resolve()
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  /**
   * Get a specific surah
   */
  async getSurah(surahNumber: number): Promise<Surah | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.SURAHS], 'readonly')
    const store = transaction.objectStore(STORES.SURAHS)

    return new Promise((resolve, reject) => {
      const request = store.get(surahNumber)
      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const { lastUpdated, ...surah } = result
          resolve(surah as Surah)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all surahs
   */
  async getAllSurahs(): Promise<Surah[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.SURAHS], 'readonly')
    const store = transaction.objectStore(STORES.SURAHS)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const surahs = request.result.map(({ lastUpdated, ...surah }) => surah as Surah)
        resolve(surahs)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // ===== AYAH OPERATIONS =====

  /**
   * Save an ayah to the database
   */
  async saveAyah(ayah: Ayah): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.AYAHS], 'readwrite')
    const store = transaction.objectStore(STORES.AYAHS)

    const data = {
      ...ayah,
      id: `${ayah.surah}:${ayah.numberInSurah}`,
      lastUpdated: Date.now()
    }

    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Save multiple ayahs at once (batch operation)
   */
  async saveAyahs(ayahs: Ayah[]): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.AYAHS], 'readwrite')
    const store = transaction.objectStore(STORES.AYAHS)

    return new Promise((resolve, reject) => {
      const timestamp = Date.now()
      let completed = 0
      let hasError = false

      ayahs.forEach(ayah => {
        if (hasError) return

        const data = {
          ...ayah,
          id: `${ayah.surah}:${ayah.numberInSurah}`,
          lastUpdated: timestamp
        }

        const request = store.put(data)

        request.onsuccess = () => {
          completed++
          if (completed === ayahs.length && !hasError) {
            resolve()
          }
        }

        request.onerror = () => {
          if (!hasError) {
            hasError = true
            reject(request.error)
          }
        }
      })

      if (ayahs.length === 0) {
        resolve()
      }
    })
  }

  /**
   * Get a specific ayah
   */
  async getAyah(surah: number, ayahNumber: number): Promise<Ayah | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.AYAHS], 'readonly')
    const store = transaction.objectStore(STORES.AYAHS)

    return new Promise((resolve, reject) => {
      const request = store.get(`${surah}:${ayahNumber}`)
      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const { id, lastUpdated, ...ayah } = result
          resolve(ayah as Ayah)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all ayahs for a surah
   */
  async getAyahsBySurah(surahNumber: number): Promise<Ayah[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.AYAHS], 'readonly')
    const store = transaction.objectStore(STORES.AYAHS)
    const index = store.index('bySurah')

    return new Promise((resolve, reject) => {
      const request = index.getAll(surahNumber)
      request.onsuccess = () => {
        const ayahs = request.result.map(({ id, lastUpdated, ...ayah }) => ayah as Ayah)
        // Sort by verse number
        ayahs.sort((a, b) => a.numberInSurah - b.numberInSurah)
        resolve(ayahs)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get ayahs by page number
   */
  async getAyahsByPage(pageNumber: number): Promise<Ayah[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.AYAHS], 'readonly')
    const store = transaction.objectStore(STORES.AYAHS)
    const index = store.index('byPage')

    return new Promise((resolve, reject) => {
      const request = index.getAll(pageNumber)
      request.onsuccess = () => {
        const ayahs = request.result.map(({ id, lastUpdated, ...ayah }) => ayah as Ayah)
        resolve(ayahs)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // ===== PAGE OPERATIONS =====

  /**
   * Save page data
   */
  async savePage(pageNumber: number, ayahs: Ayah[]): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.PAGES], 'readwrite')
    const store = transaction.objectStore(STORES.PAGES)

    const data = {
      pageNumber,
      ayahs,
      lastUpdated: Date.now()
    }

    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get page data
   */
  async getPage(pageNumber: number): Promise<{ ayahs: Ayah[], lastUpdated: number } | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.PAGES], 'readonly')
    const store = transaction.objectStore(STORES.PAGES)

    return new Promise((resolve, reject) => {
      const request = store.get(pageNumber)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // ===== RECITER OPERATIONS =====

  /**
   * Save reciters
   */
  async saveReciters(reciters: Reciter[]): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.RECITERS], 'readwrite')
    const store = transaction.objectStore(STORES.RECITERS)

    return new Promise((resolve, reject) => {
      const timestamp = Date.now()
      let completed = 0

      reciters.forEach(reciter => {
        const data = { ...reciter, lastUpdated: timestamp }
        const request = store.put(data)

        request.onsuccess = () => {
          completed++
          if (completed === reciters.length) resolve()
        }
        request.onerror = () => reject(request.error)
      })

      if (reciters.length === 0) resolve()
    })
  }

  /**
   * Get all reciters
   */
  async getReciters(): Promise<Reciter[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.RECITERS], 'readonly')
    const store = transaction.objectStore(STORES.RECITERS)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const reciters = request.result.map(({ lastUpdated, ...reciter }) => reciter as Reciter)
        resolve(reciters)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // ===== BOOKMARK OPERATIONS =====

  /**
   * Add a bookmark
   */
  async addBookmark(surah: number, ayah: number, note?: string): Promise<string> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.BOOKMARKS], 'readwrite')
    const store = transaction.objectStore(STORES.BOOKMARKS)

    const id = `${surah}:${ayah}`
    const data = {
      id,
      surah,
      ayah,
      note,
      createdAt: Date.now()
    }

    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all bookmarks
   */
  async getBookmarks(): Promise<Array<{ id: string, surah: number, ayah: number, note?: string, createdAt: number }>> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.BOOKMARKS], 'readonly')
    const store = transaction.objectStore(STORES.BOOKMARKS)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete a bookmark
   */
  async deleteBookmark(id: string): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([STORES.BOOKMARKS], 'readwrite')
    const store = transaction.objectStore(STORES.BOOKMARKS)

    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Get storage size estimate
   */
  async getStorageEstimate(): Promise<{ usage: number, quota: number, percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
      }
    }
    return { usage: 0, quota: 0, percentage: 0 }
  }

  /**
   * Check if complete Quran is downloaded
   */
  async isQuranDownloaded(): Promise<boolean> {
    const surahs = await this.getAllSurahs()
    return surahs.length === 114
  }

  /**
   * Get download progress
   */
  async getDownloadProgress(): Promise<{ total: number, downloaded: number, percentage: number }> {
    const surahs = await this.getAllSurahs()
    const total = 114
    const downloaded = surahs.length

    return {
      total,
      downloaded,
      percentage: (downloaded / total) * 100
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB()
    const storeNames = Array.from(db.objectStoreNames)
    const transaction = db.transaction(storeNames, 'readwrite')

    return new Promise((resolve, reject) => {
      let completed = 0
      const total = storeNames.length

      storeNames.forEach(storeName => {
        const request = transaction.objectStore(storeName).clear()
        request.onsuccess = () => {
          completed++
          if (completed === total) resolve()
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}

// Create singleton instance
export const indexedDB = new IndexedDBService()
export default indexedDB
