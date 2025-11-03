# Offline-First Architecture Guide - QuranApp

## Vision Statement

Transform QuranApp into a **fully offline-capable Islamic learning platform** that provides seamless access to Quranic content, Hadiths, and Duas regardless of network connectivity.

---

## 1. Offline-First Principles

### 1.1 Core Principles

1. **Offline by Default**
   - App functions fully without internet connection
   - Network requests are enhancements, not requirements
   - User experience remains consistent offline/online

2. **Progressive Enhancement**
   - Basic features work offline immediately
   - Enhanced features load when network available
   - Graceful degradation of network-dependent features

3. **Data Persistence**
   - Critical Islamic content stored locally
   - User progress saved locally first
   - Background sync for non-critical data

4. **Conflict Resolution**
   - Last-write-wins for simple updates
   - Merge strategies for complex data
   - User notification for unresolvable conflicts

---

## 2. Storage Strategy

### 2.1 Storage Tier System

```
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE TIER SYSTEM                      │
└─────────────────────────────────────────────────────────────┘

Tier 1: Essential Islamic Content (IndexedDB)
├── Complete Quran text (6236 ayahs)
├── Essential Hadiths (100 most authentic)
├── Daily Duas (50 essential supplications)
└── Prayer times calculation tables

Tier 2: User Data (IndexedDB + localStorage)
├── Memorization progress
├── User preferences
├── Learning statistics
└── Bookmarks and favorites

Tier 3: Cache (IndexedDB)
├── API response cache (24h TTL)
├── Translation cache (7d TTL)
├── Audio file references
└── Media metadata

Tier 4: Temporary (Memory)
├── Session state
├── UI state
├── In-progress edits
└── Search results
```

### 2.2 Storage Quotas

```typescript
// Estimated storage requirements
const STORAGE_ESTIMATES = {
  quranText: 2.5,      // MB (Arabic text only)
  translations: 3.0,    // MB (English translation)
  hadiths: 5.0,        // MB (100 essential hadiths)
  duas: 0.5,           // MB (50 duas)
  userProgress: 0.1,   // MB (user data)
  audioRefs: 0.5,      // MB (audio URL references)
  cache: 10.0,         // MB (API response cache)

  TOTAL: 21.6          // MB total required storage
}
```

### 2.3 IndexedDB Schema

```typescript
// src/db/schema.ts
interface QuranAppDB extends DBSchema {
  // Tier 1: Essential Islamic Content
  quran_surahs: {
    key: number // surah number
    value: {
      number: number
      name: string
      englishName: string
      numberOfAyahs: number
      revelationType: 'Meccan' | 'Medinan'
      downloadedAt: number
    }
    indexes: {
      'by-revelation': string
      'by-name': string
    }
  }

  quran_ayahs: {
    key: number // global ayah number
    value: {
      number: number
      text: string
      numberInSurah: number
      surah: number
      juz: number
      page: number
      translation?: string
      transliteration?: string
      downloadedAt: number
    }
    indexes: {
      'by-surah': number
      'by-page': number
      'by-juz': number
    }
  }

  hadiths: {
    key: string // hadith ID
    value: {
      id: string
      collection: string
      arabicText: string
      englishTranslation: string
      narrator: string
      grade: string
      reference: string
      category: string
      downloadedAt: number
    }
    indexes: {
      'by-collection': string
      'by-category': string
      'by-grade': string
    }
  }

  duas: {
    key: string
    value: {
      id: string
      title: string
      arabicText: string
      transliteration: string
      englishTranslation: string
      source: string
      category: string
      downloadedAt: number
    }
    indexes: {
      'by-category': string
      'by-source': string
    }
  }

  // Tier 2: User Data
  user_progress: {
    key: 'current' // Single user for now
    value: {
      userId: string
      memorizedAyahs: number[]
      currentSurah: number
      currentAyah: number
      streak: number
      lastStudyDate: string
      totalXP: number
      syncedAt: number
      needsSync: boolean
    }
  }

  bookmarks: {
    key: string // bookmark ID
    value: {
      id: string
      surah: number
      ayah: number
      note?: string
      createdAt: number
      syncedAt: number
    }
    indexes: {
      'by-surah': number
    }
  }

  // Tier 3: Cache
  api_cache: {
    key: string // cache key
    value: {
      key: string
      data: any
      timestamp: number
      expiry: number
      endpoint: string
    }
    indexes: {
      'by-endpoint': string
      'by-timestamp': number
    }
  }

  // Sync Queue
  sync_queue: {
    key: string // request ID
    value: {
      id: string
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      endpoint: string
      data?: any
      timestamp: number
      retries: number
      status: 'pending' | 'processing' | 'failed'
    }
    indexes: {
      'by-status': string
      'by-timestamp': number
    }
  }
}
```

---

## 3. Offline Data Download Strategy

### 3.1 Initial Setup Wizard

```typescript
// src/utils/offlineSetup.ts
export class OfflineSetupWizard {
  async showSetupWizard(): Promise<void> {
    // 1. Welcome screen
    const userChoice = await this.showWelcomeScreen()

    // 2. Content selection
    const selection = await this.showContentSelection()

    // 3. Download progress
    await this.downloadSelectedContent(selection)

    // 4. Completion
    await this.showCompletionScreen()
  }

  private async showContentSelection(): Promise<{
    quranText: boolean
    translations: string[]
    hadiths: boolean
    duas: boolean
    audioReferences: boolean
  }> {
    return {
      quranText: true, // Always download
      translations: ['131'], // Dr. Mustafa Khattab (default)
      hadiths: true,
      duas: true,
      audioReferences: true
    }
  }

  private async downloadSelectedContent(selection: any): Promise<void> {
    const totalSteps = this.calculateTotalSteps(selection)
    let currentStep = 0

    // Download Quran text
    if (selection.quranText) {
      await this.downloadQuranText((progress) => {
        currentStep = progress
        this.updateProgress(currentStep, totalSteps)
      })
    }

    // Download translations
    for (const translationId of selection.translations) {
      await this.downloadTranslation(translationId, (progress) => {
        currentStep += progress
        this.updateProgress(currentStep, totalSteps)
      })
    }

    // Download hadiths
    if (selection.hadiths) {
      await this.downloadEssentialHadiths((progress) => {
        currentStep += progress
        this.updateProgress(currentStep, totalSteps)
      })
    }

    // Download duas
    if (selection.duas) {
      await this.downloadEssentialDuas((progress) => {
        currentStep += progress
        this.updateProgress(currentStep, totalSteps)
      })
    }
  }

  private async downloadQuranText(onProgress: (progress: number) => void): Promise<void> {
    const db = await openDB<QuranAppDB>('quran-app-db', 1)

    // Download all surahs
    for (let surahNum = 1; surahNum <= 114; surahNum++) {
      try {
        // Fetch surah data from API
        const surahData = await quranApi.getChapter(surahNum)
        const versesData = await quranApi.getChapterVerses(surahNum, { perPage: 300 })

        // Store in IndexedDB
        const tx = db.transaction(['quran_surahs', 'quran_ayahs'], 'readwrite')

        await tx.objectStore('quran_surahs').put({
          ...surahData,
          downloadedAt: Date.now()
        })

        for (const ayah of versesData.verses) {
          await tx.objectStore('quran_ayahs').put({
            ...ayah,
            downloadedAt: Date.now()
          })
        }

        await tx.done

        // Update progress
        onProgress((surahNum / 114) * 100)

        // Rate limiting
        await this.delay(100) // 100ms between requests

      } catch (error) {
        console.error(`Failed to download Surah ${surahNum}:`, error)
        // Continue with next surah
      }
    }
  }

  private async downloadEssentialHadiths(onProgress: (progress: number) => void): Promise<void> {
    // Download top 100 most authentic hadiths
    const essentialHadiths = [
      // Bukhari
      { collection: 'sahih-bukhari', number: 1 },
      { collection: 'sahih-bukhari', number: 6 },
      // ... more hadiths
    ]

    const db = await openDB<QuranAppDB>('quran-app-db', 1)

    for (let i = 0; i < essentialHadiths.length; i++) {
      const { collection, number } = essentialHadiths[i]

      try {
        const hadith = await islamicApi.getHadithByNumber(collection, number)

        await db.put('hadiths', {
          ...hadith,
          downloadedAt: Date.now()
        })

        onProgress((i / essentialHadiths.length) * 100)
        await this.delay(100)

      } catch (error) {
        console.error(`Failed to download hadith ${collection}:${number}:`, error)
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### 3.2 Background Download Service

```typescript
// src/services/backgroundDownload.ts
export class BackgroundDownloadService {
  private isDownloading = false
  private downloadQueue: DownloadTask[] = []

  /**
   * Register background sync for downloading content
   */
  async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in (navigator as any).serviceWorker) {
      const registration = await navigator.serviceWorker.ready

      try {
        await (registration as any).sync.register('download-quran-content')
        console.log('Background sync registered')
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  /**
   * Queue content for background download
   */
  async queueDownload(task: DownloadTask): Promise<void> {
    this.downloadQueue.push(task)
    await this.saveQueue()

    // Start download if not already running
    if (!this.isDownloading && navigator.onLine) {
      await this.processQueue()
    }
  }

  /**
   * Process download queue
   */
  private async processQueue(): Promise<void> {
    if (this.isDownloading || this.downloadQueue.length === 0) return

    this.isDownloading = true

    while (this.downloadQueue.length > 0 && navigator.onLine) {
      const task = this.downloadQueue[0]

      try {
        await this.executeDownload(task)
        this.downloadQueue.shift()
        await this.saveQueue()
      } catch (error) {
        console.error('Download task failed:', error)
        task.retries = (task.retries || 0) + 1

        if (task.retries >= 3) {
          console.error('Download task failed after 3 retries:', task)
          this.downloadQueue.shift()
        }
      }

      // Respect rate limits
      await this.delay(200)
    }

    this.isDownloading = false
  }

  private async executeDownload(task: DownloadTask): Promise<void> {
    switch (task.type) {
      case 'surah':
        await this.downloadSurah(task.surahNumber!)
        break
      case 'translation':
        await this.downloadTranslation(task.translationId!)
        break
      case 'audio':
        await this.downloadAudioReference(task.surahNumber!, task.reciterId!)
        break
    }
  }

  private async downloadSurah(surahNumber: number): Promise<void> {
    const surahData = await quranApi.getChapter(surahNumber)
    const versesData = await quranApi.getChapterVerses(surahNumber)

    const db = await openDB<QuranAppDB>('quran-app-db', 1)
    // ... store in IndexedDB
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async saveQueue(): Promise<void> {
    localStorage.setItem('download-queue', JSON.stringify(this.downloadQueue))
  }

  private async loadQueue(): Promise<void> {
    const saved = localStorage.getItem('download-queue')
    if (saved) {
      this.downloadQueue = JSON.parse(saved)
    }
  }
}

interface DownloadTask {
  id: string
  type: 'surah' | 'translation' | 'audio' | 'hadith' | 'dua'
  surahNumber?: number
  translationId?: string
  reciterId?: string
  retries?: number
}

export const backgroundDownload = new BackgroundDownloadService()
```

---

## 4. Sync Strategy

### 4.1 Sync Queue System

```typescript
// src/services/syncService.ts
export class SyncService {
  private db: Promise<IDBPDatabase<QuranAppDB>>
  private isSyncing = false

  constructor() {
    this.db = openDB<QuranAppDB>('quran-app-db', 1)
    this.setupSyncListeners()
  }

  /**
   * Setup sync event listeners
   */
  private setupSyncListeners(): void {
    // Sync when online
    window.addEventListener('online', () => this.sync())

    // Sync on visibility change (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.sync()
      }
    })

    // Periodic sync (every 5 minutes)
    setInterval(() => {
      if (navigator.onLine) {
        this.sync()
      }
    }, 5 * 60 * 1000)
  }

  /**
   * Main sync function
   */
  async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return

    this.isSyncing = true

    try {
      // 1. Upload local changes
      await this.uploadLocalChanges()

      // 2. Download remote changes
      await this.downloadRemoteChanges()

      // 3. Resolve conflicts
      await this.resolveConflicts()

      console.log('Sync completed successfully')

    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Upload local changes to server
   */
  private async uploadLocalChanges(): Promise<void> {
    const db = await this.db
    const queue = await db.getAllFromIndex('sync_queue', 'by-status', 'pending')

    for (const item of queue) {
      try {
        // Execute API request
        await axios({
          method: item.method,
          url: item.endpoint,
          data: item.data
        })

        // Remove from queue on success
        await db.delete('sync_queue', item.id)

      } catch (error) {
        // Update retry count
        await db.put('sync_queue', {
          ...item,
          retries: item.retries + 1,
          status: item.retries >= 2 ? 'failed' : 'pending'
        })
      }
    }
  }

  /**
   * Download remote changes
   */
  private async downloadRemoteChanges(): Promise<void> {
    const db = await this.db
    const userProgress = await db.get('user_progress', 'current')

    if (!userProgress) return

    // Check if server has newer data
    const response = await axios.get('/api/user/progress', {
      params: { lastSyncedAt: userProgress.syncedAt }
    })

    if (response.data.hasChanges) {
      // Merge server changes with local data
      await this.mergeRemoteData(response.data.changes)
    }
  }

  /**
   * Resolve sync conflicts
   */
  private async resolveConflicts(): Promise<void> {
    // Implement conflict resolution strategies
    // - Last-write-wins for simple data
    // - Merge for complex data
    // - User prompt for critical conflicts
  }

  /**
   * Queue action for sync
   */
  async queueAction(method: string, endpoint: string, data?: any): Promise<void> {
    const db = await this.db

    const action = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method: method as any,
      endpoint,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending' as const
    }

    await db.add('sync_queue', action)

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.sync()
    }
  }
}

export const syncService = new SyncService()
```

---

## 5. Progressive Web App (PWA) Configuration

### 5.1 Service Worker Strategy

```javascript
// public/sw.js (Service Worker)
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST)

// API responses - Network First with cache fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
)

// Quran text - Cache First (rarely changes)
registerRoute(
  ({ url }) => url.pathname.includes('/verses/') || url.pathname.includes('/chapters/'),
  new CacheFirst({
    cacheName: 'quran-content',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      })
    ]
  })
)

// Audio files - Cache First
registerRoute(
  ({ url }) => url.hostname === 'everyayah.com',
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
)

// Images and fonts - Stale While Revalidate
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
)

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'download-quran-content') {
    event.waitUntil(downloadQuranContent())
  }

  if (event.tag === 'sync-user-progress') {
    event.waitUntil(syncUserProgress())
  }
})

async function downloadQuranContent() {
  // Download queued content in background
  const queue = await getDownloadQueue()

  for (const task of queue) {
    try {
      await executeDownloadTask(task)
    } catch (error) {
      console.error('Background download failed:', error)
    }
  }
}

async function syncUserProgress() {
  // Sync user progress with server
  const progress = await getUserProgress()

  try {
    await fetch('/api/user/progress', {
      method: 'POST',
      body: JSON.stringify(progress)
    })
  } catch (error) {
    console.error('Progress sync failed:', error)
  }
}
```

---

## 6. User Experience Considerations

### 6.1 Offline Indicators

```typescript
// src/components/OfflineIndicator.tsx
export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [offlineData, setOfflineData] = useState<OfflineStatus | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      // Trigger sync
      syncService.sync()
    }

    const handleOffline = () => {
      setIsOffline(true)
      loadOfflineStatus()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOfflineStatus = async () => {
    const status = await getOfflineContentStatus()
    setOfflineData(status)
  }

  if (!isOffline) return null

  return (
    <div className="offline-banner">
      <div className="flex items-center gap-2">
        <WifiOffIcon className="w-5 h-5" />
        <span>You are offline</span>
      </div>

      {offlineData && (
        <div className="offline-stats">
          <p>Available offline:</p>
          <ul>
            <li>{offlineData.surahs}/114 Surahs</li>
            <li>{offlineData.hadiths} Hadiths</li>
            <li>{offlineData.duas} Duas</li>
          </ul>
        </div>
      )}
    </div>
  )
}
```

### 6.2 Download Progress UI

```typescript
// src/components/DownloadProgress.tsx
export function DownloadProgress() {
  const [progress, setProgress] = useState<DownloadProgress>({
    current: 0,
    total: 0,
    currentItem: '',
    percentage: 0
  })

  return (
    <div className="download-progress">
      <h3>Downloading Islamic Content</h3>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <p className="progress-text">
        {progress.currentItem} ({progress.current}/{progress.total})
      </p>

      <p className="progress-percentage">{progress.percentage.toFixed(1)}%</p>
    </div>
  )
}
```

---

## 7. Implementation Roadmap

### Week 1-2: Foundation
- [ ] Set up IndexedDB schema
- [ ] Create offline storage service
- [ ] Implement download wizard UI
- [ ] Add basic offline detection

### Week 3-4: Data Download
- [ ] Implement Quran text download
- [ ] Add translation download
- [ ] Create hadith download system
- [ ] Build duas download system

### Week 5-6: Sync & Queue
- [ ] Implement sync service
- [ ] Create offline queue system
- [ ] Add conflict resolution
- [ ] Build background sync

### Week 7-8: Testing & Polish
- [ ] Test offline scenarios
- [ ] Optimize storage usage
- [ ] Add user feedback
- [ ] Performance testing

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Status**: Ready for Implementation
