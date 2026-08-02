---
name: ai-development-guide
description: "Root-cause discipline, proportionate impact analysis, and implementation completeness assurance. Use when fixing bugs, reviewing code quality, refactoring, making technical decisions, or performing quality assurance."
---

# AI Development Guide

## Reference

Read [references/frontend.md](references/frontend.md) only for React or TypeScript frontend work whose changed behavior or quality failure needs those rules.

## Outcome Boundary

Deliver the confirmed outcome and keep the changed system correct. Investigate, repair, refactor, and verify only as far as one of these requires:

- a current requirement or accepted design decision;
- a dependency needed for that outcome;
- an observed failure or contradiction in the changed path;
- an evidence-backed material risk created or exposed by the change.

Report unrelated debt separately. Do not turn generic best practice, possible future reuse, speculative edge cases, or optional hardening into implementation scope.

## Root-Cause Discipline

When an observed failure exists:

1. Reproduce or identify the failing observable condition.
2. Trace the responsible control, data, or state path until the cause is supported by evidence.
3. Correct the cause at the smallest responsibility boundary that preserves the governing contract.
4. Verify the original failure and the affected contract.

Do not require a fixed number of “why” questions or a separate root-cause artifact. A direct correction is valid when the cause and proof are already evident. Avoid suppressing errors, weakening tests, adding unconditional fallbacks, or patching symptoms that leave the observed cause active.

## Proportionate Impact Analysis

Before changing code, inspect the target and enough representative callers, consumers, tests, configuration, and siblings to determine:

- the contract being changed or preserved;
- the directly affected responsibility and dependency direction;
- the observable verification that can prove the outcome;
- any adjacent file required for the same outcome.

When the change alters a public, shared, serialized, or persistent contract and its consumers are enumerable, account for every known consumer. For other changes, representative inspection is sufficient. Stop expanding the search when additional context cannot change the implementation or verification decision. Record findings in the active task or response only when another worker needs them.

## Design and Reuse Judgment

- Prefer the lowest-lifecycle-cost implementation that satisfies the current outcome.
- Reuse or extend an existing element when it owns the same responsibility and represents the repository’s current pattern.
- Keep similar local code separate when its responsibilities may evolve independently or abstraction adds more contract surface than it removes.
- Introduce shared state, public fields, modes, flags, fallbacks, abstractions, services, or dependencies only when current evidence requires them.
- Reconsider the approach when the change would alter an approved architecture decision, dependency direction, public contract, or irreversible data behavior. Repository-local reversible choices proceed without escalation.

## Error and Fallback Safety

Preserve useful error context and do not silently convert failures into success. Use a fallback only when a requirement, accepted design, or representative repository contract defines the degraded behavior. Add logging, metrics, or operational machinery only when the current requirement or repository practice needs it.

## Quality Assurance

Discover applicable checks from the changed file types, task verification methods, project manifests, configuration, and CI. Run:

1. the focused check that observes the changed behavior or artifact;
2. static analysis, formatting, build, unit, integration, or E2E commands that the repository or governing task requires for this change;
3. any wider check needed because the change crosses that boundary.

Do not manufacture a command, coverage threshold, environment, live external connection, or test lane when the repository and governing artifacts do not require it. A task-specific check already run by the implementation owner may be reused unless later fixes can invalidate it.

Fix failures caused by the current change and failures within required dependencies. Report unrelated baseline failures with evidence; they block completion only when they prevent the changed outcome from being verified.

## Completion Gate

- [ ] The implementation maps to the confirmed outcome or an evidence-backed required dependency or risk.
- [ ] An observed defect was corrected at its supported cause rather than hidden.
- [ ] Public, persistent, security, and error boundaries affected by the change remain correct.
- [ ] Applicable focused and repository-required checks pass, or an exact environmental limitation is reported without inventing external work.
- [ ] No speculative mechanism or unrelated cleanup was added to the task.
