/**
 * Comprehensive Test Suite for Continuous Improvement System
 * Tests all components of the continuous improvement architecture
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Import stores and hooks
import { useAnalyticsStore } from '../stores/analyticsStore'
import { useOptimizationEngineStore } from '../stores/optimizationEngineStore'
import { usePerformanceMonitorStore } from '../stores/performanceMonitorStore'
import { useIslamicContentQualityStore } from '../stores/islamicContentQualityStore'
import { usePredictiveEnhancementStore } from '../stores/predictiveEnhancementStore'
import { useContinuousImprovement } from '../hooks/useContinuousImprovement'
import { useAutoEnhancementSystem } from '../hooks/useAutoEnhancementHooks'

// Test data
const mockUserInteraction = {
  id: 'test-interaction-1',
  timestamp: Date.now(),
  type: 'navigation' as const,
  action: 'page_load',
  context: {
    surahNumber: 1,
    ayahNumber: 1,
    pageNumber: 1,
    component: 'MushafReader'
  },
  performance: {
    loadTime: 1200,
    responseTime: 800,
    errorOccurred: false
  }
}

const mockPerformanceMetric = {
  id: 'test-metric-1',
  timestamp: Date.now(),
  type: 'page_load' as const,
  value: 1200,
  threshold: 3000,
  context: {
    page: '/mushaf',
    device: 'desktop'
  }
}

const mockOptimizationRule = {
  id: 'test-rule-1',
  name: 'Smart Cache Optimization',
  type: 'performance' as const,
  category: 'caching' as const,
  priority: 'high' as const,
  condition: {
    trigger: 'frequent_access',
    threshold: 5,
    context: { timeframe: '1hour' }
  },
  action: {
    type: 'enable_smart_cache',
    parameters: { priority: 'high', ttl: 3600 },
    autoApply: true
  },
  impact: {
    expectedImprovement: '40% faster load times',
    affectedAreas: ['page_load', 'content_access'],
    riskLevel: 'low' as const
  }
}

const mockIslamicContentRule = {
  id: 'test-islamic-rule-1',
  name: 'Arabic Text Authenticity Check',
  category: 'text_authenticity' as const,
  priority: 'critical' as const,
  validation: {
    type: 'reference_verification' as const,
    criteria: ['mushaf_uthmani_compliance', 'diacritic_accuracy'],
    automaticCheck: true
  },
  compliance: {
    required: true,
    islamicStandard: 'Mushaf Uthmani',
    source: 'King Fahd Complex'
  }
}

describe('Continuous Improvement System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all stores to initial state
    useAnalyticsStore.getState().reset?.()
    useOptimizationEngineStore.getState().reset?.()
    usePerformanceMonitorStore.getState().reset?.()
    useIslamicContentQualityStore.getState().reset?.()
    usePredictiveEnhancementStore.getState().reset?.()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Analytics Store', () => {
    it('should track user interactions correctly', async () => {
      const { result } = renderHook(() => useAnalyticsStore())
      
      await act(async () => {
        await result.current.trackInteraction(mockUserInteraction)
      })

      expect(result.current.interactions).toContainEqual(mockUserInteraction)
      expect(result.current.interactions).toHaveLength(1)
    })

    it('should update feature utilization tracking', async () => {
      const { result } = renderHook(() => useAnalyticsStore())
      
      await act(async () => {
        result.current.updateFeatureUtilization('mushaf_reader')
      })

      const utilization = result.current.featureUtilization.find(
        f => f.feature === 'mushaf_reader'
      )
      expect(utilization).toBeDefined()
      expect(utilization?.usageCount).toBeGreaterThan(0)
    })

    it('should track performance metrics', async () => {
      const { result } = renderHook(() => useAnalyticsStore())
      
      await act(async () => {
        await result.current.trackPerformanceMetric(mockPerformanceMetric)
      })

      expect(result.current.performanceMetrics).toContainEqual(mockPerformanceMetric)
    })

    it('should identify usage patterns', async () => {
      const { result } = renderHook(() => useAnalyticsStore())
      
      // Add multiple interactions to create a pattern
      const interactions = Array.from({ length: 5 }, (_, i) => ({
        ...mockUserInteraction,
        id: `interaction-${i}`,
        timestamp: Date.now() + i * 1000,
        context: { ...mockUserInteraction.context, surahNumber: 1 }
      }))

      await act(async () => {
        for (const interaction of interactions) {
          await result.current.trackInteraction(interaction)
        }
        await result.current.analyzeUsagePatterns()
      })

      expect(result.current.usagePatterns.length).toBeGreaterThan(0)
    })

    it('should track learning effectiveness', async () => {
      const { result } = renderHook(() => useAnalyticsStore())
      
      const effectiveness = {
        metric: 'memorization_success_rate',
        value: 0.85,
        context: {
          sessionCount: 10,
          ayahsMemorized: 8,
          timeframe: '24h'
        }
      }

      await act(async () => {
        result.current.trackLearningEffectiveness(effectiveness)
      })

      expect(result.current.learningEffectiveness).toContainEqual(effectiveness)
    })
  })

  describe('Optimization Engine Store', () => {
    it('should add and apply optimization rules', async () => {
      const { result } = renderHook(() => useOptimizationEngineStore())
      
      await act(async () => {
        result.current.addOptimizationRule(mockOptimizationRule)
      })

      expect(result.current.optimizationRules).toContainEqual(mockOptimizationRule)

      await act(async () => {
        await result.current.applyOptimization(mockOptimizationRule.id)
      })

      const appliedOptimization = result.current.appliedOptimizations.find(
        opt => opt.ruleId === mockOptimizationRule.id
      )
      expect(appliedOptimization).toBeDefined()
    })

    it('should optimize smart caching', async () => {
      const { result } = renderHook(() => useOptimizationEngineStore())
      
      await act(async () => {
        await result.current.optimizeSmartCaching()
      })

      expect(result.current.smartCacheStrategies.length).toBeGreaterThan(0)
    })

    it('should analyze UI patterns', async () => {
      const { result } = renderHook(() => useOptimizationEngineStore())
      
      await act(async () => {
        const adaptations = await result.current.analyzeUIPatterns()
        expect(Array.isArray(adaptations)).toBe(true)
      })
    })

    it('should optimize memorization settings', async () => {
      const { result } = renderHook(() => useOptimizationEngineStore())
      
      const userProgress = {
        memorizedAyahs: 50,
        streak: 7,
        totalXP: 1500,
        level: 5
      }

      await act(async () => {
        await result.current.optimizeMemorizationSettings(userProgress)
      })

      expect(result.current.memorizationOptimizations.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Monitor Store', () => {
    it('should measure page load performance', async () => {
      const { result } = renderHook(() => usePerformanceMonitorStore())
      
      await act(async () => {
        await result.current.measurePageLoad('/mushaf')
      })

      const metrics = result.current.metrics.filter(m => m.type === 'page_load')
      expect(metrics.length).toBeGreaterThan(0)
    })

    it('should track Core Web Vitals', async () => {
      const { result } = renderHook(() => usePerformanceMonitorStore())
      
      await act(async () => {
        result.current.trackCoreWebVitals({
          LCP: 2200,
          FID: 90,
          CLS: 0.08
        })
      })

      expect(result.current.coreWebVitals.LCP).toBe(2200)
      expect(result.current.coreWebVitals.FID).toBe(90)
      expect(result.current.coreWebVitals.CLS).toBe(0.08)
    })

    it('should measure memory usage', async () => {
      const { result } = renderHook(() => usePerformanceMonitorStore())
      
      await act(async () => {
        result.current.measureMemoryUsage()
      })

      expect(result.current.memoryUsage.used).toBeGreaterThan(0)
    })

    it('should generate optimization suggestions', async () => {
      const { result } = renderHook(() => usePerformanceMonitorStore())
      
      // Add some performance issues
      await act(async () => {
        result.current.trackCoreWebVitals({
          LCP: 4500, // Above threshold
          FID: 150,  // Above threshold
          CLS: 0.15  // Above threshold
        })
      })

      await act(async () => {
        await result.current.generateOptimizationSuggestions()
      })

      expect(result.current.optimizationSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('Islamic Content Quality Store', () => {
    it('should validate Arabic text quality', async () => {
      const { result } = renderHook(() => useIslamicContentQualityStore())
      
      const arabicText = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
      
      await act(async () => {
        await result.current.validateArabicText(1, 1, arabicText)
      })

      const validations = result.current.contentValidations.filter(
        v => v.content === arabicText
      )
      expect(validations.length).toBeGreaterThan(0)
    })

    it('should add and validate Islamic content rules', async () => {
      const { result } = renderHook(() => useIslamicContentQualityStore())
      
      await act(async () => {
        result.current.addContentRule(mockIslamicContentRule)
      })

      expect(result.current.contentRules).toContainEqual(mockIslamicContentRule)

      await act(async () => {
        const validationResult = await result.current.validateContentCompliance(
          'test-content',
          mockIslamicContentRule.id
        )
        expect(typeof validationResult.passed).toBe('boolean')
      })
    })

    it('should check citation format compliance', async () => {
      const { result } = renderHook(() => useIslamicContentQualityStore())
      
      await act(async () => {
        const isValid = await result.current.validateCitationFormat('Quran 2:255')
        expect(typeof isValid).toBe('boolean')
      })
    })

    it('should assess cultural sensitivity', async () => {
      const { result } = renderHook(() => useIslamicContentQualityStore())
      
      await act(async () => {
        const assessment = await result.current.assessCulturalSensitivity('Islamic content')
        expect(typeof assessment.score).toBe('number')
        expect(assessment.score).toBeGreaterThanOrEqual(0)
        expect(assessment.score).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('Predictive Enhancement Store', () => {
    it('should predict user behavior', async () => {
      const { result } = renderHook(() => usePredictiveEnhancementStore())
      
      const context = {
        timeOfDay: new Date().getHours(),
        page: '/mushaf',
        scrollPosition: 0,
        deviceType: 'desktop'
      }

      await act(async () => {
        const predictions = await result.current.predictUserBehavior('user-1', context)
        expect(Array.isArray(predictions)).toBe(true)
      })
    })

    it('should identify future needs', async () => {
      const { result } = renderHook(() => usePredictiveEnhancementStore())
      
      await act(async () => {
        const needs = await result.current.identifyFutureNeeds({
          usage: 'high',
          preferences: { feature_focus: 'memorization' }
        })
        expect(Array.isArray(needs)).toBe(true)
      })
    })

    it('should generate adaptive recommendations', async () => {
      const { result } = renderHook(() => usePredictiveEnhancementStore())
      
      await act(async () => {
        const recommendations = await result.current.generateAdaptiveRecommendations({
          memorization: true,
          progress: { level: 5, streak: 7 }
        })
        expect(Array.isArray(recommendations)).toBe(true)
      })
    })

    it('should update prediction models', async () => {
      const { result } = renderHook(() => usePredictiveEnhancementStore())
      
      const feedback = {
        predictionId: 'pred-1',
        actualOutcome: 'success',
        accuracy: 0.9,
        context: { model: 'usage_pattern' }
      }

      await act(async () => {
        result.current.updatePredictionModel(feedback)
      })

      expect(result.current.modelAccuracy.usage_pattern_prediction).toBeCloseTo(0.84, 1)
    })
  })

  describe('Continuous Improvement Hook', () => {
    it('should initialize correctly', async () => {
      const { result } = renderHook(() => useContinuousImprovement({
        cycleInterval: 60000,
        learningRate: 0.1,
        validationThreshold: 0.8,
        islamicComplianceCheck: true,
        autoApplyLowRisk: true
      }))

      await act(async () => {
        await result.current.initialize()
      })

      expect(result.current.status.isActive).toBe(true)
      expect(result.current.status.cycleCount).toBe(0)
    })

    it('should run learning cycle successfully', async () => {
      const { result } = renderHook(() => useContinuousImprovement({
        cycleInterval: 60000,
        learningRate: 0.1,
        validationThreshold: 0.8,
        islamicComplianceCheck: true,
        autoApplyLowRisk: true
      }))

      await act(async () => {
        await result.current.initialize()
        await result.current.runCycle()
      })

      expect(result.current.status.cycleCount).toBe(1)
      expect(result.current.status.lastCycleTime).toBeGreaterThan(0)
    })

    it('should pause and resume correctly', async () => {
      const { result } = renderHook(() => useContinuousImprovement({
        cycleInterval: 60000,
        learningRate: 0.1,
        validationThreshold: 0.8,
        islamicComplianceCheck: true,
        autoApplyLowRisk: true
      }))

      await act(async () => {
        await result.current.initialize()
        result.current.pause()
      })

      expect(result.current.status.isActive).toBe(false)

      await act(async () => {
        result.current.resume()
      })

      expect(result.current.status.isActive).toBe(true)
    })
  })

  describe('Auto-Enhancement System', () => {
    it('should initialize with correct configuration', () => {
      const { result } = renderHook(() => useAutoEnhancementSystem({
        enabledHooks: ['performance', 'interaction', 'quran'],
        performanceTracking: true,
        analyticsTracking: true,
        islamicContentValidation: true,
        predictiveOptimization: false
      }))

      expect(result.current.config.enabledHooks).toEqual(['performance', 'interaction', 'quran'])
      expect(result.current.config.performanceTracking).toBe(true)
      expect(result.current.config.predictiveOptimization).toBe(false)
    })

    it('should collect metrics from all hooks', () => {
      const { result } = renderHook(() => useAutoEnhancementSystem({
        enabledHooks: ['performance', 'interaction', 'quran', 'audio', 'progress'],
        performanceTracking: true,
        analyticsTracking: true,
        islamicContentValidation: true,
        predictiveOptimization: true
      }))

      const metrics = result.current.metrics()

      expect(metrics.byCategory).toHaveProperty('performance')
      expect(metrics.byCategory).toHaveProperty('interaction')
      expect(metrics.byCategory).toHaveProperty('quran')
      expect(metrics.byCategory).toHaveProperty('audio')
      expect(metrics.byCategory).toHaveProperty('progress')
      expect(metrics.summary).toHaveProperty('totalExecutions')
      expect(metrics.summary).toHaveProperty('averageSuccessRate')
    })
  })

  describe('Integration Tests', () => {
    it('should integrate all systems correctly', async () => {
      const continuousImprovementHook = renderHook(() => useContinuousImprovement({
        cycleInterval: 60000,
        learningRate: 0.1,
        validationThreshold: 0.8,
        islamicComplianceCheck: true,
        autoApplyLowRisk: true
      }))

      const autoEnhancementHook = renderHook(() => useAutoEnhancementSystem({
        enabledHooks: ['performance', 'interaction', 'quran', 'audio', 'progress'],
        performanceTracking: true,
        analyticsTracking: true,
        islamicContentValidation: true,
        predictiveOptimization: true
      }))

      // Initialize systems
      await act(async () => {
        await continuousImprovementHook.result.current.initialize()
      })

      // Simulate user interactions
      const analyticsStore = useAnalyticsStore.getState()
      await act(async () => {
        await analyticsStore.trackInteraction(mockUserInteraction)
        await analyticsStore.trackPerformanceMetric(mockPerformanceMetric)
      })

      // Run learning cycle
      await act(async () => {
        await continuousImprovementHook.result.current.runCycle()
      })

      // Verify integration
      expect(continuousImprovementHook.result.current.status.cycleCount).toBe(1)
      expect(analyticsStore.interactions).toHaveLength(1)
      
      const metrics = autoEnhancementHook.result.current.metrics()
      expect(metrics.total).toBeGreaterThanOrEqual(0)
    })

    it('should handle Islamic compliance validation', async () => {
      const islamicQualityStore = useIslamicContentQualityStore.getState()
      
      await act(async () => {
        islamicQualityStore.addContentRule(mockIslamicContentRule)
        const validation = await islamicQualityStore.validateContentCompliance(
          'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
          mockIslamicContentRule.id
        )
        expect(validation.passed).toBe(true)
      })
    })

    it('should optimize performance based on metrics', async () => {
      const performanceStore = usePerformanceMonitorStore.getState()
      const optimizationStore = useOptimizationEngineStore.getState()
      
      // Add performance issue
      await act(async () => {
        performanceStore.trackCoreWebVitals({
          LCP: 4500, // Above threshold
          FID: 150,  // Above threshold
          CLS: 0.15  // Above threshold
        })
      })

      // Generate and apply optimizations
      await act(async () => {
        await performanceStore.generateOptimizationSuggestions()
        optimizationStore.addOptimizationRule(mockOptimizationRule)
        await optimizationStore.applyOptimization(mockOptimizationRule.id)
      })

      expect(performanceStore.optimizationSuggestions.length).toBeGreaterThan(0)
      expect(optimizationStore.appliedOptimizations.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle store initialization errors gracefully', async () => {
      const { result } = renderHook(() => useContinuousImprovement({
        cycleInterval: 60000,
        learningRate: 0.1,
        validationThreshold: 0.8,
        islamicComplianceCheck: true,
        autoApplyLowRisk: true
      }))

      // Mock a store error
      const originalConsoleError = console.error
      console.error = vi.fn()

      await act(async () => {
        try {
          await result.current.initialize()
          // Should not throw error even if stores have issues
        } catch (error) {
          // Should handle gracefully
          expect(error).toBeUndefined()
        }
      })

      console.error = originalConsoleError
    })

    it('should recover from failed optimizations', async () => {
      const { result } = renderHook(() => useOptimizationEngineStore())
      
      // Add a rule that might fail
      const failingRule = {
        ...mockOptimizationRule,
        id: 'failing-rule',
        action: {
          type: 'invalid_action',
          parameters: {},
          autoApply: true
        }
      }

      await act(async () => {
        result.current.addOptimizationRule(failingRule)
        
        try {
          await result.current.applyOptimization(failingRule.id)
        } catch (error) {
          // Should handle optimization failure gracefully
        }
      })

      // System should continue to function
      expect(result.current.optimizationRules).toContainEqual(failingRule)
    })
  })

  describe('Performance and Memory', () => {
    it('should not cause memory leaks during continuous operation', async () => {
      const { result, unmount } = renderHook(() => useContinuousImprovement({
        cycleInterval: 100, // Fast cycle for testing
        learningRate: 0.1,
        validationThreshold: 0.8,
        islamicComplianceCheck: true,
        autoApplyLowRisk: true
      }))

      await act(async () => {
        await result.current.initialize()
      })

      // Run multiple cycles
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.runCycle()
        })
      }

      expect(result.current.status.cycleCount).toBe(5)

      // Cleanup should work properly
      act(() => {
        unmount()
      })

      // No errors should occur during cleanup
    })

    it('should throttle excessive operations', async () => {
      const { result } = renderHook(() => useAnalyticsStore())
      
      const startTime = Date.now()
      
      // Attempt to track many interactions rapidly
      await act(async () => {
        const promises = Array.from({ length: 100 }, (_, i) => 
          result.current.trackInteraction({
            ...mockUserInteraction,
            id: `rapid-interaction-${i}`,
            timestamp: Date.now() + i
          })
        )
        await Promise.all(promises)
      })

      const endTime = Date.now()
      
      // Should complete within reasonable time (throttling/batching)
      expect(endTime - startTime).toBeLessThan(5000)
      expect(result.current.interactions.length).toBeLessThanOrEqual(100)
    })
  })
})

describe('Islamic Compliance and Cultural Sensitivity', () => {
  it('should maintain Islamic authenticity in all optimizations', async () => {
    const { result } = renderHook(() => useIslamicContentQualityStore())
    
    await act(async () => {
      result.current.addContentRule(mockIslamicContentRule)
      
      // Test various Islamic content
      const islamicTexts = [
        'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ'
      ]
      
      for (const text of islamicTexts) {
        const validation = await result.current.validateContentCompliance(
          text,
          mockIslamicContentRule.id
        )
        expect(validation.passed).toBe(true)
      }
    })
  })

  it('should respect Islamic terminology and cultural sensitivity', async () => {
    const { result } = renderHook(() => useIslamicContentQualityStore())
    
    await act(async () => {
      const sensitivityTests = [
        'Islamic guidance',
        'Quran recitation',
        'Prophet Muhammad (peace be upon him)',
        'Islamic prayer'
      ]
      
      for (const text of sensitivityTests) {
        const assessment = await result.current.assessCulturalSensitivity(text)
        expect(assessment.score).toBeGreaterThan(0.7) // High cultural sensitivity score
      }
    })
  })
})