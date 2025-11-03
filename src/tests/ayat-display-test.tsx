import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LessonPage from '../pages/LessonPage'

// Mock the stores
jest.mock('../stores/quranStore', () => ({
  useQuranStore: () => ({
    currentSurah: 1,
    currentAyahIndex: 0,
    ayahs: [
      {
        number: 1,
        text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        numberInSurah: 1,
        surah: 1,
        juz: 1,
        manzil: 1,
        page: 1,
        ruku: 1,
        hizbQuarter: 1,
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        transliteration: "Bismillahir rahmanir raheem"
      }
    ],
    loadAyahs: jest.fn()
  })
}))

jest.mock('../stores/progressStore', () => ({
  useProgressStore: () => ({
    addXP: jest.fn(),
    completeLesson: jest.fn(),
    updateStreak: jest.fn()
  })
}))

jest.mock('../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: {
      showTranslation: true,
      showTransliteration: true
    }
  })
}))

describe('LessonPage Arabic Text Display', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    )
  }

  test('should display Arabic text correctly', async () => {
    renderWithRouter(<LessonPage />)
    
    // Wait for exercises to be generated
    await waitFor(() => {
      // Check if Arabic text is present
      const arabicText = screen.getByText(/بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ/)
      expect(arabicText).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  test('should display translation when enabled', async () => {
    renderWithRouter(<LessonPage />)
    
    await waitFor(() => {
      const translation = screen.getByText(/In the name of Allah, the Entirely Merciful/)
      expect(translation).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})