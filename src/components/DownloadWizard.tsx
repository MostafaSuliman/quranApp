import React, { useState, useEffect, useCallback } from 'react'
import {
  ArrowDownTrayIcon as Download,
  CheckCircleIcon as CheckCircle,
  XCircleIcon as XCircle,
  ArrowPathIcon as Loader,
  CircleStackIcon as HardDrive,
  WifiIcon as Wifi,
  SignalSlashIcon as WifiOff
} from '@heroicons/react/24/outline'
import { indexedDB } from '../services/indexedDB'
import { quranApiEnhanced } from '../utils/quranApiEnhanced'
// import { Surah } from '../types/quran' // Unused

interface DownloadProgress {
  total: number
  downloaded: number
  current: number
  percentage: number
  status: 'idle' | 'downloading' | 'completed' | 'paused' | 'error'
  currentSurah?: string
  error?: string
}

export const DownloadWizard: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [progress, setProgress] = useState<DownloadProgress>({
    total: 114,
    downloaded: 0,
    current: 0,
    percentage: 0,
    status: 'idle'
  })
  const [storageInfo, setStorageInfo] = useState<{
    usage: number
    quota: number
    percentage: number
  } | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isPaused, setIsPaused] = useState(false)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load initial storage info
  useEffect(() => {
    loadStorageInfo()
    loadProgress()
  }, [])

  const loadStorageInfo = async () => {
    try {
      const info = await indexedDB.getStorageEstimate()
      setStorageInfo(info)
    } catch (error) {
      console.error('Failed to get storage info:', error)
    }
  }

  const loadProgress = async () => {
    try {
      const downloadProgress = await indexedDB.getDownloadProgress()
      setProgress(prev => ({
        ...prev,
        downloaded: downloadProgress.downloaded,
        percentage: downloadProgress.percentage,
        status: downloadProgress.downloaded === 114 ? 'completed' : 'idle'
      }))
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const startDownload = useCallback(async () => {
    if (!isOnline) {
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: 'No internet connection. Please connect to download.'
      }))
      return
    }

    setProgress(prev => ({ ...prev, status: 'downloading', error: undefined }))
    setIsPaused(false)

    try {
      // Get all chapters first
      const chapters = await quranApiEnhanced.getChapters()
      const startIndex = progress.downloaded

      // Download chapters sequentially with progress updates
      for (let i = startIndex; i < chapters.length; i++) {
        if (isPaused) {
          setProgress(prev => ({ ...prev, status: 'paused' }))
          break
        }

        const chapter = chapters[i]

        setProgress(prev => ({
          ...prev,
          current: i + 1,
          currentSurah: `${chapter.englishName} (${chapter.name})`,
          percentage: ((i + 1) / chapters.length) * 100
        }))

        // Download verses for this chapter
        try {
          await quranApiEnhanced.getChapterVerses(chapter.number, {
            perPage: 300 // Get all verses at once
          })

          setProgress(prev => ({
            ...prev,
            downloaded: i + 1
          }))

          // Update storage info periodically
          if ((i + 1) % 10 === 0) {
            await loadStorageInfo()
          }

          // Add small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          console.error(`Failed to download ${chapter.englishName}:`, error)
          // Continue with next chapter instead of failing completely
        }
      }

      if (!isPaused) {
        setProgress(prev => ({
          ...prev,
          status: 'completed',
          percentage: 100,
          downloaded: chapters.length
        }))
        await loadStorageInfo()
      }
    } catch (error: any) {
      console.error('Download failed:', error)
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Download failed. Please try again.'
      }))
    }
  }, [isOnline, progress.downloaded, isPaused])

  const pauseDownload = () => {
    setIsPaused(true)
    setProgress(prev => ({ ...prev, status: 'paused' }))
  }

  const resumeDownload = () => {
    setIsPaused(false)
    startDownload()
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case 'downloading':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'paused':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'downloading':
        return <Loader className="w-5 h-5 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <XCircle className="w-5 h-5" />
      default:
        return <Download className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Download Quran for Offline Use</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Network Status */}
        <div className="mb-4 flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">No Connection</span>
            </>
          )}
        </div>

        {/* Storage Info */}
        {storageInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Storage Usage</span>
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
              {' '}({storageInfo.percentage.toFixed(2)}% used)
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${storageInfo.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Download Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={getStatusColor()}>{getStatusIcon()}</div>
              <span className="text-sm font-medium text-gray-700">
                {progress.status === 'downloading'
                  ? 'Downloading...'
                  : progress.status === 'completed'
                  ? 'Download Complete'
                  : progress.status === 'paused'
                  ? 'Paused'
                  : progress.status === 'error'
                  ? 'Error'
                  : 'Ready to Download'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {progress.downloaded} / {progress.total}
            </span>
          </div>

          {progress.currentSurah && progress.status === 'downloading' && (
            <div className="text-xs text-gray-500 mb-2">
              Current: {progress.currentSurah}
            </div>
          )}

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                progress.status === 'completed'
                  ? 'bg-green-600'
                  : progress.status === 'error'
                  ? 'bg-red-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          <div className="text-xs text-gray-600 mt-1 text-right">
            {progress.percentage.toFixed(1)}%
          </div>
        </div>

        {/* Error Message */}
        {progress.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{progress.error}</p>
          </div>
        )}

        {/* Info */}
        <div className="mb-6 text-sm text-gray-600">
          <p className="mb-2">
            Download the complete Quran (~22MB) for offline access. You'll be able to:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Read the Quran without internet</li>
            <li>Access translations offline</li>
            <li>Resume downloads if interrupted</li>
            <li>Save your progress and bookmarks</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {progress.status === 'idle' || progress.status === 'error' ? (
            <button
              onClick={startDownload}
              disabled={!isOnline}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {progress.downloaded > 0 ? 'Resume Download' : 'Start Download'}
            </button>
          ) : progress.status === 'downloading' ? (
            <button
              onClick={pauseDownload}
              className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
            >
              Pause Download
            </button>
          ) : progress.status === 'paused' ? (
            <button
              onClick={resumeDownload}
              disabled={!isOnline}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Resume Download
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Done
            </button>
          )}

          {onClose && progress.status !== 'downloading' && (
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Download estimate */}
        {progress.status === 'idle' && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Estimated time: ~5-10 minutes on average connection
          </div>
        )}
      </div>
    </div>
  )
}

export default DownloadWizard
