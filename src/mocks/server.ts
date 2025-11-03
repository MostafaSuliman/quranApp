/**
 * MSW Server Setup
 *
 * Configures Mock Service Worker for different environments:
 * - Node.js for unit/integration tests
 * - Browser for development and manual testing
 */

import { setupServer } from 'msw/node'
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Node.js server for testing
export const server = setupServer(...handlers)

// Browser worker for development
export const worker = setupWorker(...handlers)

// Server lifecycle management for tests
export const startMockServer = () => {
  server.listen({
    onUnhandledRequest: 'warn'
  })
}

export const stopMockServer = () => {
  server.close()
}

export const resetMockServer = () => {
  server.resetHandlers()
}

// Browser worker lifecycle
export const startMockWorker = async () => {
  if (typeof window !== 'undefined') {
    await worker.start({
      onUnhandledRequest: 'warn'
    })
  }
}

export const stopMockWorker = () => {
  if (typeof window !== 'undefined') {
    worker.stop()
  }
}

// Development mode helper
export const enableMocking = async () => {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    await startMockWorker()
    console.log('🔶 MSW: Mock Service Worker enabled')
  }
}
