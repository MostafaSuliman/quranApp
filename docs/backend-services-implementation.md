# Backend Services Implementation

## Overview

This document describes the enhanced backend services implementation for the QuranApp, including IndexedDB storage, retry logic with exponential backoff, and improved API integration.

## Components

### 1. IndexedDB Service (`src/services/indexedDB.ts`)

**Status**: ✅ Already Implemented

**Features**:
- Complete Quran data storage (22MB estimated)
- Surah and Ayah operations with indexing
- Page-based data retrieval
- Reciter management
- Bookmark functionality
- Storage quota monitoring
- Migration support

**Database Schema**:
```typescript
Stores:
- quran_surahs: Surah information (indexed by number)
- quran_ayahs: Ayah data (indexed by id, surah, page, juz)
- quran_pages: Page-based data
- translations: Translation metadata
- bookmarks: User bookmarks
- audio_cache: Audio file metadata
- reciters: Reciter information
```

**Key Operations**:
- Batch operations for performance
- Automatic cache expiration (24 hours)
- Storage size estimation
- Download progress tracking
- Graceful error handling

### 2. Retry Logic (`src/utils/retryLogic.ts`)

**Status**: ✅ Already Implemented

**Features**:
- Exponential backoff (1s, 2s, 4s, 8s max)
- Circuit breaker pattern (fail-safe mechanism)
- Jitter to prevent thundering herd
- Rate limiting (5 concurrent, 100ms min delay)
- Customizable retry strategies
- Batch retry support

**Circuit Breaker States**:
- `CLOSED`: Normal operation
- `OPEN`: Failing, reject immediately (after 5 failures)
- `HALF_OPEN`: Testing if service recovered (after 1 minute)

**Error Classification**:
- **Retryable**: Network errors, timeouts, 5xx errors, 408, 429
- **Non-retryable**: 4xx client errors (except 408, 429)

### 3. Enhanced API Service (`src/services/api/apiService.ts`)

**Status**: ✅ Newly Created

**Features**:

#### Request/Response Interceptors
- Automatic request timing
- Cache lookup before network request
- Circuit breaker integration
- Offline request queuing

#### Caching Strategy
- Two-tier caching: Memory + IndexedDB
- Configurable cache duration (default: 24 hours)
- Automatic cache key generation
- LRU eviction (100 items max in memory)
- Cache fallback for failed requests

#### Error Handling
- Comprehensive error logging
- Automatic retry with backoff
- Cached response fallback
- Network status monitoring

#### Offline Support
- Automatic offline detection
- Request queuing when offline
- Auto-retry when connection restored
- IndexedDB persistent storage

#### Rate Limiting
- Configurable concurrent requests (default: 5)
- Minimum delay between requests (default: 100ms)
- Request queuing and processing

### 4. Quran API Service Enhanced (`src/services/api/quranApiService.ts`)

**Status**: ✅ Newly Created

**Features**:
- Built on enhanced ApiService
- Automatic IndexedDB integration
- Offline-first data loading
- Graceful fallback to cached data
- Comprehensive error handling

**API Methods**:
```typescript
// Chapters
getChapters(): Promise<Surah[]>
getChapter(chapterNumber: number): Promise<Surah>
getChapterVerses(chapterNumber: number, options?): Promise<{verses, pagination}>

// Pages
getVersesByPage(pageNumber: number): Promise<QuranPage>

// Audio
getReciters(): Promise<Reciter[]>
getAudioUrl(reciterId, chapterNumber, verseNumber): string

// Utilities
clearCache(): void
getCacheStats(): CacheStats
isOnline(): boolean
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Application                     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         QuranApiServiceEnhanced                  │
│  (Offline-first, IndexedDB integration)          │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              ApiService                          │
│  (Interceptors, Caching, Rate Limiting)          │
└─────┬──────────────────────────┬────────────────┘
      │                          │
      ▼                          ▼
┌─────────────────┐    ┌─────────────────────────┐
│  Retry Logic    │    │   IndexedDB Service     │
│  (Exponential   │    │   (Persistent Storage)  │
│   Backoff +     │    │                         │
│   Circuit       │    │   - Surahs              │
│   Breaker)      │    │   - Ayahs               │
└─────────────────┘    │   - Pages               │
                       │   - Reciters            │
                       │   - Bookmarks           │
                       └─────────────────────────┘
```

## Data Flow

### 1. Normal Flow (Online)
```
Request → API Service → Check Cache → Not Found → Network Request
  → Retry with Backoff → Success → Cache in Memory + IndexedDB
  → Return Data
```

### 2. Cache Hit Flow
```
Request → API Service → Check Cache → Found → Return Cached Data
```

### 3. Error Flow with Fallback
```
Request → API Service → Network Request → Retry → Failed
  → Check Cache → Found → Return Cached Data as Fallback
```

### 4. Offline Flow
```
Request → API Service → Offline Detected → Check IndexedDB
  → Found → Return Cached Data
  → Not Found → Queue Request → Wait for Online → Retry
```

## Performance Characteristics

### Caching Performance
- **Memory Cache Hit**: < 1ms
- **IndexedDB Hit**: 5-20ms
- **Network Request (cached)**: 50-200ms
- **Network Request (uncached)**: 200-1000ms

### Retry Behavior
- **Retry 1**: After 1s (±200ms jitter)
- **Retry 2**: After 2s (±400ms jitter)
- **Retry 3**: After 4s (±800ms jitter)
- **Max Delay**: 8s

### Storage Limits
- **Memory Cache**: 100 items (LRU eviction)
- **IndexedDB**: ~22MB for complete Quran
- **Browser Quota**: Checked automatically

## Error Handling

### Error Types
1. **Network Errors**: Retried with exponential backoff
2. **Server Errors (5xx)**: Retried with exponential backoff
3. **Rate Limiting (429)**: Retried with exponential backoff
4. **Client Errors (4xx)**: Not retried (except 408, 429)
5. **Circuit Open**: Immediate failure with cached fallback

### Fallback Strategy
```
Primary: Network Request
  ↓ (on failure)
Fallback 1: Memory Cache
  ↓ (on miss)
Fallback 2: IndexedDB Cache
  ↓ (on miss)
Error: Request Failed
```

## Configuration

### ApiService Configuration
```typescript
{
  baseURL: 'https://api.quran.com/api/v4',
  timeout: 10000,                    // 10 seconds
  maxRetries: 3,                     // 3 retry attempts
  cacheDuration: 86400000,           // 24 hours
  enableOfflineMode: true,           // Enable offline support
  rateLimitConfig: {
    maxConcurrent: 5,                // 5 concurrent requests
    minDelay: 100                    // 100ms between requests
  }
}
```

### Circuit Breaker Configuration
```typescript
{
  failureThreshold: 5,               // Open after 5 failures
  resetTimeout: 60000,               // Try again after 1 minute
  monitoringPeriod: 10000           // Monitor over 10 seconds
}
```

## Testing Recommendations

### Unit Tests
- Test retry logic with mock failures
- Test circuit breaker state transitions
- Test cache hit/miss scenarios
- Test offline/online transitions

### Integration Tests
- Test end-to-end API calls
- Test offline data access
- Test cache persistence
- Test error recovery

### Performance Tests
- Measure cache hit rates
- Measure request latency
- Test concurrent request handling
- Test memory usage

## Migration Guide

### From Old API to Enhanced API

**Before**:
```typescript
import { quranApi } from '../utils/quranApi'

const chapters = await quranApi.getChapters()
```

**After**:
```typescript
import { quranApiService } from '../services/api'

const chapters = await quranApiService.getChapters()
// Now includes automatic caching, retry, and offline support
```

### Benefits of Migration
1. Automatic offline support
2. Persistent caching with IndexedDB
3. Exponential backoff on failures
4. Circuit breaker protection
5. Rate limiting
6. Better error handling
7. Performance monitoring

## Monitoring

### Available Metrics
```typescript
// Cache statistics
const stats = quranApiService.getCacheStats()
// { memorySize: 45, memoryKeys: [...] }

// Online status
const online = quranApiService.isOnline()
// true | false

// Circuit breaker state
import { getCircuitBreakerState } from '../utils/retryLogic'
const state = getCircuitBreakerState()
// 'CLOSED' | 'OPEN' | 'HALF_OPEN'

// Storage estimate
const storage = await indexedDB.getStorageEstimate()
// { usage: 15728640, quota: 52428800, percentage: 30 }
```

## Future Enhancements

### Planned Features
1. **Progressive Data Loading**: Load critical data first
2. **Background Sync**: Sync data in background when online
3. **Smart Prefetching**: Prefetch likely-needed data
4. **Compression**: Compress large responses
5. **Analytics**: Track API usage patterns
6. **Service Worker Integration**: Better offline support
7. **GraphQL Support**: Optional GraphQL API support

### Performance Optimizations
1. **Request Deduplication**: Prevent duplicate in-flight requests
2. **Batch Requests**: Batch multiple API calls
3. **Streaming**: Stream large responses
4. **Lazy Loading**: Load data on demand
5. **WebSocket Support**: Real-time updates

## Troubleshooting

### Common Issues

**Issue**: Cached data not updating
```typescript
// Solution: Clear cache manually
quranApiService.clearCache()
await indexedDB.clearAll()
```

**Issue**: Circuit breaker stuck in OPEN state
```typescript
// Solution: Reset circuit breaker
import { resetCircuitBreaker } from '../utils/retryLogic'
resetCircuitBreaker()
```

**Issue**: Offline requests not processing
```typescript
// Solution: Check network status and trigger manual processing
if (navigator.onLine) {
  // Trigger online event
  window.dispatchEvent(new Event('online'))
}
```

## Conclusion

The enhanced backend services provide a robust, offline-first architecture with comprehensive error handling, caching, and retry mechanisms. This ensures a smooth user experience even in poor network conditions while maintaining high performance and reliability.
