# T06 service and endpoint handoff

Input `0b58067`; application wire contracts stay `t01-v1`. Service revision `t06-service-v1`; safety policy revision `t06-safety-v2` includes the narrow English abuse-declaration repair. See [plan](evidence/t06-service-plan.md) and [verification](evidence/t06-service.md). The page remains the unconnected English preview until T07.

## Service

`createCoachService(sessionFactory?)` returns an async function accepting unknown input and optional `{signal}`. It returns only frozen `Success | Failure` envelopes. Validation/cloning precedes safety/provider work. Explicit unresolved emergency returns an authored localized response before configuration/session creation. Otherwise T04 policy drives classify → optional generate → review → final schema/correlation validation. Medical/legal and crisis categories return authored templates; unknown classification/review never defaults to routine.

One lazy session per request uses T05's ordered/bounded adapter. The injectable factory receives the complete validated request and abort signal; generated/reviewed values are still untrusted and validated again. Candidate family/locale/structure must pass before review. Review receives the exact candidate; a block/error discards it. Known explicit risk, including earlier disclosures under contextual reassessment, retains authored fallback through configuration, generation, classification, review and timeout failure. Without known risk, failure produces a fixed public error, not a coach turn. Full-context classification/review remain mandatory to release a prior-risk floor. No claim of exhaustive detection or live model quality.

The service owns a 20-second deadline and follows any parent signal. The HTTP handler starts its parent deadline at entry, so header/body time counts toward the total. Every wait races abort even if an injected session ignores it. Late candidates cannot escape. Transport exceptions after validated known risk use the same server-derived fallback. `unavailableForRequest()` centralizes this behavior.

`fixtureSession` is a development/test-only deterministic clarification fixture. It does not classify semantics; its response explicitly discloses no AI call. T04 explicit safety/fallback paths still apply. Production rejects this session. T07 must preserve fixture disclosure when demonstrating the endpoint; full conversation fixtures/browser journeys remain later work.

## POST transport

`POST /api/coach` runs on Node. Handler construction is outside the Next route module, permitting injected service/limiter/environment tests without adding unsupported route exports. Normal production use is `npm run build` then `npm run start`; `-- --port 3210` is forwarded. The startup wrapper resolves the environment loader belonging to pinned Next and loads production environment files before checking fixture mode. Fixture startup fails before importing the CLI/listening. Registration and per-session checks provide additional runtime protection. This follows Next's [environment loader](https://nextjs.org/docs/app/guides/environment-variables) and [registration hook](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation) conventions; actual lazy-hook behavior was independently probed locally.

`APP_ORIGIN` is required as an exact serialized HTTP(S) origin, e.g. `http://127.0.0.1:3000` without a trailing slash/path/credentials. Browser Origin must match; missing/null/cross-origin are rejected. If present, Sec-Fetch-Site must be same-origin. Only application/json, optionally charset=utf-8, is accepted; compressed/other encodings are rejected. Host and forwarded headers never establish origin trust. No CORS permission is added. Origin checking is not authentication.

The body is counted as bytes while reading, up to 65,536 bytes, even with absent/lying Content-Length. Declared oversize is rejected immediately. UTF-8 decoding is fatal; split multibyte sequences remain intact. Stream cancellation, errors and JSON/schema validation occur before paid work. There is no unrestricted `request.json()`, truncation or silent history removal. Correlation IDs are validated UUIDs, never identity or authorization.

| HTTP | Frozen envelope behavior |
|---|---|
| 200 | Validated/correlated response, including authored known-risk fallback |
| 400 | INVALID_INPUT: origin/header/JSON/schema/identity validation |
| 413 | PAYLOAD_TOO_LARGE: declared or actual body exceeds byte bound |
| 429 | RATE_LIMITED, retryable, with Retry-After seconds |
| 503 | UNAVAILABLE (retryable) or CONFIGURATION_ERROR (not retryable) |
| 405 | Explicit non-POST handlers: INVALID_INPUT plus Allow: POST |

Application responses use Cache-Control: no-store. Invalid/unread bodies have null requestId; parsed UUIDs are retained where valid. Errors expose no raw provider output, exception, cause, credential or generated message. No application prompt/body logging was added. Framework access logs remain framework behavior; do not place disclosures in URLs.

## Instance limits and hosting boundary

The limiter uses rolling windows of 10 accepted limiter entries/minute and 100/hour. Entries are counted before body parsing, so invalid bodies also spend the local budget. Expired entries are removed; at most 1,024 key buckets with 100 timestamps each are retained. New keys at capacity fail closed without evicting active budgets. Every handler instance shares its limiter across requests; restarts reset it.

By default all callers share one local instance bucket. Neither requestId nor client-supplied X-Forwarded-For rotates identity. Optional `COACH_CLIENT_KEY_HEADER` names a deployment-derived header whose value must be a bounded identifier; values are hashed in limiter memory and never logged. Configure this only when a trusted gateway strips/overwrites client values and supplies a validated key. Header syntax validation cannot establish that infrastructure trust. No gateway/platform trust is assumed by default.

These are assessment-instance limits. They can reset/restart or be bypassed across instances, and origin is forgeable outside browsers. Public hosting still requires trusted client-key derivation, distributed/gateway rate limiting, an enforceable budget cutoff and operator spend monitoring. No database, durable identity, gateway deployment or public hosting is implemented.

## Next integration

Synthetic route example with APP_ORIGIN configured to this origin (no provider needed for this explicit emergency):

```http
POST /api/coach HTTP/1.1
Origin: http://127.0.0.1:3000
Content-Type: application/json

{"requestId":"8fb7f12a-e62b-4b45-a072-7f88d7811e64","locale":"en","turns":[{"role":"user","text":"My child is not breathing."}]}
```

This returns HTTP 200/no-store with the same requestId and the complete authored emergency response. A service-side equivalent is `await createCoachService()(request, {signal})`; tests can pass a SessionFactory to `createCoachService(factory)`. For a validated ordinary request without live configuration, the response is HTTP 503 with `{requestId, code:'CONFIGURATION_ERROR', retryable:false}` and no coach turn.

T07 calls this endpoint with same-origin JSON, a full bounded transcript, the selected reply locale and request UUID; it must check correlation, preserve drafts and ignore aborted/stale responses. The API can return an authored escalation even after cancellation of a known-risk request, so the client must still suppress stale turns. Historical assistant entries remain untrusted; omitted client history cannot be recovered in this no-account design. T09 can inject `createCoachService()` into T05's EvaluationTarget seam and instrument the session factory to retain stage metadata. No live call/cost or release approval is inferred from fixture tests.
