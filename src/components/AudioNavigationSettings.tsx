import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  SpeakerWaveIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  QuestionMarkCircleIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useAudioNavigationStore } from '../stores/audioNavigationStore'

const AudioNavigationSettings: React.FC = () => {
  // const uiText = useUIText() // Unused
  const { preferences, updateAudioNavigationSettings } = usePreferencesStore()
  const { getNavigationStats } = useAudioNavigationStore()
  const [showStats, setShowStats] = useState(false)
  
  const stats = getNavigationStats()

  // Navigation action options
  const actionOptions = [
    {
      value: 'ask' as const,
      title: preferences.uiLanguage === 'ar' ? 'السؤال دائماً' : 'Always Ask',
      description: preferences.uiLanguage === 'ar' 
        ? 'إظهار نافذة الخيارات عند كل انتقال' 
        : 'Show options dialog for every navigation',
      icon: QuestionMarkCircleIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      value: 'continue' as const,
      title: preferences.uiLanguage === 'ar' ? 'متابعة التشغيل' : 'Continue Playing',
      description: preferences.uiLanguage === 'ar' 
        ? 'الاحتفاظ بالصوت أثناء التنقل' 
        : 'Keep audio playing during navigation',
      icon: PlayIcon,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      value: 'pause' as const,
      title: preferences.uiLanguage === 'ar' ? 'إيقاف مؤقت' : 'Pause Audio',
      description: preferences.uiLanguage === 'ar' 
        ? 'إيقاف مؤقت عند الانتقال' 
        : 'Pause audio during navigation',
      icon: PauseIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      value: 'stop' as const,
      title: preferences.uiLanguage === 'ar' ? 'إيقاف الصوت' : 'Stop Audio',
      description: preferences.uiLanguage === 'ar' 
        ? 'إيقاف التشغيل نهائياً عند الانتقال' 
        : 'Stop audio completely during navigation',
      icon: StopIcon,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ]

  const handleActionChange = (action: 'ask' | 'stop' | 'continue' | 'pause') => {
    updateAudioNavigationSettings({ audioNavigationAction: action })
  }

  const handleModalToggle = () => {
    updateAudioNavigationSettings({ 
      showAudioNavigationModal: !preferences.showAudioNavigationModal 
    })
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
          <SpeakerWaveIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {preferences.uiLanguage === 'ar' ? 'إعدادات التنقل الصوتي' : 'Audio Navigation Settings'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {preferences.uiLanguage === 'ar' 
              ? 'تحديد سلوك الصوت عند التنقل بين الصفحات' 
              : 'Control audio behavior when navigating between pages'}
          </p>
        </div>
      </div>

      {/* Default Action Setting */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
          {preferences.uiLanguage === 'ar' ? 'الإجراء الافتراضي' : 'Default Action'}
        </h4>
        
        <div className="space-y-2">
          {actionOptions.map((option) => {
            const Icon = option.icon
            const isSelected = preferences.audioNavigationAction === option.value
            
            return (
              <motion.button
                key={option.value}
                onClick={() => handleActionChange(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected 
                    ? `${option.bgColor} border-current ${option.color}`
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected ? option.bgColor : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? option.color : 'text-gray-600 dark:text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className={`font-medium ${isSelected ? option.color : 'text-gray-900 dark:text-gray-100'}`}>
                      {option.title}
                    </h5>
                    <p className={`text-sm ${isSelected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`p-1 rounded-full ${option.bgColor}`}
                    >
                      <CheckIcon className={`w-4 h-4 ${option.color}`} />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Show Modal Setting */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-1">
              {preferences.uiLanguage === 'ar' ? 'إظهار نافذة التأكيد' : 'Show Confirmation Dialog'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {preferences.uiLanguage === 'ar' 
                ? 'إظهار نافذة للتأكيد حتى لو تم تحديد إجراء افتراضي' 
                : 'Show dialog even when default action is set'}
            </p>
          </div>
          
          <motion.button
            onClick={handleModalToggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              preferences.showAudioNavigationModal 
                ? 'bg-emerald-500' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
              animate={{ 
                x: preferences.showAudioNavigationModal ? 24 : 2 
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
        
        {preferences.audioNavigationAction !== 'ask' && !preferences.showAudioNavigationModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          >
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {preferences.uiLanguage === 'ar' 
                  ? 'سيتم تطبيق الإجراء الافتراضي تلقائياً بدون إظهار نافذة تأكيد' 
                  : 'Default action will be applied automatically without showing confirmation dialog'}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Statistics */}
      <div>
        <motion.button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {preferences.uiLanguage === 'ar' ? 'إحصائيات التنقل' : 'Navigation Statistics'}
            </span>
          </div>
          <motion.div
            animate={{ rotate: showStats ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.button>

        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalNavigations}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {preferences.uiLanguage === 'ar' ? 'إجمالي التنقلات' : 'Total Navigations'}
                </div>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.commonRoutes.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {preferences.uiLanguage === 'ar' ? 'مسارات شائعة' : 'Common Routes'}
                </div>
              </div>
            </div>

            {stats.commonRoutes.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {preferences.uiLanguage === 'ar' ? 'المسارات الأكثر استخداماً:' : 'Most Used Routes:'}
                </h5>
                <div className="space-y-1">
                  {stats.commonRoutes.slice(0, 3).map((route) => (
                    <div
                      key={`${route.from}-${route.to}`}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {route.from} → {route.to}
                      </span>
                      <span className="text-gray-500 dark:text-gray-500">
                        {route.count}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Reset Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <motion.button
          onClick={() => updateAudioNavigationSettings({
            audioNavigationAction: 'ask',
            showAudioNavigationModal: true
          })}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {preferences.uiLanguage === 'ar' ? 'إعادة تعيين إلى الافتراضي' : 'Reset to Defaults'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default AudioNavigationSettings
