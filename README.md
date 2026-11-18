# ParentPause

A small Next.js parenting coach for concerns written in English, Urdu or Roman Urdu. Choose English or Urdu replies and receive a brief acknowledgment, one to three practical steps, and one follow-up question. Conversation history stays in your browser on your device; no login or database is required.

[GitHub repository](https://github.com/navneet-p-lab/parent-pause)

## Run locally

Requires **Node 22.12+ within the Node 22 release line** and npm 10. `.nvmrc` pins the verified Node 22.23.2 runtime; with nvm, run `nvm install` and `nvm use`.

```bash
git clone https://github.com/navneet-p-lab/parent-pause.git
cd parent-pause
npm ci
cp .env.example .env.local
```

For **real AI coaching**, edit `.env.local`:

- Set `COACH_PROVIDER=openai`.
- Set `OPENAI_API_KEY` to your own API key.
- The default model is `gpt-6.1-terra` (Terra). `OPENAI_MODEL` can override it with another model available to your account that supports the Responses API and structured JSON output.
- Keep `APP_ORIGIN=http://127.0.0.1:3000`, matching the exact browser URL.

```bash
npm run dev
```

Open **http://127.0.0.1:3000**. Restart the server after changing configuration. Live replies incur provider charges; keys belong only in the ignored `.env.local` file.

For a **key-free preview**, leave the copied configuration unchanged (`COACH_PROVIDER=fixtures`). It displays “Demo responses — no AI call” and returns deterministic clarifications, rather than LLM coaching. Explicit emergency examples still use authored safety responses. Use development mode for this preview.

For a production build, configure live mode first, then run `npm run build` and `npm run start`. Production startup rejects fixture mode. Both servers bind to loopback by default.

## Using the app

- Choose the reply language, type a concern, and select **Find a next step**. Urdu replies use right-to-left layout; earlier messages keep their original language.
- Enter adds a newline; Ctrl/Command+Enter sends. Topic suggestions fill the draft without sending.
- Sending immediately adds your message to the thread and clears the composer. A reply placeholder and changing waiting hints appear while the response is prepared. Cancel or failure restores your submitted text for retry.
- Request a recap by typing or selecting **Summarize so far**. It consolidates earlier advice, acknowledges thanks and ends without another question. The control is disabled while you have an unfinished draft; summaries count toward the conversation limit.
- Reply to the check-in to continue. A clear thank-you or satisfaction closes the conversation warmly with no further question. An uncertain request for a break can offer a pause instead. You can send updates in the same thread.
- **New conversation** asks before moving the current chat and draft to **History**. Open an older conversation to read or continue it; each keeps its own context and draft. Chats survive reloads and reopening in the same browser on this device. History is not synced between devices or browsers.
- Delete an earlier conversation in **History**, or choose **Clear saved conversations** to remove all saved chats and drafts, including the current chat. Both ask for confirmation. Browser site-data deletion also removes history. If storage is blocked/full, the app keeps working in page memory and explains that changes may not survive reloads.
- Each concern allows 2,000 Unicode characters. After eight coach replies, start a new conversation. No reminders are scheduled.

## Safety and privacy

The server classifies the full conversation, validates structured output, and reviews generated replies before displaying them. Routine English plans are capped at 120 words; Urdu replies have per-field length limits. Medical/legal requests receive an authored professional boundary. Emergencies, abuse and self-harm use authored escalation responses; detected explicit emergencies bypass the model. Unknown classification or failed output review cannot become ordinary coaching. Guidance refers to local help without guessing a country or inventing phone numbers.

Chats and drafts use browser `localStorage`, with no app database, account, server-side conversation history or conversation logging. They remain accessible to people using the same browser profile until deleted, and are not encrypted by the app. Live requests send only the active conversation to OpenAI with `store: false`; provider retention policies may still apply. Avoid identifying details. This assessment demo does not provide diagnosis, medical/legal instructions, or emergency care.

The [funded live evaluation](planning/evidence/t09-model-comparison-2026-11-18.md) found blocked ambiguous-distress clarifications and unnecessary crisis framing in one routine response. Terra is now the owner-selected default; those findings and native Urdu/human safety reviews remain open. See the [requirement review](planning/evidence/final-overview.md) for evidence and remaining gates.

## Video walkthrough

[Copy-ready showcase scenarios](planning/video-scenarios.md) cover English coaching, follow-ups, summaries, thanks, Urdu, saved history and emergency guidance, with a suggested two-minute sequence. These are recording plans, not a completed video or live rehearsal.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install --only-shell chromium webkit
npm run test:e2e
npm run test:presentational
npm run test:journeys
```

Run browser suites sequentially; keep ports 3210–3212 free. They exercise Chromium/WebKit, English/Urdu, responsive layouts, accessibility and conversation/safety/failure paths without paid model calls. Linux CI uses `npx playwright install --with-deps --only-shell chromium webkit`. `npm run eval:release` is a no-network dry-run by default; paid evaluation requires explicit candidates, rates and a spend cap. See [testing and evaluation](planning/06-testing.md).

Public hosting needs trusted gateway/distributed abuse limits and an enforceable spend cutoff; current rate limits are per instance. The [technical review](planning/evidence/release-review.md) records a development-tool dependency advisory; runtime and full dependency audits are reported separately.

Implementation: [UI and conversation](src/components/coach-shell.tsx) → [API handler](src/lib/server/coach-handler.ts) → [safety orchestration](src/lib/server/coach-service.ts) → [server-only provider](src/lib/server/provider.ts). [Design decisions](planning/04-decisions.md) · [AI work log](planning/07-agent-log.md) · [reviewer handoff](planning/10-reviewer-handoff.md).
