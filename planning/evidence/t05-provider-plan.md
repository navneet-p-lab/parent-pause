# T05 implementation plan

Input: `a35f8c6`, frozen `t01-v1`, T04 policy/prompt handoff. Git root is this independent repository; initial working tree clean. Native board confirms T00–T04 accepted. T05 is ready; T06 depends on T05 acceptance, and T07 depends on T06. This session implements only T05.

1. Add pinned official OpenAI SDK, server-only import guards and an opt-in TypeScript evaluation command. Recheck inherited dependency advisory before changing dependencies; integrator owns manifests/configuration.
2. Validate server configuration without reading or logging credentials. Require an explicit runtime model, reject production fixtures, and expose no browser-selectable provider mode. No paid calls in this session.
3. Export strict wire JSON schemas and implement classify/generate/review operations with full untrusted context separated from instructions. Validate application output after wire parsing. One request session has a shared 20-second deadline, three ordered calls maximum, no SDK retries, bounded output, cancellation and sanitized failures.
4. Add a coaching prompt using the T04 risk decisions. Keep orchestration, endpoint and UI in T06/T07.
5. Add a dry-run-first synthetic evaluation harness with candidate comparison, held-out cases, sequential real setup replies, call caps, revisions, token/latency/route records and empty human score fields. Current live mode is a direct-provider diagnostic; an injectable pipeline seam supports later T09 evaluation. AI-written Urdu cases are explicitly not native-authored.
6. Run meaningful fake-transport/configuration/harness tests and the existing regression suites; inspect client bundles for server dependencies. In parallel, a read-only reviewer in an isolated worktree checks acceptance and an implementation snapshot. Fix findings, add regressions and revalidate.
7. Record exact evidence and remaining live/native/human gates, move T05 to In Review, and submit all session changes through the required Nimbalyst commit widget. Record the actual SHA and close the card only after the commit exists.

Parallelism: T05/T06/T07 implementation is sequential under the packet dependencies. Technical review can overlap T05 implementation; no concurrent edits to shared files or manifests. Primary Codex implements and integrates; a separate Codex agent reviews in `/private/tmp/parentpause-t05-review`, without model override.
