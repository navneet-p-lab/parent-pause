# ParentPause — implementation blueprint

Planning package · 17 November 2026. Reassessed 18 November: T00 acceptance reverified for the initial baseline commit; T01–T10 have not started. See the [session directive](09-session-directive.md), [reviewer handoff](10-reviewer-handoff.md) and [current evidence](evidence/session-reassessment.md).

A parent describes an everyday concern in English or Urdu and gets a brief, practical plan and one check-in. Emergencies, abuse and self-harm receive a supportive boundary and immediate human-help guidance instead of routine coaching.

## Start here

1. Read the [session directive](09-session-directive.md) and [reviewer handoff](10-reviewer-handoff.md), then open the [interactive mockup](mockups/parentpause.mockup.html). Switch between English/Urdu, desktop/mobile, and empty/plan/crisis/loading/error states. All responses are authored samples; no model is connected.
2. Read the [product scope](01-product.md), [design and RTL specification](02-design.md), and [architecture](03-architecture.md).
3. Use the [decision register](04-decisions.md) to distinguish user choices from engineering recommendations.
4. Assign one packet at a time from the [implementation tasks](tasks/README.md). Tests belong to each packet.
5. Review the [safety policy](05-safety.md), [test strategy](06-testing.md), [AI work log](07-agent-log.md), and [submission plan](08-delivery.md).

[Interactive design: English, Urdu, mobile, and crisis](mockups/parentpause.mockup.html "width=1100 height=850")

## Confirmed with the owner

- Assessment demo, with post-demo steps documented for completeness.
- Next.js + OpenAI.
- Region-neutral crisis guidance; language does not imply country.
- Working name ParentPause. English and Urdu script in v1; Roman Urdu safety inputs included.
- No fixed deadline or hosting preference.

## Deliverable status

| Deliverable | State |
|---|---|
| Research, architecture, decision rationale, work packets | Prepared |
| Interactive responsive design prototype | Prepared; see [validation evidence](evidence/validation.md) |
| Bilingual safety evaluation seed set | Prepared, not model-tested |
| Next.js application and automated application tests | T00 shell and smoke tests locally reverified; [current acceptance evidence](evidence/session-reassessment.md); coaching/locale/API remain future work |
| Model selection and live safety evaluation | Future implementation gate |
| Native Urdu copy review | Required before submission |
| Separate GitHub repository + runnable README | Future delivery task |
| Two-minute walkthrough recording | Script prepared; not recorded |

This folder is now the independent project Git root. The original planning environment was nested inside SongRise; those historical references do not describe the current repository. Continue using only project files and dependencies. No SongRise credentials, services, deployment or history belong in this assessment.
