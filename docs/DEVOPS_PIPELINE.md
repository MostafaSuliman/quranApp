# QuranApp - DevOps & CI/CD Pipeline Specification

## Document Information

| Field | Value |
|-------|-------|
| **Document Type** | DevOps & CI/CD Pipeline Specification |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Last Updated** | November 2025 |
| **Owner** | DevOps Team |

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions CI/CD Pipeline](#github-actions-cicd-pipeline)
3. [Build and Deployment Process](#build-and-deployment-process)
4. [Environment Configurations](#environment-configurations)
5. [CDN Strategy](#cdn-strategy)
6. [Monitoring and Logging Setup](#monitoring-and-logging-setup)
7. [Performance Monitoring](#performance-monitoring)
8. [Backup and Disaster Recovery](#backup-and-disaster-recovery)
9. [Security Scanning Pipeline](#security-scanning-pipeline)
10. [Deployment Checklist](#deployment-checklist)

---

## Overview

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Repository                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   main     │  │  staging   │  │  develop   │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
└─────────┼────────────────┼────────────────┼──────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflows                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  CI      │  │  Tests   │  │  Deploy  │  │  Monitor │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│              Deployment Targets                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Vercel  │  │   CDN    │  │  Sentry  │                 │
│  │ (Hosting)│  │(Assets)  │  │(Errors)  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **CI/CD** | GitHub Actions | Automation and deployment |
| **Hosting** | Vercel | Primary web hosting with CDN |
| **CDN** | Cloudflare | Audio and asset delivery |
| **Monitoring** | Sentry | Error tracking and performance |
| **Analytics** | Vercel Analytics | Real User Monitoring |
| **Logging** | Vercel Logs | Application logging |
| **Testing** | Playwright | E2E testing in CI |

---

## GitHub Actions CI/CD Pipeline

### 1. Main CI/CD Workflow

**File**: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main, staging]
  workflow_dispatch:

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '8'

jobs:
  # ============================================
  # Quality Gates
  # ============================================
  lint:
    name: Lint and Format Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

  typecheck:
    name: TypeScript Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

  # ============================================
  # Testing
  # ============================================
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit-tests
          name: unit-test-coverage

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: npm run test:e2e -- --project=${{ matrix.browser }}
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30

  # ============================================
  # Security Scanning
  # ============================================
  security-scan:
    name: Security Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  # ============================================
  # Build
  # ============================================
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, typecheck, unit-tests]
    strategy:
      matrix:
        environment: [development, staging, production]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: ${{ matrix.environment }}
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
          VITE_APP_VERSION: ${{ github.sha }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-${{ matrix.environment }}
          path: dist/
          retention-days: 7

      - name: Analyze bundle size
        run: npm run analyze:bundle

  # ============================================
  # Performance Testing
  # ============================================
  lighthouse:
    name: Lighthouse Performance Audit
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-production
          path: dist/

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/read
            http://localhost:3000/memorize
          uploadArtifacts: true
          temporaryPublicStorage: true
          configPath: '.lighthouserc.json'

  # ============================================
  # Deployment
  # ============================================
  deploy-development:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: [build, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: development
      url: https://dev.quranapp.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-development
          path: dist/

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, e2e-tests, security-scan, lighthouse]
    if: github.ref == 'refs/heads/staging'
    environment:
      name: staging
      url: https://staging.quranapp.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-staging
          path: dist/

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          vercel-args: '--prod'
          alias: staging.quranapp.com

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://staging.quranapp.com

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, e2e-tests, security-scan, lighthouse]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://quranapp.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-production
          path: dist/

      - name: Deploy to Vercel
        id: deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          vercel-args: '--prod'
          alias: quranapp.com

      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: quranapp
        with:
          environment: production
          version: ${{ github.sha }}

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://quranapp.com

      - name: Notify deployment success
        if: success()
        run: echo "✅ Production deployment successful"

      - name: Rollback on failure
        if: failure()
        run: |
          echo "❌ Deployment failed, initiating rollback"
          # Vercel rollback logic here
```

### 2. Dependency Update Workflow

**File**: `.github/workflows/dependency-updates.yml`

```yaml
name: Dependency Updates

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  update-dependencies:
    name: Update Dependencies
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Update dependencies
        run: |
          npm update
          npm audit fix --audit-level=moderate

      - name: Run tests
        run: npm test

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update dependencies'
          title: 'chore: Weekly dependency updates'
          body: |
            Automated dependency updates.

            Please review and merge if tests pass.
          branch: chore/dependency-updates
          labels: dependencies
```

### 3. Security Audit Workflow

**File**: `.github/workflows/security-audit.yml`

```yaml
name: Security Audit

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
  workflow_dispatch:

jobs:
  audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate --json > audit-report.json
        continue-on-error: true

      - name: Upload audit report
        uses: actions/upload-artifact@v3
        with:
          name: security-audit-report
          path: audit-report.json

      - name: Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: monitor

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'QuranApp'
          path: '.'
          format: 'HTML'
          args: >
            --enableRetired
            --failOnCVSS 7
```

---

## Build and Deployment Process

### Build Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Build Process                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  1. Install Dependencies (npm ci)                            │
│     - Lock file validation                                   │
│     - Clean install                                          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Type Checking (tsc --noEmit)                             │
│     - Strict mode enabled                                    │
│     - Zero type errors required                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Linting (ESLint)                                         │
│     - Code quality checks                                    │
│     - Auto-fixable issues fixed                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Build (Vite build)                                       │
│     - Production optimizations                               │
│     - Code splitting                                         │
│     - Asset optimization                                     │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  5. Bundle Analysis                                          │
│     - Size checks                                            │
│     - Tree-shaking validation                                │
│     - Performance metrics                                    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  6. Asset Optimization                                       │
│     - Image compression                                      │
│     - SVG optimization                                       │
│     - Font subsetting                                        │
└──────────────────────────────────────────────────────────────┘
```

### Deployment Strategy

#### Branch Strategy

```
main (production)
  ├── hotfix/* (critical fixes)
  │
staging (pre-production)
  ├── release/* (release candidates)
  │
develop (development)
  ├── feature/* (new features)
  ├── bugfix/* (bug fixes)
  └── chore/* (maintenance tasks)
```

#### Environment Promotion Flow

```
develop → staging → production
   │         │          │
   ▼         ▼          ▼
  Dev     Staging     Prod
  Env       Env        Env
```

### Build Scripts

**File**: `package.json` (scripts section)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:dev": "cross-env NODE_ENV=development npm run build",
    "build:staging": "cross-env NODE_ENV=staging npm run build",
    "build:prod": "cross-env NODE_ENV=production npm run build",
    "preview": "vite preview",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\"",
    "typecheck": "tsc --noEmit",
    "analyze:bundle": "vite-bundle-visualizer",
    "prepare": "husky install"
  }
}
```

---

## Environment Configurations

### Environment Variables

#### Development Environment

```env
# .env.development
NODE_ENV=development
VITE_APP_NAME=QuranApp
VITE_APP_VERSION=1.0.0-dev
VITE_API_BASE_URL=https://api.dev.quranapp.com
VITE_CDN_URL=https://cdn.dev.quranapp.com
VITE_AUDIO_CDN_URL=https://audio.dev.quranapp.com
VITE_SENTRY_DSN=
VITE_ENABLE_ANALYTICS=false
VITE_LOG_LEVEL=debug
```

#### Staging Environment

```env
# .env.staging
NODE_ENV=staging
VITE_APP_NAME=QuranApp
VITE_APP_VERSION=1.0.0-rc
VITE_API_BASE_URL=https://api.staging.quranapp.com
VITE_CDN_URL=https://cdn.staging.quranapp.com
VITE_AUDIO_CDN_URL=https://audio.staging.quranapp.com
VITE_SENTRY_DSN=${SENTRY_DSN_STAGING}
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=info
```

#### Production Environment

```env
# .env.production
NODE_ENV=production
VITE_APP_NAME=QuranApp
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.quranapp.com
VITE_CDN_URL=https://cdn.quranapp.com
VITE_AUDIO_CDN_URL=https://audio.quranapp.com
VITE_SENTRY_DSN=${SENTRY_DSN_PRODUCTION}
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=warn
```

### Vercel Configuration

**File**: `vercel.json`

```json
{
  "buildCommand": "npm run build:prod",
  "outputDirectory": "dist",
  "framework": "vite",
  "regions": ["iad1", "dub1", "sin1"],
  "env": {
    "NODE_VERSION": "18"
  },
  "build": {
    "env": {
      "VITE_SENTRY_DSN": "@sentry-dsn",
      "VITE_APP_VERSION": "@app-version"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.quranapp.com/:path*"
    }
  ]
}
```

---

## CDN Strategy

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   CDN Architecture                          │
└────────────────────────────────────────────────────────────┘

User Request
     │
     ▼
┌─────────────────┐
│  Cloudflare     │ ◄── Edge caching, global distribution
│   CDN Edge      │     DDoS protection, SSL termination
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Content Distribution                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Static      │  │   Audio      │  │    API       │     │
│  │  Assets      │  │   Files      │  │   Proxy      │     │
│  │ (HTML/CSS/JS)│  │  (MP3)       │  │  (JSON)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│        │                  │                   │             │
│        ▼                  ▼                   ▼             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Vercel     │  │  Cloudflare  │  │   Origin     │     │
│  │   Origin     │  │   R2         │  │   Server     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### CDN Configuration

#### Cloudflare Settings

```yaml
# Cloudflare Page Rules
rules:
  - pattern: "*.quranapp.com/assets/*"
    settings:
      cache_level: "cache_everything"
      edge_cache_ttl: 31536000 # 1 year
      browser_cache_ttl: 31536000

  - pattern: "audio.quranapp.com/*"
    settings:
      cache_level: "cache_everything"
      edge_cache_ttl: 2592000 # 30 days
      browser_cache_ttl: 2592000

  - pattern: "*.quranapp.com/api/*"
    settings:
      cache_level: "bypass"

  - pattern: "quranapp.com/*"
    settings:
      cache_level: "cache_everything"
      edge_cache_ttl: 3600 # 1 hour
      browser_cache_ttl: 3600
      security_level: "high"
      ssl: "strict"
      always_use_https: true
      automatic_https_rewrites: true
```

#### Cache Strategy

| Asset Type | Cache Duration | Invalidation Strategy |
|------------|----------------|----------------------|
| HTML | 1 hour | On deployment |
| CSS/JS | 1 year (hashed) | Never (hash changes) |
| Images | 1 year | Never (hash changes) |
| Fonts | 1 year | Never (hash changes) |
| Audio (MP3) | 30 days | Manual purge only |
| API responses | No cache | N/A |
| Service Worker | No cache | On update |

### Audio CDN Setup

#### Audio File Organization

```
audio.quranapp.com/
├── reciters/
│   ├── mishary-rashid/
│   │   ├── 001.mp3 (Surah 1)
│   │   ├── 002.mp3 (Surah 2)
│   │   └── ...
│   ├── abdul-basit/
│   │   ├── 001.mp3
│   │   └── ...
│   └── saad-al-ghamdi/
│       └── ...
└── manifest.json (audio metadata)
```

#### Progressive Download Strategy

```javascript
// Audio download priority
const DOWNLOAD_PRIORITIES = {
  HIGH: ['001', '002', '036', '055', '067'], // Al-Fatiha, Al-Baqarah, Ya-Sin, Ar-Rahman, Al-Mulk
  MEDIUM: ['078', '112', '113', '114'], // Short surahs for memorization
  LOW: 'all_remaining'
};
```

---

## Monitoring and Logging Setup

### Sentry Configuration

#### Sentry Setup

**File**: `src/lib/sentry.ts`

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: 1.0, // 100% of transactions

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of errors

      // Environment
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,

      // Error filtering
      beforeSend(event, hint) {
        // Filter out expected errors
        if (event.exception) {
          const error = hint.originalException as Error;
          if (error.message?.includes('ResizeObserver loop')) {
            return null; // Ignore benign errors
          }
        }
        return event;
      },

      // PII scrubbing
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === 'console') {
          return null; // Don't send console logs
        }
        return breadcrumb;
      },
    });
  }
}
```

#### Error Tracking

```typescript
// Custom error boundary
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureException(error);
  });
}

// Performance tracking
export function trackPerformance(name: string, duration: number) {
  Sentry.metrics.distribution('performance', duration, {
    tags: { operation: name },
    unit: 'millisecond',
  });
}
```

### Logging Strategy

#### Log Levels

```typescript
// src/lib/logger.ts
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = import.meta.env.VITE_LOG_LEVEL || LogLevel.INFO;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  error(message: string, error?: Error, data?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, error, data);
      captureException(error || new Error(message), data);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}

export const logger = new Logger();
```

---

## Performance Monitoring

### Real User Monitoring (RUM)

#### Vercel Analytics Integration

```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

#### Custom Performance Metrics

```typescript
// src/lib/performance.ts
export class PerformanceMonitor {
  // Core Web Vitals
  static measureCoreWebVitals() {
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }

  // Custom metrics
  static measureQuranLoadTime(surah: number) {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      trackPerformance(`quran.load.surah.${surah}`, duration);
    };
  }

  static measureAudioLoadTime(reciter: string) {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      trackPerformance(`audio.load.${reciter}`, duration);
    };
  }

  // Navigation timing
  static getNavigationTimings() {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      download: timing.responseEnd - timing.responseStart,
      domInteractive: timing.domInteractive - timing.fetchStart,
      domComplete: timing.domComplete - timing.fetchStart,
    };
  }
}
```

### Lighthouse CI Configuration

**File**: `.lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "startServerReadyPattern": "Local:.*http://localhost:3000",
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/read",
        "http://localhost:3000/memorize",
        "http://localhost:3000/search"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}],
        "categories:pwa": ["warn", {"minScore": 0.8}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1500}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 300}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Performance Budget

**File**: `performance-budget.json`

```json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "document",
          "budget": 50
        },
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        },
        {
          "resourceType": "image",
          "budget": 200
        },
        {
          "resourceType": "font",
          "budget": 150
        },
        {
          "resourceType": "total",
          "budget": 750
        }
      ],
      "resourceCounts": [
        {
          "resourceType": "third-party",
          "budget": 10
        }
      ]
    }
  ]
}
```

---

## Backup and Disaster Recovery

### Backup Strategy

#### Asset Backup

```yaml
Backup Schedule:
  Daily:
    - Application build artifacts
    - Environment configurations
    - Service worker cache state

  Weekly:
    - Audio file checksums
    - Translation data
    - Tafsir content

  Monthly:
    - Full system state
    - Analytics data
    - Performance metrics
```

#### Backup Locations

```
Primary: Vercel deployment history (30 days)
Secondary: GitHub releases (permanent)
Tertiary: AWS S3 bucket (encrypted, 90 days retention)
```

### Disaster Recovery Plan

#### RTO/RPO Targets

| Scenario | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|----------|-------------------------------|-------------------------------|
| CDN failure | < 5 minutes | 0 (automatic failover) |
| Hosting outage | < 15 minutes | < 1 hour |
| Database corruption | < 30 minutes | < 4 hours |
| Complete system failure | < 2 hours | < 24 hours |

#### Recovery Procedures

##### 1. Vercel Hosting Failure

```bash
# Automatic failover to previous deployment
vercel rollback

# Manual deployment to backup provider (Netlify)
npm run build:prod
netlify deploy --prod --dir=dist
```

##### 2. CDN Failure (Cloudflare)

```yaml
Automatic:
  - DNS failover to Vercel Edge CDN
  - HTTP/3 fallback to HTTP/2

Manual:
  - Switch DNS to backup CDN provider
  - Update environment variables
  - Redeploy application
```

##### 3. Complete System Recovery

```bash
# 1. Clone repository
git clone https://github.com/your-org/quranapp.git
cd quranapp

# 2. Restore environment variables
cp .env.production.backup .env.production

# 3. Install dependencies
npm ci

# 4. Build application
npm run build:prod

# 5. Deploy to Vercel
vercel --prod

# 6. Verify deployment
npm run test:smoke
```

### Incident Response

```
┌─────────────────────────────────────────────────────────────┐
│              Incident Response Flow                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Incident Detected     │
              │  (Alert triggered)      │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │  Assess Severity        │
              │  (P0/P1/P2/P3)          │
              └───────────┬─────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
      ┌────────┐    ┌────────┐    ┌────────┐
      │   P0   │    │   P1   │    │ P2/P3  │
      │Critical│    │  High  │    │  Low   │
      └───┬────┘    └───┬────┘    └───┬────┘
          │             │             │
          ▼             ▼             ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │Immediate│   │ 1 hour  │   │ 4 hours │
    │Response │   │Response │   │Response │
    └────┬────┘   └────┬────┘   └────┬────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
                       ▼
              ┌─────────────────────────┐
              │  Implement Fix          │
              │  (Deploy/Rollback)      │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │  Verify Resolution      │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │  Post-Mortem Analysis   │
              │  (Document & Learn)     │
              └─────────────────────────┘
```

---

## Security Scanning Pipeline

### OWASP Dependency Check

```yaml
# .github/workflows/owasp-dependency-check.yml
name: OWASP Dependency Check

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly
  workflow_dispatch:

jobs:
  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'QuranApp'
          path: '.'
          format: 'HTML'
          args: >
            --enableRetired
            --failOnCVSS 7

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: owasp-report
          path: reports/
```

### Security Headers Check

**File**: `scripts/check-security-headers.sh`

```bash
#!/bin/bash

URL="https://quranapp.com"

echo "🔒 Checking security headers for $URL"

# Check required headers
HEADERS=(
  "X-Content-Type-Options: nosniff"
  "X-Frame-Options: DENY"
  "X-XSS-Protection: 1; mode=block"
  "Strict-Transport-Security: max-age=31536000"
  "Content-Security-Policy"
  "Permissions-Policy"
  "Referrer-Policy: strict-origin-when-cross-origin"
)

for header in "${HEADERS[@]}"; do
  if curl -Is "$URL" | grep -i "$header" > /dev/null; then
    echo "✅ $header"
  else
    echo "❌ Missing: $header"
    exit 1
  fi
done

echo "✅ All security headers present"
```

### Content Security Policy

```javascript
// CSP configuration
const CSP = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite HMR in dev
    'https://cdn.vercel-insights.com',
    'https://browser.sentry-cdn.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https://cdn.quranapp.com'
  ],
  'media-src': [
    "'self'",
    'https://audio.quranapp.com'
  ],
  'connect-src': [
    "'self'",
    'https://api.quranapp.com',
    'https://*.sentry.io'
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};
```

---

## Deployment Checklist

### Pre-Deployment Checklist

#### Code Quality

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed and approved
- [ ] No linting errors or warnings
- [ ] TypeScript type checking passes
- [ ] Test coverage ≥ 80%

#### Performance

- [ ] Lighthouse score > 90 (all categories)
- [ ] Bundle size within budget (< 500KB initial)
- [ ] No performance regressions detected
- [ ] Core Web Vitals meet targets:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

#### Security

- [ ] No high/critical vulnerabilities (npm audit)
- [ ] Security headers configured
- [ ] CSP policy implemented
- [ ] Secrets properly configured
- [ ] HTTPS enforced

#### Functionality

- [ ] All MUST HAVE features implemented
- [ ] Offline functionality working
- [ ] Audio playback functional
- [ ] Cross-browser testing completed:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Mobile responsive testing:
  - [ ] iOS (Safari)
  - [ ] Android (Chrome)

#### Content Integrity

- [ ] Quran text verified against Mushaf Madinah
- [ ] Audio files quality checked
- [ ] Translation sources verified
- [ ] Islamic content reviewed by scholars

#### Accessibility

- [ ] WCAG 2.1 AA compliant
- [ ] Screen reader compatible
- [ ] Keyboard navigation functional
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] axe DevTools audit passed

#### Documentation

- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] API documentation current
- [ ] User guide available

### Deployment Steps

#### Production Deployment

```bash
# 1. Final verification
npm run lint
npm run typecheck
npm test
npm run build:prod

# 2. Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 3. Deploy to production
git checkout main
git merge --no-ff release/v1.0.0
git push origin main

# 4. Verify deployment
npm run test:smoke

# 5. Monitor for issues
# - Check Sentry for errors
# - Monitor Vercel Analytics
# - Review performance metrics
```

### Post-Deployment Checklist

#### Immediate (0-15 minutes)

- [ ] Deployment successful
- [ ] Application accessible
- [ ] Smoke tests passing
- [ ] No critical errors in Sentry
- [ ] CDN serving assets correctly
- [ ] Service worker updating

#### Short-term (15 minutes - 1 hour)

- [ ] Performance metrics stable
- [ ] Error rate < 0.1%
- [ ] User analytics showing activity
- [ ] Audio playback working globally
- [ ] Offline functionality confirmed

#### Medium-term (1-24 hours)

- [ ] No increase in error rates
- [ ] Performance metrics meeting targets
- [ ] User retention normal
- [ ] Load time < 3 seconds (95th percentile)
- [ ] Memory usage within limits

#### Long-term (24+ hours)

- [ ] User feedback reviewed
- [ ] Analytics data analyzed
- [ ] Performance trends positive
- [ ] No degradation in Core Web Vitals
- [ ] Post-deployment review completed

### Rollback Procedure

```bash
# If issues detected after deployment

# Option 1: Vercel instant rollback
vercel rollback

# Option 2: Git revert
git revert HEAD
git push origin main

# Option 3: Deploy previous version
git checkout v1.0.0-previous
vercel --prod

# Verify rollback
npm run test:smoke
```

---

## Monitoring Dashboard URLs

### Production Monitoring

| Service | URL | Purpose |
|---------|-----|---------|
| **Vercel Dashboard** | https://vercel.com/dashboard | Deployment status, analytics |
| **Sentry** | https://sentry.io/organizations/quranapp | Error tracking, performance |
| **Cloudflare Analytics** | https://dash.cloudflare.com/analytics | CDN performance, traffic |
| **GitHub Actions** | https://github.com/org/repo/actions | CI/CD pipeline status |
| **Lighthouse CI** | https://lhci.quranapp.com | Performance scores |

---

## Support and Escalation

### On-Call Rotation

```yaml
Primary On-Call:
  - DevOps Engineer
  - Response time: 15 minutes

Secondary On-Call:
  - Backend Engineer
  - Response time: 30 minutes

Escalation:
  - Tech Lead
  - Response time: 1 hour
```

### Incident Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **P0** | Critical - Service down | Immediate | Complete site outage |
| **P1** | High - Major feature broken | 1 hour | Audio playback not working |
| **P2** | Medium - Minor feature issue | 4 hours | Search slow but functional |
| **P3** | Low - Cosmetic issue | 24 hours | UI alignment issue |

---

## Appendix

### Useful Commands

```bash
# Build
npm run build:prod         # Production build
npm run build:staging      # Staging build
npm run analyze:bundle     # Bundle analysis

# Testing
npm test                   # Run all tests
npm run test:e2e          # E2E tests
npm run test:smoke        # Smoke tests

# Deployment
vercel --prod             # Deploy to production
vercel rollback           # Rollback deployment

# Monitoring
vercel logs               # View deployment logs
npm run check:security    # Security audit
```

### Contact Information

| Role | Contact | Escalation |
|------|---------|------------|
| **DevOps Lead** | devops@quranapp.com | Slack: #devops |
| **Security Team** | security@quranapp.com | Slack: #security |
| **On-Call** | oncall@quranapp.com | PagerDuty |

---

**Document Version**: 1.0.0
**Last Updated**: November 2025
**Status**: Active
**Next Review**: Post-MVP Launch

---

**End of DevOps & CI/CD Pipeline Specification**
