/**
 * Performance Dashboard Component for QuranApp
 * 
 * Real-time performance monitoring dashboard with Islamic app-specific
 * optimizations, Core Web Vitals tracking, and automated enhancement controls.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  MusicalNoteIcon,
  LanguageIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  compact?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose,
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'audio' | 'arabic' | 'optimizations'>('overview');
  
  const {
    performanceState,
    audioPerformance,
    arabicTextPerformance,
    manualOptimization,
    measurePerformance
  } = usePerformanceOptimization({
    enableAutoOptimization: true,
    enableRealTimeMonitoring: true,
    enableAudioOptimization: true,
    enableArabicTextOptimization: true,
    enableMemoryOptimization: true
  });

  const { metrics, performanceScore, trend, optimizationsApplied, recommendations, isOptimizing } = performanceState;

  /**
   * Get score color based on performance
   */
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  /**
   * Get metric status color
   */
  const getMetricStatus = (value: number | null | undefined, goodThreshold: number, needsImprovementThreshold: number) => {
    if (!value) return 'gray';
    if (value <= goodThreshold) return 'green';
    if (value <= needsImprovementThreshold) return 'yellow';
    return 'red';
  };

  /**
   * Format time values
   */
  const formatTime = (ms: number | null | undefined) => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  /**
   * Format memory values
   */
  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 ${
            compact ? 'w-96 h-96' : 'w-5/6 max-w-4xl h-5/6 max-h-[600px]'
          } overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Dashboard
              </h2>
              <div className="flex items-center gap-1">
                {trend === 'improving' && (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                )}
                {trend === 'degrading' && (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                  {performanceScore}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isOptimizing && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-primary-600 dark:text-primary-400"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </motion.div>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!compact && (
            /* Tab Navigation */
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'audio', label: 'Audio', icon: MusicalNoteIcon },
                { id: 'arabic', label: 'Arabic', icon: LanguageIcon },
                { id: 'optimizations', label: 'Optimizations', icon: BoltIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {(compact || activeTab === 'overview') && (
              <div className="space-y-4">
                {/* Core Web Vitals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* LCP */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">LCP</span>
                      <div className={`w-3 h-3 rounded-full ${
                        getMetricStatus(metrics.lcp, 2500, 4000) === 'green' ? 'bg-green-500' :
                        getMetricStatus(metrics.lcp, 2500, 4000) === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTime(metrics.lcp)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Largest Contentful Paint
                    </div>
                  </div>

                  {/* FID */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">FID</span>
                      <div className={`w-3 h-3 rounded-full ${
                        getMetricStatus(metrics.fid, 100, 300) === 'green' ? 'bg-green-500' :
                        getMetricStatus(metrics.fid, 100, 300) === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTime(metrics.fid)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      First Input Delay
                    </div>
                  </div>

                  {/* CLS */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">CLS</span>
                      <div className={`w-3 h-3 rounded-full ${
                        getMetricStatus(metrics.cls, 0.1, 0.25) === 'green' ? 'bg-green-500' :
                        getMetricStatus(metrics.cls, 0.1, 0.25) === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {metrics.cls?.toFixed(3) || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Cumulative Layout Shift
                    </div>
                  </div>
                </div>

                {/* Memory Usage */}
                {metrics.memoryUsage && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Memory Usage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Used</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatMemory(metrics.memoryUsage.usedJSHeapSize)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatMemory(metrics.memoryUsage.totalJSHeapSize)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Limit</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatMemory(metrics.memoryUsage.jsHeapSizeLimit)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Usage</span>
                        <span>
                          {((metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Performance Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {recommendations.slice(0, compact ? 2 : 5).map((recommendation, index) => (
                        <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!compact && activeTab === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MusicalNoteIcon className="w-5 h-5" />
                  Audio Performance Controls
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => measurePerformance('Audio Buffer Optimization', audioPerformance.optimizeBuffer)}
                    className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 text-left hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <div className="font-medium text-primary-900 dark:text-primary-100">Optimize Audio Buffer</div>
                    <div className="text-sm text-primary-600 dark:text-primary-400">
                      Adjust buffer size based on connection speed
                    </div>
                  </button>

                  <button
                    onClick={() => measurePerformance('Audio Preloading', () => audioPerformance.preloadNext(3))}
                    className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 text-left hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <div className="font-medium text-primary-900 dark:text-primary-100">Preload Next Audio</div>
                    <div className="text-sm text-primary-600 dark:text-primary-400">
                      Preload next 3 ayah audio files
                    </div>
                  </button>

                  <button
                    onClick={() => measurePerformance('Audio Cache Clear', audioPerformance.clearAudioCache)}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <div className="font-medium text-red-900 dark:text-red-100">Clear Audio Cache</div>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Free up memory by clearing cached audio
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      const latency = await audioPerformance.measureAudioLatency();
                      console.log(`🎵 Audio Latency: ${latency.toFixed(2)}ms`);
                    }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="font-medium text-blue-900 dark:text-blue-100">Measure Latency</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Test audio loading and playback latency
                    </div>
                  </button>
                </div>
              </div>
            )}

            {!compact && activeTab === 'arabic' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <LanguageIcon className="w-5 h-5" />
                  Arabic Text Performance Controls
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => measurePerformance('Arabic Rendering Optimization', arabicTextPerformance.optimizeRendering)}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-left hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="font-medium text-green-900 dark:text-green-100">Optimize Rendering</div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Improve Arabic text rendering performance
                    </div>
                  </button>

                  <button
                    onClick={() => measurePerformance('Arabic Font Preloading', arabicTextPerformance.preloadFonts)}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="font-medium text-blue-900 dark:text-blue-100">Preload Arabic Fonts</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Load Amiri, Cairo, and Scheherazade fonts
                    </div>
                  </button>

                  <button
                    onClick={() => measurePerformance('Layout Stabilization', arabicTextPerformance.stabilizeLayout)}
                    className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-left hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <div className="font-medium text-purple-900 dark:text-purple-100">Stabilize Layout</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      Prevent layout shifts during text rendering
                    </div>
                  </button>

                  <button
                    onClick={() => measurePerformance('RTL Optimization', arabicTextPerformance.optimizeRTL)}
                    className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 text-left hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    <div className="font-medium text-indigo-900 dark:text-indigo-100">Optimize RTL</div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400">
                      Enhance right-to-left text performance
                    </div>
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Arabic Text Performance Test</h4>
                  <button
                    onClick={async () => {
                      const testText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
                      const renderTime = await arabicTextPerformance.measureRenderTime(testText);
                      console.log(`📝 Arabic text render time: ${renderTime.toFixed(2)}ms`);
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Test Render Time
                  </button>
                </div>
              </div>
            )}

            {!compact && activeTab === 'optimizations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BoltIcon className="w-5 h-5" />
                    Applied Optimizations
                  </h3>
                  <button
                    onClick={manualOptimization.optimizeAll}
                    disabled={isOptimizing}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isOptimizing ? 'Optimizing...' : 'Optimize All'}
                  </button>
                </div>

                {optimizationsApplied.length > 0 ? (
                  <div className="space-y-2">
                    {optimizationsApplied.map((optimization, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-green-800 dark:text-green-200">{optimization}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No optimizations applied yet
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={manualOptimization.measureCurrentPerformance}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Metrics
                  </button>
                  <button
                    onClick={() => console.log(manualOptimization.generateReport())}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={manualOptimization.resetOptimizations}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PerformanceDashboard;
