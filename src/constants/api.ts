/**
 * API Constants
 * Base URLs and endpoints for Quran APIs
 */

// AlQuran Cloud API - Primary source for Quran text and audio
export const ALQURAN_CLOUD_BASE_URL = 'https://api.alquran.cloud/v1';

// Quran.com API v4 - Mushaf images and additional data
export const QURAN_COM_BASE_URL = 'https://api.quran.com/api/v4';

// MP3Quran API - Additional reciters and audio
export const MP3QURAN_BASE_URL = 'https://mp3quran.net/api/v3';

// Default edition for Uthmani script
export const DEFAULT_QURAN_EDITION = 'quran-uthmani';

// Total constants
export const TOTAL_SURAHS = 114;
export const TOTAL_PAGES = 604;
export const TOTAL_JUZ = 30;
export const TOTAL_AYAHS = 6236;

// Request timeouts
export const API_TIMEOUT = 10000; // 10 seconds
export const AUDIO_TIMEOUT = 30000; // 30 seconds for audio files

// Cache keys
export const CACHE_KEYS = {
  SURAH_LIST: 'cache_surah_list',
  RECITERS: 'cache_reciters',
  PAGE_PREFIX: 'cache_page_',
  JUZ_PREFIX: 'cache_juz_',
  SURAH_PREFIX: 'cache_surah_',
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  SURAH_LIST: 7 * 24 * 60 * 60 * 1000, // 7 days
  RECITERS: 7 * 24 * 60 * 60 * 1000, // 7 days
  PAGE_DATA: 24 * 60 * 60 * 1000, // 1 day
  JUZ_DATA: 24 * 60 * 60 * 1000, // 1 day
} as const;
