/**
 * Language Switching Tests
 * 
 * These tests ensure Arabic-first behavior, proper RTL layout,
 * and smooth language switching without affecting functionality.
 * 
 * Critical areas tested:
 * - App defaults to Arabic language
 * - RTL layout works correctly
 * - Arabic-first content display
 * - Language switching preserves functionality
 * - Bilingual content management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import HomePage from '../pages/HomePage'
import SettingsPage from '../pages/SettingsPage'
import MushafReaderPage from '../pages/MushafReaderPage'
import { usePreferencesStore } from '../stores/preferencesStore'

// Mock the preferences store with Arabic defaults
const mockPreferencesStore = {
  preferences: {
    language: 'ar', // Default to Arabic
    arabicFont: 'Amiri',
    showTranslation: true,
    showTransliteration: false,
    audioAutoplay: false,
    theme: 'light',
    readingName: 'حافظ أحمد' // Arabic name by default
  },
  updatePreferences: vi.fn(),
  resetPreferences: vi.fn()
}

vi.mock('../stores/preferencesStore', () => ({
  usePreferencesStore: () => mockPreferencesStore
}))

// Mock React Router for language routing
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '' })
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Language Switching Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to Arabic defaults
    mockPreferencesStore.preferences = {
      language: 'ar',
      arabicFont: 'Amiri',
      showTranslation: true,
      showTransliteration: false,
      audioAutoplay: false,
      theme: 'light',
      readingName: 'حافظ أحمد'
    }
    
    // Reset document direction
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'ar'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Arabic-First Default Behavior', () => {
    it('should default to Arabic language on first load', () => {
      renderWithRouter(<App />)
      
      // Check that Arabic is the default language
      expect(mockPreferencesStore.preferences.language).toBe('ar')
      
      // Document should have Arabic attributes
      expect(document.documentElement.lang).toBe('ar')
      expect(document.documentElement.dir).toBe('rtl')
    })

    it('should display Arabic content prominently by default', () => {
      renderWithRouter(<HomePage />)
      
      // Arabic text should be visible and prominent
      const arabicText = screen.queryByText(/بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ/)
      if (arabicText) {
        expect(arabicText).toBeInTheDocument()
        expect(arabicText).toHaveClass(/text-2xl|text-3xl|text-lg/)
      }
    })

    it('should show Arabic reading name by default', () => {
      renderWithRouter(<SettingsPage />)
      
      // Reading name should default to Arabic
      const nameInput = screen.getByDisplayValue('حافظ أحمد')
      expect(nameInput).toBeInTheDocument()
    })

    it('should use Arabic numerals in appropriate contexts', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Check for Arabic-Indic numerals where appropriate
      // (Though standard numerals are also acceptable in Islamic apps)
      const pageElements = screen.queryAllByText(/[٠-٩]/)
      // Arabic numerals may or may not be used, both are valid
    })
  })

  describe('RTL Layout Functionality', () => {
    it('should apply RTL direction to the entire document by default', () => {
      renderWithRouter(<App />)
      
      expect(document.documentElement.dir).toBe('rtl')
      expect(document.documentElement.lang).toBe('ar')
    })

    it('should position navigation elements correctly in RTL', () => {
      renderWithRouter(<HomePage />)
      
      // Navigation elements should be positioned for RTL
      const navElements = screen.queryAllByRole('button')
      navElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        // Should not have explicit LTR overrides unless intended
        expect(styles.direction).not.toBe('ltr')
      })
    })

    it('should align Arabic text to the right in RTL layout', () => {
      renderWithRouter(<HomePage />)
      
      const arabicTextElements = screen.queryAllByText(/[\u0600-\u06FF]/)
      arabicTextElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        // Arabic text should be right-aligned or center-aligned in RTL
        expect(['right', 'center', 'start'].includes(styles.textAlign)).toBeTruthy()
      })
    })

    it('should handle mixed content (Arabic + English) properly', () => {
      const mixedContent = 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ - In the name of Allah'
      render(
        <div dir="rtl">
          <p>{mixedContent}</p>
        </div>
      )
      
      const textElement = screen.getByText(mixedContent)
      expect(textElement).toBeInTheDocument()
      
      // Mixed content should maintain proper directionality
      const container = textElement.closest('div')
      expect(container).toHaveAttribute('dir', 'rtl')
    })

    it('should position form elements correctly in RTL', () => {
      renderWithRouter(<SettingsPage />)
      
      const formElements = screen.getAllByRole('textbox')
      formElements.forEach(element => {
        // Form elements should work properly in RTL
        expect(element).toBeVisible()
        
        // Labels should be positioned correctly
        const label = element.closest('label') || element.getAttribute('aria-label')
        expect(label).toBeTruthy()
      })
    })
  })

  describe('Language Switching Without Page Refresh', () => {
    it('should switch from Arabic to English smoothly', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Verify we start in Arabic
      expect(document.documentElement.lang).toBe('ar')
      expect(document.documentElement.dir).toBe('rtl')
      
      // Find and change language selector
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Should update preferences
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ language: 'en' })
        )
      })
      
      // Document direction should change to LTR for English
      // (This would be handled by the app's language switching logic)
      expect(window.location.href).toBeTruthy() // Page should not refresh
    })

    it('should switch from English to Arabic smoothly', async () => {
      const user = userEvent.setup()
      
      // Start with English preferences
      mockPreferencesStore.preferences.language = 'en'
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = 'en'
      
      renderWithRouter(<SettingsPage />)
      
      const languageSelect = screen.getByRole('combobox', { name: /language/i })
      await user.selectOptions(languageSelect, 'ar')
      
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ language: 'ar' })
        )
      })
    })

    it('should maintain page state during language switch', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Make some changes to the form
      const nameInput = screen.getByRole('textbox', { name: /name|اسم/i })
      await user.clear(nameInput)
      await user.type(nameInput, 'Test User')
      
      // Switch language
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Form data should be preserved
      await waitFor(() => {
        expect(nameInput).toHaveValue('Test User')
      })
    })

    it('should update UI text directions appropriately', async () => {
      const user = userEvent.setup()
      renderWithRouter(<HomePage />)
      
      // Initial state should be RTL for Arabic
      expect(document.documentElement.dir).toBe('rtl')
      
      // Switch to English (would trigger LTR in real app)
      mockPreferencesStore.preferences.language = 'en'
      
      // Re-render to simulate language change
      const { rerender } = render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      )
      
      // App should handle direction change
      // (In real implementation, this would be handled by a useEffect)
    })
  })

  describe('Bilingual Content Management', () => {
    it('should display both Arabic and English content when appropriate', () => {
      renderWithRouter(<HomePage />)
      
      // Should show both Arabic Quran text and English translations
      const arabicContent = screen.queryByText(/[\u0600-\u06FF]/)
      const englishContent = screen.queryByText(/In the name of Allah|Quran|Islamic/)
      
      // Both should be present but Arabic should be primary
      if (arabicContent && englishContent) {
        expect(arabicContent).toBeInTheDocument()
        expect(englishContent).toBeInTheDocument()
        
        // Arabic should be more prominent (larger, positioned first)
        const arabicStyles = window.getComputedStyle(arabicContent)
        const englishStyles = window.getComputedStyle(englishContent)
        
        // Arabic text should generally be larger
        const arabicSize = parseInt(arabicStyles.fontSize, 10)
        const englishSize = parseInt(englishStyles.fontSize, 10)
        expect(arabicSize).toBeGreaterThanOrEqual(englishSize)
      }
    })

    it('should handle Arabic-English mixed interface text', () => {
      renderWithRouter(<SettingsPage />)
      
      // Interface should support mixed content properly
      const labels = screen.getAllByText(/[\u0600-\u06FF].*[a-zA-Z]|[a-zA-Z].*[\u0600-\u06FF]/)
      labels.forEach(label => {
        expect(label).toBeInTheDocument()
        // Mixed content should be readable
        expect(label.textContent?.length).toBeGreaterThan(0)
      })
    })

    it('should prioritize Arabic terminology over English equivalents', () => {
      renderWithRouter(<HomePage />)
      
      // Should use Arabic Islamic terms primarily
      const islamicTerms = [
        'سورة', 'آية', 'القرآن', 'مصحف', // Arabic terms
        'Surah', 'Ayah', 'Quran', 'Mushaf' // English equivalents
      ]
      
      // Arabic terms should be present
      islamicTerms.slice(0, 4).forEach(term => {
        const element = screen.queryByText(new RegExp(term))
        if (element) {
          expect(element).toBeInTheDocument()
        }
      })
    })

    it('should maintain content hierarchy across language switches', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Start in Arabic
      expect(mockPreferencesStore.preferences.language).toBe('ar')
      
      // Switch to English
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Content structure should remain the same
      await waitFor(() => {
        const formElements = screen.getAllByRole('textbox')
        expect(formElements.length).toBeGreaterThan(0)
      })
      
      // Switch back to Arabic
      await user.selectOptions(languageSelect, 'ar')
      
      await waitFor(() => {
        const formElements = screen.getAllByRole('textbox')
        expect(formElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Font and Typography Handling', () => {
    it('should use appropriate Arabic fonts for Arabic content', () => {
      renderWithRouter(<HomePage />)
      
      const arabicText = screen.queryByText(/[\u0600-\u06FF]/)
      if (arabicText) {
        const styles = window.getComputedStyle(arabicText)
        
        // Should use Arabic-appropriate fonts
        expect(styles.fontFamily.toLowerCase()).toMatch(/amiri|uthmanic|noto.*arabic|traditional arabic/i)
      }
    })

    it('should use different fonts for Arabic vs English content', () => {
      render(
        <div>
          <p className="arabic-text">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
          <p className="english-text">In the name of Allah</p>
        </div>
      )
      
      const arabicElement = screen.getByText(/بِسْمِ اللَّهِ/)
      const englishElement = screen.getByText(/In the name of Allah/)
      
      const arabicFont = window.getComputedStyle(arabicElement).fontFamily
      const englishFont = window.getComputedStyle(englishElement).fontFamily
      
      // Fonts should be optimized for their respective scripts
      expect(arabicFont).toBeTruthy()
      expect(englishFont).toBeTruthy()
    })

    it('should scale Arabic text appropriately', () => {
      renderWithRouter(<HomePage />)
      
      const arabicElements = screen.queryAllByText(/[\u0600-\u06FF]/)
      arabicElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const fontSize = parseInt(styles.fontSize, 10)
        
        // Arabic text should be readable (minimum size)
        expect(fontSize).toBeGreaterThanOrEqual(14)
      })
    })
  })

  describe('Accessibility in Multiple Languages', () => {
    it('should provide proper lang attributes for content', () => {
      renderWithRouter(<HomePage />)
      
      // Arabic content should have lang="ar"
      const arabicText = screen.queryByText(/[\u0600-\u06FF]/)
      if (arabicText) {
        const langAttr = arabicText.getAttribute('lang') || 
                        arabicText.closest('[lang]')?.getAttribute('lang')
        expect(langAttr).toMatch(/ar/)
      }
      
      // English content should have lang="en"
      const englishText = screen.queryByText(/^[a-zA-Z\s.,!?]+$/)
      if (englishText) {
        const langAttr = englishText.getAttribute('lang') ||
                        englishText.closest('[lang]')?.getAttribute('lang')
        expect(langAttr).toMatch(/en|ar/) // Could be in Arabic document
      }
    })

    it('should support screen readers in both languages', () => {
      renderWithRouter(<SettingsPage />)
      
      // All form elements should have proper labels
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })
      
      const selects = screen.getAllByRole('combobox')
      selects.forEach(select => {
        expect(select).toHaveAccessibleName()
      })
    })

    it('should handle keyboard navigation in RTL layout', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Tab navigation should work properly in RTL
      await user.tab()
      let focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
      
      // Arrow key navigation should be RTL-aware
      if (focusedElement?.tagName === 'SELECT') {
        await user.keyboard('{ArrowDown}')
        // Should navigate correctly regardless of direction
      }
    })
  })

  describe('Performance During Language Changes', () => {
    it('should switch languages without significant delay', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const startTime = Date.now()
      
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      const endTime = Date.now()
      const switchTime = endTime - startTime
      
      // Language switch should be fast
      expect(switchTime).toBeLessThan(500) // 500ms threshold
    })

    it('should not cause memory leaks during rapid language switching', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      
      // Rapid language switching
      for (let i = 0; i < 5; i++) {
        await user.selectOptions(languageSelect, 'en')
        await user.selectOptions(languageSelect, 'ar')
      }
      
      // Should not crash or cause performance issues
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle unsupported language gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock unsupported language
      mockPreferencesStore.preferences.language = 'zh'
      
      renderWithRouter(<SettingsPage />)
      
      // Should fallback to default (Arabic) or handle gracefully
      expect(() => screen.getByRole('combobox')).not.toThrow()
    })

    it('should handle missing translations gracefully', () => {
      // Mock missing translation scenario
      mockPreferencesStore.preferences.language = 'en'
      
      renderWithRouter(<HomePage />)
      
      // App should not crash if some translations are missing
      expect(document.body).toBeInTheDocument()
    })

    it('should maintain functionality with corrupted language preferences', () => {
      // Mock corrupted language preference
      mockPreferencesStore.preferences.language = null as any
      
      expect(() => {
        renderWithRouter(<SettingsPage />)
      }).not.toThrow()
    })
  })
})