/**
 * Date utilities for the app
 */

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]!
}

/**
 * Get a date string from days ago
 */
export function getDaysAgoString(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]!
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayString()
}

/**
 * Check if a date string is within the last N days
 */
export function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return date >= cutoff
}

/**
 * Get the current session time based on hour
 * Morning: 5-12, Afternoon: 12-17, Evening: 17-5
 */
export function getCurrentSessionTime(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  return 'evening'
}

/**
 * Get Arabic session time name
 */
export function getSessionTimeArabic(time: 'morning' | 'afternoon' | 'evening'): string {
  const names = {
    morning: 'الصباح',
    afternoon: 'الظهر',
    evening: 'المساء',
  }
  return names[time]
}

/**
 * Calculate days between two date strings
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get the day of week (0-6, Sunday-Saturday)
 */
export function getDayOfWeek(dateString?: string): number {
  const date = dateString ? new Date(dateString) : new Date()
  return date.getDay()
}

/**
 * Format a date for display in Arabic
 */
export function formatDateArabic(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get relative time description in Arabic
 */
export function getRelativeTimeArabic(dateString: string): string {
  const days = daysBetween(dateString, getTodayString())

  if (days === 0) return 'اليوم'
  if (days === 1) return 'أمس'
  if (days === 2) return 'منذ يومين'
  if (days < 7) return `منذ ${days} أيام`
  if (days < 14) return 'الأسبوع الماضي'
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`
  if (days < 60) return 'الشهر الماضي'
  return `منذ ${Math.floor(days / 30)} شهور`
}
