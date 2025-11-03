// @ts-nocheck
import React, { useState, useEffect, useRef, ErrorInfo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuranStore } from '../stores/quranStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useProgressStore } from '../stores/progressStore'
import { useAudioStore } from '../stores/audioStore'
import { Ayah } from '../types/quran'
import AudioPlayer from '../components/AudioPlayer'
import AyahDisplay from '../components/AyahDisplay'
import QuranText from '../components/QuranText'
import MushafPageView from '../components/MushafPageView'
import MemorizationControls from '../components/MemorizationControls'
import useAudioControls from '../hooks/useAudioControls'
import { useMemorization } from '../hooks/useMemorization'
import { testAudioIntegration, testMultipleAudioSources } from '../utils/audioTest'

// Error Boundary Component
class MushafErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MushafReaderPage Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
          <div className="text-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md"
            >
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There was an error loading the Mushaf page. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-600 dark:bg-gold-600 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-gold-700 transition-colors"
              >
                Refresh Page
              </button>
            </motion.div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const MushafReaderPage: React.FC = () => {
  const navigate = useNavigate()
  const { 
    surahs,
    currentSurah, 
    currentPage, 
    ayahs, 
    reciters,
    loadPage, 
    loadSurah,
    setCurrentPage,
    setCurrentSurah,
    initialize
  } = useQuranStore()
  const { preferences } = usePreferencesStore()
  const { addReadingTime } = useProgressStore()
  const { 
    currentAyahNumber,
    currentSurahNumber,
    loadAyahAudio,
    currentReciter,
    isPlaying,
    cleanup
  } = useAudioStore()

  // Memorization features
  const memorization = useMemorization(currentSurah || undefined)

  // Initialize audio controls with global shortcuts and media keys
  useAudioControls({
    enableGlobalShortcuts: true,
    enableMediaKeys: true,
    enableNotifications: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showMemorizationControls, setShowMemorizationControls] = useState(false)
  const [readingStartTime] = useState(Date.now())
  const [currentView, setCurrentView] = useState<'mushaf' | 'traditional' | 'list'>('traditional')
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializePage()
    
    // Track reading time and cleanup audio when component unmounts
    return () => {
      const readingTime = Math.floor((Date.now() - readingStartTime) / 60000) // minutes
      if (readingTime > 0) {
        addReadingTime(readingTime)
      }
      
      // Cleanup audio to prevent it from continuing when navigating away
      cleanup()
    }
  }, [])

  useEffect(() => {
    if (currentPage) {
      loadCurrentPage()
    }
  }, [currentPage])

  const initializePage = async () => {
    setIsLoading(true)
    try {
      // Initialize the store with all essential data
      await initialize()
      
      // Initialize audio system with proper reciter
      const { initializeAudio } = useAudioStore.getState()
      initializeAudio()
      
      // Test audio integration in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Running audio integration test...')
        testMultipleAudioSources()
        testAudioIntegration().then(result => {
          console.log('🎵 Audio test result:', result)
        }).catch(error => {
          console.warn('⚠️ Audio test error:', error)
        })
      }
      
      // Load current page or start from page 1
      const pageToLoad = currentPage || 1
      await loadPage(pageToLoad)
    } catch (error) {
      console.error('Failed to initialize page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrentPage = async () => {
    if (!currentPage) return
    
    setIsLoading(true)
    try {
      await loadPage(currentPage)
    } catch (error) {
      console.error('Failed to load page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageNavigation = (direction: 'prev' | 'next') => {
    if (!currentPage) return
    
    const newPage = direction === 'next' 
      ? Math.min(currentPage + 1, 604) // Quran has 604 pages
      : Math.max(currentPage - 1, 1)
    
    setCurrentPage(newPage)
  }

  const handleSurahChange = async (surahNumber: number) => {
    setIsLoading(true)
    try {
      setCurrentSurah(surahNumber)
      await loadSurah(surahNumber)
      setCurrentView('list')
    } catch (error) {
      console.error('Failed to load surah:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const playAyahAudio = async (ayah: Ayah) => {
    try {
      // Validate ayah data
      if (!ayah || !ayah.surah || !ayah.numberInSurah) {
        console.error('Invalid ayah data:', ayah)
        return
      }

      // Use the new audio store to load and play ayah audio
      if (!currentReciter && reciters.length > 0) {
        // Set default reciter if none selected
        const defaultReciter = reciters.find(r => r.id === '1') || reciters[0] // Default to Alafasy or first reciter
        await loadAyahAudio(ayah.surah, ayah.numberInSurah, defaultReciter)
      } else if (currentReciter) {
        await loadAyahAudio(ayah.surah, ayah.numberInSurah)
      } else {
        console.warn('No reciter available for audio playback')
        return
      }
      
      // Show audio player when ayah is selected
      setShowAudioPlayer(true)
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }

  const handleAyahSelect = (ayah: Ayah) => {
    setSelectedAyah(ayah)
    playAyahAudio(ayah)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full border-4 border-primary-200 dark:border-gold-200 border-t-primary-600 dark:border-t-gold-400 rounded-full" />
          </motion.div>
          <p className="text-primary-700 dark:text-gold-400 font-medium">
            Loading Quran page...
          </p>
          <QuranText
            text="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
            style="bismillah"
            size="small"
            className="mt-4 text-gray-600 dark:text-gray-400"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">←</span>
            </button>

            <div className="flex items-center space-x-4">
              {/* Audio Player Toggle */}
              <button
                onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                className={`p-2 rounded-lg transition-colors ${
                  showAudioPlayer
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title="Toggle Audio Player"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.823L4.5 13.5H2a2 2 0 01-2-2v-3a2 2 0 012-2h2.5l3.883-3.323z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Memorization Controls Toggle */}
              <button
                onClick={() => setShowMemorizationControls(!showMemorizationControls)}
                className={`p-2 rounded-lg transition-colors ${
                  showMemorizationControls || memorization.isMemorizationMode
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title="Toggle Memorization Tools"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>

              {/* View toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('traditional')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'traditional'
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-gold-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Traditional
                </button>
                <button
                  onClick={() => setCurrentView('mushaf')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'mushaf'
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-gold-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Modern
                </button>
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'list'
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-gold-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  List
                </button>
              </div>

              {/* Page info */}
              {(currentView === 'mushaf' || currentView === 'traditional') && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Page {currentPage}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Juz {Math.ceil(currentPage! / 20)}
                  </p>
                </div>
              )}

              {/* Surah selector */}
              <select
                value={currentSurah || 1}
                onChange={(e) => handleSurahChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {surahs.length > 0 ? (
                  surahs.map(surah => (
                    <option key={surah.number} value={surah.number}>
                      {surah.number}. {surah.name} - {surah.englishName}
                    </option>
                  ))
                ) : (
                  Array.from({ length: 114 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num}. Surah {num}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={() => setShowControls(!showControls)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">{showControls ? '👁️' : '👁️‍🗨️'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Audio Player */}
      <AnimatePresence>
        {showAudioPlayer && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="sticky top-16 z-30 mx-4 mb-4"
          >
            <AudioPlayer
              showWaveform={true}
              ayahNumber={currentAyahNumber || undefined}
              surahNumber={currentSurahNumber || undefined}
              className="max-w-4xl mx-auto"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memorization Controls */}
      <AnimatePresence>
        {showMemorizationControls && currentSurah && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="sticky top-32 z-20 mx-4 mb-4"
          >
            <MemorizationControls
              surahNumber={currentSurah}
              className="max-w-4xl mx-auto"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {currentView === 'traditional' ? (
            <MushafPageView
              key="traditional"
              ayahs={ayahs}
              currentPage={currentPage!}
              selectedAyah={selectedAyah}
              playingAyah={{
                surahNumber: currentSurahNumber,
                ayahNumber: currentAyahNumber
              }}
              onAyahClick={handleAyahSelect}
              onPageChange={handlePageNavigation}
              showControls={false} // We handle controls in the main page
              className="traditional-mushaf-layout"
            />
          ) : currentView === 'mushaf' ? (
            <MushafView
              key="mushaf"
              ayahs={ayahs}
              currentPage={currentPage!}
              selectedAyah={selectedAyah}
              currentAyahNumber={currentAyahNumber}
              currentSurahNumber={currentSurahNumber}
              isPlaying={isPlaying}
              onAyahSelect={handleAyahSelect}
              onPageChange={handlePageNavigation}
              pageRef={pageRef}
            />
          ) : (
            <ListView
              key="list"
              ayahs={ayahs}
              selectedAyah={selectedAyah}
              currentAyahNumber={currentAyahNumber}
              onAyahSelect={handleAyahSelect}
              preferences={preferences}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation (Page controls for Mushaf views) */}
      {(currentView === 'mushaf' || currentView === 'traditional') && showControls && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageNavigation('prev')}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-gold-400 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of 604
                </p>
              </div>

              <button
                onClick={() => handlePageNavigation('next')}
                disabled={currentPage === 604}
                className="px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-gold-400 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ayah details modal */}
      <AnimatePresence>
        {selectedAyah && (
          <AyahModal
            ayah={selectedAyah}
            isPlaying={currentAyahNumber === selectedAyah.numberInSurah}
            onClose={() => setSelectedAyah(null)}
            onPlay={() => playAyahAudio(selectedAyah)}
            preferences={preferences}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Mushaf (traditional page) view component
const MushafView: React.FC<{
  ayahs: Ayah[]
  currentPage: number
  selectedAyah: Ayah | null
  currentAyahNumber: number | null
  currentSurahNumber: number | null
  isPlaying: boolean
  onAyahSelect: (ayah: Ayah) => void
  onPageChange: (direction: 'prev' | 'next') => void
  pageRef: React.RefObject<HTMLDivElement>
}> = ({ ayahs, currentPage, selectedAyah, currentAyahNumber, currentSurahNumber, isPlaying, onAyahSelect, pageRef }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Bismillah for new surah */}
      {ayahs.length > 0 && ayahs[0].numberInSurah === 1 && ayahs[0].surah !== 1 && ayahs[0].surah !== 9 && (
        <div className="text-center py-6">
          <QuranText
            text="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
            style="bismillah"
            className="text-primary-700 dark:text-gold-400"
            animate={true}
          />
        </div>
      )}

      {/* Page content */}
      <div
        ref={pageRef}
        className="mushaf-page bg-cream-100 dark:bg-gray-800 rounded-lg p-8 shadow-lg min-h-[600px] relative"
        style={{
          fontFamily: 'Uthmanic, serif',
          lineHeight: '2.5',
          background: 'linear-gradient(to bottom, #fefdfb 0%, #f9f7f4 100%)'
        }}
      >
        {/* Page border decoration */}
        <div className="absolute inset-4 border-2 border-primary-200 dark:border-gold-200 rounded-lg" />
        <div className="absolute inset-6 border border-primary-100 dark:border-gold-100 rounded-lg" />

        {/* Ayahs */}
        <div className="relative z-10 space-y-4">
          {(ayahs || []).map((ayah, index) => (
            <motion.div
              key={ayah.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer transition-all duration-200 rounded-lg p-3 ${
                selectedAyah?.number === ayah.number
                  ? 'bg-primary-100 dark:bg-primary-900/30'
                  : (isPlaying && currentAyahNumber === ayah.numberInSurah && currentSurahNumber === ayah.surah)
                  ? 'bg-gold-100 dark:bg-gold-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => onAyahSelect(ayah)}
            >
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                {/* Ayah number */}
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 dark:bg-gold-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {ayah.numberInSurah}
                </div>

                {/* Ayah text */}
                <div className="flex-1">
                  <QuranText
                    text={ayah.text}
                    style="mushaf"
                    size="medium"
                    showAyahNumber={true}
                    ayahNumber={ayah.numberInSurah}
                    isPlaying={Boolean(isPlaying && currentAyahNumber === ayah.numberInSurah && currentSurahNumber === ayah.surah)}
                    className="text-gray-900 dark:text-white"
                  />
                </div>

                {/* Playing indicator */}
                {(isPlaying && currentAyahNumber === ayah.numberInSurah && currentSurahNumber === ayah.surah) && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-gold-500 text-xl"
                  >
                    🔊
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Page number at bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary-100 dark:bg-primary-900/20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-primary-700 dark:text-gold-400">
              {currentPage}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// List view component
const ListView: React.FC<{
  ayahs: Ayah[]
  selectedAyah: Ayah | null
  currentAyahNumber: number | null
  onAyahSelect: (ayah: Ayah) => void
  preferences: any
}> = ({ ayahs, selectedAyah, currentAyahNumber, onAyahSelect, preferences }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {(ayahs || []).map((ayah, index) => (
        <motion.div
          key={ayah.number}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <AyahDisplay
            ayah={ayah}
            showTranslation={preferences.showTranslation}
            showTransliteration={preferences.showTransliteration}
            showAyahInfo={true}
            showAyahNumber={true}
            isHighlighted={selectedAyah?.number === ayah.number}
            isPlaying={currentAyahNumber === ayah.numberInSurah}
            size="large"
            style="card"
            onClick={() => onAyahSelect(ayah)}
            onPlay={() => playAyahAudio(ayah)}
            animate={false}
            interactive={true}
            enableMemorization={true}
            onAyahSelect={(ayah, selected) => {
              // Handle ayah selection for memorization
              console.log(`Ayah ${ayah.numberInSurah} selection:`, selected)
            }}
            autoScrollOnPlay={true}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

// Ayah details modal
const AyahModal: React.FC<{
  ayah: Ayah
  isPlaying: boolean
  onClose: () => void
  onPlay: () => void
  preferences: any
}> = ({ ayah, isPlaying, onClose, onPlay, preferences }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Surah {ayah.surah} • Ayah {ayah.numberInSurah}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Arabic text with audio control */}
          <div className="text-center space-y-4">
            <QuranText
              text={ayah.text}
              size="large"
              className="text-gray-900 dark:text-white"
            />
            
            <button
              onClick={onPlay}
              className="px-6 py-2 bg-primary-600 dark:bg-gold-600 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-gold-700 transition-colors"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>

          {/* Transliteration */}
          {preferences.showTransliteration && ayah.transliteration && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Transliteration:</h4>
              <p className="text-gray-600 dark:text-gray-400 italic text-lg leading-relaxed ltr-text">
                {ayah.transliteration}
              </p>
            </div>
          )}

          {/* Translation */}
          {preferences.showTranslation && ayah.translation && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Translation:</h4>
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed ltr-text">
                {ayah.translation}
              </p>
            </div>
          )}

          {/* Additional info */}
          <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p>Ayah {ayah.number} • Page {ayah.page} • Juz {ayah.juz}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// getSurahName function removed - now using actual surah data from store

// Wrap the component with error boundary
const WrappedMushafReaderPage: React.FC = () => (
  <MushafErrorBoundary>
    <MushafReaderPage />
  </MushafErrorBoundary>
)

export default WrappedMushafReaderPage
