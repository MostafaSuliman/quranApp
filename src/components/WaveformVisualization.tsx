import React, { useEffect, useRef, useState, useCallback } from 'react'
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

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({
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
  
  // Get actual audio URL from store instead of constructing our own
  const { audioUrl: actualAudioUrl } = useAudioStore()

  // Initialize WaveSurfer
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

      // Handle seeking
      wavesurfer.current.on('interaction', (progress) => {
        const seekTime = (progress || 0) * duration
        onSeek(seekTime)
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
              const peaks: number[] = []
              const blockSize = Math.floor(samples.length / 100)
              for (let i = 0; i < 100; i++) {
                let sum = 0
                for (let j = 0; j < blockSize; j++) {
                  sum += Math.abs(samples[i * blockSize + j] || 0)
                }
                peaks.push(sum / blockSize)
              }
              setPeaks(peaks)
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
      // Use the actual audio URL from the audio store, which is CORS-compatible
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

  // Update playback position
  useEffect(() => {
    if (wavesurfer.current && duration > 0) {
      const progress = currentTime / duration
      wavesurfer.current.seekTo(progress)
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

  // Custom animated waveform (fallback/alternative visualization)
  const AnimatedWaveform: React.FC = () => {
    return (
      <div className="flex items-center justify-center h-full space-x-1">
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full"
            style={{
              width: '3px',
              height: `${Math.max(4, peaks[i % peaks.length] * 60 || Math.random() * 40 + 4)}px`
            }}
            animate={{
              height: isPlaying 
                ? `${Math.max(4, (peaks[i % peaks.length] || Math.random()) * 60 + Math.random() * 10)}px`
                : `${Math.max(4, (peaks[i % peaks.length] || 0.3) * 60)}px`,
              opacity: i / 50 <= (currentTime / duration) ? 1 : 0.3
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              repeat: isPlaying ? Infinity : 0,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>
    )
  }

  // Loading state visualization
  const LoadingWaveform: React.FC = () => {
    return (
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
    )
  }

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
            <AnimatedWaveform />
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
          <AnimatedWaveform />
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
}

export default WaveformVisualization