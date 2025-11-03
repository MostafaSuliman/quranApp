import { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import ErrorFallback from './ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: Date.now().toString()
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('AppErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
      errorId: Date.now().toString()
    })

    // Send error to Sentry with context
    Sentry.withScope((scope) => {
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
      })
      scope.setContext('errorBoundary', {
        level: 'app',
        timestamp: new Date().toISOString(),
        url: window.location.href,
      })
      scope.setLevel('error')
      Sentry.captureException(error)
    })

    // Log to external service in production
    this.logErrorToService(error, errorInfo, 'app')
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo, level: string) => {
    // In a real app, you would send this to your error tracking service
    // For now, we'll just log comprehensive details
    const errorReport = {
      level,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('user_id') || 'anonymous',
      sessionId: sessionStorage.getItem('session_id') || 'no-session'
    }

    console.error('Error Report:', errorReport)
    
    // Store locally for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      existingErrors.push(errorReport)
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10)
      }
      localStorage.setItem('app_errors', JSON.stringify(existingErrors))
    } catch (e) {
      console.error('Failed to store error locally:', e)
    }
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          level="app"
          context="Application Error Boundary"
          allowNavigation={true}
        />
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary