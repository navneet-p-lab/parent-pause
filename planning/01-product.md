# Product scope

Latest owner amendment, 18 November: mixed uncertainty/thanks plus a recap request must receive a concise summary of prior advice rather than repeat a medical/legal boundary or close early. Added reviewed question-free summaries and a localized “Summarize so far” control. Follow-up plans may contain one useful step (one to three total), with generation/review instructions to adapt advice, accept unknown answers and avoid repeated suggestions/questions. Urgent-risk precedence, independent review, Terra and device-local history remain. See [conversation-understanding evidence](evidence/conversation-understanding-2026-11-18.md). Earlier exactly-one-question and two-to-three-step requirements are superseded for these response shapes.


Latest owner correction,18November: implement a History tab for older conversations; owner explicitly selected **Keep on this device** after clarification, authorizing browser localStorage persistence across reload/reopen with no database/account. This supersedes earlier page-memory/no-browser-storage requirements. New conversation archives current context/draft; opening history restores it, deletion is confirmed, and clear-all removes saved/current chats. Provider/safety routing and release gates remain unchanged. See [history evidence](evidence/conversation-history-2026-11-18.md).

Owner amendment,18November: implement the [conversation v2 UX](contracts-conversation-v2.md): immediate message echo and composer clearing, multiple waiting placeholders, optional pause after satisfaction and a question-free closing after confirmation, with Terra as default. The same open-page thread accepts later updates; reload still clears it. This is an explicit exception to the ordinary one-question response rule, not authorization for persistent history/reminders.

## Outcome

Help a parent choose one manageable next action without judgment. The first screen should explain the service and accept a concern immediately. A response is useful when it is understandable in one read, specific to the concern, and easy to try today.

## V1 journey

1. Open `/`, choose English or اردو (saved alongside conversations in this browser).
2. Enter up to 2,000 Unicode code points. Optional topic chips fill an editable example; they do not send it. No child name, age, contact details, account or questionnaire is required.
3. Select “Find a next step.” Echo the submitted message immediately and clear the composer; keep pending text separately for cancellation/retry and disable duplicate submission. Enter inserts a newline; Ctrl/Cmd+Enter sends when not composing with an IME.
4. Append the parent message and a validated response to the chronological conversation. Everyday responses contain one acknowledging sentence, 2–3 short actions, and exactly one question as a check-in. A question satisfies the assignment without implying a scheduled reminder.
5. The parent can reply in the same composer. “New conversation” archives the current context and draft after confirmation. History reopens older conversations, preserving their full context and draft. Browser localStorage restores chats after reload/reopen; confirmed delete or clear-all removes them.
6. Crisis replies show immediate-help guidance and one short safety check-in. They never tell the parent to come back tomorrow or wait for the coach.

## Response types

| Type | Visible result | Follow-up |
|---|---|---|
| Everyday | Acknowledgment + 2–3 steps | One practical question |
| Clarification | Acknowledgment + one question; no speculative plan | That question is the check-in |
| Medical/legal boundary | Brief limit + safe nonprofessional alternative or appropriate professional referral | One relevant question, no diagnosis/dose/legal steps |
| Safety escalation | Supportive limit + immediate support actions | One immediate safety question |
| Service unavailable | Honest error and persistent general emergency guidance | Manual retry, no fabricated coaching |

## Scope exclusions

No login, database, reminders, push/email notifications, payment, voice, file uploads, child profiles, content search, tool use, external actions or cross-device history. No clinical claim, diagnosis or medical/legal procedure. The coach is not a monitored crisis service and cannot contact anyone for the parent.

## Demo success criteria

- A fresh clone can run using documented commands and an operator-owned API key; offline fixture mode is clearly labeled.
- One everyday English concern receives the complete structure; a follow-up uses prior context.
- One Urdu concern produces natural Urdu in an RTL interface; mixed-script input remains legible.
- Emergency, abuse and self-harm examples escalate, including Urdu/Roman Urdu variants and indirect wording.
- Confirmed deletion removes the selected saved conversation; clear-all removes current and archived conversations; reload restores them; input and output are absent from application logs.
- At 320, 390, 768 and 1440 CSS pixels, every action remains reachable with no horizontal page scrolling.
- Test/evaluation results and remaining limitations are documented honestly.

## Follow-on stages (not part of demo)

Before a small public pilot: choose hosting and budget, add gateway rate limits and a real spend cutoff, audit provider retention, get safeguarding and native Urdu review, verify regional resource sources and operational ownership. Define a privacy and incident process before collecting feedback with personal content.

Only if users demonstrate a need: offer explicit opt-in saved conversations with authentication, consent, retention and deletion. Add scheduled check-ins only after designing delivery, opt-out and the limits of an unmonitored service. Do not add a database merely to make the demo look production-ready.
