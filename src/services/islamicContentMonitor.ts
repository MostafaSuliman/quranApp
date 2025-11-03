/**
 * Islamic Content Real-Time Monitoring System
 * 
 * Provides continuous monitoring of Islamic content integrity,
 * automatic correction mechanisms, and quality assurance.
 */

import { islamicContentValidationGuardian, ValidationResult, ContentMonitoringAlert } from './islamicContentValidationGuardian'
import { Ayah, Hadith, Dua } from '../types/quran'

// ===== MONITORING INTERFACES =====

export interface MonitoringConfig {
  enableRealTimeValidation: boolean
  autoCorrectEnabled: boolean
  alertThreshold: number // 0-100
  monitoringInterval: number // milliseconds
  maxAlerts: number
  criticalAlertNotification: boolean
}

export interface ContentChangeEvent {
  id: string
  type: 'content_added' | 'content_modified' | 'content_removed'
  contentType: 'quran' | 'hadith' | 'dua'
  content: any
  previousContent?: any
  timestamp: number
  source: string
  validated: boolean
  corrected: boolean
}

export interface QualityMetrics {
  totalValidations: number
  passedValidations: number
  failedValidations: number
  autoCorrections: number
  criticalIssues: number
  averageScore: number
  lastUpdate: number
}

// ===== CONTENT CHANGE DETECTOR =====

export class ContentChangeDetector {
  private contentHashes: Map<string, string> = new Map()
  private changeListeners: ((event: ContentChangeEvent) => void)[] = []

  /**
   * Register content for monitoring
   */
  registerContent(id: string, content: any, contentType: 'quran' | 'hadith' | 'dua'): void {
    const hash = this.generateContentHash(content)
    const previousHash = this.contentHashes.get(id)
    
    if (previousHash && previousHash !== hash) {
      // Content changed
      this.notifyChange({
        id: `change_${Date.now()}_${id}`,
        type: 'content_modified',
        contentType,
        content,
        timestamp: Date.now(),
        source: 'content_monitor',
        validated: false,
        corrected: false
      })
    } else if (!previousHash) {
      // New content
      this.notifyChange({
        id: `new_${Date.now()}_${id}`,
        type: 'content_added',
        contentType,
        content,
        timestamp: Date.now(),
        source: 'content_monitor',
        validated: false,
        corrected: false
      })
    }

    this.contentHashes.set(id, hash)
  }

  /**
   * Add change listener
   */
  addChangeListener(listener: (event: ContentChangeEvent) => void): void {
    this.changeListeners.push(listener)
  }

  /**
   * Remove change listener
   */
  removeChangeListener(listener: (event: ContentChangeEvent) => void): void {
    const index = this.changeListeners.indexOf(listener)
    if (index > -1) {
      this.changeListeners.splice(index, 1)
    }
  }

  /**
   * Generate content hash for change detection
   */
  private generateContentHash(content: any): string {
    const contentStr = JSON.stringify(content, Object.keys(content).sort())
    return btoa(contentStr).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
  }

  /**
   * Notify all listeners of content change
   */
  private notifyChange(event: ContentChangeEvent): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in content change listener:', error)
      }
    })
  }
}

// ===== AUTOMATED CORRECTION SYSTEM =====

export class AutomatedCorrectionSystem {
  private correctionRules: Map<string, (content: any) => any> = new Map()
  private correctionHistory: { id: string; before: any; after: any; timestamp: number }[] = []

  constructor() {
    this.setupDefaultCorrectionRules()
  }

  /**
   * Setup default correction rules
   */
  private setupDefaultCorrectionRules(): void {
    // Citation format correction
    this.correctionRules.set('citation_format', (content: string) => {
      return content.replace(
        /(Quran|Qur'an|Q)\s*(\d+):(\d+)/gi,
        (match, prefix, surah, ayah) => {
          const surahName = this.getSurahName(parseInt(surah))
          return `Surah ${surahName} • Ayah ${ayah}`
        }
      )
    })

    // Arabic text direction correction
    this.correctionRules.set('arabic_direction', (element: HTMLElement) => {
      if (element && element.textContent && /[\u0600-\u06FF]/.test(element.textContent)) {
        element.dir = 'rtl'
        element.lang = 'ar'
      }
      return element
    })

    // Islamic honorifics addition
    this.correctionRules.set('islamic_honorifics', (content: string) => {
      return content
        .replace(/\b(Prophet|النبي|رسول الله)\b/g, '$1 ﷺ')
        .replace(/\b(Muhammad|محمد)\b/g, '$1 ﷺ')
        .replace(/\b(Ali|علي)\b(?=.*\b(ibn Abi Talib|بن أبي طالب)\b)/g, '$1 رضي الله عنه')
    })

    // Proper terminology correction
    this.correctionRules.set('islamic_terminology', (content: string) => {
      return content
        .replace(/\bChapter\s+(\d+)/gi, 'Surah $1')
        .replace(/\bVerse\s+(\d+)/gi, 'Ayah $1')
        .replace(/\bBook\s+of\s+Quran/gi, 'Mushaf')
        .replace(/\bReader\b/gi, 'Reciter')
    })
  }

  /**
   * Apply automatic corrections to content
   */
  async applyCorrections(content: any, contentType: 'quran' | 'hadith' | 'dua'): Promise<{
    corrected: any;
    changes: string[];
    correctionApplied: boolean;
  }> {
    const changes: string[] = []
    let corrected = { ...content }
    let correctionApplied = false

    // Apply relevant correction rules based on content type
    const applicableRules = this.getApplicableRules(contentType)

    for (const ruleName of applicableRules) {
      const rule = this.correctionRules.get(ruleName)
      if (rule) {
        try {
          const before = JSON.stringify(corrected)
          
          // Apply rule to relevant fields
          if (ruleName === 'citation_format' && corrected.source) {
            const correctedSource = rule(corrected.source)
            if (correctedSource !== corrected.source) {
              corrected.source = correctedSource
              changes.push(`Fixed citation format in source`)
              correctionApplied = true
            }
          }

          if (ruleName === 'islamic_honorifics') {
            ['arabicText', 'englishTranslation', 'transliteration'].forEach(field => {
              if (corrected[field]) {
                const correctedField = rule(corrected[field])
                if (correctedField !== corrected[field]) {
                  corrected[field] = correctedField
                  changes.push(`Added Islamic honorifics to ${field}`)
                  correctionApplied = true
                }
              }
            })
          }

          if (ruleName === 'islamic_terminology') {
            ['title', 'englishTranslation', 'source'].forEach(field => {
              if (corrected[field]) {
                const correctedField = rule(corrected[field])
                if (correctedField !== corrected[field]) {
                  corrected[field] = correctedField
                  changes.push(`Fixed Islamic terminology in ${field}`)
                  correctionApplied = true
                }
              }
            })
          }

          const after = JSON.stringify(corrected)
          
          // Record correction if changes were made
          if (before !== after) {
            this.correctionHistory.push({
              id: `correction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              before: JSON.parse(before),
              after: JSON.parse(after),
              timestamp: Date.now()
            })
          }

        } catch (error) {
          console.error(`Error applying correction rule ${ruleName}:`, error)
        }
      }
    }

    return {
      corrected,
      changes,
      correctionApplied
    }
  }

  /**
   * Get applicable correction rules for content type
   */
  private getApplicableRules(contentType: 'quran' | 'hadith' | 'dua'): string[] {
    const commonRules = ['citation_format', 'islamic_terminology']
    
    switch (contentType) {
      case 'quran':
        return [...commonRules]
      case 'hadith':
        return [...commonRules, 'islamic_honorifics']
      case 'dua':
        return [...commonRules]
      default:
        return commonRules
    }
  }

  /**
   * Get Surah name by number for citation correction
   */
  private getSurahName(surahNumber: number): string {
    const surahNames: { [key: number]: string } = {
      1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Ali \'Imran', 4: 'An-Nisa\'',
      5: 'Al-Ma\'idah', 6: 'Al-An\'am', 7: 'Al-A\'raf', 8: 'Al-Anfal',
      9: 'At-Tawbah', 10: 'Yunus', 11: 'Hud', 12: 'Yusuf',
      13: 'Ar-Ra\'d', 14: 'Ibrahim', 15: 'Al-Hijr', 16: 'An-Nahl',
      17: 'Al-Isra\'', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-Ha',
      21: 'Al-Anbiya\'', 22: 'Al-Hajj', 23: 'Al-Mu\'minun', 24: 'An-Nur',
      25: 'Al-Furqan', 26: 'Ash-Shu\'ara\'', 27: 'An-Naml', 28: 'Al-Qasas',
      29: 'Al-\'Ankabut', 30: 'Ar-Rum'
      // Add more as needed
    }
    
    return surahNames[surahNumber] || `Surah ${surahNumber}`
  }

  /**
   * Get correction history
   */
  getCorrectionHistory(limit: number = 10): any[] {
    return this.correctionHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }
}

// ===== QUALITY METRICS TRACKER =====

export class QualityMetricsTracker {
  private metrics: QualityMetrics = {
    totalValidations: 0,
    passedValidations: 0,
    failedValidations: 0,
    autoCorrections: 0,
    criticalIssues: 0,
    averageScore: 100,
    lastUpdate: Date.now()
  }

  /**
   * Record validation result
   */
  recordValidation(result: ValidationResult, correctionApplied: boolean = false): void {
    this.metrics.totalValidations++
    
    if (result.isValid) {
      this.metrics.passedValidations++
    } else {
      this.metrics.failedValidations++
    }

    if (correctionApplied) {
      this.metrics.autoCorrections++
    }

    const criticalIssues = result.issues.filter(issue => issue.type === 'critical').length
    this.metrics.criticalIssues += criticalIssues

    // Update average score
    this.metrics.averageScore = this.calculateAverageScore(result.score)
    this.metrics.lastUpdate = Date.now()
  }

  /**
   * Calculate running average score
   */
  private calculateAverageScore(newScore: number): number {
    const total = this.metrics.totalValidations
    if (total === 1) {
      return newScore
    }
    
    const currentTotal = this.metrics.averageScore * (total - 1)
    return (currentTotal + newScore) / total
  }

  /**
   * Get current metrics
   */
  getMetrics(): QualityMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      autoCorrections: 0,
      criticalIssues: 0,
      averageScore: 100,
      lastUpdate: Date.now()
    }
  }
}

// ===== MAIN MONITORING SERVICE =====

export class IslamicContentMonitor {
  private config: MonitoringConfig
  private changeDetector: ContentChangeDetector
  private correctionSystem: AutomatedCorrectionSystem
  private metricsTracker: QualityMetricsTracker
  private isRunning: boolean = false
  private monitoringInterval?: NodeJS.Timeout

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enableRealTimeValidation: true,
      autoCorrectEnabled: true,
      alertThreshold: 70,
      monitoringInterval: 5000, // 5 seconds
      maxAlerts: 100,
      criticalAlertNotification: true,
      ...config
    }

    this.changeDetector = new ContentChangeDetector()
    this.correctionSystem = new AutomatedCorrectionSystem()
    this.metricsTracker = new QualityMetricsTracker()

    this.setupChangeListener()
  }

  /**
   * Setup content change listener
   */
  private setupChangeListener(): void {
    this.changeDetector.addChangeListener(async (event: ContentChangeEvent) => {
      if (this.config.enableRealTimeValidation) {
        await this.validateAndCorrect(event)
      }
    })
  }

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.isRunning) {
      console.warn('Islamic content monitor is already running')
      return
    }

    this.isRunning = true
    console.log('Islamic Content Monitor started')

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performPeriodicChecks()
    }, this.config.monitoringInterval)
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isRunning) {
      console.warn('Islamic content monitor is not running')
      return
    }

    this.isRunning = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }

    console.log('Islamic Content Monitor stopped')
  }

  /**
   * Monitor specific content
   */
  async monitorContent(
    id: string, 
    content: any, 
    contentType: 'quran' | 'hadith' | 'dua'
  ): Promise<{
    validated: boolean;
    corrected: boolean;
    result: ValidationResult;
    corrections?: string[];
  }> {
    // Register for change detection
    this.changeDetector.registerContent(id, content, contentType)

    // Validate content
    const result = await islamicContentValidationGuardian.validateContent(content, contentType)
    
    let corrected = false
    let corrections: string[] = []

    // Apply corrections if enabled and needed
    if (this.config.autoCorrectEnabled && !result.isValid) {
      const correctionResult = await this.correctionSystem.applyCorrections(content, contentType)
      corrected = correctionResult.correctionApplied
      corrections = correctionResult.changes

      // Re-validate if corrections were applied
      if (corrected) {
        const revalidationResult = await islamicContentValidationGuardian.validateContent(
          correctionResult.corrected, 
          contentType
        )
        Object.assign(result, revalidationResult)
      }
    }

    // Record metrics
    this.metricsTracker.recordValidation(result, corrected)

    // Generate alerts if needed
    this.generateAlertsIfNeeded(result, content, contentType)

    return {
      validated: result.isValid,
      corrected,
      result,
      corrections: corrections.length > 0 ? corrections : undefined
    }
  }

  /**
   * Perform periodic monitoring checks
   */
  private async performPeriodicChecks(): void {
    try {
      // Clean up old alerts
      islamicContentValidationGuardian.clearResolvedAlerts()

      // Check metrics and generate alerts if quality degrading
      const metrics = this.metricsTracker.getMetrics()
      
      if (metrics.averageScore < this.config.alertThreshold) {
        console.warn(`Islamic content quality below threshold: ${metrics.averageScore}%`)
      }

      if (metrics.criticalIssues > 0) {
        console.error(`Found ${metrics.criticalIssues} critical Islamic content issues`)
      }

    } catch (error) {
      console.error('Error in periodic monitoring checks:', error)
    }
  }

  /**
   * Validate and correct content from change event
   */
  private async validateAndCorrect(event: ContentChangeEvent): Promise<void> {
    try {
      const monitoringResult = await this.monitorContent(
        event.id,
        event.content,
        event.contentType
      )

      // Update event with validation results
      event.validated = monitoringResult.validated
      event.corrected = monitoringResult.corrected

      if (monitoringResult.corrected) {
        console.log(`Auto-corrected ${event.contentType} content:`, monitoringResult.corrections)
      }

    } catch (error) {
      console.error('Error validating content change:', error)
    }
  }

  /**
   * Generate alerts if validation issues found
   */
  private generateAlertsIfNeeded(
    result: ValidationResult, 
    content: any, 
    contentType: string
  ): void {
    if (result.score < this.config.alertThreshold) {
      const alert: ContentMonitoringAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'quality_degradation',
        severity: result.score < 50 ? 'critical' : result.score < 70 ? 'high' : 'medium',
        content,
        timestamp: Date.now(),
        source: contentType,
        autoFixed: false
      }

      if (this.config.criticalAlertNotification && alert.severity === 'critical') {
        console.error('CRITICAL Islamic content issue detected:', alert)
      }
    }
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isRunning: boolean;
    config: MonitoringConfig;
    metrics: QualityMetrics;
    recentAlerts: ContentMonitoringAlert[];
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      metrics: this.metricsTracker.getMetrics(),
      recentAlerts: islamicContentValidationGuardian.getValidationAlerts(10)
    }
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart monitoring if interval changed
    if (newConfig.monitoringInterval && this.isRunning) {
      this.stopMonitoring()
      this.startMonitoring()
    }
  }
}

// ===== SINGLETON INSTANCE =====

export const islamicContentMonitor = new IslamicContentMonitor({
  enableRealTimeValidation: true,
  autoCorrectEnabled: true,
  alertThreshold: 80,
  monitoringInterval: 5000,
  criticalAlertNotification: true
})

// Auto-start monitoring
islamicContentMonitor.startMonitoring()

// Export classes for direct use
export {
  ContentChangeDetector,
  AutomatedCorrectionSystem,
  QualityMetricsTracker
}