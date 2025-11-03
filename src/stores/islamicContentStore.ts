import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { islamicApi } from '../utils/islamicApi'
import { 
  Hadith, 
  Dua, 
  PrayerTimes, 
  IslamicLocation, 
  IslamicContentPreferences,
  IslamicContentCache,
  IslamicContentError
} from '../types/quran'

// Islamic content categories
export type DuaCategory = 
  | 'morning' 
  | 'evening' 
  | 'before_eating' 
  | 'after_eating' 
  | 'before_sleep' 
  | 'after_waking' 
  | 'travel' 
  | 'protection' 
  | 'forgiveness'
  | 'general'

export type HadithCollection = 
  | 'sahih-bukhari' 
  | 'sahih-muslim' 
  | 'abu-dawood' 
  | 'jami-at-tirmidhi' 
  | 'sunan-an-nasai' 
  | 'sunan-ibn-majah'

// Cache interfaces for store-specific use
interface StoreCache {
  hadiths: Map<string, IslamicContentCache<Hadith>>
  duas: Map<string, IslamicContentCache<Dua[]>>
  prayerTimes: Map<string, IslamicContentCache<PrayerTimes>>
  randomHadith: Map<string, IslamicContentCache<Hadith>>
}

interface IslamicContentState {
  // Data
  hadiths: Hadith[]
  duas: Dua[]
  currentHadith: Hadith | null
  dailyHadith: Hadith | null
  dailyDuas: Dua[]
  prayerTimes: PrayerTimes | null
  nextPrayer: string | null
  timeToNextPrayer: string | null
  
  // Location
  location: IslamicLocation | null
  locationPermissionGranted: boolean
  
  // UI State
  isLoading: boolean
  isLoadingHadiths: boolean
  isLoadingDuas: boolean
  isLoadingPrayerTimes: boolean
  error: IslamicContentError | null
  lastRefreshed: string | null
  
  // Preferences
  preferences: IslamicContentPreferences
  
  // Cache management
  cache: StoreCache
  
  // Actions - Initialization
  initialize: () => Promise<void>
  refreshContent: () => Promise<void>
  
  // Actions - Hadith
  loadRandomHadith: (collection?: HadithCollection) => Promise<void>
  loadHadithByNumber: (collection: HadithCollection, number: number) => Promise<void>
  searchHadiths: (query: string, collection?: HadithCollection) => Promise<void>
  setDailyHadith: () => Promise<void>
  
  // Actions - Duas
  loadDailyDuas: () => Promise<void>
  loadDuasByCategory: (category: DuaCategory) => Promise<void>
  searchDuas: (query: string) => Promise<void>
  
  // Actions - Prayer Times
  loadPrayerTimes: (location?: IslamicLocation, date?: string) => Promise<void>
  requestLocationPermission: () => Promise<void>
  getCurrentLocation: () => Promise<IslamicLocation>
  setLocation: (location: IslamicLocation) => void
  calculateNextPrayer: () => void
  
  // Actions - Content Management
  addToFavorites: (type: 'hadith' | 'dua', id: string) => void
  removeFromFavorites: (type: 'hadith' | 'dua', id: string) => void
  getFavorites: (type: 'hadith' | 'dua') => (Hadith | Dua)[]
  
  // Actions - Cache Management
  clearCache: () => void
  cleanExpiredCache: () => void
  getCacheSize: () => number
  
  // Actions - Preferences
  updatePreferences: (preferences: Partial<IslamicContentPreferences>) => void
  
  // Actions - Error Handling
  setError: (error: IslamicContentError | null) => void
  clearError: () => void
  addErrorBoundary: (source: IslamicContentError['source'], operation: () => Promise<any>) => Promise<any>
  
  // Utility
  reset: () => void
  getContentStats: () => {
    totalHadiths: number
    totalDuas: number
    cacheSize: number
    lastRefresh: string | null
  }
}

// Default preferences
const DEFAULT_PREFERENCES: IslamicContentPreferences = {
  preferredHadithCollection: 'sahih-bukhari',
  enableArabicFirst: true,
  showTransliteration: true,
  dailyHadithNotification: true,
  dailyDuaReminder: true,
  prayerTimeNotifications: true,
  preferredDuaCategories: ['morning', 'evening', 'before_eating', 'after_eating'],
  cacheExpiryHours: 24,
  notificationTimes: {
    hadith: '09:00', // 9 AM for daily hadith
    duas: '06:00', // 6 AM for morning duas
    prayers: true // Enable prayer time notifications
  }
}

// Cache expiry constants (in milliseconds)
const CACHE_EXPIRY = {
  HADITH: 24 * 60 * 60 * 1000, // 24 hours
  DUA: 24 * 60 * 60 * 1000, // 24 hours
  PRAYER_TIMES: 6 * 60 * 60 * 1000, // 6 hours
  DAILY_CONTENT: 24 * 60 * 60 * 1000 // 24 hours
}

export const useIslamicContentStore = create<IslamicContentState>()(
  persist(
    (set, get) => ({
      // Initial State
      hadiths: [],
      duas: [],
      currentHadith: null,
      dailyHadith: null,
      dailyDuas: [],
      prayerTimes: null,
      nextPrayer: null,
      timeToNextPrayer: null,
      
      location: null,
      locationPermissionGranted: false,
      
      isLoading: false,
      isLoadingHadiths: false,
      isLoadingDuas: false,
      isLoadingPrayerTimes: false,
      error: null,
      lastRefreshed: null,
      
      preferences: DEFAULT_PREFERENCES,
      
      cache: {
        hadiths: new Map(),
        duas: new Map(),
        prayerTimes: new Map(),
        randomHadith: new Map()
      },

      // Initialize store
      initialize: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const state = get()
          
          // Clean expired cache
          state.cleanExpiredCache()
          
          // Load daily content
          await Promise.allSettled([
            state.setDailyHadith(),
            state.loadDailyDuas(),
            state.requestLocationPermission()
          ])
          
          set({ 
            isLoading: false,
            lastRefreshed: new Date().toISOString()
          })
          
        } catch (error) {
          console.error('Failed to initialize Islamic content store:', error)
          set({ 
            error: {
              code: 'INIT_FAILED',
              message: 'Failed to load Islamic content. Please check your connection.',
              timestamp: Date.now(),
              source: 'network',
              retryable: true,
              details: error
            },
            isLoading: false
          })
        }
      },

      // Refresh all content
      refreshContent: async () => {
        const state = get()
        set({ isLoading: true })
        
        try {
          // Clear cache and reload
          state.clearCache()
          
          await Promise.allSettled([
            state.setDailyHadith(),
            state.loadDailyDuas(),
            state.location && state.loadPrayerTimes(state.location)
          ])
          
          set({ 
            lastRefreshed: new Date().toISOString(),
            isLoading: false 
          })
          
        } catch (error) {
          console.error('Failed to refresh content:', error)
          state.setError({
            code: 'REFRESH_FAILED',
            message: 'Failed to refresh content',
            timestamp: Date.now(),
            source: 'hadith',
            retryable: true
          })
        }
      },

      // Hadith Actions
      loadRandomHadith: async (collection = 'sahih-bukhari') => {
        return get().addErrorBoundary('hadith', async () => {
          set({ isLoadingHadiths: true })
          
          try {
            const hadith = await islamicApi.getRandomHadith(collection)
            
            set(state => ({
              currentHadith: hadith,
              hadiths: state.hadiths.some(h => h.id === hadith.id) 
                ? state.hadiths 
                : [hadith, ...state.hadiths].slice(0, 50), // Keep last 50
              isLoadingHadiths: false
            }))
            
          } catch (error) {
            throw new Error('Failed to load random hadith')
          }
        })
      },

      loadHadithByNumber: async (collection: HadithCollection, number: number) => {
        return get().addErrorBoundary('hadith', async () => {
          set({ isLoadingHadiths: true })
          
          try {
            const hadith = await islamicApi.getHadithByNumber(collection, number)
            
            set(state => ({
              currentHadith: hadith,
              hadiths: state.hadiths.some(h => h.id === hadith.id)
                ? state.hadiths
                : [hadith, ...state.hadiths].slice(0, 50),
              isLoadingHadiths: false
            }))
            
          } catch (error) {
            throw new Error(`Failed to load hadith ${number} from ${collection}`)
          }
        })
      },

      searchHadiths: async (query: string, collection = 'sahih-bukhari') => {
        return get().addErrorBoundary('hadith', async () => {
          set({ isLoadingHadiths: true })
          
          try {
            const hadiths = await islamicApi.searchHadiths(query, collection, 20)
            
            set({
              hadiths,
              currentHadith: hadiths[0] || null,
              isLoadingHadiths: false
            })
            
          } catch (error) {
            throw new Error(`Failed to search hadiths for: ${query}`)
          }
        })
      },

      setDailyHadith: async () => {
        return get().addErrorBoundary('hadith', async () => {
          const state = get()
          const today = new Date().toISOString().split('T')[0]
          const cacheKey = `daily_hadith_${today}`
          const cached = state.cache.randomHadith.get(cacheKey)
          
          if (cached && Date.now() < cached.expiry) {
            set({ dailyHadith: cached.data })
            return
          }
          
          try {
            const hadith = await islamicApi.getRandomHadith(state.preferences.preferredHadithCollection)
            
            // Cache daily hadith
            state.cache.randomHadith.set(cacheKey, {
              data: hadith,
              timestamp: Date.now(),
              expiry: Date.now() + CACHE_EXPIRY.DAILY_CONTENT,
              source: 'api'
            })
            
            set({ dailyHadith: hadith })
            
          } catch (error) {
            throw new Error('Failed to load daily hadith')
          }
        })
      },

      // Dua Actions
      loadDailyDuas: async () => {
        return get().addErrorBoundary('dua', async () => {
          set({ isLoadingDuas: true })
          
          try {
            const duas = await islamicApi.getDailyDuas()
            
            set({
              dailyDuas: duas,
              duas: duas,
              isLoadingDuas: false
            })
            
          } catch (error) {
            throw new Error('Failed to load daily duas')
          }
        })
      },

      loadDuasByCategory: async (category: DuaCategory) => {
        return get().addErrorBoundary('dua', async () => {
          set({ isLoadingDuas: true })
          
          try {
            const duas = await islamicApi.getDuasByCategory(category)
            
            set(state => ({
              duas: [...duas, ...state.duas.filter(d => d.category !== category)],
              isLoadingDuas: false
            }))
            
          } catch (error) {
            throw new Error(`Failed to load duas for category: ${category}`)
          }
        })
      },

      searchDuas: async (query: string) => {
        return get().addErrorBoundary('dua', async () => {
          set({ isLoadingDuas: true })
          
          try {
            const duas = await islamicApi.searchDuas(query)
            
            set({
              duas,
              isLoadingDuas: false
            })
            
          } catch (error) {
            throw new Error(`Failed to search duas for: ${query}`)
          }
        })
      },

      // Prayer Times Actions
      loadPrayerTimes: async (location?: IslamicLocation, date?: string) => {
        return get().addErrorBoundary('prayer', async () => {
          const state = get()
          const currentLocation = location || state.location
          
          if (!currentLocation) {
            throw new Error('Location required for prayer times')
          }
          
          set({ isLoadingPrayerTimes: true })
          
          try {
            const prayerTimes = await islamicApi.getPrayerTimes(
              currentLocation.latitude,
              currentLocation.longitude,
              date
            )
            
            set({
              prayerTimes,
              isLoadingPrayerTimes: false
            })
            
            // Calculate next prayer
            get().calculateNextPrayer()
            
          } catch (error) {
            throw new Error('Failed to load prayer times')
          }
        })
      },

      requestLocationPermission: async () => {
        try {
          if (!navigator.geolocation) {
            throw new Error('Geolocation not supported')
          }
          
          const location = await get().getCurrentLocation()
          
          set({ 
            location,
            locationPermissionGranted: true
          })
          
          // Load prayer times for the location
          await get().loadPrayerTimes(location)
          
        } catch (error) {
          console.error('Location permission denied:', error)
          set({ locationPermissionGranted: false })
        }
      },

      getCurrentLocation: async (): Promise<IslamicLocation> => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              })
            },
            (error) => reject(error),
            { 
              enableHighAccuracy: true, 
              timeout: 10000, 
              maximumAge: 300000 // 5 minutes
            }
          )
        })
      },

      setLocation: (location: IslamicLocation) => {
        set({ 
          location,
          locationPermissionGranted: true
        })
        
        // Load prayer times for new location
        get().loadPrayerTimes(location)
      },

      calculateNextPrayer: () => {
        const state = get()
        const { prayerTimes } = state
        
        if (!prayerTimes) return
        
        const now = new Date()
        const prayers = [
          { name: 'Fajr', time: prayerTimes.fajr },
          { name: 'Dhuhr', time: prayerTimes.dhuhr },
          { name: 'Asr', time: prayerTimes.asr },
          { name: 'Maghrib', time: prayerTimes.maghrib },
          { name: 'Isha', time: prayerTimes.isha }
        ]
        
        // Find next prayer
        let nextPrayer = null
        let timeToNext = null
        
        for (const prayer of prayers) {
          const prayerTime = new Date(`${prayerTimes.date} ${prayer.time}`)
          
          if (prayerTime > now) {
            nextPrayer = prayer.name
            const timeDiff = prayerTime.getTime() - now.getTime()
            const hours = Math.floor(timeDiff / (1000 * 60 * 60))
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
            timeToNext = `${hours}h ${minutes}m`
            break
          }
        }
        
        // If no prayer found today, next is Fajr tomorrow
        if (!nextPrayer) {
          nextPrayer = 'Fajr'
          const tomorrow = new Date(now)
          tomorrow.setDate(tomorrow.getDate() + 1)
          const fajrTomorrow = new Date(`${tomorrow.toISOString().split('T')[0]} ${prayers[0].time}`)
          const timeDiff = fajrTomorrow.getTime() - now.getTime()
          const hours = Math.floor(timeDiff / (1000 * 60 * 60))
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
          timeToNext = `${hours}h ${minutes}m`
        }
        
        set({ nextPrayer, timeToNextPrayer: timeToNext })
      },

      // Favorites Management
      addToFavorites: (_type: 'hadith' | 'dua', _id: string) => {
        // Implementation would depend on favorites storage system
        console.log(`Adding ${_type} ${_id} to favorites`)
      },

      removeFromFavorites: (_type: 'hadith' | 'dua', _id: string) => {
        // Implementation would depend on favorites storage system
        console.log(`Removing ${_type} ${_id} from favorites`)
      },

      getFavorites: (_type: 'hadith' | 'dua') => {
        // Implementation would depend on favorites storage system
        return []
      },

      // Cache Management
      clearCache: () => {
        set({
          cache: {
            hadiths: new Map(),
            duas: new Map(),
            prayerTimes: new Map(),
            randomHadith: new Map()
          }
        })
        
        // Clear API cache as well
        islamicApi.clearCache()
      },

      cleanExpiredCache: () => {
        const state = get()
        const now = Date.now()
        
        // Clean expired entries from each cache
        Object.values(state.cache).forEach(cache => {
          for (const [key, value] of cache.entries()) {
            if (now > value.expiry) {
              cache.delete(key)
            }
          }
        })
      },

      getCacheSize: () => {
        const state = get()
        return Object.values(state.cache).reduce(
          (total, cache) => total + cache.size, 
          0
        )
      },

      // Preferences
      updatePreferences: (preferences: Partial<IslamicContentPreferences>) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            ...preferences
          }
        }))
      },

      // Error Handling
      setError: (error: IslamicContentError | null) => set({ error }),

      clearError: () => set({ error: null }),

      addErrorBoundary: async (source: IslamicContentError['source'], operation: () => Promise<any>) => {
        try {
          await operation()
          
          // Clear error if operation successful
          const state = get()
          if (state.error?.source === source) {
            state.clearError()
          }
          
        } catch (error) {
          console.error(`Error in ${source} operation:`, error)
          
          set({
            error: {
              code: 'OPERATION_FAILED',
              message: error instanceof Error ? error.message : 'Unknown error occurred',
              timestamp: Date.now(),
              source,
              retryable: true,
              details: error
            },
            isLoading: false,
            isLoadingHadiths: false,
            isLoadingDuas: false,
            isLoadingPrayerTimes: false
          })
          
          throw error
        }
      },

      // Utility
      reset: () => {
        set({
          hadiths: [],
          duas: [],
          currentHadith: null,
          dailyHadith: null,
          dailyDuas: [],
          prayerTimes: null,
          nextPrayer: null,
          timeToNextPrayer: null,
          location: null,
          locationPermissionGranted: false,
          isLoading: false,
          isLoadingHadiths: false,
          isLoadingDuas: false,
          isLoadingPrayerTimes: false,
          error: null,
          lastRefreshed: null,
          preferences: DEFAULT_PREFERENCES,
          cache: {
            hadiths: new Map(),
            duas: new Map(),
            prayerTimes: new Map(),
            randomHadith: new Map()
          }
        })
      },

      getContentStats: () => {
        const state = get()
        return {
          totalHadiths: state.hadiths.length,
          totalDuas: state.duas.length,
          cacheSize: state.getCacheSize(),
          lastRefresh: state.lastRefreshed
        }
      }
    }),
    {
      name: 'islamic-content-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, not the cache or large datasets
      partialize: (state) => ({
        dailyHadith: state.dailyHadith,
        dailyDuas: state.dailyDuas,
        location: state.location,
        locationPermissionGranted: state.locationPermissionGranted,
        preferences: state.preferences,
        prayerTimes: state.prayerTimes,
        nextPrayer: state.nextPrayer,
        timeToNextPrayer: state.timeToNextPrayer,
        lastRefreshed: state.lastRefreshed
      })
    }
  )
)

// Export store state type for use in components
export type { IslamicContentState }