import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MushafPageView from '../components/MushafPageView'
import { Ayah } from '../types/quran'

/**
 * Demo page showcasing the Traditional Mushaf Layout
 * This page demonstrates the authentic Mushaf design with sample content
 */
const TraditionalMushafDemo: React.FC = () => {
  const navigate = useNavigate()
  
  // Sample ayahs for demonstration (Al-Fatiha)
  const [sampleAyahs] = useState<Ayah[]>([
    {
      number: 1,
      text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      surah: 1,
      numberInSurah: 1,
      juz: 1,
      page: 1,
      sajda: false
    },
    {
      number: 2,
      text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
      surah: 1,
      numberInSurah: 2,
      juz: 1,
      page: 1,
      sajda: false
    },
    {
      number: 3,
      text: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      surah: 1,
      numberInSurah: 3,
      juz: 1,
      page: 1,
      sajda: false
    },
    {
      number: 4,
      text: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
      surah: 1,
      numberInSurah: 4,
      juz: 1,
      page: 1,
      sajda: false
    },
    {
      number: 5,
      text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      surah: 1,
      numberInSurah: 5,
      juz: 1,
      page: 1,
      sajda: false
    },
    {
      number: 6,
      text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      surah: 1,
      numberInSurah: 6,
      juz: 1,
      page: 1,
      sajda: false
    },
    {
      number: 7,
      text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      surah: 1,
      numberInSurah: 7,
      juz: 1,
      page: 1,
      sajda: false
    }
  ])

  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null)
  const [playingAyah, setPlayingAyah] = useState<{surahNumber: number | null, ayahNumber: number | null}>({
    surahNumber: null,
    ayahNumber: null
  })
  const [currentPage, setCurrentPage] = useState(1)

  const handleAyahClick = (ayah: Ayah) => {
    setSelectedAyah(ayah)
    setPlayingAyah({
      surahNumber: ayah.surah,
      ayahNumber: ayah.numberInSurah
    })
    
    // Simulate audio playback
    setTimeout(() => {
      setPlayingAyah({ surahNumber: null, ayahNumber: null })
    }, 3000)
  }

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentPage < 604) {
      setCurrentPage(currentPage + 1)
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Home</span>
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Traditional Mushaf Layout Demo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Authentic 15-line Mushaf design with traditional Arabic typography
              </p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Featuring:</span>
              <div className="flex space-x-1">
                <span className="px-2 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded">Uthmani Script</span>
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">Interactive</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 py-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl mb-2">📖</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">15-Line Layout</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Traditional Mushaf page structure</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Uthmani Script</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Authentic Arabic typography</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl mb-2">🖱️</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Interactive</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clickable ayahs with audio</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Responsive</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Works on all devices</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Traditional Mushaf Page */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-5xl mx-auto px-4 pb-8"
      >
        <MushafPageView
          ayahs={sampleAyahs}
          currentPage={currentPage}
          selectedAyah={selectedAyah}
          playingAyah={playingAyah}
          onAyahClick={handleAyahClick}
          onPageChange={handlePageChange}
          showControls={true}
          className="demo-mushaf-page"
        />
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto px-4 pb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How to Use the Traditional Mushaf Layout
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Navigation</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Click "Previous" / "Next" buttons to navigate pages</li>
                <li>• Use arrow keys ← → for keyboard navigation</li>
                <li>• Page and Juz information displayed in Arabic numerals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Interaction</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Click on any ayah text to select and play audio</li>
                <li>• Hover over ayahs for visual feedback</li>
                <li>• Arabic-Indic numerals in decorative circles</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> This is a demonstration using Al-Fatiha (Chapter 1). 
              The full implementation integrates with the complete Quran API for all 604 pages.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TraditionalMushafDemo