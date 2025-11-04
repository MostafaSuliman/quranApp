# QuranApp - Agent Task Assignment Matrix

**Document Version**: 1.0
**Last Updated**: November 2025
**Purpose**: Detailed task breakdown by agent with hour estimates

---

## Task Assignment Overview

This matrix provides a detailed breakdown of all 310 story points across 10 specialized agents with hour estimates, dependencies, and deliverables.

### Estimation Guidelines

- **1 Story Point** = 2-3 hours
- **310 Story Points** = 620-930 hours total
- **Team Size**: 10 agents working in parallel
- **Duration**: 24 weeks (6 months)

---

## Agent 1: System Architect

**Total Story Points**: 52
**Total Hours**: 104-156 hours
**Primary Sprints**: 1-2, 3, 11-12

### Sprint 1-2: Foundation (26 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| ARCH-1 | Project setup (React 18 + TypeScript + Vite) | 8 | None | Working project scaffold |
| ARCH-2 | Zustand store architecture | 6 | ARCH-1 | 5 store definitions |
| ARCH-3 | TailwindCSS + shadcn/ui setup | 4 | ARCH-1 | UI library configured |
| ARCH-4 | Folder structure design | 2 | ARCH-1 | src/ organization |
| ARCH-5 | TypeScript strict mode configuration | 4 | ARCH-1 | tsconfig.json |
| ARCH-6 | Development environment setup | 2 | ARCH-1 | .env, .gitignore |

**Sprint 1-2 Total**: 26 hours

### Sprint 3: Arabic Typography (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| ARCH-7 | Amiri Quran font integration | 6 | ARCH-3 | Font files optimized |
| ARCH-8 | Tajweed marks rendering system | 10 | ARCH-7 | Typography component |
| ARCH-9 | RTL layout architecture | 6 | ARCH-7 | RTL CSS system |
| ARCH-10 | Islamic typography testing | 4 | ARCH-8 | Test suite |

**Sprint 3 Total**: 26 hours

### Sprint 11: Performance Architecture (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| ARCH-11 | Code splitting architecture review | 8 | All features | Split strategy |
| ARCH-12 | Virtual scrolling implementation | 10 | FE-12 | react-window setup |
| ARCH-13 | Memory optimization patterns | 4 | ARCH-12 | Optimization guide |
| ARCH-14 | Architecture documentation update | 4 | ARCH-11 | ARCHITECTURE.md v2 |

**Sprint 11 Total**: 26 hours

**Documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Agent 2: Planner

**Total Story Points**: 31
**Total Hours**: 62-93 hours
**Primary Sprints**: All sprints (coordination)

### Ongoing: Sprint Management (continuous)

| Task ID | Task | Hours/Sprint | Dependencies | Deliverable |
|---------|------|-------------|--------------|-------------|
| PLAN-1 | Sprint planning | 4 | Previous sprint | Sprint backlog |
| PLAN-2 | Daily standup coordination | 5 | None | Daily updates |
| PLAN-3 | Risk monitoring | 2 | All agents | Risk log |
| PLAN-4 | Dependency tracking | 3 | All agents | Dependency graph |
| PLAN-5 | Sprint retrospective | 3 | Sprint end | Retro notes |
| PLAN-6 | Velocity tracking | 2 | Sprint end | Velocity chart |
| PLAN-7 | Roadmap updates | 2 | Sprint end | ROADMAP.md |

**Per Sprint**: 21 hours × 12 sprints = 252 hours (spread across team)

### Milestones: Documentation (7 milestones)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| PLAN-M1 | Milestone 1 report | 4 | Sprint 2 | M1 documentation |
| PLAN-M2 | Milestone 2 report | 4 | Sprint 4 | M2 documentation |
| PLAN-M3 | Milestone 3 report | 4 | Sprint 6 | M3 documentation |
| PLAN-M4 | Milestone 4 report | 4 | Sprint 8 | M4 documentation |
| PLAN-M5 | Milestone 5 report | 4 | Sprint 10 | M5 documentation |
| PLAN-M6 | Milestone 6 report | 4 | Sprint 11 | M6 documentation |
| PLAN-M7 | Launch report | 6 | Sprint 12 | M7 documentation |

**Milestones Total**: 30 hours

**Documentation**: [ROADMAP.md](./ROADMAP.md)

---

## Agent 3: Frontend Coder

**Total Story Points**: 104
**Total Hours**: 208-312 hours
**Primary Sprints**: 2-10 (core features)

### Sprint 2: Core UI (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-1 | Header component | 4 | ARCH-1 | Header.tsx |
| FE-2 | Footer component | 3 | ARCH-1 | Footer.tsx |
| FE-3 | Layout component | 4 | FE-1, FE-2 | Layout.tsx |
| FE-4 | shadcn/ui components | 5 | ARCH-3 | Button, Card, etc. |

**Sprint 2 Total**: 16 hours

### Sprint 2: Navigation (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-5 | Surah list component | 6 | BE-3 | SurahList.tsx |
| FE-6 | Surah card component | 4 | FE-5 | SurahCard.tsx |
| FE-7 | Navigation hooks | 4 | FE-5 | useNavigation.ts |
| FE-8 | Routing setup | 2 | ARCH-1 | router.tsx |

**Sprint 2 Total**: 16 hours

### Sprint 3: Mushaf View (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-9 | Page component | 10 | BE-2, ARCH-8 | MushafPage.tsx |
| FE-10 | Verse component | 6 | FE-9 | Verse.tsx |
| FE-11 | Page navigation | 6 | FE-9 | PageNav.tsx |
| FE-12 | Swipe gestures | 4 | FE-9, MOB-4 | useSwipe.ts |

**Sprint 3 Total**: 26 hours

### Sprint 4: Bookmarks (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-13 | Bookmark button | 4 | FE-10 | BookmarkBtn.tsx |
| FE-14 | Bookmark list | 6 | BE-4 | BookmarkList.tsx |
| FE-15 | Bookmark menu | 6 | FE-14 | BookmarkMenu.tsx |

**Sprint 4 Total**: 16 hours

### Sprint 5: Audio Player UI (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-16 | Audio player component | 8 | BE-5 | AudioPlayer.tsx |
| FE-17 | Player controls | 6 | FE-16 | Controls.tsx |
| FE-18 | Progress bar | 4 | FE-16 | ProgressBar.tsx |
| FE-19 | Reciter selector | 4 | BE-6 | ReciterSelect.tsx |

**Sprint 5 Total**: 22 hours (rounded to 26 for sprint)

### Sprint 6: Playback Controls (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-20 | Speed control | 4 | FE-16 | SpeedControl.tsx |
| FE-21 | Repeat mode selector | 6 | FE-16 | RepeatMode.tsx |
| FE-22 | Volume control | 4 | FE-16 | VolumeSlider.tsx |
| FE-23 | Audio visualization | 6 | FE-16 | Waveform.tsx |

**Sprint 6 Total**: 20 hours

### Sprint 7: Memorization UI (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-24 | Memorization mode toggle | 4 | BE-7 | MemMode.tsx |
| FE-25 | Repetition counter | 6 | BE-7 | RepeatCounter.tsx |
| FE-26 | Verse range selector | 6 | BE-7 | RangeSelect.tsx |
| FE-27 | Practice mode UI | 10 | BE-7 | PracticeMode.tsx |

**Sprint 7 Total**: 26 hours

### Sprint 8: Progress Tracking (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-28 | Progress charts | 10 | BE-8 | ProgressCharts.tsx |
| FE-29 | Statistics dashboard | 8 | BE-8 | StatsDashboard.tsx |
| FE-30 | Streak display | 4 | BE-8 | StreakWidget.tsx |
| FE-31 | Heatmap calendar | 4 | BE-8 | Heatmap.tsx |

**Sprint 8 Total**: 26 hours

### Sprint 9: Translation Display (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-32 | Translation toggle | 4 | BE-9 | TransToggle.tsx |
| FE-33 | Side-by-side view | 8 | BE-9 | SideBySide.tsx |
| FE-34 | Translation selector | 4 | BE-9 | TransSelect.tsx |

**Sprint 9 Total**: 16 hours

### Sprint 10: Settings UI (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| FE-35 | Settings page | 6 | None | Settings.tsx |
| FE-36 | Display settings | 4 | FE-35 | DisplaySettings.tsx |
| FE-37 | Audio settings | 4 | FE-35 | AudioSettings.tsx |
| FE-38 | Notification settings | 4 | FE-35, MOB-7 | NotifSettings.tsx |

**Sprint 10 Total**: 18 hours

**Documentation**: [FRONTEND_PLAN.md](./FRONTEND_PLAN.md)

---

## Agent 4: Backend Developer

**Total Story Points**: 78
**Total Hours**: 156-234 hours
**Primary Sprints**: 1-3, 5-6, 9-10

### Sprint 1: Quran API (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-1 | Tanzil.net API client | 8 | None | tanzilApi.ts |
| BE-2 | QuranService | 10 | BE-1 | QuranService.ts |
| BE-3 | Verse retrieval methods | 6 | BE-2 | getVerse(), getSurah() |
| BE-4 | IndexedDB schema (Quran) | 6 | BE-2 | quranStore schema |

**Sprint 1 Total**: 30 hours

### Sprint 2: Navigation API (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-5 | Surah metadata API | 4 | BE-2 | getSurahList() |
| BE-6 | Juz' navigation | 4 | BE-2 | getJuz() |
| BE-7 | Page navigation | 2 | BE-2 | getPage() |

**Sprint 2 Total**: 10 hours

### Sprint 4: Bookmarks (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-8 | Bookmark CRUD operations | 6 | BE-2 | BookmarkService.ts |
| BE-9 | IndexedDB schema (Bookmarks) | 4 | BE-8 | bookmarkStore |
| BE-10 | Last position tracking | 4 | BE-2 | savePosition() |
| BE-11 | Bookmark sync | 4 | BE-8 | syncBookmarks() |

**Sprint 4 Total**: 18 hours

### Sprint 5: Audio Service (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-12 | Quranicaudio.com API | 8 | None | audioApi.ts |
| BE-13 | AudioService | 12 | BE-12 | AudioService.ts |
| BE-14 | Audio streaming | 6 | BE-13 | streamAudio() |
| BE-15 | IndexedDB schema (Audio) | 4 | BE-13 | audioCache |

**Sprint 5 Total**: 30 hours

### Sprint 6: Audio Sync (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-16 | Synchronization engine | 12 | BE-13 | syncEngine.ts |
| BE-17 | Timing calculation | 6 | BE-16 | calculateTiming() |
| BE-18 | Audio caching | 6 | BE-15 | cacheAudio() |
| BE-19 | Offline audio downloads | 6 | BE-18 | downloadAudio() |

**Sprint 6 Total**: 30 hours

### Sprint 7: Memorization Service (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-20 | MemorizationService | 10 | BE-2 | MemorizationService.ts |
| BE-21 | Repetition engine | 8 | BE-20 | repeatVerse() |
| BE-22 | IndexedDB schema (Progress) | 6 | BE-20 | progressStore |
| BE-23 | Practice mode backend | 6 | BE-20 | testRecall() |

**Sprint 7 Total**: 30 hours

### Sprint 8: Spaced Repetition (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-24 | SM-2 algorithm | 10 | BE-20 | sm2.ts |
| BE-25 | Review scheduling | 6 | BE-24 | scheduleReview() |

**Sprint 8 Total**: 16 hours

### Sprint 9: Translations (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-26 | Quran.com API integration | 8 | None | qurancomApi.ts |
| BE-27 | TranslationService | 10 | BE-26 | TranslationService.ts |
| BE-28 | IndexedDB schema (Translations) | 4 | BE-27 | translationStore |
| BE-29 | Multi-language support | 8 | BE-27 | loadTranslations() |

**Sprint 9 Total**: 30 hours

### Sprint 9: Search (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-30 | Full-text search | 6 | BE-2 | searchArabic() |
| BE-31 | Translation search | 4 | BE-27 | searchTranslation() |

**Sprint 9 Total**: 10 hours

### Sprint 10: Tafsir (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| BE-32 | Tafsir API integration | 8 | None | tafsirApi.ts |
| BE-33 | TafsirService | 10 | BE-32 | TafsirService.ts |
| BE-34 | IndexedDB schema (Tafsir) | 4 | BE-33 | tafsirStore |
| BE-35 | Lazy loading Tafsir | 4 | BE-33 | loadTafsir() |

**Sprint 10 Total**: 26 hours

**Documentation**: [BACKEND_SERVICES.md](./BACKEND_SERVICES.md)

---

## Agent 5: QA Tester

**Total Story Points**: 62
**Total Hours**: 124-186 hours
**Primary Sprints**: 2-12 (continuous)

### Sprint 2: Testing Setup (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| QA-1 | Vitest configuration | 4 | ARCH-1 | vitest.config.ts |
| QA-2 | React Testing Library setup | 2 | QA-1 | test-utils.tsx |
| QA-3 | First unit tests | 4 | QA-2 | Initial test suites |

**Sprint 2 Total**: 10 hours

### Sprint 3-10: Unit Testing (5 pts per sprint)

| Task ID | Task | Hours/Sprint | Dependencies | Deliverable |
|---------|------|-------------|--------------|-------------|
| QA-4 | Component unit tests | 4 | Feature complete | Test files |
| QA-5 | Service unit tests | 4 | Service complete | Service tests |
| QA-6 | Hook unit tests | 2 | Hook complete | Hook tests |

**Sprints 3-10 Total**: 10 hours × 8 sprints = 80 hours

### Sprint 11: Accessibility (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| QA-7 | axe DevTools audit | 6 | All UI | Accessibility report |
| QA-8 | Screen reader testing | 8 | QA-7 | WCAG checklist |
| QA-9 | Keyboard navigation | 4 | QA-7 | Navigation tests |
| QA-10 | Color contrast check | 2 | QA-7 | Contrast report |

**Sprint 11 Total**: 20 hours

### Sprint 11-12: E2E Testing (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| QA-11 | Playwright setup | 4 | None | playwright.config.ts |
| QA-12 | E2E test scenarios | 10 | All features | 6 user journeys |
| QA-13 | Cross-browser tests | 6 | QA-12 | Browser test matrix |

**Sprint 11-12 Total**: 20 hours

### Sprint 12: Beta Testing (3 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| QA-14 | User acceptance testing | 4 | Staging deploy | UAT report |
| QA-15 | Bug tracking | 2 | QA-14 | Bug list |

**Sprint 12 Total**: 6 hours

**Documentation**: [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)

---

## Agent 6: CI/CD Engineer

**Total Story Points**: 18
**Total Hours**: 36-54 hours
**Primary Sprints**: 1-2, 11-12

### Sprint 1: CI/CD Setup (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| CI-1 | GitHub Actions workflow | 6 | ARCH-1 | .github/workflows/ci.yml |
| CI-2 | Linting pipeline | 2 | ARCH-5 | lint.yml |
| CI-3 | Type checking pipeline | 2 | ARCH-5 | typecheck.yml |

**Sprint 1 Total**: 10 hours

### Sprint 2: Deployment (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| CI-4 | Vercel configuration | 4 | ARCH-1 | vercel.json |
| CI-5 | Staging environment | 4 | CI-4 | Staging deploy |
| CI-6 | Preview deployments | 2 | CI-4 | PR previews |

**Sprint 2 Total**: 10 hours

### Sprint 11: Monitoring (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| CI-7 | Sentry integration | 4 | All features | Error tracking |
| CI-8 | Lighthouse CI | 4 | PERF-1 | Performance CI |
| CI-9 | Analytics setup | 2 | Privacy | Analytics config |

**Sprint 11 Total**: 10 hours

### Sprint 12: Production (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| CI-10 | Production deployment | 6 | All QA | Production URL |
| CI-11 | CDN configuration | 6 | CI-10 | CDN setup |
| CI-12 | Security headers | 4 | SEC-1 | Security config |

**Sprint 12 Total**: 16 hours

**Documentation**: [DEVOPS_PIPELINE.md](./DEVOPS_PIPELINE.md)

---

## Agent 7: API Documentation

**Total Story Points**: 26
**Total Hours**: 52-78 hours
**Primary Sprints**: 1-10 (continuous)

### Sprint 1-10: API Documentation (continuous)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| DOC-1 | External API docs | 8 | BE-1, BE-12, BE-26 | API specs |
| DOC-2 | Service API docs | 12 | BE services | Service docs |
| DOC-3 | TypeScript interfaces | 6 | All types | Type docs |
| DOC-4 | Integration examples | 10 | Features | Code examples |
| DOC-5 | Error handling docs | 4 | BE errors | Error guide |
| DOC-6 | Developer onboarding | 8 | All docs | README.md |

**Total**: 48 hours (spread across sprints)

**Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## Agent 8: Mobile Developer

**Total Story Points**: 31
**Total Hours**: 62-93 hours
**Primary Sprints**: 2-3, 6, 8, 11-12

### Sprint 2: PWA Setup (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| MOB-1 | PWA manifest | 4 | ARCH-1 | manifest.json |
| MOB-2 | Service worker (Workbox) | 6 | ARCH-1 | sw.ts |

**Sprint 2 Total**: 10 hours

### Sprint 3: Mobile Optimization (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| MOB-3 | Responsive breakpoints | 4 | FE-3 | CSS breakpoints |
| MOB-4 | Touch gestures | 6 | FE-9 | useGestures.ts |

**Sprint 3 Total**: 10 hours

### Sprint 6: Offline Audio (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| MOB-5 | Download manager | 8 | BE-19 | DownloadManager.ts |
| MOB-6 | Storage management | 4 | MOB-5 | StorageUtils.ts |

**Sprint 6 Total**: 12 hours

### Sprint 8: Push Notifications (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| MOB-7 | Push notification service | 8 | MOB-2 | pushService.ts |
| MOB-8 | Notification UI | 4 | MOB-7 | NotifBanner.tsx |

**Sprint 8 Total**: 12 hours

### Sprint 11: Platform Optimization (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| MOB-9 | iOS Safari fixes | 4 | All features | iOS patches |
| MOB-10 | Android Chrome optimization | 4 | All features | Android patches |
| MOB-11 | App icons & splash | 4 | None | Asset files |

**Sprint 11 Total**: 12 hours

**Documentation**: [PWA_MOBILE_SPEC.md](./PWA_MOBILE_SPEC.md)

---

## Agent 9: Performance Analyzer

**Total Story Points**: 26
**Total Hours**: 52-78 hours
**Primary Sprints**: 5, 11-12

### Sprint 5: Audio Performance (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| PERF-1 | Audio streaming optimization | 6 | BE-13 | Stream config |
| PERF-2 | Buffer management | 4 | PERF-1 | Buffer strategy |

**Sprint 5 Total**: 10 hours

### Sprint 11: Code Splitting (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| PERF-3 | Route-based splitting | 8 | All routes | Lazy routes |
| PERF-4 | Component lazy loading | 6 | Heavy components | Dynamic imports |
| PERF-5 | Vendor chunk optimization | 6 | Build config | vite.config.ts |
| PERF-6 | Bundle analysis | 4 | PERF-5 | Bundle report |

**Sprint 11 Total**: 24 hours

### Sprint 11: Core Web Vitals (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| PERF-7 | LCP optimization | 4 | Images | LCP <2.5s |
| PERF-8 | FID optimization | 2 | JS | FID <100ms |
| PERF-9 | CLS fixes | 4 | Layout | CLS <0.1 |

**Sprint 11 Total**: 10 hours

**Documentation**: [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)

---

## Agent 10: Security Reviewer

**Total Story Points**: 26
**Total Hours**: 52-78 hours
**Primary Sprints**: 1, 3, 10, 12

### Sprint 1: Security Foundation (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| SEC-1 | CSP configuration | 4 | CI-4 | CSP headers |
| SEC-2 | HTTPS enforcement | 2 | CI-4 | Redirect rules |
| SEC-3 | SRI setup | 4 | CI-1 | SRI hashes |

**Sprint 1 Total**: 10 hours

### Sprint 3: Content Integrity (8 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| SEC-4 | SHA-256 verification | 6 | BE-2 | Checksum system |
| SEC-5 | Source authentication | 4 | BE-1 | Auth layer |
| SEC-6 | Scholar review process | 6 | ARCH-8 | Review checklist |

**Sprint 3 Total**: 16 hours

### Sprint 10: Privacy (5 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| SEC-7 | GDPR compliance | 6 | All features | Privacy policy |
| SEC-8 | Cookie management | 4 | Settings | Cookie consent |

**Sprint 10 Total**: 10 hours

### Sprint 12: Security Audit (13 pts)

| Task ID | Task | Hours | Dependencies | Deliverable |
|---------|------|-------|--------------|-------------|
| SEC-9 | OWASP audit | 8 | All features | Security report |
| SEC-10 | Penetration testing | 10 | SEC-9 | Pentest report |
| SEC-11 | Vulnerability fixes | 8 | SEC-10 | Security patches |

**Sprint 12 Total**: 26 hours

**Documentation**: [SECURITY_QUALITY.md](./SECURITY_QUALITY.md)

---

## Summary Tables

### Total Hours by Agent

| Agent | Story Points | Min Hours | Max Hours | Avg Hours |
|-------|--------------|-----------|-----------|-----------|
| System Architect | 52 | 104 | 156 | 130 |
| Planner | 31 | 62 | 93 | 78 |
| Frontend Coder | 104 | 208 | 312 | 260 |
| Backend Developer | 78 | 156 | 234 | 195 |
| QA Tester | 62 | 124 | 186 | 155 |
| CI/CD Engineer | 18 | 36 | 54 | 45 |
| API Documentation | 26 | 52 | 78 | 65 |
| Mobile Developer | 31 | 62 | 93 | 78 |
| Performance Analyzer | 26 | 52 | 78 | 65 |
| Security Reviewer | 26 | 52 | 78 | 65 |
| **TOTAL** | **310** | **620** | **930** | **775** |

### Critical Path Dependencies

1. **ARCH-1** (Project setup) → All agents
2. **BE-1** (Tanzil API) → **BE-2** → Frontend Quran display
3. **BE-12** (Audio API) → **BE-13** → Audio features
4. **FE-9** (Mushaf view) → **ARCH-8** (Typography) → Reading experience
5. **BE-16** (Sync engine) → **FE-16** (Audio player) → Audio sync
6. **BE-20** (Memorization service) → **FE-24** (Mem UI) → Memorization
7. **All features** → **PERF-3** (Optimization) → **CI-10** (Launch)

---

**Document Maintained By**: Planner Agent
**Last Updated**: November 2025
**Next Review**: End of Sprint 1
