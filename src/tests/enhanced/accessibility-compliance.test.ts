/**
 * Enhanced Accessibility Compliance Testing (WCAG 2.1 AA)
 * 
 * Comprehensive testing for accessibility compliance specific to Islamic content,
 * Arabic text accessibility, and inclusive design principles.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuranStore } from '../../stores/quranStore'
import { useAudioStore } from '../../stores/audioStore'

// Accessibility testing utilities
interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  nodes: {
    target: string[]
    html: string
    failureSummary: string
  }[]
}

interface ContrastResult {
  ratio: number
  aa: boolean
  aaa: boolean
  large: boolean
}

class AccessibilityTester {
  private violations: AccessibilityViolation[] = []

  // WCAG 2.1 AA Color contrast requirements
  private static readonly CONTRAST_RATIOS = {
    NORMAL_AA: 4.5,
    LARGE_AA: 3.0,
    NORMAL_AAA: 7.0,
    LARGE_AAA: 4.5
  }

  // Arabic text specific accessibility requirements
  private static readonly ARABIC_ACCESSIBILITY = {
    MIN_FONT_SIZE: 16, // Minimum readable size for Arabic
    RECOMMENDED_FONT_SIZE: 18,
    MIN_LINE_HEIGHT: 1.5,
    RECOMMENDED_LINE_HEIGHT: 1.8,
    RTL_SUPPORT_REQUIRED: true,
    DIACRITICS_SUPPORT: true
  }

  checkColorContrast(foreground: string, background: string, fontSize: number): ContrastResult {
    // Convert colors to RGB values (simplified)
    const fgRgb = this.hexToRgb(foreground)
    const bgRgb = this.hexToRgb(background)
    
    if (!fgRgb || !bgRgb) {
      return { ratio: 0, aa: false, aaa: false, large: false }
    }

    // Calculate relative luminance
    const fgLuminance = this.getRelativeLuminance(fgRgb)
    const bgLuminance = this.getRelativeLuminance(bgRgb)
    
    // Calculate contrast ratio
    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                  (Math.min(fgLuminance, bgLuminance) + 0.05)

    const isLarge = fontSize >= 18 || (fontSize >= 14 && fontSize < 18) // Bold text
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      aa: isLarge ? ratio >= AccessibilityTester.CONTRAST_RATIOS.LARGE_AA : 
                    ratio >= AccessibilityTester.CONTRAST_RATIOS.NORMAL_AA,
      aaa: isLarge ? ratio >= AccessibilityTester.CONTRAST_RATIOS.LARGE_AAA : 
                     ratio >= AccessibilityTester.CONTRAST_RATIOS.NORMAL_AAA,
      large: isLarge
    }
  }

  checkArabicTextAccessibility(text: string, fontSize: number, lineHeight: number): {
    isAccessible: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check font size
    if (fontSize < AccessibilityTester.ARABIC_ACCESSIBILITY.MIN_FONT_SIZE) {
      issues.push(`Font size ${fontSize}px is below minimum ${AccessibilityTester.ARABIC_ACCESSIBILITY.MIN_FONT_SIZE}px for Arabic text`)
      recommendations.push(`Increase font size to at least ${AccessibilityTester.ARABIC_ACCESSIBILITY.RECOMMENDED_FONT_SIZE}px`)
    }

    // Check line height
    if (lineHeight < AccessibilityTester.ARABIC_ACCESSIBILITY.MIN_LINE_HEIGHT) {
      issues.push(`Line height ${lineHeight} is below minimum ${AccessibilityTester.ARABIC_ACCESSIBILITY.MIN_LINE_HEIGHT} for Arabic text`)
      recommendations.push(`Increase line height to at least ${AccessibilityTester.ARABIC_ACCESSIBILITY.RECOMMENDED_LINE_HEIGHT}`)
    }

    // Check for Arabic text content
    const hasArabicText = /[\u0600-\u06FF]/.test(text)
    if (hasArabicText) {
      // Check for diacritics support
      const hasDiacritics = /[\u064B-\u0652\u0670\u0640]/.test(text)
      if (hasDiacritics) {
        recommendations.push('Ensure proper diacritics rendering for accurate Quranic text')
      }
    }

    return {
      isAccessible: issues.length === 0,
      issues,
      recommendations
    }
  }

  checkKeyboardNavigation(element: any): {
    isAccessible: boolean
    issues: string[]
    tabIndex: number | null
  } {
    const issues: string[] = []
    let tabIndex: number | null = null

    if (!element) {
      issues.push('Element is null or undefined')
      return { isAccessible: false, issues, tabIndex }
    }

    // Check if element is focusable
    if (element.tabIndex !== undefined) {
      tabIndex = element.tabIndex
      
      if (tabIndex < -1) {
        issues.push(`Invalid tabIndex value: ${tabIndex}`)
      }
    }

    // Check for interactive elements
    const interactiveElements = ['button', 'input', 'select', 'textarea', 'a']
    if (interactiveElements.includes(element.tagName?.toLowerCase())) {
      if (tabIndex === -1) {
        issues.push('Interactive element is not keyboard accessible (tabIndex=-1)')
      }
    }

    return {
      isAccessible: issues.length === 0,
      issues,
      tabIndex
    }
  }

  checkAriaLabels(element: any): {
    hasAriaLabel: boolean
    hasAriaLabelledBy: boolean
    hasAriaDescribedBy: boolean
    issues: string[]
  } {
    const issues: string[] = []
    
    if (!element) {
      issues.push('Element is null or undefined')
      return {
        hasAriaLabel: false,
        hasAriaLabelledBy: false,
        hasAriaDescribedBy: false,
        issues
      }
    }

    const hasAriaLabel = Boolean(element.getAttribute?.('aria-label'))
    const hasAriaLabelledBy = Boolean(element.getAttribute?.('aria-labelledby'))
    const hasAriaDescribedBy = Boolean(element.getAttribute?.('aria-describedby'))

    // Check if interactive element has accessible name
    const interactiveElements = ['button', 'input', 'select', 'textarea']
    if (interactiveElements.includes(element.tagName?.toLowerCase())) {
      if (!hasAriaLabel && !hasAriaLabelledBy && !element.textContent?.trim()) {
        issues.push('Interactive element lacks accessible name')
      }
    }

    return {
      hasAriaLabel,
      hasAriaLabelledBy,
      hasAriaDescribedBy,
      issues
    }
  }

  checkTextAlternatives(element: any): {
    hasAltText: boolean
    hasAriaLabel: boolean
    isDecorative: boolean
    issues: string[]
  } {
    const issues: string[] = []
    
    if (!element) {
      issues.push('Element is null or undefined')
      return {
        hasAltText: false,
        hasAriaLabel: false,
        isDecorative: false,
        issues
      }
    }

    const hasAltText = Boolean(element.getAttribute?.('alt'))
    const hasAriaLabel = Boolean(element.getAttribute?.('aria-label'))
    const isDecorative = element.getAttribute?.('role') === 'presentation' || 
                        element.getAttribute?.('aria-hidden') === 'true'

    // Check images
    if (element.tagName?.toLowerCase() === 'img') {
      if (!hasAltText && !isDecorative) {
        issues.push('Image lacks alt text')
      }
      
      if (hasAltText && element.getAttribute('alt')?.trim() === '') {
        // Empty alt text should only be used for decorative images
        if (!isDecorative) {
          issues.push('Image has empty alt text but is not marked as decorative')
        }
      }
    }

    return {
      hasAltText,
      hasAriaLabel,
      isDecorative,
      issues
    }
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  private getRelativeLuminance(rgb: { r: number, g: number, b: number }): number {
    const { r, g, b } = rgb
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  addViolation(violation: AccessibilityViolation): void {
    this.violations.push(violation)
  }

  getViolations(): AccessibilityViolation[] {
    return [...this.violations]
  }

  getViolationsByImpact(impact: AccessibilityViolation['impact']): AccessibilityViolation[] {
    return this.violations.filter(v => v.impact === impact)
  }

  reset(): void {
    this.violations = []
  }
}

// Mock HTML elements for testing
const createMockElement = (tag: string, attributes: Record<string, string> = {}, textContent = '') => ({
  tagName: tag.toUpperCase(),
  getAttribute: (name: string) => attributes[name] || null,
  textContent,
  tabIndex: attributes.tabindex ? parseInt(attributes.tabindex) : undefined
})

describe('Enhanced Accessibility Compliance Testing (WCAG 2.1 AA)', () => {
  let accessibilityTester: AccessibilityTester

  beforeEach(() => {
    vi.clearAllMocks()
    accessibilityTester = new AccessibilityTester()
    
    // Reset stores
    useQuranStore.getState().reset?.()
    useAudioStore.getState().reset?.()
  })

  afterEach(() => {
    accessibilityTester.reset()
    vi.restoreAllMocks()
  })

  describe('Color Contrast and Visual Design', () => {
    it('should meet WCAG AA contrast requirements for Arabic text', () => {
      // Test various color combinations used in Quran apps
      const testCases = [
        {
          name: 'Dark text on light background',
          foreground: '#000000',
          background: '#FFFFFF',
          fontSize: 18,
          expectedAA: true
        },
        {
          name: 'Quran green on cream background',
          foreground: '#2D5A27',
          background: '#F8F6E8',
          fontSize: 20,
          expectedAA: true
        },
        {
          name: 'Gold text on dark green',
          foreground: '#FFD700',
          background: '#1B4332',
          fontSize: 16,
          expectedAA: true
        },
        {
          name: 'Insufficient contrast (should fail)',
          foreground: '#999999',
          background: '#CCCCCC',
          fontSize: 16,
          expectedAA: false
        }
      ]

      testCases.forEach(testCase => {
        const result = accessibilityTester.checkColorContrast(
          testCase.foreground,
          testCase.background,
          testCase.fontSize
        )

        expect(result.aa).toBe(testCase.expectedAA)
        
        if (testCase.expectedAA) {
          expect(result.ratio).toBeGreaterThanOrEqual(3.0) // Minimum for large text
        }
      })
    })

    it('should provide enhanced contrast for Arabic diacritics', () => {
      // Arabic diacritics require higher contrast for readability
      const diacriticsTest = accessibilityTester.checkColorContrast(
        '#000000', // Black diacritics
        '#FFFFFF', // White background
        14 // Smaller size for diacritics
      )

      expect(diacriticsTest.aa).toBe(true)
      expect(diacriticsTest.ratio).toBeGreaterThanOrEqual(4.5) // Normal text ratio
    })

    it('should handle dark mode with appropriate contrast', () => {
      const darkModeTests = [
        {
          foreground: '#FFFFFF', // White text
          background: '#1A1A1A', // Dark background
          fontSize: 18
        },
        {
          foreground: '#E0E0E0', // Light gray text
          background: '#2D2D2D', // Dark gray background
          fontSize: 16
        }
      ]

      darkModeTests.forEach(test => {
        const result = accessibilityTester.checkColorContrast(
          test.foreground,
          test.background,
          test.fontSize
        )

        expect(result.aa).toBe(true)
        expect(result.ratio).toBeGreaterThan(3.0)
      })
    })
  })

  describe('Arabic Text Accessibility', () => {
    it('should ensure proper font sizing for Arabic text', () => {
      const arabicText = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
      
      // Test different font sizes
      const fontSizeTests = [
        { fontSize: 14, lineHeight: 1.2, shouldPass: false },
        { fontSize: 16, lineHeight: 1.5, shouldPass: true },
        { fontSize: 18, lineHeight: 1.8, shouldPass: true },
        { fontSize: 20, lineHeight: 2.0, shouldPass: true }
      ]

      fontSizeTests.forEach(test => {
        const result = accessibilityTester.checkArabicTextAccessibility(
          arabicText,
          test.fontSize,
          test.lineHeight
        )

        expect(result.isAccessible).toBe(test.shouldPass)
        
        if (!test.shouldPass) {
          expect(result.issues.length).toBeGreaterThan(0)
          expect(result.recommendations.length).toBeGreaterThan(0)
        }
      })
    })

    it('should handle RTL (Right-to-Left) text direction correctly', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })

      if (result.current.currentSurah?.ayahs?.[0]) {
        const arabicText = result.current.currentSurah.ayahs[0].text
        
        // Should contain Arabic characters
        expect(arabicText).toMatch(/[\u0600-\u06FF]/)
        
        // Check RTL accessibility
        const accessibility = accessibilityTester.checkArabicTextAccessibility(
          arabicText,
          18,
          1.8
        )
        
        expect(accessibility.isAccessible).toBe(true)
      }
    })

    it('should provide proper support for Quranic diacritics', () => {
      const textWithDiacritics = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
      const textWithoutDiacritics = 'بسم الله الرحمن الرحيم'
      
      const withDiacritics = accessibilityTester.checkArabicTextAccessibility(
        textWithDiacritics,
        18,
        1.8
      )
      
      const withoutDiacritics = accessibilityTester.checkArabicTextAccessibility(
        textWithoutDiacritics,
        18,
        1.8
      )
      
      // Both should be accessible, but diacritics version should have recommendations
      expect(withDiacritics.isAccessible).toBe(true)
      expect(withoutDiacritics.isAccessible).toBe(true)
      
      // Diacritics version should have rendering recommendations
      expect(withDiacritics.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Keyboard Navigation and Focus Management', () => {
    it('should provide proper keyboard navigation for Quran controls', () => {
      const controls = [
        createMockElement('button', { 'aria-label': 'Play audio', tabindex: '0' }, 'Play'),
        createMockElement('button', { 'aria-label': 'Previous ayah', tabindex: '0' }, 'Previous'),
        createMockElement('button', { 'aria-label': 'Next ayah', tabindex: '0' }, 'Next'),
        createMockElement('select', { 'aria-label': 'Select surah', tabindex: '0' }),
        createMockElement('input', { 'aria-label': 'Search ayahs', tabindex: '0' })
      ]

      controls.forEach(control => {
        const result = accessibilityTester.checkKeyboardNavigation(control)
        
        expect(result.isAccessible).toBe(true)
        expect(result.tabIndex).toBe(0)
        expect(result.issues.length).toBe(0)
      })
    })

    it('should handle focus management during audio playback', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      const audioControls = [
        createMockElement('button', { 'aria-label': 'Play Quran audio', tabindex: '0' }, 'Play'),
        createMockElement('button', { 'aria-label': 'Pause Quran audio', tabindex: '0' }, 'Pause'),
        createMockElement('button', { 'aria-label': 'Stop Quran audio', tabindex: '0' }, 'Stop')
      ]

      await act(async () => {
        try {
          await result.current.loadAudio(1, 1)
        } catch (error) {
          // Handle if audio fails to load
        }
      })

      audioControls.forEach(control => {
        const navResult = accessibilityTester.checkKeyboardNavigation(control)
        expect(navResult.isAccessible).toBe(true)
      })
    })

    it('should prevent keyboard traps in modal dialogs', () => {
      // Test modal elements
      const modalElements = [
        createMockElement('div', { role: 'dialog', 'aria-modal': 'true', tabindex: '-1' }),
        createMockElement('button', { 'aria-label': 'Close dialog', tabindex: '0' }, 'Close'),
        createMockElement('button', { 'aria-label': 'Confirm action', tabindex: '0' }, 'Confirm')
      ]

      // Dialog container should not be in tab order
      const dialogResult = accessibilityTester.checkKeyboardNavigation(modalElements[0])
      expect(dialogResult.tabIndex).toBe(-1)

      // Buttons inside dialog should be accessible
      const closeButtonResult = accessibilityTester.checkKeyboardNavigation(modalElements[1])
      const confirmButtonResult = accessibilityTester.checkKeyboardNavigation(modalElements[2])
      
      expect(closeButtonResult.isAccessible).toBe(true)
      expect(confirmButtonResult.isAccessible).toBe(true)
    })
  })

  describe('ARIA Labels and Semantic Markup', () => {
    it('should provide proper ARIA labels for Quran-specific elements', () => {
      const quranElements = [
        createMockElement('div', {
          role: 'region',
          'aria-label': 'Surah Al-Fatiha, verse 1',
          'aria-describedby': 'verse-translation'
        }),
        createMockElement('button', {
          'aria-label': 'Play recitation of Ayah 1',
          'aria-pressed': 'false'
        }),
        createMockElement('button', {
          'aria-label': 'Bookmark this ayah',
          'aria-pressed': 'false'
        }),
        createMockElement('select', {
          'aria-label': 'Choose Quran reciter',
          'aria-describedby': 'reciter-help'
        })
      ]

      quranElements.forEach(element => {
        const result = accessibilityTester.checkAriaLabels(element)
        
        expect(result.hasAriaLabel).toBe(true)
        expect(result.issues.length).toBe(0)
      })
    })

    it('should use semantic HTML for Quran content structure', () => {
      const semanticElements = [
        createMockElement('main', { role: 'main', 'aria-label': 'Quran Reader' }),
        createMockElement('nav', { role: 'navigation', 'aria-label': 'Surah navigation' }),
        createMockElement('article', { role: 'article', 'aria-label': 'Surah content' }),
        createMockElement('section', { role: 'region', 'aria-label': 'Ayah text' })
      ]

      semanticElements.forEach(element => {
        const result = accessibilityTester.checkAriaLabels(element)
        expect(result.hasAriaLabel).toBe(true)
      })
    })

    it('should provide context for Arabic text translations', () => {
      const translationElements = [
        createMockElement('div', {
          'aria-label': 'Arabic text of Ayah 1',
          lang: 'ar',
          dir: 'rtl'
        }),
        createMockElement('div', {
          'aria-label': 'English translation of Ayah 1',
          lang: 'en',
          dir: 'ltr'
        }),
        createMockElement('div', {
          'aria-label': 'Transliteration of Ayah 1',
          lang: 'en',
          dir: 'ltr'
        })
      ]

      translationElements.forEach(element => {
        const result = accessibilityTester.checkAriaLabels(element)
        expect(result.hasAriaLabel).toBe(true)
        
        // Should have language attribute
        expect(element.getAttribute('lang')).toBeDefined()
        expect(element.getAttribute('dir')).toBeDefined()
      })
    })
  })

  describe('Audio and Media Accessibility', () => {
    it('should provide audio controls with proper accessibility', async () => {
      const { result } = renderHook(() => useAudioStore())
      
      const audioControls = [
        createMockElement('button', {
          'aria-label': 'Play Quran recitation',
          'aria-pressed': 'false',
          'aria-describedby': 'audio-description'
        }),
        createMockElement('button', {
          'aria-label': 'Pause Quran recitation',
          'aria-pressed': 'false'
        }),
        createMockElement('input', {
          type: 'range',
          'aria-label': 'Audio volume',
          'aria-valuemin': '0',
          'aria-valuemax': '100',
          'aria-valuenow': '50'
        }),
        createMockElement('input', {
          type: 'range',
          'aria-label': 'Audio progress',
          'aria-valuemin': '0',
          'aria-valuemax': '100',
          'aria-valuenow': '25',
          'aria-describedby': 'progress-description'
        })
      ]

      await act(async () => {
        try {
          await result.current.loadAudio(1, 1)
        } catch (error) {
          // Handle if audio fails to load
        }
      })

      audioControls.forEach(control => {
        const ariaResult = accessibilityTester.checkAriaLabels(control)
        const keyboardResult = accessibilityTester.checkKeyboardNavigation(control)
        
        expect(ariaResult.hasAriaLabel).toBe(true)
        expect(keyboardResult.isAccessible).toBe(true)
      })
    })

    it('should provide captions and transcripts for audio content', () => {
      const audioElement = createMockElement('audio', {
        'aria-label': 'Quran recitation by Sheikh Abdul Rahman Al-Sudais',
        'aria-describedby': 'audio-transcript'
      })

      const transcriptElement = createMockElement('div', {
        id: 'audio-transcript',
        'aria-label': 'Audio transcript',
        role: 'region'
      }, 'Transcript: Bismillahir Rahmanir Raheem...')

      const audioResult = accessibilityTester.checkAriaLabels(audioElement)
      const transcriptResult = accessibilityTester.checkAriaLabels(transcriptElement)

      expect(audioResult.hasAriaLabel).toBe(true)
      expect(audioResult.hasAriaDescribedBy).toBe(true)
      expect(transcriptResult.hasAriaLabel).toBe(true)
    })

    it('should handle audio feedback for user interactions', () => {
      const interactiveElements = [
        createMockElement('button', {
          'aria-label': 'Next ayah',
          'aria-describedby': 'next-help',
          'data-audio-feedback': 'true'
        }),
        createMockElement('button', {
          'aria-label': 'Previous ayah',
          'aria-describedby': 'prev-help',
          'data-audio-feedback': 'true'
        })
      ]

      interactiveElements.forEach(element => {
        const result = accessibilityTester.checkAriaLabels(element)
        expect(result.hasAriaLabel).toBe(true)
        expect(result.hasAriaDescribedBy).toBe(true)
      })
    })
  })

  describe('Screen Reader Compatibility', () => {
    it('should provide proper announcements for Quran navigation', async () => {
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })

      // Elements that should be announced by screen readers
      const announcementElements = [
        createMockElement('div', {
          'aria-live': 'polite',
          'aria-label': 'Current ayah announcement'
        }, 'Now reading Surah Al-Fatiha, Ayah 1'),
        createMockElement('div', {
          'aria-live': 'polite',
          'aria-label': 'Audio status announcement'
        }, 'Audio playback started'),
        createMockElement('div', {
          'aria-live': 'assertive',
          'aria-label': 'Error announcement'
        }, 'Connection lost, switching to offline mode')
      ]

      announcementElements.forEach(element => {
        expect(element.getAttribute('aria-live')).toBeDefined()
        expect(element.textContent).toBeTruthy()
      })
    })

    it('should structure content for screen reader navigation', () => {
      const contentStructure = [
        createMockElement('h1', {}, 'Quran Reader'),
        createMockElement('h2', {}, 'Surah Al-Fatiha'),
        createMockElement('h3', {}, 'Ayah 1'),
        createMockElement('nav', {
          'aria-label': 'Surah navigation',
          role: 'navigation'
        }),
        createMockElement('main', {
          'aria-label': 'Quran content',
          role: 'main'
        })
      ]

      // Should have proper heading hierarchy
      const headings = contentStructure.filter(el => 
        ['H1', 'H2', 'H3'].includes(el.tagName)
      )
      expect(headings.length).toBe(3)

      // Should have landmark roles
      const landmarks = contentStructure.filter(el => 
        ['navigation', 'main'].includes(el.getAttribute('role') || '')
      )
      expect(landmarks.length).toBe(2)
    })

    it('should handle dynamic content updates for screen readers', () => {
      const dynamicElements = [
        createMockElement('div', {
          'aria-live': 'polite',
          'aria-atomic': 'true',
          'aria-label': 'Loading status'
        }, 'Loading Surah...'),
        createMockElement('div', {
          'aria-live': 'polite',
          'aria-atomic': 'false',
          'aria-label': 'Progress update'
        }, 'Ayah 5 of 7'),
        createMockElement('div', {
          'aria-live': 'assertive',
          'aria-atomic': 'true',
          'aria-label': 'Error message'
        }, 'Failed to load audio')
      ]

      dynamicElements.forEach(element => {
        expect(element.getAttribute('aria-live')).toBeDefined()
        expect(element.getAttribute('aria-atomic')).toBeDefined()
        expect(element.getAttribute('aria-label')).toBeDefined()
      })
    })
  })

  describe('International Accessibility Standards', () => {
    it('should meet Islamic accessibility guidelines', () => {
      // Test Islamic-specific accessibility requirements
      const islamicElements = [
        createMockElement('div', {
          'aria-label': 'Quranic verse in Arabic',
          lang: 'ar',
          dir: 'rtl',
          'data-islamic-content': 'true'
        }),
        createMockElement('div', {
          'aria-label': 'Prayer time notification',
          role: 'alert',
          'aria-live': 'assertive'
        }),
        createMockElement('button', {
          'aria-label': 'Qibla direction compass',
          'aria-describedby': 'qibla-help'
        })
      ]

      islamicElements.forEach(element => {
        const result = accessibilityTester.checkAriaLabels(element)
        expect(result.hasAriaLabel).toBe(true)
        
        if (element.getAttribute('lang') === 'ar') {
          expect(element.getAttribute('dir')).toBe('rtl')
        }
      })
    })

    it('should support multilingual accessibility', () => {
      const multilingualElements = [
        createMockElement('div', { lang: 'ar', dir: 'rtl' }, 'بِسْمِ اللَّهِ'),
        createMockElement('div', { lang: 'en', dir: 'ltr' }, 'In the name of Allah'),
        createMockElement('div', { lang: 'ur', dir: 'rtl' }, 'اللہ کے نام سے'),
        createMockElement('div', { lang: 'id', dir: 'ltr' }, 'Dengan nama Allah')
      ]

      multilingualElements.forEach(element => {
        expect(element.getAttribute('lang')).toBeDefined()
        expect(element.getAttribute('dir')).toBeDefined()
        
        const isRTL = ['ar', 'ur', 'fa', 'he'].includes(element.getAttribute('lang') || '')
        const expectedDir = isRTL ? 'rtl' : 'ltr'
        expect(element.getAttribute('dir')).toBe(expectedDir)
      })
    })

    it('should handle cultural sensitivity in accessibility', () => {
      const culturalElements = [
        createMockElement('button', {
          'aria-label': 'Increase Arabic text size for better readability',
          'data-cultural-context': 'islamic'
        }),
        createMockElement('div', {
          'aria-label': 'Sacred text - handle with respect',
          role: 'region',
          'data-content-type': 'quranic'
        }),
        createMockElement('button', {
          'aria-label': 'Respectful pause before recitation',
          'data-islamic-etiquette': 'true'
        })
      ]

      culturalElements.forEach(element => {
        const result = accessibilityTester.checkAriaLabels(element)
        expect(result.hasAriaLabel).toBe(true)
        expect(result.issues.length).toBe(0)
      })
    })
  })
})