// Simple API test to verify our fixes work
import { quranApi } from '../utils/quranApi.js'

const testApi = async () => {
  try {
    console.log('🔍 Testing Quran API...')
    
    // Test Al-Fatiha verses
    const result = await quranApi.getChapterVerses(1, { perPage: 3 })
    
    console.log('✅ API Success!')
    console.log('📊 Results:', {
      count: result.verses.length,
      pagination: result.pagination
    })
    
    result.verses.forEach((verse, index) => {
      console.log(`📖 Verse ${index + 1}:`)
      console.log(`  Arabic: ${verse.text}`)
      console.log(`  Translation: ${verse.translation}`)
      console.log(`  Number: ${verse.numberInSurah}`)
      console.log(`  Surah: ${verse.surah}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('❌ API Error:', error)
  }
}

// Run the test
testApi()

export default testApi