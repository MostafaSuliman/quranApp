import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import QuranText from './QuranText'
import AyahDisplay from './AyahDisplay'
import { quranApi } from '../utils/quranApi'
import { Ayah } from '../types/quran'

interface FontTestResult {
  fontName: string
  isLoaded: boolean
  isAvailable: boolean
  fallbacks: string[]
}

const ArabicTextDebugger: React.FC = () => {
  const [fontTests, setFontTests] = useState<FontTestResult[]>([])
  const [browserInfo, setBrowserInfo] = useState<any>({})
  const [elementTests, setElementTests] = useState<any>({})
  const [apiTest, setApiTest] = useState<{
    loading: boolean
    error: string | null
    ayahs: Ayah[]
    rawResponse?: any
  }>({
    loading: false,
    error: null,
    ayahs: []
  })

  // Arabic test samples
  const testTexts = {
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    alFatiha1: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    alFatiha2: 'الرَّحْمَٰنِ الرَّحِيمِ',
    alIkhlas: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    complex: 'وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا لَعَلَّكُمْ تُرْحَمُونَ',
    diacritics: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ',
    numbers: 'آية ١٢٣٤٥٦٧٨٩٠',
    punctuation: '﴿ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم ﴾'
  }

  // Fonts to test
  const fontsToTest = [
    'Uthmanic',
    'Amiri', 
    'Scheherazade New',
    'Noto Naskh Arabic',
    'Traditional Arabic',
    'Arial Unicode MS',
    'Tahoma',
    'Times New Roman'
  ]

  useEffect(() => {
    // Test font loading
    testFontLoading()
    
    // Test browser capabilities
    testBrowserCapabilities()
    
    // Test DOM element rendering
    testElementRendering()
  }, [])

  const testFontLoading = async () => {
    const results: FontTestResult[] = []
    
    for (const fontName of fontsToTest) {
      try {
        // Check if font is loaded using CSS Font Loading API
        const isLoaded = await document.fonts.check(`16px "${fontName}"`)
        
        // Check if font is available using canvas measurement
        const isAvailable = isFontAvailable(fontName)
        
        results.push({
          fontName,
          isLoaded,
          isAvailable,
          fallbacks: getFontFallbacks(fontName)
        })
      } catch (error) {
        results.push({
          fontName,
          isLoaded: false,
          isAvailable: false,
          fallbacks: []
        })
      }
    }
    
    setFontTests(results)
  }

  const isFontAvailable = (fontName: string): boolean => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return false

    // Test text
    const testText = 'مرحبا'
    
    // Measure with fallback font
    context.font = '16px monospace'
    const fallbackWidth = context.measureText(testText).width
    
    // Measure with target font
    context.font = `16px "${fontName}", monospace`
    const targetWidth = context.measureText(testText).width
    
    // Font is available if widths differ
    return fallbackWidth !== targetWidth
  }

  const getFontFallbacks = (fontName: string): string[] => {
    const style = document.createElement('style')
    style.textContent = `.test-font { font-family: "${fontName}", serif; }`
    document.head.appendChild(style)
    
    const testEl = document.createElement('div')
    testEl.className = 'test-font'
    testEl.style.position = 'absolute'
    testEl.style.visibility = 'hidden'
    testEl.textContent = 'Test'
    document.body.appendChild(testEl)
    
    const computedStyle = window.getComputedStyle(testEl)
    const fontFamily = computedStyle.fontFamily
    
    document.head.removeChild(style)
    document.body.removeChild(testEl)
    
    return fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''))
  }

  const testBrowserCapabilities = () => {
    setBrowserInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      direction: document.dir || 'ltr',
      fontLoadingSupport: 'fonts' in document,
      cssDirectionSupport: CSS.supports('direction', 'rtl'),
      unicodeBidiSupport: CSS.supports('unicode-bidi', 'embed'),
      textRenderingSupport: CSS.supports('text-rendering', 'optimizeLegibility'),
      fontDisplaySupport: CSS.supports('font-display', 'swap')
    })
  }

  const testElementRendering = () => {
    // Create test elements to verify rendering
    const testDiv = document.createElement('div')
    testDiv.style.fontFamily = 'Amiri, serif'
    testDiv.style.fontSize = '24px'
    testDiv.style.direction = 'rtl'
    testDiv.style.position = 'absolute'
    testDiv.style.top = '-1000px'
    testDiv.textContent = testTexts.bismillah
    
    document.body.appendChild(testDiv)
    
    const computed = window.getComputedStyle(testDiv)
    
    setElementTests({
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      direction: computed.direction,
      textAlign: computed.textAlign,
      unicodeBidi: computed.unicodeBidi,
      width: testDiv.offsetWidth,
      height: testDiv.offsetHeight,
      textContent: testDiv.textContent,
      textLength: testDiv.textContent?.length || 0
    })
    
    document.body.removeChild(testDiv)
  }

  const checkNetworkFonts = async () => {
    const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Scheherazade+New:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap'
    
    try {
      const response = await fetch(googleFontsUrl)
      return {
        googleFontsAccessible: response.ok,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      return {
        googleFontsAccessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const [networkStatus, setNetworkStatus] = useState<any>(null)

  useEffect(() => {
    checkNetworkFonts().then(setNetworkStatus)
    testQuranApi()
  }, [])

  const testQuranApi = async () => {
    setApiTest(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      console.log('Testing Quran API...')
      const result = await quranApi.getChapterVerses(1, { perPage: 3 })
      console.log('API Result:', result)
      
      setApiTest({
        loading: false,
        error: null,
        ayahs: result.verses,
        rawResponse: result
      })
    } catch (error) {
      console.error('API Test Error:', error)
      setApiTest({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown API error',
        ayahs: [],
        rawResponse: null
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Arabic Text Rendering Debugger
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analysis of Arabic text display capabilities
          </p>
        </motion.div>

        {/* Font Loading Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Font Loading Analysis
          </h2>
          <div className="grid gap-4">
            {fontTests.map((font) => (
              <div
                key={font.fontName}
                className={`p-4 rounded-lg border-2 ${
                  font.isLoaded && font.isAvailable
                    ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    : font.isAvailable
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {font.fontName}
                  </h3>
                  <div className="flex space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        font.isLoaded
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {font.isLoaded ? 'Loaded' : 'Not Loaded'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        font.isAvailable
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {font.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
                {font.fallbacks.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Fallbacks: {font.fallbacks.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Network Font Test */}
        {networkStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Network Font Access
            </h2>
            <div className={`p-4 rounded-lg ${
              networkStatus.googleFontsAccessible
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <p className="text-gray-900 dark:text-white">
                Google Fonts Access: {networkStatus.googleFontsAccessible ? '✅ Working' : '❌ Failed'}
              </p>
              {networkStatus.error && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  Error: {networkStatus.error}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Quran API Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quran API Test
          </h2>
          
          {apiTest.loading && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-400">
                Loading verses from Quran.com API...
              </p>
            </div>
          )}
          
          {apiTest.error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-700 dark:text-red-400">
                API Error: {apiTest.error}
              </p>
            </div>
          )}
          
          {apiTest.ayahs.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-700 dark:text-green-400">
                  ✅ Successfully loaded {apiTest.ayahs.length} verses from Al-Fatiha
                </p>
              </div>
              
              {/* Display loaded verses */}
              <div className="space-y-4">
                {apiTest.ayahs.map((ayah, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Verse {ayah.numberInSurah} - Raw text: {ayah.text}
                      </span>
                    </div>
                    <AyahDisplay
                      ayah={ayah}
                      showTranslation={true}
                      showTransliteration={false}
                      style="inline"
                      size="medium"
                    />
                  </div>
                ))}
              </div>
              
              {/* Raw API response info */}
              {apiTest.rawResponse && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                    Show Raw API Response
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                    {JSON.stringify(apiTest.rawResponse, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </motion.div>

        {/* Arabic Text Samples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Arabic Text Rendering Tests
          </h2>
          
          <div className="space-y-6">
            {Object.entries(testTexts).map(([key, text]) => (
              <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                
                {/* Test with different font styles */}
                <div className="grid gap-4">
                  {/* QuranText Component Test */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">QuranText Component (Amiri)</p>
                    <QuranText
                      text={text}
                      size="medium"
                      style="regular"
                      className="text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Mushaf Style Test */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Mushaf Style (Uthmanic)</p>
                    <QuranText
                      text={text}
                      size="medium"
                      style="mushaf"
                      className="text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Raw CSS Test */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Raw CSS (arabic-text class)</p>
                    <p className="arabic-text text-gray-900 dark:text-white">
                      {text}
                    </p>
                  </div>

                  {/* Fallback Font Test */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">System Fallback</p>
                    <p className="text-gray-900 dark:text-white" style={{ 
                      fontFamily: 'serif',
                      direction: 'rtl',
                      textAlign: 'right',
                      fontSize: '1.25rem',
                      lineHeight: 2
                    }}>
                      {text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Browser Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Browser Capabilities
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(browserInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className={`font-mono text-sm ${
                  typeof value === 'boolean'
                    ? value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Element Test Results */}
        {Object.keys(elementTests).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              DOM Element Analysis
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(elementTests).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Debugging Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Debugging Actions
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={testFontLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retest Fonts
            </button>
            <button
              onClick={testBrowserCapabilities}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Recheck Browser
            </button>
            <button
              onClick={testElementRendering}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retest Elements
            </button>
            <button
              onClick={testQuranApi}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              disabled={apiTest.loading}
            >
              {apiTest.loading ? 'Testing...' : 'Retest API'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ArabicTextDebugger