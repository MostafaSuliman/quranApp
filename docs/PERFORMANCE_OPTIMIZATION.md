# QuranApp - Performance Optimization Strategy

## Document Information

| Field | Value |
|-------|-------|
| **Document** | Performance Optimization Strategy |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Last Updated** | November 2025 |
| **Owner** | Performance Engineering Team |

---

## Table of Contents

1. [Performance Budgets](#performance-budgets)
2. [Code Splitting Strategy](#code-splitting-strategy)
3. [Lazy Loading Implementation](#lazy-loading-implementation)
4. [Asset Optimization Pipeline](#asset-optimization-pipeline)
5. [Caching Strategies](#caching-strategies)
6. [Bundle Size Optimization](#bundle-size-optimization)
7. [Performance Monitoring](#performance-monitoring)
8. [Core Web Vitals Targets](#core-web-vitals-targets)

---

## Performance Budgets

### 1.1 Lighthouse Score Targets

**Minimum Acceptable Scores**: > 90 across all categories

| Category | Target | Minimum | Measurement Frequency |
|----------|--------|---------|----------------------|
| Performance | 95 | 90 | Every build (CI/CD) |
| Accessibility | 100 | 95 | Every build (CI/CD) |
| Best Practices | 100 | 95 | Every build (CI/CD) |
| SEO | 100 | 95 | Every build (CI/CD) |
| PWA | 100 | 90 | Every build (CI/CD) |

**Enforcement Strategy**:
- CI/CD pipeline fails if any score < 90
- Automated Lighthouse CI reports on every PR
- Weekly performance reviews with team
- Monthly performance optimization sprints

### 1.2 Load Time Budgets

**Network Conditions**: 3G Fast (1.6 Mbps, 150ms RTT)

| Metric | Target | Maximum | Percentile |
|--------|--------|---------|------------|
| Time to Interactive (TTI) | 2.5s | 3.0s | 90th |
| First Contentful Paint (FCP) | 1.0s | 1.5s | 90th |
| Largest Contentful Paint (LCP) | 2.0s | 2.5s | 75th |
| First Input Delay (FID) | 50ms | 100ms | 95th |
| Cumulative Layout Shift (CLS) | 0.05 | 0.1 | 75th |
| Speed Index | 2.5s | 3.5s | 90th |
| Total Blocking Time (TBT) | 150ms | 300ms | 90th |

**Repeat Visit Performance**:
- TTI: < 1 second (with service worker cache)
- FCP: < 500ms
- Page Navigation: < 500ms

### 1.3 Asset Size Budgets

**Initial Load (Critical Path)**:

| Asset Type | Target | Maximum | Notes |
|------------|--------|---------|-------|
| HTML | 15KB | 25KB | Gzipped |
| Initial JS Bundle | 200KB | 500KB | Gzipped, critical path only |
| Initial CSS | 30KB | 50KB | Gzipped, critical styles |
| Web Fonts | 50KB | 100KB | WOFF2 compressed, 2 weights max |
| Total Initial | 300KB | 500KB | Complete first paint |

**Total Application Size**:

| Asset Type | Target | Maximum | Notes |
|------------|--------|---------|-------|
| Total JS | 800KB | 1.5MB | Gzipped, all chunks |
| Total CSS | 100KB | 200KB | Gzipped, all styles |
| Images/Icons | 200KB | 500KB | Optimized, lazy loaded |
| Fonts | 100KB | 200KB | All weights and subsets |
| **Total App** | **1.2MB** | **2.0MB** | **Excluding Quran data/audio** |

**Quran Content Assets**:

| Asset Type | Target | Maximum | Storage Method |
|------------|--------|---------|----------------|
| Quran Text | 8MB | 10MB | IndexedDB |
| Single Translation | 3MB | 5MB | IndexedDB |
| Audio (per Surah) | 5MB | 10MB | Cache API |
| Audio (full Quran) | 120MB | 150MB | Cache API (user-initiated) |

### 1.4 Runtime Performance Budgets

**Frame Rate & Interactions**:

| Metric | Target | Minimum | Context |
|--------|--------|---------|---------|
| Scrolling FPS | 60fps | 55fps | All scrollable areas |
| Animation FPS | 60fps | 50fps | Page transitions, modals |
| Input Response Time | 50ms | 100ms | Button clicks, form inputs |
| Audio Start Latency | 500ms | 1000ms | Play button to audio start |
| Search Response | 300ms | 800ms | Query to results display |

**Resource Usage**:

| Resource | Target | Maximum | Device Context |
|----------|--------|---------|----------------|
| Memory (Mobile) | 60MB | 100MB | iOS/Android flagship |
| Memory (Desktop) | 100MB | 200MB | Modern desktop browsers |
| CPU Usage (Idle) | < 5% | < 10% | Background tabs |
| CPU Usage (Active) | < 25% | < 40% | Active reading/listening |
| Battery Impact | Minimal | Low | iOS/Android metrics |

### 1.5 Network Performance Budgets

**API Response Times**:

| API Endpoint | Target | Maximum | Percentile |
|--------------|--------|---------|------------|
| Quran Text API | 200ms | 500ms | 95th |
| Translation API | 250ms | 600ms | 95th |
| Audio Metadata | 150ms | 400ms | 95th |
| Tafsir API | 300ms | 800ms | 90th |

**CDN & Caching**:
- Cache Hit Rate: > 90% (repeat visits)
- CDN Response Time: < 50ms (global average)
- Service Worker Cache: 100% for core assets

---

## Code Splitting Strategy

### 2.1 Route-Based Code Splitting

**Primary Routes** (Lazy Loaded):

```typescript
// Route-based chunks configuration
const routes = {
  // Core routes (initial bundle)
  home: {
    path: '/',
    component: () => import('./pages/Home'),
    priority: 'high',
    preload: true,
    size: '~50KB'
  },

  mushafView: {
    path: '/mushaf',
    component: () => import('./pages/MushafView'),
    priority: 'high',
    preload: true,
    size: '~80KB'
  },

  // Secondary routes (lazy loaded)
  search: {
    path: '/search',
    component: () => import('./pages/Search'),
    priority: 'medium',
    preload: false,
    size: '~45KB'
  },

  memorization: {
    path: '/memorization',
    component: () => import('./pages/Memorization'),
    priority: 'medium',
    preload: false,
    size: '~60KB'
  },

  translations: {
    path: '/translations',
    component: () => import('./pages/Translations'),
    priority: 'medium',
    preload: false,
    size: '~40KB'
  },

  tafsir: {
    path: '/tafsir',
    component: () => import('./pages/Tafsir'),
    priority: 'low',
    preload: false,
    size: '~55KB'
  },

  settings: {
    path: '/settings',
    component: () => import('./pages/Settings'),
    priority: 'low',
    preload: false,
    size: '~35KB'
  }
};
```

**Implementation Strategy**:
```typescript
// React Router with lazy loading
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// High-priority routes (eager load)
import Home from './pages/Home';
import MushafView from './pages/MushafView';

// Low-priority routes (lazy load)
const Search = lazy(() => import('./pages/Search'));
const Memorization = lazy(() => import('./pages/Memorization'));
const Translations = lazy(() => import('./pages/Translations'));
const Tafsir = lazy(() => import('./pages/Tafsir'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading fallback component
const PageLoader = () => (
  <div className="page-loader" aria-label="Loading page">
    <div className="skeleton-loader" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mushaf" element={<MushafView />} />
          <Route path="/search" element={<Search />} />
          <Route path="/memorization" element={<Memorization />} />
          <Route path="/translations" element={<Translations />} />
          <Route path="/tafsir" element={<Tafsir />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### 2.2 Component-Based Code Splitting

**Heavy Components** (Dynamically Imported):

```typescript
// Audio player (only loaded when needed)
const AudioPlayer = lazy(() => import('./components/Audio/AudioPlayer'));

// Advanced search with filters
const AdvancedSearch = lazy(() => import('./components/Search/AdvancedSearch'));

// Tafsir viewer (heavy content)
const TafsirViewer = lazy(() => import('./components/Tafsir/TafsirViewer'));

// Progress charts (uses heavy charting library)
const ProgressCharts = lazy(() => import('./components/Memorization/ProgressCharts'));

// Translation manager (multiple languages)
const TranslationManager = lazy(() => import('./components/Translation/TranslationManager'));
```

**Implementation Pattern**:
```typescript
// Conditional loading based on user interaction
function MushafPage() {
  const [showAudio, setShowAudio] = useState(false);

  return (
    <div>
      <QuranText />

      <button onClick={() => setShowAudio(true)}>
        Play Audio
      </button>

      {showAudio && (
        <Suspense fallback={<AudioPlayerSkeleton />}>
          <AudioPlayer />
        </Suspense>
      )}
    </div>
  );
}
```

### 2.3 Library Code Splitting

**Vendor Chunks Configuration**:

```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem (critical)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // State management
          'state-vendor': ['zustand'],

          // UI components (split from critical path)
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],

          // Heavy libraries (separate chunks)
          'chart-vendor': ['recharts'], // Only loaded in progress page
          'audio-vendor': ['howler'], // Only loaded when audio needed
          'search-vendor': ['fuse.js'], // Only loaded in search

          // Utilities
          'utils-vendor': ['date-fns', 'lodash-es'],
        },
      },
    },
  },
};
```

### 2.4 Dynamic Import Strategy

**Preload Critical Routes**:
```typescript
// Preload likely next navigation on idle
import { useEffect } from 'react';

function HomePage() {
  useEffect(() => {
    // Preload mushaf view on idle (most common navigation)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import('./pages/MushafView');
      });
    }
  }, []);

  return <div>Home Content</div>;
}
```

**Prefetch on User Intent**:
```typescript
// Prefetch on hover/touch (instant navigation feel)
function NavigationLink({ to, children }) {
  const handleMouseEnter = () => {
    // Dynamically import route component on hover
    if (to === '/search') {
      import('./pages/Search');
    }
  };

  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

### 2.5 Bundle Analysis & Monitoring

**Webpack Bundle Analyzer Integration**:
```bash
# Add bundle analyzer for visualization
npm install --save-dev rollup-plugin-visualizer

# Generate bundle analysis report
npm run build -- --report
```

**Automated Bundle Size Checks**:
```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check
on: [pull_request]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          # Fail if bundle size exceeds budget
          build_script: npm run build
          size_limit: 500KB
```

---

## Lazy Loading Implementation

### 3.1 Image Lazy Loading

**Native Lazy Loading**:
```typescript
// Use native loading="lazy" attribute
function QuranImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={800}
      height={600}
      // Provide dimensions to prevent layout shift
    />
  );
}
```

**Intersection Observer for Advanced Cases**:
```typescript
import { useEffect, useRef, useState } from 'react';

function LazyImage({ src, alt, placeholder }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // Start loading 50px before visible
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="lazy-image-container">
      {isInView ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={isLoaded ? 'loaded' : 'loading'}
        />
      ) : (
        <img src={placeholder} alt="" aria-hidden="true" />
      )}
    </div>
  );
}
```

### 3.2 Quran Text Lazy Loading

**Windowing for Large Surahs**:
```typescript
import { FixedSizeList as List } from 'react-window';

function QuranListView({ verses }) {
  const Row = ({ index, style }) => (
    <div style={style} className="verse-row">
      <QuranVerse verse={verses[index]} />
    </div>
  );

  return (
    <List
      height={window.innerHeight}
      itemCount={verses.length}
      itemSize={120}
      width="100%"
      overscanCount={5} // Render 5 items above/below viewport
    >
      {Row}
    </List>
  );
}
```

**Pagination Strategy for Mushaf View**:
```typescript
function MushafView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [preloadedPages, setPreloadedPages] = useState(new Set([1]));

  useEffect(() => {
    // Preload adjacent pages
    const pagesToPreload = [
      currentPage - 1,
      currentPage + 1,
      currentPage + 2
    ].filter(p => p >= 1 && p <= 604);

    pagesToPreload.forEach(page => {
      if (!preloadedPages.has(page)) {
        preloadPage(page).then(() => {
          setPreloadedPages(prev => new Set(prev).add(page));
        });
      }
    });
  }, [currentPage]);

  return <PageContent page={currentPage} />;
}
```

### 3.3 Audio Lazy Loading

**Progressive Audio Loading**:
```typescript
class AudioManager {
  private cache = new Map<string, AudioBuffer>();

  async loadVerse(surah: number, verse: number, reciter: string) {
    const key = `${reciter}-${surah}-${verse}`;

    // Check memory cache
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Check Cache API
    const cached = await caches.match(`/audio/${key}.mp3`);
    if (cached) {
      const buffer = await this.decodeAudio(await cached.arrayBuffer());
      this.cache.set(key, buffer);
      return buffer;
    }

    // Fetch and cache
    const response = await fetch(`/api/audio/${reciter}/${surah}/${verse}`);
    const arrayBuffer = await response.arrayBuffer();

    // Cache for offline
    const cache = await caches.open('quran-audio-v1');
    cache.put(`/audio/${key}.mp3`, new Response(arrayBuffer));

    // Decode and store in memory
    const buffer = await this.decodeAudio(arrayBuffer);
    this.cache.set(key, buffer);

    return buffer;
  }

  // Preload next verses in background
  preloadNext(currentSurah: number, currentVerse: number, reciter: string) {
    requestIdleCallback(() => {
      for (let i = 1; i <= 3; i++) {
        this.loadVerse(currentSurah, currentVerse + i, reciter);
      }
    });
  }
}
```

### 3.4 Translation Lazy Loading

**On-Demand Translation Loading**:
```typescript
interface Translation {
  id: string;
  language: string;
  translator: string;
  loaded: boolean;
}

class TranslationManager {
  private loadedTranslations = new Map<string, TranslationData>();

  async loadTranslation(translationId: string) {
    if (this.loadedTranslations.has(translationId)) {
      return this.loadedTranslations.get(translationId);
    }

    // Check IndexedDB cache first
    const cached = await this.getFromIndexedDB(translationId);
    if (cached) {
      this.loadedTranslations.set(translationId, cached);
      return cached;
    }

    // Fetch from API
    const response = await fetch(`/api/translations/${translationId}`);
    const data = await response.json();

    // Cache in IndexedDB for offline
    await this.saveToIndexedDB(translationId, data);

    // Store in memory
    this.loadedTranslations.set(translationId, data);

    return data;
  }

  // Load only verses in current viewport
  async loadTranslationForVerses(
    translationId: string,
    startVerse: number,
    endVerse: number
  ) {
    const translation = await this.loadTranslation(translationId);
    return translation.verses.slice(startVerse, endVerse + 1);
  }
}
```

### 3.5 Tafsir Lazy Loading

**Verse-by-Verse Tafsir Loading**:
```typescript
function TafsirViewer({ surah, verse }) {
  const [tafsir, setTafsir] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTafsir = async () => {
    setLoading(true);

    try {
      // Load only the specific verse tafsir
      const response = await fetch(
        `/api/tafsir/${selectedTafsirSource}/${surah}/${verse}`
      );
      const data = await response.json();

      // Cache in IndexedDB
      await cacheTafsir(surah, verse, data);

      setTafsir(data);
    } catch (error) {
      console.error('Failed to load Tafsir', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTafsir();
  }, [surah, verse]);

  return loading ? <TafsirSkeleton /> : <TafsirContent data={tafsir} />;
}
```

---

## Asset Optimization Pipeline

### 4.1 Image Optimization

**Automated Image Processing**:
```javascript
// vite.config.ts - Image optimization plugin
import { defineConfig } from 'vite';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 3 },
      mozjpeg: { quality: 85 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true },
        ],
      },
      webp: { quality: 85 },
    }),
  ],
});
```

**Responsive Images with Srcset**:
```typescript
function OptimizedImage({ src, alt, sizes }) {
  // Generate srcset for different screen sizes
  const srcset = `
    ${src}?w=320 320w,
    ${src}?w=640 640w,
    ${src}?w=960 960w,
    ${src}?w=1280 1280w
  `;

  return (
    <img
      src={`${src}?w=640`}
      srcSet={srcset}
      sizes={sizes || '(max-width: 640px) 100vw, 640px'}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
```

**WebP with Fallback**:
```html
<picture>
  <source srcset="quran-page.webp" type="image/webp" />
  <source srcset="quran-page.jpg" type="image/jpeg" />
  <img src="quran-page.jpg" alt="Quran page" loading="lazy" />
</picture>
```

### 4.2 Font Optimization

**Font Subsetting Strategy**:
```css
/* Load only Arabic glyphs needed for Quran */
@font-face {
  font-family: 'Amiri Quran';
  src: url('/fonts/amiri-quran-subset.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF;
  font-weight: 400;
  font-style: normal;
}

/* Preload critical fonts */
<link
  rel="preload"
  href="/fonts/amiri-quran-subset.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

**Font Loading Strategy**:
```typescript
// Use Font Loading API for better control
class FontLoader {
  async loadFonts() {
    try {
      const amiriQuran = new FontFace(
        'Amiri Quran',
        'url(/fonts/amiri-quran-subset.woff2)',
        { weight: '400', style: 'normal' }
      );

      // Load font
      await amiriQuran.load();

      // Add to document
      document.fonts.add(amiriQuran);

      // Font loaded successfully
      document.documentElement.classList.add('fonts-loaded');
    } catch (error) {
      console.error('Font loading failed', error);
      // Fallback to system fonts
      document.documentElement.classList.add('fonts-failed');
    }
  }
}

// Load fonts on app initialization
const fontLoader = new FontLoader();
fontLoader.loadFonts();
```

### 4.3 JavaScript Optimization

**Minification & Tree Shaking**:
```javascript
// vite.config.ts
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    rollupOptions: {
      output: {
        // Aggressive tree shaking
        treeshake: 'recommended',
      },
    },
  },
};
```

**Dead Code Elimination**:
```typescript
// Remove unused utilities using tree shaking
// ❌ Bad: Import entire library
import _ from 'lodash';

// ✅ Good: Import only what you need
import debounce from 'lodash-es/debounce';
import throttle from 'lodash-es/throttle';
```

### 4.4 CSS Optimization

**Critical CSS Extraction**:
```javascript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';
import criticalCss from 'vite-plugin-critical-css';

export default {
  plugins: [
    criticalCss({
      // Extract critical CSS for above-the-fold content
      inline: true,
      minify: true,
      dimensions: [
        { width: 375, height: 667 },  // Mobile
        { width: 1920, height: 1080 }, // Desktop
      ],
    }),
  ],
};
```

**CSS Purging (Unused Styles)**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Remove unused Tailwind classes in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
  },
};
```

### 4.5 Audio Optimization

**Audio Compression Strategy**:
```yaml
# Audio encoding parameters
Format: MP3
Bitrate: 128kbps (standard), 64kbps (low-bandwidth mode)
Sampling Rate: 44.1kHz
Channels: Mono (sufficient for recitation)
Variable Bitrate (VBR): Yes (better quality-to-size ratio)
Normalization: -14 LUFS (consistent volume across reciters)
```

**Streaming vs. Download**:
```typescript
class AudioStreamManager {
  // Use range requests for streaming
  async streamAudio(url: string) {
    const audio = new Audio();
    audio.preload = 'metadata'; // Load only metadata initially
    audio.src = url;

    // Start playing as soon as possible
    audio.play();

    return audio;
  }

  // Download for offline (user-initiated)
  async downloadAudio(url: string, cacheKey: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    // Store in Cache API
    const cache = await caches.open('quran-audio-v1');
    cache.put(cacheKey, new Response(blob));

    return blob;
  }
}
```

### 4.6 Build Pipeline Automation

**GitHub Actions Workflow**:
```yaml
# .github/workflows/build-optimize.yml
name: Build & Optimize

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build production bundle
        run: npm run build

      - name: Optimize images
        run: npm run optimize:images

      - name: Analyze bundle size
        run: npm run analyze:bundle

      - name: Run Lighthouse CI
        run: npm run lighthouse

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: production-build
          path: dist/

      - name: Check bundle size limits
        run: npm run check:bundle-size
```

---

## Caching Strategies

### 5.1 Memory Cache (Runtime)

**In-Memory Caching Architecture**:
```typescript
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private ttl: number; // Time to live in ms

  constructor(maxSize = 100, ttl = 3600000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, value: T): void {
    // Implement LRU eviction
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}
```

**Zustand Store with Memory Cache**:
```typescript
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface QuranStore {
  cachedVerses: Map<string, Verse[]>;
  cachedAudio: Map<string, AudioBuffer>;
  cacheVerse: (key: string, verses: Verse[]) => void;
  getCachedVerse: (key: string) => Verse[] | null;
}

export const useQuranStore = create<QuranStore>()(
  persist(
    (set, get) => ({
      cachedVerses: new Map(),
      cachedAudio: new Map(),

      cacheVerse: (key, verses) => {
        const cache = get().cachedVerses;
        cache.set(key, verses);
        set({ cachedVerses: new Map(cache) });
      },

      getCachedVerse: (key) => {
        return get().cachedVerses.get(key) || null;
      },
    }),
    {
      name: 'quran-memory-cache',
      // Don't persist memory cache (transient)
      partialize: (state) => ({}),
    }
  )
);
```

### 5.2 Disk Cache (IndexedDB)

**IndexedDB Wrapper for Quran Data**:
```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QuranDB extends DBSchema {
  verses: {
    key: string;
    value: {
      surah: number;
      verse: number;
      text: string;
      page: number;
      juz: number;
    };
    indexes: { 'by-page': number; 'by-juz': number };
  };
  translations: {
    key: string;
    value: {
      id: string;
      language: string;
      text: string;
    };
  };
  audio: {
    key: string;
    value: {
      reciter: string;
      surah: number;
      verse: number;
      blob: Blob;
    };
  };
}

class QuranIndexedDB {
  private db: IDBPDatabase<QuranDB> | null = null;

  async init() {
    this.db = await openDB<QuranDB>('quran-db', 1, {
      upgrade(db) {
        // Verses store
        const versesStore = db.createObjectStore('verses', { keyPath: 'key' });
        versesStore.createIndex('by-page', 'page');
        versesStore.createIndex('by-juz', 'juz');

        // Translations store
        db.createObjectStore('translations', { keyPath: 'key' });

        // Audio store
        db.createObjectStore('audio', { keyPath: 'key' });
      },
    });
  }

  async cacheVerse(surah: number, verse: number, data: any) {
    const key = `${surah}-${verse}`;
    await this.db?.put('verses', { key, ...data });
  }

  async getVerse(surah: number, verse: number) {
    const key = `${surah}-${verse}`;
    return await this.db?.get('verses', key);
  }

  async getVersesByPage(page: number) {
    return await this.db?.getAllFromIndex('verses', 'by-page', page);
  }

  async cacheAudio(reciter: string, surah: number, verse: number, blob: Blob) {
    const key = `${reciter}-${surah}-${verse}`;
    await this.db?.put('audio', { key, reciter, surah, verse, blob });
  }

  async getAudio(reciter: string, surah: number, verse: number) {
    const key = `${reciter}-${surah}-${verse}`;
    return await this.db?.get('audio', key);
  }

  // Clear cache for storage management
  async clearCache(storeName: 'verses' | 'translations' | 'audio') {
    await this.db?.clear(storeName);
  }
}

export const quranDB = new QuranIndexedDB();
```

### 5.3 Service Worker Cache (Offline)

**Multi-Level Cache Strategy**:
```typescript
// service-worker.ts
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache critical assets (app shell)
precacheAndRoute(self.__WB_MANIFEST);

// App shell navigation
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

// Quran text - Cache First (never changes)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/quran/text'),
  new CacheFirst({
    cacheName: 'quran-text-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Translations - Stale While Revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/translations'),
  new StaleWhileRevalidate({
    cacheName: 'translations-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Audio files - Cache First with expiration
registerRoute(
  ({ url }) => url.pathname.includes('/audio/'),
  new CacheFirst({
    cacheName: 'quran-audio-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 300, // ~50 Surahs worth
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
        purgeOnQuotaError: true, // Auto-cleanup on storage limit
      }),
    ],
  })
);

// Images - Cache First with fallback
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
      }),
    ],
  })
);

// API calls - Network First with cache fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache-v1',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);
```

### 5.4 HTTP Cache Headers

**Optimal Cache Headers Configuration**:
```typescript
// Vercel/Netlify config for optimal caching
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/api/quran/text/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/audio/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=2592000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 5.5 Cache Invalidation Strategy

**Versioned Cache Management**:
```typescript
class CacheManager {
  private currentVersion = 'v1.0.0';

  async invalidateOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [
      `quran-text-${this.currentVersion}`,
      `quran-audio-${this.currentVersion}`,
      `translations-${this.currentVersion}`,
    ];

    // Delete old cache versions
    await Promise.all(
      cacheNames
        .filter(name => !currentCaches.includes(name))
        .map(name => caches.delete(name))
    );
  }

  async updateCacheVersion(newVersion: string) {
    // Migrate data to new cache version if needed
    await this.invalidateOldCaches();
    this.currentVersion = newVersion;
  }

  // Manual cache refresh (user-initiated)
  async refreshCache(cacheType: 'text' | 'audio' | 'translations') {
    const cacheName = `quran-${cacheType}-${this.currentVersion}`;
    await caches.delete(cacheName);

    // Trigger re-fetch on next request
    console.log(`Cache ${cacheName} cleared. Will refresh on next request.`);
  }
}
```

---

## Bundle Size Optimization

### 6.1 Dependency Audit

**Regular Dependency Size Analysis**:
```bash
# Install bundle analysis tools
npm install -g webpack-bundle-analyzer
npm install --save-dev source-map-explorer

# Analyze bundle composition
npm run build
npx source-map-explorer 'dist/**/*.js'
```

**Identify Heavy Dependencies**:
```bash
# Use bundlephobia to check package sizes before installing
npx bundle-phobia lodash
npx bundle-phobia moment

# Replace heavy libraries with lighter alternatives
# ❌ Moment.js (280KB) → ✅ date-fns (12KB for needed functions)
# ❌ Lodash (full) (72KB) → ✅ lodash-es (tree-shakeable)
# ❌ Axios (13KB) → ✅ Native fetch (0KB)
```

### 6.2 Tree Shaking Optimization

**ES Modules for Tree Shaking**:
```typescript
// ❌ Bad: CommonJS doesn't tree shake well
const lodash = require('lodash');
const { debounce } = lodash;

// ✅ Good: ES modules enable tree shaking
import { debounce } from 'lodash-es';

// ✅ Better: Import only what you need
import debounce from 'lodash-es/debounce';
```

**Package.json Side Effects**:
```json
{
  "name": "quranapp",
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.ts"
  ]
}
```

### 6.3 Code Splitting Best Practices

**Dynamic Imports with Magic Comments**:
```typescript
// Webpack magic comments for better control
const AudioPlayer = lazy(() =>
  import(
    /* webpackChunkName: "audio-player" */
    /* webpackPrefetch: true */
    './components/Audio/AudioPlayer'
  )
);

const Charts = lazy(() =>
  import(
    /* webpackChunkName: "charts" */
    /* webpackPreload: true */
    'recharts'
  )
);
```

### 6.4 Polyfill Strategy

**Conditional Polyfills**:
```typescript
// Only load polyfills if needed
async function loadPolyfills() {
  const needsIntersectionObserver = !('IntersectionObserver' in window);
  const needsFetch = !('fetch' in window);

  if (needsIntersectionObserver) {
    await import('intersection-observer');
  }

  if (needsFetch) {
    await import('whatwg-fetch');
  }
}

// Load polyfills before app initialization
loadPolyfills().then(() => {
  // Initialize React app
  ReactDOM.render(<App />, document.getElementById('root'));
});
```

### 6.5 Bundle Splitting Configuration

**Optimal Chunk Strategy**:
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }

            // UI components
            if (id.includes('@radix-ui') || id.includes('shadcn')) {
              return 'vendor-ui';
            }

            // Heavy libraries
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }

            if (id.includes('howler')) {
              return 'vendor-audio';
            }

            // Everything else
            return 'vendor-common';
          }

          // Feature-based chunks
          if (id.includes('src/components/Audio')) {
            return 'feature-audio';
          }

          if (id.includes('src/components/Memorization')) {
            return 'feature-memorization';
          }

          if (id.includes('src/components/Search')) {
            return 'feature-search';
          }
        },
      },
    },
  },
};
```

### 6.6 Bundle Size CI/CD Checks

**Automated Bundle Size Monitoring**:
```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  check-size:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check bundle size
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          build_script: npm run build
          script: npm run size

      - name: Comment PR with bundle size
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const sizeReport = fs.readFileSync('size-report.txt', 'utf8');

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Bundle Size Report\n\n${sizeReport}`
            });
```

---

## Performance Monitoring

### 7.1 Real User Monitoring (RUM)

**Web Vitals Integration**:
```typescript
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics service (e.g., Google Analytics)
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

// Monitor all Core Web Vitals
onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**Performance Observer API**:
```typescript
class PerformanceMonitor {
  constructor() {
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeLongTasks();
  }

  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      this.reportMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime);
        this.reportMetric('FID', entry.processingStart - entry.startTime);
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  }

  observeCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }

      console.log('CLS:', clsValue);
      this.reportMetric('CLS', clsValue);
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  }

  observeLongTasks() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        console.warn('Long Task detected:', entry.duration);
        this.reportMetric('LongTask', entry.duration);
      });
    });

    observer.observe({ type: 'longtask', buffered: true });
  }

  reportMetric(name: string, value: number) {
    // Send to analytics backend
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value, timestamp: Date.now() }),
    });
  }
}

// Initialize monitoring
const perfMonitor = new PerformanceMonitor();
```

### 7.2 Error Tracking & Reporting

**Sentry Integration**:
```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: import.meta.env.MODE,

  // Filter out noise
  beforeSend(event, hint) {
    // Don't send errors in development
    if (import.meta.env.DEV) {
      return null;
    }

    // Filter out known third-party errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }

    return event;
  },
});
```

### 7.3 Custom Performance Metrics

**Navigation Timing API**:
```typescript
class CustomMetrics {
  measurePageLoad() {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    console.log('Page Load Time:', pageLoadTime);
    console.log('Connect Time:', connectTime);
    console.log('Render Time:', renderTime);

    return {
      pageLoadTime,
      connectTime,
      renderTime,
    };
  }

  measureResourceTiming() {
    const resources = window.performance.getEntriesByType('resource');

    resources.forEach((resource) => {
      const timing = {
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type: resource.initiatorType,
      };

      console.log('Resource:', timing);
    });
  }

  // Custom marks and measures
  markFeatureStart(featureName: string) {
    performance.mark(`${featureName}-start`);
  }

  markFeatureEnd(featureName: string) {
    performance.mark(`${featureName}-end`);
    performance.measure(
      featureName,
      `${featureName}-start`,
      `${featureName}-end`
    );

    const measure = performance.getEntriesByName(featureName)[0];
    console.log(`${featureName} took ${measure.duration}ms`);
  }
}

// Usage
const metrics = new CustomMetrics();
metrics.markFeatureStart('audio-load');
// ... load audio
metrics.markFeatureEnd('audio-load');
```

### 7.4 Lighthouse CI Integration

**Automated Lighthouse Audits**:
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/mushaf
            http://localhost:3000/search
          uploadArtifacts: true
          temporaryPublicStorage: true

          # Fail if any score < 90
          budgetPath: ./lighthouse-budget.json

      - name: Comment PR with Lighthouse results
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('.lighthouseci/results.json'));

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Lighthouse Results\n\n${formatResults(results)}`
            });
```

**Lighthouse Budget Configuration**:
```json
// lighthouse-budget.json
[
  {
    "path": "/*",
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 500
      },
      {
        "resourceType": "stylesheet",
        "budget": 50
      },
      {
        "resourceType": "image",
        "budget": 200
      },
      {
        "resourceType": "font",
        "budget": 100
      },
      {
        "resourceType": "total",
        "budget": 1000
      }
    ],
    "resourceCounts": [
      {
        "resourceType": "script",
        "budget": 15
      },
      {
        "resourceType": "stylesheet",
        "budget": 5
      },
      {
        "resourceType": "third-party",
        "budget": 10
      }
    ],
    "timings": [
      {
        "metric": "interactive",
        "budget": 3000
      },
      {
        "metric": "first-contentful-paint",
        "budget": 1500
      },
      {
        "metric": "largest-contentful-paint",
        "budget": 2500
      }
    ]
  }
]
```

### 7.5 Performance Dashboard

**Custom Performance Dashboard**:
```typescript
interface PerformanceMetrics {
  timestamp: number;
  page: string;
  metrics: {
    FCP: number;
    LCP: number;
    FID: number;
    CLS: number;
    TTI: number;
    TTFB: number;
  };
  deviceType: 'mobile' | 'desktop';
  connection: string;
}

class PerformanceDashboard {
  private metrics: PerformanceMetrics[] = [];

  async fetchMetrics(timeRange: 'day' | 'week' | 'month') {
    const response = await fetch(`/api/analytics/performance?range=${timeRange}`);
    this.metrics = await response.json();
    return this.metrics;
  }

  calculateAverages() {
    const totals = this.metrics.reduce(
      (acc, metric) => ({
        FCP: acc.FCP + metric.metrics.FCP,
        LCP: acc.LCP + metric.metrics.LCP,
        FID: acc.FID + metric.metrics.FID,
        CLS: acc.CLS + metric.metrics.CLS,
        TTI: acc.TTI + metric.metrics.TTI,
        TTFB: acc.TTFB + metric.metrics.TTFB,
      }),
      { FCP: 0, LCP: 0, FID: 0, CLS: 0, TTI: 0, TTFB: 0 }
    );

    const count = this.metrics.length;

    return {
      FCP: totals.FCP / count,
      LCP: totals.LCP / count,
      FID: totals.FID / count,
      CLS: totals.CLS / count,
      TTI: totals.TTI / count,
      TTFB: totals.TTFB / count,
    };
  }

  identifySlowPages() {
    // Find pages with LCP > 2.5s
    return this.metrics
      .filter((m) => m.metrics.LCP > 2500)
      .map((m) => ({ page: m.page, LCP: m.metrics.LCP }));
  }
}
```

---

## Core Web Vitals Targets

### 8.1 Largest Contentful Paint (LCP)

**Target**: < 2.5 seconds (75th percentile)

**Optimization Strategies**:

1. **Server Response Time** (TTFB < 600ms):
   - Use CDN for static assets
   - Optimize server-side processing
   - Implement edge caching

2. **Resource Load Time**:
   - Preload critical resources
   - Optimize images (WebP, lazy loading)
   - Eliminate render-blocking resources

3. **Client-Side Rendering**:
   - Minimize JavaScript execution
   - Use code splitting
   - Implement SSR/SSG where appropriate

**Implementation**:
```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/amiri-quran.woff2" as="font" crossorigin />
<link rel="preload" href="/api/quran/text/1" as="fetch" crossorigin />

<!-- Optimize LCP element (hero image) -->
<img
  src="/hero.webp"
  alt="Quran"
  fetchpriority="high"
  decoding="async"
  width="1200"
  height="630"
/>
```

**Monitoring**:
```typescript
onLCP((metric) => {
  if (metric.value > 2500) {
    console.warn('LCP exceeds target:', metric);
    // Log to analytics for investigation
    reportMetric('LCP', metric.value);
  }
});
```

### 8.2 First Input Delay (FID)

**Target**: < 100ms (95th percentile)

**Optimization Strategies**:

1. **Minimize JavaScript Execution**:
   - Break up long tasks (> 50ms)
   - Use code splitting
   - Defer non-critical JavaScript

2. **Optimize Event Handlers**:
   - Debounce/throttle frequent events
   - Use passive event listeners
   - Minimize handler complexity

3. **Web Workers**:
   - Offload heavy computations
   - Process data in background

**Implementation**:
```typescript
// Break up long tasks
async function processLargeDataset(data) {
  const chunkSize = 100;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await processChunk(chunk);

    // Yield to browser for user interactions
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

// Use passive event listeners
element.addEventListener('scroll', handleScroll, { passive: true });

// Debounce search input
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);
```

**Monitoring**:
```typescript
onFID((metric) => {
  if (metric.value > 100) {
    console.warn('FID exceeds target:', metric);
    reportMetric('FID', metric.value);
  }
});
```

### 8.3 Cumulative Layout Shift (CLS)

**Target**: < 0.1 (75th percentile)

**Optimization Strategies**:

1. **Reserve Space for Dynamic Content**:
   - Set explicit width/height for images
   - Use aspect-ratio CSS property
   - Avoid inserting content above existing content

2. **Font Loading**:
   - Use font-display: swap
   - Preload critical fonts
   - Match fallback font metrics

3. **Animations**:
   - Prefer transform/opacity (composited properties)
   - Avoid animating layout properties
   - Use will-change sparingly

**Implementation**:
```css
/* Reserve space for images */
.quran-image {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* Font loading strategy */
@font-face {
  font-family: 'Amiri Quran';
  src: url('/fonts/amiri-quran.woff2') format('woff2');
  font-display: swap;
  size-adjust: 100%; /* Match fallback font size */
}

/* Use transforms for animations */
.modal-enter {
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

.modal-enter-active {
  transform: translateY(0);
  opacity: 1;
}
```

**Monitoring**:
```typescript
onCLS((metric) => {
  if (metric.value > 0.1) {
    console.warn('CLS exceeds target:', metric);

    // Log layout shift sources
    metric.entries.forEach((entry) => {
      console.log('Layout shift source:', entry);
    });

    reportMetric('CLS', metric.value);
  }
});
```

### 8.4 First Contentful Paint (FCP)

**Target**: < 1.5 seconds (75th percentile)

**Optimization Strategies**:

1. **Critical CSS**:
   - Inline critical CSS
   - Defer non-critical CSS
   - Eliminate unused styles

2. **Reduce Render-Blocking Resources**:
   - Defer JavaScript
   - Use async/defer attributes
   - Minimize above-the-fold content

3. **Optimize Fonts**:
   - Use system fonts initially
   - Preload critical fonts
   - Font subsetting

**Implementation**:
```html
<!-- Inline critical CSS -->
<style>
  /* Critical above-the-fold styles */
  body { font-family: system-ui; }
  .header { /* ... */ }
  .hero { /* ... */ }
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="/styles/main.css" /></noscript>

<!-- Async JavaScript -->
<script src="/app.js" defer></script>
```

**Monitoring**:
```typescript
onFCP((metric) => {
  if (metric.value > 1500) {
    console.warn('FCP exceeds target:', metric);
    reportMetric('FCP', metric.value);
  }
});
```

### 8.5 Time to First Byte (TTFB)

**Target**: < 600ms (75th percentile)

**Optimization Strategies**:

1. **CDN & Edge Caching**:
   - Use global CDN
   - Implement edge caching
   - Optimize cache headers

2. **Server Optimization**:
   - Optimize database queries
   - Use caching layers (Redis)
   - Implement connection pooling

3. **DNS & SSL**:
   - Use fast DNS provider
   - Enable HTTP/2 or HTTP/3
   - Optimize SSL handshake

**Monitoring**:
```typescript
onTTFB((metric) => {
  if (metric.value > 600) {
    console.warn('TTFB exceeds target:', metric);
    reportMetric('TTFB', metric.value);
  }
});
```

### 8.6 Core Web Vitals Summary Table

| Metric | Target | Maximum | Good (%) | Needs Improvement (%) | Poor (%) |
|--------|--------|---------|----------|----------------------|----------|
| **LCP** | < 2.0s | 2.5s | < 2.5s (75%) | 2.5s - 4.0s (20%) | > 4.0s (5%) |
| **FID** | < 50ms | 100ms | < 100ms (95%) | 100ms - 300ms (4%) | > 300ms (1%) |
| **CLS** | < 0.05 | 0.1 | < 0.1 (75%) | 0.1 - 0.25 (20%) | > 0.25 (5%) |
| **FCP** | < 1.0s | 1.5s | < 1.8s (75%) | 1.8s - 3.0s (20%) | > 3.0s (5%) |
| **TTFB** | < 400ms | 600ms | < 800ms (75%) | 800ms - 1800ms (20%) | > 1800ms (5%) |

**Composite Score Calculation**:
```typescript
function calculateCoreWebVitalsScore(metrics: {
  LCP: number;
  FID: number;
  CLS: number;
}): number {
  // Weighted scoring
  const lcpScore = metrics.LCP < 2500 ? 100 : Math.max(0, 100 - ((metrics.LCP - 2500) / 15));
  const fidScore = metrics.FID < 100 ? 100 : Math.max(0, 100 - ((metrics.FID - 100) / 2));
  const clsScore = metrics.CLS < 0.1 ? 100 : Math.max(0, 100 - ((metrics.CLS - 0.1) * 300));

  // Weighted average (LCP: 50%, FID: 25%, CLS: 25%)
  const compositeScore = (lcpScore * 0.5) + (fidScore * 0.25) + (clsScore * 0.25);

  return Math.round(compositeScore);
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- ✅ Set up bundle analysis tools
- ✅ Configure code splitting
- ✅ Implement service worker
- ✅ Add Lighthouse CI

### Phase 2: Optimization (Weeks 3-4)
- 🔄 Implement lazy loading for images and components
- 🔄 Optimize asset pipeline (images, fonts, audio)
- 🔄 Set up memory and disk caching
- 🔄 Configure HTTP cache headers

### Phase 3: Monitoring (Weeks 5-6)
- 📋 Integrate Web Vitals monitoring
- 📋 Set up Sentry error tracking
- 📋 Create performance dashboard
- 📋 Implement automated alerts

### Phase 4: Refinement (Weeks 7-8)
- 📋 Analyze real-world performance data
- 📋 Optimize based on user metrics
- 📋 Fine-tune cache strategies
- 📋 Document best practices

---

## Maintenance & Continuous Improvement

### Weekly Tasks
- Review Lighthouse CI reports
- Monitor Core Web Vitals
- Check bundle size trends
- Review error logs

### Monthly Tasks
- Dependency audit and updates
- Performance sprint for optimization
- Review and update budgets
- Analyze user feedback

### Quarterly Tasks
- Comprehensive performance audit
- Architecture review
- Update optimization strategies
- Benchmark against competitors

---

## Appendix: Tools & Resources

### Performance Tools
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **Web Vitals**: https://github.com/GoogleChrome/web-vitals
- **Bundle Analyzer**: https://github.com/webpack-contrib/webpack-bundle-analyzer
- **Sentry**: https://sentry.io
- **WebPageTest**: https://www.webpagetest.org

### Optimization Libraries
- **react-window**: Efficient list virtualization
- **idb**: IndexedDB wrapper
- **workbox**: Service worker framework
- **sharp**: Image optimization (Node.js)

### Monitoring Services
- **Google Analytics**: User behavior analytics
- **Vercel Analytics**: Performance monitoring
- **New Relic**: Application performance monitoring
- **Cloudflare Analytics**: CDN performance

---

**Document Status**: ✅ Ready for Implementation

**Next Review**: Post-Phase 2 Completion

**Owner**: Performance Engineering Team

**Last Updated**: November 2025
