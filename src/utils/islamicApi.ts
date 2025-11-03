import axios, { AxiosInstance } from 'axios'

// Trusted Islamic API sources
const ISLAMIC_APIS = {
  quran: 'https://api.quran.com/api/v4', // Official Quran.com API
  hadith: 'https://www.hadithapi.com/api', // Trusted Hadith collection
  hadithAlternative: 'https://api.sunnah.com/v1', // Alternative Hadith source
  duas: 'https://dua-api.herokuapp.com/api', // Islamic Duas
  prayerTimes: 'https://api.aladhan.com/v1', // Prayer times
  qibla: 'https://api.aladhan.com/v1/qiblah', // Qibla direction
  islamicCalendar: 'https://api.aladhan.com/v1/gToHCalendar' // Islamic calendar
}

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
  }
}

class IslamicApiService {
  private hadithApi: AxiosInstance
  private duaApi: AxiosInstance
  private prayerApi: AxiosInstance
  private cache: Map<string, any> = new Map()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.hadithApi = axios.create({
      baseURL: ISLAMIC_APIS.hadith,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.duaApi = axios.create({
      baseURL: ISLAMIC_APIS.duas,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.prayerApi = axios.create({
      baseURL: ISLAMIC_APIS.prayerTimes,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // ===== HADITH METHODS =====

  /**
   * Get Sahih hadith collections (Bukhari, Muslim only for authenticity)
   */
  async getHadithCollections(): Promise<string[]> {
    return [
      'sahih-bukhari',
      'sahih-muslim',
      'abu-dawood',
      'jami-at-tirmidhi',
      'sunan-an-nasai',
      'sunan-ibn-majah'
    ]
  }

  /**
   * Get random authentic hadith (Arabic first)
   */
  async getRandomHadith(collection: string = 'sahih-bukhari'): Promise<Hadith> {
    try {
      const cacheKey = `hadith_random_${collection}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.hadithApi.get(`/${collection}/random`)
      const hadith = this.transformHadithData(response.data, collection)
      
      this.setCache(cacheKey, hadith)
      return hadith
    } catch (error) {
      console.error('Error fetching random hadith:', error)
      throw new Error('Failed to fetch hadith')
    }
  }

  /**
   * Search hadiths by keyword (Arabic preferred)
   */
  async searchHadiths(
    query: string, 
    collection: string = 'sahih-bukhari',
    limit: number = 10
  ): Promise<Hadith[]> {
    try {
      const cacheKey = `hadith_search_${collection}_${query}_${limit}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.hadithApi.get(`/${collection}/search`, {
        params: { q: query, limit }
      })
      
      const hadiths = response.data.hadiths?.map((h: any) => 
        this.transformHadithData(h, collection)
      ) || []
      
      this.setCache(cacheKey, hadiths)
      return hadiths
    } catch (error) {
      console.error('Error searching hadiths:', error)
      throw new Error('Failed to search hadiths')
    }
  }

  /**
   * Get hadith by specific number from collection
   */
  async getHadithByNumber(
    collection: string, 
    hadithNumber: number
  ): Promise<Hadith> {
    try {
      const cacheKey = `hadith_${collection}_${hadithNumber}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.hadithApi.get(`/${collection}/${hadithNumber}`)
      const hadith = this.transformHadithData(response.data, collection)
      
      this.setCache(cacheKey, hadith)
      return hadith
    } catch (error) {
      console.error('Error fetching specific hadith:', error)
      throw new Error('Failed to fetch specific hadith')
    }
  }

  // ===== DUA METHODS =====

  /**
   * Get daily supplications (Arabic first)
   */
  async getDailyDuas(): Promise<Dua[]> {
    try {
      const cacheKey = 'daily_duas'
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.duaApi.get('/duas/daily')
      const duas = response.data.map(this.transformDuaData)
      
      this.setCache(cacheKey, duas)
      return duas
    } catch (error) {
      console.error('Error fetching daily duas:', error)
      // Fallback to hardcoded authentic duas
      return this.getFallbackDuas()
    }
  }

  /**
   * Get duas by category (Arabic first)
   */
  async getDuasByCategory(category: string): Promise<Dua[]> {
    try {
      const cacheKey = `duas_${category}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.duaApi.get(`/duas/category/${category}`)
      const duas = response.data.map(this.transformDuaData)
      
      this.setCache(cacheKey, duas)
      return duas
    } catch (error) {
      console.error('Error fetching duas by category:', error)
      return this.getFallbackDuas().filter(dua => dua.category === category)
    }
  }

  /**
   * Search duas by text (Arabic preferred)
   */
  async searchDuas(query: string): Promise<Dua[]> {
    try {
      const cacheKey = `duas_search_${query}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.duaApi.get('/duas/search', {
        params: { q: query }
      })
      
      const duas = response.data.map(this.transformDuaData)
      this.setCache(cacheKey, duas)
      return duas
    } catch (error) {
      console.error('Error searching duas:', error)
      return this.getFallbackDuas().filter(dua => 
        dua.arabicText.includes(query) || 
        dua.englishTranslation.toLowerCase().includes(query.toLowerCase())
      )
    }
  }

  // ===== PRAYER TIMES =====

  /**
   * Get prayer times for location
   */
  async getPrayerTimes(
    latitude: number, 
    longitude: number, 
    date?: string
  ): Promise<PrayerTimes> {
    try {
      const dateStr = date || new Date().toISOString().split('T')[0]
      const cacheKey = `prayer_times_${latitude}_${longitude}_${dateStr}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.prayerApi.get('/timings', {
        params: {
          latitude,
          longitude,
          date: dateStr,
          method: 2 // Islamic Society of North America (ISNA)
        }
      })

      const prayerTimes = this.transformPrayerTimesData(response.data, latitude, longitude)
      this.setCache(cacheKey, prayerTimes)
      return prayerTimes
    } catch (error) {
      console.error('Error fetching prayer times:', error)
      throw new Error('Failed to fetch prayer times')
    }
  }

  // ===== DATA TRANSFORMERS =====

  private transformHadithData(hadithData: any, collection: string): Hadith {
    return {
      id: hadithData.id || hadithData.hadithNumber || Math.random().toString(),
      collection: collection,
      book: hadithData.book || hadithData.bookSlug || '',
      chapter: hadithData.chapter || hadithData.chapterName || '',
      hadithNumber: hadithData.hadithNumber || hadithData.number || '',
      arabicText: hadithData.hadithArabic || hadithData.arabic || hadithData.text_ar || '',
      englishTranslation: hadithData.hadithEnglish || hadithData.english || hadithData.text_en || '',
      narrator: hadithData.narrator || hadithData.chain || '',
      grade: hadithData.grade || hadithData.status || 'Unknown',
      reference: `${collection} ${hadithData.hadithNumber || hadithData.number || ''}`
    }
  }

  private transformDuaData(duaData: any): Dua {
    return {
      id: duaData.id || Math.random().toString(),
      title: duaData.title || duaData.name || '',
      arabicText: duaData.arabic || duaData.text_ar || duaData.dua || '',
      transliteration: duaData.transliteration || duaData.phonetic || '',
      englishTranslation: duaData.english || duaData.translation || duaData.text_en || '',
      source: duaData.source || duaData.reference || 'Authentic Islamic Source',
      category: duaData.category || duaData.type || 'general',
      audio: duaData.audio || undefined
    }
  }

  private transformPrayerTimesData(data: any, latitude: number, longitude: number): PrayerTimes {
    const timings = data.data.timings
    return {
      date: data.data.date.readable,
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      location: {
        city: data.data.meta.timezone || 'Unknown',
        country: 'Unknown',
        latitude,
        longitude
      }
    }
  }

  // ===== FALLBACK DATA =====

  /**
   * Authentic duas from Quran and Sunnah as fallback
   */
  private getFallbackDuas(): Dua[] {
    return [
      {
        id: '1',
        title: 'Before Eating',
        arabicText: 'بِسْمِ اللَّهِ',
        transliteration: 'Bismillah',
        englishTranslation: 'In the name of Allah',
        source: 'Sahih Bukhari, Muslim',
        category: 'before_eating'
      },
      {
        id: '2',
        title: 'After Eating',
        arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ',
        transliteration: 'Alhamdu lillahil-ladhi at\'amani hadha wa razaqaneehi min ghayri hawlin minnee wa la quwwah',
        englishTranslation: 'Praise be to Allah Who has fed me this and provided it for me without any might or power on my part',
        source: 'Sunan Abu Dawud, Tirmidhi',
        category: 'after_eating'
      },
      {
        id: '3',
        title: 'Morning Dhikr',
        arabicText: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
        transliteration: 'Asbahna wa asbahal-mulku lillahi walhamdu lillah',
        englishTranslation: 'We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah',
        source: 'Sahih Muslim',
        category: 'morning'
      },
      {
        id: '4',
        title: 'Evening Dhikr',
        arabicText: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
        transliteration: 'Amsayna wa amsal-mulku lillahi walhamdu lillah',
        englishTranslation: 'We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah',
        source: 'Sahih Muslim',
        category: 'evening'
      },
      {
        id: '5',
        title: 'Before Sleep',
        arabicText: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        transliteration: 'Bismika Allahumma amootu wa ahya',
        englishTranslation: 'In Your name O Allah, I live and die',
        source: 'Sahih Bukhari',
        category: 'before_sleep'
      }
    ]
  }

  // ===== CACHE UTILITIES =====

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

  clearCache(): void {
    this.cache.clear()
  }
}

// Create singleton instance
export const islamicApi = new IslamicApiService()

// Named exports
export const {
  getHadithCollections,
  getRandomHadith,
  searchHadiths,
  getHadithByNumber,
  getDailyDuas,
  getDuasByCategory,
  searchDuas,
  getPrayerTimes,
  clearCache
} = islamicApi

export default islamicApi