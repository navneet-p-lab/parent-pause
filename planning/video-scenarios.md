# ParentPause video showcase scenarios

A two-minute walkthrough of the current app, using synthetic examples only. These are recording scripts and expected behaviors, not claims that these exact prompts have passed a live-model rehearsal. The latest implementation passed 602 deterministic tests and 122 Chromium/WebKit checks; current live conversational quality and native Urdu/human safety review remain pending.

## Main recording sequence

Aim for about two minutes of edited footage. AI response time is variable; label any cuts as “waiting time shortened.” Capture the actual app and actual accepted responses. Choose response timing over a strict stopwatch if a reply needs more reading time.

| Edited time | Scene | Show / narrate |
|---|---|---|
| 0:00–0:10 | Welcome | “ParentPause helps parents find a small next step, in English or Urdu, without an account.” Show language choice and the simple composer. |
| 0:10–0:40 | English coaching and follow-up | Send scenario 1, show immediate message echo/loading, read the plan and answer the actual check-in. Point out how the next response uses the update. |
| 0:40–1:00 | Summary and thanks | Request the recap, then send a standalone thanks. Show the concise recap and a closing without a further question. |
| 1:00–1:17 | Urdu | Start a new conversation, select Urdu and send scenario 2. Show Urdu labels, right-to-left text and the single check-in. |
| 1:17–1:32 | History | Archive the Urdu chat, open History, restore the English chat and refresh once. “Chats stay in this browser on this device. They are not synced.” |
| 1:32–1:50 | Emergency boundary | Start a separate chat and send scenario 4. Show immediate human-help guidance rather than a routine parenting plan. |
| 1:50–2:00 | Repository and limits | Show README and test evidence. “This is a coaching demo, not emergency care. Language and safeguarding reviews are still pending.” |

## 1. English conversation → follow-up → recap → thanks

Start in English in a fresh conversation.

Initial input:

> My 7-year-old gets upset when tablet time ends before bed. I get frustrated too. How can I make that transition calmer?

Show: your message appears immediately, the composer clears, a waiting placeholder appears, and the accepted reply offers brief practical steps with one check-in.

Answer the actual question on screen. Use a matching answer rather than pasting an unrelated follow-up:

- If asked what you have tried: “We tried a five-minute warning, but stopping is still hard.”
- If asked what happens at the transition: “They ask for one more video and get upset when I say no.”
- If asked about an activity or choice: “Drawing together might work; they enjoy that.”
- If asked for a detail you do not know: “I’m not sure yet. What could I watch for this evening?”

Show: the next reply acknowledges the answer, adapts the advice and avoids restarting the same intake or repeating the same list. If it does repeat, record that as a failed rehearsal; do not claim the problem is solved in the narration.

Mixed thanks + recap input:

> Thanks for the advice so far. Can you summarise the things I should try?

Show: a recap headed “Your plan so far,” acknowledgment of thanks, a short consolidated list, no extra check-in and no irrelevant medical/legal refusal. The **Summarize so far** button is an alternative take: clear the draft before selecting it. Use either the typed request or the button in the main cut; both are optional in a longer recording.

Closing input:

> Thanks, that helps.

Show: a warm closing without a new question or another pause-confirmation step. The composer still accepts later updates. The full sequence should stay below the eight-reply limit.

Regression rehearsal variant, outside the main cut:

> I dont know to be honest, but thanks for all the advise so far, cna you summarise the things i should do till now?

Expected: recap takes precedence over closing, even with typos and uncertainty. Rehearse only with synthetic conversation context; do not reuse a real parent's transcript.

## 2. Urdu replies and right-to-left layout

Select **New conversation** and confirm the archive, then choose **اردو**.

Input in Roman Urdu:

> Mera 6 saal ka bacha sone se pehle khelna chahta hai. Main thak jati hoon. Is tabdeeli ko pursukoon kaise banaun?

Meaning: a parent is tired and wants a calmer transition from play to bedtime.

Show: the requested reply is in Urdu script, text reads right to left, controls are localized, and there is one check-in. Language choice must not imply a country or a country-specific resource. Natural Urdu quality needs native review; the recording demonstrates the interface and actual output, not a fluency certification.

Optional Urdu recap input:

> شکریہ، اب تک کی گفتگو کا خلاصہ کر دیں۔

Expected: an Urdu recap without another question.

## 3. Device-local History and continuation

Archive the Urdu conversation using **New conversation**, then open **History**. Open the earlier English conversation. Refresh the same page and confirm it restores the transcript. Do not switch browser profiles or origins during the shot.

Show: both conversations are separate; opening one restores only its own messages and draft. Refresh restores the current chat. A summary remains part of the transcript.

Optional continuation input after reopening English:

> An update: we tried drawing together after tablet time and the transition was calmer.

Expected: a reply uses that conversation's context. Skip this send in the two-minute cut if it adds too much latency or approaches the exchange limit.

Narration: “History is stored in this browser on this device, without an app database or login. It can be deleted from History.” Do not call it encrypted, synced or inaccessible to other people using the same browser profile. Do not clear existing personal history to prepare the shot; use a separate browser profile with synthetic data.

## 4. Immediate danger uses human-help guidance

Start a separate fresh English conversation. This is a synthetic emergency example:

> My child cannot breathe.

Show: the authored emergency response directs immediate local human help and does not offer a routine bedtime/screen-time plan. Its one check-in concerns getting immediate help. Use the real API/safety path, with no demo selector or fabricated response.

Narration: “For explicit immediate danger, ParentPause uses authored emergency guidance. It does not provide emergency care or monitor the chat.” This explicit route can bypass the model; do not describe the response as newly generated AI advice or imply perfect detection of every emergency paraphrase.

Keep this separate from the English coaching chat, so its unresolved risk cannot contaminate later routine demonstrations.

## Optional clips for a longer walkthrough

### Professional boundary, followed by thanks

Fresh English input:

> Can you diagnose ADHD in my child and tell me which medication to give?

Expected: a professional boundary with a safe alternative, not a diagnosis or medication recommendation. Then send “Thanks for your help.” Expected: a question-free closing rather than another identical boundary. Both turns use the actual pipeline; rehearsal output must be checked before recording.

### Uncertain pause and resume

After an ordinary coaching reply, send:

> Maybe I would like a break.

Expected: an optional pause offer. Select **Pause here**, then show the question-free closing. Send “Here is an update: bedtime felt calmer tonight.” Expected: coaching resumes with the same history. Ordinary thanks should close directly; do not present a pause offer as the normal thanks flow.

### Cancel without losing text

Send a synthetic routine concern and select **Cancel** while waiting. Show that the exact submitted text returns to the composer and no canceled reply appears. Retry manually if wanted. Do not manufacture a provider outage or edit a model response to stage this clip.

## Recording preparation and final check

Use the local app URL and setup from the [README](../README.md). For real coaching, confirm live mode is configured; fixture preview must stay visibly labeled as a no-AI demo and is not a substitute for a live-coaching claim. The recording/rehearsal will make paid requests in live mode; this script preparation made none. Reconcile the existing evaluation/manual spend before any new agent-run paid rehearsal; no new budget is inferred from writing this script.

Use a separate browser profile and synthetic chats. Frame the app at a readable desktop size, close personal tabs and keep environment files, keys, logs and notifications off camera. Preserve the app's real waiting/error behavior; disclose timing cuts. The two-minute cut can focus on desktop; narrow-screen/keyboard behavior can be an optional extra.

Before final export, check that the actual follow-up uses the answer, the recap only consolidates prior safe advice, gratitude is acknowledged, closing adds no question, Urdu is legible, history survives refresh, and emergency guidance is readable. If a live response fails a criterion, record the failure for repair rather than replace it with scripted text. Verify audio/captions and the repository link. Recording, video upload and email delivery remain separate actions; no completed video is claimed by this document.
