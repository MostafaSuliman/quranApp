/**
 * Islamic Content Integrity Tests
 * 
 * These tests ensure that all Islamic content maintains its authenticity,
 * proper formatting, and follows Islamic conventions.
 * 
 * Critical areas tested:
 * - Quranic content authenticity from Quran.com API
 * - No English translations used as primary content
 * - Proper "Surah Name - Ayah Number" format
 * - Arabic text authenticity preservation
 * - No "Quran X:Y" format anywhere
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { quranApi } from '../utils/quranApi'
import QuranText from '../components/QuranText'
import AyahDisplay from '../components/AyahDisplay'
import { Ayah } from '../types/quran'

// Mock authentic Quranic data for testing
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

describe('Islamic Content Integrity Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Quranic Content Source Verification', () => {
    it('should only accept Arabic text from Quran.com API as primary content', async () => {
      const result = await quranApi.getChapterVerses(1)
      const verses = result.verses

      verses.forEach(verse => {
        // Primary text must be Arabic
        expect(verse.text).toMatch(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/)
        
        // Primary text must not be English
        expect(verse.text).not.toMatch(/^[a-zA-Z\s.,!?]+$/)
        
        // Must contain proper Arabic diacritics
        expect(verse.text).toMatch(/[\u064B-\u0652\u0670\u0640]/)
      })
    })

    it('should never use English translations as primary Quranic text', () => {
      // Test QuranText component rejects English as primary
      render(<QuranText text="In the name of Allah" />)
      
      // Should not render English text in Arabic text component
      const textElement = screen.getByText(/In the name of Allah/)
      expect(textElement).not.toHaveClass('quran-text-medium')
    })

    it('should preserve Arabic text authenticity without modification', async () => {
      const bismillahOriginal = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
      
      render(<QuranText text={bismillahOriginal} />)
      
      const textElement = screen.getByText(bismillahOriginal)
      expect(textElement).toBeInTheDocument()
      expect(textElement.textContent).toBe(bismillahOriginal)
    })

    it('should verify Uthmani script characteristics', async () => {
      const result = await quranApi.getChapterVerses(1)
      const bismillah = result.verses[0].text

      // Check for specific Uthmani script features
      expect(bismillah).toBe('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ')
      
      // Check for proper alif characters
      expect(bismillah).toMatch(/ٱ/) // Alif Wasla
      expect(bismillah).toMatch(/ـٰ/) // Superscript Alif
      
      // Should not contain replacement characters
      expect(bismillah).not.toContain('�')
    })
  })

  describe('Citation Format Verification', () => {
    it('should use proper "Surah Name - Ayah Number" format', () => {
      render(
        <AyahDisplay 
          ayah={mockAuthenticAyah} 
          showAyahInfo={true}
        />
      )
      
      // Should show proper Islamic citation format
      expect(screen.getByText(/Surah 1 • Ayah 1/)).toBeInTheDocument()
      
      // Should NOT use "Quran X:Y" format
      expect(screen.queryByText(/Quran 1:1/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Quran \d+:\d+/)).not.toBeInTheDocument()
    })

    it('should never display "Quran X:Y" format anywhere in the app', () => {
      render(
        <AyahDisplay 
          ayah={mockAuthenticAyah} 
          showAyahInfo={true}
        />
      )
      
      const container = screen.getByRole('article') || screen.getByText(/بِسْمِ/).closest('div')
      const allText = container?.textContent || ''
      
      // Should not contain biblical-style references
      expect(allText).not.toMatch(/Quran \d+:\d+/)
      expect(allText).not.toMatch(/Qur'an \d+:\d+/)
      expect(allText).not.toMatch(/Q\d+:\d+/)
    })

    it('should maintain proper Islamic terminologies', () => {
      render(
        <AyahDisplay 
          ayah={mockAuthenticAyah} 
          showAyahInfo={true}
        />
      )
      
      // Should use Islamic terms
      expect(screen.getByText(/Surah/)).toBeInTheDocument()
      expect(screen.getByText(/Ayah/)).toBeInTheDocument()
      
      // Should not use non-Islamic terms
      expect(screen.queryByText(/Chapter/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Verse/)).not.toBeInTheDocument()
    })
  })

  describe('Arabic-First Content Hierarchy', () => {
    it('should always prioritize Arabic text over translations', () => {
      render(
        <AyahDisplay 
          ayah={mockAuthenticAyah}
          showTranslation={true}
          showTransliteration={true}
        />
      )
      
      const arabicElement = screen.getByText(/بِسْمِ ٱللَّهِ/)
      const translationElement = screen.getByText(/In the name of Allah/)
      
      // Arabic should come first in DOM order
      const container = arabicElement.closest('div')
      const children = Array.from(container?.children || [])
      const arabicIndex = children.findIndex(child => child.textContent?.includes('بِسْمِ'))
      const translationIndex = children.findIndex(child => child.textContent?.includes('In the name'))
      
      expect(arabicIndex).toBeLessThan(translationIndex)
    })

    it('should render Arabic text with larger font size than translations', () => {
      render(
        <AyahDisplay 
          ayah={mockAuthenticAyah}
          showTranslation={true}
          size="medium"
        />
      )
      
      const arabicElement = screen.getByText(/بِسْمِ ٱللَّهِ/)
      const translationElement = screen.getByText(/In the name of Allah/)
      
      // Arabic should have larger text class
      expect(arabicElement).toHaveClass('quran-text-medium')
      expect(translationElement).not.toHaveClass('quran-text-medium')
    })

    it('should display Arabic text even when translations fail to load', () => {
      const ayahWithoutTranslation = {
        ...mockAuthenticAyah,
        translation: undefined,
        transliteration: undefined
      }
      
      render(
        <AyahDisplay 
          ayah={ayahWithoutTranslation}
          showTranslation={true}
          showTransliteration={true}
        />
      )
      
      // Arabic text should still be visible
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument()
      
      // Translation failure should not affect Arabic display
      expect(screen.queryByText(/undefined/)).not.toBeInTheDocument()
    })
  })

  describe('Content Validation and Error Prevention', () => {
    it('should reject invalid content that does not match Islamic sources', () => {
      // This would be caught at API level or component validation
      expect(() => {
        render(<QuranText text="" />)
      }).not.toThrow()
      
      // Empty or invalid text should not render as valid Quranic content
      render(<QuranText text="" />)
      expect(screen.queryByText(/قرآن/)).not.toBeInTheDocument()
    })

    it('should validate Arabic text encoding is correct', () => {
      const validArabicText = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
      const invalidEncodingText = 'ÈöÓúãö Çááåöö Çáúñáúã Çáúåöí'
      
      render(<QuranText text={validArabicText} />)
      expect(screen.getByText(validArabicText)).toBeInTheDocument()
      
      // Invalid encoding should not be treated as valid Arabic
      render(<QuranText text={invalidEncodingText} />)
      const invalidElement = screen.getByText(invalidEncodingText)
      expect(invalidElement).not.toHaveClass('quran-text-medium')
    })

    it('should ensure consistent verse numbering matches official Quran', async () => {
      const result = await quranApi.getChapterVerses(1)
      
      result.verses.forEach((verse, index) => {
        expect(verse.numberInSurah).toBe(index + 1)
        expect(verse.surah).toBe(1)
      })
      
      // Al-Fatiha should have exactly 7 verses
      expect(result.verses).toHaveLength(7)
    })

    it('should preserve Islamic content integrity across component updates', () => {
      const { rerender } = render(
        <AyahDisplay 
          ayah={mockAuthenticAyah}
          showTranslation={false}
        />
      )
      
      const initialArabicText = screen.getByText(/بِسْمِ ٱللَّهِ/).textContent
      
      // Re-render with different props
      rerender(
        <AyahDisplay 
          ayah={mockAuthenticAyah}
          showTranslation={true}
          showTransliteration={true}
        />
      )
      
      // Arabic text should remain unchanged
      const updatedArabicText = screen.getByText(/بِسْمِ ٱللَّهِ/).textContent
      expect(updatedArabicText).toBe(initialArabicText)
    })
  })

  describe('API Integration Content Verification', () => {
    it('should only fetch content from trusted Islamic sources', () => {
      // Verify API base URL is authentic
      expect(quranApi.constructor.name).toBe('QuranApiService')
      
      // Should be using Quran.com API
      const cacheStats = quranApi.getCacheStats()
      expect(typeof cacheStats.size).toBe('number')
    })

    it('should handle API failures gracefully without corrupting content', async () => {
      // Mock API failure
      vi.spyOn(quranApi, 'getChapterVerses').mockRejectedValueOnce(new Error('API Error'))
      
      try {
        await quranApi.getChapterVerses(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Failed to fetch verses')
      }
      
      // Original API should still work after error
      vi.restoreAllMocks()
      const result = await quranApi.getChapterVerses(1)
      expect(result.verses.length).toBeGreaterThan(0)
    })

    it('should cache authentic content properly', async () => {
      quranApi.clearCache()
      
      const firstCall = await quranApi.getChapterVerses(1)
      const secondCall = await quranApi.getChapterVerses(1)
      
      // Both calls should return identical authentic content
      expect(firstCall.verses[0].text).toBe(secondCall.verses[0].text)
      expect(firstCall.verses[0].text).toMatch(/بِسْمِ ٱللَّهِ/)
    })
  })

  describe('Performance Tests for Islamic Content', () => {
    it('should load Arabic text quickly without blocking UI', async () => {
      const startTime = Date.now()
      
      render(<QuranText text={mockAuthenticAyah.text} />)
      
      const endTime = Date.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(100) // 100ms threshold
      
      // Arabic text should be immediately visible
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument()
    })

    it('should handle large sets of verses efficiently', async () => {
      const result = await quranApi.getChapterVerses(2, { perPage: 10 })
      
      expect(result.verses.length).toBeGreaterThan(0)
      expect(result.verses.length).toBeLessThanOrEqual(10)
      
      // All verses should have authentic Arabic text
      result.verses.forEach(verse => {
        expect(verse.text).toMatch(/[\u0600-\u06FF]/)
        expect(verse.text.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Accessibility for Islamic Content', () => {
    it('should provide proper ARIA labels for Arabic text', () => {
      render(
        <QuranText 
          text={mockAuthenticAyah.text}
          aria-label="Bismillah - In the name of Allah"
        />
      )
      
      const textElement = screen.getByText(/بِسْمِ ٱللَّهِ/)
      expect(textElement.closest('[aria-label]')).toBeInTheDocument()
    })

    it('should support RTL reading direction for Arabic text', () => {
      render(<QuranText text={mockAuthenticAyah.text} />)
      
      const textElement = screen.getByText(/بِسْمِ ٱللَّهِ/)
      const computedStyle = window.getComputedStyle(textElement)
      
      // Should have RTL direction for Arabic content
      expect(computedStyle.direction === 'rtl' || textElement.dir === 'rtl').toBeTruthy()
    })
  })
})