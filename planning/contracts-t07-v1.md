# T07 conversation handoff

Input `7003017`; wire contract remains `t01-v1`. T07 connects the bilingual page to T06. See [plan](evidence/t07-conversation-plan.md) and [verification](evidence/t07-conversation.md).

## Lifecycle and client behavior

The reducer keeps accepted parent/coach pairs separate from the draft and one pending request snapshot. Displaying a pending parent does not commit it to history. Only a schema/locale/correlation-valid success commits the pair and clears the draft. Failures/cancel retain unsent text; retry creates a new UUID from accepted history and one parent draft, never duplicating failed turns. Draft editing is read-only while sending. No browser storage/cookies/accounts/history API are used for chat.

The shell synchronously invalidates/aborts active work on cancel, confirmed clear, locale change or unmount. It checks controller identity as well as UUID/reducer state before accepting success or error; even an ignored-abort authored emergency cannot append stale turns. Locale switching retains draft and historical content, cancels current work and requires explicit resend in the new language. Each historical coach card keeps its original lang/dir.

Eight successful exchanges are allowed: the final request has 15 entries and the accepted transcript has 16. The composer then explains the limit and requires explicit new conversation; no history is silently dropped. Inline validation uses Unicode code points and preserves all text. Topic chips only populate/focus the draft. Enter adds newline; Ctrl/Command+Enter sends outside IME/composition/key229. Clear is an inline nonmodal confirmation group with focused Keep/Confirm controls. Emergency guidance remains reachable in every state.

`sendCoach(request, signal, fetcher?)` sends same-origin JSON to `/api/coach`, with no-store cache mode and no redirects. It enforces byte bounds before sending and while consuming JSON replies, validates schemas/status/request UUID/locale and the public retry flag. Null pre-body error correlation is allowed; another non-null UUID is rejected. A 25-second client deadline bounds ignored-signal fetch/body work; abort cancels upstream and response readers. Rejected/non-JSON/oversize/proxy/error output never appears in UI or logs. The caller sees fixed `CoachClientError.failure` only. T06's stricter 20-second server deadline remains in force.

Valid sends focus the textarea before disabling the clicked Send button; Cancel focuses it before removing the clicked control. Completion restores focus only if still in the composer, preserving deliberate focus changes. Focus uses preventScroll; no forced transcript scrolling. Conversation supplies one loading/result/error event and clears stale alert content/role when the event clears. Crisis results announce the emergency heading assertively; history rerenders/locale changes do not reannounce old replies.

## Configuration and copy

The server-rendered page is dynamic so it can pass an accurate, nonsecret fixture flag. No key/model/provider configuration is serialized to the browser. Assessment/privacy copy now describes connected behavior. Live replies may send messages to OpenAI and provider retention applies; page memory is not a zero-retention promise. Test/development fixture mode displays a prominent no-AI-call disclosure and explains local server processing. T06 fixture replies independently carry that disclosure. Production fixture startup remains prohibited.

Local fixture run: set `COACH_PROVIDER=fixtures`, exact matching `APP_ORIGIN`, then `npm run dev`; Node environment must be development/test. No key is needed. The default fixture returns labeled clarifications, not semantic safety judgments or useful-plan quality evidence. Explicit risks still route through authored policy. No paid calls occurred during T07.

## T08 next

T07 includes reducer/client/component behavior and real POST/service/fixture round-trips, plus two-browser actual fixture smoke. Existing production/page and fixture-host presentation suites are updated/preserved. T08 must turn the broader ordinary-plan/boundary/crisis/failure/race matrix into maintained real-route browser journeys, add controlled server fixtures as needed, and cover keyboard/mobile/zoom/focus/announcement behavior comprehensively. Keep fixture runtime in development/test; do not weaken T06's production guard just to run E2E. Avoid concurrently running Playwright configurations sharing output directories.

Physical mobile-keyboard, real assistive technology, native Urdu/safeguarding and full-pipeline live quality/model selection remain gates. AI-authored Urdu copy and automated axe/browser checks do not establish those approvals. The existing instance/gateway/spend limitations remain in the T06 handoff.
