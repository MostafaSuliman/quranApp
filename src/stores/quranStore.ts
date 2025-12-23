/**
 * Quran Store
 * Manages Quran data, current position, and bookmarks
 */

import { create } from 'zustand';
import type { Surah, Ayah, PageData } from '../types/quran';
import type { Bookmark } from '../types/user';
import { alQuranCloudService } from '../services/api/alquranCloud';
import { storageService } from '../services/storage';
import { CACHE_KEYS, CACHE_DURATIONS } from '../constants/api';
import { generateId } from '../utils/formatting';

interface QuranState {
  // Surah list (metadata)
  surahs: Surah[];
  surahsLoading: boolean;
  surahsError: string | null;

  // Current page data
  currentPage: PageData | null;
  currentPageNumber: number;
  pageLoading: boolean;
  pageError: string | null;

  // Current position
  currentSurah: number;
  currentAyah: number;

  // Bookmarks
  bookmarks: Bookmark[];

  // Selected verse (for highlighting)
  selectedAyahNumber: number | null;
}

interface QuranStore extends QuranState {
  // Actions
  loadSurahs: () => Promise<void>;
  loadPage: (pageNumber: number) => Promise<void>;
  loadSurah: (surahNumber: number) => Promise<{ surah: Surah; ayahs: Ayah[] }>;
  setCurrentPosition: (surahNumber: number, ayahNumber: number) => void;
  goToPage: (pageNumber: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  selectAyah: (ayahNumber: number | null) => void;

  // Bookmark actions
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  loadBookmarks: () => Promise<void>;

  // Initialize
  initialize: () => Promise<void>;
}

export const useQuranStore = create<QuranStore>((set, get) => ({
  // Initial state
  surahs: [],
  surahsLoading: false,
  surahsError: null,

  currentPage: null,
  currentPageNumber: 1,
  pageLoading: false,
  pageError: null,

  currentSurah: 1,
  currentAyah: 1,

  bookmarks: [],
  selectedAyahNumber: null,

  // Initialize store
  initialize: async () => {
    const state = get();

    // Load preferences for last read position
    const preferences = await storageService.loadPreferences();
    set({
      currentPageNumber: preferences.lastReadPage,
      currentSurah: preferences.lastReadSurah,
      currentAyah: preferences.lastReadAyah,
    });

    // Load surahs and bookmarks
    await Promise.all([
      state.loadSurahs(),
      state.loadBookmarks(),
    ]);

    // Load current page
    await get().loadPage(preferences.lastReadPage);
  },

  // Load all Surahs
  loadSurahs: async () => {
    set({ surahsLoading: true, surahsError: null });

    try {
      // Check cache first
      const cached = await storageService.getCachedData<Surah[]>(CACHE_KEYS.SURAH_LIST);
      if (cached) {
        set({ surahs: cached, surahsLoading: false });
        return;
      }

      // Fetch from API
      const surahs = await alQuranCloudService.getSurahList();

      // Cache the result
      await storageService.cacheData(CACHE_KEYS.SURAH_LIST, surahs, CACHE_DURATIONS.SURAH_LIST);

      set({ surahs, surahsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load Surahs';
      set({ surahsError: message, surahsLoading: false });
    }
  },

  // Load a specific page
  loadPage: async (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > 604) {
      set({ pageError: 'Invalid page number' });
      return;
    }

    set({ pageLoading: true, pageError: null });

    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.PAGE_PREFIX + pageNumber;
      const cached = await storageService.getCachedData<PageData>(cacheKey);
      if (cached) {
        set({
          currentPage: cached,
          currentPageNumber: pageNumber,
          pageLoading: false,
        });
        return;
      }

      // Fetch from API
      const pageData = await alQuranCloudService.getPage(pageNumber);

      // Cache the result
      await storageService.cacheData(cacheKey, pageData, CACHE_DURATIONS.PAGE_DATA);

      set({
        currentPage: pageData,
        currentPageNumber: pageNumber,
        pageLoading: false,
      });

      // Save last read position
      const preferences = await storageService.loadPreferences();
      await storageService.savePreferences({
        ...preferences,
        lastReadPage: pageNumber,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load page';
      set({ pageError: message, pageLoading: false });
    }
  },

  // Load a specific Surah
  loadSurah: async (surahNumber: number) => {
    const cacheKey = CACHE_KEYS.SURAH_PREFIX + surahNumber;

    // Check cache first
    const cached = await storageService.getCachedData<{ surah: Surah; ayahs: Ayah[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const result = await alQuranCloudService.getSurah(surahNumber);

    // Cache the result
    await storageService.cacheData(cacheKey, result, CACHE_DURATIONS.PAGE_DATA);

    return result;
  },

  // Set current position
  setCurrentPosition: (surahNumber: number, ayahNumber: number) => {
    set({ currentSurah: surahNumber, currentAyah: ayahNumber });

    // Save to preferences
    storageService.loadPreferences().then((preferences) => {
      storageService.savePreferences({
        ...preferences,
        lastReadSurah: surahNumber,
        lastReadAyah: ayahNumber,
      });
    });
  },

  // Go to specific page
  goToPage: async (pageNumber: number) => {
    await get().loadPage(pageNumber);
  },

  // Next page
  nextPage: async () => {
    const { currentPageNumber } = get();
    if (currentPageNumber < 604) {
      await get().loadPage(currentPageNumber + 1);
    }
  },

  // Previous page
  previousPage: async () => {
    const { currentPageNumber } = get();
    if (currentPageNumber > 1) {
      await get().loadPage(currentPageNumber - 1);
    }
  },

  // Select an Ayah
  selectAyah: (ayahNumber: number | null) => {
    set({ selectedAyahNumber: ayahNumber });
  },

  // Add bookmark
  addBookmark: async (bookmark) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const bookmarks = [...get().bookmarks, newBookmark];
    set({ bookmarks });
    await storageService.saveBookmarks(bookmarks);
  },

  // Remove bookmark
  removeBookmark: async (bookmarkId: string) => {
    const bookmarks = get().bookmarks.filter((b) => b.id !== bookmarkId);
    set({ bookmarks });
    await storageService.saveBookmarks(bookmarks);
  },

  // Load bookmarks
  loadBookmarks: async () => {
    const bookmarks = await storageService.loadBookmarks();
    set({ bookmarks });
  },
}));
