import React, { useState, useEffect } from 'react'
import {
  WifiIcon as Wifi,
  SignalSlashIcon as WifiOff,
  ArrowDownTrayIcon as Download,
  CircleStackIcon as Database
} from '@heroicons/react/24/outline'
import { indexedDB } from '../services/indexedDB'
import { DownloadWizard } from './DownloadWizard'

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isQuranDownloaded, setIsQuranDownloaded] = useState(false)
  const [showDownloadWizard, setShowDownloadWizard] = useState(false)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Check if Quran is downloaded
    checkDownloadStatus()

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkDownloadStatus = async () => {
    try {
      const downloaded = await indexedDB.isQuranDownloaded()
      setIsQuranDownloaded(downloaded)
    } catch (error) {
      console.error('Failed to check download status:', error)
    }
  }

  // Show permanent indicator only when offline
  if (!isOnline || showIndicator) {
    return (
      <>
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
          showIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            isOnline
              ? 'bg-green-600 text-white'
              : 'bg-yellow-600 text-white'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5" />
                <div>
                  <div className="font-medium">Back Online</div>
                  <div className="text-xs opacity-90">Internet connection restored</div>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">You're Offline</div>
                  <div className="text-xs opacity-90">
                    {isQuranDownloaded
                      ? 'Using offline data'
                      : 'Limited functionality - download Quran for offline use'}
                  </div>
                </div>
                {!isQuranDownloaded && (
                  <button
                    onClick={() => setShowDownloadWizard(true)}
                    className="ml-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {showDownloadWizard && (
          <DownloadWizard onClose={() => {
            setShowDownloadWizard(false)
            checkDownloadStatus()
          }} />
        )}
      </>
    )
  }

  // Show small badge when offline with downloaded data
  if (!isOnline && isQuranDownloaded) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-full shadow-lg text-sm">
          <Database className="w-4 h-4 text-green-400" />
          <span>Offline Mode</span>
        </div>
      </div>
    )
  }

  return null
}

export default OfflineIndicator
