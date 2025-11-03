import axios, { AxiosInstance, AxiosResponse } from 'axios'
import {
  Surah,
  Ayah,
  Reciter,
  QuranPage
} from '../types/quran'
import { indexedDB } from '../services/indexedDB'
import { retryWithBackoff, RateLimiter } from './retryLogic'

// Base URLs for different APIs
const QURAN_API_BASE = 'https://api.quran.com/api/v4'
const AUDIO_API_BASE = 'https://everyayah.com/data'

// Cache TTL
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days for IndexedDB cache

/**
 * Enhanced Quran API Service with:
 * - L1 Cache: Memory (fast access)
 * - L2 Cache: IndexedDB (offline support)
 * - Retry logic with exponential backoff
 * - Rate limiting for API calls
 */
class QuranApiEnhancedService {
  private api: AxiosInstance
  private memoryCache: Map<string, any> = new Map()
  private rateLimiter: RateLimiter
  private isOnline: boolean = navigator.onLine

  constructor() {
    this.api = axios.create({
      baseURL: QURAN_API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Rate limiter: max 5 concurrent requests, 100ms between requests
    this.rateLimiter = new RateLimiter(5, 100)

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('[QuranAPI] Network online')
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('[QuranAPI] Network offline - using cached data')
    })

    // Initialize IndexedDB
    this.initializeDB()
  }

  private async initializeDB(): Promise<void> {
    try {
      await indexedDB.init()
      console.log('[QuranAPI] IndexedDB initialized')
    } catch (error) {
      console.error('[QuranAPI] Failed to initialize IndexedDB:', error)
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(url: string, params: any = {}): string {
    return `${url}_${JSON.stringify(params)}`
  }

  /**
   * Get from memory cache (L1)
   */
  private getFromMemoryCache(key: string): any {
    const cached = this.memoryCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    this.memoryCache.delete(key)
    return null
  }

  /**
   * Set memory cache (L1)
   */
  private setMemoryCache(key: string, data: any): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Make API request with retry logic and caching
   */
  private async apiRequest<T>(
    request: () => Promise<AxiosResponse<T>>,
    cacheKey?: string
  ): Promise<T> {
    // Check memory cache first (L1)
    if (cacheKey) {
      const memCached = this.getFromMemoryCache(cacheKey)
      if (memCached) {
        console.log(`[QuranAPI] L1 cache hit: ${cacheKey}`)
        return memCached
      }
    }

    // If offline, we can't make API requests
    if (!this.isOnline) {
      throw new Error('No network connection - please download Quran for offline use')
    }

    // Make API request with retry logic and rate limiting
    try {
      const response = await this.rateLimiter.execute(() =>
        retryWithBackoff(request, {
          maxRetries: 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            console.warn(`[QuranAPI] Retry attempt ${attempt}:`, error.message)
          }
        })
      )

      // Cache the response
      if (cacheKey) {
        this.setMemoryCache(cacheKey, response.data)
      }

      return response.data
    } catch (error: any) {
      console.error('[QuranAPI] Request failed after retries:', error)
      throw error
    }
  }

  // ===== CHAPTERS (SURAHS) =====

  /**
   * Get all chapters/surahs with IndexedDB fallback
   */
  async getChapters(): Promise<Surah[]> {
    const cacheKey = 'chapters_all'

    // Check L1 cache
    const memCached = this.getFromMemoryCache(cacheKey)
    if (memCached) {
      return memCached
    }

    // Check L2 cache (IndexedDB)
    try {
      const dbSurahs = await indexedDB.getAllSurahs()
      if (dbSurahs.length > 0) {
        console.log('[QuranAPI] L2 cache hit: chapters from IndexedDB')
        this.setMemoryCache(cacheKey, dbSurahs)
        return dbSurahs
      }
    } catch (error) {
      console.error('[QuranAPI] Failed to get chapters from IndexedDB:', error)
    }

    // Fetch from API
    try {
      const data = await this.apiRequest(
        () => this.api.get('/chapters'),
        cacheKey
      )

      const surahs = data.chapters.map(this.transformChapterData)

      // Save to IndexedDB for offline use
      await indexedDB.saveSurahs(surahs).catch(err =>
        console.error('[QuranAPI] Failed to save chapters to IndexedDB:', err)
      )

      return surahs
    } catch (error) {
      console.error('[QuranAPI] Failed to fetch chapters:', error)
      throw new Error('Failed to fetch Quran chapters')
    }
  }

  /**
   * Get specific chapter by number
   */
  async getChapter(chapterNumber: number): Promise<Surah> {
    // Check IndexedDB first
    try {
      const dbSurah = await indexedDB.getSurah(chapterNumber)
      if (dbSurah) {
        console.log(`[QuranAPI] L2 cache hit: surah ${chapterNumber}`)
        return dbSurah
      }
    } catch (error) {
      console.error('[QuranAPI] Failed to get surah from IndexedDB:', error)
    }

    // Fetch from API
    try {
      const data = await this.apiRequest(
        () => this.api.get(`/chapters/${chapterNumber}`)
      )

      const surah = this.transformChapterData(data.chapter)

      // Save to IndexedDB
      await indexedDB.saveSurah(surah).catch(err =>
        console.error('[QuranAPI] Failed to save surah to IndexedDB:', err)
      )

      return surah
    } catch (error) {
      console.error(`[QuranAPI] Failed to fetch chapter ${chapterNumber}:`, error)
      throw new Error(`Failed to fetch chapter ${chapterNumber}`)
    }
  }

  /**
   * Get verses for a specific chapter with IndexedDB fallback
   */
  async getChapterVerses(
    chapterNumber: number,
    options: {
      translation?: string
      transliteration?: string
      perPage?: number
      page?: number
    } = {}
  ): Promise<{ verses: Ayah[], pagination: any }> {
    // Check IndexedDB first
    try {
      const dbAyahs = await indexedDB.getAyahsBySurah(chapterNumber)
      if (dbAyahs.length > 0) {
        console.log(`[QuranAPI] L2 cache hit: verses for surah ${chapterNumber}`)
        return {
          verses: dbAyahs,
          pagination: {
            perPage: dbAyahs.length,
            currentPage: 1,
            nextPage: null,
            totalPages: 1,
            totalRecords: dbAyahs.length
          }
        }
      }
    } catch (error) {
      console.error('[QuranAPI] Failed to get verses from IndexedDB:', error)
    }

    // Fetch from API
    try {
      const params = {
        words: true,
        translations: options.translation || '131',
        fields: 'text_uthmani,chapter_number,verse_number,verse_key,juz_number,hizb_number,rub_number,page_number',
        per_page: options.perPage || 50,
        page: options.page || 1,
        ...options
      }

      const data = await this.apiRequest(
        () => this.api.get(`/verses/by_chapter/${chapterNumber}`, { params })
      )

      const verses = data.verses.map((verse: any) =>
        this.transformVerseData(verse, chapterNumber)
      )

      // Save to IndexedDB
      await indexedDB.saveAyahs(verses).catch(err =>
        console.error('[QuranAPI] Failed to save verses to IndexedDB:', err)
      )

      return {
        verses,
        pagination: data.pagination
      }
    } catch (error) {
      console.error(`[QuranAPI] Failed to fetch verses for chapter ${chapterNumber}:`, error)
      throw new Error(`Failed to fetch verses for chapter ${chapterNumber}`)
    }
  }

  /**
   * Get verses by page number (Mushaf format) with IndexedDB fallback
   */
  async getVersesByPage(pageNumber: number): Promise<QuranPage> {
    // Check IndexedDB first
    try {
      const dbPage = await indexedDB.getPage(pageNumber)
      if (dbPage && dbPage.ayahs.length > 0) {
        console.log(`[QuranAPI] L2 cache hit: page ${pageNumber}`)
        const surahInfo = this.extractSurahInfo(dbPage.ayahs)
        return {
          number: pageNumber,
          ayahs: dbPage.ayahs,
          surahInfo
        }
      }
    } catch (error) {
      console.error('[QuranAPI] Failed to get page from IndexedDB:', error)
    }

    // Fetch from API
    try {
      const data = await this.apiRequest(
        () => this.api.get(`/verses/by_page/${pageNumber}`, {
          params: {
            fields: 'text_uthmani,chapter_number,verse_number,verse_key,juz_number,hizb_number,page_number',
            translations: '131'
          }
        })
      )

      const verses = data.verses.map((verse: any) => this.transformVerseData(verse))
      const surahInfo = this.extractSurahInfo(verses)

      // Save to IndexedDB
      await Promise.all([
        indexedDB.savePage(pageNumber, verses),
        indexedDB.saveAyahs(verses)
      ]).catch(err =>
        console.error('[QuranAPI] Failed to save page to IndexedDB:', err)
      )

      return {
        number: pageNumber,
        ayahs: verses,
        surahInfo
      }
    } catch (error) {
      console.error(`[QuranAPI] Failed to fetch page ${pageNumber}:`, error)
      throw new Error(`Failed to fetch page ${pageNumber}`)
    }
  }

  /**
   * Get available reciters with IndexedDB fallback
   */
  async getReciters(): Promise<Reciter[]> {
    const cacheKey = 'reciters_all'

    // Check L1 cache
    const memCached = this.getFromMemoryCache(cacheKey)
    if (memCached) {
      return memCached
    }

    // Check L2 cache (IndexedDB)
    try {
      const dbReciters = await indexedDB.getReciters()
      if (dbReciters.length > 0) {
        console.log('[QuranAPI] L2 cache hit: reciters from IndexedDB')
        this.setMemoryCache(cacheKey, dbReciters)
        return dbReciters
      }
    } catch (error) {
      console.error('[QuranAPI] Failed to get reciters from IndexedDB:', error)
    }

    // Fetch from API
    try {
      const data = await this.apiRequest(
        () => this.api.get('/resources/recitations'),
        cacheKey
      )

      const reciters = data.recitations.map(this.transformReciterData)

      // Save to IndexedDB
      await indexedDB.saveReciters(reciters).catch(err =>
        console.error('[QuranAPI] Failed to save reciters to IndexedDB:', err)
      )

      return reciters
    } catch (error) {
      console.error('[QuranAPI] Failed to fetch reciters:', error)
      throw new Error('Failed to fetch reciters')
    }
  }

  // ===== AUDIO =====

  /**
   * Get audio URL for specific verse and reciter
   */
  getAudioUrl(reciterId: string, chapterNumber: number, verseNumber: number, useProxy: boolean = false): string {
    const reciterMap: { [key: string]: string } = {
      '1': 'Alafasy_128kbps',
      '2': 'AbdurRahman_As-Sudais_192kbps',
      '3': 'MaherAlMuaiqly128kbps',
      '4': 'Saad_Al-Ghamdi_40kbps',
      '5': 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
      '6': 'Hani_Rifai_192kbps',
      '7': 'Abdul_Basit_Murattal_192kbps'
    }

    const reciterDir = reciterMap[reciterId] || reciterMap['7']
    const paddedChapter = chapterNumber.toString().padStart(3, '0')
    const paddedVerse = verseNumber.toString().padStart(3, '0')

    if (useProxy && import.meta.env.DEV) {
      return `/api/audio/data/${reciterDir}/${paddedChapter}${paddedVerse}.mp3`
    }

    return `${AUDIO_API_BASE}/${reciterDir}/${paddedChapter}${paddedVerse}.mp3`
  }

  // ===== HELPER METHODS =====

  private transformChapterData(chapter: any): Surah {
    return {
      number: chapter.id,
      name: chapter.name_arabic,
      englishName: chapter.name_simple,
      englishNameTranslation: chapter.translated_name?.name || '',
      numberOfAyahs: chapter.verses_count,
      revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
      ayahs: []
    }
  }

  private transformVerseData(verse: any, chapterNumber?: number): Ayah {
    const arabicText = verse.text_uthmani || verse.text_madani || ''
    const translation = verse.translation || ''
    const transliteration = verse.transliteration?.text || ''

    return {
      number: verse.verse_number || verse.id,
      text: arabicText,
      numberInSurah: verse.verse_number,
      surah: chapterNumber || verse.chapter_id || 1,
      juz: verse.juz_number || 1,
      manzil: verse.manzil_number || 0,
      page: verse.page_number || 1,
      ruku: verse.ruku_number || 0,
      hizbQuarter: verse.hizb_number || 0,
      translation,
      transliteration
    }
  }

  private transformReciterData(recitation: any): Reciter {
    return {
      id: recitation.id.toString(),
      name: recitation.reciter_name,
      englishName: recitation.reciter_name,
      style: recitation.style || 'Murattal',
      audioFormat: 'mp3'
    }
  }

  private extractSurahInfo(verses: Ayah[]): QuranPage['surahInfo'] {
    const surahMap = new Map<number, { startAyah?: number, endAyah?: number }>()

    verses.forEach(verse => {
      const chapterNum = verse.surah

      if (!surahMap.has(chapterNum)) {
        surahMap.set(chapterNum, {})
      }

      const info = surahMap.get(chapterNum)!
      if (!info.startAyah || verse.numberInSurah < info.startAyah) {
        info.startAyah = verse.numberInSurah
      }
      if (!info.endAyah || verse.numberInSurah > info.endAyah) {
        info.endAyah = verse.numberInSurah
      }
    })

    return Array.from(surahMap.entries()).map(([number, info]) => ({
      number,
      name: `Surah ${number}`,
      ...info
    }))
  }

  /**
   * Get offline status
   */
  isOffline(): boolean {
    return !this.isOnline
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    this.memoryCache.clear()
    await indexedDB.clearAll()
  }
}

// Create singleton instance
export const quranApiEnhanced = new QuranApiEnhancedService()
export default quranApiEnhanced
