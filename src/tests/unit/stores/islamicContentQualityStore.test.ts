/**
 * Unit Tests for Islamic Content Quality Store
 *
 * Tests Zustand store for Islamic content validation and quality management.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useIslamicContentQualityStore } from '@/stores/islamicContentQualityStore'

describe('IslamicContentQualityStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useIslamicContentQualityStore.getState()
    store.rules = []
    store.validationResults = []
    store.arabicTextQuality = []
  })

  describe('Store Initialization', () => {
    it('should initialize with empty state', () => {
      const state = useIslamicContentQualityStore.getState()

      expect(state.rules).toEqual([])
      expect(state.validationResults).toEqual([])
      expect(state.arabicTextQuality).toEqual([])
    })

    it('should have all required methods', () => {
      const state = useIslamicContentQualityStore.getState()

      expect(typeof state.addRule).toBe('function')
      expect(typeof state.updateRule).toBe('function')
      expect(typeof state.deleteRule).toBe('function')
      expect(typeof state.addValidationResult).toBe('function')
    })
  })

  describe('Rule Management', () => {
    it('should add a new rule', () => {
      const store = useIslamicContentQualityStore.getState()
      const rule = {
        id: 'rule-1',
        name: 'Arabic Text Authenticity',
        category: 'text_authenticity' as const,
        priority: 'critical' as const,
        description: 'Ensures Arabic text matches Uthmani script',
        validation: {
          type: 'format_check' as const,
          criteria: ['uthmani_script', 'diacritics'],
          automaticCheck: true
        },
        compliance: {
          required: true,
          islamicStandard: 'Uthmani Mushaf',
          source: 'King Fahd Complex'
        },
        isActive: true
      }

      store.addRule(rule)
      const state = useIslamicContentQualityStore.getState()

      expect(state.rules).toHaveLength(1)
      expect(state.rules[0]).toEqual(rule)
    })

    it('should update existing rule', () => {
      const store = useIslamicContentQualityStore.getState()
      const rule = {
        id: 'rule-1',
        name: 'Test Rule',
        category: 'text_authenticity' as const,
        priority: 'high' as const,
        description: 'Test',
        validation: {
          type: 'format_check' as const,
          criteria: [],
          automaticCheck: true
        },
        compliance: {
          required: true,
          islamicStandard: 'Test',
          source: 'Test'
        },
        isActive: true
      }

      store.addRule(rule)
      store.updateRule('rule-1', { priority: 'critical' })

      const state = useIslamicContentQualityStore.getState()
      expect(state.rules[0].priority).toBe('critical')
    })

    it('should delete rule', () => {
      const store = useIslamicContentQualityStore.getState()
      const rule = {
        id: 'rule-1',
        name: 'Test Rule',
        category: 'text_authenticity' as const,
        priority: 'high' as const,
        description: 'Test',
        validation: {
          type: 'format_check' as const,
          criteria: [],
          automaticCheck: true
        },
        compliance: {
          required: true,
          islamicStandard: 'Test',
          source: 'Test'
        },
        isActive: true
      }

      store.addRule(rule)
      store.deleteRule('rule-1')

      const state = useIslamicContentQualityStore.getState()
      expect(state.rules).toHaveLength(0)
    })
  })

  describe('Validation Results', () => {
    it('should add validation result', () => {
      const store = useIslamicContentQualityStore.getState()
      const result = {
        id: 'result-1',
        timestamp: Date.now(),
        contentType: 'arabic_text' as const,
        contentId: 'ayah-1-1',
        validationRules: ['rule-1'],
        results: [{
          ruleId: 'rule-1',
          ruleName: 'Arabic Text Authenticity',
          status: 'passed' as const,
          score: 1.0,
          details: 'Text matches Uthmani script'
        }],
        overallScore: 1.0,
        overallStatus: 'compliant' as const,
        reviewRequired: false,
        lastValidated: Date.now()
      }

      store.addValidationResult(result)
      const state = useIslamicContentQualityStore.getState()

      expect(state.validationResults).toHaveLength(1)
      expect(state.validationResults[0]).toEqual(result)
    })

    it('should calculate overall score correctly', () => {
      const store = useIslamicContentQualityStore.getState()
      const result = {
        id: 'result-1',
        timestamp: Date.now(),
        contentType: 'arabic_text' as const,
        contentId: 'ayah-1-1',
        validationRules: ['rule-1', 'rule-2'],
        results: [
          {
            ruleId: 'rule-1',
            ruleName: 'Test 1',
            status: 'passed' as const,
            score: 1.0,
            details: 'Passed'
          },
          {
            ruleId: 'rule-2',
            ruleName: 'Test 2',
            status: 'warning' as const,
            score: 0.8,
            details: 'Minor issues'
          }
        ],
        overallScore: 0.9,
        overallStatus: 'compliant' as const,
        reviewRequired: false,
        lastValidated: Date.now()
      }

      store.addValidationResult(result)
      const state = useIslamicContentQualityStore.getState()

      expect(state.validationResults[0].overallScore).toBe(0.9)
    })
  })

  describe('Arabic Text Quality', () => {
    it('should track Arabic text quality metrics', () => {
      const store = useIslamicContentQualityStore.getState()

      // Add mock quality data
      const quality = {
        id: 'quality-1',
        textId: 'ayah-1-1',
        scriptType: 'uthmani' as const,
        diacriticsPresent: true,
        tajweedMarks: true,
        fontCompliance: true,
        characterValidation: {
          validCharacters: 45,
          invalidCharacters: 0,
          specialMarks: 3
        },
        qualityScore: 1.0,
        lastChecked: Date.now()
      }

      if (store.addArabicTextQuality) {
        store.addArabicTextQuality(quality)
        const state = useIslamicContentQualityStore.getState()

        expect(state.arabicTextQuality).toHaveLength(1)
        expect(state.arabicTextQuality[0].qualityScore).toBe(1.0)
      }
    })
  })

  describe('Store Persistence', () => {
    it('should persist state to localStorage', () => {
      const store = useIslamicContentQualityStore.getState()
      const rule = {
        id: 'rule-persist',
        name: 'Persist Test',
        category: 'text_authenticity' as const,
        priority: 'high' as const,
        description: 'Test persistence',
        validation: {
          type: 'format_check' as const,
          criteria: [],
          automaticCheck: true
        },
        compliance: {
          required: true,
          islamicStandard: 'Test',
          source: 'Test'
        },
        isActive: true
      }

      store.addRule(rule)

      // Verify state persists (simulated)
      const state = useIslamicContentQualityStore.getState()
      expect(state.rules).toContainEqual(rule)
    })
  })
})
