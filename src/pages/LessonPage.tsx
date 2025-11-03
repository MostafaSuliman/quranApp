// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuranStore } from '../stores/quranStore'
import { useProgressStore } from '../stores/progressStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useAudioStore } from '../stores/audioStore'
import { useUIText } from '../utils/uiText'
import { Ayah } from '../types/quran'
import AyahDisplay from '../components/AyahDisplay'
import QuranText from '../components/QuranText'

interface LessonExercise {
  id: string
  type: 'listen' | 'recite' | 'translate' | 'match' | 'complete'
  title: string
  instruction: string
  ayah: Ayah
  options?: string[]
  correctAnswer?: string
}

const LessonPage: React.FC = () => {
  const navigate = useNavigate()
  const { lessonId } = useParams()
  const { currentSurah, currentAyahIndex, ayahs, loadAyahs } = useQuranStore()
  const { addXP, completeLesson, updateStreak } = useProgressStore()
  const { preferences } = usePreferencesStore()
  const { text: t, isRTL } = useUIText()

  const [currentExercise, setCurrentExercise] = useState(0)
  const [exercises, setExercises] = useState<LessonExercise[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [lessonComplete, setLessonComplete] = useState(false)
  const [score, setScore] = useState(0)
  const { 
    loadAyahAudio, 
    togglePlayPause, 
    isPlaying: audioIsPlaying, 
    currentReciter,
    cleanup: cleanupAudio 
  } = useAudioStore()

  useEffect(() => {
    initializeLesson()
    
    // Cleanup audio when component unmounts
    return () => {
      cleanupAudio()
    }
  }, [lessonId, cleanupAudio])

  // Generate exercises when ayahs are loaded
  useEffect(() => {
    if (ayahs.length > 0) {
      generateExercises(ayahs.slice(0, 5))
    }
  }, [ayahs])

  const initializeLesson = async () => {
    try {
      // For current lesson, use current position or start from beginning
      const surahNumber = currentSurah || 1
      // Convert 0-based currentAyahIndex to 1-based startAyah
      const startAyah = currentAyahIndex !== null ? currentAyahIndex + 1 : 1
      
      // Load 5 ayahs for the lesson
      await loadAyahs(surahNumber, startAyah, 5)
      
      // The ayahs will be updated in the store via useEffect below
    } catch (error) {
      console.error('Failed to initialize lesson:', error)
    }
  }

  const generateExercises = (lessonAyahs: Ayah[]) => {
    const exerciseTypes: LessonExercise['type'][] = ['listen', 'translate', 'complete', 'match', 'recite']
    const generatedExercises: LessonExercise[] = []

    lessonAyahs.forEach((ayah, index) => {
      const exerciseType = exerciseTypes[index % exerciseTypes.length]
      
      switch (exerciseType) {
        case 'listen':
          generatedExercises.push({
            id: `listen-${ayah.number}`,
            type: 'listen',
            title: t.listenLearn,
            instruction: t.followArabicText,
            ayah,
          })
          break
          
        case 'translate':
          generatedExercises.push({
            id: `translate-${ayah.number}`,
            type: 'translate',
            title: t.translationMatch,
            instruction: t.selectCorrectTranslation,
            ayah,
            options: generateTranslationOptions(ayah),
            correctAnswer: ayah.text
          })
          break
          
        case 'complete':
          generatedExercises.push({
            id: `complete-${ayah.number}`,
            type: 'complete',
            title: t.completeVerse,
            instruction: t.fillMissingWords,
            ayah: createIncompleteAyah(ayah),
            correctAnswer: extractMissingWord(ayah)
          })
          break
          
        case 'match':
          generatedExercises.push({
            id: `match-${ayah.number}`,
            type: 'match',
            title: t.matchMeaning,
            instruction: t.matchArabicTranslation,
            ayah,
            options: generateArabicOptions(ayah),
            correctAnswer: ayah.text
          })
          break
          
        case 'recite':
          generatedExercises.push({
            id: `recite-${ayah.number}`,
            type: 'recite',
            title: t.recitePractice,
            instruction: t.practiceRecitation,
            ayah,
          })
          break
      }
    })

    setExercises(generatedExercises)
  }

  const generateTranslationOptions = (ayah: Ayah): string[] => {
    // In a real app, you'd fetch multiple translations and create distractors
    const options = [
      ayah.text,
      "This is a sample distractor translation",
      "Another incorrect translation option",
      "A third incorrect choice"
    ]
    return shuffleArray(options)
  }

  const generateArabicOptions = (ayah: Ayah): string[] => {
    // In a real app, you'd use similar ayahs as distractors
    const options = [
      ayah.text,
      "وَإِذَا قِيلَ لَهُمُ اتَّبِعُوا مَا أَنزَلَ اللَّهُ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ"
    ]
    return shuffleArray(options)
  }

  const createIncompleteAyah = (ayah: Ayah): Ayah => {
    const words = ayah.text.split(' ')
    const missingWordIndex = Math.floor(words.length / 2)
    words[missingWordIndex] = '___'
    return { ...ayah, text: words.join(' ') }
  }

  const extractMissingWord = (ayah: Ayah): string => {
    const words = ayah.text.split(' ')
    return words[Math.floor(words.length / 2)]
  }

  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const playAudio = async (ayah: Ayah) => {
    try {
      if (!currentReciter) {
        console.warn('No reciter selected for audio playback')
        return
      }
      
      // Use the audio store to load and play ayah audio
      await loadAyahAudio(ayah.surah, ayah.numberInSurah, currentReciter)
      await togglePlayPause()
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    const exercise = exercises[currentExercise]
    const correct = answer === exercise.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)
    
    if (correct) {
      setScore(score + 20) // 20 XP per correct answer
    }
  }

  const handleContinue = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setSelectedAnswer('')
      setShowResult(false)
      setIsCorrect(false)
    } else {
      completeLessonFlow()
    }
  }

  const completeLessonFlow = async () => {
    const totalXP = score + (exercises.length * 5) // Bonus XP for completion
    await addXP(totalXP)
    await completeLesson(lessonId || 'lesson_1', totalXP)
    await updateStreak()
    setLessonComplete(true)
  }

  const handleLessonComplete = () => {
    navigate('/')
  }

  if (lessonComplete) {
    return <LessonCompleteScreen score={score} onComplete={handleLessonComplete} />
  }

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full bg-primary-600 dark:bg-gold-400 rounded-lg opacity-20" />
          </motion.div>
          <p className="text-primary-700 dark:text-gold-400 font-medium">
            {t.loading}...
          </p>
          <QuranText
            text="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
            style="bismillah"
            className="mt-4 text-primary-600 dark:text-gold-400"
          />
        </div>
      </div>
    )
  }

  const exercise = exercises[currentExercise]
  const progressPercentage = ((currentExercise + 1) / exercises.length) * 100

  // Safety check - if no exercise is available, show loading
  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 pb-20">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 dark:border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-primary-700 dark:text-gold-400 font-medium">
              {t.loading}...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      <div className={`max-w-md mx-auto px-4 py-8 ${isRTL ? 'rtl-content' : 'ltr-content'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
          >
            <span className="text-xl">←</span>
          </button>
          
          <div className="flex-1 mx-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.exerciseOf.replace('{current}', String(currentExercise + 1)).replace('{total}', String(exercises.length))}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-gold-500 dark:to-gold-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-primary-700 dark:text-gold-400">
              {score} XP
            </p>
          </div>
        </div>

        {/* Exercise Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Exercise Header */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {exercise.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {exercise.instruction}
              </p>
            </div>

            {/* Ayah Display */}
            <AyahDisplay
              ayah={exercise.ayah}
              showTranslation={preferences.showTranslation && exercise.type !== 'translate' && exercise.type !== 'match'}
              showTransliteration={preferences.showTransliteration}
              showAyahInfo={true}
              showAyahNumber={true}
              isPlaying={audioIsPlaying}
              size="large"
              style="card"
              onPlay={() => playAudio(exercise.ayah)}
              animate={true}
              className="mx-auto"
            />

            {/* Exercise-specific content */}
            <ExerciseContent
              exercise={exercise}
              selectedAnswer={selectedAnswer}
              onAnswer={handleAnswer}
              showResult={showResult}
              isCorrect={isCorrect}
              t={t}
            />

            {/* Continue button */}
            {showResult && (
              <motion.button
                onClick={handleContinue}
                className="w-full btn-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentExercise < exercises.length - 1 ? t.continue : t.lessonComplete + ' 🎉'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Exercise-specific components
const ExerciseContent: React.FC<{
  exercise: LessonExercise
  selectedAnswer: string
  onAnswer: (answer: string) => void
  showResult: boolean
  isCorrect: boolean
  t: any  // UIText object from useUIText hook
}> = ({ exercise, selectedAnswer, onAnswer, showResult, isCorrect, t }) => {
  switch (exercise.type) {
    case 'listen':
      return (
        <div className="text-center">
          <motion.button
            onClick={() => onAnswer('listened')}
            className="btn-primary"
            whileTap={{ scale: 0.98 }}
            disabled={showResult}
          >
            {t.done}
          </motion.button>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg"
            >
              <p className="text-green-700 dark:text-green-400 font-medium">
                {t.excellentWork}! +20 {t.totalXP}
              </p>
            </motion.div>
          )}
        </div>
      )

    case 'translate':
    case 'match':
      return (
        <div className="space-y-3">
          {exercise.options?.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => !showResult && onAnswer(option)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                showResult
                  ? option === exercise.correctAnswer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : option === selectedAnswer
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                  : selectedAnswer === option
                  ? 'border-primary-500 dark:border-gold-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
              whileTap={{ scale: 0.98 }}
              disabled={showResult}
            >
              {option}
            </motion.button>
          ))}
          
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-100 dark:bg-green-900/20'
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}
            >
              <p className={`font-medium ${
                isCorrect
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {isCorrect ? 'Correct! +20 XP' : 'Not quite right. The correct answer is highlighted above.'}
              </p>
            </motion.div>
          )}
        </div>
      )

    case 'complete':
      return (
        <div className="space-y-4">
          <input
            type="text"
            value={selectedAnswer}
            onChange={(e) => !showResult && onAnswer(e.target.value)}
            placeholder="Enter the missing word..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={showResult}
          />
          
          {!showResult && selectedAnswer.trim() && (
            <button
              onClick={() => onAnswer(selectedAnswer)}
              className="w-full btn-primary"
            >
              Submit Answer
            </button>
          )}
          
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-100 dark:bg-green-900/20'
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}
            >
              <p className={`font-medium ${
                isCorrect
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {isCorrect 
                  ? `${t.excellentWork}! +20 ${t.totalXP}` 
                  : `${t.correctAnswer}: ${exercise.correctAnswer}`
                }
              </p>
            </motion.div>
          )}
        </div>
      )

    case 'recite':
      return (
        <div className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t.practiceRecitation}
          </p>
          
          <motion.button
            onClick={() => onAnswer('practiced')}
            className="btn-primary"
            whileTap={{ scale: 0.98 }}
            disabled={showResult}
          >
            {t.done}
          </motion.button>
          
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg"
            >
              <p className="text-green-700 dark:text-green-400 font-medium">
                {t.excellentWork}! +20 {t.totalXP}
              </p>
            </motion.div>
          )}
        </div>
      )

    default:
      return null
  }
}

// Lesson completion screen
const LessonCompleteScreen: React.FC<{
  score: number
  onComplete: () => void
}> = ({ score, onComplete }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto px-4 text-center"
      >
        <div className="card p-8 space-y-6">
          {/* Celebration animation */}
          <motion.div
            className="text-6xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🎉
          </motion.div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Lesson Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Alhamdulillah! You've completed today's lesson.
            </p>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <p className="text-lg font-semibold text-primary-700 dark:text-gold-400">
              +{score} XP Earned
            </p>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Exercises completed:</span>
              <span className="font-medium text-gray-900 dark:text-white">5/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Streak maintained:</span>
              <span className="font-medium text-green-600 dark:text-green-400">✓</span>
            </div>
          </div>
          
          <motion.button
            onClick={onComplete}
            className="w-full btn-primary"
            whileTap={{ scale: 0.98 }}
          >
            {t.backToHome}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default LessonPage
