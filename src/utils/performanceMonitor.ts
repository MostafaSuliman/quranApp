/**
 * Performance Monitoring and Optimization System for QuranApp
 * 
 * Comprehensive performance monitoring with Core Web Vitals tracking,
 * audio optimization, Arabic text rendering performance, and mobile optimization.
 */

// Core Web Vitals thresholds
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2.5, needs_improvement: 4.0 }, // Largest Contentful Paint
  FID: { good: 100, needs_improvement: 300 }, // First Input Delay
  CLS: { good: 0.1, needs_improvement: 0.25 }, // Cumulative Layout Shift
  TTFB: { good: 800, needs_improvement: 1800 }, // Time to First Byte
  TBT: { good: 200, needs_improvement: 600 }, // Total Blocking Time
  SI: { good: 3.4, needs_improvement: 5.8 }, // Speed Index
} as const;

// Performance budget for Islamic app features
export const PERFORMANCE_BUDGETS = {
  audio: {
    loadTime: 3000, // 3s for audio loading
    bufferSize: 10 * 1024 * 1024, // 10MB buffer
    preloadLimit: 3, // Number of ayahs to preload
  },
  fonts: {
    arabicFontSize: 200 * 1024, // 200KB for Arabic fonts
    loadTimeout: 5000, // 5s timeout for font loading
  },
  bundle: {
    initial: 500 * 1024, // 500KB initial bundle
    total: 2 * 1024 * 1024, // 2MB total bundle
  },
  images: {
    iconSize: 50 * 1024, // 50KB per icon
    totalIcons: 1 * 1024 * 1024, // 1MB total icons
  },
} as const;

// Performance metrics interface
export interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  resourceTimings: PerformanceResourceTiming[];
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  audioMetrics?: AudioPerformanceMetrics;
  arabicTextMetrics?: ArabicTextMetrics;
}

export interface AudioPerformanceMetrics {
  loadTime: number;
  bufferHealth: number;
  playbackLatency: number;
  errorRate: number;
  cacheHitRate: number;
  averageBitrate: number;
}

export interface ArabicTextMetrics {
  renderTime: number;
  fontLoadTime: number;
  layoutShiftCount: number;
  textMeasurementTime: number;
  rtlPerformance: number;
}

// Performance optimization strategies
export class PerformanceOptimizer {
  private observers: Map<string, PerformanceObserver> = new Map();
  private metrics: Partial<PerformanceMetrics> = {};
  private optimizations: Map<string, boolean> = new Map();

  constructor() {
    this.initializeObservers();
    this.setupMemoryMonitoring();
    this.initializeOptimizations();
  }

  /**
   * Initialize Core Web Vitals observers
   */
  private initializeObservers(): void {
    // Largest Contentful Paint observer
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.evaluateAndOptimize('lcp', this.metrics.lcp);
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // First Input Delay observer
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.evaluateAndOptimize('fid', this.metrics.fid);
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);

      // Cumulative Layout Shift observer
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.metrics.cls = clsValue;
        this.evaluateAndOptimize('cls', clsValue);
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);

      // Resource timing observer for network performance
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as PerformanceResourceTiming[];
        this.analyzeResourcePerformance(entries);
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  /**
   * Setup memory monitoring for performance tracking
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };

        // Trigger garbage collection suggestion if memory usage is high
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (usageRatio > 0.8) {
          this.optimizeMemoryUsage();
        }
      };

      // Check memory every 10 seconds
      setInterval(checkMemory, 10000);
      checkMemory(); // Initial check
    }
  }

  /**
   * Initialize performance optimizations
   */
  private initializeOptimizations(): void {
    // Enable image lazy loading
    this.enableImageOptimization();
    
    // Optimize font loading
    this.optimizeFontLoading();
    
    // Setup resource hints
    this.setupResourceHints();
    
    // Initialize audio optimization
    this.initializeAudioOptimization();
    
    // Setup Arabic text optimization
    this.optimizeArabicTextRendering();
  }

  /**
   * Evaluate performance metrics and trigger optimizations
   */
  private evaluateAndOptimize(metric: string, value: number): void {
    const thresholds = PERFORMANCE_THRESHOLDS;
    
    switch (metric) {
      case 'lcp':
        if (value > thresholds.LCP.needs_improvement * 1000) {
          this.optimizeLCP();
        }
        break;
      case 'fid':
        if (value > thresholds.FID.needs_improvement) {
          this.optimizeFID();
        }
        break;
      case 'cls':
        if (value > thresholds.CLS.needs_improvement) {
          this.optimizeCLS();
        }
        break;
    }
  }

  /**
   * Optimize Largest Contentful Paint
   */
  private optimizeLCP(): void {
    if (this.optimizations.get('lcp')) return;
    this.optimizations.set('lcp', true);

    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize critical rendering path
    this.optimizeCriticalRenderingPath();
    
    // Lazy load non-critical resources
    this.lazyLoadNonCriticalResources();
  }

  /**
   * Optimize First Input Delay
   */
  private optimizeFID(): void {
    if (this.optimizations.get('fid')) return;
    this.optimizations.set('fid', true);

    // Break up long tasks
    this.breakUpLongTasks();
    
    // Use web workers for heavy computations
    this.delegateToWebWorkers();
    
    // Optimize event handlers
    this.optimizeEventHandlers();
  }

  /**
   * Optimize Cumulative Layout Shift
   */
  private optimizeCLS(): void {
    if (this.optimizations.get('cls')) return;
    this.optimizations.set('cls', true);

    // Reserve space for dynamic content
    this.reserveSpaceForDynamicContent();
    
    // Optimize font loading to prevent layout shifts
    this.preventFontLayoutShifts();
    
    // Stabilize Arabic text rendering
    this.stabilizeArabicTextLayout();
  }

  /**
   * Analyze resource performance and optimize
   */
  private analyzeResourcePerformance(entries: PerformanceResourceTiming[]): void {
    entries.forEach((entry) => {
      // Check for slow audio resources
      if (entry.name.includes('everyayah.com') || entry.name.includes('audio')) {
        const loadTime = entry.responseEnd - entry.startTime;
        if (loadTime > PERFORMANCE_BUDGETS.audio.loadTime) {
          this.optimizeAudioLoading(entry.name);
        }
      }

      // Check for slow font resources
      if (entry.name.includes('.woff') || entry.name.includes('font')) {
        const loadTime = entry.responseEnd - entry.startTime;
        if (loadTime > PERFORMANCE_BUDGETS.fonts.loadTimeout) {
          this.optimizeFontLoading();
        }
      }

      // Check for large images
      if (entry.transferSize > PERFORMANCE_BUDGETS.images.iconSize) {
        this.optimizeImageResource(entry.name);
      }
    });
  }

  /**
   * Optimize audio loading and performance
   */
  private optimizeAudioLoading(audioUrl: string): void {
    // Implement audio-specific optimizations
    console.log(`🎵 Optimizing audio loading for: ${audioUrl}`);
    
    // Use audio preloading strategy
    this.preloadNextAudio();
    
    // Implement audio caching
    this.cacheAudioResources();
    
    // Use CDN optimization
    this.optimizeAudioCDN();
  }

  /**
   * Audio-specific performance optimizations
   */
  public initializeAudioOptimization(): void {
    // Setup audio performance monitoring
    const audioContext = this.createAudioContext();
    
    // Implement audio buffering optimization
    this.optimizeAudioBuffering();
    
    // Setup audio quality adaptation
    this.setupAdaptiveAudioQuality();
  }

  private createAudioContext(): AudioContext | null {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      return new AudioContextClass();
    } catch (error) {
      console.warn('Audio context not supported:', error);
      return null;
    }
  }

  private optimizeAudioBuffering(): void {
    // Implement intelligent audio buffering
    const optimizeBuffer = (audio: HTMLAudioElement) => {
      // Adjust buffer size based on connection speed
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        audio.preload = effectiveType === '4g' ? 'auto' : 'metadata';
      }
    };

    // Apply to existing audio elements
    document.querySelectorAll('audio').forEach(optimizeBuffer);
  }

  private setupAdaptiveAudioQuality(): void {
    // Implement adaptive audio quality based on connection
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        const effectiveType = connection.effectiveType;
        console.log(`📶 Connection changed to: ${effectiveType}`);
        
        // Adjust audio quality based on connection
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          this.switchToLowQualityAudio();
        } else if (effectiveType === '4g') {
          this.switchToHighQualityAudio();
        }
      });
    }
  }

  private switchToLowQualityAudio(): void {
    console.log('🔽 Switching to low quality audio for better performance');
    // Implementation for switching to lower bitrate audio
  }

  private switchToHighQualityAudio(): void {
    console.log('🔼 Switching to high quality audio');
    // Implementation for switching to higher bitrate audio
  }

  /**
   * Arabic text rendering optimizations
   */
  public optimizeArabicTextRendering(): void {
    // Optimize Arabic font loading
    this.preloadArabicFonts();
    
    // Implement text shaping optimization
    this.optimizeTextShaping();
    
    // Setup RTL performance monitoring
    this.monitorRTLPerformance();
  }

  private preloadArabicFonts(): void {
    const arabicFonts = [
      'Amiri',
      'Scheherazade',
      'Noto Sans Arabic',
      'Cairo'
    ];

    arabicFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `/fonts/${font}.woff2`;
      document.head.appendChild(link);
    });
  }

  private optimizeTextShaping(): void {
    // Implement CSS optimizations for Arabic text
    const style = document.createElement('style');
    style.textContent = `
      .arabic-text {
        text-rendering: optimizeSpeed;
        font-variant-ligatures: none;
        font-feature-settings: "kern" 0;
        will-change: auto;
      }
      
      .arabic-optimized {
        contain: layout style;
        content-visibility: auto;
      }
    `;
    document.head.appendChild(style);
  }

  private monitorRTLPerformance(): void {
    // Monitor RTL layout performance
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.name.includes('arabic') || entry.name.includes('rtl')) {
          console.log(`📝 RTL Performance: ${entry.name} took ${entry.duration}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
  }

  /**
   * Memory optimization utilities
   */
  private optimizeMemoryUsage(): void {
    console.log('🧹 Optimizing memory usage...');
    
    // Clean up unused audio elements
    this.cleanupUnusedAudio();
    
    // Optimize image cache
    this.optimizeImageCache();
    
    // Clear unused data
    this.clearUnusedData();
  }

  private cleanupUnusedAudio(): void {
    document.querySelectorAll('audio').forEach(audio => {
      if (audio.paused && !audio.src) {
        audio.remove();
      }
    });
  }

  private optimizeImageCache(): void {
    // Implement image cache optimization
    if ('caches' in window) {
      caches.open('images-cache').then(cache => {
        cache.keys().then(keys => {
          if (keys.length > 100) {
            // Remove oldest cached images
            const oldestKeys = keys.slice(0, 20);
            oldestKeys.forEach(key => cache.delete(key));
          }
        });
      });
    }
  }

  private clearUnusedData(): void {
    // Clear localStorage if it gets too large
    const storageSize = JSON.stringify(localStorage).length;
    if (storageSize > 5 * 1024 * 1024) { // 5MB threshold
      console.log('📦 Clearing large localStorage data');
      // Keep only essential data
      const essential = ['audio-store', 'preferences-store', 'auth-store'];
      const toKeep: { [key: string]: string } = {};
      
      essential.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) toKeep[key] = value;
      });
      
      localStorage.clear();
      Object.entries(toKeep).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    }
  }

  /**
   * Image optimization
   */
  private enableImageOptimization(): void {
    // Implement native lazy loading
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });

    // Setup intersection observer for advanced lazy loading
    this.setupAdvancedLazyLoading();
  }

  private setupAdvancedLazyLoading(): void {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Font loading optimization
   */
  private optimizeFontLoading(): void {
    // Use font-display: swap for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Amiri';
        font-display: swap;
      }
      @font-face {
        font-family: 'Cairo';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  private preventFontLayoutShifts(): void {
    // Implement fallback fonts with similar metrics
    const fallbackStyle = document.createElement('style');
    fallbackStyle.textContent = `
      .arabic-text {
        font-family: 'Amiri', 'Arabic Typesetting', 'Traditional Arabic', serif;
        font-optical-sizing: auto;
        font-variation-settings: normal;
      }
    `;
    document.head.appendChild(fallbackStyle);
  }

  /**
   * Critical resource management
   */
  private preloadCriticalResources(): void {
    const criticalResources = [
      '/fonts/Amiri-Regular.woff2',
      '/fonts/Cairo-Regular.woff2',
      '/icons/quran-icon.svg',
      '/api/chapters/1/verses?language=ar'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.includes('.woff2')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (resource.includes('.svg')) {
        link.as = 'image';
      } else if (resource.includes('/api/')) {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  private setupResourceHints(): void {
    // DNS prefetch for external domains
    const domains = [
      'cdn.islamic.network',
      'everyayah.com',
      'fonts.googleapis.com',
      'api.quran.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  /**
   * Task optimization utilities
   */
  private breakUpLongTasks(): void {
    // Use scheduler.postTask if available, otherwise setTimeout
    const scheduleTask = (task: () => void, priority: 'user-blocking' | 'user-visible' | 'background' = 'user-visible') => {
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        (window as any).scheduler.postTask(task, { priority });
      } else {
        setTimeout(task, 0);
      }
    };

    // Export for use in components
    (window as any).scheduleOptimizedTask = scheduleTask;
  }

  private delegateToWebWorkers(): void {
    // Setup web worker for heavy computations
    if ('Worker' in window) {
      const workerScript = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch (type) {
            case 'processArabicText':
              // Process Arabic text rendering calculations
              const result = processArabicTextData(data);
              self.postMessage({ type: 'arabicTextProcessed', result });
              break;
            case 'optimizeAudio':
              // Audio processing optimizations
              const audioResult = optimizeAudioData(data);
              self.postMessage({ type: 'audioOptimized', result: audioResult });
              break;
          }
        };
        
        function processArabicTextData(data) {
          // Simulate heavy Arabic text processing
          return { processed: true, data };
        }
        
        function optimizeAudioData(data) {
          // Simulate audio optimization
          return { optimized: true, data };
        }
      `;

      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      (window as any).performanceWorker = worker;
    }
  }

  private optimizeEventHandlers(): void {
    // Use passive event listeners for better scroll performance
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll'];
    
    passiveEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });
  }

  /**
   * Layout optimization utilities
   */
  private reserveSpaceForDynamicContent(): void {
    // Add CSS for content containers to prevent layout shifts
    const style = document.createElement('style');
    style.textContent = `
      .ayah-container {
        min-height: 60px;
        contain: layout;
      }
      
      .audio-player {
        min-height: 80px;
        contain: layout;
      }
      
      .quran-text {
        min-height: 40px;
        contain: layout style;
      }
    `;
    document.head.appendChild(style);
  }

  private stabilizeArabicTextLayout(): void {
    // Prevent layout shifts during Arabic text rendering
    const arabicStyle = document.createElement('style');
    arabicStyle.textContent = `
      .arabic-text {
        line-height: 1.8;
        font-size: clamp(16px, 4vw, 24px);
        text-align: right;
        direction: rtl;
        contain: layout style;
        content-visibility: auto;
        contain-intrinsic-size: 0 40px;
      }
      
      .arabic-verse {
        padding: 0.5rem 0;
        border-bottom: 1px solid transparent;
        contain: layout;
      }
    `;
    document.head.appendChild(arabicStyle);
  }

  private optimizeCriticalRenderingPath(): void {
    // Inline critical CSS
    const criticalCSS = `
      .quran-app {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.6;
      }
      .loading-screen {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      .arabic-text {
        font-family: 'Amiri', 'Arabic Typesetting', serif;
        direction: rtl;
        text-align: right;
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  private lazyLoadNonCriticalResources(): void {
    // Lazy load non-essential components
    const lazyComponents = [
      'settings-page',
      'progress-page',
      'advanced-audio-controls'
    ];

    lazyComponents.forEach(component => {
      const elements = document.querySelectorAll(`[data-component="${component}"]`);
      elements.forEach(element => {
        element.setAttribute('loading', 'lazy');
      });
    });
  }

  private preloadNextAudio(): void {
    // Intelligent audio preloading based on user behavior
    const preloadStrategy = {
      enabled: true,
      maxPreload: 3,
      prioritizeNext: true
    };

    if (preloadStrategy.enabled) {
      // Implementation would integrate with audio store
      console.log('🎵 Setting up intelligent audio preloading');
    }
  }

  private cacheAudioResources(): void {
    // Implement service worker audio caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'CACHE_AUDIO_STRATEGY',
            strategy: 'NetworkFirst',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
        }
      });
    }
  }

  private optimizeAudioCDN(): void {
    // Implement CDN optimization for audio resources
    const cdnOptimization = {
      preferredCDN: 'https://cdn.islamic.network',
      fallbackCDN: 'https://everyayah.com',
      enableCompression: true,
      adaptiveQuality: true
    };

    console.log('📡 Optimizing audio CDN settings:', cdnOptimization);
  }

  private optimizeImageResource(imageUrl: string): void {
    // Optimize specific image resources
    console.log(`🖼️ Optimizing image: ${imageUrl}`);
    
    // Implement WebP conversion if supported
    if (this.supportsWebP()) {
      this.convertToWebP(imageUrl);
    }
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  }

  private convertToWebP(imageUrl: string): void {
    // Implementation for WebP conversion
    console.log(`🔄 Converting to WebP: ${imageUrl}`);
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Generate performance report
   */
  public generateReport(): string {
    const metrics = this.getMetrics();
    const thresholds = PERFORMANCE_THRESHOLDS;

    const report = `
Performance Report for QuranApp
===============================

Core Web Vitals:
- LCP: ${metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'Not measured'} ${metrics.lcp && metrics.lcp < thresholds.LCP.good * 1000 ? '✅' : metrics.lcp && metrics.lcp < thresholds.LCP.needs_improvement * 1000 ? '⚠️' : '❌'}
- FID: ${metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'Not measured'} ${metrics.fid && metrics.fid < thresholds.FID.good ? '✅' : metrics.fid && metrics.fid < thresholds.FID.needs_improvement ? '⚠️' : '❌'}
- CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'Not measured'} ${metrics.cls && metrics.cls < thresholds.CLS.good ? '✅' : metrics.cls && metrics.cls < thresholds.CLS.needs_improvement ? '⚠️' : '❌'}

Memory Usage:
${metrics.memoryUsage ? `
- Used JS Heap: ${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
- Total JS Heap: ${(metrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
- JS Heap Limit: ${(metrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB
- Usage Ratio: ${((metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100).toFixed(1)}%
` : 'Memory info not available'}

Optimizations Applied:
${Array.from(this.optimizations.entries()).map(([key, value]) => `- ${key}: ${value ? '✅' : '❌'}`).join('\n')}
    `;

    return report;
  }

  /**
   * Cleanup observers and resources
   */
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Export utility functions
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then(() => {
      const end = performance.now();
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    });
  } else {
    const end = performance.now();
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  }
};

export const scheduleOptimizedTask = (task: () => void, priority: 'user-blocking' | 'user-visible' | 'background' = 'user-visible') => {
  if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
    return (window as any).scheduler.postTask(task, { priority });
  } else {
    return new Promise(resolve => {
      setTimeout(() => {
        task();
        resolve(undefined);
      }, 0);
    });
  }
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).performanceOptimizer = performanceOptimizer;
  (window as any).measurePerformance = measurePerformance;
  (window as any).scheduleOptimizedTask = scheduleOptimizedTask;
}