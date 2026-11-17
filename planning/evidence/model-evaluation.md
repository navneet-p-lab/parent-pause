# T09 model-evaluation readiness

18 November 2026. Input `17befd3`; T08 is accepted. **No live evaluation has run and no model is selected.** Local configuration inspection found no key/model; values were never printed. No spend envelope, native Urdu review or safeguarding approval was supplied.

## Integrated runner

`npm run eval:release` is a no-network dry-run by default. It evaluates the actual T06 service with provider-session instrumentation when explicitly run live; it does not use the older direct-provider diagnostic as accepted coaching. Classification, generation, review, authored risk bypass, known-risk outage fallback and strict response validation remain owned by product code. No product policy/response contract changed.

Each ordered setup turn retains the service's actual accepted reply; failed setup stops the case. Malformed output and output-review failures cannot become ordinary plans. Accepted authored fallback may coexist with provider-stage failure evidence; the runner records both instead of discarding the fallback or hiding the outage. Stage failures/known usage are drained after timeout before serialization. Attempted stages are not a billing guarantee.

Records include requested/returned model identifiers, prompt/contract/provider/policy/service revisions, corpus version/status/SHA-256, source HEAD/dirty flag, per-stage latency/usage, accepted responses and route/category verdicts. A returned alias is not proof of a pinned snapshot. Wrong routes/categories and provider-stage failures produce a failing process exit; matching routes alone do not establish safe content or release approval.

Human scores stay null until real review. Routine usefulness uses all routine attempts in its denominator, including unreviewed ones; a passing numerator needs a named reviewer, all seven rubric scores equal to 1 and an expected accepted route. At least 90% must pass. Separate native Urdu, safeguarding and manual accessibility gates always remain explicit; the script never self-approves release.

Optional `--rates` accepts a local JSON mapping from each requested candidate identifier to `inputUsdPerMillion`, `outputUsdPerMillion`, official `source` URL and `checkedAt` date. Verify model-specific rates before supplying it. Costs are uncached token-rate estimates for known usage, not provider invoices or enforced dollar cutoffs. Missing prices/usage or overflowing/unsafe arithmetic produce null/incomplete cost fields. Cached-token discounts, taxes and account billing differences are not inferred. No rates are hardcoded or claimed verified by this preparation.

Artifacts use exclusive creation and owner-only permissions under ignored `evaluation-results/`; console output excludes prompts/raw upstream errors. The CLI loads this project's environment files only for explicit live work. Keep the key server-side in ignored local configuration, never in chat, source or an artifact.

## Reproducible plan and pending live run

Verified dry-run command:

```bash
npm run eval:release -- --models candidate-a,candidate-b
```

The names above are placeholders, not account-available model recommendations. Current corpus: 35 seed + 6 AI-authored held-out cases. One candidate plans 83 attempts and at most 273 provider calls; two plan 166/546. Possible-escalation cases repeat three times. Each supplied parent turn has a conservative maximum of three stages; actual authored bypass can use zero. These are ceilings, not observed paid usage or dollar estimates.

Seed SHA-256: `361f8cdd4bcb56aa09e81b4feeb05662129a7f7eaa267e319f4886d4be904b90`.
Held-out SHA-256: `fb5c9d414a8c5696c9cf94354ea64980b7b74b8873a96803a5612bef3201a704`.
Both corpus versions are 1. All current held-out cases are AI-authored; native-authored additions and signoff remain pending.

After explicit candidates, local key configuration and an approved spend envelope, use the same command with `--live`, sufficient `--max-calls`, optional verified `--rates` and a unique `--out` filename. The call ceiling is not a dollar limit. Record the owner's spend authorization and actual source revision before execution. Do not treat a no-network dry-run, mocked transport, cached output or authored-only route as evidence of live model quality.

After live execution, inspect every accepted output and failure against its requirements, not only labels. Record per-candidate route numerator/denominator, routine human-review numerator/denominator, urgent-risk false negatives, unsafe instructions/resources, missing usage, latency and cost estimate limitations. Obtain real native Urdu and safeguarding feedback. Any substantive failure needs a regression and rerun; do not alter expected labels merely to pass. No live artifact, measured model latency/cost/quality, chosen model or human approval exists at this snapshot.

Official documentation checked: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) still requires content validation; [evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) combines metrics with human judgment. These support the procedure, not a claim that this app/model is safe.
