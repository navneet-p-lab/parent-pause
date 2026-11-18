# Direct closing and chat design refinement

Owner correction,18November2026: clear thanks should close directly; use a left/right chat layout, polish the simple visual design, add priming copy and remove the assessment-demo sentence. The interrupted turn applied source/style changes; the owner's subsequent “continue” resumed verification and completion. Independent root/main `fc15ac5`; earlier uncommitted changes preserved. Primary Codex, self-review, no subagents.

## Behavior

Added explicit close intent and narrowly anchored whole-message courtesy recognition for common English/Urdu/Roman Urdu acknowledgments. This handles the reported short thanks after an ordinary reply or nonurgent professional boundary even when the classifier carries medical_legal/continue forward from history. Closure is an exact authored question-free message; it goes through the existing full-context review before display. It does not say a professional concern is resolved. No extra pause confirmation or repeated professional boundary on that path.

Urgent/abuse/self-harm/unclear classification, known risk floors and generated-candidate reassessment of resolution claims still outrank closure. Review block/outage/escalation handling remains. Thanks followed by another concern/question does not match the courtesy helper. An uncertain request for a break retains the optional pause offer; updates after closing resume normal coaching. Current revisions: contract`t01-v3`, classifier`t04-classify-v3`, reviewer`t04-review-v3`, safety`t06-safety-v4`. Terra, provider limits and memory-only history are unchanged. See the superseding [conversation amendment](../contracts-conversation-v2.md).

## Presentation

Coach messages align left, parent bubbles right, with separate surfaces, softer borders/radii/shadows, smaller response headings and a compact composer. Message placement remains consistent across UI locales while each message retains correct internal language/direction. Added a pause-mark wordmark treatment, segmented language controls and topic icons using local CSS/SVG, without new assets/dependencies/network requests. Priming explains what to share and gives a concrete input example. The welcome panel becomes a compact conversation heading after send. Removed the live assessment-demo sentence; key-free fixtures still disclose that responses are not AI-generated. Existing emergency/provider/privacy notices remain.

## Fresh verification

macOS Node22.23.2/npm10.9.8 via task-local PATH. `npm run typecheck`, `npm test` **551/551 across17files**, `npm run lint`, and `NEXT_TELEMETRY_DISABLED=1 npm run build`: exit0. Initial component checks correctly failed on the old assessment-sentence requirement; expectations were updated to verify removal and welcome priming. Earlier optional-break tests now use an uncertain break request, rather than asserting obsolete pause-offer behavior for thanks.

Sequential after build: `npm run test:e2e` **10/10**, `npm run test:presentational` **10/10**, `npm run test:journeys` **88/88**, all exit0, **108/108 aggregate** across Chromium/WebKit. New direct-closing journeys exercise actual handler/service/policy with a classifier intentionally retaining medical_legal/continue; assert no repeated boundary/no question/no pause button, actual left/right positions, axe zero violations and no horizontal overflow. Existing failure/risk/placeholder/cancel/retry/stale/clear/reload/locale/limit suites pass, including text scaling/spacing.

All browser replies use controlled key-free fixture sessions, not paid inference or mocked final browser responses. Additional API cases cover courtesy forms/typo, new-help exclusions, both locales, direct medical-context closure, block/escalation and all explicit risk floors. This pass makes no live semantic-quality/native/human-release claim; prior evaluations use older revisions and their cost/manual-traffic uncertainty remains.

Font-ready screenshots saved locally by the new journeys under ignored `test-results/journeys`: welcome/chat English and Urdu in Chromium/WebKit. Primary visually inspected Chromium desktop welcome/chat and WebKit390px Urdu chat: legible layout, visible speaker separation, localized closing without a question. These synthetic fixture screenshots are not owner conversation records. Static inspection is not native-reader or physical-device approval.

Stopped only the recorded session dev process after verifying its command identity, then restarted a detached loopback server after browser verification. GET `http://127.0.0.1:3000` returns200. Local live configuration remains Terra; no extra paid request, deployment, commit or push. App remains running for owner manual testing; release/human gates stay pending.
