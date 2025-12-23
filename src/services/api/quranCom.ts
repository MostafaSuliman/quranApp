/**
 * Quran.com API v4 Service
 * For Mushaf images and additional reciter data
 *
 * API Documentation: https://api-docs.quran.com/
 *
 * CRITICAL: All Quranic text MUST come from the API.
 * NEVER hardcode or generate Quranic Arabic text.
 */

import { QURAN_COM_BASE_URL, API_TIMEOUT } from '../../constants/api';
import type { QuranComApi } from '../../types/api';
import type { Reciter } from '../../types/audio';

// Mushaf script types available
export type MushafScript =
  | 'uthmani'
  | 'uthmani_tajweed'
  | 'indopak'
  | 'imlaei'
  | 'imlaei_simple';

// Mushaf page image sizes
export type ImageSize = 'small' | 'medium' | 'large';

class QuranComService {
  private baseUrl = QURAN_COM_BASE_URL;

  /**
   * Make API request with timeout
   */
  private async request<T>(endpoint: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Get all chapters (Surahs)
   */
  async getChapters(language: string = 'en'): Promise<QuranComApi.ChapterData[]> {
    const response = await this.request<QuranComApi.ChaptersResponse>(
      `/chapters?language=${language}`
    );
    return response.chapters;
  }

  /**
   * Get available recitations (reciters)
   */
  async getRecitations(language: string = 'en'): Promise<Reciter[]> {
    const response = await this.request<QuranComApi.RecitationsResponse>(
      `/resources/recitations?language=${language}`
    );

    return response.recitations.map((recitation) => ({
      id: recitation.id.toString(),
      name: recitation.translated_name.name,
      arabicName: recitation.reciter_name,
      style: recitation.style || undefined,
      identifier: recitation.id.toString(),
    }));
  }

  /**
   * Get Mushaf page image URL
   *
   * Note: These are authentic Mushaf images from verified sources
   */
  getMushafPageImageUrl(
    pageNumber: number,
    script: MushafScript = 'uthmani',
    size: ImageSize = 'large'
  ): string {
    // Pad page number to 3 digits
    const paddedPage = pageNumber.toString().padStart(3, '0');

    // Different CDN paths based on script type
    const scriptPaths: Record<MushafScript, string> = {
      uthmani: 'images/w',
      uthmani_tajweed: 'images/tajweed',
      indopak: 'images/indopak',
      imlaei: 'images/imlaei',
      imlaei_simple: 'images/imlaei_simple',
    };

    const sizeSuffixes: Record<ImageSize, string> = {
      small: '_small',
      medium: '_medium',
      large: '',
    };

    const basePath = scriptPaths[script];
    const sizeSuffix = sizeSuffixes[size];

    return `https://static.quran.com/${basePath}${sizeSuffix}/p${paddedPage}.png`;
  }

  /**
   * Get audio file URL for a verse
   */
  async getVerseAudioUrl(
    recitationId: number,
    verseKey: string // Format: "surah:ayah" e.g., "1:1"
  ): Promise<string> {
    const response = await this.request<QuranComApi.AudioFileResponse>(
      `/recitations/${recitationId}/by_ayah/${verseKey}`
    );
    return response.audio_file.url;
  }

  /**
   * Get chapter (Surah) audio file URL
   */
  getChapterAudioUrl(recitationId: number, chapterNumber: number): string {
    return `https://download.quranicaudio.com/quran/${recitationId}/${chapterNumber
      .toString()
      .padStart(3, '0')}.mp3`;
  }
}

export const quranComService = new QuranComService();
