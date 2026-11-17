# ParentPause

An independent English/Urdu parenting-coach assessment app. **Current implementation: static English preview plus unconnected T01–T05 contracts, components, safety policy and provider adapter.** The bilingual shell, response renderers and deterministic safety helpers are implemented and tested separately; T07 wires the conversation page after the provider/API packets. The current product page collects no messages and makes no AI calls. See [parallel implementation evidence](planning/evidence/t02-t04-parallel.md). See the [contract/interface handoff](planning/contracts-t01-v1.md) and [T01 verification](planning/evidence/t01-contracts.md).

For upcoming work, read the [session directive](planning/09-session-directive.md) and [reviewer/AI interaction handoff](planning/10-reviewer-handoff.md). Read the [planning index](planning/README.md), [implementation plan and verification](planning/evidence/t00-bootstrap.md), or [parallel execution guide](planning/tasks/KANBAN.md). The [interactive design prototype](planning/mockups/parentpause.mockup.html) is separate from the application.

## Local setup

Node **22.12+ within the Node 22 release line** is required; `.nvmrc` pins the verified 22.23.2 runtime. npm 10.9.8 is the package-manager baseline. With nvm, run `nvm install` followed by `nvm use`. Check `node --version` before installing: an older runtime fails installation because `engine-strict` is enabled. No runtime upgrade is performed by the app.

Run these commands **inside this independent repository root**:

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000. No environment file or API key is needed for the preview. `.env.example` documents T05 server configuration; the unconnected page never reads a provider key or calls the adapter. Do not reuse SongRise credentials. No global npm package, parent manifest, parent lockfile, database or service is needed.

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
```

Browser tests start and stop a dedicated **production** server on 127.0.0.1:3210; build first and leave that port free. They cover keyboard skip navigation, automatic axe checks and reflow at 320/390/768/1440px in Chromium/WebKit, plus enlarged text and user text spacing. They reject failed assets, external requests and unexpected writes from this static shell. On Linux CI, install browsers with `npx playwright install --with-deps --only-shell chromium webkit`. Browser downloads need network access; smoke tests need no credentials or model access. The headless-only flag avoids downloading graphical Chrome that these tests do not use.

`npm run test:presentational` runs a separate Vite test host on 127.0.0.1:3211 with the actual T02/T03 components and local font. Chromium/WebKit check both locales at four widths, axe, 44px controls, per-response direction, keyboard focus, text spacing and 200%/400% text scaling. It is a fixture-only test host, not a product route, request lifecycle or live coaching journey.

Typechecking generates Next.js route definitions before running TypeScript, so it also works before the first dev/build run. The generated type file and local editor/session assets are ignored by Git.

The [adversarial review](planning/evidence/t00-review.md) records a remaining development-tool dependency advisory: picomatch has no published patched version at review time. The runtime audit is clear, but the full audit reports 16 inherited development findings. Keep lint/test tooling local and use trusted glob patterns; recheck the dependency when a patch is published.

`npm test` runs all existing Vitest suites. `npm run test:unit` now exercises T01 contracts and is required by the existing CI ownership check. `npm run test:api` runs the T05 provider/configuration/evaluation suites and is required in CI; T06 adds endpoint behavior. There is no `--passWithNoTests`. Each future packet must add behavioral tests in `src/test/unit`, `src/test/api` or `src/test/components`; Playwright specs belong in `src/test/e2e`.

Production shell preview:

```bash
npm run build
npm run start
```

Exact direct dependencies and transitive resolution live in this project's manifest and lockfile. Next.js tracing and Turbopack roots are explicitly confined to this folder. The build uses webpack for a predictable baseline. CSS Modules are built in; no CSS framework is needed. CI is configured at this independent repository root but has not run remotely. Earlier SongRise nesting references describe the original workspace; inspect Git state before future operations. Repository publication remains a delivery task.

## Handoff limits

T00 acceptance was reverified in the [bootstrap reassessment](planning/evidence/session-reassessment.md) and integrated in commit `2097a2c`. T01 implements the [schemas, token names and presentational props](planning/contracts-t01-v1.md); Git/native task history records its approval/commit outcome. T02–T04 have been implemented in parallel worktrees and technically verified; see their evidence for commit status. T02–T04 were accepted at `a35f8c6`. T05 now provides the server-only adapter and opt-in harness; see the [T05 evidence](planning/evidence/t05-provider.md) and [integration handoff](planning/contracts-t05-v1.md). Confirm T05 acceptance in Git/native tracker before T06, then T07. Package/configuration changes after T00 belong to the integrator. Full conversation journeys, native Urdu/safeguarding review, live model evaluation, repository publication and video delivery remain later gates. The prototype and contract checks do not establish those gates.

## Provider evaluation

`npm run eval:live` defaults to a no-network dry-run. `--models candidate-a,candidate-b` plans explicit candidate comparisons. Live diagnostics require `--live`, an explicit model list, server key and sufficient `--max-calls`; do not run paid evaluation without a spend envelope. Results default to ignored `evaluation-results/` JSONL files, with null human scores. No runtime model is selected.

The current CLI is a direct-provider diagnostic. It cannot provide accepted setup replies for follow-up cases and reports those as `SETUP_NOT_ACCEPTED`. T09 must inject the integrated T06 pipeline through the exported evaluation target seam and complete live/native/human review. See the [T05 handoff](planning/contracts-t05-v1.md) for exact adapter/error interfaces and evaluation limits.
