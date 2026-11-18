# Conversation UX amendment — v2

Superseding owner amendment, 18 November: recap requests, including thanks/uncertainty and spelling mistakes, use intent `summarize` and a generated/reviewed `summary` response. Its strict fields are kind, locale, acknowledgment (180 code points), and steps (one to five distinct items of 180 code points each); it has no checkIn or questions and an English total of at most 120 words. Existing safe advice is consolidated without new recommendations or endorsement of unsafe assistant history. Relevant professional-help guidance can be retained without restating a generic refusal. The latest request's purpose takes precedence over courtesy-only closure. A narrow whole-message EN/UR/Roman Urdu recap recognizer repairs routine/medical-topic carryover only after classification; unclear/current risk and known risk floors still outrank it. Classification and independent review remain required, with the normal three-call path and unchanged deadlines/failure behavior. Prior-risk resolution still requires the existing generated-plan/clarification reassessment before a floor is released.

Plan steps now allow one to three items so follow-ups do not need filler. Initial plans normally offer two or three; follow-ups focus on a useful next change and one missing detail without repeating answered questions or earlier suggestions. The summary and paused shapes are explicit exceptions to the one-question rule. A summary is displayed as a localized numbered recap, can be requested by typing or “Summarize so far”, persists with existing history, and can be followed by updates. The control does not replace an unfinished draft, is absent while pending/failed/limited or directly after a summary/escalation, and uses the existing client/API/safety path. It counts toward the existing eight-exchange limit. Existing history stays valid; duplicate rejection applies only to the new summary shape, not historical plans.

Revisions: contract `t01-v4`, classifier `t04-classify-v4`, coaching `t05-coach-v3`, reviewer `t04-review-v4`, safety `t06-safety-v5`, provider `t05-provider-v3`. No paid evaluation or new release approval is implied. See [verification](evidence/conversation-understanding-2026-11-18.md).

Latest owner correction,18November: implement a History tab for older conversations; owner explicitly selected **Keep on this device** after clarification, authorizing browser localStorage persistence across reload/reopen with no database/account. This supersedes earlier page-memory/no-browser-storage requirements. New conversation archives current context/draft; opening history restores it, deletion is confirmed, and clear-all removes saved/current chats. Provider/safety routing and release gates remain unchanged. See [history evidence](evidence/conversation-history-2026-11-18.md).

Superseding owner amendment,18November: a conclusive thank-you/satisfaction now closes directly instead of asking to pause. Added intent `close` (contract`t01-v3`, classifier`t04-classify-v3`, reviewer`t04-review-v3`, policy`t06-safety-v4`). Short whole-message acknowledgments in English/Urdu/Roman Urdu can select this reviewed closing after an ordinary reply or nonurgent professional boundary, even if classification retains medical_legal/continue from history. Risk/ambiguity still outrank closure; review must allow the exact authored message. An uncertain break request can retain an optional pause offer. Current UI uses coach-left/parent-right bubbles, priming copy, a compact composer and no live assessment-demo sentence. The v2 description below is historical where its satisfaction behavior differs.

Owner direction,18November2026: improve waiting feedback, clear submitted input, immediately echo it in the thread, offer a pause after satisfaction, close without a question on confirmation, and use Terra by default. This explicitly amends T01/T04–T07 contracts and the previous exactly-one-question rule for a confirmed pause only. Earlier contracts remain dated handoffs.

## Response and classification

Existing response families retain their fields/limits. Added strict response families:

- `pause_offer`: kind, locale, acknowledgment (180code points), and one question-shaped checkIn (180code points).
- `paused`: kind, locale, message (240code points); no checkIn or other fields. Authored copy invites updates while the page stays open and warns that reload clears the chat.

Live classification wire format requires the existing six-way category and intent (`continue`, `offer_pause`, `confirm_pause`). Application parsing treats absent intent as pre-existing continue behavior for historical/injected fixtures. Unknown intents fail validation. Factual answers, a bare yes to an ordinary check-in, negated satisfaction and new help requests continue; satisfaction/readiness to stop in a routine follow-up can offer pause; clear consent immediately after a pause offer can confirm it.

Risk takes precedence over intent. Pausing never suppresses explicit/unresolved risk, medical/legal boundaries or ambiguity. A known prior-risk floor cannot be released through authored closure, including after a resolution claim. Full classification and independent review are required for both pause kinds. Review block/outage is unavailable; escalation returns existing authored risk guidance. Updates after a paused turn resume coaching with full history.

Pause routes use2provider calls: classify, then review the exact authored candidate. Routine routes retain classify/generate/review. The adapter permits this generation skip only for pause candidates and forbids operations after review, repeated review, and skipping generation for a normal plan. Deadlines/output bounds/no-retry behavior remain. No client safety/pause flag is trusted.

Revisions: contract`t01-v2`, classifier`t04-classify-v2`, reviewer`t04-review-v2`, provider`t05-provider-v2`, safety`t06-safety-v3`. Coaching generation remains`t05-coach-v2` from the earlier compound-question repair. Evaluation parsing supports the added route kinds without changing corpora or relabeling old observations. Prior evaluations do not establish acceptance of these revisions.

## Page behavior

Sending snapshots pending input, empties the composer and renders its user message immediately in chronological history. Pending and accepted history stay separate. Cancel/failure/locale invalidation restores the exact submitted draft; success appends user/coach once. Existing stale-request/clear/correlation protections remain. The latest submitted message scrolls into view without animated scrolling.

Waiting displays a reply-shaped placeholder with several decorative lines and a check-in-shaped block. Friendly hints rotate every3seconds; they are not measured pipeline progress. Existing live-region waiting announcement occurs once; rotating/decorative content is hidden from assistive technology. Skeleton animation respects reduced motion; its timer stops when waiting ends.

The latest accepted pause offer shows optional Pause here/Keep talking controls. They submit ordinary parent text through the existing client/server/safety path; typed confirmation works through classification too. Paused has no follow-up question; the composer invites updates and remains available. Historical locales are preserved. Chat remains memory-only with the existing short-thread limit: no durable history, scheduled check-up, notification or monitoring promise.

## Model configuration

Terra (`gpt-6.1-terra`) is owner-selected default for missing/blank OPENAI_MODEL, the example configuration and ignored local settings. Explicit overrides remain supported; live-provider selection and a key are required. Restart after configuration changes. This selection does not grant release/native/safeguarding approval or renew the paid-evaluation allowance. Remaining paid budget needs reconciliation before new evaluation; deterministic verification uses no paid inference.
