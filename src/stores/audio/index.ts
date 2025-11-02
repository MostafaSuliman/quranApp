/**
 * Audio Stores - Barrel Export
 *
 * Provides a clean interface for importing audio-related stores and types.
 *
 * Architecture:
 * - audioSettingsStore: Shared settings (reciter, speed, volume)
 * - audioPlayerStore: Playback controls (play, pause, seek)
 * - audioQueueStore: Queue management (next, previous, repeat)
 */

// Core stores
export { useAudioSettingsStore, getReciterById, DEFAULT_RECITERS } from '../audioSettingsStore'
export { useAudioPlayerStore } from '../audioPlayerStore'
export { useAudioQueueStore } from '../audioQueueStore'
export { useAudioDownloadStore } from '../audioDownloadStore'

// Types
export type { PlaybackSpeed } from '../audioSettingsStore'
export type { RepeatMode } from '../audioQueueStore'
