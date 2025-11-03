/**
 * Audio Settings Store Initialization
 * Sets up event bus listeners to break circular dependencies
 */

import { useAudioSettingsStore, getReciterById } from './audioSettingsStore'
import { audioEventBus } from './audio/audioEventBus'
import { storeLogger as logger } from '../services/logger'

/**
 * Initialize event listeners for audioSettingsStore
 * This must be called during app initialization
 */
export function initializeAudioSettingsStore(): void {
  logger.info('Initializing audio settings store event listeners')

  // Listen for reciter updates from preferences store
  audioEventBus.on('reciter:updated', ({ reciterId, reciter }) => {
    logger.debug('Received reciter update event', { reciterId })

    if (reciter) {
      useAudioSettingsStore.getState().setReciter(reciter)
    } else {
      // Resolve reciter from ID
      const resolvedReciter = getReciterById(reciterId)
      if (resolvedReciter) {
        useAudioSettingsStore.getState().setReciter(resolvedReciter)
        logger.info('Successfully synced reciter with audio settings', { reciterId })
      } else {
        logger.warn('Unknown reciter ID received', { reciterId })
      }
    }
  })

  // Listen for playback speed updates from preferences store
  audioEventBus.on('playback-speed:updated', ({ speed }) => {
    logger.debug('Received playback speed update event', { speed })
    useAudioSettingsStore.getState().setPlaybackSpeed(speed as any)
    logger.info('Successfully synced playback speed with audio settings', { speed })
  })

  logger.info('Audio settings store event listeners initialized')
}
