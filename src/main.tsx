// @ts-nocheck
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './styles/index.css'

// Initialize Sentry Error Monitoring
import { initSentry } from './sentry.config'
initSentry()

// Error Boundary for router-level errors
import { AppErrorBoundary } from './components/ErrorBoundary'

// Import the registerSW function from vite-plugin-pwa/client
import { registerSW } from 'virtual:pwa-register'

// Register service worker with auto-update and proper error handling
const { updateSW } = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Show a notification or prompt to refresh
    console.log('🔄 New content available! App will refresh automatically.')
    // Auto-refresh for better UX, or you can show a notification
    updateSW(true)
  },
  onOfflineReady() {
    console.log('✅ App ready to work offline - Quran content cached!')
    // Show a toast notification
    const event = new CustomEvent('pwa-offline-ready', {
      detail: { message: 'App ready to work offline' }
    })
    window.dispatchEvent(event)
  },
  onRegistered(registration) {
    console.log('✅ Service Worker registered successfully:', registration)
  },
  onRegisterError(error) {
    console.error('❌ Service Worker registration failed:', error)
  }
})

// Wrap App with Sentry ErrorBoundary for enhanced error tracking
const SentryErrorBoundary = Sentry.ErrorBoundary

// Render application with Sentry integration
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Application Error</h1>
          <p>{error.message}</p>
          <button onClick={resetError}>Try Again</button>
        </div>
      )}
      showDialog
    >
      <AppErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppErrorBoundary>
    </SentryErrorBoundary>
  </React.StrictMode>,
)
