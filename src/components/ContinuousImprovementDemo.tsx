import React, { useState, useEffect } from 'react'
import { useAnalyticsStore } from '../stores/analyticsStore'
import { useOptimizationEngineStore } from '../stores/optimizationEngineStore'
import { usePerformanceMonitorStore } from '../stores/performanceMonitorStore'
import { useIslamicContentQualityStore } from '../stores/islamicContentQualityStore'
import { usePredictiveEnhancementStore } from '../stores/predictiveEnhancementStore'
import { useContinuousImprovement } from '../hooks/useContinuousImprovement'
import { useAutoEnhancementSystem } from '../hooks/useAutoEnhancementHooks'

/**
 * Continuous Improvement Demo Component
 * 
 * Showcases the capabilities of the continuous improvement architecture
 * with real-time metrics, live demonstrations, and Islamic compliance monitoring
 */
const ContinuousImprovementDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'optimization' | 'performance' | 'quality' | 'predictions'>('overview')
  const [demoMode, setDemoMode] = useState<'live' | 'simulation'>('live')
  const [simulationSpeed, setSimulationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')

  // Store hooks
  const analytics = useAnalyticsStore()
  const optimization = useOptimizationEngineStore()
  const performance = usePerformanceMonitorStore()
  const islamicQuality = useIslamicContentQualityStore()
  const predictive = usePredictiveEnhancementStore()

  // Enhancement system hooks
  const continuousImprovement = useContinuousImprovement({
    cycleInterval: demoMode === 'simulation' ? 10000 : 300000, // 10s for demo, 5min for live
    learningRate: 0.15,
    validationThreshold: 0.75,
    islamicComplianceCheck: true,
    autoApplyLowRisk: true
  })

  const autoEnhancement = useAutoEnhancementSystem({
    enabledHooks: ['performance', 'interaction', 'quran', 'audio', 'progress'],
    performanceTracking: true,
    analyticsTracking: true,
    islamicContentValidation: true,
    predictiveOptimization: true
  })

  // Demo state
  const [liveMetrics, setLiveMetrics] = useState({
    userInteractions: 0,
    performanceScore: 85,
    islamicComplianceScore: 98,
    optimizationsApplied: 0,
    predictionAccuracy: 82
  })

  // Simulate real-time data for demonstration
  useEffect(() => {
    if (demoMode === 'simulation') {
      const speedMultiplier = { slow: 0.5, normal: 1, fast: 2 }[simulationSpeed]
      
      const interval = setInterval(() => {
        setLiveMetrics(prev => ({
          userInteractions: prev.userInteractions + Math.floor(Math.random() * 5) + 1,
          performanceScore: Math.max(60, Math.min(100, prev.performanceScore + (Math.random() - 0.5) * 4)),
          islamicComplianceScore: Math.max(90, Math.min(100, prev.islamicComplianceScore + (Math.random() - 0.5) * 2)),
          optimizationsApplied: prev.optimizationsApplied + (Math.random() > 0.7 ? 1 : 0),
          predictionAccuracy: Math.max(70, Math.min(95, prev.predictionAccuracy + (Math.random() - 0.5) * 3))
        }))
      }, 2000 / speedMultiplier)

      return () => clearInterval(interval)
    }
  }, [demoMode, simulationSpeed])

  // Generate demo data for simulation mode
  const generateDemoInteraction = () => {
    const demoActions = [
      'read_quran', 'play_audio', 'memorize_ayah', 'search_verse', 'change_settings',
      'bookmark_ayah', 'share_verse', 'check_progress', 'use_memorization_tools'
    ]
    
    const action = demoActions[Math.floor(Math.random() * demoActions.length)]
    
    analytics.trackInteraction({
      type: action.includes('audio') ? 'audio' : action.includes('memorize') ? 'memorization' : 'navigation',
      action,
      context: {
        surahNumber: Math.floor(Math.random() * 114) + 1,
        ayahNumber: Math.floor(Math.random() * 286) + 1,
        component: 'demo_interaction'
      },
      performance: {
        loadTime: Math.random() * 2000 + 500,
        responseTime: Math.random() * 1000 + 200
      }
    })
  }

  const generateDemoOptimization = async () => {
    const optimizations = [
      'cache_frequent_surahs',
      'adaptive_font_size', 
      'audio_preload_prediction',
      'memorization_spaced_repetition'
    ]
    
    const optId = optimizations[Math.floor(Math.random() * optimizations.length)]
    switch (optId) {
      case 'cache_frequent_surahs':
        await optimization.optimizeSmartCaching()
        break
      case 'adaptive_font_size':
        await optimization.analyzeUIPatterns()
        break
      case 'audio_preload_prediction':
        await optimization.optimizeAudioExperience()
        break
      case 'memorization_spaced_repetition':
        await optimization.optimizeMemorizationSettings({})
        break
      default:
        await optimization.runOptimizationCycle()
    }
  }

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl ml-2">🚀</span>
          Continuous Improvement System Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">System Status</span>
              <span className={`w-3 h-3 rounded-full ${continuousImprovement.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {continuousImprovement.isRunning ? 'Active' : 'Inactive'}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Cycles</span>
              <span className="text-blue-500">🔄</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{continuousImprovement.totalCycles}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Performance Score</span>
              <span className="text-green-500">⚡</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{liveMetrics.performanceScore}%</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Islamic Compliance</span>
              <span className="text-purple-500">🕌</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{liveMetrics.islamicComplianceScore}%</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Optimizations Applied</span>
              <span className="text-orange-500">🎯</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{liveMetrics.optimizationsApplied}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Prediction Accuracy</span>
              <span className="text-indigo-500">🔮</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{liveMetrics.predictionAccuracy}%</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Recent Enhancement Activity</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Smart caching optimized for frequently accessed Surahs</p>
            <p>• Audio preloading improved based on usage patterns</p>
            <p>• Arabic font size automatically adjusted for better readability</p>
            <p>• Memorization intervals optimized using spaced repetition</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Demo Controls</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Demo Mode</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setDemoMode('live')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  demoMode === 'live'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Live System
              </button>
              <button
                onClick={() => setDemoMode('simulation')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  demoMode === 'simulation'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Simulation
              </button>
            </div>
          </div>

          {demoMode === 'simulation' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Simulation Speed</label>
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="slow">Slow (0.5x)</option>
                <option value="normal">Normal (1x)</option>
                <option value="fast">Fast (2x)</option>
              </select>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={generateDemoInteraction}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
            >
              Generate Interaction
            </button>
            <button
              onClick={generateDemoOptimization}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              Trigger Optimization
            </button>
            <button
              onClick={() => continuousImprovement.runCycleNow()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
            >
              Run Cycle Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const AnalyticsTab = () => {
    const metrics = autoEnhancement.metrics()
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Analytics Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">User Interactions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interactions</span>
                  <span className="font-bold">{analytics.interactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Navigation Events</span>
                  <span className="font-bold">
                    {analytics.interactions.filter(i => i.type === 'navigation').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Audio Usage</span>
                  <span className="font-bold">
                    {analytics.interactions.filter(i => i.type === 'audio').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memorization Activity</span>
                  <span className="font-bold">
                    {analytics.interactions.filter(i => i.type === 'memorization').length}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Feature Utilization</h4>
              <div className="space-y-2">
                {analytics.featureUtilization.slice(0, 5).map(feature => (
                  <div key={feature.featureId} className="flex justify-between">
                    <span className="text-gray-600">{feature.name}</span>
                    <span className="font-bold">{feature.usageCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">Hook Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metrics.byCategory).map(([category, hooks]) => (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 capitalize mb-2">{category}</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Hooks Active</span>
                      <span className="font-bold">{hooks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-bold">
                        {hooks.length > 0 
                          ? Math.round((hooks.reduce((sum, h) => sum + h.successRate, 0) / hooks.length) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const OptimizationTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Optimization Engine</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Active Optimizations</h4>
            <div className="space-y-3">
              {optimization.optimizationRules.filter(r => r.isActive).slice(0, 4).map(rule => (
                <div key={rule.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-green-800">{rule.name}</p>
                      <p className="text-sm text-green-600">{rule.impact.expectedImprovement}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.priority}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-bold">{Math.round(rule.successRate * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Cache Performance</h4>
            <div className="space-y-3">
              {optimization.cacheStrategies.map(strategy => (
                <div key={strategy.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800 capitalize">
                      {strategy.type.replace('_', ' ')}
                    </span>
                    <span className={`w-3 h-3 rounded-full ${
                      strategy.isEnabled ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                  </div>
                  <div className="mt-2 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hit Rate</span>
                      <span className="font-bold">{Math.round(strategy.performance.hitRate * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Load Time</span>
                      <span className="font-bold">{strategy.performance.avgLoadTime}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">Recent Enhancement Activity</h4>
          <div className="space-y-1 text-sm text-yellow-700">
            {optimization.enhancementLogs.slice(-5).map((log, index) => (
              <div key={index} className="flex justify-between">
                <span>{log.details.ruleName}</span>
                <span className="font-medium">
                  {log.success ? '✅ Success' : '❌ Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const PerformanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Performance Monitoring</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Overall Health</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                performance.overallHealth === 'excellent' ? 'bg-green-100 text-green-800' :
                performance.overallHealth === 'good' ? 'bg-blue-100 text-blue-800' :
                performance.overallHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {performance.overallHealth}
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900">{performance.healthScore}%</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Active Monitoring</span>
              <span className={`w-3 h-3 rounded-full ${
                performance.isMonitoring ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {performance.isMonitoring ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-700">Recent Metrics</span>
              <span className="text-purple-500">📊</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{performance.currentMetrics.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Performance Bottlenecks</h4>
            <div className="space-y-2">
              {performance.bottlenecks.slice(0, 4).map((bottleneck, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-red-800">{bottleneck.component}</p>
                      <p className="text-sm text-red-600">{bottleneck.impact}</p>
                    </div>
                    <span className="text-red-700 font-bold">
                      {bottleneck.severity}/10
                    </span>
                  </div>
                  <p className="text-xs text-red-600 mt-2">{bottleneck.solution}</p>
                </div>
              ))}
              {performance.bottlenecks.length === 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-green-700 font-medium">✅ No performance bottlenecks detected</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Active Alerts</h4>
            <div className="space-y-2">
              {performance.alerts.filter(a => !a.resolved).slice(0, 4).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${
                        alert.severity === 'critical' ? 'text-red-800' :
                        alert.severity === 'high' ? 'text-orange-800' :
                        alert.severity === 'medium' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {alert.metric} Alert
                      </p>
                      <p className={`text-sm ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        Current: {alert.currentValue}, Threshold: {alert.threshold}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
              {performance.alerts.filter(a => !a.resolved).length === 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-green-700 font-medium">✅ No active performance alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const QualityTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🕌 Islamic Content Quality</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Content Score</span>
              <span className="text-green-500">📖</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {Math.round(islamicQuality.overallContentScore * 100)}%
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Compliance Rate</span>
              <span className="text-blue-500">✅</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {Math.round(islamicQuality.complianceRate * 100)}%
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-700">Pending Reviews</span>
              <span className="text-orange-500">⏳</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{islamicQuality.pendingReviews}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Content Rules Status</h4>
            <div className="space-y-3">
              {islamicQuality.contentRules.slice(0, 4).map(rule => (
                <div key={rule.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-purple-800">{rule.name}</p>
                      <p className="text-sm text-purple-600">{rule.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rule.priority}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${
                        rule.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Recent Validations</h4>
            <div className="space-y-2">
              {islamicQuality.validationResults.slice(-4).map((result, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  result.overallStatus === 'compliant' ? 'bg-green-50 border-green-200' :
                  result.overallStatus === 'needs_review' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-medium ${
                        result.overallStatus === 'compliant' ? 'text-green-800' :
                        result.overallStatus === 'needs_review' ? 'text-yellow-800' :
                        'text-red-800'
                      }`}>
                        {result.contentType.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className={`text-sm ${
                        result.overallStatus === 'compliant' ? 'text-green-600' :
                        result.overallStatus === 'needs_review' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        Score: {Math.round(result.overallScore * 100)}%
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.overallStatus === 'compliant' ? 'bg-green-100 text-green-800' :
                      result.overallStatus === 'needs_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.overallStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
              {islamicQuality.validationResults.length === 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-blue-700 font-medium">No validations performed yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const PredictionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔮 Predictive Enhancement</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700">Engine Status</span>
              <span className={`w-3 h-3 rounded-full ${
                predictive.engineEnabled ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
            </div>
            <p className="text-2xl font-bold text-indigo-900">
              {predictive.engineEnabled ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-cyan-700">Accuracy</span>
              <span className="text-cyan-500">🎯</span>
            </div>
            <p className="text-2xl font-bold text-cyan-900">
              {Math.round(predictive.predictionAccuracy * 100)}%
            </p>
          </div>

          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-teal-700">Active Predictions</span>
              <span className="text-teal-500">📊</span>
            </div>
            <p className="text-2xl font-bold text-teal-900">{predictive.activePredictions}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Active Models</h4>
            <div className="space-y-3">
              {predictive.models.filter(m => m.isActive).map(model => (
                <div key={model.id} className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-indigo-800">{model.name}</p>
                      <p className="text-sm text-indigo-600 capitalize">{model.algorithm.replace('_', ' ')}</p>
                    </div>
                    <span className="text-indigo-700 font-bold">
                      {Math.round(model.accuracy * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-indigo-600">
                    <p>Training: {model.trainingData.sampleSize.toLocaleString()} samples</p>
                    <p>Last trained: {new Date(model.lastTrained).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Future Needs Predictions</h4>
            <div className="space-y-2">
              {predictive.futureNeeds.slice(0, 4).map((need, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  need.priority === 'critical' ? 'bg-red-50 border-red-200' :
                  need.priority === 'high' ? 'bg-orange-50 border-orange-200' :
                  need.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${
                        need.priority === 'critical' ? 'text-red-800' :
                        need.priority === 'high' ? 'text-orange-800' :
                        need.priority === 'medium' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {need.description}
                      </p>
                      <p className={`text-sm ${
                        need.priority === 'critical' ? 'text-red-600' :
                        need.priority === 'high' ? 'text-orange-600' :
                        need.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        Demand: {Math.round(need.predictedDemand * 100)}% | 
                        Users: {need.affectedUsers}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      need.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      need.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      need.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {need.priority}
                    </span>
                  </div>
                </div>
              ))}
              {predictive.futureNeeds.length === 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-green-700 font-medium">No critical future needs predicted</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-3">User Personas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictive.userPersonas.map(persona => (
              <div key={persona.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-purple-800">{persona.name}</p>
                    <p className="text-sm text-purple-600 capitalize">
                      {persona.characteristics.islamicPracticeLevel.replace('_', ' ')} • 
                      {persona.characteristics.learningStyle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-700 font-bold">{persona.userCount}</p>
                    <p className="text-xs text-purple-600">users</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-bold">{Math.round(persona.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'optimization', label: 'Optimization', icon: '🎯' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'quality', label: 'Islamic Quality', icon: '🕌' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' }
  ] as const

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Continuous Improvement Architecture Demo
        </h1>
        <p className="text-gray-600">
          Real-time demonstration of the intelligent enhancement system for QuranApp
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'optimization' && <OptimizationTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'quality' && <QualityTab />}
        {activeTab === 'predictions' && <PredictionsTab />}
      </div>

      {/* Status Footer */}
      <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                continuousImprovement.isRunning ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm font-medium text-gray-700">
                Continuous Improvement: {continuousImprovement.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Last Cycle: {continuousImprovement.lastCycle > 0 
                ? new Date(continuousImprovement.lastCycle).toLocaleTimeString()
                : 'Never'
              }
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Demo Mode: <strong className="capitalize">{demoMode}</strong></span>
            {demoMode === 'simulation' && (
              <span>Speed: <strong className="capitalize">{simulationSpeed}</strong></span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContinuousImprovementDemo
