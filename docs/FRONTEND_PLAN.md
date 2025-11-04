# Frontend Implementation Plan

**Project**: QuranApp MVP
**Version**: 1.0.0
**Created**: November 2025
**Status**: Implementation Ready

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Zustand Store Specifications](#zustand-store-specifications)
3. [Custom React Hooks](#custom-react-hooks)
4. [Routing Structure](#routing-structure)
5. [Folder Structure](#folder-structure)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Responsive Design Strategy](#responsive-design-strategy)
8. [UI Component Library Plan](#ui-component-library-plan)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Component Architecture

### Atomic Design Hierarchy

Following atomic design principles, components are organized into 5 levels:

#### 1. Atoms (Basic Building Blocks)

**Typography Components**
- `ArabicText` - Arabic text with proper typography settings
- `TranslationText` - Translation text with language support
- `SurahName` - Surah name display component
- `VerseNumber` - Verse number indicator
- `PageNumber` - Page number indicator

**Interactive Elements**
- `IconButton` - Reusable icon button
- `PlayButton` - Audio play/pause button
- `BookmarkIcon` - Bookmark indicator
- `SettingsIcon` - Settings menu trigger
- `SearchIcon` - Search trigger

**Form Elements**
- `Slider` - Volume, speed, font size controls
- `Toggle` - Dark mode, Tajweed coloring
- `Input` - Search input, page number input
- `Select` - Reciter selection, language selection

**Feedback Elements**
- `LoadingSpinner` - Loading indicator
- `ProgressBar` - Download progress, memorization progress
- `Toast` - Notification messages
- `Skeleton` - Loading skeleton screens

#### 2. Molecules (Simple Component Groups)

**Quran Display**
- `VerseCard` - Single verse with Arabic text, translation, and controls
- `VerseHighlight` - Highlighted verse with actions (share, copy, tafsir)
- `SurahHeader` - Surah name, revelation info, verse count
- `PageHeader` - Page number, Juz' indicator
- `BismillahComponent` - Bismillah separator between Surahs

**Audio Controls**
- `PlaybackControls` - Play, pause, skip, repeat buttons
- `VolumeControl` - Volume slider with mute button
- `SpeedControl` - Playback speed selector
- `ReciterSelector` - Reciter dropdown with info
- `RepeatModeSelector` - Verse, Surah, range repeat options

**Navigation**
- `SurahListItem` - Single Surah in list with metadata
- `JuzNavigator` - Juz' selection component
- `PageNavigator` - Page jump input and slider
- `BookmarkItem` - Single bookmark with name and location
- `SearchResultItem` - Search result with context

**Memorization**
- `RepetitionCounter` - Visual repetition counter
- `MemorizationStats` - Progress statistics display
- `ProgressRing` - Circular progress indicator
- `StreakCounter` - Daily streak display
- `GoalSetter` - Daily goal input and display

**Settings**
- `ThemeToggle` - Light/dark/sepia mode selector
- `FontSizeSlider` - Arabic and translation font size
- `LanguageSelector` - UI language selection
- `NotificationSettings` - Reminder time and frequency

#### 3. Organisms (Complex Component Groups)

**Pages**
- `QuranPageView` - Complete Mushaf page with verses
- `VerseListView` - Continuous scrolling list of verses
- `SurahView` - Complete Surah with header and verses
- `AudioPlayer` - Full audio player with all controls
- `SearchPanel` - Search input, filters, and results

**Features**
- `MemorizationPanel` - Memorization mode with all controls
- `TafsirPanel` - Tafsir display with sources and navigation
- `BookmarkManager` - Bookmark list with organization
- `DownloadManager` - Audio download queue and storage management
- `SettingsPanel` - Complete settings with all preferences

**Navigation**
- `SurahList` - Full Surah index with search
- `JuzList` - Complete Juz' navigator
- `NavigationMenu` - Main navigation menu
- `QuickNavigation` - Quick access to recent, bookmarks

#### 4. Templates (Page Layouts)

**Layout Templates**
- `MainLayout` - Header, content area, audio player (fixed bottom)
- `ReadingLayout` - Full-screen reading mode (minimal chrome)
- `ModalLayout` - Modal dialogs for settings, tafsir, search
- `SplitLayout` - Side-by-side Arabic and translation

**Feature Templates**
- `QuranReaderTemplate` - Mushaf or list view with navigation
- `MemorizationTemplate` - Memorization mode with practice tools
- `SearchTemplate` - Search interface with filters and results
- `SettingsTemplate` - Settings organized by categories

#### 5. Pages (Route Components)

**Main Pages**
- `HomePage` - Welcome screen with last read position
- `QuranPage` - Main Quran reading interface
- `MemorizationPage` - Memorization practice interface
- `SearchPage` - Search and explore interface
- `SettingsPage` - Settings and preferences
- `AboutPage` - App information, credits, sources

---

## Zustand Store Specifications

### 1. Quran Store (`useQuranStore`)

**Purpose**: Manage Quran text, current position, and reading state

```typescript
interface QuranStore {
  // State
  currentSurah: number;
  currentVerse: number;
  currentPage: number;
  currentJuz: number;
  readingMode: 'mushaf' | 'list' | 'surah';
  verses: Verse[];
  bookmarks: Bookmark[];
  lastReadPosition: Position;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentPosition: (position: Position) => void;
  goToSurah: (surahNumber: number) => void;
  goToVerse: (surahNumber: number, verseNumber: number) => void;
  goToPage: (pageNumber: number) => void;
  goToJuz: (juzNumber: number) => void;
  setReadingMode: (mode: 'mushaf' | 'list' | 'surah') => void;
  nextPage: () => void;
  previousPage: () => void;
  nextVerse: () => void;
  previousVerse: () => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  updateLastReadPosition: () => void;
  fetchVerses: (params: FetchParams) => Promise<void>;
  selectVerse: (verseId: string) => void;
  clearSelection: () => void;
}
```

**Persistence**:
- `currentSurah`, `currentVerse`, `currentPage`: sessionStorage
- `bookmarks`, `lastReadPosition`: localStorage
- `verses`: IndexedDB (via `idb` wrapper)

**Computed Values**:
- `selectedVerseId`: Current selected verse
- `isFirstPage`: Boolean for navigation
- `isLastPage`: Boolean for navigation
- `totalPages`: 604 (constant)

---

### 2. Audio Store (`useAudioStore`)

**Purpose**: Manage audio playback state and controls

```typescript
interface AudioStore {
  // State
  isPlaying: boolean;
  currentReciter: Reciter;
  availableReciters: Reciter[];
  currentVerse: number;
  currentSurah: number;
  playbackSpeed: number;
  volume: number;
  repeatMode: 'none' | 'verse' | 'range' | 'surah' | 'all';
  repeatRange: { start: number; end: number } | null;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  downloadedAudio: Set<string>; // verse IDs

  // Actions
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  nextVerse: () => Promise<void>;
  previousVerse: () => Promise<void>;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setSpeed: (speed: number) => void;
  setReciter: (reciter: Reciter) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setRepeatRange: (start: number, end: number) => void;
  downloadAudio: (params: DownloadParams) => Promise<void>;
  clearCache: () => Promise<void>;
  onTimeUpdate: (callback: (time: number) => void) => void;
  onVerseChange: (callback: (verse: number) => void) => void;
}
```

**Persistence**:
- `currentReciter`, `playbackSpeed`, `volume`, `repeatMode`: localStorage
- `downloadedAudio`: IndexedDB with audio blobs

**Side Effects**:
- Sync with Quran store for verse highlighting
- Background playback support via Media Session API
- Auto-scroll during playback

---

### 3. Memorization Store (`useMemorizationStore`)

**Purpose**: Track memorization progress and practice sessions

```typescript
interface MemorizationStore {
  // State
  isMemorizationMode: boolean;
  repetitionCount: number;
  currentRepetition: number;
  selectedVerses: number[];
  practiceMode: 'normal' | 'hide-text' | 'first-word' | 'test';
  progress: {
    [verseId: string]: {
      status: 'new' | 'learning' | 'mastered';
      repetitions: number;
      lastReviewed: Date;
      nextReview: Date;
      streak: number;
    };
  };
  dailyGoal: number;
  versesMemorizedToday: number;
  currentStreak: number;
  longestStreak: number;
  statistics: {
    totalVerses: number;
    totalTime: number;
    averageDaily: number;
  };

  // Actions
  toggleMemorizationMode: () => void;
  setRepetitionCount: (count: number) => void;
  incrementRepetition: () => void;
  resetRepetitions: () => void;
  selectVerseRange: (start: number, end: number) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  markVerseMastered: (verseId: string) => void;
  markVerseLearning: (verseId: string) => void;
  resetVerseProgress: (verseId: string) => void;
  setDailyGoal: (verses: number) => void;
  updateStreak: () => void;
  getVersesToReview: () => string[];
  scheduleReview: (verseId: string) => void;
  recordPracticeSession: (duration: number) => void;
  getProgressStats: () => Statistics;
}
```

**Persistence**:
- All state: localStorage and IndexedDB
- Daily sync for streak calculation

**Algorithms**:
- **Spaced Repetition**: SM-2 algorithm for review scheduling
- **Streak Calculation**: Based on daily practice consistency

---

### 4. Translation Store (`useTranslationStore`)

**Purpose**: Manage translation display and preferences

```typescript
interface TranslationStore {
  // State
  selectedLanguages: string[];
  availableTranslations: Translation[];
  translationsByVerse: {
    [verseId: string]: {
      [language: string]: string;
    };
  };
  displayMode: 'arabic-only' | 'translation-only' | 'both-stacked' | 'both-side';
  showTransliteration: boolean;
  isLoading: boolean;

  // Actions
  addTranslation: (language: string) => void;
  removeTranslation: (language: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  toggleTransliteration: () => void;
  fetchTranslations: (verseIds: string[]) => Promise<void>;
  clearCache: () => void;
}
```

**Persistence**:
- `selectedLanguages`, `displayMode`: localStorage
- `translationsByVerse`: IndexedDB

---

### 5. Settings Store (`useSettingsStore`)

**Purpose**: Global app settings and preferences

```typescript
interface SettingsStore {
  // Theme
  theme: 'light' | 'dark' | 'sepia' | 'auto';

  // Typography
  arabicFontSize: number; // 16-32px
  translationFontSize: number; // 14-24px
  arabicFont: 'amiri-quran' | 'kfgqpc' | 'traditional';
  showTajweed: boolean;

  // UI Preferences
  language: string; // UI language
  showPageNumbers: boolean;
  showVerseNumbers: boolean;
  autoScroll: boolean;

  // Notifications
  dailyReminderEnabled: boolean;
  reminderTime: string; // "09:00"
  reviewReminderEnabled: boolean;
  prayerTimeNotifications: boolean;

  // Privacy
  analyticsEnabled: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  setArabicFont: (font: ArabicFont) => void;
  toggleTajweed: () => void;
  setLanguage: (lang: string) => void;
  setDailyReminder: (enabled: boolean, time?: string) => void;
  setAnalytics: (enabled: boolean) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => void;
}
```

**Persistence**:
- All settings: localStorage
- Settings export/import for backup

---

### 6. Offline Store (`useOfflineStore`)

**Purpose**: Manage offline content and sync status

```typescript
interface OfflineStore {
  // State
  isOnline: boolean;
  quranTextCached: boolean;
  cachedTranslations: string[];
  cachedAudioSurahs: Set<number>;
  downloadQueue: DownloadTask[];
  storageUsed: number; // bytes
  storageQuota: number; // bytes
  lastSyncTime: Date;

  // Actions
  checkOnlineStatus: () => void;
  cacheQuranText: () => Promise<void>;
  cacheTranslation: (language: string) => Promise<void>;
  downloadSurahAudio: (surahNumber: number, reciter: string) => Promise<void>;
  downloadJuzAudio: (juzNumber: number, reciter: string) => Promise<void>;
  cancelDownload: (taskId: string) => void;
  clearCache: (type: 'text' | 'audio' | 'translations' | 'all') => Promise<void>;
  getStorageInfo: () => Promise<StorageInfo>;
  syncWithServer: () => Promise<void>;
}
```

**Persistence**:
- All cached data: IndexedDB
- Storage info: calculated from IndexedDB

**Service Worker Integration**:
- Coordinate with Workbox for cache management
- Background sync for updates

---

### 7. Search Store (`useSearchStore`)

**Purpose**: Manage search functionality and history

```typescript
interface SearchStore {
  // State
  query: string;
  results: SearchResult[];
  filters: {
    surahs: number[];
    juz: number[];
    pageRange: [number, number] | null;
    translationLanguage: string | null;
  };
  searchHistory: string[];
  savedSearches: SavedSearch[];
  isSearching: boolean;

  // Actions
  setQuery: (query: string) => void;
  search: () => Promise<void>;
  searchArabic: (query: string, withDiacritics: boolean) => Promise<void>;
  searchTranslation: (query: string, language: string) => Promise<void>;
  searchRootWord: (root: string) => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  saveSearch: (name: string, query: string, filters: Filters) => void;
  deleteSavedSearch: (id: string) => void;
}
```

**Persistence**:
- `searchHistory`, `savedSearches`: localStorage
- Search index: IndexedDB (pre-built for offline search)

---

## Custom React Hooks

### Navigation Hooks

#### `useQuranNavigation`
```typescript
function useQuranNavigation() {
  return {
    goToSurah: (surahNumber: number) => void,
    goToVerse: (surah: number, verse: number) => void,
    goToPage: (pageNumber: number) => void,
    goToJuz: (juzNumber: number) => void,
    goToNextPage: () => void,
    goToPreviousPage: () => void,
    canGoNext: boolean,
    canGoPrevious: boolean,
  };
}
```

**Features**:
- Syncs with Quran store
- Handles navigation boundaries
- Updates last read position
- Manages navigation history

#### `useKeyboardNavigation`
```typescript
function useKeyboardNavigation(enabled: boolean = true) {
  // Listens for:
  // - Arrow keys: Navigate verses/pages
  // - Space: Play/pause audio
  // - B: Toggle bookmark
  // - F: Full-screen
  // - /: Focus search
}
```

### Audio Hooks

#### `useAudioPlayer`
```typescript
function useAudioPlayer() {
  return {
    play: () => Promise<void>,
    pause: () => void,
    toggle: () => Promise<void>,
    next: () => Promise<void>,
    previous: () => Promise<void>,
    isPlaying: boolean,
    currentTime: number,
    duration: number,
    progress: number, // 0-100
  };
}
```

**Features**:
- Manages HTMLAudioElement
- Handles verse transitions
- Synchronizes with Quran position
- Implements repeat logic

#### `useAudioSync`
```typescript
function useAudioSync() {
  // Syncs audio playback with verse highlighting
  // Auto-scrolls to current verse
  // Returns currently playing verse ID
}
```

### Memorization Hooks

#### `useMemorization`
```typescript
function useMemorization(verseIds: string[]) {
  return {
    startPractice: () => void,
    stopPractice: () => void,
    nextRepetition: () => void,
    currentRepetition: number,
    totalRepetitions: number,
    isComplete: boolean,
    progress: number, // 0-100
  };
}
```

#### `useSpacedRepetition`
```typescript
function useSpacedRepetition() {
  return {
    getVersesToReview: () => string[],
    markReviewed: (verseId: string, quality: 0-5) => void,
    scheduleNext: (verseId: string) => Date,
  };
}
```

### Offline Hooks

#### `useOfflineStatus`
```typescript
function useOfflineStatus() {
  return {
    isOnline: boolean,
    isOfflineCapable: boolean,
    lastSync: Date,
  };
}
```

#### `useDownloadManager`
```typescript
function useDownloadManager() {
  return {
    downloadSurah: (surahNumber: number) => Promise<void>,
    downloadJuz: (juzNumber: number) => Promise<void>,
    isDownloading: boolean,
    progress: number, // 0-100
    queue: DownloadTask[],
    cancel: (taskId: string) => void,
  };
}
```

### Performance Hooks

#### `useVirtualScroll`
```typescript
function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  return {
    visibleItems: T[],
    scrollToIndex: (index: number) => void,
    containerRef: RefObject<HTMLDivElement>,
  };
}
```

**Purpose**: Efficient rendering of long lists (verse lists, search results)

#### `useLazyLoad`
```typescript
function useLazyLoad<T>(
  loadMore: () => Promise<T[]>,
  threshold: number = 200
) {
  return {
    items: T[],
    isLoading: boolean,
    hasMore: boolean,
    observerRef: RefObject<HTMLDivElement>,
  };
}
```

### UI Hooks

#### `useDebounce`
```typescript
function useDebounce<T>(value: T, delay: number = 300): T {
  // Returns debounced value for search input, etc.
}
```

#### `useMediaQuery`
```typescript
function useMediaQuery(query: string): boolean {
  // Returns true if media query matches
  // Example: useMediaQuery('(min-width: 768px)')
}
```

#### `useTheme`
```typescript
function useTheme() {
  return {
    theme: 'light' | 'dark' | 'sepia',
    setTheme: (theme: Theme) => void,
    toggleTheme: () => void,
    isDark: boolean,
  };
}
```

#### `useToast`
```typescript
function useToast() {
  return {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void,
    hideToast: () => void,
  };
}
```

### Data Hooks

#### `useVerses`
```typescript
function useVerses(params: FetchParams) {
  return {
    verses: Verse[],
    isLoading: boolean,
    error: Error | null,
    refetch: () => Promise<void>,
  };
}
```

#### `useTranslations`
```typescript
function useTranslations(verseIds: string[], languages: string[]) {
  return {
    translations: Record<string, Record<string, string>>,
    isLoading: boolean,
    error: Error | null,
  };
}
```

#### `useTafsir`
```typescript
function useTafsir(verseId: string, source?: string) {
  return {
    tafsir: string,
    source: string,
    isLoading: boolean,
    error: Error | null,
  };
}
```

---

## Routing Structure

### React Router Configuration

```typescript
// Main routes
const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'quran',
        element: <QuranPage />,
        children: [
          {
            path: 'surah/:surahNumber',
            element: <SurahView />,
          },
          {
            path: 'surah/:surahNumber/verse/:verseNumber',
            element: <VerseView />,
          },
          {
            path: 'page/:pageNumber',
            element: <PageView />,
          },
          {
            path: 'juz/:juzNumber',
            element: <JuzView />,
          },
        ],
      },
      {
        path: 'memorization',
        element: <MemorizationPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'bookmarks',
        element: <BookmarksPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
```

### URL Patterns

| Route | Example | Description |
|-------|---------|-------------|
| `/` | `/` | Home page with last read position |
| `/quran` | `/quran` | Main Quran reading interface |
| `/quran/surah/:id` | `/quran/surah/1` | Specific Surah view (Al-Fatiha) |
| `/quran/surah/:id/verse/:vid` | `/quran/surah/2/verse/255` | Direct verse link (Ayat al-Kursi) |
| `/quran/page/:page` | `/quran/page/1` | Mushaf page view |
| `/quran/juz/:juz` | `/quran/juz/30` | Juz' view (30th Juz') |
| `/memorization` | `/memorization` | Memorization practice interface |
| `/search` | `/search?q=rahman` | Search with query parameter |
| `/bookmarks` | `/bookmarks` | Saved bookmarks list |
| `/settings` | `/settings` | App settings and preferences |
| `/about` | `/about` | About app, credits, sources |

### Route Guards

```typescript
// Redirect to onboarding for first-time users
function OnboardingGuard({ children }) {
  const hasCompletedOnboarding = useSettingsStore(
    state => state.hasCompletedOnboarding
  );

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
```

### Deep Linking

Support deep links for:
- Specific verses: `quranapp://surah/2/verse/255`
- Search results: `quranapp://search?q=patience`
- Bookmarks: `quranapp://bookmark/:id`

---

## Folder Structure

```
src/
├── assets/                  # Static assets
│   ├── fonts/              # Arabic fonts (Amiri Quran, KFGQPC)
│   ├── icons/              # SVG icons
│   ├── images/             # Images (logo, backgrounds)
│   └── audio/              # Sample audio files
│
├── components/             # React components
│   ├── atoms/             # Atomic components
│   │   ├── ArabicText.tsx
│   │   ├── TranslationText.tsx
│   │   ├── IconButton.tsx
│   │   ├── Slider.tsx
│   │   ├── Toggle.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Toast.tsx
│   │   └── Skeleton.tsx
│   │
│   ├── molecules/         # Molecular components
│   │   ├── quran/
│   │   │   ├── VerseCard.tsx
│   │   │   ├── SurahHeader.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── BismillahComponent.tsx
│   │   ├── audio/
│   │   │   ├── PlaybackControls.tsx
│   │   │   ├── VolumeControl.tsx
│   │   │   ├── SpeedControl.tsx
│   │   │   └── ReciterSelector.tsx
│   │   ├── navigation/
│   │   │   ├── SurahListItem.tsx
│   │   │   ├── JuzNavigator.tsx
│   │   │   ├── PageNavigator.tsx
│   │   │   └── BookmarkItem.tsx
│   │   ├── memorization/
│   │   │   ├── RepetitionCounter.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   └── StreakCounter.tsx
│   │   └── settings/
│   │       ├── ThemeToggle.tsx
│   │       ├── FontSizeSlider.tsx
│   │       └── LanguageSelector.tsx
│   │
│   ├── organisms/         # Organism components
│   │   ├── pages/
│   │   │   ├── QuranPageView.tsx
│   │   │   ├── VerseListView.tsx
│   │   │   └── SurahView.tsx
│   │   ├── features/
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── MemorizationPanel.tsx
│   │   │   ├── TafsirPanel.tsx
│   │   │   ├── BookmarkManager.tsx
│   │   │   ├── DownloadManager.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── navigation/
│   │       ├── SurahList.tsx
│   │       ├── JuzList.tsx
│   │       ├── NavigationMenu.tsx
│   │       └── QuickNavigation.tsx
│   │
│   ├── templates/         # Template components
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── ReadingLayout.tsx
│   │   │   ├── ModalLayout.tsx
│   │   │   └── SplitLayout.tsx
│   │   └── features/
│   │       ├── QuranReaderTemplate.tsx
│   │       ├── MemorizationTemplate.tsx
│   │       ├── SearchTemplate.tsx
│   │       └── SettingsTemplate.tsx
│   │
│   └── pages/             # Page components
│       ├── HomePage.tsx
│       ├── QuranPage.tsx
│       ├── MemorizationPage.tsx
│       ├── SearchPage.tsx
│       ├── BookmarksPage.tsx
│       ├── SettingsPage.tsx
│       ├── AboutPage.tsx
│       └── NotFoundPage.tsx
│
├── hooks/                 # Custom React hooks
│   ├── navigation/
│   │   ├── useQuranNavigation.ts
│   │   └── useKeyboardNavigation.ts
│   ├── audio/
│   │   ├── useAudioPlayer.ts
│   │   └── useAudioSync.ts
│   ├── memorization/
│   │   ├── useMemorization.ts
│   │   └── useSpacedRepetition.ts
│   ├── offline/
│   │   ├── useOfflineStatus.ts
│   │   └── useDownloadManager.ts
│   ├── performance/
│   │   ├── useVirtualScroll.ts
│   │   └── useLazyLoad.ts
│   ├── ui/
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useTheme.ts
│   │   └── useToast.ts
│   └── data/
│       ├── useVerses.ts
│       ├── useTranslations.ts
│       └── useTafsir.ts
│
├── stores/                # Zustand stores
│   ├── quranStore.ts
│   ├── audioStore.ts
│   ├── memorizationStore.ts
│   ├── translationStore.ts
│   ├── settingsStore.ts
│   ├── offlineStore.ts
│   ├── searchStore.ts
│   └── index.ts          # Export all stores
│
├── services/              # API and business logic
│   ├── api/
│   │   ├── quranApi.ts   # Tanzil API integration
│   │   ├── audioApi.ts   # Quranicaudio API
│   │   ├── translationApi.ts
│   │   └── tafsirApi.ts
│   ├── offline/
│   │   ├── cacheManager.ts
│   │   ├── downloadManager.ts
│   │   └── syncManager.ts
│   ├── audio/
│   │   ├── audioManager.ts
│   │   └── mediaSessionManager.ts
│   ├── memorization/
│   │   ├── spacedRepetition.ts
│   │   └── progressTracker.ts
│   └── search/
│       ├── searchEngine.ts
│       └── arabicMorphology.ts
│
├── utils/                 # Utility functions
│   ├── arabic/
│   │   ├── typography.ts  # Arabic text processing
│   │   ├── tajweed.ts     # Tajweed rules
│   │   └── morphology.ts  # Root word analysis
│   ├── formatting/
│   │   ├── numbers.ts     # Arabic/English number conversion
│   │   ├── dates.ts       # Date formatting
│   │   └── time.ts        # Time formatting
│   ├── validation/
│   │   ├── verses.ts      # Verse ID validation
│   │   └── input.ts       # User input validation
│   ├── performance/
│   │   ├── debounce.ts
│   │   ├── throttle.ts
│   │   └── memoize.ts
│   └── constants/
│       ├── surahs.ts      # Surah metadata
│       ├── reciters.ts    # Reciter information
│       └── config.ts      # App configuration
│
├── types/                 # TypeScript definitions
│   ├── quran.types.ts
│   ├── audio.types.ts
│   ├── memorization.types.ts
│   ├── translation.types.ts
│   ├── settings.types.ts
│   ├── api.types.ts
│   └── index.ts          # Export all types
│
├── styles/                # Global styles
│   ├── globals.css        # Global CSS
│   ├── fonts.css          # Font definitions
│   ├── themes.css         # Theme variables
│   ├── animations.css     # Animation utilities
│   └── tailwind.css       # Tailwind imports
│
├── lib/                   # Third-party library configs
│   ├── axios.ts           # Axios instance
│   ├── idb.ts             # IndexedDB wrapper
│   └── workbox.ts         # Service worker config
│
├── workers/               # Web Workers
│   ├── search.worker.ts   # Offline search worker
│   └── audio.worker.ts    # Audio processing worker
│
├── App.tsx                # Root component
├── main.tsx               # Entry point
├── router.tsx             # Route configuration
└── vite-env.d.ts          # Vite type definitions
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `VerseCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useQuranNavigation.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `quranStore.ts`)
- **Utils**: camelCase (e.g., `typography.ts`)
- **Types**: camelCase with `.types.ts` suffix (e.g., `quran.types.ts`)
- **Constants**: camelCase or UPPER_CASE (e.g., `config.ts`, `API_URL`)

---

## TypeScript Interfaces

### Core Quran Types

```typescript
// src/types/quran.types.ts

export interface Verse {
  id: string; // "1:1" (surah:verse)
  surah: number; // 1-114
  verse: number; // 1-286
  text: string; // Arabic text
  page: number; // 1-604 (Madani Mushaf)
  juz: number; // 1-30
  hizb: number; // 1-60
  manzil: number; // 1-7
  sajdah?: boolean; // Prostration verse
}

export interface Surah {
  id: number; // 1-114
  name: string; // Arabic name
  nameArabic: string;
  nameEnglish: string;
  transliteration: string;
  translation: string; // English meaning
  totalVerses: number;
  revelationLocation: 'Meccan' | 'Medinan';
  revelationOrder: number; // 1-114 (chronological order)
  startPage: number;
  endPage: number;
}

export interface Position {
  surah: number;
  verse: number;
  page: number;
  juz: number;
}

export interface Bookmark {
  id: string;
  name: string;
  position: Position;
  createdAt: Date;
  category?: string;
  notes?: string;
}
```

### Audio Types

```typescript
// src/types/audio.types.ts

export interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  style: 'Hafs' | 'Warsh' | 'Qalun'; // Narration
  audioQuality: number; // bitrate in kbps
  language: string;
  biography?: string;
}

export interface AudioSegment {
  reciterId: string;
  surah: number;
  verse: number;
  url: string;
  duration: number; // in seconds
  cached: boolean;
  fileSize?: number; // in bytes
}

export type RepeatMode = 'none' | 'verse' | 'range' | 'surah' | 'all';

export interface RepeatRange {
  start: number; // verse ID
  end: number; // verse ID
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number; // 0-100 percentage
}
```

### Memorization Types

```typescript
// src/types/memorization.types.ts

export type MemorizationStatus = 'new' | 'learning' | 'mastered';

export type PracticeMode = 'normal' | 'hide-text' | 'first-word' | 'test';

export interface VerseProgress {
  verseId: string;
  status: MemorizationStatus;
  repetitions: number;
  lastReviewed: Date;
  nextReview: Date;
  streak: number;
  difficulty: number; // 0-5 (SM-2 algorithm)
}

export interface MemorizationSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  verses: string[];
  repetitionCount: number;
  practiceMode: PracticeMode;
  completed: boolean;
}

export interface MemorizationStatistics {
  totalVerses: number;
  versesMemorized: number;
  versesLearning: number;
  versesNew: number;
  totalTime: number; // in minutes
  averageDaily: number;
  currentStreak: number;
  longestStreak: number;
}
```

### Translation Types

```typescript
// src/types/translation.types.ts

export interface Translation {
  id: string;
  language: string;
  languageCode: string; // ISO 639-1
  translatorName: string;
  translatorNameArabic?: string;
  source: string;
  year?: number;
  verified: boolean;
}

export type DisplayMode =
  | 'arabic-only'
  | 'translation-only'
  | 'both-stacked'
  | 'both-side';

export interface TranslationContent {
  verseId: string;
  language: string;
  text: string;
  footnotes?: string[];
}
```

### Settings Types

```typescript
// src/types/settings.types.ts

export type Theme = 'light' | 'dark' | 'sepia' | 'auto';

export type ArabicFont = 'amiri-quran' | 'kfgqpc' | 'traditional';

export type ReadingMode = 'mushaf' | 'list' | 'surah';

export interface TypographySettings {
  arabicFontSize: number; // 16-32
  translationFontSize: number; // 14-24
  arabicFont: ArabicFont;
  showTajweed: boolean;
  lineHeight: number; // 1.5-2.5
}

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  reminderTime: string; // "HH:MM"
  reviewReminderEnabled: boolean;
  prayerTimeNotifications: boolean;
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  personalizedRecommendations: boolean;
}

export interface AppSettings {
  theme: Theme;
  language: string; // UI language
  typography: TypographySettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  readingMode: ReadingMode;
  autoScroll: boolean;
  showPageNumbers: boolean;
  showVerseNumbers: boolean;
}
```

### API Types

```typescript
// src/types/api.types.ts

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface FetchParams {
  surah?: number;
  verse?: number;
  page?: number;
  juz?: number;
  startVerse?: string;
  endVerse?: string;
}

export interface SearchParams {
  query: string;
  language?: string;
  surahs?: number[];
  juz?: number[];
  pageRange?: [number, number];
  withDiacritics?: boolean;
}

export interface DownloadTask {
  id: string;
  type: 'audio' | 'translation' | 'tafsir';
  resourceId: string; // surah number, language code, etc.
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number; // 0-100
  totalSize?: number;
  downloadedSize?: number;
}
```

### Search Types

```typescript
// src/types/search.types.ts

export interface SearchResult {
  verseId: string;
  surah: number;
  verse: number;
  arabicText: string;
  translationText?: string;
  matchType: 'exact' | 'partial' | 'root';
  highlights: Highlight[];
  relevance: number; // 0-1
}

export interface Highlight {
  start: number;
  end: number;
  text: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchParams;
  createdAt: Date;
}

export interface SearchFilters {
  surahs: number[];
  juz: number[];
  pageRange: [number, number] | null;
  translationLanguage: string | null;
  revelationLocation?: 'Meccan' | 'Medinan';
}
```

---

## Responsive Design Strategy

### Breakpoints

```css
/* Tailwind CSS Breakpoints */
/* Mobile First Approach */

/* xs: 320px - 639px (Mobile portrait) */
@media (min-width: 320px) { /* default */ }

/* sm: 640px - 767px (Mobile landscape) */
@media (min-width: 640px) { /* Tailwind sm: */ }

/* md: 768px - 1023px (Tablet portrait) */
@media (min-width: 768px) { /* Tailwind md: */ }

/* lg: 1024px - 1279px (Tablet landscape, small desktop) */
@media (min-width: 1024px) { /* Tailwind lg: */ }

/* xl: 1280px - 1535px (Desktop) */
@media (min-width: 1280px) { /* Tailwind xl: */ }

/* 2xl: 1536px+ (Large desktop) */
@media (min-width: 1536px) { /* Tailwind 2xl: */ }
```

### Mobile-First Design Principles

1. **Content Prioritization**
   - Quran text is the primary focus
   - Minimal chrome (navigation, controls)
   - Progressive disclosure for advanced features

2. **Touch-Friendly Interface**
   - Minimum touch target: 44x44px (iOS guidelines)
   - Adequate spacing between interactive elements
   - Swipe gestures for natural navigation

3. **Performance Optimization**
   - Lazy load images and audio
   - Virtual scrolling for long lists
   - Code splitting by route
   - Optimized bundle sizes

### Responsive Component Patterns

#### Quran Page View

```typescript
// Mobile (< 768px)
- Single column layout
- Full-width verses
- Fixed audio player at bottom
- Collapsible navigation

// Tablet (768px - 1023px)
- Two-column layout for Arabic + Translation
- Side drawer for navigation
- Floating audio player

// Desktop (1024px+)
- Three-column layout (navigation, content, sidebar)
- Fixed side navigation
- Integrated audio player in sidebar
```

#### Navigation

```typescript
// Mobile
- Bottom navigation bar (Home, Quran, Memorization, Settings)
- Hamburger menu for secondary options
- Swipe gestures for page navigation

// Tablet
- Side drawer navigation
- Tabbed interface for features
- Bottom audio player bar

// Desktop
- Fixed left sidebar navigation
- Top header with quick actions
- Right sidebar for audio/memorization tools
```

#### Audio Player

```typescript
// Mobile
- Fixed bottom bar (collapsed)
- Swipe up to expand full player
- Mini player with play/pause only (collapsed)

// Tablet
- Bottom bar with more controls visible
- Expand to overlay player

// Desktop
- Integrated in right sidebar
- All controls visible
- Larger album art and reciter info
```

### Typography Scaling

```typescript
// Mobile (320px - 767px)
arabicFontSize: 20px (default)
translationFontSize: 16px
lineHeight: 1.8

// Tablet (768px - 1023px)
arabicFontSize: 22px
translationFontSize: 17px
lineHeight: 1.85

// Desktop (1024px+)
arabicFontSize: 24px
translationFontSize: 18px
lineHeight: 2.0
```

### Layout Patterns

#### Grid System

```css
/* Mobile: Single column */
.quran-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet: Two columns */
@media (min-width: 768px) {
  .quran-layout {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}

/* Desktop: Three columns */
@media (min-width: 1024px) {
  .quran-layout {
    grid-template-columns: 250px 1fr 300px;
    gap: 2rem;
  }
}
```

#### Flexbox Patterns

```css
/* Mobile: Stack vertically */
.verse-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Tablet+: Side by side */
@media (min-width: 768px) {
  .verse-container {
    flex-direction: row;
    gap: 2rem;
  }
}
```

### Accessibility Considerations

1. **Font Scaling**
   - Support browser font size preferences
   - Allow user font size adjustment (16px - 32px)
   - Maintain readability at all sizes

2. **Color Contrast**
   - Light theme: 4.5:1 minimum contrast ratio
   - Dark theme: 7:1 contrast ratio
   - Sepia theme: 4.5:1 minimum

3. **Keyboard Navigation**
   - Tab order logical and predictable
   - Focus indicators visible
   - Skip links for main content
   - Keyboard shortcuts for common actions

4. **Screen Reader Support**
   - Proper ARIA labels
   - Semantic HTML elements
   - Alt text for images
   - Descriptive link text

---

## UI Component Library Plan

### shadcn/ui Components

QuranApp will use **shadcn/ui** as the base component library, customized with Islamic design principles.

#### Core Components to Use

1. **Button**
   - `Button` - Primary, secondary, ghost variants
   - Customization: Add Islamic green color palette
   - Usage: Navigation, actions, audio controls

2. **Card**
   - `Card`, `CardHeader`, `CardContent`, `CardFooter`
   - Customization: Add subtle geometric patterns
   - Usage: Verse cards, Surah info, settings sections

3. **Dialog**
   - `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`
   - Usage: Tafsir popup, download confirmation, settings

4. **Dropdown Menu**
   - `DropdownMenu`, `DropdownMenuItem`
   - Usage: Reciter selection, language selection, actions menu

5. **Slider**
   - `Slider`
   - Customization: Islamic green accent color
   - Usage: Volume, speed, font size controls

6. **Switch**
   - `Switch`
   - Usage: Dark mode, Tajweed coloring, notifications

7. **Tabs**
   - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
   - Usage: Settings categories, reading modes

8. **Input**
   - `Input`
   - Usage: Search, page number input

9. **Select**
   - `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
   - Usage: Translation selection, Juz' navigation

10. **Progress**
    - `Progress`
    - Usage: Download progress, memorization progress

11. **Toast**
    - `Toast`, `ToastProvider`
    - Usage: Notifications, feedback messages

12. **Skeleton**
    - `Skeleton`
    - Usage: Loading states for verses, audio player

#### Custom Components

Components that need custom implementation:

1. **ArabicText**
   - Custom font rendering
   - Tajweed coloring
   - RTL text flow
   - Zoom and pan support

2. **AudioPlayer**
   - Custom audio visualization
   - Verse synchronization
   - Background playback support

3. **MemorizationPanel**
   - Repetition counter with Islamic patterns
   - Progress rings with calligraphic styling
   - Spaced repetition scheduler

4. **QuranPageView**
   - Mushaf page layout
   - Verse highlighting
   - Touch gestures for navigation

5. **SearchResults**
   - Arabic text highlighting
   - Translation snippets
   - Relevance sorting

### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Islamic Green Palette
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50', // Main green
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        // Golden Accent
        accent: {
          50: '#FFF9E5',
          100: '#FFF3CC',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#FFB700', // Main gold
          600: '#CC9200',
          700: '#996E00',
          800: '#664900',
          900: '#332500',
        },
        // Neutral Palette
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      fontFamily: {
        arabic: ['Amiri Quran', 'KFGQPC', 'Traditional Arabic', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'arabic-sm': '18px',
        'arabic-base': '20px',
        'arabic-lg': '24px',
        'arabic-xl': '28px',
        'arabic-2xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};
```

### Theme Implementation

```typescript
// src/styles/themes.css

:root {
  /* Light Theme */
  --background: 250 50% 98%; /* #FAFAFA */
  --foreground: 0 0% 13%; /* #212121 */
  --card: 0 0% 100%; /* #FFFFFF */
  --card-foreground: 0 0% 13%;
  --primary: 122 39% 35%; /* Islamic Green #1B5E20 */
  --primary-foreground: 0 0% 100%;
  --secondary: 45 100% 47%; /* Golden #B8860B */
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --accent: 122 39% 49%; /* #388E3C */
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 89%;
  --input: 0 0% 89%;
  --ring: 122 39% 35%;
  --radius: 0.5rem;
}

.dark {
  /* Dark Theme */
  --background: 0 0% 7%; /* #121212 */
  --foreground: 0 0% 100%; /* #FFFFFF */
  --card: 0 0% 12%; /* #1E1E1E */
  --card-foreground: 0 0% 100%;
  --primary: 122 39% 57%; /* #4CAF50 */
  --primary-foreground: 0 0% 0%;
  --secondary: 45 100% 50%; /* #FFD700 */
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 20%;
  --muted-foreground: 0 0% 69%;
  --accent: 122 39% 59%; /* #66BB6A */
  --accent-foreground: 0 0% 0%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 20%;
  --input: 0 0% 20%;
  --ring: 122 39% 57%;
}

.sepia {
  /* Sepia Theme */
  --background: 40 30% 95%; /* #F4F1E8 */
  --foreground: 30 20% 15%; /* #362D26 */
  --card: 40 35% 98%; /* #FAF8F3 */
  --card-foreground: 30 20% 15%;
  --primary: 122 25% 35%; /* Muted green */
  --primary-foreground: 40 30% 95%;
  --secondary: 45 60% 45%; /* Muted gold */
  --secondary-foreground: 30 20% 15%;
  --muted: 40 30% 90%;
  --muted-foreground: 30 15% 40%;
  --accent: 122 25% 45%;
  --accent-foreground: 40 30% 95%;
  --destructive: 0 60% 50%;
  --destructive-foreground: 40 30% 95%;
  --border: 40 20% 80%;
  --input: 40 20% 80%;
  --ring: 122 25% 35%;
}
```

### Component Styling Conventions

1. **Use Tailwind Utility Classes**
   - Prefer utility classes over custom CSS
   - Use `@apply` for repeated patterns
   - Keep custom CSS minimal

2. **shadcn/ui Customization**
   - Extend components via `className` prop
   - Use CSS variables for theming
   - Maintain consistency with design system

3. **Responsive Utilities**
   - Mobile-first approach
   - Use Tailwind breakpoint prefixes (sm:, md:, lg:, xl:)
   - Test on real devices

4. **Accessibility Classes**
   - `sr-only` for screen reader text
   - `focus:` variants for keyboard navigation
   - Proper color contrast classes

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goals**: Project setup, basic routing, core UI components

**Tasks**:
1. ✅ Initialize Vite + React + TypeScript project
2. ✅ Install and configure TailwindCSS + shadcn/ui
3. ✅ Set up folder structure
4. ✅ Configure ESLint + Prettier + TypeScript strict mode
5. ✅ Implement routing with React Router
6. ✅ Create basic layout templates (MainLayout, ReadingLayout)
7. ✅ Build atomic components (buttons, inputs, icons)
8. ✅ Implement theme system (light, dark, sepia)
9. ✅ Set up Zustand stores (basic structure)
10. ✅ Configure PWA with Workbox

**Deliverables**:
- Working development environment
- Basic navigation structure
- Theme switching functionality
- Core UI component library

---

### Phase 2: Quran Text Display (Weeks 3-4)

**Goals**: Display Quran text with proper typography and navigation

**Tasks**:
1. Integrate Tanzil API for Quran text
2. Create `useVerses` hook for data fetching
3. Build `VerseCard` component with Arabic typography
4. Implement `QuranPageView` (Mushaf layout)
5. Implement `VerseListView` (scrollable list)
6. Create `SurahView` with headers
7. Build navigation components (Surah list, Juz' navigator, page jump)
8. Implement `useQuranNavigation` hook
9. Add verse highlighting on tap/click
10. Implement bookmarks system
11. Store last read position in localStorage
12. Add keyboard navigation support

**Deliverables**:
- Fully functional Quran text display
- Multiple reading modes (Mushaf, List, Surah)
- Complete navigation system
- Bookmarking functionality

---

### Phase 3: Audio Integration (Weeks 5-6)

**Goals**: Audio playback with verse synchronization

**Tasks**:
1. Integrate Quranicaudio API
2. Create `useAudioPlayer` hook
3. Build `AudioPlayer` organism component
4. Implement playback controls (play, pause, skip, speed, volume)
5. Add reciter selection
6. Implement verse-by-verse synchronization
7. Create `useAudioSync` hook for highlighting
8. Implement repeat modes (verse, range, Surah, all)
9. Add background playback support (Media Session API)
10. Implement audio caching for offline playback
11. Build `DownloadManager` for audio downloads
12. Create audio player UI for mobile, tablet, desktop

**Deliverables**:
- Working audio player with all controls
- Real-time verse highlighting during playback
- Multiple reciter support
- Offline audio capability

---

### Phase 4: Memorization Tools (Weeks 7-8)

**Goals**: Memorization practice features and progress tracking

**Tasks**:
1. Create `useMemorization` hook
2. Build `MemorizationPanel` organism
3. Implement repetition counter and controls
4. Add practice modes (normal, hide-text, first-word, test)
5. Create `useSpacedRepetition` hook (SM-2 algorithm)
6. Build progress tracking system
7. Implement visual progress indicators (rings, charts)
8. Create `StreakCounter` component
9. Build memorization statistics page
10. Implement daily goal setting
11. Add review scheduling and reminders
12. Create memorization session history

**Deliverables**:
- Complete memorization mode
- Progress tracking with visualizations
- Spaced repetition scheduler
- Practice testing features

---

### Phase 5: Translations & Tafsir (Weeks 9-10)

**Goals**: Translation display and Tafsir integration

**Tasks**:
1. Integrate Quran.com API for translations
2. Create `useTranslations` hook
3. Build translation selector component
4. Implement display modes (stacked, side-by-side)
5. Add translation caching for offline
6. Create `TafsirPanel` organism
7. Implement `useTafsir` hook
8. Integrate Tafsir sources (Ibn Kathir, etc.)
9. Build Tafsir popup/modal
10. Add Tafsir bookmarking
11. Implement translation search
12. Create language preference settings

**Deliverables**:
- Multi-language translation support
- Tafsir display with multiple sources
- Offline translation access
- Translation search functionality

---

### Phase 6: Search Functionality (Week 11)

**Goals**: Implement comprehensive search features

**Tasks**:
1. Create `useSearch` hook
2. Build search index for offline search
3. Implement Arabic search (with/without diacritics)
4. Add translation search
5. Implement root word search (Arabic morphology)
6. Create search filters (Surah, Juz', page range)
7. Build `SearchPanel` organism
8. Implement search history
9. Add saved searches functionality
10. Create search results highlighting
11. Implement search Web Worker for performance

**Deliverables**:
- Full-text search (Arabic and translation)
- Advanced search filters
- Search history and saved searches
- High-performance offline search

---

### Phase 7: Offline & PWA (Week 12)

**Goals**: Complete offline functionality and PWA features

**Tasks**:
1. Configure Workbox service worker
2. Implement cache-first strategies
3. Create `useOfflineStatus` hook
4. Build `DownloadManager` UI
5. Implement audio download queue
6. Add storage management interface
7. Create sync manager for background updates
8. Implement push notifications
9. Add app installation prompts
10. Create offline fallback pages
11. Implement background sync
12. Test offline functionality thoroughly

**Deliverables**:
- Complete offline support (text, audio, translations)
- Installable PWA
- Storage management
- Background sync for updates

---

### Phase 8: Settings & Preferences (Week 13)

**Goals**: Complete settings interface and user customization

**Tasks**:
1. Build `SettingsPage` with all categories
2. Implement typography settings (font size, family, Tajweed)
3. Create theme settings (light, dark, sepia, auto)
4. Add notification settings (reminders, prayer times)
5. Implement privacy settings (analytics, crash reporting)
6. Create language selector for UI
7. Add settings export/import functionality
8. Implement settings persistence
9. Build reset to defaults option
10. Create about page with credits and sources

**Deliverables**:
- Complete settings interface
- All customization options functional
- Settings backup and restore
- About page with attributions

---

### Phase 9: Polish & Optimization (Weeks 14-15)

**Goals**: Performance optimization, accessibility, testing

**Tasks**:
1. Optimize bundle size (code splitting, lazy loading)
2. Implement virtual scrolling for long lists
3. Add loading skeletons for all async content
4. Optimize images and fonts
5. Implement error boundaries
6. Add comprehensive error handling
7. Conduct accessibility audit (WCAG 2.1 AA)
8. Implement keyboard shortcuts
9. Add screen reader support
10. Create user guide and tutorials
11. Write unit tests (>80% coverage)
12. Write E2E tests (Playwright) for critical paths
13. Conduct performance testing (Lighthouse CI)
14. Fix bugs and polish UI

**Deliverables**:
- Optimized performance (Lighthouse >90)
- Accessibility compliance (WCAG 2.1 AA)
- Comprehensive test suite
- Polished user experience

---

### Phase 10: Beta Testing & Launch (Week 16)

**Goals**: Beta testing, final fixes, production deployment

**Tasks**:
1. Deploy to staging environment
2. Conduct internal testing
3. Recruit beta testers (50-100 users)
4. Collect and analyze feedback
5. Fix critical bugs
6. Optimize based on real user data
7. Conduct Islamic content review by scholars
8. Finalize privacy policy and terms of service
9. Set up error monitoring (Sentry)
10. Configure analytics (privacy-respecting)
11. Prepare launch materials
12. Deploy to production (Vercel/Netlify)
13. Submit to app stores (if applicable)
14. Announce public launch

**Deliverables**:
- Beta-tested application
- Production deployment
- Public launch
- User acquisition plan

---

## Summary

This frontend implementation plan provides a comprehensive roadmap for building QuranApp MVP with:

1. **Atomic Design Architecture**: Scalable component hierarchy from atoms to pages
2. **Zustand State Management**: Seven specialized stores for different concerns
3. **Custom React Hooks**: 15+ hooks for reusable logic
4. **React Router**: Clean routing structure with deep linking support
5. **Organized Folder Structure**: Clear separation of concerns
6. **TypeScript Types**: Comprehensive type definitions for type safety
7. **Responsive Design**: Mobile-first approach with breakpoint strategies
8. **shadcn/ui + TailwindCSS**: Modern UI library with Islamic design customization
9. **16-Week Roadmap**: Phased implementation with clear deliverables

This plan ensures a systematic, maintainable, and high-quality frontend implementation that aligns with the MVP and PRD requirements.

---

**Document Status**: ✅ Ready for Implementation
**Next Steps**: Begin Phase 1 - Foundation setup
**Review Date**: End of Phase 2 (Week 4)
