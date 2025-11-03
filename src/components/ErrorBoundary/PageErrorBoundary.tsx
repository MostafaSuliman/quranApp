import { Component, ErrorInfo, ReactNode } from 'react'
import ErrorFallback from './ErrorFallback'

interface Props {
  children: ReactNode
  pageName?: string
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

class PageErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`PageErrorBoundary (${this.props.pageName || 'Unknown Page'}) caught an error:`, error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log page-specific error
    this.logPageError(error, errorInfo)
  }

  private logPageError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      level: 'page',
      pageName: this.props.pageName || 'Unknown Page',
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    console.error('Page Error Report:', errorReport)

    // Store in sessionStorage for this session
    try {
      const pageErrors = JSON.parse(sessionStorage.getItem('page_errors') || '[]')
      pageErrors.push(errorReport)
      sessionStorage.setItem('page_errors', JSON.stringify(pageErrors))
    } catch (e) {
      console.error('Failed to store page error:', e)
    }
  }

  private resetError = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    } else {
      // After max retries, redirect to home
      window.location.href = '/'
    }
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const context = this.props.pageName 
        ? `Page: ${this.props.pageName} (Retry ${this.state.retryCount}/${this.maxRetries})`
        : `Page Error (Retry ${this.state.retryCount}/${this.maxRetries})`

      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          level="page"
          context={context}
          allowNavigation={true}
        />
      )
    }

    return this.props.children
  }
}

export default PageErrorBoundary