import React from 'react'
import { motion } from 'framer-motion'
import { ComponentErrorBoundary } from './ErrorBoundary'

export type QuranTextSize = 'small' | 'medium' | 'large' | 'xlarge'
export type QuranTextStyle = 'regular' | 'mushaf' | 'bismillah'

interface QuranTextProps {
  text: string
  size?: QuranTextSize
  style?: QuranTextStyle
  className?: string
  showAyahNumber?: boolean
  ayahNumber?: number
  isHighlighted?: boolean
  isPlaying?: boolean
  onClick?: () => void
  animate?: boolean
}

const QuranText: React.FC<QuranTextProps> = ({
  text,
  size = 'medium',
  style = 'regular',
  className = '',
  showAyahNumber = false,
  ayahNumber,
  isHighlighted = false,
  isPlaying = false,
  onClick,
  animate = false
}) => {
  // Get appropriate CSS class based on size and style
  const getTextClass = () => {
    if (style === 'bismillah') {
      return 'bismillah-text'
    }
    
    if (style === 'mushaf') {
      return 'mushaf-text'
    }
    
    // Regular Quran text with different sizes
    switch (size) {
      case 'small':
        return 'quran-text-small'
      case 'large':
        return 'quran-text-large'
      case 'xlarge':
        return 'quran-text-large text-3xl'
      default:
        return 'quran-text-medium'
    }
  }
  
  // Get container classes for highlighting and interaction
  const getContainerClass = () => {
    let classes = 'transition-all duration-300'
    
    if (onClick) {
      classes += ' cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg p-2'
    }
    
    if (isHighlighted) {
      classes += ' bg-primary-100 dark:bg-primary-900/30 border-l-4 border-primary-500 dark:border-gold-400'
    }
    
    if (isPlaying) {
      classes += ' bg-gold-100 dark:bg-gold-900/30 border-l-4 border-gold-500'
    }
    
    return classes
  }
  
  // Convert numbers to Arabic-Indic numerals
  const toArabicNumerals = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('')
  }

  // Format text with ayah number if needed
  const formatText = () => {
    if (!showAyahNumber || !ayahNumber) {
      return text
    }
    
    // Return text without number - we'll render it separately with decorative box
    return text
  }
  
  const textContent = (
    <div className={`${getContainerClass()} ${className}`} onClick={onClick}>
      <div className="relative">
        <p className={`${getTextClass()} text-gray-900 dark:text-white`}>
          {formatText()}
          
          {/* Arabic Ayah Number in Decorative Box */}
          {showAyahNumber && ayahNumber && (
            <span className="ayah-number-box">
              {toArabicNumerals(ayahNumber)}
            </span>
          )}
        </p>
      </div>
      
      {/* Playing indicator */}
      {isPlaying && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-center mt-2"
        >
          <span className="text-gold-500 text-xl">🔊</span>
        </motion.div>
      )}
    </div>
  )
  
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {textContent}
      </motion.div>
    )
  }
  
  return textContent
}

// Wrap QuranText with error boundary
const QuranTextWithErrorBoundary: React.FC<QuranTextProps> = (props) => (
  <ComponentErrorBoundary 
    componentName="Quran Text"
    enableGracefulDegradation={true}
    showMinimal={true}
  >
    <QuranText {...props} />
  </ComponentErrorBoundary>
)

export default QuranTextWithErrorBoundary