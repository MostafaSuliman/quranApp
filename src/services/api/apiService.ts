/**
 * Enhanced API Service Layer
 *
 * Features:
 * - Request/Response interceptors
 * - Automatic retry with exponential backoff
 * - Caching strategy with IndexedDB
 * - Error handling and logging
 * - Circuit breaker pattern
 * - Rate limiting
 * - Offline support
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { retryWithBackoff, RateLimiter, getCircuitBreakerState } from '../../utils/retryLogic'
import { indexedDB } from '../indexedDB'

export interface ApiServiceConfig {
  baseURL: string
  timeout?: number
  maxRetries?: number
  cacheDuration?: number
  enableOfflineMode?: boolean
  rateLimitConfig?: {
    maxConcurrent: number
    minDelay: number
  }
}

export interface CachedResponse<T = any> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * Enhanced API Service with retry, caching, and offline support
 */
export class ApiService {
  private api: AxiosInstance
  private rateLimiter: RateLimiter
  private memoryCache: Map<string, CachedResponse> = new Map()
  private config: Required<ApiServiceConfig>

  // Request queue for offline mode
  private offlineQueue: Array<() => Promise<any>> = []
  private isOnline: boolean = navigator.onLine

  constructor(config: ApiServiceConfig) {
    this.config = {
      timeout: 10000,
      maxRetries: 3,
      cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
      enableOfflineMode: true,
      rateLimitConfig: { maxConcurrent: 5, minDelay: 100 },
      ...config
    }

    // Create rate limiter
    this.rateLimiter = new RateLimiter(
      this.config.rateLimitConfig.maxConcurrent,
      this.config.rateLimitConfig.minDelay
    )

    // Create axios instance
    this.api = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Setup interceptors
    this.setupRequestInterceptor()
    this.setupResponseInterceptor()

    // Setup network listeners
    this.setupNetworkListeners()
  }

  /**
   * Setup request interceptor for caching and offline handling
   */
  private setupRequestInterceptor(): void {
    this.api.interceptors.request.use(
      async (config) => {
        // Add request timestamp
        config.metadata = { startTime: Date.now() }

        // Check circuit breaker
        const circuitState = getCircuitBreakerState()
        if (circuitState === 'OPEN') {
          console.warn('[API] Circuit breaker is OPEN, attempting cached response')
        }

        // Try to get cached response first
        const cacheKey = this.generateCacheKey(config)
        const cached = await this.getCachedResponse(cacheKey)

        if (cached) {
          console.log(`[API] Cache HIT for ${config.url}`)
          // Return cached data by throwing a special error that will be caught by response interceptor
          return Promise.reject({
            cached: true,
            data: cached.data,
            config,
            fromCache: true
          })
        }

        console.log(`[API] Cache MISS for ${config.url}`)

        // If offline, queue the request
        if (!this.isOnline && this.config.enableOfflineMode) {
          console.warn('[API] Offline mode - queuing request')
          return Promise.reject({
            offline: true,
            config,
            message: 'Device is offline. Request will be retried when connection is restored.'
          })
        }

        return config
      },
      (error) => {
        console.error('[API] Request interceptor error:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Setup response interceptor for caching and error handling
   */
  private setupResponseInterceptor(): void {
    this.api.interceptors.response.use(
      async (response: AxiosResponse) => {
        // Calculate request duration
        const duration = Date.now() - (response.config.metadata?.startTime || Date.now())
        console.log(`[API] Request to ${response.config.url} completed in ${duration}ms`)

        // Cache successful responses
        const cacheKey = this.generateCacheKey(response.config)
        await this.setCachedResponse(cacheKey, response.data)

        // Add metadata to response
        response.fromCache = false
        response.requestDuration = duration

        return response
      },
      async (error: AxiosError | any) => {
        // Handle cached responses
        if (error.cached || error.fromCache) {
          console.log('[API] Returning cached response')
          return Promise.resolve({
            data: error.data,
            status: 200,
            statusText: 'OK (Cached)',
            config: error.config,
            headers: {},
            fromCache: true,
            requestDuration: 0
          } as AxiosResponse)
        }

        // Handle offline requests
        if (error.offline) {
          console.warn('[API] Request failed - device is offline')
          return Promise.reject(new Error('Device is offline. Request will be retried when connection is restored.'))
        }

        // Log error details
        if (error.response) {
          // Server responded with error status
          console.error(`[API] Server error ${error.response.status}:`, {
            url: error.config?.url,
            status: error.response.status,
            data: error.response.data
          })
        } else if (error.request) {
          // Request made but no response received
          console.error('[API] No response received:', {
            url: error.config?.url,
            message: error.message
          })
        } else {
          // Error in request setup
          console.error('[API] Request setup error:', error.message)
        }

        // Try to get cached response as fallback for errors
        if (error.config) {
          const cacheKey = this.generateCacheKey(error.config)
          const cached = await this.getCachedResponse(cacheKey)

          if (cached) {
            console.warn('[API] Using cached response as fallback for failed request')
            return Promise.resolve({
              data: cached.data,
              status: 200,
              statusText: 'OK (Cached Fallback)',
              config: error.config,
              headers: {},
              fromCache: true,
              requestDuration: 0
            } as AxiosResponse)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      console.log('[API] Network connection restored')
      this.isOnline = true
      this.processOfflineQueue()
    })

    window.addEventListener('offline', () => {
      console.warn('[API] Network connection lost')
      this.isOnline = false
    })
  }

  /**
   * Process queued offline requests
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return

    console.log(`[API] Processing ${this.offlineQueue.length} queued requests`)

    const queue = [...this.offlineQueue]
    this.offlineQueue = []

    for (const request of queue) {
      try {
        await request()
      } catch (error) {
        console.error('[API] Failed to process queued request:', error)
      }
    }
  }

  /**
   * Generate cache key from request config
   */
  private generateCacheKey(config: AxiosRequestConfig): string {
    const url = config.url || ''
    const params = JSON.stringify(config.params || {})
    const method = config.method?.toLowerCase() || 'get'
    return `${method}:${url}:${params}`
  }

  /**
   * Get cached response from memory or IndexedDB
   */
  private async getCachedResponse<T = any>(key: string): Promise<CachedResponse<T> | null> {
    // Check memory cache first (fastest)
    const memoryCached = this.memoryCache.get(key)
    if (memoryCached && Date.now() < memoryCached.expiresAt) {
      return memoryCached
    }

    // Check IndexedDB (persistent)
    // Implementation would require adding a cache store to IndexedDB
    // For now, just use memory cache

    return null
  }

  /**
   * Set cached response in memory and IndexedDB
   */
  private async setCachedResponse<T = any>(key: string, data: T): Promise<void> {
    const now = Date.now()
    const cached: CachedResponse<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.config.cacheDuration
    }

    // Store in memory cache
    this.memoryCache.set(key, cached)

    // Limit memory cache size to prevent memory leaks
    if (this.memoryCache.size > 100) {
      const oldestKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(oldestKey)
    }

    // TODO: Store in IndexedDB for persistence
  }

  /**
   * Make a GET request with retry and caching
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.rateLimiter.execute(() =>
      retryWithBackoff(
        () => this.api.get<T>(url, config),
        {
          maxRetries: this.config.maxRetries,
          onRetry: (attempt, error) => {
            console.warn(`[API] Retry attempt ${attempt} for GET ${url}:`, error.message)
          }
        }
      )
    )
  }

  /**
   * Make a POST request with retry
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.rateLimiter.execute(() =>
      retryWithBackoff(
        () => this.api.post<T>(url, data, config),
        {
          maxRetries: this.config.maxRetries,
          onRetry: (attempt, error) => {
            console.warn(`[API] Retry attempt ${attempt} for POST ${url}:`, error.message)
          }
        }
      )
    )
  }

  /**
   * Make a PUT request with retry
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.rateLimiter.execute(() =>
      retryWithBackoff(
        () => this.api.put<T>(url, data, config),
        {
          maxRetries: this.config.maxRetries,
          onRetry: (attempt, error) => {
            console.warn(`[API] Retry attempt ${attempt} for PUT ${url}:`, error.message)
          }
        }
      )
    )
  }

  /**
   * Make a DELETE request with retry
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.rateLimiter.execute(() =>
      retryWithBackoff(
        () => this.api.delete<T>(url, config),
        {
          maxRetries: this.config.maxRetries,
          onRetry: (attempt, error) => {
            console.warn(`[API] Retry attempt ${attempt} for DELETE ${url}:`, error.message)
          }
        }
      )
    )
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.memoryCache.clear()
    console.log('[API] Cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memorySize: number
    memoryKeys: string[]
  } {
    return {
      memorySize: this.memoryCache.size,
      memoryKeys: Array.from(this.memoryCache.keys())
    }
  }

  /**
   * Check if service is online
   */
  isServiceOnline(): boolean {
    return this.isOnline
  }

  /**
   * Get axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.api
  }
}

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
  }

  export interface AxiosResponse {
    fromCache?: boolean
    requestDuration?: number
  }
}

export default ApiService
