# 🛡️ Sentry Setup Guide - Complete Walkthrough

**Estimated Time**: 15-20 minutes
**Last Updated**: 2025-10-31

---

## 📊 What Errors Will Sentry Catch?

Based on your current Netlify deployment, Sentry will capture:

### ❌ Current Errors (Will Be Fixed First)
1. **SweetAlert2 Error** - Browser extension (will be filtered automatically)
2. **React Children Error** - Already fixed (React 18.2 compatible)
3. **Manifest 401 Error** - FIXED (added CORS headers)
4. **CSP Meta Tag Warnings** - FIXED (moved to netlify.toml)

### ✅ Future Errors (Sentry Will Catch)
- JavaScript runtime errors
- Promise rejections
- React component errors
- API call failures
- Audio loading errors
- Network timeouts
- Type errors

---

## 🚀 Step-by-Step Setup

### Step 1: Create Sentry Account (3 minutes)

**1.1 Sign Up**
```
URL: https://sentry.io/signup
```

**Choose**: Free Plan (perfect for QuranApp)
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month
- Unlimited projects and members

**Sign up with**:
- ✅ GitHub account (fastest)
- ✅ Google account
- ✅ Email + password

**1.2 Create Project**

After signup, you'll see "Create your first project":

1. **Platform**: Select **React**
2. **Alert frequency**: Choose **"Alert me on every new issue"**
3. **Project name**: Enter `quranapp` (or your preference)
4. **Team**: Keep default team name

Click **"Create Project"**

**1.3 Get Your DSN**

After project creation, you'll see:

```
Your DSN:
https://1234567890abcdef1234567890abcdef@o1234567.ingest.sentry.io/1234567
```

**🚨 IMPORTANT**: Copy this DSN now! You'll need it in Step 2.

---

### Step 2: Get Auth Token for Source Maps (2 minutes)

**Why needed?** Source maps let you see your original TypeScript code in error stack traces, not minified JavaScript.

**2.1 Navigate to Auth Tokens**
1. Click your profile icon (bottom left corner)
2. **User Settings** → **Auth Tokens**
3. Click **"Create New Token"**

**2.2 Configure Token**
- **Name**: `QuranApp Build Token`
- **Scopes**: Select these 3:
  - ✅ `project:read`
  - ✅ `project:releases`
  - ✅ `org:read`
- **Projects**: Select your `quranapp` project
- **Expiration**: No expiration (recommended) or 1 year

Click **"Create Token"**

**2.3 Copy Token**
```
🚨 CRITICAL: Copy the token immediately!
It's shown ONLY ONCE and cannot be retrieved later.
```

Example token:
```
sntrys_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

### Step 3: Configure Environment Variables (3 minutes)

**3.1 Update Local `.env.production`**

Open `/Users/moustafasuliman/git/quranApp/.env.production` and update:

```env
# Enable Sentry
VITE_ENABLE_SENTRY=true

# Your DSN from Step 1.3
VITE_SENTRY_DSN=https://YOUR_DSN_HERE@oXXXXX.ingest.sentry.io/XXXXXX

# Your Sentry organization name (from Sentry dashboard URL)
# Example: https://sentry.io/organizations/YOUR-ORG-NAME/
SENTRY_ORG=your-org-name

# Project name (same as Step 1.2)
SENTRY_PROJECT=quranapp

# Auth token from Step 2.3
SENTRY_AUTH_TOKEN=sntrys_your_token_here
```

**3.2 Add to Netlify Environment Variables**

1. Go to Netlify Dashboard: https://app.netlify.com
2. Select your QuranApp site
3. **Site Settings** → **Environment variables**
4. Click **"Add a variable"**

Add these 5 variables ONE BY ONE:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_ENABLE_SENTRY` | `true` | `true` |
| `VITE_SENTRY_DSN` | Your DSN | `https://abc123@o456.ingest.sentry.io/789` |
| `SENTRY_ORG` | Your org name | `my-organization` |
| `SENTRY_PROJECT` | `quranapp` | `quranapp` |
| `SENTRY_AUTH_TOKEN` | Your auth token | `sntrys_abc123def456...` |

Click **"Save"** after adding all 5 variables.

---

### Step 4: Rebuild and Deploy (3 minutes)

**4.1 Rebuild Locally** (with Sentry enabled)

```bash
cd /Users/moustafasuliman/git/quranApp

# Build with all fixes
npm run build
```

**Expected Output**:
```
✓ built in 12.59s
✓ source maps uploaded to Sentry
✅ Build successful!
```

**4.2 Deploy to Netlify**

Choose one method:

**Option A: Netlify CLI**
```bash
netlify deploy --prod
```

**Option B: Git Push** (if connected to GitHub)
```bash
git add .
git commit -m "Enable Sentry error monitoring"
git push origin main
```

**Option C: Netlify Dashboard**
- Deploys → Trigger deploy → Deploy site

---

### Step 5: Test Sentry Integration (5 minutes)

**5.1 Visit Deployed Site**

Open your Netlify URL:
```
https://your-site.netlify.app
```

**5.2 Open Browser Console**

Press `F12` → Console tab

Look for:
```
Sentry initialized for production environment
```

✅ If you see this, Sentry is working!

**5.3 Trigger Test Error**

The app now includes a Sentry Test Button (bottom-right corner in development).

To test in production, open browser console and run:
```javascript
throw new Error('Sentry Test Error - QuranApp');
```

**5.4 Check Sentry Dashboard**

1. Go to https://sentry.io
2. Click your QuranApp project
3. Navigate to **Issues**
4. You should see your test error appear within 10 seconds!

Click on the error to see:
- Stack trace with ORIGINAL TypeScript code (thanks to source maps!)
- Browser and OS information
- Timestamp
- User actions before error (breadcrumbs)

---

### Step 6: Verify Source Maps (2 minutes)

**6.1 Check Stack Trace Quality**

In Sentry dashboard, click on any error:

**With Source Maps** ✅:
```typescript
Error: Sentry Test Error
  at triggerError (SentryTestButton.tsx:28:15)
  at onClick (SentryTestButton.tsx:85:9)
```

**Without Source Maps** ❌:
```javascript
Error: Sentry Test Error
  at a.jsx:1:23456
  at b.jsx:2:78901
```

If you see minified code, source maps didn't upload. Check:
- `SENTRY_AUTH_TOKEN` is set correctly
- Build logs show "Uploading source maps to Sentry"

---

### Step 7: Configure Alerts (2 minutes)

**7.1 Set Up Email Alerts**

1. Sentry Dashboard → **Alerts** → **Create Alert Rule**
2. **Alert name**: "High Error Rate"
3. **Conditions**:
   - When: `Error count`
   - is: `greater than`
   - `10`
   - in: `1 hour`
4. **Actions**: Email notification → Your email
5. Click **"Save Rule"**

**7.2 New Issue Alerts**

1. Create another rule: "New Issue Detected"
2. **Conditions**:
   - When: `A new issue is created`
3. **Actions**: Email notification
4. This catches brand new bugs immediately!

---

## ✅ Verification Checklist

After completing all steps, verify:

### Basic Integration
- [ ] Sentry account created
- [ ] DSN obtained and saved
- [ ] Auth token obtained and saved
- [ ] Environment variables configured (local + Netlify)
- [ ] App rebuilt with Sentry enabled
- [ ] Deployed to Netlify

### Error Tracking
- [ ] Browser console shows "Sentry initialized"
- [ ] Test error appears in Sentry dashboard
- [ ] Stack trace shows original TypeScript code (not minified)
- [ ] Error includes user context
- [ ] Breadcrumbs captured (user actions before error)

### Configuration
- [ ] Email alerts configured
- [ ] New issue alerts configured
- [ ] Browser extension errors filtered (automatic)
- [ ] Source maps uploading successfully

---

## 🎯 What You'll See in Sentry

### Example Error Report

```
🚨 TypeError: Cannot read properties of undefined (reading 'play')

📍 Location:
  File: src/components/AudioPlayer.tsx
  Line: 145
  Function: handlePlay

🖥️ Environment:
  Browser: Chrome 118.0.0.0
  OS: Windows 10
  URL: https://your-site.netlify.app/lessons/1

👤 User:
  ID: anonymous_user_123
  IP: 192.168.1.1 (masked for privacy)

🍞 Breadcrumbs (what user did before error):
  1. [Navigation] Visited homepage
  2. [Click] Clicked "Start Lesson 1"
  3. [Audio] Audio player initialized
  4. [Click] Clicked "Play" button
  5. [ERROR] Cannot read properties of undefined

📊 Performance:
  Page Load: 1.8s
  Time to Error: 3.2s
```

---

## 🐛 Troubleshooting

### Issue: "Sentry is not capturing errors"

**Check 1**: DSN is configured
```bash
# In terminal
echo $VITE_SENTRY_DSN
```

**Check 2**: Browser console
- F12 → Console
- Look for "Sentry initialized" message
- Look for "Sentry: DSN not configured" warning

**Check 3**: Environment variable spelling
- Verify exact spelling: `VITE_SENTRY_DSN` (not `VITE_SENTRY_DNS`)
- Check no extra spaces

**Solution**:
```bash
# Verify .env.production
cat .env.production | grep SENTRY

# Rebuild
npm run build

# Redeploy
netlify deploy --prod
```

---

### Issue: "Source maps not working"

**Symptoms**: Stack traces show minified code like `a.jsx:1:234`

**Check**:
1. `SENTRY_AUTH_TOKEN` is set
2. Build logs show "Uploading source maps"
3. Token has `project:releases` scope

**Solution**:
```bash
# Check build output
npm run build 2>&1 | grep -i sentry

# Should see:
# "Uploading source maps to Sentry..."
# "✓ Source maps uploaded successfully"
```

If not uploading:
1. Verify token has correct scopes
2. Check token hasn't expired
3. Regenerate token if needed

---

### Issue: "Too many events, rate limited"

**Symptoms**: Sentry dashboard shows "Rate limit exceeded"

**Cause**: Free tier limit (5,000 errors/month) exceeded

**Solutions**:

**Option 1**: Reduce sample rate (recommended)

Edit `src/sentry.config.ts`:
```typescript
Sentry.init({
  // ... other config
  tracesSampleRate: 0.05,  // Reduce to 5% from 10%
  replaysSessionSampleRate: 0.05,  // Reduce to 5% from 10%
});
```

**Option 2**: Filter out noisy errors

Add to `ignoreErrors` array:
```typescript
ignoreErrors: [
  'ResizeObserver loop limit exceeded',
  'Network request failed',
  'YOUR_NOISY_ERROR_MESSAGE',
],
```

**Option 3**: Upgrade to paid plan

- Team Plan: $26/month (50,000 errors/month)
- Business Plan: Custom pricing

---

### Issue: "Manifest 401 error still appears"

**Check**:
1. Netlify headers configured correctly
2. Manifest file is in `dist` folder
3. CORS headers added

**Solution**:
```bash
# Verify manifest in dist
ls -la dist/manifest.json

# Should show:
# -rw-r--r-- 1 user group 1234 date manifest.json

# Verify netlify.toml
cat netlify.toml | grep -A5 "manifest.json"

# Should show Access-Control-Allow-Origin header
```

---

## 📈 Monitoring Best Practices

### 1. Check Sentry Weekly

Set a calendar reminder:
- Review error trends
- Check for new issues
- Verify alerts are working
- Monitor performance metrics

### 2. Add Custom Context

Enhance errors with app-specific data:

```typescript
import { setSentryContext } from './sentry.config';

// When user selects Surah
setSentryContext('quran', {
  surah: currentSurah,
  ayah: currentAyah,
  reciter: selectedReciter,
});
```

Now errors will include Quran context!

### 3. User Privacy

Sentry automatically:
- ✅ Masks passwords
- ✅ Masks credit card numbers
- ✅ Masks email addresses (configurable)
- ✅ Anonymizes IP addresses

No PII (Personally Identifiable Information) is sent unless explicitly configured.

---

## 💰 Pricing & Limits

### Free Plan (Current)
- **Errors**: 5,000/month
- **Performance**: 10,000 transactions/month
- **Replays**: 50 session replays/month
- **Projects**: 1 project
- **Retention**: 30 days

### Is This Enough?

**Typical QuranApp usage**:
- Errors: 100-500/month (well within limit) ✅
- Performance: 5,000-8,000/month (within limit) ✅
- Replays: 20-40/month (within limit) ✅

**During beta testing**: May spike, but still likely within limits

**If you exceed**: Sentry sends email warning, doesn't block your app

---

## 🎉 Success Indicators

After setup, you should have:

✅ **Real-Time Error Monitoring**
- Errors appear in dashboard within 10 seconds
- Email notifications for critical issues
- Stack traces with original code

✅ **Performance Insights**
- Page load times tracked
- API call duration monitored
- Slow operations identified

✅ **Session Replay**
- Watch user sessions when errors occur
- See exactly what user did before error
- Identify UX issues

✅ **Proactive Issue Detection**
- Catch errors before users report them
- Identify patterns (e.g., "error only on iOS Safari")
- Fix bugs faster with detailed context

---

## 📞 Support & Resources

**Sentry Documentation**:
- Getting Started: https://docs.sentry.io/platforms/javascript/guides/react/
- Configuration: https://docs.sentry.io/platforms/javascript/configuration/
- Performance: https://docs.sentry.io/platforms/javascript/performance/
- Session Replay: https://docs.sentry.io/platforms/javascript/session-replay/

**QuranApp Files**:
- Sentry Config: `src/sentry.config.ts`
- Test Button: `src/components/SentryTestButton.tsx`
- Vite Plugin: `vite.config.ts` (lines 199-219)
- Environment: `.env.production`

**Getting Help**:
- Sentry Community: https://forum.sentry.io
- GitHub Issues: https://github.com/getsentry/sentry-javascript/issues
- Stack Overflow: Tag `sentry`, `react`

---

## ✅ Next Steps

**After Completing This Guide**:

1. **Monitor for 24 hours**
   - Watch Sentry dashboard
   - Check that errors are being captured
   - Verify source maps working

2. **Set up Slack integration** (optional)
   - Real-time error notifications in Slack
   - Sentry Dashboard → Settings → Integrations → Slack

3. **Review performance data**
   - Identify slow pages
   - Optimize based on metrics

4. **Iterate on error handling**
   - Fix common errors
   - Add better error messages
   - Improve user experience

---

**Setup Guide Version**: 1.0
**Last Updated**: 2025-10-31
**Estimated Time**: 15-20 minutes
**Difficulty**: Easy (step-by-step)

**Ready to start?** Begin with Step 1: Create Sentry Account!
