# T02–T04 parallel implementation and verification

Date: 18 November 2026. Input: accepted T01 commit `47728e2db9bca3f35610f2ffc162ae08e5abe6ea`, frozen `t01-v1` interface. The independent repository root and clean `main` were verified before changes. Native tracker includes accepted T00/T01; work radar for each selected packet showed no competing implementation.

## Implementation plan

1. Run T02 locale shell, T03 response rendering and T04 deterministic safety policy concurrently in separate Git worktrees/branches based on T01. Each implementation agent owns only its packet files and tests. The primary integrator owns shared imports, configuration, evidence and documentation. No provider, endpoint or conversation-state integration is included.
2. T02 supplies typed English/Urdu dictionaries, controlled locale shell, document direction, logical CSS tokens and a licensed self-hosted Arabic font. T03 consumes frozen props/tokens and renders all response families, chronological history and one announcement per supplied event. T04 supplies category-specific authored responses, conservative early escalation, routing precedence and input-as-data prompt contracts.
3. Each lane runs focused behavioral tests and self-review. The integrator reviews actual source and adversarial cases before copying the narrowly owned files into `main`. T04 receives a separate lead technical policy review before integration; this does not substitute for human safeguarding/native-language release approval.
4. Fix reproduced gaps, run relevant regressions, then run combined lint, generated-route typecheck, unit/component tests, production build and existing Chromium/WebKit shell regressions. Verify locale/font/reflow behavior in an isolated browser harness without prematurely wiring the product page.
5. Update packet state, reviewer handoff and factual agent log, move verified cards to In Review, inspect every session-edited file and propose the combined commit through Nimbalyst. Record an actual SHA only after owner commitment.

## Orchestration

| Lane | Branch | Worktree | Ownership |
|---|---|---|---|
| T02 | `task/t02-locale` | `/private/tmp/parentpause-t02` | Shell, switch, notice, dictionaries, direction helper, tokens, font/license, component tests |
| T03 | `task/t03-renderers` | `/private/tmp/parentpause-t03` | Response/conversation components, their CSS Modules, component tests |
| T04 | `task/t04-safety` | `/private/tmp/parentpause-t04` | Safety rules/policy/templates, classify/review prompts, unit tests |

Agents use the inherited model without overrides. No worktree commits are needed: the primary integrator transfers the reviewed owned files and proposes one atomic commit. Existing unrelated detached T01 review worktree is preserved. Git metadata writes needed the sandbox's routine escalation; creation then succeeded. No external messages, publication, deployment or paid inference are authorized by this work.

## Results

T02/T03 were copied into the integration checkout only after their focused checks and primary source review. T04 received primary lead review plus a separate read-only technical review by the T03 implementation agent. T03 also received separate read-only review by the T02 agent. All executors are Codex assistants using the inherited model without model overrides; the exact runtime model variant is not exposed. These are technical AI reviews, not native-reader or human safeguarding approval.

### Reproduced findings and fixes

- T02 initially used pixel font tokens and reset typography on every Urdu descendant. Lead review changed these to rem equivalents and inherited typography so browser text preferences scale content without flattening heading hierarchy. Design defaults remain 16/18px body and 36/28px heading at the normal root size.
- The first integrated browser run found repeated navigation landmarks named “You” and “A quick check-in.” T03 now uses labelled groups for parent messages and check-ins, preserving heading context without generating repeated landmarks. Added a repeated-transcript regression; axe was not disabled.
- WebKit keyboard testing needed the existing project's macOS Option-Tab convention. The test harness was corrected without changing controls.
- The 200%→400% text-size transition exposed numbered-list marker overflow in mixed-direction cards. Initial inspection suggested font timing; waiting for the font did not fix the transition, and increased list padding did not fix it either. Browser isolation reproduced the marker cause; numbered lists now place markers inside their own box. The speculative padding change was reverted. Enlarged-text verification waits for `document.fonts.ready`, verifies actual computed font sizes double/quadruple, and checks the transition at 320px. This is text-scaling evidence, not physical-device browser zoom or manual glyph review.
- T04 lead review prevented broad negation/fiction/test guards from suppressing an unrelated explicit danger clause. Added direct English, Urdu and Roman Urdu emergency clauses from the approved seed scenarios; an erroneous routine classifier or outage cannot demote matched current emergencies.
- T04 sentence splitting incorrectly extracted bare danger phrases from multi-sentence quoted fiction, and missed unquoted danger adjacent to quoted instructions. Six red regressions established the first gap; balanced quotation handling now changes only an analysis copy, retaining boundaries around quoted spans. Single-quoted fiction was subsequently found by the separate reviewer and is included in follow-up verification. Contextual/unmatched text always requires semantic classification.
- Separate T04 review also reproduced an earlier abuse disclosure masking a newer novel emergency and permanent locking of an earlier emergency despite later resolved-history context. Fixed both with explicit category floors, contextual reassessment and authored known-risk outage fallbacks. Lower non-imminent risk now classifies full context and can upgrade to emergency. Only a valid classification plus allowed valid candidate can release earlier risk to routine/clarification; an unreviewed boundary retains the risk floor. Single-quoted fiction now defers to classification without suppressing adjacent real danger. The separate reviewer independently reran all three counterexamples and failure paths and reported no remaining concrete technical blocker.

### Environment and scope

Node `v22.23.2`, npm `10.9.8`, macOS; existing project lockfile/dependencies. Worktree tests temporarily linked the existing dependencies, then removed those links. No dependency versions changed. Font download initially failed sandbox DNS, then succeeded through routine approved network escalation from the official Google Fonts repository. Font is unmodified Noto Sans Arabic variable TTF, self-hosted with SIL OFL 1.1 and source provenance; SHA-256 `63111b5b2e074dd48cc67692e0a2726d86ee94c1c37fe8598257b7b4e87e869e`.

Local HTTP servers initially failed sandbox `listen EPERM`; approved local test-server execution succeeded. A worktree build initially failed while Next attempted to write telemetry preferences outside the worktree; `NEXT_TELEMETRY_DISABLED=1` resolved this without changing configuration. The runtime audit initially failed sandbox DNS, then `npm audit --omit=dev --json` exited 0 with zero vulnerabilities under approved network access. Full development-tool audit was not rerun because no dependency version changed; the previously recorded picomatch findings remain unresolved historical evidence.

The Vite/Playwright presentation host is test-only and excluded from the production route tree. It renders actual T02/T03 components with synthetic fixtures, tests English/Urdu at 320/390/768/1440px, local font loading, axe, 44px controls, per-response locale, keyboard focus, 200%/400% text scaling and text spacing. This adds ongoing CI checks without claiming T07 integration or T08 full coaching journeys.

### Final verification

All commands run from the independent integration root with `/opt/homebrew/opt/node@22/bin` selected. Every final command below exited 0:

| Command | Actual result |
|---|---|
| `npm run lint` | No warnings/errors |
| `npm run typecheck` | Generated Next route types, strict TypeScript passed |
| `npm run test:unit` | 261/261 across 2 files: 153 contracts + 108 safety |
| `npm run test:components` | 31/31 across 3 files: 1 baseline + 4 locale + 26 renderer |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | Production build passed, only `/` and not-found routes |
| `npm run test:e2e` | 10/10 Chromium/WebKit production-shell regressions |
| `npm run test:presentational` | 10/10 Chromium/WebKit bilingual presentation cases, final numbered-marker fix included |
| `npm audit --omit=dev --json` | Zero known runtime vulnerabilities |
| `git diff --check` | No whitespace errors |

Initial lane checks and intermediate 75/81-case safety suites are historical subsets, not the final counts. The final integration lint/typecheck/unit/component/build run occurred after the final safety copy. Browser suites cover the final UI code; subsequent changes were safety helpers and documentation, which do not participate in that fixture host. No missing-suite bypass, API test completion, live inference, uncached fresh-clone install, hosted CI run or manual accessibility approval is claimed.

### Handoff and acceptance boundary

See [t04-v1 safety handoff](../contracts-t04-v1.md) for the provisional generation/fallback contract. T01 schemas/props remain unchanged. The integrator added the global token import, test-only Vite/Playwright configuration, npm script and ongoing CI check; no dependency versions or lockfile changed. Worktree source was transferred by explicit owned-file lists into the integration checkout; no parallel commits or automatic merges ran.

Primary source/technical policy review and two separate read-only reviews found and fixed the issues above. Native Urdu fluency, qualified human safeguarding review, actual screen-reader announcement delivery, physical mobile/zoom/glyph checks and full-pipeline live evaluation remain release gates. Narrow quote/phrase/resolution recognition is not a complete language parser; unmatched text still needs semantic classification, and unmatched resolution can remain conservative. Client history cannot establish complete authoritative risk memory.

T02–T04 are technically verified for In Review and the owner-requested atomic Nimbalyst commit proposal. Actual approval/SHA is established only by Git and the native tracker after commitment. No public readiness is claimed. T05 is next after T04 acceptance; T06 then T07 connect service/API and page lifecycle. The product remains the static English preview until that integration. Temporary worktrees are retained for inspection; the earlier detached T01 worktree is preserved.
