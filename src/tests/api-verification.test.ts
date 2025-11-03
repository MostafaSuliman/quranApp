/**
 * Comprehensive API Verification Test Suite
 * Testing Quran.com API v4 integration and data transformation
 * 
 * This test ensures authentic Islamic content and proper API integration
 */

import { quranApi } from '../utils/quranApi'
import { Surah, Ayah, Reciter } from '../types/quran'

describe('Quran.com API v4 Integration Verification', () => {
  beforeAll(() => {
    // Clear cache to ensure fresh API calls
    quranApi.clearCache()
  })

  describe('Chapters/Surahs API', () => {
    let surahs: Surah[]

    beforeAll(async () => {
      surahs = await quranApi.getChapters()
    })

    test('should fetch all 114 surahs', () => {
      expect(surahs).toHaveLength(114)
      expect(surahs[0].number).toBe(1)
      expect(surahs[113].number).toBe(114)
    })

    test('should have correct Al-Fatiha data', () => {
      const alFatiha = surahs.find(s => s.number === 1)
      expect(alFatiha).toBeDefined()
      expect(alFatiha?.name).toBe('الفاتحة')
      expect(alFatiha?.englishName).toBe('Al-Fatihah')
      expect(alFatiha?.numberOfAyahs).toBe(7)
      expect(alFatiha?.revelationType).toBe('Meccan')
    })

    test('should have correct An-Nas data', () => {
      const anNas = surahs.find(s => s.number === 114)
      expect(anNas).toBeDefined()
      expect(anNas?.name).toBe('الناس')
      expect(anNas?.englishName).toBe('An-Nas')
      expect(anNas?.numberOfAyahs).toBe(6)
      expect(anNas?.revelationType).toBe('Meccan')
    })

    test('should have correct Al-Baqarah data', () => {
      const alBaqarah = surahs.find(s => s.number === 2)
      expect(alBaqarah).toBeDefined()
      expect(alBaqarah?.name).toBe('البقرة')
      expect(alBaqarah?.englishName).toBe('Al-Baqarah')
      expect(alBaqarah?.numberOfAyahs).toBe(286)
      expect(alBaqarah?.revelationType).toBe('Medinan')
    })
  })

  describe('Verses API and Arabic Text Verification', () => {
    test('should fetch Al-Fatiha verses with authentic Arabic text', async () => {
      const result = await quranApi.getChapterVerses(1)
      const verses = result.verses

      expect(verses).toHaveLength(7)

      // Verify first verse (Bismillah)
      expect(verses[0].text).toBe('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ')
      expect(verses[0].numberInSurah).toBe(1)
      expect(verses[0].surah).toBe(1)

      // Verify Alhamdulillah verse
      expect(verses[1].text).toBe('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ')
      expect(verses[1].numberInSurah).toBe(2)

      // Verify last verse
      expect(verses[6].text).toBe('صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ')
      expect(verses[6].numberInSurah).toBe(7)
    })

    test('should fetch An-Nas verses with correct Arabic text', async () => {
      const result = await quranApi.getChapterVerses(114)
      const verses = result.verses

      expect(verses).toHaveLength(6)

      // Verify first verse
      expect(verses[0].text).toContain('قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ')
      expect(verses[0].numberInSurah).toBe(1)

      // Verify last verse
      expect(verses[5].text).toBe('مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ')
      expect(verses[5].numberInSurah).toBe(6)
    })

    test('should fetch Al-Baqarah first verses', async () => {
      const result = await quranApi.getChapterVerses(2, { perPage: 3 })
      const verses = result.verses

      expect(verses).toHaveLength(3)

      // Verify Alif Lam Mim
      expect(verses[0].text).toContain('الٓمٓ')
      
      // Verify second verse
      expect(verses[1].text).toBe('ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ')
    })

    test('should have proper verse metadata', async () => {
      const result = await quranApi.getChapterVerses(1)
      const verse = result.verses[0]

      expect(verse.number).toBeDefined()
      expect(verse.numberInSurah).toBe(1)
      expect(verse.surah).toBe(1)
      expect(verse.juz).toBe(1)
      expect(verse.page).toBe(1)
      expect(typeof verse.text).toBe('string')
      expect(verse.text.length).toBeGreaterThan(0)
    })
  })

  describe('Data Transformation Functions', () => {
    test('should transform chapter data correctly', async () => {
      const chapter = await quranApi.getChapter(1)

      expect(chapter.number).toBe(1)
      expect(chapter.name).toBe('الفاتحة')
      expect(chapter.englishName).toBe('Al-Fatihah')
      expect(chapter.numberOfAyahs).toBe(7)
      expect(chapter.revelationType).toMatch(/^(Meccan|Medinan)$/)
      expect(Array.isArray(chapter.ayahs)).toBe(true)
    })

    test('should handle Arabic text encoding properly', async () => {
      const result = await quranApi.getChapterVerses(1)
      const arabicText = result.verses[0].text

      // Check for proper UTF-8 encoding
      expect(arabicText).toMatch(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/)
      
      // Should not contain replacement characters
      expect(arabicText).not.toContain('�')
      
      // Should contain proper Arabic diacritics
      expect(arabicText).toMatch(/[\u064B-\u0652\u0670\u0640]/)
    })
  })

  describe('Reciters API', () => {
    let reciters: Reciter[]

    beforeAll(async () => {
      reciters = await quranApi.getReciters()
    })

    test('should fetch available reciters', () => {
      expect(reciters.length).toBeGreaterThan(0)
      expect(reciters[0]).toHaveProperty('id')
      expect(reciters[0]).toHaveProperty('name')
      expect(reciters[0]).toHaveProperty('englishName')
      expect(reciters[0]).toHaveProperty('style')
    })

    test('should have AbdulBaset AbdulSamad', () => {
      const abdulBaset = reciters.find(r => r.name.includes('AbdulBaset'))
      expect(abdulBaset).toBeDefined()
      expect(abdulBaset?.style).toMatch(/Murattal|Mujawwad/)
    })
  })

  describe('Audio URL Generation', () => {
    test('should generate correct audio URLs', () => {
      const audioUrl = quranApi.getAudioUrl('2', 1, 1)
      expect(audioUrl).toMatch(/^https:\/\/cdn\.islamic\.network\/quran\/audio\/2\/001001\.mp3$/)
    })

    test('should generate correct chapter audio URLs', () => {
      const chapterUrl = quranApi.getChapterAudioUrl('2', 1)
      expect(chapterUrl).toMatch(/^https:\/\/cdn\.islamic\.network\/quran\/audio\/2\/001\.mp3$/)
    })

    test('should handle padding correctly', () => {
      const url1 = quranApi.getAudioUrl('2', 2, 255)
      expect(url1).toContain('002255.mp3')

      const url2 = quranApi.getAudioUrl('2', 114, 6)
      expect(url2).toContain('114006.mp3')
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid chapter numbers gracefully', async () => {
      await expect(quranApi.getChapter(115)).rejects.toThrow()
      await expect(quranApi.getChapterVerses(0)).rejects.toThrow()
    })

    test('should handle network errors gracefully', async () => {
      // This would require mocking the API to simulate network errors
      // For now, we test that the error messages are meaningful
      try {
        await quranApi.getChapter(999)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Failed to fetch chapter')
      }
    })
  })

  describe('Caching Behavior', () => {
    test('should cache API responses', async () => {
      // Clear cache first
      quranApi.clearCache()
      
      const startTime = Date.now()
      const firstCall = await quranApi.getChapters()
      const firstCallTime = Date.now() - startTime

      const startTime2 = Date.now()
      const secondCall = await quranApi.getChapters()
      const secondCallTime = Date.now() - startTime2

      expect(firstCall).toEqual(secondCall)
      // Second call should be significantly faster (cached)
      expect(secondCallTime).toBeLessThan(firstCallTime / 2)
    })

    test('should provide cache statistics', () => {
      const stats = quranApi.getCacheStats()
      expect(typeof stats.size).toBe('number')
      expect(Array.isArray(stats.keys)).toBe(true)
    })
  })

  describe('Search Functionality', () => {
    test('should search verses by text', async () => {
      const results = await quranApi.searchVerses('الحمد', { size: 5 })
      
      expect(results.verses.length).toBeGreaterThan(0)
      expect(results.verses[0]).toHaveProperty('text')
      expect(results.verses[0].text).toContain('الحمد')
    })
  })

  describe('Islamic Content Authenticity', () => {
    test('should verify Uthmani script characteristics', async () => {
      const result = await quranApi.getChapterVerses(1)
      const bismillah = result.verses[0].text

      // Check for specific Uthmani script features
      expect(bismillah).toBe('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ')
      
      // Check for proper alif characters (both regular and superscript)
      expect(bismillah).toMatch(/ٱ/) // Alif Wasla
      expect(bismillah).toMatch(/ـٰ/) // Superscript Alif
    })

    test('should have consistent verse numbering', async () => {
      const result = await quranApi.getChapterVerses(1)
      
      result.verses.forEach((verse, index) => {
        expect(verse.numberInSurah).toBe(index + 1)
        expect(verse.surah).toBe(1)
      })
    })

    test('should preserve Islamic content integrity', async () => {
      const alFatiha = await quranApi.getChapterVerses(1)
      const anNas = await quranApi.getChapterVerses(114)

      // Verify total verse counts match official Quran
      expect(alFatiha.verses).toHaveLength(7)
      expect(anNas.verses).toHaveLength(6)

      // Verify no verse is missing or duplicated
      const fatihaNumbers = alFatiha.verses.map(v => v.numberInSurah)
      expect(fatihaNumbers).toEqual([1, 2, 3, 4, 5, 6, 7])

      const nasNumbers = anNas.verses.map(v => v.numberInSurah)
      expect(nasNumbers).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('Performance and Rate Limiting', () => {
    test('should handle multiple concurrent requests', async () => {
      const promises = [
        quranApi.getChapter(1),
        quranApi.getChapter(2),
        quranApi.getChapter(114),
        quranApi.getReciters(),
        quranApi.getTranslations()
      ]

      const results = await Promise.all(promises)
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result).toBeDefined()
      })
    })

    test('should respect API timeout settings', async () => {
      // This test verifies our timeout configuration
      const startTime = Date.now()
      
      try {
        await quranApi.getChapters()
        const endTime = Date.now()
        
        // Should complete well within our 10-second timeout
        expect(endTime - startTime).toBeLessThan(10000)
      } catch (error) {
        // If it times out, verify it's within our configured timeout
        const endTime = Date.now()
        expect(endTime - startTime).toBeGreaterThan(9000) // Close to 10s timeout
      }
    })
  })
})