import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAudioNavigationStore, NavigationAction } from '../stores/audioNavigationStore'
import { useAudioStore } from '../stores/audioStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useUIText } from '../utils/uiText'

interface AudioNavigationModalProps {
  isOpen: boolean
  onClose: () => void
  currentPage: string
  targetPage: string
  onAction: (action: NavigationAction, remember?: boolean) => void
}

const AudioNavigationModal: React.FC<AudioNavigationModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  targetPage,
  onAction
}) => {
  const { text: uiText } = useUIText()
  const { preferences } = usePreferencesStore()
  const {
    currentAyahNumber,
    currentSurahNumber,
    currentReciter,
    currentTime,
    duration
  } = useAudioStore()
  const { defaultAction, updateDefaultAction } = useAudioNavigationStore()

  const [selectedAction, setSelectedAction] = useState<NavigationAction>('ask')
  const [rememberChoice, setRememberChoice] = useState(false)

  // Auto-select based on saved preference
  useEffect(() => {
    if (defaultAction && defaultAction !== 'ask') {
      setSelectedAction(defaultAction)
    }
  }, [defaultAction])

  // Get page display names
  const getPageDisplayName = (path: string) => {
    if (path.includes('/lesson')) return uiText.learn
    if (path.includes('/mushaf')) return uiText.mushaf
    if (path.includes('/progress')) return uiText.progress
    if (path.includes('/settings')) return uiText.settings
    if (path === '/') return uiText.home
    return path
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Handle action selection
  const handleAction = (action: NavigationAction) => {
    if (rememberChoice && action !== 'ask') {
      updateDefaultAction(action)
    }
    onAction(action, rememberChoice)
  }

  // Action configurations
  const actions = [
    {
      key: 'stop' as NavigationAction,
      title: preferences.uiLanguage === 'ar' ? 'إيقاف الصوت' : 'Stop Audio',
      description: preferences.uiLanguage === 'ar' 
        ? 'إيقاف التشغيل والانتقال للصفحة الجديدة' 
        : 'Stop playback and navigate to new page',
      icon: StopIcon,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      key: 'continue' as NavigationAction,
      title: preferences.uiLanguage === 'ar' ? 'متابعة التشغيل' : 'Continue Playing',
      description: preferences.uiLanguage === 'ar' 
        ? 'الاحتفاظ بالصوت أثناء التنقل' 
        : 'Keep audio playing while navigating',
      icon: PlayIcon,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      key: 'pause' as NavigationAction,
      title: preferences.uiLanguage === 'ar' ? 'إيقاف مؤقت' : 'Pause Audio',
      description: preferences.uiLanguage === 'ar' 
        ? 'إيقاف مؤقت والانتقال للصفحة الجديدة' 
        : 'Pause playback and navigate to new page',
      icon: PauseIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    }
  ]

  // Modal animation variants
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Islamic Pattern Header */}
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-6 text-white">
              {/* Islamic geometric pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="currentColor"/>
                      <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#islamic-pattern)"/>
                </svg>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Header content */}
              <div className="relative">
                <div className="flex items-center space-x-3 mb-2">
                  <SpeakerWaveIcon className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {preferences.uiLanguage === 'ar' ? 'تشغيل الصوت' : 'Audio Playing'}
                    </h2>
                    <p className="text-emerald-100 text-sm">
                      {preferences.uiLanguage === 'ar' 
                        ? 'ما الذي تريد فعله بالصوت؟' 
                        : 'What would you like to do with the audio?'}
                    </p>
                  </div>
                </div>

                {/* Navigation context */}
                <div className="text-sm text-emerald-100 bg-white/10 rounded-lg p-3 mt-3">
                  <p className="mb-1">
                    <span className="font-medium">
                      {preferences.uiLanguage === 'ar' ? 'من: ' : 'From: '}
                    </span>
                    {getPageDisplayName(currentPage)}
                  </p>
                  <p>
                    <span className="font-medium">
                      {preferences.uiLanguage === 'ar' ? 'إلى: ' : 'To: '}
                    </span>
                    {getPageDisplayName(targetPage)}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Current audio info */}
              {(currentSurahNumber || currentAyahNumber) && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {preferences.uiLanguage === 'ar' ? 'قيد التشغيل الآن' : 'Currently Playing'}
                    </span>
                  </div>
                  
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {currentSurahNumber && (
                      <span>
                        {preferences.uiLanguage === 'ar' ? 'سورة ' : 'Surah '}{currentSurahNumber}
                      </span>
                    )}
                    {currentAyahNumber && (
                      <span>
                        {preferences.uiLanguage === 'ar' ? '، آية ' : ', Ayah '}{currentAyahNumber}
                      </span>
                    )}
                  </div>
                  
                  {currentReciter && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {preferences.uiLanguage === 'ar' ? 'القارئ: ' : 'Reciter: '}{currentReciter.name}
                    </div>
                  )}
                  
                  {/* Progress */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Action options */}
              <div className="space-y-3 mb-6">
                {actions.map((action) => {
                  const Icon = action.icon
                  const isSelected = selectedAction === action.key
                  
                  return (
                    <motion.button
                      key={action.key}
                      onClick={() => setSelectedAction(action.key)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected 
                          ? `${action.bgColor} ${action.borderColor} ${action.color}`
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${isSelected ? action.bgColor : 'bg-gray-200 dark:bg-gray-600'}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? action.color : 'text-gray-600 dark:text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium mb-1 ${isSelected ? action.color : 'text-gray-900 dark:text-gray-100'}`}>
                            {action.title}
                          </h3>
                          <p className={`text-sm ${isSelected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                            {action.description}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`p-1 rounded-full ${action.bgColor}`}
                          >
                            <CheckIcon className={`w-4 h-4 ${action.color}`} />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Remember choice */}
              <div className="mb-6">
                <motion.button
                  onClick={() => setRememberChoice(!rememberChoice)}
                  className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-5 h-5 rounded border-2 transition-colors ${
                    rememberChoice 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {rememberChoice && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center h-full"
                      >
                        <CheckIcon className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {preferences.uiLanguage === 'ar' 
                      ? 'تذكر اختياري للمرات القادمة' 
                      : 'Remember my choice for future navigation'}
                  </span>
                </motion.button>

                {rememberChoice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                  >
                    <div className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        {preferences.uiLanguage === 'ar' 
                          ? 'يمكنك تغيير هذا الإعداد في صفحة الإعدادات لاحقاً'
                          : 'You can change this setting in the Settings page later'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <motion.button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {preferences.uiLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
                </motion.button>
                
                <motion.button
                  onClick={() => handleAction(selectedAction)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {preferences.uiLanguage === 'ar' ? 'تنفيذ' : 'Continue'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AudioNavigationModal