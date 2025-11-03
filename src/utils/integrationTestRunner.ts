/**
 * Integration Test Runner for Continuous Improvement System
 * Demonstrates and validates complete system functionality
 */

import { continuousImprovementValidator } from './continuousImprovementValidator'
import { useAnalyticsStore } from '../stores/analyticsStore'
import { useOptimizationEngineStore } from '../stores/optimizationEngineStore'
import { usePerformanceMonitorStore } from '../stores/performanceMonitorStore'
import { useIslamicContentQualityStore } from '../stores/islamicContentQualityStore'
import { usePredictiveEnhancementStore } from '../stores/predictiveEnhancementStore'

interface IntegrationTestResult {
  testName: string
  status: 'pass' | 'fail' | 'warning'
  duration: number
  details: string
  data?: any
}

interface IntegrationTestReport {
  timestamp: number
  totalTests: number
  passed: number
  failed: number
  warnings: number
  totalDuration: number
  results: IntegrationTestResult[]
  systemStatus: {
    analytics: boolean
    optimization: boolean
    performance: boolean
    islamicQuality: boolean
    predictive: boolean
  }
  recommendations: string[]
}

class IntegrationTestRunner {
  private results: IntegrationTestResult[] = []
  private startTime: number = 0

  /**
   * Run complete integration test suite
   */
  async runCompleteIntegrationTest(): Promise<IntegrationTestReport> {
    this.startTime = performance.now()
    this.results = []

    console.log('🧪 Starting Continuous Improvement System Integration Tests...')
    console.log('=' * 80)

    // Run individual test suites
    await this.testAnalyticsIntegration()
    await this.testOptimizationIntegration()
    await this.testPerformanceIntegration()
    await this.testIslamicQualityIntegration()
    await this.testPredictiveIntegration()
    await this.testCrossSystemIntegration()
    await this.testRealWorldScenarios()
    await this.testIslamicComplianceWorkflow()

    // Generate final report
    const report = this.generateIntegrationReport()
    this.logIntegrationReport(report)

    return report
  }

  /**
   * Test Analytics Store integration
   */
  private async testAnalyticsIntegration(): Promise<void> {
    const testName = 'Analytics Store Integration'
    const startTime = performance.now()

    try {
      const analytics = useAnalyticsStore.getState()

      // Test 1: User interaction tracking
      const interactions = [
        {
          id: 'test-interaction-1',
          timestamp: Date.now(),
          type: 'navigation' as const,
          action: 'page_load',
          context: { surahNumber: 1, ayahNumber: 1, component: 'MushafReader' }
        },
        {
          id: 'test-interaction-2',
          timestamp: Date.now() + 1000,
          type: 'audio' as const,
          action: 'play_start',
          context: { surahNumber: 1, ayahNumber: 1, reciterId: 'alafasy' }
        },
        {
          id: 'test-interaction-3',
          timestamp: Date.now() + 2000,
          type: 'memorization' as const,
          action: 'verse_memorized',
          context: { surahNumber: 1, ayahNumber: 1, difficulty: 'easy' }
        }
      ]

      for (const interaction of interactions) {
        await analytics.trackInteraction(interaction)
      }

      // Verify interactions were tracked
      const trackedCount = analytics.interactions.filter(
        i => i.id.startsWith('test-interaction-')
      ).length

      if (trackedCount === interactions.length) {
        this.addResult({
          testName,
          status: 'pass',
          duration: performance.now() - startTime,
          details: `Successfully tracked ${trackedCount} user interactions`,
          data: { interactions: trackedCount }
        })
      } else {
        this.addResult({
          testName,
          status: 'fail',
          duration: performance.now() - startTime,
          details: `Expected ${interactions.length} interactions, got ${trackedCount}`
        })
      }

      // Test 2: Performance metrics tracking
      const performanceMetrics = [
        {
          id: 'perf-metric-1',
          timestamp: Date.now(),
          type: 'page_load' as const,
          value: 1200,
          threshold: 3000,
          context: { page: '/mushaf' }
        },
        {
          id: 'perf-metric-2',
          timestamp: Date.now() + 1000,
          type: 'api_response' as const,
          value: 800,
          threshold: 1000,
          context: { endpoint: '/api/quran/surah/1' }
        }
      ]

      for (const metric of performanceMetrics) {
        await analytics.trackPerformanceMetric(metric)
      }

      // Test 3: Usage pattern analysis
      await analytics.analyzeUsagePatterns()

      this.addResult({
        testName: 'Analytics Pattern Analysis',
        status: analytics.usagePatterns.length > 0 ? 'pass' : 'warning',
        duration: performance.now() - startTime,
        details: `Generated ${analytics.usagePatterns.length} usage patterns`,
        data: { patterns: analytics.usagePatterns.length }
      })

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        details: `Analytics integration failed: ${error}`
      })
    }
  }

  /**
   * Test Optimization Engine integration
   */
  private async testOptimizationIntegration(): Promise<void> {
    const testName = 'Optimization Engine Integration'
    const startTime = performance.now()

    try {
      const optimization = useOptimizationEngineStore.getState()

      // Test 1: Add optimization rules
      const testRules = [
        {
          id: 'test-rule-1',
          name: 'Smart Cache for Frequent Surahs',
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
        },
        {
          id: 'test-rule-2',
          name: 'Font Optimization for Arabic Text',
          type: 'ux' as const,
          category: 'ui_adaptation' as const,
          priority: 'medium' as const,
          condition: {
            trigger: 'reading_difficulty',
            threshold: 3,
            context: { scroll_speed: 'slow' }
          },
          action: {
            type: 'increase_font_size',
            parameters: { increment: 2 },
            autoApply: false
          },
          impact: {
            expectedImprovement: 'Improved readability',
            affectedAreas: ['arabic_text', 'user_experience'],
            riskLevel: 'low' as const
          }
        }
      ]

      for (const rule of testRules) {
        optimization.addOptimizationRule(rule)
      }

      // Test 2: Apply optimizations
      let appliedCount = 0
      for (const rule of testRules) {
        try {
          await optimization.applyOptimization(rule.id)
          appliedCount++
        } catch (error) {
          console.warn(`Failed to apply rule ${rule.id}:`, error)
        }
      }

      // Test 3: Smart caching optimization
      await optimization.optimizeSmartCaching()

      // Test 4: UI pattern analysis
      const adaptations = await optimization.analyzeUIPatterns()

      this.addResult({
        testName,
        status: appliedCount > 0 ? 'pass' : 'warning',
        duration: performance.now() - startTime,
        details: `Applied ${appliedCount}/${testRules.length} optimizations, ${adaptations.length} UI adaptations`,
        data: { 
          rulesApplied: appliedCount,
          cacheStrategies: optimization.smartCacheStrategies.length,
          uiAdaptations: adaptations.length
        }
      })

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        details: `Optimization integration failed: ${error}`
      })
    }
  }

  /**
   * Test Performance Monitor integration
   */
  private async testPerformanceIntegration(): Promise<void> {
    const testName = 'Performance Monitor Integration'
    const startTime = performance.now()

    try {
      const performance = usePerformanceMonitorStore.getState()

      // Test 1: Page load measurement
      await performance.measurePageLoad('/mushaf')
      await performance.measurePageLoad('/progress')

      // Test 2: API response tracking
      performance.measureAPIResponse('/api/quran/surah/1', 850)
      performance.measureAPIResponse('/api/audio/alafasy/1/1', 1200)

      // Test 3: Core Web Vitals tracking
      performance.trackCoreWebVitals({
        LCP: 2200,
        FID: 85,
        CLS: 0.06
      })

      // Test 4: Memory usage measurement
      performance.measureMemoryUsage()

      // Test 5: Generate optimization suggestions
      await performance.generateOptimizationSuggestions()

      const metricsCount = performance.metrics.length
      const suggestionsCount = performance.optimizationSuggestions.length

      this.addResult({
        testName,
        status: metricsCount > 0 ? 'pass' : 'fail',
        duration: performance.now() - startTime,
        details: `Tracked ${metricsCount} metrics, generated ${suggestionsCount} suggestions`,
        data: {
          metrics: metricsCount,
          suggestions: suggestionsCount,
          coreWebVitals: performance.coreWebVitals,
          memoryUsage: performance.memoryUsage
        }
      })

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        details: `Performance integration failed: ${error}`
      })
    }
  }

  /**
   * Test Islamic Content Quality integration
   */
  private async testIslamicQualityIntegration(): Promise<void> {
    const testName = 'Islamic Content Quality Integration'
    const startTime = performance.now()

    try {
      const islamicQuality = useIslamicContentQualityStore.getState()

      // Test 1: Arabic text validation
      const arabicTexts = [
        'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', // Al-Fatiha 1:1
        'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', // Al-Fatiha 1:2
        'الرَّحْمَنِ الرَّحِيمِ' // Al-Fatiha 1:3
      ]

      let validatedCount = 0
      for (let i = 0; i < arabicTexts.length; i++) {
        try {
          await islamicQuality.validateArabicText(1, i + 1, arabicTexts[i])
          validatedCount++
        } catch (error) {
          console.warn(`Failed to validate text ${i + 1}:`, error)
        }
      }

      // Test 2: Citation format validation
      const citations = [
        'Quran 1:1',
        'Quran 2:255',
        'Sahih Bukhari 1:1'
      ]

      let validCitations = 0
      for (const citation of citations) {
        const isValid = await islamicQuality.validateCitationFormat(citation)
        if (isValid) validCitations++
      }

      // Test 3: Cultural sensitivity assessment
      const contentSamples = [
        'Quran recitation by Sheikh Abdul Rahman Al-Sudais',
        'Islamic prayer guidance for beginners',
        'Memorizing the Holy Quran'
      ]

      let sensitivityScores: number[] = []
      for (const content of contentSamples) {
        const assessment = await islamicQuality.assessCulturalSensitivity(content)
        sensitivityScores.push(assessment.score)
      }

      const avgSensitivityScore = sensitivityScores.reduce((a, b) => a + b, 0) / sensitivityScores.length

      this.addResult({
        testName,
        status: validatedCount > 0 && avgSensitivityScore > 0.7 ? 'pass' : 'warning',
        duration: performance.now() - startTime,
        details: `Validated ${validatedCount}/${arabicTexts.length} texts, ${validCitations}/${citations.length} citations valid, avg sensitivity: ${(avgSensitivityScore * 100).toFixed(1)}%`,
        data: {
          arabicValidations: validatedCount,
          validCitations,
          sensitivityScore: avgSensitivityScore,
          contentRules: islamicQuality.contentRules.length
        }
      })

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        details: `Islamic quality integration failed: ${error}`
      })
    }
  }

  /**
   * Test Predictive Enhancement integration
   */
  private async testPredictiveIntegration(): Promise<void> {
    const testName = 'Predictive Enhancement Integration'
    const startTime = performance.now()

    try {
      const predictive = usePredictiveEnhancementStore.getState()

      // Test 1: User behavior prediction
      const contexts = [
        {
          timeOfDay: 9, // Morning
          page: '/mushaf',
          scrollPosition: 0,
          deviceType: 'mobile'
        },
        {
          timeOfDay: 21, // Evening
          page: '/progress',
          scrollPosition: 500,
          deviceType: 'desktop'
        }
      ]

      let totalPredictions = 0
      for (const context of contexts) {
        const predictions = await predictive.predictUserBehavior('test-user', context)
        totalPredictions += predictions.length
      }

      // Test 2: Future needs identification
      const userProfiles = [
        { usage: 'high', preferences: { feature_focus: 'memorization' } },
        { usage: 'medium', preferences: { feature_focus: 'reading' } }
      ]

      let totalNeeds = 0
      for (const profile of userProfiles) {
        const needs = await predictive.identifyFutureNeeds(profile)
        totalNeeds += needs.length
      }

      // Test 3: Adaptive recommendations
      const contexts2 = [
        { memorization: true, progress: { level: 5, streak: 7 } },
        { reading: true, performance: { currentLevel: 'beginner' } }
      ]

      let totalRecommendations = 0
      for (const context of contexts2) {
        const recommendations = await predictive.generateAdaptiveRecommendations(context)
        totalRecommendations += recommendations.length
      }

      // Test 4: Model accuracy
      const modelAccuracy = predictive.modelAccuracy.usage_pattern_prediction

      this.addResult({
        testName,
        status: totalPredictions > 0 && totalRecommendations > 0 ? 'pass' : 'warning',
        duration: performance.now() - startTime,
        details: `Generated ${totalPredictions} predictions, ${totalNeeds} needs, ${totalRecommendations} recommendations. Model accuracy: ${(modelAccuracy * 100).toFixed(1)}%`,
        data: {
          predictions: totalPredictions,
          futureNeeds: totalNeeds,
          recommendations: totalRecommendations,
          modelAccuracy
        }
      })

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        details: `Predictive integration failed: ${error}`
      })
    }
  }

  /**
   * Test cross-system integration
   */
  private async testCrossSystemIntegration(): Promise<void> {
    const testName = 'Cross-System Integration'
    const startTime = performance.now()

    try {
      // Simulate a complete user workflow that touches all systems
      const analytics = useAnalyticsStore.getState()
      const optimization = useOptimizationEngineStore.getState()
      const performance = usePerformanceMonitorStore.getState()
      const islamicQuality = useIslamicContentQualityStore.getState()
      const predictive = usePredictiveEnhancementStore.getState()

      // 1. User opens Mushaf page (Analytics + Performance)
      await analytics.trackInteraction({
        id: 'workflow-1',
        timestamp: Date.now(),
        type: 'navigation',
        action: 'mushaf_open',
        context: { surahNumber: 2 }
      })
      await performance.measurePageLoad('/mushaf')

      // 2. User reads Arabic text (Islamic Quality)
      await islamicQuality.validateArabicText(2, 1, 'الم')

      // 3. System optimizes based on usage (Optimization)
      await optimization.optimizeSmartCaching()

      // 4. System predicts next action (Predictive)
      const predictions = await predictive.predictUserBehavior('workflow-user', {
        timeOfDay: new Date().getHours(),
        page: '/mushaf',
        scrollPosition: 0,
        deviceType: 'desktop'
      })

      // 5. Generate adaptive recommendations
      const recommendations = await predictive.generateAdaptiveRecommendations({
        reading: true,
        currentSurah: 2
      })

      // Verify data consistency across systems
      const hasAnalyticsData = analytics.interactions.some(i => i.id === 'workflow-1')
      const hasPerformanceData = performance.metrics.some(m => m.type === 'page_load')
      const hasQualityData = islamicQuality.contentValidations.length > 0
      const hasOptimizationData = optimization.smartCacheStrategies.length > 0
      const hasPredictiveData = predictions.length > 0

      const systemsWorking = [
        hasAnalyticsData,
        hasPerformanceData,
        hasQualityData,
        hasOptimizationData,
        hasPredictiveData
      ].filter(Boolean).length

      this.addResult({
        testName,
        status: systemsWorking >= 4 ? 'pass' : systemsWorking >= 2 ? 'warning' : 'fail',
        duration: performance.now() - startTime,
        details: `${systemsWorking}/5 systems integrated successfully in workflow`,
        data: {
          systemsWorking,
          predictions: predictions.length,
          recommendations: recommendations.length,
          dataConsistency: {
            analytics: hasAnalyticsData,
            performance: hasPerformanceData,
            quality: hasQualityData,
            optimization: hasOptimizationData,
            predictive: hasPredictiveData
          }
        }
      })

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        details: `Cross-system integration failed: ${error}`
      })
    }
  }

  /**
   * Test real-world usage scenarios
   */
  private async testRealWorldScenarios(): Promise<void> {
    const testName = 'Real-World Scenarios'
    const startTime = performance.now()

    try {
      // Scenario 1: Daily Quran reading session
      await this.simulateDailyReadingSession()

      // Scenario 2: Memorization practice session
      await this.simulateMemorizationSession()

      // Scenario 3: Performance degradation and recovery
      await this.simulatePerformanceIssue()

      this.addResult({
        testName,
        status: 'pass',
        duration: performance.now() - startTime,
        details: 'Successfully simulated real-world usage scenarios',
        data: {
          scenarios: 3,
          comprehensive: true
        }
      })

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        details: `Real-world scenarios failed: ${error}`
      })
    }
  }

  /**
   * Test Islamic compliance workflow
   */
  private async testIslamicComplianceWorkflow(): Promise<void> {
    const testName = 'Islamic Compliance Workflow'
    const startTime = performance.now()

    try {
      const islamicQuality = useIslamicContentQualityStore.getState()

      // Add Islamic content rules
      const rules = [
        {
          id: 'arabic-authenticity',
          name: 'Arabic Text Authenticity',
          category: 'text_authenticity' as const,
          priority: 'critical' as const,
          validation: {
            type: 'reference_verification' as const,
            criteria: ['mushaf_uthmani_compliance'],
            automaticCheck: true
          },
          compliance: {
            required: true,
            islamicStandard: 'Mushaf Uthmani',
            source: 'King Fahd Complex'
          }
        },
        {
          id: 'cultural-sensitivity',
          name: 'Cultural Sensitivity Check',
          category: 'cultural_sensitivity' as const,
          priority: 'high' as const,
          validation: {
            type: 'cultural_review' as const,
            criteria: ['respectful_terminology', 'inclusive_language'],
            automaticCheck: true
          },
          compliance: {
            required: true,
            islamicStandard: 'Islamic Cultural Standards',
            source: 'Islamic Scholars Council'
          }
        }
      ]

      for (const rule of rules) {
        islamicQuality.addContentRule(rule)
      }

      // Validate content against rules
      const testContent = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
      let complianceResults = []

      for (const rule of rules) {
        const result = await islamicQuality.validateContentCompliance(testContent, rule.id)
        complianceResults.push(result)
      }

      const allCompliant = complianceResults.every(r => r.passed)
      const complianceScore = complianceResults.filter(r => r.passed).length / complianceResults.length

      this.addResult({
        testName,
        status: allCompliant ? 'pass' : complianceScore > 0.5 ? 'warning' : 'fail',
        duration: performance.now() - startTime,
        details: `Islamic compliance: ${(complianceScore * 100).toFixed(1)}% (${complianceResults.filter(r => r.passed).length}/${complianceResults.length} rules passed)`,
        data: {
          rulesAdded: rules.length,
          complianceScore,
          allCompliant,
          results: complianceResults
        }
      })

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        details: `Islamic compliance workflow failed: ${error}`
      })
    }
  }

  /**
   * Simulate daily reading session
   */
  private async simulateDailyReadingSession(): Promise<void> {
    const analytics = useAnalyticsStore.getState()
    const performance = usePerformanceMonitorStore.getState()

    // Simulate user opening Quran app
    await analytics.trackInteraction({
      id: 'daily-session-1',
      timestamp: Date.now(),
      type: 'navigation',
      action: 'app_open',
      context: { session_type: 'daily_reading' }
    })

    // Simulate page load
    await performance.measurePageLoad('/mushaf')

    // Simulate reading Al-Fatiha
    await analytics.trackInteraction({
      id: 'daily-session-2',
      timestamp: Date.now() + 1000,
      type: 'navigation',
      action: 'surah_open',
      context: { surahNumber: 1 }
    })

    // Simulate reading progress
    for (let ayah = 1; ayah <= 7; ayah++) {
      await analytics.trackInteraction({
        id: `daily-session-ayah-${ayah}`,
        timestamp: Date.now() + ayah * 2000,
        type: 'navigation',
        action: 'ayah_read',
        context: { surahNumber: 1, ayahNumber: ayah }
      })
    }
  }

  /**
   * Simulate memorization session
   */
  private async simulateMemorizationSession(): Promise<void> {
    const analytics = useAnalyticsStore.getState()
    const optimization = useOptimizationEngineStore.getState()

    // Simulate memorization practice
    const memorizations = [
      { surah: 1, ayah: 1, attempts: 3, success: true },
      { surah: 1, ayah: 2, attempts: 5, success: true },
      { surah: 1, ayah: 3, attempts: 4, success: false }
    ]

    for (const mem of memorizations) {
      await analytics.trackInteraction({
        id: `memo-${mem.surah}-${mem.ayah}`,
        timestamp: Date.now(),
        type: 'memorization',
        action: mem.success ? 'verse_memorized' : 'memorization_attempt',
        context: {
          surahNumber: mem.surah,
          ayahNumber: mem.ayah,
          attempts: mem.attempts,
          success: mem.success
        }
      })
    }

    // Optimize memorization settings based on performance
    await optimization.optimizeMemorizationSettings({
      memorizedAyahs: 15,
      streak: 5,
      totalXP: 750,
      level: 3
    })
  }

  /**
   * Simulate performance issue and recovery
   */
  private async simulatePerformanceIssue(): Promise<void> {
    const performance = usePerformanceMonitorStore.getState()
    const optimization = useOptimizationEngineStore.getState()

    // Simulate slow page load
    await performance.measurePageLoad('/mushaf')
    performance.trackCoreWebVitals({
      LCP: 4500, // Above threshold
      FID: 150,  // Above threshold
      CLS: 0.15  // Above threshold
    })

    // Generate optimization suggestions
    await performance.generateOptimizationSuggestions()

    // Apply optimization
    await optimization.optimizeSmartCaching()
  }

  /**
   * Add a test result
   */
  private addResult(result: Omit<IntegrationTestResult, 'duration'> & { duration?: number }): void {
    this.results.push({
      duration: 0,
      ...result
    })
  }

  /**
   * Generate integration test report
   */
  private generateIntegrationReport(): IntegrationTestReport {
    const totalDuration = performance.now() - this.startTime
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const warnings = this.results.filter(r => r.status === 'warning').length

    // Check system status
    const analytics = useAnalyticsStore.getState()
    const optimization = useOptimizationEngineStore.getState()
    const performance = usePerformanceMonitorStore.getState()
    const islamicQuality = useIslamicContentQualityStore.getState()
    const predictive = usePredictiveEnhancementStore.getState()

    const systemStatus = {
      analytics: analytics.interactions.length > 0,
      optimization: optimization.optimizationRules.length > 0,
      performance: performance.metrics.length > 0,
      islamicQuality: islamicQuality.contentRules.length > 0,
      predictive: Object.keys(predictive.userPersonas).length > 0
    }

    // Generate recommendations
    const recommendations: string[] = []
    if (failed > 0) {
      recommendations.push(`Address ${failed} failed tests for system stability`)
    }
    if (warnings > 0) {
      recommendations.push(`Review ${warnings} warnings for optimization opportunities`)
    }
    if (Object.values(systemStatus).every(Boolean)) {
      recommendations.push('All systems operational - monitor for continuous improvement')
    } else {
      recommendations.push('Some systems not fully initialized - check integration')
    }

    return {
      timestamp: Date.now(),
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      totalDuration,
      results: this.results,
      systemStatus,
      recommendations
    }
  }

  /**
   * Log integration test report
   */
  private logIntegrationReport(report: IntegrationTestReport): void {
    console.log('\n🧪 Continuous Improvement System Integration Test Report')
    console.log('=' * 80)
    console.log(`Total Tests: ${report.totalTests}`)
    console.log(`✅ Passed: ${report.passed}`)
    console.log(`❌ Failed: ${report.failed}`)
    console.log(`⚠️  Warnings: ${report.warnings}`)
    console.log(`🕐 Total Duration: ${report.totalDuration.toFixed(2)}ms`)
    
    console.log('\n🏗️ System Status:')
    Object.entries(report.systemStatus).forEach(([system, status]) => {
      console.log(`  ${status ? '✅' : '❌'} ${system}: ${status ? 'operational' : 'not ready'}`)
    })

    console.log('\n📊 Test Results:')
    report.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
      console.log(`  ${icon} ${result.testName}: ${result.details}`)
    })

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      report.recommendations.forEach(rec => console.log(`  - ${rec}`))
    }

    console.log('\n' + '=' * 80)
  }
}

// Export singleton instance
export const integrationTestRunner = new IntegrationTestRunner()

// Add to window for development access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).runIntegrationTests = () => 
    integrationTestRunner.runCompleteIntegrationTest()
}