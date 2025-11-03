import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QuranText from './QuranText'

const SplashScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const steps = [
      { delay: 0, step: 0 },      // Initial
      { delay: 800, step: 1 },    // Bismillah appears
      { delay: 1600, step: 2 },   // App name appears
      { delay: 2400, step: 3 }    // Final animation
    ]

    steps.forEach(({ delay, step }) => {
      setTimeout(() => setCurrentStep(step), delay)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center overflow-hidden relative">
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpolygon points='30 0 60 30 30 60 0 30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="text-center text-white z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Bismillah */}
          {currentStep >= 1 && (
            <motion.div
              key="bismillah"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <QuranText
                text="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم"
                style="bismillah"
                size="large"
                className="text-white font-light tracking-wide"
              />
              <p className="text-sm md:text-base mt-2 opacity-80 font-light ltr-text">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>
            </motion.div>
          )}

          {/* Step 2: App Name and Description */}
          {currentStep >= 2 && (
            <motion.div
              key="app-name"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* App Icon - 3D Quran Book (simplified for now) */}
              <motion.div
                className="w-20 h-20 mx-auto mb-6 relative"
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
                <div className="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg shadow-2xl transform perspective-1000 rotate-y-12">
                  <div className="absolute inset-2 bg-white rounded-md shadow-inner flex items-center justify-center">
                    <span className="text-2xl arabic-text text-primary-700">📖</span>
                  </div>
                </div>
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Quran Memorization
              </h1>
              
              <p className="text-lg md:text-xl font-light opacity-90">
                Fi Sabilillah
              </p>
              
              <p className="text-sm md:text-base opacity-70 max-w-md mx-auto leading-relaxed">
                Beautiful Quran memorization with gamification<br />
                Completely free for the sake of Allah
              </p>
            </motion.div>
          )}

          {/* Step 3: Loading animation */}
          {currentStep >= 3 && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-12"
            >
              {/* Animated progress bar */}
              <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-400 to-gold-300 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              
              <motion.p
                className="text-sm opacity-70 mt-4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Preparing your journey...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -40],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SplashScreen