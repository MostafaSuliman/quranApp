/**
 * Audio Store
 * Manages audio playback state
 */

import { create } from 'zustand';
import type { PlaybackState, Reciter, RepeatMode } from '../types/audio';
import { audioService, type PlaybackEvent } from '../services/audio';
import { alQuranCloudService } from '../services/api/alquranCloud';
import { storageService } from '../services/storage';
import { CACHE_KEYS, CACHE_DURATIONS } from '../constants/api';

interface AudioState extends PlaybackState {
  // Reciters list (from API)
  reciters: Reciter[];
  recitersLoading: boolean;
  recitersError: string | null;

  // Selected reciter
  selectedReciter: Reciter | null;
}

interface AudioStore extends AudioState {
  // Actions
  initialize: () => Promise<void>;
  loadReciters: () => Promise<void>;
  selectReciter: (reciter: Reciter) => Promise<void>;
  playSurah: (surahNumber: number) => Promise<void>;
  playAyah: (surahNumber: number, ayahNumber: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setRepeatMode: (mode: RepeatMode) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial playback state
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentReciterId: null,
  currentSurah: null,
  currentAyah: null,
  duration: 0,
  position: 0,
  playbackSpeed: 1.0,
  repeatMode: 'none',
  volume: 1.0,

  // Reciters state
  reciters: [],
  recitersLoading: false,
  recitersError: null,
  selectedReciter: null,

  // Initialize
  initialize: async () => {
    // Load reciters
    await get().loadReciters();

    // Load preferences
    const preferences = await storageService.loadPreferences();
    if (preferences.defaultReciterId) {
      const reciter = get().reciters.find((r) => r.id === preferences.defaultReciterId);
      if (reciter) {
        set({ selectedReciter: reciter, currentReciterId: reciter.id });
      }
    }

    // Set up playback event listener
    audioService.addListener((event, status) => {
      switch (event) {
        case 'loading':
          set({ isLoading: true });
          break;
        case 'loaded':
          set({ isLoading: false });
          break;
        case 'play':
          set({ isPlaying: true, isPaused: false });
          break;
        case 'pause':
          set({ isPlaying: false, isPaused: true });
          break;
        case 'stop':
          set({ isPlaying: false, isPaused: false });
          break;
        case 'complete':
          set({ isPlaying: false, isPaused: false });
          // Handle repeat mode
          const { repeatMode, currentSurah } = get();
          if (repeatMode === 'surah' && currentSurah) {
            get().playSurah(currentSurah);
          }
          break;
        case 'error':
          set({ isLoading: false, isPlaying: false });
          break;
      }

      // Update position and duration from status
      if (status && 'isLoaded' in status && status.isLoaded) {
        set({
          position: status.positionMillis,
          duration: status.durationMillis || 0,
        });
      }
    });
  },

  // Load reciters from API
  loadReciters: async () => {
    set({ recitersLoading: true, recitersError: null });

    try {
      // Check cache first
      const cached = await storageService.getCachedData<Reciter[]>(CACHE_KEYS.RECITERS);
      if (cached && cached.length > 0) {
        set({ reciters: cached, recitersLoading: false });

        // Select first reciter if none selected
        if (!get().selectedReciter && cached.length > 0) {
          set({ selectedReciter: cached[0], currentReciterId: cached[0].id });
        }
        return;
      }

      // Fetch from API
      const reciters = await alQuranCloudService.getReciters();

      // Cache the result
      await storageService.cacheData(CACHE_KEYS.RECITERS, reciters, CACHE_DURATIONS.RECITERS);

      set({ reciters, recitersLoading: false });

      // Select first reciter if none selected
      if (!get().selectedReciter && reciters.length > 0) {
        set({ selectedReciter: reciters[0], currentReciterId: reciters[0].id });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load reciters';
      set({ recitersError: message, recitersLoading: false });
    }
  },

  // Select a reciter
  selectReciter: async (reciter: Reciter) => {
    set({ selectedReciter: reciter, currentReciterId: reciter.id });

    // Save to preferences
    const preferences = await storageService.loadPreferences();
    await storageService.savePreferences({
      ...preferences,
      defaultReciterId: reciter.id,
    });
  },

  // Play a Surah
  playSurah: async (surahNumber: number) => {
    const { selectedReciter } = get();
    if (!selectedReciter) {
      console.error('No reciter selected');
      return;
    }

    set({ currentSurah: surahNumber, currentAyah: null });

    try {
      await audioService.playSurah(surahNumber, selectedReciter.identifier);
    } catch (error) {
      console.error('Error playing surah:', error);
    }
  },

  // Play a specific Ayah
  playAyah: async (surahNumber: number, ayahNumber: number) => {
    const { selectedReciter } = get();
    if (!selectedReciter) {
      console.error('No reciter selected');
      return;
    }

    set({ currentSurah: surahNumber, currentAyah: ayahNumber });

    try {
      const audioUrl = await alQuranCloudService.getAyahAudio(
        surahNumber,
        ayahNumber,
        selectedReciter.identifier
      );
      await audioService.playUrl(audioUrl);
    } catch (error) {
      console.error('Error playing ayah:', error);
    }
  },

  // Play
  play: async () => {
    await audioService.play();
  },

  // Pause
  pause: async () => {
    await audioService.pause();
  },

  // Stop
  stop: async () => {
    await audioService.stop();
    set({ currentSurah: null, currentAyah: null });
  },

  // Seek to position
  seekTo: async (positionMillis: number) => {
    await audioService.seekTo(positionMillis);
  },

  // Set playback speed
  setPlaybackSpeed: async (speed: number) => {
    set({ playbackSpeed: speed });
    await audioService.setPlaybackRate(speed);

    // Save to preferences
    const preferences = await storageService.loadPreferences();
    await storageService.savePreferences({
      ...preferences,
      playbackSpeed: speed,
    });
  },

  // Set volume
  setVolume: async (volume: number) => {
    set({ volume });
    await audioService.setVolume(volume);
  },

  // Set repeat mode
  setRepeatMode: (mode: RepeatMode) => {
    set({ repeatMode: mode });
  },
}));
