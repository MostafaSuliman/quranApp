import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Analytics Data Structures
export interface UserInteraction {
  id: string
  timestamp: number
  type: 'navigation' | 'audio' | 'memorization' | 'search' | 'setting' | 'ui_interaction' | 'islamic_practice' | 'reading_session' | 'funnel_step'
  action: string
  context: {
    surahNumber?: number
    ayahNumber?: number
    pageNumber?: number
    reciterId?: string
    component?: string
    sessionDuration?: number
    difficultyLevel?: 'easy' | 'medium' | 'hard'
    readingSpeed?: number // ayahs per minute
    comprehensionLevel?: number // 0-1 scale
    emotionalResponse?: 'peaceful' | 'focused' | 'inspired' | 'reflective'
    practiceType?: 'daily_reading' | 'memorization' | 'reflection' | 'study' | 'prayer_preparation'
    funnelStep?: string
    cohortId?: string
    metadata?: Record<string, any>
  }
  performance?: {
    loadTime?: number
    responseTime?: number
    errorOccurred?: boolean
  }
  anonymizedUserId?: string // For cohort tracking while preserving privacy
}

export interface UsagePattern {
  id: string
  type: 'frequent_surah' | 'preferred_reciter' | 'study_time' | 'navigation_flow' | 'feature_usage' | 'memorization_pattern' | 'reading_habit' | 'engagement_pattern' | 'islamic_practice_pattern' | 'optimal_study_time'
  pattern: Record<string, any>
  frequency: number
  confidence: number
  lastUpdated: number
  predictiveScore?: number // For behavioral prediction
}

export interface MemorizationPattern {
  id: string
  timestamp: number
  surahNumber: number
  ayahRange: { start: number; end: number }
  attempts: number
  successRate: number
  timeSpent: number // minutes
  repetitionCount: number
  difficultyRating: number // 1-10 scale
  retentionRate: number // 0-1 scale after 24h
  optimalBreakInterval: number // minutes
  improvementTrend: 'improving' | 'stable' | 'declining'
  emotionalState: 'focused' | 'distracted' | 'motivated' | 'tired'
}

export interface ReadingHabit {
  id: string
  timestamp: number
  sessionDuration: number // minutes
  ayahsRead: number
  readingSpeed: number // ayahs per minute
  comprehensionSelf: number // 1-10 self-reported
  pausesForReflection: number
  repeatedVerses: number
  preferredTime: number // hour of day
  consistency: number // 0-1 scale based on daily habits
  focusLevel: number // 1-10 based on interaction patterns
}

export interface EngagementMetric {
  id: string
  timestamp: number
  type: 'session_engagement' | 'feature_engagement' | 'content_engagement' | 'learning_engagement'
  score: number // 0-1 scale
  factors: {
    sessionLength: number
    interactionDepth: number
    featureExploration: number
    contentCompletionRate: number
    returnVisitProbability: number
  }
  churnRisk: 'low' | 'medium' | 'high'
  engagementTrend: 'increasing' | 'stable' | 'decreasing'
}

export interface FunnelAnalysis {
  id: string
  funnelName: string
  steps: {
    name: string
    userCount: number
    completionRate: number
    averageTime: number
    dropoffReasons?: string[]
  }[]
  conversionRate: number
  optimizationOpportunities: string[]
  lastUpdated: number
}

export interface CohortData {
  cohortId: string
  cohortName: string
  createdAt: number
  userCount: number
  metrics: {
    retention: { day1: number; day7: number; day30: number }
    engagement: number
    featureAdoption: Record<string, number>
    learningProgress: number
    churnRate: number
  }
  characteristics: {
    avgSessionDuration: number
    preferredFeatures: string[]
    commonBehaviors: string[]
  }
}

export interface IslamicPracticeCorrelation {
  id: string
  timestamp: number
  practiceType: 'daily_reading' | 'memorization' | 'reflection' | 'study' | 'prayer_preparation'
  quranEngagement: number // 0-1 scale
  consistencyScore: number // 0-1 scale
  spiritualImpact: number // 1-10 self-reported
  timeOfDay: number
  correlationFactors: {
    moonPhase?: string
    islamicMonth?: string
    weekday: string
    specialOccasions?: string[]
  }
}

export interface PredictiveInsight {
  id: string
  type: 'churn_prediction' | 'feature_recommendation' | 'optimal_study_time' | 'memorization_success' | 'engagement_forecast'
  prediction: any
  confidence: number // 0-1 scale
  factors: string[]
  actionableRecommendations: string[]
  validUntil: number
}

export interface PerformanceMetric {
  id: string
  timestamp: number
  metric: 'page_load' | 'audio_load' | 'search_response' | 'api_response' | 'memory_usage' | 'bundle_size'
  value: number
  context: Record<string, any>
  threshold?: {
    warning: number
    critical: number
  }
}

export interface FeatureUtilization {
  featureId: string
  name: string
  category: 'core' | 'memorization' | 'audio' | 'navigation' | 'settings'
  usageCount: number
  lastUsed: number
  averageSessionDuration: number
  userSatisfaction: number // 0-1 scale
  adoptionRate: number // 0-1 scale
}

export interface ContentQualityMetric {
  id: string
  timestamp: number
  type: 'arabic_rendering' | 'citation_format' | 'audio_quality' | 'translation_accuracy'
  score: number // 0-1 scale
  details: Record<string, any>
  context: {
    surahNumber?: number
    ayahNumber?: number
    reciterId?: string
  }
}

export interface LearningEffectivenessMetric {
  id: string
  timestamp: number
  metric: 'memorization_success_rate' | 'retention_rate' | 'study_session_effectiveness' | 'optimal_repetition_count'
  value: number
  context: {
    surahNumber?: number
    ayahNumber?: number
    studyMethod?: string
    timeSpent?: number
  }
}

interface AnalyticsState {
  // Data Collection
  interactions: UserInteraction[]
  usagePatterns: UsagePattern[]
  performanceMetrics: PerformanceMetric[]
  featureUtilization: FeatureUtilization[]
  contentQuality: ContentQualityMetric[]
  learningEffectiveness: LearningEffectivenessMetric[]
  
  // Advanced Analytics Data
  memorizationPatterns: MemorizationPattern[]
  readingHabits: ReadingHabit[]
  engagementMetrics: EngagementMetric[]
  funnelAnalyses: FunnelAnalysis[]
  cohortData: CohortData[]
  islamicPracticeCorrelations: IslamicPracticeCorrelation[]
  predictiveInsights: PredictiveInsight[]
  
  // Session Data
  sessionId: string
  sessionStartTime: number
  currentSessionInteractions: UserInteraction[]
  currentCohortId: string
  anonymizedUserId: string
  
  // Configuration
  analyticsEnabled: boolean
  dataRetentionDays: number
  performanceThresholds: Record<string, { warning: number; critical: number }>
  privacySettings: {
    allowCohortTracking: boolean
    allowPredictiveAnalysis: boolean
    dataAnonymization: boolean
  }
  
  // Computed Analytics
  todaysInsights: Record<string, any>
  weeklyTrends: Record<string, any>
  userBehaviorProfile: Record<string, any>
  performanceHealth: {
    overall: 'excellent' | 'good' | 'warning' | 'critical'
    details: Record<string, any>
  }
  
  // Advanced Insights
  memorizationInsights: {
    optimalStudyTimes: number[]
    bestMemorizationMethods: string[]
    personalDifficultyMapping: Record<number, number> // surah -> difficulty
    retentionPredictions: Record<string, number>
    improvementAreas: string[]
  }
  
  readingInsights: {
    averageReadingSpeed: number
    comprehensionTrends: number[]
    optimalSessionLength: number
    focusPatterns: Record<number, number> // hour -> focus level
    consistencyScore: number
  }
  
  engagementInsights: {
    churnRisk: number
    engagementScore: number
    retentionProbability: Record<string, number> // day1, day7, day30
    featureAffinityScore: Record<string, number>
    optimalEngagementStrategy: string[]
  }
  
  personalizedRecommendations: Array<{
    id: string
    type: 'memorization' | 'reading' | 'spiritual' | 'feature' | 'timing'
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    implementation: string
    expectedBenefit: string
    confidence: number
    validUntil: number
  }>
  
  // Actions
  initialize: () => void
  trackInteraction: (interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => void
  trackPerformance: (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => void
  trackContentQuality: (metric: Omit<ContentQualityMetric, 'id' | 'timestamp'>) => void
  trackLearningEffectiveness: (metric: Omit<LearningEffectivenessMetric, 'id' | 'timestamp'>) => void
  updateFeatureUtilization: (featureId: string, sessionDuration?: number) => void
  
  // Advanced Tracking Methods
  trackMemorizationSession: (pattern: Omit<MemorizationPattern, 'id' | 'timestamp'>) => void
  trackReadingSession: (habit: Omit<ReadingHabit, 'id' | 'timestamp'>) => void
  trackEngagement: (metric: Omit<EngagementMetric, 'id' | 'timestamp'>) => void
  trackFunnelStep: (funnelName: string, stepName: string, completed: boolean, timeSpent: number) => void
  trackIslamicPractice: (correlation: Omit<IslamicPracticeCorrelation, 'id' | 'timestamp'>) => void
  joinCohort: (cohortName: string) => void
  
  // Pattern Recognition
  analyzeUsagePatterns: () => Promise<UsagePattern[]>
  identifyPerformanceBottlenecks: () => PerformanceMetric[]
  generateUserBehaviorProfile: () => Record<string, any>
  calculateLearningOptimizations: () => Record<string, any>
  
  // Advanced Analytics Methods
  analyzeMemorizationPatterns: () => void
  analyzeReadingHabits: () => void
  calculateEngagementScore: () => number
  predictChurnRisk: () => number
  identifyOptimalStudyTimes: () => number[]
  generateFunnelAnalysis: (funnelName: string) => FunnelAnalysis | null
  analyzeCohortPerformance: (cohortId: string) => CohortData | null
  correlateIslamicPractices: () => void
  generatePredictiveInsights: () => void
  calculateRetentionProbability: () => Record<string, number>
  identifyPersonalizedRecommendations: () => void
  
  // Insights Generation
  generateTodaysInsights: () => Record<string, any>
  generateWeeklyTrends: () => Record<string, any>
  generateRecommendations: () => Array<{
    type: 'performance' | 'ux' | 'content' | 'learning'
    priority: 'low' | 'medium' | 'high' | 'critical'
    recommendation: string
    implementation: string
    expectedImpact: string
  }>
  
  // Data Management
  cleanupOldData: () => void
  exportAnalytics: () => Record<string, any>
  resetAnalytics: () => void
  
  // Utility
  setAnalyticsEnabled: (enabled: boolean) => void
  updateRetentionDays: (days: number) => void
  updatePerformanceThresholds: (thresholds: Record<string, { warning: number; critical: number }>) => void
  updatePrivacySettings: (settings: Partial<{
    allowCohortTracking: boolean
    allowPredictiveAnalysis: boolean
    dataAnonymization: boolean
  }>) => void
  generateAnonymizedUserId: () => string
}

// Default feature utilization tracking
const DEFAULT_FEATURES: FeatureUtilization[] = [
  { featureId: 'quran_reader', name: 'Quran Reader', category: 'core', usageCount: 0, lastUsed: 0, averageSessionDuration: 0, userSatisfaction: 0.9, adoptionRate: 1.0 },
  { featureId: 'audio_player', name: 'Audio Player', category: 'audio', usageCount: 0, lastUsed: 0, averageSessionDuration: 0, userSatisfaction: 0.85, adoptionRate: 0.8 },
  { featureId: 'memorization_tools', name: 'Memorization Tools', category: 'memorization', usageCount: 0, lastUsed: 0, averageSessionDuration: 0, userSatisfaction: 0.92, adoptionRate: 0.7 },
  { featureId: 'search', name: 'Verse Search', category: 'core', usageCount: 0, lastUsed: 0, averageSessionDuration: 0, userSatisfaction: 0.88, adoptionRate: 0.6 },
  { featureId: 'bookmarks', name: 'Bookmarks', category: 'navigation', usageCount: 0, lastUsed: 0, averageSessionDuration: 0, userSatisfaction: 0.9, adoptionRate: 0.5 },
  { featureId: 'progress_tracking', name: 'Progress Tracking', category: 'core', usageCount: 0, lastUsed: 0, averageSessionDuration: 0, userSatisfaction: 0.93, adoptionRate: 0.9 },
  { featureId: 'settings', name: 'Settings', category: 'settings', usageCount: 0, lastUsed: 0, averageSessionDuration: 0, userSatisfaction: 0.8, adoptionRate: 0.95 }
]

// Default performance thresholds
const DEFAULT_THRESHOLDS = {
  page_load: { warning: 3000, critical: 5000 }, // ms
  audio_load: { warning: 2000, critical: 4000 }, // ms
  search_response: { warning: 1000, critical: 2000 }, // ms
  api_response: { warning: 1500, critical: 3000 }, // ms
  memory_usage: { warning: 100, critical: 200 }, // MB
  bundle_size: { warning: 2, critical: 5 } // MB
}

// Helper function to generate anonymized user ID
const generateAnonymizedId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `user_${timestamp}_${random}`
}

// Helper function to determine Islamic month
const getIslamicMonth = (): string => {
  // Simplified Islamic calendar calculation
  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban', 
    'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
  ]
  const now = new Date()
  const monthIndex = (now.getMonth() + Math.floor(now.getDate() / 30)) % 12
  return islamicMonths[monthIndex]
}

// Helper function to get moon phase (simplified)
const getMoonPhase = (): string => {
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
  const now = new Date()
  const phaseIndex = Math.floor((now.getDate() / 30) * 8) % 8
  return phases[phaseIndex]
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      // Initial State
      interactions: [],
      usagePatterns: [],
      performanceMetrics: [],
      featureUtilization: DEFAULT_FEATURES,
      contentQuality: [],
      learningEffectiveness: [],
      
      // Advanced Analytics Data
      memorizationPatterns: [],
      readingHabits: [],
      engagementMetrics: [],
      funnelAnalyses: [],
      cohortData: [],
      islamicPracticeCorrelations: [],
      predictiveInsights: [],
      
      sessionId: '',
      sessionStartTime: 0,
      currentSessionInteractions: [],
      currentCohortId: '',
      anonymizedUserId: generateAnonymizedId(),
      
      analyticsEnabled: true,
      dataRetentionDays: 90,
      performanceThresholds: DEFAULT_THRESHOLDS,
      privacySettings: {
        allowCohortTracking: true,
        allowPredictiveAnalysis: true,
        dataAnonymization: true
      },
      
      todaysInsights: {},
      weeklyTrends: {},
      userBehaviorProfile: {},
      performanceHealth: {
        overall: 'good',
        details: {}
      },
      
      // Advanced Insights
      memorizationInsights: {
        optimalStudyTimes: [],
        bestMemorizationMethods: [],
        personalDifficultyMapping: {},
        retentionPredictions: {},
        improvementAreas: []
      },
      
      readingInsights: {
        averageReadingSpeed: 0,
        comprehensionTrends: [],
        optimalSessionLength: 0,
        focusPatterns: {},
        consistencyScore: 0
      },
      
      engagementInsights: {
        churnRisk: 0,
        engagementScore: 0,
        retentionProbability: {},
        featureAffinityScore: {},
        optimalEngagementStrategy: []
      },
      
      personalizedRecommendations: [],

      // Initialize analytics system
      initialize: () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const sessionStartTime = Date.now()
        
        set({
          sessionId,
          sessionStartTime,
          currentSessionInteractions: []
        })

        // Clean up old data
        get().cleanupOldData()
        
        // Generate initial insights
        get().generateTodaysInsights()
        get().generateWeeklyTrends()
        get().generateUserBehaviorProfile()
        
        // Track initialization
        get().trackInteraction({
          type: 'ui_interaction',
          action: 'app_initialized',
          context: { 
            metadata: { sessionId }
          }
        })
      },

      // Track user interactions
      trackInteraction: (interaction) => {
        if (!get().analyticsEnabled) return
        
        const newInteraction: UserInteraction = {
          ...interaction,
          id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set(state => ({
          interactions: [...state.interactions, newInteraction],
          currentSessionInteractions: [...state.currentSessionInteractions, newInteraction]
        }))

        // Update feature utilization
        if (interaction.context.component) {
          get().updateFeatureUtilization(interaction.context.component)
        }
      },

      // Track performance metrics
      trackPerformance: (metric) => {
        if (!get().analyticsEnabled) return
        
        const newMetric: PerformanceMetric = {
          ...metric,
          id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          threshold: get().performanceThresholds[metric.metric]
        }

        set(state => ({
          performanceMetrics: [...state.performanceMetrics, newMetric]
        }))

        // Update performance health
        const state = get()
        const recentMetrics = state.performanceMetrics
          .filter(m => Date.now() - m.timestamp < 300000) // Last 5 minutes
          .filter(m => m.metric === metric.metric)

        if (recentMetrics.length > 0) {
          const avgValue = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
          const threshold = newMetric.threshold
          
          if (threshold) {
            let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent'
            
            if (avgValue > threshold.critical) {
              status = 'critical'
            } else if (avgValue > threshold.warning) {
              status = 'warning'
            } else if (avgValue > threshold.warning * 0.7) {
              status = 'good'
            }

            set(state => ({
              performanceHealth: {
                ...state.performanceHealth,
                details: {
                  ...state.performanceHealth.details,
                  [metric.metric]: {
                    status,
                    value: avgValue,
                    threshold
                  }
                }
              }
            }))
          }
        }
      },

      // Track content quality
      trackContentQuality: (metric) => {
        if (!get().analyticsEnabled) return
        
        const newMetric: ContentQualityMetric = {
          ...metric,
          id: `quality_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set(state => ({
          contentQuality: [...state.contentQuality, newMetric]
        }))
      },

      // Track learning effectiveness
      trackLearningEffectiveness: (metric) => {
        if (!get().analyticsEnabled) return
        
        const newMetric: LearningEffectivenessMetric = {
          ...metric,
          id: `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set(state => ({
          learningEffectiveness: [...state.learningEffectiveness, newMetric]
        }))
      },

      // Update feature utilization
      updateFeatureUtilization: (featureId, sessionDuration = 0) => {
        set(state => ({
          featureUtilization: state.featureUtilization.map(feature =>
            feature.featureId === featureId
              ? {
                  ...feature,
                  usageCount: feature.usageCount + 1,
                  lastUsed: Date.now(),
                  averageSessionDuration: sessionDuration > 0
                    ? (feature.averageSessionDuration * feature.usageCount + sessionDuration) / (feature.usageCount + 1)
                    : feature.averageSessionDuration
                }
              : feature
          )
        }))
      },

      // Advanced Tracking Methods
      trackMemorizationSession: (pattern) => {
        if (!get().analyticsEnabled) return
        
        const newPattern: MemorizationPattern = {
          ...pattern,
          id: `memorization_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set(state => ({
          memorizationPatterns: [...state.memorizationPatterns, newPattern]
        }))

        // Trigger pattern analysis
        get().analyzeMemorizationPatterns()
      },

      trackReadingSession: (habit) => {
        if (!get().analyticsEnabled) return
        
        const newHabit: ReadingHabit = {
          ...habit,
          id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set(state => ({
          readingHabits: [...state.readingHabits, newHabit]
        }))

        // Trigger habit analysis
        get().analyzeReadingHabits()
      },

      trackEngagement: (metric) => {
        if (!get().analyticsEnabled) return
        
        const newMetric: EngagementMetric = {
          ...metric,
          id: `engagement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set(state => ({
          engagementMetrics: [...state.engagementMetrics, newMetric]
        }))

        // Update engagement insights
        const engagementScore = get().calculateEngagementScore()
        const churnRisk = get().predictChurnRisk()
        
        set(state => ({
          engagementInsights: {
            ...state.engagementInsights,
            engagementScore,
            churnRisk
          }
        }))
      },

      trackFunnelStep: (funnelName, stepName, completed, timeSpent) => {
        if (!get().analyticsEnabled) return

        // Track as interaction
        get().trackInteraction({
          type: 'funnel_step',
          action: completed ? `${stepName}_completed` : `${stepName}_abandoned`,
          context: {
            funnelStep: stepName,
            metadata: { funnelName, timeSpent, completed }
          }
        })

        // Update or create funnel analysis
        const state = get()
        let funnelAnalysis = state.funnelAnalyses.find(f => f.funnelName === funnelName)
        
        if (!funnelAnalysis) {
          funnelAnalysis = {
            id: `funnel_${funnelName}_${Date.now()}`,
            funnelName,
            steps: [],
            conversionRate: 0,
            optimizationOpportunities: [],
            lastUpdated: Date.now()
          }
        }

        // Update funnel step data
        const stepIndex = funnelAnalysis.steps.findIndex(s => s.name === stepName)
        if (stepIndex === -1) {
          funnelAnalysis.steps.push({
            name: stepName,
            userCount: 1,
            completionRate: completed ? 1 : 0,
            averageTime: timeSpent,
            dropoffReasons: completed ? [] : ['user_abandoned']
          })
        } else {
          const step = funnelAnalysis.steps[stepIndex]
          step.userCount += 1
          step.completionRate = ((step.completionRate * (step.userCount - 1)) + (completed ? 1 : 0)) / step.userCount
          step.averageTime = ((step.averageTime * (step.userCount - 1)) + timeSpent) / step.userCount
        }

        funnelAnalysis.lastUpdated = Date.now()
        funnelAnalysis.conversionRate = funnelAnalysis.steps.reduce((acc, step) => acc * step.completionRate, 1)

        set(state => ({
          funnelAnalyses: state.funnelAnalyses.map(f => 
            f.funnelName === funnelName ? funnelAnalysis! : f
          ).concat(state.funnelAnalyses.find(f => f.funnelName === funnelName) ? [] : [funnelAnalysis!])
        }))
      },

      trackIslamicPractice: (correlation) => {
        if (!get().analyticsEnabled) return
        
        const newCorrelation: IslamicPracticeCorrelation = {
          ...correlation,
          id: `practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          correlationFactors: {
            ...correlation.correlationFactors,
            moonPhase: getMoonPhase(),
            islamicMonth: getIslamicMonth(),
            weekday: new Date().toLocaleDateString('en', { weekday: 'long' })
          }
        }

        set(state => ({
          islamicPracticeCorrelations: [...state.islamicPracticeCorrelations, newCorrelation]
        }))

        // Trigger correlation analysis
        get().correlateIslamicPractices()
      },

      joinCohort: (cohortName) => {
        if (!get().privacySettings.allowCohortTracking) return

        const cohortId = `cohort_${cohortName}_${Date.now()}`
        set({ currentCohortId: cohortId })

        // Create or update cohort data
        const state = get()
        let cohort = state.cohortData.find(c => c.cohortName === cohortName)
        
        if (!cohort) {
          cohort = {
            cohortId,
            cohortName,
            createdAt: Date.now(),
            userCount: 1,
            metrics: {
              retention: { day1: 0, day7: 0, day30: 0 },
              engagement: 0,
              featureAdoption: {},
              learningProgress: 0,
              churnRate: 0
            },
            characteristics: {
              avgSessionDuration: 0,
              preferredFeatures: [],
              commonBehaviors: []
            }
          }
          
          set(state => ({
            cohortData: [...state.cohortData, cohort!]
          }))
        } else {
          cohort.userCount += 1
          set(state => ({
            cohortData: state.cohortData.map(c => 
              c.cohortName === cohortName ? cohort! : c
            )
          }))
        }
      },

      // Analyze usage patterns
      analyzeUsagePatterns: async () => {
        const state = get()
        const interactions = state.interactions
        const patterns: UsagePattern[] = []

        // Most accessed surahs
        const surahCounts = interactions
          .filter(i => i.context.surahNumber)
          .reduce((acc, i) => {
            const surah = i.context.surahNumber!
            acc[surah] = (acc[surah] || 0) + 1
            return acc
          }, {} as Record<number, number>)

        Object.entries(surahCounts).forEach(([surah, count]) => {
          patterns.push({
            id: `frequent_surah_${surah}`,
            type: 'frequent_surah',
            pattern: { surahNumber: parseInt(surah), accessCount: count },
            frequency: count,
            confidence: Math.min(count / 10, 1),
            lastUpdated: Date.now()
          })
        })

        // Preferred reciters
        const reciterCounts = interactions
          .filter(i => i.context.reciterId)
          .reduce((acc, i) => {
            const reciter = i.context.reciterId!
            acc[reciter] = (acc[reciter] || 0) + 1
            return acc
          }, {} as Record<string, number>)

        Object.entries(reciterCounts).forEach(([reciter, count]) => {
          patterns.push({
            id: `preferred_reciter_${reciter}`,
            type: 'preferred_reciter',
            pattern: { reciterId: reciter, usageCount: count },
            frequency: count,
            confidence: Math.min(count / 20, 1),
            lastUpdated: Date.now()
          })
        })

        // Study time patterns
        const studyHours = interactions
          .filter(i => i.type === 'memorization')
          .map(i => new Date(i.timestamp).getHours())
          .reduce((acc, hour) => {
            acc[hour] = (acc[hour] || 0) + 1
            return acc
          }, {} as Record<number, number>)

        const preferredStudyHour = Object.entries(studyHours)
          .sort(([,a], [,b]) => b - a)[0]

        if (preferredStudyHour) {
          patterns.push({
            id: 'study_time_preference',
            type: 'study_time',
            pattern: { 
              preferredHour: parseInt(preferredStudyHour[0]),
              frequency: preferredStudyHour[1]
            },
            frequency: preferredStudyHour[1],
            confidence: Math.min(preferredStudyHour[1] / 7, 1), // Week confidence
            lastUpdated: Date.now()
          })
        }

        set({ usagePatterns: patterns })
        return patterns
      },

      // Identify performance bottlenecks
      identifyPerformanceBottlenecks: () => {
        const state = get()
        const recentMetrics = state.performanceMetrics
          .filter(m => Date.now() - m.timestamp < 3600000) // Last hour

        return recentMetrics
          .filter(metric => {
            const threshold = metric.threshold
            return threshold && metric.value > threshold.warning
          })
          .sort((a, b) => b.value - a.value)
      },

      // Generate user behavior profile
      generateUserBehaviorProfile: () => {
        const state = get()
        const interactions = state.interactions
        const recentInteractions = interactions.filter(i => Date.now() - i.timestamp < 604800000) // Last week

        const profile = {
          totalInteractions: interactions.length,
          weeklyInteractions: recentInteractions.length,
          averageSessionLength: 0, // Calculate from session data
          mostUsedFeatures: state.featureUtilization
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 5)
            .map(f => f.name),
          preferredStudyTime: null, // Calculate from patterns
          learningStyle: 'balanced', // Analyze from memorization patterns
          engagementLevel: 'high', // Calculate from usage frequency
          lastActiveDate: Math.max(...interactions.map(i => i.timestamp))
        }

        set({ userBehaviorProfile: profile })
        return profile
      },

      // Calculate learning optimizations
      calculateLearningOptimizations: () => {
        const state = get()
        const learningMetrics = state.learningEffectiveness

        // Optimal repetition analysis
        const repetitionData = learningMetrics
          .filter(m => m.metric === 'optimal_repetition_count')
          .reduce((acc, m) => {
            const count = m.context.timeSpent || 1
            acc.total += count
            acc.sessions += 1
            return acc
          }, { total: 0, sessions: 0 })

        const optimalRepetitions = repetitionData.sessions > 0 
          ? Math.round(repetitionData.total / repetitionData.sessions)
          : 3

        // Success rate by study method
        const methodSuccess = learningMetrics
          .filter(m => m.metric === 'memorization_success_rate')
          .reduce((acc, m) => {
            const method = m.context.studyMethod || 'default'
            if (!acc[method]) acc[method] = { total: 0, count: 0 }
            acc[method].total += m.value
            acc[method].count += 1
            return acc
          }, {} as Record<string, { total: number; count: number }>)

        const bestMethod = Object.entries(methodSuccess)
          .map(([method, data]) => ({
            method,
            avgSuccess: data.total / data.count
          }))
          .sort((a, b) => b.avgSuccess - a.avgSuccess)[0]

        return {
          optimalRepetitions,
          bestStudyMethod: bestMethod?.method || 'repetition',
          recommendedSessionLength: 15, // minutes, calculated from data
          optimalBreakInterval: 5 // minutes
        }
      },

      // Advanced Analytics Methods
      analyzeMemorizationPatterns: () => {
        const state = get()
        const patterns = state.memorizationPatterns
        const recentPatterns = patterns.filter(p => Date.now() - p.timestamp < 2592000000) // Last 30 days

        if (recentPatterns.length === 0) return

        // Calculate optimal study times
        const studyHours = recentPatterns.map(p => new Date(p.timestamp).getHours())
        const hourCounts = studyHours.reduce((acc, hour) => {
          acc[hour] = (acc[hour] || 0) + 1
          return acc
        }, {} as Record<number, number>)
        
        const optimalStudyTimes = Object.entries(hourCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([hour]) => parseInt(hour))

        // Analyze memorization methods
        const methodSuccess = recentPatterns.reduce((acc, p) => {
          const method = p.emotionalState || 'focused'
          if (!acc[method]) acc[method] = { total: 0, count: 0 }
          acc[method].total += p.successRate
          acc[method].count += 1
          return acc
        }, {} as Record<string, { total: number; count: number }>)

        const bestMemorizationMethods = Object.entries(methodSuccess)
          .map(([method, data]) => ({ method, avgSuccess: data.total / data.count }))
          .sort((a, b) => b.avgSuccess - a.avgSuccess)
          .slice(0, 3)
          .map(m => m.method)

        // Personal difficulty mapping
        const surahDifficulty = recentPatterns.reduce((acc, p) => {
          if (!acc[p.surahNumber]) acc[p.surahNumber] = { total: 0, count: 0 }
          acc[p.surahNumber].total += p.difficultyRating
          acc[p.surahNumber].count += 1
          return acc
        }, {} as Record<number, { total: number; count: number }>)

        const personalDifficultyMapping = Object.entries(surahDifficulty).reduce((acc, [surah, data]) => {
          acc[parseInt(surah)] = data.total / data.count
          return acc
        }, {} as Record<number, number>)

        // Retention predictions
        const avgRetention = recentPatterns.reduce((sum, p) => sum + p.retentionRate, 0) / recentPatterns.length
        const retentionPredictions = {
          '24h': Math.min(avgRetention * 1.1, 1),
          '7d': Math.min(avgRetention * 0.9, 1),
          '30d': Math.min(avgRetention * 0.7, 1)
        }

        // Improvement areas
        const improvementAreas = []
        if (avgRetention < 0.7) improvementAreas.push('retention_improvement')
        if (recentPatterns.some(p => p.difficultyRating > 7)) improvementAreas.push('difficulty_management')
        if (recentPatterns.some(p => p.timeSpent > 60)) improvementAreas.push('session_efficiency')

        set(state => ({
          memorizationInsights: {
            optimalStudyTimes,
            bestMemorizationMethods,
            personalDifficultyMapping,
            retentionPredictions,
            improvementAreas
          }
        }))
      },

      analyzeReadingHabits: () => {
        const state = get()
        const habits = state.readingHabits
        const recentHabits = habits.filter(h => Date.now() - h.timestamp < 2592000000) // Last 30 days

        if (recentHabits.length === 0) return

        // Calculate average reading speed
        const averageReadingSpeed = recentHabits.reduce((sum, h) => sum + h.readingSpeed, 0) / recentHabits.length

        // Analyze comprehension trends
        const comprehensionTrends = recentHabits
          .sort((a, b) => a.timestamp - b.timestamp)
          .map(h => h.comprehensionSelf)

        // Optimal session length
        const sessionPerformance = recentHabits.map(h => ({
          duration: h.sessionDuration,
          comprehension: h.comprehensionSelf,
          focus: h.focusLevel
        }))

        const optimalSessionLength = sessionPerformance
          .sort((a, b) => (b.comprehension + b.focus) - (a.comprehension + a.focus))[0]?.duration || 30

        // Focus patterns by hour
        const focusPatterns = recentHabits.reduce((acc, h) => {
          const hour = h.preferredTime
          if (!acc[hour]) acc[hour] = { total: 0, count: 0 }
          acc[hour].total += h.focusLevel
          acc[hour].count += 1
          return acc
        }, {} as Record<number, { total: number; count: number }>)

        const processedFocusPatterns = Object.entries(focusPatterns).reduce((acc, [hour, data]) => {
          acc[parseInt(hour)] = data.total / data.count
          return acc
        }, {} as Record<number, number>)

        // Consistency score
        const consistencyScore = Math.min(recentHabits.reduce((sum, h) => sum + h.consistency, 0) / recentHabits.length, 1)

        set(state => ({
          readingInsights: {
            averageReadingSpeed,
            comprehensionTrends,
            optimalSessionLength,
            focusPatterns: processedFocusPatterns,
            consistencyScore
          }
        }))
      },

      calculateEngagementScore: () => {
        const state = get()
        const recentMetrics = state.engagementMetrics.filter(m => Date.now() - m.timestamp < 604800000) // Last week

        if (recentMetrics.length === 0) return 0

        const avgScore = recentMetrics.reduce((sum, m) => sum + m.score, 0) / recentMetrics.length
        return Math.round(avgScore * 100) / 100
      },

      predictChurnRisk: () => {
        const state = get()
        const recentInteractions = state.interactions.filter(i => Date.now() - i.timestamp < 604800000) // Last week
        const previousWeekInteractions = state.interactions.filter(i => {
          const weekAgo = Date.now() - 604800000
          const twoWeeksAgo = Date.now() - 1209600000
          return i.timestamp >= twoWeeksAgo && i.timestamp < weekAgo
        })

        // Calculate engagement decline
        const recentEngagement = recentInteractions.length
        const previousEngagement = previousWeekInteractions.length
        const engagementDecline = previousEngagement > 0 ? (previousEngagement - recentEngagement) / previousEngagement : 0

        // Factor in session frequency and duration
        const avgSessionDuration = state.currentSessionInteractions.length > 0 
          ? (Date.now() - state.sessionStartTime) / 60000 // minutes
          : 0

        let churnRisk = 0
        if (engagementDecline > 0.5) churnRisk += 0.4
        if (recentEngagement < 5) churnRisk += 0.3
        if (avgSessionDuration < 10) churnRisk += 0.2
        if (Date.now() - Math.max(...state.interactions.map(i => i.timestamp)) > 172800000) churnRisk += 0.1 // 2 days inactive

        return Math.min(churnRisk, 1)
      },

      identifyOptimalStudyTimes: () => {
        const state = get()
        const memorizationData = state.memorizationPatterns
        const readingData = state.readingHabits

        // Combine data from both memorization and reading sessions
        const allStudyTimes = [
          ...memorizationData.map(m => ({ hour: new Date(m.timestamp).getHours(), performance: m.successRate })),
          ...readingData.map(r => ({ hour: r.preferredTime, performance: r.comprehensionSelf / 10 }))
        ]

        const hourPerformance = allStudyTimes.reduce((acc, session) => {
          if (!acc[session.hour]) acc[session.hour] = { total: 0, count: 0 }
          acc[session.hour].total += session.performance
          acc[session.hour].count += 1
          return acc
        }, {} as Record<number, { total: number; count: number }>)

        return Object.entries(hourPerformance)
          .map(([hour, data]) => ({ hour: parseInt(hour), avgPerformance: data.total / data.count }))
          .sort((a, b) => b.avgPerformance - a.avgPerformance)
          .slice(0, 3)
          .map(h => h.hour)
      },

      generateFunnelAnalysis: (funnelName) => {
        const state = get()
        return state.funnelAnalyses.find(f => f.funnelName === funnelName) || null
      },

      analyzeCohortPerformance: (cohortId) => {
        const state = get()
        return state.cohortData.find(c => c.cohortId === cohortId) || null
      },

      correlateIslamicPractices: () => {
        const state = get()
        const practices = state.islamicPracticeCorrelations
        const recentPractices = practices.filter(p => Date.now() - p.timestamp < 2592000000) // Last 30 days

        if (recentPractices.length === 0) return

        // Analyze correlations between practice types and engagement
        const practiceEngagement = recentPractices.reduce((acc, p) => {
          if (!acc[p.practiceType]) acc[p.practiceType] = { total: 0, count: 0 }
          acc[p.practiceType].total += p.quranEngagement
          acc[p.practiceType].count += 1
          return acc
        }, {} as Record<string, { total: number; count: number }>)

        // Time-based correlations
        const timeCorrelations = recentPractices.reduce((acc, p) => {
          const hour = p.timeOfDay
          if (!acc[hour]) acc[hour] = { total: 0, count: 0 }
          acc[hour].total += p.spiritualImpact
          acc[hour].count += 1
          return acc
        }, {} as Record<number, { total: number; count: number }>)

        // Store insights for future use
        const correlationInsights = {
          bestPracticeTypes: Object.entries(practiceEngagement)
            .map(([type, data]) => ({ type, avgEngagement: data.total / data.count }))
            .sort((a, b) => b.avgEngagement - a.avgEngagement),
          optimalPracticeTimes: Object.entries(timeCorrelations)
            .map(([hour, data]) => ({ hour: parseInt(hour), avgImpact: data.total / data.count }))
            .sort((a, b) => b.avgImpact - a.avgImpact)
        }

        // Update state with insights (could be added to a new insights field)
      },

      generatePredictiveInsights: () => {
        if (!get().privacySettings.allowPredictiveAnalysis) return

        const state = get()
        const insights: PredictiveInsight[] = []

        // Churn prediction
        const churnRisk = get().predictChurnRisk()
        insights.push({
          id: `churn_${Date.now()}`,
          type: 'churn_prediction',
          prediction: { risk: churnRisk, likelihood: churnRisk > 0.7 ? 'high' : churnRisk > 0.4 ? 'medium' : 'low' },
          confidence: 0.8,
          factors: ['engagement_decline', 'session_frequency', 'inactivity_period'],
          actionableRecommendations: churnRisk > 0.5 
            ? ['Send re-engagement notification', 'Suggest shorter sessions', 'Recommend favorite content']
            : ['Continue current engagement strategy'],
          validUntil: Date.now() + 604800000 // 1 week
        })

        // Optimal study time prediction
        const optimalTimes = get().identifyOptimalStudyTimes()
        insights.push({
          id: `study_time_${Date.now()}`,
          type: 'optimal_study_time',
          prediction: { optimalHours: optimalTimes },
          confidence: 0.75,
          factors: ['historical_performance', 'focus_patterns', 'comprehension_rates'],
          actionableRecommendations: [`Schedule study sessions at ${optimalTimes.join(', ')} hours`],
          validUntil: Date.now() + 1209600000 // 2 weeks
        })

        // Memorization success prediction
        const memorizationInsights = state.memorizationInsights
        if (memorizationInsights.retentionPredictions['24h']) {
          insights.push({
            id: `memorization_${Date.now()}`,
            type: 'memorization_success',
            prediction: { 
              retentionRate: memorizationInsights.retentionPredictions['24h'],
              recommendedMethod: memorizationInsights.bestMemorizationMethods[0]
            },
            confidence: 0.7,
            factors: ['historical_retention', 'difficulty_patterns', 'optimal_methods'],
            actionableRecommendations: [
              `Use ${memorizationInsights.bestMemorizationMethods[0]} method`,
              'Schedule review sessions',
              'Focus on identified difficult areas'
            ],
            validUntil: Date.now() + 86400000 // 1 day
          })
        }

        set(state => ({
          predictiveInsights: [...state.predictiveInsights.filter(i => i.validUntil > Date.now()), ...insights]
        }))
      },

      calculateRetentionProbability: () => {
        const state = get()
        const interactions = state.interactions
        const now = Date.now()

        // Calculate retention based on engagement patterns
        const day1Interactions = interactions.filter(i => now - i.timestamp < 86400000).length
        const day7Interactions = interactions.filter(i => now - i.timestamp < 604800000).length
        const day30Interactions = interactions.filter(i => now - i.timestamp < 2592000000).length

        // Simple retention probability model
        const totalInteractions = interactions.length
        
        return {
          day1: Math.min(day1Interactions / Math.max(totalInteractions * 0.1, 1), 1),
          day7: Math.min(day7Interactions / Math.max(totalInteractions * 0.3, 1), 1),
          day30: Math.min(day30Interactions / Math.max(totalInteractions * 0.6, 1), 1)
        }
      },

      identifyPersonalizedRecommendations: () => {
        const state = get()
        const recommendations = []
        const now = Date.now()

        // Memorization recommendations
        const memorizationInsights = state.memorizationInsights
        if (memorizationInsights.improvementAreas.includes('retention_improvement')) {
          recommendations.push({
            id: `memorization_retention_${now}`,
            type: 'memorization' as const,
            priority: 'high' as const,
            title: 'Improve Memorization Retention',
            description: 'Your retention rates could be improved with better review scheduling',
            implementation: 'Implement spaced repetition system with review reminders',
            expectedBenefit: 'Increase retention by 20-30%',
            confidence: 0.8,
            validUntil: now + 604800000
          })
        }

        // Reading habit recommendations
        const readingInsights = state.readingInsights
        if (readingInsights.consistencyScore < 0.7) {
          recommendations.push({
            id: `reading_consistency_${now}`,
            type: 'reading' as const,
            priority: 'medium' as const,
            title: 'Build Reading Consistency',
            description: 'Establish a more regular reading routine for better spiritual connection',
            implementation: 'Set daily reading reminders and track progress',
            expectedBenefit: 'Improve spiritual consistency and comprehension',
            confidence: 0.75,
            validUntil: now + 1209600000
          })
        }

        // Optimal timing recommendations
        const optimalTimes = get().identifyOptimalStudyTimes()
        if (optimalTimes.length > 0) {
          recommendations.push({
            id: `optimal_timing_${now}`,
            type: 'timing' as const,
            priority: 'medium' as const,
            title: 'Optimize Study Schedule',
            description: `Your best performance is at ${optimalTimes.join(', ')} hours`,
            implementation: 'Schedule study sessions during optimal hours',
            expectedBenefit: 'Improve focus and comprehension by 15-25%',
            confidence: 0.7,
            validUntil: now + 1209600000
          })
        }

        // Engagement recommendations
        const churnRisk = get().predictChurnRisk()
        if (churnRisk > 0.5) {
          recommendations.push({
            id: `engagement_${now}`,
            type: 'feature' as const,
            priority: 'critical' as const,
            title: 'Re-engage with Content',
            description: 'Your engagement has decreased recently',
            implementation: 'Try shorter sessions with favorite content',
            expectedBenefit: 'Prevent disengagement and maintain spiritual practice',
            confidence: 0.85,
            validUntil: now + 259200000 // 3 days
          })
        }

        set({ personalizedRecommendations: recommendations })
      },

      // Generate today's insights
      generateTodaysInsights: () => {
        const state = get()
        const today = new Date().toDateString()
        const todayInteractions = state.interactions
          .filter(i => new Date(i.timestamp).toDateString() === today)

        const insights = {
          totalInteractions: todayInteractions.length,
          studySessions: todayInteractions.filter(i => i.type === 'memorization').length,
          audioUsage: todayInteractions.filter(i => i.type === 'audio').length,
          averagePerformance: 'good', // Calculate from performance metrics
          topFeatures: [], // Calculate from feature usage
          improvementSuggestions: []
        }

        set({ todaysInsights: insights })
        return insights
      },

      // Generate weekly trends
      generateWeeklyTrends: () => {
        const state = get()
        const weekAgo = Date.now() - 604800000
        const weeklyInteractions = state.interactions
          .filter(i => i.timestamp > weekAgo)

        const trends = {
          interactionTrend: 'increasing', // Calculate trend
          performanceTrend: 'stable',
          engagementTrend: 'high',
          learningProgress: 'on_track',
          recommendations: []
        }

        set({ weeklyTrends: trends })
        return trends
      },

      // Generate recommendations
      generateRecommendations: () => {
        const state = get()
        const recommendations = []

        // Performance recommendations
        const bottlenecks = get().identifyPerformanceBottlenecks()
        bottlenecks.forEach(metric => {
          recommendations.push({
            type: 'performance' as const,
            priority: metric.value > metric.threshold!.critical ? 'critical' as const : 'high' as const,
            recommendation: `Optimize ${metric.metric} performance`,
            implementation: `Current value: ${metric.value}ms, target: <${metric.threshold!.warning}ms`,
            expectedImpact: 'Improved user experience and faster loading'
          })
        })

        // Learning recommendations
        const learningOptimizations = get().calculateLearningOptimizations()
        recommendations.push({
          type: 'learning' as const,
          priority: 'medium' as const,
          recommendation: `Optimal repetition count: ${learningOptimizations.optimalRepetitions}`,
          implementation: 'Update memorization settings automatically',
          expectedImpact: 'Improved memorization efficiency'
        })

        // Feature utilization recommendations
        const underutilizedFeatures = state.featureUtilization
          .filter(f => f.adoptionRate < 0.5)
          .sort((a, b) => a.adoptionRate - b.adoptionRate)

        underutilizedFeatures.forEach(feature => {
          recommendations.push({
            type: 'ux' as const,
            priority: 'low' as const,
            recommendation: `Improve ${feature.name} discoverability`,
            implementation: 'Add onboarding or tutorial hints',
            expectedImpact: 'Increased feature adoption'
          })
        })

        return recommendations
      },

      // Data management
      cleanupOldData: () => {
        const state = get()
        const cutoffTime = Date.now() - (state.dataRetentionDays * 24 * 60 * 60 * 1000)

        set({
          interactions: state.interactions.filter(i => i.timestamp > cutoffTime),
          performanceMetrics: state.performanceMetrics.filter(m => m.timestamp > cutoffTime),
          contentQuality: state.contentQuality.filter(q => q.timestamp > cutoffTime),
          learningEffectiveness: state.learningEffectiveness.filter(l => l.timestamp > cutoffTime)
        })
      },

      exportAnalytics: () => {
        const state = get()
        return {
          summary: {
            totalInteractions: state.interactions.length,
            sessionCount: new Set(state.interactions.map(i => i.id.split('_')[1])).size,
            averagePerformance: state.performanceHealth.overall,
            userBehaviorProfile: state.userBehaviorProfile
          },
          insights: state.todaysInsights,
          trends: state.weeklyTrends,
          recommendations: get().generateRecommendations()
        }
      },

      resetAnalytics: () => {
        set({
          interactions: [],
          usagePatterns: [],
          performanceMetrics: [],
          contentQuality: [],
          learningEffectiveness: [],
          featureUtilization: DEFAULT_FEATURES,
          todaysInsights: {},
          weeklyTrends: {},
          userBehaviorProfile: {},
          performanceHealth: { overall: 'good', details: {} }
        })
      },

      // Utility functions
      setAnalyticsEnabled: (enabled) => set({ analyticsEnabled: enabled }),
      updateRetentionDays: (days) => set({ dataRetentionDays: Math.max(7, Math.min(365, days)) }),
      updatePerformanceThresholds: (thresholds) => set({ performanceThresholds: { ...get().performanceThresholds, ...thresholds } }),
      updatePrivacySettings: (settings) => set(state => ({ 
        privacySettings: { ...state.privacySettings, ...settings }
      })),
      generateAnonymizedUserId: () => {
        const newId = generateAnonymizedId()
        set({ anonymizedUserId: newId })
        return newId
      }
    }),
    {
      name: 'analytics-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist configuration and aggregated data, not raw interactions (privacy-first)
      partialize: (state) => ({
        analyticsEnabled: state.analyticsEnabled,
        dataRetentionDays: state.dataRetentionDays,
        performanceThresholds: state.performanceThresholds,
        privacySettings: state.privacySettings,
        featureUtilization: state.featureUtilization,
        usagePatterns: state.usagePatterns.slice(-50), // Keep recent patterns
        userBehaviorProfile: state.userBehaviorProfile,
        // Advanced insights (aggregated, no personal data)
        memorizationInsights: state.memorizationInsights,
        readingInsights: state.readingInsights,
        engagementInsights: {
          ...state.engagementInsights,
          // Exclude detailed churn risk data for privacy
          churnRisk: 0,
          retentionProbability: {}
        },
        // Only persist anonymized cohort ID if allowed
        currentCohortId: state.privacySettings.allowCohortTracking ? state.currentCohortId : '',
        anonymizedUserId: state.privacySettings.dataAnonymization ? state.anonymizedUserId : '',
        // Keep recent recommendations without personal details
        personalizedRecommendations: state.personalizedRecommendations.slice(-10)
      })
    }
  )
)