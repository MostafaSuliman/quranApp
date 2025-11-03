// @ts-nocheck
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useProgressStore } from '../stores/progressStore'
import { useUIText } from '../utils/uiText'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<{ onNext: () => void; onPrev: () => void }>
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const { setUser } = useAuthStore()
  const { updatePreferences } = usePreferencesStore()
  const { initialize: initializeProgress } = useProgressStore()
  const { text: t } = useUIText()

  // Onboarding form data
  const [formData, setFormData] = useState({
    displayName: '',
    experienceLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    preferredReciter: '7', // Abdul Basit Abdul Samad
    dailyGoal: 5,
    showTransliteration: true,
    showTranslation: true,
    translationLanguage: 'en',
    notificationTime: '19:00'
  })

  const handleComplete = async () => {
    try {
      // Set user information
      setUser({
        id: 'guest-user',
        displayName: formData.displayName || 'Seeker of Knowledge',
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isGuest: true
      })

      // Update preferences
      updatePreferences({
        preferredReciter: formData.preferredReciter,
        showTransliteration: formData.showTransliteration,
        showTranslation: formData.showTranslation,
        translationLanguage: formData.translationLanguage,
        notificationTime: formData.notificationTime
      })

      // Initialize progress with daily goal
      await initializeProgress()

      // Navigate to home
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Quran Journey',
      description: 'Begin your beautiful journey of memorizing the Quran with guidance and gamification',
      component: WelcomeStep
    },
    {
      id: 'personal-info',
      title: 'Tell Us About Yourself',
      description: 'Help us personalize your learning experience',
      component: PersonalInfoStep
    },
    {
      id: 'experience',
      title: 'Your Quran Experience',
      description: 'This helps us customize your learning path',
      component: ExperienceStep
    },
    {
      id: 'preferences',
      title: 'Reading Preferences',
      description: 'Choose your preferred reciter and display options',
      component: PreferencesStep
    },
    {
      id: 'goals',
      title: 'Set Your Daily Goal',
      description: 'Start with a manageable daily target',
      component: GoalsStep
    }
  ]

  const currentStepData = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-gold-500 dark:to-gold-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepData.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            {/* Step header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepData.description}
              </p>
            </div>

            {/* Step component */}
            <currentStepData.component
              onNext={handleNext}
              onPrev={handlePrev}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )

  // Step components
  function WelcomeStep({ onNext }: { onNext: () => void; onPrev: () => void }) {
    return (
      <div className="text-center space-y-8">
        {/* Animated Quran icon */}
        <motion.div
          className="w-24 h-24 mx-auto mb-8"
          animate={{
            rotateY: [0, 15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg shadow-2xl transform perspective-1000">
            <div className="absolute inset-2 bg-white rounded-md shadow-inner flex items-center justify-center">
              <span className="text-3xl arabic-text text-primary-700">📖</span>
            </div>
          </div>
        </motion.div>

        {/* Bismillah */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-xl arabic-text text-primary-700 dark:text-gold-400">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 my-8">
          {[
            { icon: '🎮', text: t.gamifiedLearning },
            { icon: '🎵', text: t.beautifulAudio },
            { icon: '📊', text: t.trackProgressFeature },
            { icon: '💝', text: t.completelyFree }
          ].map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="card p-4 text-center"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onNext}
          className="w-full btn-primary"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          Begin Journey
        </motion.button>
      </div>
    )
  }

  function PersonalInfoStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
    return (
      <div className="space-y-6">
        <div className="card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What should we call you? (Optional)
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your preferred name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-400 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We'll call you "Seeker of Knowledge" if left blank
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Language for Translation
            </label>
            <select
              value={formData.translationLanguage}
              onChange={(e) => setFormData({ ...formData, translationLanguage: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-400 focus:border-transparent transition-colors"
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="ur">اردو (Urdu)</option>
              <option value="tr">Türkçe (Turkish)</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="ms">Bahasa Melayu</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPrev}
            className="flex-1 btn-secondary"
          >
            {t.back}
          </button>
          <button
            onClick={onNext}
            className="flex-1 btn-primary"
          >
            {t.continue}
          </button>
        </div>
      </div>
    )
  }

  function ExperienceStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
    const experiences = [
      {
        level: 'beginner' as const,
        title: t.newToQuran,
        description: t.justStartingJourney,
        icon: '🌱'
      },
      {
        level: 'intermediate' as const,
        title: t.someExperience,
        description: t.knowSomeArabic,
        icon: '🌿'
      },
      {
        level: 'advanced' as const,
        title: t.experienced,
        description: t.comfortableWithArabic,
        icon: '🌳'
      }
    ]

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          {experiences.map((exp) => (
            <motion.button
              key={exp.level}
              onClick={() => setFormData({ ...formData, experienceLevel: exp.level })}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                formData.experienceLevel === exp.level
                  ? 'border-primary-500 dark:border-gold-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-gold-500'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{exp.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {exp.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPrev}
            className="flex-1 btn-secondary"
          >
            {t.back}
          </button>
          <button
            onClick={onNext}
            className="flex-1 btn-primary"
          >
            {t.continue}
          </button>
        </div>
      </div>
    )
  }

  function PreferencesStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
    const reciters = [
      { id: '7', name: 'Abdul Basit Abdul Samad', style: t.murattal },
      { id: '1', name: 'Mishary Rashid Alafasy', style: t.clearMelodious },
      { id: '2', name: 'Abdur Rahman As-Sudais', style: t.madinahStyle },
      { id: '3', name: 'Maher Al Mueaqly', style: t.emotional },
      { id: '4', name: 'Saad Al Ghamidi', style: t.slowClear }
    ]

    return (
      <div className="space-y-6">
        <div className="card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t.choosePreferredReciter}
            </label>
            <div className="space-y-2">
              {reciters.map((reciter) => (
                <button
                  key={reciter.id}
                  onClick={() => setFormData({ ...formData, preferredReciter: reciter.id })}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    formData.preferredReciter === reciter.id
                      ? 'border-primary-500 dark:border-gold-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {reciter.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {reciter.style}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.displayOptions}
            </h3>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.showTransliteration}
                onChange={(e) => setFormData({ ...formData, showTransliteration: e.target.checked })}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t.showTransliterationPhonetic}
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.showTranslation}
                onChange={(e) => setFormData({ ...formData, showTranslation: e.target.checked })}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t.showTranslationText}
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPrev}
            className="flex-1 btn-secondary"
          >
            {t.back}
          </button>
          <button
            onClick={onNext}
            className="flex-1 btn-primary"
          >
            {t.continue}
          </button>
        </div>
      </div>
    )
  }

  function GoalsStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
    const goalOptions = [
      { value: 3, label: '3 Ayahs', description: t.lightAndSteady, time: '5-10 min' },
      { value: 5, label: '5 Ayahs', description: t.recommendedBeginners, time: '10-15 min' },
      { value: 10, label: '10 Ayahs', description: t.goodProgress, time: '15-25 min' },
      { value: 15, label: '15 Ayahs', description: t.ambitious, time: '25-35 min' },
      { value: 20, label: '20 Ayahs', description: t.expertLevel, time: '35-45 min' }
    ]

    return (
      <div className="space-y-6">
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t.dailyLearningGoalSection}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t.chooseManageableTarget}
            </p>
            
            <div className="space-y-3">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, dailyGoal: option.value })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.dailyGoal === option.value
                      ? 'border-primary-500 dark:border-gold-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                    <div className="text-sm text-primary-600 dark:text-gold-400">
                      {option.time}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.dailyReminderOptional}
            </label>
            <input
              type="time"
              value={formData.notificationTime}
              onChange={(e) => setFormData({ ...formData, notificationTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-400 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t.recommendAfterMaghrib}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPrev}
            className="flex-1 btn-secondary"
          >
            {t.back}
          </button>
          <motion.button
            onClick={onNext}
            className="flex-1 btn-primary relative overflow-hidden"
            whileTap={{ scale: 0.98 }}
          >
            <span>Start Learning 🎉</span>
          </motion.button>
        </div>
      </div>
    )
  }
}

export default OnboardingPage
