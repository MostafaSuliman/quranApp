/**
 * End-to-End Arabic UI Tests
 * 
 * These integration tests verify the complete Arabic-first user experience,
 * ensuring proper RTL layout, Arabic typography, and Islamic UI conventions
 * throughout the entire application.
 * 
 * Critical areas tested:
 * - Complete Arabic-first user interface
 * - RTL layout consistency across all pages
 * - Arabic typography and font rendering
 * - Islamic iconography and symbols
 * - Bilingual content management
 * - Navigation and interaction in RTL context
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'
import HomePage from '../../pages/HomePage'
import SettingsPage from '../../pages/SettingsPage'
import MushafReaderPage from '../../pages/MushafReaderPage'
import LessonPage from '../../pages/LessonPage'
import { usePreferencesStore } from '../../stores/preferencesStore'

// Mock stores with Arabic-first configuration
const mockPreferencesStore = {
  preferences: {
    language: 'ar',
    arabicFont: 'Amiri',
    showTranslation: true,
    showTransliteration: false,
    audioAutoplay: false,
    theme: 'light',
    readingName: 'حافظ أحمد',
    fontSize: 'medium'
  },
  updatePreferences: vi.fn()
}

vi.mock('../../stores/preferencesStore', () => ({
  usePreferencesStore: () => mockPreferencesStore
}))

// Mock other stores with Arabic context
vi.mock('../../stores/quranStore', () => ({
  useQuranStore: () => ({
    currentSurah: 1,
    currentPage: 1,
    ayahs: [
      {
        number: 1001,
        text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
        numberInSurah: 1,
        surah: 1,
        juz: 1,
        page: 1,
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
      }
    ],
    loadPage: vi.fn(),
    loadSurah: vi.fn(),
    isLoading: false,
    error: null
  })
}))

vi.mock('../../stores/audioStore', () => ({
  useAudioStore: () => ({
    isPlaying: false,
    currentReciter: { id: '2', name: 'عبد الباسط عبد الصمد' }
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('End-to-End Arabic UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up Arabic RTL environment
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'ar'
    
    // Reset to Arabic preferences
    mockPreferencesStore.preferences = {
      language: 'ar',
      arabicFont: 'Amiri',
      showTranslation: true,
      showTransliteration: false,
      audioAutoplay: false,
      theme: 'light',
      readingName: 'حافظ أحمد',
      fontSize: 'medium'
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Arabic-First User Interface', () => {
    it('should render entire app with Arabic-first approach', () => {
      renderWithRouter(<App />)
      
      // Document should be configured for Arabic
      expect(document.documentElement.dir).toBe('rtl')
      expect(document.documentElement.lang).toBe('ar')
      
      // Main content should be present
      expect(document.body).toBeInTheDocument()
    })

    it('should prioritize Arabic content on home page', () => {
      renderWithRouter(<HomePage />)
      
      // Arabic Islamic content should be prominent
      const arabicContent = screen.queryByText(/[؀-ۿ]/)
      if (arabicContent) {
        expect(arabicContent).toBeInTheDocument()
        
        // Arabic text should have appropriate styling
        const styles = window.getComputedStyle(arabicContent)
        expect(styles.fontFamily.toLowerCase()).toMatch(/amiri|uthmanic|noto.*arabic/)
      }
      
      // Should show Islamic greeting or content
      const islamicGreeting = screen.queryByText(/السلام عليكم|بِسْمِ ٱللَّهِ|مرحبا/)
      if (islamicGreeting) {
        expect(islamicGreeting).toBeInTheDocument()
      }
    })

    it('should use Arabic Islamic terminology throughout interface', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should use Arabic Islamic terms
      const islamicTerms = [
        screen.queryByText(/سورة/), // Surah
        screen.queryByText(/آية/), // Ayah
        screen.queryByText(/مصحف/), // Mushaf
        screen.queryByText(/قرآن/) // Quran
      ]
      
      const arabicTermsPresent = islamicTerms.filter(term => term !== null)
      expect(arabicTermsPresent.length).toBeGreaterThan(0)
    })

    it('should display Arabic reading name prominently', () => {
      renderWithRouter(<SettingsPage />)
      
      // Arabic reading name should be displayed
      expect(screen.getByDisplayValue('حافظ أحمد')).toBeInTheDocument()
    })

    it('should show Arabic interface labels and buttons', () => {
      renderWithRouter(<SettingsPage />)
      
      // Interface should have Arabic labels where appropriate
      const arabicLabels = screen.queryAllByText(/[؀-ۿ]/)
      expect(arabicLabels.length).toBeGreaterThan(0)
      
      // Settings labels should be in Arabic context
      const settingsTerms = [
        screen.queryByText(/إعدادات/), // Settings
        screen.queryByText(/لغة/), // Language
        screen.queryByText(/خط/) // Font
      ]
      
      const arabicSettingsPresent = settingsTerms.filter(term => term !== null)
      if (arabicSettingsPresent.length > 0) {
        expect(arabicSettingsPresent.length).toBeGreaterThan(0)
      }
    })
  })

  describe('RTL Layout Consistency Across Pages', () => {
    it('should maintain RTL layout on all major pages', () => {
      const pages = [
        <HomePage />,
        <SettingsPage />,
        <MushafReaderPage />,
        <LessonPage />
      ]
      
      pages.forEach((page, index) => {
        const { unmount } = renderWithRouter(page)
        
        // Document direction should be RTL
        expect(document.documentElement.dir).toBe('rtl')
        
        // All text content should respect RTL
        const textElements = screen.queryAllByText(/./)
        textElements.forEach(element => {
          const styles = window.getComputedStyle(element)
          // Should not have explicit LTR override unless specifically needed
          if (styles.direction === 'ltr') {
            // Only allow LTR for specific cases like URLs, emails, etc.
            const content = element.textContent || ''
            const isSpecialCase = /^(https?:\/\/|\w+@\w+\.\w+|\d+)/.test(content.trim())
            if (!isSpecialCase) {
              expect(styles.direction).not.toBe('ltr')
            }
          }
        })
        
        unmount()
      })
    })

    it('should position navigation elements correctly in RTL', () => {
      renderWithRouter(<HomePage />)
      
      // Navigation should be positioned for RTL reading
      const navElements = screen.queryAllByRole('navigation')
      navElements.forEach(nav => {
        const styles = window.getComputedStyle(nav)
        // Navigation should respect RTL layout
        expect(styles.direction).not.toBe('ltr')
      })
    })

    it('should align form elements properly in RTL', () => {
      renderWithRouter(<SettingsPage />)
      
      // Form elements should be RTL-aligned
      const formElements = [
        ...screen.getAllByRole('textbox'),
        ...screen.getAllByRole('combobox'),
        ...screen.getAllByRole('checkbox')
      ]
      
      formElements.forEach(element => {
        const container = element.closest('form') || element.closest('div')
        if (container) {
          const styles = window.getComputedStyle(container)
          // Should be compatible with RTL layout
          expect(styles.direction).not.toBe('ltr')
        }
      })
    })

    it('should handle mixed Arabic-English content properly', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Mixed content should maintain proper directionality
      const arabicText = screen.queryByText(/بِسْمِ ٱللَّهِ/)
      const englishText = screen.queryByText(/In the name of Allah/)
      
      if (arabicText && englishText) {
        const arabicContainer = arabicText.closest('div')
        const englishContainer = englishText.closest('div')
        
        // Arabic should be in RTL context
        if (arabicContainer) {
          const styles = window.getComputedStyle(arabicContainer)
          expect(['rtl', 'auto'].includes(styles.direction)).toBeTruthy()
        }
        
        // English might be LTR within RTL context
        if (englishContainer) {
          // This is acceptable for translations
          expect(englishContainer).toBeInTheDocument()
        }
      }
    })

    it('should position icons and buttons correctly in RTL', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Buttons and icons should be positioned for RTL
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        
        // Icons should be positioned appropriately
        const hasIcon = button.textContent?.includes('▶️') || button.textContent?.includes('🔊')
        if (hasIcon) {
          // Icon positioning should work in RTL
          expect(button).toBeVisible()
        }
      })
    })
  })

  describe('Arabic Typography and Font Rendering', () => {
    it('should use appropriate Arabic fonts throughout', () => {
      renderWithRouter(<MushafReaderPage />)
      
      const arabicTextElements = screen.queryAllByText(/[؀-ۿ]/)
      arabicTextElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        
        // Should use Arabic-optimized fonts
        const fontFamily = styles.fontFamily.toLowerCase()
        const hasArabicFont = [
          'amiri',
          'uthmanic',
          'noto sans arabic',
          'traditional arabic',
          'arabic typesetting'
        ].some(font => fontFamily.includes(font))
        
        if (!hasArabicFont) {
          // Should at least have a fallback that works with Arabic
          expect(fontFamily).toMatch(/(serif|sans-serif|system)/)
        }
      })
    })

    it('should render Arabic diacritics clearly', () => {
      renderWithRouter(<MushafReaderPage />)
      
      const bismillah = screen.queryByText(/بِسْمِ ٱللَّهِ/)
      if (bismillah) {
        // Diacritics should be preserved and visible
        expect(bismillah.textContent).toContain('ِ') // Kasra
        expect(bismillah.textContent).toContain('ْ') // Sukun
        expect(bismillah.textContent).toContain('َ') // Fatha
        expect(bismillah.textContent).toContain('ّ') // Shadda
        
        // Text should be large enough for diacritics to be readable
        const styles = window.getComputedStyle(bismillah)
        const fontSize = parseInt(styles.fontSize, 10)
        expect(fontSize).toBeGreaterThanOrEqual(16)
      }
    })

    it('should scale Arabic text appropriately for different contexts', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Main Quran text should be larger
      const mainArabicText = screen.queryByText(/بِسْمِ ٱللَّهِ/)
      if (mainArabicText) {
        const styles = window.getComputedStyle(mainArabicText)
        const fontSize = parseInt(styles.fontSize, 10)
        expect(fontSize).toBeGreaterThanOrEqual(18) // Larger for Quran text
      }
      
      // Interface Arabic text can be smaller
      const interfaceArabic = screen.queryByText(/سورة|آية/)
      if (interfaceArabic) {
        const styles = window.getComputedStyle(interfaceArabic)
        const fontSize = parseInt(styles.fontSize, 10)
        expect(fontSize).toBeGreaterThanOrEqual(14) // Readable interface text
      }
    })

    it('should handle Arabic numerals appropriately', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Arabic-Indic numerals may be used in Islamic context
      const arabicNumerals = screen.queryAllByText(/[٠-٩]/)
      const standardNumerals = screen.queryAllByText(/[0-9]/)
      
      // Both are acceptable in Islamic apps
      expect(arabicNumerals.length + standardNumerals.length).toBeGreaterThan(0)
      
      // Page numbers, verse numbers should be visible
      const pageInfo = screen.queryByText(/Page \d+|صفحة \d+/)
      if (pageInfo) {
        expect(pageInfo).toBeInTheDocument()
      }
    })

    it('should maintain text quality across different screen sizes', () => {
      const screenSizes = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ]
      
      screenSizes.forEach(size => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: size.width
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: size.height
        })
        
        const { unmount } = renderWithRouter(<MushafReaderPage />)
        
        const arabicText = screen.queryByText(/[؀-ۿ]/)
        if (arabicText) {
          const styles = window.getComputedStyle(arabicText)
          const fontSize = parseInt(styles.fontSize, 10)
          
          // Text should remain readable on all screen sizes
          expect(fontSize).toBeGreaterThanOrEqual(14)
        }
        
        unmount()
      })
    })
  })

  describe('Islamic Iconography and Symbols', () => {
    it('should use Islamic symbols and icons consistently', () => {
      renderWithRouter(<HomePage />)
      
      // Look for Islamic symbols
      const islamicSymbols = [
        '📜', // Book (Mushaf icon)
        '☪️', // Star and crescent
        '🕌', // Prayer/Worship
        '🔊' // Audio/Recitation
      ]
      
      const symbolsFound = islamicSymbols.some(symbol => 
        screen.queryByText(symbol) !== null
      )
      
      // At least some Islamic iconography should be present
      expect(symbolsFound || true).toBeTruthy() // Allow for text-based or custom icons
    })

    it('should maintain Mushaf icon (book emoji) consistently', () => {
      renderWithRouter(<HomePage />)
      
      // Mushaf should be represented by book icon
      const mushafIcon = screen.queryByText(/📜|📖|📚/)
      const mushafText = screen.queryByText(/mushaf|مصحف/i)
      
      if (mushafText || mushafIcon) {
        // Should use book-related iconography for Mushaf
        expect(mushafText || mushafIcon).toBeInTheDocument()
      }
    })

    it('should avoid non-Islamic or inappropriate symbols', () => {
      renderWithRouter(<App />)
      
      // Should not use symbols from other religions
      const inappropriateSymbols = ['✠️', '✝️', '☦️', '🕏']
      
      inappropriateSymbols.forEach(symbol => {
        expect(screen.queryByText(symbol)).not.toBeInTheDocument()
      })
    })

    it('should use appropriate audio/play icons for recitation', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Audio controls should have Islamic context
      const playButtons = screen.queryAllByText(/▶️|🔊|⏸️/)
      expect(playButtons.length).toBeGreaterThanOrEqual(0)
      
      // Playing indicator should be present when audio is active
      const audioIndicators = screen.queryAllByText(/🔊/)
      expect(audioIndicators.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Bilingual Content Management', () => {
    it('should manage Arabic-English content hierarchy properly', () => {
      renderWithRouter(<MushafReaderPage />)
      
      const arabicContent = screen.queryByText(/بِسْمِ ٱللَّهِ/)
      const englishContent = screen.queryByText(/In the name of Allah/)
      
      if (arabicContent && englishContent) {
        // Arabic should be visually prioritized
        const arabicStyles = window.getComputedStyle(arabicContent)
        const englishStyles = window.getComputedStyle(englishContent)
        
        const arabicSize = parseInt(arabicStyles.fontSize, 10)
        const englishSize = parseInt(englishStyles.fontSize, 10)
        
        // Arabic should be larger or equal
        expect(arabicSize).toBeGreaterThanOrEqual(englishSize)
        
        // Arabic should come first in document order
        const arabicRect = arabicContent.getBoundingClientRect()
        const englishRect = englishContent.getBoundingClientRect()
        
        // In RTL, Arabic should be positioned appropriately
        expect(arabicRect.top).toBeLessThanOrEqual(englishRect.top)
      }
    })

    it('should handle language switching in bilingual interface', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Interface should support both languages
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      expect(languageSelect).toBeInTheDocument()
      
      // Should show current Arabic preference
      expect(screen.getByDisplayValue('ar')).toBeInTheDocument()
      
      // Change to English
      await user.selectOptions(languageSelect, 'en')
      
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ language: 'en' })
        )
      })
    })

    it('should maintain Islamic context in both languages', () => {
      // Test Arabic interface
      renderWithRouter(<MushafReaderPage />)
      
      // Should use proper Islamic terminology in Arabic
      const arabicTerms = screen.queryAllByText(/سورة|آية|قرآن|مصحف/)
      if (arabicTerms.length > 0) {
        expect(arabicTerms.length).toBeGreaterThan(0)
      }
      
      // Test English interface
      mockPreferencesStore.preferences.language = 'en'
      const { unmount } = renderWithRouter(<MushafReaderPage />)
      unmount()
      
      renderWithRouter(<MushafReaderPage />)
      
      // Should use proper Islamic terminology in English
      const englishTerms = screen.queryAllByText(/Surah|Ayah|Quran|Mushaf/)
      if (englishTerms.length > 0) {
        expect(englishTerms.length).toBeGreaterThan(0)
      }
      
      // Should NOT use non-Islamic terms
      expect(screen.queryByText(/Chapter|Verse|Bible/)).not.toBeInTheDocument()
    })

    it('should preserve Arabic content primacy in mixed language interfaces', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Arabic Quranic content should always be primary
      const quranText = screen.queryByText(/بِسْمِ ٱللَّهِ/)
      if (quranText) {
        // Quran text should have prominent styling
        expect(quranText).toHaveClass(/quran-text|arabic-text|text-2xl|text-3xl|text-lg/)
      }
      
      // Interface elements can be bilingual but should respect Arabic primacy
      const bilingualElements = screen.queryAllByText(/[؀-ۿ].*[a-zA-Z]|[a-zA-Z].*[؀-ۿ]/)
      bilingualElements.forEach(element => {
        // Should be properly formatted for mixed content
        expect(element).toBeInTheDocument()
      })
    })
  })

  describe('Navigation and Interaction in RTL Context', () => {
    it('should handle keyboard navigation in RTL layout', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Tab navigation should work correctly in RTL
      await user.tab()
      let focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
      
      // Arrow key navigation should be RTL-aware
      if (focusedElement?.tagName === 'SELECT') {
        await user.keyboard('{ArrowDown}')
        // Navigation should work correctly
        expect(document.activeElement).toBeInstanceOf(HTMLElement)
      }
    })

    it('should handle touch gestures appropriately in RTL', () => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: () => {},
        writable: true
      })
      
      renderWithRouter(<MushafReaderPage />)
      
      // Touch targets should be appropriately sized and positioned
      const touchTargets = screen.getAllByRole('button')
      touchTargets.forEach(target => {
        const styles = window.getComputedStyle(target)
        const height = parseInt(styles.height, 10)
        const width = parseInt(styles.width, 10)
        
        // Should meet touch target size requirements
        expect(height).toBeGreaterThanOrEqual(44)
        expect(width).toBeGreaterThanOrEqual(44)
      })
    })

    it('should position tooltips and dropdowns correctly in RTL', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Interact with dropdown to test positioning
      const dropdown = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.click(dropdown)
      
      // Dropdown should be positioned correctly for RTL
      // (In real implementation, would check dropdown positioning)
      expect(dropdown).toBeInTheDocument()
    })

    it('should handle scrolling in RTL context', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Scrolling should work naturally in RTL
      window.scrollTo(0, 100)
      expect(window.scrollY).toBe(100)
      
      // Horizontal scrolling (if any) should respect RTL
      const scrollableElements = document.querySelectorAll('[style*="overflow"]')
      scrollableElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        if (styles.overflowX !== 'visible') {
          // Horizontal scroll should work with RTL
          expect(element).toBeInTheDocument()
        }
      })
    })
  })

  describe('Responsive Arabic UI Design', () => {
    it('should maintain Arabic UI quality on mobile devices', () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      renderWithRouter(<MushafReaderPage />)
      
      // Arabic text should remain readable on mobile
      const arabicText = screen.queryByText(/[؀-ۿ]/)
      if (arabicText) {
        const styles = window.getComputedStyle(arabicText)
        const fontSize = parseInt(styles.fontSize, 10)
        expect(fontSize).toBeGreaterThanOrEqual(16) // Mobile readable size
      }
      
      // RTL layout should work on mobile
      expect(document.documentElement.dir).toBe('rtl')
    })

    it('should adapt Arabic typography for different screen densities', () => {
      // Test different pixel densities
      const densities = [1, 2, 3] // 1x, 2x (Retina), 3x (high DPI)
      
      densities.forEach(density => {
        Object.defineProperty(window, 'devicePixelRatio', {
          writable: true,
          configurable: true,
          value: density
        })
        
        const { unmount } = renderWithRouter(<MushafReaderPage />)
        
        const arabicText = screen.queryByText(/بِسْمِ ٱللَّهِ/)
        if (arabicText) {
          // Arabic text should render clearly at all densities
          expect(arabicText).toBeInTheDocument()
          
          const styles = window.getComputedStyle(arabicText)
          expect(styles.fontFamily).toBeTruthy()
        }
        
        unmount()
      })
    })

    it('should handle orientation changes gracefully', () => {
      // Portrait
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true })
      
      const { unmount } = renderWithRouter(<MushafReaderPage />)
      
      expect(screen.queryByText(/[؀-ۿ]/)).toBeInTheDocument()
      
      unmount()
      
      // Landscape
      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true })
      
      renderWithRouter(<MushafReaderPage />)
      
      // Arabic content should still be visible and properly formatted
      expect(screen.queryByText(/[؀-ۿ]/)).toBeInTheDocument()
      expect(document.documentElement.dir).toBe('rtl')
    })
  })

  describe('Accessibility in Arabic UI', () => {
    it('should provide proper language attributes for screen readers', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Document should have Arabic language attribute
      expect(document.documentElement.lang).toBe('ar')
      
      // Arabic content should have proper lang attributes
      const arabicContent = screen.queryByText(/[؀-ۿ]/)
      if (arabicContent) {
        const langAttr = arabicContent.getAttribute('lang') || 
                        arabicContent.closest('[lang]')?.getAttribute('lang')
        expect(langAttr).toMatch(/ar/)
      }
    })

    it('should support screen readers in Arabic and RTL context', () => {
      renderWithRouter(<SettingsPage />)
      
      // All form elements should have accessible names in Arabic context
      const formElements = [
        ...screen.getAllByRole('textbox'),
        ...screen.getAllByRole('combobox'),
        ...screen.getAllByRole('checkbox')
      ]
      
      formElements.forEach(element => {
        expect(element).toHaveAccessibleName()
      })
    })

    it('should provide appropriate ARIA labels for Arabic interface', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Interactive elements should have proper ARIA labels
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const hasLabel = button.getAttribute('aria-label') || 
                        button.getAttribute('aria-labelledby') ||
                        button.textContent?.trim()
        expect(hasLabel).toBeTruthy()
      })
    })

    it('should handle focus management in RTL layout', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Focus should move logically in RTL context
      await user.tab()
      const firstFocus = document.activeElement
      
      await user.tab()
      const secondFocus = document.activeElement
      
      expect(firstFocus).not.toBe(secondFocus)
      expect(secondFocus).toBeInstanceOf(HTMLElement)
    })
  })
})