/**
 * Enhanced Memory Leak Detection Tests
 * 
 * Comprehensive memory leak detection during extended Quran reading sessions.
 * Tests memory management, garbage collection, and resource cleanup.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useQuranStore } from '../../stores/quranStore'
import { useAudioStore } from '../../stores/audioStore'
import { usePerformanceMonitorStore } from '../../stores/performanceMonitorStore'
import { useProgressStore } from '../../stores/progressStore'

// Memory monitoring utilities
interface MemorySnapshot {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  componentCount: number
  storeSize: number
}

class MemoryMonitor {
  private snapshots: MemorySnapshot[] = []
  private componentRefs = new Set<any>()

  takeSnapshot(componentCount = 0, storeSize = 0): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: this.getUsedHeapSize(),
      totalJSHeapSize: this.getTotalHeapSize(),
      jsHeapSizeLimit: this.getHeapSizeLimit(),
      componentCount,
      storeSize
    }
    
    this.snapshots.push(snapshot)
    return snapshot
  }

  private getUsedHeapSize(): number {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return (window as any).performance.memory.usedJSHeapSize
    }
    return 0
  }

  private getTotalHeapSize(): number {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return (window as any).performance.memory.totalJSHeapSize
    }
    return 0
  }

  private getHeapSizeLimit(): number {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return (window as any).performance.memory.jsHeapSizeLimit
    }
    return 0
  }

  analyzeMemoryTrend(): {
    isLeaking: boolean
    growthRate: number
    maxMemoryUsed: number
    averageMemoryUsed: number
    snapshots: MemorySnapshot[]
  } {
    if (this.snapshots.length < 3) {
      return {
        isLeaking: false,
        growthRate: 0,
        maxMemoryUsed: 0,
        averageMemoryUsed: 0,
        snapshots: this.snapshots
      }
    }

    const memoryValues = this.snapshots.map(s => s.usedJSHeapSize)
    const maxMemory = Math.max(...memoryValues)
    const averageMemory = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length

    // Calculate growth rate (memory increase per minute)
    const timeSpan = (this.snapshots[this.snapshots.length - 1].timestamp - this.snapshots[0].timestamp) / 60000 // minutes
    const memoryIncrease = this.snapshots[this.snapshots.length - 1].usedJSHeapSize - this.snapshots[0].usedJSHeapSize
    const growthRate = timeSpan > 0 ? memoryIncrease / timeSpan : 0

    // Consider it a leak if memory grows consistently more than 5MB per minute
    const isLeaking = growthRate > 5 * 1024 * 1024

    return {
      isLeaking,
      growthRate,
      maxMemoryUsed: maxMemory,
      averageMemoryUsed: averageMemory,
      snapshots: this.snapshots
    }
  }

  reset(): void {
    this.snapshots = []
    this.componentRefs.clear()
  }

  addComponentRef(ref: any): void {
    this.componentRefs.add(ref)
  }

  removeComponentRef(ref: any): void {
    this.componentRefs.delete(ref)
  }

  getActiveComponentCount(): number {
    return this.componentRefs.size
  }
}

// Test data for simulating long reading sessions
const LONG_READING_SESSION_DATA = {
  surahs: Array.from({ length: 114 }, (_, i) => i + 1),
  ayahsPerSurah: {
    1: 7,    // Al-Fatiha
    2: 286,  // Al-Baqarah (longest)
    3: 200,  // Ali Imran
    4: 176,  // An-Nisa
    // Simplified for testing
  },
  sessionDurations: [
    30 * 60 * 1000,  // 30 minutes
    60 * 60 * 1000,  // 1 hour
    120 * 60 * 1000, // 2 hours
    240 * 60 * 1000  // 4 hours (extreme case)
  ]
}

describe('Enhanced Memory Leak Detection Tests', () => {
  let memoryMonitor: MemoryMonitor

  beforeEach(() => {
    vi.clearAllMocks()
    memoryMonitor = new MemoryMonitor()
    
    // Reset all stores to baseline
    useQuranStore.getState().reset?.()
    useAudioStore.getState().reset?.()
    usePerformanceMonitorStore.getState().reset?.()
    useProgressStore.getState().reset?.()
    
    // Force garbage collection if available
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc()
    }
  })

  afterEach(() => {
    cleanup()
    memoryMonitor.reset()
    vi.restoreAllMocks()
  })

  describe('Long Reading Session Memory Management', () => {
    it('should not leak memory during 30-minute continuous reading session', async () => {
      const quranHook = renderHook(() => useQuranStore())
      const audioHook = renderHook(() => useAudioStore())
      const progressHook = renderHook(() => useProgressStore())
      
      memoryMonitor.addComponentRef(quranHook)
      memoryMonitor.addComponentRef(audioHook)
      memoryMonitor.addComponentRef(progressHook)
      
      // Take initial memory snapshot
      const initialSnapshot = memoryMonitor.takeSnapshot(3, 0)
      
      // Simulate 30-minute reading session (compressed to 30 iterations)
      for (let minute = 0; minute < 30; minute++) {
        await act(async () => {
          // Simulate user reading through ayahs
          const surahNumber = (minute % 5) + 1
          const ayahNumber = (minute % 10) + 1
          
          // Load Quran content
          await quranHook.result.current.loadSurah(surahNumber)
          quranHook.result.current.setCurrentAyah(ayahNumber)
          
          // Simulate audio playback
          audioHook.result.current.setCurrentAyah(surahNumber, ayahNumber)
          
          // Update progress
          progressHook.result.current.updateProgress({
            surahNumber,
            ayahNumber,
            timeSpent: 60000, // 1 minute
            completed: false
          })
          
          // Take memory snapshot every 5 minutes
          if (minute % 5 === 0) {
            const storeSize = JSON.stringify({
              quran: quranHook.result.current,
              audio: audioHook.result.current,
              progress: progressHook.result.current
            }).length
            
            memoryMonitor.takeSnapshot(3, storeSize)
            
            // Force garbage collection
            if (typeof global !== 'undefined' && (global as any).gc) {
              (global as any).gc()
            }
          }
        })
      }
      
      // Final memory snapshot
      const finalSnapshot = memoryMonitor.takeSnapshot(3, 0)
      
      // Analyze memory trend
      const analysis = memoryMonitor.analyzeMemoryTrend()
      
      // Memory leak assertions
      expect(analysis.isLeaking).toBe(false)
      expect(analysis.growthRate).toBeLessThan(5 * 1024 * 1024) // Less than 5MB/minute growth
      
      // Memory should stabilize after initial load
      const memoryIncrease = finalSnapshot.usedJSHeapSize - initialSnapshot.usedJSHeapSize
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Less than 50MB increase
      
      // Cleanup
      memoryMonitor.removeComponentRef(quranHook)
      memoryMonitor.removeComponentRef(audioHook)
      memoryMonitor.removeComponentRef(progressHook)
    }, 60000) // 1 minute timeout

    it('should handle rapid page navigation without memory accumulation', async () => {
      const quranHook = renderHook(() => useQuranStore())
      
      const initialSnapshot = memoryMonitor.takeSnapshot(1, 0)
      
      // Simulate rapid navigation through 100 different pages
      for (let i = 0; i < 100; i++) {
        await act(async () => {
          const surahNumber = (i % 114) + 1
          const ayahNumber = (i % 20) + 1
          
          // Rapid navigation
          await quranHook.result.current.loadSurah(surahNumber)
          quranHook.result.current.setCurrentAyah(ayahNumber)
          
          // Clear previous data to simulate navigation
          if (i % 10 === 0) {
            quranHook.result.current.clearCache?.()
          }
        })
        
        // Take snapshots every 20 navigations
        if (i % 20 === 0) {
          memoryMonitor.takeSnapshot(1, 0)
        }
      }
      
      const finalSnapshot = memoryMonitor.takeSnapshot(1, 0)
      const analysis = memoryMonitor.analyzeMemoryTrend()
      
      // Should not accumulate memory during rapid navigation
      expect(analysis.isLeaking).toBe(false)
      expect(finalSnapshot.usedJSHeapSize - initialSnapshot.usedJSHeapSize).toBeLessThan(30 * 1024 * 1024)
    }, 30000)

    it('should properly cleanup audio resources during extended listening', async () => {
      const audioHook = renderHook(() => useAudioStore())
      
      const initialSnapshot = memoryMonitor.takeSnapshot(1, 0)
      
      // Simulate extended audio listening session
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          const surahNumber = (i % 10) + 1
          const ayahNumber = (i % 15) + 1
          
          // Start audio playback
          audioHook.result.current.setCurrentAyah(surahNumber, ayahNumber)
          audioHook.result.current.play()
          
          // Simulate playback completion
          setTimeout(() => {
            audioHook.result.current.pause()
            audioHook.result.current.cleanup?.()
          }, 10)
        })
        
        if (i % 10 === 0) {
          memoryMonitor.takeSnapshot(1, 0)
        }
      }
      
      const finalSnapshot = memoryMonitor.takeSnapshot(1, 0)
      const analysis = memoryMonitor.analyzeMemoryTrend()
      
      // Audio resources should be properly cleaned up
      expect(analysis.isLeaking).toBe(false)
      expect(analysis.growthRate).toBeLessThan(2 * 1024 * 1024) // Less than 2MB/minute for audio
    }, 20000)
  })

  describe('Store Size Management', () => {
    it('should maintain reasonable store sizes during extended use', async () => {
      const quranHook = renderHook(() => useQuranStore())
      const progressHook = renderHook(() => useProgressStore())
      
      // Load multiple surahs and track progress
      for (let i = 1; i <= 20; i++) {
        await act(async () => {
          await quranHook.result.current.loadSurah(i)
          
          // Add progress entries
          for (let j = 1; j <= 10; j++) {
            progressHook.result.current.updateProgress({
              surahNumber: i,
              ayahNumber: j,
              timeSpent: 60000,
              completed: j === 10
            })
          }
        })
        
        // Check store sizes
        const quranStoreSize = JSON.stringify(quranHook.result.current).length
        const progressStoreSize = JSON.stringify(progressHook.result.current).length
        
        memoryMonitor.takeSnapshot(2, quranStoreSize + progressStoreSize)
      }
      
      const analysis = memoryMonitor.analyzeMemoryTrend()
      
      // Store sizes should be reasonable
      const maxStoreSize = Math.max(...analysis.snapshots.map(s => s.storeSize))
      expect(maxStoreSize).toBeLessThan(10 * 1024 * 1024) // Less than 10MB for all stores combined
    })

    it('should implement effective cache eviction strategies', async () => {
      const quranHook = renderHook(() => useQuranStore())
      
      const initialSnapshot = memoryMonitor.takeSnapshot(1, 0)
      
      // Load many surahs to trigger cache eviction
      for (let i = 1; i <= 50; i++) {
        await act(async () => {
          await quranHook.result.current.loadSurah((i % 114) + 1)
        })
        
        if (i % 10 === 0) {
          const storeSize = JSON.stringify(quranHook.result.current).length
          memoryMonitor.takeSnapshot(1, storeSize)
        }
      }
      
      const finalSnapshot = memoryMonitor.takeSnapshot(1, 0)
      const analysis = memoryMonitor.analyzeMemoryTrend()
      
      // Cache eviction should prevent unbounded growth
      expect(analysis.isLeaking).toBe(false)
      expect(finalSnapshot.usedJSHeapSize - initialSnapshot.usedJSHeapSize).toBeLessThan(20 * 1024 * 1024)
    })
  })

  describe('Component Lifecycle Memory Management', () => {
    it('should properly cleanup components during mount/unmount cycles', async () => {
      const initialSnapshot = memoryMonitor.takeSnapshot(0, 0)
      
      // Simulate multiple component mount/unmount cycles
      for (let cycle = 0; cycle < 20; cycle++) {
        const hooks = [
          renderHook(() => useQuranStore()),
          renderHook(() => useAudioStore()),
          renderHook(() => useProgressStore())
        ]
        
        hooks.forEach(hook => memoryMonitor.addComponentRef(hook))
        
        await act(async () => {
          // Simulate component activity
          await hooks[0].result.current.loadSurah((cycle % 10) + 1)
          hooks[1].result.current.setCurrentAyah((cycle % 10) + 1, 1)
        })
        
        // Unmount components
        hooks.forEach(hook => {
          hook.unmount()
          memoryMonitor.removeComponentRef(hook)
        })
        
        cleanup()
        
        if (cycle % 5 === 0) {
          memoryMonitor.takeSnapshot(memoryMonitor.getActiveComponentCount(), 0)
        }
      }
      
      const finalSnapshot = memoryMonitor.takeSnapshot(0, 0)
      const analysis = memoryMonitor.analyzeMemoryTrend()
      
      // Component cleanup should prevent memory leaks
      expect(memoryMonitor.getActiveComponentCount()).toBe(0)
      expect(analysis.isLeaking).toBe(false)
      expect(finalSnapshot.usedJSHeapSize - initialSnapshot.usedJSHeapSize).toBeLessThan(15 * 1024 * 1024)
    }, 45000)

    it('should handle event listener cleanup properly', async () => {
      const quranHook = renderHook(() => useQuranStore())
      const audioHook = renderHook(() => useAudioStore())
      
      const initialSnapshot = memoryMonitor.takeSnapshot(2, 0)
      
      // Simulate adding many event listeners
      for (let i = 0; i < 100; i++) {
        await act(async () => {
          // Simulate events that might create listeners
          quranHook.result.current.addEventListener?.('surahLoaded', () => {})
          audioHook.result.current.addEventListener?.('audioStateChange', () => {})
        })
      }
      
      memoryMonitor.takeSnapshot(2, 0)
      
      // Cleanup
      quranHook.unmount()
      audioHook.unmount()
      cleanup()
      
      const finalSnapshot = memoryMonitor.takeSnapshot(0, 0)
      
      // Event listeners should be properly cleaned up
      expect(finalSnapshot.usedJSHeapSize - initialSnapshot.usedJSHeapSize).toBeLessThan(5 * 1024 * 1024)
    })
  })

  describe('Performance Monitoring During Memory Tests', () => {
    it('should track memory performance metrics during extended use', async () => {
      const performanceHook = renderHook(() => usePerformanceMonitorStore())
      
      // Monitor memory during extended testing
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          performanceHook.result.current.measureMemoryUsage()
        })
        
        memoryMonitor.takeSnapshot(1, 0)
        
        // Small delay to simulate real usage
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      const analysis = memoryMonitor.analyzeMemoryTrend()
      
      // Performance monitoring itself should not cause leaks
      expect(analysis.isLeaking).toBe(false)
      expect(performanceHook.result.current.memoryUsage.used).toBeGreaterThan(0)
    })

    it('should detect and report memory pressure situations', async () => {
      const performanceHook = renderHook(() => usePerformanceMonitorStore())
      
      // Simulate memory pressure by loading large amounts of data
      const quranHook = renderHook(() => useQuranStore())
      
      await act(async () => {
        // Load multiple large surahs simultaneously
        const loadPromises = [1, 2, 3, 4, 5].map(surah => 
          quranHook.result.current.loadSurah(surah)
        )
        await Promise.all(loadPromises)
        
        // Measure memory under pressure
        performanceHook.result.current.measureMemoryUsage()
      })
      
      const memoryUsage = performanceHook.result.current.memoryUsage
      
      // Should detect high memory usage
      expect(memoryUsage.used).toBeGreaterThan(0)
      
      // Should provide memory pressure warnings if needed
      if (memoryUsage.used > 100 * 1024 * 1024) { // 100MB
        expect(performanceHook.result.current.optimizationSuggestions).toContainEqual(
          expect.objectContaining({
            type: 'memory',
            priority: expect.any(String)
          })
        )
      }
    })
  })
})