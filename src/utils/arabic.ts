/**
 * Arabic Utilities
 * Display utilities for Arabic text and numerals
 *
 * IMPORTANT: These utilities handle FORMATTING only.
 * They do NOT contain any Quranic Arabic text.
 * All Quranic text must come from trusted APIs.
 */

// Arabic-Indic numeral mapping
const ARABIC_INDIC_NUMERALS: Record<string, string> = {
  '0': '\u0660', // ٠
  '1': '\u0661', // ١
  '2': '\u0662', // ٢
  '3': '\u0663', // ٣
  '4': '\u0664', // ٤
  '5': '\u0665', // ٥
  '6': '\u0666', // ٦
  '7': '\u0667', // ٧
  '8': '\u0668', // ٨
  '9': '\u0669', // ٩
};

// Western numeral mapping (reverse)
const WESTERN_NUMERALS: Record<string, string> = Object.fromEntries(
  Object.entries(ARABIC_INDIC_NUMERALS).map(([k, v]) => [v, k])
);

/**
 * Convert Western numerals (0-9) to Arabic-Indic numerals (٠-٩)
 * @param input - Number or string containing Western numerals
 * @returns String with Arabic-Indic numerals
 */
export function toArabicIndic(input: number | string): string {
  const str = String(input);
  return str
    .split('')
    .map((char) => ARABIC_INDIC_NUMERALS[char] || char)
    .join('');
}

/**
 * Convert Arabic-Indic numerals (٠-٩) to Western numerals (0-9)
 * @param input - String containing Arabic-Indic numerals
 * @returns String with Western numerals
 */
export function toWesternNumerals(input: string): string {
  return input
    .split('')
    .map((char) => WESTERN_NUMERALS[char] || char)
    .join('');
}

/**
 * Format a Quran reference in proper Arabic format
 * Example: formatReference(2, 255, "سورة البقرة") => "سورة البقرة - الآية ٢٥٥"
 *
 * @param surahNumber - Surah number (1-114)
 * @param ayahNumber - Ayah number
 * @param surahName - Surah name from API (Arabic)
 * @returns Formatted reference string
 */
export function formatReference(
  surahNumber: number,
  ayahNumber: number,
  surahName: string
): string {
  const arabicAyah = toArabicIndic(ayahNumber);
  // UI string only - not Quranic text
  return `${surahName} - الآية ${arabicAyah}`;
}

/**
 * Format page number for display
 * @param pageNumber - Page number (1-604)
 * @returns Formatted page string with Arabic numerals
 */
export function formatPageNumber(pageNumber: number): string {
  // UI string only - not Quranic text
  return `صفحة ${toArabicIndic(pageNumber)}`;
}

/**
 * Format Juz number for display
 * @param juzNumber - Juz number (1-30)
 * @returns Formatted Juz string with Arabic numerals
 */
export function formatJuzNumber(juzNumber: number): string {
  // UI string only - not Quranic text
  return `الجزء ${toArabicIndic(juzNumber)}`;
}

/**
 * Format ayah count for display
 * @param count - Number of ayahs
 * @returns Formatted count string
 */
export function formatAyahCount(count: number): string {
  const arabicCount = toArabicIndic(count);
  // UI string only - not Quranic text
  if (count === 1) {
    return `آية واحدة`;
  } else if (count === 2) {
    return `آيتان`;
  } else if (count >= 3 && count <= 10) {
    return `${arabicCount} آيات`;
  } else {
    return `${arabicCount} آية`;
  }
}

/**
 * Format surah number with prefix
 * @param surahNumber - Surah number (1-114)
 * @returns Formatted string
 */
export function formatSurahNumber(surahNumber: number): string {
  return toArabicIndic(surahNumber);
}

/**
 * Check if text is RTL (Arabic, Hebrew, etc.)
 * @param text - Text to check
 * @returns true if text should be RTL
 */
export function isRTL(text: string): boolean {
  // Check for Arabic characters (basic Arabic + Arabic Extended)
  const rtlPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlPattern.test(text);
}

/**
 * Get text direction style
 * @param text - Text to check
 * @returns Style object with direction and text alignment
 */
export function getTextDirection(text: string): {
  direction: 'rtl' | 'ltr';
  textAlign: 'right' | 'left';
  writingDirection: 'rtl' | 'ltr';
} {
  const rtl = isRTL(text);
  return {
    direction: rtl ? 'rtl' : 'ltr',
    textAlign: rtl ? 'right' : 'left',
    writingDirection: rtl ? 'rtl' : 'ltr',
  };
}
