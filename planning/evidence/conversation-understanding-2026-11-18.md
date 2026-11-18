# Conversation understanding and summaries — 18 November 2026

Owner reported poor conversational transitions, a missed thank-you/recap request and repetitive suggestions. Primary Codex, one agent, self-review only. Independent repository root and main at `fc15ac5` verified before editing; all earlier uncommitted troubleshooting, chat and device-local history work preserved. Read session directive/reviewer handoff, conversation amendment and T09 context; inspected existing T09 including closed-item search, work radar and linked current session. No tracker comment/body posting, commit, push or deployment.

## Finding and repair

Source had no recap response shape/intent. A non-whole-message thanks did not match the narrow courtesy helper, and medical_legal classification returned a generic authored boundary before generation. A controlled classifier retaining that historical topic reproduces the screenshot's route. This establishes a routing gap, not recovery of the original provider's private classification trace.

Added intent `summarize`, a generated `summary` response with acknowledgment and one to five distinct recap items, and no question/checkIn. English total remains bounded at 120 words; each field at 180 code points. Whole-message EN/UR/Roman Urdu recap recognition includes mixed uncertainty/gratitude and the reported wording/typos without matching appended medical requests/instructions. Semantic classification covers other paraphrases. Recap takes precedence over closing on routine/nonurgent medical context and still requires classify → generate → full-context independent review. Explicit risk, unclear classification and prior-risk-resolution reassessment retain existing precedence/fallbacks; review blocks/outages never become accepted advice.

Generation/review distinguish the latest task from historical health context. Recaps consolidate safe earlier advice, acknowledge thanks, retain relevant professional-help guidance and urgency, omit superseded/unsafe advice, and add no new recommendations. Review cannot treat assistant history as safe evidence. No broad semantic keyword bypass, model/configuration/rate/deadline/retry changes or browser-side approval added.

Localized “Summarize so far” uses the ordinary client/API path, keeps full active context, and renders a numbered recap without another question. It is disabled for an unfinished draft, unavailable while pending/failed/limited or directly after recap/escalation, and counts toward the existing exchange limit. Recaps persist through the existing versioned storage and support later updates. Thanks-only handling additionally accepts an unknown-answer preface and “all the advice so far”; a mixed recap is answered instead of prematurely closing.

Plan cardinality now permits one to three steps, normally two or three initially but one useful next change on follow-ups. Generation/review explicitly connect to the latest answer, accept unknown answers, avoid repeating suggestions in different words, do not re-ask answered questions, and allow necessary safety reminders. Exact duplicate rejection applies only to new summaries; previous plan history stays valid. Semantic repetition and naturalness still depend on live model output and review, and are not guaranteed by schema checks.

Revisions: contract `t01-v4`, classifier `t04-classify-v4`, coaching `t05-coach-v3`, reviewer `t04-review-v4`, policy `t06-safety-v5`, provider `t05-provider-v3`. Earlier paid comparison observations apply to older revisions. No new paid inference; prior diagnostic/manual traffic and spend uncertainty remain unreconciled. Native Urdu, human safeguarding, live usefulness and remaining release gates stay pending; T09 remains In Progress.

## Verification

macOS, Node 22.23.2/npm 10.9.8 via task-local `PATH=/opt/homebrew/opt/node@22/bin:$PATH`:

- `npm run typecheck`: exit 0.
- `npm test`: exit 0, **602/602 across 20 files**.
- `npm run lint`: exit 0.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: exit 0.
- After build, sequential `npm run test:e2e`: **10/10**, exit 0; `npm run test:presentational`: **10/10**, exit 0.

New deterministic/API coverage checks the mixed English wording and Urdu/Roman Urdu recap forms, historical medical-topic carryover, summary-over-close intent, semantic recap intent, first-turn ambiguity, ordinary medical requests, full pipeline history propagation, locale preservation, strict recap size/uniqueness/question limits, review block/outage/escalation, wrong-kind candidates and all explicit risk floors/resolution claims. Component coverage verifies draft protection, question-free EN/UR rendering, button submission and resumed full context.

Initial typecheck exposed missing new response labels in renderer test fixtures and a checkIn-only test union; updated both. Initial suite failures exposed obsolete minimum-two-step rejection cases and duplicate validation that would reject older plans; changed malformed examples to empty steps and restricted duplicate rejection to summaries, preserving historical plan parsing. Corrected suite passes above.

Sandboxed browser server startup returned bind EPERM; authorized host execution passed shell/presentation. Journey startup then correctly refused the existing local Next dev lock. Verified recorded launcher/child process identities and repository cwd before stopping only those processes; journey suite then started with its isolated key-free fixture host. Browser verification is actual network/handler/service/policy with injected sessions, not paid inference or mocked final browser responses.

Final `npm run test:journeys`: **102/102**, exit 0 in 1.9 minutes; **122/122 aggregate** Chromium/WebKit browser checks. New EN/UR typed/button recap journeys cover historical-topic carryover, no repeated boundary/early closing/question, two distinct recap items, axe zero violations, no horizontal overflow (English desktop/Urdu 390px), device-local reload restoration and resumed full-context coaching. Existing risk, failures, pause, cancellation, history, accessibility and context-limit journeys pass.

Portable-file scan: 70 changed/new files, zero exact configured-key matches; nine current README/planning/evidence documents checked with zero missing local link targets; `git diff --check` exit 0. These scans do not establish release/native/human acceptance. App restart/health verification recorded in the work log.
