import React, { useMemo } from 'react'
import { Ayah } from '../types/quran'

interface MushafVerseFlowProps {
  ayahs: Ayah[]
  onAyahClick?: (ayah: Ayah) => void
  selectedAyah?: Ayah | null
  playingAyah?: {
    surahNumber: number | null
    ayahNumber: number | null
  }
  linesPerPage?: number
  className?: string
}

interface FlowedLine {
  id: string
  content: Array<{
    type: 'text' | 'ayah-number' | 'space'
    text: string
    ayah?: Ayah
    ayahNumber?: number
  }>
  ayahs: Ayah[]
}

/**
 * Component that flows Quran verses across traditional 15-line Mushaf layout
 * Similar to how verses naturally flow across lines in traditional Mushaf pages
 */
const MushafVerseFlow: React.FC<MushafVerseFlowProps> = ({
  ayahs,
  onAyahClick,
  selectedAyah,
  playingAyah,
  linesPerPage = 15,
  className = ''
}) => {

  // Convert Arabic numbers to Arabic-Indic numerals
  const toArabicNumerals = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('')
  }

  // Flow verses across lines based on character count and traditional layout
  const flowedLines = useMemo(() => {
    if (!ayahs || ayahs.length === 0) return []

    const lines: FlowedLine[] = []
    let currentLine: FlowedLine = {
      id: `line-0`,
      content: [],
      ayahs: []
    }
    
    // Approximate characters per line (adjustable based on font size and container width)
    const avgCharsPerLine = 85
    let currentLineLength = 0
    let lineIndex = 0

    ayahs.forEach((ayah, ayahIndex) => {
      const ayahText = ayah.text.trim()
      const ayahNumber = ayah.numberInSurah
      const ayahNumberText = `﴿${toArabicNumerals(ayahNumber)}﴾`
      
      // Calculate total length including ayah number
      const totalAyahLength = ayahText.length + ayahNumberText.length + 2 // +2 for spaces

      // Check if we need to start a new line
      if (currentLineLength + totalAyahLength > avgCharsPerLine && currentLine.content.length > 0) {
        // Finish current line and start new one
        lines.push(currentLine)
        lineIndex++
        currentLine = {
          id: `line-${lineIndex}`,
          content: [],
          ayahs: []
        }
        currentLineLength = 0
      }

      // Add space if not first content in line
      if (currentLine.content.length > 0) {
        currentLine.content.push({ type: 'space', text: ' ' })
        currentLineLength += 1
      }

      // Add ayah text
      currentLine.content.push({
        type: 'text',
        text: ayahText,
        ayah
      })
      
      // Add ayah number
      currentLine.content.push({
        type: 'ayah-number',
        text: ayahNumberText,
        ayah,
        ayahNumber
      })

      currentLine.ayahs.push(ayah)
      currentLineLength += totalAyahLength

      // If this is the last ayah, push the current line
      if (ayahIndex === ayahs.length - 1) {
        lines.push(currentLine)
      }
    })

    // Ensure we have exactly the specified number of lines (pad with empty lines if needed)
    while (lines.length < linesPerPage) {
      lines.push({
        id: `line-${lines.length}`,
        content: [],
        ayahs: []
      })
    }

    // If we have more lines than specified, truncate (shouldn't happen with proper pagination)
    return lines.slice(0, linesPerPage)
  }, [ayahs, linesPerPage])

  const handleAyahClick = (ayah: Ayah) => {
    if (onAyahClick) {
      onAyahClick(ayah)
    }
  }

  const isAyahSelected = (ayah: Ayah): boolean => {
    return selectedAyah?.number === ayah.number
  }

  const isAyahPlaying = (ayah: Ayah): boolean => {
    return Boolean(
      playingAyah?.surahNumber === ayah.surah &&
      playingAyah?.ayahNumber === ayah.numberInSurah
    )
  }

  return (
    <div className={`mushaf-lines-container ${className}`}>
      {flowedLines.map((line) => (
        <div
          key={line.id}
          className="mushaf-line"
          style={{
            minHeight: `${100 / linesPerPage}%`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end', // RTL alignment
            flexWrap: 'wrap',
            gap: '2px'
          }}
        >
          {line.content.map((item, itemIndex) => {
            if (item.type === 'space') {
              return <span key={`${line.id}-${itemIndex}`} className="inline-block w-2" />
            }
            
            if (item.type === 'ayah-number' && item.ayah) {
              return (
                <span
                  key={`${line.id}-${itemIndex}`}
                  className={`mushaf-ayah-number ${
                    isAyahSelected(item.ayah) ? 'selected' : ''
                  } ${
                    isAyahPlaying(item.ayah) ? 'playing' : ''
                  }`}
                  onClick={() => handleAyahClick(item.ayah!)}
                  title={`Ayah ${item.ayahNumber} - Click to play`}
                >
                  {toArabicNumerals(item.ayahNumber!)}
                </span>
              )
            }
            
            if (item.type === 'text' && item.ayah) {
              return (
                <span
                  key={`${line.id}-${itemIndex}`}
                  className={`mushaf-ayah-text ${
                    isAyahSelected(item.ayah) ? 'selected' : ''
                  } ${
                    isAyahPlaying(item.ayah) ? 'playing' : ''
                  }`}
                  onClick={() => handleAyahClick(item.ayah!)}
                  title={`Surah ${item.ayah.surah}, Ayah ${item.ayah.numberInSurah} - Click to play`}
                >
                  {item.text}
                </span>
              )
            }
            
            return null
          })}
        </div>
      ))}
    </div>
  )
}

export default MushafVerseFlow
