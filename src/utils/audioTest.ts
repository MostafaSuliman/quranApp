// Quick test to verify audio functionality
import { quranApi } from './quranApi'

export const testAudioIntegration = async () => {
  console.log('🎵 Testing Quran Audio Integration...')
  
  try {
    // Test 1: Generate audio URL
    const audioUrl = quranApi.getAudioUrl('1', 1, 1) // Al-Fatiha, verse 1, Mishary Rashid Alafasy
    console.log('✅ Audio URL generated:', audioUrl)
    
    // Test 2: Check if URL is accessible (basic check)
    const testResponse = await fetch(audioUrl, { method: 'HEAD' })
    if (testResponse.ok) {
      console.log('✅ Audio file is accessible')
    } else {
      console.log('⚠️  Audio file may not be accessible:', testResponse.status)
    }
    
    // Test 3: Test audio creation
    const audio = new Audio(audioUrl)
    audio.preload = 'metadata'
    
    const loadPromise = new Promise((resolve, reject) => {
      audio.addEventListener('loadedmetadata', () => {
        console.log('✅ Audio metadata loaded successfully')
        console.log('   Duration:', audio.duration, 'seconds')
        resolve(audio.duration)
      })
      
      audio.addEventListener('error', (e) => {
        console.log('❌ Audio loading failed:', e)
        reject(e)
      })
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Audio loading timeout'))
      }, 10000)
    })
    
    await loadPromise
    console.log('✅ Audio test completed successfully!')
    
    return {
      success: true,
      audioUrl,
      duration: audio.duration
    }
    
  } catch (error) {
    console.error('❌ Audio test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test different audio URLs
export const testMultipleAudioSources = () => {
  const testCases = [
    { reciter: '1', surah: 1, ayah: 1, name: 'Al-Fatiha 1:1 - Mishary Rashid Alafasy' },
    { reciter: '7', surah: 1, ayah: 1, name: 'Al-Fatiha 1:1 - Abdul Basit' },
    { reciter: '1', surah: 2, ayah: 1, name: 'Al-Baqarah 2:1 - Mishary Rashid Alafasy' }
  ]
  
  console.log('🎵 Testing multiple audio sources...')
  
  testCases.forEach(({ reciter, surah, ayah, name }) => {
    const url = quranApi.getAudioUrl(reciter, surah, ayah)
    console.log(`${name}: ${url}`)
  })
}

// Console command for easy testing
if (typeof window !== 'undefined') {
  ;(window as any).testQuranAudio = testAudioIntegration
  ;(window as any).testMultipleAudioSources = testMultipleAudioSources
}