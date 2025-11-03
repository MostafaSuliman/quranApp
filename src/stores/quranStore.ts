import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { 
  Surah, 
  Ayah, 
  Reciter, 
  ReadingMode,
  ReadingModeConfig 
} from '../types/quran'
import { quranApi } from '../utils/quranApi'

interface QuranState {
  // Data
  surahs: Surah[]
  currentSurah: number | null
  currentPage: number | null
  currentAyah: Ayah | null
  currentAyahIndex: number | null
  ayahs: Ayah[]
  reciters: Reciter[]
  translations: any[]
  
  // UI State
  readingMode: ReadingMode
  readingConfig: ReadingModeConfig
  isLoading: boolean
  error: string | null
  
  // Current Selection
  selectedSurahNumber: number
  selectedPageNumber: number
  selectedAyahNumber: number | null
  
  // Actions
  initialize: () => Promise<void>
  loadSurahs: () => Promise<void>
  loadSurah: (surahNumber: number) => Promise<void>
  loadPage: (pageNumber: number) => Promise<void>
  loadAyahs: (surahNumber: number, startAyah: number, count: number) => Promise<void>
  loadReciters: () => Promise<void>
  loadTranslations: () => Promise<void>
  
  // Navigation
  setCurrentSurah: (surahNumber: number) => void
  setCurrentPage: (pageNumber: number) => void
  setCurrentAyah: (ayahNumber: number) => void
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>
  nextAyah: () => void
  previousAyah: () => void
  
  // Reading Mode
  setReadingMode: (mode: ReadingMode) => void
  updateReadingConfig: (config: Partial<ReadingModeConfig>) => void
  
  // Search
  searchVerses: (query: string) => Promise<Ayah[]>
  
  // Utility
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      // Initial State
      surahs: [],
      currentSurah: null,
      currentPage: null,
      currentAyah: null,
      currentAyahIndex: null,
      ayahs: [],
      reciters: [],
      translations: [],
      
      readingMode: 'learning',
      readingConfig: {
        mode: 'learning',
        showTransliteration: true,
        showTranslation: true,
        fontSize: 'medium',
        highlightCurrentAyah: true,
        autoScroll: true
      },
      
      isLoading: false,
      error: null,
      
      selectedSurahNumber: 1,
      selectedPageNumber: 1,
      selectedAyahNumber: null,

      // Initialize store with essential data
      initialize: async () => {
        set({ isLoading: true, error: null })
        
        try {
          await Promise.all([
            get().loadSurahs(),
            get().loadReciters(),
            get().loadTranslations()
          ])
          
          // Load first page by default
          await get().loadPage(1)
          
        } catch (error) {
          console.error('Failed to initialize Quran store:', error)
          set({ error: 'Failed to load Quran data. Please check your connection.' })
        } finally {
          set({ isLoading: false })
        }
      },

      // Load all surahs
      loadSurahs: async () => {
        try {
          const surahs = await quranApi.getChapters()
          set({ surahs })
        } catch (error) {
          console.error('Failed to load surahs:', error)
          throw error
        }
      },

      // Load specific surah with verses
      loadSurah: async (surahNumber: number) => {
        set({ isLoading: true, error: null })
        
        try {
          const [, versesData] = await Promise.all([
            quranApi.getChapter(surahNumber),
            quranApi.getChapterVerses(surahNumber, { perPage: 300 })
          ])
          
          set({ 
            currentSurah: surahNumber,
            selectedSurahNumber: surahNumber,
            ayahs: versesData.verses
          })
          
        } catch (error) {
          console.error(`Failed to load surah ${surahNumber}:`, error)
          set({ error: `Failed to load surah ${surahNumber}` })
        } finally {
          set({ isLoading: false })
        }
      },

      // Load specific page (Mushaf format)
      loadPage: async (pageNumber: number) => {
        set({ isLoading: true, error: null })
        
        try {
          const pageData = await quranApi.getVersesByPage(pageNumber)
          set({ 
            currentPage: pageNumber,
            selectedPageNumber: pageNumber,
            ayahs: pageData.ayahs
          })
          
        } catch (error) {
          console.error(`Failed to load page ${pageNumber}:`, error)
          set({ error: `Failed to load page ${pageNumber}` })
        } finally {
          set({ isLoading: false })
        }
      },

      // Load specific ayahs for lessons
      loadAyahs: async (surahNumber: number, startAyah: number, count: number) => {
        set({ isLoading: true, error: null })
        
        try {
          const versesData = await quranApi.getChapterVerses(surahNumber, {
            perPage: count,
            page: Math.floor((startAyah - 1) / count) + 1
          })
          
          set({ 
            ayahs: versesData.verses,
            currentSurah: surahNumber,
            currentAyahIndex: startAyah - 1
          })
          
        } catch (error) {
          console.error(`Failed to load ayahs for surah ${surahNumber}:`, error)
          set({ error: `Failed to load ayahs for surah ${surahNumber}` })
        } finally {
          set({ isLoading: false })
        }
      },

      // Load available reciters
      loadReciters: async () => {
        try {
          const reciters = await quranApi.getReciters()
          set({ reciters })
        } catch (error) {
          console.error('Failed to load reciters:', error)
          throw error
        }
      },

      // Load available translations
      loadTranslations: async () => {
        try {
          const translations = await quranApi.getTranslations()
          set({ translations })
        } catch (error) {
          console.error('Failed to load translations:', error)
          throw error
        }
      },

      // Navigation Actions
      setCurrentSurah: (surahNumber: number) => {
        set({ currentSurah: surahNumber, selectedSurahNumber: surahNumber })
      },

      setCurrentPage: (pageNumber: number) => {
        set({ currentPage: pageNumber, selectedPageNumber: pageNumber })
      },

      setCurrentAyah: (ayahNumber: number) => {
        const state = get()
        const currentAyah = state.ayahs.find(
          ayah => ayah.numberInSurah === ayahNumber
        ) || null
        
        set({ 
          currentAyah,
          selectedAyahNumber: ayahNumber,
          currentAyahIndex: state.ayahs.findIndex(ayah => ayah.numberInSurah === ayahNumber)
        })
      },

      nextPage: async () => {
        const { selectedPageNumber } = get()
        if (selectedPageNumber < 604) { // Total pages in Quran
          get().setCurrentPage(selectedPageNumber + 1)
          await get().loadPage(selectedPageNumber + 1)
        }
      },

      previousPage: async () => {
        const { selectedPageNumber } = get()
        if (selectedPageNumber > 1) {
          get().setCurrentPage(selectedPageNumber - 1)
          await get().loadPage(selectedPageNumber - 1)
        }
      },

      nextAyah: () => {
        const state = get()
        const ayahs = state.ayahs
        
        if (state.currentAyahIndex !== null && state.currentAyahIndex < ayahs.length - 1) {
          const nextAyah = ayahs[state.currentAyahIndex + 1]
          get().setCurrentAyah(nextAyah.numberInSurah)
        }
      },

      previousAyah: () => {
        const state = get()
        const ayahs = state.ayahs
        
        if (state.currentAyahIndex !== null && state.currentAyahIndex > 0) {
          const previousAyah = ayahs[state.currentAyahIndex - 1]
          get().setCurrentAyah(previousAyah.numberInSurah)
        }
      },

      // Reading Mode Actions
      setReadingMode: (mode: ReadingMode) => {
        set(state => ({
          readingMode: mode,
          readingConfig: {
            ...state.readingConfig,
            mode
          }
        }))
      },

      updateReadingConfig: (config: Partial<ReadingModeConfig>) => {
        set(state => ({
          readingConfig: {
            ...state.readingConfig,
            ...config
          }
        }))
      },

      // Search
      searchVerses: async (query: string): Promise<Ayah[]> => {
        try {
          set({ isLoading: true, error: null })
          const result = await quranApi.searchVerses(query)
          return result.verses
        } catch (error) {
          console.error('Search failed:', error)
          set({ error: 'Search failed. Please try again.' })
          return []
        } finally {
          set({ isLoading: false })
        }
      },

      // Utility Actions
      setError: (error: string | null) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        currentSurah: null,
        currentPage: null,
        currentAyah: null,
        selectedSurahNumber: 1,
        selectedPageNumber: 1,
        selectedAyahNumber: null,
        error: null,
        isLoading: false
      })
    }),
    {
      name: 'quran-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential config, not the large data
      partialize: (state) => ({
        readingMode: state.readingMode,
        readingConfig: state.readingConfig,
        selectedSurahNumber: state.selectedSurahNumber,
        selectedPageNumber: state.selectedPageNumber,
        selectedAyahNumber: state.selectedAyahNumber
      })
    }
  )
)