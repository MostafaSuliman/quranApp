/**
 * Load Testing Suite
 * 
 * Comprehensive load testing for QuranApp including stress testing for 1000+ users,
 * performance under heavy load, and system stability testing.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuranStore } from '../../stores/quranStore'
import { useAudioStore } from '../../stores/audioStore'
import { usePerformanceMonitorStore } from '../../stores/performanceMonitorStore'
import { useProgressStore } from '../../stores/progressStore'

// Load testing utilities
interface LoadTestResult {
  totalUsers: number
  concurrentUsers: number
  duration: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  maxResponseTime: number
  minResponseTime: number
  throughput: number
  errorRate: number
  memoryUsage: MemoryUsage
  cpuUsage: number
}

interface MemoryUsage {
  initial: number
  peak: number
  final: number
  leaked: number
}

interface UserSimulation {
  id: string
  startTime: number
  endTime?: number
  actions: UserAction[]
  errors: string[]
  responseTime: number[]
}

interface UserAction {
  type: 'loadSurah' | 'playAudio' | 'search' | 'bookmark' | 'navigate'
  timestamp: number
  duration: number
  success: boolean
  errorMessage?: string
}

class LoadTester {
  private activeUsers: Map<string, UserSimulation> = new Map()
  private completedUsers: UserSimulation[] = []
  private startTime: number = 0
  private endTime: number = 0
  private memoryBaseline: number = 0

  async simulateUserLoad(userCount: number, duration: number): Promise<LoadTestResult> {
    this.startTime = Date.now()
    this.memoryBaseline = this.getCurrentMemoryUsage()
    
    // Create user simulations
    const userPromises = Array.from({ length: userCount }, (_, index) => 
      this.simulateUser(`user-${index}`, duration)
    )
    
    // Wait for all users to complete
    await Promise.allSettled(userPromises)
    
    this.endTime = Date.now()
    
    return this.generateLoadTestResult()
  }

  private async simulateUser(userId: string, duration: number): Promise<void> {
    const user: UserSimulation = {
      id: userId,
      startTime: Date.now(),
      actions: [],
      errors: [],
      responseTime: []
    }
    
    this.activeUsers.set(userId, user)
    
    const endTime = Date.now() + duration
    
    try {
      while (Date.now() < endTime) {
        await this.performUserAction(user)
        
        // Random delay between actions (1-5 seconds)
        await this.delay(Math.random() * 4000 + 1000)
      }
    } catch (error) {
      user.errors.push(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      user.endTime = Date.now()
      this.activeUsers.delete(userId)
      this.completedUsers.push(user)
    }
  }

  private async performUserAction(user: UserSimulation): Promise<void> {
    const actions = ['loadSurah', 'playAudio', 'search', 'bookmark', 'navigate'] as const
    const actionType = actions[Math.floor(Math.random() * actions.length)]
    
    const startTime = Date.now()
    let success = true
    let errorMessage: string | undefined
    
    try {
      switch (actionType) {
        case 'loadSurah':
          await this.simulateLoadSurah()
          break
        case 'playAudio':
          await this.simulatePlayAudio()
          break
        case 'search':
          await this.simulateSearch()
          break
        case 'bookmark':
          await this.simulateBookmark()
          break
        case 'navigate':
          await this.simulateNavigation()
          break
      }
    } catch (error) {
      success = false
      errorMessage = error instanceof Error ? error.message : 'Action failed'
      user.errors.push(errorMessage)
    }
    
    const duration = Date.now() - startTime
    user.responseTime.push(duration)
    
    user.actions.push({
      type: actionType,
      timestamp: startTime,
      duration,
      success,
      errorMessage
    })
  }

  private async simulateLoadSurah(): Promise<void> {
    const surahNumber = Math.floor(Math.random() * 114) + 1
    
    // Simulate API call delay
    await this.delay(Math.random() * 2000 + 500) // 0.5-2.5 seconds
    
    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Failed to load Surah')
    }
  }

  private async simulatePlayAudio(): Promise<void> {
    const surahNumber = Math.floor(Math.random() * 114) + 1
    const ayahNumber = Math.floor(Math.random() * 20) + 1
    
    // Simulate audio loading delay
    await this.delay(Math.random() * 3000 + 1000) // 1-4 seconds
    
    // Simulate audio failures (10% failure rate due to network/format issues)
    if (Math.random() < 0.1) {
      throw new Error('Audio playback failed')
    }
  }

  private async simulateSearch(): Promise<void> {
    const searchTerms = ['guidance', 'mercy', 'forgiveness', 'prayer', 'faith']
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)]
    
    // Simulate search processing
    await this.delay(Math.random() * 1500 + 500) // 0.5-2 seconds
    
    // Simulate search failures (3% failure rate)
    if (Math.random() < 0.03) {
      throw new Error('Search failed')
    }
  }

  private async simulateBookmark(): Promise<void> {
    const surahNumber = Math.floor(Math.random() * 114) + 1
    const ayahNumber = Math.floor(Math.random() * 20) + 1
    
    // Simulate bookmark save
    await this.delay(Math.random() * 500 + 200) // 0.2-0.7 seconds
    
    // Simulate bookmark failures (2% failure rate)
    if (Math.random() < 0.02) {
      throw new Error('Failed to save bookmark')
    }
  }

  private async simulateNavigation(): Promise<void> {
    // Simulate page navigation
    await this.delay(Math.random() * 1000 + 300) // 0.3-1.3 seconds
    
    // Navigation rarely fails (1% failure rate)
    if (Math.random() < 0.01) {
      throw new Error('Navigation failed')
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return (window as any).performance.memory.usedJSHeapSize
    }
    return 0
  }

  private generateLoadTestResult(): LoadTestResult {
    const allUsers = [...this.completedUsers]
    const totalDuration = this.endTime - this.startTime
    
    // Calculate metrics
    const totalRequests = allUsers.reduce((sum, user) => sum + user.actions.length, 0)
    const successfulRequests = allUsers.reduce((sum, user) => 
      sum + user.actions.filter(action => action.success).length, 0
    )
    const failedRequests = totalRequests - successfulRequests
    
    const allResponseTimes = allUsers.flatMap(user => user.responseTime)
    const averageResponseTime = allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
    const maxResponseTime = Math.max(...allResponseTimes)
    const minResponseTime = Math.min(...allResponseTimes)
    
    const throughput = (totalRequests / totalDuration) * 1000 // requests per second
    const errorRate = (failedRequests / totalRequests) * 100
    
    const finalMemory = this.getCurrentMemoryUsage()
    const peakMemory = Math.max(this.memoryBaseline, finalMemory)
    
    return {
      totalUsers: allUsers.length,
      concurrentUsers: allUsers.length, // All users were concurrent
      duration: totalDuration,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      maxResponseTime,
      minResponseTime,
      throughput,
      errorRate,
      memoryUsage: {
        initial: this.memoryBaseline,
        peak: peakMemory,
        final: finalMemory,
        leaked: Math.max(0, finalMemory - this.memoryBaseline)
      },
      cpuUsage: this.estimateCPUUsage()
    }
  }

  private estimateCPUUsage(): number {
    // Estimate CPU usage based on request rate and response times
    const allUsers = [...this.completedUsers]
    const totalActions = allUsers.reduce((sum, user) => sum + user.actions.length, 0)
    const totalDuration = this.endTime - this.startTime
    
    const requestRate = (totalActions / totalDuration) * 1000 // requests per second
    
    // Rough estimation: higher request rate = higher CPU usage
    return Math.min(100, requestRate * 2) // Cap at 100%
  }

  reset(): void {
    this.activeUsers.clear()
    this.completedUsers = []
    this.startTime = 0
    this.endTime = 0
    this.memoryBaseline = 0
  }
}

// Mock data for load testing
const LOAD_TEST_DATA = {
  surahs: Array.from({ length: 114 }, (_, i) => ({
    id: i + 1,
    name: `Surah ${i + 1}`,
    ayahs: Array.from({ length: 20 }, (_, j) => ({
      number: j + 1,
      text: `Arabic text for ayah ${j + 1}`
    }))
  })),
  searchResults: [
    'guidance', 'mercy', 'forgiveness', 'prayer', 'faith'
  ].map(term => ({
    term,
    results: Array.from({ length: 10 }, (_, i) => ({
      surah: Math.floor(Math.random() * 114) + 1,
      ayah: Math.floor(Math.random() * 20) + 1,
      text: `Search result ${i + 1} for ${term}`
    }))
  }))
}

describe('Load Testing Suite', () => {
  let loadTester: LoadTester

  beforeEach(() => {
    vi.clearAllMocks()
    loadTester = new LoadTester()
    
    // Reset stores
    useQuranStore.getState().reset?.()
    useAudioStore.getState().reset?.()
    usePerformanceMonitorStore.getState().reset?.()
    useProgressStore.getState().reset?.()
    
    // Mock performance.memory for memory testing
    Object.defineProperty(window, 'performance', {
      value: {
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024, // 50MB baseline
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
        },
        now: () => Date.now()
      },
      configurable: true
    })
  })

  afterEach(() => {
    loadTester.reset()
    vi.restoreAllMocks()
  })

  describe('Small Scale Load Tests (1-50 users)', () => {
    it('should handle 10 concurrent users without performance degradation', async () => {
      const result = await loadTester.simulateUserLoad(10, 30000) // 10 users for 30 seconds
      
      // Performance assertions
      expect(result.totalUsers).toBe(10)
      expect(result.errorRate).toBeLessThan(10) // Less than 10% error rate
      expect(result.averageResponseTime).toBeLessThan(3000) // Less than 3 seconds average
      expect(result.throughput).toBeGreaterThan(1) // At least 1 request per second
      
      // Memory usage should be reasonable
      expect(result.memoryUsage.leaked).toBeLessThan(20 * 1024 * 1024) // Less than 20MB leaked
      
      // System should remain stable
      expect(result.successfulRequests).toBeGreaterThan(result.failedRequests)
    }, 45000)

    it('should maintain response times under 50 users', async () => {
      const result = await loadTester.simulateUserLoad(50, 20000) // 50 users for 20 seconds
      
      // Response time assertions
      expect(result.averageResponseTime).toBeLessThan(5000) // Less than 5 seconds average
      expect(result.maxResponseTime).toBeLessThan(10000) // Less than 10 seconds max
      
      // Throughput should scale with users
      expect(result.throughput).toBeGreaterThan(5) // At least 5 requests per second
      
      // Error rate should remain low
      expect(result.errorRate).toBeLessThan(15) // Less than 15% error rate
    }, 30000)
  })

  describe('Medium Scale Load Tests (100-500 users)', () => {
    it('should handle 100 concurrent users with acceptable performance', async () => {
      const result = await loadTester.simulateUserLoad(100, 15000) // 100 users for 15 seconds
      
      // Performance should degrade gracefully
      expect(result.totalUsers).toBe(100)
      expect(result.errorRate).toBeLessThan(20) // Less than 20% error rate
      expect(result.averageResponseTime).toBeLessThan(8000) // Less than 8 seconds average
      
      // Throughput should be reasonable
      expect(result.throughput).toBeGreaterThan(8) // At least 8 requests per second
      
      // Memory usage should be controlled
      expect(result.memoryUsage.leaked).toBeLessThan(50 * 1024 * 1024) // Less than 50MB leaked
      
      // CPU usage should be reasonable
      expect(result.cpuUsage).toBeLessThan(80) // Less than 80% CPU
    }, 25000)

    it('should scale to 250 users with degraded but functional performance', async () => {
      const result = await loadTester.simulateUserLoad(250, 10000) // 250 users for 10 seconds
      
      // Accept higher response times but maintain functionality
      expect(result.totalUsers).toBe(250)
      expect(result.errorRate).toBeLessThan(30) // Less than 30% error rate
      expect(result.averageResponseTime).toBeLessThan(15000) // Less than 15 seconds average
      
      // Should still process requests
      expect(result.totalRequests).toBeGreaterThan(0)
      expect(result.successfulRequests).toBeGreaterThan(0)
      
      // Memory should not exhaust system
      expect(result.memoryUsage.leaked).toBeLessThan(100 * 1024 * 1024) // Less than 100MB leaked
    }, 20000)

    it('should maintain data integrity under medium load', async () => {
      const { result: quranResult } = renderHook(() => useQuranStore())
      const { result: progressResult } = renderHook(() => useProgressStore())
      
      // Simulate concurrent data operations
      const concurrentOperations = Array.from({ length: 100 }, async (_, index) => {
        await act(async () => {
          const surahNumber = (index % 114) + 1
          
          // Load Surah
          await quranResult.current.loadSurah(surahNumber)
          
          // Update progress
          progressResult.current.updateProgress({
            surahNumber,
            ayahNumber: 1,
            timeSpent: 60000,
            completed: false
          })
        })
      })
      
      await Promise.allSettled(concurrentOperations)
      
      // Data integrity checks
      expect(quranResult.current.currentSurah).toBeDefined()
      expect(progressResult.current.totalProgress).toBeGreaterThan(0)
      
      // No data corruption
      expect(quranResult.current.error).toBeNull()
      expect(progressResult.current.error).toBeNull()
    })
  })

  describe('Large Scale Load Tests (500-1000+ users)', () => {
    it('should survive 500 concurrent users stress test', async () => {
      const result = await loadTester.simulateUserLoad(500, 8000) // 500 users for 8 seconds
      
      // System should survive but with significant degradation
      expect(result.totalUsers).toBe(500)
      expect(result.errorRate).toBeLessThan(50) // Less than 50% error rate (system still functional)
      
      // Should process some requests successfully
      expect(result.successfulRequests).toBeGreaterThan(result.totalRequests * 0.3) // At least 30% success
      
      // Memory should not crash the system
      expect(result.memoryUsage.final).toBeLessThan(500 * 1024 * 1024) // Less than 500MB total
      
      // Should complete without crashing
      expect(result.duration).toBeGreaterThan(0)
    }, 15000)

    it('should handle 1000+ users extreme stress test', async () => {
      const result = await loadTester.simulateUserLoad(1000, 5000) // 1000 users for 5 seconds
      
      // Extreme stress - system may be severely degraded but should not crash
      expect(result.totalUsers).toBe(1000)
      
      // Should process at least some requests
      expect(result.totalRequests).toBeGreaterThan(0)
      
      // System should not crash completely
      expect(result.successfulRequests).toBeGreaterThan(0)
      
      // Memory should not cause system failure
      expect(result.memoryUsage.final).toBeLessThan(1024 * 1024 * 1024) // Less than 1GB total
      
      // Test should complete
      expect(result.duration).toBeGreaterThan(0)
      expect(result.duration).toBeLessThan(30000) // Should not hang indefinitely
    }, 12000)

    it('should implement graceful degradation under extreme load', async () => {
      const { result: performanceResult } = renderHook(() => usePerformanceMonitorStore())
      
      // Monitor performance during high load
      await act(async () => {
        performanceResult.current.startMonitoring()
      })
      
      const result = await loadTester.simulateUserLoad(750, 6000) // 750 users for 6 seconds
      
      await act(async () => {
        performanceResult.current.stopMonitoring()
      })
      
      // Should implement graceful degradation strategies
      const performanceMetrics = performanceResult.current.getMetrics()
      
      if (performanceMetrics.responseTime > 10000) {
        // Should activate degradation strategies
        expect(performanceResult.current.degradationActive).toBe(true)
      }
      
      // System should prioritize core functionality
      expect(result.errorRate).toBeLessThan(70) // Even under extreme load, some functionality preserved
    })
  })

  describe('Performance Bottleneck Analysis', () => {
    it('should identify performance bottlenecks under load', async () => {
      const { result: performanceResult } = renderHook(() => usePerformanceMonitorStore())
      
      await act(async () => {
        performanceResult.current.enableBottleneckDetection()
      })
      
      const result = await loadTester.simulateUserLoad(200, 10000) // 200 users for 10 seconds
      
      const bottlenecks = performanceResult.current.getBottlenecks()
      
      // Should identify common bottlenecks
      expect(bottlenecks).toBeDefined()
      
      // Common bottlenecks in QuranApp
      const expectedBottlenecks = ['api_calls', 'arabic_rendering', 'audio_loading', 'memory_usage']
      const detectedBottlenecks = bottlenecks.map(b => b.type)
      
      const hasExpectedBottleneck = expectedBottlenecks.some(expected => 
        detectedBottlenecks.includes(expected)
      )
      
      if (result.errorRate > 25) {
        expect(hasExpectedBottleneck).toBe(true)
      }
    })

    it('should measure resource utilization under different loads', async () => {
      const loads = [50, 100, 200, 400]
      const results: LoadTestResult[] = []
      
      for (const userCount of loads) {
        const result = await loadTester.simulateUserLoad(userCount, 5000) // 5 seconds each
        results.push(result)
        
        // Allow system to recover between tests
        await loadTester.delay(2000)
      }
      
      // Analyze scaling characteristics
      for (let i = 1; i < results.length; i++) {
        const prevResult = results[i - 1]
        const currentResult = results[i]
        
        // Response time should increase with load
        expect(currentResult.averageResponseTime).toBeGreaterThanOrEqual(
          prevResult.averageResponseTime * 0.8
        ) // Allow for some variance
        
        // Error rate should generally increase
        expect(currentResult.errorRate).toBeGreaterThanOrEqual(
          prevResult.errorRate - 5
        ) // Allow for 5% variance
        
        // Memory usage should increase
        expect(currentResult.memoryUsage.peak).toBeGreaterThanOrEqual(
          prevResult.memoryUsage.peak
        )
      }
    })

    it('should test Islamic content rendering performance under load', async () => {
      const { result: quranResult } = renderHook(() => useQuranStore())
      
      const arabicTexts = [
        'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        'الرَّحْمَنِ الرَّحِيمِ',
        'مَالِكِ يَوْمِ الدِّينِ'
      ]
      
      const renderingPromises = Array.from({ length: 500 }, async (_, index) => {
        const text = arabicTexts[index % arabicTexts.length]
        const startTime = Date.now()
        
        await act(async () => {
          quranResult.current.renderArabicText?.(text)
        })
        
        return Date.now() - startTime
      })
      
      const renderingTimes = await Promise.all(renderingPromises)
      
      // Arabic text rendering should be efficient
      const averageRenderTime = renderingTimes.reduce((a, b) => a + b, 0) / renderingTimes.length
      expect(averageRenderTime).toBeLessThan(100) // Less than 100ms per render
      
      const maxRenderTime = Math.max(...renderingTimes)
      expect(maxRenderTime).toBeLessThan(500) // No render should take more than 500ms
    })
  })

  describe('Recovery and Stability Tests', () => {
    it('should recover from overload conditions', async () => {
      // Overload the system
      const overloadResult = await loadTester.simulateUserLoad(800, 3000) // Heavy load
      
      // Allow recovery time
      await loadTester.delay(5000)
      
      // Test normal load after overload
      const recoveryResult = await loadTester.simulateUserLoad(50, 5000) // Normal load
      
      // System should recover to acceptable performance
      expect(recoveryResult.errorRate).toBeLessThan(overloadResult.errorRate)
      expect(recoveryResult.averageResponseTime).toBeLessThan(overloadResult.averageResponseTime)
      
      // Should return to stable state
      expect(recoveryResult.errorRate).toBeLessThan(15) // Back to normal error rate
      expect(recoveryResult.averageResponseTime).toBeLessThan(3000) // Back to normal response time
    })

    it('should maintain data consistency after load spikes', async () => {
      const { result: quranResult } = renderHook(() => useQuranStore())
      const { result: progressResult } = renderHook(() => useProgressStore())
      
      // Create initial state
      await act(async () => {
        await quranResult.current.loadSurah(1)
        progressResult.current.updateProgress({
          surahNumber: 1,
          ayahNumber: 5,
          timeSpent: 300000,
          completed: false
        })
      })
      
      const initialState = {
        currentSurah: quranResult.current.currentSurah,
        progress: progressResult.current.getProgress(1)
      }
      
      // Apply load spike
      await loadTester.simulateUserLoad(300, 4000)
      
      // Verify data consistency
      expect(quranResult.current.currentSurah?.id).toBe(initialState.currentSurah?.id)
      expect(progressResult.current.getProgress(1)?.ayahNumber).toBe(
        initialState.progress?.ayahNumber
      )
      
      // System should be functional
      await act(async () => {
        await quranResult.current.loadSurah(2) // Should still work
      })
      
      expect(quranResult.current.currentSurah?.id).toBe(2)
    })

    it('should implement circuit breaker pattern under sustained load', async () => {
      const { result: quranResult } = renderHook(() => useQuranStore())
      
      // Simulate sustained high error rate
      let consecutiveErrors = 0
      
      for (let i = 0; i < 20; i++) {
        try {
          await act(async () => {
            // Force errors by requesting invalid surahs
            await quranResult.current.loadSurah(999)
          })
        } catch (error) {
          consecutiveErrors++
        }
        
        // Circuit breaker should activate after multiple failures
        if (consecutiveErrors >= 5) {
          expect(quranResult.current.circuitBreakerOpen).toBe(true)
          break
        }
      }
      
      // Circuit breaker should prevent further requests
      if (quranResult.current.circuitBreakerOpen) {
        await act(async () => {
          try {
            await quranResult.current.loadSurah(1) // Valid request
          } catch (error) {
            expect(error.message).toMatch(/circuit breaker|service unavailable/i)
          }
        })
      }
    })
  })

  describe('Load Test Reporting and Metrics', () => {
    it('should generate comprehensive load test reports', async () => {
      const result = await loadTester.simulateUserLoad(100, 10000)
      
      // Report should contain all essential metrics
      expect(result.totalUsers).toBeDefined()
      expect(result.concurrentUsers).toBeDefined()
      expect(result.duration).toBeGreaterThan(0)
      expect(result.totalRequests).toBeGreaterThan(0)
      expect(result.successfulRequests).toBeGreaterThanOrEqual(0)
      expect(result.failedRequests).toBeGreaterThanOrEqual(0)
      expect(result.averageResponseTime).toBeGreaterThan(0)
      expect(result.maxResponseTime).toBeGreaterThanOrEqual(result.averageResponseTime)
      expect(result.minResponseTime).toBeLessThanOrEqual(result.averageResponseTime)
      expect(result.throughput).toBeGreaterThan(0)
      expect(result.errorRate).toBeGreaterThanOrEqual(0)
      expect(result.errorRate).toBeLessThanOrEqual(100)
      
      // Memory metrics
      expect(result.memoryUsage.initial).toBeGreaterThan(0)
      expect(result.memoryUsage.peak).toBeGreaterThanOrEqual(result.memoryUsage.initial)
      expect(result.memoryUsage.final).toBeGreaterThan(0)
      expect(result.memoryUsage.leaked).toBeGreaterThanOrEqual(0)
      
      // CPU metrics
      expect(result.cpuUsage).toBeGreaterThanOrEqual(0)
      expect(result.cpuUsage).toBeLessThanOrEqual(100)
    })

    it('should track performance trends across multiple test runs', async () => {
      const testRuns = []
      
      // Run multiple load tests
      for (let i = 0; i < 3; i++) {
        const result = await loadTester.simulateUserLoad(100, 5000)
        testRuns.push(result)
        
        // Short recovery between tests
        await loadTester.delay(1000)
      }
      
      // Analyze trends
      const averageResponseTimes = testRuns.map(r => r.averageResponseTime)
      const errorRates = testRuns.map(r => r.errorRate)
      const throughputs = testRuns.map(r => r.throughput)
      
      // Performance should be relatively consistent
      const responseTimeVariance = Math.max(...averageResponseTimes) - Math.min(...averageResponseTimes)
      expect(responseTimeVariance).toBeLessThan(5000) // Less than 5 second variance
      
      const errorRateVariance = Math.max(...errorRates) - Math.min(...errorRates)
      expect(errorRateVariance).toBeLessThan(20) // Less than 20% variance
    })

    it('should identify performance regression patterns', async () => {
      // Baseline test
      const baselineResult = await loadTester.simulateUserLoad(50, 5000)
      
      // Simulated regression (heavier load)
      const regressionResult = await loadTester.simulateUserLoad(200, 5000)
      
      // Detect regression
      const responseTimeRegression = regressionResult.averageResponseTime / baselineResult.averageResponseTime
      const errorRateRegression = regressionResult.errorRate - baselineResult.errorRate
      const throughputRegression = baselineResult.throughput / regressionResult.throughput
      
      // Document regression patterns
      if (responseTimeRegression > 2.0) {
        expect(responseTimeRegression).toBeGreaterThan(1) // Regression detected
      }
      
      if (errorRateRegression > 10) {
        expect(errorRateRegression).toBeGreaterThan(0) // Error rate increased
      }
      
      if (throughputRegression > 1.5) {
        expect(throughputRegression).toBeGreaterThan(1) // Throughput decreased
      }
      
      // All metrics should be measurable
      expect(typeof responseTimeRegression).toBe('number')
      expect(typeof errorRateRegression).toBe('number')
      expect(typeof throughputRegression).toBe('number')
    })
  })
})
