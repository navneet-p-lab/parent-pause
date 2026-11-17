# T04 — Implement authored safety routes and policy

Status: To Do — not started; execution is blocked until the dependencies below are accepted and committed.

- Dependencies: T01
- Suggested executor: Small coding model + stronger safety reviewer
- Rough effort: 90–120 minutes; planning estimate, not a deadline.
- Writable ownership: `src/lib/server/safety/rules.ts, src/lib/server/safety/policy.ts, src/lib/server/safety/templates.ts, src/lib/server/prompts/classify.ts, src/lib/server/prompts/review.ts, src/test/unit/safety.test.ts`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. Use the frozen contract and report a needed change instead of silently changing another packet's interface.

Encode the documented route precedence and typed authored emergency/abuse/self-harm/boundary/failure responses in both languages. Write the classifier and review prompts with explicit input-as-data boundaries. Implement narrow explicit-risk rules only as an early escalation path; unmatched input must continue to semantic classification. Preserve original user text and normalize only an analysis copy. Add policies for ambiguity, previous risk, negation, fiction and prompt injection.

## Acceptance and tests

Unit tests prove explicit risk cannot reach normal generation; unmatched or ambiguous text is not marked safe by absence of a keyword. All templates satisfy T01; no numbers, diagnoses, medical/legal procedures, blame or delayed crisis follow-up. English/Urdu/Roman Urdu fixtures include false positives. Tests verify category-specific responses and safe outage behavior.

## Handoff

Lead/safety review required before integration. A small model implements an approved policy; it does not invent safety policy or approve its own templates.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
