---
name: implementation-approach
description: "Selects the smallest sufficient implementation strategy and verification boundary from current requirements and repository evidence."
---

# Implementation Approach

## Strategy Selection

Use this sequence when a design or task needs an implementation approach:

1. **Current evidence** — inspect the relevant responsibility, data/control path, representative repository pattern, and constraints that can change the choice.
2. **Direct MVP** — describe the simplest end-to-end change that delivers the confirmed outcome through the existing architecture and dependencies.
3. **Failure check** — test that Direct MVP against current requirements, verified constraints, observed problems, and evidence-backed material risks within scope.
4. **Targeted expansion** — add only what resolves a failed item. Prefer the sufficient option with the lowest lifecycle cost.
5. **Subtraction check** — remove a proposed addition when the failed item remains satisfied without it.

Possible future reuse, generic best practice, speculative edge cases, and optional hardening are not failed items. A path or file count is supporting evidence, not a scale or strategy rule.

For implementation agents, keep this analysis in the active execution context. Create a separate artifact only for a named downstream consumer. Design Docs and Work Plans record adopted decisions that control downstream implementation, plus a brief reason when a larger candidate was rejected.

## Slicing Choice

Choose the smallest slicing structure that preserves dependency order and yields observable progress:

- **Vertical** — one user- or consumer-visible outcome can be completed across its layers without first creating a shared foundation.
- **Foundation-first** — multiple required outcomes depend on the same contract or mechanism that must exist before any can work.
- **Hybrid** — one verified shared dependency comes first, followed by outcome-oriented slices.

Create phases from verified dependency order rather than architecture layers. Keep independently executable work separate when combining it would obscure ownership or verification.

## Verification Level

Select the narrowest level that exercises the boundary named by the requirement:

- **L1: Local** — a unit, pure transformation, local command, build, or artifact check.
- **L2: Integration** — interaction across components, persistence, processes, or another named integration boundary.
- **L3: End-to-end** — the complete user, browser, process, or service journey required by the acceptance criterion.

A broader check does not replace a required focused proof, and a focused check does not prove a wider boundary. Prefer evidence in this order when applicable: observable operation, focused test, then build/static evidence.

## Completion Check

- [ ] The approach delivers the confirmed outcome through existing patterns where sufficient.
- [ ] Every added mechanism resolves a current failed item.
- [ ] Task order follows verified dependencies rather than hypothetical rollout needs.
- [ ] Verification exercises the required observable boundary without adding an unnecessary wider lane.
