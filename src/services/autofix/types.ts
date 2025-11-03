/**
 * AutoFix System - Type Definitions
 * Comprehensive TypeScript interfaces for the auto-fix system
 */

export interface HealthCheckResult {
  component: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  lastCheck: Date
  responseTime?: number
  errorMessage?: string
  autoFixAttempted?: boolean
  autoFixSuccessful?: boolean
}

export interface AutoFixAction {
  id: string
  type: 'api_fallback' | 'audio_cdn_rotation' | 'font_recovery' | 'layout_correction' | 'cache_clear' | 'performance_optimization' | 'ml_prediction' | 'root_cause_fix' | 'dependency_update' | 'security_patch' | 'islamic_content_correction' | 'pattern_based_fix'
  priority: 'critical' | 'high' | 'medium' | 'low'
  component: string
  description: string
  implementedAt: Date
  successful: boolean
  rollbackAvailable: boolean
  mlConfidence?: number
  predictedOutcome?: string
  rootCause?: string
}

export interface MLDiagnosticResult {
  confidence: number
  predictedIssue: string
  rootCauses: string[]
  suggestedFixes: AutoFixAction[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  estimatedImpact: string
  preventiveMeasures: string[]
}

export interface PatternData {
  type: string
  frequency: number
  contexts: string[]
  solutions: string[]
  successRate: number
  lastOccurrence: Date
}

export interface SecurityVulnerability {
  id: string
  type: 'dependency' | 'code' | 'configuration' | 'islamic_content'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedComponents: string[]
  cveId?: string
  fixAvailable: boolean
  autoFixable: boolean
}

export interface PerformanceBottleneck {
  id: string
  component: string
  type: 'memory' | 'cpu' | 'network' | 'render' | 'api' | 'islamic_processing'
  severity: number
  impact: string
  metrics: {
    before: number
    threshold: number
    current: number
  }
  suggestedOptimizations: string[]
}

export interface SystemMetrics {
  uptime: number
  apiLatency: number
  audioLoadTime: number
  fontLoadStatus: boolean
  cacheSize: number
  errorRate: number
  fixSuccessRate: number
  islamicContentIntegrity: number
  mlPredictionAccuracy: number
  securityScore: number
  performanceScore: number
  patternRecognitionRate: number
  preventedIssues: number
  selfHealingEvents: number
}

export interface PredictiveAnalysis {
  errorProbability: number
  timeToFailure?: number
  criticality: 'low' | 'medium' | 'high' | 'critical'
  preventiveMeasures: string[]
  monitoringRecommendations: string[]
}

export interface AnalyticsData {
  timestamp: number
  event: string
  component: string
  severity: string
  metadata: Record<string, any>
}

export interface DependencyInfo {
  name: string
  currentVersion: string
  latestVersion: string
  updateAvailable: boolean
  securityIssues: number
  breaking: boolean
}

export interface IslamicContentHealth {
  score: number
  issues: string[]
  authenticityScore: number
  citationAccuracy: number
  encodingIntegrity: number
}
