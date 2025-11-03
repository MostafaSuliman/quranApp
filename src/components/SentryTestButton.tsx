/**
 * Sentry Test Button Component
 *
 * Allows testing Sentry error tracking by triggering test errors
 * Only visible in development or when explicitly enabled
 */

import React, { useState } from 'react';
import * as Sentry from '@sentry/react';

interface SentryTestButtonProps {
  visible?: boolean;
}

export const SentryTestButton: React.FC<SentryTestButtonProps> = ({ visible = false }) => {
  const [testResults, setTestResults] = useState<string[]>([]);

  // Only show in development or when explicitly enabled
  const shouldShow = import.meta.env.DEV || visible;

  if (!shouldShow) {
    return null;
  }

  const triggerError = () => {
    try {
      throw new Error('Sentry Test Error - QuranApp Error Monitoring');
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: 'manual',
          component: 'SentryTestButton',
        },
        contexts: {
          test: {
            description: 'Manual error test from SentryTestButton',
            timestamp: new Date().toISOString(),
          },
        },
      });
      setTestResults(prev => [...prev, '✅ Error sent to Sentry']);
    }
  };

  const triggerMessage = () => {
    Sentry.captureMessage('Sentry Test Message - QuranApp Monitoring Active', 'info');
    setTestResults(prev => [...prev, '✅ Message sent to Sentry']);
  };

  const triggerBreadcrumb = () => {
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'Test breadcrumb added',
      level: 'info',
      data: {
        component: 'SentryTestButton',
        action: 'manual_test',
      },
    });
    setTestResults(prev => [...prev, '✅ Breadcrumb added (check next error)']);
  };

  const triggerUncaughtError = () => {
    setTestResults(prev => [...prev, '⚠️ Triggering uncaught error in 1 second...']);
    setTimeout(() => {
      // This will be caught by Sentry's global error handler
      throw new Error('Uncaught Error Test - Global Handler');
    }, 1000);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-emerald-500 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          🛡️ Sentry Test Console
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {import.meta.env.VITE_SENTRY_DSN ? '✅ Enabled' : '❌ Disabled'}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <button
          onClick={triggerError}
          className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Trigger Test Error
        </button>

        <button
          onClick={triggerMessage}
          className="w-full px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Send Test Message
        </button>

        <button
          onClick={triggerBreadcrumb}
          className="w-full px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Add Test Breadcrumb
        </button>

        <button
          onClick={triggerUncaughtError}
          className="w-full px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Trigger Uncaught Error
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Results:</h4>
            <button
              onClick={clearResults}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Check{' '}
          <a
            href="https://sentry.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            Sentry Dashboard
          </a>
          {' '}for errors
        </p>
      </div>
    </div>
  );
};

export default SentryTestButton;
