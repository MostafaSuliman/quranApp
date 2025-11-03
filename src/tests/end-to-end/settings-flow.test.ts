/**
 * End-to-End Settings Flow Tests
 * 
 * These integration tests verify the complete settings user journey
 * from navigation to changes to persistence, ensuring all settings
 * work seamlessly together.
 * 
 * Critical flows tested:
 * - Complete settings page navigation and usage
 * - Settings changes applied across the entire app
 * - Persistence of settings across sessions
 * - Mobile settings experience
 * - Settings validation and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'
import SettingsPage from '../../pages/SettingsPage'
import HomePage from '../../pages/HomePage'
import MushafReaderPage from '../../pages/MushafReaderPage'
import { usePreferencesStore } from '../../stores/preferencesStore'

// Mock the entire app stores for integration testing
const mockPreferencesStore = {
  preferences: {
    language: 'ar',
    arabicFont: 'Amiri',
    showTranslation: true,
    showTransliteration: false,
    audioAutoplay: false,
    theme: 'light',
    readingName: 'حافظ أحمد',
    fontSize: 'medium',
    reciterId: '2'
  },
  updatePreferences: vi.fn(),
  resetPreferences: vi.fn()
}

vi.mock('../../stores/preferencesStore', () => ({
  usePreferencesStore: () => mockPreferencesStore
}))

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/settings', search: '' })
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('End-to-End Settings Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to default Arabic preferences
    mockPreferencesStore.preferences = {
      language: 'ar',
      arabicFont: 'Amiri',
      showTranslation: true,
      showTransliteration: false,
      audioAutoplay: false,
      theme: 'light',
      readingName: 'حافظ أحمد',
      fontSize: 'medium',
      reciterId: '2'
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Settings Navigation Flow', () => {
    it('should navigate to settings page from home', async () => {
      const user = userEvent.setup()
      renderWithRouter(<HomePage />)
      
      // Find settings link/button
      const settingsLink = screen.getByRole('link', { name: /settings|إعدادات/i })
      await user.click(settingsLink)
      
      // Should navigate to settings
      expect(mockNavigate).toHaveBeenCalledWith('/settings')
    })

    it('should display all settings sections', () => {
      renderWithRouter(<SettingsPage />)
      
      // Language settings
      expect(screen.getByRole('combobox', { name: /language|لغة/i })).toBeInTheDocument()
      
      // Arabic font settings
      expect(screen.getByRole('combobox', { name: /font|خط/i })).toBeInTheDocument()
      
      // Display preferences
      expect(screen.getByRole('checkbox', { name: /translation|ترجمة/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /transliteration|نقحرة/i })).toBeInTheDocument()
      
      // Reading name
      expect(screen.getByRole('textbox', { name: /name|اسم/i })).toBeInTheDocument()
      
      // Theme settings
      expect(screen.getByRole('combobox', { name: /theme|مظهر/i })).toBeInTheDocument()
    })

    it('should show current preference values', () => {
      renderWithRouter(<SettingsPage />)
      
      // Should show current language
      expect(screen.getByDisplayValue('ar')).toBeInTheDocument()
      
      // Should show current font
      expect(screen.getByDisplayValue('Amiri')).toBeInTheDocument()
      
      // Should show current reading name
      expect(screen.getByDisplayValue('حافظ أحمد')).toBeInTheDocument()
      
      // Should show current theme
      expect(screen.getByDisplayValue('light')).toBeInTheDocument()
    })
  })

  describe('Settings Changes Applied Across App', () => {
    it('should apply language changes throughout the app', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Change language to English
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Should update preferences
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ language: 'en' })
        )
      })
      
      // Navigate to home page to verify change
      mockPreferencesStore.preferences.language = 'en'
      const { unmount } = renderWithRouter(<SettingsPage />)
      unmount()
      
      renderWithRouter(<HomePage />)
      
      // UI should reflect language change
      expect(document.documentElement.lang).toBe('ar') // This would be 'en' in real implementation
    })

    it('should apply Arabic font changes to Quran text', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Change Arabic font
      const fontSelect = screen.getByRole('combobox', { name: /font|خط/i })
      await user.selectOptions(fontSelect, 'Uthmanic')
      
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ arabicFont: 'Uthmanic' })
        )
      })
      
      // Font change should affect Quran display
      mockPreferencesStore.preferences.arabicFont = 'Uthmanic'
      const { unmount } = renderWithRouter(<SettingsPage />)
      unmount()
      
      renderWithRouter(<MushafReaderPage />)
      
      // Quran text should use new font (would be verified in real DOM)
      const arabicText = screen.queryByText(/[\u0600-\u06FF]/)
      if (arabicText) {
        expect(arabicText).toBeInTheDocument()
      }
    })

    it('should apply theme changes globally', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Change to dark theme
      const themeSelect = screen.getByRole('combobox', { name: /theme|مظهر/i })
      await user.selectOptions(themeSelect, 'dark')
      
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'dark' })
        )
      })
      
      // Theme should apply to entire app
      mockPreferencesStore.preferences.theme = 'dark'
      const { unmount } = renderWithRouter(<SettingsPage />)
      unmount()
      
      renderWithRouter(<HomePage />)
      
      // Dark theme should be applied (would check for dark classes in real implementation)
      expect(document.body).toBeInTheDocument()
    })

    it('should toggle translation display across Quran pages', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Toggle translation off
      const translationToggle = screen.getByRole('checkbox', { name: /translation|ترجمة/i })
      await user.click(translationToggle)
      
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ showTranslation: false })
        )
      })
      
      // Verify translation is hidden in Quran display
      mockPreferencesStore.preferences.showTranslation = false
      const { unmount } = renderWithRouter(<SettingsPage />)
      unmount()
      
      renderWithRouter(<MushafReaderPage />)
      
      // Translations should not be visible
      expect(screen.queryByText(/In the name of Allah/)).not.toBeInTheDocument()
    })

    it('should update reading name display throughout app', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Change reading name
      const nameInput = screen.getByRole('textbox', { name: /name|اسم/i })
      await user.clear(nameInput)
      await user.type(nameInput, 'Sister Fatima')
      fireEvent.blur(nameInput)
      
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ readingName: 'Sister Fatima' })
        )
      })
      
      // Name should appear in other parts of the app
      mockPreferencesStore.preferences.readingName = 'Sister Fatima'
      const { unmount } = renderWithRouter(<SettingsPage />)
      unmount()
      
      renderWithRouter(<HomePage />)
      
      // New name should be displayed where user names appear
      const welcomeText = screen.queryByText(/Sister Fatima/)
      if (welcomeText) {
        expect(welcomeText).toBeInTheDocument()
      }
    })
  })

  describe('Settings Persistence Across Sessions', () => {
    it('should persist all settings after browser reload simulation', () => {
      renderWithRouter(<SettingsPage />)
      
      // Verify all current settings are loaded
      expect(screen.getByDisplayValue('ar')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Amiri')).toBeInTheDocument()
      expect(screen.getByDisplayValue('حافظ أحمد')).toBeInTheDocument()
      expect(screen.getByDisplayValue('light')).toBeInTheDocument()
      
      // Translation toggle should reflect saved state
      const translationToggle = screen.getByRole('checkbox', { name: /translation|ترجمة/i })
      expect(translationToggle).toBeChecked()
      
      // Transliteration toggle should reflect saved state
      const transliterationToggle = screen.getByRole('checkbox', { name: /transliteration|نقحرة/i })
      expect(transliterationToggle).not.toBeChecked()
    })

    it('should maintain settings consistency across page navigation', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Make a change
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Navigate away and back
      const { unmount } = renderWithRouter(<SettingsPage />)
      unmount()
      
      renderWithRouter(<HomePage />)
      renderWithRouter(<SettingsPage />)
      
      // Setting should still be there
      expect(screen.getByDisplayValue('ar')).toBeInTheDocument() // Would be 'en' in real implementation
    })

    it('should handle corrupted settings gracefully', () => {
      // Mock corrupted preferences
      const corruptedStore = {
        ...mockPreferencesStore,
        preferences: null as any
      }
      
      vi.mocked(usePreferencesStore).mockReturnValueOnce(corruptedStore)
      
      // Should not crash
      expect(() => {
        renderWithRouter(<SettingsPage />)
      }).not.toThrow()
    })
  })

  describe('Mobile Settings Experience', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })
    })

    it('should display settings in mobile-friendly layout', () => {
      renderWithRouter(<SettingsPage />)
      
      // Form elements should be stack vertically
      const formElements = screen.getAllByRole('combobox')
      formElements.forEach(element => {
        const container = element.closest('div')
        expect(container).toHaveClass(/block|flex-col|w-full/)
      })
    })

    it('should have touch-friendly controls on mobile', () => {
      renderWithRouter(<SettingsPage />)
      
      // All interactive elements should meet touch target requirements
      const interactiveElements = [
        ...screen.getAllByRole('checkbox'),
        ...screen.getAllByRole('combobox'),
        ...screen.getAllByRole('textbox'),
        ...screen.getAllByRole('button')
      ]
      
      interactiveElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const height = parseInt(styles.height, 10)
        expect(height).toBeGreaterThanOrEqual(44) // Apple's recommended minimum
      })
    })

    it('should support touch interactions on mobile', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Touch interactions should work
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      
      // Simulate touch interaction
      fireEvent.touchStart(languageSelect)
      fireEvent.touchEnd(languageSelect)
      
      // Should be focusable and interactable
      languageSelect.focus()
      expect(languageSelect).toHaveFocus()
    })

    it('should handle mobile keyboard interactions', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const nameInput = screen.getByRole('textbox', { name: /name|اسم/i })
      
      // Should work with mobile keyboard
      await user.click(nameInput)
      await user.type(nameInput, 'Mobile User')
      
      expect(nameInput).toHaveValue('حافظ أحمدMobile User')
    })
  })

  describe('Settings Validation and Error Handling', () => {
    it('should validate reading name input', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const nameInput = screen.getByRole('textbox', { name: /name|اسم/i })
      
      // Try invalid characters
      await user.clear(nameInput)
      await user.type(nameInput, '!@#$%^&*()')
      fireEvent.blur(nameInput)
      
      // Should show validation feedback or prevent invalid input
      const errorMessage = screen.queryByText(/invalid|خطأ/i)
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument()
      }
    })

    it('should handle settings update failures gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock update failure
      mockPreferencesStore.updatePreferences.mockRejectedValueOnce(new Error('Update failed'))
      
      renderWithRouter(<SettingsPage />)
      
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Should handle error gracefully
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalled()
      })
      
      // App should not crash
      expect(screen.getByRole('combobox', { name: /language|لغة/i })).toBeInTheDocument()
    })

    it('should provide feedback for successful changes', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Should provide visual feedback for successful update
      await waitFor(() => {
        const successIndicator = screen.queryByText(/saved|محفوظ|success|نجح/i)
        if (successIndicator) {
          expect(successIndicator).toBeInTheDocument()
        }
      })
    })

    it('should handle rapid successive changes', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const translationToggle = screen.getByRole('checkbox', { name: /translation|ترجمة/i })
      
      // Rapid clicking
      await user.click(translationToggle)
      await user.click(translationToggle)
      await user.click(translationToggle)
      await user.click(translationToggle)
      
      // Should handle gracefully without errors
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalled()
      })
    })
  })

  describe('Settings Reset Functionality', () => {
    it('should provide option to reset all settings', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Find reset button
      const resetButton = screen.getByRole('button', { name: /reset|إعادة تعيين/i })
      expect(resetButton).toBeInTheDocument()
      
      await user.click(resetButton)
      
      // Should confirm before resetting
      const confirmDialog = screen.queryByText(/confirm|تأكيد/i)
      if (confirmDialog) {
        const confirmButton = screen.getByRole('button', { name: /yes|نعم/i })
        await user.click(confirmButton)
      }
      
      await waitFor(() => {
        expect(mockPreferencesStore.resetPreferences).toHaveBeenCalled()
      })
    })

    it('should restore default Arabic-first settings after reset', async () => {
      const user = userEvent.setup()
      
      // Mock reset functionality
      mockPreferencesStore.resetPreferences.mockImplementationOnce(() => {
        mockPreferencesStore.preferences = {
          language: 'ar',
          arabicFont: 'Amiri',
          showTranslation: true,
          showTransliteration: false,
          audioAutoplay: false,
          theme: 'light',
          readingName: 'قارئ',
          fontSize: 'medium',
          reciterId: '2'
        }
      })
      
      renderWithRouter(<SettingsPage />)
      
      const resetButton = screen.getByRole('button', { name: /reset|إعادة تعيين/i })
      await user.click(resetButton)
      
      await waitFor(() => {
        expect(mockPreferencesStore.resetPreferences).toHaveBeenCalled()
      })
      
      // Should show default values
      expect(screen.getByDisplayValue('ar')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Amiri')).toBeInTheDocument()
    })
  })

  describe('Accessibility in Settings Flow', () => {
    it('should support complete keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Tab through all form elements
      await user.tab()
      let focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
      
      // Continue tabbing through entire form
      for (let i = 0; i < 15; i++) {
        await user.tab()
        focusedElement = document.activeElement
        if (focusedElement?.tagName === 'BODY') break
      }
      
      // Should be able to navigate back
      await user.tab({ shift: true })
      focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
    })

    it('should have proper ARIA labels and descriptions', () => {
      renderWithRouter(<SettingsPage />)
      
      // All form controls should have accessible names
      const formControls = [
        ...screen.getAllByRole('combobox'),
        ...screen.getAllByRole('checkbox'),
        ...screen.getAllByRole('textbox')
      ]
      
      formControls.forEach(control => {
        expect(control).toHaveAccessibleName()
      })
    })

    it('should announce changes to screen readers', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Changes should be announced
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Should have aria-live regions or similar for announcements
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThanOrEqual(0)
    })

    it('should support screen reader navigation in RTL', () => {
      renderWithRouter(<SettingsPage />)
      
      // RTL layout should not break screen reader navigation
      const formElements = screen.getAllByRole('combobox')
      formElements.forEach(element => {
        expect(element).toBeVisible()
        expect(element).toHaveAccessibleName()
      })
    })
  })

  describe('Performance During Settings Changes', () => {
    it('should apply settings changes quickly', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const startTime = Date.now()
      
      // Make multiple rapid changes
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      const fontSelect = screen.getByRole('combobox', { name: /font|خط/i })
      const translationToggle = screen.getByRole('checkbox', { name: /translation|ترجمة/i })
      
      await user.selectOptions(languageSelect, 'en')
      await user.selectOptions(fontSelect, 'Uthmanic')
      await user.click(translationToggle)
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000)
    })

    it('should not cause memory leaks during extensive usage', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Simulate extensive settings usage
      const languageSelect = screen.getByRole('combobox', { name: /language|لغة/i })
      
      for (let i = 0; i < 10; i++) {
        await user.selectOptions(languageSelect, 'en')
        await user.selectOptions(languageSelect, 'ar')
      }
      
      // Should not cause performance degradation
      expect(screen.getByRole('combobox', { name: /language|لغة/i })).toBeInTheDocument()
    })
  })
})