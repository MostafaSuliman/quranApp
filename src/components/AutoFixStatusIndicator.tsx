/**
 * 🟢 AUTO-FIX STATUS INDICATOR - QuranApp
 * Floating status indicator for the auto-fix system
 * Shows system health and provides quick access to dashboard
 */

import React, { useState, useEffect } from 'react'
import { autoFixSystem } from '../utils/autoFixSystem'

interface StatusIndicatorProps {
  onClick: () => void
}

export const AutoFixStatusIndicator: React.FC<StatusIndicatorProps> = ({ onClick }) => {
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy')
  const [activeFixes, setActiveFixes] = useState<number>(0)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      try {
        const status = autoFixSystem.getSystemStatus()
        setSystemHealth(status.health)
        setActiveFixes(status.activeFixes.length)
      } catch (error) {
        console.warn('Failed to get auto-fix status:', error)
      }
    }

    // Initial update
    updateStatus()

    // Update every 10 seconds
    const interval = setInterval(updateStatus, 10000)

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = () => {
    switch (systemHealth) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-40 group"
        onClick={() => setIsMinimized(false)}
      >
        <div className={`w-12 h-12 rounded-full ${getHealthColor()} flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-110`}>
          <div className="text-white text-xl">🛠️</div>
          {activeFixes > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {activeFixes}
            </div>
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            Auto-Fix System: {systemHealth}
            {activeFixes > 0 && (
              <div className="text-yellow-300">
                {activeFixes} active fix{activeFixes !== 1 ? 'es' : ''}
              </div>
            )}
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 absolute top-full right-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-lg">🛠️</div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900">Auto-Fix System</h4>
            <p className="text-xs text-gray-500">Real-time monitoring</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ➖
          </button>
          <button
            onClick={onClick}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Open
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">System Health</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getHealthColor()}`}></div>
            <span className={`text-sm font-medium ${
              systemHealth === 'healthy' ? 'text-green-600' :
              systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemHealth}
            </span>
          </div>
        </div>

        {activeFixes > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Active Fixes</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-600">{activeFixes}</span>
            </div>
          </div>
        )}

        {/* Quick Status Messages */}
        {systemHealth === 'healthy' && activeFixes === 0 && (
          <div className="text-xs text-green-600 bg-green-50 rounded px-2 py-1">
            ✅ All systems operational
          </div>
        )}

        {systemHealth === 'warning' && (
          <div className="text-xs text-yellow-600 bg-yellow-50 rounded px-2 py-1">
            ⚠️ Some issues detected, auto-fixing...
          </div>
        )}

        {systemHealth === 'critical' && (
          <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
            🚨 Critical issues detected, immediate attention needed
          </div>
        )}

        {activeFixes > 0 && (
          <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
            🔧 {activeFixes} auto-fix{activeFixes !== 1 ? 'es' : ''} in progress
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between">
          <button
            onClick={onClick}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded transition-colors"
          >
            View Dashboard
          </button>
          <div className="text-xs text-gray-400">
            Auto-monitoring active
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutoFixStatusIndicator
