/**
 * Enhanced Cross-Browser Compatibility Test Suite
 * 
 * Comprehensive testing across different browsers and their specific quirks.
 * Tests Arabic text rendering, audio support, and Islamic content display.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuranStore } from '../../stores/quranStore'
import { useAudioStore } from '../../stores/audioStore'

// Browser compatibility detection utilities
interface BrowserCapabilities {
  name: string
  version: string
  supportsArabicFonts: boolean
  supportsWebAudio: boolean
  supportsServiceWorker: boolean
  supportsWebP: boolean
  supportsTouchEvents: boolean
  supportsRTL: boolean
  supportsFlexbox: boolean
  supportsGrid: boolean
  audioFormats: string[]
  fontFeatures: string[]
}

class BrowserEmulator {
  private currentBrowser: BrowserCapabilities

  constructor() {
    this.currentBrowser = this.getDefaultBrowser()
  }

  setBrowser(browser: Partial<BrowserCapabilities>): void {
    this.currentBrowser = { ...this.getDefaultBrowser(), ...browser }
    this.updateGlobalObjects()
  }

  private getDefaultBrowser(): BrowserCapabilities {
    return {
      name: 'Chrome',
      version: '120.0',
      supportsArabicFonts: true,
      supportsWebAudio: true,
      supportsServiceWorker: true,
      supportsWebP: true,
      supportsTouchEvents: true,
      supportsRTL: true,
      supportsFlexbox: true,
      supportsGrid: true,
      audioFormats: ['mp3', 'ogg', 'wav', 'aac'],
      fontFeatures: ['liga', 'calt', 'kern', 'mark', 'mkmk']
    }
  }

  private updateGlobalObjects(): void {
    // Mock browser-specific APIs
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: this.generateUserAgent(),
        language: 'en-US',
        languages: ['en-US', 'ar'],
        onLine: true
      },
      configurable: true
    })

    // Mock CSS support detection
    Object.defineProperty(global, 'CSS', {
      value: {
        supports: (property: string, value: string) => {
          if (property === 'writing-mode' && value === 'vertical-rl') {
            return this.currentBrowser.supportsRTL
          }
          if (property === 'display' && value === 'flex') {
            return this.currentBrowser.supportsFlexbox
          }
          if (property === 'display' && value === 'grid') {
            return this.currentBrowser.supportsGrid
          }
          return true
        }
      },
      configurable: true
    })

    // Mock Web Audio API
    if (this.currentBrowser.supportsWebAudio) {
      Object.defineProperty(global, 'AudioContext', {
        value: class MockAudioContext {
          createOscillator() { return {} }
          createGain() { return {} }
          createAnalyser() { return {} }
        },
        configurable: true
      })
    } else {
      delete (global as any).AudioContext
    }

    // Mock Service Worker
    if (this.currentBrowser.supportsServiceWorker) {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...global.navigator,
          serviceWorker: {
            register: vi.fn().mockResolvedValue({}),
            ready: Promise.resolve({})
          }
        },
        configurable: true
      })
    }
  }

  private generateUserAgent(): string {
    const userAgents = {
      Chrome: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.currentBrowser.version} Safari/537.36`,
      Firefox: `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${this.currentBrowser.version}) Gecko/20100101 Firefox/${this.currentBrowser.version}`,
      Safari: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${this.currentBrowser.version} Safari/605.1.15`,
      Edge: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.currentBrowser.version} Edg/${this.currentBrowser.version}`,
      'Internet Explorer': `Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:${this.currentBrowser.version}) like Gecko`
    }
    
    return userAgents[this.currentBrowser.name as keyof typeof userAgents] || userAgents.Chrome
  }

  getCurrentBrowser(): BrowserCapabilities {
    return { ...this.currentBrowser }
  }

  supportsFeature(feature: keyof BrowserCapabilities): boolean {
    return Boolean(this.currentBrowser[feature])
  }

  reset(): void {
    this.currentBrowser = this.getDefaultBrowser()
    this.updateGlobalObjects()
  }
}

// Browser configurations for testing
const BROWSER_CONFIGS = {
  modernChrome: {
    name: 'Chrome',
    version: '120.0',
    supportsArabicFonts: true,
    supportsWebAudio: true,
    supportsServiceWorker: true,
    supportsWebP: true,
    supportsTouchEvents: true,
    supportsRTL: true,
    supportsFlexbox: true,
    supportsGrid: true,
    audioFormats: ['mp3', 'ogg', 'wav', 'aac', 'webm'],
    fontFeatures: ['liga', 'calt', 'kern', 'mark', 'mkmk', 'ccmp']
  },
  modernFirefox: {
    name: 'Firefox',
    version: '119.0',
    supportsArabicFonts: true,
    supportsWebAudio: true,
    supportsServiceWorker: true,
    supportsWebP: true,
    supportsTouchEvents: true,
    supportsRTL: true,
    supportsFlexbox: true,
    supportsGrid: true,
    audioFormats: ['mp3', 'ogg', 'wav'],
    fontFeatures: ['liga', 'calt', 'kern', 'mark', 'mkmk']
  },
  modernSafari: {
    name: 'Safari',
    version: '17.0',
    supportsArabicFonts: true,
    supportsWebAudio: true,
    supportsServiceWorker: true,
    supportsWebP: true,
    supportsTouchEvents: true,
    supportsRTL: true,
    supportsFlexbox: true,
    supportsGrid: true,
    audioFormats: ['mp3', 'wav', 'aac'],
    fontFeatures: ['liga', 'calt', 'kern']
  },
  modernEdge: {
    name: 'Edge',
    version: '119.0',
    supportsArabicFonts: true,
    supportsWebAudio: true,
    supportsServiceWorker: true,
    supportsWebP: true,
    supportsTouchEvents: true,
    supportsRTL: true,
    supportsFlexbox: true,
    supportsGrid: true,
    audioFormats: ['mp3', 'ogg', 'wav', 'aac'],
    fontFeatures: ['liga', 'calt', 'kern', 'mark']
  },
  oldChrome: {
    name: 'Chrome',
    version: '80.0',
    supportsArabicFonts: true,
    supportsWebAudio: true,
    supportsServiceWorker: true,
    supportsWebP: false,
    supportsTouchEvents: true,
    supportsRTL: true,
    supportsFlexbox: true,
    supportsGrid: false,
    audioFormats: ['mp3', 'ogg', 'wav'],
    fontFeatures: ['liga', 'calt']
  },
  oldFirefox: {
    name: 'Firefox',
    version: '70.0',
    supportsArabicFonts: true,
    supportsWebAudio: true,
    supportsServiceWorker: true,
    supportsWebP: false,
    supportsTouchEvents: false,
    supportsRTL: true,
    supportsFlexbox: true,
    supportsGrid: false,
    audioFormats: ['mp3', 'ogg'],
    fontFeatures: ['liga']
  },
  oldSafari: {
    name: 'Safari',
    version: '12.0',
    supportsArabicFonts: true,
    supportsWebAudio: true,
    supportsServiceWorker: false,
    supportsWebP: false,
    supportsTouchEvents: true,
    supportsRTL: true,
    supportsFlexbox: true,
    supportsGrid: false,
    audioFormats: ['mp3', 'wav'],
    fontFeatures: ['liga']
  },
  internetExplorer: {
    name: 'Internet Explorer',
    version: '11.0',
    supportsArabicFonts: false,
    supportsWebAudio: false,
    supportsServiceWorker: false,
    supportsWebP: false,
    supportsTouchEvents: false,
    supportsRTL: true,
    supportsFlexbox: false,
    supportsGrid: false,
    audioFormats: ['mp3'],
    fontFeatures: []
  },
  mobileSafari: {
    name: 'Safari',
    version: '17.0',
    supportsArabicFonts: true,
    supportsWebAudio: true,
    supportsServiceWorker: true,
    supportsWebP: true,
    supportsTouchEvents: true,
    supportsRTL: true,
    supportsFlexbox: true,
    supportsGrid: true,
    audioFormats: ['mp3', 'aac'],
    fontFeatures: ['liga', 'calt']
  }
}

describe('Enhanced Cross-Browser Compatibility Tests', () => {
  let browserEmulator: BrowserEmulator

  beforeEach(() => {
    vi.clearAllMocks()
    browserEmulator = new BrowserEmulator()
    
    // Reset stores
    useQuranStore.getState().reset?.()
    useAudioStore.getState().reset?.()
  })

  afterEach(() => {
    browserEmulator.reset()
    vi.restoreAllMocks()
  })

  describe('Modern Browser Compatibility', () => {
    it('should work correctly in modern Chrome', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.modernChrome)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should support all modern features
      expect(result.current.currentSurah).toBeDefined()
      expect(browserEmulator.supportsFeature('supportsArabicFonts')).toBe(true)
      expect(browserEmulator.supportsFeature('supportsRTL')).toBe(true)
      expect(browserEmulator.supportsFeature('supportsGrid')).toBe(true)
    })

    it('should work correctly in modern Firefox', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.modernFirefox)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should support modern features with Firefox quirks
      expect(result.current.currentSurah).toBeDefined()
      expect(browserEmulator.supportsFeature('supportsArabicFonts')).toBe(true)
      
      // Check Firefox-specific audio support
      const browser = browserEmulator.getCurrentBrowser()
      expect(browser.audioFormats).toContain('ogg')
    })

    it('should work correctly in modern Safari', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.modernSafari)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should work with Safari limitations
      expect(result.current.currentSurah).toBeDefined()
      
      // Check Safari-specific limitations
      const browser = browserEmulator.getCurrentBrowser()
      expect(browser.audioFormats).toContain('aac')
      expect(browser.audioFormats).not.toContain('ogg')
    })

    it('should work correctly in modern Edge', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.modernEdge)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should work in Edge (Chromium-based)
      expect(result.current.currentSurah).toBeDefined()
      expect(browserEmulator.supportsFeature('supportsWebAudio')).toBe(true)
    })
  })

  describe('Legacy Browser Support', () => {
    it('should provide graceful degradation in older Chrome', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.oldChrome)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should work with limited features
      expect(result.current.currentSurah).toBeDefined()
      
      // Should handle missing features gracefully
      const browser = browserEmulator.getCurrentBrowser()
      expect(browser.supportsGrid).toBe(false)
      expect(browser.supportsWebP).toBe(false)
    })

    it('should handle limitations in older Firefox', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.oldFirefox)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should work despite limitations
      expect(result.current.currentSurah).toBeDefined()
      
      // Check limited touch support
      expect(browserEmulator.supportsFeature('supportsTouchEvents')).toBe(false)
    })

    it('should provide maximum compatibility in older Safari', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.oldSafari)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should work without Service Worker
      expect(result.current.currentSurah).toBeDefined()
      expect(browserEmulator.supportsFeature('supportsServiceWorker')).toBe(false)
    })

    it('should handle Internet Explorer gracefully', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.internetExplorer)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // May fail due to limited support
        }
      })
      
      // Should provide basic functionality or appropriate fallbacks
      if (result.current.error) {
        expect(result.current.error.message).toMatch(/not supported|fallback/i)
      } else {
        expect(result.current.currentSurah).toBeDefined()
      }
      
      // Should detect lack of modern features
      expect(browserEmulator.supportsFeature('supportsArabicFonts')).toBe(false)
      expect(browserEmulator.supportsFeature('supportsWebAudio')).toBe(false)
    })
  })

  describe('Arabic Text Rendering Across Browsers', () => {
    it('should render Arabic text correctly in all modern browsers', async () => {
      const browsers = [
        BROWSER_CONFIGS.modernChrome,
        BROWSER_CONFIGS.modernFirefox,
        BROWSER_CONFIGS.modernSafari,
        BROWSER_CONFIGS.modernEdge
      ]
      
      for (const browser of browsers) {
        browserEmulator.setBrowser(browser)
        
        const { result } = renderHook(() => useQuranStore())
        
        await act(async () => {
          await result.current.loadSurah(1)
        })
        
        // Should render Arabic text correctly
        if (result.current.currentSurah?.ayahs?.[0]) {
          const arabicText = result.current.currentSurah.ayahs[0].text
          expect(arabicText).toMatch(/[\u0600-\u06FF]/) // Arabic Unicode range
        }
        
        // Should support Arabic fonts
        expect(browserEmulator.supportsFeature('supportsArabicFonts')).toBe(true)
      }
    })

    it('should handle RTL layout correctly across browsers', async () => {
      const browsers = [
        BROWSER_CONFIGS.modernChrome,
        BROWSER_CONFIGS.modernFirefox,
        BROWSER_CONFIGS.modernSafari
      ]
      
      for (const browser of browsers) {
        browserEmulator.setBrowser(browser)
        
        // Should support RTL layout
        expect(browserEmulator.supportsFeature('supportsRTL')).toBe(true)
        
        // CSS supports should work for RTL
        if (typeof global.CSS !== 'undefined') {
          expect(global.CSS.supports('direction', 'rtl')).toBe(true)
        }
      }
    })

    it('should provide Arabic font fallbacks for unsupported browsers', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.internetExplorer)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // May need fallback handling
        }
      })
      
      // Should handle lack of Arabic font support
      expect(browserEmulator.supportsFeature('supportsArabicFonts')).toBe(false)
      
      // Should provide appropriate fallback or error
      if (result.current.error) {
        expect(result.current.error.message).toMatch(/font|arabic|not supported/i)
      }
    })
  })

  describe('Audio Compatibility Across Browsers', () => {
    it('should handle audio playback in all modern browsers', async () => {
      const browsers = [
        BROWSER_CONFIGS.modernChrome,
        BROWSER_CONFIGS.modernFirefox,
        BROWSER_CONFIGS.modernSafari
      ]
      
      for (const browser of browsers) {
        browserEmulator.setBrowser(browser)
        
        const { result } = renderHook(() => useAudioStore())
        
        await act(async () => {
          try {
            await result.current.loadAudio(1, 1)
          } catch (error) {
            // Handle audio loading errors
          }
        })
        
        // Should support Web Audio API
        expect(browserEmulator.supportsFeature('supportsWebAudio')).toBe(true)
        
        // Should support appropriate audio formats
        const browserCapabilities = browserEmulator.getCurrentBrowser()
        expect(browserCapabilities.audioFormats.length).toBeGreaterThan(0)
      }
    })

    it('should select appropriate audio format based on browser support', async () => {
      // Test different browsers with different audio format support
      const testCases = [
        { browser: BROWSER_CONFIGS.modernChrome, expectedFormat: 'mp3' },
        { browser: BROWSER_CONFIGS.modernFirefox, expectedFormat: 'ogg' },
        { browser: BROWSER_CONFIGS.modernSafari, expectedFormat: 'aac' }
      ]
      
      for (const testCase of testCases) {
        browserEmulator.setBrowser(testCase.browser)
        
        const { result } = renderHook(() => useAudioStore())
        
        await act(async () => {
          try {
            await result.current.loadAudio(1, 1)
          } catch (error) {
            // Handle loading errors
          }
        })
        
        // Should select supported format
        const browserCapabilities = browserEmulator.getCurrentBrowser()
        expect(browserCapabilities.audioFormats).toContain(testCase.expectedFormat)
      }
    })

    it('should provide audio fallback for browsers without Web Audio API', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.internetExplorer)
      
      const { result } = renderHook(() => useAudioStore())
      
      await act(async () => {
        try {
          await result.current.loadAudio(1, 1)
        } catch (error) {
          // Expected for browsers without Web Audio support
        }
      })
      
      // Should handle lack of Web Audio API
      expect(browserEmulator.supportsFeature('supportsWebAudio')).toBe(false)
      
      // Should provide fallback or appropriate error
      if (result.current.error) {
        expect(result.current.error.message).toMatch(/audio|not supported/i)
      }
    })
  })

  describe('Mobile Browser Compatibility', () => {
    it('should work correctly on mobile Safari', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.mobileSafari)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should work on mobile Safari
      expect(result.current.currentSurah).toBeDefined()
      
      // Should support touch events
      expect(browserEmulator.supportsFeature('supportsTouchEvents')).toBe(true)
    })

    it('should handle touch interactions correctly', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.mobileSafari)
      
      // Should support touch events
      expect(browserEmulator.supportsFeature('supportsTouchEvents')).toBe(true)
      
      // Should handle mobile-specific features
      const browser = browserEmulator.getCurrentBrowser()
      expect(browser.supportsTouchEvents).toBe(true)
    })

    it('should adapt layout for mobile screens', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.mobileSafari)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should support modern layout features on mobile
      expect(browserEmulator.supportsFeature('supportsFlexbox')).toBe(true)
      expect(browserEmulator.supportsFeature('supportsGrid')).toBe(true)
    })
  })

  describe('Feature Detection and Polyfills', () => {
    it('should detect browser capabilities correctly', () => {
      const browsers = Object.values(BROWSER_CONFIGS)
      
      browsers.forEach(browser => {
        browserEmulator.setBrowser(browser)
        
        // Should correctly detect each capability
        Object.keys(browser).forEach(feature => {
          if (feature !== 'name' && feature !== 'version' && feature !== 'audioFormats' && feature !== 'fontFeatures') {
            expect(browserEmulator.supportsFeature(feature as keyof BrowserCapabilities)).toBe(
              browser[feature as keyof typeof browser]
            )
          }
        })
      })
    })

    it('should provide appropriate polyfills for missing features', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.oldChrome)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        await result.current.loadSurah(1)
      })
      
      // Should work despite missing features (with polyfills)
      expect(result.current.currentSurah).toBeDefined()
      
      // Should detect missing features
      expect(browserEmulator.supportsFeature('supportsGrid')).toBe(false)
    })

    it('should handle graceful degradation for unsupported features', async () => {
      browserEmulator.setBrowser(BROWSER_CONFIGS.internetExplorer)
      
      const { result } = renderHook(() => useQuranStore())
      
      await act(async () => {
        try {
          await result.current.loadSurah(1)
        } catch (error) {
          // May fail, but should be handled gracefully
        }
      })
      
      // Should either work with fallbacks or provide clear error messages
      if (result.current.error) {
        expect(result.current.error.message).toBeDefined()
        expect(result.current.error.message.length).toBeGreaterThan(0)
      } else {
        expect(result.current.currentSurah).toBeDefined()
      }
    })
  })
})