/**
 * Audio Test Component for CORS/CSP Validation
 * Tests audio loading from everyayah.com after configuration fixes
 */

import React, { useState, useEffect } from 'react'
import { runAudioTests, logTestResults, AudioTestResult } from '../utils/audioTestUtils'

interface TestResults {
  cspStatus: 'pass' | 'fail'
  corsStatus: 'pass' | 'fail'
  proxyStatus: 'pass' | 'fail'
  waveSurferStatus: 'pass' | 'fail'
  recommendations: string[]
  results: {
    fallback: {
      direct: AudioTestResult
      proxy: AudioTestResult
      recommended: 'direct' | 'proxy' | 'none'
    }
    waveSurfer: AudioTestResult & { audioElement?: HTMLAudioElement }
  }
}

export const AudioTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setIsLoading(true)
    setError(null)
    setTestResults(null)

    try {
      console.log('🔍 Starting audio CORS/CSP tests...')
      const results = await runAudioTests()
      
      // Log to console for debugging
      logTestResults(results)
      
      setTestResults(results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Audio test error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: 'pass' | 'fail') => {
    return status === 'pass' ? '✅' : '❌'
  }

  const getStatusColor = (status: 'pass' | 'fail') => {
    return status === 'pass' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎵 Audio CORS/CSP Test Suite
        </h2>
        <p className="text-gray-600">
          Validates audio loading from everyayah.com after configuration fixes
        </p>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '🔄 Running Tests...' : '🧪 Run Audio Tests'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">❌ Test Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {testResults && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">{getStatusIcon(testResults.cspStatus)}</div>
              <div className={`font-semibold ${getStatusColor(testResults.cspStatus)}`}>
                CSP Status
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Content Security Policy
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">{getStatusIcon(testResults.corsStatus)}</div>
              <div className={`font-semibold ${getStatusColor(testResults.corsStatus)}`}>
                CORS Status
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Cross-Origin Requests
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">{getStatusIcon(testResults.proxyStatus)}</div>
              <div className={`font-semibold ${getStatusColor(testResults.proxyStatus)}`}>
                Proxy Status
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Development Proxy
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">{getStatusIcon(testResults.waveSurferStatus)}</div>
              <div className={`font-semibold ${getStatusColor(testResults.waveSurferStatus)}`}>
                WaveSurfer
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Audio Player Ready
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {testResults.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-semibold mb-3">💡 Recommendations</h3>
              <ul className="space-y-2">
                {testResults.recommendations.map((rec, index) => (
                  <li key={index} className="text-blue-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Results */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Direct URL Test */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                🔗 Direct URL Test
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={testResults.results.fallback.direct.success ? 'text-green-600' : 'text-red-600'}>
                    {testResults.results.fallback.direct.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span>{testResults.results.fallback.direct.responseTime}ms</span>
                </div>
                {testResults.results.fallback.direct.fileSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span>{Math.round(testResults.results.fallback.direct.fileSize / 1024)}KB</span>
                  </div>
                )}
                {testResults.results.fallback.direct.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-red-700 text-xs">
                    {testResults.results.fallback.direct.error}
                  </div>
                )}
              </div>
            </div>

            {/* Proxy URL Test */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                🔄 Proxy URL Test
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={testResults.results.fallback.proxy.success ? 'text-green-600' : 'text-red-600'}>
                    {testResults.results.fallback.proxy.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span>{testResults.results.fallback.proxy.responseTime}ms</span>
                </div>
                {testResults.results.fallback.proxy.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-red-700 text-xs">
                    {testResults.results.fallback.proxy.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WaveSurfer Test */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              🌊 WaveSurfer Compatibility Test
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={testResults.results.waveSurfer.success ? 'text-green-600' : 'text-red-600'}>
                  {testResults.results.waveSurfer.success ? 'Ready' : 'Failed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="capitalize">{testResults.results.waveSurfer.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Load Time:</span>
                <span>{testResults.results.waveSurfer.responseTime}ms</span>
              </div>
            </div>
            {testResults.results.waveSurfer.error && (
              <div className="mt-3 p-2 bg-red-100 rounded text-red-700 text-xs">
                {testResults.results.waveSurfer.error}
              </div>
            )}
          </div>

          {/* Test URLs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">🔗 Test URLs</h3>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-gray-600">Direct:</span>
                <div className="bg-white p-2 rounded mt-1 break-all">
                  {testResults.results.fallback.direct.url}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Proxy:</span>
                <div className="bg-white p-2 rounded mt-1 break-all">
                  {testResults.results.fallback.proxy.url}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioTestComponent