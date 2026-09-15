---
name: implementation-approach
description: "Selects the smallest sufficient implementation strategy and verification boundary from current requirements and repository evidence."
---

# Implementation Approach

## Strategy Selection

Use this sequence when a design or task needs an implementation approach:

1. **Current evidence** — inspect the relevant responsibility, data/control path, representative repository pattern, and constraints that can change the choice.
2. **Direct MVP** — identify the simplest complete path to the user's required result, including no change or removing unnecessary behavior when sufficient. A previously passed design is a revisable starting point.
3. **Necessity before detail** — establish a concrete required result that this path cannot deliver before designing an extra mechanism. Discovery of a concern or a potential consumer supplies a candidate, not new requirements.
4. **Selection** — consider subtraction and existing behavior first. Adopt an addition only when those cannot satisfy the requirement and its supported benefit justifies total UX, runtime, implementation, testing, documentation, and maintenance cost. Evidence alone does not select it.
5. **Detail and stop** — define contracts, states, error handling, and proof only for the selected mechanisms. Stop when the required result and sufficient verification are executable; further technically valid possibilities remain unadopted.

Possible future reuse, generic best practice, speculative edge cases, and optional hardening are not failed items. A path or file count is supporting evidence, not a scale or strategy rule.

Keep this analysis in the active execution context. In an existing design rationale or handoff, retain only the decision-changing reason a material addition is needed over the direct path. Evaluate its layers, states, outputs, and tests together as one mechanism. Ordinary local choices need no separate record or alternative inventory.

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
