# T01 contract implementation and review

Date: 18 November 2026. Input: accepted T00 commit `2097a2c45f43e7441f47b48663da17d95e826736` on clean `main` in the verified independent Git root.

## Implementation plan

1. Freeze revision `t01-v1`: strict application schemas, inferred types, explicit Unicode bounds, alternating transcript rules, response locale matching and bounded response families. Preserve parent text and historical assistant locales.
2. Add object-wrapped provider schemas for generation/classification/review; keep provider shape validation separate from application business validation. No SDK, inference or endpoint in this packet.
3. Add synthetic fixtures for all four response families in English and Urdu. Add adversarial unit tests for unknown keys, invalid roles/order/history, exact code-point limits, nested bounds, response locale, provider wrappers and plain-text handling.
4. Publish token names and presentational props so T02/T03 can implement disjoint files. The integrator adds the already-resolved exact Zod version as a direct dependency; no unrelated package updates.
5. Self-review and run lint, generated-route typecheck, unit/components and production build. A separate agent reviews the specification/tests in an isolated worktree in parallel; this is technical contract review, not human safety approval. Fix reproduced gaps and rerun affected checks.
6. Update packet/evidence/handoff/log and tracker to In Review, review all changed files and submit Nimbalyst's required commit proposal. Only an actual approved commit unlocks T02/T03/T04; no downstream packet starts in this commit.

## Clarifications to freeze

- A request locale selects the next response language. Historical assistant responses may have either locale after a UI switch. Validate a success response against the submitted request with an explicit helper.
- All nonempty text uses Unicode code-point counts and rejects Unicode `White_Space` plus BOM-only strings without trimming accepted content. User text can contain literal HTML/Markdown; it remains data. Response fields are also untrusted plain text; renderers must never interpret HTML or Markdown links.
- English plan and escalation word targets become deterministic ceilings of 120 and 100 whitespace-delimited words respectively, counting all visible response fields. Urdu uses field bounds; language fluency and the meaning/number of questions require semantic/human review. Structural validation guarantees one check-in object, not semantic language detection.
- Provider root objects wrap responses, classification and review. Provider shape schemas do not establish application validity or safety; T05/T06 must parse through application/business validation before accepting output.
- The 64 KiB body limit is enforced before JSON parsing in T06, not by a schema over an already-parsed object.

## Verification and review

Executor: primary Codex assistant (GPT-6 family; exact runtime variant is not exposed). One delegated read-only Codex technical reviewer, using the inherited model, reviewed an implementation snapshot in an isolated detached worktree. No delegated implementation, smaller-model override, native reader or human safeguarding reviewer ran. The owner explicitly requested consideration/use of parallel work. The packet dependency gate allowed parallel contract review but no T02/T03/T04 implementation before T01 acceptance.

Implemented [schemas/shared props](../../src/lib/contracts.ts), [synthetic fixtures](../../src/test/fixtures/contracts.ts), [unit regressions](../../src/test/unit/contracts.test.ts) and the [interface handoff](../contracts-t01-v1.md). The integrator promoted the already-locked Zod `4.6.7` to an exactly pinned runtime dependency; no dependency version changed. Existing CI automatically requires the unit suite when the contract file exists, so no CI change was needed. README, packet, directive, task index, architecture pointer, reviewer handoff and agent log describe the verified boundary.

### Reproduced gaps and fixes

- Initial typecheck failed on test-table typing. Self-review also found that array-valued rows could be interpreted as argument lists rather than whole transcripts. Converted those rows to named objects and explicitly typed the fixture collection; final typecheck and actual invalid-order/history regressions pass.
- The delegated reviewer reproduced acceptance of Unicode NEXT LINE (`U+0085`) as a supposedly nonblank input and its omission from word counts by JavaScript `trim`/`\s`. Replaced those checks with Unicode `White_Space` plus BOM handling, without mutating accepted text. Added NEL-only user/check-in/field/list-item rejection and English plan/escalation ceiling bypass regressions. The suite grew from 149 to 153 tests.
- The reviewer found that T02 would otherwise depend on a future T03-owned label type. Moved the shared label and presentational prop declarations into T01's contract exports. Both UI lanes can now import the shared declarations directly. The review decision application schema also uses a discriminated union so inferred types preserve the category relationship.
- Both reviewer findings were fixed before final review. The reviewer independently reran 153/153 unit tests on the refreshed isolated snapshot and reported no remaining blocking findings. Primary self-review and delegated technical review do not establish human safety approval.

### Commands actually run

Environment: macOS, Node `v22.23.2`, npm `10.9.8`; all npm commands use `PATH=/opt/homebrew/opt/node@22/bin:$PATH` in this independent root unless a temporary directory is explicitly named. Build/browser commands additionally set `NEXT_TELEMETRY_DISABLED=1`, matching CI. No provider key, inference, API route or deployment was involved.

| Command | Actual result |
|---|---|
| `git rev-parse --show-toplevel`, `git status --short`, `git branch --show-current`, `git log -5 --oneline` | Independent project root, clean `main` initially, accepted baseline `2097a2c` |
| `node --version`, `npm --version` | Node 22.23.2 / npm 10.9.8 |
| `npm install --ignore-scripts --no-audit --no-fund --save-exact zod@4.6.7` | Exit 0; same package/version, now direct runtime dependency |
| `npm ls zod --depth=0` | Exit 0; direct Zod 4.6.7 |
| `npm ci --no-audit --no-fund` in `/private/tmp/parentpause-t01-install-20261118` | Exit 0; clean manifest/lock/config-only copy installed 445 packages in 38 seconds, using available cache and registry downloads for missing packages; separate `npm ls zod --depth=0` confirmed direct Zod 4.6.7 |
| `npm run lint` | Exit 0 after final code changes |
| `npm run typecheck` | Exit 0 after final code changes; generated Next route types plus TypeScript |
| `npm run test:unit` | Exit 0; final primary 153/153 tests in one suite; delegated reviewer separately reproduced 153/153 |
| `npm run test:components` | Exit 0; existing shell component 1/1 |
| `npm test` | Exit 0 after final code changes; 154/154 across unit + component suites |
| `npm run build` | Exit 0 after final code changes; static `/` and not-found routes only |
| `npm run test:e2e` | Exit 0; existing 10/10 Chromium/WebKit shell regressions, production server on 127.0.0.1:3210 |
| `npm audit --json` before dependency change | Exit 1; same 16 inherited high development-tool findings through picomatch; no force downgrade applied |
| `npm audit --omit=dev --json` after dependency change | Exit 0; zero known runtime findings |
| `git diff --check` | Exit 0 |

Environment rework: creating the isolated worktree needed Git metadata write permission; the authorized retry succeeded. The initial audit hit restricted-network DNS failure; the permitted network retry returned the audit above. Offline promotion of Zod lacked registry metadata; the permitted registry install succeeded. The isolated offline clean install lacked the `zod-validation-error` tarball; the permitted online retry passed. This was a clean dependency install, not a full uncached clone or hosted CI run; it emitted the existing ESLint 9 deprecation warning. The first build lacked the telemetry opt-out and attempted to write a user preference outside the workspace; rerunning with `NEXT_TELEMETRY_DISABLED=1` passed. The first browser invocation could not bind localhost under the sandbox; the permitted local-server retry passed all 10 cases. These failures are distinguished from app regressions.

### Limits and acceptance

T01 implements strict shape/length/order/correlation validation and an interface boundary. It does not prove that supplied history is complete, a language tag matches the content, a check-in contains exactly one semantic question, or a schema-valid response is safe. Hostile strings remain text data. Provider wire JSON Schema conversion is tested locally; real provider subset acceptance, live inference, actual coaching, Urdu fluency, human safety approval and hosted CI are not claimed. T06 still owns the before-parsing body byte limit. API tests remain intentionally absent until their packet. The inherited development-tool advisory remains unresolved. Tracker metadata, session link, comment and local body snapshot saved; collaborative body write failed again on retry in this teamless workspace, so the portable packet remains the cross-machine handoff.

Status: In Review for the owner-requested Nimbalyst commit. Approval/commit outcome belongs to Git and the native tracker; no SHA is predicted. After acceptance, T02/T03/T04 are the next independent implementation lanes under the frozen interface and isolated ownership. No downstream implementation began here.
