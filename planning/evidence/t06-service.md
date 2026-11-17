# T06 service/API verification

18 November 2026. Input `0b58067`; frozen `t01-v1`, T04 policy and T05 adapter. Independent Git root `/Users/navneet/Desktop/vibbber`, clean `main` at startup; native board/Git confirmed T00–T05 accepted. T06 was the only ready packet; T07 was not started.

## Implementation and review

Primary Codex implemented server-only policy orchestration, the bounded Node endpoint, transport/limiter helpers, local/test fixtures and production startup protection. The integrator added a separate handler module to preserve supported Next route exports and a startup wrapper/registration hook to enforce fixture rejection. Shared wire schemas/provider SDK code and dependency versions remain unchanged. Safety revision `t06-safety-v2` includes a narrow explicit-abuse declaration repair. The page remains the English preview; the API exists separately. See [plan](t06-service-plan.md) and [service/T07 handoff](../contracts-t06-v1.md).

The service validates/clones input, applies T04 safety before lazy configuration/provider creation, classifies full context, optionally generates/reviews and validates final locale/family/correlation. Known-risk failures return authored escalation; unknown classifier/review cannot produce routine coaching. Transport enforces configured same-origin/content type, streamed 65,536-byte bounds/fatal UTF-8 and a total 20-second deadline including body time. Abort races ignored-signal operations and late candidates are discarded. All application/method responses are no-store/fixed envelopes. Limits roll at 10/minute and 100/hour with at most 1,024 active key buckets and fail-closed saturation. Defaults share one local bucket; optional header identity requires an overwriting trusted gateway. No public gateway/distributed limiter, enforceable spend cutoff, database or durable identity was implemented.

A separate Codex reviewer inspected read-only copied snapshots in isolated `/private/tmp/parentpause-t06-review` while the primary implemented/self-reviewed. No model override/exposed exact underlying model identifier. This is separate-agent technical review, not human safeguarding/native-language approval.

## Gaps fixed and revalidated

- Initial T06 suite: 68 tests, four failures. Seed AB01 (`My partner hits our child and says not to tell anyone.`) did not retain the intended abuse floor: T04 matched only `my child` without the secrecy suffix. Added narrowly anchored `my|our child|baby` with that literal optional suffix; retained failing cases and added quote/fiction/negation regressions. No safety expectation was weakened; all existing unit checks pass.
- Independent review highlighted thrown-service known-risk failure and unsupported methods outside the no-store boundary. Post-validation exceptions/invalid envelopes now use the same server-derived fallback; explicit 405 exports return fixed envelopes/no-store. Regressions verify both.
- Tests additionally reject malformed/wrong-family/locale candidates before review, send the exact unsafe candidate to review and discard it after block, preserve prior-risk reassessment floors, upgrade lower risk on semantic emergency and retain non-imminent support on outage.
- Actual production probe found the Next registration hook was lazy: a direct-CLI fixture startup did not exit within 15 seconds. The probe terminated its child. Added a supported startup wrapper rejecting fixtures before CLI import/listen; registration and per-session guards remain additional protection.
- Follow-up reviewer reproduced a wrapper bypass when Next loaded fixture mode later from an environment file. The wrapper now loads production files using pinned Next's own environment loader first. Subprocess regressions cover shell settings and `.env.local`, `.env.production`, `.env.production.local`. No new dependency was needed.
- Typecheck caught optional-header union and subprocess environment inference; corrected the types and revalidated. No engine/schema rule was bypassed.

Final separate-review verdict: **technical pass, no unresolved blockers**. Reviewer reproduced API 124/124 then 130/130, lint/diff checks, environment-file before-listen rejection and mocked actual-SDK probes: single-call failures, known-risk fallback, sanitized errors, cancellation despite ignored signals and split UTF-8 input.

## Actual verification

Commands selected `/opt/homebrew/opt/node@22/bin` in PATH: Node 22.23.2/npm 10.9.8/Next 16.4.6. Build/browser/probes used `NEXT_TELEMETRY_DISABLED=1`. Local macOS, not hosted CI or uncached-clone evidence. Browser commands ran sequentially.

| Command/check | Actual result |
|---|---|
| `npm run test:api` | Final exit 0, 130/130 in 3 files: 79 T06 + 51 T05 |
| `npm run test:unit` | Exit 0, 261/261 in 2 files |
| `npm test` | Final exit 0, 422/422 in 8 files, including existing components |
| `npm run typecheck` | Final exit 0, generated route types + TypeScript |
| `npm run lint` | Final exit 0, no warnings |
| `npm run build` | Exit 0; static `/`, `/_not-found`; dynamic `/api/coach` |
| `npm run test:e2e` | Exit 0, 10/10 Chromium/WebKit shell; rerun through startup wrapper |
| `npm run test:presentational` | Exit 0, 10/10 Chromium/WebKit bilingual fixture host |
| `npm run eval:live -- --models candidate-a,candidate-b` | Exit 0, dry-run only; 41 cases/166 planned attempts/546-call ceiling, current safety revision; no network/key |
| `git diff --check` | Exit 0 |
| `.next/static` scan for API endpoint, provider operation, coach revision/key variable | No matches, guarded server code absent from client assets |

Actual local production probe used `node scripts/start-server.mjs --port 3212`, matching APP_ORIGIN, blank key/model and telemetry disabled. Fixture mode exited 1. With openai mode/blank credentials, synthetic requests returned: explicit emergency POST 200/authored; ordinary POST 503/CONFIGURATION_ERROR; cross-origin POST 400/INVALID_INPUT; GET/OPTIONS 405/INVALID_INPUT. All had no-store. Probe children were stopped. Blank credentials prevented provider work. Environment-file rejection is separately reproduced by subprocess tests and independent review. The earlier failed direct-CLI probe is rework evidence, not a passing startup check.

No dependency versions/lockfile changed. T05's previous zero-runtime/16-development audit remains dated evidence; no fresh T06 audit is claimed. Technical work is ready for owner commit review; actual acceptance/SHA belongs to Git/native tracker after the required commit widget. T07 is next after acceptance, then T08 journeys and T09 live evaluation/model selection/native/safeguarding gates. No paid call, live quality/cost measurement, native Urdu approval, human safety signoff, public-hosting readiness, deployment or publication is claimed.
