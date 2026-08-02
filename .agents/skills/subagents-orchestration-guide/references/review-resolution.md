# Review Resolution

Use this procedure when a reviewer requests changes. It keeps review useful without allowing technical completeness or local consistency to expand the approved scope.

## 1. Assess Findings

The orchestrator classifies each actionable finding from its cited evidence:

| Decision | Use when |
|---|---|
| `apply` | The current artifact or implementation contradicts an approved requirement, accepted design decision, repository rule, or observed fact, or would remain incorrect, non-executable, or non-verifiable. |
| `decline` | The finding adds scope, reverses a recorded exclusion, requests optional hardening or external operation, duplicates existing proof, or costs more than its observable effect justifies. |
| `user_decision_required` | Resolution changes the product outcome, a confirmed requirement or exclusion, or a major approved design decision. |

For `apply`, give the author the finding, governing source, expected effect, and smallest sufficient correction. For `decline`, give the reviewer the governing source or observed evidence and the concrete reason the change is outside scope or not worth its cost.

## 2. Revise and Reconsider

Ask the responsible author to apply accepted corrections to the existing artifact or implementation. Then rerun the same reviewer with the changed artifact and the declined reasons as prior feedback.

The reviewer withdraws a declined finding when the reason is consistent with governing evidence. It may maintain the finding when existing or newly observed governing evidence still shows the result is incorrect, non-executable, or non-verifiable. A maintained non-blocking recommendation does not prevent progression.

## 3. Converge Internally

Each rerun reviews the current artifact or implementation normally and may report newly observed evidence-backed findings. The orchestrator reassesses the current findings through Section 1.

Continue revision and reconsideration while an applied correction or new evidence materially changes the artifact, implementation, evidence, or finding disposition. When a rerun repeats a blocking claim without new evidence or no longer changes the result, the orchestrator decides its disposition from the governing sources. Route a remaining unusable artifact or implementation through Orchestrator Escalation Resolution instead of starting the same Review Resolution again.

Return to the user only for `user_decision_required`, unavailable user-held authority, or an unauthorized irreversible action. Preserve completed work and unaffected findings when that happens.

## Handoff

Pass only:

- artifact or implementation paths;
- accepted findings with their governing basis and smallest correction;
- declined finding IDs with reasons and evidence;
- the observable condition the rerun must judge.
