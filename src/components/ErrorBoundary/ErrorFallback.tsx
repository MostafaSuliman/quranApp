import React from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  ArrowLeftIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  level: 'app' | 'page' | 'component' | 'api'
  context?: string
  allowNavigation?: boolean
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  level,
  context,
  allowNavigation = true
}) => {
  const getErrorTitle = () => {
    switch (level) {
      case 'app':
        return 'حدث خطأ في التطبيق'
      case 'page':
        return 'حدث خطأ في الصفحة'
      case 'component':
        return 'حدث خطأ في المكون'
      case 'api':
        return 'خطأ في الاتصال'
      default:
        return 'حدث خطأ غير متوقع'
    }
  }

  const getErrorDescription = () => {
    switch (level) {
      case 'app':
        return 'لقد واجه التطبيق خطأً غير متوقع. نعتذر عن هذا الإزعاج.'
      case 'page':
        return 'لا يمكن تحميل هذه الصفحة حالياً. يرجى المحاولة مرة أخرى.'
      case 'component':
        return 'يواجه هذا الجزء من التطبيق مشكلة. باقي الأجزاء تعمل بشكل طبيعي.'
      case 'api':
        return 'لا يمكن الاتصال بالخدمة حالياً. يرجى التحقق من اتصال الإنترنت.'
      default:
        return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    }
  }

  const getIslamicQuote = () => {
    const quotes = [
      {
        arabic: '﴿وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ﴾',
        translation: 'ولعلكم تكرهون شيئاً وهو خير لكم',
        reference: 'البقرة: 216'
      },
      {
        arabic: '﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا﴾',
        translation: 'فإن مع العسر يسراً',
        reference: 'الشرح: 5'
      },
      {
        arabic: '﴿وَاللَّهُ غَالِبٌ عَلَىٰ أَمْرِهِ﴾',
        translation: 'والله غالب على أمره',
        reference: 'يوسف: 21'
      }
    ]
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  const quote = getIslamicQuote()

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Error Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Islamic Geometric Pattern Header */}
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            {/* Decorative Islamic Pattern */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <polygon points="10,2 18,10 10,18 2,10" fill="currentColor" />
                </pattern>
                <rect width="100" height="100" fill="url(#islamic-pattern)" />
              </svg>
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-4">
            {/* Arabic Title */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white arabic-text">
              {getErrorTitle()}
            </h2>
            
            {/* English Title */}
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Something went wrong
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {getErrorDescription()}
            </p>

            {/* Context Information */}
            {context && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Context:</span> {context}
                </p>
              </div>
            )}

            {/* Islamic Quote for Comfort */}
            <div className="bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900 dark:to-emerald-900 rounded-lg p-4 my-6">
              <p className="arabic-text text-lg text-primary-800 dark:text-primary-200 mb-2">
                {quote.arabic}
              </p>
              <p className="text-sm text-primary-700 dark:text-primary-300 mb-1">
                {quote.translation}
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400">
                {quote.reference}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {/* Primary Action: Retry */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetError}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Try Again / المحاولة مرة أخرى
              </motion.button>

              {/* Secondary Actions */}
              {allowNavigation && (
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoBack}
                    className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back / رجوع
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoHome}
                    className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    <HomeIcon className="w-4 h-4" />
                    Home / الرئيسية
                  </motion.button>
                </div>
              )}

              {/* Advanced Actions for App-level errors */}
              {level === 'app' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReload}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Reload App / إعادة تحميل التطبيق
                </motion.button>
              )}
            </div>

            {/* Error Details (collapsed by default) */}
            <details className="text-left mt-6">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Technical Details / التفاصيل التقنية
              </summary>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                  {error.message}
                  {error.stack && (
                    <>
                      {'\n\n'}
                      {error.stack.substring(0, 500)}
                      {error.stack.length > 500 && '\n...'}
                    </>
                  )}
                </pre>
              </div>
            </details>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 arabic-text">
            ﴿وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ﴾
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            "And my success is not but through Allah" - Surah Hud - Ayah 88
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ErrorFallback