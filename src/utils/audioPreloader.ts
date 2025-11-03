/**
 * Audio Preloader Service
 * Implements intelligent audio preloading to improve playback performance
 */

interface PreloadedAudio {
  url: string
  audio: HTMLAudioElement
  timestamp: number
  isLoaded: boolean
}

class AudioPreloader {
  private cache: Map<string, PreloadedAudio> = new Map()
  private maxCacheSize: number = 5
  private preloadEnabled: boolean = true

  /**
   * Preload audio for next ayah
   */
  async preloadNext(surahNumber: number, ayahNumber: number, reciterId: string): Promise<void> {
    if (!this.preloadEnabled) return

    const nextAyahNumber = ayahNumber + 1
    const cacheKey = this.getCacheKey(surahNumber, nextAyahNumber, reciterId)

    // Check if already cached
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (cached.isLoaded) {
        return // Already preloaded
      }
    }

    try {
      const audioUrl = this.constructAudioUrl(surahNumber, nextAyahNumber, reciterId)
      const audio = new Audio()
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous'

      // Store in cache before loading
      this.cache.set(cacheKey, {
        url: audioUrl,
        audio,
        timestamp: Date.now(),
        isLoaded: false
      })

      // Start preloading
      audio.src = audioUrl

      // Wait for enough data to be loaded
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          audio.removeEventListener('canplaythrough', onLoad)
          audio.removeEventListener('error', onError)
          resolve() // Timeout is not an error, just stop trying
        }, 10000) // 10 second timeout

        const onLoad = () => {
          clearTimeout(timeoutId)
          audio.removeEventListener('error', onError)

          // Update cache to mark as loaded
          const cached = this.cache.get(cacheKey)
          if (cached) {
            cached.isLoaded = true
          }

          resolve()
        }

        const onError = (error: Event) => {
          clearTimeout(timeoutId)
          audio.removeEventListener('canplaythrough', onLoad)

          // Remove from cache on error
          this.cache.delete(cacheKey)
          console.warn('Preload failed for:', cacheKey, error)
          resolve() // Don't reject, just stop trying
        }

        audio.addEventListener('canplaythrough', onLoad, { once: true })
        audio.addEventListener('error', onError, { once: true })
      })

      // Clean up old entries if cache is too large
      this.cleanupCache()

    } catch (error) {
      console.warn('Audio preload error:', error)
      this.cache.delete(cacheKey)
    }
  }

  /**
   * Preload audio for previous ayah
   */
  async preloadPrevious(surahNumber: number, ayahNumber: number, reciterId: string): Promise<void> {
    if (!this.preloadEnabled || ayahNumber <= 1) return

    const prevAyahNumber = ayahNumber - 1
    const cacheKey = this.getCacheKey(surahNumber, prevAyahNumber, reciterId)

    if (this.cache.has(cacheKey)) {
      return // Already cached
    }

    try {
      const audioUrl = this.constructAudioUrl(surahNumber, prevAyahNumber, reciterId)
      const audio = new Audio()
      audio.preload = 'metadata' // Less aggressive for previous
      audio.crossOrigin = 'anonymous'
      audio.src = audioUrl

      this.cache.set(cacheKey, {
        url: audioUrl,
        audio,
        timestamp: Date.now(),
        isLoaded: false
      })

      this.cleanupCache()
    } catch (error) {
      console.warn('Audio preload error:', error)
    }
  }

  /**
   * Get preloaded audio if available
   */
  getPreloaded(surahNumber: number, ayahNumber: number, reciterId: string): HTMLAudioElement | null {
    const cacheKey = this.getCacheKey(surahNumber, ayahNumber, reciterId)
    const cached = this.cache.get(cacheKey)

    if (cached && cached.isLoaded) {
      // Remove from cache (it will be used now)
      this.cache.delete(cacheKey)
      return cached.audio
    }

    return null
  }

  /**
   * Cancel all pending preloads
   */
  cancelPreloads(): void {
    this.cache.forEach((cached) => {
      if (cached.audio) {
        cached.audio.pause()
        cached.audio.src = ''
      }
    })
    this.cache.clear()
  }

  /**
   * Enable/disable preloading (useful for low bandwidth)
   */
  setPreloadEnabled(enabled: boolean): void {
    this.preloadEnabled = enabled
    if (!enabled) {
      this.cancelPreloads()
    }
  }

  /**
   * Check if preloading is enabled
   */
  isPreloadEnabled(): boolean {
    return this.preloadEnabled
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        url: value.url,
        isLoaded: value.isLoaded,
        age: Date.now() - value.timestamp
      }))
    }
  }

  /**
   * Construct audio URL
   */
  private constructAudioUrl(surahNumber: number, ayahNumber: number, reciterId: string): string {
    // Using everyayah.com API
    const reciterMap: Record<string, string> = {
      '1': 'Alafasy_128kbps',
      '2': 'Abdurrahmaan_As-Sudais_192kbps',
      '3': 'Maher_AlMuaiqly_128kbps',
      '4': 'Ghamadi_40kbps',
      '5': 'Ahmed_ibn_Ali_al-Ajamy_128kbps',
      '6': 'Hani_Rifai_192kbps',
      '7': 'Abdul_Basit_Murattal_192kbps'
    }

    const reciterFolder = reciterMap[reciterId] || reciterMap['1']
    const paddedSurah = String(surahNumber).padStart(3, '0')
    const paddedAyah = String(ayahNumber).padStart(3, '0')

    return `https://everyayah.com/data/${reciterFolder}/${paddedSurah}${paddedAyah}.mp3`
  }

  /**
   * Generate cache key
   */
  private getCacheKey(surahNumber: number, ayahNumber: number, reciterId: string): string {
    return `${reciterId}_${surahNumber}_${ayahNumber}`
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    if (this.cache.size <= this.maxCacheSize) return

    // Sort by timestamp and remove oldest
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)

    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize)
    toRemove.forEach(([key, cached]) => {
      if (cached.audio) {
        cached.audio.pause()
        cached.audio.src = ''
      }
      this.cache.delete(key)
    })
  }
}

// Export singleton instance
export const audioPreloader = new AudioPreloader()
