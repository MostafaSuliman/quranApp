/**
 * Performance Widget Component for QuranApp
 * 
 * Compact floating performance monitor that provides real-time
 * performance metrics and quick optimization controls.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';

interface PerformanceWidgetProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onOpenDashboard?: () => void;
  enabled?: boolean;
}

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({
  position = 'bottom-right',
  onOpenDashboard,
  enabled = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptimizations, setShowOptimizations] = useState(false);

  const {
    performanceState,
    audioPerformance,
    arabicTextPerformance,
    manualOptimization
  } = usePerformanceOptimization({
    enableAutoOptimization: true,
    enableRealTimeMonitoring: enabled,
    enableAudioOptimization: true,
    enableArabicTextOptimization: true
  });

  const { 
    metrics, 
    performanceScore, 
    trend, 
    optimizationsApplied, 
    recommendations, 
    isOptimizing 
  } = performanceState;

  if (!enabled) return null;

  /**
   * Get position classes based on prop
   */
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  /**
   * Get score color
   */
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  /**
   * Get performance status
   */
  const getPerformanceStatus = () => {
    if (performanceScore >= 90) return { color: 'bg-green-500', label: 'Excellent' };
    if (performanceScore >= 70) return { color: 'bg-yellow-500', label: 'Good' };
    return { color: 'bg-red-500', label: 'Needs Work' };
  };

  const status = getPerformanceStatus();

  /**
   * Quick optimization actions
   */
  const quickOptimizations = [
    {
      name: 'Audio Buffer',
      action: audioPerformance.optimizeBuffer,
      icon: '🎵',
      description: 'Optimize audio buffering'
    },
    {
      name: 'Arabic Fonts',
      action: arabicTextPerformance.preloadFonts,
      icon: '📝',
      description: 'Preload Arabic fonts'
    },
    {
      name: 'Layout Fix',
      action: arabicTextPerformance.stabilizeLayout,
      icon: '🔧',
      description: 'Stabilize text layout'
    },
    {
      name: 'Memory Clean',
      action: audioPerformance.clearAudioCache,
      icon: '🧹',
      description: 'Clear audio cache'
    }
  ];

  return (
    <div className={`fixed ${getPositionClasses()} z-40 pointer-events-none`}>
      <div className="pointer-events-auto">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{ width: '280px' }}
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Performance
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend === 'improving' && (
                      <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                    )}
                    {trend === 'degrading' && (
                      <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-sm font-bold ${getScoreColor(performanceScore)}`}>
                      {performanceScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-3">
                {/* Core Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">LCP</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">FID</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">CLS</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Memory Usage Bar */}
                {metrics.memoryUsage && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Memory</span>
                      <span>
                        {((metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${(metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Recommendations Alert */}
                {recommendations.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-2">
                    <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-300">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowOptimizations(!showOptimizations)}
                    className="flex-1 bg-primary-600 text-white text-xs px-2 py-1 rounded hover:bg-primary-700 transition-colors"
                  >
                    Quick Fix
                  </button>
                  {onOpenDashboard && (
                    <button
                      onClick={onOpenDashboard}
                      className="flex-1 bg-gray-600 text-white text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      Details
                    </button>
                  )}
                </div>

                {/* Quick Optimizations */}
                <AnimatePresence>
                  {showOptimizations && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1"
                    >
                      {quickOptimizations.map((opt, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            opt.action();
                            setShowOptimizations(false);
                          }}
                          className="w-full flex items-center gap-2 text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                        >
                          <span>{opt.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {opt.name}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              {opt.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recent Optimizations */}
                {optimizationsApplied.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Recent optimizations:
                    </div>
                    <div className="space-y-1">
                      {optimizationsApplied.slice(-2).map((opt, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs">
                          <CheckCircleIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 truncate">
                            {opt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Widget Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Status Indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 ${status.color} rounded-full`}>
            {isOptimizing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-full h-full"
              >
                <ArrowPathIcon className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>

          {/* Trend Indicator */}
          {trend !== 'stable' && (
            <div className="absolute -top-1 -left-1">
              {trend === 'improving' ? (
                <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
              )}
            </div>
          )}

          {/* Main Icon */}
          <div className="relative">
            <ChartBarIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            
            {/* Score Badge */}
            <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {Math.round(performanceScore / 10)}
            </div>
          </div>

          {/* Notification Dot for Recommendations */}
          {recommendations.length > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
            >
              Performance: {status.label} ({performanceScore})
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PerformanceWidget;