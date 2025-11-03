import { useEffect, useCallback } from 'react'
import { useAudioStore, PlaybackSpeed } from '../stores/audioStore'

interface UseAudioControlsOptions {
  enableGlobalShortcuts?: boolean
  enableMediaKeys?: boolean
  enableNotifications?: boolean
}

export const useAudioControls = (options: UseAudioControlsOptions = {}) => {
  const {
    enableGlobalShortcuts = true,
    enableMediaKeys = true,
    enableNotifications = false
  } = options

  const {
    isPlaying,
    currentAyahNumber,
    currentSurahNumber,
    currentReciter,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    volume,
    seek,
    currentTime,
    duration,
    setPlaybackSpeed,
    playbackSpeed,
    setRepeatMode,
    repeatMode
  } = useAudioStore()

  // Media Session API integration
  const updateMediaSession = useCallback(() => {
    if ('mediaSession' in navigator && currentSurahNumber && currentReciter) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentAyahNumber 
          ? `Surah ${currentSurahNumber}, Ayah ${currentAyahNumber}`
          : `Surah ${currentSurahNumber}`,
        artist: currentReciter.name,
        album: 'Holy Quran',
        artwork: [
          {
            src: '/icons/quran-icon-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/quran-icon-256.png',
            sizes: '256x256',
            type: 'image/png'
          }
        ]
      })

      // Set playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

      // Set position state
      if (duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: playbackSpeed,
          position: currentTime
        })
      }
    }
  }, [currentSurahNumber, currentAyahNumber, currentReciter, isPlaying, duration, currentTime, playbackSpeed])

  // Media keys handler
  const setupMediaKeys = useCallback(() => {
    if (!enableMediaKeys || !('mediaSession' in navigator)) return

    navigator.mediaSession.setActionHandler('play', async () => {
      await togglePlayPause()
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      togglePlayPause()
    })

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrevious()
    })

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext()
    })

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const seekOffset = details.seekOffset || 10
      seek(Math.max(0, currentTime - seekOffset))
    })

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const seekOffset = details.seekOffset || 10
      seek(Math.min(duration, currentTime + seekOffset))
    })

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seek(details.seekTime)
      }
    })

    // Cleanup function
    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('seekbackward', null)
      navigator.mediaSession.setActionHandler('seekforward', null)
      navigator.mediaSession.setActionHandler('seekto', null)
    }
  }, [enableMediaKeys, togglePlayPause, playNext, playPrevious, seek, currentTime, duration])

  // Global keyboard shortcuts
  const handleGlobalKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enableGlobalShortcuts) return

    // Skip if user is typing in an input
    const target = event.target as Element
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable) {
      return
    }

    // Handle different key combinations
    const { key, shiftKey } = event

    // Basic media controls
    switch (key.toLowerCase()) {
      case ' ':
      case 'k':
        event.preventDefault()
        togglePlayPause()
        break

      case 'arrowleft':
      case 'j':
        event.preventDefault()
        if (shiftKey) {
          // Shift + arrow = larger seek
          seek(Math.max(0, currentTime - 30))
        } else {
          seek(Math.max(0, currentTime - 10))
        }
        break

      case 'arrowright':
      case 'l':
        event.preventDefault()
        if (shiftKey) {
          seek(Math.min(duration, currentTime + 30))
        } else {
          seek(Math.min(duration, currentTime + 10))
        }
        break

      case 'arrowup':
        event.preventDefault()
        setVolume(Math.min(1, volume + 0.1))
        break

      case 'arrowdown':
        event.preventDefault()
        setVolume(Math.max(0, volume - 0.1))
        break

      case 'm':
        event.preventDefault()
        setVolume(volume > 0 ? 0 : 0.8)
        break

      case 'r':
        event.preventDefault()
        const repeatModes = ['none', 'one', 'three', 'five', 'infinite'] as const
        const currentIndex = repeatModes.indexOf(repeatMode)
        const nextIndex = (currentIndex + 1) % repeatModes.length
        setRepeatMode(repeatModes[nextIndex])
        break

      case 'n':
        event.preventDefault()
        playNext()
        break

      case 'p':
        event.preventDefault()
        playPrevious()
        break

      case ',':
        event.preventDefault()
        // Decrease speed
        const speedsDown = [0.5, 0.75, 1, 1.25, 1.5, 2]
        const currentSpeedIndex = speedsDown.indexOf(playbackSpeed)
        if (currentSpeedIndex > 0) {
          setPlaybackSpeed(speedsDown[currentSpeedIndex - 1] as PlaybackSpeed)
        }
        break

      case '.':
        event.preventDefault()
        // Increase speed
        const speedsUp = [0.5, 0.75, 1, 1.25, 1.5, 2]
        const currentSpeedIndexUp = speedsUp.indexOf(playbackSpeed)
        if (currentSpeedIndexUp < speedsUp.length - 1) {
          setPlaybackSpeed(speedsUp[currentSpeedIndexUp + 1] as PlaybackSpeed)
        }
        break

      case 'home':
        event.preventDefault()
        seek(0)
        break

      case 'end':
        event.preventDefault()
        seek(duration)
        break
    }

    // Number keys for seeking to percentage
    if (key >= '0' && key <= '9') {
      event.preventDefault()
      const percentage = parseInt(key) * 10
      const seekTime = (percentage / 100) * duration
      seek(seekTime)
    }
  }, [
    enableGlobalShortcuts,
    togglePlayPause,
    seek,
    currentTime,
    duration,
    setVolume,
    volume,
    setRepeatMode,
    repeatMode,
    playNext,
    playPrevious,
    setPlaybackSpeed,
    playbackSpeed
  ])

  // Show notification when track changes
  const showNotification = useCallback(() => {
    if (!enableNotifications || !('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    if (currentSurahNumber && currentReciter) {
      const title = currentAyahNumber 
        ? `Surah ${currentSurahNumber}, Ayah ${currentAyahNumber}`
        : `Surah ${currentSurahNumber}`

      new Notification('Now Playing', {
        body: `${title}\nReciter: ${currentReciter.name}`,
        icon: '/icons/quran-icon-96.png',
        tag: 'quran-audio',
        silent: true
      })
    }
  }, [enableNotifications, currentSurahNumber, currentAyahNumber, currentReciter])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  // Setup effects
  useEffect(() => {
    updateMediaSession()
  }, [updateMediaSession])

  useEffect(() => {
    const cleanup = setupMediaKeys()
    return cleanup
  }, [setupMediaKeys])

  useEffect(() => {
    if (enableGlobalShortcuts) {
      document.addEventListener('keydown', handleGlobalKeyPress)
      return () => document.removeEventListener('keydown', handleGlobalKeyPress)
    }
  }, [enableGlobalShortcuts, handleGlobalKeyPress])

  useEffect(() => {
    if (isPlaying) {
      showNotification()
    }
  }, [currentSurahNumber, currentAyahNumber, currentReciter, showNotification])

  // Auto-request notification permission on first use
  useEffect(() => {
    if (enableNotifications) {
      requestNotificationPermission()
    }
  }, [enableNotifications, requestNotificationPermission])

  return {
    // State
    isPlaying,
    currentAyahNumber,
    currentSurahNumber,
    currentReciter,
    volume,
    playbackSpeed,
    repeatMode,
    currentTime,
    duration,
    
    // Actions
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    setPlaybackSpeed,
    setRepeatMode,
    
    // Utilities
    requestNotificationPermission,
    updateMediaSession
  }
}

export default useAudioControls