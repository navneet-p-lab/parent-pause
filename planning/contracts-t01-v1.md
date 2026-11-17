# Frozen interface handoff: t01-v1

T01 implementation: [schemas and inferred types](../src/lib/contracts.ts), [bilingual synthetic fixtures](../src/test/fixtures/contracts.ts), [regressions](../src/test/unit/contracts.test.ts). Frozen for downstream implementation only after the T01 commit is approved. Changes require integrator review and regression updates.

## Application and provider boundary

Use `coachRequestSchema` for requests and `coachResponseSchema` for complete application responses. `successForRequestSchema(request)` validates success correlation and the newly requested locale. `failureSchema` has no generated message or coach turn. All objects reject unknown fields recursively. Text remains unchanged, including whitespace, joining characters, mixed script and literal markup. **Render text through React text children only; never HTML or a Markdown/link parser.** A schema is not an HTML sanitizer.

`LIMITS` is the shared source for the code-point counter, history bound and later transport limit. T06 must enforce 65,536 bytes while reading the request, before unrestricted JSON parsing. Application schemas operate on already-parsed data. A valid 15-entry transcript has 8 user turns and 7 assistant turns; it starts/ends with user and alternates. Neither the schema nor this no-account design proves completeness of client history or safety of previous assistant output.

Request locale selects the new response language, regardless of input script. Historical assistant replies keep their own locale. A language tag cannot prove language fluency. One required strict `checkIn: {kind: 'question', text: string}` guarantees one object, not that the text contains exactly one meaningful question. T04/T05/T06 semantic review must reject extra questions, wrong language, links, HTML, unsafe advice and invented resources. T03 renders any hostile strings literally even if a later layer failed.

English plan/escalation word ceilings are an explicit tightening of the architecture's targets: 120/100 whitespace-delimited words, counting acknowledgment/message, every step/action and the check-in. All locales additionally use 180/240 code-point field bounds. Urdu has no machine word ceiling and still requires native brevity/readability review. No string is truncated to pass validation. `planSchema` and the other individual family schemas expose structure/field bounds; `coachResponseSchema` adds aggregate business validation and is the acceptance boundary.

T05 exports JSON Schema from `providerResponseWireSchema`, `providerClassificationWireSchema` and `providerReviewWireSchema`. Roots are strict objects; the response union is nested under `response` and exports as `anyOf`. These shapes deliberately omit custom business refinements. `parseProviderResponse(wire, requestedLocale)` performs wrapper, complete application and locale validation. Classification is `{category: routine | unclear | medical_legal | emergency | abuse | self_harm}`. Review wire is `{decision: allow | block | escalate, category: emergency | abuse | self_harm | null}` with both keys required; parse through `reviewSchema` to require non-null category exactly when escalating. Wire validity cannot establish application validity or safe content. Provider/API-subset acceptance and live calls remain T05/T09 verification, not a T01 claim.

## Shared CSS token names (T02 implements, T03 consumes)

The design specifies values, not existing names. This revision freezes these names. T02 owns the global definitions and imports; T03 uses variables in its own CSS Modules. Do not add CSS to T01.

| Token | Value/purpose |
|---|---|
| `--color-canvas` | `#F7F6F2` |
| `--color-surface` | `#FFFFFF` |
| `--color-text` | `#263B35` |
| `--color-muted` | `#5C6C64` |
| `--color-action` | `#2F5D50` |
| `--color-on-action` | `#FFFFFF` |
| `--color-support` | `#EAF0EA` |
| `--color-crisis-text` | `#843D2E` |
| `--color-crisis-surface` | `#FFF3EA` |
| `--color-border` | `#CCD6CF` (decorative separators) |
| `--color-focus` | `#2F5D50` (visible outline with offset) |
| `--space-1` / `--space-2` / `--space-3` / `--space-4` | `4px` / `8px` / `12px` / `16px` |
| `--space-6` / `--space-8` / `--space-12` | `24px` / `32px` / `48px` |
| `--radius-control` / `--radius-card` | `12px` / `20px` |
| `--border-width` | `1px` |
| `--content-width` | `720px` |
| `--control-min-height` | `44px` |
| `--font-en` | system sans-serif stack |
| `--font-ur` | self-hosted licensed Noto Sans Arabic plus Arabic/system fallbacks |
| `--font-body-en` / `--font-body-ur` | `16px` / `18px` |
| `--line-body-en` / `--line-body-ur` | `1.6` / `1.9` |
| `--font-heading` / `--font-heading-mobile` | `36px` / `28px` |
| `--page-gutter` | `16px` below 640px; `24px` at 640px; `32px` at 1024px |

Use logical CSS and per-response `lang`/`dir`, chronological DOM order and `dir="auto"` on parent text. T02 verifies token contrast in actual contexts; decorative borders are not control/focus indicators.

## Presentational props (T02/T03 implement; T07 wires)

These interfaces are exported by T01 from `src/lib/contracts.ts`; no components are implemented here. Both T02 and T03 import them from the contract without importing one another's component files. The declarations below document those exports. T02's dictionaries satisfy `Record<Locale, ResponseLabels>`; T03 consumes the same type.

```ts
import type { ReactNode } from 'react';
import type { CoachResponse, FailureCode, Locale, Turn } from '@/lib/contracts';

type ResponseLabels = {
  user: string;
  coach: string;
  planHeading: string;
  clarificationHeading: string;
  boundaryHeading: string;
  escalationHeading: string;
  checkInHeading: string;
  loading: string;
  errors: Record<FailureCode, string>;
};

type CoachResponseProps = {
  response: CoachResponse;
  labels: ResponseLabels; // dictionary for response.locale
};

type ConversationStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; code: FailureCode };

type ConversationProps = {
  turns: readonly Turn[];
  uiLocale: Locale;
  labels: Record<Locale, ResponseLabels>;
  status: ConversationStatus;
  announcement: null | {
    id: string; // stable across ordinary rerenders; changes per new event
    text: string;
    urgency: 'polite' | 'assertive';
  };
};

type LocalizedShellProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  children: ReactNode;
};
```

`Conversation` owns a single announcement mechanism keyed by event ID. Existing cards are not live regions. T07 supplies one event for a newly accepted reply/error (assertive for escalation/errors, polite otherwise); ordinary history rendering or locale switches must not re-announce the entire transcript. Status displays loading/error copy using `uiLocale`. Role and content labels on historical assistant cards use the response locale. These components have no request lifecycle, fetch, composer state or persistence. T02 includes the persistent emergency notice and preview/privacy disclosure in its shell.

## Ready parallel lanes after acceptance

T02: shell, dictionaries, font/license and tokens. T03: response/conversation renderers, their CSS Modules and component tests. T04: deterministic safety policy/templates/prompts and unit tests. Use isolated worktrees and packet ownership. The integrator retains package/configuration, shared contracts, page wiring and evidence ownership. T04 needs its lead/safety gate; native Urdu/human safeguarding approval remains a release gate. T05 starts after T04's prompt contracts, then T06. T07 integrates T02/T03/T06.
