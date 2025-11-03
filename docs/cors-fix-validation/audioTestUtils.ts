/**
 * Audio Testing Utilities for CORS/CSP Resolution
 * Tests audio loading from everyayah.com with fallback support
 */

import { quranApi } from './quranApi'

export interface AudioTestResult {
  success: boolean
  url: string
  method: 'direct' | 'proxy' | 'failed'
  error?: string
  responseTime?: number
  contentType?: string
  fileSize?: number
}

/**
 * Test audio URL accessibility
 */
export async function testAudioUrl(url: string, method: 'direct' | 'proxy' = 'direct'): Promise<AudioTestResult> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors'
    })
    
    const responseTime = Date.now() - startTime
    const contentType = response.headers.get('content-type') || undefined
    const contentLength = response.headers.get('content-length')
    const fileSize = contentLength ? parseInt(contentLength, 10) : undefined
    
    if (response.ok) {
      return {
        success: true,
        url,
        method,
        responseTime,
        contentType,
        fileSize
      }
    } else {
      return {
        success: false,
        url,
        method,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime
      }
    }
  } catch (error) {
    return {
      success: false,
      url,
      method,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }
  }
}

/**
 * Test audio loading with both direct and proxy methods
 */
export async function testAudioWithFallback(
  reciterId: string = '1', 
  chapterNumber: number = 1, 
  verseNumber: number = 1
): Promise<{
  direct: AudioTestResult
  proxy: AudioTestResult
  recommended: 'direct' | 'proxy' | 'none'
}> {
  console.log(`🎵 Testing audio for ${chapterNumber}:${verseNumber} with reciter ${reciterId}`)
  
  // Test direct URL (should work with updated CSP)
  const directUrl = quranApi.getAudioUrl(reciterId, chapterNumber, verseNumber, false)
  const directResult = await testAudioUrl(directUrl, 'direct')
  
  // Test proxy URL (fallback for development)
  const proxyUrl = quranApi.getAudioUrl(reciterId, chapterNumber, verseNumber, true)
  const proxyResult = await testAudioUrl(proxyUrl, 'proxy')
  
  // Determine recommended method
  let recommended: 'direct' | 'proxy' | 'none' = 'none'
  if (directResult.success) {
    recommended = 'direct'
  } else if (proxyResult.success) {
    recommended = 'proxy'
  }
  
  return {
    direct: directResult,
    proxy: proxyResult,
    recommended
  }
}

/**
 * Test WaveSurfer audio loading (the main use case)
 */
export async function testWaveSurferCompatibility(
  reciterId: string = '1',
  chapterNumber: number = 1,
  verseNumber: number = 1
): Promise<AudioTestResult & { audioElement?: HTMLAudioElement }> {
  try {
    const url = await quranApi.getAudioUrlWithFallback(reciterId, chapterNumber, verseNumber)
    
    return new Promise((resolve) => {
      const audio = new Audio()
      const startTime = Date.now()
      
      audio.onloadedmetadata = () => {
        resolve({
          success: true,
          url,
          method: url.includes('/api/audio') ? 'proxy' : 'direct',
          responseTime: Date.now() - startTime,
          contentType: 'audio/mpeg',
          audioElement: audio
        })
      }
      
      audio.onerror = (error) => {
        resolve({
          success: false,
          url,
          method: url.includes('/api/audio') ? 'proxy' : 'direct',
          error: `Audio loading failed: ${error}`,
          responseTime: Date.now() - startTime
        })
      }
      
      // Set timeout for slow responses
      setTimeout(() => {
        if (audio.readyState === 0) {
          resolve({
            success: false,
            url,
            method: url.includes('/api/audio') ? 'proxy' : 'direct',
            error: 'Timeout: Audio failed to load within 10 seconds',
            responseTime: Date.now() - startTime
          })
        }
      }, 10000)
      
      audio.src = url
    })
  } catch (error) {
    return {
      success: false,
      url: '',
      method: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Run comprehensive audio tests
 */
export async function runAudioTests(): Promise<{
  cspStatus: 'pass' | 'fail'
  corsStatus: 'pass' | 'fail'
  proxyStatus: 'pass' | 'fail'
  waveSurferStatus: 'pass' | 'fail'
  recommendations: string[]
  results: {
    fallback: Awaited<ReturnType<typeof testAudioWithFallback>>
    waveSurfer: Awaited<ReturnType<typeof testWaveSurferCompatibility>>
  }
}> {
  console.log('🔍 Running comprehensive audio CORS/CSP tests...')
  
  const results = {
    fallback: await testAudioWithFallback(),
    waveSurfer: await testWaveSurferCompatibility()
  }
  
  const cspStatus = results.fallback.direct.success ? 'pass' : 'fail'
  const corsStatus = results.fallback.direct.success ? 'pass' : 'fail'
  const proxyStatus = results.fallback.proxy.success ? 'pass' : 'fail'
  const waveSurferStatus = results.waveSurfer.success ? 'pass' : 'fail'
  
  const recommendations: string[] = []
  
  if (cspStatus === 'fail') {
    recommendations.push('CSP needs to include everyayah.com in media-src and connect-src')
  }
  
  if (corsStatus === 'fail' && proxyStatus === 'pass') {
    recommendations.push('Use proxy configuration for development environment')
  }
  
  if (waveSurferStatus === 'fail') {
    recommendations.push('WaveSurfer integration needs audio URL fallback implementation')
  }
  
  if (cspStatus === 'pass' && corsStatus === 'pass' && waveSurferStatus === 'pass') {
    recommendations.push('✅ All audio tests passing - CORS/CSP issues resolved!')
  }
  
  return {
    cspStatus,
    corsStatus,
    proxyStatus,
    waveSurferStatus,
    recommendations,
    results
  }
}

/**
 * Display test results in console
 */
export function logTestResults(testResults: Awaited<ReturnType<typeof runAudioTests>>): void {
  console.group('🎵 Audio CORS/CSP Test Results')
  
  console.log(`CSP Status: ${testResults.cspStatus === 'pass' ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`CORS Status: ${testResults.corsStatus === 'pass' ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Proxy Status: ${testResults.proxyStatus === 'pass' ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`WaveSurfer Status: ${testResults.waveSurferStatus === 'pass' ? '✅ PASS' : '❌ FAIL'}`)
  
  console.group('📊 Detailed Results')
  console.log('Direct URL Test:', testResults.results.fallback.direct)
  console.log('Proxy URL Test:', testResults.results.fallback.proxy)
  console.log('WaveSurfer Test:', testResults.results.waveSurfer)
  console.groupEnd()
  
  console.group('💡 Recommendations')
  testResults.recommendations.forEach(rec => console.log(`• ${rec}`))
  console.groupEnd()
  
  console.groupEnd()
}