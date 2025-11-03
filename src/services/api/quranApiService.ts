/**
 * Quran API Service with Enhanced Features
 *
 * Built on top of ApiService with:
 * - Automatic retry and caching
 * - IndexedDB offline storage
 * - Circuit breaker protection
 * - Rate limiting
 */

import { ApiService } from './apiService'
import { indexedDB } from '../indexedDB'
import { Surah, Ayah, Reciter, QuranPage } from '../../types/quran'

const QURAN_API_BASE = 'https://api.quran.com/api/v4'
const AUDIO_API_BASE = 'https://everyayah.com/data'

class QuranApiServiceEnhanced {
  private apiService: ApiService

  constructor() {
    this.apiService = new ApiService({
      baseURL: QURAN_API_BASE,
      timeout: 10000,
      maxRetries: 3,
      cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
      enableOfflineMode: true,
      rateLimitConfig: {
        maxConcurrent: 5,
        minDelay: 100
      }
    })
  }

  // ===== CHAPTERS (SURAHS) =====

  /**
   * Get all chapters with offline support
   */
  async getChapters(): Promise<Surah[]> {
    try {
      // Try to get from IndexedDB first
      const cached = await indexedDB.getAllSurahs()
      if (cached.length > 0) {
        console.log('[QuranAPI] Using cached surahs from IndexedDB')
        return cached
      }

      // Fetch from API
      const response = await this.apiService.get('/chapters')
      const surahs = response.data.chapters.map(this.transformChapterData)

      // Save to IndexedDB for offline use
      await indexedDB.saveSurahs(surahs)

      return surahs
    } catch (error) {
      console.error('[QuranAPI] Error fetching chapters:', error)

      // Try IndexedDB as fallback
      const cached = await indexedDB.getAllSurahs()
      if (cached.length > 0) {
        console.warn('[QuranAPI] Using cached surahs due to API error')
        return cached
      }

      throw new Error('Failed to fetch Quran chapters')
    }
  }

  /**
   * Get specific chapter with offline support
   */
  async getChapter(chapterNumber: number): Promise<Surah> {
    try {
      // Try IndexedDB first
      const cached = await indexedDB.getSurah(chapterNumber)
      if (cached) {
        console.log(`[QuranAPI] Using cached surah ${chapterNumber} from IndexedDB`)
        return cached
      }

      // Fetch from API
      const response = await this.apiService.get(`/chapters/${chapterNumber}`)
      const surah = this.transformChapterData(response.data.chapter)

      // Save to IndexedDB
      await indexedDB.saveSurah(surah)

      return surah
    } catch (error) {
      console.error(`[QuranAPI] Error fetching chapter ${chapterNumber}:`, error)

      // Try IndexedDB as fallback
      const cached = await indexedDB.getSurah(chapterNumber)
      if (cached) {
        console.warn(`[QuranAPI] Using cached surah ${chapterNumber} due to API error`)
        return cached
      }

      throw new Error(`Failed to fetch chapter ${chapterNumber}`)
    }
  }

  /**
   * Get verses for a chapter with offline support
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
      // Try IndexedDB first
      const cached = await indexedDB.getAyahsBySurah(chapterNumber)
      if (cached.length > 0) {
        console.log(`[QuranAPI] Using cached verses for surah ${chapterNumber} from IndexedDB`)
        return {
          verses: cached,
          pagination: {
            total_records: cached.length,
            current_page: 1,
            total_pages: 1
          }
        }
      }

      // Fetch from API
      const params = {
        words: true,
        translations: options.translation || '131',
        fields: 'text_uthmani,chapter_number,verse_number,verse_key,juz_number,hizb_number,rub_number,page_number',
        per_page: options.perPage || 50,
        page: options.page || 1
      }

      const response = await this.apiService.get(`/verses/by_chapter/${chapterNumber}`, { params })
      const verses = response.data.verses.map((verse: any) => this.transformVerseData(verse, chapterNumber))

      // Save to IndexedDB
      await indexedDB.saveAyahs(verses)

      return {
        verses,
        pagination: response.data.pagination
      }
    } catch (error) {
      console.error(`[QuranAPI] Error fetching verses for chapter ${chapterNumber}:`, error)

      // Try IndexedDB as fallback
      const cached = await indexedDB.getAyahsBySurah(chapterNumber)
      if (cached.length > 0) {
        console.warn(`[QuranAPI] Using cached verses for surah ${chapterNumber} due to API error`)
        return {
          verses: cached,
          pagination: {
            total_records: cached.length,
            current_page: 1,
            total_pages: 1
          }
        }
      }

      throw new Error(`Failed to fetch verses for chapter ${chapterNumber}`)
    }
  }

  /**
   * Get verses by page with offline support
   */
  async getVersesByPage(pageNumber: number): Promise<QuranPage> {
    try {
      // Try IndexedDB first
      const cachedPage = await indexedDB.getPage(pageNumber)
      if (cachedPage) {
        console.log(`[QuranAPI] Using cached page ${pageNumber} from IndexedDB`)
        return {
          number: pageNumber,
          ayahs: cachedPage.ayahs,
          surahInfo: this.extractSurahInfo(cachedPage.ayahs)
        }
      }

      // Fetch from API
      const response = await this.apiService.get(`/verses/by_page/${pageNumber}`, {
        params: {
          fields: 'text_uthmani,chapter_number,verse_number,verse_key,juz_number,hizb_number,page_number',
          translations: '131'
        }
      })

      const verses = response.data.verses.map((verse: any) => this.transformVerseData(verse))

      // Save to IndexedDB
      await indexedDB.savePage(pageNumber, verses)

      return {
        number: pageNumber,
        ayahs: verses,
        surahInfo: this.extractSurahInfo(verses)
      }
    } catch (error) {
      console.error(`[QuranAPI] Error fetching page ${pageNumber}:`, error)

      // Try IndexedDB as fallback
      const cachedPage = await indexedDB.getPage(pageNumber)
      if (cachedPage) {
        console.warn(`[QuranAPI] Using cached page ${pageNumber} due to API error`)
        return {
          number: pageNumber,
          ayahs: cachedPage.ayahs,
          surahInfo: this.extractSurahInfo(cachedPage.ayahs)
        }
      }

      throw new Error(`Failed to fetch page ${pageNumber}`)
    }
  }

  // ===== RECITERS =====

  /**
   * Get available reciters with offline support
   */
  async getReciters(): Promise<Reciter[]> {
    try {
      // Try IndexedDB first
      const cached = await indexedDB.getReciters()
      if (cached.length > 0) {
        console.log('[QuranAPI] Using cached reciters from IndexedDB')
        return cached
      }

      // Fetch from API
      const response = await this.apiService.get('/resources/recitations')
      const reciters = response.data.recitations.map(this.transformReciterData)

      // Save to IndexedDB
      await indexedDB.saveReciters(reciters)

      return reciters
    } catch (error) {
      console.error('[QuranAPI] Error fetching reciters:', error)

      // Try IndexedDB as fallback
      const cached = await indexedDB.getReciters()
      if (cached.length > 0) {
        console.warn('[QuranAPI] Using cached reciters due to API error')
        return cached
      }

      throw new Error('Failed to fetch reciters')
    }
  }

  /**
   * Get audio URL with automatic fallback
   */
  getAudioUrl(reciterId: string, chapterNumber: number, verseNumber: number): string {
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
    const translation = verse.translations?.[0]?.text || verse.translation || ''
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
      if (!surahMap.has(verse.surah)) {
        surahMap.set(verse.surah, {})
      }

      const info = surahMap.get(verse.surah)!
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
   * Clear all caches
   */
  clearCache(): void {
    this.apiService.clearCache()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.apiService.getCacheStats()
  }

  /**
   * Check if service is online
   */
  isOnline(): boolean {
    return this.apiService.isServiceOnline()
  }
}

// Export singleton instance
export const quranApiService = new QuranApiServiceEnhanced()
export default quranApiService
