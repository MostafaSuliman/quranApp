# QuranApp - Refactoring Roadmap

**Priority:** Critical Fixes → Architecture Cleanup → Performance Optimization
**Timeline:** 3 Months (52h critical + 40h improvements)

---

## 🔴 Critical Fixes (Sprint 1 - 2 Weeks)

### Fix #1: Decouple Circular Dependencies (16 hours)

#### Current State ❌
```typescript
┌──────────────────┐
│ preferencesStore │
│                  │
│ updateReciter()  │───┐
└──────────────────┘   │
                       │ dynamic import
                       │ audioStore.syncWithPreferences()
                       ▼
                ┌──────────────────┐
                │   audioStore     │
                │                  │
                │ initializeAudio()│───┐
                └──────────────────┘   │
                                       │ dynamic import
                                       │ preferencesStore.getState()
                                       ▼
                        ⚠️ CIRCULAR DEPENDENCY!
```

**Problems:**
- Race conditions during initialization
- Cannot test stores in isolation
- Unclear initialization order
- Potential memory leaks

#### Target State ✅
```typescript
┌──────────────────┐
│   EventBus       │
│   (Mediator)     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│prefs    │ │audio    │
│Store    │ │Store    │
│         │ │         │
│emit:    │ │listen:  │
│'reciter │ │'reciter │
│changed' │ │changed' │
└─────────┘ └─────────┘
```

**Implementation Steps:**

**Step 1: Create EventBus (2 hours)**
```typescript
// utils/eventBus.ts
import { EventEmitter } from 'events'

export type AppEvents = {
  'preferences:reciter:changed': string
  'preferences:speed:changed': number
  'preferences:language:changed': 'ar' | 'en'
  'audio:playback:started': { surah: number, ayah: number }
  'audio:playback:ended': { surah: number, ayah: number }
  'audio:error': string
}

class TypedEventBus extends EventEmitter {
  emit<K extends keyof AppEvents>(
    event: K,
    payload: AppEvents[K]
  ): boolean {
    return super.emit(event, payload)
  }

  on<K extends keyof AppEvents>(
    event: K,
    listener: (payload: AppEvents[K]) => void
  ): this {
    return super.on(event, listener)
  }

  off<K extends keyof AppEvents>(
    event: K,
    listener: (payload: AppEvents[K]) => void
  ): this {
    return super.off(event, listener)
  }
}

export const eventBus = new TypedEventBus()
```

**Step 2: Refactor Preferences Store (4 hours)**
```typescript
// stores/preferencesStore.ts
import { eventBus } from '../utils/eventBus'

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // ... state ...

      updateReciter: (reciterId: string) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            preferredReciter: reciterId
          }
        }))

        // ✅ Emit event instead of direct import
        eventBus.emit('preferences:reciter:changed', reciterId)
      },

      updatePlaybackSpeed: (speed: number) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            playbackSpeed: speed
          }
        }))

        // ✅ Emit event
        eventBus.emit('preferences:speed:changed', speed)
      },

      // Remove syncAudio imports completely ✅
    }),
    { name: 'preferences-store', ... }
  )
)
```

**Step 3: Refactor Audio Store (8 hours)**
```typescript
// stores/audioStore.ts
import { eventBus } from '../utils/eventBus'

export const useAudioStore = create<AudioPlayerState>()(
  persist(
    (set, get) => ({
      // ... state ...

      initializeAudio: () => {
        console.log('🔄 Initializing audio store')

        // ✅ Listen to preference changes
        eventBus.on('preferences:reciter:changed', (reciterId) => {
          const state = get()
          const reciter = RECITERS[reciterId]

          if (reciter) {
            set({ currentReciter: reciter })

            // Reload if audio is currently loaded
            if (state.currentSurahNumber && state.currentAyahNumber) {
              state.loadAyahAudio(
                state.currentSurahNumber,
                state.currentAyahNumber,
                reciter
              )
            }
          }
        })

        eventBus.on('preferences:speed:changed', (speed) => {
          const state = get()
          set({ playbackSpeed: speed })

          if (state.currentAudio) {
            state.currentAudio.playbackRate = speed
          }
        })

        // Remove preferencesStore import completely ✅
      },

      cleanup: () => {
        // Remove event listeners
        eventBus.off('preferences:reciter:changed')
        eventBus.off('preferences:speed:changed')

        // ... cleanup audio ...
      }
    }),
    { name: 'audio-store', ... }
  )
)
```

**Step 4: Add Tests (2 hours)**
```typescript
// stores/__tests__/eventBus.test.ts
describe('EventBus Decoupling', () => {
  it('should update audio reciter when preference changes', async () => {
    const { result: prefResult } = renderHook(() => usePreferencesStore())
    const { result: audioResult } = renderHook(() => useAudioStore())

    // Change reciter in preferences
    act(() => {
      prefResult.current.updateReciter('2')
    })

    // Wait for event propagation
    await waitFor(() => {
      expect(audioResult.current.currentReciter?.id).toBe('2')
    })
  })

  it('should not cause circular dependency errors', () => {
    // Initialize stores
    const prefsStore = usePreferencesStore.getState()
    const audioStore = useAudioStore.getState()

    expect(() => {
      prefsStore.initialize()
      audioStore.initializeAudio()
    }).not.toThrow()
  })
})
```

**Validation Checklist:**
- [ ] No more dynamic imports between stores
- [ ] Stores can be initialized independently
- [ ] Settings changes propagate correctly
- [ ] Tests pass in isolation
- [ ] No race conditions during app startup

---

### Fix #2: Split Monolithic Audio Store (24 hours)

#### Current State ❌
```typescript
// audioStore.ts (763 lines) 🔴
- Playback control (play, pause, stop, seek)
- Volume & speed management
- Repeat modes
- Navigation (next, previous)
- Settings synchronization
- Waveform data
- Keyboard shortcuts
- Event handlers
- Error handling
- Initialization logic
```

#### Target State ✅
```typescript
// Split into 3 focused stores:

┌─────────────────────┐
│ audioPlayerStore.ts │  (Playback control)
│ - play/pause/stop   │
│ - volume            │
│ - playback speed    │
│ - repeat modes      │
│ - seek/time update  │
│ ~250 lines          │
└─────────────────────┘

┌─────────────────────┐
│audioNavigationStore │  (Already exists!)
│ - next/previous     │
│ - chapter/verse nav │
│ - auto-play logic   │
│ - modal control     │
└─────────────────────┘

┌─────────────────────┐
│audioSettingsStore.ts│  (Settings & sync)
│ - reciter selection │
│ - settings sync     │
│ - keyboard shortcuts│
│ - waveform config   │
│ ~200 lines          │
└─────────────────────┘
```

**Implementation Steps:**

**Step 1: Create Audio Player Store (8 hours)**
```typescript
// stores/audioPlayerStore.ts
export interface AudioPlayerState {
  // Playback state
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  progress: number
  volume: number
  playbackSpeed: PlaybackSpeed

  // Audio element
  currentAudio: HTMLAudioElement | null
  audioUrl: string | null

  // Repeat
  repeatMode: RepeatMode
  currentRepetition: number

  // Actions
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
  setRepeatMode: (mode: RepeatMode) => void

  // Internal
  handleTimeUpdate: () => void
  handleAudioEnded: () => void
  handleMetadataLoaded: () => void
  handleAudioError: (event: any) => void
}
```

**Step 2: Create Audio Settings Store (6 hours)**
```typescript
// stores/audioSettingsStore.ts
export interface AudioSettingsState {
  // Settings
  currentReciter: Reciter | null

  // Waveform
  waveformReady: boolean
  waveformData: number[] | null

  // Keyboard shortcuts
  keyboardShortcutsEnabled: boolean

  // Actions
  loadReciter: (reciterId: string) => void
  setWaveformData: (data: number[]) => void
  handleKeyPress: (key: string) => void
  toggleKeyboardShortcuts: () => void

  // Sync with preferences (via EventBus)
  syncWithPreferences: () => void
}
```

**Step 3: Refactor Audio Components (8 hours)**
```typescript
// components/AudioPlayer.tsx
import { useAudioPlayerStore } from '../stores/audioPlayerStore'
import { useAudioNavigationStore } from '../stores/audioNavigationStore'
import { useAudioSettingsStore } from '../stores/audioSettingsStore'

export function AudioPlayer() {
  // ✅ Use multiple focused stores
  const {
    isPlaying,
    play,
    pause,
    currentTime,
    duration,
    volume,
    setVolume
  } = useAudioPlayerStore()

  const {
    currentSurah,
    currentAyah,
    playNext,
    playPrevious
  } = useAudioNavigationStore()

  const {
    currentReciter,
    waveformData
  } = useAudioSettingsStore()

  // ... component logic ...
}
```

**Step 4: Add Integration Tests (2 hours)**
```typescript
// stores/__tests__/audioStores.integration.test.ts
describe('Audio Stores Integration', () => {
  it('should coordinate playback across stores', async () => {
    const player = useAudioPlayerStore.getState()
    const navigation = useAudioNavigationStore.getState()
    const settings = useAudioSettingsStore.getState()

    // Load reciter
    settings.loadReciter('1')

    // Load verse
    await navigation.loadVerse(1, 1)

    // Play audio
    await player.play()

    expect(player.isPlaying).toBe(true)
    expect(navigation.currentSurah).toBe(1)
    expect(settings.currentReciter?.id).toBe('1')
  })
})
```

**Validation Checklist:**
- [ ] Audio playback works correctly
- [ ] Navigation between verses works
- [ ] Settings changes apply immediately
- [ ] Keyboard shortcuts functional
- [ ] All existing tests pass
- [ ] New focused tests added

---

### Fix #3: Implement Code Splitting (12 hours)

#### Current State ❌
```typescript
// All routes loaded upfront
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import MushafReaderPage from './pages/MushafReaderPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'

// Heavy components loaded upfront
import AudioPlayer from './components/AudioPlayer'
import WaveformVisualization from './components/WaveformVisualization'

// Result: ~2-3MB initial bundle 🔴
```

**Problems:**
- Slow initial load (>5s on 3G)
- Wasted bandwidth for unused features
- Poor mobile experience

#### Target State ✅
```typescript
// Lazy load routes
const HomePage = lazy(() => import('./pages/HomePage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const MushafReaderPage = lazy(() => import('./pages/MushafReaderPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Lazy load heavy components
const AudioPlayer = lazy(() => import('./components/AudioPlayer'))
const WaveformVisualization = lazy(() =>
  import('./components/WaveformVisualization')
)

// Result: <500KB initial bundle ✅
```

**Expected Performance:**
- Initial load: 5s → 2s on 3G (-60%)
- Time to interactive: 7s → 3s (-57%)
- Lighthouse score: 65 → 85 (+31%)

**Implementation Steps:**

**Step 1: Route-Level Code Splitting (4 hours)**
```typescript
// App.tsx
import { lazy, Suspense } from 'react'
import LoadingScreen from './components/LoadingScreen'

// ✅ Lazy load all pages
const HomePage = lazy(() => import('./pages/HomePage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const MushafReaderPage = lazy(() => import('./pages/MushafReaderPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/mushaf" element={<MushafReaderPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  )
}
```

**Step 2: Component-Level Code Splitting (4 hours)**
```typescript
// pages/LessonPage.tsx
import { lazy, Suspense } from 'react'

// ✅ Lazy load heavy components
const AudioPlayer = lazy(() => import('../components/AudioPlayer'))
const WaveformVisualization = lazy(() =>
  import('../components/WaveformVisualization')
)

function LessonPage() {
  const [showWaveform, setShowWaveform] = useState(false)

  return (
    <div>
      {/* Core content loads immediately */}
      <QuranDisplay />

      {/* Audio player lazy loaded */}
      <Suspense fallback={<AudioPlayerSkeleton />}>
        <AudioPlayer />
      </Suspense>

      {/* 3D waveform only loaded on demand */}
      {showWaveform && (
        <Suspense fallback={<WaveformSkeleton />}>
          <WaveformVisualization />
        </Suspense>
      )}
    </div>
  )
}
```

**Step 3: Vendor Code Splitting (2 hours)**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': ['@headlessui/react', 'framer-motion'],

          // Heavy 3D libraries (lazy loaded)
          '3d-vendor': ['three', '@react-three/fiber', '@react-three/drei'],

          // Audio libraries
          'audio-vendor': ['wavesurfer.js'],
        }
      }
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 500 // KB
  }
})
```

**Step 4: Performance Testing (2 hours)**
```bash
# Bundle size analysis
npm run build
npx vite-bundle-visualizer

# Lighthouse performance test
npm run build
npm run preview
lighthouse http://localhost:4173 --view

# Target metrics:
# - First Contentful Paint: <1.8s
# - Time to Interactive: <3.8s
# - Speed Index: <3.4s
# - Largest Contentful Paint: <2.5s
```

**Validation Checklist:**
- [ ] Initial bundle <500KB
- [ ] Three.js loaded only when needed
- [ ] Routes load on navigation
- [ ] Loading states implemented
- [ ] Lighthouse score >80
- [ ] Mobile performance improved

---

## ⚠️ Phase 2: Architecture Cleanup (Weeks 3-4)

### Improvement #1: Consolidate Analytics Stores (20 hours)

#### Current State ❌
```
analyticsStore.ts (tracking)
performanceMonitorStore.ts (metrics)
optimizationEngineStore.ts (optimization)
predictiveEnhancementStore.ts (prediction)
enhancedPredictiveStore.ts (enhanced prediction)

Total: 5 stores, ~2000 lines 🔴
```

#### Target State ✅
```
metricsStore.ts (analytics + performance)
optimizationStore.ts (optimization + prediction)

Total: 2 stores, ~1000 lines ✅
```

**Benefits:**
- -60% code reduction
- Simpler mental model
- Easier maintenance
- Better testability

---

### Improvement #2: Runtime Type Validation (8 hours)

```typescript
// utils/schemas.ts
import { z } from 'zod'

export const VerseSchema = z.object({
  text_uthmani: z.string(),
  verse_number: z.number().int().positive(),
  chapter_id: z.number().int().min(1).max(114),
  juz_number: z.number().int().min(1).max(30),
  // ...
})

export const ChapterSchema = z.object({
  id: z.number().int().min(1).max(114),
  name_arabic: z.string(),
  verses_count: z.number().int().positive(),
  revelation_place: z.enum(['makkah', 'madinah']),
  // ...
})

// utils/quranApi.ts
async getChapterVerses(chapterNumber: number) {
  const response = await this.api.get(`/verses/by_chapter/${chapterNumber}`)

  // ✅ Validate at runtime
  const verses = VerseSchema.array().parse(response.data.verses)

  return verses
}
```

**Benefits:**
- API schema change detection
- Graceful error handling
- Better error messages
- Type safety at runtime

---

### Improvement #3: IndexedDB Migration (12 hours)

```typescript
// utils/persistentCache.ts
import { openDB, IDBPDatabase } from 'idb'

class PersistentCache {
  private db: IDBPDatabase

  async init() {
    this.db = await openDB('quran-cache', 1, {
      upgrade(db) {
        db.createObjectStore('api-cache', { keyPath: 'key' })
      }
    })
  }

  async set(key: string, value: any, ttl: number = 86400000) {
    await this.db.put('api-cache', {
      key,
      value,
      timestamp: Date.now(),
      ttl
    })
  }

  async get(key: string) {
    const record = await this.db.get('api-cache', key)

    if (!record) return null

    // Check TTL
    if (Date.now() - record.timestamp > record.ttl) {
      await this.db.delete('api-cache', key)
      return null
    }

    return record.value
  }
}
```

**Benefits:**
- Persistent cache across sessions
- 5MB+ storage (vs 5-10MB localStorage limit)
- Better performance
- Offline experience

---

## 📊 Success Metrics

### Phase 1: Critical Fixes

**Before:**
- Initial bundle: 2-3MB
- Load time (3G): >5s
- Settings bugs: ~5/month
- Store count: 13
- Circular dependencies: 2

**After (Target):**
- Initial bundle: <500KB ✅
- Load time (3G): <2s ✅
- Settings bugs: <1/month ✅
- Store count: 11 ✅
- Circular dependencies: 0 ✅

### Phase 2: Architecture Cleanup

**Before:**
- Analytics stores: 5
- Runtime validation: No
- Cache persistence: Memory only
- Technical debt: 98h

**After (Target):**
- Analytics stores: 2 ✅
- Runtime validation: Yes ✅
- Cache persistence: IndexedDB ✅
- Technical debt: <50h ✅

---

## 🔄 Migration Strategy

### Week 1: Preparation
- [ ] Review architecture documents
- [ ] Set up feature flags for gradual rollout
- [ ] Create comprehensive test suite
- [ ] Backup current codebase

### Week 2: Critical Fix #1 (EventBus)
- [ ] Day 1-2: Implement EventBus
- [ ] Day 3-4: Refactor Preferences Store
- [ ] Day 5-6: Refactor Audio Store
- [ ] Day 7: Testing & validation

### Week 3: Critical Fixes #2 & #3
- [ ] Day 1-3: Split Audio Store
- [ ] Day 4-5: Implement Code Splitting
- [ ] Day 6-7: Testing & performance validation

### Week 4: Deploy & Monitor
- [ ] Day 1-2: Staging deployment
- [ ] Day 3-4: Production deployment (gradual rollout)
- [ ] Day 5-7: Monitor metrics, fix issues

---

## 🚨 Risk Mitigation

### Risk #1: Breaking Changes
**Mitigation:**
- ✅ Feature flags for gradual rollout
- ✅ Comprehensive test coverage
- ✅ Staged deployment (10% → 50% → 100%)
- ✅ Rollback plan ready

### Risk #2: User Experience Degradation
**Mitigation:**
- ✅ Loading states for lazy-loaded components
- ✅ Prefetch critical routes
- ✅ Monitor Core Web Vitals
- ✅ A/B testing for major changes

### Risk #3: Timeline Slippage
**Mitigation:**
- ✅ Buffer time built in (52h → 60h estimate)
- ✅ Prioritized fixes (can deploy incrementally)
- ✅ Clear success criteria
- ✅ Regular check-ins

---

**Questions?**
Refer to:
- `architecture-analysis.md` - Technical details
- `dependency-graph.md` - Visual diagrams
- `architecture-executive-summary.md` - Business context

**Last Updated:** 2025-10-30
**Status:** Ready for Implementation
