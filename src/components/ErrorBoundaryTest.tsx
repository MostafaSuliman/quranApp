import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  BeakerIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { ComponentErrorBoundary, APIErrorBoundary } from './ErrorBoundary'

// Component that throws an error when triggered
const BuggyComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('This is a test error from BuggyComponent!')
  }
  
  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
        <BeakerIcon className="w-5 h-5" />
        <span>Component is working fine! ✅</span>
      </div>
    </div>
  )
}

// Component that simulates API errors
const APITestComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Network request failed: Unable to fetch data from server')
  }
  
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
        <BeakerIcon className="w-5 h-5" />
        <span>API connection successful! 🌐</span>
      </div>
    </div>
  )
}

const ErrorBoundaryTest: React.FC = () => {
  const [componentError, setComponentError] = useState(false)
  const [apiError, setAPIError] = useState(false)
  const [showTest, setShowTest] = useState(false)

  if (!showTest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Error Boundary Test</span>
          </div>
          <button
            onClick={() => setShowTest(true)}
            className="text-xs bg-yellow-200 dark:bg-yellow-800 hover:bg-yellow-300 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded transition-colors"
          >
            Run Tests
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Error Boundary Testing Panel
        </h3>
        <button
          onClick={() => setShowTest(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Component Error Test */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            Component Error Boundary Test
          </h4>
          
          <ComponentErrorBoundary
            componentName="Test Component"
            enableGracefulDegradation={true}
          >
            <BuggyComponent shouldError={componentError} />
          </ComponentErrorBoundary>
          
          <div className="flex gap-2">
            <button
              onClick={() => setComponentError(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Trigger Component Error
            </button>
            <button
              onClick={() => setComponentError(false)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Reset Component
            </button>
          </div>
        </div>

        {/* API Error Test */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            API Error Boundary Test
          </h4>
          
          <APIErrorBoundary
            apiName="Test API"
            enableRetry={true}
            enableOfflineMode={true}
          >
            <APITestComponent shouldError={apiError} />
          </APIErrorBoundary>
          
          <div className="flex gap-2">
            <button
              onClick={() => setAPIError(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Trigger API Error
            </button>
            <button
              onClick={() => setAPIError(false)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Reset API
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          How to Test:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Click "Trigger Component Error" to see how component errors are handled</li>
          <li>• Click "Trigger API Error" to see API error handling with retry functionality</li>
          <li>• Each error boundary should show a graceful error message</li>
          <li>• The app should continue working even when components crash</li>
          <li>• Check browser console for error logging details</li>
        </ul>
      </div>

      {/* Islamic Quote */}
      <div className="text-center">
        <p className="arabic-text text-primary-600 dark:text-primary-400 mb-1">
          ﴿وَإِن تَصْبِرُوا وَتَتَّقُوا لَا يَضُرُّكُمْ كَيْدُهُمْ شَيْئًا﴾
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          And if you are patient and fear Allah, their plot will not harm you at all
        </p>
      </div>
    </motion.div>
  )
}

export default ErrorBoundaryTest