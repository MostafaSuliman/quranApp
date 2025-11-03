# 🛡️ Sentry Error Monitoring - Complete Setup Guide

**Integration Status**: Configured but disabled (requires DSN)

---

## 📋 Overview

Sentry is configured in the QuranApp for comprehensive error monitoring, performance tracking, and session replay. This guide walks through complete setup from account creation to production deployment.

**Current Status**:
- ✅ Sentry SDK installed (`@sentry/react` v10.22.0)
- ✅ Vite plugin configured (`@sentry/vite-plugin` v4.6.0)
- ✅ Error boundary implemented
- ✅ Source map upload ready
- ⏳ Disabled (no DSN configured)

**Why Sentry?**
- **Real-time Error Tracking**: Catch errors before users report them
- **Performance Monitoring**: Identify slow pages and API calls
- **Session Replay**: Watch user sessions to understand issues
- **Source Maps**: See original code in error stack traces
- **Islamic Content Errors**: Track Quran API failures and audio loading issues

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Sentry Account

1. Go to **https://sentry.io/signup**
2. Sign up with:
   - Email/password, OR
   - GitHub account, OR
   - Google account
3. Choose **Free Plan** (5,000 errors/month, 1 project)

### Step 2: Create Project

1. After signup → "Create Project"
2. **Platform**: Select **React**
3. **Alert Frequency**: Choose "Alert me on every new issue"
4. **Project Name**: `quranapp` (or your preference)
5. **Team**: Default team
6. Click **"Create Project"**

### Step 3: Get Your DSN

After project creation, you'll see:
```
Your DSN:
https://1234567890abcdef1234567890abcdef@o1234567.ingest.sentry.io/1234567
```

**Copy this DSN** - you'll need it in Step 4.

### Step 4: Configure Environment Variables

#### For Local Development

Edit `.env.production`:
```env
# Sentry Configuration
VITE_ENABLE_SENTRY=true
VITE_SENTRY_DSN=https://YOUR_DSN_HERE@oXXXXX.ingest.sentry.io/XXXXXX

# Sentry Vite Plugin (for source maps)
SENTRY_ORG=your-org-name
SENTRY_PROJECT=quranapp
SENTRY_AUTH_TOKEN=your-auth-token-from-step-5
```

#### For Netlify Deployment

1. Go to Netlify Dashboard
2. Your site → **Site Settings** → **Environment variables**
3. Add these variables:

```env
VITE_ENABLE_SENTRY=true
VITE_SENTRY_DSN=https://YOUR_DSN_HERE@oXXXXX.ingest.sentry.io/XXXXXX
SENTRY_ORG=your-org-name
SENTRY_PROJECT=quranapp
SENTRY_AUTH_TOKEN=your-auth-token
```

### Step 5: Get Sentry Auth Token (for Source Maps)

**Why needed?** Uploads source maps so you see original code in error traces.

1. In Sentry → Click your profile (bottom left)
2. **User Settings** → **Auth Tokens**
3. Click **"Create New Token"**
4. Configure:
   - **Name**: `QuranApp Build Token`
   - **Scopes**: Select:
     - ✅ `project:read`
     - ✅ `project:releases`
     - ✅ `org:read`
   - **Projects**: Select your `quranapp` project
5. Click **"Create Token"**
6. **Copy the token immediately** (shown only once!)
7. Add to `.env.production` and Netlify environment variables

### Step 6: Rebuild and Deploy

```bash
# Rebuild with Sentry enabled
npm run build

# Deploy to Netlify
netlify deploy --prod

# OR push to GitHub (auto-deploy)
git add .
git commit -m "Enable Sentry error monitoring"
git push origin main
```

### Step 7: Test Sentry Integration

**Option A: Trigger Test Error in UI**

Add a test button to your app:
```typescript
<button onClick={() => {
  throw new Error('Sentry Test Error - QuranApp');
}}>
  Test Sentry
</button>
```

Click the button → Check Sentry dashboard for error

**Option B: Use Sentry CLI**

```bash
npx @sentry/cli send-event --message "QuranApp test from CLI"
```

**Option C: Check Logs**

Open browser console → Look for:
```
Sentry: Successfully sent event to Sentry
```

---

## 📊 What Sentry Tracks

### 1. JavaScript Errors

**Captured**:
- Uncaught exceptions
- Promise rejections
- React component errors
- Network failures
- Type errors

**Example**:
```typescript
// This will be caught by Sentry
async function loadAyah(surah: number, ayah: number) {
  const response = await fetch(`/api/ayah/${surah}/${ayah}`);
  if (!response.ok) {
    throw new Error(`Failed to load ayah ${surah}:${ayah}`);
  }
  return response.json();
}
```

### 2. Performance Monitoring

**Tracked**:
- Page load times
- Component render times
- API call duration
- Navigation speed
- Audio loading performance

**Sample Rate**: 10% of transactions (configurable)

**Example Dashboard**:
- Average page load: 1.8s
- Slowest page: MushafReaderPage (2.3s)
- Failed API calls: 3 in last 24h

### 3. Session Replay

**Records**:
- User interactions
- DOM changes
- Console logs
- Network requests
- Error context

**Sample Rate**:
- 10% of normal sessions
- 100% of error sessions

**Privacy**: Sensitive data automatically masked (passwords, emails)

### 4. Breadcrumbs

**Logs user actions before error**:
```
1. User clicked "Play Recitation"
2. Fetched audio URL from API
3. AudioPlayer initialized
4. Error: Audio file not found
```

**Helps understand**: "What was the user doing when it broke?"

---

## 🔧 Sentry Configuration Details

### File: `src/sentry.config.ts`

**Key Configuration**:

```typescript
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,  // ← Your DSN

  // Environment tracking
  environment: process.env.VITE_BUILD_ENV || 'development',
  release: process.env.VITE_APP_VERSION || '1.0.0',

  // Performance monitoring
  tracesSampleRate: 0.1,  // 10% of transactions

  // Session replay
  replaysSessionSampleRate: 0.1,  // 10% of sessions
  replaysOnErrorSampleRate: 1.0,   // 100% of error sessions

  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (import.meta.env.DEV) return null;

    // Filter known issues
    if (event.message?.includes('ResizeObserver loop')) {
      return null;  // Harmless React warning
    }

    return event;
  },

  // Integrations
  integrations: [
    Sentry.browserTracingIntegration(),  // Performance
    Sentry.replayIntegration(),          // Session replay
  ],
});
```

### File: `src/main.tsx`

**Error Boundary Integration**:

```typescript
import { initSentry } from './sentry.config'
import * as Sentry from '@sentry/react'

// Initialize Sentry before React renders
initSentry()

// Wrap app in Sentry Error Boundary
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-screen">
          <h1>تعذر تحميل التطبيق</h1>
          <p>{error.message}</p>
          <button onClick={resetError}>إعادة المحاولة</button>
        </div>
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
)
```

---

## 📈 Monitoring Best Practices

### 1. Set Up Alerts

**Sentry Dashboard → Alerts → Create Alert Rule**

**Recommended Alerts**:

**Alert #1: High Error Rate**
- Condition: `Error count > 10 in 1 hour`
- Action: Email notification
- Use case: Catch production incidents

**Alert #2: New Error Type**
- Condition: `First time an error appears`
- Action: Slack/Email notification
- Use case: Detect new bugs immediately

**Alert #3: Performance Degradation**
- Condition: `Average transaction duration > 3 seconds`
- Action: Email notification
- Use case: Catch performance regressions

### 2. Custom Context

**Add user context**:
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

**Add custom tags**:
```typescript
Sentry.setTag('surah', currentSurah);
Sentry.setTag('reciter', selectedReciter);
Sentry.setTag('language', userLanguage);
```

**Add breadcrumbs**:
```typescript
Sentry.addBreadcrumb({
  category: 'audio',
  message: 'Started playing Surah Al-Fatiha',
  level: 'info',
});
```

### 3. Source Maps

**Already configured in `vite.config.ts`**:

```typescript
sentryVitePlugin({
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  sourcemaps: {
    assets: './dist/assets/**',
    ignore: ['node_modules'],
    filesToDeleteAfterUpload: ['./dist/**/*.map'],
  },
})
```

**What this does**:
- Uploads source maps to Sentry during build
- Deletes local source maps after upload (security)
- Enables original code in error stack traces

**Example Error Stack**:
```
Error: Failed to load ayah
  at AudioPlayer.tsx:145:15
  at async loadRecitation (quranApi.ts:88:23)
```

Without source maps, you'd see:
```
Error: Failed to load ayah
  at main.js:1234:56
  at a.js:789:12
```

---

## 🎯 Testing Checklist

After setup, verify:

### Basic Integration
- [ ] Sentry initialized without errors (check console)
- [ ] DSN configured correctly
- [ ] Environment detected (development/production)
- [ ] Release version showing in Sentry dashboard

### Error Tracking
- [ ] Test error appears in Sentry dashboard
- [ ] Stack trace shows original TypeScript code
- [ ] User context attached (if logged in)
- [ ] Breadcrumbs captured (user actions before error)

### Performance Monitoring
- [ ] Transactions appearing in Sentry
- [ ] Page load times tracked
- [ ] API calls tracked
- [ ] Component render times visible

### Session Replay
- [ ] Session replay available for error events
- [ ] User interactions recorded
- [ ] Console logs captured
- [ ] Network requests visible

---

## 💰 Pricing & Limits

### Free Plan
- **Errors**: 5,000/month
- **Performance**: 10,000 transactions/month
- **Replays**: 50 session replays/month
- **Projects**: 1 project
- **Members**: Unlimited
- **Retention**: 30 days

**Is this enough for QuranApp?**
- Typical app: 100-500 errors/month ✅
- Beta testing: May exceed during initial release ⚠️
- Solution: Set sample rates or upgrade

### Paid Plans

**Team Plan** ($26/month):
- **Errors**: 50,000/month
- **Performance**: 100,000 transactions/month
- **Replays**: 500 replays/month
- **Projects**: 5 projects
- **Retention**: 90 days

**Business Plan** (Custom pricing):
- Unlimited errors
- Unlimited performance
- Unlimited replays
- Custom retention
- SLA support

---

## 🐛 Troubleshooting

### Issue: "Sentry is not capturing errors"

**Check**:
1. `VITE_SENTRY_DSN` is set correctly
2. `VITE_ENABLE_SENTRY=true` in environment
3. Not in development mode (errors filtered out)
4. Console shows "Sentry: Successfully sent event"

**Solution**:
```bash
# Verify environment variables are loaded
echo $VITE_SENTRY_DSN
echo $VITE_ENABLE_SENTRY

# Check Sentry initialization
# Open browser console → look for Sentry logs
```

### Issue: "Source maps not working"

**Check**:
1. `SENTRY_AUTH_TOKEN` is set
2. `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry account
3. Build logs show "Uploading source maps to Sentry"

**Solution**:
```bash
# Manual source map upload
npx @sentry/cli releases files <release-version> upload-sourcemaps ./dist/assets
```

### Issue: "Too many events, rate limited"

**Solution**: Adjust sample rates in `sentry.config.ts`:

```typescript
Sentry.init({
  // ... other config
  tracesSampleRate: 0.05,  // Reduce to 5% from 10%
  replaysSessionSampleRate: 0.05,  // Reduce to 5%

  // Add event filtering
  beforeSend(event) {
    // Ignore specific errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    return event;
  },
});
```

---

## 📞 Support & Resources

**Sentry Documentation**:
- Official Docs: https://docs.sentry.io/platforms/javascript/guides/react/
- Configuration: https://docs.sentry.io/platforms/javascript/configuration/
- Performance: https://docs.sentry.io/platforms/javascript/performance/
- Session Replay: https://docs.sentry.io/platforms/javascript/session-replay/

**QuranApp Specific**:
- Main Config: `src/sentry.config.ts`
- Vite Plugin: `vite.config.ts` (lines 197-219)
- Error Boundary: `src/main.tsx`
- Environment: `.env.production`

**Getting Help**:
- Sentry Community: https://forum.sentry.io
- GitHub Issues: https://github.com/getsentry/sentry-javascript/issues
- Stack Overflow: Tag `sentry`, `react`, `vite`

---

## ✅ Setup Complete!

**After following this guide, you have**:
- ✅ Sentry account created
- ✅ React project configured
- ✅ DSN and auth token obtained
- ✅ Environment variables set
- ✅ Source maps enabled
- ✅ Error tracking active
- ✅ Performance monitoring enabled
- ✅ Session replay configured
- ✅ Alerts configured

**Next Steps**:
1. Monitor Sentry dashboard for first errors
2. Set up Slack integration for real-time alerts
3. Review performance bottlenecks weekly
4. Watch session replays to understand user behavior
5. Iterate on error handling based on Sentry insights

---

**Setup Guide**: 2025-10-31
**Sentry SDK**: v10.22.0
**Integration Status**: ✅ READY FOR PRODUCTION
**Estimated Setup Time**: 15 minutes
