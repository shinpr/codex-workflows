---
name: testing
description: "Repository-aware test execution rules for TDD, observable proof, and boundary selection. Use when writing, reviewing, or fixing tests."
---

# Testing

## Reference

Read [references/typescript.md](references/typescript.md) only for TypeScript tests in web frontend work, including React, RTL, MSW, and Playwright tests. It does not apply to backend or non-web TypeScript tests.

## Governing Sources

Use test commands, thresholds, boundaries, fixtures, and conventions from the repository, task, Work Plan, Design Doc, or test skeleton. When these sources are silent, select the smallest repository-supported proof without introducing a new project-wide default.

## TDD Gate

For behavior-changing implementation:

1. **RED**: Add or select a test that observes the required behavior. Run it and confirm it fails for the targeted missing behavior or regression.
2. **GREEN**: Make the smallest implementation change that satisfies the behavior. Run the focused test.
3. **REFACTOR**: Improve the changed code without changing the contract. Re-run the focused test.
4. **VERIFY**: Run the repository's required quality command and every wider check required by the task boundary.

Documentation, pure configuration, and disposable exploration do not require a RED phase. A productionized spike must gain tests before completion.

## Proof Selection

- Test through the public or externally observable boundary named by the acceptance criterion or proof obligation.
- Keep a dependency real when that dependency is the boundary under proof; isolate external I/O only when the selected test level permits it.
- Use integration or E2E tests for persistence, process, browser, service, or cross-component claims that unit tests cannot observe.
- A broader test does not replace a required focused check, and a focused test does not prove a wider boundary.

## Capability Probe Postconditions

Evidence is substantive only when an executed assertion observes the exact consumer-visible postcondition.

- A helper result, mock call, source match, build success, or zero-test run does not prove behavior unless that is the named claim.
- Intentional absence is substantive when absence is the expected postcondition.
- State-changing behavior must assert relevant before → action → after state, including persistence or rollback semantics when applicable.
- For a changed route or alternate input path, exercise that path explicitly; evidence from another route is not interchangeable.

## Test Integrity

- Keep tests deterministic, isolated, and active.
- Use meaningful assertions on results, state, or observable effects.
- Keep each existing test active with its required behavior and failure sensitivity. Change an expectation only when a cited governing source changes that behavior; replace the test only when a stronger proof covers the same failure boundary.
- Use project-scoped setup and guaranteed cleanup for mutated state or external resources.
- Treat coverage as diagnostic unless a governing source defines a threshold.

## Completion Gate

- [ ] Focused tests pass; when the TDD Gate applies, RED failed for the targeted missing behavior or regression; otherwise RED is recorded as not applicable with the reason
- [ ] Required integration/E2E boundary is exercised
- [ ] Every cited behavior has a consumer-visible capability probe
- [ ] Repository-defined quality commands pass
- [ ] No required test is skipped, hollow, or dependent on execution order
- [ ] Mutated state and resources are restored
