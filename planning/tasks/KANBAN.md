# ParentPause kanban execution guide

Reconciled 18 November 2026. The current workspace initially returned zero native tasks despite the earlier creation log. All 11 cards were recreated and read back, with native dependencies. Filter Tasks by `parentpause` to see the board. Task 1 is T00 bootstrap; original packet IDs remain unchanged.

T00 and T01 are accepted at `2097a2c` and `47728e2`. T02–T04 are implemented and technically verified for In Review; see [parallel evidence](../evidence/t02-t04-parallel.md). Git/native history records actual commit acceptance. T05–T10 remain To Do. Read the [session directive](../09-session-directive.md) before claiming work.

| Task | Packet | Board placement / completion gate | Dependencies |
|---|---|---|---|
| 1 | [T00 bootstrap](T00-bootstrap.md) | Done; accepted `2097a2c` | None |
| 2 | [T01 contracts](T01-contracts.md) | Done; accepted `47728e2` | T00 |
| 3 | [T02 localized shell](T02-localized-shell.md) | In Review; approved commit pending | T01 |
| 4 | [T03 response cards](T03-response-cards.md) | In Review; approved commit pending | T01 |
| 5 | [T04 safety](T04-safety-routing.md) | In Review; approved commit pending | T01 |
| 6 | [T05 provider/harness](T05-provider.md) | To Do | T01, T04 |
| 7 | [T06 service/API](T06-service-api.md) | To Do | T04, T05 |
| 8 | [T07 conversation](T07-conversation-ui.md) | To Do | T02, T03, T06 |
| 9 | [T08 browser journeys](T08-browser-tests.md) | To Do | T07 |
| 10 | [T09 release review](T09-release-review.md) | To Do; live/native/human gates | T08 |
| 11 | [T10 delivery](T10-delivery.md) | To Do; publication/video destinations | T09 |

## Execution and ownership

After T00 acceptance and commitment, T01 freezes schemas, token names and presentational props. T02/T03 can proceed independently of the T04→T05→T06 backend track. T07 integrates them; T08, T09 and T10 follow. Actual dependencies determine readiness.

Concurrent/delegated agent execution requires authorization or applicable instructions. If used, isolate worktrees and assign one packet per session. T02 owns tokens/dictionaries/shell, T03 renderers, T04 safety templates/prompts, T05 provider/coach prompt, T06 orchestration/transport. The integrator owns manifests/config after T00 and contract revisions after T01.

Check work radar before claiming a card, link the session, and set In Progress. Record exact tests and risks, then move verified work to In Review. Integrate through the approved commit workflow before closing dependencies. Append factual interactions/handoffs to [the AI log](../07-agent-log.md).

## External gates and local limitations

T05 completes deterministic adapter/harness tests. T09 owns full-pipeline live evaluation and final model selection after T06, plus native Urdu/human review. T10 needs repository/video destinations when artifacts are reviewable.

This workspace has no team connection. Metadata and full local body snapshots persist, but collaborative body writes fail; retrying the first body did not resolve it. Team/cross-machine sync is unverified. Keep private local issue keys out of public commits and submission documents. Markdown packets and this map travel with Git; the native local board does not.

All 11 local bodies were read back with acceptance/handoff sections. Native readiness reported only T00 ready and no cycles before its baseline commit. Board placement does not establish implementation of downstream work.
