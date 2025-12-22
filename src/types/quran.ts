/**
 * Quran data types
 * IMPORTANT: These types store REFERENCES only, never actual Quranic text
 * All text must be fetched from trusted APIs
 */

// API response types for AlQuran Cloud
export interface AlQuranCloudResponse<T> {
  code: number
  status: string
  data: T
}

// Surah metadata (fetched from API)
export interface Surah {
  number: number
  name: string // Arabic name from API
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

// Ayah data (fetched from API)
export interface Ayah {
  number: number
  text: string // Fetched from API only
  numberInSurah: number
  juz: number
  manzil: number
  page: number
  ruku: number
  hizbQuarter: number
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean }
  surah?: Surah
  audio?: string
  audioSecondary?: string[]
}

// Juz metadata
export interface Juz {
  number: number // 1-30
  startSurah: number
  startAyah: number
  endSurah: number
  endAyah: number
}

// Page reference (what we store)
export interface PageReference {
  pageNumber: number // 1-604
  juz: number
  hizbQuarter: number
}

// Edition/Reciter info (fetched from API)
export interface Edition {
  identifier: string
  language: string
  name: string
  englishName: string
  format: 'text' | 'audio'
  type: string
  direction?: 'rtl' | 'ltr'
}

// Audio reciter
export interface Reciter {
  identifier: string
  name: string // Fetched from API
  englishName: string
  format: 'audio'
  type: string
  bitrate?: string
}

// Mushaf page data from Quran.com API
export interface MushafPage {
  pageNumber: number
  imageUrl: string
  verses: VerseReference[]
}

// Verse reference (what we store locally)
export interface VerseReference {
  surahNumber: number
  ayahNumber: number
  pageNumber: number
  juz: number
}

// Translation
export interface Translation {
  id: number
  resourceId: number
  text: string // Fetched from API
}

// Audio playback state
export interface AudioState {
  isPlaying: boolean
  currentAyah: VerseReference | null
  reciterId: string
  playbackSpeed: number
  repeatCount: number
  repeatCurrent: number
  loopStart: VerseReference | null
  loopEnd: VerseReference | null
}

// Quran.com API types
export interface QuranComVerse {
  id: number
  verse_key: string
  verse_number: number
  hizb_number: number
  rub_el_hizb_number: number
  ruku_number: number
  manzil_number: number
  sajdah_number: number | null
  page_number: number
  juz_number: number
}

export interface QuranComPage {
  page_number: number
  verses: QuranComVerse[]
}

// Search result
export interface SearchResult {
  verse: VerseReference
  matchText: string // From API
  surahName: string // From API
}

// Utility type for Arabic-Indic numeral conversion
export type ArabicIndicNumeral = '٠' | '١' | '٢' | '٣' | '٤' | '٥' | '٦' | '٧' | '٨' | '٩'
