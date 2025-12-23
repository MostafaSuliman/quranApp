/**
 * General Formatting Utilities
 */

/**
 * Format duration in seconds to display string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "5:30" or "1:05:30")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to localized string
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'ar-SA')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, locale: string = 'ar-SA'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time to localized string
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'ar-SA')
 * @returns Formatted time string
 */
export function formatTime(date: string | Date, locale: string = 'ar-SA'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @param locale - Locale string (default: 'ar-SA')
 * @returns Formatted number string
 */
export function formatNumber(num: number, locale: string = 'ar-SA'): string {
  return num.toLocaleString(locale);
}

/**
 * Format percentage
 * @param value - Value (0-1 or 0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  const percentage = value > 1 ? value : value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format file size
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate unique ID
 * @returns Unique ID string
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get ISO date string for today
 * @returns ISO date string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Get days between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Number of days
 */
export function getDaysBetween(start: Date | string, end: Date | string): number {
  const d1 = typeof start === 'string' ? new Date(start) : start;
  const d2 = typeof end === 'string' ? new Date(end) : end;

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
