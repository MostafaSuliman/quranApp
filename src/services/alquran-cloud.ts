/**
 * AlQuran Cloud API Service
 * https://alquran.cloud/api
 *
 * IMPORTANT: All Quranic text is fetched from this API, never hardcoded
 * Use edition 'quran-uthmani' for Uthmani script
 */

import { getCachedData, setCachedData } from '@/utils/storage'
import type {
  AlQuranCloudResponse,
  Surah,
  Ayah,
  Edition,
  Reciter,
} from '@/types'

const BASE_URL = 'https://api.alquran.cloud/v1'

// Default text edition - Uthmani script (essential for proper memorization)
export const UTHMANI_EDITION = 'quran-uthmani'

// Cache TTL values
const CACHE_TTL = {
  SURAHS: 7 * 24 * 60 * 60 * 1000, // 7 days
  EDITIONS: 7 * 24 * 60 * 60 * 1000, // 7 days
  AYAH: 30 * 24 * 60 * 60 * 1000, // 30 days
  PAGE: 30 * 24 * 60 * 60 * 1000, // 30 days
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    // Get response text first to debug parsing issues
    const text = await response.text()

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from API')
    }

    // Try to parse JSON
    let data: AlQuranCloudResponse<T>
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON Parse Error for URL:', url)
      console.error('Response text (first 200 chars):', text.substring(0, 200))
      throw new Error(`Invalid JSON response from API: ${text.substring(0, 50)}...`)
    }

    if (data.code !== 200 || data.status !== 'OK') {
      throw new Error(`API error: ${data.status}`)
    }

    return data.data
  } catch (error) {
    // Re-throw with more context
    if (error instanceof TypeError && error.message.includes('Network')) {
      throw new Error(`Network error fetching ${endpoint}. Please check your connection.`)
    }
    throw error
  }
}

/**
 * Fetch with caching support
 */
async function fetchWithCache<T>(
  cacheKey: string,
  endpoint: string,
  ttl: number
): Promise<T> {
  // Try cache first
  const cached = await getCachedData<T>(cacheKey)
  if (cached) return cached

  // Fetch from API
  const data = await fetchFromAPI<T>(endpoint)

  // Cache the result
  await setCachedData(cacheKey, data, ttl)

  return data
}

// ============ Surah Endpoints ============

/**
 * Get all Surahs with metadata
 * Returns Arabic names, English names, ayah counts, revelation type
 */
export async function getAllSurahs(): Promise<Surah[]> {
  return fetchWithCache<Surah[]>('surahs', '/surah', CACHE_TTL.SURAHS)
}

/**
 * Get a specific Surah with all its Ayahs
 * @param surahNumber - Surah number (1-114)
 * @param edition - Edition identifier (default: quran-uthmani)
 */
export async function getSurah(
  surahNumber: number,
  edition: string = UTHMANI_EDITION
): Promise<{ number: number; name: string; englishName: string; ayahs: Ayah[] }> {
  const cacheKey = `surah-${surahNumber}-${edition}`
  return fetchWithCache(cacheKey, `/surah/${surahNumber}/${edition}`, CACHE_TTL.AYAH)
}

// ============ Ayah Endpoints ============

/**
 * Get a specific Ayah by reference
 * @param surahNumber - Surah number (1-114)
 * @param ayahNumber - Ayah number within the Surah
 * @param edition - Edition identifier
 */
export async function getAyah(
  surahNumber: number,
  ayahNumber: number,
  edition: string = UTHMANI_EDITION
): Promise<Ayah> {
  const reference = `${surahNumber}:${ayahNumber}`
  const cacheKey = `ayah-${reference}-${edition}`
  return fetchWithCache(cacheKey, `/ayah/${reference}/${edition}`, CACHE_TTL.AYAH)
}

/**
 * Get an Ayah by its global number (1-6236)
 * @param ayahNumber - Global Ayah number
 * @param edition - Edition identifier
 */
export async function getAyahByNumber(
  ayahNumber: number,
  edition: string = UTHMANI_EDITION
): Promise<Ayah> {
  const cacheKey = `ayah-global-${ayahNumber}-${edition}`
  return fetchWithCache(cacheKey, `/ayah/${ayahNumber}/${edition}`, CACHE_TTL.AYAH)
}

// ============ Page Endpoints ============

/**
 * Get all Ayahs on a specific page
 * @param pageNumber - Page number (1-604)
 * @param edition - Edition identifier
 */
export async function getPage(
  pageNumber: number,
  edition: string = UTHMANI_EDITION
): Promise<{ number: number; ayahs: Ayah[] }> {
  const cacheKey = `page-${pageNumber}-${edition}`
  return fetchWithCache(cacheKey, `/page/${pageNumber}/${edition}`, CACHE_TTL.PAGE)
}

// ============ Juz Endpoints ============

/**
 * Get all Ayahs in a specific Juz
 * @param juzNumber - Juz number (1-30)
 * @param edition - Edition identifier
 */
export async function getJuz(
  juzNumber: number,
  edition: string = UTHMANI_EDITION
): Promise<{ number: number; ayahs: Ayah[] }> {
  const cacheKey = `juz-${juzNumber}-${edition}`
  return fetchWithCache(cacheKey, `/juz/${juzNumber}/${edition}`, CACHE_TTL.AYAH)
}

// ============ Edition/Reciter Endpoints ============

/**
 * Get all available editions (text and audio)
 */
export async function getAllEditions(): Promise<Edition[]> {
  return fetchWithCache<Edition[]>('editions', '/edition', CACHE_TTL.EDITIONS)
}

/**
 * Get all audio editions (reciters)
 */
export async function getAudioEditions(): Promise<Reciter[]> {
  const editions = await fetchWithCache<Edition[]>(
    'audio-editions',
    '/edition/format/audio',
    CACHE_TTL.EDITIONS
  )

  // Filter and map to Reciter type
  return editions.map(e => ({
    identifier: e.identifier,
    name: e.name,
    englishName: e.englishName,
    format: 'audio' as const,
    type: e.type,
  }))
}

/**
 * Get all text editions (translations, etc.)
 */
export async function getTextEditions(): Promise<Edition[]> {
  return fetchWithCache<Edition[]>(
    'text-editions',
    '/edition/format/text',
    CACHE_TTL.EDITIONS
  )
}

/**
 * Get editions by language
 * @param language - Language code (e.g., 'ar', 'en', 'ur')
 */
export async function getEditionsByLanguage(language: string): Promise<Edition[]> {
  return fetchWithCache<Edition[]>(
    `editions-${language}`,
    `/edition/language/${language}`,
    CACHE_TTL.EDITIONS
  )
}

// ============ Audio URL Helpers ============

/**
 * Get audio URL for a specific Ayah
 * This constructs the URL based on the reciter's audio edition
 * @param surahNumber - Surah number
 * @param ayahNumber - Ayah number within surah
 * @param reciterId - Reciter's edition identifier
 */
export async function getAyahAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  reciterId: string
): Promise<string> {
  const ayah = await getAyah(surahNumber, ayahNumber, reciterId)
  if (!ayah.audio) {
    throw new Error('No audio available for this ayah with the selected reciter')
  }
  return ayah.audio
}

/**
 * Get all audio URLs for a Surah
 * @param surahNumber - Surah number
 * @param reciterId - Reciter's edition identifier
 */
export async function getSurahAudioUrls(
  surahNumber: number,
  reciterId: string
): Promise<{ ayahNumber: number; audioUrl: string }[]> {
  const surah = await getSurah(surahNumber, reciterId)
  return surah.ayahs
    .filter(a => a.audio)
    .map(a => ({
      ayahNumber: a.numberInSurah,
      audioUrl: a.audio!,
    }))
}

// ============ Search (if available) ============

/**
 * Search in Quran text
 * @param keyword - Search term
 * @param surahNumber - Optional: limit to specific surah
 */
export async function searchQuran(
  keyword: string,
  surahNumber?: number
): Promise<{ count: number; matches: Ayah[] }> {
  const endpoint = surahNumber
    ? `/search/${encodeURIComponent(keyword)}/${surahNumber}/${UTHMANI_EDITION}`
    : `/search/${encodeURIComponent(keyword)}/all/${UTHMANI_EDITION}`

  // Don't cache search results (they're dynamic)
  return fetchFromAPI(endpoint)
}
