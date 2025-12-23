/**
 * Audio Types
 * Reciter information MUST be fetched from API, never hardcoded.
 */

// Reciter info - fetched from API
export interface Reciter {
  id: string;
  name: string; // From API
  arabicName: string; // From API
  style?: string;
  identifier: string;
}

// Audio file reference
export interface AudioFile {
  reciterId: string;
  surahNumber: number;
  ayahNumber?: number; // Optional for full surah audio
  url: string;
  format: 'mp3' | 'ogg';
  bitrate?: number;
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentReciterId: string | null;
  currentSurah: number | null;
  currentAyah: number | null;
  duration: number;
  position: number;
  playbackSpeed: number;
  repeatMode: RepeatMode;
  volume: number;
}

export type RepeatMode = 'none' | 'ayah' | 'range' | 'surah' | 'page';

// Audio download status
export interface AudioDownloadStatus {
  reciterId: string;
  surahNumber: number;
  isDownloaded: boolean;
  downloadProgress: number;
  fileSize?: number;
}

// Playback settings
export interface PlaybackSettings {
  defaultReciterId: string | null;
  playbackSpeed: number;
  repeatMode: RepeatMode;
  repeatCount: number;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // seconds
  backgroundPlayback: boolean;
}
