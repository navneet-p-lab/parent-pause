# Decision register

Recorded 17 November 2026. “Confirmed” means the owner selected it in the interactive planning prompt; “recommended” means an engineering/design choice to implement unless new evidence changes it. These are local document IDs, not tracker items.

| ID | Decision / status | Why this over alternatives | Cost / revisit trigger |
|---|---|---|---|
| D01 | Assessment demo + documented next steps — confirmed | Meets the assignment without building a production service | Public access requires the pilot gates |
| D02 | Next.js + OpenAI — confirmed | UI and protected API in one TypeScript project | Node + separate UI is viable but adds integration work |
| D03 | Region-neutral crisis guidance — confirmed | Urdu users can live anywhere; guessed numbers can be wrong | Add regional resources only after explicit locale choice and verification |
| D04 | ParentPause; EN/Urdu script + Roman Urdu safety tests — confirmed | Small understandable scope; Roman Urdu risk cannot be ignored | Additional output languages require translated UI and evaluation |
| D05 | No deadline/hosting preference — confirmed | Allows local-first build and evidence-led model choice | Owner chooses hosting if a live link becomes needed |
| D06 | Memory-only conversation — recommended; no DB/login required by brief | Minimizes sensitive retained data and reviewer setup | Refresh loses history; saved history needs explicit consent and new design |
| D07 | Question-based check-in — recommended | Meets question-or-return-time requirement without false reminder promise | Scheduled reminders add storage and delivery responsibilities |
| D08 | Single-column layout, warm restrained palette — recommended | Keeps reading and next action obvious on phones | Revisit after usability feedback, not aesthetic feature creep |
| D09 | CSS Modules + logical CSS — recommended | Small bespoke UI; fewer dependencies than a component suite | Team may choose Tailwind if it preserves token/RTL contract |
| D10 | Complete validated replies, no streaming — recommended | Avoids displaying unsafe partial output | Costs perceived latency; measure actual user impact before adding streaming |
| D11 | Rules + semantic classifier + output review + authored crisis templates — recommended | Keywords alone miss indirect/multilingual risk; prompting alone leaves too much control to generation | Extra latency/cost; thresholds and tests matter more than stage count |
| D12 | Vitest/RTL + Playwright/axe + separate live evals — recommended | Logic, DOM, browser and model behavior have different failure modes | CI uses fake provider; live safety quality requires separate evidence |
| D13 | UI locale controls response locale; messages have individual direction — recommended | Predictable switching; mixed-script input remains readable | Do not silently auto-translate history |
| D14 | Self-hosted Noto Sans Arabic body font — recommended | Legible controls, no third-party font request during app use | Verify license, native-reader preference and actual glyph rendering |
| D15 | Narrow work packets for smaller coding models — user requested | Fixed contracts and tests make local changes easier to assess | Safety policy and merge approval stay with a stronger reviewer/human |
| D16 | No exact runtime model selected yet — pending evaluation | Avoid equating a lower price with safe Urdu coaching | T05 compares account-available candidates; record model, latency, cost and results |
| D17 | Separate assessment repository — recommended | Originally inherited SongRise; 18 November reassessment verifies an independent project Git root | Publish only project files; choose repo owner/visibility when preparing delivery |

## Deferred owner decisions, asked when they become actionable

- Repository owner/name/visibility and whether a hosted demo is wanted: delivery stage, after a runnable result exists.
- Public pilot budget, traffic expectation, operating region, retention needs and support owner: before exposing a pilot.
- Native Urdu reviewer and safeguarding reviewer: before final release copy is approved.

No additional scale decisions block this planning package. Do not reopen confirmed choices unless implementation evidence makes the tradeoff material.
