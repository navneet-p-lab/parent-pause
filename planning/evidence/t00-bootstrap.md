# T00 bootstrap implementation and handoff

Historical snapshot. For the current repository, tracker and bootstrap acceptance state, see [18 November reassessment](session-reassessment.md).
Status: In Review (18 November 2026, local time). Implementation and local acceptance checks passed; uncommitted, independent review/integration pending. Executor: primary Codex assistant (GPT-6); no delegated agents.

## Plan

1. Create an independent npm/Next.js TypeScript project rooted in this folder, with exact dependency versions and a Node 22.12+ prerequisite. Do not initialize Git or use any parent workspace configuration.
2. Build a minimal English shell with CSS Modules, a skip link and a focusable main heading. Keep provider configuration as an example only; no model calls or conversation UI in this packet.
3. Configure ESLint, strict typechecking, Vitest/Testing Library, Playwright Chromium/WebKit and axe. Add actual shell component and browser tests. Unit/API commands must fail while their future suites are absent; CI must identify those deferred categories explicitly.
4. Run a clean local install, lint, typecheck, component/browser checks and production build. Record exact outcomes, prerequisite issues and handoff limits, then move the card to In Review when acceptance passes.

## Scope and handoff

Only T00 is ready. T01 requires reviewed/integrated bootstrap before work starts; T02/T03/T04 are the first concurrent lanes after reviewed T01. This session owns bootstrap/configuration and the minimal smoke tests needed by its acceptance criteria. Styling stays local to the bootstrap page; shared tokens, contracts, locale and safety code remain in later packets.

Runtime discovery: default shell Node is 20.20.2. Existing `/opt/homebrew/opt/node@22/bin/node` is 22.23.2; verification will select that executable through PATH, without changing global runtime settings.

## Verification

All commands run from this project root. Unless testing rejection of Node 20, the shell selects the existing Node 22.23.2 runtime with `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`. npm is 10.9.8.

- `npm ci --offline --cache /private/tmp/parentpause-npm-cache --no-audit --no-fund`: exit 0; clean installation from the lockfile, 445 packages. The cache was populated by the initial registry install; an uncached remote fresh clone/hosted CI run is not claimed.
- `npm run lint`: exit 0, no lint warnings.
- `npm run typecheck`: exit 0.
- `npm run test:components`: exit 0; 1 file / 1 test passed after the clean install.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: exit 0; static `/` and `/_not-found` generated. Rebuilt after development verification and the final Next configuration change.
- `NEXT_TELEMETRY_DISABLED=1 npm run dev -- --port 3211`: server ready; `curl --fail --silent http://127.0.0.1:3211` returned the shell with HTTP 200; server stopped after the check. Loopback listen required a sandbox escalation; no application code change was needed for that restriction.
- `npm run test:unit` and `npm run test:api`: each exit 1 with “No test files found,” as intended until T01/T06 add their suites. These are checked missing-suite guards, not passing unit/API behavior suites.
- Under default Node 20.20.2, `npm ci --dry-run --offline --cache /private/tmp/parentpause-npm-cache --no-audit --no-fund`: exit 1 with `EBADENGINE`, displaying the required Node range. No install was performed by this check.
- A Node script checked Vite's `searchForWorkspaceRoot(process.cwd())` and resolved Next, React, Vitest and Playwright imports: exit 0, all inside this folder. Lockfile has no `file:` dependencies or linked packages.
- `PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install --only-shell chromium webkit`: exit 0; headless Chromium v1255 and WebKit v2388 installed.
- `NEXT_TELEMETRY_DISABLED=1 npm run test:e2e`: final exit 0, 2 tests passed (Chromium and WebKit). Both proved visible heading, correct document locale/direction, keyboard skip-link/heading focus, no axe violations, no 320px horizontal overflow and no page errors. Playwright started/stopped a dedicated production server on port 3210. Browser execution/loopback listen required sandbox escalation.

## Changes

- Exact runtime/dev dependencies and independent npm lockfile; local npm settings, Node version pin and ignore rules.
- Strict TypeScript, Next.js roots, ESLint, Vitest and Playwright configurations; provider environment example only.
- English App Router layout/page with a CSS Module, focusable heading, skip link, preview disclosure and emergency notice.
- One Testing Library smoke test and a Playwright smoke test configured for Chromium and WebKit, including axe and narrow viewport overflow checks.
- CI commands and explicit unit/API deferrals that become required when their owning source files/tests land; setup/verification README.

Supporting CSS, smoke-test files, runtime settings and this evidence document extend the packet's enumerated file list only as needed for its acceptance criteria. No downstream contracts, locales, safety classifier or coach API were implemented.

## Rework and limitations

- npm 10.9.8 crashed twice in peer resolution while trying the Vitest 4 release line, including with Vite 7 explicitly pinned. Matching current Vite 8.3.8 and Vitest 5.1.0 installed successfully without `--force` or `--legacy-peer-deps`; the clean install then passed.
- Vitest initially searched the enclosing SongRise workspace for its token/cache fallback. An empty local `workspaces` boundary plus `.npmrc` with `workspaces=false` confines its workspace discovery while keeping npm installs independent. Package ESM mode removes the config-loader warning.
- Next.js development generated a new agent instructions file. `agentRules:false` prevents development startup from mutating those instructions; the generated file was removed. Consult version-matched bundled Next.js docs when changing framework behavior.
- ESLint 9.39.5 emits an upstream deprecation warning during install. The bundled React and JSX accessibility plugins currently declare support through ESLint 9, so this bootstrap retains the compatible version rather than bypassing peer constraints. Review the lint stack's supported-major upgrade when those plugins support it.
- A slow full graphical Chromium download was cancelled; the documented/CI install now requests only headless Chromium and WebKit.
- The first browser run passed Chromium and failed WebKit's Tab-to-link expectation on macOS. The rerun uses macOS Safari's documented Option-Tab for links (plain Tab for other browser/platform combinations), preserving every focus/axe assertion. See [Apple's keyboard guidance](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac). The final run passed both browsers; no system settings were changed.
- GitHub Actions is configured but not remotely run. No independent review, native Urdu review, model evaluation, deployment, repository publication or commit occurred. Later packet gates remain unchanged.

## Reference checks

Checked [Next.js installation documentation](https://nextjs.org/docs/app/getting-started/installation) and [Playwright configuration documentation](https://playwright.dev/docs/test-configuration), registry engine/peer declarations, and the installed version's bundled Next.js testing/configuration documentation. Actual verification above, rather than documentation alone, establishes the local outcomes.

## Review handoff

T00 is ready for independent review; the implementation self-check is not an independent review. No commit was requested or created. Keep T01 blocked until the planner's review/integration gate is satisfied. After approval/integration, T01 freezes contracts and presentational props; only then may the three parallel lanes start. Package/configuration ownership now belongs to the integrator.
