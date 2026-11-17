# Safety handoff: t04-v1

Input contract remains [t01-v1](contracts-t01-v1.md). Implementation: [rules](../src/lib/server/safety/rules.ts), [policy](../src/lib/server/safety/policy.ts), [authored catalog](../src/lib/server/safety/templates.ts), [classifier prompt](../src/lib/server/prompts/classify.ts), [review prompt](../src/lib/server/prompts/review.ts). Integration requires T04's accepted commit; see [technical evidence](evidence/t02-t04-parallel.md). Urdu/native safeguarding approval is still a release gate.

## Server orchestration

Call helpers only with a transport/schema-validated request. Keep the same original request through every stage; analysis normalization/quotation masking must never replace user text or alter provider input. Helpers perform no I/O, model calls or logging.

1. `beforeClassification(request)` returns `respond` for an explicit unresolved emergency, or `classify`. The latter can carry a server-derived `fallbackCategory` and `reassessPriorRisk` flag. Neither is a client request field.
2. When classification completes **or fails**, call `afterClassification(request, result)`; pass an invalid value such as `null` for refusal/error/outage. Emergency outranks lower categories. Known abuse/self-harm goes through full-context classification to catch novel higher-priority danger; a routine/unclear/boundary result cannot erase unresolved explicit risk. Without known risk, invalid classification returns `unavailable`.
3. A `generate` decision permits only its `responseKind` (`plan` or `clarify`). An indirect-distress clarification must include one gentle direct safety question and conditional emergency guidance. T05 owns the coaching prompt; the output review enforces that policy. The requested locale determines the new response language.
4. After candidate generation and review **or their failure**, call `afterReview(request, classification, candidate, review)`. Any invalid/block/review outage discards the candidate. The helper recomputes the risk context from the original request, preserving a known-risk authored fallback. Do not bypass this with a generic retry error. Schema, family and requested-locale validation are additional to semantic review.

`respond` contains a complete accepted response. Emergency/abuse/self-harm and medical/legal boundary content is authored. `unavailable` is `{kind: 'unavailable', code: 'UNAVAILABLE', retryable: true}`; T06 maps it to T01's failure envelope with request correlation. It is not a coach turn. `failureGuidance` is localized UI guidance rather than an envelope field or assistant response.

## Historical risk and precedence

An “ignore that” instruction or ordinary follow-up does not erase known danger. A narrowly recognized later resolved-history/help-arrived claim requests full-context semantic reassessment, retaining the previous authored category on failure. The claim itself never establishes safety. Only valid classification plus an allowed, valid, relevant candidate can release the earlier floor to routine/clarification content. Medical/legal boundary cannot bypass this requirement; during reassessment it conservatively retains the earlier authored risk response. A new explicit declaration in or after the claim prevents that release path. Recognition is limited; unmatched resolution phrasing can remain conservative until later improvement and evaluation.

Explicit phrase rules are a supplemental fast path, not multilingual safety classification. Balanced quoted spans are deferred to semantic classification, including quoted disclosures. The quote/context parser is intentionally incomplete. The server cannot prove history completeness or trust browser assistant replies as safety evidence.

## Provider prompt boundary

`classificationPrompt(request)` and `reviewPrompt(request, candidate)` return `{instructions, input}`. Send `instructions` as server-owned instructions and `input` as a separate serialized data message. Do not concatenate user/candidate JSON into developer instructions. Revision constants identify the policy and both prompts. Parse provider classification/review through T01 strict schemas; structured output is not a safety guarantee. These prompts have not been evaluated live.

T05 implements the deterministic adapter/harness, T06 wires these decisions to the bounded endpoint, and T09 performs full-pipeline live evaluation and final model choice. No provider calls, request lifecycle, native-reader approval or qualified human safeguarding approval are established by this handoff.
