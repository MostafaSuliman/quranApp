# Monitoring & Observability Setup Guide

## Overview

Comprehensive monitoring and observability strategy for QuranApp to ensure reliability, performance, and user experience quality.

---

## 1. Error Tracking with Sentry

### 1.1 Setup

**Install Sentry:**
```bash
npm install @sentry/react @sentry/tracing
```

**Configure Sentry:**
```typescript
// src/monitoring/sentry.ts
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { Replay } from "@sentry/replay";

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || 'development',
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/api\.quran\.com/,
          /^https:\/\/everyayah\.com/
        ],
      }),
      new Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Set tracesSampleRate to 1.0 for dev, lower for production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Error filtering
    beforeSend(event, hint) {
      // Don't send events in development
      if (import.meta.env.DEV) {
        console.error('Sentry event:', event, hint);
        return null;
      }

      // Filter out common errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;

        // Ignore network errors from ad blockers
        if (message.includes('AdBlock')) {
          return null;
        }

        // Ignore ResizeObserver errors
        if (message.includes('ResizeObserver')) {
          return null;
        }
      }

      return event;
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Don't log console breadcrumbs in production
      if (breadcrumb.category === 'console') {
        return null;
      }
      return breadcrumb;
    },
  });
}

// Helper functions
export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function logMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}
```

**Initialize in App:**
```typescript
// src/main.tsx
import { initSentry } from './monitoring/sentry';

// Initialize Sentry first
if (import.meta.env.VITE_SENTRY_DSN) {
  initSentry();
}

// ... rest of app initialization
```

### 1.2 Error Boundaries

**Create Error Boundary:**
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', errorInfo);
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-4">We're sorry for the inconvenience.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap with Sentry
export default Sentry.withErrorBoundary(ErrorBoundary, {
  fallback: <div>An error occurred</div>,
  showDialog: true,
});
```

### 1.3 Custom Error Tracking

**Track Custom Events:**
```typescript
// src/monitoring/events.ts
import * as Sentry from '@sentry/react';

export const trackAudioError = (error: Error, context: {
  surah: number;
  ayah: number;
  reciter: string;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'audio_playback');
    scope.setContext('audio', context);
    Sentry.captureException(error);
  });
};

export const trackAPIError = (error: Error, context: {
  endpoint: string;
  method: string;
  status?: number;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'api_call');
    scope.setContext('api', context);
    Sentry.captureException(error);
  });
};

export const trackOfflineError = (operation: string) => {
  Sentry.captureMessage(`Offline operation failed: ${operation}`, 'warning');
};
```

---

## 2. Performance Monitoring

### 2.1 Web Vitals

**Install Web Vitals:**
```bash
npm install web-vitals
```

**Track Core Web Vitals:**
```typescript
// src/monitoring/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import * as Sentry from '@sentry/react';

function sendToAnalytics(metric: any) {
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to Sentry
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    message: `${metric.name}: ${metric.value}`,
    level: 'info',
    data: {
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
    },
  });

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(metric);
  }
}

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

### 2.2 Custom Performance Marks

**Track Custom Metrics:**
```typescript
// src/monitoring/performance.ts
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  mark(name: string) {
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string) {
    const end = endMark || `${name}-end`;
    this.mark(end);

    try {
      performance.measure(name, startMark, end);
      const measure = performance.getEntriesByName(name)[0];

      // Send to analytics
      this.reportMetric(name, measure.duration);

      return measure.duration;
    } catch (error) {
      console.error('Performance measurement error:', error);
      return null;
    }
  }

  private reportMetric(name: string, value: number) {
    // Send to Google Analytics
    window.gtag?.('event', 'timing_complete', {
      name: name,
      value: Math.round(value),
      event_category: 'Performance',
    });

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`⚡ ${name}: ${value.toFixed(2)}ms`);
    }
  }

  // Track specific operations
  trackAudioLoad(duration: number, reciter: string, surah: number) {
    this.reportMetric('audio-load', duration);

    window.gtag?.('event', 'audio_load_time', {
      event_category: 'Audio',
      reciter,
      surah,
      value: Math.round(duration),
    });
  }

  trackVerseRender(duration: number, verseCount: number) {
    this.reportMetric('verse-render', duration);

    window.gtag?.('event', 'verse_render_time', {
      event_category: 'Rendering',
      verse_count: verseCount,
      value: Math.round(duration),
    });
  }

  trackAPICall(endpoint: string, duration: number, success: boolean) {
    this.reportMetric(`api-${endpoint}`, duration);

    window.gtag?.('event', 'api_call_time', {
      event_category: 'API',
      endpoint,
      success,
      value: Math.round(duration),
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

**Usage Example:**
```typescript
// Track audio loading
performanceMonitor.mark('audio-load-start');
await loadAudio(url);
const duration = performanceMonitor.measure('audio-load', 'audio-load-start');
performanceMonitor.trackAudioLoad(duration, reciter, surah);
```

---

## 3. Analytics with Google Analytics 4

### 3.1 Setup

**Install GA4:**
```html
<!-- public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    send_page_view: false // We'll send manually
  });
</script>
```

**Analytics Helper:**
```typescript
// src/monitoring/analytics.ts
export class Analytics {
  private initialized = false;

  init() {
    if (this.initialized || !import.meta.env.PROD) {
      return;
    }

    if (!import.meta.env.VITE_GA_TRACKING_ID) {
      console.warn('GA tracking ID not configured');
      return;
    }

    this.initialized = true;
  }

  // Page tracking
  trackPageView(path: string, title?: string) {
    if (!this.initialized) return;

    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }

  // Event tracking
  trackEvent(category: string, action: string, label?: string, value?: number) {
    if (!this.initialized) return;

    window.gtag?.('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // User actions
  trackAudioPlay(reciter: string, surah: number, ayah: number) {
    this.trackEvent('Audio', 'play', `${reciter}-${surah}:${ayah}`);
  }

  trackAudioPause(reciter: string, surah: number, ayah: number) {
    this.trackEvent('Audio', 'pause', `${reciter}-${surah}:${ayah}`);
  }

  trackVerseMemorized(surah: number, ayah: number) {
    this.trackEvent('Memorization', 'verse_memorized', `${surah}:${ayah}`);
  }

  trackSettingChange(setting: string, value: any) {
    this.trackEvent('Settings', 'change', setting, value);
  }

  trackSearch(query: string, results: number) {
    window.gtag?.('event', 'search', {
      search_term: query,
      search_results: results,
    });
  }

  trackOfflineUsage() {
    this.trackEvent('Offline', 'app_used_offline');
  }

  trackPWAInstall() {
    this.trackEvent('PWA', 'installed');
  }

  // User properties
  setUserProperties(properties: Record<string, any>) {
    window.gtag?.('set', 'user_properties', properties);
  }

  setUserId(userId: string) {
    window.gtag?.('config', import.meta.env.VITE_GA_TRACKING_ID, {
      user_id: userId,
    });
  }
}

export const analytics = new Analytics();
```

### 3.2 React Router Integration

**Track Route Changes:**
```typescript
// src/App.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from './monitoring/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location]);

  // ... rest of app
}
```

---

## 4. Uptime Monitoring

### 4.1 UptimeRobot Setup

**Monitors to Create:**

1. **Homepage Monitor**
   - URL: https://quranapp.example.com
   - Type: HTTP(s)
   - Interval: 5 minutes
   - Alert: Email + SMS

2. **Health Endpoint**
   - URL: https://quranapp.example.com/health
   - Type: HTTP(s)
   - Expected: 200 status
   - Interval: 5 minutes

3. **API Monitor**
   - URL: https://api.quran.com/api/v4/chapters
   - Type: HTTP(s)
   - Interval: 10 minutes

4. **Audio CDN Monitor**
   - URL: https://everyayah.com
   - Type: HTTP(s)
   - Interval: 15 minutes

**Create Health Endpoint:**
```typescript
// public/health.json (static file)
{
  "status": "ok",
  "timestamp": "2025-10-30T00:00:00Z",
  "version": "1.0.0"
}
```

Or create dynamic endpoint if using server:
```typescript
// server/health.ts
export function healthCheck(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  res.status(200).json(health);
}
```

### 4.2 Status Page

**Create Status Page:**
```typescript
// src/pages/Status.tsx
import { useEffect, useState } from 'react';

interface HealthStatus {
  app: 'operational' | 'degraded' | 'down';
  api: 'operational' | 'degraded' | 'down';
  audio: 'operational' | 'degraded' | 'down';
  lastChecked: string;
}

export function StatusPage() {
  const [status, setStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const checks = await Promise.allSettled([
        fetch('/health'),
        fetch('https://api.quran.com/api/v4/chapters'),
        fetch('https://everyayah.com'),
      ]);

      setStatus({
        app: checks[0].status === 'fulfilled' ? 'operational' : 'down',
        api: checks[1].status === 'fulfilled' ? 'operational' : 'down',
        audio: checks[2].status === 'fulfilled' ? 'operational' : 'down',
        lastChecked: new Date().toISOString(),
      });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Status</h1>

      <div className="space-y-4">
        <StatusCard
          name="Application"
          status={status?.app || 'operational'}
        />
        <StatusCard
          name="Quran API"
          status={status?.api || 'operational'}
        />
        <StatusCard
          name="Audio CDN"
          status={status?.audio || 'operational'}
        />
      </div>

      {status && (
        <p className="mt-6 text-sm text-gray-500">
          Last checked: {new Date(status.lastChecked).toLocaleString()}
        </p>
      )}
    </div>
  );
}
```

---

## 5. Real User Monitoring (RUM)

### 5.1 Custom RUM Implementation

**Track User Sessions:**
```typescript
// src/monitoring/rum.ts
export class RealUserMonitoring {
  private sessionId: string;
  private sessionStart: number;
  private interactions: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.trackSession();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackSession() {
    // Track session start
    window.gtag?.('event', 'session_start', {
      session_id: this.sessionId,
    });

    // Track session end on unload
    window.addEventListener('beforeunload', () => {
      const duration = Date.now() - this.sessionStart;

      window.gtag?.('event', 'session_end', {
        session_id: this.sessionId,
        session_duration: duration,
        interactions: this.interactions,
      });
    });
  }

  trackInteraction(type: string, target: string) {
    this.interactions++;

    window.gtag?.('event', 'user_interaction', {
      interaction_type: type,
      target: target,
      session_id: this.sessionId,
    });
  }

  trackError(error: Error) {
    window.gtag?.('event', 'client_error', {
      error_message: error.message,
      error_stack: error.stack,
      session_id: this.sessionId,
    });
  }

  trackPerformanceIssue(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      window.gtag?.('event', 'performance_issue', {
        metric: metric,
        value: value,
        threshold: threshold,
        session_id: this.sessionId,
      });
    }
  }
}

export const rum = new RealUserMonitoring();
```

---

## 6. Logging Strategy

### 6.1 Structured Logging

**Logger Implementation:**
```typescript
// src/monitoring/logger.ts
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = import.meta.env.PROD ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: LogLevel[level],
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Console output
    const logMethod = level === LogLevel.ERROR ? 'error' :
                      level === LogLevel.WARN ? 'warn' :
                      level === LogLevel.INFO ? 'info' : 'log';

    console[logMethod](`[${LogLevel[level]}] ${message}`, data || '');

    // Send to monitoring service in production
    if (import.meta.env.PROD && level >= LogLevel.ERROR) {
      this.sendToMonitoring(logEntry);
    }
  }

  private sendToMonitoring(logEntry: any) {
    // Send to Sentry or other service
    if (logEntry.level === 'ERROR') {
      Sentry.captureMessage(logEntry.message, {
        level: 'error',
        extra: logEntry,
      });
    }
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | any) {
    this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
      ...error,
    });
  }
}

export const logger = new Logger();
```

---

## 7. Alerting Configuration

### 7.1 Alert Rules

**Sentry Alerts:**
- New issue: Immediate
- Issue spike (> 10/minute): Immediate
- Error rate > 5%: Within 5 minutes
- Performance degradation > 50%: Within 10 minutes

**Performance Alerts:**
- LCP > 4s: Alert
- FID > 300ms: Alert
- CLS > 0.25: Alert
- Bundle size increase > 20%: Warning

**Uptime Alerts:**
- Downtime > 2 minutes: Critical
- Response time > 3s: Warning
- 5xx errors: Immediate

### 7.2 Notification Channels

**Email:**
- Critical: DevOps team
- High: Development team
- Medium: Daily digest

**Slack:**
- `#alerts-critical`: Critical issues
- `#alerts-warnings`: Warnings
- `#monitoring`: All monitoring data

**SMS:**
- Only for critical production issues
- Escalation after 10 minutes

---

## 8. Dashboards

### 8.1 Sentry Dashboard

**Widgets:**
- Error rate over time
- Most common errors
- Affected users
- Release comparison
- Performance metrics

### 8.2 Google Analytics Dashboard

**Reports:**
- Real-time users
- Page views
- User flow
- Events
- Conversions

### 8.3 Custom Dashboard

**Create Monitoring Dashboard:**
```typescript
// src/pages/MonitoringDashboard.tsx
export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState({
    errors: 0,
    warnings: 0,
    performance: {},
    uptime: 99.9,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Monitoring Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Errors (24h)"
          value={metrics.errors}
          trend="down"
          status="success"
        />
        <MetricCard
          title="Warnings (24h)"
          value={metrics.warnings}
          trend="stable"
          status="warning"
        />
        <MetricCard
          title="Uptime"
          value={`${metrics.uptime}%`}
          trend="up"
          status="success"
        />
        <MetricCard
          title="Avg Response Time"
          value="142ms"
          trend="down"
          status="success"
        />
      </div>

      {/* Performance metrics charts */}
      {/* Error logs */}
      {/* System status */}
    </div>
  );
}
```

---

## 9. Cost Summary

### Free Tier Services
- **Sentry:** 5,000 errors/month
- **Google Analytics:** Unlimited
- **UptimeRobot:** 50 monitors
- **Total:** $0/month

### Paid Services (Optional)
- **Sentry Pro:** $26/month (10k errors)
- **UptimeRobot Pro:** $7/month (unlimited)
- **Total:** $33/month

---

## 10. Implementation Checklist

### Week 1: Error Tracking
- [ ] Set up Sentry account
- [ ] Install and configure Sentry
- [ ] Add error boundaries
- [ ] Configure alert rules
- [ ] Test error reporting

### Week 2: Performance
- [ ] Implement Web Vitals tracking
- [ ] Add custom performance marks
- [ ] Set performance budgets
- [ ] Create performance dashboard

### Week 3: Analytics
- [ ] Set up Google Analytics 4
- [ ] Implement event tracking
- [ ] Configure custom events
- [ ] Test analytics flow

### Week 4: Monitoring
- [ ] Set up uptime monitoring
- [ ] Create health endpoints
- [ ] Configure alerting
- [ ] Build monitoring dashboard

---

**Document Version:** 1.0
**Last Updated:** October 30, 2025
