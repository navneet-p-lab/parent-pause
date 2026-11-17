# T07 — Connect composer and conversation lifecycle

Status: In Review — bilingual conversation, composer and memory-only lifecycle connected to T06. See [verification](../evidence/t07-conversation.md) and [T08 handoff](../contracts-t07-v1.md). Actual commit acceptance belongs to Git/native history. Comprehensive browser journeys and live/native/human gates remain T08/T09.

- Dependencies: T02, T03 and T06
- Suggested executor: Small coding model
- Rough effort: 90–150 minutes; planning estimate, not a deadline.
- Writable ownership: `src/components/composer.tsx, src/components/coach-shell.tsx, src/lib/client/conversation-reducer.ts, src/lib/client/coach-client.ts, src/app/page.tsx, src/test/unit/conversation-reducer.test.ts, src/test/components/composer.test.tsx`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Implement memory-only transcript and draft state. Topic chips populate but never send. Show reply language. Send using the contract; keep draft until success, retain on errors, avoid duplicate pending turns on retry. Add AbortController/request identity checks, clear confirmation, context limit handling and stale-response suppression. Use natural document flow on mobile. No browser persistence or provider key.

## Acceptance and tests

Test Enter newline, Ctrl/Cmd+Enter send outside IME composition, empty/overlong validation, loading/cancel/retry, clear during an in-flight request, locale switch during request, prior response direction, max-turn notice and reload reset. Switching locale must not rewrite historical content. Emergency notice stays reachable on all states.

## Handoff

Confirm integration with real endpoint using fake provider. No generated raw text/HTML rendering.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
