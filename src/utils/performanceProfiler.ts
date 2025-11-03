/**
 * Performance Profiler for AudioPlayer Component
 * Tracks render counts, CPU usage, and memory consumption
 */

interface RenderMetric {
  componentName: string
  timestamp: number
  duration: number
  reason?: string
}

interface PerformanceSnapshot {
  timestamp: number
  renderCount: number
  avgRenderDuration: number
  memoryUsage?: number
  cpuUsage?: number
}

class PerformanceProfiler {
  private renderMetrics: RenderMetric[] = []
  private snapshots: PerformanceSnapshot[] = []
  private renderObserver: PerformanceObserver | null = null
  private startTime: number = Date.now()
  private isEnabled: boolean = false

  /**
   * Enable performance profiling
   */
  enable(): void {
    this.isEnabled = true
    this.startTime = Date.now()
    this.setupPerformanceObserver()
    console.log('🔍 Performance profiler enabled')
  }

  /**
   * Disable performance profiling
   */
  disable(): void {
    this.isEnabled = false
    if (this.renderObserver) {
      this.renderObserver.disconnect()
      this.renderObserver = null
    }
    console.log('🔍 Performance profiler disabled')
  }

  /**
   * Track a component render
   */
  trackRender(componentName: string, duration: number, reason?: string): void {
    if (!this.isEnabled) return

    this.renderMetrics.push({
      componentName,
      timestamp: Date.now(),
      duration,
      reason
    })

    // Keep only last 1000 metrics to prevent memory leak
    if (this.renderMetrics.length > 1000) {
      this.renderMetrics.shift()
    }
  }

  /**
   * Take a performance snapshot
   */
  takeSnapshot(): PerformanceSnapshot {
    const now = Date.now()
    const recentMetrics = this.renderMetrics.filter(
      m => now - m.timestamp < 10000 // Last 10 seconds
    )

    const snapshot: PerformanceSnapshot = {
      timestamp: now,
      renderCount: recentMetrics.length,
      avgRenderDuration: recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
        : 0
    }

    // Add memory usage if available
    if ((performance as any).memory) {
      snapshot.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }

    this.snapshots.push(snapshot)

    // Keep only last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots.shift()
    }

    return snapshot
  }

  /**
   * Get performance report
   */
  getReport(): {
    totalRenders: number
    avgRenderDuration: number
    renderFrequency: number
    memoryGrowth?: number
    recentSnapshots: PerformanceSnapshot[]
    rendersByComponent: Record<string, number>
  } {
    const now = Date.now()
    const sessionDuration = (now - this.startTime) / 1000 // seconds

    // Count renders by component
    const rendersByComponent: Record<string, number> = {}
    this.renderMetrics.forEach(metric => {
      rendersByComponent[metric.componentName] =
        (rendersByComponent[metric.componentName] || 0) + 1
    })

    // Calculate memory growth
    let memoryGrowth: number | undefined
    if (this.snapshots.length >= 2) {
      const firstSnapshot = this.snapshots[0]
      const lastSnapshot = this.snapshots[this.snapshots.length - 1]
      if (firstSnapshot.memoryUsage && lastSnapshot.memoryUsage) {
        memoryGrowth = lastSnapshot.memoryUsage - firstSnapshot.memoryUsage
      }
    }

    return {
      totalRenders: this.renderMetrics.length,
      avgRenderDuration: this.renderMetrics.length > 0
        ? this.renderMetrics.reduce((sum, m) => sum + m.duration, 0) / this.renderMetrics.length
        : 0,
      renderFrequency: this.renderMetrics.length / sessionDuration,
      memoryGrowth,
      recentSnapshots: this.snapshots.slice(-10),
      rendersByComponent
    }
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    const report = this.getReport()

    console.group('📊 AudioPlayer Performance Report')
    console.log('Total renders:', report.totalRenders)
    console.log('Avg render duration:', report.avgRenderDuration.toFixed(2), 'ms')
    console.log('Render frequency:', report.renderFrequency.toFixed(2), 'renders/sec')

    if (report.memoryGrowth !== undefined) {
      console.log('Memory growth:', report.memoryGrowth.toFixed(2), 'MB')
    }

    console.group('Renders by component:')
    Object.entries(report.rendersByComponent).forEach(([component, count]) => {
      console.log(`${component}:`, count)
    })
    console.groupEnd()

    if (report.recentSnapshots.length > 0) {
      console.group('Recent snapshots:')
      console.table(report.recentSnapshots)
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * Get detailed metrics for specific component
   */
  getComponentMetrics(componentName: string): {
    renderCount: number
    avgDuration: number
    renderReasons: Record<string, number>
  } {
    const metrics = this.renderMetrics.filter(m => m.componentName === componentName)
    const renderReasons: Record<string, number> = {}

    metrics.forEach(metric => {
      const reason = metric.reason || 'unknown'
      renderReasons[reason] = (renderReasons[reason] || 0) + 1
    })

    return {
      renderCount: metrics.length,
      avgDuration: metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
        : 0,
      renderReasons
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.renderMetrics = []
    this.snapshots = []
    this.startTime = Date.now()
    console.log('🔍 Performance metrics cleared')
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      report: this.getReport(),
      rawMetrics: this.renderMetrics,
      snapshots: this.snapshots
    }, null, 2)
  }

  /**
   * Setup Performance Observer for measuring
   */
  private setupPerformanceObserver(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported')
      return
    }

    try {
      this.renderObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.includes('AudioPlayer')) {
            this.trackRender(entry.name, entry.duration)
          }
        })
      })

      this.renderObserver.observe({ entryTypes: ['measure'] })
    } catch (error) {
      console.warn('Failed to setup PerformanceObserver:', error)
    }
  }

  /**
   * Mark start of render
   */
  markRenderStart(componentName: string): void {
    if (!this.isEnabled) return
    performance.mark(`${componentName}-render-start`)
  }

  /**
   * Mark end of render
   */
  markRenderEnd(componentName: string, reason?: string): void {
    if (!this.isEnabled) return

    const endMark = `${componentName}-render-end`
    const startMark = `${componentName}-render-start`

    performance.mark(endMark)

    try {
      performance.measure(
        `${componentName}-render`,
        startMark,
        endMark
      )

      // Get the measurement
      const measures = performance.getEntriesByName(`${componentName}-render`)
      if (measures.length > 0) {
        const measure = measures[measures.length - 1]
        this.trackRender(componentName, measure.duration, reason)
      }

      // Clean up marks
      performance.clearMarks(startMark)
      performance.clearMarks(endMark)
      performance.clearMeasures(`${componentName}-render`)
    } catch (error) {
      console.warn('Failed to measure render:', error)
    }
  }
}

// Export singleton instance
export const performanceProfiler = new PerformanceProfiler()

// Hook for easy integration with React components
export const usePerformanceTracking = (componentName: string) => {
  const renderCount = React.useRef(0)
  const renderStartTime = React.useRef(0)

  React.useEffect(() => {
    renderCount.current++
    const duration = performance.now() - renderStartTime.current

    if (renderCount.current > 1) {
      performanceProfiler.trackRender(componentName, duration)
    }
  })

  // Mark render start
  renderStartTime.current = performance.now()

  return {
    renderCount: renderCount.current,
    trackReason: (reason: string) => {
      performanceProfiler.trackRender(
        componentName,
        performance.now() - renderStartTime.current,
        reason
      )
    }
  }
}

// Development-only helper
export const enableDevProfiler = () => {
  if (process.env.NODE_ENV === 'development') {
    performanceProfiler.enable()

    // Log report every 30 seconds
    setInterval(() => {
      performanceProfiler.logReport()
    }, 30000)

    // Take snapshots every 5 seconds
    setInterval(() => {
      performanceProfiler.takeSnapshot()
    }, 5000)

    // Make available globally for debugging
    ;(window as any).audioPlayerProfiler = performanceProfiler

    console.log('🔍 Development profiler enabled. Access via window.audioPlayerProfiler')
  }
}

// Auto-enable in development
if (process.env.NODE_ENV === 'development') {
  enableDevProfiler()
}

// Add React import
import React from 'react'
