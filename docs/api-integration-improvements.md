# API Integration Improvements - Implementation Guide

## 1. Offline Storage Implementation

### 1.1 IndexedDB Setup

```typescript
// src/utils/offlineStorage.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface QuranDB extends DBSchema {
  surahs: {
    key: number
    value: Surah
    indexes: { 'by-name': string }
  }
  ayahs: {
    key: number
    value: Ayah
    indexes: { 'by-surah': number }
  }
  cache: {
    key: string
    value: {
      data: any
      timestamp: number
      expiry: number
    }
  }
}

export class OfflineStorageService {
  private db: Promise<IDBPDatabase<QuranDB>>

  constructor() {
    this.db = this.initDB()
  }

  private async initDB(): Promise<IDBPDatabase<QuranDB>> {
    return openDB<QuranDB>('quran-app-db', 1, {
      upgrade(db) {
        // Surahs store
        const surahStore = db.createObjectStore('surahs', { keyPath: 'number' })
        surahStore.createIndex('by-name', 'name')

        // Ayahs store
        const ayahStore = db.createObjectStore('ayahs', { keyPath: 'number' })
        ayahStore.createIndex('by-surah', 'surah')

        // Cache store
        db.createObjectStore('cache', { keyPath: 'key' })
      }
    })
  }

  // Store complete surah with ayahs
  async storeSurah(surah: Surah): Promise<void> {
    const db = await this.db
    const tx = db.transaction(['surahs', 'ayahs'], 'readwrite')

    await tx.objectStore('surahs').put(surah)

    for (const ayah of surah.ayahs) {
      await tx.objectStore('ayahs').put(ayah)
    }

    await tx.done
  }

  // Retrieve surah with ayahs
  async getSurah(surahNumber: number): Promise<Surah | undefined> {
    const db = await this.db
    const surah = await db.get('surahs', surahNumber)

    if (!surah) return undefined

    const ayahs = await db.getAllFromIndex('ayahs', 'by-surah', surahNumber)
    return { ...surah, ayahs }
  }

  // Cache API responses
  async setCache(key: string, data: any, expiryHours: number = 24): Promise<void> {
    const db = await this.db
    await db.put('cache', {
      key,
      data,
      timestamp: Date.now(),
      expiry: expiryHours * 60 * 60 * 1000
    })
  }

  async getCache(key: string): Promise<any | null> {
    const db = await this.db
    const cached = await db.get('cache', key)

    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.expiry) {
      await db.delete('cache', key)
      return null
    }

    return cached.data
  }

  // LRU cache eviction
  async cleanupCache(maxEntries: number = 100): Promise<void> {
    const db = await this.db
    const allCache = await db.getAll('cache')

    if (allCache.length <= maxEntries) return

    // Sort by timestamp, keep most recent
    const sorted = allCache.sort((a, b) => b.timestamp - a.timestamp)
    const toDelete = sorted.slice(maxEntries)

    const tx = db.transaction('cache', 'readwrite')
    for (const item of toDelete) {
      await tx.objectStore('cache').delete(item.key)
    }
    await tx.done
  }
}

export const offlineStorage = new OfflineStorageService()
```

### 1.2 Update QuranApiService

```typescript
// src/utils/quranApi.ts (Updated)
import { offlineStorage } from './offlineStorage'

class QuranApiService {
  private api: AxiosInstance
  private isOffline: boolean = false

  constructor() {
    // ... existing setup

    // Monitor online/offline status
    window.addEventListener('online', () => this.isOffline = false)
    window.addEventListener('offline', () => this.isOffline = true)
  }

  /**
   * Enhanced getChapterVerses with offline support
   */
  async getChapterVerses(chapterNumber: number, options = {}): Promise<{ verses: Ayah[] }> {
    const cacheKey = `surah_${chapterNumber}`

    // Try IndexedDB first
    const cached = await offlineStorage.getSurah(chapterNumber)
    if (cached) {
      return { verses: cached.ayahs, pagination: null }
    }

    // If offline and no cache, return error
    if (this.isOffline) {
      throw new Error('No offline data available for this surah')
    }

    try {
      // Fetch from API
      const response = await this.api.get(`/verses/by_chapter/${chapterNumber}`, {
        params: { ...options }
      })

      const verses = response.data.verses.map((v: any) =>
        this.transformVerseData(v, chapterNumber)
      )

      // Store in IndexedDB for offline access
      await offlineStorage.storeSurah({
        number: chapterNumber,
        name: '', // Load from chapters endpoint
        ayahs: verses
      } as Surah)

      return { verses, pagination: response.data.pagination }

    } catch (error) {
      console.error('Failed to fetch verses:', error)
      throw error
    }
  }
}
```

---

## 2. Retry Logic Implementation

### 2.1 Axios Retry Configuration

```typescript
// src/utils/apiConfig.ts
import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'

export function createApiClient(baseURL: string): AxiosInstance {
  const api = axios.create({
    baseURL,
    timeout: 30000, // Increased to 30 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // Configure retry logic
  axiosRetry(api, {
    retries: 3,
    retryDelay: (retryCount) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.pow(2, retryCount) * 1000
    },
    retryCondition: (error) => {
      // Retry on network errors or 5xx server errors
      return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
             error.response?.status === 429 || // Rate limit
             (error.response?.status >= 500 && error.response?.status < 600)
    },
    onRetry: (retryCount, error, requestConfig) => {
      console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`)
    }
  })

  // Request timeout logging
  api.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: Date.now() }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response time logging
  api.interceptors.response.use(
    (response) => {
      const duration = Date.now() - response.config.metadata.startTime
      console.log(`API ${response.config.url} took ${duration}ms`)
      return response
    },
    (error) => {
      if (error.config?.metadata) {
        const duration = Date.now() - error.config.metadata.startTime
        console.error(`API ${error.config.url} failed after ${duration}ms`)
      }
      return Promise.reject(error)
    }
  )

  return api
}
```

---

## 3. Structured Error Handling

### 3.1 Custom Error Classes

```typescript
// src/utils/errors.ts

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends ApiError {
  constructor(endpoint: string, originalError: Error) {
    super('Network request failed', undefined, endpoint, originalError)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends ApiError {
  constructor(endpoint: string) {
    super('Request timeout', 408, endpoint)
    this.name = 'TimeoutError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public validationErrors: Record<string, string[]>) {
    super(message, 422)
    this.name = 'ValidationError'
  }
}

export class RateLimitError extends ApiError {
  constructor(public retryAfter: number) {
    super('Rate limit exceeded', 429)
    this.name = 'RateLimitError'
  }
}

export class IslamicContentError extends Error {
  constructor(
    message: string,
    public contentType: 'quran' | 'hadith' | 'dua',
    public severity: 'warning' | 'error' | 'critical'
  ) {
    super(message)
    this.name = 'IslamicContentError'
  }
}

// Error handler utility
export function handleApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new TimeoutError(error.config?.url || 'unknown')
    }

    if (!error.response) {
      return new NetworkError(error.config?.url || 'unknown', error)
    }

    if (error.response.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '60')
      return new RateLimitError(retryAfter)
    }

    if (error.response.status === 422) {
      return new ValidationError(
        'Validation failed',
        error.response.data.errors || {}
      )
    }

    return new ApiError(
      error.response.data.message || 'API request failed',
      error.response.status,
      error.config?.url
    )
  }

  return new ApiError('Unknown error occurred')
}
```

### 3.2 Error Handling in API Service

```typescript
// src/utils/quranApi.ts (Updated error handling)
async getChapters(): Promise<Surah[]> {
  try {
    const response = await this.api.get('/chapters')
    return response.data.chapters.map(this.transformChapterData)
  } catch (error) {
    const apiError = handleApiError(error)

    // Log to error tracking service
    this.logError(apiError)

    // Provide user-friendly error messages
    if (apiError instanceof NetworkError) {
      throw new Error('Unable to connect to server. Please check your internet connection.')
    }

    if (apiError instanceof RateLimitError) {
      throw new Error(`Too many requests. Please wait ${apiError.retryAfter} seconds.`)
    }

    throw new Error('Failed to load Quran chapters. Please try again.')
  }
}

private logError(error: ApiError): void {
  // Integrate with error tracking (Sentry, LogRocket, etc.)
  console.error('API Error:', {
    name: error.name,
    message: error.message,
    endpoint: error.endpoint,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString()
  })

  // Send to error tracking service
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      tags: {
        type: 'api-error',
        endpoint: error.endpoint
      }
    })
  }
}
```

---

## 4. Request Queueing for Offline

### 4.1 Offline Queue Implementation

```typescript
// src/utils/offlineQueue.ts
interface QueuedRequest {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  data?: any
  timestamp: number
  retries: number
}

export class OfflineRequestQueue {
  private queue: QueuedRequest[] = []
  private isProcessing = false
  private readonly MAX_RETRIES = 3

  constructor() {
    // Load queue from localStorage
    this.loadQueue()

    // Process queue when back online
    window.addEventListener('online', () => this.processQueue())
  }

  // Add request to queue
  async enqueue(method: string, url: string, data?: any): Promise<void> {
    const request: QueuedRequest = {
      id: this.generateId(),
      method: method as any,
      url,
      data,
      timestamp: Date.now(),
      retries: 0
    }

    this.queue.push(request)
    this.saveQueue()

    // Try to process immediately if online
    if (navigator.onLine) {
      await this.processQueue()
    }
  }

  // Process all queued requests
  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const request = this.queue[0]

      try {
        await this.executeRequest(request)
        this.queue.shift() // Remove on success
      } catch (error) {
        request.retries++

        if (request.retries >= this.MAX_RETRIES) {
          console.error('Request failed after max retries:', request)
          this.queue.shift() // Remove failed request
        } else {
          // Move to end of queue for retry
          this.queue.push(this.queue.shift()!)
          await this.delay(1000 * Math.pow(2, request.retries))
        }
      }
    }

    this.saveQueue()
    this.isProcessing = false
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    // Execute the actual API request
    await axios({
      method: request.method,
      url: request.url,
      data: request.data
    })
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private saveQueue(): void {
    localStorage.setItem('offline-queue', JSON.stringify(this.queue))
  }

  private loadQueue(): void {
    const saved = localStorage.getItem('offline-queue')
    if (saved) {
      this.queue = JSON.parse(saved)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const offlineQueue = new OfflineRequestQueue()
```

---

## 5. Performance Monitoring

### 5.1 API Performance Tracker

```typescript
// src/utils/apiMetrics.ts
interface ApiMetric {
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: number
  cached: boolean
}

class ApiMetricsService {
  private metrics: ApiMetric[] = []
  private readonly MAX_METRICS = 1000

  recordMetric(metric: ApiMetric): void {
    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
  }

  getMetrics(options: {
    endpoint?: string
    timeRange?: number // milliseconds
  } = {}): ApiMetric[] {
    let filtered = this.metrics

    if (options.endpoint) {
      filtered = filtered.filter(m => m.endpoint === options.endpoint)
    }

    if (options.timeRange) {
      const cutoff = Date.now() - options.timeRange
      filtered = filtered.filter(m => m.timestamp > cutoff)
    }

    return filtered
  }

  getAverageResponseTime(endpoint?: string): number {
    const metrics = this.getMetrics({ endpoint })
    if (metrics.length === 0) return 0

    const total = metrics.reduce((sum, m) => sum + m.duration, 0)
    return total / metrics.length
  }

  getCacheHitRate(endpoint?: string): number {
    const metrics = this.getMetrics({ endpoint })
    if (metrics.length === 0) return 0

    const cacheHits = metrics.filter(m => m.cached).length
    return (cacheHits / metrics.length) * 100
  }

  getErrorRate(endpoint?: string): number {
    const metrics = this.getMetrics({ endpoint })
    if (metrics.length === 0) return 0

    const errors = metrics.filter(m => m.status >= 400).length
    return (errors / metrics.length) * 100
  }

  getSummary() {
    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.getAverageResponseTime(),
      cacheHitRate: this.getCacheHitRate(),
      errorRate: this.getErrorRate(),
      endpoints: this.getEndpointStats()
    }
  }

  private getEndpointStats() {
    const endpoints = [...new Set(this.metrics.map(m => m.endpoint))]

    return endpoints.map(endpoint => ({
      endpoint,
      requests: this.metrics.filter(m => m.endpoint === endpoint).length,
      avgResponseTime: this.getAverageResponseTime(endpoint),
      cacheHitRate: this.getCacheHitRate(endpoint),
      errorRate: this.getErrorRate(endpoint)
    }))
  }
}

export const apiMetrics = new ApiMetricsService()
```

---

## 6. Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Set up IndexedDB with idb library
- [ ] Create offline storage service
- [ ] Implement cache persistence
- [ ] Add online/offline detection
- [ ] Update QuranApiService to use offline storage

### Phase 2: Resilience (Week 2-3)
- [ ] Install and configure axios-retry
- [ ] Implement exponential backoff
- [ ] Create custom error classes
- [ ] Add structured error handling
- [ ] Integrate error tracking service

### Phase 3: Queue & Sync (Week 3-4)
- [ ] Implement offline request queue
- [ ] Add background sync support
- [ ] Create sync conflict resolution
- [ ] Test offline scenarios

### Phase 4: Monitoring (Week 4-5)
- [ ] Implement API metrics tracking
- [ ] Create performance dashboard
- [ ] Add real-time monitoring
- [ ] Set up alerting for errors

### Phase 5: Optimization (Week 5-6)
- [ ] Implement request batching
- [ ] Add GraphQL layer (optional)
- [ ] Optimize cache eviction
- [ ] Add prefetching for common queries

---

## 7. Testing Strategy

### 7.1 Offline Testing

```typescript
// src/tests/offline.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { quranApi } from '../utils/quranApi'
import { offlineStorage } from '../utils/offlineStorage'

describe('Offline Storage', () => {
  beforeEach(async () => {
    // Clear IndexedDB before each test
    await offlineStorage.clear()
  })

  it('should store and retrieve surah from IndexedDB', async () => {
    const testSurah = {
      number: 1,
      name: 'Al-Fatiha',
      ayahs: [/* ... */]
    }

    await offlineStorage.storeSurah(testSurah)
    const retrieved = await offlineStorage.getSurah(1)

    expect(retrieved).toEqual(testSurah)
  })

  it('should return cached data when offline', async () => {
    // Pre-populate cache
    await offlineStorage.storeSurah(testSurah)

    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })

    const result = await quranApi.getChapterVerses(1)
    expect(result.verses).toHaveLength(7)
  })
})
```

### 7.2 Retry Logic Testing

```typescript
// src/tests/retry.test.ts
import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('Retry Logic', () => {
  const mock = new MockAdapter(axios)

  it('should retry on network error', async () => {
    let attempts = 0

    mock.onGet('/chapters').reply(() => {
      attempts++
      if (attempts < 3) {
        return [500, { error: 'Server error' }]
      }
      return [200, { chapters: [] }]
    })

    const result = await quranApi.getChapters()
    expect(attempts).toBe(3)
    expect(result).toEqual([])
  })

  it('should not retry on 4xx errors', async () => {
    let attempts = 0

    mock.onGet('/chapters').reply(() => {
      attempts++
      return [404, { error: 'Not found' }]
    })

    await expect(quranApi.getChapters()).rejects.toThrow()
    expect(attempts).toBe(1)
  })
})
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Status**: Ready for Implementation
