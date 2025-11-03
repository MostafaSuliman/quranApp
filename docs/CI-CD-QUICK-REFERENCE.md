# CI/CD Quick Reference Guide

Quick commands and workflows for common CI/CD operations.

## 🚀 Quick Commands

### Local Development

```bash
# Install dependencies
npm ci

# Run development server
npm run dev

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Type check
npx tsc --noEmit

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Build production
npm run build

# Preview production build
npm run preview
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/new-feature

# Stage changes
git add .

# Commit changes
git commit -m "feat: add new feature"

# Push to remote (triggers CI)
git push origin feat/new-feature

# Create pull request (triggers CI + Quality Gates)
gh pr create --base main --title "Add new feature"
```

### Deployment

```bash
# Deploy to staging
gh workflow run production-deploy.yml -f environment=staging

# Deploy to production
gh workflow run production-deploy.yml -f environment=production

# Check deployment status
gh run list --workflow=production-deploy.yml

# View workflow logs
gh run view <run-id> --log
```

## 📊 Monitoring

### Sentry

```bash
# View recent errors
open https://sentry.io/organizations/your-org/projects/quranapp/

# View specific release
open https://sentry.io/organizations/your-org/releases/v1.0.0/
```

### GitHub Actions

```bash
# List workflow runs
gh run list

# View specific run
gh run view <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed

# Cancel running workflow
gh run cancel <run-id>

# Watch workflow in real-time
gh run watch <run-id>
```

## 🔧 Troubleshooting

### CI Failures

**Linting Errors:**
```bash
# Fix automatically
npm run lint -- --fix

# Check specific file
npm run lint -- --quiet src/components/MyComponent.tsx
```

**Type Errors:**
```bash
# Check types
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/components/MyComponent.tsx
```

**Test Failures:**
```bash
# Run specific test
npm test -- src/components/__tests__/MyComponent.test.tsx

# Run with watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build

# Build with verbose output
npm run build -- --mode production --logLevel info
```

### Deployment Failures

**Health Check Failed:**
```bash
# Check application locally
npm run build && npm run preview
curl http://localhost:3000/health

# Check deployment logs
gh run view <run-id> --log

# Manual rollback
git revert HEAD
git push origin main
```

**Source Map Upload Failed:**
```bash
# Verify Sentry configuration
cat .sentryclirc

# Check environment variables
echo $SENTRY_AUTH_TOKEN

# Manual upload
npx sentry-cli releases files <version> upload-sourcemaps dist/assets
```

## 📋 Common Workflows

### Creating a New Feature

```bash
# 1. Create branch
git checkout -b feat/my-feature

# 2. Make changes
# ... edit files ...

# 3. Test locally
npm test
npm run lint
npx tsc --noEmit

# 4. Commit and push
git add .
git commit -m "feat: implement my feature"
git push origin feat/my-feature

# 5. Create PR
gh pr create --base develop --title "feat: implement my feature"

# 6. Wait for CI (auto-runs on PR)
# 7. Merge after approval and CI pass
```

### Hotfix Process

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# ... edit files ...

# 3. Test thoroughly
npm test
npm run test:e2e
npm run build

# 4. Commit and push
git add .
git commit -m "fix: critical bug in production"
git push origin hotfix/critical-bug

# 5. Create PR to main (skip staging)
gh pr create --base main --title "fix: critical bug in production"

# 6. After merge, tag new version
git checkout main
git pull origin main
git tag v1.0.1
git push origin v1.0.1

# 7. Deployment auto-triggers on tag push
```

### Release Process

```bash
# 1. Ensure all features are merged to develop
git checkout develop
git pull origin develop

# 2. Create release branch
git checkout -b release/v1.1.0

# 3. Update version
npm version minor  # or major/patch

# 4. Update CHANGELOG.md
# ... edit CHANGELOG.md ...

# 5. Commit and push
git add .
git commit -m "chore: prepare v1.1.0 release"
git push origin release/v1.1.0

# 6. Create PR to main
gh pr create --base main --title "Release v1.1.0"

# 7. After merge, tag release
git checkout main
git pull origin main
git tag v1.1.0
git push origin v1.1.0

# 8. Merge back to develop
git checkout develop
git merge main
git push origin develop
```

## 🎯 Quality Checklist

Before creating a PR:

```bash
# ✅ Linting passes
npm run lint

# ✅ Type checking passes
npx tsc --noEmit

# ✅ Tests pass
npm test

# ✅ E2E tests pass
npm run test:e2e

# ✅ Build succeeds
npm run build

# ✅ Coverage meets threshold
npm test -- --coverage

# ✅ No security vulnerabilities
npm audit
```

## 🔐 Security

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Audit security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Force fix (may have breaking changes)
npm audit fix --force
```

### Secret Management

```bash
# Add GitHub secret
gh secret set SENTRY_AUTH_TOKEN

# List secrets
gh secret list

# Remove secret
gh secret remove SENTRY_AUTH_TOKEN
```

## 📈 Performance

### Bundle Analysis

```bash
# Build and check sizes
npm run build
du -h dist/assets/*.js
du -h dist/assets/*.css

# Total build size
du -sh dist
```

### Lighthouse Audit

```bash
# Build and start server
npm run build
npm run preview &

# Run Lighthouse
npx lighthouse http://localhost:3000 --view

# Run Lighthouse CI
npx lhci autorun
```

## 🆘 Emergency Procedures

### Production Down

```bash
# 1. Check Sentry for errors
open https://sentry.io/organizations/your-org/projects/quranapp/

# 2. Check GitHub Actions
gh run list --workflow=production-deploy.yml

# 3. Quick rollback
gh workflow run production-deploy.yml -f environment=production -f version=v1.0.0

# 4. Or manual revert
git checkout main
git revert HEAD
git push origin main
```

### CI/CD Pipeline Broken

```bash
# 1. Check workflow status
gh run list

# 2. View failed run
gh run view <run-id> --log

# 3. Re-run failed jobs
gh run rerun <run-id> --failed

# 4. If cache issues, clear cache
gh cache delete <cache-key>

# 5. If still failing, disable workflow temporarily
gh workflow disable <workflow-name>
```

## 📞 Support Contacts

- **CI/CD Issues**: Create issue with `ci/cd` label
- **Sentry Issues**: Check Sentry documentation
- **GitHub Actions**: Check Actions dashboard
- **Deployment**: Check deployment provider documentation

## 🔗 Quick Links

- [Full CI/CD Documentation](./ci-cd-setup.md)
- [Implementation Summary](./CI-CD-IMPLEMENTATION-SUMMARY.md)
- [Sentry Dashboard](https://sentry.io)
- [GitHub Actions](https://github.com/actions)
- [Codecov Dashboard](https://codecov.io)
