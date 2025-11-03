import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useUIText } from '../utils/uiText'

interface TranslationContextType {
  language: 'ar' | 'en'
  isRTL: boolean
  forceRefresh: () => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = usePreferencesStore()
  const [refreshKey, setRefreshKey] = useState(0)
  
  const language = preferences.uiLanguage
  const isRTL = language === 'ar'
  
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }
  
  // Listen for language changes and force refresh
  useEffect(() => {
    forceRefresh()
  }, [language])
  
  // Apply direction changes to document
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [language, isRTL])
  
  return (
    <TranslationContext.Provider value={{ language, isRTL, forceRefresh }}>
      <div key={refreshKey}>
        {children}
      </div>
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

// Enhanced useUIText hook that uses the translation context
export const useTranslatedText = () => {
  const { language } = useTranslation()
  const uiTextHook = useUIText()
  
  // This ensures the hook is called whenever language changes
  return {
    ...uiTextHook,
    language
  }
}