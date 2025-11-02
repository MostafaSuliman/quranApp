import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useProgressStore } from '../stores/progressStore'
import { useQuranStore } from '../stores/quranStore'
import { useUIText } from '../utils/uiText'
import QuranText from '../components/QuranText'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { text: t, isRTL } = useUIText()
  const { user } = useAuthStore()
  const { streak, dailyGoal, totalXP, level, getTodaysStats } = useProgressStore()
  const { initialize: initializeQuran } = useQuranStore()

  useEffect(() => {
    // Initialize Quran data when component mounts
    initializeQuran()
  }, [initializeQuran])

  const todaysStats = getTodaysStats()
  const progressPercentage = (todaysStats.ayahsStudied / dailyGoal) * 100

  const handleStartLesson = () => {
    navigate('/lesson/current')
  }

  const handleContinueReading = () => {
    navigate('/mushaf')
  }

  const handleTraditionalMushafDemo = () => {
    navigate('/demo/traditional-mushaf')
  }

  return (
    <div className="min-h-[100dvh] safe-area-pt safe-area-pb bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 pb-24">
      <div className="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl px-4 md:px-8 pt-8">
        {/* Header with greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="mb-4">
            <span className="text-lg text-gray-600 dark:text-gray-400">{t.assalamuAlaikum},</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.displayName || t.seekerOfKnowledge}
            </h1>
          </div>
          
          {/* Bismillah */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-2"
          >
            <QuranText
              text="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
              style="bismillah"
              size="medium"
              className="text-primary-700 dark:text-gold-400"
            />
          </motion.div>
          <p className="text-sm text-gray-600 dark:text-gray-400 ltr-text">
            {t.inTheNameOfAllah}
          </p>
        </motion.div>

        {/* Streak and Level Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex gap-4 mb-6"
        >
          {/* Streak Card */}
          <div className="flex-1 card p-4 text-center">
            <motion.div
              className="text-3xl mb-2"
              animate={{
                scale: streak > 0 ? [1, 1.2, 1] : 1,
                rotate: streak > 0 ? [0, -5, 5, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: streak > 0 ? Infinity : 0,
                repeatDelay: 3
              }}
            >
              🔥
            </motion.div>
            <p className="text-2xl font-bold text-primary-700 dark:text-gold-400">
              {streak}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.dayStreak}</p>
          </div>

          {/* Level Card */}
          <div className="flex-1 card p-4 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-2xl font-bold text-primary-700 dark:text-gold-400">
              {level}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.level}</p>
          </div>

          {/* XP Card */}
          <div className="flex-1 card p-4 text-center">
            <div className="text-3xl mb-2">💎</div>
            <p className="text-2xl font-bold text-primary-700 dark:text-gold-400">
              {totalXP}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalXP}</p>
          </div>
        </motion.div>

        {/* Daily Goal Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.todaysGoal}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {todaysStats.ayahsStudied} / {dailyGoal} ayahs
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-gold-500 dark:to-gold-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {progressPercentage >= 100 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <span className="text-green-600 dark:text-green-400 font-medium">
                {t.alhamdulillahGoalComplete}
              </span>
            </motion.div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">
              {dailyGoal - todaysStats.ayahsStudied} {t.moreAyahsToGoal}
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4 mb-8"
        >
          {/* Start Today's Lesson */}
          <motion.button
            onClick={handleStartLesson}
            className="w-full btn-primary relative overflow-hidden group
                       min-h-[56px] touch-manipulation active:scale-95"
            whileTap={{ scale: 0.98 }}
            aria-label="Start today's Quran lesson"
            role="button"
            tabIndex={0}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
            />
            <div className="relative flex items-center justify-center space-x-3">
              <span className="text-2xl" aria-hidden="true">📚</span>
              <span className="font-semibold">{t.startTodaysLesson}</span>
            </div>
          </motion.button>

          {/* Continue Reading */}
          <motion.button
            onClick={handleContinueReading}
            className="w-full btn-secondary min-h-[56px] touch-manipulation active:scale-95"
            whileTap={{ scale: 0.98 }}
            aria-label="Continue reading Quran"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl" aria-hidden="true">📖</span>
              <span className="font-semibold">{t.continueReading}</span>
            </div>
          </motion.button>

          {/* Traditional Mushaf Demo */}
          <motion.button
            onClick={handleTraditionalMushafDemo}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700
                       text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg
                       hover:shadow-xl transform hover:scale-105 min-h-[56px] touch-manipulation active:scale-95"
            whileTap={{ scale: 0.98 }}
            aria-label="View traditional Mushaf demo"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl" aria-hidden="true">🕌</span>
              <span className="font-semibold">{t.traditionalMushafDemo}</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Motivational Hadith */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="card p-6 text-center bg-gradient-to-br from-primary-500 to-primary-600 text-white"
        >
          <div className="text-3xl mb-4">🤲</div>
          
          {/* Arabic Hadith */}
          <QuranText
            text="اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ"
            style="regular"
            size="medium"
            className="text-white mb-4 leading-loose"
          />
          
          {/* English Translation */}
          <p className="text-sm opacity-90 mb-3 ltr-text italic">
            {t.readQuranHadith}
          </p>
          
          {/* Citation */}
          <div className="text-xs opacity-80 space-y-1">
            <p className="rtl-text">حديث شريف - صحيح مسلم</p>
            <p className="ltr-text">- {t.prophetMuhammadPbuh} ({t.sahihMuslim})</p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6 grid grid-cols-2 gap-4"
        >
          <div className="card p-4 text-center">
            <div className="text-xl mb-1">📊</div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {todaysStats.timeSpent} min
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.todayStats}</p>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-xl mb-1">🏆</div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {todaysStats.lessonsCompleted}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t.lessonStats}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HomePage
