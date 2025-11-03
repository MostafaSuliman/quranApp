/**
 * 🛠️ AUTO-FIX DASHBOARD - QuranApp
 * Real-time monitoring and control center for the auto-fix system
 * Provides insights, controls, and transparency into automated improvements
 */

import React, { useState, useEffect } from 'react'
import { autoFixSystem, healthMonitor, autoFixEngine } from '../utils/autoFixSystem'
import { islamicContentEnhancer } from '../utils/islamicContentEnhancer'
import { performanceOptimizer } from '../utils/performanceOptimizer'
import { continuousImprovementSystem } from '../utils/continuousImprovement'

interface DashboardProps {
  isVisible: boolean
  onClose: () => void
}

interface SystemStatus {
  health: 'healthy' | 'warning' | 'critical'
  uptime: string
  activeFixes: string[]
  insights: string[]
  metrics: any
}

export const AutoFixDashboard: React.FC<DashboardProps> = ({ isVisible, onClose }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    health: 'healthy',
    uptime: '0s',
    activeFixes: [],
    insights: [],
    metrics: {}
  })
  
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'fixes' | 'performance' | 'islamic' | 'learning'>('overview')
  const [healthData, setHealthData] = useState<any>({})
  const [fixHistory, setFixHistory] = useState<any[]>([])
  const [performanceReport, setPerformanceReport] = useState<any>({})
  const [islamicMetrics, setIslamicMetrics] = useState<any>({})
  const [systemWisdom, setSystemWisdom] = useState<any>({})

  useEffect(() => {
    if (isVisible) {
      updateDashboardData()
      const interval = setInterval(updateDashboardData, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [isVisible])

  const updateDashboardData = async () => {
    try {
      // Get system status
      const status = autoFixSystem.getSystemStatus()
      setSystemStatus(status)

      // Get health data
      const health = healthMonitor.getHealthStatus()
      setHealthData(Array.from(health.entries()).map(([key, value]) => ({ componentName: key, ...value })))

      // Get fix history
      const fixes = autoFixEngine.getFixHistory()
      setFixHistory(fixes.slice(-20)) // Last 20 fixes

      // Get performance report
      const perfReport = performanceOptimizer.getPerformanceReport()
      setPerformanceReport(perfReport)

      // Get Islamic content metrics
      const islamicStats = islamicContentEnhancer.getContentMetrics()
      setIslamicMetrics(islamicStats)

      // Get learning system wisdom
      const wisdom = continuousImprovementSystem.getSystemWisdom()
      setSystemWisdom(wisdom)

    } catch (error) {
      console.error('Failed to update dashboard data:', error)
    }
  }

  const triggerManualFix = async (fixType: string) => {
    try {
      switch (fixType) {
        case 'api_fallback':
          await autoFixEngine.implementApiFallback()
          break
        case 'font_recovery':
          await autoFixEngine.recoverFontLoading()
          break
        case 'performance':
          await autoFixEngine.optimizePerformance()
          break
        case 'cache_clear':
          await autoFixEngine.clearCorruptedCache()
          break
        case 'improvement_cycle':
          await continuousImprovementSystem.triggerManualImprovement()
          break
      }
      updateDashboardData()
    } catch (error) {
      console.error('Manual fix failed:', error)
    }
  }

  const runDiagnostics = async () => {
    await autoFixSystem.runDiagnostics()
    updateDashboardData()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🛠️</div>
            <div>
              <h2 className="text-xl font-bold">Auto-Fix System Dashboard</h2>
              <p className="text-emerald-100 text-sm">Real-time monitoring and control center</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              systemStatus.health === 'healthy' ? 'bg-green-500' :
              systemStatus.health === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {systemStatus.health.toUpperCase()}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-100 border-b flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'health', label: 'Health Monitor', icon: '💚' },
            { id: 'fixes', label: 'Auto-Fixes', icon: '🔧' },
            { id: 'performance', label: 'Performance', icon: '⚡' },
            { id: 'islamic', label: 'Islamic Content', icon: '🕌' },
            { id: 'learning', label: 'AI Learning', icon: '🧠' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-emerald-500 text-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* System Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">System Health</p>
                      <p className={`text-lg font-bold ${
                        systemStatus.health === 'healthy' ? 'text-green-600' :
                        systemStatus.health === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {systemStatus.health}
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      systemStatus.health === 'healthy' ? 'bg-green-100' :
                      systemStatus.health === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {systemStatus.health === 'healthy' ? '✅' : 
                       systemStatus.health === 'warning' ? '⚠️' : '🚨'}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="text-lg font-bold text-blue-600">{systemStatus.uptime}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      ⏱️
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Fixes</p>
                      <p className="text-lg font-bold text-purple-600">{systemStatus.activeFixes.length}</p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      🔧
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {systemWisdom.successRate ? `${Math.round(systemWisdom.successRate * 100)}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      📈
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={runDiagnostics}
                    className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 text-sm font-medium transition-colors"
                  >
                    🔍 Run Diagnostics
                  </button>
                  <button
                    onClick={() => triggerManualFix('improvement_cycle')}
                    className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-700 text-sm font-medium transition-colors"
                  >
                    🧠 Trigger Learning
                  </button>
                  <button
                    onClick={() => triggerManualFix('performance')}
                    className="p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 text-sm font-medium transition-colors"
                  >
                    ⚡ Optimize Performance
                  </button>
                  <button
                    onClick={() => triggerManualFix('api_fallback')}
                    className="p-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg text-yellow-700 text-sm font-medium transition-colors"
                  >
                    🌐 API Fallback
                  </button>
                  <button
                    onClick={() => triggerManualFix('font_recovery')}
                    className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-indigo-700 text-sm font-medium transition-colors"
                  >
                    🔤 Font Recovery
                  </button>
                  <button
                    onClick={() => triggerManualFix('cache_clear')}
                    className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm font-medium transition-colors"
                  >
                    🗑️ Clear Cache
                  </button>
                </div>
              </div>

              {/* System Insights */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  System Insights
                </h3>
                {systemStatus.insights.length > 0 ? (
                  <div className="space-y-2">
                    {systemStatus.insights.map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                        <p className="text-blue-800 text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No insights available at the moment.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">💚</span>
                  Component Health Status
                </h3>
                <div className="grid gap-4">
                  {healthData.map((component: any) => (
                    <div key={component.component} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          component.status === 'healthy' ? 'bg-green-500' :
                          component.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{component.component}</p>
                          {component.errorMessage && (
                            <p className="text-sm text-red-600">{component.errorMessage}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Last check: {new Date(component.lastCheck).toLocaleTimeString()}
                        </p>
                        {component.responseTime && (
                          <p className="text-sm text-gray-600">{component.responseTime}ms</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fixes' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">🔧</span>
                  Auto-Fix History
                </h3>
                <div className="space-y-3">
                  {fixHistory.map((fix) => (
                    <div key={fix.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${fix.successful ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <p className="font-medium">{fix.description}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {fix.type} • Priority: {fix.priority} • {new Date(fix.implementedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            fix.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {fix.successful ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {fixHistory.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No auto-fixes have been executed yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Load Time</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {performanceReport.metrics?.loadTime ? `${Math.round(performanceReport.metrics.loadTime)}ms` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">LCP</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {performanceReport.coreWebVitals?.lcp ? `${Math.round(performanceReport.coreWebVitals.lcp)}ms` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">CLS</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {performanceReport.coreWebVitals?.cls ? performanceReport.coreWebVitals.cls.toFixed(3) : 'N/A'}
                  </p>
                </div>
              </div>

              {performanceReport.optimizations && (
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Performance Optimizations</h3>
                  <div className="space-y-3">
                    {performanceReport.optimizations.map((opt: any) => (
                      <div key={opt.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{opt.description}</p>
                        <p className="text-sm text-gray-600">
                          Impact: {opt.impactLevel} • {opt.metricsImprovement.improvementPercentage.toFixed(1)}% improvement
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'islamic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Text Accuracy</h4>
                  <p className="text-2xl font-bold text-emerald-600">
                    {islamicMetrics.textAccuracy ? `${Math.round(islamicMetrics.textAccuracy)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Translation Quality</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {islamicMetrics.translationQuality ? `${Math.round(islamicMetrics.translationQuality)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Citation Compliance</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {islamicMetrics.citationCompliance ? `${Math.round(islamicMetrics.citationCompliance)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Audio Quality</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {islamicMetrics.audioQuality ? `${Math.round(islamicMetrics.audioQuality)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Cultural Sensitivity</h4>
                  <p className="text-2xl font-bold text-indigo-600">
                    {islamicMetrics.culturalSensitivity ? `${Math.round(islamicMetrics.culturalSensitivity)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Spiritual Experience</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {islamicMetrics.userSpiritualExperience ? `${Math.round(islamicMetrics.userSpiritualExperience)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Patterns Learned</h4>
                  <p className="text-2xl font-bold text-blue-600">{systemWisdom.totalPatterns || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Actions Taken</h4>
                  <p className="text-2xl font-bold text-green-600">{systemWisdom.totalActions || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Success Rate</h4>
                  <p className="text-2xl font-bold text-emerald-600">
                    {systemWisdom.successRate ? `${Math.round(systemWisdom.successRate * 100)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Avg Impact</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {systemWisdom.averageImpact ? `${Math.round(systemWisdom.averageImpact)}%` : 'N/A'}
                  </p>
                </div>
              </div>

              {systemWisdom.predictions && systemWisdom.predictions.length > 0 && (
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">🔮</span>
                    AI Predictions
                  </h3>
                  <div className="space-y-3">
                    {systemWisdom.predictions.slice(0, 5).map((prediction: any) => (
                      <div key={prediction.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{prediction.description}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Probability: {Math.round(prediction.probability * 100)}% • Timeline: {prediction.timeline}
                            </p>
                            <p className="text-sm text-blue-600 mt-2">
                              💡 {prediction.recommendedAction}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prediction.probability > 0.8 ? 'bg-red-100 text-red-800' :
                            prediction.probability > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {Math.round(prediction.probability * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AutoFixDashboard
