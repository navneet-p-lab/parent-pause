# T09 — Review bilingual safety and complete evidence

Status: In Progress — T08 accepted at `17befd3`. Integrated evaluation preparation and technical review are implemented; live evaluation/model selection and actual human/manual gates remain pending. See [plan](../evidence/t09-release-plan.md), [evaluation readiness](../evidence/model-evaluation.md) and [release review](../evidence/release-review.md). A preparation commit does not complete this packet or unblock T10.

- Dependencies: T08 plus live provider configuration
- Suggested executor: Stronger reviewer + native Urdu/human reviewers
- Rough effort: 60–120 minutes plus external review; planning estimate, not a deadline.
- Writable ownership: `planning/evidence/model-evaluation.md, planning/evidence/release-review.md, safety-cases additions agreed with lead`

Lead-approved preparation scope also includes `scripts/eval-release.ts`, the existing evaluation observation handoff, relevant API tests and npm command wiring; the frozen product/provider/safety interfaces remain unchanged.

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Run the live evaluation process, held-out paraphrases and repetition requirements. Review responses rather than only route labels. Include native Urdu reading and safeguarding feedback; log model, prompts, corpus revision, cost, latency and failures. Inspect client bundle/config/logging and fresh-build behavior. Review all packet handoffs and unresolved issues.

## Acceptance and tests

No known urgent-risk false negative, unsafe instruction, fabricated resource, secret exposure or broken Urdu crisis layout. All deterministic suites pass; routine usefulness threshold is met with numerator/denominator. Native Urdu sign-off is recorded or explicitly pending. A failure returns to owner and gets a regression case.

## Handoff

This is deliberately not a smaller-model-only approval task. Lead and human review must not be replaced by the implementer self-approving.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
