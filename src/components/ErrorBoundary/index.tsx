// Error Boundary Components Export
export { default as AppErrorBoundary } from './AppErrorBoundary'
export { default as PageErrorBoundary } from './PageErrorBoundary'
export { default as ComponentErrorBoundary } from './ComponentErrorBoundary'
export { default as APIErrorBoundary } from './APIErrorBoundary'
export { default as ErrorFallback } from './ErrorFallback'

// Error Boundary Hook for functional components
import React, { useEffect } from 'react'
import AppErrorBoundary from './AppErrorBoundary'
import PageErrorBoundary from './PageErrorBoundary'
import ComponentErrorBoundary from './ComponentErrorBoundary'
import APIErrorBoundary from './APIErrorBoundary'

export const useErrorHandler = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Log to error service
      const errorReport = {
        type: 'unhandled_promise_rejection',
        timestamp: new Date().toISOString(),
        reason: event.reason,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      console.error('Promise Rejection Report:', errorReport)
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      
      // Log to error service
      const errorReport = {
        type: 'global_error',
        timestamp: new Date().toISOString(),
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      console.error('Global Error Report:', errorReport)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])
}

// Higher-order component for adding error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: {
    level?: 'app' | 'page' | 'component' | 'api'
    componentName?: string
    fallback?: React.ReactNode
    enableGracefulDegradation?: boolean
  }
) => {
  const WrappedComponent = (props: P) => {
    const { level = 'component', ...boundaryProps } = errorBoundaryProps || {}
    
    switch (level) {
      case 'app':
        return (
          <AppErrorBoundary {...boundaryProps}>
            <Component {...props} />
          </AppErrorBoundary>
        )
      case 'page':
        return (
          <PageErrorBoundary {...boundaryProps}>
            <Component {...props} />
          </PageErrorBoundary>
        )
      case 'api':
        return (
          <APIErrorBoundary {...boundaryProps}>
            <Component {...props} />
          </APIErrorBoundary>
        )
      default:
        return (
          <ComponentErrorBoundary {...boundaryProps}>
            <Component {...props} />
          </ComponentErrorBoundary>
        )
    }
  }
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}