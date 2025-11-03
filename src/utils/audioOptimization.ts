/**
 * Advanced Audio Optimization System for QuranApp
 * 
 * Specialized audio performance optimizations for Quran recitation,
 * including intelligent preloading, adaptive quality, CDN optimization,
 * and Islamic audio experience enhancements.
 */

import { Reciter } from '../types/quran';

// Audio optimization configuration
export const AUDIO_OPTIMIZATION_CONFIG = {
  preloading: {
    enabled: true,
    maxPreloadCount: 5,
    preloadDistance: 3, // How many ayahs ahead to preload
    maxPreloadSize: 50 * 1024 * 1024, // 50MB max preload cache
  },
  quality: {
    highQuality: { bitrate: 128, format: 'mp3' },
    mediumQuality: { bitrate: 96, format: 'mp3' },
    lowQuality: { bitrate: 64, format: 'mp3' },
    autoAdapt: true,
  },
  buffering: {
    targetBufferTime: 10, // seconds
    maxBufferTime: 30, // seconds
    rebufferThreshold: 2, // seconds
  },
  caching: {
    maxCacheSize: 200 * 1024 * 1024, // 200MB
    cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    preferredCDNs: [
      'https://cdn.islamic.network',
      'https://everyayah.com',
      'https://verses.quran.com'
    ]
  },
  performance: {
    measureLatency: true,
    trackBufferHealth: true,
    monitorCDNPerformance: true,
  }
} as const;

// Audio performance metrics interface
export interface AudioPerformanceMetrics {
  loadingTime: number;
  bufferHealth: number;
  playbackLatency: number;
  errorRate: number;
  cacheHitRate: number;
  cdnResponseTime: number;
  qualityAdaptations: number;
  preloadEfficiency: number;
}

// Connection type interface
export interface ConnectionInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/**
 * Advanced Audio Optimizer for Quran Recitation
 */
export class QuranAudioOptimizer {
  private preloadCache: Map<string, HTMLAudioElement> = new Map();
  private performanceMetrics: AudioPerformanceMetrics = {
    loadingTime: 0,
    bufferHealth: 100,
    playbackLatency: 0,
    errorRate: 0,
    cacheHitRate: 0,
    cdnResponseTime: 0,
    qualityAdaptations: 0,
    preloadEfficiency: 0
  };
  private connectionInfo: ConnectionInfo | null = null;
  private cdnPerformance: Map<string, number> = new Map();
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize audio optimization system
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize AudioContext for advanced audio processing
      this.audioContext = this.createAudioContext();
      
      // Setup connection monitoring
      this.setupConnectionMonitoring();
      
      // Initialize CDN performance tracking
      this.initializeCDNTracking();
      
      // Setup cache management
      this.setupCacheManagement();
      
      this.isInitialized = true;
      console.log('🎵 Quran Audio Optimizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize audio optimizer:', error);
    }
  }

  /**
   * Create AudioContext with fallback support
   */
  private createAudioContext(): AudioContext | null {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      return new AudioContextClass();
    } catch (error) {
      console.warn('🎵 AudioContext not supported, using fallback optimization');
      return null;
    }
  }

  /**
   * Setup network connection monitoring for adaptive quality
   */
  private setupConnectionMonitoring(): void {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      this.updateConnectionInfo(connection);
      
      connection.addEventListener('change', () => {
        this.updateConnectionInfo(connection);
        this.adaptAudioQualityToConnection();
      });
    }
  }

  private updateConnectionInfo(connection: any): void {
    this.connectionInfo = {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false
    };
    
    console.log(`📶 Connection updated: ${this.connectionInfo.effectiveType}, ${this.connectionInfo.downlink}Mbps`);
  }

  /**
   * Initialize CDN performance tracking
   */
  private initializeCDNTracking(): void {
    AUDIO_OPTIMIZATION_CONFIG.caching.preferredCDNs.forEach(cdn => {
      this.cdnPerformance.set(cdn, 1000); // Default 1s response time
    });
  }

  /**
   * Setup intelligent cache management
   */
  private setupCacheManagement(): void {
    // Monitor cache size and automatically clean when needed
    setInterval(() => {
      this.manageCacheSize();
    }, 60000); // Check every minute

    // Setup service worker messaging for cache coordination
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'AUDIO_CACHE_CONFIG',
            config: AUDIO_OPTIMIZATION_CONFIG.caching
          });
        }
      });
    }
  }

  /**
   * Intelligent audio preloading based on user behavior and connection
   */
  public async preloadAyahAudio(
    currentSurah: number,
    currentAyah: number,
    reciter: Reciter,
    direction: 'forward' | 'backward' | 'both' = 'forward'
  ): Promise<void> {
    if (!AUDIO_OPTIMIZATION_CONFIG.preloading.enabled) return;

    const preloadPromises: Promise<void>[] = [];
    const maxPreload = this.getOptimalPreloadCount();

    try {
      if (direction === 'forward' || direction === 'both') {
        for (let i = 1; i <= maxPreload; i++) {
          const nextAyah = currentAyah + i;
          preloadPromises.push(this.preloadSingleAyah(currentSurah, nextAyah, reciter));
        }
      }

      if (direction === 'backward' || direction === 'both') {
        for (let i = 1; i <= Math.min(maxPreload, currentAyah - 1); i++) {
          const prevAyah = currentAyah - i;
          if (prevAyah > 0) {
            preloadPromises.push(this.preloadSingleAyah(currentSurah, prevAyah, reciter));
          }
        }
      }

      await Promise.allSettled(preloadPromises);
      this.updatePreloadEfficiency();
      
      console.log(`🎵 Preloaded audio for Surah ${currentSurah}, around Ayah ${currentAyah}`);
    } catch (error) {
      console.error('❌ Audio preloading failed:', error);
    }
  }

  /**
   * Preload single ayah with optimization
   */
  private async preloadSingleAyah(surah: number, ayah: number, reciter: Reciter): Promise<void> {
    const cacheKey = `${reciter.id}-${surah}-${ayah}`;
    
    if (this.preloadCache.has(cacheKey)) {
      return; // Already preloaded
    }

    try {
      const audioUrl = await this.getOptimizedAudioUrl(reciter.id, surah, ayah);
      const audio = new Audio();
      
      // Configure audio element for optimal preloading
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      const loadPromise = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Preload timeout'));
        }, 10000); // 10s timeout

        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeoutId);
          resolve();
        }, { once: true });

        audio.addEventListener('error', (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }, { once: true });
      });

      audio.src = audioUrl;
      await loadPromise;
      
      this.preloadCache.set(cacheKey, audio);
      this.manageCacheSize();
      
    } catch (error) {
      console.warn(`⚠️ Failed to preload Surah ${surah}, Ayah ${ayah}:`, error);
    }
  }

  /**
   * Get optimal preload count based on connection and memory
   */
  private getOptimalPreloadCount(): number {
    const baseCount = AUDIO_OPTIMIZATION_CONFIG.preloading.maxPreloadCount;
    
    if (!this.connectionInfo) return baseCount;

    // Reduce preload count for slower connections
    switch (this.connectionInfo.effectiveType) {
      case 'slow-2g':
        return Math.max(1, Math.floor(baseCount * 0.2));
      case '2g':
        return Math.max(1, Math.floor(baseCount * 0.4));
      case '3g':
        return Math.max(2, Math.floor(baseCount * 0.7));
      case '4g':
      default:
        return baseCount;
    }
  }

  /**
   * Get optimized audio URL with CDN selection and quality adaptation
   */
  private async getOptimizedAudioUrl(reciterId: string, surah: number, ayah: number): Promise<string> {
    const quality = this.getOptimalQualityForConnection();
    const bestCDN = this.selectBestCDN();
    
    // Format ayah number with leading zeros
    const formattedAyah = ayah.toString().padStart(3, '0');
    const formattedSurah = surah.toString().padStart(3, '0');
    
    const url = `${bestCDN}/${reciterId}/${formattedSurah}${formattedAyah}.mp3`;
    
    // Track CDN performance
    this.trackCDNPerformance(bestCDN, url);
    
    return url;
  }

  /**
   * Select best performing CDN
   */
  private selectBestCDN(): string {
    const cdnEntries = Array.from(this.cdnPerformance.entries());
    cdnEntries.sort((a, b) => a[1] - b[1]); // Sort by response time (ascending)
    
    return cdnEntries[0]?.[0] || AUDIO_OPTIMIZATION_CONFIG.caching.preferredCDNs[0];
  }

  /**
   * Track CDN performance for optimization
   */
  private async trackCDNPerformance(cdn: string, url: string): Promise<void> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const responseTime = performance.now() - startTime;
      
      if (response.ok) {
        this.cdnPerformance.set(cdn, responseTime);
        this.performanceMetrics.cdnResponseTime = responseTime;
      }
    } catch (error) {
      // Penalize failed CDN
      this.cdnPerformance.set(cdn, 10000); // 10s penalty
    }
  }

  /**
   * Get optimal audio quality based on connection
   */
  private getOptimalQualityForConnection(): typeof AUDIO_OPTIMIZATION_CONFIG.quality.highQuality {
    if (!this.connectionInfo || !AUDIO_OPTIMIZATION_CONFIG.quality.autoAdapt) {
      return AUDIO_OPTIMIZATION_CONFIG.quality.highQuality;
    }

    const { effectiveType, downlink, saveData } = this.connectionInfo;

    if (saveData) {
      return AUDIO_OPTIMIZATION_CONFIG.quality.lowQuality;
    }

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return AUDIO_OPTIMIZATION_CONFIG.quality.lowQuality;
      case '3g':
        return downlink > 1.5 
          ? AUDIO_OPTIMIZATION_CONFIG.quality.mediumQuality 
          : AUDIO_OPTIMIZATION_CONFIG.quality.lowQuality;
      case '4g':
      default:
        return downlink > 5 
          ? AUDIO_OPTIMIZATION_CONFIG.quality.highQuality 
          : AUDIO_OPTIMIZATION_CONFIG.quality.mediumQuality;
    }
  }

  /**
   * Adapt audio quality to current connection
   */
  private adaptAudioQualityToConnection(): void {
    const optimalQuality = this.getOptimalQualityForConnection();
    this.performanceMetrics.qualityAdaptations++;
    
    console.log(`🎵 Adapted audio quality to ${optimalQuality.bitrate}kbps for ${this.connectionInfo?.effectiveType} connection`);
    
    // Notify components about quality change
    const event = new CustomEvent('audioQualityChanged', {
      detail: { quality: optimalQuality }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get preloaded audio if available
   */
  public getPreloadedAudio(reciterId: string, surah: number, ayah: number): HTMLAudioElement | null {
    const cacheKey = `${reciterId}-${surah}-${ayah}`;
    return this.preloadCache.get(cacheKey) || null;
  }

  /**
   * Measure audio loading performance
   */
  public async measureAudioLoadingPerformance(audio: HTMLAudioElement): Promise<number> {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const handleLoad = () => {
        const loadTime = performance.now() - startTime;
        this.performanceMetrics.loadingTime = loadTime;
        resolve(loadTime);
        cleanup();
      };

      const handleError = () => {
        const loadTime = performance.now() - startTime;
        this.performanceMetrics.errorRate++;
        resolve(loadTime);
        cleanup();
      };

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', handleLoad);
        audio.removeEventListener('error', handleError);
      };

      audio.addEventListener('canplaythrough', handleLoad, { once: true });
      audio.addEventListener('error', handleError, { once: true });
    });
  }

  /**
   * Monitor buffer health for smooth playback
   */
  public monitorBufferHealth(audio: HTMLAudioElement): void {
    const checkBuffer = () => {
      if (audio.buffered.length > 0) {
        const currentTime = audio.currentTime;
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const bufferAhead = bufferedEnd - currentTime;
        
        const bufferHealth = Math.min(100, (bufferAhead / AUDIO_OPTIMIZATION_CONFIG.buffering.targetBufferTime) * 100);
        this.performanceMetrics.bufferHealth = bufferHealth;
        
        // Trigger preloading if buffer is low
        if (bufferHealth < 30 && !audio.ended) {
          console.log('🎵 Low buffer detected, optimizing...');
          // Could trigger additional preloading here
        }
      }
    };

    // Check buffer health every second during playback
    const bufferCheckInterval = setInterval(() => {
      if (audio.paused || audio.ended) {
        clearInterval(bufferCheckInterval);
        return;
      }
      checkBuffer();
    }, 1000);

    audio.addEventListener('ended', () => {
      clearInterval(bufferCheckInterval);
    }, { once: true });
  }

  /**
   * Optimize audio element for Islamic content
   */
  public optimizeAudioElement(audio: HTMLAudioElement): void {
    // Set optimal attributes for Quran audio
    audio.preload = this.getOptimalPreloadStrategy();
    audio.crossOrigin = 'anonymous';
    
    // Add Islamic audio metadata
    audio.dataset.contentType = 'quran-recitation';
    audio.dataset.optimized = 'true';
    
    // Setup performance monitoring
    this.setupAudioElementMonitoring(audio);
  }

  private getOptimalPreloadStrategy(): 'none' | 'metadata' | 'auto' {
    if (!this.connectionInfo) return 'metadata';
    
    const { effectiveType, saveData } = this.connectionInfo;
    
    if (saveData) return 'none';
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'none';
      case '3g':
        return 'metadata';
      case '4g':
      default:
        return 'auto';
    }
  }

  private setupAudioElementMonitoring(audio: HTMLAudioElement): void {
    // Monitor playback latency
    let playRequestTime = 0;
    const originalPlay = audio.play.bind(audio);
    
    audio.play = () => {
      playRequestTime = performance.now();
      return originalPlay();
    };

    audio.addEventListener('playing', () => {
      if (playRequestTime > 0) {
        const latency = performance.now() - playRequestTime;
        this.performanceMetrics.playbackLatency = latency;
        playRequestTime = 0;
      }
    });

    // Monitor errors
    audio.addEventListener('error', () => {
      this.performanceMetrics.errorRate++;
    });
  }

  /**
   * Manage cache size to stay within limits
   */
  private manageCacheSize(): void {
    const cacheEntries = Array.from(this.preloadCache.entries());
    const maxSize = AUDIO_OPTIMIZATION_CONFIG.preloading.maxPreloadSize;
    
    let currentSize = 0;
    
    // Estimate cache size (approximate)
    cacheEntries.forEach(([, audio]) => {
      // Rough estimate: 1MB per minute of audio at 128kbps
      currentSize += 1024 * 1024; // 1MB estimate per audio file
    });
    
    if (currentSize > maxSize) {
      // Remove oldest entries (simple LRU)
      const entriesToRemove = Math.ceil(cacheEntries.length * 0.2); // Remove 20%
      
      for (let i = 0; i < entriesToRemove; i++) {
        const [key] = cacheEntries[i];
        this.preloadCache.delete(key);
      }
      
      console.log(`🧹 Cleaned audio cache: removed ${entriesToRemove} entries`);
    }
  }

  private updatePreloadEfficiency(): void {
    const totalCached = this.preloadCache.size;
    const targetCount = AUDIO_OPTIMIZATION_CONFIG.preloading.maxPreloadCount;
    
    this.performanceMetrics.preloadEfficiency = Math.min(100, (totalCached / targetCount) * 100);
  }

  /**
   * Clear audio cache
   */
  public clearCache(): void {
    this.preloadCache.clear();
    this.performanceMetrics.preloadEfficiency = 0;
    console.log('🧹 Audio cache cleared');
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): AudioPerformanceMetrics {
    // Calculate cache hit rate
    const cacheAttempts = this.preloadCache.size;
    this.performanceMetrics.cacheHitRate = cacheAttempts > 0 ? 
      (cacheAttempts / (cacheAttempts + this.performanceMetrics.errorRate)) * 100 : 0;
    
    return { ...this.performanceMetrics };
  }

  /**
   * Generate audio performance report
   */
  public generatePerformanceReport(): string {
    const metrics = this.getPerformanceMetrics();
    const connection = this.connectionInfo;
    
    return `
Quran Audio Performance Report
=============================

Connection Info:
- Type: ${connection?.effectiveType || 'Unknown'}
- Speed: ${connection?.downlink || 'N/A'}Mbps
- RTT: ${connection?.rtt || 'N/A'}ms
- Save Data: ${connection?.saveData ? 'Yes' : 'No'}

Performance Metrics:
- Loading Time: ${metrics.loadingTime.toFixed(2)}ms
- Buffer Health: ${metrics.bufferHealth.toFixed(1)}%
- Playback Latency: ${metrics.playbackLatency.toFixed(2)}ms
- Error Rate: ${metrics.errorRate}
- Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%
- CDN Response Time: ${metrics.cdnResponseTime.toFixed(2)}ms
- Quality Adaptations: ${metrics.qualityAdaptations}
- Preload Efficiency: ${metrics.preloadEfficiency.toFixed(1)}%

Cache Status:
- Preloaded Files: ${this.preloadCache.size}
- Cache Limit: ${AUDIO_OPTIMIZATION_CONFIG.preloading.maxPreloadCount}

CDN Performance:
${Array.from(this.cdnPerformance.entries())
  .map(([cdn, time]) => `- ${cdn}: ${time.toFixed(0)}ms`)
  .join('\n')}
    `;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.clearCache();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

// Export singleton instance
export const quranAudioOptimizer = new QuranAudioOptimizer();

// Export utility functions
export const optimizeQuranAudio = async (
  audio: HTMLAudioElement, 
  reciter: Reciter, 
  surah: number, 
  ayah: number
): Promise<void> => {
  quranAudioOptimizer.optimizeAudioElement(audio);
  await quranAudioOptimizer.preloadAyahAudio(surah, ayah, reciter);
  quranAudioOptimizer.monitorBufferHealth(audio);
};

export const measureQuranAudioPerformance = (audio: HTMLAudioElement): Promise<number> => {
  return quranAudioOptimizer.measureAudioLoadingPerformance(audio);
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).quranAudioOptimizer = quranAudioOptimizer;
  (window as any).optimizeQuranAudio = optimizeQuranAudio;
  (window as any).measureQuranAudioPerformance = measureQuranAudioPerformance;
}