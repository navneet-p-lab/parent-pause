# T08 maintained browser validation

18 November 2026. Input `197a28a`, clean independent `main`; Git and closed native T07 card confirm acceptance. T08 selected after radar and linked to this session. See [implementation plan](t08-browser-plan.md). Actual output commit/acceptance belongs to Git/native tracker after the required owner widget.

## Implementation and parallel ownership

Primary Codex integrated the localhost fixture host, configuration, safety/failure journeys, CI and documentation. Two delegated Codex agents implemented lifecycle and accessibility specs independently in `/private/tmp/parentpause-t08-lifecycle` and `/private/tmp/parentpause-t08-layout`, then supplied read-only technical reviews. No model override; an exact model variant is not exposed. They ran isolated lint/type checks; the primary ran integrated browser checks. This is technical review, not native-language or safeguarding approval.

`npm run test:journeys` starts a dedicated development fixture host on `127.0.0.1:3212`, with a blank key, exact origin and unique per-test limiter keys. Default requests delegate to the **original Next `/api/coach` route**, including bilingual fixture clarification and authored emergency/abuse/self-harm with unresolved-history checks. Controlled cases inject provider sessions at the exported `createCoachService` seam and use the **real handler, bounded transport, limiter, schemas, policy and output review** on the same route path. They do not mock the browser's final fetch response. Controlled requests bypass Next's route export in this test host; direct-route checks separately cover that wiring.

Test-only headers select scenarios exclusively inside the localhost host; product code has no selector/import. The Node loader bypasses the `server-only` poison package only in this test-host process so Node can import the real server functions while Next retains its normal React conditions. Product bundles and production fixture startup restrictions are unchanged. The host refuses startup unless development/fixtures/exact origin/blank key are supplied. No dependency version, shared contract, safety rule, provider, component or application route changed.

CI runs production shell, presentation and journey configurations sequentially. Production smoke explicitly selects its shell spec so development-only journeys cannot accidentally run against production. Failure artifacts include traces/screenshots; font-ready accessibility screenshots are explicitly written under ignored `test-results/journeys/` and attached to reports.

## Coverage and verification

Local macOS, Node 22.23.2/npm 10.9.8/Next 16.4.6, Chromium and WebKit. Commands select `/opt/homebrew/opt/node@22/bin` in PATH; browser/build commands disable Next telemetry. No paid calls, hosted CI or fresh-clone verification occurred.

- `npm run test:journeys`: exit0, **78/78**, 39 per engine, 1.4 minutes. Covers everyday two-step plans/one check-in, accepted follow-up context, bilingual/mixed scripts and direction, actual authored risks/history, professional boundary, malformed classification/candidate, blocked candidate, review outage, actual 20-second timeout/manual retry, fresh correlation IDs, duplicate prevention, cancel/clear/Keep/locale transitions, reload/no chat storage, eight-exchange limit, inline validation, Enter/modified Enter/synthetic IME and topic population.
- Connected plan layouts run at 320/390/768/1440px in both locales/engines, including mixed-locale history. Actual authored emergency layouts run at 320px in EN/UR. Font readiness, logical alignment, 44px product controls, box overflow checks and axe all pass. Axe rejects every severity, so no remaining automated findings require triage in these cases.
- `npm test`: exit0, **459/459** across 12 files, including 283 unit/44 component/132 API checks. Existing component regressions explicitly deliver ignored-abort and out-of-order client successes/errors.
- `npm run lint` and `npm run typecheck`: exit0 after integration; Next generated route types before TypeScript.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: exit 0, dynamic `/` and `/api/coach`.
- `npm run test:e2e`: exit 0, **10/10** production shell cases. `npm run test:presentational`: exit 0, **10/10** bilingual presentation cases; configurations ran sequentially.
- After writing screenshots explicitly, `npm run test:journeys -- accessibility.spec.ts`: exit 0, **18/18**. Visual inspection found Next’s floating development widget persisted despite a test-host configuration attempt; that attempt was reverted. Screenshot-only styling now excludes the framework portal; all product layout/axe/focus assertions run unchanged. A second complete journey run passed **78/78** in 1.4 minutes. The final screenshot-only verification is recorded below.
- The subsequent screenshot-only rerun returned **17/18**: the Chromium keyboard test lost memory-only history after a development reload. Its trace shows a fresh React/HMR connection after the original API's cold compilation. The host now warms the original page and POST route, consumes both bodies and only then returns 200 on a dedicated readiness URL; source/type generation completes before browser execution. Final `npm run test:journeys` exit 0, **78/78**, including saved screenshots, both keyboard cases and real deadlines. No assertion/retry was relaxed. Final `npm run lint`, `npm run typecheck` and `git diff --check` exit 0.

Final screenshot spot-checks inspected the authored Urdu emergency at 320px and mixed EN/UR history at 390px. No obvious box clipping/overflow was seen; screenshot-only styling removes the framework widget. This is visual technical inspection, not native-language signoff. Artifacts are local/ignored, reproducible with the maintained command and attached to CI reports when enabled.

Browser delayed-work cases establish cancellation through the real network and UI stability after the server work's completion interval. The host propagates socket close to the service, which rejects canceled stages; these browser cases do **not** independently deliver a stale accepted client result. That client guard is covered by the existing component regressions, not inferred from aborted HTTP.

## Review findings and repairs

- Initial full run was stopped after identifying selectors that included Next development UI: a 32px devtools control and its empty route-announcer alert. Scoped touch-target checks to app header/main and alert assertions to main; no product assertion was weakened.
- Separate review showed authored response equality alone could mistake a 20-second fallback for emergency classifier bypass. Added a 5-second upper bound against a hanging classifier, and tested the actual timeout separately with a 19–25-second elapsed bound and successful manual retry.
- Review added original-route authored EN/UR emergency layout/axe/screenshots, rather than relying only on synthetic renderer fixtures. Clear/Keep is checked before beginning the delayed request to reduce race-test timing sensitivity. Removed duplicate failure tests while retaining bilingual coverage.
- A timeout case was interrupted during the stopped initial run; its focused Chromium rerun passed (21.2 seconds), followed by the full 78-case pass. A production build started alongside the development host was interrupted to restore sequential verification; only the later completed build is acceptance evidence.
- Final delegated read-only review: **pass, no unresolved technical blockers**. Reviewer reproduced isolated TypeScript/lint and diff checks, inspected the no-product-import boundary and distinguished canceled-network coverage from ignored-abort client regressions. Primary self-review also checked the complete portable changes.
- A separate final read-only review approved the readiness/warm-up fix and screenshot-only portal exclusion without blockers. The readiness path is confined to the test host and its startup request uses its own limiter key.

## Manual and release handoff

Automated/headless keyboard checks cover skip navigation, language-switch focus ring/order, composer submit/newlines, synthetic composition events, focus after mouse Send/Cancel, intentional focus retention, clear confirmation and live-region DOM updates. They do not establish speech output in a real screen reader. CSS 200%/400% text enlargement and spacing overrides are **text-resize checks**, not browser UI zoom. Geometry plus screenshots cannot certify Urdu glyph quality or language naturalness.

Pending manual checks, to record with browser/device/reviewer/date and findings during T09:

1. VoiceOver/Safari and NVDA/Chromium: role/label order, exactly one loading/completion/error/crisis announcement, navigation through mixed-language history, no repeated old replies.
2. Browser UI 200%/400% zoom: EN/UR plan and authored crisis at narrow and wide windows; reading order, focus visibility, no horizontal clipping. Native Urdu reader: joining, punctuation, line breaks, mixed digits and respectful crisis wording.
3. Physical mobile Safari/Chrome with virtual keyboard: composer stays reachable, controls remain usable, no covered content, real Urdu/Roman Urdu input and composition. Synthetic IME events and viewport resizing are not substitutes.
4. Human safeguarding/native Urdu signoff and full-pipeline live evaluation/model selection with explicit configuration, candidates and approved spend envelope. Known gateway/distributed limiter and enforceable budget limits remain requirements before public hosting.

No native Urdu, real assistive technology, physical-device/keyboard, browser-zoom, human safety approval, live quality/model choice, deployment or publication is claimed. Existing audit results remain dated evidence; dependency versions did not change and no fresh audit is claimed. After actual T08 acceptance, T09 is the next packet, subject to these gates.
