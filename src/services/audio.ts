/**
 * Audio Service
 * Handles Quran audio playback using expo-av
 */

import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { alQuranCloudService } from './api/alquranCloud';

// Playback event types
export type PlaybackEvent = 'play' | 'pause' | 'stop' | 'complete' | 'error' | 'loading' | 'loaded';

// Playback event listener
export type PlaybackEventListener = (event: PlaybackEvent, status?: AVPlaybackStatus) => void;

class AudioService {
  private sound: Audio.Sound | null = null;
  private isAudioModeSet: boolean = false;
  private listeners: Set<PlaybackEventListener> = new Set();
  private currentUrl: string | null = null;

  /**
   * Initialize audio mode for background playback
   */
  private async setAudioMode(): Promise<void> {
    if (this.isAudioModeSet) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
      this.isAudioModeSet = true;
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
  }

  /**
   * Add playback event listener
   */
  addListener(listener: PlaybackEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: PlaybackEvent, status?: AVPlaybackStatus): void {
    this.listeners.forEach((listener) => listener(event, status));
  }

  /**
   * Handle playback status update
   */
  private onPlaybackStatusUpdate = (status: AVPlaybackStatus): void => {
    if (!status.isLoaded) {
      if ('error' in status && status.error) {
        console.error('Playback error:', status.error);
        this.notifyListeners('error', status);
      }
      return;
    }

    if (status.didJustFinish) {
      this.notifyListeners('complete', status);
    }
  };

  /**
   * Load and play audio from URL
   */
  async loadAndPlay(url: string): Promise<void> {
    await this.setAudioMode();

    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      this.notifyListeners('loading');
      this.currentUrl = url;

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.notifyListeners('loaded');
      this.notifyListeners('play');
    } catch (error) {
      console.error('Error loading audio:', error);
      this.notifyListeners('error');
      throw new Error('Failed to load audio');
    }
  }

  /**
   * Play Surah audio
   */
  async playSurah(surahNumber: number, reciterIdentifier: string): Promise<void> {
    const url = alQuranCloudService.getAudioUrl(reciterIdentifier, surahNumber);
    await this.loadAndPlay(url);
  }

  /**
   * Play audio from direct URL
   */
  async playUrl(url: string): Promise<void> {
    await this.loadAndPlay(url);
  }

  /**
   * Play
   */
  async play(): Promise<void> {
    if (!this.sound) return;

    try {
      await this.sound.playAsync();
      this.notifyListeners('play');
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  /**
   * Pause
   */
  async pause(): Promise<void> {
    if (!this.sound) return;

    try {
      await this.sound.pauseAsync();
      this.notifyListeners('pause');
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  /**
   * Stop
   */
  async stop(): Promise<void> {
    if (!this.sound) return;

    try {
      await this.sound.stopAsync();
      this.notifyListeners('stop');
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  /**
   * Seek to position (milliseconds)
   */
  async seekTo(positionMillis: number): Promise<void> {
    if (!this.sound) return;

    try {
      await this.sound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }

  /**
   * Set playback rate
   */
  async setPlaybackRate(rate: number): Promise<void> {
    if (!this.sound) return;

    try {
      await this.sound.setRateAsync(rate, true);
    } catch (error) {
      console.error('Error setting playback rate:', error);
    }
  }

  /**
   * Set volume (0-1)
   */
  async setVolume(volume: number): Promise<void> {
    if (!this.sound) return;

    try {
      await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  /**
   * Get current playback status
   */
  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (!this.sound) return null;

    try {
      return await this.sound.getStatusAsync();
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  /**
   * Check if audio is loaded
   */
  isLoaded(): boolean {
    return this.sound !== null;
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string | null {
    return this.currentUrl;
  }

  /**
   * Unload and clean up
   */
  async unload(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading audio:', error);
      }
      this.sound = null;
      this.currentUrl = null;
    }
  }
}

export const audioService = new AudioService();
