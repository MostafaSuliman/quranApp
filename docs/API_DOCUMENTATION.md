# QuranApp - API Documentation

## Document Information

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Last Updated** | November 2025 |
| **Status** | Active Development |
| **Owner** | Engineering Team |

## Table of Contents

1. [Overview](#overview)
2. [External API Integrations](#external-api-integrations)
3. [Internal Service APIs](#internal-service-apis)
4. [Data Models & Interfaces](#data-models--interfaces)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Caching Strategy](#caching-strategy)
8. [Integration Examples](#integration-examples)
9. [Developer Onboarding](#developer-onboarding)

---

## Overview

QuranApp integrates with multiple external APIs for Quranic content and provides internal service APIs for application functionality. This document covers all API endpoints, authentication methods, rate limits, error handling, and provides comprehensive examples.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        QuranApp                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │   React    │  │  Zustand   │  │   Service Layer    │    │
│  │ Components │──│   Stores   │──│  (API Services)    │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼────────┐ ┌──────▼───────┐ ┌───────▼──────┐
    │  Tanzil.net    │ │Quranicaudio  │ │ Quran.com    │
    │  (Text API)    │ │ (.com Audio) │ │  (Trans API) │
    └────────────────┘ └──────────────┘ └──────────────┘
```

### Key Technologies

- **HTTP Client**: Axios with interceptors
- **Caching**: IndexedDB (via idb library)
- **Service Worker**: Workbox for offline-first
- **State Management**: Zustand stores
- **Type Safety**: TypeScript interfaces

---

## External API Integrations

### 1. Tanzil.net API (Quran Text)

#### Overview
Tanzil.net provides verified Quranic text in Uthmani script (Hafs 'an 'Asim narration) with proper Tajweed marks.

#### Base URL
```
https://api.tanzil.net/
```

#### Authentication
No authentication required. Public API.

#### Endpoints

##### 1.1 Get Quran Text

```http
GET /quran/{edition}?{parameters}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `edition` | string | Yes | Text edition (e.g., `uthmani`, `simple`) |
| `type` | string | No | Response format: `text`, `json`, `xml` (default: `text`) |
| `quran` | string | No | Specific verses (e.g., `1:1-7`, `2`, `1:1,2:255`) |
| `page` | number | No | Madani Mushaf page number (1-604) |
| `juz` | number | No | Juz number (1-30) |
| `hizb` | number | No | Hizb number (1-60) |
| `manzil` | number | No | Manzil number (1-7) |

**Example Request:**

```typescript
// Get Surah Al-Fatiha (Chapter 1)
GET https://api.tanzil.net/quran/uthmani?type=json&quran=1

// Get specific verses
GET https://api.tanzil.net/quran/uthmani?type=json&quran=1:1-7

// Get page 1
GET https://api.tanzil.net/quran/uthmani?type=json&page=1
```

**Example Response:**

```json
{
  "code": 200,
  "data": {
    "edition": {
      "identifier": "uthmani",
      "language": "ar",
      "name": "Uthmani (Hafs)",
      "englishName": "Uthmani",
      "type": "quran"
    },
    "surahs": [
      {
        "number": 1,
        "name": "سُورَةُ ٱلْفَاتِحَةِ",
        "englishName": "Al-Faatiha",
        "englishNameTranslation": "The Opening",
        "revelationType": "Meccan",
        "numberOfAyahs": 7,
        "ayahs": [
          {
            "number": 1,
            "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
            "numberInSurah": 1,
            "juz": 1,
            "manzil": 1,
            "page": 1,
            "hizbQuarter": 1
          }
          // ... more verses
        ]
      }
    ]
  }
}
```

**Rate Limits:**
- No official rate limit
- Recommended: Max 100 requests/minute
- Implement exponential backoff for errors

**Error Responses:**

```json
{
  "code": 400,
  "status": "Bad Request",
  "data": "Invalid surah or ayah number"
}

{
  "code": 404,
  "status": "Not Found",
  "data": "Edition not found"
}
```

---

### 2. Quranicaudio.com API (Audio Recitation)

#### Overview
Provides high-quality MP3 audio files from world-renowned Quran reciters.

#### Base URL
```
https://cdn.quranicaudio.com/
```

#### Authentication
No authentication required. Public CDN.

#### Directory Structure

```
https://cdn.quranicaudio.com/
├── reciters/
│   ├── {reciter-id}/
│   │   ├── 001.mp3  (Surah 1)
│   │   ├── 002.mp3  (Surah 2)
│   │   └── ...
│   └── verse/
│       ├── {reciter-id}/
│       │   ├── 001001.mp3  (Surah 1, Verse 1)
│       │   ├── 001002.mp3  (Surah 1, Verse 2)
│       │   └── ...
```

#### Available Reciters

| Reciter ID | Name | Language | Style | Quality |
|-----------|------|----------|-------|---------|
| `mishary` | Mishary Rashid Alafasy | Arabic | Hafs | 128kbps |
| `abdul_basit` | Abdul Basit Abdul Samad | Arabic | Hafs (Mujawwad) | 192kbps |
| `saad_al_ghamdi` | Saad Al-Ghamdi | Arabic | Hafs | 128kbps |
| `abdurrahmaan_as-sudays` | Abdur Rahman Al-Sudais | Arabic | Hafs | 128kbps |
| `maher_al_muaiqly` | Maher Al Muaiqly | Arabic | Hafs | 128kbps |

#### Endpoints

##### 2.1 Get Surah Audio (Complete Chapter)

```http
GET /reciters/{reciter-id}/{surah-number}.mp3
```

**Example Request:**

```typescript
// Get Al-Fatiha recited by Mishary Alafasy
GET https://cdn.quranicaudio.com/reciters/mishary/001.mp3

// Get Al-Baqarah recited by Abdul Basit
GET https://cdn.quranicaudio.com/reciters/abdul_basit/002.mp3
```

##### 2.2 Get Verse-by-Verse Audio

```http
GET /reciters/verse/{reciter-id}/{surah-verse}.mp3
```

**Verse Numbering Format:** `SSSAAA` (3-digit Surah, 3-digit Ayah)

**Example Request:**

```typescript
// Get Surah 1, Verse 1
GET https://cdn.quranicaudio.com/reciters/verse/mishary/001001.mp3

// Get Surah 2, Verse 255 (Ayat al-Kursi)
GET https://cdn.quranicaudio.com/reciters/verse/abdul_basit/002255.mp3
```

**Audio Specifications:**

| Property | Value |
|----------|-------|
| Format | MP3 |
| Bitrate | 128-192kbps |
| Sample Rate | 44.1kHz |
| Channels | Mono/Stereo |
| Avg Verse Size | 50-150KB |
| Full Quran Size | ~150MB (per reciter) |

**Rate Limits:**
- CDN bandwidth limits apply
- Recommended: Progressive loading
- Implement download queue for offline storage

---

### 3. Quran.com API (Translations & Tafsir)

#### Overview
Comprehensive API for Quran translations, Tafsir, and metadata.

#### Base URL
```
https://api.quran.com/api/v4/
```

#### Authentication
No authentication required. Public API.

#### Endpoints

##### 3.1 List Available Translations

```http
GET /resources/translations
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `language` | string | No | Filter by language code (e.g., `en`, `ur`, `fr`) |

**Example Request:**

```typescript
GET https://api.quran.com/api/v4/resources/translations?language=en
```

**Example Response:**

```json
{
  "translations": [
    {
      "id": 131,
      "name": "Sahih International",
      "author_name": "Saheeh International",
      "slug": "sahih-international",
      "language_name": "English",
      "translated_name": {
        "name": "English",
        "language_name": "english"
      }
    },
    {
      "id": 20,
      "name": "Muhammad Asad",
      "author_name": "Muhammad Asad",
      "slug": "muhammad-asad",
      "language_name": "English",
      "translated_name": {
        "name": "English",
        "language_name": "english"
      }
    }
    // ... more translations
  ]
}
```

##### 3.2 Get Chapter (Surah) Information

```http
GET /chapters
GET /chapters/{chapter-id}
```

**Example Request:**

```typescript
// Get all chapters
GET https://api.quran.com/api/v4/chapters

// Get specific chapter
GET https://api.quran.com/api/v4/chapters/1
```

**Example Response:**

```json
{
  "chapter": {
    "id": 1,
    "revelation_place": "makkah",
    "revelation_order": 5,
    "bismillah_pre": true,
    "name_simple": "Al-Fatihah",
    "name_complex": "Al-Fātiĥah",
    "name_arabic": "ٱلْفَاتِحَة",
    "verses_count": 7,
    "pages": [1, 1],
    "translated_name": {
      "language_name": "english",
      "name": "The Opener"
    }
  }
}
```

##### 3.3 Get Verses with Translation

```http
GET /verses/by_chapter/{chapter-id}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `translations` | string | No | Translation IDs (comma-separated, e.g., `131,20`) |
| `language` | string | No | Language code |
| `page` | number | No | Page number for pagination |
| `per_page` | number | No | Results per page (default: 10, max: 50) |

**Example Request:**

```typescript
// Get Al-Fatiha with Sahih International translation
GET https://api.quran.com/api/v4/verses/by_chapter/1?translations=131&per_page=50

// Get with multiple translations
GET https://api.quran.com/api/v4/verses/by_chapter/1?translations=131,20
```

**Example Response:**

```json
{
  "verses": [
    {
      "id": 1,
      "verse_number": 1,
      "verse_key": "1:1",
      "text_uthmani": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      "text_imlaei": "بسم الله الرحمن الرحيم",
      "juz_number": 1,
      "hizb_number": 1,
      "page_number": 1,
      "translations": [
        {
          "id": 1,
          "resource_id": 131,
          "text": "In the name of Allah, the Entirely Merciful, the Especially Merciful."
        }
      ]
    }
    // ... more verses
  ],
  "pagination": {
    "per_page": 50,
    "current_page": 1,
    "next_page": null,
    "total_pages": 1,
    "total_records": 7
  }
}
```

##### 3.4 Get Tafsir (Exegesis)

```http
GET /tafsirs
GET /tafsirs/{tafsir-id}/by_chapter/{chapter-id}
```

**Available Tafsir Sources:**

| ID | Name | Language | Author |
|----|------|----------|--------|
| 169 | Tafsir Ibn Kathir | English | Ibn Kathir |
| 93 | Tafsir Al-Tabari | Arabic | Al-Tabari |
| 168 | Tafsir as-Sa'di | English | Abdur-Rahman as-Sa'di |

**Example Request:**

```typescript
// Get available Tafsir sources
GET https://api.quran.com/api/v4/tafsirs

// Get Ibn Kathir Tafsir for Al-Fatiha
GET https://api.quran.com/api/v4/tafsirs/169/by_chapter/1
```

**Example Response:**

```json
{
  "tafsirs": [
    {
      "verse_id": 1,
      "verse_key": "1:1",
      "text": "Bismillah means, I begin with the Name of Allah...",
      "resource_name": "Tafsir Ibn Kathir",
      "resource_id": 169
    }
    // ... more tafsir entries
  ]
}
```

**Rate Limits:**
- 100 requests per 15 minutes
- Use `X-RateLimit-*` headers to track usage
- Implement caching and request throttling

**Response Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## Internal Service APIs

### Architecture

```
src/services/
├── quranService.ts      # Quran text operations
├── audioService.ts      # Audio playback & downloads
├── translationService.ts # Translation management
├── tafsirService.ts     # Tafsir content
├── memorizationService.ts # Memorization tracking
├── cacheService.ts      # IndexedDB cache management
├── searchService.ts     # Search functionality
└── settingsService.ts   # User preferences
```

---

### 1. QuranService

Handles Quran text retrieval, caching, and navigation.

#### Methods

##### 1.1 getSurah

Retrieves complete Surah (chapter) with verses.

```typescript
/**
 * Get Surah by number
 * @param surahNumber - Surah number (1-114)
 * @param includeTranslation - Include translation in response
 * @param translationIds - Array of translation IDs
 * @returns Promise<Surah>
 */
async function getSurah(
  surahNumber: number,
  includeTranslation?: boolean,
  translationIds?: number[]
): Promise<Surah>
```

**Example Usage:**

```typescript
import { quranService } from '@/services/quranService';

// Get Surah without translation
const surah = await quranService.getSurah(1);

// Get Surah with translation
const surahWithTranslation = await quranService.getSurah(
  1,
  true,
  [131] // Sahih International
);
```

##### 1.2 getPage

Retrieves verses by Madani Mushaf page number.

```typescript
/**
 * Get verses by page number
 * @param pageNumber - Page number (1-604)
 * @returns Promise<Page>
 */
async function getPage(pageNumber: number): Promise<Page>
```

##### 1.3 getVerse

Retrieves specific verse.

```typescript
/**
 * Get specific verse
 * @param surahNumber - Surah number (1-114)
 * @param verseNumber - Verse number
 * @returns Promise<Verse>
 */
async function getVerse(
  surahNumber: number,
  verseNumber: number
): Promise<Verse>
```

##### 1.4 getJuz

Retrieves verses by Juz' (part).

```typescript
/**
 * Get verses by Juz' number
 * @param juzNumber - Juz number (1-30)
 * @returns Promise<Juz>
 */
async function getJuz(juzNumber: number): Promise<Juz>
```

##### 1.5 getAllSurahs

Retrieves list of all Surahs (metadata only).

```typescript
/**
 * Get metadata for all Surahs
 * @returns Promise<SurahInfo[]>
 */
async function getAllSurahs(): Promise<SurahInfo[]>
```

---

### 2. AudioService

Manages audio playback, reciter selection, and offline downloads.

#### Methods

##### 2.1 playVerse

Plays audio for specific verse.

```typescript
/**
 * Play verse audio
 * @param surahNumber - Surah number
 * @param verseNumber - Verse number
 * @param reciterId - Reciter identifier
 * @returns Promise<void>
 */
async function playVerse(
  surahNumber: number,
  verseNumber: number,
  reciterId: string
): Promise<void>
```

##### 2.2 playSurah

Plays complete Surah audio.

```typescript
/**
 * Play complete Surah
 * @param surahNumber - Surah number
 * @param reciterId - Reciter identifier
 * @param startVerse - Optional starting verse
 * @returns Promise<void>
 */
async function playSurah(
  surahNumber: number,
  reciterId: string,
  startVerse?: number
): Promise<void>
```

##### 2.3 downloadSurahAudio

Downloads Surah audio for offline playback.

```typescript
/**
 * Download Surah audio for offline
 * @param surahNumber - Surah number
 * @param reciterId - Reciter identifier
 * @param onProgress - Progress callback
 * @returns Promise<boolean>
 */
async function downloadSurahAudio(
  surahNumber: number,
  reciterId: string,
  onProgress?: (progress: number) => void
): Promise<boolean>
```

##### 2.4 setPlaybackSpeed

Adjusts audio playback speed.

```typescript
/**
 * Set playback speed
 * @param speed - Playback speed (0.5 - 2.0)
 * @returns void
 */
function setPlaybackSpeed(speed: number): void
```

##### 2.5 setRepeatMode

Configures audio repeat mode.

```typescript
/**
 * Set repeat mode
 * @param mode - 'none' | 'verse' | 'surah' | 'range'
 * @param count - Number of repetitions (for verse/range)
 * @returns void
 */
function setRepeatMode(
  mode: RepeatMode,
  count?: number
): void
```

---

### 3. TranslationService

Manages translation retrieval and caching.

#### Methods

##### 3.1 getAvailableTranslations

Lists available translations.

```typescript
/**
 * Get available translations
 * @param language - Optional language filter
 * @returns Promise<Translation[]>
 */
async function getAvailableTranslations(
  language?: string
): Promise<Translation[]>
```

##### 3.2 getTranslation

Retrieves translation for specific verses.

```typescript
/**
 * Get translation for verse(s)
 * @param translationId - Translation ID
 * @param surahNumber - Surah number
 * @param verseNumber - Optional specific verse
 * @returns Promise<TranslationData>
 */
async function getTranslation(
  translationId: number,
  surahNumber: number,
  verseNumber?: number
): Promise<TranslationData>
```

---

### 4. MemorizationService

Tracks memorization progress and schedules reviews.

#### Methods

##### 4.1 markVerseMastered

Marks verse as memorized.

```typescript
/**
 * Mark verse as mastered
 * @param surahNumber - Surah number
 * @param verseNumber - Verse number
 * @returns Promise<void>
 */
async function markVerseMastered(
  surahNumber: number,
  verseNumber: number
): Promise<void>
```

##### 4.2 getProgress

Retrieves memorization progress.

```typescript
/**
 * Get memorization progress
 * @param surahNumber - Optional Surah filter
 * @returns Promise<MemorizationProgress>
 */
async function getProgress(
  surahNumber?: number
): Promise<MemorizationProgress>
```

##### 4.3 scheduleReview

Schedules verse for spaced repetition review.

```typescript
/**
 * Schedule verse review
 * @param surahNumber - Surah number
 * @param verseNumber - Verse number
 * @param difficulty - User difficulty rating (0-3)
 * @returns Promise<Date> - Next review date
 */
async function scheduleReview(
  surahNumber: number,
  verseNumber: number,
  difficulty: number
): Promise<Date>
```

---

### 5. CacheService

Manages IndexedDB caching for offline functionality.

#### Methods

##### 5.1 cacheQuranText

Caches Quran text for offline use.

```typescript
/**
 * Cache Quran text
 * @param surahNumber - Surah number (or 'all')
 * @returns Promise<boolean>
 */
async function cacheQuranText(
  surahNumber: number | 'all'
): Promise<boolean>
```

##### 5.2 getCacheSize

Returns total cache size.

```typescript
/**
 * Get cache size
 * @returns Promise<CacheSize>
 */
async function getCacheSize(): Promise<{
  text: number;
  audio: number;
  translations: number;
  total: number;
}>
```

##### 5.3 clearCache

Clears specific or all cached data.

```typescript
/**
 * Clear cache
 * @param type - Cache type or 'all'
 * @returns Promise<void>
 */
async function clearCache(
  type: 'text' | 'audio' | 'translations' | 'all'
): Promise<void>
```

---

## Data Models & Interfaces

### TypeScript Interfaces

#### Core Quran Models

```typescript
/**
 * Verse (Ayah) interface
 */
interface Verse {
  id: number;
  surah: number;
  verse: number;
  text: string;
  textUthmani: string;
  textImlaei?: string;
  page: number;
  juz: number;
  hizb: number;
  manzil: number;
  rub: number;
  hizbQuarter: number;
  sajda?: boolean;
  translations?: VerseTranslation[];
}

/**
 * Surah (Chapter) interface
 */
interface Surah {
  id: number;
  name: string;
  nameArabic: string;
  nameEnglish: string;
  transliteration: string;
  translation: string;
  totalVerses: number;
  revelationPlace: 'Meccan' | 'Medinan';
  revelationOrder: number;
  verses: Verse[];
}

/**
 * Surah metadata (lightweight)
 */
interface SurahInfo {
  id: number;
  name: string;
  nameArabic: string;
  nameEnglish: string;
  transliteration: string;
  translation: string;
  totalVerses: number;
  revelationPlace: 'Meccan' | 'Medinan';
  revelationOrder: number;
  pages: [number, number]; // [startPage, endPage]
}

/**
 * Page interface
 */
interface Page {
  number: number;
  verses: Verse[];
  surahStart?: SurahInfo;
  juz: number;
}

/**
 * Juz interface
 */
interface Juz {
  number: number;
  verses: Verse[];
  surahs: SurahInfo[];
}
```

#### Translation Models

```typescript
/**
 * Translation resource
 */
interface Translation {
  id: number;
  name: string;
  authorName: string;
  slug: string;
  languageName: string;
  languageCode: string;
  translatedName: {
    name: string;
    languageName: string;
  };
}

/**
 * Verse translation
 */
interface VerseTranslation {
  id: number;
  resourceId: number;
  text: string;
  verseKey: string;
}

/**
 * Translation data response
 */
interface TranslationData {
  translations: VerseTranslation[];
  meta: {
    translationId: number;
    translationName: string;
    surah: number;
  };
}
```

#### Audio Models

```typescript
/**
 * Reciter interface
 */
interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  style: string;
  audioQuality: number; // bitrate in kbps
  languageCode: string;
}

/**
 * Audio segment
 */
interface AudioSegment {
  reciterId: string;
  surah: number;
  verse: number;
  url: string;
  duration: number;
  cached: boolean;
  fileSize: number;
}

/**
 * Audio playback state
 */
interface AudioState {
  isPlaying: boolean;
  currentVerse: {
    surah: number;
    verse: number;
  } | null;
  currentReciter: string;
  playbackSpeed: number;
  volume: number;
  repeatMode: RepeatMode;
  repeatCount: number;
}

/**
 * Repeat mode
 */
type RepeatMode = 'none' | 'verse' | 'surah' | 'range' | 'all';
```

#### Memorization Models

```typescript
/**
 * Verse memorization status
 */
interface VerseMemorization {
  surah: number;
  verse: number;
  status: 'new' | 'learning' | 'mastered';
  repetitions: number;
  lastReviewed: Date;
  nextReview: Date;
  streak: number;
  difficulty: number; // 0-3 (easy to hard)
}

/**
 * Memorization progress
 */
interface MemorizationProgress {
  userId: string;
  verses: {
    [verseKey: string]: VerseMemorization;
  };
  statistics: {
    totalVerses: number;
    masteredVerses: number;
    learningVerses: number;
    percentComplete: number;
  };
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
}

/**
 * Review schedule
 */
interface ReviewSchedule {
  verseKey: string;
  surah: number;
  verse: number;
  nextReview: Date;
  priority: 'high' | 'medium' | 'low';
  interval: number; // days until next review
}
```

#### Settings Models

```typescript
/**
 * User settings
 */
interface UserSettings {
  display: DisplaySettings;
  audio: AudioSettings;
  memorization: MemorizationSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

/**
 * Display settings
 */
interface DisplaySettings {
  theme: 'light' | 'dark' | 'sepia' | 'auto';
  fontSize: number; // 16-32px
  fontFamily: 'amiri' | 'kfgqpc' | 'traditional';
  tajweedColoring: boolean;
  layout: 'mushaf' | 'list';
  translationPosition: 'below' | 'beside';
}

/**
 * Audio settings
 */
interface AudioSettings {
  defaultReciter: string;
  playbackSpeed: number; // 0.5-2.0
  autoPlayNext: boolean;
  repeatMode: RepeatMode;
  backgroundPlayback: boolean;
}

/**
 * Memorization settings
 */
interface MemorizationSettings {
  dailyGoal: number;
  reminderTime: string; // ISO time
  repetitionDefault: number;
  reviewIntervals: number[]; // days
  autoAdvanceDelay: number; // seconds
}

/**
 * Notification settings
 */
interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  memorizationReview: boolean;
  appUpdates: boolean;
}

/**
 * Privacy settings
 */
interface PrivacySettings {
  analytics: boolean;
  crashReports: boolean;
  usageData: boolean;
}
```

#### Search Models

```typescript
/**
 * Search query
 */
interface SearchQuery {
  query: string;
  type: 'arabic' | 'translation' | 'root';
  filters?: SearchFilters;
}

/**
 * Search filters
 */
interface SearchFilters {
  surahs?: number[];
  juzs?: number[];
  pageRange?: [number, number];
  revelationType?: 'Meccan' | 'Medinan';
}

/**
 * Search result
 */
interface SearchResult {
  verse: Verse;
  matchType: 'exact' | 'partial' | 'fuzzy';
  relevanceScore: number;
  highlightedText: string;
}

/**
 * Search response
 */
interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  page: number;
  perPage: number;
  query: SearchQuery;
}
```

#### Cache Models

```typescript
/**
 * Cache entry
 */
interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  expiresAt: Date;
  size: number;
}

/**
 * Cache size breakdown
 */
interface CacheSize {
  text: number; // bytes
  audio: number;
  translations: number;
  tafsir: number;
  total: number;
}

/**
 * Download progress
 */
interface DownloadProgress {
  resourceId: string;
  type: 'audio' | 'translation' | 'tafsir';
  progress: number; // 0-100
  bytesDownloaded: number;
  totalBytes: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}
```

---

## Error Handling

### Error Types

```typescript
/**
 * Base API error
 */
class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Network error
 */
class NetworkError extends ApiError {
  constructor(message: string = 'Network request failed') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Rate limit error
 */
class RateLimitError extends ApiError {
  retryAfter: number; // seconds

  constructor(retryAfter: number = 60) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Cache error
 */
class CacheError extends Error {
  operation: string;

  constructor(message: string, operation: string) {
    super(message);
    this.name = 'CacheError';
    this.operation = operation;
  }
}

/**
 * Audio playback error
 */
class AudioError extends Error {
  audioUrl?: string;

  constructor(message: string, audioUrl?: string) {
    super(message);
    this.name = 'AudioError';
    this.audioUrl = audioUrl;
  }
}
```

### Error Handling Patterns

#### Service Layer Error Handling

```typescript
// services/quranService.ts
import { ApiError, NetworkError } from '@/types/errors';

export class QuranService {
  async getSurah(surahNumber: number): Promise<Surah> {
    try {
      // Try cache first
      const cached = await cacheService.get(`surah-${surahNumber}`);
      if (cached) return cached;

      // Fetch from API
      const response = await axios.get(`/quran/uthmani`, {
        params: { type: 'json', quran: surahNumber }
      });

      const surah = this.transformApiResponse(response.data);

      // Cache for offline
      await cacheService.set(`surah-${surahNumber}`, surah);

      return surah;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // API error
          throw new ApiError(
            error.response.data.message || 'Failed to fetch Surah',
            error.response.status,
            'API_ERROR',
            error.response.data
          );
        } else if (error.request) {
          // Network error
          throw new NetworkError('Unable to reach Quran API');
        }
      }

      // Unknown error
      throw new ApiError('Unexpected error occurred', 500, 'UNKNOWN_ERROR');
    }
  }
}
```

#### Component Error Handling

```typescript
// components/QuranReader.tsx
import { useQuran } from '@/hooks/useQuran';
import { ApiError, NetworkError } from '@/types/errors';

export function QuranReader() {
  const [error, setError] = useState<Error | null>(null);

  const loadSurah = async (surahNumber: number) => {
    try {
      setError(null);
      const surah = await quranService.getSurah(surahNumber);
      // Handle success
    } catch (err) {
      if (err instanceof NetworkError) {
        setError(err);
        toast.error('No internet connection. Using cached data.');
        // Attempt to load from cache
      } else if (err instanceof RateLimitError) {
        setError(err);
        toast.error(`Too many requests. Please wait ${err.retryAfter} seconds.`);
      } else if (err instanceof ApiError) {
        setError(err);
        toast.error(err.message);
      } else {
        setError(err as Error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div>
      {error && (
        <ErrorMessage error={error} onRetry={() => loadSurah(currentSurah)} />
      )}
      {/* ... */}
    </div>
  );
}
```

### Error Response Formats

#### Tanzil API Errors

```json
{
  "code": 400,
  "status": "Bad Request",
  "data": "Invalid surah number"
}
```

#### Quran.com API Errors

```json
{
  "error": "Not Found",
  "status": 404,
  "message": "Translation not found"
}
```

#### Internal Service Errors

```json
{
  "error": true,
  "code": "CACHE_ERROR",
  "message": "Failed to store data in cache",
  "details": {
    "operation": "set",
    "key": "surah-1"
  }
}
```

---

## Rate Limiting

### External APIs Rate Limits

| API | Rate Limit | Window | Strategy |
|-----|------------|--------|----------|
| Tanzil.net | ~100 req/min | 1 minute | Exponential backoff |
| Quranicaudio.com | Bandwidth-limited | N/A | Queue downloads |
| Quran.com | 100 req | 15 minutes | Token bucket |

### Rate Limiting Implementation

#### Token Bucket Algorithm

```typescript
// utils/rateLimiter.ts

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    // Wait until token available
    const waitTime = (1 - this.tokens) / this.refillRate * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));

    this.tokens = 0;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// Usage
const quranApiLimiter = new RateLimiter(100, 100 / 60); // 100 req/min

export async function fetchWithRateLimit(url: string, options?: any) {
  await quranApiLimiter.acquire();
  return axios.get(url, options);
}
```

#### Request Queue with Retry

```typescript
// utils/requestQueue.ts

interface QueuedRequest {
  url: string;
  options?: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retries: number;
}

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  enqueue(url: string, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        url,
        options,
        resolve,
        reject,
        retries: 0
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const request = this.queue.shift()!;

    try {
      await quranApiLimiter.acquire();
      const response = await axios.get(request.url, request.options);
      request.resolve(response.data);
    } catch (error) {
      if (request.retries < this.maxRetries) {
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, request.retries);
        request.retries++;

        await new Promise(resolve => setTimeout(resolve, delay));
        this.queue.unshift(request); // Retry at front of queue
      } else {
        request.reject(error);
      }
    }

    // Process next request
    setTimeout(() => this.process(), 100);
  }
}

export const requestQueue = new RequestQueue();
```

---

## Caching Strategy

### IndexedDB Schema

```typescript
// db/schema.ts

export const DB_NAME = 'QuranAppDB';
export const DB_VERSION = 1;

export const STORES = {
  QURAN_TEXT: 'quran-text',
  AUDIO: 'audio',
  TRANSLATIONS: 'translations',
  TAFSIR: 'tafsir',
  SETTINGS: 'settings',
  MEMORIZATION: 'memorization',
  CACHE_META: 'cache-meta'
};

export function createDatabase(): IDBDatabase {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;

    // Quran text store
    if (!db.objectStoreNames.contains(STORES.QURAN_TEXT)) {
      const textStore = db.createObjectStore(STORES.QURAN_TEXT, { keyPath: 'id' });
      textStore.createIndex('surah', 'surah', { unique: false });
      textStore.createIndex('page', 'page', { unique: false });
      textStore.createIndex('juz', 'juz', { unique: false });
    }

    // Audio store
    if (!db.objectStoreNames.contains(STORES.AUDIO)) {
      const audioStore = db.createObjectStore(STORES.AUDIO, { keyPath: 'id' });
      audioStore.createIndex('reciter', 'reciterId', { unique: false });
      audioStore.createIndex('surah', 'surah', { unique: false });
    }

    // Translations store
    if (!db.objectStoreNames.contains(STORES.TRANSLATIONS)) {
      const translationStore = db.createObjectStore(STORES.TRANSLATIONS, { keyPath: 'id' });
      translationStore.createIndex('resourceId', 'resourceId', { unique: false });
      translationStore.createIndex('verseKey', 'verseKey', { unique: false });
    }

    // Settings store
    if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
      db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
    }

    // Memorization store
    if (!db.objectStoreNames.contains(STORES.MEMORIZATION)) {
      const memStore = db.createObjectStore(STORES.MEMORIZATION, { keyPath: 'verseKey' });
      memStore.createIndex('status', 'status', { unique: false });
      memStore.createIndex('nextReview', 'nextReview', { unique: false });
    }

    // Cache metadata
    if (!db.objectStoreNames.contains(STORES.CACHE_META)) {
      db.createObjectStore(STORES.CACHE_META, { keyPath: 'key' });
    }
  };

  return request.result;
}
```

### Caching Patterns

#### Cache-First Strategy

```typescript
// services/cacheService.ts

export class CacheService {
  private db: IDBDatabase;

  /**
   * Cache-first fetch
   * 1. Check cache
   * 2. Return cached if fresh
   * 3. Fetch from network in background
   * 4. Update cache
   */
  async cacheFirst<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 86400000 // 24 hours
  ): Promise<T> {
    // Check cache
    const cached = await this.get<T>(key);

    if (cached) {
      const meta = await this.getMeta(key);
      const age = Date.now() - meta.timestamp;

      if (age < ttl) {
        // Cache is fresh
        return cached;
      }
    }

    // Fetch from network
    try {
      const data = await fetchFn();
      await this.set(key, data);
      return data;
    } catch (error) {
      // Network failed, return stale cache if available
      if (cached) {
        console.warn('Using stale cache due to network error');
        return cached;
      }
      throw error;
    }
  }

  /**
   * Network-first fetch
   * 1. Try network
   * 2. Cache result
   * 3. Fallback to cache on network error
   */
  async networkFirst<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    try {
      const data = await fetchFn();
      await this.set(key, data);
      return data;
    } catch (error) {
      // Fallback to cache
      const cached = await this.get<T>(key);
      if (cached) {
        console.warn('Using cache due to network error');
        return cached;
      }
      throw error;
    }
  }

  /**
   * Stale-while-revalidate
   * 1. Return cache immediately
   * 2. Fetch from network in background
   * 3. Update cache for next request
   */
  async staleWhileRevalidate<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);

    // Fetch in background
    fetchFn()
      .then(data => this.set(key, data))
      .catch(error => console.error('Background fetch failed', error));

    // Return cached immediately
    if (cached) {
      return cached;
    }

    // No cache, wait for network
    return fetchFn();
  }
}
```

#### Service Worker Caching

```typescript
// sw.js (Service Worker)

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Cache Quran text API (Cache First)
registerRoute(
  ({ url }) => url.origin === 'https://api.tanzil.net',
  new CacheFirst({
    cacheName: 'quran-text',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        maxEntries: 200,
      }),
    ],
  })
);

// Cache audio files (Cache First)
registerRoute(
  ({ url }) => url.origin === 'https://cdn.quranicaudio.com',
  new CacheFirst({
    cacheName: 'quran-audio',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        maxEntries: 1000,
      }),
    ],
  })
);

// Cache Quran.com API (Stale While Revalidate)
registerRoute(
  ({ url }) => url.origin === 'https://api.quran.com',
  new StaleWhileRevalidate({
    cacheName: 'quran-api',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        maxEntries: 100,
      }),
    ],
  })
);
```

---

## Integration Examples

### Example 1: Display Surah with Translation

```typescript
// components/SurahView.tsx
import { useEffect, useState } from 'react';
import { quranService } from '@/services/quranService';
import { translationService } from '@/services/translationService';
import { Surah, VerseTranslation } from '@/types';

export function SurahView({ surahNumber }: { surahNumber: number }) {
  const [surah, setSurah] = useState<Surah | null>(null);
  const [translations, setTranslations] = useState<VerseTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSurah();
  }, [surahNumber]);

  const loadSurah = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load Surah text
      const surahData = await quranService.getSurah(surahNumber);
      setSurah(surahData);

      // Load translation
      const translationData = await translationService.getTranslation(
        131, // Sahih International
        surahNumber
      );
      setTranslations(translationData.translations);

    } catch (err) {
      setError(err as Error);
      console.error('Failed to load Surah', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!surah) return null;

  return (
    <div className="surah-container">
      <header>
        <h1>{surah.nameArabic}</h1>
        <h2>{surah.nameEnglish} - {surah.translation}</h2>
      </header>

      <div className="verses">
        {surah.verses.map((verse, index) => {
          const translation = translations.find(
            t => t.verseKey === `${surahNumber}:${verse.verse}`
          );

          return (
            <div key={verse.id} className="verse">
              <div className="arabic">
                {verse.textUthmani}
                <span className="verse-number">{verse.verse}</span>
              </div>
              {translation && (
                <div className="translation">
                  {translation.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Example 2: Audio Player with Synchronization

```typescript
// components/AudioPlayer.tsx
import { useEffect, useState, useRef } from 'react';
import { audioService } from '@/services/audioService';
import { useAudioStore } from '@/stores/audioStore';

export function AudioPlayer() {
  const {
    isPlaying,
    currentVerse,
    currentReciter,
    playbackSpeed,
    volume,
    repeatMode,
    setIsPlaying,
    setCurrentVerse,
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = volume;
    }
  }, [playbackSpeed, volume]);

  const handlePlay = async () => {
    if (!currentVerse) return;

    try {
      await audioService.playVerse(
        currentVerse.surah,
        currentVerse.verse,
        currentReciter
      );
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback failed', error);
    }
  };

  const handlePause = () => {
    audioService.pause();
    setIsPlaying(false);
  };

  const handleEnded = async () => {
    if (!currentVerse) return;

    // Handle repeat mode
    if (repeatMode === 'verse') {
      await handlePlay();
    } else {
      // Play next verse
      const nextVerse = await quranService.getNextVerse(
        currentVerse.surah,
        currentVerse.verse
      );

      if (nextVerse) {
        setCurrentVerse({
          surah: nextVerse.surah,
          verse: nextVerse.verse
        });
      }
    }
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="controls">
        <button onClick={isPlaying ? handlePause : handlePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="verse-info">
          {currentVerse && (
            <span>{currentVerse.surah}:{currentVerse.verse}</span>
          )}
        </div>

        <select
          value={playbackSpeed}
          onChange={(e) => audioService.setPlaybackSpeed(Number(e.target.value))}
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1.0}>1.0x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2.0}>2.0x</option>
        </select>
      </div>
    </div>
  );
}
```

### Example 3: Memorization Tracker

```typescript
// components/MemorizationTracker.tsx
import { useEffect, useState } from 'react';
import { memorizationService } from '@/services/memorizationService';
import { MemorizationProgress } from '@/types';

export function MemorizationTracker({ surahNumber }: { surahNumber?: number }) {
  const [progress, setProgress] = useState<MemorizationProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [surahNumber]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await memorizationService.getProgress(surahNumber);
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress', error);
    } finally {
      setLoading(false);
    }
  };

  const markVerseMastered = async (surah: number, verse: number) => {
    try {
      await memorizationService.markVerseMastered(surah, verse);
      await loadProgress(); // Refresh
    } catch (error) {
      console.error('Failed to mark verse', error);
    }
  };

  if (loading) return <div>Loading progress...</div>;
  if (!progress) return null;

  return (
    <div className="memorization-tracker">
      <div className="statistics">
        <div className="stat">
          <h3>Total Verses</h3>
          <p>{progress.statistics.totalVerses}</p>
        </div>
        <div className="stat">
          <h3>Mastered</h3>
          <p>{progress.statistics.masteredVerses}</p>
        </div>
        <div className="stat">
          <h3>Progress</h3>
          <p>{progress.statistics.percentComplete.toFixed(1)}%</p>
        </div>
        <div className="stat">
          <h3>Streak</h3>
          <p>{progress.currentStreak} days</p>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.statistics.percentComplete}%` }}
        />
      </div>

      <div className="verses">
        {Object.entries(progress.verses).map(([verseKey, verse]) => (
          <div key={verseKey} className={`verse-status ${verse.status}`}>
            <span>{verseKey}</span>
            <span className="status-badge">{verse.status}</span>
            <button
              onClick={() => markVerseMastered(verse.surah, verse.verse)}
              disabled={verse.status === 'mastered'}
            >
              Mark Mastered
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 4: Offline Download Manager

```typescript
// components/DownloadManager.tsx
import { useState, useEffect } from 'react';
import { audioService } from '@/services/audioService';
import { cacheService } from '@/services/cacheService';

export function DownloadManager() {
  const [downloads, setDownloads] = useState<Map<string, number>>(new Map());
  const [cacheSize, setCacheSize] = useState<CacheSize | null>(null);

  useEffect(() => {
    loadCacheSize();
  }, []);

  const loadCacheSize = async () => {
    const size = await cacheService.getCacheSize();
    setCacheSize(size);
  };

  const downloadSurah = async (surahNumber: number, reciterId: string) => {
    const key = `${reciterId}-${surahNumber}`;

    try {
      await audioService.downloadSurahAudio(
        surahNumber,
        reciterId,
        (progress) => {
          setDownloads(prev => new Map(prev).set(key, progress));
        }
      );

      // Remove from downloads on completion
      setDownloads(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });

      // Refresh cache size
      await loadCacheSize();
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  const clearCache = async (type: 'audio' | 'text' | 'translations' | 'all') => {
    try {
      await cacheService.clearCache(type);
      await loadCacheSize();
    } catch (error) {
      console.error('Failed to clear cache', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="download-manager">
      <h2>Offline Storage</h2>

      {cacheSize && (
        <div className="cache-size">
          <div className="size-breakdown">
            <div>Text: {formatBytes(cacheSize.text)}</div>
            <div>Audio: {formatBytes(cacheSize.audio)}</div>
            <div>Translations: {formatBytes(cacheSize.translations)}</div>
            <div><strong>Total: {formatBytes(cacheSize.total)}</strong></div>
          </div>

          <div className="actions">
            <button onClick={() => clearCache('audio')}>Clear Audio</button>
            <button onClick={() => clearCache('translations')}>Clear Translations</button>
            <button onClick={() => clearCache('all')} className="danger">Clear All</button>
          </div>
        </div>
      )}

      <div className="downloads">
        <h3>Downloads</h3>
        {Array.from(downloads.entries()).map(([key, progress]) => (
          <div key={key} className="download-item">
            <span>{key}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{progress.toFixed(0)}%</span>
          </div>
        ))}
        {downloads.size === 0 && (
          <p>No active downloads</p>
        )}
      </div>

      <div className="download-surahs">
        <h3>Download Surahs</h3>
        <select
          onChange={(e) => {
            const surahNumber = Number(e.target.value);
            if (surahNumber > 0) {
              downloadSurah(surahNumber, 'mishary');
            }
          }}
        >
          <option value="">Select Surah</option>
          {Array.from({ length: 114 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Surah {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

---

## Developer Onboarding

### Quick Start Guide

#### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/yourorg/quranapp.git
cd quranapp

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start development server
npm run dev
```

#### 2. Project Structure

```
quranapp/
├── src/
│   ├── components/       # React components
│   │   ├── Quran/       # Quran-specific
│   │   ├── Audio/       # Audio player
│   │   ├── Navigation/  # Navigation
│   │   └── Common/      # Shared components
│   ├── services/        # API services
│   │   ├── quranService.ts
│   │   ├── audioService.ts
│   │   └── ...
│   ├── stores/          # Zustand state stores
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── db/              # IndexedDB schema
│   └── styles/          # Global styles
├── public/
│   ├── sw.js           # Service worker
│   └── manifest.json   # PWA manifest
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # Playwright E2E
└── docs/               # Documentation
```

#### 3. Development Workflow

```bash
# Run development server
npm run dev

# Run tests
npm run test           # Unit tests
npm run test:e2e      # E2E tests

# Linting and formatting
npm run lint
npm run format

# Type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

#### 4. Key Concepts

**Services**: All external API interactions go through service layer.

```typescript
import { quranService } from '@/services/quranService';

const surah = await quranService.getSurah(1);
```

**Stores**: State management using Zustand.

```typescript
import { useQuranStore } from '@/stores/quranStore';

const { currentSurah, setCurrentSurah } = useQuranStore();
```

**Caching**: Offline-first with IndexedDB and Service Worker.

```typescript
// Automatic caching in services
const surah = await quranService.getSurah(1); // Cached automatically
```

**Error Handling**: Structured error types.

```typescript
try {
  await quranService.getSurah(1);
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network error
  }
}
```

#### 5. Testing Guidelines

**Unit Tests**:

```typescript
// tests/unit/quranService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { quranService } from '@/services/quranService';

describe('QuranService', () => {
  it('should fetch Surah successfully', async () => {
    const surah = await quranService.getSurah(1);
    expect(surah).toBeDefined();
    expect(surah.id).toBe(1);
  });
});
```

**E2E Tests**:

```typescript
// tests/e2e/quran-reader.spec.ts
import { test, expect } from '@playwright/test';

test('should display Surah Al-Fatiha', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Al-Fatiha');

  await expect(page.locator('.surah-title')).toContainText('Al-Fatiha');
});
```

#### 6. API Usage Patterns

**Always use services**:

```typescript
// ✅ Correct
import { quranService } from '@/services/quranService';
const surah = await quranService.getSurah(1);

// ❌ Wrong - Don't call APIs directly
const response = await fetch('https://api.tanzil.net/...');
```

**Handle errors gracefully**:

```typescript
try {
  const surah = await quranService.getSurah(1);
} catch (error) {
  if (error instanceof NetworkError) {
    // Show offline message
  } else {
    // Show generic error
  }
}
```

**Use stores for global state**:

```typescript
import { useQuranStore } from '@/stores/quranStore';

function Component() {
  const { currentSurah, setCurrentSurah } = useQuranStore();

  // Use state...
}
```

---

## Additional Resources

### External Documentation

- **Tanzil.net API**: http://tanzil.net/docs/
- **Quranicaudio.com**: http://quranicaudio.com/
- **Quran.com API**: https://quran.api-docs.io/
- **IndexedDB**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Workbox**: https://developers.google.com/web/tools/workbox

### Internal Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Component Documentation](./COMPONENTS.md)
- [Testing Guide](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Support

- **GitHub Issues**: https://github.com/yourorg/quranapp/issues
- **Discussions**: https://github.com/yourorg/quranapp/discussions
- **Email**: dev@quranapp.com

---

## Changelog

### Version 1.0.0 (November 2025)

- Initial API documentation
- External API integrations documented
- Internal service APIs defined
- TypeScript interfaces and types
- Error handling patterns
- Rate limiting implementation
- Caching strategies
- Integration examples
- Developer onboarding guide

---

**Document Status**: ✅ Active Development
**Last Updated**: November 2025
**Next Review**: Post-MVP Launch
