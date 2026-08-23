---
name: requirement-convergence
description: "Converges future-state requirements around outcome, exclusions, and rough cost. Use when users ask 'do we need this?', 'how far should we go?', or request a feature or scope change."
---

# Requirement Convergence

## Purpose

Capable models can make an oversized or misdirected request technically coherent and implement it faithfully. Converge **what is worth building** before design decides how to build it.

Apply this skill to future-state Design Doc and implementation flows. Reverse-engineered/as-is documentation is outside its scope. Requirement Convergence decides what to build; `implementation-approach` decides the smallest sufficient way to build the converged scope.

## Convergence Record

| Field | Pass condition |
|-------|----------------|
| `outcome` | One observable result. Every buildable requirement serves it. |
| `requirements[]` | Every item is labeled `current-state`, `desired-future`, or `speculative`. |
| `nonGoals[]` | The user decided each exclusion or explicitly stated there are none. |
| `cost` | A rough band with structural evidence and remaining unknowns. |

`cost` is an early requirements estimate, not a design or work-plan estimate. It is intentionally approximate: enough to challenge low-value scope without pretending shallow inspection can produce exact effort.

All four fields apply whenever Requirement Convergence runs. Each field has readiness `ready`, `weak`, or `weak-but-explicit`. Only the user can accept `weak-but-explicit`. The record is converged when every field is `ready` or `weak-but-explicit`.

Use [references/criteria.md](references/criteria.md) to judge each field.

## Hearing Protocol

The orchestrator owns user interaction. It runs the hearing after an analysis step has produced scope facts.

1. Present observed scope facts separately from their inferred implications.
2. Ask only about fields below `ready`, at most two questions per message.
3. Record answers in the user's wording.
4. If an answer still fails its pass condition, ask once more. Mark it `weak-but-explicit` only when the user agrees to proceed unresolved.
5. Re-judge the updated record before design begins. Re-run structural analysis only when an answer changes scope or cost evidence; otherwise the orchestrator applies the field's pass condition directly.

## Storage Protocol

| Flow state | Carrier |
|------------|---------|
| Before persistence | Compact `convergence` object in the current handoff |
| PRD flow | `Success Criteria` holds `outcome`; the requirement boundary holds current requirements and user-decided `nonGoals` |
| Design Doc is the first durable document | `Overview` holds `outcome`; `Requirement Boundary` holds current requirements and user-decided `nonGoals` |
| Small direct implementation | Compact record embedded in the single task file's `Governing Sources` |

Persist `weak-but-explicit` outcome, current requirements, and non-goals as open questions. Keep speculative ideas, evaluation requests, prescribed mechanisms, and unselected candidates in the active convergence context only until scope is confirmed; durable downstream documents contain the resulting current requirements and selected conclusions. `cost` is also ephemeral: use it for the requirements challenge, then let Structural Scale select the workflow and let design or planning produce later estimates. A Small-flow task file carries only `outcome`, current requirements, `nonGoals`, and their readiness in `Governing Sources`; its executor receives only that task path. After PRD or Design Doc persistence, downstream agents receive the document path. The persistence reviewer may receive the object once to verify fidelity.

## Downstream Contract

1. Read the convergence record from the current handoff or its durable document.
2. Build the current change from `desired-future` requirements and keep recorded `nonGoals` outside implementation. A speculative item becomes buildable only after the user promotes it to `desired-future`; until then it remains outside durable implementation documents.
3. Keep `weak-but-explicit` fields visible as open questions. Escalate only when the current work depends on resolving one.

## Quality Checklist

- [ ] Scope facts and inferences are distinguished
- [ ] Every buildable requirement traces to the outcome
- [ ] Every non-goal is user-decided, and an empty `nonGoals` list reflects the user's explicit choice of none
- [ ] Cost is approximate and evidence-backed
- [ ] Every field is `ready` or user-approved `weak-but-explicit`

## References

- [references/criteria.md](references/criteria.md) — field judgments, cost bands, challenge intensity, and solution-in-disguise test
