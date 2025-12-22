/**
 * Quran.com API Service
 * https://api.quran.com/api/v4
 *
 * Used for Mushaf page images and additional resources
 */

import { getCachedData, setCachedData } from '@/utils/storage'

const BASE_URL = 'https://api.quran.com/api/v4'

// Cache TTL values
const CACHE_TTL = {
  MUSHAFS: 7 * 24 * 60 * 60 * 1000, // 7 days
  VERSES: 30 * 24 * 60 * 60 * 1000, // 30 days
  RESOURCES: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// Mushaf types
export interface MushafInfo {
  id: number
  name: string
  lines_per_page: number
  pages_count: number
  code_v1_font_file: string | null
  code_v2_font_file: string | null
  is_default: boolean
  default_font_name: string
}

export interface MushafPageLayout {
  id: number
  page_number: number
  first_word_id: number
  last_word_id: number
  first_verse_id: number
  last_verse_id: number
  verses_count: number
}

export interface QuranComVerse {
  id: number
  verse_key: string // "2:255"
  verse_number: number
  hizb_number: number
  rub_el_hizb_number: number
  ruku_number: number
  manzil_number: number
  sajdah_number: number | null
  page_number: number
  juz_number: number
  words?: QuranComWord[]
}

export interface QuranComWord {
  id: number
  position: number
  audio_url: string | null
  char_type_name: string
  code_v1: string
  page_number: number
  line_number: number
  text: string // From API only
  translation?: { text: string; language_name: string }
  transliteration?: { text: string; language_name: string }
}

export interface PageVerseResponse {
  verses: QuranComVerse[]
  pagination: {
    per_page: number
    current_page: number
    total_pages: number
    total_records: number
  }
}

/**
 * Generic fetch wrapper for Quran.com API
 */
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Quran.com API request failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch with caching support
 */
async function fetchWithCache<T>(
  cacheKey: string,
  endpoint: string,
  ttl: number
): Promise<T> {
  const cached = await getCachedData<T>(cacheKey)
  if (cached) return cached

  const data = await fetchFromAPI<T>(endpoint)
  await setCachedData(cacheKey, data, ttl)

  return data
}

// ============ Mushaf Resources ============

/**
 * Get available Mushaf layouts
 */
export async function getMushafs(): Promise<{ mushafs: MushafInfo[] }> {
  return fetchWithCache('mushafs', '/resources/mushafs', CACHE_TTL.MUSHAFS)
}

// ============ Verse Endpoints ============

/**
 * Get verses by page number
 * @param pageNumber - Page number (1-604)
 * @param options - Additional options like words, translations
 */
export async function getVersesByPage(
  pageNumber: number,
  options: {
    words?: boolean
    translations?: number[]
    word_fields?: string[]
  } = {}
): Promise<PageVerseResponse> {
  const params = new URLSearchParams()

  if (options.words) {
    params.set('words', 'true')
  }

  if (options.translations?.length) {
    params.set('translations', options.translations.join(','))
  }

  if (options.word_fields?.length) {
    params.set('word_fields', options.word_fields.join(','))
  }

  const endpoint = `/verses/by_page/${pageNumber}?${params.toString()}`
  return fetchWithCache(`page-verses-${pageNumber}`, endpoint, CACHE_TTL.VERSES)
}

/**
 * Get verses by Juz number
 * @param juzNumber - Juz number (1-30)
 */
export async function getVersesByJuz(
  juzNumber: number,
  options: { words?: boolean } = {}
): Promise<PageVerseResponse> {
  const params = new URLSearchParams()
  if (options.words) {
    params.set('words', 'true')
  }

  const endpoint = `/verses/by_juz/${juzNumber}?${params.toString()}`
  return fetchWithCache(`juz-verses-${juzNumber}`, endpoint, CACHE_TTL.VERSES)
}

/**
 * Get verses by chapter (Surah)
 * @param chapterNumber - Surah number (1-114)
 */
export async function getVersesByChapter(
  chapterNumber: number,
  options: { words?: boolean; page?: number; per_page?: number } = {}
): Promise<PageVerseResponse> {
  const params = new URLSearchParams()

  if (options.words) {
    params.set('words', 'true')
  }
  if (options.page) {
    params.set('page', options.page.toString())
  }
  if (options.per_page) {
    params.set('per_page', options.per_page.toString())
  }

  const endpoint = `/verses/by_chapter/${chapterNumber}?${params.toString()}`
  return fetchWithCache(
    `chapter-verses-${chapterNumber}-${options.page || 1}`,
    endpoint,
    CACHE_TTL.VERSES
  )
}

// ============ Mushaf Page Images ============

// Mushaf image base URLs (from Quran.com CDN)
const MUSHAF_IMAGE_BASES = {
  // Madani Mushaf (standard 15-line)
  madani: 'https://static.qurancdn.com/images/w/rq-color',
  // Indopak Mushaf
  indopak: 'https://static.qurancdn.com/images/w/indo-pak',
  // Tajweed colored Mushaf
  tajweed: 'https://static.qurancdn.com/images/pages/tajweed',
}

export type MushafStyle = keyof typeof MUSHAF_IMAGE_BASES

/**
 * Get Mushaf page image URL
 * @param pageNumber - Page number (1-604)
 * @param style - Mushaf style (madani, indopak, tajweed)
 */
export function getMushafPageImageUrl(
  pageNumber: number,
  style: MushafStyle = 'madani'
): string {
  // Pad page number to 3 digits (001-604)
  const paddedPage = pageNumber.toString().padStart(3, '0')

  const base = MUSHAF_IMAGE_BASES[style]

  // Different URL patterns for different styles
  switch (style) {
    case 'tajweed':
      return `${base}/page${paddedPage}.png`
    default:
      // For word-based images, we'll need to construct from glyphs
      // For now, return a page-based URL pattern
      return `https://static.qurancdn.com/images/pages/${paddedPage}.png`
  }
}

/**
 * Get all page image URLs for a Juz
 * @param juzNumber - Juz number (1-30)
 * @param style - Mushaf style
 */
export function getJuzPageImageUrls(
  juzNumber: number,
  style: MushafStyle = 'madani'
): string[] {
  // Approximate page ranges for each Juz (Madani Mushaf)
  // Each Juz is approximately 20 pages
  const startPage = (juzNumber - 1) * 20 + 1
  const endPage = Math.min(juzNumber * 20, 604)

  const urls: string[] = []
  for (let page = startPage; page <= endPage; page++) {
    urls.push(getMushafPageImageUrl(page, style))
  }

  return urls
}

// ============ Chapters (Surahs) ============

export interface ChapterInfo {
  id: number
  revelation_place: 'makkah' | 'madinah'
  revelation_order: number
  bismillah_pre: boolean
  name_simple: string
  name_complex: string
  name_arabic: string
  verses_count: number
  pages: number[]
  translated_name: {
    language_name: string
    name: string
  }
}

/**
 * Get all chapters (Surahs)
 */
export async function getChapters(): Promise<{ chapters: ChapterInfo[] }> {
  return fetchWithCache('chapters', '/chapters', CACHE_TTL.RESOURCES)
}

/**
 * Get specific chapter info
 * @param chapterNumber - Surah number (1-114)
 */
export async function getChapter(chapterNumber: number): Promise<{ chapter: ChapterInfo }> {
  return fetchWithCache(`chapter-${chapterNumber}`, `/chapters/${chapterNumber}`, CACHE_TTL.RESOURCES)
}

// ============ Juz Info ============

export interface JuzInfo {
  id: number
  juz_number: number
  verse_mapping: Record<string, string> // e.g., { "1": "1-7", "2": "1-141" }
  first_verse_id: number
  last_verse_id: number
  verses_count: number
}

/**
 * Get all Juz info
 */
export async function getAllJuz(): Promise<{ juzs: JuzInfo[] }> {
  return fetchWithCache('juzs', '/juzs', CACHE_TTL.RESOURCES)
}

// ============ Audio Reciters ============

export interface ReciterInfo {
  id: number
  reciter_name: string
  style: string | null
  translated_name: {
    name: string
    language_name: string
  }
}

/**
 * Get all reciters
 */
export async function getReciters(): Promise<{ reciters: ReciterInfo[] }> {
  return fetchWithCache('reciters', '/resources/recitations', CACHE_TTL.RESOURCES)
}

// ============ Translations ============

export interface TranslationInfo {
  id: number
  name: string
  author_name: string
  slug: string
  language_name: string
  translated_name: {
    name: string
    language_name: string
  }
}

/**
 * Get available translations
 */
export async function getTranslations(): Promise<{ translations: TranslationInfo[] }> {
  return fetchWithCache('translations', '/resources/translations', CACHE_TTL.RESOURCES)
}
