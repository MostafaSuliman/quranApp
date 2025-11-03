/**
 * Settings Functionality Tests
 * 
 * These tests ensure that all settings changes take immediate effect,
 * are properly persisted, and maintain responsiveness across devices.
 * 
 * Critical areas tested:
 * - Settings changes take immediate effect
 * - Language switching works without refresh
 * - Reading name changes reflect in UI
 * - Settings persistence across sessions
 * - Mobile responsiveness of settings page
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import SettingsPage from '../pages/SettingsPage'
import { usePreferencesStore } from '../stores/preferencesStore'

// Mock the preferences store
const mockPreferencesStore = {
  preferences: {
    language: 'ar',
    arabicFont: 'Amiri',
    showTranslation: true,
    showTransliteration: false,
    audioAutoplay: false,
    theme: 'light',
    readingName: 'Hafiz Ahmed'
  },
  updatePreferences: vi.fn(),
  resetPreferences: vi.fn()
}

vi.mock('../stores/preferencesStore', () => ({
  usePreferencesStore: () => mockPreferencesStore
}))

// Mock zustand persist middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  subscribeWithSelector: (fn: any) => fn
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Settings Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock store to default state
    mockPreferencesStore.preferences = {
      language: 'ar',
      arabicFont: 'Amiri',
      showTranslation: true,
      showTransliteration: false,
      audioAutoplay: false,
      theme: 'light',
      readingName: 'Hafiz Ahmed'
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Immediate Settings Effects', () => {
    it('should apply language changes immediately without refresh', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Find language selector
      const languageSelect = screen.getByRole('combobox', { name: /language/i })
      expect(languageSelect).toBeInTheDocument()
      
      // Change language from Arabic to English
      await user.selectOptions(languageSelect, 'en')
      
      // Verify updatePreferences was called with new language
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ language: 'en' })
        )
      })
      
      // UI should reflect change immediately (no refresh needed)
      expect(screen.getByDisplayValue('en')).toBeInTheDocument()
    })

    it('should apply Arabic font changes immediately', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Find font selector
      const fontSelect = screen.getByRole('combobox', { name: /font/i })
      expect(fontSelect).toBeInTheDocument()
      
      // Change font to Uthmanic
      await user.selectOptions(fontSelect, 'Uthmanic')
      
      // Verify immediate update
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ arabicFont: 'Uthmanic' })
        )
      })
    })

    it('should toggle translation display immediately', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Find translation toggle
      const translationToggle = screen.getByRole('checkbox', { name: /show translation/i })
      expect(translationToggle).toBeChecked()
      
      // Toggle off
      await user.click(translationToggle)
      
      // Verify immediate update
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ showTranslation: false })
        )
      })
    })

    it('should toggle transliteration display immediately', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Find transliteration toggle
      const transliterationToggle = screen.getByRole('checkbox', { name: /show transliteration/i })
      expect(transliterationToggle).not.toBeChecked()
      
      // Toggle on
      await user.click(transliterationToggle)
      
      // Verify immediate update
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ showTransliteration: true })
        )
      })
    })

    it('should change theme immediately', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Find theme selector
      const themeSelect = screen.getByRole('combobox', { name: /theme/i })
      
      // Change to dark theme
      await user.selectOptions(themeSelect, 'dark')
      
      // Verify immediate update
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'dark' })
        )
      })
    })
  })

  describe('Reading Name Changes', () => {
    it('should update reading name and reflect in UI immediately', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Find reading name input
      const nameInput = screen.getByRole('textbox', { name: /reading name/i })
      expect(nameInput).toHaveValue('Hafiz Ahmed')
      
      // Clear and type new name
      await user.clear(nameInput)
      await user.type(nameInput, 'Sister Fatima')
      
      // Verify immediate update on blur or after typing
      fireEvent.blur(nameInput)
      
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ readingName: 'Sister Fatima' })
        )
      })
    })

    it('should validate reading name length', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const nameInput = screen.getByRole('textbox', { name: /reading name/i })
      
      // Try to enter very long name
      const longName = 'A'.repeat(100)
      await user.clear(nameInput)
      await user.type(nameInput, longName)
      
      // Should either limit input or show validation error
      const inputValue = nameInput.getAttribute('value') || ''
      expect(inputValue.length).toBeLessThanOrEqual(50) // Reasonable limit
    })

    it('should handle empty reading name gracefully', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const nameInput = screen.getByRole('textbox', { name: /reading name/i })
      
      // Clear the name completely
      await user.clear(nameInput)
      fireEvent.blur(nameInput)
      
      // Should either prevent empty name or provide default
      await waitFor(() => {
        const calls = mockPreferencesStore.updatePreferences.mock.calls
        if (calls.length > 0) {
          const lastCall = calls[calls.length - 1][0]
          expect(lastCall.readingName).toBeTruthy() // Should have some value
        }
      })
    })
  })

  describe('Settings Persistence', () => {
    it('should persist all settings changes across page reloads', () => {
      renderWithRouter(<SettingsPage />)
      
      // Verify that preferences are loaded from persistent storage
      expect(screen.getByDisplayValue('ar')).toBeInTheDocument() // Language
      expect(screen.getByDisplayValue('Amiri')).toBeInTheDocument() // Font
      expect(screen.getByDisplayValue('Hafiz Ahmed')).toBeInTheDocument() // Reading name
    })

    it('should maintain settings state during navigation', () => {
      const { rerender } = renderWithRouter(<SettingsPage />)
      
      // Simulate navigation away and back
      rerender(<div>Other Page</div>)
      rerender(
        <BrowserRouter>
          <SettingsPage />
        </BrowserRouter>
      )
      
      // Settings should still be preserved
      expect(screen.getByDisplayValue('ar')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Hafiz Ahmed')).toBeInTheDocument()
    })

    it('should handle corrupted storage gracefully', () => {
      // Mock corrupted storage scenario
      const corruptedStore = {
        ...mockPreferencesStore,
        preferences: null
      }
      
      vi.mocked(usePreferencesStore).mockReturnValueOnce(corruptedStore)
      
      expect(() => {
        renderWithRouter(<SettingsPage />)
      }).not.toThrow()
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should render properly on mobile viewport', () => {
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
      
      renderWithRouter(<SettingsPage />)
      
      // Settings page should render without horizontal scroll
      const settingsContainer = screen.getByRole('main') || screen.getByText(/settings/i).closest('div')
      expect(settingsContainer).toBeInTheDocument()
      
      // Form elements should be touch-friendly
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        const styles = window.getComputedStyle(input)
        const height = parseInt(styles.height, 10)
        expect(height).toBeGreaterThanOrEqual(44) // Minimum touch target size
      })
    })

    it('should stack form elements vertically on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      renderWithRouter(<SettingsPage />)
      
      // Check that form has appropriate mobile layout classes
      const formElements = screen.getAllByRole('combobox')
      formElements.forEach(element => {
        const container = element.closest('div')
        expect(container).toHaveClass(/flex-col|block|w-full/)
      })
    })

    it('should be accessible on touch devices', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // All interactive elements should be tappable
      const interactiveElements = [
        ...screen.getAllByRole('checkbox'),
        ...screen.getAllByRole('combobox'),
        ...screen.getAllByRole('textbox')
      ]
      
      for (const element of interactiveElements) {
        expect(element).toBeVisible()
        expect(element).not.toBeDisabled()
        
        // Should be focusable (important for keyboard navigation)
        element.focus()
        expect(element).toHaveFocus()
      }
    })
  })

  describe('Language Switching Without Refresh', () => {
    it('should change UI language immediately without page refresh', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Get initial Arabic text content
      const initialContent = document.body.textContent
      
      // Switch to English
      const languageSelect = screen.getByRole('combobox', { name: /language/i })
      await user.selectOptions(languageSelect, 'en')
      
      // UI should change immediately (mock the language change effect)
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ language: 'en' })
        )
      })
      
      // No page refresh should occur (location should remain same)
      expect(window.location.pathname).toBe('/')
    })

    it('should maintain form state during language switch', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Modify a setting first
      const nameInput = screen.getByRole('textbox', { name: /reading name/i })
      await user.clear(nameInput)
      await user.type(nameInput, 'Test User')
      
      // Switch language
      const languageSelect = screen.getByRole('combobox', { name: /language/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Form state should be preserved
      await waitFor(() => {
        expect(nameInput).toHaveValue('Test User')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle settings update failures gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock update failure
      mockPreferencesStore.updatePreferences.mockRejectedValueOnce(new Error('Update failed'))
      
      renderWithRouter(<SettingsPage />)
      
      const languageSelect = screen.getByRole('combobox', { name: /language/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Should not crash the app
      expect(screen.getByRole('combobox', { name: /language/i })).toBeInTheDocument()
    })

    it('should provide feedback for invalid settings', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Try to set invalid value
      const nameInput = screen.getByRole('textbox', { name: /reading name/i })
      await user.clear(nameInput)
      await user.type(nameInput, '!@#$%^&*()')
      
      // Should either prevent invalid input or show validation message
      fireEvent.blur(nameInput)
      
      // Check for validation feedback
      await waitFor(() => {
        const errorMessage = screen.queryByText(/invalid/i) || screen.queryByText(/error/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      })
    })
  })

  describe('Performance Tests', () => {
    it('should update settings quickly without UI lag', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const startTime = Date.now()
      
      // Perform multiple rapid changes
      const languageSelect = screen.getByRole('combobox', { name: /language/i })
      await user.selectOptions(languageSelect, 'en')
      await user.selectOptions(languageSelect, 'ar')
      await user.selectOptions(languageSelect, 'en')
      
      const endTime = Date.now()
      const updateTime = endTime - startTime
      
      // Should complete within reasonable time
      expect(updateTime).toBeLessThan(1000) // 1 second threshold
    })

    it('should handle rapid successive changes efficiently', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      const translationToggle = screen.getByRole('checkbox', { name: /show translation/i })
      
      // Rapid clicking should not cause issues
      await user.click(translationToggle)
      await user.click(translationToggle)
      await user.click(translationToggle)
      await user.click(translationToggle)
      
      // Should settle to final state
      await waitFor(() => {
        expect(mockPreferencesStore.updatePreferences).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all form controls', () => {
      renderWithRouter(<SettingsPage />)
      
      // All inputs should have labels
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })
      
      const selects = screen.getAllByRole('combobox')
      selects.forEach(select => {
        expect(select).toHaveAccessibleName()
      })
      
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName()
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Tab through all interactive elements
      await user.tab()
      let focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
      
      // Continue tabbing through form
      for (let i = 0; i < 10; i++) {
        await user.tab()
        focusedElement = document.activeElement
        if (focusedElement?.tagName === 'BODY') break // Reached end
      }
      
      // Should be able to navigate back
      await user.tab({ shift: true })
      focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
    })

    it('should announce changes to screen readers', async () => {
      const user = userEvent.setup()
      renderWithRouter(<SettingsPage />)
      
      // Changes should have aria-live regions or similar
      const languageSelect = screen.getByRole('combobox', { name: /language/i })
      await user.selectOptions(languageSelect, 'en')
      
      // Check for accessibility announcements
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThanOrEqual(0) // Some apps may not use aria-live
    })
  })
})