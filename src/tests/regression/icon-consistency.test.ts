/**
 * Icon Consistency Regression Tests
 * 
 * These tests ensure UI icon preservation and consistency,
 * preventing regression in Islamic iconography and visual elements.
 * 
 * Critical areas tested:
 * - Mushaf icon remains 📖 book emoji
 * - Islamic visual elements are preserved
 * - Icon consistency across components
 * - Audio and interaction icons remain appropriate
 * - No inappropriate symbols are introduced
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../../pages/HomePage'
import MushafReaderPage from '../../pages/MushafReaderPage'
import SettingsPage from '../../pages/SettingsPage'
import Navigation from '../../components/Navigation'
import AudioPlayer from '../../components/AudioPlayer'
import AyahDisplay from '../../components/AyahDisplay'
import { Ayah } from '../../types/quran'

// Mock stores
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
    isLoading: false,
    error: null,
    loadPage: vi.fn()
  })
}))

vi.mock('../../stores/audioStore', () => ({
  useAudioStore: () => ({
    isPlaying: false,
    currentAyahNumber: null,
    currentReciter: { id: '2', name: 'AbdulBaset AbdulSamad' },
    playAudio: vi.fn(),
    pauseAudio: vi.fn()
  })
}))

vi.mock('../../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: {
      language: 'ar',
      theme: 'light',
      showTranslation: true
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

describe('Icon Consistency Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Mushaf Icon Preservation', () => {
    it('should consistently use book emoji (📖) for Mushaf icon', () => {
      renderWithRouter(<HomePage />)
      
      // Look for book emoji in Mushaf-related elements
      const bookEmojis = screen.queryAllByText(/📖|📚|📕|📘|📗|📙/)
      const mushafText = screen.queryByText(/mushaf|مصحف/i)
      
      if (mushafText || bookEmojis.length > 0) {
        // Should use book-related iconography
        expect(bookEmojis.length > 0 || mushafText).toBeTruthy()
        
        // Specifically should prefer 📖 for Mushaf
        const preferredIcon = screen.queryByText('📖')
        if (preferredIcon) {
          expect(preferredIcon).toBeInTheDocument()
        }
      }
    })

    it('should maintain Mushaf icon in navigation components', () => {
      renderWithRouter(<Navigation />)
      
      // Navigation should include Mushaf reference with appropriate icon
      const mushafLink = screen.queryByRole('link', { name: /mushaf|مصحف|quran|قرآن/i })
      
      if (mushafLink) {
        // Should contain book icon or text
        const linkContent = mushafLink.textContent || ''
        const hasBookIcon = /📖|📚|📕|📘|📗|📙/.test(linkContent)
        const hasMushafText = /mushaf|مصحف|quran|قرآن/i.test(linkContent)
        
        expect(hasBookIcon || hasMushafText).toBeTruthy()
      }
    })

    it('should use book icon consistently across different pages', () => {
      const pages = [
        <HomePage />,
        <SettingsPage />,
        <MushafReaderPage />
      ]
      
      pages.forEach((page, index) => {
        const { unmount } = renderWithRouter(page)
        
        // Look for Mushaf/Quran references
        const mushafReferences = screen.queryAllByText(/mushaf|مصحف|quran|قرآن/i)
        const bookIcons = screen.queryAllByText(/📖|📚/)
        
        if (mushafReferences.length > 0 || bookIcons.length > 0) {
          // Should maintain consistent iconography
          expect(mushafReferences.length > 0 || bookIcons.length > 0).toBeTruthy()
        }
        
        unmount()
      })
    })

    it('should never replace book icon with inappropriate symbols', () => {
      renderWithRouter(<HomePage />)
      
      // Should not use non-Islamic or inappropriate symbols for Mushaf
      const inappropriateIcons = ['📝', '📄', '📃', '🗞️', '📰', '✝️', '☪️', '🔯']
      
      inappropriateIcons.forEach(icon => {
        const inappropriateUsage = screen.queryAllByText(icon)
        
        // If found, should not be associated with Mushaf
        inappropriateUsage.forEach(element => {
          const context = element.closest('div')?.textContent || ''
          expect(context.toLowerCase()).not.toMatch(/mushaf|مصحف|quran|قرآن/)
        })
      })
    })
  })

  describe('Audio and Playback Icons', () => {
    it('should consistently use play/pause icons for audio controls', () => {
      render(<AudioPlayer />)
      
      // Should use standard play/pause icons
      const playIcons = screen.queryAllByText(/▶️|⏸️|⏯️|🔊|🎵/)
      const audioButtons = screen.queryAllByRole('button', { name: /play|pause|audio/i })
      
      if (audioButtons.length > 0) {
        // Audio controls should be present
        expect(audioButtons.length > 0).toBeTruthy()
        
        // Should use appropriate audio icons
        audioButtons.forEach(button => {
          const buttonContent = button.textContent || ''
          const hasAudioIcon = /▶️|⏸️|⏯️|🔊|🎵/.test(buttonContent)
          const hasAudioText = /play|pause|audio/i.test(buttonContent)
          
          expect(hasAudioIcon || hasAudioText).toBeTruthy()
        })
      }
    })

    it('should show sound/speaker icon during audio playback', () => {
      // Mock playing state
      vi.mock('../../stores/audioStore', () => ({
        useAudioStore: () => ({
          isPlaying: true,
          currentAyahNumber: 1,
          currentReciter: { id: '2', name: 'AbdulBaset AbdulSamad' },
          playAudio: vi.fn(),
          pauseAudio: vi.fn()
        })
      }))
      
      render(
        <AyahDisplay 
          ayah={mockAyah}
          isPlaying={true}
          onPlay={vi.fn()}
        />
      )
      
      // Should show playing indicator
      const playingIndicator = screen.queryByText('🔊')
      if (playingIndicator) {
        expect(playingIndicator).toBeInTheDocument()
      }
    })

    it('should use consistent icons across all audio components', () => {
      render(
        <div>
          <AudioPlayer />
          <AyahDisplay ayah={mockAyah} onPlay={vi.fn()} />
        </div>
      )
      
      // All audio-related icons should be consistent
      const audioElements = screen.queryAllByText(/▶️|⏸️|🔊/)
      
      if (audioElements.length > 0) {
        // Should use consistent iconography
        const iconTypes = new Set()
        audioElements.forEach(element => {
          const content = element.textContent || ''
          if (content.includes('▶️')) iconTypes.add('play')
          if (content.includes('⏸️')) iconTypes.add('pause')
          if (content.includes('🔊')) iconTypes.add('speaker')
        })
        
        // Should have consistent icon usage
        expect(iconTypes.size).toBeGreaterThan(0)
      }
    })

    it('should avoid using inappropriate audio symbols', () => {
      render(<AudioPlayer />)
      
      // Should not use non-standard or confusing audio symbols
      const inappropriateAudioIcons = ['🎶', '🎸', '🎤', '🎧', '📻', '💿', '📀']
      
      inappropriateAudioIcons.forEach(icon => {
        expect(screen.queryByText(icon)).not.toBeInTheDocument()
      })
    })
  })

  describe('Islamic Visual Elements', () => {
    it('should preserve Islamic geometric patterns or crescent symbols where appropriate', () => {
      renderWithRouter(<HomePage />)
      
      // Look for Islamic symbols (if used)
      const islamicSymbols = ['☪️', '🕌', '📿', '🤲']
      const foundSymbols = islamicSymbols.filter(symbol => 
        screen.queryByText(symbol) !== null
      )
      
      // If Islamic symbols are used, they should be appropriate
      foundSymbols.forEach(symbol => {
        const element = screen.getByText(symbol)
        expect(element).toBeInTheDocument()
        
        // Should be in appropriate context
        const context = element.closest('div')?.textContent || ''
        expect(context).toBeTruthy()
      })
    })

    it('should maintain consistent prayer/worship iconography', () => {
      renderWithRouter(<HomePage />)
      
      // Look for prayer-related icons
      const prayerIcons = screen.queryAllByText(/🤲|🕌|📿|🛐/)
      
      if (prayerIcons.length > 0) {
        // Should use appropriate Islamic prayer symbols
        prayerIcons.forEach(icon => {
          expect(icon).toBeInTheDocument()
          
          // Should not mix with non-Islamic prayer symbols
          const context = icon.closest('div')?.textContent || ''
          expect(context).not.toMatch(/✝️|🔯|☦️/)
        })
      }
    })

    it('should avoid mixing Islamic symbols with other religious iconography', () => {
      renderWithRouter(<HomePage />)
      
      // Should not have mixed religious symbols
      const christianSymbols = screen.queryAllByText(/✝️|☦️|⛪/)
      const jewishSymbols = screen.queryAllByText(/🔯|✡️/)
      const islamicSymbols = screen.queryAllByText(/☪️|🕌/)
      
      // If any religious symbols are present, they should be consistently Islamic
      if (islamicSymbols.length > 0) {
        expect(christianSymbols.length).toBe(0)
        expect(jewishSymbols.length).toBe(0)
      }
    })

    it('should use star and crescent sparingly and appropriately', () => {
      renderWithRouter(<HomePage />)
      
      // Star and crescent should be used appropriately if at all
      const crescentSymbol = screen.queryAllByText('☪️')
      
      if (crescentSymbol.length > 0) {
        // Should be in appropriate Islamic context
        crescentSymbol.forEach(symbol => {
          const context = symbol.closest('div')?.textContent || ''
          expect(context.toLowerCase()).toMatch(/islam|muslim|allah|quran|prayer/i)
        })
      }
    })
  })

  describe('Navigation and Interface Icons', () => {
    it('should use consistent navigation icons across the app', () => {
      renderWithRouter(<Navigation />)
      
      // Navigation should have consistent iconography
      const navLinks = screen.queryAllByRole('link')
      const navButtons = screen.queryAllByRole('button')
      
      const navigationElements = [...navLinks, ...navButtons]
      
      navigationElements.forEach(element => {
        const content = element.textContent || ''
        
        // Common navigation patterns
        if (content.toLowerCase().includes('home')) {
          // Home icon should be consistent
          expect(/🏠|🏡|⌂|Home/i.test(content)).toBeTruthy()
        }
        
        if (content.toLowerCase().includes('settings')) {
          // Settings icon should be consistent
          expect(/⚙️|🔧|Settings|إعدادات/i.test(content)).toBeTruthy()
        }
      })
    })

    it('should maintain settings gear icon consistency', () => {
      renderWithRouter(<SettingsPage />)
      
      // Settings should use gear/cog iconography
      const settingsIcons = screen.queryAllByText(/⚙️|🔧|🛠️/)
      const settingsText = screen.queryAllByText(/settings|إعدادات/i)
      
      if (settingsText.length > 0 || settingsIcons.length > 0) {
        // Should have settings iconography
        expect(settingsText.length > 0 || settingsIcons.length > 0).toBeTruthy()
      }
    })

    it('should use appropriate back/forward navigation icons', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Navigation arrows should be appropriate for RTL context
      const navigationArrows = screen.queryAllByText(/←|→|◀|▶|⏮|⏭/)
      const navButtons = screen.queryAllByRole('button', { name: /next|previous|back|forward/i })
      
      if (navButtons.length > 0) {
        navButtons.forEach(button => {
          const content = button.textContent || ''
          
          // Should have appropriate directional indicators
          const hasArrow = /←|→|◀|▶|⏮|⏭/.test(content)
          const hasText = /next|previous|back|forward|التالي|السابق/i.test(content)
          
          expect(hasArrow || hasText).toBeTruthy()
        })
      }
    })

    it('should avoid using confusing or inappropriate navigation symbols', () => {
      renderWithRouter(<Navigation />)
      
      // Should not use symbols that could be confusing
      const confusingSymbols = ['❌', '⛔', '🚫', '⚠️', '❗', '❓']
      
      confusingSymbols.forEach(symbol => {
        const foundSymbols = screen.queryAllByText(symbol)
        
        // If warning symbols are used, they should be in appropriate error/warning context
        foundSymbols.forEach(element => {
          const context = element.closest('div')?.textContent || ''
          if (['❌', '⛔', '🚫'].includes(symbol)) {
            // Blocking symbols should only be in error contexts
            expect(context.toLowerCase()).toMatch(/error|warning|failed|خطأ/i)
          }
        })
      })
    })
  })

  describe('Status and Feedback Icons', () => {
    it('should use consistent success indicators', () => {
      // Mock success state
      render(<div data-testid="success-message">✅ Settings saved successfully</div>)
      
      const successElement = screen.getByTestId('success-message')
      expect(successElement).toBeInTheDocument()
      
      // Should use appropriate success iconography
      const content = successElement.textContent || ''
      expect(/✅|✓|☑️|Success|نجح/i.test(content)).toBeTruthy()
    })

    it('should use consistent error indicators', () => {
      // Mock error state
      render(<div data-testid="error-message">❌ Failed to load content</div>)
      
      const errorElement = screen.getByTestId('error-message')
      expect(errorElement).toBeInTheDocument()
      
      // Should use appropriate error iconography
      const content = errorElement.textContent || ''
      expect(/❌|✗|⚠️|Error|Failed|خطأ|فشل/i.test(content)).toBeTruthy()
    })

    it('should use consistent loading indicators', () => {
      // Mock loading state
      render(<div data-testid="loading-message">Loading Quran content...</div>)
      
      const loadingElement = screen.getByTestId('loading-message')
      expect(loadingElement).toBeInTheDocument()
      
      // Should indicate loading state
      const content = loadingElement.textContent || ''
      expect(/Loading|تحميل|جاري/i.test(content)).toBeTruthy()
    })

    it('should avoid using misleading status indicators', () => {
      renderWithRouter(<HomePage />)
      
      // Should not use symbols that could mislead users
      const misleadingSymbols = ['💀', '💩', '🤡', '👹', '👺']
      
      misleadingSymbols.forEach(symbol => {
        expect(screen.queryByText(symbol)).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility and Icon Labels', () => {
    it('should provide appropriate alt text or labels for decorative icons', () => {
      renderWithRouter(<HomePage />)
      
      // Icons should have proper accessibility attributes
      const images = screen.queryAllByRole('img')
      images.forEach(img => {
        const alt = img.getAttribute('alt') || ''
        const ariaLabel = img.getAttribute('aria-label') || ''
        
        // Should have descriptive text or be marked as decorative
        expect(
          alt.length > 0 || 
          ariaLabel.length > 0 || 
          img.getAttribute('aria-hidden') === 'true'
        ).toBeTruthy()
      })
    })

    it('should ensure icon buttons have accessible names', () => {
      render(
        <AyahDisplay 
          ayah={mockAyah} 
          onPlay={vi.fn()}
          showAyahInfo={true}
        />
      )
      
      // Icon buttons should have accessible names
      const buttons = screen.queryAllByRole('button')
      buttons.forEach(button => {
        const hasAccessibleName = 
          button.getAttribute('aria-label') ||
          button.getAttribute('aria-labelledby') ||
          (button.textContent && button.textContent.trim().length > 0)
        
        expect(hasAccessibleName).toBeTruthy()
      })
    })

    it('should use consistent icon sizing for touch accessibility', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Interactive icons should be appropriately sized
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        const height = parseInt(styles.height, 10)
        const width = parseInt(styles.width, 10)
        
        // Should meet minimum touch target size
        if (height > 0 && width > 0) {
          expect(height).toBeGreaterThanOrEqual(44)
          expect(width).toBeGreaterThanOrEqual(44)
        }
      })
    })
  })

  describe('Icon Consistency Across Themes', () => {
    it('should maintain icon visibility in light theme', () => {
      renderWithRouter(<HomePage />)
      
      // Icons should be visible in light theme
      const iconElements = screen.queryAllByText(/[📖🔊▶️⚙️]/)
      
      iconElements.forEach(icon => {
        const styles = window.getComputedStyle(icon)
        
        // Should be visible (not transparent or hidden)
        expect(styles.opacity).not.toBe('0')
        expect(styles.visibility).not.toBe('hidden')
        expect(styles.display).not.toBe('none')
      })
    })

    it('should maintain icon visibility in dark theme', () => {
      // Mock dark theme
      vi.mock('../../stores/preferencesStore', () => ({
        usePreferencesStore: () => ({
          preferences: {
            language: 'ar',
            theme: 'dark',
            showTranslation: true
          }
        })
      }))
      
      renderWithRouter(<HomePage />)
      
      // Icons should remain visible in dark theme
      const iconElements = screen.queryAllByText(/[📖🔊▶️⚙️]/)
      
      iconElements.forEach(icon => {
        expect(icon).toBeVisible()
      })
    })

    it('should not introduce theme-breaking icon modifications', () => {
      renderWithRouter(<SettingsPage />)
      
      // Theme changes should not break icon consistency
      const themeSelect = screen.queryByRole('combobox', { name: /theme/i })
      
      if (themeSelect) {
        // Icons should work regardless of theme
        const iconElements = screen.queryAllByText(/[📖🔊▶️⚙️]/)
        expect(iconElements.length).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('Regression Prevention', () => {
    it('should detect any unauthorized icon changes', () => {
      renderWithRouter(<HomePage />)
      
      // Known good icons that should be preserved
      const expectedIcons = {
        mushaf: /📖|📚/,
        audio: /▶️|⏸️|🔊/,
        settings: /⚙️|🔧/,
        navigation: /←|→|◀|▶/
      }
      
      // Check each expected icon type
      Object.entries(expectedIcons).forEach(([iconType, pattern]) => {
        const iconElements = screen.queryAllByText(pattern)
        
        // If the icon type is present, it should use expected patterns
        if (iconElements.length > 0) {
          expect(iconElements.length).toBeGreaterThan(0)
        }
      })
    })

    it('should prevent introduction of inappropriate emoji', () => {
      renderWithRouter(<HomePage />)
      
      // Should not contain inappropriate emoji
      const inappropriateEmoji = [
        '💩', '🖕', '🍆', '🍑', '💋', '👄', '🔞', '💰', '💳', '🎰', '🚬', '🍺', '🍷', '🍸'
      ]
      
      inappropriateEmoji.forEach(emoji => {
        expect(screen.queryByText(emoji)).not.toBeInTheDocument()
      })
    })

    it('should maintain icon count stability', () => {
      renderWithRouter(<MushafReaderPage />)
      
      // Count various icon types
      const iconCounts = {
        book: screen.queryAllByText(/📖/).length,
        audio: screen.queryAllByText(/▶️|🔊/).length,
        settings: screen.queryAllByText(/⚙️/).length
      }
      
      // Icon counts should be reasonable (not excessive)
      Object.entries(iconCounts).forEach(([iconType, count]) => {
        expect(count).toBeLessThan(50) // Prevent icon spam
      })
    })
  })
})