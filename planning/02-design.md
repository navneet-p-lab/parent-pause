# Design specification

## Visual direction

Quiet, practical, and adult. Warm ivory canvas (#F7F6F2), white cards, near-black text (#263B35), muted text (#5C6C64), forest green action (#2F5D50), pale sage support surfaces (#EAF0EA). Crisis states use dark rust text (#843D2E) on pale warm background (#FFF3EA), with a heading and icon so color is not the only signal. Never use celebratory animation after a crisis.

Use a system sans-serif for English and a self-hosted Noto Sans Arabic family for Urdu in the implementation, with system Arabic fallbacks. Prefer this over a dense Nastaliq body face for compact controls and predictable line boxes. Native-reader review may revise this choice. Prototype uses local/system fonts only, so installed fonts affect its Urdu appearance.

Body 16px/1.6 English; Urdu 18px/1.9, no letter spacing, no uppercase transform. Heading 36px desktop, 28px mobile. Radius 12–20px, borders 1px, spacing 4/8/12/16/24/32/48px. Buttons at least 44px tall. Avoid shadows except very subtle elevation on the composer.

## Page composition

Header: ParentPause wordmark and short service descriptor at inline-start; English/اردو control at inline-end. Keep the brand LTR with bidirectional isolation. No sidebar or dashboard.

Main: maximum 720px readable width. Empty state has one heading, one sentence, 3 suggested concern chips, then the composer. Conversation mode uses chronological user/coach sections. Label roles; do not rely on bubble color. Keep the earlier concern visible above its response.

Coach card: small service label; one acknowledging sentence; numbered actions; separate pale-green check-in area. Labels are translated static UI strings. Generated content is plain text, never raw HTML or model-supplied Markdown links.

Safety card: heading “Get support now,” explicit coaching limit, 1–3 short immediate-help actions and one safety check-in. No ordinary plan numbering or “come back later.” Persistent small emergency guidance remains reachable during loading and errors.

Composer: visible label, textarea (min 120px; grows to a bounded maximum), language hint, character counter and primary button. In conversation mode the label becomes “What happened next?” User can scroll to previous content. Do not fix the composer over the mobile keyboard; use normal flow and safe-area padding.

## Responsive rules

- Below 640px: 16px page gutters, wrapping header, stacked composer actions and full-width primary button. Chips wrap or stack. No fixed heights on text cards.
- 640–1023px: 24px gutters; content stays centered, max 720px.
- 1024px+: 32px gutters; retain reading width rather than expanding into empty columns.
- Verify 320/390/768/1440 widths and 200%/400% zoom. Test the virtual keyboard on a mobile browser. A prototype “mobile” toggle is convenient but does not replace real viewport tests.

## Urdu, English and mixed scripts

- UI locale controls `<html lang="ur" dir="rtl">` or `<html lang="en" dir="ltr">` and all static labels. No country flags. Default English; explicit language switch always visible.
- Selected UI locale is also the requested response language. Typing Urdu in an English UI remains valid and gives an English response until اردو is selected; the composer explicitly says the reply language. No surprising auto-switch while typing.
- Textarea and each parent message use `dir="auto"`. Each assistant response records its own locale and `dir`, so changing the UI does not reverse or retranslate old messages.
- Use `margin-inline`, `padding-inline`, `border-inline-start`, `text-align:start`, and logical placement. DOM order remains chronological; do not reverse arrays to achieve RTL.
- Isolate Latin brand names, URLs, times, identifiers and embedded English with `<bdi>` or explicit direction. Only mirror directional arrows; never mirror text, universal icons or numerals.
- Roman Urdu is LTR input. In Urdu UI the response is Urdu script. The safety classifier must understand both; do not infer country or risk from script alone.
- Preserve user text. Normalize a separate safety-analysis copy (Unicode normalization, casing where relevant, whitespace and harmless formatting characters) without stripping Urdu letters or joining behavior from rendered input.
- Native Urdu review checks naturalness, respectful phrasing, joining, punctuation, digits, line breaks, focus order and crisis wording. Machine translation is a draft, not approval.

## Interaction and accessibility acceptance

Keyboard-accessible controls, skip link, visible focus ring, label associations, no autofocus on mobile. Use a polite live region for loading/completion, a single alert for new crisis/error content, and avoid re-announcing the whole conversation. Keep focus in composer on successful sends; announce response availability. Do not drag a reader away from earlier history by forced scrolling.

Loading shows text, not a typing simulation that suggests a human. Disable duplicate sends but allow cancellation; ignore stale responses after cancel/new conversation. Error keeps the unsent content and offers a manual retry. Validate empty/overlong input inline. Each disabled control has an understandable nearby explanation. Test contrast and screen-reader behavior, not only DOM attributes.

## Prototype inventory

The [interactive mockup](mockups/parentpause.mockup.html) includes empty, everyday, crisis, loading and error states in both locales, plus a narrow viewport preview. The top review toolbar is not part of the shipped product. All sample content is fixed and labeled as such; this prototype does not classify arbitrary text or call an LLM.
