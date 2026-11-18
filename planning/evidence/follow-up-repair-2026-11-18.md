# Follow-up failure investigation and repair

18 November 2026. Owner reported a successful bedtime plan followed by an unavailable error when asking about bedtime timing. Independent root/main verified at `fc15ac5`; existing session documentation edits preserved. Primary Codex, self-review, no subagents. This repair extends the current troubleshooting scope to the coaching prompt, development diagnostics and regressions; it does not complete T09.

## Reproduction and finding

The owner's failing request returned HTTP503 in11.3seconds in the development access log. That rules out a stopped server and the20second request deadline for that observation, but the earlier request had no stage diagnostics.

Added development-only bounded diagnostics and reproduced the same symptom in an actual Chromium two-turn journey using synthetic inputs: “Bedtime feels difficult” followed by a question about an appropriate bedtime. First turn HTTP200/plan in6211ms; follow-up HTTP503/UNAVAILABLE in7655ms. Development metadata identified the review stage, with no provider exception. Synthetic-only request/response artifact: `evaluation-results/live-ui-1794958499806.jsonl` (ignored).

A capped replay of that synthetic follow-up produced a schema-valid plan whose check-in asked both age and wake-up time. The review result was `block`, so policy correctly returned UNAVAILABLE. Asking for two separate details violates the existing one-meaningful-question requirement even when joined into one sentence with one question mark. This is the identified candidate defect; the review API provides no detailed reason, so attributing its exact decision exclusively to that defect remains an inference. An earlier two-turn diagnostic allowed a similar compound question, demonstrating variable semantic review rather than a universal transport failure.

## Change

Updated `COACH_PROMPT_REVISION` to `t05-coach-v2`. Generation now explicitly asks for one piece of information per check-in in either language and on follow-ups. The bedtime example asks only age when unknown and leaves wake-up time for a later turn. Classifier/reviewer instructions, policy, templates, model selection, public error envelope, three-call limit and deadlines remain unchanged. There is no regeneration/retry loop or release of a blocked candidate. Historical evaluation results retain their earlier prompt revision and are not silently promoted to validation of this revision.

Development diagnostics report only fixed stage/reason values, HTTP status and explicitly allowlisted upstream codes. They emit no parent text, generated text, key, raw error, header, correlation ID or durable chat record. Production emits none of these diagnostics. Regressions exercise the actual client/handler/service/provider pipeline with synthetic SDK-shaped transport responses: a blocked compound check-in retains accepted history/draft, a manually initiated single-detail retry succeeds with the same context, and rejected content never enters history. EN/UR and diagnostic redaction/production-silence paths are covered.

## Fresh verification

macOS, Node22.23.2/npm10.9.8 from `/opt/homebrew/opt/node@22/bin`:

- `npx vitest run src/test/api/provider.test.ts src/test/api/follow-up-coaching.test.ts`:45/45, exit0.
- `npm run typecheck`, `npm run lint`, `npm test`: exit0;507/507 tests across15files. Initial typecheck caught an overly narrow inferred state type in the new regression; explicit `ConversationState` fixed it before the final rerun.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: exit0, production compile/typecheck/page generation complete.
- Guarded live English integrated service: initial/follow-up both classify routine, generate valid plan, review allow; follow-up asks only age. Artifact `evaluation-results/follow-up-debug-1794958637961.jsonl`.
- Guarded live Urdu integrated service: initial/follow-up both pass all stages; check-ins request age alone in Urdu script. Artifact `evaluation-results/follow-up-debug-1794958669851.jsonl`.
- Actual final Chromium UI via `.nimbalyst/runtime/live-ui.mjs`: first turn HTTP200/plan6269ms; follow-up HTTP200/plan6011ms. Artifact `evaluation-results/live-ui-1794958702638.jsonl`. This uses real network/provider output, not browser response mocking.
- Final diff/credential checks recorded in the work log. No UI/style change, broad browser matrix rerun, new native/human approval, commit or deployment.

## Paid diagnostics and limits

Four capped follow-up diagnostic artifacts persisted reservations ofUS$0.008472 (pre-repair two-turn pass),US$0.004294 (blocked replay),US$0.008532 (repaired English) andUS$0.008546 (repaired Urdu): **US$0.029844** additional reservations. Known standard-token estimates for those artifacts totalUS$0.0026261, not an invoice. Each invocation used aUS$0.10 cap and at most6stages, stopping after a failed turn. The earlier screen-time diagnostic reservedUS$0.004192 separately.

This follow-up investigation also made5actual app requests without token instrumentation: one initial-only harness attempt,2requests reproducing the failure,2requests confirming repair. The first harness used an incorrect follow-up button name and did not test turn2; it was corrected before reproduction. The prior turn's2endpoint/UI smokes and owner manual testing also lack measured usage. Account-wide remaining authorization therefore is not reconciled; the oldUS$1.384545 remainder cannot be reused unchanged. Do not launch another evaluation against it without accounting for these calls/manual usage.

These samples establish the reproduced compound-question repair and working follow-up paths, not general model reliability. Future provider outages, timeouts, invalid candidates or legitimate review blocks still fail closed. T09's earlier ambiguous-distress/content findings, model selection and native Urdu/safeguarding/manual gates remain pending. The detached loopback development server stays available for owner retest.
