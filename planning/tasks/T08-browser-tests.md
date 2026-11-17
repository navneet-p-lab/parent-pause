# T08 — Add cross-browser journeys and accessibility checks

Status: In Review — implementation, self-review, separate technical review and automated validation pass; actual acceptance/commit belongs to Git and the native tracker. Input T07 accepted at `197a28a`. See [implementation plan](../evidence/t08-browser-plan.md) and [browser validation](../evidence/browser-validation.md). Physical-device, browser-zoom, real assistive-technology and native-reader checks remain explicitly pending.

- Dependencies: T07
- Suggested executor: Small coding model; human manual checks
- Rough effort: 90–150 minutes; planning estimate, not a deadline.
- Writable ownership: `src/test/e2e/, Playwright-specific fixtures, planning/evidence/browser-validation.md`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Exercise the actual app+route in fixture mode. Cover everyday, follow-up, Urdu, Roman Urdu risk, crisis, professional boundary, invalid/unsafe provider output, timeout, retry, clear/reload and stale responses. Use Chromium and WebKit, 320/390/768/1440 viewports, EN/UR. Add axe checks and document manual keyboard/screen-reader/zoom/mobile-keyboard checks.

## Acceptance and tests

No horizontal overflow; no clipped Urdu glyphs; stable screenshots with fonts ready. Correct lang/dir and logical alignment. Zero critical/serious axe violations; manually review remaining findings. Assert actual route path and safe fallback, not only stubbed fetch responses. Tests run in isolated server context without paid network calls.

## Handoff

Fix only tests/evidence in this packet. Send implementation failures back to file owner with reproduction; integrator owns repairs.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
