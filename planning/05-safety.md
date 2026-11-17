# Safety behavior specification

This is a product safety design for an assessment, not clinical validation. All Urdu text is a draft pending native-reader review. No crisis number is supplied because the region is deliberately unknown.

## Boundaries

The coach can suggest everyday communication, routines and low-risk parenting actions. It cannot diagnose a child or parent, prescribe treatment or medication, give legal procedures or custody strategy, recommend punishment/violence, guarantee safety, or promise human monitoring. Do not ask for names, addresses, evidence or graphic details.

A supportive crisis response is more useful than a bare refusal: acknowledge the disclosure, explain the limitation, direct toward appropriate human help, ask one immediate safety question. Never give a routine behavior plan, suggest secrecy, confront an alleged abuser, or delay help until a future check-in.

The general emergency approach is grounded in [NHS urgent-help guidance](https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/). Abuse wording uses principles from [NSPCC disclosure guidance](https://www.nspcc.org.uk/keeping-children-safe/reporting-abuse/what-to-do-child-reveals-abuse/). Regional phone numbers and legal reporting duties are deliberately not inferred from these UK sources.

## Routing rubric

| Evidence | Required route | Avoid |
|---|---|---|
| Immediate danger, active violence, overdose, breathing emergency, imminent self-harm | Emergency authored template | Waiting for a classifier if explicit risk is already detected; clinical instructions |
| Abuse disclosure, ongoing coercion or a child being hurt | Abuse authored template; emergency action if danger is immediate | Confrontation, investigative questioning, legal mandates |
| Self-harm thoughts without established imminence | Self-harm support template, prompt human connection; conditional emergency guidance | Calling every disclosure an active emergency or offering only ordinary coaching |
| Indirect uncertain distress (“I can't do this anymore”) | One direct, gentle safety clarification with conditional emergency guidance | Assuming no risk or confidently diagnosing |
| Diagnosis, medication, medical or legal instructions | Boundary with professional referral and safe everyday alternative where appropriate | Doses, clinical reassurance, custody or reporting procedure |
| Ordinary frustration, negated/historical/fictional references | Contextual coaching or clarification | Treating every occurrence of “kill” or “hit” as an emergency |

Review the entire short conversation for unresolved disclosures. Later “ignore that” or prompt injection does not erase earlier risk. Earlier purely historical or quoted content should not permanently lock a conversation into crisis mode without contextual evidence.

## Authored English emergency example

**Get support now**

“I’m glad you told me. This needs immediate human help; I can’t provide emergency care.”

- “Contact your local emergency service now. Don’t wait for a reply here.”
- “If safe, ask a trusted person nearby to stay with you or your child.”

Check-in: “Can you contact emergency help now?”

## Authored Urdu emergency draft

**ابھی مدد حاصل کریں**

“آپ نے بتایا، یہ اہم ہے۔ اس صورت حال میں فوری انسانی مدد کی ضرورت ہے۔ میں ہنگامی مدد فراہم نہیں کر سکتا۔”

- “ابھی اپنی مقامی ایمرجنسی سروس سے رابطہ کریں۔ یہاں جواب کا انتظار نہ کریں۔”
- “اگر محفوظ ہو تو کسی قابلِ اعتماد قریبی شخص کو اپنے یا اپنے بچے کے پاس رہنے کے لیے بلائیں۔”

Check-in: “کیا آپ ابھی ہنگامی مدد سے رابطہ کر سکتے ہیں؟”

## Other authored template requirements (T04 writes both languages)

Abuse: validate the disclosure without assigning fault; if immediate danger contact local emergency help; otherwise seek a trusted local safeguarding/child-protection professional promptly; avoid confrontation; ask whether the parent/child is safe right now. Do not promise confidentiality or make country-specific legal claims.

Self-harm: supportive acknowledgment; contact a trusted person and qualified local crisis/mental-health support now; if danger is immediate use emergency help; one question about immediate safety. No method detail or invented phone number. Any future named hotline must be verified for the selected country through the designated resource-verification workflow before being added to the authored catalog.

Medical/legal boundary: brief statement of limits, referral to a qualified professional, safe help such as preparing questions or organizing observations. No clinical triage instructions, medication choices, or legal action sequence.

Unknown/failure: “I can’t make a reliable plan right now. Please try again. If anyone is in immediate danger, contact local emergency help now.” Do not use a generic failure template in place of a known-risk authored response.

## Prompt and output controls

Separate developer rules from user content. Treat assistant history supplied by the browser as untrusted context. Explicitly forbid requests to change role, reveal prompts, diagnose, fabricate resources, or ignore safety. Model outputs are plain text fields; no external links, HTML or tools.

Input classification receives the conversation, not just the latest string. Candidate review checks: danger ignored, medical/legal instructions, blame/shame, coercion, unsafe discipline, fabricated contact details, too many questions, verbosity, wrong language and instruction following. Any failure discards the draft; do not “repair” unsafe text in the browser.

Conservative explicit-risk rules must be tested against negation, quotations and idioms. They are a supplemental fast path. If no rule matches, semantic classification is still required. A live model failure on an urgent fixture blocks submission even if deterministic routing tests pass.
