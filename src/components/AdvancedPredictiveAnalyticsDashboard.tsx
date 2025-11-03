/**
 * Advanced Predictive Analytics Dashboard
 * Showcases ML-powered user behavior prediction, personalized adaptations,
 * and Islamic learning optimizations
 */

import React, { useEffect, useState } from 'react'
import { useAdvancedPredictiveAnalytics } from '../hooks/useAdvancedPredictiveAnalytics'

interface DashboardProps {
  userId?: string
  className?: string
}

const AdvancedPredictiveAnalyticsDashboard: React.FC<DashboardProps> = ({ 
  userId = 'demo_user',
  className = ''
}) => {
  const {
    state,
    actions,
    getOptimalStudyTime,
    // getCurrentAdaptations, // Unused
    getIslamicGuidance,
    getPersonalizedContent,
    getOptimalReadingSpeed,
    getCurrentIslamicTime,
    getRamadanOptimizations
  } = useAdvancedPredictiveAnalytics(userId)

  const [selectedTab, setSelectedTab] = useState<'predictions' | 'adaptations' | 'insights' | 'ramadan'>('predictions')
  const [isGeneratingPredictions, setIsGeneratingPredictions] = useState(false)

  // Auto-generate predictions on component mount
  useEffect(() => {
    const initializePredictions = async () => {
      setIsGeneratingPredictions(true)
      try {
        await actions.generatePredictions(userId)
        await actions.generateStudyRecommendations(userId)
        await actions.generateUIAdaptations(userId)
        await actions.generateContentPreloading(userId)
        await actions.generateIslamicInsights(userId)
        await actions.optimizeForCurrentTime()
      } finally {
        setIsGeneratingPredictions(false)
      }
    }

    initializePredictions()
  }, [userId, actions])

  const handleEnableRamadanMode = async () => {
    await actions.enableRamadanMode()
  }

  const handleUpdateEnergyLevel = async (level: number) => {
    await actions.adjustForEnergyLevel(level)
  }

  const handleValidatePrediction = (predictionId: string, successful: boolean) => {
    actions.validatePrediction(predictionId, { success: successful, timestamp: Date.now() })
  }

  const islamicTime = getCurrentIslamicTime()
  const personalizedContent = getPersonalizedContent()
  const optimalStudyTime = getOptimalStudyTime()
  const optimalReadingSpeed = getOptimalReadingSpeed()
  const islamicGuidance = getIslamicGuidance()
  const ramadanOptimizations = getRamadanOptimizations()

  const renderModelHealthIndicator = (modelId: string, health: { status: 'excellent' | 'good' | 'fair' | 'poor'; accuracy: number }) => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      fair: 'bg-yellow-500',
      poor: 'bg-red-500'
    }

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${colors[health.status]}`}></div>
        <span className="text-sm font-medium">{modelId.replace(/_/g, ' ')}</span>
        <span className="text-xs text-gray-600">{(health.accuracy * 100).toFixed(1)}%</span>
      </div>
    )
  }

  const renderPredictionCard = (prediction: any) => (
    <div key={prediction.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 capitalize">
            {prediction.predictionType.replace(/_/g, ' ')}
          </h4>
          <p className="text-sm text-gray-600">{prediction.prediction.primaryAction}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {(prediction.prediction.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
      </div>
      
      {prediction.prediction.islamicConsiderations.length > 0 && (
        <div className="mb-3">
          <h5 className="text-sm font-medium text-green-700 mb-1">Islamic Guidance:</h5>
          <ul className="text-xs text-green-600 space-y-1">
            {prediction.prediction.islamicConsiderations.slice(0, 2).map((consideration: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="mr-1">•</span>
                <span className="capitalize">{consideration.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Model: {prediction.mlModelUsed}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleValidatePrediction(prediction.id, true)}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            ✓ Correct
          </button>
          <button
            onClick={() => handleValidatePrediction(prediction.id, false)}
            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            ✗ Incorrect
          </button>
        </div>
      </div>
    </div>
  )

  const renderAdaptationCard = (adaptation: any) => (
    <div key={adaptation.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-purple-900 capitalize">
            {adaptation.adaptationType.replace(/_/g, ' ')}
          </h4>
          <p className="text-sm text-purple-700">{adaptation.adaptations.reasoning}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-purple-600">
            {adaptation.adaptations.islamicAlignment ? '✓ Islamic Aligned' : '- Not Aligned'}
          </div>
        </div>
      </div>
      
      <div className="bg-white bg-opacity-50 rounded p-2 mb-2">
        <h5 className="text-sm font-medium text-gray-700 mb-1">Changes:</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          {Object.entries(adaptation.adaptations.changes).map(([key, value]) => (
            <li key={key} className="flex justify-between">
              <span className="capitalize">{key.replace(/[-_]/g, ' ')}:</span>
              <span className="font-medium">{String(value)}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="text-xs text-purple-600">
        Expected Impact: {adaptation.adaptations.expectedImpact}
      </div>
    </div>
  )

  const renderInsightCard = (insight: any) => (
    <div key={insight.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-green-900 capitalize">
            {insight.insightType.replace(/_/g, ' ')}
          </h4>
          <p className="text-sm text-green-700">{insight.insight.description}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            {(insight.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-green-500">Confidence</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <h5 className="text-sm font-medium text-green-800 mb-1">Islamic Principles:</h5>
          <ul className="text-xs text-green-600 space-y-1">
            {insight.insight.islamicPrinciples.slice(0, 3).map((principle: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="mr-1">•</span>
                <span className="capitalize">{principle.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-green-800 mb-1">Recommendations:</h5>
          <ul className="text-xs text-green-600 space-y-1">
            {insight.insight.recommendations.slice(0, 2).map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="mr-1">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`bg-gray-50 min-h-screen p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Predictive Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            AI-powered insights for Islamic learning optimization with 90%+ accuracy
          </p>
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {(state.overallAccuracy * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Overall Accuracy</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {state.behaviorPredictions.length}
            </div>
            <div className="text-sm text-gray-600">Active Predictions</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">
              {state.adaptationsActive}
            </div>
            <div className="text-sm text-gray-600">Adaptations Pending</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">
              {(state.predictionConfidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Prediction Confidence</div>
          </div>
        </div>

        {/* Islamic Time Status */}
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg border border-emerald-200 p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-emerald-900 mb-2">Islamic Time Optimization</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-emerald-700">
                    Spiritual Significance: <span className="font-bold">{(islamicTime.spiritualSignificance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-sm text-emerald-700">
                    Recommended Activity: <span className="font-medium capitalize">{islamicTime.recommendedActivity.replace(/_/g, ' ')}</span>
                  </div>
                  {optimalStudyTime && (
                    <div className="text-sm text-emerald-700">
                      Optimal Session: <span className="font-bold">{optimalStudyTime} minutes</span>
                    </div>
                  )}
                </div>
                <div>
                  {islamicTime.guidance.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-emerald-800 mb-1">Guidance:</div>
                      <ul className="text-xs text-emerald-600 space-y-1">
                        {islamicTime.guidance.map((guide, idx) => (
                          <li key={idx}>• {guide}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${islamicTime.isOptimalTime ? 'text-emerald-600' : 'text-gray-500'}`}>
                {islamicTime.isOptimalTime ? '✓ Optimal Time' : '- Regular Time'}
              </div>
              {optimalReadingSpeed && (
                <div className="text-sm text-emerald-700">
                  Reading Speed: {optimalReadingSpeed} WPM
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => actions.generatePredictions(userId)}
              disabled={isGeneratingPredictions}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isGeneratingPredictions ? 'Analyzing...' : 'Generate Predictions'}
            </button>
            
            <button
              onClick={handleEnableRamadanMode}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Enable Ramadan Mode
            </button>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Energy Level:</label>
              <select
                onChange={(e) => handleUpdateEnergyLevel(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>Very High (10)</option>
                <option value={8}>High (8)</option>
                <option value={6}>Medium (6)</option>
                <option value={4}>Low (4)</option>
                <option value={2}>Very Low (2)</option>
              </select>
            </div>
            
            <button
              onClick={() => actions.preloadRecommendedContent()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Preload Content
            </button>
          </div>
        </div>

        {/* Model Health */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">ML Model Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(state.modelHealth).map(([modelId, health]) => (
              <div key={modelId}>
                {renderModelHealthIndicator(modelId, health)}
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'predictions', label: 'Behavior Predictions', count: state.behaviorPredictions.length },
            { id: 'adaptations', label: 'UI Adaptations', count: state.uiAdaptations.length },
            { id: 'insights', label: 'Islamic Insights', count: state.islamicInsights.length },
            { id: 'ramadan', label: 'Ramadan Mode', count: ramadanOptimizations.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'predictions' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Behavior Predictions</h2>
            {state.behaviorPredictions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.behaviorPredictions.slice(0, 9).map(renderPredictionCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No predictions available. Click "Generate Predictions" to start.
              </div>
            )}
          </div>
        )}

        {selectedTab === 'adaptations' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personalized UI Adaptations</h2>
            {state.uiAdaptations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.uiAdaptations.slice(0, 6).map(renderAdaptationCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No adaptations available. Generate predictions to see personalized adaptations.
              </div>
            )}
          </div>
        )}

        {selectedTab === 'insights' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Islamic Learning Insights</h2>
            {state.islamicInsights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.islamicInsights.slice(0, 6).map(renderInsightCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No insights available. Generate insights to see Islamic learning guidance.
              </div>
            )}
          </div>
        )}

        {selectedTab === 'ramadan' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ramadan-Aware Optimizations</h2>
            {state.settings.ramadanMode ? (
              <>
                {ramadanOptimizations.length > 0 ? (
                  <div className="space-y-4">
                    {ramadanOptimizations.map(optimization => (
                      <div key={optimization.id} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-amber-900 capitalize">
                              Day {optimization.ramadanDay} - {optimization.optimizationType.replace(/_/g, ' ')}
                            </h4>
                          </div>
                          <div className="text-right text-sm text-amber-700">
                            <div>Cognitive: {(optimization.fastingImpactFactors.cognitiveAdjustments * 100).toFixed(0)}%</div>
                            <div>Energy: {(optimization.fastingImpactFactors.energyLevelCompensation * 100).toFixed(0)}%</div>
                            <div>Spiritual: {(optimization.fastingImpactFactors.spiritualElevationBoost * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-amber-800 mb-1">Content Priority:</h5>
                            <ul className="text-xs text-amber-600 space-y-1">
                              {optimization.optimizations.contentPriority.slice(0, 3).map((content, idx) => (
                                <li key={idx} className="capitalize">{content.replace(/_/g, ' ')}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-amber-800 mb-1">Spiritual Enhancements:</h5>
                            <ul className="text-xs text-amber-600 space-y-1">
                              {optimization.optimizations.spiritualEnhancements.slice(0, 3).map((enhancement, idx) => (
                                <li key={idx} className="capitalize">{enhancement.replace(/_/g, ' ')}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Ramadan mode is enabled but no specific optimizations are available yet.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">Ramadan mode is not currently enabled.</div>
                <button
                  onClick={handleEnableRamadanMode}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Enable Ramadan Mode
                </button>
              </div>
            )}
          </div>
        )}

        {/* Personalized Content Section */}
        {personalizedContent.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Personalized Content Recommendations</h3>
            <div className="flex flex-wrap gap-2">
              {personalizedContent.slice(0, 8).map((content, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {content.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Islamic Guidance Section */}
        {islamicGuidance.length > 0 && (
          <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
            <h3 className="font-semibold text-green-900 mb-3">Islamic Guidance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {islamicGuidance.slice(0, 6).map((guidance, idx) => (
                <div key={idx} className="text-sm text-green-700 flex items-start">
                  <span className="mr-2">🌟</span>
                  <span className="capitalize">{guidance.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvancedPredictiveAnalyticsDashboard