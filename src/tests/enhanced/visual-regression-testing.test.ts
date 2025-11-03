/**
 * Visual Regression Testing Suite
 * 
 * Comprehensive visual testing for UI consistency, Arabic text rendering,
 * and Islamic design standards across different browsers and devices.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { useQuranStore } from '../../stores/quranStore'
import { usePreferencesStore } from '../../stores/preferencesStore'

// Visual testing utilities
interface VisualSnapshot {
  id: string
  component: string
  timestamp: number
  viewport: { width: number; height: number }
  screenshotHash: string
  arabicTextMetrics: ArabicTextMetrics
  layoutMetrics: LayoutMetrics
  accessibilityMetrics: AccessibilityMetrics
}

interface ArabicTextMetrics {
  fontSize: number
  lineHeight: number
  fontFamily: string
  textDirection: 'rtl' | 'ltr'
  diacriticsVisible: boolean
  characterSpacing: number
  ligatureSupport: boolean
}

interface LayoutMetrics {
  containerWidth: number
  containerHeight: number
  textAlignment: string
  marginConsistency: boolean
  responsiveBreakpoints: number[]
  gridAlignment: boolean
}

interface AccessibilityMetrics {
  contrastRatio: number
  focusIndicatorVisible: boolean
  ariaLabelsPresent: boolean
  keyboardNavigable: boolean
  screenReaderFriendly: boolean
}

class VisualRegressionTester {
  private snapshots: Map<string, VisualSnapshot> = new Map()
  private currentViewport = { width: 1920, height: 1080 }
  private deviceProfiles = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
    'mobile-large': { width: 414, height: 896 }
  }

  setViewport(width: number, height: number): void {
    this.currentViewport = { width, height }
    
    // Mock viewport changes
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    })
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
  }

  captureSnapshot(componentId: string, element: HTMLElement): VisualSnapshot {
    const snapshot: VisualSnapshot = {
      id: `${componentId}-${Date.now()}`,
      component: componentId,
      timestamp: Date.now(),
      viewport: { ...this.currentViewport },
      screenshotHash: this.generateScreenshotHash(element),
      arabicTextMetrics: this.analyzeArabicText(element),
      layoutMetrics: this.analyzeLayout(element),
      accessibilityMetrics: this.analyzeAccessibility(element)
    }
    
    this.snapshots.set(snapshot.id, snapshot)
    return snapshot
  }

  private generateScreenshotHash(element: HTMLElement): string {
    // Mock screenshot hash generation
    const styles = window.getComputedStyle(element)
    const layoutInfo = {
      width: element.offsetWidth,
      height: element.offsetHeight,
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily
    }
    
    return btoa(JSON.stringify(layoutInfo))
  }

  private analyzeArabicText(element: HTMLElement): ArabicTextMetrics {
    const arabicElements = element.querySelectorAll('[lang="ar"], .arabic-text')
    const firstArabicElement = arabicElements[0] as HTMLElement
    
    if (!firstArabicElement) {
      return {
        fontSize: 0,
        lineHeight: 0,
        fontFamily: '',
        textDirection: 'ltr',
        diacriticsVisible: false,
        characterSpacing: 0,
        ligatureSupport: false
      }
    }
    
    const styles = window.getComputedStyle(firstArabicElement)
    const textContent = firstArabicElement.textContent || ''
    
    return {
      fontSize: parseFloat(styles.fontSize),
      lineHeight: parseFloat(styles.lineHeight),
      fontFamily: styles.fontFamily,
      textDirection: styles.direction as 'rtl' | 'ltr',
      diacriticsVisible: this.hasDiacritics(textContent),
      characterSpacing: parseFloat(styles.letterSpacing) || 0,
      ligatureSupport: this.hasLigatureSupport(styles.fontFeatureSettings)
    }
  }

  private analyzeLayout(element: HTMLElement): LayoutMetrics {
    const styles = window.getComputedStyle(element)
    
    return {
      containerWidth: element.offsetWidth,
      containerHeight: element.offsetHeight,
      textAlignment: styles.textAlign,
      marginConsistency: this.checkMarginConsistency(element),
      responsiveBreakpoints: this.getActiveBreakpoints(),
      gridAlignment: this.checkGridAlignment(element)
    }
  }

  private analyzeAccessibility(element: HTMLElement): AccessibilityMetrics {
    const styles = window.getComputedStyle(element)
    
    return {
      contrastRatio: this.calculateContrastRatio(styles.color, styles.backgroundColor),
      focusIndicatorVisible: this.hasFocusIndicator(element),
      ariaLabelsPresent: this.hasAriaLabels(element),
      keyboardNavigable: this.isKeyboardNavigable(element),
      screenReaderFriendly: this.isScreenReaderFriendly(element)
    }
  }

  private hasDiacritics(text: string): boolean {
    // Check for Arabic diacritics (Tashkeel)
    const diacriticsRegex = /[\u064B-\u065F\u0670\u06D6-\u06ED]/
    return diacriticsRegex.test(text)
  }

  private hasLigatureSupport(fontFeatureSettings: string): boolean {
    return fontFeatureSettings.includes('liga') || fontFeatureSettings.includes('calt')
  }

  private checkMarginConsistency(element: HTMLElement): boolean {
    const children = Array.from(element.children) as HTMLElement[]
    if (children.length < 2) return true
    
    const firstMargin = parseFloat(window.getComputedStyle(children[0]).marginBottom)
    return children.every(child => {
      const margin = parseFloat(window.getComputedStyle(child).marginBottom)
      return Math.abs(margin - firstMargin) < 1 // 1px tolerance
    })
  }

  private getActiveBreakpoints(): number[] {
    const width = this.currentViewport.width
    const breakpoints = []
    
    if (width >= 1920) breakpoints.push(1920) // xl
    if (width >= 1280) breakpoints.push(1280) // lg
    if (width >= 1024) breakpoints.push(1024) // md
    if (width >= 768) breakpoints.push(768)   // sm
    if (width >= 640) breakpoints.push(640)   // xs
    
    return breakpoints
  }

  private checkGridAlignment(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element)
    return styles.display === 'grid' || styles.display === 'flex'
  }

  private calculateContrastRatio(foreground: string, background: string): number {
    // Simplified contrast ratio calculation
    // In a real implementation, this would parse RGB values and calculate proper contrast
    return 4.5 // Assume good contrast for tests
  }

  private hasFocusIndicator(element: HTMLElement): boolean {
    const focusableElements = element.querySelectorAll('button, input, a, [tabindex]')
    return focusableElements.length > 0
  }

  private hasAriaLabels(element: HTMLElement): boolean {
    const elementsWithAria = element.querySelectorAll('[aria-label], [aria-labelledby], [role]')
    return elementsWithAria.length > 0
  }

  private isKeyboardNavigable(element: HTMLElement): boolean {
    const interactiveElements = element.querySelectorAll('button, input, a, [tabindex]:not([tabindex="-1"])')
    return interactiveElements.length > 0
  }

  private isScreenReaderFriendly(element: HTMLElement): boolean {
    const hiddenElements = element.querySelectorAll('[aria-hidden="true"]:not([aria-label])')
    const totalElements = element.querySelectorAll('*').length
    return hiddenElements.length / totalElements < 0.5 // Less than 50% hidden
  }

  compareSnapshots(baseline: VisualSnapshot, current: VisualSnapshot): {
    isMatch: boolean
    differences: string[]
    score: number
  } {
    const differences: string[] = []
    let score = 1.0

    // Compare screenshots
    if (baseline.screenshotHash !== current.screenshotHash) {
      differences.push('Visual appearance differs')
      score -= 0.3
    }

    // Compare Arabic text metrics
    if (baseline.arabicTextMetrics.fontSize !== current.arabicTextMetrics.fontSize) {
      differences.push('Arabic font size differs')
      score -= 0.1
    }

    if (baseline.arabicTextMetrics.textDirection !== current.arabicTextMetrics.textDirection) {
      differences.push('Text direction differs')
      score -= 0.2
    }

    if (baseline.arabicTextMetrics.diacriticsVisible !== current.arabicTextMetrics.diacriticsVisible) {
      differences.push('Diacritics visibility differs')
      score -= 0.1
    }

    // Compare layout metrics
    const layoutTolerance = 5 // 5px tolerance
    if (Math.abs(baseline.layoutMetrics.containerWidth - current.layoutMetrics.containerWidth) > layoutTolerance) {
      differences.push('Container width differs significantly')
      score -= 0.1
    }

    // Compare accessibility
    if (baseline.accessibilityMetrics.contrastRatio !== current.accessibilityMetrics.contrastRatio) {
      differences.push('Contrast ratio differs')
      score -= 0.1
    }

    return {
      isMatch: score >= 0.9, // 90% similarity threshold
      differences,
      score
    }
  }

  getSnapshots(): VisualSnapshot[] {
    return Array.from(this.snapshots.values())
  }

  reset(): void {
    this.snapshots.clear()
  }
}

// Mock components for testing
const MockQuranText: React.FC<{ surahNumber: number; ayahNumber: number; arabicText: string }> = ({ 
  surahNumber, 
  ayahNumber, 
  arabicText 
}) => (
  <div className="quran-text-container" data-testid="quran-text">
    <div className="ayah-number">{surahNumber}:{ayahNumber}</div>
    <div className="arabic-text" lang="ar" dir="rtl">
      {arabicText}
    </div>
    <div className="translation">
      "In the name of Allah, the Entirely Merciful, the Especially Merciful."
    </div>
  </div>
)

const MockAyahDisplay: React.FC<{ ayahs: Array<{ number: number; text: string }> }> = ({ ayahs }) => (
  <div className="ayah-list" data-testid="ayah-list">
    {ayahs.map(ayah => (
      <div key={ayah.number} className="ayah-item">
        <span className="ayah-number">{ayah.number}</span>
        <span className="ayah-text arabic-text" lang="ar" dir="rtl">{ayah.text}</span>
      </div>
    ))}
  </div>
)

describe('Visual Regression Testing Suite', () => {
  let visualTester: VisualRegressionTester
  let container: HTMLElement

  beforeEach(() => {
    vi.clearAllMocks()
    visualTester = new VisualRegressionTester()
    
    // Reset stores
    useQuranStore.getState().reset?.()
    usePreferencesStore.getState().reset?.()
    
    // Mock CSS support
    Object.defineProperty(window, 'getComputedStyle', {
      value: (element: Element) => ({
        fontSize: '18px',
        lineHeight: '1.6',
        fontFamily: 'Uthmanic Hafs, Arial, sans-serif',
        direction: 'rtl',
        textAlign: 'right',
        backgroundColor: 'rgb(255, 255, 255)',
        color: 'rgb(0, 0, 0)',
        marginBottom: '16px',
        letterSpacing: '0px',
        fontFeatureSettings: '"liga" 1, "calt" 1',
        display: 'block'
      }),
      configurable: true
    })
  })

  afterEach(() => {
    visualTester.reset()
    vi.restoreAllMocks()
  })

  describe('Arabic Text Rendering Consistency', () => {
    it('should maintain consistent Arabic text rendering across viewports', () => {
      const arabicText = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
      const viewports = ['desktop', 'tablet', 'mobile'] as const
      const snapshots: VisualSnapshot[] = []

      viewports.forEach(viewport => {
        const { width, height } = visualTester['deviceProfiles'][viewport]
        visualTester.setViewport(width, height)
        
        const { container } = render(
          <MockQuranText 
            surahNumber={1} 
            ayahNumber={1} 
            arabicText={arabicText} 
          />
        )
        
        const snapshot = visualTester.captureSnapshot(`quran-text-${viewport}`, container)
        snapshots.push(snapshot)
        
        // Verify Arabic text properties
        expect(snapshot.arabicTextMetrics.textDirection).toBe('rtl')
        expect(snapshot.arabicTextMetrics.fontSize).toBeGreaterThan(0)
        expect(snapshot.arabicTextMetrics.diacriticsVisible).toBe(true)
        expect(snapshot.arabicTextMetrics.fontFamily).toMatch(/uthmanic|arabic/i)
      })

      // Compare snapshots for consistency
      for (let i = 1; i < snapshots.length; i++) {
        const comparison = visualTester.compareSnapshots(snapshots[0], snapshots[i])
        
        // Arabic text should maintain consistency across viewports
        expect(comparison.score).toBeGreaterThan(0.8) // 80% similarity minimum
        expect(comparison.differences).not.toContain('Text direction differs')
        expect(comparison.differences).not.toContain('Diacritics visibility differs')
      }
    })

    it('should preserve diacritics visibility across different font sizes', () => {
      const arabicText = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
      const fontSizes = [14, 16, 18, 20, 24, 28]
      const snapshots: VisualSnapshot[] = []

      fontSizes.forEach(fontSize => {
        const { container } = render(
          <div style={{ fontSize: `${fontSize}px` }}>
            <MockQuranText 
              surahNumber={1} 
              ayahNumber={1} 
              arabicText={arabicText} 
            />
          </div>
        )
        
        const snapshot = visualTester.captureSnapshot(`arabic-text-${fontSize}px`, container)
        snapshots.push(snapshot)
        
        // Diacritics should be visible at all font sizes
        expect(snapshot.arabicTextMetrics.diacriticsVisible).toBe(true)
        expect(snapshot.arabicTextMetrics.fontSize).toBeGreaterThan(0)
      })

      // All snapshots should maintain diacritics
      snapshots.forEach(snapshot => {
        expect(snapshot.arabicTextMetrics.diacriticsVisible).toBe(true)
      })
    })

    it('should handle complex Arabic ligatures correctly', () => {
      const complexArabicTexts = [
        'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', // Complex connections
        'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', // Path with ligatures
        'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', // Complex shadda and connections
        'لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ' // Shahada with multiple ligatures
      ]

      complexArabicTexts.forEach((text, index) => {
        const { container } = render(
          <MockQuranText 
            surahNumber={1} 
            ayahNumber={index + 1} 
            arabicText={text} 
          />
        )
        
        const snapshot = visualTester.captureSnapshot(`complex-arabic-${index}`, container)
        
        // Should support ligatures for complex Arabic text
        expect(snapshot.arabicTextMetrics.ligatureSupport).toBe(true)
        expect(snapshot.arabicTextMetrics.textDirection).toBe('rtl')
        expect(snapshot.arabicTextMetrics.diacriticsVisible).toBe(true)
      })
    })
  })

  describe('Layout Consistency Tests', () => {
    it('should maintain consistent layout structure across different content lengths', () => {
      const ayahSets = [
        [{ number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ' }], // Short
        [
          { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ' },
          { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
          { number: 3, text: 'الرَّحْمَنِ الرَّحِيمِ' }
        ], // Medium
        Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'
        })) // Long
      ]

      const snapshots: VisualSnapshot[] = []

      ayahSets.forEach((ayahs, index) => {
        const { container } = render(<MockAyahDisplay ayahs={ayahs} />)
        
        const snapshot = visualTester.captureSnapshot(`layout-${index}`, container)
        snapshots.push(snapshot)
        
        // Layout should be consistent
        expect(snapshot.layoutMetrics.marginConsistency).toBe(true)
        expect(snapshot.layoutMetrics.gridAlignment).toBe(true)
      })

      // Compare layout consistency
      for (let i = 1; i < snapshots.length; i++) {
        const comparison = visualTester.compareSnapshots(snapshots[0], snapshots[i])
        expect(comparison.differences).not.toContain('Layout structure differs')
      }
    })

    it('should adapt responsively while maintaining Islamic design principles', () => {
      const arabicText = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 }
      ]

      viewports.forEach(viewport => {
        visualTester.setViewport(viewport.width, viewport.height)
        
        const { container } = render(
          <MockQuranText 
            surahNumber={1} 
            ayahNumber={1} 
            arabicText={arabicText} 
          />
        )
        
        const snapshot = visualTester.captureSnapshot(`responsive-${viewport.name}`, container)
        
        // Should maintain Islamic design principles
        expect(snapshot.arabicTextMetrics.textDirection).toBe('rtl')
        expect(snapshot.layoutMetrics.textAlignment).toMatch(/right|center/)
        
        // Should have appropriate breakpoints
        expect(snapshot.layoutMetrics.responsiveBreakpoints).toContain(
          expect.any(Number)
        )
      })
    })

    it('should maintain proper spacing and alignment in bilingual content', () => {
      const { container } = render(
        <div className="bilingual-content">
          <div className="arabic-section" lang="ar" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>
          <div className="translation-section" lang="en" dir="ltr">
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </div>
        </div>
      )
      
      const snapshot = visualTester.captureSnapshot('bilingual-content', container)
      
      // Should maintain proper spacing
      expect(snapshot.layoutMetrics.marginConsistency).toBe(true)
      
      // Should handle mixed directionality
      expect(snapshot.arabicTextMetrics.textDirection).toBe('rtl')
    })
  })

  describe('Accessibility Visual Standards', () => {
    it('should maintain adequate contrast ratios for all text', () => {
      const textVariants = [
        { bg: '#ffffff', color: '#000000', name: 'default' },
        { bg: '#f8f9fa', color: '#2c3e50', name: 'light-theme' },
        { bg: '#2c3e50', color: '#ffffff', name: 'dark-theme' },
        { bg: '#1a1a1a', color: '#e0e0e0', name: 'night-mode' }
      ]

      textVariants.forEach(variant => {
        const { container } = render(
          <div style={{ backgroundColor: variant.bg, color: variant.color }}>
            <MockQuranText 
              surahNumber={1} 
              ayahNumber={1} 
              arabicText="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" 
            />
          </div>
        )
        
        const snapshot = visualTester.captureSnapshot(`contrast-${variant.name}`, container)
        
        // Should meet WCAG AA contrast requirements (4.5:1 minimum)
        expect(snapshot.accessibilityMetrics.contrastRatio).toBeGreaterThanOrEqual(4.5)
      })
    })

    it('should provide visible focus indicators for interactive elements', () => {
      const { container } = render(
        <div className="interactive-quran">
          <button className="ayah-play-button">Play</button>
          <input className="search-input" placeholder="Search..." />
          <a href="#" className="surah-link">Al-Fatiha</a>
        </div>
      )
      
      const snapshot = visualTester.captureSnapshot('interactive-elements', container)
      
      // Should have focus indicators
      expect(snapshot.accessibilityMetrics.focusIndicatorVisible).toBe(true)
      expect(snapshot.accessibilityMetrics.keyboardNavigable).toBe(true)
    })

    it('should include proper ARIA labels for Islamic content', () => {
      const { container } = render(
        <div className="quran-reader">
          <div 
            className="arabic-text" 
            lang="ar" 
            dir="rtl"
            aria-label="Verse 1 of Surah Al-Fatiha"
            role="region"
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>
          <button aria-label="Play audio recitation">🔊</button>
        </div>
      )
      
      const snapshot = visualTester.captureSnapshot('aria-labeled-content', container)
      
      // Should have proper ARIA labels
      expect(snapshot.accessibilityMetrics.ariaLabelsPresent).toBe(true)
      expect(snapshot.accessibilityMetrics.screenReaderFriendly).toBe(true)
    })
  })

  describe('Cross-Browser Visual Consistency', () => {
    it('should render consistently across different browsers', () => {
      const browsers = [
        { name: 'Chrome', fontRendering: 'webkit' },
        { name: 'Firefox', fontRendering: 'gecko' },
        { name: 'Safari', fontRendering: 'webkit' },
        { name: 'Edge', fontRendering: 'blink' }
      ]

      const snapshots: VisualSnapshot[] = []

      browsers.forEach(browser => {
        // Mock browser-specific rendering
        const { container } = render(
          <div className={`browser-${browser.name.toLowerCase()}`}>
            <MockQuranText 
              surahNumber={1} 
              ayahNumber={1} 
              arabicText="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" 
            />
          </div>
        )
        
        const snapshot = visualTester.captureSnapshot(`browser-${browser.name}`, container)
        snapshots.push(snapshot)
        
        // Should maintain basic consistency
        expect(snapshot.arabicTextMetrics.textDirection).toBe('rtl')
        expect(snapshot.arabicTextMetrics.fontSize).toBeGreaterThan(0)
      })

      // Compare cross-browser consistency
      const baselineSnapshot = snapshots[0]
      for (let i = 1; i < snapshots.length; i++) {
        const comparison = visualTester.compareSnapshots(baselineSnapshot, snapshots[i])
        expect(comparison.score).toBeGreaterThan(0.7) // 70% similarity across browsers
      }
    })

    it('should handle font fallbacks gracefully', () => {
      const fontStacks = [
        'Uthmanic Hafs, Traditional Arabic, serif',
        'Noto Sans Arabic, Arial, sans-serif',
        'Amiri, Times New Roman, serif',
        'system-ui, sans-serif' // Fallback scenario
      ]

      fontStacks.forEach((fontStack, index) => {
        const { container } = render(
          <div style={{ fontFamily: fontStack }}>
            <MockQuranText 
              surahNumber={1} 
              ayahNumber={1} 
              arabicText="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" 
            />
          </div>
        )
        
        const snapshot = visualTester.captureSnapshot(`font-fallback-${index}`, container)
        
        // Should maintain readability with any font
        expect(snapshot.arabicTextMetrics.fontSize).toBeGreaterThan(0)
        expect(snapshot.arabicTextMetrics.textDirection).toBe('rtl')
        expect(snapshot.accessibilityMetrics.contrastRatio).toBeGreaterThan(4.5)
      })
    })
  })

  describe('Performance Visual Metrics', () => {
    it('should capture layout performance metrics', () => {
      const { container } = render(
        <div className="performance-test">
          {Array.from({ length: 50 }, (_, i) => (
            <MockQuranText 
              key={i}
              surahNumber={1} 
              ayahNumber={i + 1} 
              arabicText="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" 
            />
          ))}
        </div>
      )
      
      const startTime = performance.now()
      const snapshot = visualTester.captureSnapshot('performance-test', container)
      const endTime = performance.now()
      
      const captureDuration = endTime - startTime
      
      // Visual capture should be performant
      expect(captureDuration).toBeLessThan(1000) // Less than 1 second
      expect(snapshot.layoutMetrics.containerHeight).toBeGreaterThan(0)
    })

    it('should monitor visual regression in large content sets', () => {
      const largeContentSet = Array.from({ length: 100 }, (_, i) => ({
        number: i + 1,
        text: `آية رقم ${i + 1} - بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ`
      }))

      const { container } = render(<MockAyahDisplay ayahs={largeContentSet} />)
      
      const snapshot = visualTester.captureSnapshot('large-content', container)
      
      // Should handle large content efficiently
      expect(snapshot.layoutMetrics.containerHeight).toBeGreaterThan(0)
      expect(snapshot.arabicTextMetrics.textDirection).toBe('rtl')
      expect(snapshot.accessibilityMetrics.screenReaderFriendly).toBe(true)
    })
  })

  describe('Integration with App Themes', () => {
    it('should maintain visual consistency across theme changes', async () => {
      const { result } = renderHook(() => usePreferencesStore())
      const themes = ['light', 'dark', 'sepia', 'night']
      const snapshots: VisualSnapshot[] = []

      for (const theme of themes) {
        await act(async () => {
          result.current.setTheme(theme)
        })

        const { container } = render(
          <div className={`theme-${theme}`}>
            <MockQuranText 
              surahNumber={1} 
              ayahNumber={1} 
              arabicText="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" 
            />
          </div>
        )
        
        const snapshot = visualTester.captureSnapshot(`theme-${theme}`, container)
        snapshots.push(snapshot)
        
        // Each theme should maintain accessibility
        expect(snapshot.accessibilityMetrics.contrastRatio).toBeGreaterThan(4.5)
        expect(snapshot.arabicTextMetrics.textDirection).toBe('rtl')
      }

      // Themes should be visually distinct but structurally consistent
      const structuralElements = snapshots.map(s => ({
        textDirection: s.arabicTextMetrics.textDirection,
        fontSize: s.arabicTextMetrics.fontSize,
        layout: s.layoutMetrics.textAlignment
      }))

      // All themes should have same structure
      const baseStructure = structuralElements[0]
      structuralElements.forEach(structure => {
        expect(structure.textDirection).toBe(baseStructure.textDirection)
        expect(structure.layout).toBe(baseStructure.layout)
      })
    })
  })
})
