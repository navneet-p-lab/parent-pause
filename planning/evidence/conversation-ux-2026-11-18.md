# Manual-testing conversation UX changes

18November2026. Owner requested richer waiting placeholders, clearing submitted input, immediate thread echo, a pause offer after satisfaction, a question-free closing after confirmation, and Terra as default. Independent main `fc15ac5`; prior uncommitted troubleshooting work preserved. Primary Codex, self-review, no subagents. The [v2 amendment](../contracts-conversation-v2.md) records the explicitly expanded contract/safety scope.

## Delivered

Waiting displays multiple decorative reply placeholders and changing hints every3seconds, with reduced-motion support and one existing live-region announcement. This is waiting feedback, not measured stage completion. Send clears the composer and immediately renders its parent message from pending state; scrolling keeps it visible. Cancel, error or locale invalidation restores exact submitted text. Accepted history and stale-request protections remain.

Routine satisfaction can produce an authored pause offer with optional Pause here/Keep talking controls or typed replies. Confirmation produces an authored closing with no check-in/question and an update invitation. Later updates resume the same open-page thread with history. Copy warns that reload clears chat. No durable storage, reminders or monitoring added; the existing short-thread limit remains.

Both pause kinds pass full-context classification and review of the exact authored candidate. Known/unresolved risk, ambiguity and professional boundaries cannot become a pause. Resolution claims retain generated-candidate reassessment. Blocks/outages stay unavailable; review escalation returns urgent authored guidance. Routine responses retain one check-in; paused is the owner-requested exception.

Terra (`gpt-6.1-terra`) is default for missing/blank model configuration, the example configuration and ignored owner settings; explicit overrides remain. Sanitized configuration read verifies live mode/Terra/key present without displaying the key. [Official model documentation](https://developers.openai.com/api/docs/models/gpt-6.1-terra) was consulted. No paid request was made in this UX pass, and earlier budget/manual traffic still needs reconciliation before another evaluation.

## Fresh verification

macOS Node22.23.2/npm10.9.8, task-local `/opt/homebrew/opt/node@22/bin` PATH:

| Command | Result |
|---|---|
| `npm run typecheck` | exit0 |
| `npm test` | exit0;525/525 across17files |
| `npm run lint` | exit0 |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | exit0 |
| `npm run test:e2e` | exit0;10/10 Chromium/WebKit production shell |
| `npm run test:presentational` | exit0;10/10 bilingual layout/font/text scaling |
| `npm run test:journeys` | exit0;84/84 Chromium/WebKit real-network journeys |
| Restarted app GET `/` | HTTP200 |

Browser configurations ran sequentially after build with isolated key-free fixtures. They exercise actual handler/service/policy/contracts with injected sessions, without final browser response mocking or paid inference. New journeys cover EN/UR satisfaction→pause confirmation→closing→update, immediate echo/empty pending composer, multiple placeholders, reduced motion and cancel restoration. Existing safety/failure/accessibility/retry/stale/clear/reload/thread-limit journeys still pass. Provider regressions enforce classify→review only for authored pause candidates, prevent repeated review or subsequent generation, and preserve block/escalation behavior.

Initial checks caught an ES2022-incompatible array helper, old pending-draft assertions and new-test type/matcher issues. Corrected before final525/525/typecheck/lint/build and104/104 aggregate browser pass. No dependency changes or engine bypass. This is fixture/technical verification, not native/human approval or live semantic evaluation of new prompts; earlier evaluations used older revisions.

Stopped only this session's tracked dev process to release the shared Next dev lock for journeys; restarted a detached loopback app with existing key, Terra and exact origin `http://127.0.0.1:3000`. Ignored PID/log files stay local. No commit/push/deployment or completed T09/release claim. App remains available for owner manual testing.
