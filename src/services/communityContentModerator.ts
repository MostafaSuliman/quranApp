/**
 * Community Content Moderation System
 * 
 * Provides comprehensive moderation for user-generated content
 * with Islamic values compliance and cultural sensitivity.
 */

import { islamicContentValidationGuardian, ValidationResult } from './islamicContentValidationGuardian'
import { islamicContentMonitor } from './islamicContentMonitor'

// ===== MODERATION INTERFACES =====

export interface ModerationConfig {
  autoModerationEnabled: boolean
  culturalSensitivityLevel: 'strict' | 'moderate' | 'lenient'
  requireApprovalForNewUsers: boolean
  maxContentLength: number
  bannedWords: string[]
  allowedLanguages: string[]
  contentRetentionDays: number
}

export interface UserContentSubmission {
  id: string
  userId: string
  contentType: 'comment' | 'review' | 'question' | 'correction' | 'translation'
  content: string
  relatedContentId?: string // Ayah, Hadith, or Dua ID
  submittedAt: number
  userReputation: number
  isFirstTime: boolean
  metadata: {
    deviceInfo?: string
    location?: string
    language: string
  }
}

export interface ModerationResult {
  approved: boolean
  confidence: number // 0-100
  flags: ModerationFlag[]
  requiredActions: string[]
  suggestedModifications?: string
  reviewRequired: boolean
  autoModerated: boolean
}

export interface ModerationFlag {
  type: 'inappropriate_language' | 'cultural_insensitivity' | 'islamic_violation' | 'spam' | 'off_topic' | 'harassment' | 'misinformation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  autoDetected: boolean
  field?: string
}

export interface CommunityGuidelines {
  respectfulCommunication: string[]
  islamicValueCompliance: string[]
  contentQualityStandards: string[]
  prohibitedContent: string[]
  culturalSensitivity: string[]
  educationalFocus: string[]
}

// ===== CULTURAL SENSITIVITY VALIDATOR =====

export class CulturalSensitivityValidator {
  private sensitivityPatterns: Map<string, { pattern: RegExp; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = new Map()
  
  constructor() {
    this.setupSensitivityPatterns()
  }

  /**
   * Setup cultural sensitivity detection patterns
   */
  private setupSensitivityPatterns(): void {
    // Inappropriate language patterns
    this.sensitivityPatterns.set('inappropriate_language', {
      pattern: /\b(damn|hell|stupid|idiot|hate)\b/gi,
      severity: 'medium',
      description: 'Contains inappropriate language unsuitable for Islamic educational context'
    })

    // Disrespectful religious references
    this.sensitivityPatterns.set('religious_disrespect', {
      pattern: /\b(allah\s+damn|god\s+damn|jesus\s+christ|oh\s+my\s+god)\b/gi,
      severity: 'critical',
      description: 'Contains disrespectful religious expressions'
    })

    // Cultural insensitivity patterns
    this.sensitivityPatterns.set('cultural_insensitivity', {
      pattern: /\b(terrorist|extremist|backward|primitive)\b.*\b(islam|muslim|arab)\b/gi,
      severity: 'critical',
      description: 'Contains culturally insensitive stereotypes'
    })

    // Islamic value violations
    this.sensitivityPatterns.set('islamic_violations', {
      pattern: /\b(shirk|kufr|haram)\b.*\b(quran|islam|prophet)\b/gi,
      severity: 'high',
      description: 'Contains potentially harmful religious accusations'
    })

    // Spam patterns
    this.sensitivityPatterns.set('spam_content', {
      pattern: /(click\s+here|buy\s+now|free\s+money|visit\s+our\s+website)/gi,
      severity: 'high',
      description: 'Contains spam or promotional content'
    })

    // Off-topic content
    this.sensitivityPatterns.set('off_topic', {
      pattern: /\b(politics|election|party|government|war)\b/gi,
      severity: 'medium',
      description: 'Contains off-topic political content'
    })
  }

  /**
   * Validate cultural sensitivity
   */
  validateCulturalSensitivity(content: string): {
    isAppropriate: boolean
    flags: ModerationFlag[]
    confidence: number
  } {
    const flags: ModerationFlag[] = []
    let confidence = 100

    // Check against all patterns
    for (const [type, config] of this.sensitivityPatterns) {
      if (config.pattern.test(content)) {
        flags.push({
          type: type as any,
          severity: config.severity,
          description: config.description,
          autoDetected: true
        })

        // Reduce confidence based on severity
        switch (config.severity) {
          case 'critical':
            confidence -= 40
            break
          case 'high':
            confidence -= 25
            break
          case 'medium':
            confidence -= 15
            break
          case 'low':
            confidence -= 5
            break
        }
      }
    }

    return {
      isAppropriate: confidence >= 70,
      flags,
      confidence: Math.max(0, confidence)
    }
  }
}

// ===== ISLAMIC VALUES COMPLIANCE CHECKER =====

export class IslamicValuesComplianceChecker {
  private islamicTerms = ['Allah', 'Prophet', 'Quran', 'Islam', 'Muslim', 'Sunnah', 'Hadith']
  private respectfulLanguage = ['Insha\'Allah', 'Masha\'Allah', 'Subhan Allah', 'Alhamdulillah']
  private prohibitedConcepts = ['shirk', 'bid\'ah', 'kufr'] // Should be discussed carefully

  /**
   * Check Islamic values compliance
   */
  checkIslamicCompliance(content: string): {
    compliant: boolean
    score: number
    recommendations: string[]
    violations: string[]
  } {
    const recommendations: string[] = []
    const violations: string[] = []
    let score = 100

    // Check for respectful mention of sacred terms
    const hasIslamicTerms = this.islamicTerms.some(term => 
      content.toLowerCase().includes(term.toLowerCase())
    )

    if (hasIslamicTerms) {
      // Check for proper honorifics
      if (content.includes('Prophet') && !content.includes('ﷺ') && !content.includes('(PBUH)') && !content.includes('peace be upon him')) {
        recommendations.push('Consider adding proper honorifics (ﷺ) when mentioning the Prophet')
        score -= 10
      }

      // Check for respectful language
      const hasRespectfulLanguage = this.respectfulLanguage.some(phrase => 
        content.includes(phrase)
      )

      if (hasRespectfulLanguage) {
        score += 5 // Bonus for respectful language
      }
    }

    // Check for controversial topics
    if (this.prohibitedConcepts.some(concept => content.toLowerCase().includes(concept))) {
      violations.push('Contains sensitive religious concepts that require careful context')
      score -= 20
    }

    // Check for educational value
    const educationalKeywords = ['learn', 'understand', 'meaning', 'explanation', 'context', 'interpretation']
    const hasEducationalValue = educationalKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )

    if (hasEducationalValue) {
      score += 10 // Bonus for educational content
    }

    return {
      compliant: score >= 70,
      score: Math.max(0, Math.min(100, score)),
      recommendations,
      violations
    }
  }
}

// ===== USER REPUTATION SYSTEM =====

export class UserReputationSystem {
  private userScores: Map<string, number> = new Map()
  private userHistory: Map<string, { approved: number; rejected: number; lastActivity: number }> = new Map()

  /**
   * Get user reputation score
   */
  getUserReputation(userId: string): number {
    return this.userScores.get(userId) || 50 // Default neutral score
  }

  /**
   * Update user reputation based on moderation outcome
   */
  updateReputation(userId: string, approved: boolean, impact: number = 5): void {
    const currentScore = this.getUserReputation(userId)
    const newScore = approved 
      ? Math.min(100, currentScore + impact)
      : Math.max(0, currentScore - impact * 2)

    this.userScores.set(userId, newScore)

    // Update history
    const history = this.userHistory.get(userId) || { approved: 0, rejected: 0, lastActivity: 0 }
    if (approved) {
      history.approved++
    } else {
      history.rejected++
    }
    history.lastActivity = Date.now()
    this.userHistory.set(userId, history)
  }

  /**
   * Check if user requires enhanced moderation
   */
  requiresEnhancedModeration(userId: string): boolean {
    const reputation = this.getUserReputation(userId)
    const history = this.userHistory.get(userId)

    // Low reputation users
    if (reputation < 30) {
      return true
    }

    // Users with high rejection rate
    if (history && history.rejected > 0) {
      const rejectionRate = history.rejected / (history.approved + history.rejected)
      if (rejectionRate > 0.3) {
        return true
      }
    }

    return false
  }
}

// ===== CONTENT QUALITY VALIDATOR =====

export class ContentQualityValidator {
  /**
   * Validate content quality and educational value
   */
  validateQuality(submission: UserContentSubmission): {
    qualityScore: number
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    let qualityScore = 100

    // Length validation
    if (submission.content.length < 10) {
      issues.push('Content too short - please provide more detail')
      qualityScore -= 30
    }

    if (submission.content.length > 1000 && submission.contentType !== 'translation') {
      issues.push('Content very long - consider breaking into smaller parts')
      qualityScore -= 10
    }

    // Grammar and structure (basic checks)
    const sentences = submission.content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length === 1 && submission.content.length > 100) {
      suggestions.push('Consider breaking long text into sentences for better readability')
      qualityScore -= 5
    }

    // Language validation
    if (!this.containsValidLanguage(submission.content)) {
      issues.push('Content should be in English or Arabic')
      qualityScore -= 20
    }

    // Repetitive content check
    if (this.isRepetitive(submission.content)) {
      issues.push('Content appears repetitive')
      qualityScore -= 15
    }

    // Educational value check
    if (this.hasEducationalValue(submission.content)) {
      qualityScore += 10
    }

    return {
      qualityScore: Math.max(0, Math.min(100, qualityScore)),
      issues,
      suggestions
    }
  }

  private containsValidLanguage(content: string): boolean {
    // Check for English
    const englishPattern = /[a-zA-Z]/
    // Check for Arabic
    const arabicPattern = /[\u0600-\u06FF]/

    return englishPattern.test(content) || arabicPattern.test(content)
  }

  private isRepetitive(content: string): boolean {
    const words = content.toLowerCase().split(/\s+/)
    const wordCount = new Map<string, number>()

    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })

    // Check if any word appears too frequently
    const totalWords = words.length
    for (const [word, count] of wordCount) {
      if (word.length > 3 && count / totalWords > 0.1) {
        return true
      }
    }

    return false
  }

  private hasEducationalValue(content: string): boolean {
    const educationalKeywords = [
      'learn', 'understand', 'meaning', 'explanation', 'teach', 'help',
      'question', 'answer', 'interpretation', 'context', 'significance',
      'benefit', 'lesson', 'wisdom', 'guidance', 'reflection'
    ]

    return educationalKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )
  }
}

// ===== MAIN COMMUNITY CONTENT MODERATOR =====

export class CommunityContentModerator {
  private config: ModerationConfig
  private culturalValidator: CulturalSensitivityValidator
  private islamicChecker: IslamicValuesComplianceChecker
  private reputationSystem: UserReputationSystem
  private qualityValidator: ContentQualityValidator
  private moderationQueue: UserContentSubmission[] = []
  private communityGuidelines: CommunityGuidelines

  constructor(config: Partial<ModerationConfig> = {}) {
    this.config = {
      autoModerationEnabled: true,
      culturalSensitivityLevel: 'moderate',
      requireApprovalForNewUsers: true,
      maxContentLength: 1000,
      bannedWords: [],
      allowedLanguages: ['en', 'ar'],
      contentRetentionDays: 30,
      ...config
    }

    this.culturalValidator = new CulturalSensitivityValidator()
    this.islamicChecker = new IslamicValuesComplianceChecker()
    this.reputationSystem = new UserReputationSystem()
    this.qualityValidator = new ContentQualityValidator()
    this.communityGuidelines = this.setupCommunityGuidelines()
  }

  /**
   * Setup community guidelines
   */
  private setupCommunityGuidelines(): CommunityGuidelines {
    return {
      respectfulCommunication: [
        'Use respectful and courteous language',
        'Avoid personal attacks or offensive language',
        'Be patient with those learning about Islam',
        'Engage in constructive discussions'
      ],
      islamicValueCompliance: [
        'Respect all Islamic teachings and values',
        'Use proper honorifics when mentioning the Prophet (ﷺ)',
        'Avoid discussions that could lead to confusion about Islamic principles',
        'Focus on authentic Islamic sources'
      ],
      contentQualityStandards: [
        'Provide clear and helpful contributions',
        'Include sources for Islamic information when possible',
        'Write in clear, understandable language',
        'Stay relevant to the topic being discussed'
      ],
      prohibitedContent: [
        'Hate speech or discrimination',
        'Spam or promotional content',
        'Misinformation about Islamic teachings',
        'Off-topic political discussions',
        'Personal information sharing'
      ],
      culturalSensitivity: [
        'Respect diverse cultural backgrounds within the Muslim community',
        'Avoid stereotypes or generalizations',
        'Be mindful of different levels of Islamic knowledge',
        'Promote understanding and unity'
      ],
      educationalFocus: [
        'Prioritize learning and teaching',
        'Ask questions respectfully',
        'Share knowledge constructively',
        'Support fellow community members in their Islamic journey'
      ]
    }
  }

  /**
   * Moderate user content submission
   */
  async moderateContent(submission: UserContentSubmission): Promise<ModerationResult> {
    const flags: ModerationFlag[] = []
    const requiredActions: string[] = []
    let confidence = 100
    let approved = true
    let reviewRequired = false
    let suggestedModifications: string | undefined

    // 1. Cultural sensitivity validation
    const culturalResult = this.culturalValidator.validateCulturalSensitivity(submission.content)
    flags.push(...culturalResult.flags)
    confidence = Math.min(confidence, culturalResult.confidence)

    if (!culturalResult.isAppropriate) {
      approved = false
      requiredActions.push('Address cultural sensitivity issues')
    }

    // 2. Islamic values compliance
    const islamicResult = this.islamicChecker.checkIslamicCompliance(submission.content)
    confidence = Math.min(confidence, islamicResult.score)

    if (!islamicResult.compliant) {
      flags.push({
        type: 'islamic_violation',
        severity: 'high',
        description: 'Content may not align with Islamic values',
        autoDetected: true
      })
      approved = false
      requiredActions.push('Ensure Islamic values compliance')
    }

    if (islamicResult.recommendations.length > 0) {
      suggestedModifications = islamicResult.recommendations.join('; ')
    }

    // 3. Content quality validation
    const qualityResult = this.qualityValidator.validateQuality(submission)
    confidence = Math.min(confidence, qualityResult.qualityScore)

    if (qualityResult.issues.length > 0) {
      flags.push(...qualityResult.issues.map(issue => ({
        type: 'off_topic' as const,
        severity: 'medium' as const,
        description: issue,
        autoDetected: true
      })))

      if (qualityResult.qualityScore < 60) {
        approved = false
        requiredActions.push('Improve content quality')
      }
    }

    // 4. User reputation check
    const userReputation = this.reputationSystem.getUserReputation(submission.userId)
    if (userReputation < 30 || this.reputationSystem.requiresEnhancedModeration(submission.userId)) {
      reviewRequired = true
      requiredActions.push('Manual review required due to user reputation')
    }

    // 5. New user check
    if (submission.isFirstTime && this.config.requireApprovalForNewUsers) {
      reviewRequired = true
      requiredActions.push('Manual approval required for new user')
    }

    // 6. Final approval logic
    if (flags.some(flag => flag.severity === 'critical')) {
      approved = false
      reviewRequired = true
    }

    // Update user reputation based on result
    if (this.config.autoModerationEnabled && !reviewRequired) {
      this.reputationSystem.updateReputation(submission.userId, approved)
    }

    // Add to moderation queue if review required
    if (reviewRequired) {
      this.addToModerationQueue(submission)
    }

    return {
      approved,
      confidence: Math.max(0, Math.min(100, confidence)),
      flags,
      requiredActions,
      suggestedModifications,
      reviewRequired,
      autoModerated: this.config.autoModerationEnabled && !reviewRequired
    }
  }

  /**
   * Add content to moderation queue for human review
   */
  private addToModerationQueue(submission: UserContentSubmission): void {
    this.moderationQueue.push(submission)

    // Keep queue size manageable
    if (this.moderationQueue.length > 100) {
      this.moderationQueue = this.moderationQueue.slice(-100)
    }
  }

  /**
   * Get moderation queue for admin review
   */
  getModerationQueue(limit: number = 10): UserContentSubmission[] {
    return this.moderationQueue
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .slice(0, limit)
  }

  /**
   * Manually approve/reject content from queue
   */
  manualModerationDecision(
    submissionId: string, 
    approved: boolean, 
    moderatorNotes?: string
  ): boolean {
    const index = this.moderationQueue.findIndex(s => s.id === submissionId)
    if (index === -1) {
      return false
    }

    const submission = this.moderationQueue[index]
    
    // Update user reputation
    this.reputationSystem.updateReputation(submission.userId, approved, 10)

    // Remove from queue
    this.moderationQueue.splice(index, 1)

    console.log(`Manual moderation decision for ${submissionId}: ${approved ? 'APPROVED' : 'REJECTED'}`, moderatorNotes)

    return true
  }

  /**
   * Get community guidelines
   */
  getCommunityGuidelines(): CommunityGuidelines {
    return this.communityGuidelines
  }

  /**
   * Get moderation statistics
   */
  getModerationStats(): {
    totalSubmissions: number
    approvedAutomatic: number
    rejectedAutomatic: number
    requiresReview: number
    averageConfidence: number
  } {
    // This would be implemented with persistent storage
    return {
      totalSubmissions: 0,
      approvedAutomatic: 0,
      rejectedAutomatic: 0,
      requiresReview: this.moderationQueue.length,
      averageConfidence: 85
    }
  }

  /**
   * Update moderation configuration
   */
  updateConfig(newConfig: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// ===== SINGLETON INSTANCE =====

export const communityContentModerator = new CommunityContentModerator({
  autoModerationEnabled: true,
  culturalSensitivityLevel: 'moderate',
  requireApprovalForNewUsers: true,
  maxContentLength: 1000
})

// Export classes for direct use
export {
  CulturalSensitivityValidator,
  IslamicValuesComplianceChecker,
  UserReputationSystem,
  ContentQualityValidator
}