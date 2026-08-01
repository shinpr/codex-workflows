---
name: requirement-convergence
description: "Separates the outcome from proposed requirements, records exclusions, and estimates structural cost before design. Use when requirements enter a workflow or scope is reconsidered."
---

# Requirement Convergence

## Purpose

Capable models can make an oversized or misdirected request technically coherent and implement it faithfully. Converge **what is worth building** before design decides how to build it.

## Convergence Record

| Field | Pass condition |
|-------|----------------|
| `outcome` | One observable result. Every buildable requirement serves it. |
| `requirements[]` | Every item is labeled `current-state`, `desired-future`, or `speculative`. |
| `nonGoals[]` | The user authored the exclusions or explicitly stated there are none. |
| `cost` | A rough band with structural evidence and remaining unknowns. |

`cost` is an early requirements estimate, not a design or work-plan estimate. It is intentionally approximate: enough to challenge low-value scope without pretending shallow inspection can produce exact effort.

Each field has readiness `ready`, `weak`, or `weak-but-explicit`. Only the user can accept `weak-but-explicit`. The record is converged when every applicable field is `ready` or `weak-but-explicit`.

Use [references/criteria.md](references/criteria.md) to judge each field.

## Hearing Protocol

The orchestrator owns user interaction. It runs the hearing after an analysis step has produced scope facts.

1. Present observed scope facts separately from their inferred implications.
2. Ask only about fields below `ready`, at most two questions per message.
3. Record answers in the user's wording.
4. If an answer still fails its pass condition, ask once more. Mark it `weak-but-explicit` only when the user agrees to proceed unresolved.
5. Re-judge the updated record before design begins. Re-run structural analysis only when an answer changes scope or cost evidence; otherwise the orchestrator applies the field's pass condition directly.

## Storage Protocol

| Stage | Carrier |
|-------|---------|
| Before a durable document exists | The compact `convergence` object in the current handoff |
| PRD exists | `Success Criteria` holds `outcome`; `Future / Out of Scope` holds `nonGoals` and speculative requirements |
| No PRD, Design Doc exists | Design Doc `Requirement Convergence` holds the record |
| Any Design Doc | `Requirement Convergence` records `weak-but-explicit` fields as open questions |
| No PRD or Design Doc | Carry the compact record one hop to the implementation plan |

After persistence, downstream agents receive the document path and read the record there. The persistence reviewer may receive the object once to verify fidelity; later prompts do not keep copying it.

## Downstream Contract

1. Read the convergence record from the current handoff or its durable document.
2. Exclude `nonGoals` and `speculative` requirements from the current change. A speculative item becomes buildable only after the user promotes it to `desired-future`.
3. Keep `weak-but-explicit` fields visible as open questions. Escalate only when the current work depends on resolving one.

## Quality Checklist

- [ ] Scope facts and inferences are distinguished
- [ ] Every buildable requirement traces to the outcome
- [ ] `nonGoals` came from the user or `userAgreedNone` is true
- [ ] Cost is approximate and evidence-backed
- [ ] Every applicable field is `ready` or user-approved `weak-but-explicit`

## References

- [references/criteria.md](references/criteria.md) — field judgments, cost bands, challenge intensity, and solution-in-disguise test
