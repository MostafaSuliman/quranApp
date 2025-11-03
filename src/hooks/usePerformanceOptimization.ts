// @ts-nocheck
/**
 * React Hook for Performance Optimization in QuranApp
 * 
 * Provides real-time performance monitoring, optimization controls,
 * and automated enhancement strategies for Islamic content rendering.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceOptimizer, PerformanceMetrics, measurePerformance, scheduleOptimizedTask } from '../utils/performanceMonitor';

interface UsePerformanceOptimizationOptions {
  enableAutoOptimization?: boolean;
  enableRealTimeMonitoring?: boolean;
  enableAudioOptimization?: boolean;
  enableArabicTextOptimization?: boolean;
  enableMemoryOptimization?: boolean;
  optimizationThreshold?: {
    lcp?: number;
    fid?: number;
    cls?: number;
    memoryUsage?: number;
  };
}

interface PerformanceState {
  metrics: Partial<PerformanceMetrics>;
  isOptimizing: boolean;
  optimizationsApplied: string[];
  recommendations: string[];
  performanceScore: number;
  trend: 'improving' | 'degrading' | 'stable';
}

interface AudioPerformanceControls {
  preloadNext: (count?: number) => void;
  optimizeBuffer: () => void;
  adaptQuality: (connectionType: string) => void;
  clearAudioCache: () => void;
  measureAudioLatency: () => Promise<number>;
}

interface ArabicTextPerformanceControls {
  optimizeRendering: () => void;
  preloadFonts: () => void;
  measureRenderTime: (text: string) => Promise<number>;
  stabilizeLayout: () => void;
  optimizeRTL: () => void;
}

export const usePerformanceOptimization = (options: UsePerformanceOptimizationOptions = {}) => {
  const {
    enableAutoOptimization = true,
    enableRealTimeMonitoring = true,
    enableAudioOptimization = true,
    enableArabicTextOptimization = true,
    enableMemoryOptimization = true,
    optimizationThreshold = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      memoryUsage: 0.8
    }
  } = options;

  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    metrics: {},
    isOptimizing: false,
    optimizationsApplied: [],
    recommendations: [],
    performanceScore: 0,
    trend: 'stable'
  });

  const metricsHistoryRef = useRef<PerformanceMetrics[]>([]);
  const optimizationIntervalRef = useRef<NodeJS.Timeout>();
  const previousScoreRef = useRef<number>(0);

  /**
   * Calculate performance score based on Core Web Vitals
   */
  const calculatePerformanceScore = useCallback((metrics: Partial<PerformanceMetrics>): number => {
    let score = 100;
    
    // LCP scoring (0-40 points)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 40;
      else if (metrics.lcp > 2500) score -= 20;
      else if (metrics.lcp > 1500) score -= 10;
    }
    
    // FID scoring (0-30 points)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 30;
      else if (metrics.fid > 100) score -= 15;
      else if (metrics.fid > 50) score -= 5;
    }
    
    // CLS scoring (0-30 points)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 30;
      else if (metrics.cls > 0.1) score -= 15;
      else if (metrics.cls > 0.05) score -= 5;
    }
    
    return Math.max(0, score);
  }, []);

  /**
   * Determine performance trend
   */
  const calculateTrend = useCallback((currentScore: number, previousScore: number): 'improving' | 'degrading' | 'stable' => {
    const difference = currentScore - previousScore;
    if (Math.abs(difference) < 5) return 'stable';
    return difference > 0 ? 'improving' : 'degrading';
  }, []);

  /**
   * Generate performance recommendations
   */
  const generateRecommendations = useCallback((metrics: Partial<PerformanceMetrics>): string[] => {
    const recommendations: string[] = [];
    
    if (metrics.lcp && metrics.lcp > optimizationThreshold.lcp!) {
      recommendations.push('Optimize Largest Contentful Paint - consider preloading critical Arabic fonts');
      recommendations.push('Minimize render-blocking resources for faster Quran text display');
    }
    
    if (metrics.fid && metrics.fid > optimizationThreshold.fid!) {
      recommendations.push('Reduce First Input Delay - optimize audio player event handlers');
      recommendations.push('Break up long JavaScript tasks affecting touch responsiveness');
    }
    
    if (metrics.cls && metrics.cls > optimizationThreshold.cls!) {
      recommendations.push('Prevent layout shifts during Arabic text rendering');
      recommendations.push('Reserve space for dynamic Islamic content elements');
    }
    
    if (metrics.memoryUsage) {
      const usageRatio = metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit;
      if (usageRatio > optimizationThreshold.memoryUsage!) {
        recommendations.push('Optimize memory usage - clear unused audio cache');
        recommendations.push('Implement virtual scrolling for long Quran chapters');
      }
    }
    
    return recommendations;
  }, [optimizationThreshold]);

  /**
   * Real-time metrics collection
   */
  const collectMetrics = useCallback(async () => {
    const metrics = performanceOptimizer.getMetrics();
    const score = calculatePerformanceScore(metrics);
    const trend = calculateTrend(score, previousScoreRef.current);
    const recommendations = generateRecommendations(metrics);
    
    // Store metrics history
    if (Object.keys(metrics).length > 0) {
      metricsHistoryRef.current.push(metrics as PerformanceMetrics);
      if (metricsHistoryRef.current.length > 50) {
        metricsHistoryRef.current.shift(); // Keep only last 50 measurements
      }
    }
    
    setPerformanceState(prev => ({
      ...prev,
      metrics,
      performanceScore: score,
      trend,
      recommendations
    }));
    
    previousScoreRef.current = score;
  }, [calculatePerformanceScore, calculateTrend, generateRecommendations]);

  /**
   * Auto-optimization based on thresholds
   */
  const runAutoOptimization = useCallback(async () => {
    if (!enableAutoOptimization) return;
    
    setPerformanceState(prev => ({ ...prev, isOptimizing: true }));
    
    try {
      const metrics = performanceOptimizer.getMetrics();
      const appliedOptimizations: string[] = [];
      
      // LCP optimization
      if (metrics.lcp && metrics.lcp > optimizationThreshold.lcp!) {
        await scheduleOptimizedTask(() => {
          // Preload critical resources
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.href = '/fonts/Amiri-Regular.woff2';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }, 'user-blocking');
        appliedOptimizations.push('Arabic font preloading');
      }
      
      // FID optimization
      if (metrics.fid && metrics.fid > optimizationThreshold.fid!) {
        await scheduleOptimizedTask(() => {
          // Optimize event listeners
          document.querySelectorAll('audio').forEach(audio => {
            if (audio.dataset.optimized !== 'true') {
              const optimizedHandler = (e: Event) => {
                requestIdleCallback(() => {
                  // Process audio events during idle time
                  console.log('🎵 Optimized audio event processing');
                });
              };
              
              audio.addEventListener('timeupdate', optimizedHandler, { passive: true });
              audio.dataset.optimized = 'true';
            }
          });
        }, 'user-visible');
        appliedOptimizations.push('Audio event optimization');
      }
      
      // CLS optimization
      if (metrics.cls && metrics.cls > optimizationThreshold.cls!) {
        await scheduleOptimizedTask(() => {
          // Stabilize Arabic text layout
          const arabicElements = document.querySelectorAll('.arabic-text, .ayah-text');
          arabicElements.forEach(element => {
            if (!(element as HTMLElement).style.minHeight) {
              (element as HTMLElement).style.minHeight = '2rem';
              (element as HTMLElement).style.contain = 'layout';
            }
          });
        }, 'user-visible');
        appliedOptimizations.push('Arabic text layout stabilization');
      }
      
      // Memory optimization
      if (metrics.memoryUsage) {
        const usageRatio = metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit;
        if (usageRatio > optimizationThreshold.memoryUsage!) {
          await scheduleOptimizedTask(() => {
            // Clear unused audio elements
            document.querySelectorAll('audio').forEach(audio => {
              if (audio.paused && !audio.currentSrc && audio.dataset.keepAlive !== 'true') {
                audio.remove();
              }
            });
            
            // Clear image cache if needed
            if ('caches' in window) {
              caches.open('images-cache').then(cache => {
                cache.keys().then(keys => {
                  if (keys.length > 50) {
                    const excessKeys = keys.slice(0, 10);
                    excessKeys.forEach(key => cache.delete(key));
                  }
                });
              });
            }
          }, 'background');
          appliedOptimizations.push('Memory cleanup');
        }
      }
      
      setPerformanceState(prev => ({
        ...prev,
        optimizationsApplied: [...prev.optimizationsApplied, ...appliedOptimizations]
      }));
      
    } catch (error) {
      console.error('❌ Auto-optimization failed:', error);
    } finally {
      setPerformanceState(prev => ({ ...prev, isOptimizing: false }));
    }
  }, [enableAutoOptimization, optimizationThreshold]);

  /**
   * Audio-specific performance controls
   */
  const audioPerformanceControls: AudioPerformanceControls = {
    preloadNext: (count = 3) => {
      measurePerformance('Audio Preloading', () => {
        console.log(`🎵 Preloading next ${count} audio files`);
        // Implementation would integrate with audio store
      });
    },
    
    optimizeBuffer: () => {
      measurePerformance('Audio Buffer Optimization', () => {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          // Optimize buffer size based on connection
          const connection = (navigator as any).connection;
          if (connection) {
            const bufferSize = connection.effectiveType === '4g' ? 'auto' : 'metadata';
            audio.preload = bufferSize;
          }
        });
      });
    },
    
    adaptQuality: (connectionType: string) => {
      measurePerformance('Audio Quality Adaptation', () => {
        console.log(`📶 Adapting audio quality for ${connectionType} connection`);
        // Quality adaptation logic
      });
    },
    
    clearAudioCache: () => {
      measurePerformance('Audio Cache Clear', () => {
        if ('caches' in window) {
          caches.delete('audio-cache').then(() => {
            console.log('🧹 Audio cache cleared');
          });
        }
      });
    },
    
    measureAudioLatency: async () => {
      return measurePerformance('Audio Latency Measurement', async () => {
        const start = performance.now();
        const audio = new Audio();
        
        return new Promise<number>((resolve) => {
          audio.addEventListener('canplaythrough', () => {
            const latency = performance.now() - start;
            resolve(latency);
          });
          
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcZCjaJzfDNfzACGGS57OCpXBELTaLh69pqGgg+ltryxo0vBytlu+zTgSoGHmO37Ny5VA0PY7vs051RA0Gv5NqwZgoQY7ns3L9rEAA+kdXwz' // Minimal audio data for testing
        });
      }) as Promise<number>;
    }
  };

  /**
   * Arabic text performance controls
   */
  const arabicTextPerformanceControls: ArabicTextPerformanceControls = {
    optimizeRendering: () => {
      measurePerformance('Arabic Text Rendering Optimization', () => {
        const style = document.createElement('style');
        style.textContent = `
          .arabic-optimized {
            text-rendering: optimizeSpeed;
            font-variant-ligatures: none;
            font-feature-settings: "kern" 0;
            contain: layout style;
            content-visibility: auto;
          }
        `;
        document.head.appendChild(style);
        
        // Apply optimization class to Arabic text elements
        document.querySelectorAll('.arabic-text, .ayah-text').forEach(element => {
          element.classList.add('arabic-optimized');
        });
      });
    },
    
    preloadFonts: () => {
      measurePerformance('Arabic Font Preloading', () => {
        const arabicFonts = ['Amiri', 'Cairo', 'Scheherazade'];
        arabicFonts.forEach(font => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
          link.href = `/fonts/${font}-Regular.woff2`;
          document.head.appendChild(link);
        });
      });
    },
    
    measureRenderTime: async (text: string) => {
      return measurePerformance('Arabic Text Render Time', async () => {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.visibility = 'hidden';
        container.style.fontFamily = 'Amiri';
        container.style.fontSize = '18px';
        container.style.direction = 'rtl';
        container.textContent = text;
        
        const start = performance.now();
        document.body.appendChild(container);
        
        // Force layout calculation
        container.offsetHeight;
        
        const renderTime = performance.now() - start;
        document.body.removeChild(container);
        
        return renderTime;
      }) as Promise<number>;
    },
    
    stabilizeLayout: () => {
      measurePerformance('Arabic Layout Stabilization', () => {
        const style = document.createElement('style');
        style.textContent = `
          .arabic-stable {
            line-height: 1.8;
            min-height: 2rem;
            contain: layout;
            content-visibility: auto;
            contain-intrinsic-size: 0 2rem;
          }
        `;
        document.head.appendChild(style);
        
        document.querySelectorAll('.arabic-text, .ayah-text').forEach(element => {
          element.classList.add('arabic-stable');
        });
      });
    },
    
    optimizeRTL: () => {
      measurePerformance('RTL Optimization', () => {
        const style = document.createElement('style');
        style.textContent = `
          .rtl-optimized {
            direction: rtl;
            text-align: right;
            unicode-bidi: isolate;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
        `;
        document.head.appendChild(style);
        
        document.querySelectorAll('[dir="rtl"], .arabic-text').forEach(element => {
          element.classList.add('rtl-optimized');
        });
      });
    }
  };

  /**
   * Manual optimization triggers
   */
  const manualOptimization = {
    optimizeAll: async () => {
      setPerformanceState(prev => ({ ...prev, isOptimizing: true }));
      
      try {
        if (enableAudioOptimization) {
          audioPerformanceControls.optimizeBuffer();
        }
        
        if (enableArabicTextOptimization) {
          arabicTextPerformanceControls.optimizeRendering();
          arabicTextPerformanceControls.stabilizeLayout();
          arabicTextPerformanceControls.optimizeRTL();
        }
        
        if (enableMemoryOptimization) {
          audioPerformanceControls.clearAudioCache();
        }
        
        setPerformanceState(prev => ({
          ...prev,
          optimizationsApplied: [...prev.optimizationsApplied, 'Manual optimization complete']
        }));
        
      } finally {
        setPerformanceState(prev => ({ ...prev, isOptimizing: false }));
      }
    },
    
    measureCurrentPerformance: () => collectMetrics(),
    
    generateReport: () => performanceOptimizer.generateReport(),
    
    resetOptimizations: () => {
      setPerformanceState(prev => ({
        ...prev,
        optimizationsApplied: [],
        recommendations: []
      }));
    }
  };

  /**
   * Setup performance monitoring
   */
  useEffect(() => {
    if (enableRealTimeMonitoring) {
      // Initial metrics collection
      collectMetrics();
      
      // Set up regular monitoring
      optimizationIntervalRef.current = setInterval(() => {
        collectMetrics();
        runAutoOptimization();
      }, 5000); // Check every 5 seconds
      
      return () => {
        if (optimizationIntervalRef.current) {
          clearInterval(optimizationIntervalRef.current);
        }
      };
    }
  }, [enableRealTimeMonitoring, collectMetrics, runAutoOptimization]);

  /**
   * Initialize optimizations on mount
   */
  useEffect(() => {
    if (enableAudioOptimization) {
      audioPerformanceControls.preloadFonts?.();
    }
    
    if (enableArabicTextOptimization) {
      arabicTextPerformanceControls.preloadFonts();
    }
  }, [enableAudioOptimization, enableArabicTextOptimization]);

  return {
    // Performance state
    performanceState,
    metricsHistory: metricsHistoryRef.current,
    
    // Audio controls
    audioPerformance: audioPerformanceControls,
    
    // Arabic text controls
    arabicTextPerformance: arabicTextPerformanceControls,
    
    // Manual controls
    manualOptimization,
    
    // Utilities
    measurePerformance,
    scheduleOptimizedTask
  };
};

export default usePerformanceOptimization;
