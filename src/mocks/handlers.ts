/**
 * MSW Request Handlers
 *
 * Mock Service Worker handlers for API mocking in tests.
 * Provides realistic responses for Quran API endpoints.
 */

import { http, HttpResponse } from 'msw'
import { quranFixtures, ayahFixtures, chapterFixtures, audioFixtures } from './fixtures'

const API_BASE_URL = 'https://api.quran.com/api/v4'

export const handlers = [
  // Get chapters list
  http.get(`${API_BASE_URL}/chapters`, () => {
    return HttpResponse.json({
      chapters: chapterFixtures
    })
  }),

  // Get specific chapter
  http.get(`${API_BASE_URL}/chapters/:id`, ({ params }) => {
    const chapter = chapterFixtures.find(c => c.id === Number(params.id))
    if (!chapter) {
      return HttpResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({ chapter })
  }),

  // Get chapter verses
  http.get(`${API_BASE_URL}/verses/by_chapter/:chapterId`, ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const perPage = Number(url.searchParams.get('per_page')) || 10
    const chapterId = Number(params.chapterId)

    const chapterVerses = ayahFixtures.filter(v => v.chapter_id === chapterId)
    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedVerses = chapterVerses.slice(start, end)

    return HttpResponse.json({
      verses: paginatedVerses,
      pagination: {
        per_page: perPage,
        current_page: page,
        next_page: end < chapterVerses.length ? page + 1 : null,
        total_pages: Math.ceil(chapterVerses.length / perPage),
        total_records: chapterVerses.length
      }
    })
  }),

  // Get specific verse
  http.get(`${API_BASE_URL}/verses/:id`, ({ params }) => {
    const verse = ayahFixtures.find(v => v.verse_key === params.id)
    if (!verse) {
      return HttpResponse.json(
        { error: 'Verse not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({ verse })
  }),

  // Get verse by key (chapter:verse format)
  http.get(`${API_BASE_URL}/verses/by_key/:key`, ({ params }) => {
    const verse = ayahFixtures.find(v => v.verse_key === params.key)
    if (!verse) {
      return HttpResponse.json(
        { error: 'Verse not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({ verse })
  }),

  // Get audio files for chapter
  http.get(`${API_BASE_URL}/chapter_recitations/:reciterId/:chapterId`, ({ params }) => {
    const audio = audioFixtures.find(
      a => a.chapter_id === Number(params.chapterId) &&
           a.reciter_id === Number(params.reciterId)
    )
    if (!audio) {
      return HttpResponse.json(
        { error: 'Audio not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({ audio_file: audio })
  }),

  // Get translations
  http.get(`${API_BASE_URL}/resources/translations`, () => {
    return HttpResponse.json({
      translations: [
        {
          id: 131,
          name: 'Dr. Mustafa Khattab, the Clear Quran',
          author_name: 'Dr. Mustafa Khattab',
          language_name: 'english'
        },
        {
          id: 20,
          name: 'Sahih International',
          author_name: 'Saheeh International',
          language_name: 'english'
        }
      ]
    })
  }),

  // Search verses
  http.get(`${API_BASE_URL}/search`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const page = Number(url.searchParams.get('page')) || 1
    const perPage = Number(url.searchParams.get('per_page')) || 20

    const results = ayahFixtures.filter(v =>
      v.text_uthmani.includes(query) ||
      v.text_imlaei?.includes(query)
    )

    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedResults = results.slice(start, end)

    return HttpResponse.json({
      search: {
        query,
        total_results: results.length,
        current_page: page,
        total_pages: Math.ceil(results.length / perPage),
        results: paginatedResults
      }
    })
  }),

  // Get tafsirs (interpretations)
  http.get(`${API_BASE_URL}/tafsirs/:tafsirId/by_ayah/:verseKey`, ({ params }) => {
    return HttpResponse.json({
      tafsir: {
        id: Number(params.tafsirId),
        verse_key: params.verseKey,
        text: 'This is a mock tafsir explanation for testing purposes.',
        resource_name: 'Tafsir al-Jalalayn',
        language_name: 'arabic'
      }
    })
  }),

  // Get juzs (parts)
  http.get(`${API_BASE_URL}/juzs`, () => {
    return HttpResponse.json({
      juzs: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        juz_number: i + 1,
        verse_mapping: {}
      }))
    })
  }),

  // Error simulation for testing error handling
  http.get(`${API_BASE_URL}/test/error`, () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }),

  // Network delay simulation
  http.get(`${API_BASE_URL}/test/slow`, async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    return HttpResponse.json({ message: 'Slow response' })
  })
]

// Export individual handler groups for selective testing
export const chapterHandlers = handlers.slice(0, 2)
export const verseHandlers = handlers.slice(2, 5)
export const audioHandlers = handlers.slice(5, 6)
export const translationHandlers = handlers.slice(6, 7)
export const searchHandlers = handlers.slice(7, 8)
export const tafsirHandlers = handlers.slice(8, 9)
export const juzHandlers = handlers.slice(9, 10)
export const errorHandlers = handlers.slice(10)
