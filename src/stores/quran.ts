import { create } from 'zustand'
import type { Surah, Ayah, VerseReference } from '@/types'
import { getAllSurahs, getPage, getSurah, UTHMANI_EDITION } from '@/services/alquran-cloud'
import { getChapters, type ChapterInfo } from '@/services/quran-com'

interface QuranState {
  // Surah data (fetched from API)
  surahs: Surah[]
  chapters: ChapterInfo[]
  surahsLoading: boolean
  surahsError: string | null

  // Current position
  currentPage: number // 1-604
  currentSurah: number // 1-114
  currentAyah: number // Ayah number within surah
  currentJuz: number // 1-30

  // Page data (fetched from API)
  currentPageAyahs: Ayah[]
  pageLoading: boolean
  pageError: string | null

  // View mode
  viewMode: 'text' | 'mushaf' // Text view or Mushaf image view

  // Bookmarks
  bookmarkedPages: number[]
}

interface QuranActions {
  // Initialization
  loadSurahs: () => Promise<void>

  // Navigation
  goToPage: (pageNumber: number) => Promise<void>
  goToSurah: (surahNumber: number) => Promise<void>
  goToAyah: (surahNumber: number, ayahNumber: number) => Promise<void>
  goToJuz: (juzNumber: number) => Promise<void>
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>

  // View mode
  setViewMode: (mode: QuranState['viewMode']) => void

  // Bookmarks
  toggleBookmark: (pageNumber: number) => void
  isBookmarked: (pageNumber: number) => boolean

  // Current verse tracking
  setCurrentVerse: (verse: VerseReference) => void
}

// Helper to get Juz from page number (approximate)
function getJuzFromPage(pageNumber: number): number {
  // Each Juz is approximately 20 pages in the Madani Mushaf
  return Math.min(30, Math.ceil(pageNumber / 20))
}

export const useQuranStore = create<QuranState & QuranActions>()((set, get) => ({
  // Initial state
  surahs: [],
  chapters: [],
  surahsLoading: false,
  surahsError: null,

  currentPage: 1,
  currentSurah: 1,
  currentAyah: 1,
  currentJuz: 1,

  currentPageAyahs: [],
  pageLoading: false,
  pageError: null,

  viewMode: 'text',
  bookmarkedPages: [],

  // Load all Surahs metadata
  loadSurahs: async () => {
    set({ surahsLoading: true, surahsError: null })

    try {
      // Fetch from both APIs in parallel
      const [surahs, chaptersResponse] = await Promise.all([
        getAllSurahs(),
        getChapters(),
      ])

      set({
        surahs,
        chapters: chaptersResponse.chapters,
        surahsLoading: false,
      })
    } catch (error) {
      set({
        surahsError: error instanceof Error ? error.message : 'Failed to load Surahs',
        surahsLoading: false,
      })
    }
  },

  // Go to specific page
  goToPage: async (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > 604) return

    set({ pageLoading: true, pageError: null, currentPage: pageNumber })

    try {
      const pageData = await getPage(pageNumber, UTHMANI_EDITION)

      // Update current position based on first ayah on page
      const firstAyah = pageData.ayahs[0]
      if (firstAyah) {
        set({
          currentPageAyahs: pageData.ayahs,
          currentSurah: firstAyah.surah?.number || get().currentSurah,
          currentAyah: firstAyah.numberInSurah,
          currentJuz: firstAyah.juz || getJuzFromPage(pageNumber),
          pageLoading: false,
        })
      } else {
        set({
          currentPageAyahs: pageData.ayahs,
          currentJuz: getJuzFromPage(pageNumber),
          pageLoading: false,
        })
      }
    } catch (error) {
      set({
        pageError: error instanceof Error ? error.message : 'Failed to load page',
        pageLoading: false,
      })
    }
  },

  // Go to specific Surah
  goToSurah: async (surahNumber: number) => {
    if (surahNumber < 1 || surahNumber > 114) return

    set({ pageLoading: true, pageError: null })

    try {
      const surahData = await getSurah(surahNumber, UTHMANI_EDITION)
      const firstAyah = surahData.ayahs[0]

      if (firstAyah) {
        // Navigate to the page containing the first ayah
        await get().goToPage(firstAyah.page)
        set({ currentSurah: surahNumber, currentAyah: 1 })
      }
    } catch (error) {
      set({
        pageError: error instanceof Error ? error.message : 'Failed to load Surah',
        pageLoading: false,
      })
    }
  },

  // Go to specific Ayah
  goToAyah: async (surahNumber: number, ayahNumber: number) => {
    set({ pageLoading: true, pageError: null })

    try {
      const surahData = await getSurah(surahNumber, UTHMANI_EDITION)
      const ayah = surahData.ayahs.find((a) => a.numberInSurah === ayahNumber)

      if (ayah) {
        await get().goToPage(ayah.page)
        set({ currentSurah: surahNumber, currentAyah: ayahNumber })
      }
    } catch (error) {
      set({
        pageError: error instanceof Error ? error.message : 'Failed to load Ayah',
        pageLoading: false,
      })
    }
  },

  // Go to specific Juz
  goToJuz: async (juzNumber: number) => {
    if (juzNumber < 1 || juzNumber > 30) return

    // Approximate starting page for each Juz
    const juzStartPages: Record<number, number> = {
      1: 1, 2: 22, 3: 42, 4: 62, 5: 82,
      6: 102, 7: 121, 8: 142, 9: 162, 10: 182,
      11: 201, 12: 222, 13: 242, 14: 262, 15: 282,
      16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
      21: 402, 22: 422, 23: 442, 24: 462, 25: 482,
      26: 502, 27: 522, 28: 542, 29: 562, 30: 582,
    }

    const startPage = juzStartPages[juzNumber] || 1
    await get().goToPage(startPage)
    set({ currentJuz: juzNumber })
  },

  // Next page
  nextPage: async () => {
    const { currentPage } = get()
    if (currentPage < 604) {
      await get().goToPage(currentPage + 1)
    }
  },

  // Previous page
  previousPage: async () => {
    const { currentPage } = get()
    if (currentPage > 1) {
      await get().goToPage(currentPage - 1)
    }
  },

  // Set view mode
  setViewMode: (viewMode) => set({ viewMode }),

  // Toggle bookmark
  toggleBookmark: (pageNumber) => {
    const { bookmarkedPages } = get()
    if (bookmarkedPages.includes(pageNumber)) {
      set({ bookmarkedPages: bookmarkedPages.filter((p) => p !== pageNumber) })
    } else {
      set({ bookmarkedPages: [...bookmarkedPages, pageNumber] })
    }
  },

  // Check if page is bookmarked
  isBookmarked: (pageNumber) => {
    return get().bookmarkedPages.includes(pageNumber)
  },

  // Set current verse for tracking
  setCurrentVerse: (verse) => {
    set({
      currentSurah: verse.surahNumber,
      currentAyah: verse.ayahNumber,
      currentPage: verse.pageNumber,
      currentJuz: verse.juz,
    })
  },
}))

// Selectors
export const useCurrentPage = () => useQuranStore((s) => s.currentPage)
export const useCurrentSurah = () => useQuranStore((s) => s.currentSurah)
export const useSurahs = () => useQuranStore((s) => s.surahs)
export const useChapters = () => useQuranStore((s) => s.chapters)
export const usePageAyahs = () => useQuranStore((s) => s.currentPageAyahs)
export const useViewMode = () => useQuranStore((s) => s.viewMode)
