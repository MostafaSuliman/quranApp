import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemorization } from '../hooks/useMemorization'
import { MemorizationProgress } from './AyahHighlighter'

interface MemorizationControlsProps {
  surahNumber: number
  className?: string
  compact?: boolean
}

const MemorizationControls: React.FC<MemorizationControlsProps> = ({
  surahNumber,
  className = '',
  compact = false
}) => {
  const [showDetails, setShowDetails] = useState(false)
  
  const {
    isMemorizationMode,
    toggleMemorizationMode,
    selectedAyahs,
    hideSelectedAyahs,
    revealAllAyahs,
    clearSelection,
    progress,
    currentSession,
    startMemorizationSession,
    endMemorizationSession
  } = useMemorization(surahNumber)

  const hasSelection = selectedAyahs.size > 0

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Memorization Mode Toggle */}
        <motion.button
          onClick={toggleMemorizationMode}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isMemorizationMode 
              ? 'bg-purple-500' 
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
          whileTap={{ scale: 0.95 }}
          title="Toggle Memorization Mode"
        >
          <motion.div
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
            animate={{ x: isMemorizationMode ? 24 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>

        {/* Quick actions when in memorization mode */}
        <AnimatePresence>
          {isMemorizationMode && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center space-x-2"
            >
              {hasSelection && (
                <motion.button
                  onClick={hideSelectedAyahs}
                  className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  Hide ({selectedAyahs.size})
                </motion.button>
              )}
              
              <motion.button
                onClick={revealAllAyahs}
                className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Reveal All
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      layout
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Memorization Tools
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hide ayahs and test your memorization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Session indicator */}
            {currentSession && (
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Active Session</span>
              </div>
            )}

            {/* Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isMemorizationMode ? 'On' : 'Off'}
              </span>
              <motion.button
                onClick={toggleMemorizationMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isMemorizationMode 
                    ? 'bg-purple-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                  animate={{ x: isMemorizationMode ? 28 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {isMemorizationMode ? (
                    <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isMemorizationMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Controls */}
            <div className="px-6 py-4 space-y-4">
              {/* Selection info */}
              {hasSelection && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        {selectedAyahs.size} ayah{selectedAyahs.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={hideSelectedAyahs}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Hide Selected
                      </motion.button>
                      <motion.button
                        onClick={clearSelection}
                        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={revealAllAyahs}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Reveal All</span>
                </motion.button>

                <motion.button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Progress</span>
                </motion.button>
              </div>

              {/* Session controls */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Session: {currentSession ? 'Active' : 'None'}
                </div>
                <div className="flex items-center space-x-2">
                  {currentSession ? (
                    <motion.button
                      onClick={endMemorizationSession}
                      className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      End Session
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => startMemorizationSession(surahNumber)}
                      className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Session
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress details */}
            <AnimatePresence>
              {showDetails && progress && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4"
                >
                  <MemorizationProgress
                    current={progress.hiddenAyahs}
                    total={progress.totalAyahs}
                    mastered={progress.masteredAyahs}
                  />
                  
                  {/* Session stats */}
                  {currentSession && (
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {currentSession.ayahsStudied.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Ayahs Studied
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {currentSession.totalHides}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Total Hides
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {Math.round(currentSession.averageRevealTime / 1000)}s
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Avg. Reveal
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions when not in memorization mode */}
      {!isMemorizationMode && (
        <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm">
            Enable memorization mode to start hiding ayahs and testing your memory.
          </p>
          <p className="text-xs mt-1 opacity-75">
            Click/tap ayahs to select • Double-click to hide • Use keyboard shortcuts
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default MemorizationControls