import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  componentName?: string
  fallback?: ReactNode
  enableGracefulDegradation?: boolean
  hideOnError?: boolean
  showMinimal?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  isHidden: boolean
}

class ComponentErrorBoundary extends Component<Props, State> {
  private maxRetries = 2

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
    isHidden: false
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ComponentErrorBoundary (${this.props.componentName || 'Unknown Component'}) caught an error:`, error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log component-specific error
    this.logComponentError(error, errorInfo)
  }

  private logComponentError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      level: 'component',
      componentName: this.props.componentName || 'Unknown Component',
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    }

    console.warn('Component Error Report:', errorReport)
  }

  private resetError = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    } else if (this.props.hideOnError) {
      this.setState({ isHidden: true })
    }
  }

  private hideComponent = () => {
    this.setState({ isHidden: true })
  }

  private renderMinimalError = () => {
    if (this.props.showMinimal) {
      return (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              Component temporarily unavailable
            </span>
            <button
              onClick={this.resetError}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              title="Retry"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl"
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
            {this.props.componentName ? `${this.props.componentName} Error` : 'Component Error'}
          </h3>
          
          <p className="text-xs text-red-600 dark:text-red-400 mb-4">
            This component encountered an issue. Other parts of the app continue to work normally.
          </p>

          <div className="flex gap-2 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={this.resetError}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-300 text-xs font-medium rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-3 h-3" />
              {this.state.retryCount < this.maxRetries ? 'Retry' : 'Reset'}
            </motion.button>
            
            {this.props.hideOnError && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.hideComponent}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
              >
                <EyeSlashIcon className="w-3 h-3" />
                Hide
              </motion.button>
            )}
          </div>

          {/* Error details for development */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-3 text-left">
              <summary className="cursor-pointer text-xs text-red-500 dark:text-red-400">
                Debug Info
              </summary>
              <div className="mt-1 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs text-red-700 dark:text-red-300 font-mono">
                <div className="mb-1">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <div className="text-xs overflow-auto max-h-20">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.error.stack.substring(0, 200)}
                      {this.state.error.stack.length > 200 && '...'}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </motion.div>
    )
  }

  public render() {
    // If component should be hidden after error
    if (this.state.isHidden) {
      return null
    }

    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // For graceful degradation, show minimal error
      if (this.props.enableGracefulDegradation) {
        return this.renderMinimalError()
      }

      // Default error display
      return this.renderMinimalError()
    }

    return this.props.children
  }
}

export default ComponentErrorBoundary