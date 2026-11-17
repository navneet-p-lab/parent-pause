# T09 — Review bilingual safety and complete evidence

Status: To Do — not started; execution is blocked until the dependencies below are accepted and committed.

- Dependencies: T08 plus live provider configuration
- Suggested executor: Stronger reviewer + native Urdu/human reviewers
- Rough effort: 60–120 minutes plus external review; planning estimate, not a deadline.
- Writable ownership: `planning/evidence/model-evaluation.md, planning/evidence/release-review.md, safety-cases additions agreed with lead`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Run the live evaluation process, held-out paraphrases and repetition requirements. Review responses rather than only route labels. Include native Urdu reading and safeguarding feedback; log model, prompts, corpus revision, cost, latency and failures. Inspect client bundle/config/logging and fresh-build behavior. Review all packet handoffs and unresolved issues.

## Acceptance and tests

No known urgent-risk false negative, unsafe instruction, fabricated resource, secret exposure or broken Urdu crisis layout. All deterministic suites pass; routine usefulness threshold is met with numerator/denominator. Native Urdu sign-off is recorded or explicitly pending. A failure returns to owner and gets a regression case.

## Handoff

This is deliberately not a smaller-model-only approval task. Lead and human review must not be replaced by the implementer self-approving.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
