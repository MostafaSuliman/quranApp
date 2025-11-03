import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import WaveSurfer from 'wavesurfer.js'
import { useAudioStore } from '../stores/audioStore'

interface WaveformVisualizationProps {
  audioUrl: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  className?: string
  height?: number
  waveColor?: string
  progressColor?: string
  cursorColor?: string
}

// Memoized loading waveform component
const LoadingWaveform = memo(() => (
  <div className="flex items-center justify-center h-full space-x-1">
    {Array.from({ length: 30 }, (_, i) => (
      <motion.div
        key={i}
        className="bg-gray-300 dark:bg-gray-600 rounded-full"
        style={{ width: '3px' }}
        animate={{
          height: ['8px', '32px', '8px'],
          opacity: [0.3, 1, 0.3]
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          delay: i * 0.1
        }}
      />
    ))}
  </div>
))
LoadingWaveform.displayName = 'LoadingWaveform'

// Memoized animated waveform component with throttled updates
const AnimatedWaveform = memo<{
  peaks: number[]
  isPlaying: boolean
  currentTime: number
  duration: number
}>(({ peaks, isPlaying, currentTime, duration }) => {
  // Use canvas for better performance with many bars
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set canvas size accounting for device pixel ratio
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const barCount = peaks.length
    const barWidth = rect.width / barCount
    const barGap = 1
    const progress = duration > 0 ? currentTime / duration : 0

    const drawWaveform = () => {
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth
        const peakValue = peaks[i] || 0.3
        const baseHeight = peakValue * rect.height * 0.8

        // Add animation if playing
        const animationOffset = isPlaying ? Math.sin(Date.now() / 200 + i * 0.5) * 5 : 0
        const height = Math.max(4, baseHeight + animationOffset)

        // Set color based on progress
        const isPassed = i / barCount <= progress
        const gradient = ctx.createLinearGradient(0, rect.height - height, 0, rect.height)

        if (isPassed) {
          gradient.addColorStop(0, '#10b981') // emerald-500
          gradient.addColorStop(1, '#14b8a6') // teal-500
        } else {
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
          gradient.addColorStop(1, 'rgba(20, 184, 166, 0.3)')
        }

        ctx.fillStyle = gradient
        ctx.fillRect(
          x + barGap / 2,
          rect.height - height,
          barWidth - barGap,
          height
        )
      }
    }

    // Throttle animation to 30fps for better performance
    let lastTime = 0
    const animate = (time: number) => {
      if (time - lastTime >= 33) { // ~30fps
        drawWaveform()
        lastTime = time
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      drawWaveform()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [peaks, isPlaying, currentTime, duration])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ height: '100%' }}
    />
  )
})
AnimatedWaveform.displayName = 'AnimatedWaveform'

const WaveformVisualization: React.FC<WaveformVisualizationProps> = memo(({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  onSeek,
  className = '',
  height = 80,
  waveColor = '#e5e7eb',
  progressColor = '#10b981',
  cursorColor = '#059669'
}) => {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [peaks, setPeaks] = useState<number[]>([])
  const lastUpdateTimeRef = useRef<number>(0)

  // Get actual audio URL from store instead of constructing our own
  const { audioUrl: actualAudioUrl } = useAudioStore()

  // Memoized WaveSurfer initialization
  const initializeWaveSurfer = useCallback(() => {
    if (!waveformRef.current) return

    // Clean up previous instance
    if (wavesurfer.current) {
      wavesurfer.current.destroy()
    }

    try {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor,
        progressColor,
        cursorColor,
        barWidth: 2,
        barRadius: 1,
        height,
        normalize: true,
        mediaControls: false,
        interact: true,
        hideScrollbar: true,
        cursorWidth: 2,
        barGap: 1
      })

      // Handle seeking with throttling
      wavesurfer.current.on('interaction', (progress) => {
        const now = Date.now()
        if (now - lastUpdateTimeRef.current > 100) { // Throttle to max 10 updates/sec
          const seekTime = (progress || 0) * duration
          onSeek(seekTime)
          lastUpdateTimeRef.current = now
        }
      })

      // Handle ready state
      wavesurfer.current.on('ready', () => {
        setIsLoading(false)
        setError(null)

        // Get peaks for custom visualization
        if (wavesurfer.current) {
          try {
            const peaksData = wavesurfer.current.getDecodedData()
            if (peaksData) {
              // Create simplified peaks array for visualization
              const samples = peaksData.getChannelData(0)
              const newPeaks: number[] = []
              const blockSize = Math.floor(samples.length / 100)
              for (let i = 0; i < 100; i++) {
                let sum = 0
                for (let j = 0; j < blockSize; j++) {
                  sum += Math.abs(samples[i * blockSize + j] || 0)
                }
                newPeaks.push(sum / blockSize)
              }
              setPeaks(newPeaks)
            }
          } catch (error) {
            console.warn('Could not get peaks data:', error)
            setPeaks([])
          }
        }
      })

      // Handle loading state
      wavesurfer.current.on('loading', (percent) => {
        if (percent < 100) {
          setIsLoading(true)
        }
      })

      // Handle errors
      wavesurfer.current.on('error', (error) => {
        console.error('WaveSurfer error:', error)
        setError('Failed to load audio waveform')
        setIsLoading(false)

        // Fallback: Use animated waveform instead
        setTimeout(() => {
          setError(null)
          setPeaks(Array.from({ length: 50 }, () => Math.random()))
        }, 1000)
      })

    } catch (error) {
      console.error('Failed to initialize WaveSurfer:', error)
      setError('Failed to initialize audio visualizer')
      setIsLoading(false)
    }
  }, [waveColor, progressColor, cursorColor, height, duration, onSeek])

  // Load audio URL from audio store
  useEffect(() => {
    if (!actualAudioUrl || !wavesurfer.current) {
      // No audio URL available, use fallback visualization
      setError(null)
      setIsLoading(false)
      setPeaks(Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Loading waveform for URL:', actualAudioUrl)
      wavesurfer.current.load(actualAudioUrl)
    } catch (error) {
      console.error('Failed to load audio:', error)
      setError('Failed to load audio file')
      setIsLoading(false)

      // Fallback to animated visualization
      setTimeout(() => {
        setError(null)
        setPeaks(Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2))
      }, 1000)
    }
  }, [actualAudioUrl])

  // Update playback position with throttling
  useEffect(() => {
    if (wavesurfer.current && duration > 0) {
      const now = Date.now()
      if (now - lastUpdateTimeRef.current > 100) { // Throttle updates
        const progress = currentTime / duration
        wavesurfer.current.seekTo(progress)
        lastUpdateTimeRef.current = now
      }
    }
  }, [currentTime, duration])

  // Initialize on mount
  useEffect(() => {
    initializeWaveSurfer()

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy()
      }
    }
  }, [initializeWaveSurfer])

  return (
    <div className={`relative ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LoadingWaveform />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
            Loading waveform...
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <div className="text-red-500 dark:text-red-400 text-sm mb-2">⚠️ Waveform Error</div>
            <AnimatedWaveform
              peaks={peaks}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
            />
          </div>
        </motion.div>
      )}

      {/* WaveSurfer Container */}
      <div
        ref={waveformRef}
        className={`w-full rounded-lg overflow-hidden ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
        style={{ height: `${height}px` }}
      />

      {/* Fallback Custom Waveform */}
      {!audioUrl && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <AnimatedWaveform
            peaks={peaks}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
          />
        </div>
      )}

      {/* Progress Overlay */}
      {duration > 0 && (
        <div className="absolute bottom-1 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
          {Math.round((currentTime / duration) * 100)}%
        </div>
      )}

      {/* Islamic Pattern Decoration */}
      <div className="absolute top-1 left-2 opacity-20 pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-emerald-500 dark:text-emerald-400">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
          <path d="M8 2v4M8 10v4M2 8h4M10 8h4" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>

      {/* Interactive Hint */}
      {!isLoading && !error && (
        <motion.div
          className="absolute top-1 right-2 text-xs text-gray-400 dark:text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          Click to seek
        </motion.div>
      )}
    </div>
  )
})

WaveformVisualization.displayName = 'WaveformVisualization'

export default WaveformVisualization
