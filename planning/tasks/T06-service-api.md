# T06 — Wire server policy and bounded endpoint

Status: To Do — not started; execution is blocked until the dependencies below are accepted and committed.

- Dependencies: T04 and T05
- Suggested executor: Small coding model + lead safety integration review
- Rough effort: 90–150 minutes; planning estimate, not a deadline.
- Writable ownership: `src/lib/server/coach-service.ts, src/lib/server/request-limits.ts, src/app/api/coach/route.ts, src/test/api/coach-route.test.ts`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Implement validation → explicit-risk path → semantic classifier → generation → review → final validation. Route all known-risk failures to authored escalation. Put body bounds, origin/content-type checks, no-store, timeout and instance-scoped limits at transport boundary. Reject invalid requests before paid calls. Do not add a database. Document in-memory limiter limits and public-hosting requirements.

## Acceptance and tests

Integration tests cover 400/413/429/503, secret-safe errors, no-store, prior-turn risk, injection, classification failure, unsafe output blocked, review failure, malformed output, cancellation and zero provider calls for explicit emergencies. A denied/unknown classifier result can never default to routine. Assert review receives the candidate and relevant input.

## Handoff

Publish service/route examples and error mappings. No contract change without lead approval.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
