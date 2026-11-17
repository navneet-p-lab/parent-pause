# T09 technical release review

Latest live result, 18 November: the [166-attempt model comparison](t09-model-comparison-2026-11-18.md) is complete under the original US$3 envelope, with known response/content failures. New spending guard/resume/pacing and failure regression are self-reviewed; no independent reviewer was used in this resumed session. Final 500/500 deterministic tests, typecheck/lint/diff pass. Release is blocked by ambiguous-distress response availability and Luna's inspected homework false positive, plus existing human/native/manual/public-hosting gates. Total reservations US$1.615455; remaining authorizedUS$1.384545. Preparation's independent technical verdict below does not approve these later changes, the model results or human safety.

18 November 2026. Input `17befd3`, independent clean main before preparation. T08 acceptance confirmed in Git/native tracker; T09 selected after radar. **Release approval is pending. T10 remains gated.** See [plan](t09-release-plan.md), [model-evaluation readiness](model-evaluation.md) and [T08 browser evidence](browser-validation.md).

## Technical scope and independent review

Primary Codex prepared the missing integrated evaluation CLI, report logic/tests and evidence. One separate Codex agent audited baseline product source and then reviewed copied evaluator snapshots in isolated `/private/tmp/parentpause-t09-release-audit`. No model override or exact exposed variant. This is independent technical review, not native-language, clinical or safeguarding review.

Baseline audit reproduced 459/459 tests, lint and diff checks. Source inspection found no new product-code blocker: keys/SDK stay server-side, input/candidate content is not logged, client storage/raw HTML/provider imports are absent, and the production startup wrapper rejects fixtures from environment configuration. Origin/body/deadline/rate bounds and authored known-risk fallbacks remain in place. The integration uses the actual service; no safety policy, UI, API contract or dependency version changed.

Review corrected the current test strategy's false native-authored held-out claim and its E2E-before-build command order. Existing historical evidence remains dated. T09's ownership was explicitly extended by the lead to evaluation scripts/tests/npm wiring as required by the T05/T06 pipeline handoff.

## Findings and repairs

- Real Node CLI execution caught a CommonJS import incompatibility in `@next/env` that Vitest/typecheck did not catch. Switched to its default module export; added an actual Node subprocess dry-run regression.
- Self-review drained provider abort bookkeeping before serialization so the accepted authored timeout fallback cannot lose failed-stage metadata. Fake-time/ignored-abort regression passes without waiting 20 real seconds.
- Independent review reproduced cost overflow: finite extreme rate values produced Infinity, serialized null while claiming complete inputs. Divide before multiplying, validate safe totals/finite arithmetic, return null/incomplete on overflow, and label costs as estimates. Added targeted regressions for extreme rates, overflow and unsafe aggregate totals.
- No route/category mismatch can silently count as success. Provider failures remain visible even where authored fallback matches the expected route. Unreviewed cases remain in the human usefulness denominator; no automatic release approval exists.

Separate final evaluator review: **technical pass, no unresolved blockers**, after 31/31 focused tests, actual Node CLI dry-run, isolated lint/generated-route typecheck/diff checks. Reviewer did not run build/browser/live calls. These are distinct from the primary checks below.

## Verification

Local macOS, Node 22.23.2/npm 10.9.8/Next 16.4.6. Commands select `/opt/homebrew/opt/node@22/bin` in PATH. No hosted CI, uncached clone or live provider evaluation is claimed.

- Focused evaluation suites: exit 0, 31/31, including service/adapter integration, accepted setup context, authored bypass/semantic risk, boundary, rejected/unsafe output, billed failed-stage usage, deadline cleanup, route verdicts, human denominators, price completeness and actual CLI loading.
- `npm run lint`, `npm run typecheck`, `git diff --check`: exit 0. Generated Next routes checked before TypeScript.
- Previous `.next` output was moved to an isolated temporary backup; `NEXT_TELEMETRY_DISABLED=1 npm run build` then passed from an empty output directory. Dependencies remained installed/cached; this is not a clean-clone install. Dynamic `/` and `/api/coach` built successfully.
- Fresh built-client marker scan found no `OPENAI_API_KEY`, `api.openai.com`, `parentpause_classify`, `parentpause_review`, provider revision or service revision strings in `.next/static`. This supports, but does not formally prove, the source import review.
- Read-only fresh `npm audit --omit=dev --json`: zero findings. Full `npm audit --json`: exit 1 with 16 high development-tool findings, rooted in the same picomatch advisory. No dependency changed. Audit's Vite downgrade suggestion is not an approved remediation; do not force it around engine/peer constraints.
- Final `npm test`: exit 0, **477/477** across 13 files. Production shell **10/10**, presentation **10/10** and actual fixture conversation journeys **78/78**; all configurations ran sequentially after build. Browser fixtures make no paid model calls. Relevant test output and audit JSON remain local temporary artifacts, not release/live evidence.

## Remaining release gates and review record

The following are pending, not implied by an accepted technical-preparation commit:

1. Explicit candidate identifiers/account configuration, approved paid-evaluation spend envelope, integrated live corpus/repetitions and final model/snapshot choice. Review actual outputs; no known urgent-risk false negative, unsafe instruction or fabricated resource may pass. Record all failed cases and content-review numerator/denominator.
2. Native Urdu reviewer identity/date/corpus revision, actual comments on naturalness/joining/punctuation/mixed scripts and authored safety wording, plus native-authored held-out cases. Current six held-out cases are AI-authored.
3. Qualified human safeguarding reviewer identity/date/revision, observed failures, requested changes and explicit decision. AI technical review does not substitute for it.
4. Real VoiceOver/NVDA speech/announcement checks, browser UI 200%/400% zoom, physical mobile browser/virtual-keyboard/Urdu composition checks. Automated axe, DOM announcements, text scaling and headless viewports remain separate evidence.
5. Existing public-hosting requirements: trusted gateway/distributed abuse limits and enforceable budget cutoff. Per-instance limiter resets/bypass limits remain documented. No publication/deployment/email/video action is authorized or performed here.

For each supplied human review, append reviewer/qualification, date, exact source/corpus/model artifact revision, cases/devices inspected, findings, fixes/rechecks and explicit approval or pending decision. Do not infer signoff from a name, silence, model self-grading or passing fixtures. Current reviewer signoffs, live model results, invoices and publication links: **none supplied**.
