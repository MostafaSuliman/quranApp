/**
 * Integration Tests for Quran API
 *
 * Tests API integration with MSW mocking:
 * - Chapter fetching
 * - Verse retrieval
 * - Search functionality
 * - Error handling
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'https://api.quran.com/api/v4'

describe('Quran API Integration', () => {
  describe('Chapters API', () => {
    it('should fetch all chapters', async () => {
      const response = await fetch(`${API_BASE_URL}/chapters`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.chapters).toBeDefined()
      expect(Array.isArray(data.chapters)).toBe(true)
      expect(data.chapters.length).toBeGreaterThan(0)
    })

    it('should fetch specific chapter by ID', async () => {
      const response = await fetch(`${API_BASE_URL}/chapters/1`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.chapter).toBeDefined()
      expect(data.chapter.id).toBe(1)
      expect(data.chapter.name_arabic).toBe('الفاتحة')
    })

    it('should return 404 for non-existent chapter', async () => {
      const response = await fetch(`${API_BASE_URL}/chapters/999`)

      expect(response.status).toBe(404)
    })
  })

  describe('Verses API', () => {
    it('should fetch verses by chapter', async () => {
      const response = await fetch(`${API_BASE_URL}/verses/by_chapter/1`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.verses).toBeDefined()
      expect(Array.isArray(data.verses)).toBe(true)
    })

    it('should support pagination', async () => {
      const page1 = await fetch(`${API_BASE_URL}/verses/by_chapter/1?page=1&per_page=3`)
      const data1 = await page1.json()

      expect(data1.verses).toHaveLength(3)
      expect(data1.pagination.current_page).toBe(1)
      expect(data1.pagination.next_page).toBe(2)

      const page2 = await fetch(`${API_BASE_URL}/verses/by_chapter/1?page=2&per_page=3`)
      const data2 = await page2.json()

      expect(data2.verses).toHaveLength(3)
      expect(data2.pagination.current_page).toBe(2)
    })

    it('should fetch specific verse by key', async () => {
      const response = await fetch(`${API_BASE_URL}/verses/by_key/1:1`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.verse.verse_key).toBe('1:1')
      expect(data.verse.text_uthmani).toBeDefined()
    })

    it('should validate Arabic text format', async () => {
      const response = await fetch(`${API_BASE_URL}/verses/by_key/1:1`)
      const data = await response.json()

      const text = data.verse.text_uthmani
      const hasArabic = /[\u0600-\u06FF]/.test(text)

      expect(hasArabic).toBe(true)
    })
  })

  describe('Audio API', () => {
    it('should fetch audio for chapter', async () => {
      const response = await fetch(`${API_BASE_URL}/chapter_recitations/7/1`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.audio_file).toBeDefined()
      expect(data.audio_file.audio_url).toBeDefined()
    })

    it('should return 404 for non-existent audio', async () => {
      const response = await fetch(`${API_BASE_URL}/chapter_recitations/999/999`)

      expect(response.status).toBe(404)
    })
  })

  describe('Search API', () => {
    it('should search verses by text', async () => {
      const query = 'بسم'
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.search.results).toBeDefined()
      expect(data.search.query).toBe(query)
    })

    it('should support search pagination', async () => {
      const response = await fetch(`${API_BASE_URL}/search?q=الله&page=1&per_page=5`)
      const data = await response.json()

      expect(data.search.results.length).toBeLessThanOrEqual(5)
      expect(data.search.current_page).toBe(1)
    })
  })

  describe('Translations API', () => {
    it('should fetch available translations', async () => {
      const response = await fetch(`${API_BASE_URL}/resources/translations`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.translations).toBeDefined()
      expect(Array.isArray(data.translations)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle 500 errors', async () => {
      const response = await fetch(`${API_BASE_URL}/test/error`)

      expect(response.status).toBe(500)
    })

    it('should handle network timeouts', async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)

      try {
        await fetch(`${API_BASE_URL}/test/slow`, {
          signal: controller.signal
        })
      } catch (error: any) {
        expect(error.name).toBe('AbortError')
      } finally {
        clearTimeout(timeoutId)
      }
    })
  })

  describe('Data Integrity', () => {
    it('should validate chapter structure', async () => {
      const response = await fetch(`${API_BASE_URL}/chapters/1`)
      const data = await response.json()

      const chapter = data.chapter
      expect(chapter).toHaveProperty('id')
      expect(chapter).toHaveProperty('name_arabic')
      expect(chapter).toHaveProperty('name_simple')
      expect(chapter).toHaveProperty('verses_count')
      expect(chapter).toHaveProperty('revelation_place')
    })

    it('should validate verse structure', async () => {
      const response = await fetch(`${API_BASE_URL}/verses/by_key/1:1`)
      const data = await response.json()

      const verse = data.verse
      expect(verse).toHaveProperty('id')
      expect(verse).toHaveProperty('verse_key')
      expect(verse).toHaveProperty('text_uthmani')
      expect(verse).toHaveProperty('chapter_id')
      expect(verse).toHaveProperty('verse_number')
    })
  })

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now()
      await fetch(`${API_BASE_URL}/chapters/1`)
      const duration = Date.now() - start

      // Should respond within 1 second for mocked requests
      expect(duration).toBeLessThan(1000)
    })

    it('should handle concurrent requests', async () => {
      const requests = [
        fetch(`${API_BASE_URL}/chapters/1`),
        fetch(`${API_BASE_URL}/chapters/2`),
        fetch(`${API_BASE_URL}/chapters/3`)
      ]

      const responses = await Promise.all(requests)

      expect(responses).toHaveLength(3)
      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })
    })
  })
})
