import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useAuthStore, User, VerificationStatus, SocialProvider, SocialAccountLink } from '../stores/authStore'
import { useProgressStore } from '../stores/progressStore'
import { useAudioStore } from '../stores/audioStore'
import { useUIText, UIText } from '../utils/uiText'
import { useAudioSync } from '../hooks/useAudioSync'
import ErrorBoundaryTest from '../components/ErrorBoundaryTest'
import AudioSettingsTest from '../components/AudioSettingsTest'
import LanguageToggle from '../components/LanguageToggle'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { text: t, isRTL } = useUIText()
  const {
    preferences,
    updateReciter,
    updatePlaybackSpeed,
    updateTranslationSettings,
    updateUILanguage,
    updateNotificationTime,
    updateReadingMode,
    toggleDarkMode,
    toggleAnimations,
    resetToDefaults
  } = usePreferencesStore()
  
  const {
    user,
    logout,
    isLoading: authLoading,
    verificationStatus,
    verificationEmail,
    verificationError,
    verificationResendAvailableAt,
    startEmailVerification,
    verifyEmailCode,
    resendVerification,
    socialAccounts,
    socialLinkStatus,
    linkSocialAccount,
    unlinkSocialAccount
  } = useAuthStore()
  const { resetProgress, dailyGoal, updateDailyGoal } = useProgressStore()
  const { isUpdatingSettings, settingsUpdateSuccess, error: audioError } = useAudioStore()
  
  // Use the audio sync hook to ensure proper synchronization
  const { isSyncing, syncSuccess, syncError, isSynced } = useAudioSync()

  const [selectedTab, setSelectedTab] = useState<'reading' | 'audio' | 'notifications' | 'appearance' | 'account' | 'debug'>('reading')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const reciters = [
    { id: '7', name: 'Abdul Basit Abdul Samad', style: 'Murattal' },
    { id: '1', name: 'Mishary Rashid Alafasy', style: 'Clear & Melodious' },
    { id: '2', name: 'Abdur Rahman As-Sudais', style: 'Madinah Style' },
    { id: '3', name: 'Maher Al Mueaqly', style: 'Emotional' },
    { id: '4', name: 'Saad Al Ghamidi', style: 'Slow & Clear' },
    { id: '5', name: 'Ahmed Al Ajmy', style: 'Melodious' },
    { id: '6', name: 'Hani Ar-Rifai', style: 'Beautiful Voice' }
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية (Arabic)' },
    { code: 'ur', name: 'اردو (Urdu)' },
    { code: 'tr', name: 'Türkçe (Turkish)' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' }
  ]

  const tabs = [
    { id: 'reading', label: t.reading, icon: '📖' },
    { id: 'audio', label: t.audio, icon: '🔊' },
    { id: 'notifications', label: t.notifications, icon: '🔔' },
    { id: 'appearance', label: t.appearance, icon: '🎨' },
    { id: 'account', label: t.account, icon: '👤' },
    { id: 'debug', label: t.debug, icon: '🔧' }
  ]

  const handleResetProgress = () => {
    resetProgress()
    setShowResetConfirm(false)
  }

  return (
    <div className="min-h-[100dvh] safe-area-pt safe-area-pb bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 pb-24">
      <div className="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl px-4 md:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
          >
            <span className="text-xl">←</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.settingsTitle}
          </h1>
          
          <LanguageToggle showLabels={false} />
        </motion.div>

        {/* Tab navigation */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-md text-xs font-medium transition-colors min-h-[60px] touch-manipulation ${
                selectedTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-gold-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="text-center leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'reading' && (
            <ReadingTab
              key="reading"
              preferences={preferences}
              languages={languages}
              updateTranslationSettings={updateTranslationSettings}
              updateUILanguage={updateUILanguage}
              updateReadingMode={updateReadingMode}
              dailyGoal={dailyGoal}
              updateDailyGoal={updateDailyGoal}
              t={t}
            />
          )}
          
          {selectedTab === 'audio' && (
            <AudioTab
              key="audio"
              preferences={preferences}
              reciters={reciters}
              updateReciter={updateReciter}
              updatePlaybackSpeed={updatePlaybackSpeed}
              isUpdatingSettings={isSyncing || isUpdatingSettings}
              settingsUpdateSuccess={syncSuccess || settingsUpdateSuccess}
              audioError={syncError || audioError}
              isSynced={isSynced}
              t={t}
            />
          )}
          
          {selectedTab === 'notifications' && (
            <NotificationsTab
              key="notifications"
              preferences={preferences}
              updateNotificationTime={updateNotificationTime}
            />
          )}
          
          {selectedTab === 'appearance' && (
            <AppearanceTab
              key="appearance"
              preferences={preferences}
              toggleDarkMode={toggleDarkMode}
              toggleAnimations={toggleAnimations}
              t={t}
            />
          )}
          
          {selectedTab === 'account' && (
            <AccountTab
              key="account"
              t={t}
              user={user}
              onResetProgress={() => setShowResetConfirm(true)}
              onResetPreferences={resetToDefaults}
              onLogout={logout}
              isLoading={authLoading}
              verificationStatus={verificationStatus}
              verificationEmail={verificationEmail}
              verificationError={verificationError}
              verificationResendAvailableAt={verificationResendAvailableAt}
              startEmailVerification={startEmailVerification}
              verifyEmailCode={verifyEmailCode}
              resendVerification={resendVerification}
              socialAccounts={socialAccounts}
              socialLinkStatus={socialLinkStatus}
              linkSocialAccount={linkSocialAccount}
              unlinkSocialAccount={unlinkSocialAccount}
            />
          )}

          {selectedTab === 'debug' && (
            <motion.div
              key="debug"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  🔧 Developer Tools & Testing
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Test error boundaries and app resilience features. Use these tools to verify that the app handles errors gracefully.
                </p>
                
                <ErrorBoundaryTest />

                <div className="mt-6">
                  <AudioSettingsTest />
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Error Logging Information:
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• App errors are logged to localStorage: 'app_errors'</li>
                    <li>• Page errors are logged to sessionStorage: 'page_errors'</li>
                    <li>• API errors are logged to sessionStorage: 'api_errors'</li>
                    <li>• All errors include context, timestamps, and recovery information</li>
                    <li>• Check browser console for detailed error reports</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset confirmation modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowResetConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reset Progress?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will permanently delete all your progress, including streaks, XP, and badges. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetProgress}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Reading settings tab
const ReadingTab: React.FC<{
  preferences: any
  languages: any[]
  updateTranslationSettings: (settings: any) => void
  updateUILanguage: (language: 'ar' | 'en') => void
  updateReadingMode: (mode: 'learning' | 'mushaf') => void
  dailyGoal: number
  updateDailyGoal: (goal: number) => void
  t: any
}> = ({ 
  preferences, 
  languages, 
  updateTranslationSettings,
  updateUILanguage, 
  updateReadingMode, 
  dailyGoal, 
  updateDailyGoal,
  t
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Default reading mode */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.defaultReadingMode}
        </h3>
        <div className="space-y-3">
          {[
            { value: 'learning', label: t.learningMode, description: t.learningModeDesc },
            { value: 'mushaf', label: t.mushafMode, description: t.mushafModeDesc }
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => updateReadingMode(mode.value as any)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                preferences.defaultReadingMode === mode.value
                  ? 'border-primary-500 dark:border-gold-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {mode.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {mode.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Translation settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.translationAndTransliteration}
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">{t.showTransliteration}</span>
            <input
              type="checkbox"
              checked={preferences.showTransliteration}
              onChange={(e) => updateTranslationSettings({ showTransliteration: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">{t.showTranslation}</span>
            <input
              type="checkbox"
              checked={preferences.showTranslation}
              onChange={(e) => updateTranslationSettings({ showTranslation: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.translationLanguage}
            </label>
            <select
              value={preferences.translationLanguage}
              onChange={(e) => updateTranslationSettings({ translationLanguage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-400"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.uiLanguage}
            </label>
            <select
              value={preferences.uiLanguage}
              onChange={(e) => updateUILanguage(e.target.value as 'ar' | 'en')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-400"
            >
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Daily goal */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.dailyLearningGoal}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.ayahsPerDay}: {dailyGoal}
            </label>
            <input
              type="range"
              min="3"
              max="50"
              value={dailyGoal}
              onChange={(e) => updateDailyGoal(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>3 {t.ayahs}</span>
              <span>50 {t.ayahs}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t.estimatedTime}: {Math.ceil(dailyGoal / 3) * 5}-{Math.ceil(dailyGoal / 2) * 5} {t.minutes}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Audio settings tab
const AudioTab: React.FC<{
  preferences: any
  reciters: any[]
  updateReciter: (reciterId: string) => void
  updatePlaybackSpeed: (speed: number) => void
  isUpdatingSettings: boolean
  settingsUpdateSuccess: boolean
  audioError: string | null
  isSynced?: boolean
  t: any
}> = ({ preferences, reciters, updateReciter, updatePlaybackSpeed, isUpdatingSettings, settingsUpdateSuccess, audioError, isSynced, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Status indicators */}
      {(isUpdatingSettings || settingsUpdateSuccess || audioError || isSynced !== undefined) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-lg border ${
            audioError 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : settingsUpdateSuccess
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : isUpdatingSettings
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : isSynced
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            {isUpdatingSettings ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300">Updating audio settings...</span>
              </>
            ) : settingsUpdateSuccess ? (
              <>
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-700 dark:text-green-300">Audio settings updated successfully!</span>
              </>
            ) : audioError ? (
              <>
                <span className="text-red-600">⚠</span>
                <span className="text-sm text-red-700 dark:text-red-300">{audioError}</span>
              </>
            ) : isSynced ? (
              <>
                <span className="text-green-600">🔗</span>
                <span className="text-sm text-green-700 dark:text-green-300">Audio settings synchronized</span>
              </>
            ) : (
              <>
                <span className="text-amber-600">⚠</span>
                <span className="text-sm text-amber-700 dark:text-amber-300">Audio settings out of sync</span>
              </>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Reciter selection */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.preferredReciter}
        </h3>
        <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <div className="text-sm text-primary-700 dark:text-primary-300">
            {t.current}: {reciters.find(r => r.id === preferences.preferredReciter)?.name || t.notSelected}
          </div>
        </div>
        <div className="space-y-3">
          {reciters.map((reciter) => (
            <button
              key={reciter.id}
              onClick={() => {
                updateReciter(reciter.id)
              }}
              disabled={isUpdatingSettings}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                preferences.preferredReciter === reciter.id
                  ? 'border-primary-500 dark:border-gold-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-gray-600'
              } ${isUpdatingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Playback speed */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.playbackSpeed}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.speed}: {preferences.playbackSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={preferences.playbackSpeed}
              onChange={(e) => updatePlaybackSpeed(parseFloat(e.target.value))}
              disabled={isUpdatingSettings}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${
                isUpdatingSettings ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio quality note */}
      <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              {t.highQualityAudio}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t.highQualityAudioDesc}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Notifications settings tab
const NotificationsTab: React.FC<{
  preferences: any
  updateNotificationTime: (time: string) => void
}> = ({ preferences, updateNotificationTime }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Daily reminder */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Reminder
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reminder Time
            </label>
            <input
              type="time"
              value={preferences.notificationTime}
              onChange={(e) => updateNotificationTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We recommend after Maghrib prayer (around 7 PM)
            </p>
          </div>
        </div>
      </div>

      {/* Notification types */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Types
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'dailyReminder', label: 'Daily Learning Reminder', description: 'Reminds you to complete your daily goal' },
            { key: 'streakWarning', label: 'Streak Warning', description: 'Warns when your streak is at risk' },
            { key: 'achievements', label: 'Achievement Notifications', description: 'Celebrates when you earn badges or level up' }
          ].map((notification) => (
            <label key={notification.key} className="flex items-start space-x-3">
              <input
                type="checkbox"
                defaultChecked={true}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {notification.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Permission note */}
      <div className="card p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start space-x-3">
          <span className="text-xl">🔔</span>
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              Enable Browser Notifications
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              To receive reminders, please allow notifications in your browser settings.
            </p>
            <button
              onClick={() => {
                if ('Notification' in window) {
                  Notification.requestPermission()
                }
              }}
              className="text-sm bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-lg font-medium hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
            >
              Request Permission
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Appearance settings tab
const AppearanceTab: React.FC<{
  preferences: any
  toggleDarkMode: () => void
  toggleAnimations: () => void
  t: any
}> = ({ preferences, toggleDarkMode, toggleAnimations, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Theme */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.theme}
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 dark:text-gray-300">{t.darkMode}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.darkModeDesc}
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={toggleDarkMode}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>
        </div>
      </div>

      {/* Animations */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.animations}
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 dark:text-gray-300">{t.enableAnimations}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.enableAnimationsDesc}
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.animationsEnabled}
              onChange={toggleAnimations}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>
        </div>
      </div>

      {/* Font size note */}
      <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <span className="text-xl">📱</span>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              {t.fontSize}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t.fontSizeDesc}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Account settings tab
interface AccountTabProps {
  user: User | null
  t: UIText
  isLoading: boolean
  verificationStatus: VerificationStatus
  verificationEmail: string | null
  verificationError: string | null
  verificationResendAvailableAt: number | null
  startEmailVerification: (email: string) => Promise<void>
  verifyEmailCode: (code: string) => Promise<void>
  resendVerification: () => Promise<void>
  socialAccounts: Record<SocialProvider, SocialAccountLink>
  socialLinkStatus: Record<SocialProvider, 'idle' | 'linking' | 'unlinking' | 'error'>
  linkSocialAccount: (provider: SocialProvider) => Promise<void>
  unlinkSocialAccount: (provider: SocialProvider) => Promise<void>
  onResetProgress: () => void
  onResetPreferences: () => void
  onLogout: () => void
}

const AccountTab: React.FC<AccountTabProps> = ({
  user,
  t,
  isLoading,
  verificationStatus,
  verificationEmail,
  verificationError,
  verificationResendAvailableAt,
  startEmailVerification,
  verifyEmailCode,
  resendVerification,
  socialAccounts,
  socialLinkStatus,
  linkSocialAccount,
  unlinkSocialAccount,
  onResetProgress,
  onResetPreferences,
  onLogout
}) => {
  const [emailValue, setEmailValue] = useState(() => user?.email ?? verificationEmail ?? '')
  const [codeValue, setCodeValue] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    setEmailValue(user?.email ?? verificationEmail ?? '')
  }, [user?.email, verificationEmail])

  useEffect(() => {
    if (!verificationResendAvailableAt) {
      setCooldown(0)
      return
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((verificationResendAvailableAt - Date.now()) / 1000))
      setCooldown(remaining)
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [verificationResendAvailableAt])

  const isVerified = Boolean(user?.emailVerified)
  const showCodeField = verificationStatus === 'code-sent' || verificationStatus === 'verifying' || (verificationStatus === 'error' && Boolean(verificationEmail))

  const statusText = useMemo(() => {
    if (verificationStatus === 'error') {
      return verificationError ?? t.verificationStatusError
    }
    switch (verificationStatus) {
      case 'sending':
        return t.verificationStatusSending
      case 'code-sent':
        return t.verificationStatusSent
      case 'verifying':
        return t.verificationStatusVerifying
      case 'verified':
        return t.verificationStatusVerified
      default:
        return ''
    }
  }, [verificationStatus, verificationError, t])

  const providers = useMemo(
    () => [
      {
        id: 'google' as SocialProvider,
        label: 'Google',
        description: t.googleSignIn,
        icon: '🟢'
      },
      {
        id: 'apple' as SocialProvider,
        label: 'Apple',
        description: t.appleSignIn,
        icon: ''
      }
    ],
    [t]
  )

  const handleSend = async () => {
    if (!emailValue) return
    await startEmailVerification(emailValue)
    setCodeValue('')
  }

  const handleVerify = async () => {
    if (!codeValue) return
    await verifyEmailCode(codeValue)
    setCodeValue('')
  }

  const handleSocialToggle = async (provider: SocialProvider, linked: boolean) => {
    if (linked) {
      await unlinkSocialAccount(provider)
    } else {
      await linkSocialAccount(provider)
    }
  }

  const activeEmail = emailValue || verificationEmail || user?.email || ''
  const disableSend = !emailValue || verificationStatus === 'sending' || cooldown > 0 || isLoading
  const disableVerify = !codeValue || verificationStatus === 'verifying' || isLoading

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.accountInformation}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.accountInformationHint}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isVerified
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
            }`}
          >
            {isVerified ? t.emailVerifiedLabel : t.emailNotVerifiedLabel}
          </span>
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="account-email">
            {t.emailAddress}
          </label>
          <input
            id="account-email"
            type="email"
            inputMode="email"
            value={emailValue}
            onChange={(event) => setEmailValue(event.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={t.emailPlaceholder}
          />
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              className="btn-primary px-4 py-2"
              onClick={handleSend}
              disabled={disableSend}
            >
              {cooldown > 0 ? `${t.resendIn} ${cooldown}s` : t.sendVerificationCode}
            </button>
            {showCodeField && (
              <button
                type="button"
                className="btn-secondary px-4 py-2"
                onClick={resendVerification}
                disabled={cooldown > 0 || isLoading}
              >
                {t.resendCode}
              </button>
            )}
          </div>
        </div>

        {showCodeField && (
          <div className="grid gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="verification-code">
              {t.verificationCodeLabel}
            </label>
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                id="verification-code"
                type="text"
                inputMode="numeric"
                value={codeValue}
                onChange={(event) => setCodeValue(event.target.value)}
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123456"
                maxLength={6}
              />
              <button
                type="button"
                className="btn-primary px-4 py-2"
                onClick={handleVerify}
                disabled={disableVerify}
              >
                {t.verifyCode}
              </button>
            </div>
            {statusText && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {statusText}
                {verificationStatus === 'verified' && activeEmail ? ` — ${activeEmail}` : ''}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.socialAccounts}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.socialAccountsHint}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {providers.map((provider) => {
            const account = socialAccounts[provider.id]
            const linked = account?.linked
            const linkState = socialLinkStatus[provider.id]
            const processing = linkState === 'linking' || linkState === 'unlinking'
            const linkedAt = account?.linkedAt ? new Date(account.linkedAt).toLocaleDateString() : null

            return (
              <div
                key={provider.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-lg">
                    {provider.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {provider.label}
                      {linked && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          {t.linkedBadge}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {linked && linkedAt ? `${t.linkedOn} ${linkedAt}` : provider.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSocialToggle(provider.id, Boolean(linked))}
                    disabled={processing}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      linked
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/40'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {processing
                      ? t.processing
                      : linked
                        ? t.unlinkAccount
                        : t.linkAccount}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.manageData}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t.manageDataHint}
        </p>

        <div className="space-y-3">
          <button
            onClick={onResetPreferences}
            className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {t.resetSettings}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t.resetSettingsDescription}
            </div>
          </button>

          <button
            onClick={onResetProgress}
            className="w-full p-3 text-left bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <div className="font-medium text-red-700 dark:text-red-400">
              {t.resetProgress}
            </div>
            <div className="text-sm text-red-600 dark:text-red-500">
              {t.resetProgressDescription}
            </div>
          </button>
        </div>

        <button
          onClick={onLogout}
          className="w-full btn-secondary mt-2"
        >
          {t.logout}
        </button>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.aboutSection}
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.appVersion}</span>
            <span className="text-gray-900 dark:text-white">1.0.0</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.dataSource}</span>
            <span className="text-gray-900 dark:text-white">Quran.com API</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.lastUpdated}</span>
            <span className="text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <div className="text-center space-y-3">
          <h4 className="font-semibold text-primary-900 dark:text-primary-100">
            {t.fiSabilillah}
          </h4>
          <p className="text-sm text-primary-700 dark:text-primary-300">
            {t.fiSabilillahDesc}
          </p>
          <p className="text-xs text-primary-600 dark:text-primary-400">
            {t.fiSabilillahVerse}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default SettingsPage
