# QuranApp Dependency Graph & Coupling Analysis

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Home     │  │ Lesson   │  │ Mushaf   │  │ Settings │   │
│  │ Page     │  │ Page     │  │ Reader   │  │ Page     │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                      COMPONENT LAYER                          │
│                           │                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Audio      │  │ Quran      │  │ Navigation │            │
│  │ Player     │  │ Display    │  │ Components │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │               │               │                     │
└────────┼───────────────┼───────────────┼─────────────────────┘
         │               │               │
┌────────┼───────────────┼───────────────┼─────────────────────┐
│        │         STATE MANAGEMENT      │                      │
│        │               │               │                      │
│  ┌─────▼──────┐  ┌────▼─────┐  ┌─────▼──────┐              │
│  │ Audio      │◄─┤ Quran    │  │ Preferences│              │
│  │ Store      │  │ Store    │  │ Store      │              │
│  └─────┬──────┘  └────┬─────┘  └─────┬──────┘              │
│        │               │               │                      │
│        │ ⚠️ CIRCULAR  │               │                      │
│        └───────────────┼───────────────┘                      │
│                        │                                      │
└────────────────────────┼──────────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────────┐
│                   SERVICE LAYER                               │
│                        │                                       │
│  ┌──────────────┐  ┌──▼────────┐  ┌──────────────┐          │
│  │ Security     │  │ Quran API │  │ Islamic      │          │
│  │ Manager      │  │ Service   │  │ Content Svc  │          │
│  └──────────────┘  └──┬────────┘  └──────────────┘          │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │
┌───────────────────────┼───────────────────────────────────────┐
│                  EXTERNAL APIS                                │
│                       │                                        │
│  ┌──────────────┐  ┌─▼────────┐  ┌──────────────┐           │
│  │ quran.com    │◄─┤ Axios    │─►│ everyayah    │           │
│  │ API          │  │ Client   │  │ .com         │           │
│  └──────────────┘  └──────────┘  └──────────────┘           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 2. Store Dependency Graph

### 2.1 Core Business Stores (Green - Healthy)

```
┌──────────────┐
│  authStore   │
│  (isolated)  │
└──────────────┘

┌──────────────┐         ┌──────────────┐
│ quranStore   │────────►│  quranApi    │
│              │         │  Service     │
└──────────────┘         └──────────────┘

┌──────────────┐         ┌──────────────┐
│ progressStore│────────►│ localStorage │
│              │         │              │
└──────────────┘         └──────────────┘
```

### 2.2 Circular Dependency (Red - Critical Issue)

```
┌──────────────────┐
│ preferencesStore │
│                  │
│ - reciterId      │
│ - playbackSpeed  │
└────────┬─────────┘
         │
         │ dynamic import
         │ syncWithPreferences()
         │
         ▼
┌──────────────────┐
│   audioStore     │
│                  │
│ - currentReciter │
│ - playbackSpeed  │
└────────┬─────────┘
         │
         │ dynamic import
         │ initializeAudio()
         │
         ▼
┌──────────────────┐
│ preferencesStore │ ⚠️ CIRCULAR!
└──────────────────┘
```

**Impact:**
- Race conditions during initialization
- Difficult to test in isolation
- Potential memory leaks
- Hard to reason about state flow

**Solution:**
```
         ┌──────────────────┐
         │   EventBus       │
         │   (Mediator)     │
         └────────┬─────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌──────────────┐    ┌──────────────┐
│ preferences  │    │ audioStore   │
│ Store        │    │              │
│              │    │              │
│ emit:        │    │ listen:      │
│ 'reciter     │    │ 'reciter     │
│  changed'    │    │  changed'    │
└──────────────┘    └──────────────┘
```

### 2.3 Analytics Store Cluster (Yellow - Over-engineered)

```
┌──────────────────────────────────────────────────┐
│          ANALYTICS CLUSTER (5 stores)            │
│                                                   │
│  ┌───────────────┐     ┌───────────────┐        │
│  │ analytics     │────►│ performance   │        │
│  │ Store         │     │ MonitorStore  │        │
│  └───────────────┘     └───────────────┘        │
│          │                     │                 │
│          ▼                     ▼                 │
│  ┌───────────────┐     ┌───────────────┐        │
│  │ optimization  │     │ predictive    │        │
│  │ EngineStore   │     │ Enhancement   │        │
│  └───────────────┘     └───────────────┘        │
│          │                                       │
│          ▼                                       │
│  ┌───────────────┐                              │
│  │ enhanced      │                              │
│  │ Predictive    │                              │
│  └───────────────┘                              │
└──────────────────────────────────────────────────┘

RECOMMENDATION: Consolidate to 2 stores
┌──────────────┐     ┌──────────────┐
│ metricsStore │     │ optimization │
│              │     │ Store        │
└──────────────┘     └──────────────┘
```

## 3. Component Dependency Tree

```
App.tsx
├── Providers
│   ├── TranslationProvider
│   ├── AudioNavigationProvider
│   └── ErrorBoundary
│
├── Routes
│   ├── HomePage
│   │   ├── Navigation
│   │   ├── SurahList
│   │   └── ProgressWidget
│   │
│   ├── LessonPage
│   │   ├── AudioPlayer ⚠️ (Large - 3D visualization)
│   │   │   └── WaveformVisualization (three.js)
│   │   ├── AyahDisplay
│   │   └── Navigation
│   │
│   ├── MushafReaderPage
│   │   ├── PageViewer
│   │   ├── Navigation
│   │   └── AudioPlayer
│   │
│   ├── ProgressPage
│   │   ├── ProgressChart
│   │   ├── Statistics
│   │   └── Navigation
│   │
│   └── SettingsPage
│       ├── LanguageToggle
│       ├── ReciterSelector
│       ├── ThemeToggle
│       └── Navigation
│
└── Global Components
    ├── LoadingScreen
    ├── SplashScreen
    └── ErrorFallback
```

## 4. API Service Dependencies

```
QuranApiService (Singleton)
│
├── Axios Instance
│   ├── Request Interceptor (Cache Check)
│   └── Response Interceptor (Cache Store)
│
├── Cache Manager (Map<string, any>)
│   └── 24-hour TTL
│
└── API Methods
    ├── getChapters() ──────► quran.com/api/v4/chapters
    ├── getChapterVerses() ─► quran.com/api/v4/verses/by_chapter/{id}
    ├── getVersesByPage() ──► quran.com/api/v4/verses/by_page/{page}
    ├── getReciters() ──────► quran.com/api/v4/resources/recitations
    ├── getAudioUrl() ──────► everyayah.com/data/{reciter}/{ayah}.mp3
    └── searchVerses() ─────► quran.com/api/v4/search
```

### 4.1 Caching Strategy

```
Request Flow:

1. Client Request
      ↓
2. Cache Check (Map)
      ├── Hit  → Return Cached (< 24h old)
      └── Miss → Continue
                   ↓
3. Network Request (Axios)
      ↓
4. Response Processing
      ↓
5. Cache Storage (Map + timestamp)
      ↓
6. Return to Client

⚠️ Issue: Memory-only cache (cleared on refresh)
✅ Solution: Migrate to IndexedDB for persistence
```

## 5. Security Layer Architecture

```
SecurityManager (Central Coordinator)
│
├── CSPManager
│   ├── Define CSP Directives
│   ├── Apply Meta Tags
│   └── Monitor Violations
│
├── XSSProtection
│   ├── Sanitize HTML
│   ├── Sanitize Arabic Text
│   └── Validate User Input
│
├── CSRFProtection
│   ├── Generate Tokens
│   ├── Validate Tokens
│   └── Refresh Tokens
│
├── RateLimiter
│   ├── Track API Calls
│   ├── Apply Limits
│   └── Backoff Strategy
│
├── AuthenticationManager
│   ├── Guest Mode
│   ├── Email Auth (Future)
│   └── Session Management
│
├── EncryptionManager
│   ├── Encrypt Sensitive Data
│   ├── Decrypt Data
│   └── Key Management
│
├── PrivacyManager
│   ├── Data Minimization
│   ├── Consent Management
│   └── Data Retention
│
└── IslamicContentIntegrity
    ├── Verse Hash Validation
    ├── Canonical Text Verification
    └── Integrity Monitoring
```

## 6. PWA & Caching Architecture

```
Service Worker (Workbox)
│
├── Precache Manifest
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── static assets
│
└── Runtime Caching Strategies
    │
    ├── Audio Files (everyayah.com)
    │   ├── Strategy: CacheFirst
    │   ├── Max Age: 90 days
    │   └── Max Entries: 200
    │
    ├── API Responses (quran.com)
    │   ├── Strategy: NetworkFirst
    │   ├── Max Age: 7 days
    │   └── Max Entries: 100
    │
    ├── Images
    │   ├── Strategy: CacheFirst
    │   ├── Max Age: 30 days
    │   └── Max Entries: 100
    │
    └── Static Resources (JS/CSS)
        ├── Strategy: StaleWhileRevalidate
        └── Cache Name: static-resources
```

## 7. Data Flow Diagrams

### 7.1 Audio Playback Flow

```
User Action: Click Play Button
         │
         ▼
AudioPlayer Component
         │
         ▼
useAudioStore.play()
         │
         ├──► Check current audio loaded
         │    └──► If not, loadAyahAudio()
         │              │
         │              ├──► Get reciter from preferences
         │              ├──► Build audio URL
         │              ├──► Create Audio element
         │              ├──► Set CORS attributes
         │              └──► Add event listeners
         │
         ├──► Set playback speed
         ├──► Set volume
         └──► HTMLAudioElement.play()
                  │
                  ├──► Success → Update isPlaying state
                  └──► Error → Set error state
                           │
                           └──► Display error to user
```

### 7.2 Settings Change Flow

```
User Action: Change Reciter in Settings
         │
         ▼
SettingsPage Component
         │
         ▼
usePreferencesStore.updateReciter(reciterId)
         │
         ├──► Update preferences state
         │
         └──► setTimeout(() => syncAudio(), 0)
                  │
                  ▼
              Import audioStore (dynamic)
                  │
                  ▼
              audioStore.syncWithPreferences(preferences)
                  │
                  ├──► Compare current vs new reciter
                  │
                  ├──► If different:
                  │    ├──► Update currentReciter
                  │    ├──► If audio loaded:
                  │    │    ├──► Pause current audio
                  │    │    ├──► Reload with new reciter
                  │    │    └──► Resume playback
                  │    └──► Success feedback (3s)
                  │
                  └──► Error → Display error message

⚠️ Issue: Circular dependency (preferences ⇄ audio)
✅ Solution: Use EventBus to decouple
```

### 7.3 Page Load Flow

```
App Initialization
│
├──► index.tsx
│    ├──► Register Service Worker
│    ├──► Setup Error Boundaries
│    └──► Render App Component
│
├──► App.tsx
│    │
│    ├──► Initialize Stores (Parallel)
│    │    ├──► authStore.initialize()
│    │    ├──► progressStore.initialize()
│    │    ├──► preferencesStore.initialize()
│    │    │    └──► Apply theme (dark mode)
│    │    │    └──► Apply language (ar/en)
│    │    │    └──► Apply direction (rtl/ltr)
│    │    └──► audioStore.initializeAudio()
│    │         └──► Sync with preferences ⚠️ Circular!
│    │
│    ├──► Show SplashScreen (2s minimum)
│    │
│    ├──► Check Authentication
│    │    ├──► If new user → OnboardingPage
│    │    └──► If existing → HomePage
│    │
│    └──► Render Routes with Providers
│         ├──► TranslationProvider
│         ├──► AudioNavigationProvider
│         └──► ErrorBoundary
│
└──► Page Components Load
     └──► Connect to respective stores
```

## 8. Coupling Analysis Matrix

| Store/Service | Dependencies | Dependents | Coupling Score |
|---------------|--------------|------------|----------------|
| authStore | None | App.tsx | LOW (✅) |
| quranStore | quranApi | LessonPage, MushafReader | LOW (✅) |
| progressStore | localStorage | ProgressPage | LOW (✅) |
| audioStore | preferencesStore ⚠️ | AudioPlayer, LessonPage | HIGH (⚠️) |
| preferencesStore | audioStore ⚠️ | SettingsPage, App.tsx | HIGH (⚠️) |
| quranApi | axios, localStorage | quranStore | MEDIUM (✅) |
| securityManager | All security modules | App.tsx | MEDIUM (✅) |

**Legend:**
- LOW (✅) = 0-2 dependencies/dependents
- MEDIUM (✅) = 3-5 dependencies/dependents
- HIGH (⚠️) = 6+ dependencies or circular

## 9. Recommendations Summary

### 9.1 Decoupling Strategies

**1. Introduce EventBus for Store Communication**

```typescript
// eventBus.ts
export const eventBus = new EventEmitter<{
  'preferences:reciter:changed': string
  'preferences:speed:changed': number
  'audio:playback:started': { surah: number, ayah: number }
  'audio:playback:ended': { surah: number, ayah: number }
}>()

// preferencesStore.ts
updateReciter: (reciterId: string) => {
  set(state => ({
    preferences: { ...state.preferences, preferredReciter: reciterId }
  }))
  eventBus.emit('preferences:reciter:changed', reciterId)
}

// audioStore.ts
initializeAudio: () => {
  eventBus.on('preferences:reciter:changed', (reciterId) => {
    // Handle reciter change
  })
}
```

**2. Split Large Stores**

```typescript
// Current: audioStore.ts (763 lines)
// Recommended:

// audioPlayerStore.ts - Playback control
export const useAudioPlayerStore = create(...)

// audioNavigationStore.ts - Navigation logic (already exists!)
export const useAudioNavigationStore = create(...)

// audioSettingsStore.ts - Settings sync
export const useAudioSettingsStore = create(...)
```

**3. Consolidate Analytics Stores**

```typescript
// Current: 5 separate stores
// Recommended: 2 consolidated stores

// metricsStore.ts - Combines analytics + performance monitoring
export const useMetricsStore = create(...)

// optimizationStore.ts - Combines optimization engine + predictive
export const useOptimizationStore = create(...)
```

### 9.2 Architectural Improvements

**1. Implement Dependency Injection**

```typescript
// services/container.ts
export class ServiceContainer {
  private services = new Map()

  register<T>(name: string, service: T) {
    this.services.set(name, service)
  }

  get<T>(name: string): T {
    return this.services.get(name)
  }
}

export const container = new ServiceContainer()
container.register('quranApi', quranApi)
container.register('securityManager', securityManager)
```

**2. Add Backend Aggregator**

```
Client → Backend API → External APIs
                      ├── quran.com
                      ├── everyayah.com
                      └── islamic.network

Benefits:
- Centralized caching
- Rate limiting protection
- API versioning
- Request coalescing
- Offline resilience
```

**3. Implement Code Splitting**

```typescript
// Lazy load heavy components
const AudioPlayer = lazy(() => import('./components/AudioPlayer'))
const WaveformVisualization = lazy(() =>
  import('./components/WaveformVisualization')
)

// Lazy load pages
const LessonPage = lazy(() => import('./pages/LessonPage'))
const MushafReaderPage = lazy(() => import('./pages/MushafReaderPage'))
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-30
**See Also:** architecture-analysis.md
