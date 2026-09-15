---
name: ai-development-guide
description: "Root-cause discipline, proportionate impact analysis, and implementation completeness assurance. Use when fixing bugs, reviewing code quality, refactoring, making technical decisions, or performing quality assurance."
---

# AI Development Guide

## Reference

Read [references/frontend.md](references/frontend.md) only for React or TypeScript frontend work whose changed behavior or quality failure needs those rules.

## Outcome Boundary

Deliver the user's required outcome with the least justified total complexity. Unnecessary implementation creates maintenance, verification, operational, and review obligations. Every role is responsible for avoiding those obligations, including by correcting upstream choices.

Phase passage permits progress; it does not prove a technical means is necessary. Reconsider and remove or supersede means recorded in a Design Doc, ADR, plan, AC, or test when the required outcome remains satisfied. Preserve user-required outcomes, explicit constraints, actual consumer contracts, and external-action authority. For authorized feature removal, check remaining consumers; the removed entry point and its now-unused backend do not create a preservation obligation. Coordinate affected source and consumer updates through the orchestrator; prior passage alone does not require another user decision.

Investigate, repair, refactor, and verify only as far as one of these requires:

- a user-required outcome or explicit constraint;
- a dependency needed for that outcome;
- an observed failure or contradiction in the changed path;
- an evidence-backed material risk created or exposed by the change.

Evidence establishes a candidate, not an obligation. Adopt work only when it is necessary now and its benefit justifies total lifecycle cost over no change, subtraction, or reuse. A required outcome defect still needs a sufficient response. Keep unrelated debt outside the change.

## Root-Cause Discipline

When an observed failure exists:

1. Reproduce or identify the failing observable condition.
2. Trace the responsible control, data, or state path until the cause is supported by evidence.
3. Correct the cause at the smallest responsibility boundary that preserves the governing contract.
4. Verify the original failure and the affected contract.

Stop causal questioning when the evidence supports the responsible path and its verification. Apply a direct correction when the cause and proof are already evident. Keep root-cause reasoning in the active task or response; create a separate artifact only for a named downstream consumer. Preserve error visibility and test strength, and correct the observed cause rather than masking it with an unconditional fallback or symptom patch.

## Proportionate Impact Analysis

Before changing code, inspect the target and enough representative callers, consumers, tests, configuration, and siblings to determine:

- the contract being changed or preserved;
- the directly affected responsibility and dependency direction;
- the observable verification that can prove the outcome;
- any adjacent file required for the same outcome.

When the change alters a public, shared, serialized, or persistent contract and its consumers are enumerable, account for every known consumer. For other changes, representative inspection is sufficient. Stop expanding the search when additional context cannot change the implementation or verification decision. Record findings in the active task or response only when another worker needs them.

For an observed bug or regression, inspect adjacent cases that share its supported cause, contract, or state boundary. Include an adjacent case in the change only when leaving it unchanged would keep the same in-scope failure active.

## Design and Reuse Judgment

- Treat complexity as cost, never as evidence of value. Additional user decisions, settings, modes, concepts, outputs, persistent state, and implementation paths earn their cost only when a confirmed current need cannot be served by a smaller existing or default behavior and the observable benefit justifies the total UX and lifecycle burden.
- Prefer the lowest-total-complexity implementation that satisfies the current outcome.
- Reuse or extend an existing element when it owns the same responsibility and represents the repository’s current pattern.
- Keep similar local code separate when its responsibilities may evolve independently or abstraction adds more contract surface than it removes.
- Introduce shared state, public fields, modes, flags, fallbacks, abstractions, services, or dependencies only when current evidence requires them.
- Resolve technical reductions within the authorized outcome, updating affected design assumptions and proof. Return changes to user-required outcomes, explicit constraints, actual consumer obligations, or irreversible-action authority to the orchestrator; an internal architecture change alone is not a user approval gate.

## Error and Fallback Safety

Preserve useful error context and keep failures observable. Limit fallbacks to degraded behavior defined by a requirement, accepted design, or representative repository contract. Limit logging, metrics, and operational machinery to those supported by the current outcome or representative repository practice.

## Quality Assurance

Discover applicable checks from the changed file types, task verification methods, project manifests, configuration, and CI. Run:

1. the focused check that observes the changed behavior or artifact;
2. static analysis, formatting, build, unit, integration, or E2E commands that the repository or governing task requires for this change;
3. any wider check needed because the change crosses that boundary.

Limit checks, thresholds, environments, external connections, and test lanes to those required by the repository or governing artifact. Reuse valid task-specific evidence; rerun it after a later fix that can invalidate it.

Fix failures caused by the current change and failures within required dependencies. Report unrelated baseline failures with evidence; they block completion only when they prevent the changed outcome from being verified.

## Completion Gate

- [ ] The implementation maps to the confirmed outcome or an evidence-backed required dependency or risk.
- [ ] An observed defect was corrected at its supported cause rather than hidden.
- [ ] An observed failure does not remain active in an adjacent in-scope case that shares the same supported cause.
- [ ] Public, persistent, security, and error boundaries affected by the change remain correct.
- [ ] Applicable focused and repository-required checks pass, or an exact environmental limitation is reported.
- [ ] Every added mechanism or cleanup item is required by the confirmed outcome or its evidence-backed dependency or risk.
