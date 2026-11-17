# T07 conversation implementation and verification

18 November 2026. Input `7003017`, clean independent `main`, frozen `t01-v1`. Git/native board confirmed T02/T03/T06 accepted; selected/linked T07 after radar. No T08 implementation was started. See [plan](t07-conversation-plan.md) and [interface/next handoff](../contracts-t07-v1.md).

## Delivered work

Primary Codex connected the page to the bilingual shell, composer, chronological response renderers and T06 API. Added memory-only reducer/client adapter, topic population, Unicode validation/counter, keyboard/IME handling, loading/cancel/manual retry, explicit clear confirmation, language-change cancellation, eight-exchange limit and stale result/error suppression. Accepted history is separate from pending drafts; retries never duplicate parent turns. Old responses preserve locale/direction and text is rendered only as React text. No persistence, accounts, raw HTML/Markdown parsing, provider SDK/key or new dependency was added to the client.

Updated both dictionaries from future/static-preview claims to connected privacy/assessment copy, with prominent server-derived fixture disclosure. Page rendering is dynamic to avoid freezing the mode label at build time; only a boolean crosses the client boundary. Updated the previous shell skip-link/disclosure assertions to the existing localized main target, preserving keyboard/axe/reflow checks. The T01 shared wire/props declarations and backend policy remain unchanged; the localized shell's optional fixture flag is component-local. Fixed stale announcement cleanup in the existing conversation presenter.

## Self-review, separate review and rework

One separate Codex reviewer inspected copied snapshots read-only in isolated `/private/tmp/parentpause-t07-review` while the primary implemented/self-reviewed. No model override/exposed exact underlying model identifier. This was technical review, not a native-reader or safeguarding approval.

- Initial implementation checked 453 tests, lint/typecheck. Additional real POST integration and regression coverage brought the final suite to 459 tests.
- Reviewer found stalled JSON response readers were not canceled when an outer fetch race aborted; added direct reader abort cleanup and a never-ending stream regression. Rejected non-JSON bodies are also explicitly canceled and tested. No raw output/errors reach the UI.
- Real browser probes reproduced mouse Send success losing focus (Chromium BODY, WebKit MAIN) when the clicked button disabled. Mouse Cancel shared the disappearing-control cause. Send/Cancel now focus the textarea before changing controls; completion respects intentional focus changes. Component regressions and separate Chromium/WebKit probes reproduced the fix.
- Editing a draft clears old announcement events; clearing an event also removes stale alert role/content. Crisis completion includes the emergency heading. The reducer and synchronous controller guard reject both old successes and old errors after a new request starts; explicit out-of-order regressions were added.
- The first actual fixture browser probe stopped at the focus failure. The next probe reached axe but used an implicit browser-owned page; axe required an explicit browser context. Corrected that probe harness, reran both browsers and passed. No product assertion was weakened.

Separate final technical verdict: **pass, no unresolved blockers**. Reviewer reproduced unit 283/283, component 42/42, API 132/132, lint/diff and real mouse-focus probes. Two final out-of-order component regressions were added afterward, with no implementation change; primary final component count is 44 and full suite 459.

## Exact checks

All npm commands selected `/opt/homebrew/opt/node@22/bin` in PATH: Node 22.23.2/npm 10.9.8/Next 16.4.6. Build/browser commands used NEXT_TELEMETRY_DISABLED=1. Local macOS runs, not hosted CI or uncached clone evidence. Browser configurations ran sequentially.

| Command/check | Actual result |
|---|---|
| `npm test` | Final exit 0, 459/459 across 12 files: unit 283, component 44, API 132 |
| `npm run test:api` | Exit 0, 132/132; two new EN/UR actual POST/service/server-fixture round-trips |
| `npm run typecheck` | Final exit 0, generated routes and TypeScript |
| `npm run lint` | Final exit 0, no warnings |
| `npm run build` | Exit 0; dynamic `/` and `/api/coach`, static `/_not-found` |
| `npm run test:e2e` | Exit 0, 10/10 production Chromium/WebKit page smoke/keyboard/axe/reflow |
| `npm run test:presentational` | Exit 0, 10/10 bilingual Chromium/WebKit renderer-host checks |
| `git diff --check` | Exit 0 |
| `.next/static` scan for api.openai.com, provider-operation/prompt revision and key variable markers | No matches; no server SDK/prompt/key code in built client assets |

Actual fixture browser smoke used `node /private/tmp/parentpause-t07-browser-probe.cjs`: it started/stopped a local Next development server at 127.0.0.1:3213 with COACH_PROVIDER=fixtures, matching APP_ORIGIN, NODE_ENV=development, blank key/model and telemetry disabled. Chromium and WebKit both sent English and Urdu follow-up inputs through the real network endpoint, received labeled fixture replies, cleared the conversation, received authored Roman Urdu emergency routing, reloaded to empty English state, and observed empty localStorage/sessionStorage. Mouse focus, axe and reflow at 320/390/768/1440 plus 200%/400% text scaling passed. The resulting 390px Urdu mixed-history screenshot was visually inspected locally; it is not native-language approval. Probe and screenshot are temporary local evidence, not tracked product/release artifacts. No paid provider call occurred.

No dependency versions/lockfile changed. Prior T05 zero-runtime/16-development audit results remain dated evidence; no fresh audit is claimed. Known gateway/distributed limiter/budget limitations remain. Native Urdu, human safeguarding, real screen-reader/physical mobile-keyboard checks and full-pipeline live evaluation/final model selection remain pending. Actual commit acceptance/SHA belongs to Git/native tracker after the required widget. After acceptance **T08 maintained browser journeys** is next; T07 smoke does not claim that full matrix is complete.
