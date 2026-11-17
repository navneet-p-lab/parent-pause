# ParentPause

GitHub destination: [navneet-p-lab/parent-pause](https://github.com/navneet-p-lab/parent-pause). Source publication does not establish release approval.

An independent English/Urdu parenting-coach assessment app. **T07 now connects the bilingual composer, memory-only conversation and validated T06 endpoint.** Choose the reply language explicitly; English, Urdu and Roman Urdu inputs are accepted. Chat clears on reload or confirmed new conversation. No accounts or durable chat history. See [T07 verification](planning/evidence/t07-conversation.md) and [conversation/T08 handoff](planning/contracts-t07-v1.md).

For upcoming work, read the [session directive](planning/09-session-directive.md) and [reviewer/AI interaction handoff](planning/10-reviewer-handoff.md). Read the [planning index](planning/README.md), [implementation plan and verification](planning/evidence/t00-bootstrap.md), or [parallel execution guide](planning/tasks/KANBAN.md). The [interactive design prototype](planning/mockups/parentpause.mockup.html) is separate from the application.

## Local setup

Node **22.12+ within the Node 22 release line** is required; `.nvmrc` pins the verified 22.23.2 runtime. npm 10.9.8 is the package-manager baseline. With nvm, run `nvm install` followed by `nvm use`. Check `node --version` before installing: an older runtime fails installation because `engine-strict` is enabled. No runtime upgrade is performed by the app.

Run these commands **inside this independent repository root**:

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For local fixture use, copy `.env.example` to `.env.local` and match APP_ORIGIN to the development URL. Fixtures need no key and display “Demo responses — no AI call.” For live use select COACH_PROVIDER=openai and explicit server-only model/key; no runtime model is chosen by this repository. Do not reuse SongRise credentials. No global npm package, parent manifest, parent lockfile, database or service is needed.

On this development Mac an existing compatible runtime can be selected without changing the global default:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

## Checks

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:components
npm run build
npx playwright install --only-shell chromium webkit
npm run test:e2e
npm run test:presentational
npm run test:journeys
```

Browser tests start and stop a dedicated **production** server on 127.0.0.1:3210; build first and leave that port free. They cover keyboard skip navigation, automatic axe checks and reflow at 320/390/768/1440px in Chromium/WebKit, plus enlarged text and user text spacing. They reject failed assets, external requests and unexpected writes during initial page rendering. On Linux CI, install browsers with `npx playwright install --with-deps --only-shell chromium webkit`. Browser downloads need network access; smoke tests need no credentials or model access. The headless-only flag avoids downloading graphical Chrome that these tests do not use.

`npm run test:presentational` runs a separate Vite test host on 127.0.0.1:3211 with the actual T02/T03 components and local font. Chromium/WebKit check both locales at four widths, axe, 44px controls, per-response direction, keyboard focus, text spacing and 200%/400% text scaling. It is a fixture-only test host, not a product route, request lifecycle or live coaching journey.

`npm run test:journeys` runs T08's real-network Chromium/WebKit conversation journeys on 127.0.0.1:3212. Keep that port free and run browser configurations and builds sequentially. The host requires development fixture mode and a blank key; Playwright supplies those settings. Default scenarios reach the original Next route. Controlled scenarios inject provider sessions through the real handler/service seams to test plans, boundaries, rejected output, deadlines, retry and cancellation without model calls. Scenario headers exist only in this test host. Evidence and remaining manual checks are in [browser validation](planning/evidence/browser-validation.md).

Typechecking generates Next.js route definitions before running TypeScript, so it also works before the first dev/build run. The generated type file and local editor/session assets are ignored by Git.

The [adversarial review](planning/evidence/t00-review.md) records a remaining development-tool dependency advisory: picomatch has no published patched version at review time. The runtime audit is clear, but the full audit reports 16 inherited development findings. Keep lint/test tooling local and use trusted glob patterns; recheck the dependency when a patch is published.

`npm test` runs all existing Vitest suites. `npm run test:unit` now exercises T01 contracts and is required by the existing CI ownership check. `npm run test:api` runs the T05 provider/configuration/evaluation suites and is required in CI; T06 now adds endpoint, service, limits and startup-guard behavior. There is no `--passWithNoTests`. Each future packet must add behavioral tests in `src/test/unit`, `src/test/api` or `src/test/components`; Playwright specs belong in `src/test/e2e`.

Production app (live configuration or unavailable guidance; fixture mode is rejected):

```bash
npm run build
npm run start
```

Exact direct dependencies and transitive resolution live in this project's manifest and lockfile. Next.js tracing and Turbopack roots are explicitly confined to this folder. The build uses webpack for a predictable baseline. CSS Modules are built in; no CSS framework is needed. CI is configured at this independent repository root; consult GitHub Actions for remote results. Earlier SongRise nesting references describe the original workspace; inspect Git state before future operations. Source is published at the GitHub destination above; remaining delivery and release gates are pending.

## Handoff limits

T00 acceptance was reverified in the [bootstrap reassessment](planning/evidence/session-reassessment.md) and integrated in commit `2097a2c`. T01 implements the [schemas, token names and presentational props](planning/contracts-t01-v1.md); Git/native task history records its approval/commit outcome. T02–T04 have been implemented in parallel worktrees and technically verified; see their evidence for commit status. T02–T04 were accepted at `a35f8c6`. T05 now provides the server-only adapter and opt-in harness; see the [T05 evidence](planning/evidence/t05-provider.md) and [integration handoff](planning/contracts-t05-v1.md). T05 was accepted at `0b58067`; T06 now implements the service/API with [verification](planning/evidence/t06-service.md). T06 was accepted at `7003017`. T07 now connects conversation state/UI; see its [verification](planning/evidence/t07-conversation.md). Confirm T07 acceptance before T08 browser journeys. Package/configuration changes after T00 belong to the integrator. Full conversation journeys, native Urdu/safeguarding review, live model evaluation, repository publication and video delivery remain later gates. The prototype and contract checks do not establish those gates.

## Provider evaluation

The [first funded model comparison](planning/evidence/t09-model-comparison-2026-11-18.md) completed 166/166 attempts: Luna 79/83 and Terra 81/83 expected routes, with ambiguous-distress availability and content findings still blocking release. Total known-token estimates across pilot/comparison/recovery are US$0.1102685; conservative reservations US$1.615455 remain below the owner's US$3 cap. Human/native/manual reviews and final model selection remain pending. Earlier readiness statements elsewhere in this document are historical handoffs.

`npm run eval:release` evaluates T09's **integrated service** and defaults to a no-network dry-run. It retains accepted setup replies, captures failed-stage usage alongside authored fallbacks, checks expected routes/categories and reports honest human-review denominators. Live execution requires explicit candidates, a local server key, sufficient `--max-calls`, positive `--max-usd`, verified `--rates` and an owner-approved spend envelope. Before each inference request, it counts exact input tokens and persists a conservative reservation for input and maximum output. Reservations are never refunded; transport failures stop the run. The limit covers this invocation's reserved token costs, excluding taxes and unrelated account usage. Carry prior reservations forward when resuming; a new invocation does not remember another artifact's budget. Counting adds latency inside the service deadline, so instrumented latency is not production latency. See [the first live attempt](planning/evidence/t09-live-evaluation-2026-11-18.md), [evaluation readiness](planning/evidence/model-evaluation.md) and [technical release review](planning/evidence/release-review.md). Final model selection and human release approval remain pending.

`--resume path/to/prior.jsonl` verifies candidate/corpus/prompt/service provenance and carries earlier records forward with an artifact hash; it retains failures and marks reused observations rather than claiming new calls. `--turn-gap-ms 45000` spaces full three-stage turns by 45 seconds per model, proportionally less for classification-only turns, outside the service deadline. Authored bypasses skip pacing. Case wall latency includes these waits; do not use it to rank production model speed. A separate recovery attempt must retain the first-pass failure in the original comparison.

`npm run eval:live` defaults to a no-network dry-run. `--models candidate-a,candidate-b` plans explicit candidate comparisons. Live diagnostics require `--live`, an explicit model list, server key and sufficient `--max-calls`; do not run paid evaluation without a spend envelope. Results default to ignored `evaluation-results/` JSONL files, with null human scores. No runtime model is selected.

The `eval:live` CLI remains a direct-provider diagnostic. It cannot provide accepted setup replies for follow-up cases and reports those as `SETUP_NOT_ACCEPTED`. T09's `eval:release` CLI connects the integrated T06 pipeline through that target seam; live/native/human review is still pending. See the [T05 handoff](planning/contracts-t05-v1.md) for exact adapter/error interfaces and evaluation limits.

## Service endpoint

T06 implements `POST /api/coach` with strict schemas, configured same-origin checks, a streamed 64 KiB body limit, total 20-second deadline, no-store envelopes and instance rate limits. Explicit emergencies use authored responses without a key or provider call, after transport validation. Routine requests need explicit server provider configuration. The bilingual page now uses this endpoint through T07.

Set `APP_ORIGIN` to the exact local origin. Development fixture mode (`COACH_PROVIDER=fixtures`, `npm run dev`) returns labeled deterministic clarifications without model calls; it does not establish semantic safety. `npm run start` is the production command and rejects fixtures from shell or environment files before listening. Live use requires `COACH_PROVIDER=openai`, server key and an explicitly selected available model; no model is selected by this repository.

Limits default to one shared local instance bucket: 10 requests/minute and 100/hour. Optional `COACH_CLIENT_KEY_HEADER` requires a trusted gateway that strips client values and derives a validated key. Header names/values alone do not prove trust. Instances/restarts can bypass/reset in-memory limits; public hosting requires gateway/distributed limits and an enforceable spend cutoff. See [transport/error mappings and T07 integration](planning/contracts-t06-v1.md).

## Conversation behavior

Topic chips fill the draft without sending. Enter adds a newline; Ctrl/Command+Enter sends outside IME composition. Drafts remain until success and survive errors/cancel. Language changes cancel pending work and keep earlier replies in their original language. New conversation asks before clearing draft/history. After eight replies, start a new conversation; history is never silently truncated. All state stays in page memory; provider retention policies may still apply to live requests.

T08 adds maintained fixture-backed Chromium/WebKit journeys, including bilingual responsive accessibility and actual authored crisis layouts. Native Urdu/safeguarding approval, real assistive-technology/mobile-keyboard/browser-zoom checks and full-pipeline live model evaluation remain release gates. See [browser validation](planning/evidence/browser-validation.md) for exact verification and limitations; Git/native tracker establishes commit acceptance.
