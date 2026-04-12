import { apiGet } from './client';

export interface QuranWord {
  id: number;
  position: number;
  text_uthmani: string;
  char_type_name: string;
}

export interface QuranVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  chapter_id: number;
  juz_number: number;
  page_number: number;
  text_uthmani: string;
  words?: QuranWord[];
}

export interface QuranChapter {
  id: number;
  revelation_place: 'makkah' | 'madinah';
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: { name: string; language_name: string };
}

export interface QuranJuz {
  id: number;
  juz_number: number;
  verse_mapping: Record<string, string>;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface QuranRecitation {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: { name: string; language_name: string };
}

export interface QuranAudioFile {
  verse_key: string;
  url: string;
}

/**
 * Fetch every verse that belongs to a given Madani Mushaf page (1-604).
 * This is the sole source of Arabic verse text in the app — no hardcoding.
 */
export async function getVersesByPage(pageNumber: number): Promise<QuranVerse[]> {
  const data = await apiGet<{ verses: QuranVerse[] }>(`/verses/by_page/${pageNumber}`, {
    words: true,
    fields: 'text_uthmani,chapter_id,verse_number,verse_key,juz_number,page_number',
    per_page: 50,
  });
  return data.verses;
}

export async function getVerseByKey(verseKey: string): Promise<QuranVerse> {
  const data = await apiGet<{ verse: QuranVerse }>(`/verses/by_key/${verseKey}`, {
    words: true,
    fields: 'text_uthmani,chapter_id,verse_number,verse_key,juz_number,page_number',
  });
  return data.verse;
}

export async function getChapters(): Promise<QuranChapter[]> {
  const data = await apiGet<{ chapters: QuranChapter[] }>(`/chapters`, { language: 'en' });
  return data.chapters;
}

export async function getJuzs(): Promise<QuranJuz[]> {
  const data = await apiGet<{ juzs: QuranJuz[] }>(`/juzs`);
  return data.juzs;
}

export async function getRecitations(): Promise<QuranRecitation[]> {
  const data = await apiGet<{ recitations: QuranRecitation[] }>(`/resources/recitations`, {
    language: 'en',
  });
  return data.recitations;
}

export async function getPageAudio(recitationId: number, pageNumber: number): Promise<QuranAudioFile[]> {
  const data = await apiGet<{ audio_files: QuranAudioFile[] }>(
    `/recitations/${recitationId}/by_page/${pageNumber}`
  );
  return data.audio_files;
}
