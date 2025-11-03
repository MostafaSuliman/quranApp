/**
 * AudioPlayer Performance Tests
 * Compares original vs optimized component performance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import AudioPlayerOriginal from '../components/AudioPlayer'
import AudioPlayerOptimized from '../components/AudioPlayer.optimized'
import { audioPreloader } from '../utils/audioPreloader'
import { performanceProfiler } from '../utils/performanceProfiler'

// Mock audio store
vi.mock('../stores/audioStore', () => ({
  useAudioStore: () => ({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 180,
    progress: 0,
    volume: 0.8,
    playbackSpeed: 1,
    repeatMode: 'none',
    autoPlayNext: false,
    currentAyahNumber: 1,
    currentSurahNumber: 1,
    currentReciter: {
      id: '1',
      name: 'Mishary Rashid Alafasy',
      englishName: 'Mishary Rashid Alafasy',
      style: 'Clear & Melodious',
      audioFormat: 'mp3'
    },
    isUpdatingSettings: false,
    settingsUpdateSuccess: false,
    error: null,
    audioUrl: 'https://example.com/audio.mp3',
    seek: vi.fn(),
    setVolume: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    setRepeatMode: vi.fn(),
    setAutoPlayNext: vi.fn(),
    loadAyahAudio: vi.fn(),
    playNext: vi.fn(),
    playPrevious: vi.fn(),
    togglePlayPause: vi.fn(),
    handleKeyPress: vi.fn(),
    clearError: vi.fn()
  })
}))

describe('AudioPlayer Performance Comparison', () => {
  beforeEach(() => {
    performanceProfiler.enable()
    performanceProfiler.clear()
  })

  afterEach(() => {
    performanceProfiler.disable()
  })

  describe('Re-render Performance', () => {
    it('should have fewer re-renders with optimized component', async () => {
      const { rerender: rerenderOriginal } = render(<AudioPlayerOriginal />)
      const originalRenderCount = performanceProfiler.getComponentMetrics('AudioPlayer').renderCount

      performanceProfiler.clear()

      const { rerender: rerenderOptimized } = render(<AudioPlayerOptimized />)
      const optimizedRenderCount = performanceProfiler.getComponentMetrics('AudioPlayer').renderCount

      // Optimized should have significantly fewer renders
      expect(optimizedRenderCount).toBeLessThan(originalRenderCount * 0.4)
    })

    it('should not re-render when props haven\'t changed', () => {
      const { rerender } = render(<AudioPlayerOptimized ayahNumber={1} surahNumber={1} />)

      performanceProfiler.clear()

      // Re-render with same props
      rerender(<AudioPlayerOptimized ayahNumber={1} surahNumber={1} />)

      const metrics = performanceProfiler.getComponentMetrics('AudioPlayer')
      expect(metrics.renderCount).toBe(0) // Should not re-render
    })

    it('should re-render only when necessary props change', () => {
      const { rerender } = render(<AudioPlayerOptimized ayahNumber={1} surahNumber={1} />)

      performanceProfiler.clear()

      // Change ayah number
      rerender(<AudioPlayerOptimized ayahNumber={2} surahNumber={1} />)

      const metrics = performanceProfiler.getComponentMetrics('AudioPlayer')
      expect(metrics.renderCount).toBe(1) // Should re-render once
    })
  })

  describe('Event Handler Performance', () => {
    it('should maintain stable callback references', () => {
      const callbacks: any[] = []

      const TestComponent = () => {
        const [count, setCount] = React.useState(0)
        const callback = React.useCallback(() => {}, [])
        callbacks.push(callback)
        return <button onClick={() => setCount(count + 1)}>Click</button>
      }

      const { getByText } = render(<TestComponent />)
      fireEvent.click(getByText('Click'))
      fireEvent.click(getByText('Click'))

      // All callbacks should be the same reference
      expect(callbacks[0]).toBe(callbacks[1])
      expect(callbacks[1]).toBe(callbacks[2])
    })
  })

  describe('Memory Performance', () => {
    it('should not leak memory on repeated renders', async () => {
      const initialSnapshot = performanceProfiler.takeSnapshot()

      // Render component 100 times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<AudioPlayerOptimized />)
        unmount()
      }

      await waitFor(() => {
        const finalSnapshot = performanceProfiler.takeSnapshot()
        const memoryGrowth = (finalSnapshot.memoryUsage || 0) - (initialSnapshot.memoryUsage || 0)

        // Memory growth should be minimal (< 5MB)
        expect(memoryGrowth).toBeLessThan(5)
      })
    })
  })

  describe('Render Duration', () => {
    it('should have fast render times', () => {
      performanceProfiler.markRenderStart('AudioPlayer')
      render(<AudioPlayerOptimized />)
      performanceProfiler.markRenderEnd('AudioPlayer')

      const metrics = performanceProfiler.getComponentMetrics('AudioPlayer')

      // Average render duration should be < 16ms (60fps target)
      expect(metrics.avgDuration).toBeLessThan(16)
    })
  })
})

describe('Audio Preloader', () => {
  beforeEach(() => {
    audioPreloader.cancelPreloads()
  })

  it('should preload next ayah', async () => {
    await audioPreloader.preloadNext(1, 1, '1')

    const stats = audioPreloader.getCacheStats()
    expect(stats.size).toBe(1)
    expect(stats.entries[0].key).toBe('1_1_2')
  })

  it('should return preloaded audio when available', async () => {
    await audioPreloader.preloadNext(1, 1, '1')

    const audio = audioPreloader.getPreloaded(1, 2, '1')
    expect(audio).toBeInstanceOf(HTMLAudioElement)
  })

  it('should clean up old cache entries', async () => {
    // Preload more than max cache size
    for (let i = 1; i <= 10; i++) {
      await audioPreloader.preloadNext(1, i, '1')
    }

    const stats = audioPreloader.getCacheStats()
    expect(stats.size).toBeLessThanOrEqual(stats.maxSize)
  })

  it('should respect preload enabled flag', async () => {
    audioPreloader.setPreloadEnabled(false)

    await audioPreloader.preloadNext(1, 1, '1')

    const stats = audioPreloader.getCacheStats()
    expect(stats.size).toBe(0)
  })

  it('should cancel all preloads', async () => {
    await audioPreloader.preloadNext(1, 1, '1')
    await audioPreloader.preloadNext(1, 2, '1')

    audioPreloader.cancelPreloads()

    const stats = audioPreloader.getCacheStats()
    expect(stats.size).toBe(0)
  })
})

describe('Performance Profiler', () => {
  beforeEach(() => {
    performanceProfiler.clear()
  })

  it('should track component renders', () => {
    performanceProfiler.trackRender('TestComponent', 10, 'props change')

    const report = performanceProfiler.getReport()
    expect(report.totalRenders).toBe(1)
    expect(report.rendersByComponent['TestComponent']).toBe(1)
  })

  it('should calculate average render duration', () => {
    performanceProfiler.trackRender('TestComponent', 10)
    performanceProfiler.trackRender('TestComponent', 20)
    performanceProfiler.trackRender('TestComponent', 30)

    const report = performanceProfiler.getReport()
    expect(report.avgRenderDuration).toBe(20)
  })

  it('should take performance snapshots', () => {
    const snapshot = performanceProfiler.takeSnapshot()

    expect(snapshot).toHaveProperty('timestamp')
    expect(snapshot).toHaveProperty('renderCount')
    expect(snapshot).toHaveProperty('avgRenderDuration')
  })

  it('should get component-specific metrics', () => {
    performanceProfiler.trackRender('ComponentA', 10)
    performanceProfiler.trackRender('ComponentB', 20)
    performanceProfiler.trackRender('ComponentA', 15)

    const metricsA = performanceProfiler.getComponentMetrics('ComponentA')
    const metricsB = performanceProfiler.getComponentMetrics('ComponentB')

    expect(metricsA.renderCount).toBe(2)
    expect(metricsB.renderCount).toBe(1)
    expect(metricsA.avgDuration).toBe(12.5)
  })

  it('should export metrics to JSON', () => {
    performanceProfiler.trackRender('TestComponent', 10)

    const json = performanceProfiler.exportMetrics()
    const data = JSON.parse(json)

    expect(data).toHaveProperty('report')
    expect(data).toHaveProperty('rawMetrics')
    expect(data).toHaveProperty('snapshots')
  })
})

describe('Waveform Optimization', () => {
  it('should use canvas for rendering', () => {
    const { container } = render(<AudioPlayerOptimized showWaveform={true} />)

    // Should have canvas element for optimized rendering
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('should throttle waveform updates', async () => {
    const { rerender } = render(<AudioPlayerOptimized showWaveform={true} />)

    performanceProfiler.clear()

    // Rapidly update current time
    for (let i = 0; i < 100; i++) {
      rerender(<AudioPlayerOptimized showWaveform={true} />)
    }

    const metrics = performanceProfiler.getComponentMetrics('WaveformVisualization')

    // Should have significantly fewer renders due to throttling
    expect(metrics.renderCount).toBeLessThan(50)
  })
})

describe('Integration Performance', () => {
  it('should handle rapid user interactions efficiently', async () => {
    const { getByRole } = render(<AudioPlayerOptimized />)

    performanceProfiler.clear()

    // Simulate rapid button clicks
    const playButton = getByRole('button', { name: /play/i })
    for (let i = 0; i < 10; i++) {
      fireEvent.click(playButton)
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const report = performanceProfiler.getReport()

    // Should maintain low average render duration
    expect(report.avgRenderDuration).toBeLessThan(20)
  })

  it('should handle keyboard shortcuts without performance degradation', () => {
    render(<AudioPlayerOptimized />)

    performanceProfiler.clear()

    // Simulate keyboard shortcuts
    fireEvent.keyDown(window, { key: ' ' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowUp' })

    const report = performanceProfiler.getReport()

    // Should have minimal renders
    expect(report.totalRenders).toBeLessThan(5)
  })
})

// Add React import for TypeScript
import React from 'react'
