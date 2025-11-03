/**
 * Audio Event Bus - Dependency Injection Pattern
 * Breaks circular dependencies between stores using event-driven architecture
 */

type AudioEventCallback = (data: any) => void

interface AudioEvents {
  'settings:changed': { volume?: number; playbackSpeed?: number; reciter?: any }
  'preferences:sync': { preferredReciter?: string; playbackSpeed?: number }
  'reciter:updated': { reciterId: string; reciter: any }
  'playback-speed:updated': { speed: number }
}

class AudioEventBus {
  private listeners: Map<string, Set<AudioEventCallback>> = new Map()

  /**
   * Subscribe to an event
   */
  on<K extends keyof AudioEvents>(event: K, callback: (data: AudioEvents[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(callback as AudioEventCallback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as AudioEventCallback)
    }
  }

  /**
   * Emit an event
   */
  emit<K extends keyof AudioEvents>(event: K, data: AudioEvents[K]): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Remove all listeners for an event
   */
  off(event: keyof AudioEvents): void {
    this.listeners.delete(event)
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear()
  }
}

// Global event bus instance
export const audioEventBus = new AudioEventBus()
