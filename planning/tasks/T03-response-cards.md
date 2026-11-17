# T03 — Render structured response families

Status: In Review — implemented from accepted T01 `47728e2` in an isolated worktree, technically reviewed and validated on 18 November 2026. See [parallel implementation and verification](../evidence/t02-t04-parallel.md). Git/native tracker records actual commit acceptance. Native Urdu and human safeguarding release gates remain pending.

- Dependencies: T01 (including shared token-name/props agreement; T02 CSS implementation can run in parallel)
- Suggested executor: Small coding model
- Rough effort: 60–90 minutes; planning estimate, not a deadline.
- Writable ownership: `src/components/conversation.tsx, src/components/coach-response.tsx, associated CSS Modules, src/test/components/coach-response.test.tsx`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Implement chronological user and assistant sections, concise plan/check-in cards, clarification, professional boundary and visually distinct safety escalation. Render plain text only. Parent messages use automatic direction; each response preserves its own locale. Reuse typed fixtures. Include loading/error presentation via explicit props; do not call APIs or own the composer.

## Acceptance and tests

Test every response family in both locales, role labels, exactly one check-in, absence of routine-plan actions in escalation, no HTML execution for hostile strings, per-message direction after UI language switch, and one-time accessible announcement behavior. Test long Urdu text and mixed digits.

## Handoff

Provide a prop-driven renderer. Avoid a duplicate response parser; use T01.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
