import React from 'react'
import { motion } from 'framer-motion'

// Islamic color schemes for different states
export const AYAH_STATES = {
  normal: {
    bg: 'bg-transparent',
    border: 'border-transparent',
    text: 'text-gray-900 dark:text-white',
    ring: '',
    glow: ''
  },
  hover: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700',
    text: 'text-emerald-900 dark:text-emerald-100',
    ring: 'ring-1 ring-emerald-200 dark:ring-emerald-700',
    glow: ''
  },
  selected: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    border: 'border-emerald-300 dark:border-emerald-600',
    text: 'text-emerald-900 dark:text-emerald-100',
    ring: 'ring-2 ring-emerald-300 dark:ring-emerald-600',
    glow: ''
  },
  playing: {
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30',
    border: 'border-amber-300 dark:border-amber-600',
    text: 'text-amber-900 dark:text-amber-100',
    ring: 'ring-2 ring-amber-400 dark:ring-amber-500',
    glow: 'shadow-lg shadow-amber-200/50 dark:shadow-amber-900/50'
  },
  hidden: {
    bg: 'bg-gray-200 dark:bg-gray-700',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-transparent',
    ring: 'ring-1 ring-gray-300 dark:ring-gray-600',
    glow: ''
  },
  revealed: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-900 dark:text-green-100',
    ring: 'ring-2 ring-green-300 dark:ring-green-700',
    glow: 'shadow-md shadow-green-200/50 dark:shadow-green-900/50'
  },
  memorization: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-900 dark:text-purple-100',
    ring: 'ring-1 ring-purple-300 dark:ring-purple-700',
    glow: ''
  }
} as const

export type AyahHighlightState = keyof typeof AYAH_STATES

interface AyahHighlighterProps {
  state: AyahHighlightState
  isAnimated?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
  onHover?: (isHovering: boolean) => void
  disabled?: boolean
  masteryLevel?: number // 0-100 for memorization progress
}

const AyahHighlighter: React.FC<AyahHighlighterProps> = ({
  state,
  isAnimated = true,
  children,
  className = '',
  onClick,
  onHover,
  disabled = false,
  masteryLevel = 0
}) => {
  const stateStyle = AYAH_STATES[state]
  
  // Create mastery indicator for memorization mode
  const masteryColor = masteryLevel >= 80 ? 'bg-green-500' 
    : masteryLevel >= 60 ? 'bg-yellow-500'
    : masteryLevel >= 40 ? 'bg-orange-500'
    : 'bg-red-500'
  
  const baseClasses = `
    relative rounded-lg transition-all duration-300 cursor-pointer
    ${stateStyle.bg} ${stateStyle.border} ${stateStyle.text} ${stateStyle.ring}
    ${stateStyle.glow || ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
    ${className}
  `

  const content = (
    <div className={baseClasses.trim()}>
      {/* Mastery level indicator for memorization */}
      {state === 'memorization' && masteryLevel > 0 && (
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800">
          <div 
            className={`w-full h-full rounded-full ${masteryColor}`}
            style={{ 
              opacity: masteryLevel / 100,
              transform: `scale(${Math.max(0.3, masteryLevel / 100)})`
            }}
          />
        </div>
      )}

      {/* Pulse animation for playing state */}
      {state === 'playing' && isAnimated && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-amber-400/20 dark:bg-amber-500/20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Shimmer effect for revealed state */}
      {state === 'revealed' && isAnimated && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.3) 50%, transparent 70%)'
          }}
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Selection indicator */}
      {state === 'selected' && (
        <div className="absolute top-1 left-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </div>
      )}

      {/* Hidden state overlay */}
      {state === 'hidden' && (
        <div className="absolute inset-0 rounded-lg bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-500 dark:text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          </motion.div>
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )

  if (!isAnimated) {
    return (
      <div
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
      >
        {content}
      </div>
    )
  }

  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {content}
    </motion.div>
  )
}

// Higher-order component for automatic state management
interface AutoHighlightProps extends Omit<AyahHighlighterProps, 'state'> {
  isHovered?: boolean
  isSelected?: boolean
  isPlaying?: boolean
  isHidden?: boolean
  isRevealed?: boolean
  inMemorizationMode?: boolean
}

export const AutoAyahHighlighter: React.FC<AutoHighlightProps> = ({
  isHovered = false,
  isSelected = false,
  isPlaying = false,
  isHidden = false,
  isRevealed = false,
  inMemorizationMode = false,
  masteryLevel = 0,
  ...props
}) => {
  // Determine state priority (highest priority wins)
  let state: AyahHighlightState = 'normal'
  
  if (isHidden) {
    state = 'hidden'
  } else if (isRevealed) {
    state = 'revealed'
  } else if (isPlaying) {
    state = 'playing'
  } else if (isSelected) {
    state = 'selected'
  } else if (inMemorizationMode) {
    state = 'memorization'
  } else if (isHovered) {
    state = 'hover'
  }
  
  return (
    <AyahHighlighter
      state={state}
      masteryLevel={masteryLevel}
      {...props}
    />
  )
}

// Utility component for quick reveal button
interface RevealButtonProps {
  onClick: () => void
  className?: string
}

export const RevealButton: React.FC<RevealButtonProps> = ({ onClick, className = '' }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1 text-sm font-medium rounded-md
        bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300
        hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      Reveal
    </motion.button>
  )
}

// Memorization progress indicator
interface MemorizationProgressProps {
  current: number
  total: number
  mastered: number
  className?: string
}

export const MemorizationProgress: React.FC<MemorizationProgressProps> = ({
  current,
  total,
  mastered,
  className = ''
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0
  const masteredPercentage = total > 0 ? (mastered / total) * 100 : 0
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Memorization Progress
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {current}/{total} hidden
        </span>
      </div>
      
      <div className="space-y-2">
        {/* Hidden progress */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600 dark:text-gray-400 w-12">Hidden</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
            {Math.round(percentage)}%
          </span>
        </div>
        
        {/* Mastered progress */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600 dark:text-gray-400 w-12">Mastered</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${masteredPercentage}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
            {Math.round(masteredPercentage)}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default AyahHighlighter
