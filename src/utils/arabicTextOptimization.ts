/**
 * Arabic Text Rendering Optimization System for QuranApp
 * 
 * Specialized optimization for Arabic text rendering, RTL layout performance,
 * Islamic typography, font loading optimization, and Quran text display enhancement.
 */

// Arabic text optimization configuration
export const ARABIC_OPTIMIZATION_CONFIG = {
  fonts: {
    primary: [
      { family: 'Amiri', weight: '400', style: 'normal', format: 'woff2' },
      { family: 'Amiri', weight: '700', style: 'normal', format: 'woff2' },
      { family: 'Cairo', weight: '400', style: 'normal', format: 'woff2' },
      { family: 'Cairo', weight: '600', style: 'normal', format: 'woff2' },
      { family: 'Scheherazade New', weight: '400', style: 'normal', format: 'woff2' },
    ],
    fallback: ['Arabic Typesetting', 'Traditional Arabic', 'Tahoma', 'Arial Unicode MS'],
    preloadTimeout: 3000, // 3 seconds
    displaySwap: true,
  },
  rendering: {
    enableOptimizations: true,
    useContentVisibility: true,
    enableContainment: true,
    optimizeTextShaping: true,
    enableVirtualization: true,
  },
  layout: {
    preventLayoutShifts: true,
    reserveSpace: true,
    stableLineHeight: true,
    minHeight: '2rem',
  },
  performance: {
    measureRenderTime: true,
    trackLayoutShifts: true,
    monitorFontLoading: true,
    enableCaching: true,
  }
} as const;

// Arabic text performance metrics
export interface ArabicTextMetrics {
  renderTime: number;
  fontLoadTime: number;
  layoutShiftCount: number;
  textMeasurementTime: number;
  rtlPerformance: number;
  cacheHitRate: number;
  fontFallbackRate: number;
  glyphShapingTime: number;
}

// Font loading states
export type FontLoadingState = 'loading' | 'loaded' | 'error' | 'timeout';

// Arabic text optimization utilities
export interface ArabicTextFragment {
  text: string;
  type: 'quran' | 'translation' | 'transliteration' | 'ui';
  language: 'ar' | 'ar-SA' | 'ar-EG' | string;
  direction: 'rtl' | 'ltr';
}

/**
 * Advanced Arabic Text Optimizer for Islamic Applications
 */
export class ArabicTextOptimizer {
  private fontLoadingStates: Map<string, FontLoadingState> = new Map();
  private renderCache: Map<string, CanvasRenderingContext2D> = new Map();
  private performanceMetrics: ArabicTextMetrics = {
    renderTime: 0,
    fontLoadTime: 0,
    layoutShiftCount: 0,
    textMeasurementTime: 0,
    rtlPerformance: 0,
    cacheHitRate: 0,
    fontFallbackRate: 0,
    glyphShapingTime: 0,
  };
  private layoutShiftObserver: PerformanceObserver | null = null;
  private fontObserver: FontFaceObserver | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Arabic text optimization system
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Setup font loading optimization
      await this.setupFontLoadingOptimization();
      
      // Initialize layout shift monitoring
      this.setupLayoutShiftMonitoring();
      
      // Setup text rendering optimization
      this.setupTextRenderingOptimization();
      
      // Initialize RTL performance monitoring
      this.setupRTLPerformanceMonitoring();
      
      // Setup text measurement caching
      this.setupTextMeasurementCaching();
      
      this.isInitialized = true;
      console.log('📝 Arabic Text Optimizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Arabic text optimizer:', error);
    }
  }

  /**
   * Setup advanced font loading optimization
   */
  private async setupFontLoadingOptimization(): Promise<void> {
    // Preload critical Arabic fonts
    await this.preloadArabicFonts();
    
    // Setup font loading monitoring
    this.monitorFontLoading();
    
    // Apply font display optimization
    this.applyFontDisplayOptimization();
  }

  /**
   * Preload critical Arabic fonts with priority
   */
  public async preloadArabicFonts(): Promise<void> {
    const preloadPromises = ARABIC_OPTIMIZATION_CONFIG.fonts.primary.map(async (font) => {
      const fontFace = `${font.weight} ${font.style} ${font.family}`;
      const fontKey = `${font.family}-${font.weight}-${font.style}`;
      
      this.fontLoadingStates.set(fontKey, 'loading');
      
      try {
        const startTime = performance.now();
        
        // Create font preload link
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = `font/${font.format}`;
        link.crossOrigin = 'anonymous';
        link.href = `/fonts/${font.family}-${font.weight}.${font.format}`;
        
        document.head.appendChild(link);
        
        // Monitor font loading with timeout
        const fontLoadPromise = this.waitForFontLoad(fontFace);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Font load timeout')), ARABIC_OPTIMIZATION_CONFIG.fonts.preloadTimeout);
        });
        
        await Promise.race([fontLoadPromise, timeoutPromise]);
        
        const loadTime = performance.now() - startTime;
        this.performanceMetrics.fontLoadTime = Math.max(this.performanceMetrics.fontLoadTime, loadTime);
        this.fontLoadingStates.set(fontKey, 'loaded');
        
        console.log(`📝 Font loaded: ${font.family} (${loadTime.toFixed(2)}ms)`);
      } catch (error) {
        console.warn(`⚠️ Font load failed: ${font.family}`, error);
        this.fontLoadingStates.set(fontKey, 'error');
        this.performanceMetrics.fontFallbackRate++;
      }
    });
    
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Wait for font to load using Font Loading API
   */
  private async waitForFontLoad(fontFace: string): Promise<void> {
    if (!document.fonts) {
      throw new Error('Font Loading API not supported');
    }
    
    await document.fonts.load(fontFace);
    
    // Verify font is actually loaded
    if (!document.fonts.check(fontFace)) {
      throw new Error('Font not loaded properly');
    }
  }

  /**
   * Monitor font loading performance
   */
  private monitorFontLoading(): void {
    if (!document.fonts) return;
    
    document.fonts.addEventListener('loadingdone', () => {
      console.log('📝 All fonts loaded successfully');
    });
    
    document.fonts.addEventListener('loadingerror', (event) => {
      console.warn('⚠️ Font loading error:', event);
      this.performanceMetrics.fontFallbackRate++;
    });
  }

  /**
   * Apply font-display optimization for better performance
   */
  private applyFontDisplayOptimization(): void {
    if (!ARABIC_OPTIMIZATION_CONFIG.fonts.displaySwap) return;
    
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Amiri';
        font-display: swap;
        font-weight: 400;
        font-style: normal;
        src: url('/fonts/Amiri-400.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Amiri';
        font-display: swap;
        font-weight: 700;
        font-style: normal;
        src: url('/fonts/Amiri-700.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Cairo';
        font-display: swap;
        font-weight: 400;
        font-style: normal;
        src: url('/fonts/Cairo-400.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Cairo';
        font-display: swap;
        font-weight: 600;
        font-style: normal;
        src: url('/fonts/Cairo-600.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Scheherazade New';
        font-display: swap;
        font-weight: 400;
        font-style: normal;
        src: url('/fonts/ScheherazadeNew-400.woff2') format('woff2');
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Setup layout shift monitoring for Arabic text
   */
  private setupLayoutShiftMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;
    
    this.layoutShiftObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput && entry.value > 0) {
          this.performanceMetrics.layoutShiftCount++;
          
          // Check if layout shift is related to Arabic text
          if (entry.sources) {
            const arabicRelated = entry.sources.some((source: any) => {
              const element = source.node;
              return element && (
                element.classList.contains('arabic-text') ||
                element.lang === 'ar' ||
                element.dir === 'rtl' ||
                getComputedStyle(element).direction === 'rtl'
              );
            });
            
            if (arabicRelated) {
              console.warn('⚠️ Arabic text caused layout shift:', entry.value);
              this.optimizeLayoutStability();
            }
          }
        }
      });
    });
    
    this.layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Setup text rendering optimization
   */
  private setupTextRenderingOptimization(): void {
    if (!ARABIC_OPTIMIZATION_CONFIG.rendering.enableOptimizations) return;
    
    const optimizationStyles = this.generateOptimizationCSS();
    const style = document.createElement('style');
    style.textContent = optimizationStyles;
    document.head.appendChild(style);
    
    // Apply optimizations to existing elements
    this.applyOptimizationsToExistingElements();
  }

  /**
   * Generate CSS for Arabic text optimization
   */
  private generateOptimizationCSS(): string {
    const fallbackFonts = ARABIC_OPTIMIZATION_CONFIG.fonts.fallback.join(', ');
    
    return `
      /* Arabic Text Base Optimization */
      .arabic-text, .quran-text, [lang="ar"], [dir="rtl"] {
        font-family: 'Amiri', ${fallbackFonts};
        direction: rtl;
        text-align: right;
        unicode-bidi: isolate;
        word-wrap: break-word;
        overflow-wrap: break-word;
        ${ARABIC_OPTIMIZATION_CONFIG.rendering.optimizeTextShaping ? `
          text-rendering: optimizeSpeed;
          font-variant-ligatures: discretionary-ligatures;
          font-feature-settings: "liga" 1, "calt" 1, "kern" 1;
        ` : ''}
        ${ARABIC_OPTIMIZATION_CONFIG.layout.stableLineHeight ? `
          line-height: 1.8;
          min-height: ${ARABIC_OPTIMIZATION_CONFIG.layout.minHeight};
        ` : ''}
      }
      
      /* Performance Optimizations */
      ${ARABIC_OPTIMIZATION_CONFIG.rendering.enableContainment ? `
      .arabic-optimized {
        contain: layout style;
        ${ARABIC_OPTIMIZATION_CONFIG.rendering.useContentVisibility ? 'content-visibility: auto;' : ''}
        ${ARABIC_OPTIMIZATION_CONFIG.layout.reserveSpace ? `contain-intrinsic-size: 0 ${ARABIC_OPTIMIZATION_CONFIG.layout.minHeight};` : ''}
      }
      ` : ''}
      
      /* Quran-specific optimizations */
      .quran-verse {
        font-family: 'Amiri', ${fallbackFonts};
        font-size: clamp(18px, 4vw, 28px);
        line-height: 1.9;
        text-align: right;
        direction: rtl;
        padding: 0.75rem 0;
        border-bottom: 1px solid transparent;
        contain: layout;
        will-change: auto;
      }
      
      /* Translation optimizations */
      .translation-text {
        font-family: 'Cairo', system-ui, sans-serif;
        font-size: clamp(14px, 3vw, 18px);
        line-height: 1.6;
        color: var(--text-secondary);
        contain: layout;
      }
      
      /* RTL layout optimizations */
      .rtl-container {
        direction: rtl;
        text-align: right;
        unicode-bidi: isolate;
      }
      
      .rtl-optimized {
        writing-mode: horizontal-tb;
        text-orientation: mixed;
        direction: rtl;
        text-align: right;
      }
      
      /* Font loading optimization */
      .font-loading {
        font-family: ${fallbackFonts};
        visibility: hidden;
      }
      
      .font-loaded {
        visibility: visible;
        transition: opacity 0.3s ease-in-out;
      }
      
      /* Layout shift prevention */
      ${ARABIC_OPTIMIZATION_CONFIG.layout.preventLayoutShifts ? `
      .layout-stable {
        min-height: ${ARABIC_OPTIMIZATION_CONFIG.layout.minHeight};
        contain: layout;
        content-visibility: auto;
        contain-intrinsic-size: 0 ${ARABIC_OPTIMIZATION_CONFIG.layout.minHeight};
      }
      ` : ''}
      
      /* High contrast and accessibility */
      .arabic-high-contrast {
        text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
        font-weight: 500;
      }
      
      /* Mobile optimizations */
      @media (max-width: 768px) {
        .arabic-text, .quran-text {
          font-size: clamp(16px, 5vw, 24px);
          line-height: 1.7;
        }
        
        .quran-verse {
          font-size: clamp(16px, 5vw, 26px);
          padding: 0.5rem 0;
        }
      }
      
      /* Print optimizations */
      @media print {
        .arabic-text, .quran-text {
          font-family: 'Amiri', 'Times New Roman', serif;
          font-size: 14pt;
          line-height: 1.8;
          text-rendering: optimizeLegibility;
        }
      }
    `;
  }

  /**
   * Apply optimizations to existing Arabic text elements
   */
  private applyOptimizationsToExistingElements(): void {
    // Find all Arabic text elements
    const arabicElements = document.querySelectorAll(`
      .arabic-text,
      .quran-text,
      [lang="ar"],
      [dir="rtl"]
    `);
    
    arabicElements.forEach((element) => {
      this.optimizeElement(element as HTMLElement);
    });
  }

  /**
   * Optimize individual element for Arabic text performance
   */
  public optimizeElement(element: HTMLElement): void {
    // Add optimization classes
    element.classList.add('arabic-optimized');
    
    if (ARABIC_OPTIMIZATION_CONFIG.layout.preventLayoutShifts) {
      element.classList.add('layout-stable');
    }
    
    // Set optimal attributes
    if (!element.getAttribute('lang')) {
      element.setAttribute('lang', 'ar');
    }
    
    if (!element.getAttribute('dir')) {
      element.setAttribute('dir', 'rtl');
    }
    
    // Apply font loading state
    this.applyFontLoadingState(element);
    
    // Setup performance monitoring for this element
    this.setupElementPerformanceMonitoring(element);
  }

  /**
   * Apply font loading state to element
   */
  private applyFontLoadingState(element: HTMLElement): void {
    const primaryFont = ARABIC_OPTIMIZATION_CONFIG.fonts.primary[0];
    const fontKey = `${primaryFont.family}-${primaryFont.weight}-${primaryFont.style}`;
    const fontState = this.fontLoadingStates.get(fontKey);
    
    switch (fontState) {
      case 'loading':
        element.classList.add('font-loading');
        break;
      case 'loaded':
        element.classList.remove('font-loading');
        element.classList.add('font-loaded');
        break;
      case 'error':
      case 'timeout':
        element.classList.remove('font-loading');
        element.style.fontFamily = ARABIC_OPTIMIZATION_CONFIG.fonts.fallback.join(', ');
        break;
    }
  }

  /**
   * Setup performance monitoring for individual elements
   */
  private setupElementPerformanceMonitoring(element: HTMLElement): void {
    if (!ARABIC_OPTIMIZATION_CONFIG.performance.measureRenderTime) return;
    
    // Monitor text changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          this.measureTextRenderTime(element);
        }
      });
    });
    
    observer.observe(element, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  /**
   * Measure text rendering performance
   */
  public async measureTextRenderTime(element: HTMLElement): Promise<number> {
    const startTime = performance.now();
    
    // Force layout calculation
    element.offsetHeight;
    
    // Measure text width (forces text shaping)
    const textWidth = element.scrollWidth;
    
    const renderTime = performance.now() - startTime;
    this.performanceMetrics.renderTime = Math.max(this.performanceMetrics.renderTime, renderTime);
    
    return renderTime;
  }

  /**
   * Setup RTL performance monitoring
   */
  private setupRTLPerformanceMonitoring(): void {
    // Monitor RTL-specific performance issues
    const measureRTLPerformance = () => {
      const rtlElements = document.querySelectorAll('[dir="rtl"], .rtl-optimized');
      let totalRTLTime = 0;
      
      rtlElements.forEach((element) => {
        const startTime = performance.now();
        (element as HTMLElement).offsetHeight; // Force layout
        totalRTLTime += performance.now() - startTime;
      });
      
      this.performanceMetrics.rtlPerformance = totalRTLTime;
    };
    
    // Measure RTL performance periodically
    setInterval(measureRTLPerformance, 5000);
  }

  /**
   * Setup text measurement caching for performance
   */
  private setupTextMeasurementCaching(): void {
    // Create canvas for text measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Cache text measurements
    this.renderCache.set('measurement-canvas', ctx);
  }

  /**
   * Measure Arabic text dimensions with caching
   */
  public measureArabicText(
    text: string, 
    fontFamily: string = 'Amiri', 
    fontSize: string = '18px'
  ): { width: number; height: number } {
    const cacheKey = `${text}-${fontFamily}-${fontSize}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.performanceMetrics.cacheHitRate++;
      return cached;
    }
    
    const startTime = performance.now();
    const ctx = this.renderCache.get('measurement-canvas');
    
    if (!ctx) {
      return { width: 0, height: 0 };
    }
    
    // Configure context for Arabic text
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    
    // Measure text
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    const height = parseInt(fontSize) * 1.8; // Approximate height with line-height
    
    const result = { width, height };
    
    // Cache result
    this.saveToCache(cacheKey, result);
    
    const measurementTime = performance.now() - startTime;
    this.performanceMetrics.textMeasurementTime = Math.max(
      this.performanceMetrics.textMeasurementTime, 
      measurementTime
    );
    
    return result;
  }

  /**
   * Cache management utilities
   */
  private getFromCache(key: string): { width: number; height: number } | null {
    // Simple in-memory cache (could be enhanced with localStorage)
    return (this as any)._measurementCache?.[key] || null;
  }

  private saveToCache(key: string, value: { width: number; height: number }): void {
    if (!(this as any)._measurementCache) {
      (this as any)._measurementCache = {};
    }
    (this as any)._measurementCache[key] = value;
    
    // Limit cache size
    const cache = (this as any)._measurementCache;
    const keys = Object.keys(cache);
    if (keys.length > 1000) {
      // Remove oldest entries (simple FIFO)
      keys.slice(0, 200).forEach(k => delete cache[k]);
    }
  }

  /**
   * Optimize layout stability for Arabic text
   */
  public optimizeLayoutStability(): void {
    const arabicElements = document.querySelectorAll('.arabic-text, .quran-text, [dir="rtl"]');
    
    arabicElements.forEach((element) => {
      const el = element as HTMLElement;
      
      // Set minimum dimensions to prevent layout shifts
      if (!el.style.minHeight) {
        el.style.minHeight = ARABIC_OPTIMIZATION_CONFIG.layout.minHeight;
      }
      
      // Add containment
      if (ARABIC_OPTIMIZATION_CONFIG.rendering.enableContainment) {
        el.style.contain = 'layout style';
      }
      
      // Apply content visibility
      if (ARABIC_OPTIMIZATION_CONFIG.rendering.useContentVisibility) {
        el.style.contentVisibility = 'auto';
        el.style.containIntrinsicSize = `0 ${ARABIC_OPTIMIZATION_CONFIG.layout.minHeight}`;
      }
    });
    
    console.log('📝 Applied layout stability optimizations to Arabic text elements');
  }

  /**
   * Optimize Quran verse display specifically
   */
  public optimizeQuranVerse(element: HTMLElement, verseText: string): void {
    // Apply Quran-specific optimizations
    element.classList.add('quran-verse', 'arabic-optimized', 'layout-stable');
    
    // Set optimal attributes
    element.setAttribute('lang', 'ar');
    element.setAttribute('dir', 'rtl');
    element.setAttribute('data-content-type', 'quran-verse');
    
    // Optimize for length
    if (verseText.length > 200) {
      element.classList.add('long-verse');
      if (ARABIC_OPTIMIZATION_CONFIG.rendering.enableVirtualization) {
        this.setupVirtualization(element);
      }
    }
    
    // Precompute dimensions to prevent layout shifts
    const dimensions = this.measureArabicText(verseText, 'Amiri', '24px');
    element.style.minWidth = `${dimensions.width}px`;
    element.style.minHeight = `${dimensions.height}px`;
  }

  /**
   * Setup virtualization for long Arabic text
   */
  private setupVirtualization(element: HTMLElement): void {
    // Implement virtual scrolling for very long verses
    element.style.contentVisibility = 'auto';
    element.style.containIntrinsicSize = '0 100px';
    
    // Add intersection observer for lazy rendering
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      rootMargin: '100px'
    });
    
    observer.observe(element);
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): ArabicTextMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Generate Arabic text performance report
   */
  public generatePerformanceReport(): string {
    const metrics = this.getPerformanceMetrics();
    
    const fontStates = Array.from(this.fontLoadingStates.entries())
      .map(([font, state]) => `- ${font}: ${state}`)
      .join('\n');
    
    return `
Arabic Text Performance Report
=============================

Rendering Performance:
- Render Time: ${metrics.renderTime.toFixed(2)}ms
- Text Measurement Time: ${metrics.textMeasurementTime.toFixed(2)}ms
- RTL Performance: ${metrics.rtlPerformance.toFixed(2)}ms
- Glyph Shaping Time: ${metrics.glyphShapingTime.toFixed(2)}ms

Font Loading:
- Font Load Time: ${metrics.fontLoadTime.toFixed(2)}ms
- Font Fallback Rate: ${metrics.fontFallbackRate}
${fontStates}

Layout Stability:
- Layout Shift Count: ${metrics.layoutShiftCount}
- Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%

Optimizations Applied:
- Font Display Swap: ${ARABIC_OPTIMIZATION_CONFIG.fonts.displaySwap ? 'Yes' : 'No'}
- Text Shaping Optimization: ${ARABIC_OPTIMIZATION_CONFIG.rendering.optimizeTextShaping ? 'Yes' : 'No'}
- Content Visibility: ${ARABIC_OPTIMIZATION_CONFIG.rendering.useContentVisibility ? 'Yes' : 'No'}
- Layout Containment: ${ARABIC_OPTIMIZATION_CONFIG.rendering.enableContainment ? 'Yes' : 'No'}
- Layout Shift Prevention: ${ARABIC_OPTIMIZATION_CONFIG.layout.preventLayoutShifts ? 'Yes' : 'No'}
    `;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.layoutShiftObserver) {
      this.layoutShiftObserver.disconnect();
    }
    
    this.renderCache.clear();
    this.fontLoadingStates.clear();
    
    // Clear measurement cache
    if ((this as any)._measurementCache) {
      (this as any)._measurementCache = {};
    }
  }
}

// Font Face Observer polyfill interface
interface FontFaceObserver {
  observe(): Promise<void>;
}

// Export singleton instance
export const arabicTextOptimizer = new ArabicTextOptimizer();

// Export utility functions
export const optimizeArabicElement = (element: HTMLElement): void => {
  arabicTextOptimizer.optimizeElement(element);
};

export const optimizeQuranVerse = (element: HTMLElement, verseText: string): void => {
  arabicTextOptimizer.optimizeQuranVerse(element, verseText);
};

export const measureArabicTextDimensions = (
  text: string, 
  fontFamily?: string, 
  fontSize?: string
): { width: number; height: number } => {
  return arabicTextOptimizer.measureArabicText(text, fontFamily, fontSize);
};

export const preloadArabicFonts = (): Promise<void> => {
  return arabicTextOptimizer.preloadArabicFonts();
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).arabicTextOptimizer = arabicTextOptimizer;
  (window as any).optimizeArabicElement = optimizeArabicElement;
  (window as any).optimizeQuranVerse = optimizeQuranVerse;
  (window as any).measureArabicTextDimensions = measureArabicTextDimensions;
}