/**
 * Unit Tests for QuranText Component
 *
 * Tests React component for displaying Quranic text with proper interface.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuranText } from '@/components/QuranText'

describe('QuranText Component', () => {
  const mockText = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'

  describe('Rendering', () => {
    it('should render Arabic text correctly', () => {
      render(<QuranText text={mockText} />)

      const arabicText = screen.getByText(mockText)
      expect(arabicText).toBeInTheDocument()
    })

    it('should render with medium size by default', () => {
      const { container } = render(<QuranText text={mockText} />)

      const textElement = container.querySelector('.quran-text-medium')
      expect(textElement).toBeInTheDocument()
    })

    it('should render with specified size', () => {
      const { container } = render(<QuranText text={mockText} size="large" />)

      const textElement = container.querySelector('.quran-text-large')
      expect(textElement).toBeInTheDocument()
    })

    it('should render ayah number when specified', () => {
      render(<QuranText text={mockText} showAyahNumber ayahNumber={1} />)

      const ayahNumber = screen.getByText('١')
      expect(ayahNumber).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply regular style by default', () => {
      const { container } = render(<QuranText text={mockText} />)

      const textElement = container.querySelector('.quran-text-medium')
      expect(textElement).toBeInTheDocument()
    })

    it('should apply mushaf style when specified', () => {
      const { container } = render(<QuranText text={mockText} style="mushaf" />)

      const textElement = container.querySelector('.mushaf-text')
      expect(textElement).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<QuranText text={mockText} className="custom-class" />)

      const element = container.querySelector('.custom-class')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<QuranText text={mockText} onClick={handleClick} />)

      const textElement = screen.getByText(mockText)
      await user.click(textElement)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should show hover effect when clickable', () => {
      const { container } = render(<QuranText text={mockText} onClick={() => {}} />)

      const element = container.querySelector('.cursor-pointer')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Highlighting', () => {
    it('should apply highlighted style', () => {
      const { container } = render(<QuranText text={mockText} isHighlighted />)

      const element = container.querySelector('.bg-primary-100')
      expect(element).toBeInTheDocument()
    })

    it('should apply playing style', () => {
      const { container } = render(<QuranText text={mockText} isPlaying />)

      const element = container.querySelector('.bg-gold-100')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Arabic Numerals', () => {
    it('should display ayah number in Arabic numerals', () => {
      render(<QuranText text={mockText} showAyahNumber ayahNumber={7} />)

      const ayahNumber = screen.getByText('٧')
      expect(ayahNumber).toBeInTheDocument()
    })

    it('should convert multi-digit numbers to Arabic numerals', () => {
      render(<QuranText text={mockText} showAyahNumber ayahNumber={123} />)

      const ayahNumber = screen.getByText('١٢٣')
      expect(ayahNumber).toBeInTheDocument()
    })
  })

  describe('Islamic Content Validation', () => {
    it('should validate Arabic characters', () => {
      render(<QuranText text={mockText} />)

      const arabicText = screen.getByText(mockText)
      const text = arabicText.textContent || ''

      // Check for valid Arabic Unicode range
      const hasArabic = /[\u0600-\u06FF]/.test(text)
      expect(hasArabic).toBe(true)
    })

    it('should preserve diacritics', () => {
      render(<QuranText text={mockText} />)

      const arabicText = screen.getByText(mockText)
      const text = arabicText.textContent || ''

      // Check for diacritics (tashkeel)
      const hasDiacritics = /[\u064B-\u065F]/.test(text)
      expect(hasDiacritics).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle empty text gracefully', () => {
      const { container } = render(<QuranText text="" />)

      expect(container).toBeInTheDocument()
    })
  })
})
