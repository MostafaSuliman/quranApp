import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import MushafReaderPage from '../pages/MushafReaderPage'

// Mock all the stores
vi.mock('../stores/quranStore', () => ({
  useQuranStore: () => ({
    currentSurah: 1,
    currentPage: 1,
    ayahs: [],
    reciters: [{ id: '1', name: 'Test Reciter' }],
    loadPage: vi.fn(),
    loadSurah: vi.fn(),
    setCurrentPage: vi.fn(),
    setCurrentSurah: vi.fn(),
  }),
}))

vi.mock('../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: {
      showTranslation: true,
      showTransliteration: true,
    },
  }),
}))

vi.mock('../stores/progressStore', () => ({
  useProgressStore: () => ({
    addReadingTime: vi.fn(),
  }),
}))

vi.mock('../stores/audioStore', () => ({
  useAudioStore: () => ({
    currentAyahNumber: null,
    currentSurahNumber: null,
    loadAyahAudio: vi.fn(),
    currentReciter: { id: '1', name: 'Test Reciter' },
    isPlaying: false,
  }),
}))

// Mock the audio controls hook
vi.mock('../hooks/useAudioControls', () => ({
  default: () => {},
}))

// Mock components that might have complex dependencies
vi.mock('../components/AudioPlayer', () => ({
  default: () => <div data-testid="audio-player">Audio Player</div>,
}))

vi.mock('../components/AyahDisplay', () => ({
  default: () => <div data-testid="ayah-display">Ayah Display</div>,
}))

vi.mock('../components/QuranText', () => ({
  default: ({ text }: { text: string }) => <div data-testid="quran-text">{text}</div>,
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('MushafReaderPage', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithRouter(<MushafReaderPage />)
    }).not.toThrow()
  })

  it('displays loading state initially', () => {
    renderWithRouter(<MushafReaderPage />)
    expect(screen.getByText('Loading Quran page...')).toBeInTheDocument()
  })

  it('handles undefined playingAyah gracefully', () => {
    // This test ensures that the undefined playingAyah variable doesn't cause crashes
    expect(() => {
      renderWithRouter(<MushafReaderPage />)
    }).not.toThrow()
  })
})