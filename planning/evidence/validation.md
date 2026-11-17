# Planning-artifact validation

Historical snapshot. For the current repository, tracker and bootstrap acceptance state, see [18 November reassessment](session-reassessment.md).
Performed 17 November 2026. This evidence covers the HTML design prototype and planning package, not a working Next.js app or live AI safety.

## Checks performed

- Loaded the self-contained HTML in the Nimbalyst browser and visually inspected the desktop conversation and Urdu mobile crisis layout.
- Exercised five states (empty, plan, crisis, loading, error) in both locales at actual viewport widths 320, 390, 768 and 1440 CSS pixels: 40 state/locale/viewport combinations, zero horizontal page-overflow failures. See [raw checks](browser-checks.json).
- Checked root `lang`/`dir`, textarea `dir=auto`, three steps for the plan state, no routine steps in crisis, and an emergency notice in every state.
- Exercised clear-dialog open/cancel/confirm, topic population without sending, prototype-only submit notice, retained input in error/cancel, retry→loading, RTL switch and mobile preview toggle. Mobile width was checked after its 200ms transition completed; an immediate measurement during animation was not a stable assertion.
- Extracted inline JavaScript and ran `node --check`: passed.
- Parsed the synthetic safety JSON: 35 unique case IDs. Checked task packet count: 11.
- Checked local Markdown links after the evidence files were written: passed.
- Computed representative palette contrast ratios using the sRGB relative-luminance formula in Python: all sampled text pairs exceed 4.5:1. See [computed ratios](contrast-checks.json). This is not a complete rendered accessibility audit.

## Design correction from review

The first conversation layout repeated the large introductory heading, pushing the response too far down. The final prototype reserves that heading for the empty state and uses a screen-reader heading in conversation states. Urdu crisis guidance is now earlier in the document.

## Remaining verification

No application unit/API/component/Playwright suites exist yet, and no live LLM calls were made. The browser checks use the editor's embedded browser, not a Chromium/WebKit application test matrix. No screen-reader, physical mobile keyboard, 400% zoom, native Urdu, independent safeguarding or professional review was performed. These are explicitly assigned in the work packets.

Prototype locale switching replaces the selected authored sample to preview the other language; it does not demonstrate preserving multilingual live history. Production history behavior is specified in the design and T07. The prototype is not a safety classifier, does not respond to arbitrary text, and deliberately makes that limitation visible when submitted.
