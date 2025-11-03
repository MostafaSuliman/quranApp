# Islamic Content Store Documentation

This documentation explains how to use the `islamicContentStore.ts` Zustand store for managing Hadith, Duas, and Prayer Times content in the QuranApp.

## Overview

The Islamic Content Store provides:
- **Hadith Management**: Random hadiths, search, and collections from authentic sources
- **Dua Management**: Daily duas, category-based duas, and search functionality  
- **Prayer Times**: Location-based prayer times with next prayer calculations
- **Offline Caching**: Smart caching for offline access
- **Error Handling**: Robust error boundaries and retry mechanisms
- **Arabic-First**: Prioritizes Arabic text with transliteration support

## Quick Start

```typescript
import { useIslamicContentStore } from '../stores/islamicContentStore'

function MyComponent() {
  const {
    // Data
    dailyHadith,
    dailyDuas,
    prayerTimes,
    nextPrayer,
    
    // Actions
    initialize,
    loadRandomHadith,
    loadDailyDuas,
    requestLocationPermission,
    
    // Loading states
    isLoading,
    error
  } = useIslamicContentStore()

  useEffect(() => {
    initialize() // Call this once when your app starts
  }, [])

  return (
    <div>
      {dailyHadith && (
        <div>
          <p className="arabic">{dailyHadith.arabicText}</p>
          <p>{dailyHadith.englishTranslation}</p>
        </div>
      )}
    </div>
  )
}
```

## Core Features

### 1. Hadith Management

```typescript
// Load random hadith from preferred collection
await loadRandomHadith('sahih-bukhari')

// Load specific hadith by number
await loadHadithByNumber('sahih-muslim', 1)

// Search hadiths by keyword
await searchHadiths('prayer', 'sahih-bukhari')

// Access current hadith
const { currentHadith, dailyHadith } = useIslamicContentStore()
```

**Available Collections:**
- `sahih-bukhari` - Sahih al-Bukhari
- `sahih-muslim` - Sahih Muslim
- `abu-dawood` - Sunan Abu Dawud
- `jami-at-tirmidhi` - Jami' at-Tirmidhi
- `sunan-an-nasai` - Sunan an-Nasa'i
- `sunan-ibn-majah` - Sunan Ibn Majah

### 2. Dua Management

```typescript
// Load daily duas (automatically cached)
await loadDailyDuas()

// Load duas by category
await loadDuasByCategory('morning')
await loadDuasByCategory('evening')
await loadDuasByCategory('before_eating')

// Search duas by text
await searchDuas('protection')

// Access duas
const { dailyDuas, duas } = useIslamicContentStore()
```

**Available Categories:**
- `morning` - Morning supplications
- `evening` - Evening supplications
- `before_eating` - Before meals
- `after_eating` - After meals
- `before_sleep` - Before sleeping
- `after_waking` - Upon waking
- `travel` - Travel duas
- `protection` - Protection duas
- `forgiveness` - Seeking forgiveness

### 3. Prayer Times

```typescript
// Request location permission and load prayer times
await requestLocationPermission()

// Manually set location
setLocation({
  latitude: 40.7128,
  longitude: -74.0060,
  city: 'New York',
  country: 'USA'
})

// Load prayer times for specific location
await loadPrayerTimes(location, '2024-01-15')

// Access prayer data
const { 
  prayerTimes, 
  nextPrayer, 
  timeToNextPrayer,
  location 
} = useIslamicContentStore()
```

## Configuration & Preferences

```typescript
// Update preferences
updatePreferences({
  preferredHadithCollection: 'sahih-muslim',
  enableArabicFirst: true,
  showTransliteration: true,
  dailyHadithNotification: true,
  prayerTimeNotifications: true,
  cacheExpiryHours: 48
})

// Access current preferences
const { preferences } = useIslamicContentStore()
```

## Error Handling

The store includes comprehensive error handling with retry mechanisms:

```typescript
const { error, clearError } = useIslamicContentStore()

// Error structure
interface IslamicContentError {
  code: string
  message: string
  timestamp: number
  source: 'hadith' | 'dua' | 'prayer' | 'location' | 'network'
  retryable: boolean
  details?: any
}

// Handle errors in components
if (error) {
  console.log(`Error from ${error.source}: ${error.message}`)
  if (error.retryable) {
    // Show retry button
  }
}
```

## Loading States

Monitor loading states for better UX:

```typescript
const {
  isLoading,          // General loading state
  isLoadingHadiths,   // Hadith operations
  isLoadingDuas,      // Dua operations  
  isLoadingPrayerTimes // Prayer time operations
} = useIslamicContentStore()
```

## Caching System

The store implements intelligent caching:

- **Hadith Cache**: 24 hours
- **Dua Cache**: 24 hours  
- **Prayer Times Cache**: 6 hours
- **Daily Content Cache**: 24 hours (resets daily)

```typescript
// Cache management
clearCache()           // Clear all cached content
cleanExpiredCache()    // Remove only expired entries
getCacheSize()         // Get current cache size
```

## Offline Support

Content is automatically cached for offline access:

1. **API First**: Always tries API first
2. **Cache Fallback**: Uses cached content when offline
3. **Local Fallback**: Hardcoded authentic content as last resort
4. **Smart Sync**: Auto-syncs when connection restored

## Best Practices

### 1. Initialize Early
```typescript
// In your main App component
useEffect(() => {
  initialize()
}, [])
```

### 2. Handle Loading States
```typescript
if (isLoading) {
  return <LoadingSpinner />
}
```

### 3. Error Boundaries
```typescript
if (error) {
  return (
    <ErrorDisplay 
      error={error} 
      onRetry={() => window.location.reload()}
      onDismiss={clearError}
    />
  )
}
```

### 4. Optimize Re-renders
```typescript
// Use specific selectors to avoid unnecessary re-renders
const dailyHadith = useIslamicContentStore(state => state.dailyHadith)
const isLoading = useIslamicContentStore(state => state.isLoading)
```

### 5. Location Permission
```typescript
// Check permission status before requesting
const { locationPermissionGranted } = useIslamicContentStore()

if (!locationPermissionGranted) {
  // Show location permission prompt
}
```

## Data Types

### Hadith
```typescript
interface Hadith {
  id: string
  collection: string
  book: string
  chapter: string
  hadithNumber: string
  arabicText: string
  englishTranslation: string
  narrator: string
  grade: string // Sahih, Hasan, Daif
  reference: string
  isFavorited?: boolean
  tags?: string[]
}
```

### Dua
```typescript
interface Dua {
  id: string
  title: string
  arabicText: string
  transliteration: string
  englishTranslation: string
  source: string
  category: string
  audio?: string
  isFavorited?: boolean
  timesRecited?: number
}
```

### Prayer Times
```typescript
interface PrayerTimes {
  date: string
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  location: {
    city: string
    country: string
    latitude: number
    longitude: number
    timezone?: string
  }
  method?: number
  nextPrayer?: string
  timeToNextPrayer?: string
}
```

## Integration with Islamic API

The store integrates with `islamicApi.ts` service which provides:

- **Trusted Sources**: Only authentic Islamic APIs
- **Fallback Data**: Hardcoded authentic content
- **Smart Caching**: API-level caching
- **Error Recovery**: Multiple API sources

## Performance Considerations

1. **Lazy Loading**: Content loaded on-demand
2. **Efficient Caching**: Minimizes API calls
3. **Selective Persistence**: Only essential data persisted
4. **Memory Management**: Limits stored content size
5. **Background Updates**: Updates cache without blocking UI

## Security Features

1. **API Validation**: Only trusted Islamic content sources
2. **Content Verification**: Authentic sources only
3. **Safe Defaults**: Fallback to verified content
4. **Input Sanitization**: Search queries sanitized
5. **Error Information**: No sensitive data in errors

## Example Implementation

See `IslamicContentExample.tsx` for a complete implementation example showing:

- Preference management
- Content loading and display
- Error handling
- Loading states
- Location services
- Arabic text rendering
- Search functionality

This store provides a robust foundation for Islamic content in your React application with proper caching, error handling, and offline support.