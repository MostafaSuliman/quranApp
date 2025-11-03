/**
 * Test Setup Configuration for QuranApp
 * 
 * This file configures the testing environment with proper mocks,
 * utilities, and setup required for Islamic content testing.
 */

import { beforeAll, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Global test configuration
beforeAll(() => {
  // Mock window properties for browser APIs
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock IntersectionObserver for visibility testing
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock ResizeObserver for responsive testing
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock Audio API for recitation testing
  global.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    currentTime: 0,
    duration: 100,
    paused: true,
    volume: 1,
    playbackRate: 1,
  }))

  // Mock Notification API for notification testing
  global.Notification = vi.fn().mockImplementation(() => ({
    requestPermission: vi.fn().mockResolvedValue('granted'),
    permission: 'default',
  }))

  // Mock localStorage for persistence testing
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Mock sessionStorage for session testing
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  })

  // Mock console methods to avoid test noise
  console.warn = vi.fn()
  console.error = vi.fn()
})

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Custom test utilities for Islamic content
export const testUtils = {
  // Arabic text validation utilities
  arabic: {
    // Check if text contains Arabic characters
    hasArabicScript: (text: string): boolean => {
      return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)
    },

    // Check if text has proper diacritics
    hasDiacritics: (text: string): boolean => {
      return /[\u064B-\u0652\u0670\u0671]/.test(text)
    },

    // Validate Uthmani script characteristics
    isUthmaniScript: (text: string): boolean => {
      return text.includes('ٱ') || /ـٰ/.test(text) // Alif Wasla or Superscript Alif
    },

    // Check for proper word boundaries
    hasProperWordBoundaries: (text: string): boolean => {
      const words = text.trim().split(/\s+/)
      return words.every(word => word.length > 0 && /[\u0600-\u06FF]/.test(word))
    }
  },

  // Citation format validation
  citation: {
    // Validate Islamic citation format (Surah X • Ayah Y)
    isIslamicFormat: (text: string): boolean => {
      return /Surah \d+ • Ayah \d+/.test(text)
    },

    // Check for prohibited biblical format (Quran X:Y)
    isBiblicalFormat: (text: string): boolean => {
      return /(?:Quran?|Q)\s*\d+:\d+/i.test(text)
    },

    // Validate proper Islamic terminology
    hasIslamicTerms: (text: string): boolean => {
      const islamicTerms = /\b(Surah|Ayah|Mushaf|Allah|Reciter|Juz)\b/i
      const nonIslamicTerms = /\b(Chapter|Verse|Book|God|Reader|Part)\b/i
      return islamicTerms.test(text) && !nonIslamicTerms.test(text)
    }
  },

  // RTL layout validation
  rtl: {
    // Check if element has RTL direction
    isRTL: (element: Element): boolean => {
      const computed = window.getComputedStyle(element)
      return computed.direction === 'rtl'
    },

    // Verify document direction
    isDocumentRTL: (): boolean => {
      return document.documentElement.dir === 'rtl'
    },

    // Check if text aligns right (for Arabic)
    isRightAligned: (element: Element): boolean => {
      const computed = window.getComputedStyle(element)
      return computed.textAlign === 'right' || computed.textAlign === 'start'
    }
  },

  // Islamic content hierarchy validation
  hierarchy: {
    // Verify Arabic text is larger than translation
    isArabicPrimary: (arabicElement: Element, translationElement: Element): boolean => {
      const arabicStyles = window.getComputedStyle(arabicElement)
      const translationStyles = window.getComputedStyle(translationElement)
      
      const arabicSize = parseInt(arabicStyles.fontSize, 10)
      const translationSize = parseInt(translationStyles.fontSize, 10)
      
      return arabicSize >= translationSize
    },

    // Check DOM order (Arabic should come first)
    isArabicFirst: (container: Element): boolean => {
      const children = Array.from(container.children)
      let arabicIndex = -1
      let translationIndex = -1

      children.forEach((child, index) => {
        const text = child.textContent || ''
        if (testUtils.arabic.hasArabicScript(text)) {
          arabicIndex = index
        } else if (/[a-zA-Z]/.test(text) && text.length > 10) {
          translationIndex = index
        }
      })

      return arabicIndex >= 0 && (translationIndex === -1 || arabicIndex < translationIndex)
    }
  },

  // Icon and symbol validation
  icons: {
    // Check for appropriate Islamic iconography
    hasIslamicIcons: (text: string): boolean => {
      return /[📖📚🔊▶️⚙️🕌🤲📿]/.test(text)
    },

    // Check for inappropriate symbols
    hasInappropriateSymbols: (text: string): boolean => {
      const inappropriate = /[💩🖕🍆🍑💋👄🔞💰💳🎰🚬🍺🍷🍸✝️☦️🔯✡️]/
      return inappropriate.test(text)
    },

    // Verify consistent icon usage
    hasConsistentBookIcon: (text: string): boolean => {
      return text.includes('📖') && /mushaf|مصحف|quran|قرآن/i.test(text)
    }
  },

  // API and data validation
  api: {
    // Validate Quran.com API response structure
    isValidQuranResponse: (response: any): boolean => {
      return (
        response &&
        Array.isArray(response.verses) &&
        response.verses.every((verse: any) => 
          verse.text_uthmani && 
          typeof verse.verse_number === 'number' &&
          typeof verse.chapter_id === 'number'
        )
      )
    },

    // Check if content is from authentic source
    isAuthenticSource: (url: string): boolean => {
      return url.includes('api.quran.com/api/v4')
    },

    // Validate text field priority (text_uthmani preferred)
    hasCorrectTextPriority: (verse: any): boolean => {
      if (verse.text_uthmani) return true
      if (verse.text_simple && !verse.text_uthmani) return false
      return false
    }
  }
}

// Mock data for consistent testing
export const mockData = {
  // Authentic Quranic content for testing
  authenticVerse: {
    number: 1001,
    text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    numberInSurah: 1,
    surah: 1,
    juz: 1,
    page: 1,
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    transliteration: 'Bismillahi ar-rahmani ar-raheem'
  },

  // Test user preferences
  defaultPreferences: {
    language: 'ar',
    uiLanguage: 'ar',
    showTranslation: true,
    showTransliteration: false,
    translationLanguage: 'en',
    preferredReciter: '7',
    playbackSpeed: 1.0,
    darkMode: false,
    animationsEnabled: true,
    defaultReadingMode: 'learning',
    notificationTime: '19:00'
  },

  // Mock reciter data
  reciters: [
    { id: '7', name: 'Abdul Basit Abdul Samad', style: 'Murattal' },
    { id: '1', name: 'Mishary Rashid Alafasy', style: 'Clear & Melodious' },
    { id: '2', name: 'Abdur Rahman As-Sudais', style: 'Madinah Style' }
  ],

  // Mock Surah data
  surahs: [
    {
      number: 1,
      name: 'الفاتحة',
      englishName: 'Al-Fatihah',
      numberOfAyahs: 7,
      revelationType: 'Meccan'
    },
    {
      number: 2,
      name: 'البقرة',
      englishName: 'Al-Baqarah',
      numberOfAyahs: 286,
      revelationType: 'Medinan'
    }
  ],

  // Mock corrupted data for negative testing
  corruptedVerse: {
    number: 1001,
    text: 'In the name of Allah', // INVALID: English as primary
    translation: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', // INVALID: Arabic as translation
    numberInSurah: 1,
    surah: 1
  }
}

// Test environment configuration
export const testConfig = {
  // Timeouts for async operations
  timeouts: {
    apiCall: 5000,
    audioLoad: 3000,
    animation: 1000,
    debounce: 500
  },

  // Performance thresholds
  performance: {
    maxLoadTime: 2000,
    maxRenderTime: 100,
    maxMemoryIncrease: 10 * 1024 * 1024 // 10MB
  },

  // Accessibility requirements
  accessibility: {
    minTouchTarget: 44, // pixels
    minColorContrast: 4.5,
    maxTextLength: 80 // characters per line
  },

  // Islamic content standards
  islamic: {
    requiredArabicChars: ['ٱ', 'ـٰ'], // Alif Wasla, Superscript Alif
    requiredDiacritics: ['ِ', 'ْ', 'َ', 'ّ', 'ً', 'ٌ', 'ٍ'],
    prohibitedFormats: [/Quran \d+:\d+/, /Q\d+:\d+/, /\(\d+:\d+\)/],
    requiredTerminology: ['Surah', 'Ayah', 'Mushaf', 'Allah'],
    prohibitedTerminology: ['Chapter', 'Verse', 'Book', 'God']
  }
}

// Helper function to wait for element to appear
export const waitForElement = async (selector: string, timeout = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkElement = () => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`))
        return
      }
      
      setTimeout(checkElement, 100)
    }
    
    checkElement()
  })
}

// Helper function to simulate user interactions
export const userInteractions = {
  // Simulate language switching
  switchLanguage: async (language: 'ar' | 'en') => {
    const event = new CustomEvent('languageChange', { detail: { language } })
    window.dispatchEvent(event)
    
    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 100))
  },

  // Simulate theme switching
  toggleTheme: async () => {
    const event = new CustomEvent('themeToggle')
    window.dispatchEvent(event)
    
    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 100))
  },

  // Simulate audio playback
  playAudio: async (ayahNumber: number) => {
    const event = new CustomEvent('audioPlay', { detail: { ayahNumber } })
    window.dispatchEvent(event)
    
    // Wait for audio initialization
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

export default testUtils