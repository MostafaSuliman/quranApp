/**
 * Test Fixtures for API Mocking
 *
 * Realistic test data for Quran API responses.
 * Based on actual Quran content and structure.
 */

export interface ChapterFixture {
  id: number
  revelation_place: string
  revelation_order: number
  bismillah_pre: boolean
  name_simple: string
  name_complex: string
  name_arabic: string
  verses_count: number
  pages: number[]
  translated_name: {
    language_name: string
    name: string
  }
}

export interface AyahFixture {
  id: number
  verse_number: number
  verse_key: string
  chapter_id: number
  text_uthmani: string
  text_imlaei?: string
  text_indopak?: string
  juz_number: number
  hizb_number: number
  rub_number: number
  page_number: number
  words: Array<{
    id: number
    position: number
    text: string
    translation: string
  }>
  audio?: {
    url: string
    format: string
  }
}

export interface AudioFixture {
  id: number
  chapter_id: number
  reciter_id: number
  file_size: number
  format: string
  audio_url: string
  duration: number
}

// Chapter fixtures - First 3 chapters for testing
export const chapterFixtures: ChapterFixture[] = [
  {
    id: 1,
    revelation_place: 'makkah',
    revelation_order: 5,
    bismillah_pre: false,
    name_simple: 'Al-Fatihah',
    name_complex: 'Al-Fātiĥah',
    name_arabic: 'الفاتحة',
    verses_count: 7,
    pages: [1, 2],
    translated_name: {
      language_name: 'english',
      name: 'The Opening'
    }
  },
  {
    id: 2,
    revelation_place: 'madinah',
    revelation_order: 87,
    bismillah_pre: true,
    name_simple: 'Al-Baqarah',
    name_complex: 'Al-Baqarah',
    name_arabic: 'البقرة',
    verses_count: 286,
    pages: [2, 49],
    translated_name: {
      language_name: 'english',
      name: 'The Cow'
    }
  },
  {
    id: 3,
    revelation_place: 'madinah',
    revelation_order: 89,
    bismillah_pre: true,
    name_simple: 'Ali \'Imran',
    name_complex: 'Āli `Imrān',
    name_arabic: 'آل عمران',
    verses_count: 200,
    pages: [50, 76],
    translated_name: {
      language_name: 'english',
      name: 'Family of Imran'
    }
  }
]

// Ayah fixtures - Al-Fatihah (Chapter 1) verses
export const ayahFixtures: AyahFixture[] = [
  {
    id: 1,
    verse_number: 1,
    verse_key: '1:1',
    chapter_id: 1,
    text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    text_imlaei: 'بسم الله الرحمن الرحيم',
    juz_number: 1,
    hizb_number: 1,
    rub_number: 1,
    page_number: 1,
    words: [
      { id: 1, position: 1, text: 'بِسْمِ', translation: 'In the name' },
      { id: 2, position: 2, text: 'ٱللَّهِ', translation: 'of Allah' },
      { id: 3, position: 3, text: 'ٱلرَّحْمَٰنِ', translation: 'the Most Gracious' },
      { id: 4, position: 4, text: 'ٱلرَّحِيمِ', translation: 'the Most Merciful' }
    ]
  },
  {
    id: 2,
    verse_number: 2,
    verse_key: '1:2',
    chapter_id: 1,
    text_uthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    text_imlaei: 'الحمد لله رب العالمين',
    juz_number: 1,
    hizb_number: 1,
    rub_number: 1,
    page_number: 1,
    words: [
      { id: 5, position: 1, text: 'ٱلْحَمْدُ', translation: 'All praise' },
      { id: 6, position: 2, text: 'لِلَّهِ', translation: 'to Allah' },
      { id: 7, position: 3, text: 'رَبِّ', translation: 'Lord' },
      { id: 8, position: 4, text: 'ٱلْعَٰلَمِينَ', translation: 'of the worlds' }
    ]
  },
  {
    id: 3,
    verse_number: 3,
    verse_key: '1:3',
    chapter_id: 1,
    text_uthmani: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    text_imlaei: 'الرحمن الرحيم',
    juz_number: 1,
    hizb_number: 1,
    rub_number: 1,
    page_number: 1,
    words: [
      { id: 9, position: 1, text: 'ٱلرَّحْمَٰنِ', translation: 'The Most Gracious' },
      { id: 10, position: 2, text: 'ٱلرَّحِيمِ', translation: 'The Most Merciful' }
    ]
  },
  {
    id: 4,
    verse_number: 4,
    verse_key: '1:4',
    chapter_id: 1,
    text_uthmani: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
    text_imlaei: 'مالك يوم الدين',
    juz_number: 1,
    hizb_number: 1,
    rub_number: 1,
    page_number: 1,
    words: [
      { id: 11, position: 1, text: 'مَٰلِكِ', translation: 'Master' },
      { id: 12, position: 2, text: 'يَوْمِ', translation: 'of the Day' },
      { id: 13, position: 3, text: 'ٱلدِّينِ', translation: 'of Judgment' }
    ]
  },
  {
    id: 5,
    verse_number: 5,
    verse_key: '1:5',
    chapter_id: 1,
    text_uthmani: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    text_imlaei: 'إياك نعبد وإياك نستعين',
    juz_number: 1,
    hizb_number: 1,
    rub_number: 1,
    page_number: 1,
    words: [
      { id: 14, position: 1, text: 'إِيَّاكَ', translation: 'You alone' },
      { id: 15, position: 2, text: 'نَعْبُدُ', translation: 'we worship' },
      { id: 16, position: 3, text: 'وَإِيَّاكَ', translation: 'and You alone' },
      { id: 17, position: 4, text: 'نَسْتَعِينُ', translation: 'we ask for help' }
    ]
  },
  {
    id: 6,
    verse_number: 6,
    verse_key: '1:6',
    chapter_id: 1,
    text_uthmani: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    text_imlaei: 'اهدنا الصراط المستقيم',
    juz_number: 1,
    hizb_number: 1,
    rub_number: 1,
    page_number: 1,
    words: [
      { id: 18, position: 1, text: 'ٱهْدِنَا', translation: 'Guide us' },
      { id: 19, position: 2, text: 'ٱلصِّرَٰطَ', translation: 'to the path' },
      { id: 20, position: 3, text: 'ٱلْمُسْتَقِيمَ', translation: 'the straight' }
    ]
  },
  {
    id: 7,
    verse_number: 7,
    verse_key: '1:7',
    chapter_id: 1,
    text_uthmani: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    text_imlaei: 'صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين',
    juz_number: 1,
    hizb_number: 1,
    rub_number: 1,
    page_number: 1,
    words: [
      { id: 21, position: 1, text: 'صِرَٰطَ', translation: 'The path' },
      { id: 22, position: 2, text: 'ٱلَّذِينَ', translation: 'of those' },
      { id: 23, position: 3, text: 'أَنْعَمْتَ', translation: 'You have blessed' },
      { id: 24, position: 4, text: 'عَلَيْهِمْ', translation: 'upon them' },
      { id: 25, position: 5, text: 'غَيْرِ', translation: 'not' },
      { id: 26, position: 6, text: 'ٱلْمَغْضُوبِ', translation: 'of those who earned wrath' },
      { id: 27, position: 7, text: 'عَلَيْهِمْ', translation: 'upon them' },
      { id: 28, position: 8, text: 'وَلَا', translation: 'and not' },
      { id: 29, position: 9, text: 'ٱلضَّآلِّينَ', translation: 'of those who are astray' }
    ]
  }
]

// Audio fixtures
export const audioFixtures: AudioFixture[] = [
  {
    id: 1,
    chapter_id: 1,
    reciter_id: 7,
    file_size: 1024000,
    format: 'mp3',
    audio_url: 'https://verses.quran.com/Alafasy/mp3/001001.mp3',
    duration: 45
  },
  {
    id: 2,
    chapter_id: 2,
    reciter_id: 7,
    file_size: 2048000,
    format: 'mp3',
    audio_url: 'https://verses.quran.com/Alafasy/mp3/002001.mp3',
    duration: 60
  }
]

// Complete fixtures export
export const quranFixtures = {
  chapters: chapterFixtures,
  verses: ayahFixtures,
  audio: audioFixtures
}

// Helper functions for test data generation
export const generateMockVerse = (chapterId: number, verseNumber: number): AyahFixture => ({
  id: chapterId * 1000 + verseNumber,
  verse_number: verseNumber,
  verse_key: `${chapterId}:${verseNumber}`,
  chapter_id: chapterId,
  text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  text_imlaei: 'بسم الله الرحمن الرحيم',
  juz_number: 1,
  hizb_number: 1,
  rub_number: 1,
  page_number: 1,
  words: [
    { id: 1, position: 1, text: 'بِسْمِ', translation: 'In the name' },
    { id: 2, position: 2, text: 'ٱللَّهِ', translation: 'of Allah' }
  ]
})

export const generateMockChapter = (id: number): ChapterFixture => ({
  id,
  revelation_place: id <= 86 ? 'makkah' : 'madinah',
  revelation_order: id,
  bismillah_pre: id !== 1,
  name_simple: `Chapter ${id}`,
  name_complex: `Chapter ${id}`,
  name_arabic: `سورة ${id}`,
  verses_count: 10,
  pages: [id, id + 1],
  translated_name: {
    language_name: 'english',
    name: `Test Chapter ${id}`
  }
})
