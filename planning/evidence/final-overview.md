# Final code and problem-statement review

18 November 2026. Primary Codex, exact model variant not exposed; self-review without subagents. Input: independent repository root on `main`, clean at `8baf9e48c0bdc118acb1e8c3c3c84c95b260ed30`. Current source and fresh checks establish the findings below; historical packet summaries are not completion evidence.

The supplied assessment features are implemented and reproducible. **Full live safety/usefulness acceptance remains pending.** Existing live-model findings are still open; passing fixture tests does not resolve them. The requested delivery is a GitHub link and a short README. The supplied statement does not require a video, hosted deployment, login or database.

## Requirement coverage

| Problem-statement criterion | Implementation and evidence | Verdict |
|---|---|---|
| Small Next.js or Node app | Next.js App Router, TypeScript, one conversation page and `POST /api/coach`; fresh production build passed. | Implemented |
| Parent types a concern in English or Urdu | Bilingual composer, explicit reply-language choice, Urdu RTL and mixed/Roman Urdu input. Component and Chromium/WebKit journeys cover both locales. | Implemented; native Urdu fluency approval pending |
| LLM coach supplies a short, structured, practical plan | Server-only provider uses classify → generate → review. Validated plans contain acknowledgment, 2–3 steps and one question. English plans have a 120-word total cap; both languages have field limits. Prior live comparison exercised the integrated service. | Implemented; live content/usefulness gate remains open |
| Follow-up check-in question or return time | Every response family has one question field, with prompt/reviewer checks for exactly one meaningful question. Accepted replies become context for the next turn. | Implemented; no reminder service needed |
| No diagnosis or medical/legal instructions | Authored professional boundary, safety instructions and separate candidate review; invalid/blocked outputs never become routine plans. API/browser regressions exercise these paths. | Controls implemented; human safety approval pending |
| Clearly escalate emergency, abuse or self-harm | Authored EN/UR category-specific responses. Explicit emergencies bypass provider work. Semantic classification/review can escalate; known unresolved risk survives later topic changes and provider failures. Prior live comparison matched all 39 required urgent-route attempts per model. | Implemented and tested on synthetic cases; not a general safety guarantee |
| Simple page history; no login/database | React memory-only transcript, full accepted context, confirmed clear, reload reset, cancellation/stale-result protection. No application database or browser chat storage. | Implemented |
| GitHub repo link plus short run README | [Published repository](https://github.com/navneet-p-lab/parent-pause); README now leads with clone/install/configure/run steps and distinguishes real AI from key-free fixtures. Remote `main` was verified at input SHA. | Existing source published; current polish remains local until committed/pushed |

## Review findings and changes

Reviewed the UI/composer/transcript and reducer, client transport, strict schemas, origin/body/rate/deadline limits, configuration/provider boundary, risk rules/policy/templates, prompts, startup guards, evaluation tooling/evidence, CI and browser hosts. No new production-code blocker was identified in this pass. Authored text and model outputs render as React text; SDK/key/configuration stay server-side. Provider storage is disabled explicitly, but this does not promise zero provider retention.

1. **Fixed a setup/testing conflict.** The documented example selects development fixtures, while production startup correctly rejects them. The production shell Playwright host previously inherited local provider settings, so a reviewer following the key-free setup could not start that suite. Its configuration now supplies an isolated nonfixture mode, blank key/model, exact test origin and blank client-key header. Shell tests make no coaching requests. The production fixture guard remains intact. All 10 shell checks passed with `COACH_PROVIDER=fixtures` deliberately present in the parent environment.
2. **Rewrote the README for the recipient.** Removed packet chronology and stale claims that implemented journeys/publication were still future work. Added exact clone/environment/live-mode instructions, a clearly labeled fixture option, production prerequisites, concise usage/privacy limits, verification commands and links to decisions/work log/evidence. The environment example now explains switching to live mode and keeping credentials private.
3. **Preserved evaluated product behavior.** No safety policy, prompt, response contract, corpus, provider limit or model configuration changed. The following live findings therefore still apply; documentation cleanup does not close them.

## Open findings and acceptance limits

The [funded integrated comparison](t09-model-comparison-2026-11-18.md) completed 166 attempts: Luna 79/83 and Terra 81/83 expected routes. Five ambiguous-distress clarifications were blocked by output review and returned unavailable guidance; one Terra first-pass Urdu plan failed on rate limiting (separate recovery passed). Luna also added unnecessary crisis framing to a benign homework idiom despite a route pass. These are existing response-availability/content findings, not known accepted urgent-risk false negatives. They still need repair and fresh targeted live evaluation before claiming the complete quality gate. Do not approve a blocked candidate or relabel the historical failures as successes.

Native Urdu wording review, qualified human safeguarding review, the ≥90% human-rated routine-usefulness threshold, and final model selection remain pending. Manual screen-reader speech, browser UI zoom and physical mobile/Urdu-keyboard checks remain distinct from the automated accessibility evidence. T09 stays In Progress; T10's final release acceptance is not inferred from this documentation subset. Public hosting additionally needs trusted gateway/distributed abuse limits and an enforceable budget cutoff; the current limiter is per instance.

No paid inference was performed in this review. The prior US$3 authorization retains US$1.615455 in conservative reservations and at most US$1.384545 remaining; documentation changes do not reset that ledger. Fresh dependency audits found zero runtime vulnerabilities and 16 high development-tool findings rooted in the existing picomatch advisory. No dependency version changed.

## Fresh verification

Local macOS, Node 22.23.2/npm 10.9.8; selected `/opt/homebrew/opt/node@22/bin` in PATH. All results below are this session's checks unless explicitly labeled prior evidence.

| Check | Result |
|---|---|
| `npm test` | Exit 0; 500/500 tests across 14 files |
| `npm run lint` / `npm run typecheck` | Exit 0; generated route definitions checked |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | Exit 0; `/` and `/api/coach` built |
| `COACH_PROVIDER=fixtures OPENAI_API_KEY= OPENAI_MODEL= npm run test:e2e` | Exit 0; 10/10 Chromium/WebKit production-shell checks |
| `npm run test:presentational` | Exit 0; 10/10 bilingual layout/accessibility checks |
| `npm run test:journeys` | Exit 0; 78/78 real-network fixture-backed conversation/safety/lifecycle checks |
| `npm run eval:release` | Exit 0; no-network dry-run, 41 cases/83 attempts for one unselected candidate; 273 maximum provider calls planned, zero executed |
| `npm audit --omit=dev --json` | Exit 0; zero runtime findings |
| `npm audit --json` | Exit 1; 16 high development-tool findings retained as a limitation |
| Built-client scan | 20 JavaScript files; no configured-key or selected server/provider-marker matches |
| `git ls-remote origin refs/heads/main` | Exit 0; remote matches input SHA `8baf9e4` |
| `git diff --check` | Exit 0 |

Browser suites ran sequentially after build and made no paid calls. Initial sandbox attempts could not bind localhost (`EPERM`) or resolve GitHub; authorized executions outside that sandbox passed. Browser binaries were already installed. No hosted CI or new human review is claimed.

An isolated **fresh local Git clone** of the input revision, with the three reviewed README/environment/Playwright files overlaid, installed 450 packages via `npm ci --offline --no-audit --no-fund`. It had no copied credentials, dependencies or build output. It passed lint, generated-route typecheck, all 500 tests and production build. With `.env.example` copied to `.env.local`, the documented development command started on `127.0.0.1:3000`; a real Chromium smoke check verified the demo disclosure, English fixture clarification, Urdu authored emergency reply and reload clearing history (two API requests, zero model calls). This verifies setup using the local npm cache, not an uncached remote clone or a paid live-model browser session.

Next work is the existing T09 ambiguity/content repair and targeted live/native/safeguarding review. The current brief requires only the repository link and README for delivery; sending an email or adding a video is outside this request.
