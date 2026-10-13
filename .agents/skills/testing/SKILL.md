---
name: testing
description: "Repository-aware rules for choosing which tests a change needs, one owning test per claim, observable proof, and test integrity. Use when writing, reviewing, or fixing tests."
---

# Testing

Tests guarantee accepted behavior, and the next agent reads every existing test as a requirement to preserve. A brittle, duplicated, or implementation-shaped test therefore becomes a false requirement: it gets worked around, and the workaround leaves debt in the implementation. Keep the set of tests whose proof is worth its maintenance.

## Reference

Read [references/typescript.md](references/typescript.md) only for TypeScript tests in web frontend work, including React, RTL, MSW, and Playwright tests. It does not apply to backend or non-web TypeScript tests.

## Governing Sources

Use test commands, thresholds, boundaries, fixtures, and conventions from the repository, task, Work Plan, Design Doc, or test skeleton. When these sources are silent, select the smallest repository-supported proof without introducing a new project-wide default.

## Test Selection

- Prove accepted behavior by default through integration and E2E tests at the boundary users and callers observe. Add a unit test for logic whose cases one representative boundary test cannot prove, such as calculations, parsing, or branching rules.
- Each behavioral claim is owned by one test: such logic by its unit test, other behavior by the test at the narrowest integration or E2E boundary where it is observable. A test at a wider boundary or in a variant (viewport, device, role) proves what that boundary or variant adds, such as wiring, mapping, persistence, rendering, or navigation, and keeps at most one representative case of a rule owned elsewhere.
- For non-behavioral work or behavior already proven at the required boundary, use the smallest applicable verification instead of creating duplicate proof. Reuse existing evidence only while it remains valid for the changed behavior. Documentation, pure configuration, and disposable exploration need no new test. A productionized spike must gain tests before completion. Repository-required checks still apply.

## Proof Selection

- Test through the public or externally observable boundary named by the acceptance criterion or proof obligation.
- Keep a dependency real when that dependency is the boundary under proof; isolate external I/O only when the selected test level permits it.

## Capability Probe Postconditions

Evidence is substantive only when an executed assertion observes the exact consumer-visible postcondition.

- A helper result, mock call, source match, build success, or zero-test run does not prove behavior unless that is the named claim.
- Intentional absence is substantive when absence is the expected postcondition.
- State-changing behavior must assert relevant before → action → after state, including persistence or rollback semantics when applicable.
- For a changed route or alternate input path, exercise that path explicitly; evidence from another route is not interchangeable.

## Test Integrity

- Keep tests deterministic, isolated, and active.
- Use meaningful assertions on results, state, or observable effects.
- Preserve proof of user-required behavior and actual consumer contracts. When an authorized reduction removes an internal mechanism or unwanted behavior, remove or update its obsolete tests together with the affected design; tests do not make that mechanism mandatory. Verify the retained outcome and changed boundary rather than weakening assertions to hide a remaining defect.
- Use project-scoped setup and guaranteed cleanup for mutated state or external resources.
- Treat coverage as diagnostic unless a governing source defines a threshold.

## Completion Gate

- [ ] Required tests pass, and each changed behavioral claim has one owning test
- [ ] Required integration/E2E boundary is exercised
- [ ] Every cited behavior has a consumer-visible capability probe
- [ ] Repository-defined quality commands pass
- [ ] Required tests are active, substantive, isolated, and order-independent
- [ ] Mutated state and resources are restored
