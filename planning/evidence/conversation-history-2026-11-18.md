# Device-local conversation history — 18 November 2026

Owner requested a History tab for older conversations, explaining that the no-database requirement had been misinterpreted. In the interactive clarification the owner explicitly selected **Keep on this device**, described as browser local storage surviving refresh/reopen with deletion controls. This supersedes earlier page-memory-only/no-browser-storage requirements, without authorizing accounts, an app database or server conversation history.

Independent root/main verified at `fc15ac5`; previous uncommitted troubleshooting, conversation and polish work preserved. Primary Codex, exact underlying variant not exposed, no subagents, self-review only. Existing T07 tracker queried including closed items; work radar checked, session linked, reopened for implementation and returned to In Review after verification. No tracker content/comment disclosure, commit, push or deployment.

## Behavior and boundaries

- Conversation/History tabs have keyboard navigation and selected-panel semantics in English and Urdu. History lists earlier chats newest first, using the original first concern (or draft) and reply count. Long mixed-script titles truncate visually without changing their underlying text.
- Confirmed New conversation archives exact accepted turns and unsent text. Opening history archives the current conversation and restores the selected full transcript/draft. Context stays separate; historical response locales remain unchanged, and the next request includes only the restored conversation, retaining its safety context and eight-exchange limit.
- Browsing history does not abort an active request. Opening another conversation aborts it, restores submitted pending text as an unsent draft in its archive, and suppresses stale completion. Reopening does not automatically send text or make provider calls.
- Versioned browser localStorage persists the active chat, archived chats, drafts and current locale while content exists. Pending text is persisted as a draft; pending request objects, failures and live announcements are not restored. Strict schema validation rejects unknown roles, malformed responses, incomplete/reordered exchanges, duplicate IDs and incompatible versions. No silent transcript truncation or eviction.
- Confirmed per-chat deletion removes its archive. Confirmed Clear saved conversations removes all current/archived chats and drafts and deletes the storage key. Empty state removes the key; an empty page's locale alone is not persisted.
- Unreadable stored data is left untouched with a reset path. Blocked access, serialization bounds or failed writes retain usable page-memory state and explain the persistence limitation. Failed deletion explicitly says saved data may remain and points to browser site-data removal. Changed storage from another tab blocks further writes rather than overwriting it; the page retains its local state and explains reload consequences.
- Storage validation bounds are 4,000,000 JavaScript string characters for serialized data, 1,000 archived conversations, 100,000 UTF-16 code units per draft, and the existing complete eight-exchange maximum per chat. Browser quotas may be smaller. Exceeding a bound produces the saving notice, without dropping existing saved history.

No database, account, cross-device sync, server conversation store or conversation logging added. Storage is scoped to the same origin/browser profile/device; browser/private-session data clearing may remove it. Anyone using that profile can access it; the app does not encrypt it. Existing chats lost before this feature cannot be recovered. API transcripts remain untrusted, with server validation and full safety classification/review unchanged. Model/deadline/rate-limit configuration is unchanged. Authored closing copy no longer falsely states reload erases the chat; it still contains no question, reminder or monitoring promise.

README, product, architecture, safety/current conversation amendment, T07 packet, directive and reviewer handoff record the explicit scope correction. Earlier dated evidence is preserved as historical snapshots.

## Verification and rework

macOS, Node22.23.2/npm10.9.8 via task-local `PATH=/opt/homebrew/opt/node@22/bin:$PATH`:

- `npm run typecheck`: exit0.
- `npm test`: **572/572 across19files**, exit0.
- `npm run lint`: exit0.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: exit0, repeated after the final storage-hook implementation.
- `npm run test:journeys`: **94/94**, exit0, Chromium/WebKit. Includes existing safety/failure/cancel/retry/limit/accessibility cases and new history cases. The new history spec was strengthened while this run was active, so the final spec was rerun on both engines below.
- Sequential `npm run test:e2e`: **10/10**, `npm run test:presentational`: **10/10**, `npm run test:journeys -- history.spec.ts`: **6/6**, all exit0. The last run verifies final archive reload, original-context follow-up, delete/clear-all plus reload, EN/UR layout/axe, keyboard navigation and long mixed-script titles at320px.

Storage regressions cover remount/StrictMode hydration without an empty-state overwrite, exact drafts, full eight-exchange restoration, pending-to-draft recovery, corrupt data retention/reset, unavailable/quota storage, failed deletion and changed data from another tab. Existing reload-reset assertions were intentionally replaced with reload-restoration checks following the owner's explicit selection.

Early new component tests used a broad title selector that also matched Delete; corrected it to select the Open action. Typecheck caught Testing Library's unsupported `exact` option, which was removed. Lint rejected synchronous React state-setting for storage status inside effects; replaced it with an external storage subscription via `useSyncExternalStore`, then reran all tests/lint/build. Two documentation patch attempts failed because of unverified heading anchors; neither applied partial changes, and verified replacements were used afterward.

All browser requests use real local fixture handler/service/policy paths without paid inference or final-response browser mocking. History and reload tests exercise real browser localStorage. Font-ready synthetic screenshots under ignored `test-results/journeys` were inspected for Chromium English desktop and WebKit Urdu320px; readable, correctly directed and without horizontal overflow. This is static technical inspection, not native Urdu or physical-device approval.

The recorded project's dev process was verified before stopping for browser verification, then restarted detached on loopback with existing configuration. GET `http://127.0.0.1:3000` returns200 without an AI request. No new paid inference, budget reconciliation or human/release acceptance is claimed. T09 ambiguity/content/native/safeguarding/manual gates and prior paid-cost uncertainty remain pending. Changes remain uncommitted for owner review.
