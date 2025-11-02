import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  Surah, 
  Ayah, 
  Reciter, 
  QuranPage
} from '../types/quran'

// Base URLs for different APIs
const QURAN_API_BASE = 'https://api.quran.com/api/v4'
const AUDIO_API_BASE = 'https://everyayah.com/data'

class QuranApiService {
  private api: AxiosInstance
  private cache: Map<string, any> = new Map()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.api = axios.create({
      baseURL: QURAN_API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Request interceptor for caching
    this.api.interceptors.request.use((config) => {
      const cacheKey = this.generateCacheKey(config.url || '', config.params || {})
      const cached = this.getFromCache(cacheKey)
      
      if (cached) {
        // Return cached data as a resolved promise
        return Promise.reject({ 
          cached: true, 
          data: cached,
          config
        })
      }
      
      return config
    })

    // Response interceptor for caching
    this.api.interceptors.response.use(
      (response) => {
        const cacheKey = this.generateCacheKey(
          response.config.url || '', 
          response.config.params || {}
        )
        this.setCache(cacheKey, response.data)
        return response
      },
      (error) => {
        // Handle cached responses
        if (error.cached) {
          return Promise.resolve({
            data: error.data,
            status: 200,
            statusText: 'OK (Cached)',
            config: error.config,
            headers: {}
          } as AxiosResponse)
        }
        return Promise.reject(error)
      }
    )
  }

  private generateCacheKey(url: string, params: any): string {
    return `${url}_${JSON.stringify(params)}`
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // ===== CHAPTERS (SURAHS) =====
  
  /**
   * Get all chapters/surahs with basic information
   */
  async getChapters(): Promise<Surah[]> {
    try {
      const response = await this.api.get('/chapters')
      return response.data.chapters.map(this.transformChapterData)
    } catch (error) {
      console.error('Error fetching chapters:', error)
      throw new Error('Failed to fetch Quran chapters')
    }
  }

  /**
   * Get specific chapter by number
   */
  async getChapter(chapterNumber: number): Promise<Surah> {
    try {
      const response = await this.api.get(`/chapters/${chapterNumber}`)
      return this.transformChapterData(response.data.chapter)
    } catch (error) {
      console.error(`Error fetching chapter ${chapterNumber}:`, error)
      throw new Error(`Failed to fetch chapter ${chapterNumber}`)
    }
  }

  /**
   * Get verses for a specific chapter
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
    try {
      const params = {
        words: true,
        translations: options.translation || '131', // Dr. Mustafa Khattab
        fields: 'text_uthmani,chapter_number,verse_number,verse_key,juz_number,hizb_number,rub_number,page_number',
        per_page: options.perPage || 50,
        page: options.page || 1,
        ...options
      }

      const response = await this.api.get(`/verses/by_chapter/${chapterNumber}`, { params })
      
      return {
        verses: response.data.verses.map((verse: any) => this.transformVerseData(verse, chapterNumber)),
        pagination: response.data.pagination
      }
    } catch (error) {
      console.error(`Error fetching verses for chapter ${chapterNumber}:`, error)
      throw new Error(`Failed to fetch verses for chapter ${chapterNumber}`)
    }
  }

  /**
   * Get verses by page number (Mushaf format)
   */
  async getVersesByPage(pageNumber: number): Promise<QuranPage> {
    try {
      const response = await this.api.get(`/verses/by_page/${pageNumber}`, {
        params: {
          fields: 'text_uthmani,chapter_number,verse_number,verse_key,juz_number,hizb_number,page_number',
          translations: '131' // Dr. Mustafa Khattab
        }
      })

      const verses = response.data.verses.map((verse: any) => this.transformVerseData(verse))
      const surahInfo = this.extractSurahInfo(verses)

      return {
        number: pageNumber,
        ayahs: verses,
        surahInfo
      }
    } catch (error) {
      console.error(`Error fetching page ${pageNumber}:`, error)
      throw new Error(`Failed to fetch page ${pageNumber}`)
    }
  }

  /**
   * Get specific verse by chapter and verse number
   */
  async getVerse(chapterNumber: number, verseNumber: number): Promise<Ayah> {
    try {
      const response = await this.api.get(`/chapters/${chapterNumber}/verses/${verseNumber}`, {
        params: {
          fields: 'text_uthmani,chapter_number,verse_number,verse_key,juz_number,hizb_number,page_number',
          translations: '131'
        }
      })

      return this.transformVerseData(response.data.verse)
    } catch (error) {
      console.error(`Error fetching verse ${chapterNumber}:${verseNumber}:`, error)
      throw new Error(`Failed to fetch verse ${chapterNumber}:${verseNumber}`)
    }
  }

  // ===== AUDIO =====

  /**
   * Get available reciters
   */
  async getReciters(): Promise<Reciter[]> {
    try {
      const response = await this.api.get('/resources/recitations')
      return response.data.recitations.map(this.transformReciterData)
    } catch (error) {
      console.error('Error fetching reciters:', error)
      throw new Error('Failed to fetch reciters')
    }
  }

  /**
   * Get audio URL for specific verse and reciter with CORS/CSP compatibility
   */
  getAudioUrl(reciterId: string, chapterNumber: number, verseNumber: number, useProxy: boolean = false): string {
    const reciterDir = this.getReciterDirectory(reciterId)
    const paddedChapter = chapterNumber.toString().padStart(3, '0')
    const paddedVerse = verseNumber.toString().padStart(3, '0')
    
    if (useProxy && import.meta.env.DEV) {
      // Use Vite proxy in development to avoid CORS issues
      return `/api/audio/data/${reciterDir}/${paddedChapter}${paddedVerse}.mp3`
    }
    
    // Direct EveryAyah format (now allowed by updated CSP)
    return `${AUDIO_API_BASE}/${reciterDir}/${paddedChapter}${paddedVerse}.mp3`
  }

  /**
   * Get audio URL with automatic fallback to proxy if direct access fails
   */
  async getAudioUrlWithFallback(reciterId: string, chapterNumber: number, verseNumber: number): Promise<string> {
    const directUrl = this.getAudioUrl(reciterId, chapterNumber, verseNumber, false)
    
    // In development, test if direct URL is accessible
    if (import.meta.env.DEV) {
      try {
        const response = await fetch(directUrl, { method: 'HEAD' })
        if (response.ok) {
          return directUrl
        }
      } catch (error) {
        console.warn('Direct audio URL failed, falling back to proxy:', error)
      }
      
      // Fallback to proxy
      return this.getAudioUrl(reciterId, chapterNumber, verseNumber, true)
    }
    
    return directUrl
  }

  /**
   * Get chapter audio URL (full chapter) with proxy support
   */
  getChapterAudioUrl(reciterId: string, chapterNumber: number, useProxy: boolean = false): string {
    const reciterDir = this.getReciterDirectory(reciterId)
    const paddedChapter = chapterNumber.toString().padStart(3, '0')
    
    if (useProxy && import.meta.env.DEV) {
      return `/api/audio/data/${reciterDir}/${paddedChapter}.mp3`
    }
    
    return `${AUDIO_API_BASE}/${reciterDir}/${paddedChapter}.mp3`
  }

  // ===== TRANSLATIONS =====

  /**
   * Get available translations
   */
  async getTranslations(): Promise<any[]> {
    try {
      const response = await this.api.get('/resources/translations')
      return response.data.translations
    } catch (error) {
      console.error('Error fetching translations:', error)
      throw new Error('Failed to fetch translations')
    }
  }

  // ===== SEARCH =====

  /**
   * Search verses by query
   */
  async searchVerses(query: string, options: {
    size?: number
    page?: number
    translation?: string
  } = {}): Promise<{ verses: Ayah[], pagination: any }> {
    try {
      const params = {
        q: query,
        size: options.size || 20,
        page: options.page || 0,
        translation: options.translation || '131'
      }

      const response = await this.api.get('/search', { params })
      
      return {
        verses: response.data.search.results.map((result: any) => this.transformVerseData(result)),
        pagination: response.data.search.pagination
      }
    } catch (error) {
      console.error('Error searching verses:', error)
      throw new Error('Failed to search verses')
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Calculate global ayah number for CDN audio access
   * The Quran has 6236 ayahs total, numbered sequentially
   */
  private calculateGlobalAyahNumber(chapterNumber: number, verseNumber: number): number {
    // Number of ayahs in each surah (1-114)
    const ayahCounts = [
      7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
      112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59,
      37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
      28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5,
      8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
    ]
    
    // Calculate total ayahs before this chapter
    let totalAyahs = 0
    for (let i = 0; i < chapterNumber - 1; i++) {
      totalAyahs += ayahCounts[i]
    }
    
    // Add the verse number in current chapter
    return totalAyahs + verseNumber
  }

  private getReciterDirectory(reciterId: string): string {
    const reciterMap: Record<string, string> = {
      '1': 'Alafasy_128kbps',
      '2': 'AbdurRahman_As-Sudais_192kbps',
      '3': 'MaherAlMuaiqly128kbps',
      '4': 'Saad_Al-Ghamdi_40kbps',
      '5': 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
      '6': 'Hani_Rifai_192kbps',
      '7': 'Abdul_Basit_Murattal_192kbps'
    }

    if (reciterId in reciterMap) {
      return reciterMap[reciterId]
    }

    // Some APIs may already provide directory names
    if (reciterId.includes('/')) {
      return reciterId
    }

    return reciterMap['7']
  }

  private getBasicTranslation(chapterNumber: number, verseNumber: number): string {
    // Basic translations for Al-Fatiha (Chapter 1) to get started
    if (chapterNumber === 1) {
      const fatihaTranslations: { [key: number]: string } = {
        1: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        2: "[All] praise is [due] to Allah, Lord of the worlds -",
        3: "The Entirely Merciful, the Especially Merciful,",
        4: "Sovereign of the Day of Recompense.",
        5: "It is You we worship and You we ask for help.",
        6: "Guide us to the straight path -",
        7: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray."
      }
      return fatihaTranslations[verseNumber] || `Verse ${verseNumber} of Surah ${chapterNumber}`
    }
    
    // For other chapters, provide a placeholder until we implement full translation API
    return `Verse ${verseNumber} of Surah ${chapterNumber} - Translation will be loaded soon.`
  }

  // ===== DATA TRANSFORMERS =====

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
    // Use text_uthmani directly from API response - this is the preferred Arabic text
    const arabicText = verse.text_uthmani || verse.text_madani || ''

    // Get translation from the verse object (either from API or our helper)
    const translation = verse.translation || ''

    // Get transliteration if available (not always provided by the API)
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
      const chapterNum = Math.floor(verse.number / 1000) // Assuming verse.number format
      
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

    // This would need chapter name lookup - simplified for now
    return Array.from(surahMap.entries()).map(([number, info]) => ({
      number,
      name: `Surah ${number}`, // Would need actual name lookup
      ...info
    }))
  }

  // ===== UTILITY METHODS =====

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Create singleton instance
export const quranApi = new QuranApiService()

// Named exports for specific functionality
export const {
  getChapters,
  getChapter,
  getChapterVerses,
  getVersesByPage,
  getVerse,
  getReciters,
  getAudioUrl,
  getAudioUrlWithFallback,
  getChapterAudioUrl,
  getTranslations,
  searchVerses,
  clearCache,
  getCacheStats
} = quranApi

export default quranApi
