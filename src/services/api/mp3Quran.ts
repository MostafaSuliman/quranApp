/**
 * MP3Quran API Service
 * Additional reciters and audio files
 *
 * API Documentation: https://mp3quran.net/api
 *
 * CRITICAL: Reciter information MUST come from the API.
 * NEVER hardcode reciter names or audio URLs.
 */

import { MP3QURAN_BASE_URL, API_TIMEOUT } from '../../constants/api';
import type { MP3QuranApi } from '../../types/api';
import type { Reciter } from '../../types/audio';

class MP3QuranService {
  private baseUrl = MP3QURAN_BASE_URL;

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
   * Get list of reciters
   * @param language - Language code (ar, en, etc.)
   */
  async getReciters(language: string = 'ar'): Promise<Reciter[]> {
    try {
      const response = await this.request<MP3QuranApi.RecitersResponse>(
        `/reciters?language=${language}`
      );

      return response.reciters.map((reciter) => ({
        id: reciter.id.toString(),
        name: reciter.name,
        arabicName: reciter.name, // Same for Arabic API
        identifier: reciter.id.toString(),
        style: reciter.rewpiaa || undefined,
      }));
    } catch (error) {
      console.warn('MP3Quran API error:', error);
      return [];
    }
  }

  /**
   * Get audio URL for a Surah from a specific reciter
   */
  getAudioUrl(reciterServer: string, surahNumber: number): string {
    // Pad surah number to 3 digits
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    return `${reciterServer}${paddedSurah}.mp3`;
  }

  /**
   * Get all Surahs info
   */
  async getSurahList(language: string = 'ar'): Promise<{ id: number; name: string }[]> {
    try {
      const response = await this.request<MP3QuranApi.SurahListResponse>(
        `/supiass?language=${language}`
      );

      return response.supiass.map((surah) => ({
        id: surah.id,
        name: surah.name,
      }));
    } catch (error) {
      console.warn('MP3Quran API error:', error);
      return [];
    }
  }
}

export const mp3QuranService = new MP3QuranService();
