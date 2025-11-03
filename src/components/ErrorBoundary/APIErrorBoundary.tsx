import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { 
  WifiIcon,
  ArrowPathIcon,
  CloudIcon,
  ServerIcon
} from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  apiName?: string
  fallback?: ReactNode
  enableRetry?: boolean
  enableOfflineMode?: boolean
  retryDelay?: number
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  isRetrying: boolean
  isOnline: boolean
}

class APIErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryDelay = this.props.retryDelay || 2000
  private retryTimeout: number | null = null

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
    isRetrying: false,
    isOnline: navigator.onLine
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  public componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  public componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    if (this.retryTimeout) {
      window.clearTimeout(this.retryTimeout)
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`APIErrorBoundary (${this.props.apiName || 'Unknown API'}) caught an error:`, error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log API-specific error
    this.logAPIError(error, errorInfo)

    // Auto-retry if enabled and conditions are met
    if (this.props.enableRetry && this.state.retryCount < this.maxRetries && this.shouldAutoRetry(error)) {
      this.scheduleRetry()
    }
  }

  private handleOnline = () => {
    this.setState({ isOnline: true })
    // Auto-retry when coming back online if there's an error
    if (this.state.hasError && this.props.enableRetry) {
      this.resetError()
    }
  }

  private handleOffline = () => {
    this.setState({ isOnline: false })
  }

  private shouldAutoRetry = (error: Error): boolean => {
    // Check if error is network-related and worth retrying
    const networkErrors = ['NetworkError', 'TypeError', 'TimeoutError', 'AbortError']
    return networkErrors.some(errorType => 
      error.name.includes(errorType) || 
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('timeout')
    )
  }

  private scheduleRetry = () => {
    this.setState({ isRetrying: true })
    
    this.retryTimeout = window.setTimeout(() => {
      this.resetError()
    }, this.retryDelay * (this.state.retryCount + 1)) // Exponential backoff
  }

  private logAPIError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      level: 'api',
      apiName: this.props.apiName || 'Unknown API',
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      isOnline: this.state.isOnline,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      networkInfo: {
        onLine: navigator.onLine,
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        userAgent: navigator.userAgent
      }
    }

    console.warn('API Error Report:', errorReport)

    // Store API errors for analysis
    try {
      const apiErrors = JSON.parse(sessionStorage.getItem('api_errors') || '[]')
      apiErrors.push(errorReport)
      // Keep only last 20 API errors
      if (apiErrors.length > 20) {
        apiErrors.splice(0, apiErrors.length - 20)
      }
      sessionStorage.setItem('api_errors', JSON.stringify(apiErrors))
    } catch (e) {
      console.error('Failed to store API error:', e)
    }
  }

  private resetError = () => {
    if (this.retryTimeout) {
      window.clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }))
  }

  private manualRetry = () => {
    this.resetError()
  }

  private getErrorIcon = () => {
    if (!this.state.isOnline) {
      return <WifiIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
    }
    
    if (this.state.error?.message.toLowerCase().includes('server')) {
      return <ServerIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
    }
    
    return <CloudIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
  }

  private getErrorMessage = () => {
    if (!this.state.isOnline) {
      return {
        title: 'No Internet Connection / لا يوجد اتصال بالإنترنت',
        description: 'Please check your internet connection and try again. / يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
      }
    }

    if (this.state.error?.message.toLowerCase().includes('server')) {
      return {
        title: 'Server Error / خطأ في الخادم',
        description: 'Our servers are experiencing issues. Please try again in a moment. / تواجه خوادمنا مشاكل. يرجى المحاولة مرة أخرى بعد قليل.'
      }
    }

    return {
      title: 'Connection Error / خطأ في الاتصال',
      description: 'Unable to load content. Please check your connection. / لا يمكن تحميل المحتوى. يرجى التحقق من الاتصال.'
    }
  }

  private renderAPIError = () => {
    const errorMessage = this.getErrorMessage()
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
            {this.getErrorIcon()}
          </div>
          
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
            {errorMessage.title}
          </h3>
          
          <p className="text-blue-600 dark:text-blue-400 mb-4 leading-relaxed">
            {errorMessage.description}
          </p>

          {/* API Context */}
          {this.props.apiName && (
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Service:</span> {this.props.apiName}
              </p>
              {this.state.retryCount > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Attempt {this.state.retryCount + 1} of {this.maxRetries + 1}
                </p>
              )}
            </div>
          )}

          {/* Retry Section */}
          {this.props.enableRetry && (
            <div className="space-y-3">
              {this.state.isRetrying ? (
                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Retrying... / جاري إعادة المحاولة...</span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.manualRetry}
                  disabled={this.state.retryCount >= this.maxRetries}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  {this.state.retryCount >= this.maxRetries ? 'Max Retries Reached' : 'Try Again / المحاولة مرة أخرى'}
                </motion.button>
              )}
            </div>
          )}

          {/* Offline Mode */}
          {this.props.enableOfflineMode && !this.state.isOnline && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Offline Mode:</strong> Some features may be limited while offline.
                / <strong>وضع عدم الاتصال:</strong> بعض الميزات قد تكون محدودة أثناء عدم الاتصال.
              </p>
            </div>
          )}

          {/* Islamic Comfort */}
          <div className="mt-6 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
            <p className="arabic-text text-emerald-800 dark:text-emerald-300 text-sm mb-1">
              ﴿وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ﴾
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              And He is with you wherever you are
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return this.renderAPIError()
    }

    return this.props.children
  }
}

export default APIErrorBoundary