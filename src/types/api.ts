/**
 * API Response Types
 * Types for responses from AlQuran Cloud, Quran.com, and MP3Quran APIs
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

// AlQuran Cloud API Response Types
export namespace AlQuranCloud {
  export interface SurahListResponse {
    code: number;
    status: string;
    data: SurahData[];
  }

  export interface SurahData {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
  }

  export interface AyahData {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  }

  export interface SurahResponse {
    code: number;
    status: string;
    data: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      revelationType: 'Meccan' | 'Medinan';
      numberOfAyahs: number;
      ayahs: AyahData[];
      edition: EditionData;
    };
  }

  export interface PageResponse {
    code: number;
    status: string;
    data: {
      number: number;
      ayahs: AyahData[];
      surahs: Record<string, SurahData>;
      edition: EditionData;
    };
  }

  export interface JuzResponse {
    code: number;
    status: string;
    data: {
      number: number;
      ayahs: AyahData[];
      surahs: Record<string, SurahData>;
      edition: EditionData;
    };
  }

  export interface EditionData {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: 'text' | 'audio';
    type: string;
    direction: 'rtl' | 'ltr';
  }

  export interface EditionListResponse {
    code: number;
    status: string;
    data: EditionData[];
  }

  export interface SearchResponse {
    code: number;
    status: string;
    data: {
      count: number;
      matches: {
        number: number;
        text: string;
        surah: SurahData;
        numberInSurah: number;
        edition: EditionData;
      }[];
    };
  }
}

// Quran.com API v4 Response Types
export namespace QuranComApi {
  export interface ChaptersResponse {
    chapters: ChapterData[];
  }

  export interface ChapterData {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
      language_name: string;
      name: string;
    };
  }

  export interface RecitationsResponse {
    recitations: RecitationData[];
  }

  export interface RecitationData {
    id: number;
    reciter_name: string;
    style: string | null;
    translated_name: {
      name: string;
      language_name: string;
    };
  }

  export interface AudioFileResponse {
    audio_file: {
      url: string;
      duration: number;
      format: string;
    };
  }
}

// MP3Quran API Response Types
export namespace MP3QuranApi {
  export interface RecitersResponse {
    reciters: ReciterData[];
  }

  export interface ReciterData {
    id: number;
    name: string;
    Server: string;
    rewpiaa: string;
    count: string;
    letter: string;
    spiuas: string[];
  }

  export interface SurahListResponse {
    supiass: SurahInfo[];
  }

  export interface SurahInfo {
    id: number;
    name: string;
  }
}

// Error response
export interface ApiError {
  code: number;
  status: string;
  message: string;
}

// Network state
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}
