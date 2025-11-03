/**
 * Comprehensive Test Suite for Islamic Content Validation Guardian
 * 
 * Tests all validation systems including:
 * - Quran content authenticity
 * - Hadith source verification
 * - Dua authenticity validation
 * - Citation format enforcement
 * - Real-time monitoring
 * - Automated corrections
 * - Community moderation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  IslamicContentValidationGuardian,
  QuranContentValidator,
  HadithAuthenticityValidator,
  DuaAuthenticityValidator,
  CitationFormatValidator,
  islamicContentValidationGuardian
} from '../services/islamicContentValidationGuardian'
import {
  IslamicContentMonitor,
  islamicContentMonitor
} from '../services/islamicContentMonitor'
import {
  CommunityContentModerator,
  communityContentModerator
} from '../services/communityContentModerator'
import { Ayah, Hadith, Dua } from '../types/quran'

// ===== TEST DATA =====

const mockAuthenticAyah: Ayah = {
  number: 1001,
  text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
  numberInSurah: 1,
  surah: 1,
  juz: 1,
  manzil: 1,
  page: 1,
  ruku: 1,
  hizbQuarter: 1,
  translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  transliteration: 'Bismillahi ar-rahmani ar-raheem'
}

const mockInvalidAyah: Ayah = {
  ...mockAuthenticAyah,
  text: 'In the name of Allah', // Invalid: English as primary text
  translation: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' // Invalid: Arabic as translation
}

const mockCorruptedAyah: Ayah = {
  ...mockAuthenticAyah,
  text: 'بِسْمِ � ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' // Contains replacement character
}

const mockAuthenticHadith: Hadith = {
  id: 'bukhari_001',
  collection: 'sahih-bukhari',
  book: 'Book of Revelation',
  chapter: 'Beginning of Revelation',
  hadithNumber: '1',
  arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
  englishTranslation: 'Actions are according to intentions, and everyone will get what was intended.',
  narrator: 'Umar ibn al-Khattab',
  grade: 'Sahih',
  reference: 'Sahih Bukhari 1'
}

const mockWeakHadith: Hadith = {
  ...mockAuthenticHadith,
  id: 'weak_001',
  collection: 'unknown-collection',
  grade: 'Daif'
}

const mockAuthenticDua: Dua = {
  id: 'dua_001',
  title: 'Before Eating',
  arabicText: 'بِسْمِ اللَّهِ',
  transliteration: 'Bismillah',
  englishTranslation: 'In the name of Allah',
  source: 'Sahih Bukhari, Sahih Muslim',
  category: 'before_eating'
}

const mockInvalidDua: Dua = {
  ...mockAuthenticDua,
  id: 'invalid_dua',
  source: 'Unknown source',
  arabicText: ''
}

// ===== QURAN CONTENT VALIDATOR TESTS =====

describe('QuranContentValidator', () => {
  let validator: QuranContentValidator

  beforeEach(() => {
    validator = new QuranContentValidator()
  })

  describe('Uthmani Script Verification', () => {
    it('should validate authentic Arabic Uthmani script', () => {
      const result = validator.verifyUthmaniScript(mockAuthenticAyah.text)
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(90)
      expect(result.issues).toHaveLength(0)
    })

    it('should reject English text as Uthmani script', () => {
      const result = validator.verifyUthmaniScript('In the name of Allah')
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBe(0)
      expect(result.issues).toHaveLength(1)
      expect(result.issues[0].type).toBe('critical')
      expect(result.issues[0].category).toBe('authenticity')
    })

    it('should detect encoding corruption', () => {
      const corruptedText = 'بِسْمِ � ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
      const result = validator.verifyUthmaniScript(corruptedText)
      
      expect(result.isValid).toBe(false)
      expect(result.issues.some(issue => issue.message.includes('encoding corruption'))).toBe(true)
    })

    it('should validate presence of Uthmani features', () => {
      const textWithAlif = 'ٱللَّهِ' // Contains Alif Wasla
      const result = validator.verifyUthmaniScript(textWithAlif)
      
      expect(result.score).toBeGreaterThan(85)
    })
  })

  describe('Diacritical Marks Validation', () => {
    it('should validate presence of Tashkeel', () => {
      const textWithTashkeel = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
      const result = validator.checkDiacriticalMarks(textWithTashkeel)
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThan(80)
    })

    it('should warn about missing diacritical marks', () => {
      const textWithoutTashkeel = 'بسم الله الرحمن الرحيم'
      const result = validator.checkDiacriticalMarks(textWithoutTashkeel)
      
      expect(result.score).toBeLessThan(90)
      expect(result.issues.some(issue => issue.message.includes('diacritical marks'))).toBe(true)
    })
  })

  describe('Verse Integrity Validation', () => {
    it('should validate complete authentic ayah', () => {
      const result = validator.validateVerseIntegrity(mockAuthenticAyah)
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(90)
    })

    it('should reject ayah with missing text', () => {
      const invalidAyah = { ...mockAuthenticAyah, text: '' }
      const result = validator.validateVerseIntegrity(invalidAyah)
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBe(0)
    })

    it('should reject ayah with invalid surah number', () => {
      const invalidAyah = { ...mockAuthenticAyah, surah: 115 } // Invalid surah number
      const result = validator.validateVerseIntegrity(invalidAyah)
      
      expect(result.isValid).toBe(false)
      expect(result.issues.some(issue => issue.message.includes('Invalid surah number'))).toBe(true)
    })
  })
})

// ===== HADITH AUTHENTICITY VALIDATOR TESTS =====

describe('HadithAuthenticityValidator', () => {
  let validator: HadithAuthenticityValidator

  beforeEach(() => {
    validator = new HadithAuthenticityValidator()
  })

  describe('Source Authentication', () => {
    it('should validate authentic hadith collections', () => {
      const result = validator.verifyAuthenticSources(mockAuthenticHadith)
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(70)
    })

    it('should flag unknown collections', () => {
      const result = validator.verifyAuthenticSources(mockWeakHadith)
      
      expect(result.score).toBeLessThan(70)
      expect(result.issues.some(issue => issue.message.includes('Unrecognized hadith collection'))).toBe(true)
    })

    it('should warn about weak gradings', () => {
      const result = validator.verifyAuthenticSources(mockWeakHadith)
      
      expect(result.issues.some(issue => issue.message.includes('weak grading'))).toBe(true)
    })

    it('should require Arabic text', () => {
      const hadithWithoutArabic = { ...mockAuthenticHadith, arabicText: '' }
      const result = validator.verifyAuthenticSources(hadithWithoutArabic)
      
      expect(result.isValid).toBe(false)
      expect(result.issues.some(issue => issue.message.includes('Missing Arabic text'))).toBe(true)
    })
  })

  describe('Hadith Chain Validation', () => {
    it('should validate narrator information', () => {
      const result = validator.checkHadithChains(mockAuthenticHadith)
      
      expect(result.isValid).toBe(true)
    })

    it('should warn about missing narrator', () => {
      const hadithWithoutNarrator = { ...mockAuthenticHadith, narrator: '' }
      const result = validator.checkHadithChains(hadithWithoutNarrator)
      
      expect(result.issues.some(issue => issue.message.includes('Missing narrator information'))).toBe(true)
    })

    it('should suggest Islamic honorifics', () => {
      const hadithWithoutHonorifics = { 
        ...mockAuthenticHadith, 
        arabicText: 'قال رسول الله أن الإيمان بالقلب' 
      }
      const result = validator.checkHadithChains(hadithWithoutHonorifics)
      
      expect(result.issues.some(issue => issue.message.includes('honorifics'))).toBe(true)
    })
  })
})

// ===== DUA AUTHENTICITY VALIDATOR TESTS =====

describe('DuaAuthenticityValidator', () => {
  let validator: DuaAuthenticityValidator

  beforeEach(() => {
    validator = new DuaAuthenticityValidator()
  })

  describe('Source Validation', () => {
    it('should validate authentic dua sources', () => {
      const result = validator.validateAuthenticSources(mockAuthenticDua)
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(70)
    })

    it('should warn about missing source attribution', () => {
      const duaWithoutSource = { ...mockAuthenticDua, source: '' }
      const result = validator.validateAuthenticSources(duaWithoutSource)
      
      expect(result.issues.some(issue => issue.message.includes('Missing source attribution'))).toBe(true)
    })

    it('should flag unrecognized sources', () => {
      const result = validator.validateAuthenticSources(mockInvalidDua)
      
      expect(result.issues.some(issue => issue.message.includes('may not be from recognized Islamic texts'))).toBe(true)
    })

    it('should require Arabic text', () => {
      const result = validator.validateAuthenticSources(mockInvalidDua)
      
      expect(result.isValid).toBe(false)
      expect(result.issues.some(issue => issue.message.includes('Missing Arabic text'))).toBe(true)
    })
  })

  describe('Quran-based Dua Validation', () => {
    it('should validate Quranic duas with proper citation', () => {
      const quranDua = { 
        ...mockAuthenticDua, 
        source: 'Surah Al-Fatiha • Ayah 1',
        arabicText: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً'
      }
      const result = validator.validateQuranBasedDuas(quranDua)
      
      expect(result.isValid).toBe(true)
    })

    it('should suggest proper citation format for Quranic sources', () => {
      const quranDuaWithBadCitation = { 
        ...mockAuthenticDua, 
        source: 'Quran 2:201'
      }
      const result = validator.validateQuranBasedDuas(quranDuaWithBadCitation)
      
      expect(result.issues.some(issue => issue.message.includes('proper citation format'))).toBe(true)
    })
  })
})

// ===== CITATION FORMAT VALIDATOR TESTS =====

describe('CitationFormatValidator', () => {
  let validator: CitationFormatValidator

  beforeEach(() => {
    validator = new CitationFormatValidator()
  })

  describe('Format Enforcement', () => {
    it('should accept proper Islamic citation format', () => {
      const properCitation = 'This is from Surah Al-Fatiha • Ayah 1'
      const result = validator.enforceProperFormat(properCitation)
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(75)
    })

    it('should reject biblical-style citation format', () => {
      const biblicalCitation = 'This is from Quran 1:1'
      const result = validator.enforceProperFormat(biblicalCitation)
      
      expect(result.isValid).toBe(false)
      expect(result.issues.some(issue => issue.message.includes('biblical-style citation'))).toBe(true)
    })

    it('should auto-correct biblical format to Islamic format', () => {
      const biblicalCitation = 'This is from Quran 1:1'
      const result = validator.enforceProperFormat(biblicalCitation)
      
      expect(result.correctedContent).toBeDefined()
      expect(result.correctedContent).toContain('Surah Al-Fatiha • Ayah 1')
    })

    it('should handle multiple citation formats in text', () => {
      const mixedCitations = 'See Quran 1:1 and also Q 2:255'
      const result = validator.enforceProperFormat(mixedCitations)
      
      expect(result.correctedContent).toContain('Surah Al-Fatiha • Ayah 1')
      expect(result.correctedContent).toContain('Surah Al-Baqarah • Ayah 255')
    })
  })
})

// ===== ISLAMIC CONTENT VALIDATION GUARDIAN TESTS =====

describe('IslamicContentValidationGuardian', () => {
  let guardian: IslamicContentValidationGuardian

  beforeEach(() => {
    guardian = new IslamicContentValidationGuardian()
  })

  describe('Comprehensive Content Validation', () => {
    it('should validate authentic Quran content', async () => {
      const result = await guardian.validateContent(mockAuthenticAyah, 'quran')
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(90)
    })

    it('should validate authentic Hadith content', async () => {
      const result = await guardian.validateContent(mockAuthenticHadith, 'hadith')
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(70)
    })

    it('should validate authentic Dua content', async () => {
      const result = await guardian.validateContent(mockAuthenticDua, 'dua')
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(70)
    })

    it('should reject invalid content', async () => {
      const result = await guardian.validateContent(mockInvalidAyah, 'quran')
      
      expect(result.isValid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })
  })

  describe('Validation Metrics', () => {
    it('should maintain high authenticity standards', () => {
      const metrics = guardian.getValidationMetrics()
      
      expect(metrics.authenticityScore).toBe(100)
      expect(metrics.citationAccuracy).toBe(100)
      expect(metrics.culturalSensitivity).toBe(100)
      expect(metrics.presentationQuality).toBeGreaterThanOrEqual(95)
    })
  })

  describe('Auto-correction', () => {
    it('should auto-correct citation formats', () => {
      const contentWithBadCitation = 'This verse is from Quran 1:1'
      const result = guardian.autoCorrectContent(contentWithBadCitation)
      
      expect(result.corrected).toContain('Surah Al-Fatiha • Ayah 1')
      expect(result.changes.length).toBeGreaterThan(0)
    })
  })
})

// ===== ISLAMIC CONTENT MONITOR TESTS =====

describe('IslamicContentMonitor', () => {
  let monitor: IslamicContentMonitor

  beforeEach(() => {
    monitor = new IslamicContentMonitor({
      enableRealTimeValidation: true,
      autoCorrectEnabled: true,
      alertThreshold: 80
    })
  })

  afterEach(() => {
    monitor.stopMonitoring()
  })

  describe('Content Monitoring', () => {
    it('should monitor content and return validation results', async () => {
      const result = await monitor.monitorContent('test_ayah_1', mockAuthenticAyah, 'quran')
      
      expect(result.validated).toBe(true)
      expect(result.result).toBeDefined()
      expect(result.result.isValid).toBe(true)
    })

    it('should auto-correct invalid content when enabled', async () => {
      const invalidContent = { ...mockAuthenticDua, source: 'Quran 1:1' }
      const result = await monitor.monitorContent('test_dua_1', invalidContent, 'dua')
      
      expect(result.corrected).toBe(true)
      expect(result.corrections).toBeDefined()
    })

    it('should track quality metrics', async () => {
      await monitor.monitorContent('test_1', mockAuthenticAyah, 'quran')
      await monitor.monitorContent('test_2', mockInvalidAyah, 'quran')
      
      const status = monitor.getStatus()
      expect(status.metrics.totalValidations).toBeGreaterThan(0)
    })
  })

  describe('Monitoring Control', () => {
    it('should start and stop monitoring', () => {
      monitor.startMonitoring()
      expect(monitor.getStatus().isRunning).toBe(true)
      
      monitor.stopMonitoring()
      expect(monitor.getStatus().isRunning).toBe(false)
    })

    it('should update configuration', () => {
      monitor.updateConfig({ alertThreshold: 90 })
      expect(monitor.getStatus().config.alertThreshold).toBe(90)
    })
  })
})

// ===== COMMUNITY CONTENT MODERATOR TESTS =====

describe('CommunityContentModerator', () => {
  let moderator: CommunityContentModerator

  beforeEach(() => {
    moderator = new CommunityContentModerator({
      autoModerationEnabled: true,
      culturalSensitivityLevel: 'moderate'
    })
  })

  describe('Content Moderation', () => {
    it('should approve appropriate Islamic content', async () => {
      const goodSubmission = {
        id: 'sub_001',
        userId: 'user_001',
        contentType: 'comment' as const,
        content: 'MashaAllah, this is a beautiful explanation of the verse. JazakAllahu khairan for sharing.',
        submittedAt: Date.now(),
        userReputation: 80,
        isFirstTime: false,
        metadata: { language: 'en' }
      }

      const result = await moderator.moderateContent(goodSubmission)
      
      expect(result.approved).toBe(true)
      expect(result.confidence).toBeGreaterThan(70)
    })

    it('should reject inappropriate content', async () => {
      const badSubmission = {
        id: 'sub_002',
        userId: 'user_002',
        contentType: 'comment' as const,
        content: 'This is stupid and makes no sense. What a waste of time.',
        submittedAt: Date.now(),
        userReputation: 50,
        isFirstTime: false,
        metadata: { language: 'en' }
      }

      const result = await moderator.moderateContent(badSubmission)
      
      expect(result.approved).toBe(false)
      expect(result.flags.length).toBeGreaterThan(0)
    })

    it('should require review for new users', async () => {
      const newUserSubmission = {
        id: 'sub_003',
        userId: 'new_user_001',
        contentType: 'question' as const,
        content: 'Can someone explain the meaning of this ayah?',
        submittedAt: Date.now(),
        userReputation: 50,
        isFirstTime: true,
        metadata: { language: 'en' }
      }

      const result = await moderator.moderateContent(newUserSubmission)
      
      expect(result.reviewRequired).toBe(true)
    })

    it('should detect cultural insensitivity', async () => {
      const insensitiveSubmission = {
        id: 'sub_004',
        userId: 'user_004',
        contentType: 'comment' as const,
        content: 'These Muslim traditions are so backward and primitive.',
        submittedAt: Date.now(),
        userReputation: 50,
        isFirstTime: false,
        metadata: { language: 'en' }
      }

      const result = await moderator.moderateContent(insensitiveSubmission)
      
      expect(result.approved).toBe(false)
      expect(result.flags.some(flag => flag.type === 'cultural_insensitivity')).toBe(true)
    })
  })

  describe('Community Guidelines', () => {
    it('should provide comprehensive community guidelines', () => {
      const guidelines = moderator.getCommunityGuidelines()
      
      expect(guidelines.respectfulCommunication).toHaveLength(4)
      expect(guidelines.islamicValueCompliance).toHaveLength(4)
      expect(guidelines.contentQualityStandards).toHaveLength(4)
      expect(guidelines.prohibitedContent).toHaveLength(5)
      expect(guidelines.culturalSensitivity).toHaveLength(4)
      expect(guidelines.educationalFocus).toHaveLength(4)
    })
  })

  describe('Manual Moderation', () => {
    it('should handle manual moderation decisions', async () => {
      const submission = {
        id: 'sub_005',
        userId: 'user_005',
        contentType: 'comment' as const,
        content: 'This needs manual review',
        submittedAt: Date.now(),
        userReputation: 20,
        isFirstTime: true,
        metadata: { language: 'en' }
      }

      await moderator.moderateContent(submission)
      
      const decision = moderator.manualModerationDecision('sub_005', true, 'Approved after review')
      expect(decision).toBe(true)
    })
  })
})

// ===== INTEGRATION TESTS =====

describe('Islamic Content Validation System Integration', () => {
  it('should integrate all validation systems seamlessly', async () => {
    // Test complete workflow from content submission to validation
    const testContent = mockAuthenticAyah
    
    // 1. Validate through Guardian
    const guardianResult = await islamicContentValidationGuardian.validateContent(testContent, 'quran')
    expect(guardianResult.isValid).toBe(true)
    
    // 2. Monitor through Monitor
    const monitorResult = await islamicContentMonitor.monitorContent('integration_test', testContent, 'quran')
    expect(monitorResult.validated).toBe(true)
    
    // 3. Check metrics
    const metrics = islamicContentValidationGuardian.getValidationMetrics()
    expect(metrics.authenticityScore).toBe(100)
  })

  it('should maintain Islamic content standards across all systems', async () => {
    const testCases = [
      { content: mockAuthenticAyah, type: 'quran' as const, shouldPass: true },
      { content: mockAuthenticHadith, type: 'hadith' as const, shouldPass: true },
      { content: mockAuthenticDua, type: 'dua' as const, shouldPass: true },
      { content: mockInvalidAyah, type: 'quran' as const, shouldPass: false }
    ]

    for (const testCase of testCases) {
      const result = await islamicContentValidationGuardian.validateContent(
        testCase.content,
        testCase.type
      )
      
      if (testCase.shouldPass) {
        expect(result.isValid).toBe(true)
        expect(result.score).toBeGreaterThanOrEqual(70)
      } else {
        expect(result.isValid).toBe(false)
        expect(result.issues.length).toBeGreaterThan(0)
      }
    }
  })
})

// ===== PERFORMANCE TESTS =====

describe('Islamic Content Validation Performance', () => {
  it('should validate content quickly', async () => {
    const startTime = Date.now()
    
    await islamicContentValidationGuardian.validateContent(mockAuthenticAyah, 'quran')
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(100) // Should complete within 100ms
  })

  it('should handle multiple validations efficiently', async () => {
    const startTime = Date.now()
    
    const promises = Array(10).fill(0).map((_, i) => 
      islamicContentValidationGuardian.validateContent(
        { ...mockAuthenticAyah, number: 1000 + i },
        'quran'
      )
    )
    
    await Promise.all(promises)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(500) // Should complete 10 validations within 500ms
  })
})

// ===== ERROR HANDLING TESTS =====

describe('Islamic Content Validation Error Handling', () => {
  it('should handle malformed content gracefully', async () => {
    const malformedContent = null
    
    try {
      await islamicContentValidationGuardian.validateContent(malformedContent as any, 'quran')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should handle unsupported content types', async () => {
    try {
      await islamicContentValidationGuardian.validateContent(mockAuthenticAyah, 'unsupported' as any)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('Unsupported content type')
    }
  })
})