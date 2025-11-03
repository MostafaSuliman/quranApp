/**
 * API Services Barrel Export
 *
 * Provides centralized access to all API services
 */

export { ApiService } from './apiService'
export type { ApiServiceConfig, CachedResponse } from './apiService'

export { quranApiService } from './quranApiService'
export { default as quranApiServiceEnhanced } from './quranApiService'

// Re-export for backward compatibility
export { default as quranApi } from '../../utils/quranApi'
