# Repository Guidelines

## Project Structure & Module Organization
- `src/` houses React + TypeScript modules; keep new features beside the closest folder (`components/`, `pages/`, `services/`, `stores/`, `utils/`, `security/`).
- Styling flows through Tailwind tokens in `tailwind.config.js` and utilities in `src/styles/`; extend the config instead of scattering inline CSS.
- Tests live in `src/tests/` (unit, integration, enhanced) and `tests/e2e/` (Playwright); docs belong in `docs/`, automation in `scripts/`, assets in `public/`.

## Build, Test, and Development Commands
- `npm run dev` starts Vite with hot reload; `npm run preview` serves the latest production build.
- `npm run build` runs `tsc` then Vite to emit optimized assets.
- `npm run lint` applies the ESLint + TypeScript ruleset—fix findings before committing.
- `npm test` runs the core Vitest suite; `npm run test:all` adds enhanced and security checks; `npm run test:e2e` runs Playwright (install browsers once with `npx playwright install --with-deps`).

## Coding Style & Naming Conventions
- Use strict TypeScript, 2-space indentation, single quotes, and prefer explicit return types for exported APIs.
- Components, pages, and stores are PascalCase; hooks start with `use`; shared utilities are camelCase; test helpers use the `*.helper.ts` suffix.
- Keep JSX focused, group Tailwind classes layout→spacing→color, and rely on configured design tokens over ad-hoc values.

## Testing Guidelines
- Place new unit or integration specs under the matching folder in `src/tests/` with a `*.test.ts(x)` suffix; lean on existing MSW and setup utilities.
- Enhanced suites in `src/tests/enhanced/` cover performance, resilience, and security—coordinate timing-sensitive changes with QA reviewers.
- Target ≥80% coverage (current baseline ~65%); generate reports with `npm run test:enhanced:coverage` before major PRs.
- Playwright selectors belong in `tests/e2e/pages/`, reusable flows in `tests/e2e/helpers/`, and keep scenarios focused on end-user journeys.

## Commit & Pull Request Guidelines
- Write imperative commit subjects ≤72 characters (`feat: add offline cache`) and group related changes logically.
- Reference issues (`Fixes #123`) and describe impact or follow-up work in the message body.
- PRs should outline scope, list local checks (`npm run lint`, `npm run test:all`, relevant screenshots), flag risks, and open only after CI succeeds and conflicts are resolved.

## Environment & Security Notes
- Copy `.env.example`, fill API keys and the Sentry DSN locally, and never commit secrets.
- Adjust Sentry or monitoring behavior through `src/sentry.config.ts` or deployment configs—not by hardcoding values in components.
- Preserve sanitization and CSP utilities in `src/security/` and `services/api/`; consult maintainers before altering these policies.

## Agent Roster
- **Planner Specialist** – Owns roadmap alignment, backlog prioritization, and stakeholder updates.
- **System Architect Specialist** – Maintains technical vision, reviews architecture decisions, and supports data modeling.
- **Frontend/UX Specialist Agent** – Delivers React/Tailwind features, ensures accessibility, and partners with design.
- **Mobile UX Specialist** – Optimizes responsive layouts, touch interactions, and cross-device polish.
- **Backend Services Developer** – Builds and maintains authentication, sync, and bookmark APIs plus data persistence.
- **Code Refactoring Specialist** – Splits monolith stores, enforces modular patterns, and improves code maintainability.
- **Performance Analyzer** – Profiles audio/text flows, enforces bundle budgets, and oversees Lighthouse audits.
- **Testing Infrastructure Engineer** – Expands Vitest/Playwright coverage and resilience suites.
- **CI/CD Engineer** – Keeps build pipelines green, manages PWA/TWA packaging, and enforces quality gates.
- **DevOps Engineer Agent** – Handles environment parity, observability stacks, and storage infrastructure.
- **Security Manager** – Oversees CSP, data privacy, and trust & safety workflows.
- **Code Quality Auditor** – Safeguards linting standards, documentation, and adherence to DoD.
- **QA Engineering Agent** – Drives exploratory testing, regression sign-off, and device matrix coverage.

## Ticket Assignments
| Ticket | Scope | Primary Agents |
| --- | --- | --- |
| ALIGN-001 | Backlog realignment, DoD confirmation, environment readiness | Planner Specialist; System Architect Specialist; Code Quality Auditor |
| AUTH-001 | Email verification flow, social login UI polish, E2E coverage | Backend Services Developer; Mobile UX Specialist |
| AUDIO-001 | Split audio store, add reciters, harden offline error handling | Code Refactoring Specialist; Performance Analyzer |
| PROG-001 | Progress charts, export tooling, cloud sync stub, analytics events | Frontend/UX Specialist Agent; Backend Services Developer |
| IOS-001 | iOS/iPad responsive fixes, safe-area layout, accessibility smoke tests | Mobile UX Specialist; QA Engineering Agent |
| CI-001 | CI stabilization, lint/test gating, coverage uplift to 70% | Testing Infrastructure Engineer; CI/CD Engineer |
| AUDIO-002 | Advanced audio controls, keyboard shortcuts, background playback | Frontend/UX Specialist Agent; Performance Analyzer |
| OFFLINE-001 | Download manager, storage UX, resumable queues, security review | Backend Services Developer; DevOps Engineer Agent; Security Manager |
| BOOKMARK-001 | Bookmark & favorites system with sync-ready APIs | Frontend/UX Specialist Agent; Backend Services Developer |
| ANALYTICS-001 | Progress analytics dashboards, instrumentation, data modeling | Frontend/UX Specialist Agent; System Architect Specialist |
| PWA-001 | PWA install prompts, Android TWA build, release packaging | CI/CD Engineer; DevOps Engineer Agent |
| VOICE-001 | Voice testing beta, recording storage, privacy controls | Mobile UX Specialist; Backend Services Developer; Security Manager |
| SRS-001 | Spaced repetition engine, notification cadence, goal tuning | Backend Services Developer; Planner Specialist |
| SOCIAL-001 | Baseline social features, moderation tooling, leaderboards | Backend Services Developer; Mobile UX Specialist; Security Manager |
| KIDS-001 | Kids mode UI, personalization hooks, reward visuals | Mobile UX Specialist; Frontend/UX Specialist Agent |
| OBS-001 | Monitoring dashboards, telemetry events, in-app feedback loop | DevOps Engineer Agent; Performance Analyzer; QA Engineering Agent |
| LAUNCH-001 | Beta program ops, survey synthesis, launch readiness tracking | Planner Specialist; QA Engineering Agent |
| GTM-001 | Marketing assets, partner rollout, press kit coordination | Launch Marketing Agent *(new)*; Planner Specialist |
| SUPPORT-001 | Support knowledge base, incident runbooks, moderation SOPs | Support Operations Agent *(new)*; Security Manager |

## New Agent Requests
- **Launch Marketing Agent** – Lead GTM asset production, partner coordination, and store listing optimization ahead of Phase 4. Prompt: `codex/agent_launch_marketing.md`.
- **Support Operations Agent** – Stand up knowledge base, triage workflow, and incident escalation processes for launch. Prompt: `codex/agent_support_operations.md`.
