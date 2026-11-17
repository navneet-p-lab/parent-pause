# Repository and two-minute submission plan

This document is the delivery plan. T00 now supplies a static bootstrap app; the full coaching app, published GitHub repository and video remain later execution deliverables. See the [current reviewer handoff](10-reviewer-handoff.md).

## Repository handoff

This folder is now an independent Git repository; verify root, history and remotes before publishing it. Inspect the source manifest and exclude environment secrets and generated/local files. Original SongRise nesting references are historical. Owner/name/visibility remain delivery decisions after the implementation is ready; a local commit does not publish a repository.

Future README should contain: one-sentence product purpose, prerequisites and pinned Node version, `npm ci`, `.env.local` setup from `.env.example`, `npm run dev`, app URL, all test commands, explicit live-vs-fixture mode, no-storage behavior, provider data disclosure, safety limits, architectural tradeoffs and planning/agent-log links. No actual secret value in examples.

Expected environment names: `OPENAI_API_KEY`, `OPENAI_MODEL`, `COACH_PROVIDER=live|fixtures`, configured allowed origin. Implement exact validation and document all defaults. Fixture mode is only for local/test use; fail closed if enabled on a live deployment.

Verify in a clean checkout with no parent workspace dependencies. Run deterministic checks, then a live everyday case, Urdu case and crisis case. Inspect browser network and server logs for sensitive content/secret exposure. No deployment is needed by the quoted assignment unless the owner wants one.

## Two-minute walkthrough storyboard

| Time | Show | Say / demonstrate |
|---|---|---|
| 0:00–0:12 | Main page | “ParentPause gives parents a brief plan in English or Urdu. No login or database.” |
| 0:12–0:40 | Everyday input: “My 6-year-old argues when playtime ends at bedtime.” | Send live; point out short actions and the single check-in. Enter one follow-up to show context. |
| 0:40–1:00 | Urdu toggle + Urdu example | Show actual RTL layout, translated labels, readable Urdu and mixed digits. |
| 1:00–1:27 | New conversation; crisis: “My child says they are going to hurt themselves right now.” | Show the authored escalation, explicit limit and immediate human-help direction. Explain that no routine plan or delayed check-in is offered. |
| 1:27–1:43 | Narrow viewport and new conversation | Show mobile layout and history clearing. Mention page-memory-only history and external model processing. |
| 1:43–2:00 | Repo README and test summary | Point to setup, safety tests/live eval evidence, and AI work log. Mention no service is monitoring the chat. |

Use synthetic examples only. Record the real implementation, not this prototype. Confirm video audio and readability; hide API keys, browser personal tabs and terminal secrets. If editing out long waits, disclose the cut rather than implying better latency. Captions are helpful. The crisis demonstration must use the implemented safety pipeline, not a hard-coded demo switch masquerading as a model result.

## Final email contents

The final delivery task inserts real links to the GitHub repository and the approximately two-minute Loom or equivalent recording. Add one short sentence on the no-login English/Urdu scope and any material limitation. Do not send placeholders as completed deliverables. Sending the email itself requires the owner's explicit instruction.

## Pilot readiness, beyond the assessment

1. Confirm traffic, target regions, budget and support owner.
2. Independent safeguarding review and native Urdu evaluation, including adversarial and indirect risk cases.
3. Explicitly selected regional resources with source, last-verified date, refresh owner and graceful unavailable behavior.
4. Shared rate limiting or gateway controls, real spend circuit breaker, request quotas and incident monitoring without content logs.
5. Provider-retention review and user-facing privacy details; no “completely private” promise.
6. Accessibility/device testing, measured latency/error rates, controlled rollout and a rollback switch.
7. Add persistent history or reminders only after separate consent, retention/deletion and delivery design.
