/**
 * Arabic-Indic numeral utilities
 * Convert between Western and Arabic-Indic numerals
 */

const ARABIC_INDIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const
const WESTERN_NUMERALS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

/**
 * Convert a number to Arabic-Indic numerals
 * @example toArabicIndic(255) => "٢٥٥"
 */
export function toArabicIndic(num: number): string {
  return num
    .toString()
    .split('')
    .map(digit => {
      const index = WESTERN_NUMERALS.indexOf(digit as typeof WESTERN_NUMERALS[number])
      return index >= 0 ? ARABIC_INDIC_NUMERALS[index] : digit
    })
    .join('')
}

/**
 * Convert Arabic-Indic numerals to Western number
 * @example fromArabicIndic("٢٥٥") => 255
 */
export function fromArabicIndic(str: string): number {
  const western = str
    .split('')
    .map(char => {
      const index = ARABIC_INDIC_NUMERALS.indexOf(char as typeof ARABIC_INDIC_NUMERALS[number])
      return index >= 0 ? WESTERN_NUMERALS[index] : char
    })
    .join('')
  return parseInt(western, 10)
}

/**
 * Format a verse reference in Arabic style
 * @example formatVerseReference(2, 255) => "الآية ٢٥٥"
 */
export function formatAyahNumber(ayahNumber: number): string {
  return `الآية ${toArabicIndic(ayahNumber)}`
}

/**
 * Format a page number in Arabic style
 * @example formatPageNumber(42) => "صفحة ٤٢"
 */
export function formatPageNumber(pageNumber: number): string {
  return `صفحة ${toArabicIndic(pageNumber)}`
}

/**
 * Format a Juz number in Arabic style
 * @example formatJuzNumber(1) => "الجزء الأول"
 * For numbers > 10, use regular format: "الجزء ١١"
 */
export function formatJuzNumber(juzNumber: number): string {
  // Arabic ordinal names for Juz 1-10
  const ordinals: Record<number, string> = {
    1: 'الأول',
    2: 'الثاني',
    3: 'الثالث',
    4: 'الرابع',
    5: 'الخامس',
    6: 'السادس',
    7: 'السابع',
    8: 'الثامن',
    9: 'التاسع',
    10: 'العاشر',
  }

  if (juzNumber >= 1 && juzNumber <= 10 && ordinals[juzNumber]) {
    return `الجزء ${ordinals[juzNumber]}`
  }

  return `الجزء ${toArabicIndic(juzNumber)}`
}

/**
 * Format a count with Arabic-Indic numerals
 * @example formatCount(35, "تكرار") => "٣٥ تكرار"
 */
export function formatCount(count: number, unit: string): string {
  return `${toArabicIndic(count)} ${unit}`
}

/**
 * Format a percentage with Arabic-Indic numerals
 * @example formatPercentage(75.5) => "٧٥٫٥٪"
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  const formatted = value.toFixed(decimals)
  const arabicNum = toArabicIndic(parseFloat(formatted))
  // Replace decimal point with Arabic decimal separator
  return `${arabicNum.replace('.', '٫')}٪`
}

/**
 * Format a range with Arabic-Indic numerals
 * @example formatRange(1, 20) => "١-٢٠"
 */
export function formatRange(start: number, end: number): string {
  return `${toArabicIndic(start)}-${toArabicIndic(end)}`
}

/**
 * Format repetition count display
 * @example formatRepetitions(35, 50) => "٣٥/٥٠"
 */
export function formatRepetitions(current: number, target: number): string {
  return `${toArabicIndic(current)}/${toArabicIndic(target)}`
}
