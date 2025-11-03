import React, { useEffect, useState } from 'react'
import QuranText from '../components/QuranText'
import AyahDisplay from '../components/AyahDisplay'
import { quranApi } from '../utils/quranApi'
import { Ayah } from '../types/quran'

const ArabicTextTest: React.FC = () => {
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing Quran API...')
        const result = await quranApi.getChapterVerses(1, { perPage: 3 })
        console.log('API Result:', result)
        setAyahs(result.verses)
      } catch (err) {
        console.error('API Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Arabic Text Test - Loading...</h1>
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Arabic Text Test - Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Arabic Text Test</h1>
      
      {/* Direct Arabic text test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Direct Arabic Text (QuranText Component)</h2>
        <QuranText
          text="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
          size="large"
          style="regular"
          className="border p-4 rounded-lg"
        />
      </div>

      {/* API loaded verses */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">API Loaded Verses ({ayahs.length} verses)</h2>
        {ayahs.map((ayah, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-2">
            <p className="text-sm text-gray-600">Raw text: {ayah.text}</p>
            <p className="text-sm text-gray-600">Translation: {ayah.translation}</p>
            
            <div className="space-y-2">
              <h3 className="font-medium">QuranText Component:</h3>
              <QuranText
                text={ayah.text}
                size="medium"
                style="regular"
                className="bg-gray-50 p-2 rounded"
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">AyahDisplay Component:</h3>
              <AyahDisplay
                ayah={ayah}
                showTranslation={true}
                showTransliteration={false}
                style="card"
                size="medium"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ArabicTextTest