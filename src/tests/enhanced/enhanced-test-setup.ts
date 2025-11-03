/**
 * Enhanced Test Setup
 * 
 * Extended setup for enhanced testing with Islamic content validation,
 * performance monitoring, and comprehensive mocking.
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Enhanced global test configuration
declare global {
  interface Window {
    __ENHANCED_TEST_ENV__: boolean
    __ISLAMIC_CONTENT_VALIDATION__: boolean
    __PERFORMANCE_MONITORING__: boolean
    performance: Performance & {
      memory?: {
        usedJSHeapSize: number
        totalJSHeapSize: number
        jsHeapSizeLimit: number
      }
    }
  }
}

// Enhanced performance monitoring setup
const setupPerformanceMonitoring = () => {
  // Mock performance.memory for browsers that don't support it
  if (!window.performance.memory) {
    Object.defineProperty(window.performance, 'memory', {
      value: {
        usedJSHeapSize: 10 * 1024 * 1024, // 10MB baseline
        totalJSHeapSize: 50 * 1024 * 1024, // 50MB total
        jsHeapSizeLimit: 100 * 1024 * 1024 // 100MB limit
      },
      configurable: true
    })
  }

  // Mock performance marks and measures
  if (!window.performance.mark) {
    window.performance.mark = vi.fn()
  }
  if (!window.performance.measure) {
    window.performance.measure = vi.fn()
  }
}

// Enhanced Islamic content validation setup
const setupIslamicContentValidation = () => {
  // Mock Arabic text validation utilities
  global.isArabicText = (text: string): boolean => {
    return /[\u0600-\u06FF]/.test(text)
  }

  global.hasDiacritics = (text: string): boolean => {
    return /[\u064B-\u0652\u0670\u0640]/.test(text)
  }

  global.validateQuranVerse = (surah: number, ayah: number, text: string): boolean => {
    // Mock validation - in real implementation would validate against trusted source
    return global.isArabicText(text) && surah >= 1 && surah <= 114 && ayah >= 1
  }
}

// Enhanced accessibility testing setup
const setupAccessibilityTesting = () => {
  // Mock screen reader announcements
  global.mockScreenReaderAnnounce = vi.fn()
  
  // Mock ARIA live regions
  global.createMockLiveRegion = (politeness: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', politeness)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    document.body.appendChild(liveRegion)
    return liveRegion
  }

  // Mock color contrast calculation
  global.calculateContrastRatio = (color1: string, color2: string): number => {
    // Simplified mock - real implementation would do proper calculation
    return 4.5 // WCAG AA minimum
  }
}

// Enhanced mobile testing setup
const setupMobileTesting = () => {
  // Mock touch events
  global.TouchEvent = class MockTouchEvent extends Event {
    touches: any[]
    targetTouches: any[]
    changedTouches: any[]

    constructor(type: string, eventInitDict?: TouchEventInit) {
      super(type, eventInitDict)
      this.touches = eventInitDict?.touches ? Array.from(eventInitDict.touches) : []
      this.targetTouches = eventInitDict?.targetTouches ? Array.from(eventInitDict.targetTouches) : []
      this.changedTouches = eventInitDict?.changedTouches ? Array.from(eventInitDict.changedTouches) : []
    }
  }

  // Mock device orientation
  global.mockDeviceOrientation = (orientation: 'portrait' | 'landscape') => {
    Object.defineProperty(screen, 'orientation', {
      value: {
        angle: orientation === 'landscape' ? 90 : 0,
        type: orientation === 'landscape' ? 'landscape-primary' : 'portrait-primary'
      },
      configurable: true
    })
  }

  // Mock vibration API
  if (!navigator.vibrate) {
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      configurable: true
    })
  }
}

// Enhanced network testing setup
const setupNetworkTesting = () => {
  // Mock fetch with network simulation
  global.mockNetworkCondition = (condition: 'online' | 'offline' | 'slow' | 'fast') => {
    Object.defineProperty(navigator, 'onLine', {
      value: condition !== 'offline',
      configurable: true
    })

    // Mock connection API
    Object.defineProperty(navigator, 'connection', {
      value: {
        effectiveType: condition === 'slow' ? '2g' : condition === 'fast' ? '4g' : '3g',
        downlink: condition === 'slow' ? 0.5 : condition === 'fast' ? 10 : 2,
        rtt: condition === 'slow' ? 500 : condition === 'fast' ? 50 : 200
      },
      configurable: true
    })
  }

  // Set default online state
  global.mockNetworkCondition('online')
}

// Enhanced audio testing setup
const setupAudioTesting = () => {
  // Mock Web Audio API
  global.AudioContext = class MockAudioContext {
    createOscillator() { return {} }
    createGain() { return {} }
    createAnalyser() { return {} }
    decodeAudioData() { return Promise.resolve({}) }
    suspend() { return Promise.resolve() }
    resume() { return Promise.resolve() }
    close() { return Promise.resolve() }
  }

  // Mock HTMLAudioElement
  global.HTMLAudioElement = class MockHTMLAudioElement {
    src = ''
    currentTime = 0
    duration = 100
    paused = true
    volume = 1
    muted = false

    play() { 
      this.paused = false
      return Promise.resolve() 
    }
    pause() { 
      this.paused = true 
    }
    load() {}
    addEventListener() {}
    removeEventListener() {}
  }
}

// Enhanced security testing setup
const setupSecurityTesting = () => {
  // Mock Content Security Policy
  global.mockCSP = {
    violation: vi.fn(),
    report: vi.fn()
  }

  // Mock XSS protection
  global.sanitizeInput = (input: string): string => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }

  // Mock HTTPS enforcement
  global.isSecureContext = true
}

// Enhanced cross-browser testing setup
const setupCrossBrowserTesting = () => {
  // Mock user agent switching
  global.mockUserAgent = (browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie') => {
    const userAgents = {
      chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Edg/120.0.0.0',
      ie: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
    }

    Object.defineProperty(navigator, 'userAgent', {
      value: userAgents[browser],
      configurable: true
    })
  }

  // Set default to Chrome
  global.mockUserAgent('chrome')
}

// Main setup function
beforeAll(() => {
  console.log('🚀 Setting up Enhanced Test Environment')
  
  // Set global flags
  window.__ENHANCED_TEST_ENV__ = true
  window.__ISLAMIC_CONTENT_VALIDATION__ = true
  window.__PERFORMANCE_MONITORING__ = true
  
  // Initialize all enhanced setups
  setupPerformanceMonitoring()
  setupIslamicContentValidation()
  setupAccessibilityTesting()
  setupMobileTesting()
  setupNetworkTesting()
  setupAudioTesting()
  setupSecurityTesting()
  setupCrossBrowserTesting()

  console.log('✅ Enhanced Test Environment Ready')
})

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks()
  
  // Reset network to online state
  global.mockNetworkCondition('online')
  
  // Reset device orientation to portrait
  global.mockDeviceOrientation('portrait')
  
  // Reset user agent to Chrome
  global.mockUserAgent('chrome')
  
  // Create fresh performance baseline
  if (window.performance.memory) {
    const memory = window.performance.memory
    memory.usedJSHeapSize = 10 * 1024 * 1024 // Reset to 10MB baseline
  }
})

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks()
  
  // Clean up any created DOM elements
  document.body.innerHTML = ''
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
})

afterAll(() => {
  console.log('🧹 Cleaning up Enhanced Test Environment')
  
  // Final cleanup
  delete window.__ENHANCED_TEST_ENV__
  delete window.__ISLAMIC_CONTENT_VALIDATION__
  delete window.__PERFORMANCE_MONITORING__
  
  console.log('✅ Enhanced Test Environment Cleaned')
})

// Export utilities for use in tests
export {
  setupPerformanceMonitoring,
  setupIslamicContentValidation,
  setupAccessibilityTesting,
  setupMobileTesting,
  setupNetworkTesting,
  setupAudioTesting,
  setupSecurityTesting,
  setupCrossBrowserTesting
}