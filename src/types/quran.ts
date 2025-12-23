/**
 * Quran Types
 * IMPORTANT: These types store ONLY references (numbers, IDs).
 * Actual Quranic text MUST be fetched from trusted APIs.
 */

// Surah (Chapter) metadata - fetched from API
export interface Surah {
  number: number;
  name: string; // Arabic name from API
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

// Ayah (Verse) reference - text MUST be fetched from API
export interface AyahReference {
  surahNumber: number;
  ayahNumber: number;
  juz: number;
  page: number;
  hizbQuarter: number;
}

// Ayah with text from API
export interface Ayah {
  number: number; // Global ayah number (1-6236)
  numberInSurah: number;
  surahNumber: number;
  text: string; // From API only
  page: number;
  juz: number;
  hizbQuarter: number;
}

// Page reference (1-604 pages in Madani Mushaf)
export interface PageReference {
  pageNumber: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

// Juz reference (1-30)
export interface JuzReference {
  juzNumber: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

// Complete page data from API
export interface PageData {
  pageNumber: number;
  ayahs: Ayah[];
}

// Edition/Translation info
export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: 'text' | 'audio';
  type: 'quran' | 'translation' | 'tafsir';
}

// Search result
export interface SearchResult {
  surahNumber: number;
  ayahNumber: number;
  text: string; // From API
  surahName: string; // From API
}
