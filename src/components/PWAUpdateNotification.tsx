import { useEffect, useState } from 'react'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface PWAUpdateNotificationProps {
  className?: string
}

export default function PWAUpdateNotification({ className = '' }: PWAUpdateNotificationProps) {
  const [showOfflineReady, setShowOfflineReady] = useState(false)
  const [showUpdateAvailable, setShowUpdateAvailable] = useState(false)

  useEffect(() => {
    // Listen for PWA offline ready event
    const handleOfflineReady = (_event: CustomEvent) => {
      setShowOfflineReady(true)
      // Auto-hide after 5 seconds
      setTimeout(() => setShowOfflineReady(false), 5000)
    }

    // Listen for PWA update available event
    const handleUpdateAvailable = () => {
      setShowUpdateAvailable(true)
    }

    window.addEventListener('pwa-offline-ready', handleOfflineReady as EventListener)
    window.addEventListener('pwa-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('pwa-offline-ready', handleOfflineReady as EventListener)
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  if (!showOfflineReady && !showUpdateAvailable) {
    return null
  }

  return (
    <>
      {/* Offline Ready Notification */}
      {showOfflineReady && (
        <div className={`fixed bottom-4 right-4 z-50 max-w-sm bg-emerald-600 text-white rounded-lg shadow-lg p-4 ${className}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium">
                App Ready Offline! 📖
              </p>
              <p className="mt-1 text-sm text-emerald-200">
                Quran content is now cached and available offline.
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-emerald-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onClick={() => setShowOfflineReady(false)}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Available Notification */}
      {showUpdateAvailable && (
        <div className={`fixed bottom-4 right-4 z-50 max-w-sm bg-blue-600 text-white rounded-lg shadow-lg p-4 ${className}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ArrowPathIcon className="h-6 w-6 text-blue-200" />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium">
                Update Available! 🆕
              </p>
              <p className="mt-1 text-sm text-blue-200">
                A new version of the app is ready.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleRefresh}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Update Now
                </button>
                <button
                  onClick={() => setShowUpdateAvailable(false)}
                  className="bg-transparent hover:bg-blue-700 text-blue-200 px-3 py-1 rounded text-xs font-medium border border-blue-400"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}