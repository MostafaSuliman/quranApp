import React, { Suspense, useEffect, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import LoadingScreen from './components/LoadingScreen'
import SplashScreen from './components/SplashScreen'
import Navigation from './components/Navigation'

// Error handling
import { AppErrorBoundary, PageErrorBoundary, useErrorHandler } from './components/ErrorBoundary'

// Audio navigation context
import AudioNavigationProvider from './contexts/AudioNavigationProvider'

// Translation context
import { TranslationProvider } from './contexts/TranslationContext'

// Performance optimization
import { mobilePerformanceOptimizer } from './utils/mobileOptimization'

// Lazy-loaded pages for code splitting and faster initial load
const HomePage = lazy(() => import('./pages/HomePage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const MushafReaderPage = lazy(() => import('./pages/MushafReaderPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ArabicDebugPage = lazy(() => import('./pages/ArabicDebugPage'))
const TraditionalMushafDemo = lazy(() => import('./pages/TraditionalMushafDemo'))
const AudioNavigationTest = lazy(() => import('./components/AudioNavigationTest'))
const AudioNavigationDemo = lazy(() => import('./components/AudioNavigationDemo'))
// AudioTestComponent removed after successful CORS/CSP fix validation

// Hooks and stores
import { useAuthStore } from './stores/authStore'
import { useProgressStore } from './stores/progressStore'
import { usePreferencesStore } from './stores/preferencesStore'
import { useAudioStore } from './stores/audioStore'

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
}

function App() {
  const { user, isAuthenticated, initialize: initializeAuth } = useAuthStore()
  const { initialize: initializeProgress } = useProgressStore()
  const { preferences, initialize: initializePreferences } = usePreferencesStore()
  const { initializeAudio } = useAudioStore()
  const [showSplash, setShowSplash] = React.useState(true)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Initialize global error handlers
  useErrorHandler()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize all stores
        await Promise.all([
          initializeAuth(),
          initializeProgress(),
          initializePreferences()
        ])
        
        // Initialize audio system
        initializeAudio()
        
        console.log('🚀 App initialized successfully')
        setIsInitialized(true)
        
        // Show splash screen for minimum 2 seconds for beautiful animation
        setTimeout(() => {
          setShowSplash(false)
        }, 2000)
        
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsInitialized(true)
        setShowSplash(false)
      }
    }

    initializeApp()
  }, [initializeAuth, initializeProgress, initializePreferences, initializeAudio])

  // Apply preferences to html element and sync with other stores
  useEffect(() => {
    // Apply dark mode
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Apply animation settings
    if (!preferences.animationsEnabled) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms')
    } else {
      document.documentElement.style.removeProperty('--animation-duration')
    }
    
    // Language and direction are now handled by TranslationProvider
  }, [preferences.darkMode, preferences.animationsEnabled])
  
  // Sync audio settings with preferences store
  useEffect(() => {
    const audioState = useAudioStore.getState()
    
    // Sync playback speed if different
    if (audioState.playbackSpeed !== preferences.playbackSpeed) {
      audioState.setPlaybackSpeed(preferences.playbackSpeed as any)
    }
    
    // Sync reciter if different
    const currentReciterId = audioState.currentReciter?.id
    if (currentReciterId !== preferences.preferredReciter) {
      audioState.initializeAudio() // Re-initialize with new reciter
    }
  }, [preferences.playbackSpeed, preferences.preferredReciter])

  // Simple development mode testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 QuranApp Development Mode')
      console.log('📱 Mobile optimizations:', mobilePerformanceOptimizer.getDeviceInfo())
    }
  }, [])

  // Show splash screen while loading
  if (showSplash || !isInitialized) {
    return <SplashScreen />
  }

  // Show onboarding for new users
  if (isAuthenticated && !user?.hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <OnboardingPage />
      </div>
    )
  }

  return (
    <AppErrorBoundary>
      <TranslationProvider>
        <AudioNavigationProvider>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Suspense fallback={<LoadingScreen />}>
              <AnimatePresence mode="wait">
                <Routes>
                <Route 
                path="/" 
                element={
                  <motion.div
                    key="home"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="page-container"
                  >
                    <HomePage />
                    <Navigation />
                  </motion.div>
                }
              />
              
              <Route 
                path="/onboarding" 
                element={
                  <motion.div
                    key="onboarding"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <OnboardingPage />
                  </motion.div>
                }
              />
              
              <Route 
                path="/lesson/:lessonId" 
                element={
                  <PageErrorBoundary pageName="Lesson">
                    <motion.div
                      key="lesson"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                      className="page-container"
                    >
                      <LessonPage />
                      <Navigation />
                    </motion.div>
                  </PageErrorBoundary>
                }
              />
              
              <Route 
                path="/mushaf" 
                element={
                  <PageErrorBoundary pageName="Mushaf Reader">
                    <motion.div
                      key="mushaf"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MushafReaderPage />
                    </motion.div>
                  </PageErrorBoundary>
                }
              />
              
              <Route 
                path="/progress" 
                element={
                  <PageErrorBoundary pageName="Progress">
                    <motion.div
                      key="progress"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                      className="page-container"
                    >
                      <ProgressPage />
                      <Navigation />
                    </motion.div>
                  </PageErrorBoundary>
                }
              />
              
              <Route 
                path="/settings" 
                element={
                  <PageErrorBoundary pageName="Settings">
                    <motion.div
                      key="settings"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                      className="page-container"
                    >
                      <SettingsPage />
                      <Navigation />
                    </motion.div>
                  </PageErrorBoundary>
                }
              />
              
              {/* Traditional Mushaf Demo */}
              <Route 
                path="/demo/traditional-mushaf" 
                element={
                  <PageErrorBoundary pageName="Traditional Mushaf Demo">
                    <motion.div
                      key="traditional-mushaf-demo"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <TraditionalMushafDemo />
                    </motion.div>
                  </PageErrorBoundary>
                }
              />
              
              {/* Debug page for Arabic text rendering issues */}
              <Route 
                path="/debug/arabic" 
                element={
                  <PageErrorBoundary pageName="Arabic Debug">
                    <motion.div
                      key="arabic-debug"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ArabicDebugPage />
                    </motion.div>
                  </PageErrorBoundary>
                }
              />
              
              {/* Audio Navigation Test Page */}
              <Route 
                path="/test/audio-navigation" 
                element={
                  <PageErrorBoundary pageName="Audio Navigation Test">
                    <motion.div
                      key="audio-navigation-test"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                      className="p-6"
                    >
                      <AudioNavigationTest />
                    </motion.div>
                  </PageErrorBoundary>
                }
              />
              
              {/* Audio Navigation Demo Page */}
              <Route 
                path="/demo/audio-navigation" 
                element={
                  <PageErrorBoundary pageName="Audio Navigation Demo">
                    <motion.div
                      key="audio-navigation-demo"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <AudioNavigationDemo />
                    </motion.div>
                  </PageErrorBoundary>
                }
              />
              
              {/* Audio CORS/CSP Test Route removed after successful fix validation */}
                </Routes>
              </AnimatePresence>
            </Suspense>
          </div>
        </AudioNavigationProvider>
      </TranslationProvider>
    </AppErrorBoundary>
  )
}

export default App