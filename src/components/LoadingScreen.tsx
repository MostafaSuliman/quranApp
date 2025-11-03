import React from 'react'
import { motion } from 'framer-motion'
import QuranText from './QuranText'

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Islamic geometric pattern */}
        <motion.div
          className="w-16 h-16 mx-auto mb-6"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full text-primary-600 dark:text-gold-400"
            fill="currentColor"
          >
            <path d="M32 8l8 8-8 8-8-8 8-8zm0 16l8 8-8 8-8-8 8-8zm0 16l8 8-8 8-8-8 8-8zm-16-16l8 8-8 8-8-8 8-8zm32 0l8 8-8 8-8-8 8-8z" />
          </svg>
        </motion.div>

        {/* Loading text with dots animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-primary-700 dark:text-gold-400 font-medium text-lg"
        >
          <span>Loading</span>
          <motion.span
            className="inline-block"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            ...
          </motion.span>
        </motion.div>

        {/* Bismillah */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4"
        >
          <QuranText
            text="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
            style="bismillah"
            size="small"
            className="text-gray-600 dark:text-gray-400"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingScreen