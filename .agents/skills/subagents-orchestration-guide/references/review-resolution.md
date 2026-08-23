# Review Resolution

Use this procedure for reviewer findings and verifier discrepancies before they reach an author or another reviewer. It keeps independent evidence useful while the approved requirements and selected ADR decisions remain the scope boundary.

## 1. Assess Findings

The orchestrator classifies each finding or discrepancy from its cited evidence. For an unsupported or overbroad document claim, first test whether removing or narrowing the claim preserves the confirmed requirements and accepted decisions; use that reduction instead of creating implementation work.

| Decision | Use when |
|---|---|
| `apply` | The current artifact or implementation contradicts an approved requirement, the selected decision of an accepted ADR, repository rule, or observed contract, or would remain incorrect, non-executable, or non-verifiable. |
| `decline` | The finding adds scope, reverses a recorded exclusion, requests optional hardening or external operation, duplicates existing proof, or costs more than its observable effect justifies. |
| `user_decision_required` | Resolution changes the product outcome, a confirmed requirement or exclusion, or a major approved design decision. |

For `apply`, pass the complete finding or discrepancy unchanged with its disposition. For `decline`, give the originating reviewer or verifier the governing source or observed evidence and the concrete scope mismatch or cost-to-effect mismatch. Keep the dispositions in the active workflow context as the complete resolution record.

## 2. Revise and Reconsider

Invoke the responsible author when at least one `apply` finding or discrepancy exists, and pass only the `apply` findings or discrepancies. Then rerun the same reviewer or verifier with its original inputs and the changed artifact or implementation. When that agent accepts `prior_feedback`, include the applied corrections and declined reasons; otherwise keep the dispositions in the active workflow context for orchestrator reassessment. An empty `apply` set proceeds directly to the next workflow step.

The reviewer withdraws a declined finding when the reason is consistent with governing evidence. It may maintain the finding when existing or newly observed governing evidence still shows the result is incorrect, non-executable, or non-verifiable. A maintained non-blocking recommendation does not prevent progression.

## 3. Converge Internally

Each rerun checks the current artifact or implementation normally and may report newly observed evidence-backed findings. The orchestrator reassesses the current findings through Section 1.

Continue revision and reconsideration while an applied correction or new evidence materially changes the artifact, implementation, evidence, or finding disposition. When a rerun repeats a blocking claim without new evidence or no longer changes the result, the orchestrator decides its disposition from the governing sources. Route a remaining unusable artifact or implementation through Orchestrator Escalation Resolution instead of starting the same Review Resolution again.

Return to the user only for `user_decision_required`, unavailable user-held authority, or an unauthorized irreversible action. Preserve completed work and unaffected findings when that happens.

## Handoff

Pass only:

- artifact or implementation path or ADR batch paths;
- complete `apply` findings or discrepancies unchanged with their dispositions;
- declined finding IDs with reasons and evidence;
- the observable condition the rerun must judge.
