# T02 — Build responsive shell and locale system

Status: To Do — not started; execution is blocked until the dependencies below are accepted and committed.

- Dependencies: T01
- Suggested executor: Small coding model
- Rough effort: 60–90 minutes; planning estimate, not a deadline.
- Writable ownership: `src/components/localized-shell.tsx, src/components/language-switch.tsx, src/components/safety-notice.tsx, src/styles/tokens.css, src/lib/i18n/en.ts, src/lib/i18n/ur.ts, src/lib/client/direction.ts, public/fonts/, src/test/components/locale-shell.test.tsx`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Translate static UI using typed keys and implement the visual tokens and layout rules in the design document. Supply a self-hosted licensed Arabic font. Implement root lang/dir updates and bidi isolation. Add a pure presentational shell for integration; do not take ownership of page wiring or conversation state. Keep authored safety-message templates in the safety task, not in these UI dictionaries.

## Acceptance and tests

Key parity across locales; EN/UR switch updates document direction; mixed text preserves order. Native font loads locally, license is included. Controls have accessible names, visible focus and 44px targets. At 320px the shell has no horizontal overflow. No left/right CSS that breaks intended RTL behavior.

## Handoff

Supply the shell component interface and locale-change callback to T06/T07; flag draft Urdu copy.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
