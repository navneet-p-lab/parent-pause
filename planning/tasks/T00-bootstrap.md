# T00 — Bootstrap isolated app and test runners

Status snapshot, 18 November: reopened In Progress for reassessment, then acceptance reverified for In Review and the owner-approved baseline commit. See [current evidence](../evidence/session-reassessment.md); Git/native board records actual completion. Review is primary-agent self-review, not an independent safety review.

Follow-up: the owner requested adversarial testing, fixes and a commit. See [review findings and verification](../evidence/t00-review.md); the native task/Git history carries the latest commit status.

- Dependencies: None
- Suggested executor: Small coding model
- Rough effort: 60–90 minutes; planning estimate, not a deadline.
- Writable ownership: `package.json, package-lock.json, tsconfig.json, next.config.*, eslint.config.*, vitest.config.*, playwright.config.*, .gitignore, .env.example, src/app/layout.tsx, src/app/page.tsx, src/test/setup.ts, .github/workflows/ci.yml`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. T00 precedes contract freeze; preserve the proposed boundaries and report a needed change instead of silently implementing downstream interfaces.

Create an independent Next.js TypeScript app in this project scope. Pin mutually compatible packages and a documented Node 22.12+ runtime. Add CSS Modules support, Vitest, React Testing Library, Playwright and axe. Set CI commands for lint, typecheck, unit, API, components, browser and build. Add one real shell smoke test and create the category suites as their tasks land. Stub provider configuration without any secret or network call. Do not initialize or publish the parent SongRise repository.

## Acceptance and tests

A fresh local install starts the shell and builds; one keyboard-accessible heading renders in a browser. Missing runtime prerequisites are reported precisely. Test scripts cannot silently pass with missing tests once the relevant suites are required. No dependency resolution uses files above this folder.

## Handoff

Freeze package/config ownership after bootstrap. Subsequent package changes go through the integrator.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
