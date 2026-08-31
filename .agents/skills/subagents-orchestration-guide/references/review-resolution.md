# Review Resolution

Use this procedure for reviewer findings and verifier discrepancies before they reach an author or another reviewer. It keeps independent evidence useful while the approved requirements and selected ADR decisions remain the scope boundary.

## 1. Assess Findings

Apply `reviewee-judgment` to the current findings and keep its problem groups, dispositions, reasons, and evidence in the active workflow context.

## 2. Revise and Reconsider

Invoke the responsible author when at least one `apply` finding or discrepancy exists, and pass only the `apply` findings or discrepancies. Then rerun the same reviewer or verifier with its original governing inputs, the changed artifact or implementation, and the rerun evidence required by that agent. When that agent accepts `prior_feedback`, include applied corrections and declined reasons; add the previous result and correction paths or diff only when its rerun boundary consumes them. Otherwise keep the dispositions in the active workflow context for orchestrator reassessment. An empty `apply` set proceeds directly to the next workflow step.

The reviewer withdraws a declined finding when the reason is consistent with governing evidence. It may maintain the finding when existing or newly observed governing evidence still shows the result is incorrect, non-executable, or non-verifiable. A maintained non-blocking recommendation does not prevent progression.

## 3. Converge Internally

Each rerun applies the reviewer's or verifier's stated rerun boundary to the current artifact or implementation and may report newly observed evidence-backed findings within that boundary. The orchestrator reassesses the current findings through Section 1.

Continue revision and reconsideration while an applied correction or new evidence materially changes the artifact, implementation, evidence, or finding disposition. When a rerun repeats a blocking claim without new evidence or no longer changes the result, the orchestrator reassesses the remaining claim through Section 1. Route a remaining unusable artifact or implementation through Orchestrator Escalation Resolution instead of starting the same Review Resolution again.

## Handoff

Pass only:

- artifact or implementation path or ADR batch paths;
- complete `apply` findings or discrepancies unchanged with their dispositions;
- declined finding IDs with reasons and evidence;
- the previous complete result when the rerun contract uses it to preserve unaffected evidence;
- the observable condition the rerun must judge.
