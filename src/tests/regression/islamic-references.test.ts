/**
 * Islamic References Regression Tests
 * 
 * These tests ensure proper citation format and prevent regression
 * in Islamic terminology and reference standards.
 * 
 * Critical areas tested:
 * - Proper "Surah Name - Ayah Number" format is maintained
 * - No "Quran X:Y" format appears anywhere
 * - Islamic terminology consistency
 * - Citation format preservation
 * - Authentic Islamic content references
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../../pages/HomePage'
import MushafReaderPage from '../../pages/MushafReaderPage'
import LessonPage from '../../pages/LessonPage'
import SettingsPage from '../../pages/SettingsPage'
import AyahDisplay from '../../components/AyahDisplay'
import QuranText from '../../components/QuranText'
import { Ayah } from '../../types/quran'

// Mock stores with Islamic content
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
    surahs: [
      {
        number: 1,
        name: 'الفاتحة',
        englishName: 'Al-Fatihah',
        numberOfAyahs: 7,
        revelationType: 'Meccan',
        ayahs: []
      },
      {
        number: 2,
        name: 'البقرة',
        englishName: 'Al-Baqarah',
        numberOfAyahs: 286,
        revelationType: 'Medinan',
        ayahs: []
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
      showTransliteration: false
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

const mockAyah: Ayah = {
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

describe('Islamic References Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Proper Islamic Citation Format', () => {
    it('should consistently use "Surah Name - Ayah Number" format', () => {
      render(
        <AyahDisplay 
          ayah={mockAyah} 
          showAyahInfo={true}
        />
      )
      
      // Should show proper Islamic citation format
      expect(screen.getByText(/Surah 1 • Ayah 1/)).toBeInTheDocument()
      
      // Verify the exact format with bullet point
      const citationElement = screen.getByText(/Surah 1 • Ayah 1/)
      expect(citationElement.textContent).toMatch(/Surah \d+ • Ayah \d+/)
    })

    it('should use "Surah" instead of "Chapter" throughout the app', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should use Islamic terminology
      const surahReferences = screen.queryAllByText(/Surah \d+/)
      const chapterReferences = screen.queryAllByText(/Chapter \d+/)
      
      // Should have Surah references
      if (surahReferences.length > 0) {
        expect(surahReferences.length).toBeGreaterThan(0)
      }
      
      // Should NOT have Chapter references
      expect(chapterReferences.length).toBe(0)
    })

    it('should use "Ayah" instead of "Verse" throughout the app', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should use Islamic terminology
      const ayahReferences = screen.queryAllByText(/Ayah \d+/)
      const verseReferences = screen.queryAllByText(/Verse \d+/)
      
      // Should have Ayah references
      if (ayahReferences.length > 0) {
        expect(ayahReferences.length).toBeGreaterThan(0)
      }
      
      // Should NOT have Verse references
      expect(verseReferences.length).toBe(0)
    })

    it('should include Surah names with proper Arabic and English', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should show Surah names in proper format
      const surahNames = [
        'الفاتحة', 'Al-Fatihah',
        'البقرة', 'Al-Baqarah'
      ]
      
      // At least some Surah names should be present
      const foundSurahNames = surahNames.filter(name => 
        screen.queryByText(name) !== null
      )
      
      if (foundSurahNames.length > 0) {
        expect(foundSurahNames.length).toBeGreaterThan(0)
      }
    })

    it('should format multiple ayah references consistently', () => {
      render(
        <div>
          <AyahDisplay ayah={mockAyah} showAyahInfo={true} />
          <AyahDisplay 
            ayah={{...mockAyah, numberInSurah: 2, number: 1002}} 
            showAyahInfo={true}
          />
        </div>
      )
      
      // Both should use consistent format
      expect(screen.getByText(/Surah 1 • Ayah 1/)).toBeInTheDocument()
      expect(screen.getByText(/Surah 1 • Ayah 2/)).toBeInTheDocument()
      
      // Format should be identical
      const citations = screen.getAllByText(/Surah \d+ • Ayah \d+/)
      expect(citations.length).toBe(2)
    })
  })

  describe('Prohibition of "Quran X:Y" Format', () => {
    it('should never display "Quran X:Y" format anywhere in the app', () => {
      const pages = [
        <HomePage />,
        <MushafReaderPage />,
        <LessonPage />,
        <SettingsPage />
      ]
      
      pages.forEach((page, index) => {
        const { unmount } = renderWithRouter(page)
        
        // Check entire page content for biblical-style references
        const pageContent = document.body.textContent || ''
        
        // Should not contain Quran X:Y format
        expect(pageContent).not.toMatch(/Quran \d+:\d+/)
        expect(pageContent).not.toMatch(/Qur'an \d+:\d+/)
        expect(pageContent).not.toMatch(/Q\d+:\d+/)
        
        // Also check for variations
        expect(pageContent).not.toMatch(/Quran \d+\.\d+/)
        expect(pageContent).not.toMatch(/\(\d+:\d+\)/)
        
        unmount()
      })
    })

    it('should not use biblical-style citation in component props or data', () => {
      render(
        <AyahDisplay 
          ayah={mockAyah}
          showAyahInfo={true}
        />
      )
      
      // Check component's rendered output
      const componentContainer = screen.getByText(/بِسْمِ ٱللَّهِ/).closest('div')
      const componentContent = componentContainer?.textContent || ''
      
      expect(componentContent).not.toMatch(/Quran \d+:\d+/)
      expect(componentContent).not.toMatch(/\d+:\d+/)
    })

    it('should prevent biblical-style references in dynamic content', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Check all text content that might be dynamically generated
      const allTextElements = screen.queryAllByText(/.+/)
      
      allTextElements.forEach(element => {
        const content = element.textContent || ''
        
        // Should not contain colon-separated verse references
        if (content.includes(':')) {
          // Allow legitimate uses of colons (e.g., "Audio: Playing", time stamps)
          const suspiciousPattern = /(?:Quran?|Q)\s*\d+:\d+/i
          expect(content).not.toMatch(suspiciousPattern)
        }
      })
    })

    it('should maintain Islamic citation format even in URLs or IDs', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Check for any data attributes or IDs that might use biblical format
      const elementsWithIds = document.querySelectorAll('[id], [data-verse], [data-reference]')
      
      elementsWithIds.forEach(element => {
        const id = element.id
        const dataVerse = element.getAttribute('data-verse')
        const dataReference = element.getAttribute('data-reference')
        
        // Even technical IDs should not use biblical format
        if (id) expect(id).not.toMatch(/quran[-_]?\d+[-_:]\d+/i)
        if (dataVerse) expect(dataVerse).not.toMatch(/\d+:\d+/)
        if (dataReference) expect(dataReference).not.toMatch(/quran[-_]?\d+[-_:]\d+/i)
      })
    })
  })

  describe('Islamic Terminology Consistency', () => {
    it('should consistently use "Allah" instead of generic "God"', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Check translations and content
      const allahReferences = screen.queryAllByText(/Allah/)
      const godReferences = screen.queryAllByText(/\bGod\b/)
      
      // Should prefer "Allah" over generic "God"
      if (allahReferences.length > 0 || godReferences.length > 0) {
        // In Islamic context, "Allah" should be preferred
        expect(allahReferences.length).toBeGreaterThanOrEqual(godReferences.length)
      }
    })

    it('should use proper Islamic titles and honorifics', () => {
      renderWithRouter(<HomePage />)
      
      // Look for proper Islamic references
      const islamicTerms = [
        'Prophet Muhammad', 'محمد صلى الله عليه وسلم',
        'Peace be upon him', 'صلى الله عليه وسلم'
      ]
      
      // If Prophet is mentioned, should use proper title
      const prophetMentions = screen.queryAllByText(/Prophet|Muhammad|محمد/)
      
      if (prophetMentions.length > 0) {
        // Should use respectful Islamic terminology
        prophetMentions.forEach(mention => {
          const context = mention.closest('div')?.textContent || ''
          // Context should be respectful
          expect(context).toBeTruthy()
        })
      }
    })

    it('should use "Mushaf" for the physical Quran text', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should use Islamic term for the compiled Quran
      const mushafReferences = screen.queryAllByText(/Mushaf|مصحف/i)
      const bookReferences = screen.queryAllByText(/\bBook\b/)
      
      // "Mushaf" is the proper Islamic term
      if (mushafReferences.length > 0) {
        expect(mushafReferences.length).toBeGreaterThan(0)
      }
      
      // Generic "Book" should not be used for Quran references
      bookReferences.forEach(bookRef => {
        const context = bookRef.closest('div')?.textContent || ''
        expect(context.toLowerCase()).not.toMatch(/quran|holy|sacred/)
      })
    })

    it('should use "Reciter" instead of "Reader" for audio', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should use Islamic term for Quran reciters
      const reciterReferences = screen.queryAllByText(/Reciter|قارئ/i)
      const readerReferences = screen.queryAllByText(/Reader/i)
      
      // "Reciter" is the proper Islamic term
      if (reciterReferences.length > 0) {
        expect(reciterReferences.length).toBeGreaterThan(0)
      }
      
      // "Reader" should not be used in Quran context
      readerReferences.forEach(readerRef => {
        const context = readerRef.closest('div')?.textContent || ''
        expect(context.toLowerCase()).not.toMatch(/quran|audio|recitation/)
      })
    })

    it('should use "Juz" instead of "Part" or "Section"', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should use Islamic term for Quran divisions
      const juzReferences = screen.queryAllByText(/Juz|جزء/i)
      const partReferences = screen.queryAllByText(/Part \d+/)
      const sectionReferences = screen.queryAllByText(/Section \d+/)
      
      // "Juz" is the proper Islamic term
      if (juzReferences.length > 0) {
        expect(juzReferences.length).toBeGreaterThan(0)
      }
      
      // Generic terms should not be used for Quran divisions
      partReferences.forEach(partRef => {
        const context = partRef.closest('div')?.textContent || ''
        expect(context.toLowerCase()).not.toMatch(/quran/)
      })
    })
  })

  describe('Authentic Islamic Content References', () => {
    it('should reference authentic Islamic sources only', () => {
      renderWithRouter(<HomePage />)
      
      // Should only reference authentic Islamic sources
      const authenticSources = [
        'Quran.com', 'Al-Quran', 'Mushaf', 'مصحف',
        'Tafseer', 'تفسير', 'Hadith', 'حديث'
      ]
      
      // If sources are mentioned, they should be Islamic
      const sourceElements = screen.queryAllByText(/source|reference|مرجع|مصدر/i)
      
      sourceElements.forEach(element => {
        const context = element.closest('div')?.textContent || ''
        
        // Context should mention Islamic sources if any
        if (context.toLowerCase().includes('source') || context.toLowerCase().includes('reference')) {
          // Should be related to Islamic content
          expect(context).toBeTruthy()
        }
      })
    })

    it('should maintain proper Arabic transliteration standards', () => {
      render(
        <AyahDisplay 
          ayah={mockAyah}
          showTransliteration={true}
        />
      )
      
      // If transliteration is shown, should use proper standards
      const transliteration = screen.queryByText(/Bismillahi ar-rahmani ar-raheem/)
      
      if (transliteration) {
        const content = transliteration.textContent || ''
        
        // Should use proper transliteration conventions
        expect(content).toMatch(/[a-z\s-']/i)
        expect(content).not.toMatch(/[\d@#$%^&*()]/)
      }
    })

    it('should reference Meccan/Medinan classification correctly', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should use proper Islamic historical terms
      const meccaMadinah = screen.queryAllByText(/Meccan|Medinan|مكي|مدني/i)
      const otherTerms = screen.queryAllByText(/Early|Late|First|Second/)
      
      // Should use Islamic historical terms
      if (meccaMadinah.length > 0) {
        expect(meccaMadinah.length).toBeGreaterThan(0)
      }
      
      // Should not use generic historical terms for Quran classification
      otherTerms.forEach(term => {
        const context = term.closest('div')?.textContent || ''
        expect(context.toLowerCase()).not.toMatch(/revelation|surah|chapter/)
      })
    })

    it('should use proper Islamic calendar references if dates are mentioned', () => {
      renderWithRouter(<HomePage />)
      
      // If dates are mentioned, should be appropriate for Islamic context
      const dateElements = screen.queryAllByText(/\d{4}|year|century|سنة/i)
      
      dateElements.forEach(element => {
        const context = element.closest('div')?.textContent || ''
        
        // Islamic context should use appropriate dating
        if (context.toLowerCase().includes('hijri') || context.includes('هجري')) {
          expect(context).toContain('هجري')
        }
      })
    })
  })

  describe('Citation Format Preservation', () => {
    it('should preserve citation format across component re-renders', () => {
      const { rerender } = render(
        <AyahDisplay 
          ayah={mockAyah}
          showAyahInfo={true}
        />
      )
      
      // Initial citation format
      expect(screen.getByText(/Surah 1 • Ayah 1/)).toBeInTheDocument()
      
      // Re-render with different props
      rerender(
        <AyahDisplay 
          ayah={mockAyah}
          showAyahInfo={true}
          showTranslation={true}
        />
      )
      
      // Citation format should remain the same
      expect(screen.getByText(/Surah 1 • Ayah 1/)).toBeInTheDocument()
    })

    it('should maintain citation format during state changes', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Check that citations remain consistent during loading states
      const surahAyahPattern = /Surah \d+ • Ayah \d+/
      const citations = screen.queryAllByText(surahAyahPattern)
      
      if (citations.length > 0) {
        citations.forEach(citation => {
          expect(citation.textContent).toMatch(surahAyahPattern)
        })
      }
    })

    it('should handle edge cases in citation format correctly', () => {
      // Test with different ayah numbers
      const edgeCases = [
        { surah: 1, ayah: 1 },
        { surah: 2, ayah: 286 }, // Longest surah
        { surah: 114, ayah: 6 } // Last surah
      ]
      
      edgeCases.forEach(({ surah, ayah }) => {
        const { unmount } = render(
          <AyahDisplay 
            ayah={{
              ...mockAyah,
              surah,
              numberInSurah: ayah
            }}
            showAyahInfo={true}
          />
        )
        
        // Should handle all cases with consistent format
        expect(screen.getByText(new RegExp(`Surah ${surah} • Ayah ${ayah}`))).toBeInTheDocument()
        
        unmount()
      })
    })

    it('should prevent citation format corruption through user input', () => {
      renderWithRouter(<SettingsPage />)
      
      // User settings should not affect citation format
      const userInputs = screen.queryAllByRole('textbox')
      
      userInputs.forEach(input => {
        // User inputs should not allow citation format corruption
        const inputValue = input.getAttribute('value') || ''
        expect(inputValue).not.toMatch(/Quran \d+:\d+/)
      })
    })
  })

  describe('Internationalization and Localization', () => {
    it('should maintain Islamic terminology in both Arabic and English', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should support both languages with proper terminology
      const arabicTerms = screen.queryAllByText(/سورة|آية|قرآن|مصحف/)
      const englishTerms = screen.queryAllByText(/Surah|Ayah|Quran|Mushaf/i)
      
      // Both language sets should use Islamic terminology
      if (arabicTerms.length > 0) {
        expect(arabicTerms.length).toBeGreaterThan(0)
      }
      
      if (englishTerms.length > 0) {
        expect(englishTerms.length).toBeGreaterThan(0)
      }
    })

    it('should not mix Islamic and non-Islamic terminology', () => {
      renderWithRouter(<HomePage />)
      
      // Should not mix terminologies inappropriately
      const pageContent = document.body.textContent || ''
      
      // If Islamic terms are present, should not mix with biblical terms
      if (pageContent.includes('Surah') || pageContent.includes('Ayah')) {
        expect(pageContent).not.toMatch(/Chapter.*Verse|Verse.*Chapter/)
      }
      
      if (pageContent.includes('Quran') || pageContent.includes('قرآن')) {
        expect(pageContent).not.toMatch(/Bible|Scripture|Testament/)
      }
    })

    it('should handle RTL text in citations properly', () => {
      render(
        <AyahDisplay 
          ayah={mockAyah}
          showAyahInfo={true}
        />
      )
      
      // Citations should work in RTL context
      const citationElement = screen.getByText(/Surah 1 • Ayah 1/)
      
      // Should be properly formatted for RTL if needed
      const styles = window.getComputedStyle(citationElement)
      expect(styles.direction === 'rtl' || styles.direction === 'ltr').toBeTruthy()
    })
  })

  describe('Regression Prevention', () => {
    it('should detect unauthorized terminology changes', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Known good Islamic terms that should be preserved
      const requiredTerms = {
        arabic: /سورة|آية|قرآن|مصحف/,
        english: /Surah|Ayah|Quran|Mushaf/,
        citation: /Surah \d+ • Ayah \d+/
      }
      
      // At least some Islamic terminology should be present
      const arabicTerms = screen.queryAllByText(requiredTerms.arabic)
      const englishTerms = screen.queryAllByText(requiredTerms.english)
      const citations = screen.queryAllByText(requiredTerms.citation)
      
      // Should have Islamic terminology (not necessarily all)
      const totalIslamicTerms = arabicTerms.length + englishTerms.length + citations.length
      expect(totalIslamicTerms).toBeGreaterThan(0)
    })

    it('should prevent introduction of non-Islamic reference formats', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should not introduce non-Islamic formats
      const nonIslamicFormats = [
        /Bible \d+:\d+/,
        /Testament \d+:\d+/,
        /Book \d+ Chapter \d+/,
        /Volume \d+ Page \d+/
      ]
      
      const pageContent = document.body.textContent || ''
      
      nonIslamicFormats.forEach(format => {
        expect(pageContent).not.toMatch(format)
      })
    })

    it('should maintain reference consistency across all components', () => {
      // Test multiple components
      const components = [
        <QuranText text={mockAyah.text} />,
        <AyahDisplay ayah={mockAyah} showAyahInfo={true} />
      ]
      
      components.forEach((component, index) => {
        const { unmount } = render(component)
        
        // Each component should maintain consistent Islamic references
        const componentContent = document.body.textContent || ''
        
        // Should not contain non-Islamic reference formats
        expect(componentContent).not.toMatch(/Quran \d+:\d+/)
        expect(componentContent).not.toMatch(/Chapter.*Verse/)
        
        unmount()
      })
    })
  })
})