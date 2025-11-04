# QuranApp - PWA & Mobile Optimization Specification

## Document Information

| Field | Value |
|-------|-------|
| **Document Type** | Technical Specification |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Last Updated** | November 2025 |
| **Owner** | Mobile Development Team |
| **Related Documents** | MVP.md, PRD.md |

## Table of Contents

1. [PWA Manifest Specifications](#pwa-manifest-specifications)
2. [Service Worker Strategy](#service-worker-strategy)
3. [Offline Functionality](#offline-functionality)
4. [Mobile-First Responsive Design](#mobile-first-responsive-design)
5. [Touch Gestures & Interactions](#touch-gestures--interactions)
6. [Platform-Specific Optimizations](#platform-specific-optimizations)
7. [App Icons & Splash Screens](#app-icons--splash-screens)
8. [Push Notifications](#push-notifications)
9. [Performance Optimization](#performance-optimization)
10. [Testing & Validation](#testing--validation)

---

## PWA Manifest Specifications

### 1.1 Web App Manifest (manifest.json)

```json
{
  "name": "QuranApp - Read, Memorize, Understand",
  "short_name": "QuranApp",
  "description": "Authentic Quran reading and memorization application with offline support",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1B5E20",
  "background_color": "#FAFAFA",
  "dir": "rtl",
  "lang": "ar",
  "categories": ["education", "books", "lifestyle"],
  "iarc_rating_id": "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7",

  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],

  "screenshots": [
    {
      "src": "/screenshots/mushaf-view-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mushaf Reading View"
    },
    {
      "src": "/screenshots/audio-player-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Audio Recitation Player"
    },
    {
      "src": "/screenshots/memorization-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Memorization Tools"
    },
    {
      "src": "/screenshots/mushaf-view-tablet.png",
      "sizes": "1024x1366",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Mushaf View - Tablet"
    }
  ],

  "shortcuts": [
    {
      "name": "Last Read Position",
      "short_name": "Continue",
      "description": "Resume from last reading position",
      "url": "/continue",
      "icons": [
        {
          "src": "/icons/shortcut-continue.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Today's Memorization",
      "short_name": "Memorize",
      "description": "Start daily memorization practice",
      "url": "/memorize",
      "icons": [
        {
          "src": "/icons/shortcut-memorize.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Search Quran",
      "short_name": "Search",
      "description": "Search verses and translations",
      "url": "/search",
      "icons": [
        {
          "src": "/icons/shortcut-search.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ],

  "prefer_related_applications": false,
  "related_applications": [],

  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### 1.2 HTML Head Configuration

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">

  <!-- PWA Meta Tags -->
  <meta name="application-name" content="QuranApp">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="QuranApp">

  <!-- Theme Colors -->
  <meta name="theme-color" content="#1B5E20" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#4CAF50" media="(prefers-color-scheme: dark)">
  <meta name="msapplication-TileColor" content="#1B5E20">
  <meta name="msapplication-navbutton-color" content="#1B5E20">

  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json">

  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png">
  <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png">

  <!-- Apple Splash Screens -->
  <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png">
  <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png">
  <link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png">
  <link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png">
  <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png">

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

  <!-- Description -->
  <meta name="description" content="Authentic Quran reading, memorization, and understanding application with offline support. Read with professional reciters, track memorization progress, and access translations.">

  <title>QuranApp - Read, Memorize, Understand</title>
</head>
</html>
```

---

## Service Worker Strategy

### 2.1 Workbox Configuration

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // App Shell - Cache First
          {
            urlPattern: /^https:\/\/quranapp\.com\/?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-shell',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },

          // Quran Text API - Network First with fallback
          {
            urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/(ayah|surah)\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'quran-text-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 700, // All verses + Surahs
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          // Audio Files - Cache First
          {
            urlPattern: /^https:\/\/cdn\.alquran\.cloud\/media\/audio\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-audio',
              rangeRequests: true,
              expiration: {
                maxEntries: 300, // Approximately 5 Surahs
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200, 206] // 206 for range requests
              },
              plugins: [
                {
                  cacheWillUpdate: async ({ response }) => {
                    // Only cache successful audio downloads
                    if (response.status === 200 || response.status === 206) {
                      return response;
                    }
                    return null;
                  }
                }
              ]
            }
          },

          // Translation API - Stale While Revalidate
          {
            urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/.*\/translation\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'quran-translations',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          },

          // Tafsir API - Stale While Revalidate
          {
            urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/.*\/tafsir\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'quran-tafsir',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 14 // 2 weeks
              }
            }
          },

          // Static Assets - Cache First
          {
            urlPattern: /\.(?:woff2?|eot|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },

          // Images - Cache First
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],

        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],

        // Cleanup old caches
        cleanupOutdatedCaches: true,

        // Background sync for failed requests
        backgroundSync: {
          name: 'quran-app-queue',
          options: {
            maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
          }
        }
      },

      manifest: false, // Use custom manifest.json

      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
});
```

### 2.2 Custom Service Worker Features

```typescript
// src/service-worker-custom.ts

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { QueueStore } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Background Sync for Memorization Progress
const memorizationQueue = new BackgroundSyncPlugin('memorization-sync', {
  maxRetentionTime: 24 * 60, // 24 hours
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Synced memorization progress:', entry.request.url);
      } catch (error) {
        console.error('Failed to sync:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

// Audio Download Queue
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'DOWNLOAD_AUDIO') {
    const { surah, reciter, verses } = event.data;

    // Queue audio downloads
    const downloads = verses.map(verse =>
      fetch(`https://cdn.alquran.cloud/media/audio/${reciter}/${verse}.mp3`)
        .then(response => response.blob())
        .then(blob => {
          // Store in cache
          return caches.open('quran-audio').then(cache => {
            return cache.put(
              `https://cdn.alquran.cloud/media/audio/${reciter}/${verse}.mp3`,
              new Response(blob)
            );
          });
        })
    );

    Promise.all(downloads)
      .then(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'AUDIO_DOWNLOAD_COMPLETE',
              surah,
              reciter
            });
          });
        });
      })
      .catch(error => {
        console.error('Audio download failed:', error);
      });
  }
});

// Offline Analytics Queue
const analyticsQueue = new QueueStore('analytics-queue');

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/analytics')) {
    if (!navigator.onLine) {
      event.respondWith(
        analyticsQueue.pushRequest({ request: event.request })
          .then(() => new Response('', { status: 200 }))
      );
    }
  }
});

// Push Notification Handling
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options: NotificationOptions = {
    body: data.body || 'Time for Quran reading',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'quran-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open QuranApp'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'QuranApp', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Focus existing window if available
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Cache size management
const CACHE_SIZE_LIMIT = 500 * 1024 * 1024; // 500MB

async function manageCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  if (totalSize > CACHE_SIZE_LIMIT) {
    // Notify client about storage limit
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'STORAGE_LIMIT_REACHED',
          totalSize,
          limit: CACHE_SIZE_LIMIT
        });
      });
    });
  }
}

// Run cache management every hour
setInterval(manageCacheSize, 60 * 60 * 1000);
```

---

## Offline Functionality

### 3.1 Offline Strategy Implementation

```typescript
// src/services/offlineManager.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QuranDB extends DBSchema {
  'quran-text': {
    key: string;
    value: {
      surah: number;
      verse: number;
      text: string;
      page: number;
      juz: number;
      timestamp: number;
    };
  };
  'translations': {
    key: string;
    value: {
      surah: number;
      verse: number;
      language: string;
      translator: string;
      text: string;
      timestamp: number;
    };
  };
  'audio-metadata': {
    key: string;
    value: {
      reciter: string;
      surah: number;
      verse: number;
      cached: boolean;
      duration: number;
      size: number;
      timestamp: number;
    };
  };
  'user-progress': {
    key: string;
    value: {
      type: 'bookmark' | 'memorization' | 'lastRead';
      surah: number;
      verse: number;
      page: number;
      data: any;
      timestamp: number;
    };
  };
}

class OfflineManager {
  private db: IDBPDatabase<QuranDB> | null = null;
  private dbName = 'quran-app-db';
  private dbVersion = 1;

  async init(): Promise<void> {
    this.db = await openDB<QuranDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('quran-text')) {
          const quranStore = db.createObjectStore('quran-text', { keyPath: 'key' });
          quranStore.createIndex('by-surah', 'surah');
          quranStore.createIndex('by-page', 'page');
          quranStore.createIndex('by-juz', 'juz');
        }

        if (!db.objectStoreNames.contains('translations')) {
          const translationStore = db.createObjectStore('translations', { keyPath: 'key' });
          translationStore.createIndex('by-surah', 'surah');
          translationStore.createIndex('by-language', 'language');
        }

        if (!db.objectStoreNames.contains('audio-metadata')) {
          const audioStore = db.createObjectStore('audio-metadata', { keyPath: 'key' });
          audioStore.createIndex('by-reciter', 'reciter');
          audioStore.createIndex('by-surah', 'surah');
          audioStore.createIndex('by-cached', 'cached');
        }

        if (!db.objectStoreNames.contains('user-progress')) {
          const progressStore = db.createObjectStore('user-progress', { keyPath: 'key' });
          progressStore.createIndex('by-type', 'type');
          progressStore.createIndex('by-timestamp', 'timestamp');
        }
      }
    });
  }

  // Cache complete Quran text
  async cacheQuranText(verses: any[]): Promise<void> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction('quran-text', 'readwrite');

    await Promise.all(
      verses.map(verse =>
        tx.store.put({
          key: `${verse.surah}:${verse.verse}`,
          surah: verse.surah,
          verse: verse.verse,
          text: verse.text,
          page: verse.page,
          juz: verse.juz,
          timestamp: Date.now()
        })
      )
    );

    await tx.done;
  }

  // Get verse from cache
  async getVerse(surah: number, verse: number): Promise<any> {
    if (!this.db) await this.init();
    return await this.db!.get('quran-text', `${surah}:${verse}`);
  }

  // Get entire Surah from cache
  async getSurah(surah: number): Promise<any[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('quran-text', 'readonly');
    const index = tx.store.index('by-surah');
    return await index.getAll(surah);
  }

  // Get page content from cache
  async getPage(pageNumber: number): Promise<any[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('quran-text', 'readonly');
    const index = tx.store.index('by-page');
    return await index.getAll(pageNumber);
  }

  // Cache translation
  async cacheTranslation(
    surah: number,
    verse: number,
    language: string,
    translator: string,
    text: string
  ): Promise<void> {
    if (!this.db) await this.init();

    await this.db!.put('translations', {
      key: `${surah}:${verse}:${language}:${translator}`,
      surah,
      verse,
      language,
      translator,
      text,
      timestamp: Date.now()
    });
  }

  // Get translation from cache
  async getTranslation(
    surah: number,
    verse: number,
    language: string,
    translator: string
  ): Promise<any> {
    if (!this.db) await this.init();
    return await this.db!.get('translations', `${surah}:${verse}:${language}:${translator}`);
  }

  // Mark audio as cached
  async markAudioCached(
    reciter: string,
    surah: number,
    verse: number,
    duration: number,
    size: number
  ): Promise<void> {
    if (!this.db) await this.init();

    await this.db!.put('audio-metadata', {
      key: `${reciter}:${surah}:${verse}`,
      reciter,
      surah,
      verse,
      cached: true,
      duration,
      size,
      timestamp: Date.now()
    });
  }

  // Check if audio is cached
  async isAudioCached(reciter: string, surah: number, verse: number): Promise<boolean> {
    if (!this.db) await this.init();
    const metadata = await this.db!.get('audio-metadata', `${reciter}:${surah}:${verse}`);
    return metadata?.cached ?? false;
  }

  // Get cached audio metadata for Surah
  async getCachedAudioMetadata(reciter: string, surah: number): Promise<any[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('audio-metadata', 'readonly');
    const index = tx.store.index('by-surah');
    const all = await index.getAll(surah);
    return all.filter(item => item.reciter === reciter && item.cached);
  }

  // Save user progress
  async saveProgress(
    type: 'bookmark' | 'memorization' | 'lastRead',
    surah: number,
    verse: number,
    page: number,
    data: any = {}
  ): Promise<void> {
    if (!this.db) await this.init();

    await this.db!.put('user-progress', {
      key: `${type}:${surah}:${verse}`,
      type,
      surah,
      verse,
      page,
      data,
      timestamp: Date.now()
    });
  }

  // Get user progress
  async getProgress(type: 'bookmark' | 'memorization' | 'lastRead'): Promise<any[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('user-progress', 'readonly');
    const index = tx.store.index('by-type');
    return await index.getAll(type);
  }

  // Get storage usage
  async getStorageUsage(): Promise<{
    total: number;
    quranText: number;
    translations: number;
    audio: number;
    userProgress: number;
  }> {
    if (!this.db) await this.init();

    const stores = ['quran-text', 'translations', 'audio-metadata', 'user-progress'] as const;
    const sizes = await Promise.all(
      stores.map(async storeName => {
        const tx = this.db!.transaction(storeName, 'readonly');
        const all = await tx.store.getAll();
        return JSON.stringify(all).length;
      })
    );

    return {
      total: sizes.reduce((a, b) => a + b, 0),
      quranText: sizes[0],
      translations: sizes[1],
      audio: sizes[2],
      userProgress: sizes[3]
    };
  }

  // Clear specific cache
  async clearCache(type: 'quran-text' | 'translations' | 'audio-metadata' | 'user-progress'): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.clear(type);
  }

  // Clear all caches
  async clearAllCaches(): Promise<void> {
    if (!this.db) await this.init();
    const stores = ['quran-text', 'translations', 'audio-metadata', 'user-progress'] as const;
    await Promise.all(stores.map(store => this.db!.clear(store)));
  }
}

export const offlineManager = new OfflineManager();
```

### 3.2 Network Status Detection

```typescript
// src/hooks/useNetworkStatus.ts

import { useState, useEffect } from 'react';

interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    online: navigator.onLine
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection ||
                        (navigator as any).mozConnection ||
                        (navigator as any).webkitConnection;

      setStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData
      });
    };

    // Initial update
    updateNetworkStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Listen for connection changes
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);

      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return status;
}

// Offline indicator component
export function OfflineIndicator() {
  const { online } = useNetworkStatus();

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
      <span className="text-sm font-medium">
        📡 You are offline. Some features may be limited.
      </span>
    </div>
  );
}
```

---

## Mobile-First Responsive Design

### 4.1 Breakpoint System

```typescript
// tailwind.config.js

export default {
  theme: {
    screens: {
      'xs': '320px',      // Small phones (iPhone SE)
      'sm': '375px',      // Standard phones (iPhone 12/13)
      'md': '768px',      // Tablets (iPad)
      'lg': '1024px',     // Small desktop
      'xl': '1280px',     // Desktop
      '2xl': '1536px',    // Large desktop

      // Orientation-specific
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' }
    },
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)'
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
      }
    }
  }
}
```

### 4.2 Responsive Layout Components

```typescript
// src/components/Layout/ResponsiveLayout.tsx

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen-safe",
        "pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right",
        "bg-background",
        className
      )}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 md:h-20 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          {/* Header content */}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-20 pb-20 md:pb-0">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden h-16 bg-surface/95 backdrop-blur-sm border-t border-border">
        {/* Bottom nav items */}
      </nav>
    </div>
  );
}
```

### 4.3 Typography Scaling

```css
/* src/styles/typography.css */

/* Base font sizes with fluid scaling */
:root {
  /* Fluid typography formula: min + (max - min) * ((100vw - minWidth) / (maxWidth - minWidth)) */
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --font-size-sm: clamp(0.875rem, 0.825rem + 0.25vw, 1rem);
  --font-size-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 2rem);
  --font-size-3xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.5rem);

  /* Arabic text specific */
  --font-size-arabic-base: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --font-size-arabic-lg: clamp(1.75rem, 1.55rem + 1vw, 2.25rem);
  --font-size-arabic-xl: clamp(2rem, 1.75rem + 1.25vw, 2.75rem);

  /* Line heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  --line-height-arabic: 2.0;
}

/* Arabic text styles */
.arabic-text {
  font-family: 'Amiri Quran', 'KFGQPC Uthmanic Script HAFS', serif;
  font-size: var(--font-size-arabic-base);
  line-height: var(--line-height-arabic);
  direction: rtl;
  text-align: right;
  font-feature-settings: 'liga' 1, 'calt' 1;
}

.arabic-text-lg {
  font-size: var(--font-size-arabic-lg);
}

.arabic-text-xl {
  font-size: var(--font-size-arabic-xl);
}

/* Touch-friendly sizing */
@media (hover: none) and (pointer: coarse) {
  /* Increase touch targets on touch devices */
  button, a, input, select, textarea {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 4.4 Responsive Images

```typescript
// src/components/ResponsiveImage.tsx

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function ResponsiveImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className
}: ResponsiveImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizes}
      srcSet={`
        ${src}?w=320 320w,
        ${src}?w=640 640w,
        ${src}?w=768 768w,
        ${src}?w=1024 1024w,
        ${src}?w=1280 1280w,
        ${src}?w=1536 1536w
      `}
      className={className}
    />
  );
}
```

---

## Touch Gestures & Interactions

### 5.1 Gesture Recognition Library

```typescript
// src/hooks/useSwipeGesture.ts

import { useEffect, useRef, useState } from 'react';

interface SwipeConfig {
  threshold?: number;
  velocity?: number;
  enableHorizontal?: boolean;
  enableVertical?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipeGesture(config: SwipeConfig = {}) {
  const {
    threshold = 50,
    velocity = 0.3,
    enableHorizontal = true,
    enableVertical = true,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = config;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    },

    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    },

    onTouchEnd: () => {
      if (!touchStartRef.current || !touchEndRef.current) return;

      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const deltaTime = touchEndRef.current.time - touchStartRef.current.time;

      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Horizontal swipe
      if (enableHorizontal && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold && velocityX > velocity) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      }

      // Vertical swipe
      if (enableVertical && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (Math.abs(deltaY) > threshold && velocityY > velocity) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      touchStartRef.current = null;
      touchEndRef.current = null;
    }
  };

  return handlers;
}
```

### 5.2 Pinch to Zoom

```typescript
// src/hooks/usePinchZoom.ts

import { useEffect, useRef, useState } from 'react';

interface PinchZoomConfig {
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  onZoomChange?: (zoom: number) => void;
}

export function usePinchZoom(config: PinchZoomConfig = {}) {
  const {
    minZoom = 1,
    maxZoom = 3,
    step = 0.1,
    onZoomChange
  } = config;

  const [zoom, setZoom] = useState(1);
  const initialDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef(1);

  const getDistance = (touches: TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistanceRef.current = getDistance(e.touches);
        initialZoomRef.current = zoom;
      }
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (e.touches.length === 2 && initialDistanceRef.current) {
        e.preventDefault();

        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistanceRef.current;
        const newZoom = Math.min(
          maxZoom,
          Math.max(minZoom, initialZoomRef.current * scale)
        );

        setZoom(newZoom);
        onZoomChange?.(newZoom);
      }
    },

    onTouchEnd: () => {
      initialDistanceRef.current = null;
    },

    // Double-tap to zoom
    onDoubleClick: () => {
      const newZoom = zoom === 1 ? 2 : 1;
      setZoom(newZoom);
      onZoomChange?.(newZoom);
    }
  };

  return { zoom, handlers, setZoom };
}
```

### 5.3 Long Press Gesture

```typescript
// src/hooks/useLongPress.ts

import { useCallback, useRef } from 'react';

interface LongPressConfig {
  delay?: number;
  onLongPress: () => void;
  onClick?: () => void;
}

export function useLongPress(config: LongPressConfig) {
  const { delay = 500, onLongPress, onClick } = config;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [delay, onLongPress]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
  }, [onClick]);

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: clear,
    onMouseDown: start,
    onMouseUp: (e: React.MouseEvent) => {
      clear();
      handleClick();
    },
    onMouseLeave: clear
  };
}
```

### 5.4 Pull-to-Refresh

```typescript
// src/components/PullToRefresh.tsx

import { useState, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container && container.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, (currentY - startYRef.current) * 0.5);

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const rotation = pullProgress * 360;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform"
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold) - threshold}px)`,
          height: `${threshold}px`
        }}
      >
        <RefreshCw
          className={`w-6 h-6 text-primary transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance > 0 ? Math.min(pullDistance, threshold) : 0}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## Platform-Specific Optimizations

### 6.1 iOS Specific

```typescript
// src/utils/iosOptimizations.ts

export function applyIOSOptimizations() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  if (!isIOS) return;

  // Disable rubber band scrolling on body
  document.body.style.overscrollBehavior = 'none';

  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Fix 100vh issue on iOS Safari
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  // Handle safe area insets
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) {
    meta.setAttribute('content',
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover'
    );
  }

  // Smooth scrolling for iOS
  document.documentElement.style.webkitOverflowScrolling = 'touch';

  // Disable iOS callout (long-press menu)
  document.documentElement.style.webkitTouchCallout = 'none';

  // Fix audio playback issues
  const unlockAudio = () => {
    const audio = new Audio();
    audio.volume = 0;
    audio.play().catch(() => {});
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('touchstart', unlockAudio, { once: true });
}
```

### 6.2 Android Specific

```typescript
// src/utils/androidOptimizations.ts

export function applyAndroidOptimizations() {
  const isAndroid = /Android/.test(navigator.userAgent);

  if (!isAndroid) return;

  // Address bar handling
  const updateViewportHeight = () => {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  updateViewportHeight();
  window.addEventListener('resize', updateViewportHeight);

  // Fix scroll performance on Android
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  // Optimize touch response
  document.documentElement.style.touchAction = 'manipulation';

  // Fix audio focus on Android
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
  });

  // Handle back button
  window.addEventListener('popstate', (e) => {
    // Custom back button handling
    console.log('Android back button pressed');
  });

  // Optimize scrolling performance
  const scrollContainers = document.querySelectorAll('[data-scroll-container]');
  scrollContainers.forEach(container => {
    (container as HTMLElement).style.willChange = 'scroll-position';
  });
}
```

### 6.3 Samsung Internet Optimizations

```typescript
// src/utils/samsungOptimizations.ts

export function applySamsungOptimizations() {
  const isSamsung = /SamsungBrowser/.test(navigator.userAgent);

  if (!isSamsung) return;

  // Optimize for high refresh rate displays (120Hz)
  if ('scheduling' in window && 'isInputPending' in (window as any).scheduling) {
    const processEvents = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0 && (window as any).scheduling.isInputPending()) {
        // Process pending events
      }
      requestIdleCallback(processEvents);
    };
    requestIdleCallback(processEvents);
  }

  // Fix video playback issues
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
  });

  // Optimize scroll performance
  document.documentElement.style.scrollBehavior = 'smooth';
}
```

### 6.4 Feature Detection

```typescript
// src/utils/featureDetection.ts

export interface DeviceCapabilities {
  touch: boolean;
  standalone: boolean;
  notificationSupport: boolean;
  audioSupport: boolean;
  serviceWorkerSupport: boolean;
  indexedDBSupport: boolean;
  localStorageSupport: boolean;
  webShareSupport: boolean;
  vibrationSupport: boolean;
  wakeLockSupport: boolean;
  batterySupport: boolean;
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  return {
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

    standalone: window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true,

    notificationSupport: 'Notification' in window &&
                         'serviceWorker' in navigator &&
                         'PushManager' in window,

    audioSupport: !!document.createElement('audio').canPlayType,

    serviceWorkerSupport: 'serviceWorker' in navigator,

    indexedDBSupport: 'indexedDB' in window,

    localStorageSupport: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),

    webShareSupport: 'share' in navigator,

    vibrationSupport: 'vibrate' in navigator,

    wakeLockSupport: 'wakeLock' in navigator,

    batterySupport: 'getBattery' in navigator
  };
}

export function getPlatformInfo() {
  const userAgent = navigator.userAgent;

  return {
    isIOS: /iPhone|iPad|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isChrome: /Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
    isSamsung: /SamsungBrowser/.test(userAgent),
    isEdge: /Edg/.test(userAgent),
    isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
    isTablet: /Tablet|iPad/.test(userAgent) && !/Mobile/.test(userAgent)
  };
}
```

---

## App Icons & Splash Screens

### 7.1 Icon Specifications

#### Required Icon Sizes

| Size | Purpose | Platform |
|------|---------|----------|
| 72x72 | Small icon | Android, iOS |
| 96x96 | Standard icon | Android |
| 128x128 | Medium icon | Android, iOS |
| 144x144 | Large icon | Android, Windows |
| 152x152 | iPad icon | iOS |
| 167x167 | iPad Pro icon | iOS |
| 180x180 | iPhone icon | iOS |
| 192x192 | Standard PWA icon | Android, All |
| 384x384 | Large PWA icon | Android |
| 512x512 | Maskable icon | Android, All |
| 1024x1024 | App Store | iOS |

#### Icon Design Guidelines

```typescript
// Icon design specifications
const iconSpecs = {
  // Color scheme
  background: '#1B5E20', // Islamic green
  foreground: '#FFFFFF', // White
  accent: '#B8860B',     // Gold

  // Safe zones for maskable icons
  maskableSafeZone: '20%', // Keep important content within 80% center

  // Design elements
  elements: {
    calligraphy: true,     // Use Arabic calligraphy
    geometricPattern: true, // Subtle Islamic patterns
    minimalist: true        // Clean, recognizable design
  },

  // Export formats
  formats: ['PNG', 'SVG', 'ICO'],

  // Quality
  ppi: 72,
  colorSpace: 'sRGB'
};
```

### 7.2 Splash Screen Specifications

#### iOS Splash Screens

```html
<!-- iPhone 15 Pro Max, iPhone 15 Plus, iPhone 14 Pro Max -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      href="/splash/iPhone_15_Pro_Max_portrait.png">
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
      href="/splash/iPhone_15_Pro_Max_landscape.png">

<!-- iPhone 15 Pro, iPhone 15, iPhone 14 Pro -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      href="/splash/iPhone_15_Pro_portrait.png">
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
      href="/splash/iPhone_15_Pro_landscape.png">

<!-- iPhone 14 Plus, iPhone 13 Pro Max, iPhone 12 Pro Max -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      href="/splash/iPhone_14_Plus_portrait.png">

<!-- iPhone 14, iPhone 13 Pro, iPhone 13, iPhone 12 Pro, iPhone 12 -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      href="/splash/iPhone_14_portrait.png">

<!-- iPhone 13 mini, iPhone 12 mini, iPhone 11 Pro, iPhone XS, iPhone X -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      href="/splash/iPhone_13_mini_portrait.png">

<!-- iPad Pro 12.9" -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      href="/splash/iPad_Pro_12_9_portrait.png">

<!-- iPad Pro 11" -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      href="/splash/iPad_Pro_11_portrait.png">

<!-- iPad Air 10.9" -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      href="/splash/iPad_Air_portrait.png">

<!-- iPad 10.2" -->
<link rel="apple-touch-startup-image"
      media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      href="/splash/iPad_10_2_portrait.png">
```

#### Splash Screen Generation Script

```typescript
// scripts/generateSplashScreens.ts

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SplashConfig {
  name: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

const splashConfigs: SplashConfig[] = [
  // iPhone
  { name: 'iPhone_15_Pro_Max', width: 1290, height: 2796, orientation: 'portrait' },
  { name: 'iPhone_15_Pro', width: 1179, height: 2556, orientation: 'portrait' },
  { name: 'iPhone_14_Plus', width: 1284, height: 2778, orientation: 'portrait' },
  { name: 'iPhone_14', width: 1170, height: 2532, orientation: 'portrait' },
  { name: 'iPhone_13_mini', width: 1125, height: 2436, orientation: 'portrait' },

  // iPad
  { name: 'iPad_Pro_12_9', width: 2048, height: 2732, orientation: 'portrait' },
  { name: 'iPad_Pro_11', width: 1668, height: 2388, orientation: 'portrait' },
  { name: 'iPad_Air', width: 1640, height: 2360, orientation: 'portrait' },
  { name: 'iPad_10_2', width: 1620, height: 2160, orientation: 'portrait' }
];

async function generateSplash(config: SplashConfig) {
  const { name, width, height, orientation } = config;

  // Create canvas
  const canvas = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 27, g: 94, b: 32, alpha: 1 } // Islamic green
    }
  });

  // Add logo in center
  const logoPath = join(__dirname, '../public/icons/icon-512x512.png');
  const logoSize = Math.min(width, height) * 0.3;

  const logo = await sharp(logoPath)
    .resize(Math.floor(logoSize), Math.floor(logoSize))
    .toBuffer();

  // Composite logo on canvas
  await canvas
    .composite([
      {
        input: logo,
        top: Math.floor((height - logoSize) / 2),
        left: Math.floor((width - logoSize) / 2)
      }
    ])
    .png()
    .toFile(join(__dirname, `../public/splash/${name}_${orientation}.png`));

  console.log(`Generated: ${name}_${orientation}.png`);
}

async function generateAllSplashes() {
  for (const config of splashConfigs) {
    await generateSplash(config);

    // Generate landscape version
    if (config.orientation === 'portrait') {
      await generateSplash({
        ...config,
        width: config.height,
        height: config.width,
        orientation: 'landscape'
      });
    }
  }
}

generateAllSplashes().catch(console.error);
```

### 7.3 Asset Optimization

```typescript
// vite.config.ts - Image optimization

import { defineConfig } from 'vite';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    imagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 85
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false
          },
          {
            name: 'removeEmptyAttrs',
            active: true
          }
        ]
      }
    })
  ]
});
```

---

## Push Notifications

### 8.1 Push Notification Setup

```typescript
// src/services/pushNotifications.ts

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;

  async init(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    this.registration = await navigator.serviceWorker.ready;
  }

  async requestPermission(): Promise<NotificationPermission> {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      await this.subscribe();
    }

    return permission;
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey!)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const subscription = await this.registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.init();
    }

    return this.registration?.pushManager.getSubscription() ?? null;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // Send to your backend API
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    // Send to your backend API
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Show local notification
  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    await this.registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });
  }
}

export const pushNotifications = new PushNotificationService();
```

### 8.2 Notification Manager

```typescript
// src/stores/notificationStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { pushNotifications } from '@/services/pushNotifications';

interface NotificationSettings {
  enabled: boolean;
  dailyReading: boolean;
  dailyReadingTime: string;
  memorization: boolean;
  memorizationReminders: boolean;
  prayerTimes: boolean;
}

interface NotificationStore {
  settings: NotificationSettings;
  permission: NotificationPermission;
  subscribed: boolean;

  requestPermission: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  scheduleDailyReminder: (time: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      settings: {
        enabled: false,
        dailyReading: true,
        dailyReadingTime: '09:00',
        memorization: true,
        memorizationReminders: true,
        prayerTimes: false
      },
      permission: Notification.permission,
      subscribed: false,

      requestPermission: async () => {
        const permission = await pushNotifications.requestPermission();
        set({ permission, subscribed: permission === 'granted' });
      },

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      subscribe: async () => {
        try {
          await pushNotifications.subscribe();
          set({ subscribed: true });
        } catch (error) {
          console.error('Subscribe failed:', error);
        }
      },

      unsubscribe: async () => {
        try {
          await pushNotifications.unsubscribe();
          set({ subscribed: false });
        } catch (error) {
          console.error('Unsubscribe failed:', error);
        }
      },

      scheduleDailyReminder: (time: string) => {
        // Schedule daily reminder
        // This would typically be handled by your backend
        set(state => ({
          settings: { ...state.settings, dailyReadingTime: time }
        }));
      }
    }),
    {
      name: 'notification-settings'
    }
  )
);
```

### 8.3 Notification UI Component

```typescript
// src/components/Settings/NotificationSettings.tsx

import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNotificationStore } from '@/stores/notificationStore';
import { Bell, BellOff } from 'lucide-react';

export function NotificationSettings() {
  const {
    settings,
    permission,
    subscribed,
    requestPermission,
    updateSettings,
    subscribe,
    unsubscribe
  } = useNotificationStore();

  const handleEnableNotifications = async () => {
    if (permission !== 'granted') {
      await requestPermission();
    } else {
      await subscribe();
    }
  };

  const handleDisableNotifications = async () => {
    await unsubscribe();
    updateSettings({ enabled: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Enable Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive reminders for Quran reading and memorization
          </p>
        </div>

        {permission === 'granted' && subscribed ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisableNotifications}
          >
            <BellOff className="w-4 h-4 mr-2" />
            Disable
          </Button>
        ) : (
          <Button
            onClick={handleEnableNotifications}
            size="sm"
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable
          </Button>
        )}
      </div>

      {subscribed && (
        <>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-reading">Daily Reading Reminder</Label>
              <p className="text-sm text-muted-foreground">
                Get notified for your daily Quran reading
              </p>
            </div>
            <Switch
              id="daily-reading"
              checked={settings.dailyReading}
              onCheckedChange={(checked) =>
                updateSettings({ dailyReading: checked })
              }
            />
          </div>

          {settings.dailyReading && (
            <div className="pl-4">
              <Label htmlFor="reading-time">Reminder Time</Label>
              <input
                id="reading-time"
                type="time"
                value={settings.dailyReadingTime}
                onChange={(e) =>
                  updateSettings({ dailyReadingTime: e.target.value })
                }
                className="mt-2 w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="memorization">Memorization Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified for memorization reviews
              </p>
            </div>
            <Switch
              id="memorization"
              checked={settings.memorization}
              onCheckedChange={(checked) =>
                updateSettings({ memorization: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="prayer-times">Prayer Time Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Optional prayer time reminders
              </p>
            </div>
            <Switch
              id="prayer-times"
              checked={settings.prayerTimes}
              onCheckedChange={(checked) =>
                updateSettings({ prayerTimes: checked })
              }
            />
          </div>
        </>
      )}

      {permission === 'denied' && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Performance Optimization

### 9.1 Bundle Optimization

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),

    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),

    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    }),

    // Bundle analyzer
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],

  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-slot', 'class-variance-authority'],

          // Feature chunks
          'quran-text': ['./src/components/Quran/*'],
          'audio-player': ['./src/components/Audio/*'],
          'memorization': ['./src/components/Memorization/*']
        }
      }
    },

    chunkSizeWarningLimit: 600
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
});
```

### 9.2 Lazy Loading Strategy

```typescript
// src/App.tsx

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Eager loading for critical routes
import { HomePage } from '@/pages/Home';
import { QuranReader } from '@/pages/QuranReader';

// Lazy loading for secondary routes
const SearchPage = lazy(() => import('@/pages/Search'));
const MemorizationPage = lazy(() => import('@/pages/Memorization'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const TafsirPage = lazy(() => import('@/pages/Tafsir'));
const BookmarksPage = lazy(() => import('@/pages/Bookmarks'));
const StatsPage = lazy(() => import('@/pages/Stats'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/read" element={<QuranReader />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/memorize" element={<MemorizationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/tafsir/:surah/:verse" element={<TafsirPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

### 9.3 Image Loading Strategy

```typescript
// src/hooks/useProgressiveImage.ts

import { useState, useEffect } from 'react';

export function useProgressiveImage(src: string, placeholder: string) {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };

    img.src = src;
  }, [src]);

  return { src: currentSrc, loading };
}

// Usage
function ImageComponent({ src, placeholder, alt }: any) {
  const { src: currentSrc, loading } = useProgressiveImage(src, placeholder);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
    />
  );
}
```

### 9.4 Virtual Scrolling

```typescript
// src/components/VirtualScrollList.tsx

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize: number;
}

export function VirtualScrollList<T>({
  items,
  renderItem,
  estimateSize
}: VirtualScrollListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5
  });

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing & Validation

### 10.1 Lighthouse CI Configuration

```javascript
// lighthouserc.js

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.9 }],

        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],

        'service-worker': 'error',
        'installable-manifest': 'error',
        'splash-screen': 'error',
        'themed-omnibox': 'error',
        'viewport': 'error',
        'without-javascript': 'off'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

### 10.2 PWA Testing Checklist

```markdown
# PWA Testing Checklist

## Installation
- [ ] App can be installed on iOS Safari
- [ ] App can be installed on Android Chrome
- [ ] App can be installed on desktop browsers
- [ ] Installation prompt appears appropriately
- [ ] App shortcut is created after installation
- [ ] App opens in standalone mode

## Offline Functionality
- [ ] Complete Quran text available offline
- [ ] Cached audio plays offline
- [ ] Cached translations available offline
- [ ] Bookmarks and progress saved offline
- [ ] Offline indicator displays when disconnected
- [ ] Background sync works when reconnecting

## Performance
- [ ] Initial load < 3 seconds on 3G
- [ ] Time to Interactive < 3 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Smooth scrolling at 60fps
- [ ] No jank during animations
- [ ] Memory usage < 100MB

## Responsive Design
- [ ] Works on iPhone SE (320px)
- [ ] Works on iPhone 12/13 (390px)
- [ ] Works on iPad (768px)
- [ ] Works on desktop (1280px+)
- [ ] Landscape mode supported
- [ ] Safe area insets respected

## Touch Interactions
- [ ] Swipe left/right for page navigation
- [ ] Pinch to zoom on Mushaf pages
- [ ] Long press for verse menu
- [ ] Pull to refresh works
- [ ] Touch targets ≥ 44px

## Platform-Specific
### iOS
- [ ] Status bar styled correctly
- [ ] Splash screens display
- [ ] Home screen icon looks good
- [ ] Share menu integration works
- [ ] Background audio works

### Android
- [ ] Add to Home Screen works
- [ ] Splash screens display
- [ ] Notification badges work
- [ ] Back button handled correctly
- [ ] Share Target API works

## Notifications
- [ ] Permission request works
- [ ] Daily reminders send correctly
- [ ] Notification actions work
- [ ] Notification icons display
- [ ] Vibration pattern works

## Accessibility
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast ≥ 4.5:1
- [ ] Text resizable to 200%

## Security
- [ ] HTTPS only
- [ ] Content Security Policy active
- [ ] No mixed content warnings
- [ ] Quran text integrity verified
```

### 10.3 Cross-Browser Testing

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry'
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    },
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] }
    },

    // Samsung Internet
    {
      name: 'Samsung',
      use: {
        ...devices['Galaxy S9+'],
        userAgent: 'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G965F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/20.0 Chrome/106.0.5249.126 Mobile Safari/537.36'
      }
    }
  ],

  webServer: {
    command: 'npm run preview',
    port: 4173
  }
});
```

---

## Implementation Checklist

### Phase 1: PWA Foundation (Week 1-2)
- [ ] Configure web app manifest
- [ ] Implement service worker with Workbox
- [ ] Set up offline storage (IndexedDB)
- [ ] Create PWA installation prompt
- [ ] Generate app icons (all sizes)
- [ ] Generate splash screens (iOS/Android)

### Phase 2: Mobile-First UI (Week 3-4)
- [ ] Implement responsive breakpoints
- [ ] Create mobile navigation
- [ ] Optimize typography for mobile
- [ ] Implement safe area insets
- [ ] Add touch-friendly controls
- [ ] Test on real devices

### Phase 3: Touch Interactions (Week 5-6)
- [ ] Implement swipe gestures
- [ ] Add pinch-to-zoom
- [ ] Implement long-press menu
- [ ] Add pull-to-refresh
- [ ] Test gesture conflicts
- [ ] Optimize touch performance

### Phase 4: Platform Optimizations (Week 7-8)
- [ ] Apply iOS-specific optimizations
- [ ] Apply Android-specific optimizations
- [ ] Handle Samsung Internet quirks
- [ ] Implement feature detection
- [ ] Test on target devices
- [ ] Fix platform-specific bugs

### Phase 5: Offline & Caching (Week 9-10)
- [ ] Implement complete offline support
- [ ] Add audio download manager
- [ ] Implement cache management UI
- [ ] Add storage usage monitor
- [ ] Test offline scenarios
- [ ] Optimize cache strategies

### Phase 6: Push Notifications (Week 11-12)
- [ ] Set up push notification service
- [ ] Implement notification permissions
- [ ] Create notification settings UI
- [ ] Add daily reminder scheduling
- [ ] Test notification delivery
- [ ] Handle notification interactions

### Phase 7: Performance (Week 13-14)
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add lazy loading
- [ ] Optimize images
- [ ] Implement virtual scrolling
- [ ] Run Lighthouse audits

### Phase 8: Testing & Polish (Week 15-16)
- [ ] Cross-browser testing
- [ ] Device testing (iOS/Android)
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Security review
- [ ] Launch preparation

---

## Success Metrics

### PWA Installation
- **Target**: 30% install rate
- **Measurement**: Analytics tracking

### Performance
- **Lighthouse Score**: > 90 (all categories)
- **Load Time**: < 3 seconds (3G)
- **Time to Interactive**: < 3 seconds

### User Engagement
- **Session Duration**: 15+ minutes average
- **Offline Usage**: 60%+ of sessions
- **Return Rate**: 40%+ (30-day)

### Technical Quality
- **Crash Rate**: < 0.1%
- **Error Rate**: < 0.5%
- **Cache Hit Rate**: > 90%

---

## Resources & References

### Tools
- **PWA Builder**: https://www.pwabuilder.com/
- **Workbox**: https://developers.google.com/web/tools/workbox
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse

### Documentation
- **MDN PWA Guide**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Web.dev PWA**: https://web.dev/progressive-web-apps/
- **Apple PWA Guidelines**: https://developer.apple.com/design/human-interface-guidelines/web-views

### Testing
- **BrowserStack**: https://www.browserstack.com/
- **Playwright**: https://playwright.dev/
- **WebPageTest**: https://www.webpagetest.org/

---

**Document Version**: 1.0.0
**Last Updated**: November 2025
**Status**: Ready for Implementation
**Next Review**: Post-Phase 4 Completion
