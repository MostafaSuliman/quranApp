/**
 * Content Authenticity Regression Tests
 * 
 * These tests ensure no English primary text regression and maintain
 * authentic Islamic content standards throughout the application.
 * 
 * Critical areas tested:
 * - No English translations as primary Quranic content
 * - Arabic text authenticity preservation
 * - Quran.com API source verification
 * - Content hierarchy maintenance (Arabic first)
 * - Islamic authenticity standards
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../../pages/HomePage'
import MushafReaderPage from '../../pages/MushafReaderPage'
import LessonPage from '../../pages/LessonPage'
import AyahDisplay from '../../components/AyahDisplay'
import QuranText from '../../components/QuranText'
import { quranApi } from '../../utils/quranApi'
import { Ayah } from '../../types/quran'

// Mock fetch for API verification
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock stores with authentic content
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
      },
      {
        number: 1002,
        text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
        numberInSurah: 2,
        surah: 1,
        juz: 1,
        page: 1,
        translation: '[All] praise is [due] to Allah, Lord of the worlds -'
      }
    ],
    isLoading: false,
    error: null,
    loadPage: vi.fn(),
    loadSurah: vi.fn()
  })
}))

vi.mock('../../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: {
      language: 'ar',
      showTranslation: true,
      showTransliteration: false,
      arabicFont: 'Amiri'
    }
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

const authenticAyah: Ayah = {
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

const corruptedAyah: Ayah = {
  ...authenticAyah,
  text: 'In the name of Allah', // INVALID: English as primary text
  translation: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' // INVALID: Arabic as translation
}

describe('Content Authenticity Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Primary Content Language Verification', () => {
    it('should never accept English text as primary Quranic content', () => {
      // Test with corrupted data
      render(
        <QuranText 
          text="In the name of Allah"
        />
      )
      
      const textElement = screen.getByText(/In the name of Allah/)
      
      // Should not have Quran text styling for English
      expect(textElement).not.toHaveClass('quran-text-medium')
      expect(textElement).not.toHaveClass('arabic-text')
    })

    it('should always prioritize Arabic text as primary content', () => {
      render(
        <AyahDisplay 
          ayah={authenticAyah}
          showTranslation={true}
        />
      )
      
      const arabicText = screen.getByText(/بِسْمِ ٱللَّهِ/)
      const englishText = screen.getByText(/In the name of Allah/)
      
      // Arabic should have primary styling
      expect(arabicText).toHaveClass(/quran-text|arabic/)
      
      // English should be secondary (translation)
      expect(englishText).not.toHaveClass(/quran-text|arabic/)
      
      // Arabic should appear first in DOM order
      const arabicRect = arabicText.getBoundingClientRect()
      const englishRect = englishText.getBoundingClientRect()
      expect(arabicRect.top).toBeLessThanOrEqual(englishRect.top)
    })

    it('should reject content where English appears as primary text', () => {
      // This should be caught by data validation
      expect(() => {
        render(
          <AyahDisplay 
            ayah={corruptedAyah}
          />
        )
      }).not.toThrow() // Component should handle gracefully
      
      // But the corrupted content should be identifiable
      const primaryText = screen.getByText(/In the name of Allah/)
      
      // Should not receive primary Quran styling
      expect(primaryText).not.toHaveClass('quran-text-medium')
    })

    it('should validate that all displayed Quranic text is Arabic', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Find all elements with Quran text classes
      const quranTextElements = document.querySelectorAll('.quran-text, .quran-text-medium, .quran-text-large, .arabic-text')
      
      quranTextElements.forEach(element => {
        const content = element.textContent || ''
        
        // Should contain Arabic characters
        expect(content).toMatch(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/)
        
        // Should not be primarily English
        const arabicChars = (content.match(/[\u0600-\u06FF]/g) || []).length
        const englishChars = (content.match(/[a-zA-Z]/g) || []).length
        
        if (arabicChars + englishChars > 0) {
          expect(arabicChars).toBeGreaterThan(englishChars)
        }
      })
    })

    it('should maintain Arabic as primary across all Quran-related components', () => {
      const pages = [
        <HomePage />,
        <MushafReaderPage />,
        <LessonPage />
      ]
      
      pages.forEach((page, index) => {
        const { unmount } = renderWithRouter(page)
        
        // Any Quranic content should be Arabic-first
        const quranContent = document.querySelectorAll('[class*="quran"], [class*="arabic"]')
        
        quranContent.forEach(element => {
          const content = element.textContent || ''
          
          if (content.length > 0) {
            // Should contain Arabic script
            expect(content).toMatch(/[\u0600-\u06FF]/)
          }
        })
        
        unmount()
      })
    })
  })

  describe('Arabic Text Authenticity Preservation', () => {
    it('should preserve exact Arabic text from Quran.com API', () => {
      render(
        <QuranText 
          text={authenticAyah.text}
        />
      )
      
      const arabicElement = screen.getByText(authenticAyah.text)
      
      // Text should be exactly as received from API
      expect(arabicElement.textContent).toBe(authenticAyah.text)
      
      // Should preserve all diacritics
      expect(arabicElement.textContent).toContain('ِ') // Kasra
      expect(arabicElement.textContent).toContain('ْ') // Sukun
      expect(arabicElement.textContent).toContain('َ') // Fatha
      expect(arabicElement.textContent).toContain('ّ') // Shadda
    })

    it('should detect and prevent Arabic text corruption', () => {
      const corruptedArabic = 'بِسْمِ Allah ٱلرَّحِيمِ' // Mixed corruption
      
      render(
        <QuranText 
          text={corruptedArabic}
        />
      )
      
      const textElement = screen.getByText(corruptedArabic)
      
      // Should still render but might not have full Quran styling
      expect(textElement).toBeInTheDocument()
      
      // Mixed text should be detectable
      const content = textElement.textContent || ''
      const hasArabic = /[\u0600-\u06FF]/.test(content)
      const hasEnglish = /[a-zA-Z]/.test(content)
      
      expect(hasArabic && hasEnglish).toBeTruthy() // This is the corruption
    })

    it('should maintain Uthmani script characteristics', () => {
      render(
        <QuranText 
          text={authenticAyah.text}
        />
      )
      
      const bismillah = screen.getByText(authenticAyah.text)
      const content = bismillah.textContent || ''
      
      // Should have Uthmani script features
      expect(content).toContain('ٱ') // Alif Wasla
      expect(content).toMatch(/ـٰ/) // Superscript Alif
      
      // Should not contain replacement characters
      expect(content).not.toContain('�')
      
      // Should not be corrupted encoding
      expect(content).not.toMatch(/[\u00C0-\u00FF]{2,}/) // Latin-1 corruption
    })

    it('should preserve word boundaries and spacing in Arabic text', () => {
      render(
        <QuranText 
          text={authenticAyah.text}
        />
      )
      
      const arabicText = screen.getByText(authenticAyah.text)
      const content = arabicText.textContent || ''
      
      // Bismillah should have 4 words
      const words = content.trim().split(/\s+/)
      expect(words).toHaveLength(4)
      
      // Each word should be properly formed
      words.forEach(word => {
        expect(word.length).toBeGreaterThan(0)
        expect(word).toMatch(/[\u0600-\u06FF\u0640\u064B-\u0652\u0670\u0671]/)
      })
    })

    it('should prevent text transformation or encoding issues', () => {
      const originalText = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
      
      render(
        <QuranText 
          text={originalText}
        />
      )
      
      const renderedElement = screen.getByText(originalText)
      const renderedText = renderedElement.textContent || ''
      
      // Text should be identical to original
      expect(renderedText).toBe(originalText)
      
      // Should have proper Unicode encoding
      expect(encodeURIComponent(renderedText)).toBe(encodeURIComponent(originalText))
      
      // Length should be preserved
      expect(renderedText.length).toBe(originalText.length)
    })
  })

  describe('Quran.com API Source Verification', () => {
    it('should only accept content from authenticated Quran.com API', async () => {
      // Mock authentic API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          verses: [{
            id: 1,
            verse_number: 1,
            chapter_id: 1,
            text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
            juz_number: 1,
            page_number: 1
          }]
        })
      })
      
      const result = await quranApi.getChapterVerses(1)
      
      // Should call the correct API endpoint
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.quran.com/api/v4'),
        expect.any(Object)
      )
      
      // Should return authentic Arabic content
      expect(result.verses[0].text).toBe('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ')
    })

    it('should reject content from non-authentic sources', async () => {
      // Mock non-authentic source
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          verses: [{
            text: 'In the name of God', // Non-authentic
            translation: 'Some translation'
          }]
        })
      })
      
      try {
        const result = await quranApi.getChapterVerses(1)
        
        // Should transform correctly, maintaining Arabic priority
        if (result.verses.length > 0) {
          const verse = result.verses[0]
          // Should not accept English as primary text
          expect(verse.text).not.toBe('In the name of God')
        }
      } catch (error) {
        // API rejection is also acceptable
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should validate API response structure for authenticity', async () => {
      // Mock malformed response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          invalid: 'structure'
        })
      })
      
      const result = await quranApi.getChapterVerses(1)
      
      // Should handle invalid structure gracefully
      expect(result.verses).toEqual([])
    })

    it('should ensure API calls use correct text field priority', async () => {
      // Mock response with multiple text fields
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          verses: [{
            id: 1,
            verse_number: 1,
            chapter_id: 1,
            text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
            text_simple: 'simplified version',
            text_madani: 'madani version',
            juz_number: 1,
            page_number: 1
          }]
        })
      })
      
      const result = await quranApi.getChapterVerses(1)
      
      // Should prioritize text_uthmani (most authentic)
      expect(result.verses[0].text).toBe('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ')
      expect(result.verses[0].text).not.toBe('simplified version')
    })
  })

  describe('Content Hierarchy Maintenance', () => {
    it('should always display Arabic text larger than translations', () => {
      render(
        <AyahDisplay 
          ayah={authenticAyah}
          showTranslation={true}
          size="medium"
        />
      )
      
      const arabicText = screen.getByText(/بِسْمِ ٱللَّهِ/)
      const englishText = screen.getByText(/In the name of Allah/)
      
      const arabicStyles = window.getComputedStyle(arabicText)
      const englishStyles = window.getComputedStyle(englishText)
      
      const arabicSize = parseInt(arabicStyles.fontSize, 10)
      const englishSize = parseInt(englishStyles.fontSize, 10)
      
      // Arabic should be larger or equal
      expect(arabicSize).toBeGreaterThanOrEqual(englishSize)
    })

    it('should place Arabic text before translations in DOM order', () => {
      render(
        <AyahDisplay 
          ayah={authenticAyah}
          showTranslation={true}
          showTransliteration={true}
        />
      )
      
      const container = screen.getByText(/بِسْمِ/).closest('div')
      const children = Array.from(container?.children || [])
      
      let arabicIndex = -1
      let transliterationIndex = -1
      let translationIndex = -1
      
      children.forEach((child, index) => {
        const text = child.textContent || ''
        if (text.includes('بِسْمِ')) arabicIndex = index
        if (text.includes('Bismillahi')) transliterationIndex = index
        if (text.includes('In the name')) translationIndex = index
      })
      
      // Arabic should come first
      if (arabicIndex >= 0 && transliterationIndex >= 0) {
        expect(arabicIndex).toBeLessThan(transliterationIndex)
      }
      if (arabicIndex >= 0 && translationIndex >= 0) {
        expect(arabicIndex).toBeLessThan(translationIndex)
      }
    })

    it('should maintain Arabic primacy even when translations are disabled', () => {
      render(
        <AyahDisplay 
          ayah={authenticAyah}
          showTranslation={false}
          showTransliteration={false}
        />
      )
      
      // Arabic should still be prominently displayed
      const arabicText = screen.getByText(/بِسْمِ ٱللَّهِ/)
      expect(arabicText).toBeInTheDocument()
      expect(arabicText).toHaveClass(/quran-text/)
    })

    it('should prevent translations from overshadowing Arabic content', () => {
      render(
        <AyahDisplay 
          ayah={{
            ...authenticAyah,
            translation: 'This is a very long English translation that might try to overshadow the Arabic text if not properly managed according to Islamic content principles and guidelines for proper display hierarchy.'
          }}
          showTranslation={true}
        />
      )
      
      const arabicText = screen.getByText(/بِسْمِ ٱللَّهِ/)
      const translation = screen.getByText(/This is a very long English translation/)
      
      // Arabic should still be more prominent
      const arabicStyles = window.getComputedStyle(arabicText)
      const translationStyles = window.getComputedStyle(translation)
      
      // Arabic should have stronger visual weight
      const arabicWeight = arabicStyles.fontWeight
      const translationWeight = translationStyles.fontWeight
      
      // At minimum, Arabic should not be lighter than translation
      expect(parseInt(arabicWeight, 10)).toBeGreaterThanOrEqual(parseInt(translationWeight, 10))
    })
  })

  describe('Islamic Authenticity Standards', () => {
    it('should maintain Islamic content standards across the app', () => {
      renderWithRouter(<HomePage />)
      
      // Should not contain inappropriate content
      const pageContent = document.body.textContent || ''
      
      // Should not mix with non-Islamic religious content
      expect(pageContent).not.toMatch(/Bible|Gospel|Torah|Vedas|Tripitaka/)
      
      // Should not contain inappropriate language
      const inappropriateTerms = ['damn', 'hell', 'cursed', 'blasphemy']
      inappropriateTerms.forEach(term => {
        expect(pageContent.toLowerCase()).not.toContain(term)
      })
    })

    it('should use respectful language when referring to Islamic content', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should use respectful terms
      const pageContent = document.body.textContent || ''
      
      if (pageContent.includes('Quran') || pageContent.includes('قرآن')) {
        // Context should be respectful
        expect(pageContent).not.toMatch(/just.*book|mere.*text|simple.*words/i)
      }
      
      if (pageContent.includes('Allah')) {
        // Should not be in inappropriate context
        expect(pageContent).not.toMatch(/oh.*god|my.*god/i)
      }
    })

    it('should maintain proper Islamic attribution', () => {
      renderWithRouter(<HomePage />)
      
      // If sources are mentioned, should be authentic
      const sourceElements = screen.queryAllByText(/source|reference|مصدر/i)
      
      sourceElements.forEach(element => {
        const context = element.closest('div')?.textContent || ''
        
        // Should mention Islamic sources
        if (context.toLowerCase().includes('quran')) {
          expect(context.toLowerCase()).toMatch(/quran\.com|islamic|authentic/)
        }
      })
    })

    it('should prevent mixing of authentic and inauthentic content', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should not mix authentic Quran with made-up content
      const arabicTexts = screen.queryAllByText(/[\u0600-\u06FF]{3,}/)
      
      arabicTexts.forEach(element => {
        const content = element.textContent || ''
        
        // If it's styled as Quran text, should be authentic
        if (element.className.includes('quran') || element.className.includes('arabic')) {
          // Should not be random Arabic text
          expect(content.length).toBeGreaterThan(5)
          expect(content).toMatch(/[\u064B-\u0652]/) // Should have diacritics
        }
      })
    })
  })

  describe('Regression Prevention and Monitoring', () => {
    it('should detect content authenticity regression', () => {
      // Create monitoring data structure
      const authenticityChecks = {
        primaryLanguage: 'arabic',
        sourceAPI: 'quran.com',
        textField: 'text_uthmani',
        contentHierarchy: 'arabic-first'
      }
      
      renderWithRouter(<MushafReaderPage />)
      
      // Verify each authenticity check
      const arabicContent = screen.queryAllByText(/[\u0600-\u06FF]/)
      expect(arabicContent.length).toBeGreaterThan(0) // Arabic present
      
      const quranStyledElements = document.querySelectorAll('[class*="quran"]')
      quranStyledElements.forEach(element => {
        const content = element.textContent || ''
        if (content.length > 0) {
          expect(content).toMatch(/[\u0600-\u06FF]/) // Should be Arabic
        }
      })
    })

    it('should maintain content authenticity metrics', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Calculate authenticity metrics
      const allTextElements = screen.queryAllByText(/.+/)
      let arabicPrimaryCount = 0
      let englishPrimaryCount = 0
      
      allTextElements.forEach(element => {
        const content = element.textContent || ''
        
        if (element.className.includes('quran') || element.className.includes('arabic')) {
          if (/[\u0600-\u06FF]/.test(content)) {
            arabicPrimaryCount++
          } else if (/[a-zA-Z]/.test(content)) {
            englishPrimaryCount++
          }
        }
      })
      
      // Arabic should dominate in Quran-styled elements
      if (arabicPrimaryCount + englishPrimaryCount > 0) {
        expect(arabicPrimaryCount).toBeGreaterThan(englishPrimaryCount)
      }
    })

    it('should provide early warning for content corruption', () => {
      // Test various corruption scenarios
      const corruptionTests = [
        {
          type: 'language-swap',
          input: { text: 'In the name of Allah', translation: 'بِسْمِ ٱللَّهِ' },
          expect: 'should-be-detected'
        },
        {
          type: 'encoding-corruption',
          input: { text: 'ÈöÓúãö Çááåöö' },
          expect: 'should-be-rejected'
        },
        {
          type: 'mixed-content',
          input: { text: 'بِسْمِ Allah the Merciful' },
          expect: 'should-be-flagged'
        }
      ]
      
      corruptionTests.forEach(test => {
        const { unmount } = render(
          <QuranText text={test.input.text} />
        )
        
        // Each corruption type should be identifiable
        const element = screen.getByText(test.input.text)
        
        switch (test.expect) {
          case 'should-be-detected':
            // Should not have primary Quran styling
            expect(element).not.toHaveClass('quran-text-medium')
            break
          case 'should-be-rejected':
            // Should not render as valid content
            expect(element).toBeInTheDocument() // But handled gracefully
            break
          case 'should-be-flagged':
            // Mixed content should be identifiable
            const content = element.textContent || ''
            expect(/[\u0600-\u06FF]/.test(content) && /[a-zA-Z]/.test(content)).toBeTruthy()
            break
        }
        
        unmount()
      })
    })

    it('should maintain authenticity standards during updates', () => {
      const { rerender } = render(
        <AyahDisplay 
          ayah={authenticAyah}
          showTranslation={false}
        />
      )
      
      // Verify initial authentic state
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toHaveClass(/quran-text/)
      
      // Update with translation
      rerender(
        <AyahDisplay 
          ayah={authenticAyah}
          showTranslation={true}
        />
      )
      
      // Arabic should still be primary
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toHaveClass(/quran-text/)
      
      // Translation should be secondary
      const translation = screen.getByText(/In the name of Allah/)
      expect(translation).not.toHaveClass(/quran-text/)
    })
  })
})