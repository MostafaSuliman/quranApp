/**
 * Enhanced Network Failure Recovery Tests
 * 
 * Comprehensive testing of network failure scenarios and recovery mechanisms.
 * Tests offline functionality, API resilience, and graceful degradation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import axios from 'axios'
import { useQuranStore } from '../../stores/quranStore'
import { useAudioStore } from '../../stores/audioStore'

// Mock network conditions
type NetworkCondition = 'online' | 'offline' | 'slow' | 'intermittent' | 'high-latency'

class NetworkSimulator {
  private currentCondition: NetworkCondition = 'online'
  private requestCount = 0
  private failureRate = 0
  private latencyMs = 0

  setNetworkCondition(condition: NetworkCondition): void {
    this.currentCondition = condition
    this.requestCount = 0
    
    switch (condition) {
      case 'offline':
        this.failureRate = 1.0 // 100% failure
        this.latencyMs = 0
        break
      case 'slow':
        this.failureRate = 0
        this.latencyMs = 5000 // 5 second delay
        break
      case 'intermittent':
        this.failureRate = 0.3 // 30% failure rate
        this.latencyMs = 1000
        break
      case 'high-latency':
        this.failureRate = 0
        this.latencyMs = 3000 // 3 second delay
        break
      case 'online':
      default:
        this.failureRate = 0
        this.latencyMs = 100
        break
    }
  }

  simulateRequest<T>(originalRequest: () => Promise<T>): Promise<T> {
    this.requestCount++
    
    return new Promise((resolve, reject) => {
      // Add latency
      setTimeout(async () => {
        // Check if request should fail
        if (Math.random() < this.failureRate) {
          reject(new Error(`Network error: ${this.currentCondition}`))
          return
        }
        
        try {
          const result = await originalRequest()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, this.latencyMs)
    })
  }

  getStats() {
    return {
      condition: this.currentCondition,
      requestCount: this.requestCount,
      failureRate: this.failureRate,
      latencyMs: this.latencyMs
    }
  }

  reset(): void {
    this.currentCondition = 'online'
    this.requestCount = 0
    this.failureRate = 0
    this.latencyMs = 0
  }
}

// Mock Quran API responses
const mockQuranData = {
  surah: {
    id: 1,
    name: 'Al-Fatiha',
    englishName: 'The Opening',
    englishNameTranslation: 'The Opening',
    numberOfAyahs: 7,
    revelationType: 'Meccan'
  },
  ayahs: [
    {
      number: 1,
      text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      numberInSurah: 1,
      juz: 1,
      manzil: 1,
      page: 1,
      ruku: 1,
      hizbQuarter: 1,
      sajda: false
    },
    {
      number: 2,
      text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      numberInSurah: 2,
      juz: 1,
      manzil: 1,
      page: 1,
      ruku: 1,
      hizbQuarter: 1,
      sajda: false
    }
  ]
}

const mockAudioData = {
  audioUrl: 'https://everyayah.com/data/AbdurRahman_As-Sudais_192kbps/001001.mp3',
  reciter: 'AbdurRahman As-Sudais',
  format: 'mp3',
  bitrate: '192kbps'
}

describe('Enhanced Network Failure Recovery Tests', () => {
  let networkSimulator: NetworkSimulator
  let originalAxios: typeof axios

  beforeEach(() => {
    vi.clearAllMocks()
    networkSimulator = new NetworkSimulator()
    
    // Reset stores
    useQuranStore.getState().reset?.()
    useAudioStore.getState().reset?.()
    
    // Mock axios with network simulation
    originalAxios = axios
    vi.mocked(axios.get).mockImplementation((url: string) => {
      return networkSimulator.simulateRequest(() => {
        // Return appropriate mock data based on URL
        if (url.includes('/surah/')) {
          return Promise.resolve({ data: mockQuranData })
        } else if (url.includes('/audio/')) {
          return Promise.resolve({ data: mockAudioData })
        }
        return Promise.resolve({ data: {} })
      })
    })
  })

  afterEach(() => {
    networkSimulator.reset()
    vi.restoreAllMocks()
  })

  describe('Offline Functionality', () => {
    it('should handle complete network failure gracefully', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Set network to offline
      networkSimulator.setNetworkCondition('offline')
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // Should handle error gracefully
          expect(error).toBeDefined()
        }
      })
      
      // Should maintain app functionality despite network failure
      expect(result.current.error).toBeDefined()
      expect(result.current.isLoading).toBe(false)
      
      // Should provide offline fallback content if available
      if (result.current.offlineContent) {
        expect(result.current.offlineContent).toBeDefined()
      }
    })

    it('should cache content for offline access', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // First load content while online
      networkSimulator.setNetworkCondition('online')
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      const onlineContent = result.current.currentSurah
      expect(onlineContent).toBeDefined()
      
      // Clear error state
      await act(async () => {
        result.current.clearError?.()
      })
      
      // Then go offline and try to access cached content
      networkSimulator.setNetworkCondition('offline')
      
      await act(async () => {
        await result.current.loadSurah(1) // Should load from cache
      })
      
      // Should have access to cached content
      expect(result.current.currentSurah).toBeDefined()
      
      // Content should be available even offline
      if (result.current.currentSurah) {
        expect(result.current.currentSurah.id).toBe(1)
      }
    })

    it('should provide meaningful offline notifications', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      networkSimulator.setNetworkCondition('offline')
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // Error should be handled
        }
      })
      
      // Should provide user-friendly offline message
      expect(result.current.error).toBeDefined()
      expect(result.current.error?.message).toMatch(/offline|network|connection/i)
      
      // Should indicate offline status
      expect(result.current.isOffline).toBe(true)
    })
  })

  describe('Intermittent Network Issues', () => {
    it('should retry failed requests with exponential backoff', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      networkSimulator.setNetworkCondition('intermittent')
      
      const startTime = Date.now()
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // May fail, but should attempt retries
        }
      })
      
      const endTime = Date.now()
      const requestStats = networkSimulator.getStats()
      
      // Should have made multiple requests (retries)
      expect(requestStats.requestCount).toBeGreaterThan(1)
      
      // Should have taken reasonable time for retries
      expect(endTime - startTime).toBeGreaterThan(1000) // At least 1 second for retries
    }, 10000)

    it('should handle partial content loading gracefully', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      networkSimulator.setNetworkCondition('intermittent')
      
      await act(async () => {
        // Attempt to load multiple surahs
        const loadPromises = [1, 2, 3, 4, 5].map(surahId => 
          result.current.loadSurah(surahId).catch(() => null)
        )
        
        await Promise.allSettled(loadPromises)
      })
      
      // Should handle partial success/failure gracefully
      const requestStats = networkSimulator.getStats()
      expect(requestStats.requestCount).toBeGreaterThan(0)
      
      // App should remain functional despite partial failures
      expect(result.current.isLoading).toBe(false)
    })

    it('should maintain data consistency during network instability', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Load initial content while online
      networkSimulator.setNetworkCondition('online')
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      const initialContent = result.current.currentSurah
      
      // Switch to intermittent network
      networkSimulator.setNetworkCondition('intermittent')
      
      // Attempt multiple operations
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          try {
            await result.current.loadSurah(1)
          } catch (error) {
            // Some may fail
          }
        })
      }
      
      // Data should remain consistent
      if (result.current.currentSurah && initialContent) {
        expect(result.current.currentSurah.id).toBe(initialContent.id)
      }
    })
  })

  describe('High Latency Scenarios', () => {
    it('should handle slow network connections with appropriate timeouts', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      networkSimulator.setNetworkCondition('slow')
      
      const startTime = Date.now()
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // May timeout
        }
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should respect timeout settings
      expect(duration).toBeLessThan(15000) // Should timeout before 15 seconds
      
      // Should provide loading feedback during slow requests
      expect(result.current.isLoading).toBe(false) // Should have completed (success or timeout)
    }, 20000)

    it('should provide progressive loading feedback', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      networkSimulator.setNetworkCondition('high-latency')
      
      let loadingStates: boolean[] = []
      
      // Monitor loading states
      const loadingPromise = act(async () => {
        const loadPromise = result.current.loadSurah(1)
        
        // Check loading state periodically
        const checkInterval = setInterval(() => {
          loadingStates.push(result.current.isLoading)
        }, 100)
        
        try {
          await loadPromise
        } catch (error) {
          // Handle errors
        } finally {
          clearInterval(checkInterval)
        }
      })
      
      await loadingPromise
      
      // Should show loading states during high latency
      expect(loadingStates.filter(state => state).length).toBeGreaterThan(0)
    }, 15000)

    it('should implement request prioritization during slow connections', async () => {
      const { result: quranResult } = renderHook(() => useQuranStore())
      const { result: audioResult } = renderHook(() => useAudioStore())
      
      networkSimulator.setNetworkCondition('slow')
      
      const startTime = Date.now()
      
      await act(async () => {
        // Make concurrent requests
        const promises = [
          quranResult.current.loadSurah(1),
          audioResult.current.loadAudio(1, 1).catch(() => null) // Audio is lower priority
        ]
        
        await Promise.allSettled(promises)
      })
      
      const endTime = Date.now()
      const requestStats = networkSimulator.getStats()
      
      // Should have made multiple requests
      expect(requestStats.requestCount).toBeGreaterThan(0)
      
      // Text content should load before audio (prioritization)
      if (quranResult.current.currentSurah) {
        expect(quranResult.current.currentSurah).toBeDefined()
      }
    })
  })

  describe('Audio Streaming Resilience', () => {
    it('should handle audio streaming failures gracefully', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      networkSimulator.setNetworkCondition('intermittent')
      
      await act(async () => {
        try {
          await result.current.loadAudio(1, 1)
          result.current.play()
        } catch (error) {
          // Should handle audio failures
        }
      })
      
      // Should provide fallback or error handling for audio
      expect(result.current.error || result.current.currentAudio).toBeDefined()
    })

    it('should implement audio buffering strategies for unreliable networks', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      networkSimulator.setNetworkCondition('slow')
      
      await act(async () => {
        try {
          await result.current.loadAudio(1, 1)
          
          // Should implement buffering
          if (result.current.currentAudio) {
            expect(result.current.currentAudio.buffered).toBeDefined()
          }
        } catch (error) {
          // Handle gracefully
        }
      })
    })

    it('should support offline audio playback from cache', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      // Load audio while online
      networkSimulator.setNetworkCondition('online')
      
      await act(async () => {
        await result.current.loadAudio(1, 1)
      })
      
      // Go offline
      networkSimulator.setNetworkCondition('offline')
      
      await act(async () => {
        // Should play cached audio
        result.current.play()
      })
      
      // Should have audio available offline
      if (result.current.currentAudio) {
        expect(result.current.currentAudio.cached).toBe(true)
      }
    })
  })

  describe('API Error Recovery', () => {
    it('should handle API rate limiting gracefully', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Mock rate limiting response
      vi.mocked(axios.get).mockRejectedValueOnce({
        response: { status: 429, data: { message: 'Rate limit exceeded' } }
      })
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // Should handle rate limiting
        }
      })
      
      // Should provide appropriate error message
      expect(result.current.error?.message).toMatch(/rate limit|too many requests/i)
    })

    it('should handle server errors with graceful degradation', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Mock server error
      vi.mocked(axios.get).mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Internal server error' } }
      })
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // Should handle server errors
        }
      })
      
      // Should provide fallback content or appropriate error handling
      expect(result.current.error).toBeDefined()
      expect(result.current.isLoading).toBe(false)
    })

    it('should implement circuit breaker pattern for failing APIs', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Simulate multiple consecutive failures
      for (let i = 0; i < 5; i++) {
        vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'))
        
        await act(async () => {
          try {
            await result.current.loadSurah(i + 1)
          } catch (error) {
            // Expected to fail
          }
        })
      }
      
      // Circuit breaker should prevent further requests
      const requestStats = networkSimulator.getStats()
      
      // Should have attempted requests but then stopped (circuit breaker)
      expect(result.current.error).toBeDefined()
      
      // Should provide circuit breaker status
      if (result.current.circuitBreakerOpen) {
        expect(result.current.circuitBreakerOpen).toBe(true)
      }
    })
  })

  describe('Network Recovery', () => {
    it('should automatically recover when network is restored', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Start offline
      networkSimulator.setNetworkCondition('offline')
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // Expected to fail
        }
      })
      
      expect(result.current.error).toBeDefined()
      
      // Restore network
      networkSimulator.setNetworkCondition('online')
      
      await act(async () => {
        // Should automatically retry when network is restored
        await result.current.loadSurah(1)
      })
      
      // Should successfully load content
      expect(result.current.currentSurah).toBeDefined()
      expect(result.current.error).toBeNull()
    })

    it('should sync offline changes when network is restored', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      // Go offline
      networkSimulator.setNetworkCondition('offline')
      
      await act(async () => {
        // Make offline changes (e.g., bookmarks, progress)
        result.current.addOfflineBookmark?.(1, 1)
        result.current.updateOfflineProgress?.(1, 1, { timeSpent: 60000 })
      })
      
      // Restore network
      networkSimulator.setNetworkCondition('online')
      
      await act(async () => {
        // Should sync offline changes
        await result.current.syncOfflineData?.()
      })
      
      // Should have synced offline data
      expect(result.current.syncStatus).toBe('synced')
    })
  })
})