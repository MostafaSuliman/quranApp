/**
 * Islamic Content Validation Guardian
 * 
 * Ensures continuous Islamic content authenticity, proper citation standards,
 * and religious accuracy throughout the QuranApp.
 * 
 * Features:
 * - Quran content authenticity verification
 * - Hadith source authentication
 * - Dua authenticity validation
 * - Citation format enforcement
 * - Real-time content monitoring
 * - Automated correction systems
 * - Cultural sensitivity monitoring
 */

import { Ayah, Surah, Hadith, Dua } from '../types/quran'

// ===== VALIDATION INTERFACES =====

export interface ValidationResult {
  isValid: boolean
  score: number // 0-100
  issues: ValidationIssue[]
  correctedContent?: any
  recommendations: string[]
}

export interface ValidationIssue {
  type: 'critical' | 'warning' | 'suggestion'
  category: 'authenticity' | 'citation' | 'presentation' | 'cultural' | 'typography'
  message: string
  field?: string
  severity: number // 1-10
  autoFixable: boolean
}

export interface AuthenticityMetrics {
  authenticityScore: number // Must maintain 100%
  citationAccuracy: number  // Must maintain 100%
  presentationQuality: number // Target 95%+
  culturalSensitivity: number // Must maintain 100%
}

export interface ContentMonitoringAlert {
  id: string
  type: 'content_modification' | 'integrity_breach' | 'unauthorized_change' | 'quality_degradation'
  severity: 'critical' | 'high' | 'medium' | 'low'
  content: any
  originalContent?: any
  timestamp: number
  source: string
  autoFixed: boolean
}

// ===== QURAN CONTENT VALIDATION =====

export class QuranContentValidator {
  private readonly UTHMANI_SCRIPT_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  private readonly DIACRITICAL_MARKS = /[\u064B-\u0652\u0670\u0640]/
  private readonly REPLACEMENT_CHAR = /�/
  private readonly ALIF_WASLA = /ٱ/
  private readonly SUPERSCRIPT_ALIF = /ـٰ/

  /**
   * Verify Uthmani script authenticity
   */
  verifyUthmaniScript(text: string): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100

    // Check for Arabic script
    if (!this.UTHMANI_SCRIPT_PATTERN.test(text)) {
      issues.push({
        type: 'critical',
        category: 'authenticity',
        message: 'Text does not contain valid Arabic script',
        severity: 10,
        autoFixable: false
      })
      score = 0
    }

    // Check for proper diacritical marks
    if (!this.DIACRITICAL_MARKS.test(text)) {
      issues.push({
        type: 'warning',
        category: 'authenticity',
        message: 'Missing diacritical marks (Tashkeel)',
        severity: 7,
        autoFixable: false
      })
      score -= 15
    }

    // Check for replacement characters
    if (this.REPLACEMENT_CHAR.test(text)) {
      issues.push({
        type: 'critical',
        category: 'authenticity',
        message: 'Text contains encoding corruption (replacement characters)',
        severity: 10,
        autoFixable: false
      })
      score -= 50
    }

    // Check for specific Uthmani features
    const hasUthmaniFeatures = this.ALIF_WASLA.test(text) || this.SUPERSCRIPT_ALIF.test(text)
    if (!hasUthmaniFeatures && text.length > 10) {
      issues.push({
        type: 'suggestion',
        category: 'authenticity',
        message: 'Text may not be in authentic Uthmani script',
        severity: 5,
        autoFixable: false
      })
      score -= 10
    }

    return {
      isValid: score >= 90,
      score: Math.max(0, score),
      issues,
      recommendations: this.generateQuranRecommendations(issues)
    }
  }

  /**
   * Check diacritical marks preservation
   */
  checkDiacriticalMarks(text: string): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100

    const diacritics = [
      '\u064B', // Fathatan
      '\u064C', // Dammatan
      '\u064D', // Kasratan
      '\u064E', // Fatha
      '\u064F', // Damma
      '\u0650', // Kasra
      '\u0651', // Shadda
      '\u0652', // Sukun
      '\u0670'  // Superscript Alif
    ]

    const foundDiacritics = diacritics.filter(mark => text.includes(mark))
    
    if (foundDiacritics.length === 0) {
      issues.push({
        type: 'warning',
        category: 'authenticity',
        message: 'No diacritical marks found - may affect recitation accuracy',
        severity: 6,
        autoFixable: false
      })
      score -= 20
    } else if (foundDiacritics.length < 3) {
      issues.push({
        type: 'suggestion',
        category: 'authenticity',
        message: 'Limited diacritical marks - consider full Tashkeel version',
        severity: 3,
        autoFixable: false
      })
      score -= 10
    }

    return {
      isValid: score >= 70,
      score,
      issues,
      recommendations: ['Use complete Tashkeel for accurate recitation', 'Verify against official Mushaf']
    }
  }

  /**
   * Validate verse integrity
   */
  validateVerseIntegrity(ayah: Ayah): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100

    // Check essential fields
    if (!ayah.text || ayah.text.trim().length === 0) {
      issues.push({
        type: 'critical',
        category: 'authenticity',
        message: 'Ayah text is missing',
        severity: 10,
        autoFixable: false
      })
      score = 0
    }

    if (!ayah.number || ayah.number <= 0) {
      issues.push({
        type: 'critical',
        category: 'authenticity',
        message: 'Invalid ayah number',
        severity: 10,
        autoFixable: false
      })
      score -= 30
    }

    if (!ayah.surah || ayah.surah < 1 || ayah.surah > 114) {
      issues.push({
        type: 'critical',
        category: 'authenticity',
        message: 'Invalid surah number',
        severity: 10,
        autoFixable: false
      })
      score -= 30
    }

    // Validate text authenticity
    if (ayah.text) {
      const textValidation = this.verifyUthmaniScript(ayah.text)
      issues.push(...textValidation.issues)
      score = Math.min(score, textValidation.score)
    }

    return {
      isValid: score >= 90,
      score,
      issues,
      recommendations: this.generateQuranRecommendations(issues)
    }
  }

  private generateQuranRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = []
    
    if (issues.some(i => i.category === 'authenticity')) {
      recommendations.push('Verify content against official Quran.com API')
      recommendations.push('Cross-reference with authenticated Mushaf')
    }
    
    if (issues.some(i => i.message.includes('diacritical'))) {
      recommendations.push('Use complete Tashkeel version for accuracy')
    }
    
    if (issues.some(i => i.message.includes('encoding'))) {
      recommendations.push('Check text encoding and character set')
    }

    return recommendations
  }
}

// ===== HADITH AUTHENTICATION SYSTEM =====

export class HadithAuthenticityValidator {
  private readonly AUTHENTIC_COLLECTIONS = [
    'sahih-bukhari',
    'sahih-muslim',
    'abu-dawood',
    'jami-at-tirmidhi',
    'sunan-an-nasai',
    'sunan-ibn-majah'
  ]

  private readonly AUTHENTIC_GRADES = ['Sahih', 'Hasan', 'صحيح', 'حسن']
  private readonly WEAK_GRADES = ['Daif', 'Maudu', 'ضعيف', 'موضوع']

  /**
   * Verify hadith source authenticity
   */
  verifyAuthenticSources(hadith: Hadith): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100

    // Check collection authenticity
    if (!this.AUTHENTIC_COLLECTIONS.includes(hadith.collection)) {
      issues.push({
        type: 'critical',
        category: 'authenticity',
        message: `Unrecognized hadith collection: ${hadith.collection}`,
        severity: 9,
        autoFixable: false
      })
      score -= 40
    }

    // Check grading
    if (this.WEAK_GRADES.includes(hadith.grade)) {
      issues.push({
        type: 'warning',
        category: 'authenticity',
        message: `Hadith has weak grading: ${hadith.grade}`,
        severity: 7,
        autoFixable: false
      })
      score -= 25
    } else if (!this.AUTHENTIC_GRADES.includes(hadith.grade) && hadith.grade !== 'Unknown') {
      issues.push({
        type: 'suggestion',
        category: 'authenticity',
        message: `Unrecognized hadith grading: ${hadith.grade}`,
        severity: 4,
        autoFixable: false
      })
      score -= 10
    }

    // Check essential fields
    if (!hadith.arabicText || hadith.arabicText.trim().length === 0) {
      issues.push({
        type: 'critical',
        category: 'authenticity',
        message: 'Missing Arabic text',
        severity: 10,
        autoFixable: false
      })
      score -= 50
    }

    return {
      isValid: score >= 70,
      score,
      issues,
      recommendations: this.generateHadithRecommendations(issues)
    }
  }

  /**
   * Check hadith chains (Isnad)
   */
  checkHadithChains(hadith: Hadith): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100

    if (!hadith.narrator || hadith.narrator.trim().length === 0) {
      issues.push({
        type: 'warning',
        category: 'authenticity',
        message: 'Missing narrator information',
        severity: 6,
        autoFixable: false
      })
      score -= 20
    }

    // Check for proper Islamic honorifics
    const hasHonorifics = /ﷺ|صلى الله عليه وسلم|رضي الله عنه/.test(hadith.arabicText)
    if (!hasHonorifics && (hadith.arabicText.includes('رسول') || hadith.arabicText.includes('النبي'))) {
      issues.push({
        type: 'suggestion',
        category: 'cultural',
        message: 'Consider adding proper Islamic honorifics (ﷺ)',
        severity: 3,
        autoFixable: true
      })
      score -= 5
    }

    return {
      isValid: score >= 80,
      score,
      issues,
      recommendations: ['Verify narrator chain authenticity', 'Include proper Islamic honorifics']
    }
  }

  /**
   * Validate Arabic text in hadith
   */
  validateArabicText(hadith: Hadith): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100

    // Use Quran validator for Arabic text validation
    const quranValidator = new QuranContentValidator()
    const arabicValidation = quranValidator.verifyUthmaniScript(hadith.arabicText)
    
    // Adjust scoring for hadith context
    issues.push(...arabicValidation.issues.map(issue => ({
      ...issue,
      message: issue.message.replace('Quranic', 'Hadith')
    })))

    score = arabicValidation.score

    return {
      isValid: score >= 80,
      score,
      issues,
      recommendations: this.generateHadithRecommendations(issues)
    }
  }

  private generateHadithRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = []
    
    if (issues.some(i => i.category === 'authenticity')) {
      recommendations.push('Verify against authentic hadith collections')
      recommendations.push('Check hadith grading and narrator chain')
    }
    
    if (issues.some(i => i.message.includes('honorifics'))) {
      recommendations.push('Add proper Islamic honorifics (ﷺ) for Prophet')
    }
    
    return recommendations
  }
}

// ===== DUA AUTHENTICITY VERIFICATION =====

export class DuaAuthenticityValidator {
  private readonly AUTHENTIC_SOURCES = [
    'Quran',
    'Sahih Bukhari',
    'Sahih Muslim',
    'Abu Dawud',
    'Tirmidhi',
    'Sunan',
    'Hisnul Muslim'
  ]

  /**
   * Validate dua source authenticity
   */
  validateAuthenticSources(dua: Dua): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100

    // Check if source is mentioned
    if (!dua.source || dua.source.trim().length === 0) {
      issues.push({
        type: 'warning',
        category: 'authenticity',
        message: 'Missing source attribution',
        severity: 7,
        autoFixable: false
      })
      score -= 30
    }

    // Check if source is authentic
    const hasAuthenticSource = this.AUTHENTIC_SOURCES.some(source => 
      dua.source.toLowerCase().includes(source.toLowerCase())
    )

    if (!hasAuthenticSource) {
      issues.push({
        type: 'suggestion',
        category: 'authenticity',
        message: 'Source may not be from recognized Islamic texts',
        severity: 5,
        autoFixable: false
      })
      score -= 15
    }

    // Check for essential fields
    if (!dua.arabicText || dua.arabicText.trim().length === 0) {
      issues.push({
        type: 'critical',
        category: 'authenticity',
        message: 'Missing Arabic text',
        severity: 10,
        autoFixable: false
      })
      score -= 50
    }

    return {
      isValid: score >= 70,
      score,
      issues,
      recommendations: this.generateDuaRecommendations(issues)
    }
  }

  /**
   * Validate Quran-based duas
   */
  validateQuranBasedDuas(dua: Dua): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100

    if (dua.source.toLowerCase().includes('quran')) {
      // Should follow Quranic citation format
      if (!dua.source.match(/Surah.*Ayah/i) && !dua.source.match(/\d+:\d+/)) {
        issues.push({
          type: 'warning',
          category: 'citation',
          message: 'Quranic source should include proper citation format',
          severity: 6,
          autoFixable: true
        })
        score -= 15
      }

      // Validate Arabic text as Quranic
      const quranValidator = new QuranContentValidator()
      const validation = quranValidator.verifyUthmaniScript(dua.arabicText)
      issues.push(...validation.issues)
      score = Math.min(score, validation.score)
    }

    return {
      isValid: score >= 80,
      score,
      issues,
      recommendations: this.generateDuaRecommendations(issues)
    }
  }

  private generateDuaRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = []
    
    if (issues.some(i => i.category === 'authenticity')) {
      recommendations.push('Verify dua source against authentic Islamic texts')
      recommendations.push('Include proper source attribution')
    }
    
    if (issues.some(i => i.category === 'citation')) {
      recommendations.push('Use proper Islamic citation format')
    }
    
    return recommendations
  }
}

// ===== CITATION FORMAT ENFORCEMENT =====

export class CitationFormatValidator {
  private readonly PROPER_FORMAT = /Surah\s+\w+\s*[•·-]\s*Ayah\s+\d+/i
  private readonly BIBLICAL_FORMAT = /(Quran|Qur'an|Q)\s*\d+:\d+/i
  private readonly INVALID_FORMATS = [
    /Quran\s+\d+:\d+/i,
    /Q\d+:\d+/i,
    /Chapter\s+\d+:\d+/i,
    /Verse\s+\d+:\d+/i
  ]

  /**
   * Enforce proper Islamic citation format
   */
  enforceProperFormat(text: string): ValidationResult {
    const issues: ValidationIssue[] = []
    let score = 100
    let correctedText = text

    // Check for biblical-style format
    this.INVALID_FORMATS.forEach((pattern, index) => {
      if (pattern.test(text)) {
        issues.push({
          type: 'critical',
          category: 'citation',
          message: 'Uses biblical-style citation format instead of Islamic format',
          severity: 9,
          autoFixable: true
        })
        score -= 40

        // Auto-correct if possible
        correctedText = this.convertToIslamicFormat(correctedText)
      }
    })

    // Check for proper format presence
    const hasProperFormat = this.PROPER_FORMAT.test(text)
    const hasAnyReference = /\d+:\d+|\d+\s*[•·-]\s*\d+/.test(text)

    if (hasAnyReference && !hasProperFormat) {
      issues.push({
        type: 'warning',
        category: 'citation',
        message: 'Citation format should be "Surah Name • Ayah Number"',
        severity: 7,
        autoFixable: true
      })
      score -= 25
    }

    return {
      isValid: score >= 75,
      score,
      issues,
      correctedContent: correctedText !== text ? correctedText : undefined,
      recommendations: this.generateCitationRecommendations(issues)
    }
  }

  /**
   * Convert biblical format to Islamic format
   */
  private convertToIslamicFormat(text: string): string {
    // Convert "Quran X:Y" to "Surah X • Ayah Y"
    return text.replace(
      /(Quran|Qur'an|Q)\s*(\d+):(\d+)/gi,
      (match, prefix, surah, ayah) => {
        const surahName = this.getSurahName(parseInt(surah))
        return `Surah ${surahName} • Ayah ${ayah}`
      }
    )
  }

  /**
   * Get Surah name by number
   */
  private getSurahName(surahNumber: number): string {
    const surahNames: { [key: number]: string } = {
      1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Ali \'Imran', 4: 'An-Nisa\'',
      5: 'Al-Ma\'idah', 6: 'Al-An\'am', 7: 'Al-A\'raf', 8: 'Al-Anfal',
      9: 'At-Tawbah', 10: 'Yunus', 11: 'Hud', 12: 'Yusuf',
      13: 'Ar-Ra\'d', 14: 'Ibrahim', 15: 'Al-Hijr', 16: 'An-Nahl',
      17: 'Al-Isra\'', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-Ha',
      // Add more as needed
    }
    
    return surahNames[surahNumber] || `Surah ${surahNumber}`
  }

  private generateCitationRecommendations(issues: ValidationIssue[]): string[] {
    return [
      'Use "Surah Name • Ayah Number" format for Quranic references',
      'Avoid biblical-style "Quran X:Y" citations',
      'Include full Surah names when possible',
      'Use bullet point (•) or dash (-) as separator'
    ]
  }
}

// ===== MAIN VALIDATION GUARDIAN SERVICE =====

export class IslamicContentValidationGuardian {
  private quranValidator: QuranContentValidator
  private hadithValidator: HadithAuthenticityValidator
  private duaValidator: DuaAuthenticityValidator
  private citationValidator: CitationFormatValidator
  private validationAlerts: ContentMonitoringAlert[] = []

  constructor() {
    this.quranValidator = new QuranContentValidator()
    this.hadithValidator = new HadithAuthenticityValidator()
    this.duaValidator = new DuaAuthenticityValidator()
    this.citationValidator = new CitationFormatValidator()
  }

  /**
   * Comprehensive validation of Islamic content
   */
  async validateContent(content: any, contentType: 'quran' | 'hadith' | 'dua'): Promise<ValidationResult> {
    let result: ValidationResult

    switch (contentType) {
      case 'quran':
        result = this.validateQuranContent(content)
        break
      case 'hadith':
        result = this.validateHadithContent(content)
        break
      case 'dua':
        result = this.validateDuaContent(content)
        break
      default:
        throw new Error(`Unsupported content type: ${contentType}`)
    }

    // Monitor for alerts
    this.monitorForAlerts(content, result, contentType)

    return result
  }

  /**
   * Validate Quran content comprehensively
   */
  private validateQuranContent(ayah: Ayah): ValidationResult {
    const scriptValidation = this.quranValidator.verifyUthmaniScript(ayah.text)
    const integrityValidation = this.quranValidator.validateVerseIntegrity(ayah)
    const diacriticsValidation = this.quranValidator.checkDiacriticalMarks(ayah.text)

    // Combine results
    const combinedIssues = [
      ...scriptValidation.issues,
      ...integrityValidation.issues,
      ...diacriticsValidation.issues
    ]

    const minScore = Math.min(
      scriptValidation.score,
      integrityValidation.score,
      diacriticsValidation.score
    )

    return {
      isValid: minScore >= 90,
      score: minScore,
      issues: combinedIssues,
      recommendations: [
        ...scriptValidation.recommendations,
        ...integrityValidation.recommendations
      ]
    }
  }

  /**
   * Validate Hadith content comprehensively
   */
  private validateHadithContent(hadith: Hadith): ValidationResult {
    const sourceValidation = this.hadithValidator.verifyAuthenticSources(hadith)
    const chainValidation = this.hadithValidator.checkHadithChains(hadith)
    const arabicValidation = this.hadithValidator.validateArabicText(hadith)

    const combinedIssues = [
      ...sourceValidation.issues,
      ...chainValidation.issues,
      ...arabicValidation.issues
    ]

    const minScore = Math.min(
      sourceValidation.score,
      chainValidation.score,
      arabicValidation.score
    )

    return {
      isValid: minScore >= 70,
      score: minScore,
      issues: combinedIssues,
      recommendations: [
        ...sourceValidation.recommendations,
        ...chainValidation.recommendations
      ]
    }
  }

  /**
   * Validate Dua content comprehensively
   */
  private validateDuaContent(dua: Dua): ValidationResult {
    const sourceValidation = this.duaValidator.validateAuthenticSources(dua)
    const quranValidation = this.duaValidator.validateQuranBasedDuas(dua)

    const combinedIssues = [
      ...sourceValidation.issues,
      ...quranValidation.issues
    ]

    const minScore = Math.min(sourceValidation.score, quranValidation.score)

    return {
      isValid: minScore >= 70,
      score: minScore,
      issues: combinedIssues,
      recommendations: [
        ...sourceValidation.recommendations,
        ...quranValidation.recommendations
      ]
    }
  }

  /**
   * Monitor content for potential issues
   */
  private monitorForAlerts(content: any, result: ValidationResult, contentType: string): void {
    if (result.score < 70) {
      this.validationAlerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'quality_degradation',
        severity: result.score < 50 ? 'critical' : 'high',
        content,
        timestamp: Date.now(),
        source: contentType,
        autoFixed: !!result.correctedContent
      })
    }

    // Check for critical issues
    const criticalIssues = result.issues.filter(issue => issue.type === 'critical')
    if (criticalIssues.length > 0) {
      this.validationAlerts.push({
        id: `critical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'integrity_breach',
        severity: 'critical',
        content,
        timestamp: Date.now(),
        source: contentType,
        autoFixed: false
      })
    }
  }

  /**
   * Get current validation metrics
   */
  getValidationMetrics(): AuthenticityMetrics {
    // This would be calculated based on recent validations
    return {
      authenticityScore: 100,
      citationAccuracy: 100,
      presentationQuality: 95,
      culturalSensitivity: 100
    }
  }

  /**
   * Get recent validation alerts
   */
  getValidationAlerts(limit: number = 10): ContentMonitoringAlert[] {
    return this.validationAlerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * Clear resolved alerts
   */
  clearResolvedAlerts(): void {
    this.validationAlerts = this.validationAlerts.filter(
      alert => alert.severity === 'critical' && !alert.autoFixed
    )
  }

  /**
   * Auto-correct content where possible
   */
  autoCorrectContent(content: string): { corrected: string; changes: string[] } {
    const changes: string[] = []
    let corrected = content

    // Auto-correct citation format
    const citationResult = this.citationValidator.enforceProperFormat(corrected)
    if (citationResult.correctedContent) {
      corrected = citationResult.correctedContent
      changes.push('Converted biblical-style citations to Islamic format')
    }

    return { corrected, changes }
  }
}

// ===== SINGLETON INSTANCE =====

export const islamicContentValidationGuardian = new IslamicContentValidationGuardian()

// Avoid duplicate exports - classes are already exported above