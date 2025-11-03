import React, { useEffect, useState } from 'react'
import { usePerformanceMonitorStore } from '../stores/performanceMonitorStore'

export const PerformanceDemo: React.FC = () => {
  const {
    isMonitoring,
    healthScore,
    overallHealth,
    sub50msMonitoring,
    coreWebVitalsTargets,
    islamicContentPerformance,
    networkAwareOptimization,
    autoOptimizations,
    realTimeOptimizations,
    initialize,
    measureSub50msResponse,
    measureArabicTextRendering,
    optimizeQuranContent,
    optimizeArabicText,
    getRealTimeOptimizationStatus,
    getPerformanceInsights
  } = usePerformanceMonitorStore()

  const [demoMetrics, setDemoMetrics] = useState({
    arabicRenderTime: 0,
    apiResponseTime: 0,
    optimizationCount: 0
  })

  useEffect(() => {
    if (!isMonitoring) {
      initialize()
    }
  }, [isMonitoring, initialize])

  const simulateArabicTextRender = () => {
    const startTime = performance.now()
    
    // Simulate Arabic text rendering
    const arabicText = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
    const textLength = arabicText.length
    
    setTimeout(() => {
      const renderTime = performance.now() - startTime
      setDemoMetrics(prev => ({ ...prev, arabicRenderTime: renderTime }))
      measureArabicTextRendering(textLength, renderTime)
    }, Math.random() * 150 + 50) // Random render time 50-200ms
  }

  const simulateApiCall = () => {
    const startTime = performance.now()
    
    setTimeout(() => {
      const responseTime = performance.now() - startTime
      setDemoMetrics(prev => ({ ...prev, apiResponseTime: responseTime }))
      measureSub50msResponse('quran_api', responseTime)
    }, Math.random() * 100 + 25) // Random response time 25-125ms
  }

  const triggerOptimization = async () => {
    await optimizeQuranContent()
    await optimizeArabicText()
    setDemoMetrics(prev => ({ ...prev, optimizationCount: prev.optimizationCount + 1 }))
  }

  const optimizationStatus = getRealTimeOptimizationStatus()
  const insights = getPerformanceInsights()

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getNetworkColor = (type: string) => {
    switch (type) {
      case 'slow-2g':
      case '2g': return 'text-red-500'
      case '3g': return 'text-yellow-500'
      case '4g':
      case '5g':
      case 'wifi': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🚀 Real-Time Performance Monitor
        </h2>
        <p className="text-gray-600">
          Enhanced performance monitoring with sub-50ms optimization, Arabic font acceleration, 
          and Islamic content-specific improvements
        </p>
      </div>

      {/* Overall Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Overall Health</h3>
          <div className={`text-2xl font-bold ${getHealthColor(overallHealth)}`}>
            {healthScore}/100
          </div>
          <div className={`text-sm ${getHealthColor(overallHealth)}`}>
            {overallHealth.toUpperCase()}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Sub-50ms Success</h3>
          <div className="text-2xl font-bold text-green-600">
            {sub50msMonitoring.successRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            Avg: {sub50msMonitoring.averageResponseTime.toFixed(1)}ms
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Optimizations</h3>
          <div className="text-2xl font-bold text-purple-600">
            {realTimeOptimizations.length}
          </div>
          <div className="text-sm text-gray-600">
            Active optimizations
          </div>
        </div>
      </div>

      {/* Core Web Vitals Targets */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📊 Core Web Vitals Auto-Improvement
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(coreWebVitalsTargets).map(([vital, data]) => (
            <div key={vital} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-600">{vital}</div>
              <div className={`text-lg font-bold ${getHealthColor(data.status)}`}>
                {data.current.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">
                Target: {data.target}
              </div>
              {data.autoImprovement.enabled && (
                <div className="text-xs text-green-500 mt-1">
                  ✓ Auto-improving
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Islamic Content Performance */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🕌 Islamic Content Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Arabic Text Rendering</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Render Time:</span>
                <span className="text-sm font-medium">
                  {islamicContentPerformance.arabicTextRendering.renderTime}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Optimization:</span>
                <span className="text-sm font-medium text-green-600">
                  {islamicContentPerformance.arabicTextRendering.optimizationLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Font Cache:</span>
                <span className="text-sm font-medium">
                  {(islamicContentPerformance.arabicTextRendering.cacheHitRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Quran Audio</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Compression:</span>
                <span className="text-sm font-medium">
                  {islamicContentPerformance.quranAudio.compressionLevel}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Preload Strategy:</span>
                <span className="text-sm font-medium text-blue-600">
                  {islamicContentPerformance.quranAudio.preloadStrategy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quality Maintained:</span>
                <span className="text-sm font-medium">
                  {(islamicContentPerformance.quranAudio.qualityMaintained * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network-Aware Optimization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🌐 Network-Aware Optimization
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Connection</div>
              <div className={`font-medium ${getNetworkColor(networkAwareOptimization.connectionType)}`}>
                {networkAwareOptimization.connectionType || 'Detecting...'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Audio Quality</div>
              <div className="font-medium">
                {networkAwareOptimization.adaptiveQuality.audioQuality}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Image Quality</div>
              <div className="font-medium">
                {networkAwareOptimization.adaptiveQuality.imageQuality}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Bundle Strategy</div>
              <div className="font-medium">
                {networkAwareOptimization.adaptiveQuality.bundleStrategy}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Optimizations Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          ⚡ Auto-Optimizations Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(autoOptimizations).map(([key, config]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className={`text-sm ${config.enabled ? 'text-green-500' : 'text-gray-400'}`}>
                  {config.enabled ? '✓' : '○'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            💡 Performance Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.severity === 'high' ? 'bg-red-50 border-red-500' :
                  insight.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="font-medium text-gray-800">{insight.message}</div>
                <div className="text-sm text-gray-600 mt-1">{insight.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Controls */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🎮 Performance Testing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={simulateArabicTextRender}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Arabic Rendering
          </button>
          <button
            onClick={simulateApiCall}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Sub-50ms API
          </button>
          <button
            onClick={triggerOptimization}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Trigger Optimization
          </button>
        </div>

        {/* Demo Metrics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Last Arabic Render</div>
            <div className="font-medium">
              {demoMetrics.arabicRenderTime.toFixed(1)}ms
            </div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Last API Response</div>
            <div className="font-medium">
              {demoMetrics.apiResponseTime.toFixed(1)}ms
            </div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Optimizations Triggered</div>
            <div className="font-medium">
              {demoMetrics.optimizationCount}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">🔥 Real-Time Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Sub-50ms Active:</span>
            <span className={`ml-2 ${optimizationStatus.sub50msSuccess > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
              {optimizationStatus.sub50msSuccess > 80 ? '✓' : '⚠'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Web Vitals:</span>
            <span className={`ml-2 ${optimizationStatus.coreWebVitalsHealth ? 'text-green-600' : 'text-yellow-600'}`}>
              {optimizationStatus.coreWebVitalsHealth ? '✓' : '⚠'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Islamic Content:</span>
            <span className={`ml-2 ${optimizationStatus.islamicContentOptimized ? 'text-green-600' : 'text-yellow-600'}`}>
              {optimizationStatus.islamicContentOptimized ? '✓' : '⚠'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Auto-Optimizations:</span>
            <span className={`ml-2 ${optimizationStatus.autoOptimizationsActive ? 'text-green-600' : 'text-yellow-600'}`}>
              {optimizationStatus.autoOptimizationsActive ? '✓' : '⚠'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDemo