import React from 'react'
import { motion } from 'framer-motion'
import { usePreferencesStore } from '../stores/preferencesStore'

interface LanguageToggleProps {
  className?: string
  showLabels?: boolean
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '', showLabels = true }) => {
  const { preferences, updateUILanguage } = usePreferencesStore()
  const currentLanguage = preferences.uiLanguage

  const languages = [
    { code: 'ar' as const, label: 'عربي', flag: '🇸🇦' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' }
  ]

  return (
    <div className={`flex items-center ${className}`} role="group" aria-label="Language selection">
      <div className="relative flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => updateUILanguage(language.code)}
            className={`relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                       min-w-[44px] min-h-[44px] flex items-center justify-center
                       touch-manipulation active:scale-95 ${
              currentLanguage === language.code
                ? 'text-primary-700 dark:text-gold-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            aria-label={`Switch to ${language.label}`}
            aria-pressed={currentLanguage === language.code}
            role="button"
            tabIndex={0}
          >
            {/* Active indicator */}
            {currentLanguage === language.code && (
              <motion.div
                layoutId="activeLanguage"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                aria-hidden="true"
              />
            )}

            {/* Content */}
            <span className="relative flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">{language.flag}</span>
              {showLabels && <span>{language.label}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageToggle