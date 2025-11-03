/**
 * Automated Performance Testing and Monitoring System for QuranApp
 * 
 * Comprehensive performance testing framework with automated monitoring,
 * regression detection, and continuous optimization for Islamic applications.
 */

import { performanceOptimizer, PerformanceMetrics } from './performanceMonitor';
import { quranAudioOptimizer, AudioPerformanceMetrics } from './audioOptimization';
import { arabicTextOptimizer, ArabicTextMetrics } from './arabicTextOptimization';
import { mobilePerformanceOptimizer, MobilePerformanceMetrics } from './mobileOptimization';

// Performance testing configuration
export const PERFORMANCE_TEST_CONFIG = {
  testing: {
    enableAutomatedTesting: true,
    testInterval: 60000, // 1 minute
    regressionThreshold: 0.2, // 20% performance degradation
    alertThreshold: 0.3, // 30% degradation triggers alert
  },
  thresholds: {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    ttfb: { good: 600, poor: 1200 },
    audioLoad: { good: 3000, poor: 8000 },
    textRender: { good: 16, poor: 100 },
    touchResponse: { good: 16, poor: 100 },
  },
  reporting: {
    enableRealTimeReporting: true,
    enablePerformanceAlerts: true,
    saveHistoricalData: true,
    maxHistoryEntries: 1000,
  }
} as const;

// Performance test result interface
export interface PerformanceTestResult {
  timestamp: number;
  testId: string;
  testType: 'core-web-vitals' | 'audio' | 'arabic-text' | 'mobile' | 'comprehensive';
  duration: number;
  success: boolean;
  score: number;
  metrics: {
    core?: Partial<PerformanceMetrics>;
    audio?: AudioPerformanceMetrics;
    arabic?: ArabicTextMetrics;
    mobile?: MobilePerformanceMetrics;
  };
  issues: PerformanceIssue[];
  recommendations: string[];
}

export interface PerformanceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'core-web-vitals' | 'audio' | 'arabic-text' | 'mobile' | 'memory' | 'network';
  description: string;
  metric: string;
  actualValue: number;
  expectedValue: number;
  impact: string;
  solution: string;
}

export interface PerformanceBaseline {
  timestamp: number;
  version: string;
  metrics: {
    lcp: number;
    fid: number;
    cls: number;
    audioLoadTime: number;
    arabicRenderTime: number;
    touchResponseTime: number;
  };
  environment: {
    userAgent: string;
    screenSize: string;
    connectionType: string;
    deviceType: string;
  };
}

/**
 * Automated Performance Testing Framework
 */
export class PerformanceTestFramework {
  private testHistory: PerformanceTestResult[] = [];
  private performanceBaseline: PerformanceBaseline | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: ((issue: PerformanceIssue) => void)[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializeFramework();
  }

  /**
   * Initialize the performance testing framework
   */
  private async initializeFramework(): Promise<void> {
    try {
      // Load historical data
      this.loadHistoricalData();
      
      // Establish baseline if none exists
      if (!this.performanceBaseline) {
        await this.establishBaseline();
      }
      
      // Start automated monitoring
      if (PERFORMANCE_TEST_CONFIG.testing.enableAutomatedTesting) {
        this.startAutomatedMonitoring();
      }
      
      console.log('🧪 Performance Testing Framework initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize performance testing framework:', error);
    }
  }

  /**
   * Establish performance baseline
   */
  public async establishBaseline(): Promise<PerformanceBaseline> {
    console.log('📊 Establishing performance baseline...');
    
    const result = await this.runComprehensiveTest();
    
    this.performanceBaseline = {
      timestamp: Date.now(),
      version: '1.0.0', // Could be extracted from package.json
      metrics: {
        lcp: result.metrics.core?.lcp || 0,
        fid: result.metrics.core?.fid || 0,
        cls: result.metrics.core?.cls || 0,
        audioLoadTime: result.metrics.audio?.loadingTime || 0,
        arabicRenderTime: result.metrics.arabic?.renderTime || 0,
        touchResponseTime: result.metrics.mobile?.touchResponseTime || 0,
      },
      environment: {
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        connectionType: this.getConnectionType(),
        deviceType: this.getDeviceType(),
      }
    };
    
    this.saveHistoricalData();
    console.log('✅ Performance baseline established');
    
    return this.performanceBaseline;
  }

  /**
   * Run comprehensive performance test
   */
  public async runComprehensiveTest(): Promise<PerformanceTestResult> {
    const testId = `comprehensive-${Date.now()}`;
    const startTime = performance.now();
    
    console.log(`🧪 Running comprehensive performance test: ${testId}`);
    
    try {
      // Run all test categories in parallel
      const [coreResults, audioResults, arabicResults, mobileResults] = await Promise.allSettled([
        this.testCoreWebVitals(),
        this.testAudioPerformance(),
        this.testArabicTextPerformance(),
        this.testMobilePerformance()
      ]);
      
      const duration = performance.now() - startTime;
      
      // Collect all metrics
      const metrics = {
        core: coreResults.status === 'fulfilled' ? coreResults.value.metrics.core : undefined,
        audio: audioResults.status === 'fulfilled' ? audioResults.value.metrics.audio : undefined,
        arabic: arabicResults.status === 'fulfilled' ? arabicResults.value.metrics.arabic : undefined,
        mobile: mobileResults.status === 'fulfilled' ? mobileResults.value.metrics.mobile : undefined,
      };
      
      // Collect all issues
      const allIssues = [
        ...(coreResults.status === 'fulfilled' ? coreResults.value.issues : []),
        ...(audioResults.status === 'fulfilled' ? audioResults.value.issues : []),
        ...(arabicResults.status === 'fulfilled' ? arabicResults.value.issues : []),
        ...(mobileResults.status === 'fulfilled' ? mobileResults.value.issues : []),
      ];
      
      // Calculate overall score
      const score = this.calculateOverallScore(metrics);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(allIssues);
      
      const result: PerformanceTestResult = {
        timestamp: Date.now(),
        testId,
        testType: 'comprehensive',
        duration,
        success: allIssues.filter(issue => issue.severity === 'critical').length === 0,
        score,
        metrics,
        issues: allIssues,
        recommendations
      };
      
      this.addTestResult(result);
      this.checkForRegressions(result);
      
      console.log(`✅ Comprehensive test completed: Score ${score}/100`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      throw error;
    }
  }

  /**
   * Test Core Web Vitals performance
   */
  public async testCoreWebVitals(): Promise<PerformanceTestResult> {
    const testId = `core-web-vitals-${Date.now()}`;
    const startTime = performance.now();
    
    const metrics = performanceOptimizer.getMetrics();
    const issues: PerformanceIssue[] = [];
    
    // Check LCP
    if (metrics.lcp && metrics.lcp > PERFORMANCE_TEST_CONFIG.thresholds.lcp.poor) {
      issues.push({
        severity: 'critical',
        category: 'core-web-vitals',
        description: 'Largest Contentful Paint is too slow',
        metric: 'LCP',
        actualValue: metrics.lcp,
        expectedValue: PERFORMANCE_TEST_CONFIG.thresholds.lcp.good,
        impact: 'Poor user experience and SEO ranking',
        solution: 'Optimize Arabic font loading and preload critical resources'
      });
    } else if (metrics.lcp && metrics.lcp > PERFORMANCE_TEST_CONFIG.thresholds.lcp.good) {
      issues.push({
        severity: 'medium',
        category: 'core-web-vitals',
        description: 'Largest Contentful Paint needs improvement',
        metric: 'LCP',
        actualValue: metrics.lcp,
        expectedValue: PERFORMANCE_TEST_CONFIG.thresholds.lcp.good,
        impact: 'Suboptimal user experience',
        solution: 'Consider optimizing Arabic text rendering and image loading'
      });
    }
    
    // Check FID
    if (metrics.fid && metrics.fid > PERFORMANCE_TEST_CONFIG.thresholds.fid.poor) {
      issues.push({
        severity: 'high',
        category: 'core-web-vitals',
        description: 'First Input Delay is too high',
        metric: 'FID',
        actualValue: metrics.fid,
        expectedValue: PERFORMANCE_TEST_CONFIG.thresholds.fid.good,
        impact: 'Poor interactivity and user experience',
        solution: 'Optimize audio player event handlers and break up long tasks'
      });
    }
    
    // Check CLS
    if (metrics.cls && metrics.cls > PERFORMANCE_TEST_CONFIG.thresholds.cls.poor) {
      issues.push({
        severity: 'high',
        category: 'core-web-vitals',
        description: 'Cumulative Layout Shift is too high',
        metric: 'CLS',
        actualValue: metrics.cls,
        expectedValue: PERFORMANCE_TEST_CONFIG.thresholds.cls.good,
        impact: 'Poor visual stability and user experience',
        solution: 'Stabilize Arabic text layout and reserve space for dynamic content'
      });
    }
    
    const duration = performance.now() - startTime;
    const score = this.calculateCoreWebVitalsScore(metrics);
    
    return {
      timestamp: Date.now(),
      testId,
      testType: 'core-web-vitals',
      duration,
      success: issues.filter(issue => issue.severity === 'critical').length === 0,
      score,
      metrics: { core: metrics },
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  /**
   * Test audio performance
   */
  public async testAudioPerformance(): Promise<PerformanceTestResult> {
    const testId = `audio-performance-${Date.now()}`;
    const startTime = performance.now();
    
    const metrics = quranAudioOptimizer.getPerformanceMetrics();
    const issues: PerformanceIssue[] = [];
    
    // Check audio loading time
    if (metrics.loadingTime > PERFORMANCE_TEST_CONFIG.thresholds.audioLoad.poor) {
      issues.push({
        severity: 'high',
        category: 'audio',
        description: 'Audio loading time is too slow',
        metric: 'Audio Load Time',
        actualValue: metrics.loadingTime,
        expectedValue: PERFORMANCE_TEST_CONFIG.thresholds.audioLoad.good,
        impact: 'Poor Quran recitation experience',
        solution: 'Implement audio preloading and CDN optimization'
      });
    }
    
    // Check buffer health
    if (metrics.bufferHealth < 70) {
      issues.push({
        severity: 'medium',
        category: 'audio',
        description: 'Audio buffer health is low',
        metric: 'Buffer Health',
        actualValue: metrics.bufferHealth,
        expectedValue: 90,
        impact: 'Potential audio interruptions during recitation',
        solution: 'Optimize audio buffering strategy and connection handling'
      });
    }
    
    // Check error rate
    if (metrics.errorRate > 5) {
      issues.push({
        severity: 'high',
        category: 'audio',
        description: 'Audio error rate is too high',
        metric: 'Error Rate',
        actualValue: metrics.errorRate,
        expectedValue: 1,
        impact: 'Frequent audio playback failures',
        solution: 'Improve error handling and implement fallback mechanisms'
      });
    }
    
    const duration = performance.now() - startTime;
    const score = this.calculateAudioPerformanceScore(metrics);
    
    return {
      timestamp: Date.now(),
      testId,
      testType: 'audio',
      duration,
      success: issues.filter(issue => issue.severity === 'critical').length === 0,
      score,
      metrics: { audio: metrics },
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  /**
   * Test Arabic text performance
   */
  public async testArabicTextPerformance(): Promise<PerformanceTestResult> {
    const testId = `arabic-text-${Date.now()}`;
    const startTime = performance.now();
    
    // Create test Arabic text
    const testText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
    
    // Measure text rendering performance
    const renderTime = await arabicTextOptimizer.measureTextRenderTime(
      document.querySelector('.arabic-text') as HTMLElement || document.body
    );
    
    const metrics = arabicTextOptimizer.getPerformanceMetrics();
    const issues: PerformanceIssue[] = [];
    
    // Check render time
    if (renderTime > PERFORMANCE_TEST_CONFIG.thresholds.textRender.poor) {
      issues.push({
        severity: 'high',
        category: 'arabic-text',
        description: 'Arabic text rendering is too slow',
        metric: 'Render Time',
        actualValue: renderTime,
        expectedValue: PERFORMANCE_TEST_CONFIG.thresholds.textRender.good,
        impact: 'Poor Quran reading experience',
        solution: 'Optimize Arabic font loading and text shaping'
      });
    }
    
    // Check font loading time
    if (metrics.fontLoadTime > 3000) {
      issues.push({
        severity: 'medium',
        category: 'arabic-text',
        description: 'Arabic font loading is slow',
        metric: 'Font Load Time',
        actualValue: metrics.fontLoadTime,
        expectedValue: 1000,
        impact: 'Delayed Arabic text display',
        solution: 'Implement font preloading and use font-display: swap'
      });
    }
    
    // Check layout shifts
    if (metrics.layoutShiftCount > 3) {
      issues.push({
        severity: 'medium',
        category: 'arabic-text',
        description: 'Too many layout shifts during text rendering',
        metric: 'Layout Shift Count',
        actualValue: metrics.layoutShiftCount,
        expectedValue: 1,
        impact: 'Poor visual stability during Quran reading',
        solution: 'Stabilize Arabic text layout and reserve space'
      });
    }
    
    const duration = performance.now() - startTime;
    const score = this.calculateArabicTextScore(metrics);
    
    return {
      timestamp: Date.now(),
      testId,
      testType: 'arabic-text',
      duration,
      success: issues.filter(issue => issue.severity === 'critical').length === 0,
      score,
      metrics: { arabic: metrics },
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  /**
   * Test mobile performance
   */
  public async testMobilePerformance(): Promise<PerformanceTestResult> {
    const testId = `mobile-performance-${Date.now()}`;
    const startTime = performance.now();
    
    const metrics = mobilePerformanceOptimizer.getPerformanceMetrics();
    const deviceInfo = mobilePerformanceOptimizer.getDeviceInfo();
    const issues: PerformanceIssue[] = [];
    
    // Only test mobile performance on mobile devices
    if (!deviceInfo.isMobile) {
      return {
        timestamp: Date.now(),
        testId,
        testType: 'mobile',
        duration: performance.now() - startTime,
        success: true,
        score: 100,
        metrics: { mobile: metrics },
        issues: [],
        recommendations: ['Mobile performance testing skipped on non-mobile device']
      };
    }
    
    // Check touch response time
    if (metrics.touchResponseTime > PERFORMANCE_TEST_CONFIG.thresholds.touchResponse.poor) {
      issues.push({
        severity: 'high',
        category: 'mobile',
        description: 'Touch response time is too slow',
        metric: 'Touch Response Time',
        actualValue: metrics.touchResponseTime,
        expectedValue: PERFORMANCE_TEST_CONFIG.thresholds.touchResponse.good,
        impact: 'Poor touch interaction experience',
        solution: 'Optimize touch event handling and use passive listeners'
      });
    }
    
    // Check frame drops
    if (metrics.frameDrops > 10) {
      issues.push({
        severity: 'medium',
        category: 'mobile',
        description: 'Too many frame drops detected',
        metric: 'Frame Drops',
        actualValue: metrics.frameDrops,
        expectedValue: 5,
        impact: 'Choppy animations and poor visual experience',
        solution: 'Optimize animations and reduce GPU usage'
      });
    }
    
    // Check memory pressure
    if (metrics.memoryPressure > 80) {
      issues.push({
        severity: 'high',
        category: 'mobile',
        description: 'High memory pressure detected',
        metric: 'Memory Pressure',
        actualValue: metrics.memoryPressure,
        expectedValue: 60,
        impact: 'Risk of app crashes and poor performance',
        solution: 'Implement memory optimization and cleanup unused resources'
      });
    }
    
    const duration = performance.now() - startTime;
    const score = this.calculateMobilePerformanceScore(metrics);
    
    return {
      timestamp: Date.now(),
      testId,
      testType: 'mobile',
      duration,
      success: issues.filter(issue => issue.severity === 'critical').length === 0,
      score,
      metrics: { mobile: metrics },
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  /**
   * Start automated performance monitoring
   */
  public startAutomatedMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('⚠️ Performance monitoring is already running');
      return;
    }
    
    console.log('🔄 Starting automated performance monitoring...');
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const result = await this.runComprehensiveTest();
        
        // Check for critical issues
        const criticalIssues = result.issues.filter(issue => issue.severity === 'critical');
        if (criticalIssues.length > 0) {
          this.triggerPerformanceAlert(criticalIssues);
        }
        
        // Log monitoring status
        console.log(`📊 Performance monitoring: Score ${result.score}/100, ${result.issues.length} issues`);
        
      } catch (error) {
        console.error('❌ Automated performance test failed:', error);
      }
    }, PERFORMANCE_TEST_CONFIG.testing.testInterval);
    
    this.isMonitoring = true;
  }

  /**
   * Stop automated performance monitoring
   */
  public stopAutomatedMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.isMonitoring = false;
      console.log('⏹️ Stopped automated performance monitoring');
    }
  }

  /**
   * Check for performance regressions
   */
  private checkForRegressions(result: PerformanceTestResult): void {
    if (!this.performanceBaseline) return;
    
    const regressions: PerformanceIssue[] = [];
    const threshold = PERFORMANCE_TEST_CONFIG.testing.regressionThreshold;
    
    // Check core metrics against baseline
    if (result.metrics.core?.lcp && this.performanceBaseline.metrics.lcp) {
      const regression = (result.metrics.core.lcp - this.performanceBaseline.metrics.lcp) / this.performanceBaseline.metrics.lcp;
      if (regression > threshold) {
        regressions.push({
          severity: 'high',
          category: 'core-web-vitals',
          description: `LCP regression detected: ${(regression * 100).toFixed(1)}% slower`,
          metric: 'LCP',
          actualValue: result.metrics.core.lcp,
          expectedValue: this.performanceBaseline.metrics.lcp,
          impact: 'Performance degradation compared to baseline',
          solution: 'Investigate recent changes that may have affected loading performance'
        });
      }
    }
    
    // Add other regression checks...
    
    if (regressions.length > 0) {
      console.warn('⚠️ Performance regressions detected:', regressions);
      this.triggerPerformanceAlert(regressions);
    }
  }

  /**
   * Trigger performance alert
   */
  private triggerPerformanceAlert(issues: PerformanceIssue[]): void {
    if (!PERFORMANCE_TEST_CONFIG.reporting.enablePerformanceAlerts) return;
    
    console.error('🚨 Performance Alert:', issues);
    
    // Notify all registered callbacks
    this.alertCallbacks.forEach(callback => {
      issues.forEach(issue => callback(issue));
    });
    
    // Could also send alerts via email, Slack, etc.
  }

  /**
   * Calculate performance scores
   */
  private calculateOverallScore(metrics: any): number {
    const scores = [];
    
    if (metrics.core) {
      scores.push(this.calculateCoreWebVitalsScore(metrics.core));
    }
    
    if (metrics.audio) {
      scores.push(this.calculateAudioPerformanceScore(metrics.audio));
    }
    
    if (metrics.arabic) {
      scores.push(this.calculateArabicTextScore(metrics.arabic));
    }
    
    if (metrics.mobile) {
      scores.push(this.calculateMobilePerformanceScore(metrics.mobile));
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  private calculateCoreWebVitalsScore(metrics: Partial<PerformanceMetrics>): number {
    let score = 100;
    
    // LCP scoring
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }
    
    // FID scoring
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }
    
    // CLS scoring
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25;
      else if (metrics.cls > 0.1) score -= 10;
    }
    
    return Math.max(0, score);
  }

  private calculateAudioPerformanceScore(metrics: AudioPerformanceMetrics): number {
    let score = 100;
    
    if (metrics.loadingTime > 8000) score -= 30;
    else if (metrics.loadingTime > 3000) score -= 15;
    
    if (metrics.bufferHealth < 50) score -= 20;
    else if (metrics.bufferHealth < 70) score -= 10;
    
    if (metrics.errorRate > 10) score -= 25;
    else if (metrics.errorRate > 5) score -= 10;
    
    return Math.max(0, score);
  }

  private calculateArabicTextScore(metrics: ArabicTextMetrics): number {
    let score = 100;
    
    if (metrics.renderTime > 100) score -= 25;
    else if (metrics.renderTime > 50) score -= 10;
    
    if (metrics.fontLoadTime > 3000) score -= 20;
    else if (metrics.fontLoadTime > 1500) score -= 10;
    
    if (metrics.layoutShiftCount > 5) score -= 15;
    else if (metrics.layoutShiftCount > 3) score -= 5;
    
    return Math.max(0, score);
  }

  private calculateMobilePerformanceScore(metrics: MobilePerformanceMetrics): number {
    let score = 100;
    
    if (metrics.touchResponseTime > 100) score -= 25;
    else if (metrics.touchResponseTime > 50) score -= 10;
    
    if (metrics.frameDrops > 15) score -= 20;
    else if (metrics.frameDrops > 10) score -= 10;
    
    if (metrics.memoryPressure > 90) score -= 25;
    else if (metrics.memoryPressure > 80) score -= 15;
    
    return Math.max(0, score);
  }

  /**
   * Generate recommendations based on issues
   */
  private generateRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations = new Set<string>();
    
    issues.forEach(issue => {
      recommendations.add(issue.solution);
      
      // Add category-specific recommendations
      switch (issue.category) {
        case 'core-web-vitals':
          recommendations.add('Consider implementing resource preloading');
          recommendations.add('Optimize critical rendering path');
          break;
        case 'audio':
          recommendations.add('Implement intelligent audio preloading');
          recommendations.add('Use CDN optimization for audio delivery');
          break;
        case 'arabic-text':
          recommendations.add('Preload Arabic fonts with font-display: swap');
          recommendations.add('Use text containment for layout stability');
          break;
        case 'mobile':
          recommendations.add('Implement touch event optimization');
          recommendations.add('Use passive event listeners');
          break;
      }
    });
    
    return Array.from(recommendations);
  }

  /**
   * Utility methods
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  private addTestResult(result: PerformanceTestResult): void {
    this.testHistory.push(result);
    
    // Limit history size
    if (this.testHistory.length > PERFORMANCE_TEST_CONFIG.reporting.maxHistoryEntries) {
      this.testHistory.shift();
    }
    
    if (PERFORMANCE_TEST_CONFIG.reporting.saveHistoricalData) {
      this.saveHistoricalData();
    }
  }

  private saveHistoricalData(): void {
    try {
      localStorage.setItem('performance-test-history', JSON.stringify(this.testHistory));
      if (this.performanceBaseline) {
        localStorage.setItem('performance-baseline', JSON.stringify(this.performanceBaseline));
      }
    } catch (error) {
      console.warn('Failed to save performance data:', error);
    }
  }

  private loadHistoricalData(): void {
    try {
      const historyData = localStorage.getItem('performance-test-history');
      if (historyData) {
        this.testHistory = JSON.parse(historyData);
      }
      
      const baselineData = localStorage.getItem('performance-baseline');
      if (baselineData) {
        this.performanceBaseline = JSON.parse(baselineData);
      }
    } catch (error) {
      console.warn('Failed to load performance data:', error);
    }
  }

  /**
   * Public API methods
   */
  public getTestHistory(): PerformanceTestResult[] {
    return [...this.testHistory];
  }

  public getPerformanceBaseline(): PerformanceBaseline | null {
    return this.performanceBaseline ? { ...this.performanceBaseline } : null;
  }

  public registerAlertCallback(callback: (issue: PerformanceIssue) => void): void {
    this.alertCallbacks.push(callback);
  }

  public unregisterAlertCallback(callback: (issue: PerformanceIssue) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  public generatePerformanceReport(): string {
    const recentTests = this.testHistory.slice(-10);
    const averageScore = recentTests.reduce((sum, test) => sum + test.score, 0) / recentTests.length || 0;
    const criticalIssues = recentTests.flatMap(test => test.issues).filter(issue => issue.severity === 'critical');
    
    return `
Performance Testing Report for QuranApp
=======================================

Summary:
- Total Tests: ${this.testHistory.length}
- Recent Average Score: ${averageScore.toFixed(1)}/100
- Critical Issues: ${criticalIssues.length}
- Monitoring Status: ${this.isMonitoring ? 'Active' : 'Inactive'}

Baseline (${this.performanceBaseline ? new Date(this.performanceBaseline.timestamp).toLocaleDateString() : 'Not Set'}):
${this.performanceBaseline ? `
- LCP: ${this.performanceBaseline.metrics.lcp.toFixed(0)}ms
- FID: ${this.performanceBaseline.metrics.fid.toFixed(0)}ms
- CLS: ${this.performanceBaseline.metrics.cls.toFixed(3)}
- Audio Load: ${this.performanceBaseline.metrics.audioLoadTime.toFixed(0)}ms
- Arabic Render: ${this.performanceBaseline.metrics.arabicRenderTime.toFixed(0)}ms
- Touch Response: ${this.performanceBaseline.metrics.touchResponseTime.toFixed(0)}ms
` : 'No baseline established'}

Recent Test Results:
${recentTests.slice(-5).map(test => `
- ${new Date(test.timestamp).toLocaleString()}: ${test.score}/100 (${test.issues.length} issues)
`).join('')}

Critical Issues:
${criticalIssues.slice(0, 5).map(issue => `
- ${issue.category}: ${issue.description}
  Solution: ${issue.solution}
`).join('')}
    `;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopAutomatedMonitoring();
    this.alertCallbacks.length = 0;
  }
}

// Export singleton instance
export const performanceTestFramework = new PerformanceTestFramework();

// Export utility functions
export const runPerformanceTest = async (): Promise<PerformanceTestResult> => {
  return performanceTestFramework.runComprehensiveTest();
};

export const establishPerformanceBaseline = async (): Promise<PerformanceBaseline> => {
  return performanceTestFramework.establishBaseline();
};

export const startPerformanceMonitoring = (): void => {
  performanceTestFramework.startAutomatedMonitoring();
};

export const stopPerformanceMonitoring = (): void => {
  performanceTestFramework.stopAutomatedMonitoring();
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).performanceTestFramework = performanceTestFramework;
  (window as any).runPerformanceTest = runPerformanceTest;
  (window as any).establishPerformanceBaseline = establishPerformanceBaseline;
  (window as any).startPerformanceMonitoring = startPerformanceMonitoring;
  (window as any).stopPerformanceMonitoring = stopPerformanceMonitoring;
}