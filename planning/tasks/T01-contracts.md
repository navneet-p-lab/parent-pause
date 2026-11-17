# T01 — Freeze request/response schemas and fixtures

Status: In Review — implemented and validated on 18 November 2026, with self-review and a delegated read-only technical review. Acceptance/commit outcome is recorded in Git and the native tracker. See [implementation and verification](../evidence/t01-contracts.md) and [interface revision t01-v1](../contracts-t01-v1.md). Downstream packets remain gated on the approved commit.

- Dependencies: T00
- Suggested executor: Small coding model + lead contract review
- Rough effort: 60–90 minutes; planning estimate, not a deadline.
- Writable ownership: `src/lib/contracts.ts, src/test/fixtures/contracts.ts, src/test/unit/contracts.test.ts`

## Task prompt

Read [shared execution rules](README.md), [architecture](../03-architecture.md), [design](../02-design.md), [safety policy](../05-safety.md) and [testing](../06-testing.md). Implement only this packet. This packet freezes the proposed contract. Resolve ambiguities explicitly before downstream implementation and record the reviewed interface revision.

Implement the exact request/response families and bounds from the architecture document. Add strict runtime validation, Unicode code-point counting, alternating transcript validation, response-language rules and response-length business checks. Define separate provider wire schemas where the API subset needs object wrappers. Export types inferred from schemas. Include plan, clarify, boundary and escalation fixture responses in both locales. Also publish the shared CSS token names from the design specification and the presentational response props as a short interface handoff; T02 owns CSS implementation, while T03 consumes the agreed names. This lets T02 and T03 start independently after T01 review.

## Acceptance and tests

Accept valid English/Urdu/mixed-script inputs. Reject unknown fields, system/developer/tool roles, whitespace-only text, 2,001 code points, incorrect order, excessive history, invalid response families and long fields. Assert 2–3 plan steps, exactly one check-in object, locale validation and no HTML rendering contract. Document any intentional deviation before downstream work.

## Handoff

This contract is the dependency boundary. No later agent may change it unilaterally.

Return changed files, tests/commands and actual results, known limitations, and proposed agent-log entry. Mark this task complete only when acceptance criteria pass; never report unrun checks as passed.
