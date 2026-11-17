# T05 — Implement model adapter and evaluation runner

Status: To Do — not started; execution is blocked until the dependencies below are accepted and committed.

- Dependencies: T01; T04 prompt contracts
- Suggested executor: Small coding model for adapter; lead for model decision
- Rough effort: 90–150 minutes plus evaluation; planning estimate, not a deadline.
- Writable ownership: `src/lib/server/provider.ts, src/lib/server/config.ts, src/lib/server/prompts/coach.ts, scripts/eval-coach.ts, src/test/api/provider.test.ts`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Use the official server SDK with Responses API, provider-compatible structured schemas, store:false, bounded output, a shared deadline and no hidden retry. Inject a fake provider for tests. Handle refusals, incomplete/empty output, parse errors, timeout and upstream errors without exposing raw output. Add an opt-in runner for the synthetic safety corpus and held-out cases. Provide configuration and runner support for comparing account-available candidate models. T05 completion requires the tested adapter and runnable evaluation harness; full-pipeline live evaluation and final model selection belong to T09 after T06 integration. Optional direct-provider smoke checks do not establish end-to-end safety.

## Acceptance and tests

No key or SDK in client bundle; no message content in logs. Fake tests cover all error types, call budget and cancellation. The runner must support a separate real-key run recording model/prompt revision, input/output tokens, latency, expected/actual routes and human scores; the actual full-pipeline run is a T09 release gate. Never claim fake-provider runs establish model quality.

## Handoff

If no API key or model access is available, complete mocked implementation and report live evaluation as pending. Do not fabricate results or model cost.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
