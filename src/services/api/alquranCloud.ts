/**
 * AlQuran Cloud API Service
 * Primary source for Quran text and audio
 *
 * API Documentation: https://alquran.cloud/api
 *
 * CRITICAL: All Quranic text MUST come from this API.
 * NEVER hardcode or generate Quranic Arabic text.
 */

import {
  ALQURAN_CLOUD_BASE_URL,
  DEFAULT_QURAN_EDITION,
  API_TIMEOUT,
} from '../../constants/api';
import type { AlQuranCloud } from '../../types/api';
import type { Surah, Ayah, PageData, Edition } from '../../types/quran';
import type { Reciter } from '../../types/audio';

class AlQuranCloudService {
  private baseUrl = ALQURAN_CLOUD_BASE_URL;

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
   * Get list of all Surahs
   */
  async getSurahList(): Promise<Surah[]> {
    const response = await this.request<AlQuranCloud.SurahListResponse>('/surah');

    if (response.code !== 200 || response.status !== 'OK') {
      throw new Error('Failed to fetch Surah list');
    }

    return response.data.map((surah) => ({
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: surah.numberOfAyahs,
      revelationType: surah.revelationType,
    }));
  }

  /**
   * Get a single Surah with all its Ayahs
   */
  async getSurah(
    surahNumber: number,
    edition: string = DEFAULT_QURAN_EDITION
  ): Promise<{ surah: Surah; ayahs: Ayah[] }> {
    const response = await this.request<AlQuranCloud.SurahResponse>(
      `/surah/${surahNumber}/${edition}`
    );

    if (response.code !== 200 || response.status !== 'OK') {
      throw new Error(`Failed to fetch Surah ${surahNumber}`);
    }

    const { data } = response;

    return {
      surah: {
        number: data.number,
        name: data.name,
        englishName: data.englishName,
        englishNameTranslation: data.englishNameTranslation,
        numberOfAyahs: data.numberOfAyahs,
        revelationType: data.revelationType,
      },
      ayahs: data.ayahs.map((ayah) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        surahNumber: data.number,
        text: ayah.text,
        page: ayah.page,
        juz: ayah.juz,
        hizbQuarter: ayah.hizbQuarter,
      })),
    };
  }

  /**
   * Get a specific page (1-604)
   */
  async getPage(
    pageNumber: number,
    edition: string = DEFAULT_QURAN_EDITION
  ): Promise<PageData> {
    if (pageNumber < 1 || pageNumber > 604) {
      throw new Error('Page number must be between 1 and 604');
    }

    const response = await this.request<AlQuranCloud.PageResponse>(
      `/page/${pageNumber}/${edition}`
    );

    if (response.code !== 200 || response.status !== 'OK') {
      throw new Error(`Failed to fetch page ${pageNumber}`);
    }

    return {
      pageNumber: response.data.number,
      ayahs: response.data.ayahs.map((ayah) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        surahNumber: Object.values(response.data.surahs).find(
          (s) => ayah.number >= s.number && ayah.number <= s.number + s.numberOfAyahs - 1
        )?.number || 1,
        text: ayah.text,
        page: ayah.page,
        juz: ayah.juz,
        hizbQuarter: ayah.hizbQuarter,
      })),
    };
  }

  /**
   * Get a Juz (1-30)
   */
  async getJuz(
    juzNumber: number,
    edition: string = DEFAULT_QURAN_EDITION
  ): Promise<{ juzNumber: number; ayahs: Ayah[] }> {
    if (juzNumber < 1 || juzNumber > 30) {
      throw new Error('Juz number must be between 1 and 30');
    }

    const response = await this.request<AlQuranCloud.JuzResponse>(
      `/juz/${juzNumber}/${edition}`
    );

    if (response.code !== 200 || response.status !== 'OK') {
      throw new Error(`Failed to fetch Juz ${juzNumber}`);
    }

    return {
      juzNumber: response.data.number,
      ayahs: response.data.ayahs.map((ayah) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        surahNumber: parseInt(
          Object.keys(response.data.surahs).find((key) => {
            const surah = response.data.surahs[key];
            return ayah.number >= surah.number;
          }) || '1'
        ),
        text: ayah.text,
        page: ayah.page,
        juz: ayah.juz,
        hizbQuarter: ayah.hizbQuarter,
      })),
    };
  }

  /**
   * Get available editions (text, translations, audio)
   */
  async getEditions(
    format?: 'text' | 'audio',
    type?: 'quran' | 'translation' | 'tafsir'
  ): Promise<Edition[]> {
    let endpoint = '/edition';
    const params: string[] = [];

    if (format) params.push(`format=${format}`);
    if (type) params.push(`type=${type}`);

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    const response = await this.request<AlQuranCloud.EditionListResponse>(endpoint);

    if (response.code !== 200 || response.status !== 'OK') {
      throw new Error('Failed to fetch editions');
    }

    return response.data.map((edition) => ({
      identifier: edition.identifier,
      language: edition.language,
      name: edition.name,
      englishName: edition.englishName,
      format: edition.format,
      type: edition.type as 'quran' | 'translation' | 'tafsir',
    }));
  }

  /**
   * Get available audio reciters
   */
  async getReciters(): Promise<Reciter[]> {
    const editions = await this.getEditions('audio', 'quran');

    return editions.map((edition) => ({
      id: edition.identifier,
      name: edition.englishName,
      arabicName: edition.name,
      identifier: edition.identifier,
    }));
  }

  /**
   * Get audio URL for a specific Ayah
   */
  async getAyahAudio(
    surahNumber: number,
    ayahNumber: number,
    reciterIdentifier: string
  ): Promise<string> {
    const response = await this.request<AlQuranCloud.SurahResponse>(
      `/ayah/${surahNumber}:${ayahNumber}/${reciterIdentifier}`
    );

    if (response.code !== 200 || response.status !== 'OK') {
      throw new Error(`Failed to fetch audio for ${surahNumber}:${ayahNumber}`);
    }

    // The audio URL is in the ayahs array
    const ayah = response.data.ayahs[0];
    if (!ayah || !ayah.text) {
      throw new Error('Audio URL not found');
    }

    return ayah.text; // For audio editions, 'text' contains the audio URL
  }

  /**
   * Get audio for entire Surah
   */
  getAudioUrl(reciterIdentifier: string, surahNumber: number): string {
    // Format: https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    return `https://cdn.islamic.network/quran/audio-surah/128/${reciterIdentifier}/${paddedSurah}.mp3`;
  }

  /**
   * Search the Quran
   */
  async search(
    query: string,
    edition: string = DEFAULT_QURAN_EDITION
  ): Promise<
    Array<{
      surahNumber: number;
      ayahNumber: number;
      text: string;
      surahName: string;
    }>
  > {
    const encodedQuery = encodeURIComponent(query);
    const response = await this.request<AlQuranCloud.SearchResponse>(
      `/search/${encodedQuery}/${edition}/all`
    );

    if (response.code !== 200 || response.status !== 'OK') {
      return [];
    }

    return response.data.matches.map((match) => ({
      surahNumber: match.surah.number,
      ayahNumber: match.numberInSurah,
      text: match.text,
      surahName: match.surah.name,
    }));
  }
}

export const alQuranCloudService = new AlQuranCloudService();
