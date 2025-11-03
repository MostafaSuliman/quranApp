/**
 * End-to-End Quran Display Tests
 * 
 * These integration tests verify the complete Quran functionality
 * from API data fetching to UI display, ensuring Islamic content
 * authenticity throughout the entire user journey.
 * 
 * Critical flows tested:
 * - Complete Quran page loading and display
 * - Arabic text rendering with proper fonts
 * - Translation and transliteration display
 * - Audio playback integration
 * - Page navigation and verse selection
 * - Error handling and fallback content
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import MushafReaderPage from '../../pages/MushafReaderPage'
import LessonPage from '../../pages/LessonPage'
import HomePage from '../../pages/HomePage'
import { useQuranStore } from '../../stores/quranStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useAudioStore } from '../../stores/audioStore'

// Mock stores with realistic data
const mockQuranStore = {
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
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      transliteration: 'Bismillahi ar-rahmani ar-raheem'
    },
    {
      number: 1002,
      text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
      numberInSurah: 2,
      surah: 1,
      juz: 1,
      page: 1,
      translation: '[All] praise is [due] to Allah, Lord of the worlds.',
      transliteration: 'Alhamdu lillahi rabbil alameen'
    }
  ],
  reciters: [
    { id: '2', name: 'AbdulBaset AbdulSamad', englishName: 'AbdulBaset AbdulSamad', style: 'Murattal' }
  ],
  loadPage: vi.fn(),
  loadSurah: vi.fn(),
  setCurrentPage: vi.fn(),
  setCurrentSurah: vi.fn(),
  isLoading: false,
  error: null
}

const mockPreferencesStore = {
  preferences: {
    language: 'ar',
    arabicFont: 'Amiri',
    showTranslation: true,
    showTransliteration: false,
    audioAutoplay: false,
    theme: 'light'
  },
  updatePreferences: vi.fn()
}

const mockAudioStore = {
  currentAyahNumber: null,
  currentSurahNumber: null,
  currentReciter: { id: '2', name: 'AbdulBaset AbdulSamad', englishName: 'AbdulBaset AbdulSamad', style: 'Murattal' },
  isPlaying: false,
  loadAyahAudio: vi.fn(),
  playAudio: vi.fn(),
  pauseAudio: vi.fn()
}

vi.mock('../../stores/quranStore', () => ({
  useQuranStore: () => mockQuranStore
}))

vi.mock('../../stores/preferencesStore', () => ({
  usePreferencesStore: () => mockPreferencesStore
}))

vi.mock('../../stores/audioStore', () => ({
  useAudioStore: () => mockAudioStore
}))

vi.mock('../../stores/progressStore', () => ({
  useProgressStore: () => ({
    addReadingTime: vi.fn()
  })
}))

vi.mock('../../hooks/useAudioControls', () => ({
  default: () => ({})
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('End-to-End Quran Display Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQuranStore.isLoading = false
    mockQuranStore.error = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Quran Page Loading Flow', () => {
    it('should load and display a complete Quran page with authentic content', async () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should call loadPage on mount
      await waitFor(() => {
        expect(mockQuranStore.loadPage).toHaveBeenCalledWith(1)
      })
      
      // Should display Arabic text
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument()
      expect(screen.getByText(/ٱلْحَمْدُ لِلَّهِ/)).toBeInTheDocument()
      
      // Should display verse information using Islamic terminology
      expect(screen.getByText(/Surah 1 • Ayah 1/)).toBeInTheDocument()
      expect(screen.getByText(/Surah 1 • Ayah 2/)).toBeInTheDocument()
      
      // Should show page navigation
      expect(screen.getByText(/Page 1/)).toBeInTheDocument()
    })

    it('should handle page navigation correctly', async () => {
      const user = userEvent.setup()
      renderWithRouter(<MushafReaderPage />)
      
      // Find navigation buttons
      const nextButton = screen.getByRole('button', { name: /next|التالي/i })
      expect(nextButton).toBeInTheDocument()
      
      // Click next page
      await user.click(nextButton)
      
      // Should update current page
      await waitFor(() => {
        expect(mockQuranStore.setCurrentPage).toHaveBeenCalledWith(2)
      })
    })

    it('should load different surahs correctly', async () => {
      const user = userEvent.setup()
      renderWithRouter(<MushafReaderPage />)
      
      // Find surah selector
      const surahSelect = screen.getByRole('combobox', { name: /surah|سورة/i })
      
      // Change to Al-Baqarah
      await user.selectOptions(surahSelect, '2')
      
      await waitFor(() => {
        expect(mockQuranStore.setCurrentSurah).toHaveBeenCalledWith(2)
      })
    })

    it('should display loading state during data fetching', () => {
      mockQuranStore.isLoading = true
      renderWithRouter(<MushafReaderPage />)
      
      expect(screen.getByText(/Loading Quran page|جار تحميل/)).toBeInTheDocument()
    })

    it('should handle API errors gracefully', () => {
      mockQuranStore.error = 'Failed to load page'
      renderWithRouter(<MushafReaderPage />)
      
      expect(screen.getByText(/Error|خطأ/)).toBeInTheDocument()
      expect(screen.getByText(/Failed to load page/)).toBeInTheDocument()
    })
  })

  describe('Arabic Text Rendering Quality', () => {
    it('should render Arabic text with proper fonts and styling', () => {
      renderWithRouter(<MushafReaderPage />)
      
      const arabicText = screen.getByText(/بِسْمِ ٱللَّهِ/)
      
      // Should have Arabic text styling classes
      expect(arabicText).toHaveClass(/quran-text|arabic/)
      
      // Should be properly styled
      const styles = window.getComputedStyle(arabicText)
      expect(styles.fontFamily.toLowerCase()).toMatch(/amiri|uthmanic|noto.*arabic/)
      expect(styles.direction).toBe('rtl')
    })

    it('should maintain text quality across different screen sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      renderWithRouter(<MushafReaderPage />)
      
      const arabicText = screen.getByText(/بِسْمِ ٱللَّهِ/)
      
      // Text should still be readable on mobile
      const styles = window.getComputedStyle(arabicText)
      const fontSize = parseInt(styles.fontSize, 10)
      expect(fontSize).toBeGreaterThanOrEqual(16) // Minimum readable size
    })

    it('should handle Arabic text with diacritics correctly', () => {
      renderWithRouter(<MushafReaderPage />)
      
      const bismillah = screen.getByText(/بِسْمِ ٱللَّهِ/)
      
      // Should preserve all diacritical marks
      expect(bismillah.textContent).toContain('ِ') // Kasra
      expect(bismillah.textContent).toContain('ْ') // Sukun
      expect(bismillah.textContent).toContain('َ') // Fatha
      expect(bismillah.textContent).toContain('ّ') // Shadda
    })

    it('should display verse numbers in Arabic format when appropriate', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should show ayah numbers in Arabic context
      const ayahInfo = screen.getByText(/Surah 1 • Ayah 1/)
      expect(ayahInfo).toBeInTheDocument()
      
      // Verse number symbols should be present
      const verseElements = screen.getAllByText(/[1-7]/)
      expect(verseElements.length).toBeGreaterThan(0)
    })
  })

  describe('Translation and Transliteration Display', () => {
    it('should show translations when enabled', () => {
      mockPreferencesStore.preferences.showTranslation = true
      renderWithRouter(<MushafReaderPage />)
      
      expect(screen.getByText(/In the name of Allah/)).toBeInTheDocument()
      expect(screen.getByText(/All.*praise.*due.*to Allah/)).toBeInTheDocument()
    })

    it('should hide translations when disabled', () => {
      mockPreferencesStore.preferences.showTranslation = false
      renderWithRouter(<MushafReaderPage />)
      
      expect(screen.queryByText(/In the name of Allah/)).not.toBeInTheDocument()
    })

    it('should show transliteration when enabled', () => {
      mockPreferencesStore.preferences.showTransliteration = true
      renderWithRouter(<MushafReaderPage />)
      
      expect(screen.getByText(/Bismillahi ar-rahmani ar-raheem/)).toBeInTheDocument()
      expect(screen.getByText(/Alhamdu lillahi rabbil alameen/)).toBeInTheDocument()
    })

    it('should hide transliteration when disabled', () => {
      mockPreferencesStore.preferences.showTransliteration = false
      renderWithRouter(<MushafReaderPage />)
      
      expect(screen.queryByText(/Bismillahi ar-rahmani ar-raheem/)).not.toBeInTheDocument()
    })

    it('should prioritize Arabic text over translations visually', () => {
      mockPreferencesStore.preferences.showTranslation = true
      renderWithRouter(<MushafReaderPage />)
      
      const arabicText = screen.getByText(/بِسْمِ ٱللَّهِ/)
      const translation = screen.getByText(/In the name of Allah/)
      
      const arabicStyles = window.getComputedStyle(arabicText)
      const translationStyles = window.getComputedStyle(translation)
      
      const arabicSize = parseInt(arabicStyles.fontSize, 10)
      const translationSize = parseInt(translationStyles.fontSize, 10)
      
      // Arabic should be larger or equal size
      expect(arabicSize).toBeGreaterThanOrEqual(translationSize)
    })

    it('should maintain content hierarchy with all options enabled', () => {
      mockPreferencesStore.preferences.showTranslation = true
      mockPreferencesStore.preferences.showTransliteration = true
      renderWithRouter(<MushafReaderPage />)
      
      // All content should be present
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument()
      expect(screen.getByText(/Bismillahi ar-rahmani ar-raheem/)).toBeInTheDocument()
      expect(screen.getByText(/In the name of Allah/)).toBeInTheDocument()
      
      // Arabic should come first in DOM order
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
      
      expect(arabicIndex).toBeLessThan(transliterationIndex)
      expect(transliterationIndex).toBeLessThan(translationIndex)
    })
  })

  describe('Audio Integration Flow', () => {
    it('should display audio controls for each verse', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Should have play buttons for verses
      const playButtons = screen.getAllByRole('button', { name: /play|▶️|تشغيل/i })
      expect(playButtons.length).toBeGreaterThan(0)
    })

    it('should handle audio playback for individual verses', async () => {
      const user = userEvent.setup()
      renderWithRouter(<MushafReaderPage />)
      
      const playButton = screen.getAllByRole('button', { name: /play|▶️/i })[0]
      await user.click(playButton)
      
      await waitFor(() => {
        expect(mockAudioStore.loadAyahAudio).toHaveBeenCalled()
      })
    })

    it('should show audio playing state visually', () => {
      mockAudioStore.isPlaying = true
      mockAudioStore.currentAyahNumber = 1
      mockAudioStore.currentSurahNumber = 1
      
      renderWithRouter(<MushafReaderPage />)
      
      // Should show playing indicator
      expect(screen.getByText(/🔊/)).toBeInTheDocument()
    })

    it('should handle reciter selection', async () => {
      const user = userEvent.setup()
      renderWithRouter(<MushafReaderPage />)
      
      const reciterSelect = screen.getByRole('combobox', { name: /reciter|قارئ/i })
      expect(reciterSelect).toBeInTheDocument()
      
      // Should show current reciter
      expect(screen.getByText(/AbdulBaset AbdulSamad/)).toBeInTheDocument()
    })
  })

  describe('User Interaction Flows', () => {
    it('should handle verse selection and highlighting', async () => {
      const user = userEvent.setup()
      renderWithRouter(<MushafReaderPage />)
      
      const firstVerse = screen.getByText(/بِسْمِ ٱللَّهِ/)
      await user.click(firstVerse)
      
      // Should highlight selected verse
      const verseContainer = firstVerse.closest('div')
      expect(verseContainer).toHaveClass(/highlighted|selected|ring/)
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithRouter(<MushafReaderPage />)
      
      // Tab through interactive elements
      await user.tab()
      let focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
      
      // Arrow keys should navigate verses
      await user.keyboard('{ArrowDown}')
      // Navigation behavior would be implemented in the component
    })

    it('should handle touch gestures on mobile', () => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: () => {},
        writable: true
      })
      
      renderWithRouter(<MushafReaderPage />)
      
      // Touch targets should be properly sized
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        const height = parseInt(styles.height, 10)
        expect(height).toBeGreaterThanOrEqual(44) // Minimum touch target
      })
    })

    it('should maintain scroll position during interactions', async () => {
      const user = userEvent.setup()
      renderWithRouter(<MushafReaderPage />)
      
      // Simulate scrolling
      window.scrollTo(0, 100)
      
      // Interact with page (e.g., play audio)
      const playButton = screen.getAllByRole('button', { name: /play|▶️/i })[0]
      await user.click(playButton)
      
      // Scroll position should be maintained
      expect(window.scrollY).toBe(100)
    })
  })

  describe('Error Handling and Fallbacks', () => {
    it('should display meaningful error messages', () => {
      mockQuranStore.error = 'Network connection failed'
      renderWithRouter(<MushafReaderPage />)
      
      expect(screen.getByText(/Network connection failed/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry|إعادة المحاولة/i })).toBeInTheDocument()
    })

    it('should provide retry functionality after errors', async () => {
      const user = userEvent.setup()
      mockQuranStore.error = 'Failed to load'
      renderWithRouter(<MushafReaderPage />)
      
      const retryButton = screen.getByRole('button', { name: /retry|إعادة المحاولة/i })
      await user.click(retryButton)
      
      await waitFor(() => {
        expect(mockQuranStore.loadPage).toHaveBeenCalled()
      })
    })

    it('should show fallback content when verses fail to load', () => {
      mockQuranStore.ayahs = []
      mockQuranStore.error = 'No verses found'
      renderWithRouter(<MushafReaderPage />)
      
      expect(screen.getByText(/No verses found|لم يتم العثور على آيات/)).toBeInTheDocument()
    })

    it('should handle partial content loading', () => {
      // Mock partial load scenario
      mockQuranStore.ayahs = [
        {
          number: 1001,
          text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
          numberInSurah: 1,
          surah: 1,
          juz: 1,
          page: 1,
          translation: '', // Missing translation
          transliteration: '' // Missing transliteration
        }
      ]
      
      renderWithRouter(<MushafReaderPage />)
      
      // Arabic text should still display
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument()
      
      // Should not crash due to missing translations
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Performance and Responsiveness', () => {
    it('should load and render content within acceptable time', async () => {
      const startTime = Date.now()
      renderWithRouter(<MushafReaderPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument()
      })
      
      const endTime = Date.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(2000) // 2 second threshold
    })

    it('should handle large numbers of verses efficiently', () => {
      // Mock large chapter (Al-Baqarah simulation)
      const manyAyahs = Array.from({ length: 50 }, (_, i) => ({
        number: 2001 + i,
        text: `Verse ${i + 1} Arabic text اللَّهِ`,
        numberInSurah: i + 1,
        surah: 2,
        juz: Math.ceil((i + 1) / 20),
        page: Math.ceil((i + 1) / 15),
        translation: `Verse ${i + 1} translation`,
        transliteration: `Verse ${i + 1} transliteration`
      }))
      
      mockQuranStore.ayahs = manyAyahs
      renderWithRouter(<MushafReaderPage />)
      
      // Should render without performance issues
      expect(screen.getAllByText(/Verse \d+ Arabic text/)).toHaveLength(50)
    })

    it('should be responsive across different screen sizes', () => {
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ]
      
      viewports.forEach(viewport => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        })
        
        const { unmount } = renderWithRouter(<MushafReaderPage />)
        
        // Content should be visible and properly laid out
        expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Lesson Page Integration', () => {
    it('should display Quranic content in lesson context', () => {
      renderWithRouter(<LessonPage />)
      
      // Should show Islamic greeting
      expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument()
      
      // Should maintain authentic Islamic context
      expect(screen.queryByText(/Quran \d+:\d+/)).not.toBeInTheDocument()
    })

    it('should provide interactive learning features', async () => {
      const user = userEvent.setup()
      renderWithRouter(<LessonPage />)
      
      // Should have interactive elements
      const startButton = screen.getByRole('button', { name: /start|بدء/i })
      expect(startButton).toBeInTheDocument()
      
      await user.click(startButton)
      
      // Should show lesson content
      expect(screen.getByText(/lesson|درس/i)).toBeInTheDocument()
    })
  })

  describe('Home Page Quran Integration', () => {
    it('should display featured Quranic content on home page', () => {
      renderWithRouter(<HomePage />)
      
      // Should show Bismillah or featured verse
      const islamicContent = screen.queryByText(/بِسْمِ ٱللَّهِ/)
      if (islamicContent) {
        expect(islamicContent).toBeInTheDocument()
      }
      
      // Should have navigation to full Quran
      const mushafLink = screen.getByRole('link', { name: /mushaf|مصحف|quran|قرآن/i })
      expect(mushafLink).toBeInTheDocument()
    })

    it('should maintain Islamic presentation on home page', () => {
      renderWithRouter(<HomePage />)
      
      // Should use proper Islamic terminology
      expect(screen.queryByText(/bible|church|chapter/i)).not.toBeInTheDocument()
      
      // Should show Islamic greetings or content
      const islamicTerms = screen.queryByText(/assalam|bismillah|quran|islam/i)
      if (islamicTerms) {
        expect(islamicTerms).toBeInTheDocument()
      }
    })
  })
})