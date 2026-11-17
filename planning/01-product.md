# Product scope

## Outcome

Help a parent choose one manageable next action without judgment. The first screen should explain the service and accept a concern immediately. A response is useful when it is understandable in one read, specific to the concern, and easy to try today.

## V1 journey

1. Open `/`, choose English or اردو (persistent only for the current page).
2. Enter up to 2,000 Unicode code points. Optional topic chips fill an editable example; they do not send it. No child name, age, contact details, account or questionnaire is required.
3. Select “Make a small plan.” Keep the draft while pending; disable duplicate submission. Enter inserts a newline; Ctrl/Cmd+Enter sends when not composing with an IME.
4. Append the parent message and a validated response to the chronological conversation. Everyday responses contain one acknowledging sentence, 2–3 short actions, and exactly one question as a check-in. A question satisfies the assignment without implying a scheduled reminder.
5. The parent can reply in the same composer. “New conversation” clears in-memory history after a lightweight confirmation if there is content. Reload clears it too.
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

No login, database, reminders, push/email notifications, payment, voice, file uploads, child profiles, content search, tool use, external actions or durable history. No clinical claim, diagnosis or medical/legal procedure. The coach is not a monitored crisis service and cannot contact anyone for the parent.

## Demo success criteria

- A fresh clone can run using documented commands and an operator-owned API key; offline fixture mode is clearly labeled.
- One everyday English concern receives the complete structure; a follow-up uses prior context.
- One Urdu concern produces natural Urdu in an RTL interface; mixed-script input remains legible.
- Emergency, abuse and self-harm examples escalate, including Urdu/Roman Urdu variants and indirect wording.
- Clear/reload removes the browser conversation; input and output are absent from application logs.
- At 320, 390, 768 and 1440 CSS pixels, every action remains reachable with no horizontal page scrolling.
- Test/evaluation results and remaining limitations are documented honestly.

## Follow-on stages (not part of demo)

Before a small public pilot: choose hosting and budget, add gateway rate limits and a real spend cutoff, audit provider retention, get safeguarding and native Urdu review, verify regional resource sources and operational ownership. Define a privacy and incident process before collecting feedback with personal content.

Only if users demonstrate a need: offer explicit opt-in saved conversations with authentication, consent, retention and deletion. Add scheduled check-ins only after designing delivery, opt-out and the limits of an unmonitored service. Do not add a database merely to make the demo look production-ready.
