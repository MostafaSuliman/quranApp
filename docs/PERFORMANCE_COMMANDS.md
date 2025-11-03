# Performance Optimization - Quick Command Reference

## Build & Analysis

### Production Build
```bash
# Standard production build
npm run build

# Build with analysis (generates stats.html)
npm run build
open dist/stats.html
```

### Bundle Size Analysis
```bash
# Check total bundle size
du -h dist/

# Check individual asset sizes
ls -lh dist/assets/

# Check compressed sizes
ls -lh dist/assets/*.{gz,br}

# View interactive bundle visualization
open dist/stats.html
```

### Development Server
```bash
# Start dev server
npm run dev

# Dev server with host access
npm run dev -- --host
```

## Performance Testing

### All Tests
```bash
# Run all test suites
npm run test:all

# Run with coverage
npm run test:report
```

### Specific Test Suites
```bash
# Mobile optimization tests
npm run test:mobile

# Load testing
npm run test:load

# Performance tests
npm run test:enhanced

# Security tests
npm run test:security
```

### E2E Testing
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific tests
npm run test:e2e:performance
npm run test:e2e:pwa
```

## Dependency Management

### Check Dependencies
```bash
# Verify Three.js removal
npm ls three @react-three/fiber @react-three/drei

# Check all dependencies
npm ls

# Check outdated packages
npm outdated

# Check for vulnerabilities
npm audit
```

### Update Dependencies
```bash
# Update all dependencies
npm update

# Update specific package
npm update <package-name>

# Check for major updates
npx npm-check-updates
```

## Performance Monitoring

### Lighthouse Audit
```bash
# Run Lighthouse (in Chrome DevTools)
# Open DevTools > Lighthouse tab > Generate report

# Or use Lighthouse CI
npx lighthouse http://localhost:3000 --view
```

### Bundle Size Check
```bash
# Size of main bundle
ls -lh dist/assets/index-*.js

# Size of vendor chunks
ls -lh dist/assets/*-vendor-*.js

# Total size comparison
du -sh dist/

# Gzip size
gzip -c dist/assets/index-*.js | wc -c
```

### Performance Profiling
```bash
# In Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Performance tab
# 3. Record profile
# 4. Perform actions
# 5. Stop recording
# 6. Analyze flame chart
```

## Build Optimization Commands

### Clean Build
```bash
# Remove dist folder
rm -rf dist/

# Clean install
rm -rf node_modules package-lock.json
npm install

# Clean build
rm -rf dist/ && npm run build
```

### Production Preview
```bash
# Preview production build
npm run preview

# Preview with custom port
npm run preview -- --port 3001
```

## Code Quality

### Linting
```bash
# Run ESLint
npm run lint

# Fix automatically
npm run lint -- --fix
```

### Type Checking
```bash
# Check TypeScript types
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

## Advanced Analysis

### Size Limit Check
```bash
# Check if bundle size is within limits
npx size-limit
```

### Bundle Analyzer (Alternative)
```bash
# Use webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/stats.json
```

### Dependency Size
```bash
# Check size of each dependency
npx cost-of-modules

# Or use bundlephobia
npx bundlephobia <package-name>
```

### Performance Budget
```bash
# Check performance budget
npx bundlesize

# Configure in package.json:
{
  "bundlesize": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "500 kB"
    }
  ]
}
```

## Monitoring Commands

### Real-time Performance
```javascript
// In browser console
performance.getEntriesByType('navigation')[0]
performance.getEntriesByType('resource')
performance.memory
```

### React DevTools
```bash
# Open React DevTools
# Chrome Extension: React Developer Tools
# Profiler tab > Record > Stop > Analyze
```

### Memory Profiling
```javascript
// In Chrome DevTools Console
// 1. Memory tab
// 2. Take heap snapshot
// 3. Compare snapshots
// 4. Find memory leaks
```

## Optimization Verification

### Check Three.js Removal
```bash
# Should return empty
npm ls three

# Check node_modules size
du -sh node_modules/

# Compare before: 450MB
# Compare after: 415MB
```

### Check AudioPlayer Optimization
```bash
# In React DevTools Profiler:
# 1. Start profiling
# 2. Play audio
# 3. Stop after 1 minute
# 4. Check render count
# Before: 40-50 renders
# After: 12-15 renders
```

### Verify Code Splitting
```bash
# Check for page chunks
ls -lh dist/assets/page-*.js

# Check for vendor chunks
ls -lh dist/assets/*-vendor-*.js

# Should see separate files for:
# - react-vendor
# - framer-vendor
# - zustand-vendor
# - audio-vendor
# - ui-vendor
```

### Check Compression
```bash
# Verify .gz files exist
ls dist/assets/*.gz | wc -l

# Verify .br files exist
ls dist/assets/*.br | wc -l

# Compare sizes
ls -lh dist/assets/index-*.{js,js.gz,js.br}
```

## Quick Fixes

### Clear Cache
```bash
# Clear node modules cache
npm cache clean --force

# Clear Vite cache
rm -rf node_modules/.vite

# Clear build cache
rm -rf dist/
```

### Fix Dependencies
```bash
# Fix peer dependencies
npm install --legacy-peer-deps

# Deduplicate dependencies
npm dedupe

# Prune unused dependencies
npm prune
```

### Reset Everything
```bash
# Complete reset
rm -rf node_modules package-lock.json dist/
npm install
npm run build
```

## Performance Checklist

### Before Release
```bash
# 1. Clean install
rm -rf node_modules package-lock.json && npm install

# 2. Run tests
npm run test:all

# 3. Check bundle size
npm run build && ls -lh dist/assets/

# 4. Verify optimization
open dist/stats.html

# 5. Run Lighthouse
# Open in Chrome DevTools

# 6. Check for vulnerabilities
npm audit

# 7. Verify compression
ls -lh dist/assets/*.{gz,br}

# 8. Test production preview
npm run preview
```

### Ongoing Monitoring
```bash
# Weekly: Check bundle size
npm run build && du -sh dist/

# Monthly: Update dependencies
npm outdated && npm update

# Quarterly: Full audit
npm audit && npm run test:all
```

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite dist/
npm run build
```

### Large Bundle Size
```bash
# Analyze what's large
npm run build
open dist/stats.html
# Look for largest chunks
```

### Slow Performance
```bash
# Profile in React DevTools
# Check for unnecessary re-renders
# Use Chrome Performance tab
```

### Type Errors
```bash
# Check all type errors
npx tsc --noEmit

# Fix incrementally
# Fix one file at a time
```

## Documentation

### View Documentation
```bash
# Performance guide
cat docs/PERFORMANCE_OPTIMIZATION.md

# Summary
cat PERFORMANCE_SUMMARY.md

# Complete status
cat docs/OPTIMIZATION_COMPLETE.md

# Quick commands (this file)
cat docs/PERFORMANCE_COMMANDS.md
```

### Generate Documentation
```bash
# Generate TypeScript docs
npx typedoc --out docs/api src/

# Generate component docs
npx react-docgen src/components/ --out docs/components.json
```

## Useful Snippets

### Measure Performance
```javascript
// In browser console
const start = performance.now()
// ... your code
const end = performance.now()
console.log(`Took ${end - start}ms`)
```

### Check Re-renders
```javascript
// Add to component
useEffect(() => {
  console.log('Component rendered')
})
```

### Memory Usage
```javascript
// In browser console
console.log(performance.memory)
// Check: usedJSHeapSize, totalJSHeapSize
```

### Network Performance
```javascript
// In browser console
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('.js'))
  .map(r => ({ name: r.name, size: r.transferSize }))
```

## Resources

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Bundle Analyzer](https://github.com/btd/rollup-plugin-visualizer)

### Documentation
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)

---

**Quick Start:**
```bash
npm run build && open dist/stats.html
```

**Check Optimization:**
```bash
npm ls three && ls -lh dist/assets/
```

**Run Tests:**
```bash
npm run test:all
```
