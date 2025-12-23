import { create } from 'zustand'
import type { Surah, Ayah } from '@/types'
import { getAllSurahs, getSurah, getPage } from '@/services/alquran-cloud'

interface QuranState {
  // Surah list
  surahs: Surah[]
  surahsLoading: boolean

  // Current view
  currentPage: number
  currentSurah: number | null
  currentAyah: number | null

  // Loaded content
  pageAyahs: Map<number, Ayah[]>
  surahAyahs: Map<number, Ayah[]>

  // Loading states
  pageLoading: boolean
  surahLoading: boolean

  // Error
  error: string | null
}

interface QuranActions {
  // Data loading
  loadSurahs: () => Promise<void>
  loadPage: (pageNumber: number) => Promise<Ayah[]>
  loadSurah: (surahNumber: number) => Promise<Ayah[]>

  // Navigation
  setCurrentPage: (page: number) => void
  setCurrentSurah: (surah: number | null) => void
  setCurrentAyah: (ayah: number | null) => void
  goToNextPage: () => void
  goToPreviousPage: () => void

  // Helpers
  getSurahByNumber: (number: number) => Surah | undefined
  getPageAyahs: (pageNumber: number) => Ayah[] | undefined
  getSurahAyahsList: (surahNumber: number) => Ayah[] | undefined
}

export const useQuranStore = create<QuranState & QuranActions>()((set, get) => ({
  // Initial state
  surahs: [],
  surahsLoading: false,
  currentPage: 1,
  currentSurah: null,
  currentAyah: null,
  pageAyahs: new Map(),
  surahAyahs: new Map(),
  pageLoading: false,
  surahLoading: false,
  error: null,

  // Load all surahs
  loadSurahs: async () => {
    if (get().surahs.length > 0) return

    set({ surahsLoading: true, error: null })

    try {
      const surahs = await getAllSurahs()
      set({ surahs, surahsLoading: false })
    } catch (error) {
      console.error('Failed to load surahs:', error)
      set({
        surahsLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load surahs',
      })
    }
  },

  // Load page
  loadPage: async (pageNumber) => {
    const cached = get().pageAyahs.get(pageNumber)
    if (cached) return cached

    set({ pageLoading: true, error: null })

    try {
      const data = await getPage(pageNumber)
      const { pageAyahs } = get()
      pageAyahs.set(pageNumber, data.ayahs)
      set({ pageAyahs: new Map(pageAyahs), pageLoading: false })
      return data.ayahs
    } catch (error) {
      console.error('Failed to load page:', error)
      set({
        pageLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load page',
      })
      return []
    }
  },

  // Load surah
  loadSurah: async (surahNumber) => {
    const cached = get().surahAyahs.get(surahNumber)
    if (cached) return cached

    set({ surahLoading: true, error: null })

    try {
      const data = await getSurah(surahNumber)
      const { surahAyahs } = get()
      surahAyahs.set(surahNumber, data.ayahs)
      set({ surahAyahs: new Map(surahAyahs), surahLoading: false })
      return data.ayahs
    } catch (error) {
      console.error('Failed to load surah:', error)
      set({
        surahLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load surah',
      })
      return []
    }
  },

  // Navigation
  setCurrentPage: (page) => {
    if (page >= 1 && page <= 604) {
      set({ currentPage: page })
    }
  },

  setCurrentSurah: (surah) => {
    set({ currentSurah: surah })
  },

  setCurrentAyah: (ayah) => {
    set({ currentAyah: ayah })
  },

  goToNextPage: () => {
    const { currentPage } = get()
    if (currentPage < 604) {
      set({ currentPage: currentPage + 1 })
    }
  },

  goToPreviousPage: () => {
    const { currentPage } = get()
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 })
    }
  },

  // Helpers
  getSurahByNumber: (number) => {
    return get().surahs.find((s) => s.number === number)
  },

  getPageAyahs: (pageNumber) => {
    return get().pageAyahs.get(pageNumber)
  },

  getSurahAyahsList: (surahNumber) => {
    return get().surahAyahs.get(surahNumber)
  },
}))

// Selectors
export const useSurahs = () => useQuranStore((s) => s.surahs)
export const useCurrentPage = () => useQuranStore((s) => s.currentPage)
export const usePageLoading = () => useQuranStore((s) => s.pageLoading)
export const useSurahLoading = () => useQuranStore((s) => s.surahLoading)
