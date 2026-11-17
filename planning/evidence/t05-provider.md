# T05 provider implementation and verification

18 November 2026. Input `a35f8c6`, contract `t01-v1`; independent repository root `/Users/navneet/Desktop/vibbber`, branch `main`, clean at startup. Git and native board confirmed T00–T04 accepted. T05 was the next ready packet; T06/T07 implementation remained dependency-gated.

## Delivered scope

Primary Codex implemented server configuration, the guarded official OpenAI Responses adapter, coaching prompt, strict wire schema export/application parsing and the opt-in evaluation harness. Runtime Node 22.23.2/npm 10.9.8, SDK 7.58.0, server-only 0.0.1, tsx 4.23.15; exact dependency resolution is in the lockfile. Configuration has no default runtime model, rejects production fixtures, and never exposes keys to the client. Only the provider module imports the SDK. The preview still collects no messages, has no endpoint and makes no model calls.

One session per request enforces ordered classify/generate/review, a shared 20-second deadline, at most three calls, no retry after errors, bounded output and cancellation/late-result suppression. Calls use separate untrusted data, strict object-rooted schemas, `store:false`, no tools/streaming and disabled SDK logging. Responses/refusals/incomplete/empty/malformed outputs, locale/family/application bounds and review category relationships have explicit safe handling. SDK errors and causes never escape. Successful/failed operation metadata records known tokens/duration and requested/returned model separately. The [T05 handoff](../contracts-t05-v1.md) specifies T06 usage and T09 evaluation limits.

The harness defaults to no-network dry-run, bounds candidates/repetitions/calls before live work, records per-stage observations/revisions/tokens/latency/expected routes and leaves human scores null. It has an injectable pipeline target with sequential actual accepted setup replies, schema/locale validation and safe failure handling. The current direct-provider diagnostic CLI cannot generate accepted pipeline history and explicitly stops follow-up setup instead of fabricating replies. No direct diagnostic is reported as full-pipeline safety or model quality. Six held-out paraphrases are AI-authored; native-language review remains pending. Seed cases gained explicit expected escalation categories without changing their inputs.

CI now requires the provider/API suite. Ignored evaluation results are separate from portable evidence; default result files use exclusive creation and owner-only permissions. Shared contracts and product-page UI remain unchanged.

## Review and rework

The primary self-reviewed implementation and tests. A separate Codex reviewer worked read-only against copied snapshots in isolated `/private/tmp/parentpause-t05-review`, with no model override. No exact underlying model identifier was exposed; no smaller-model claim is made. Review overlapped implementation, not dependency-gated T06/T07 work.

- Initial API suite passed 44/44. Generated-route typecheck then caught test tuple argument typing and Next's augmented environment typing; corrected the test input shape and accepted an explicit environment record in config, then reran typecheck.
- Review distinguished requested aliases from actual returned model identifiers; both are now recorded.
- Review reproduced loss of billed failed-stage usage. Adapter errors now preserve sanitized operation/model/duration metadata and known usage; the harness records it, including incomplete responses. Regression added.
- Review reproduced invalid final locale/schema, errored setup accompanied by a response, and missing final pipeline response being reported without error. Setup and final replies now validate schema/locale, errors cannot carry accepted replies, missing pipeline output fails safely, and target exceptions become a sanitized per-case error. Each gap has a regression.
- Actual pinned-SDK fake-fetch probes verified fixed endpoint despite environment override, disabled logging/retries and cancellation. SDK boundary tests now exercise successful request shape and a single sanitized HTTP 503 failure, without network.
- Initial registry reads failed under restricted networking; authorized registry reads/install/audits then succeeded. The first isolated worktree creation required the authorized Git metadata sandbox escalation.
- Initial build tried to write Next telemetry preferences outside the workspace; rerun with `NEXT_TELEMETRY_DISABLED=1` passed. Initial browser starts were denied local sockets by the sandbox, then authorized local-server runs proceeded.
- The primary ran both browser commands concurrently; their shared Playwright output directory collided, producing five presentation artifact ENOENT errors. The shell suite passed 10/10; the presentation suite rerun alone passed 10/10. Browser commands must remain sequential unless output directories are isolated. No product assertion was weakened.

## Exact verification

All npm commands selected `/opt/homebrew/opt/node@22/bin` first in `PATH`, inside this project. Build/browser commands used `NEXT_TELEMETRY_DISABLED=1`. macOS local runs; these are not hosted CI or an uncached clone check.

| Command/check | Actual result |
|---|---|
| `npm install --save-exact openai@7.58.0 server-only` and `npm install --save-dev --save-exact tsx` | Exit 0; pinned dependencies and lockfile |
| `npm run lint` | Final exit 0, no warnings |
| `npm run typecheck` | Final exit 0, generated route types + TypeScript |
| `npm run test:api` | 44 initial, then 47, 50; final API coverage included in full suite and reviewer rerun |
| `npm test` | Final exit 0, 343/343 tests in 7 files, including 51 provider/evaluation tests |
| `npm run build` | Exit 0; static `/` and `/_not-found`, no API route |
| `npm run test:e2e` | Exit 0, 10/10 Chromium/WebKit shell tests |
| `npm run test:presentational` | Sequential rerun exit 0, 10/10 Chromium/WebKit bilingual fixture-host tests |
| `npm run eval:live` | Exit 0, dry-run only: 41 cases, 83 planned attempts, 273 max calls, no key/network |
| `npm run eval:live -- --models candidate-a,candidate-b` | Exit 0, dry-run: 166 planned attempts, 546 max calls, all revisions |
| `npm run eval:live -- --live --models candidate-a --max-calls 1` | Expected exit 1 before provider/configuration work; insufficient cap, no live call |
| Built `.next/static` scan for API endpoint, coach revision, synthetic key and operation marker | No matches; guarded server modules remain outside this unconnected preview bundle |
| `git diff --check` | Exit 0 |
| `npm audit --omit=dev --json` | Exit 0; zero known runtime findings |
| `npm audit --json` | Exit 1; same 16 inherited high development findings rooted in picomatch; no forced dependency downgrade |

Before dependency changes, registry audit again reported the existing picomatch advisory with affected range <=4.0.7 and a suggested breaking tooling downgrade. It did not establish an acceptable patched dependency path. After the additions, runtime findings remain zero and full findings remain 16. No public hosting readiness is inferred.

## Acceptance and remaining gates

Separate technical reviewer verdict: **pass, no unresolved technical blockers**, after reproducing initial 44/44 and final 51/51 API suites, lint, diff checks, candidate dry-run and mocked SDK probes. This is separate-agent technical review, not human safeguarding approval. Technical implementation is ready for owner commit review; actual commit acceptance belongs to Git/native tracker. No paid provider calls, live output, measured model quality/cost, native Urdu approval, safeguarding signoff, hosted CI, new endpoint, conversation UI, deployment or publication is claimed.

After actual T05 acceptance/commit, T06 is next: T04 policy orchestration, fixture service, bounded same-origin transport, known-risk fallbacks, final validation and endpoint tests. Then T07 integrates T02/T03 with that endpoint. T09 must complete full-pipeline live evaluation and exact model selection with a spend envelope, native-authored cases and human review. This technical review is not independent human safety approval.
