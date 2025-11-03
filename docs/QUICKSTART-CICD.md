# CI/CD Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

This installs:
- ✅ `@sentry/react` - Error monitoring
- ✅ `@sentry/vite-plugin` - Source map upload
- ✅ `@vitest/coverage-v8` - Code coverage

### Step 2: Configure GitHub Secrets (2 min)

Go to: **Settings → Secrets → Actions → New repository secret**

```bash
# Required for Sentry error monitoring
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=quranapp
SENTRY_AUTH_TOKEN=sntrys_xxxxx

# Required for code coverage reporting
CODECOV_TOKEN=xxxxx
```

### Step 3: Set Up Local Environment (1 min)
```bash
# Copy template
cp .env.example .env

# Edit with your Sentry DSN
nano .env
```

Add your Sentry DSN from https://sentry.io:
```env
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Step 4: Test Locally (1 min)
```bash
# Run tests with coverage
npm run test -- --coverage

# Build with Sentry
npm run build

# Verify it works
ls -lh dist/assets/*.js
```

## ✅ What You Get

### Automatic on Every Push:
1. **Code Quality Checks**
   - ESLint linting
   - TypeScript type checking
   - 0 errors policy

2. **Testing**
   - Unit tests with Vitest
   - E2E tests with Playwright
   - Coverage enforcement (≥80%)

3. **Security**
   - npm audit
   - Dependency vulnerability scanning
   - 0 critical/high vulnerabilities

4. **Build & Deploy**
   - Production builds
   - Performance audits
   - Bundle size analysis

5. **Error Monitoring**
   - Automatic error capture
   - Performance tracking
   - Session replay

### Quality Gates:
- ✅ Code coverage ≥80%
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ 0 critical/high security issues
- ✅ Bundle size ≤5MB

## 📊 Monitoring Dashboards

After setup, access:
- **Sentry:** https://sentry.io → View errors and performance
- **Codecov:** https://codecov.io → View coverage trends
- **GitHub Actions:** Repository → Actions → View CI runs

## 🧪 Test Your Setup

```bash
# Create test branch
git checkout -b feat/test-cicd

# Make a small change
echo "// Test" >> src/main.tsx

# Commit and push
git add .
git commit -m "test: CI/CD setup"
git push origin feat/test-cicd

# Create PR
gh pr create --title "Test CI/CD" --body "Testing CI/CD setup"
```

Watch the workflows run in GitHub Actions! ✨

## 🔥 Quick Test Error Monitoring

Add this to test Sentry:

```typescript
// In any React component
import { captureMessage } from './sentry.config';

function TestButton() {
  return (
    <button onClick={() => captureMessage('Test from QuranApp!')}>
      Test Sentry
    </button>
  );
}
```

Click the button and check Sentry dashboard!

## 📚 Next Steps

1. Read full guide: `docs/ci-cd-setup.md`
2. Review workflows: `.github/workflows/`
3. Configure branch protection rules
4. Set up deployment environments

## 🆘 Troubleshooting

**Problem:** Sentry not capturing errors
```bash
# Check DSN is set
echo $VITE_SENTRY_DSN

# Verify initialization
# Should see Sentry client in browser console
```

**Problem:** Coverage failing
```bash
# Check what's not covered
npm run test -- --coverage --reporter=html
open coverage/index.html
```

**Problem:** Build failing
```bash
# Check the logs
gh run list
gh run view <run-id>

# Test locally
npm run build
```

## 🎉 Success Criteria

You're all set when:
- ✅ Tests pass locally with ≥80% coverage
- ✅ Build succeeds locally
- ✅ GitHub Actions workflows are green
- ✅ Sentry captures test errors
- ✅ Quality gates pass

## 📞 Get Help

- Full docs: `docs/ci-cd-setup.md`
- Summary: `docs/ci-cd-summary.md`
- Create issue with `ci/cd` label
