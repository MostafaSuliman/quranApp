# QuranApp - Quick Start Guide

**For**: New developers joining the QuranApp project
**Time to Complete**: 30 minutes
**Prerequisites**: Node.js 18+, Git, Code editor

---

## 🚀 30-Minute Onboarding

This guide gets you from zero to productive in 30 minutes.

---

## Step 1: Clone & Setup (5 minutes)

### 1.1 Clone Repository

```bash
git clone https://github.com/your-org/quranApp.git
cd quranApp
```

### 1.2 Install Dependencies

```bash
npm install
```

### 1.3 Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# No API keys needed for local development
```

### 1.4 Verify Installation

```bash
npm run dev
```

Open http://localhost:5173 - you should see the QuranApp homepage.

✅ **Checkpoint**: App running locally

---

## Step 2: Understand the Architecture (10 minutes)

### 2.1 Read Core Documents (5 minutes)

**Priority Reading Order**:

1. **[README.md](../README.md)** (2 min) - Project overview
2. **[MASTER_ROADMAP.md](./MASTER_ROADMAP.md)** (3 min) - Executive summary section
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** (5 min) - System overview diagram

### 2.2 Explore Project Structure (5 minutes)

```
quranApp/
├── src/
│   ├── components/     # React components (atoms → organisms → pages)
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # Zustand state management
│   ├── services/       # API and business logic
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript definitions
├── docs/               # All documentation
├── public/             # Static assets
└── tests/              # Test files
```

**Key Files to Bookmark**:
- `src/stores/quranStore.ts` - Quran text state
- `src/services/QuranService.ts` - Quran API integration
- `src/components/pages/` - Main app pages

✅ **Checkpoint**: Understand folder structure

---

## Step 3: Make Your First Change (10 minutes)

### 3.1 Find Your Sprint Assignment

```bash
# Open the task matrix
open docs/AGENT_TASK_MATRIX.md

# Find current sprint (look for "in_progress" tasks)
# Identify your assigned agent role
```

### 3.2 Create a Feature Branch

```bash
# Format: feature/QAPP-{issue-number}-{short-description}
git checkout -b feature/QAPP-1-project-setup
```

### 3.3 Write Your First Test (Example)

```typescript
// tests/utils/arabic.test.ts
import { describe, it, expect } from 'vitest';
import { isArabic } from '../src/utils/arabic';

describe('Arabic Utilities', () => {
  it('should detect Arabic text', () => {
    expect(isArabic('بِسْمِ ٱللَّهِ')).toBe(true);
    expect(isArabic('Hello')).toBe(false);
  });
});
```

### 3.4 Run Tests

```bash
npm test
```

✅ **Checkpoint**: First test passing

---

## Step 4: Understand Your Agent Role (5 minutes)

### 4.1 Find Your Role

Based on your assigned tasks, you're likely one of these agents:

#### 🏗️ System Architect
**Your Docs**: [ARCHITECTURE.md](./ARCHITECTURE.md)
**Your Tasks**: System design, component architecture, Zustand stores
**Your Tools**: React, TypeScript, Vite configuration

#### 💻 Frontend Coder
**Your Docs**: [FRONTEND_PLAN.md](./FRONTEND_PLAN.md)
**Your Tasks**: Components, UI, React hooks
**Your Tools**: React, TailwindCSS, shadcn/ui

#### 🔧 Backend Developer
**Your Docs**: [BACKEND_SERVICES.md](./BACKEND_SERVICES.md)
**Your Tasks**: API integration, services, IndexedDB
**Your Tools**: Axios, IndexedDB, service workers

#### 🧪 QA Tester
**Your Docs**: [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
**Your Tasks**: Unit tests, E2E tests, accessibility
**Your Tools**: Vitest, Playwright, axe DevTools

#### 🚀 CI/CD Engineer
**Your Docs**: [DEVOPS_PIPELINE.md](./DEVOPS_PIPELINE.md)
**Your Tasks**: GitHub Actions, deployment, monitoring
**Your Tools**: GitHub Actions, Vercel, Sentry

#### 📱 Mobile Developer
**Your Docs**: [PWA_MOBILE_SPEC.md](./PWA_MOBILE_SPEC.md)
**Your Tasks**: PWA features, service workers, responsive design
**Your Tools**: Workbox, PWA manifest

#### ⚡ Performance Analyst
**Your Docs**: [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)
**Your Tasks**: Code splitting, lazy loading, bundle optimization
**Your Tools**: Vite, Lighthouse, Web Vitals

#### 🔒 Security Reviewer
**Your Docs**: [SECURITY_QUALITY.md](./SECURITY_QUALITY.md)
**Your Tasks**: Security audits, code reviews, GDPR compliance
**Your Tools**: ESLint, npm audit, Snyk

### 4.2 Review Your Agent's Documentation

Open your primary document and read:
- Your responsibilities
- Your assigned sprints
- Your deliverables

✅ **Checkpoint**: Know your role and docs

---

## Common Workflows

### Development Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/QAPP-XX-description

# 3. Make changes
# ... edit files ...

# 4. Run quality checks
npm run lint          # Check code style
npm run typecheck     # Check TypeScript
npm test              # Run tests

# 5. Commit changes
git add .
git commit -m "feat(component): add Surah list component

- Implement SurahList component
- Add unit tests
- Update documentation

Closes QAPP-5"

# 6. Push and create PR
git push origin feature/QAPP-XX-description
# Then create PR on GitHub
```

### Testing Workflow

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test src/components/Surah.test.tsx

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

### Component Creation Workflow

```bash
# 1. Create component file
touch src/components/molecules/SurahCard.tsx

# 2. Create test file
touch src/components/molecules/SurahCard.test.tsx

# 3. Create story (if using Storybook)
touch src/components/molecules/SurahCard.stories.tsx

# 4. Implement component
# ... write component code ...

# 5. Write tests
# ... write test cases ...

# 6. Run tests
npm test
```

---

## Essential Commands

### Development

```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run typecheck        # Check TypeScript types
```

### Testing

```bash
npm test                 # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests with Playwright
```

### Build & Deploy

```bash
npm run build            # Production build
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
```

---

## Daily Checklist

### Morning (Start of Day)

- [ ] Pull latest changes: `git pull origin main`
- [ ] Check current sprint in [AGENT_TASK_MATRIX.md](./AGENT_TASK_MATRIX.md)
- [ ] Review your assigned tasks
- [ ] Check GitHub issues for your agent
- [ ] Run `npm install` if package.json changed

### During Development

- [ ] Create feature branch for each task
- [ ] Write tests before/with implementation (TDD)
- [ ] Run `npm run lint` before committing
- [ ] Run `npm test` before pushing
- [ ] Update documentation if needed

### End of Day

- [ ] Push all commits to remote
- [ ] Update task status in issue tracker
- [ ] Document any blockers
- [ ] Review tomorrow's tasks

---

## Getting Help

### Documentation

1. **Check README.md** in `docs/` folder
2. **Search** relevant agent documentation
3. **Review** code examples in docs

### Team Communication

1. **GitHub Issues**: For bugs and features
2. **Pull Requests**: For code reviews
3. **Documentation**: Update and reference

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

#### Type Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run typecheck
```

#### Test Failures

```bash
# Clear test cache
npm test -- --clearCache
npm test
```

#### Build Failures

```bash
# Clean and rebuild
rm -rf dist node_modules/.vite
npm run build
```

---

## Your First Tasks

Based on current sprint (check [AGENT_TASK_MATRIX.md](./AGENT_TASK_MATRIX.md)):

### If You're in Sprint 1-2 (Foundation)

**System Architect**: Set up project structure
**Backend Developer**: Integrate Tanzil.net API
**CI/CD Engineer**: Configure GitHub Actions

### If You're in Sprint 3-4 (Reading)

**Frontend Coder**: Build Mushaf page component
**System Architect**: Implement Arabic typography
**QA Tester**: Write component tests

### If You're in Sprint 5-6 (Audio)

**Backend Developer**: Integrate audio API
**Frontend Coder**: Build audio player
**Mobile Developer**: Implement offline audio

---

## Next Steps

1. ✅ Complete this quick start guide
2. 📖 Read your agent-specific documentation
3. 🎯 Review your assigned sprint tasks
4. 💻 Set up your development environment
5. 🚀 Start your first task!

---

## Useful Links

### Internal Documentation

- [Master Roadmap](./MASTER_ROADMAP.md) - Project overview
- [Architecture](./ARCHITECTURE.md) - System design
- [Task Matrix](./AGENT_TASK_MATRIX.md) - Task assignments
- [Documentation Index](./README.md) - All docs

### External Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest API](https://vitest.dev/api/)
- [TailwindCSS](https://tailwindcss.com/docs)

### Project Repos

- **GitHub**: [Repository URL]
- **Staging**: [Staging URL]
- **Production**: [Production URL]

---

## Welcome to the Team! 🎉

You're now ready to contribute to QuranApp. Remember:

1. **Quality Over Speed**: We value well-tested, documented code
2. **Ask Questions**: No question is too small
3. **Follow Docs**: Our documentation is comprehensive
4. **Islamic Values**: We're building something meaningful

**May your code be bug-free and your commits be meaningful!**

---

**Quick Start Guide Maintained By**: Planner Agent
**Last Updated**: November 2025
**Next Review**: End of Sprint 1
