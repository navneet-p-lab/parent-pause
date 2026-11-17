# Design and technical research

Reviewed 17 November 2026. This is a curated design reference set, not a claim that these products are objectively the “best.” YC affiliation was verified independently of the product pages. Observations are from public product pages and their visible UI previews, not an authenticated usability study.

## YC references → design decisions

| Reference | Observed pattern | ParentPause application | What does not carry over |
|---|---|---|---|
| [Cron, W20](https://www.ycombinator.com/companies/cron), now [Notion Calendar](https://www.notion.com/product/calendar) | Spacious hierarchy, clear primary action, preview of the actual task | A quiet page, visible input, a narrow readable conversation column | Marketing navigation, large illustrations and multiple download buttons |
| [Raycast, W20](https://www.ycombinator.com/companies/raycast), [product](https://www.raycast.com/) | Strong focal point and compact command-oriented product positioning | One obvious next action, optional keyboard shortcut | Dark dramatic hero, gradients, animation and power-user complexity |
| [Stripe, S09](https://www.ycombinator.com/companies/stripe), [Checkout](https://stripe.com/payments/checkout) | Preview has explicit field labels, restrained borders and a single strong submit button | Visible textarea label, inline status, modest card boundaries, clear submit | Payment fields, two-column checkout and commercial trust badges |

Screenshots were captured and visually inspected during research. The design borrows interaction principles, not brand assets or marketing claims. ParentPause's warm paper palette and muted green are a design choice for a calm reading experience, not a demonstrated clinical effect.

## Primary technical sources

- [W3C structural RTL guidance](https://www.w3.org/International/questions/qa-html-dir): explicit document direction and automatic direction for unknown text; use semantic direction rather than only text alignment.
- [W3C reflow criterion](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): content should remain usable at 320 CSS pixels without two-dimensional scrolling.
- [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers) and [testing guidance](https://nextjs.org/docs/app/guides/testing): one app can contain the UI and server request boundary.
- [Vitest guide](https://vitest.dev/guide/) and [Playwright assertions](https://playwright.dev/docs/test-assertions): unit/component checks plus browser behavior. Pin compatible versions during bootstrap; current Vitest documentation requires Node >=22.12, while this workspace currently has Node 20.20.2.
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs): schemas constrain output shape; application code must still handle refusals, incomplete responses, errors and semantic safety.
- [OpenAI conversation state](https://developers.openai.com/api/docs/guides/conversation-state) and [data controls](https://developers.openai.com/api/docs/guides/your-data): use `store:false`, but do not equate that with zero provider retention.

## Safety grounding and limits

[NHS urgent mental-health guidance](https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/) supports escalating immediate danger to emergency help. [NSPCC disclosure guidance](https://www.nspcc.org.uk/keeping-children-safe/reporting-abuse/what-to-do-child-reveals-abuse/) supports listening without blame and avoiding confrontation of an alleged abuser. These are UK sources grounding general response principles; their regional phone numbers are not copied into this region-neutral app. This planning work is not a professional safeguarding or clinical review.
