/**
 * Sentry Configuration for QuranApp
 *
 * This file configures error monitoring, performance tracking,
 * and session replay for production monitoring.
 */

import * as Sentry from '@sentry/react';

export interface SentryConfig {
  dsn?: string;
  environment: string;
  release?: string;
  sampleRate: number;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Initialize Sentry error monitoring
 *
 * @param config - Sentry configuration options
 */
export function initSentry(config: Partial<SentryConfig> = {}): void {
  const environment = import.meta.env.MODE || 'development';

  // Only initialize in production or if explicitly configured
  if (environment === 'development' && !config.dsn) {
    console.log('Sentry: Skipping initialization in development mode');
    return;
  }

  const sentryConfig: SentryConfig = {
    dsn: config.dsn || import.meta.env.VITE_SENTRY_DSN,
    environment: config.environment || environment,
    release: config.release || import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Sample rates
    sampleRate: config.sampleRate ?? 1.0, // 100% of errors
    tracesSampleRate: config.tracesSampleRate ?? 0.1, // 10% of transactions
    replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1, // 10% of sessions
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0, // 100% of sessions with errors
  };

  if (!sentryConfig.dsn) {
    console.warn('Sentry: DSN not configured, error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: sentryConfig.tracesSampleRate,

    // Session Replay
    replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,
    replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,

    // Error filtering
    beforeSend(event, hint) {
      // Filter out certain errors
      const error = hint.originalException as Error;

      // Don't send errors from browser extensions
      if (error && error.stack && error.stack.includes('chrome-extension://')) {
        return null;
      }

      // Don't send network errors in development
      if (sentryConfig.environment === 'development' && error?.message?.includes('NetworkError')) {
        return null;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Random plugins/extensions
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      // Network errors
      'NetworkError',
      'Network request failed',
      // Aborted requests
      'AbortError',
      // React errors that are handled
      'ResizeObserver loop limit exceeded',
    ],

    // Enable debug mode in development
    debug: environment === 'development',
  });

  console.log(`Sentry initialized for ${sentryConfig.environment} environment`);
}

/**
 * Set user context for Sentry
 *
 * @param user - User information
 */
export function setSentryUser(user: {
  id?: string;
  email?: string;
  username?: string;
}): void {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Add custom context to Sentry events
 *
 * @param key - Context key
 * @param value - Context value
 */
export function setSentryContext(key: string, value: Record<string, any>): void {
  Sentry.setContext(key, value);
}

/**
 * Capture an exception manually
 *
 * @param error - Error to capture
 * @param context - Additional context
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message manually
 *
 * @param message - Message to capture
 * @param level - Severity level
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.captureMessage(message, level);
}

/**
 * Add a breadcrumb
 *
 * @param breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}): void {
  Sentry.addBreadcrumb(breadcrumb);
}
