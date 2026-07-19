---
name: testing
description: "Testing principles including TDD, test quality, coverage standards, and test design. Use when: writing tests, designing test strategies, reviewing test quality, or following Red-Green-Refactor cycle."
---

# Testing Principles

## Language-Specific References

For language-specific testing patterns, also read:
- **TypeScript (Vitest/RTL/Playwright)**: [references/typescript.md](references/typescript.md)

## Core Testing Philosophy

1. **Tests are First-Class Code**: Maintain test quality equal to production code
2. **Fast Feedback**: Tests should run quickly and provide immediate feedback
3. **Reliability**: Tests should be deterministic and reproducible
4. **Independence**: Each test should run in isolation

## TDD Process [MANDATORY for all code changes]

**Execute this process for every code change:**

### RED Phase
**STEP 1**: Write test that defines expected behavior
**STEP 2**: Run test
**STEP 3**: Confirm the test fails for the targeted missing behavior or regression. If it passes before implementation, verify that it can fail for the targeted defect; then determine whether the behavior is already implemented or the test does not exercise the intended failure mode.

### GREEN Phase
**STEP 1**: Write MINIMAL code to make test pass
**STEP 2**: Run test
**STEP 3**: Confirm test PASSES

### REFACTOR Phase
**STEP 1**: Improve code quality (eliminate duplication, improve naming)
**STEP 2**: Run test
**STEP 3**: Confirm test STILL PASSES

### VERIFY Phase [MANDATORY - 0 ERRORS REQUIRED]
**STEP 1**: Execute ALL quality check commands for your language/project
**STEP 2**: Fix any errors until ALL commands pass with 0 errors
**STEP 3**: Confirm no regressions

**ENFORCEMENT**: Cannot proceed to next phase with ANY quality check failures

### TDD Exceptions (no TDD required)
- Pure configuration files
- Documentation only
- Emergency fixes (but add tests immediately after)
- Exploratory spikes (discard or rewrite with tests before merging)
- Build/deployment scripts (unless they contain business logic)

## Quality Requirements [MANDATORY]

### Coverage

- Treat coverage as a diagnostic signal for finding untested areas, not a target. Targets get gamed into trivial tests.
- Concentrate tests on critical paths, business logic, and behavior whose regression would matter.
- Prioritize meaningful assertions over the coverage number. Any required threshold comes from the project's CI, task file, work plan, or Design Doc.

### Test Characteristics

All tests MUST be:

- **Independent**: No dependencies between tests
- **Reproducible**: Same input always produces same output
- **Fast**: Complete the full test suite within the project's accepted feedback window and flag suites that materially slow local iteration or CI
- **Self-checking**: Clear pass/fail without manual verification
- **Timely**: Written close to the code they test

**ENFORCEMENT**: Tests failing ANY characteristic MUST be fixed immediately

## Test Level Selection

- **Unit/local**: Exercise one unit or in-process behavior and isolate external I/O
- **Integration**: Exercise the real component, persistence, process, or contract boundary named by the proof obligation
- **End-to-end**: Exercise the complete user, browser, process, or service journey named by the proof obligation
- Select the level that proves the required boundary; a broader test does not replace a required focused check, and a focused test does not prove an integration boundary

## Test Design Principles

### AAA Pattern (Arrange-Act-Assert)

Structure every test in clear Arrange, Act, and Assert phases.

### One Assertion Per Concept

- Test one behavior per test case
- Multiple assertions OK if testing single concept
- Split unrelated assertions into separate tests — one test MUST verify one behavior

### Descriptive Test Names

Test names should clearly describe:
- What is being tested
- Under what conditions
- What the expected outcome is

**Recommended format**: `"should [expected behavior] when [condition]"`

## Test Independence

### Isolation Requirements

- Each test creates its own test data
- No dependencies on execution order
- Clean up own state
- Pass when run in isolation

### Setup and Teardown

- Use setup hooks to prepare test environment
- Use teardown hooks to clean up resources
- Keep setup scoped to the data, dependencies, and fixtures required for the behavior under test
- Ensure teardown runs even if test fails

## Mocking and Test Doubles

### Boundary Selection

- In unit/local tests, isolate external I/O such as APIs, databases, file systems, network calls, time, and randomness
- In integration and data-layer tests, keep the dependency or boundary named by the proof obligation real or production-like
- Isolate unavailable third-party services unless their contract payload or failure behavior is the boundary under test
- Follow the Design Doc `Test Boundaries` decision when one exists

### Mocking Principles [MANDATORY]

- Mock at boundaries, not internally — use real implementations for internal utilities
- Keep each mock limited to the behavior the test needs to control or observe
- Verify mock expectations when relevant
- Use adapters for external libraries/frameworks you do not control

## Data Layer Testing

### Mock Limitations for Data Access

Mocks validate call patterns but do not validate schema correctness, query correctness, or storage constraints.
Examples of issues that mocks can miss:
- schema drift
- column or field mismatches
- incorrect joins, filters, or aggregations
- migration incompatibility

### When Real Data Layer Verification Adds Value

Use real or production-like data access verification when testing:
- repository or DAO implementations
- ORM mappings
- query builders or raw SQL
- persistence behavior that depends on constraints or schema shape

### Environment Options

Choose the most practical option for the project environment:
- containerized database
- dedicated test database
- in-memory database with documented limitations
- adapter-backed local test harness

### Design Alignment

When a Design Doc includes `Test Boundaries`, follow it as the baseline for deciding which dependencies stay real and which boundaries are isolated.

## Test Quality Practices [MANDATORY]

### Keep Tests Active

- **Fix or delete failing tests**: Resolve failures immediately
- **Remove commented-out tests**: Fix them or delete entirely
- **Keep tests running**: Broken tests lose value quickly
- **Maintain test suite**: Refactor tests as needed

### Test Code Quality

- Apply same standards as production code
- Use descriptive variable names
- Extract test helpers to reduce duplication
- Keep tests readable and maintainable

### Test Helpers and Utilities

- Create reusable test data builders
- Extract common setup into helper functions
- Build test utilities for complex scenarios
- Share helpers across test files appropriately

## What to Test

- Test accepted behavior through the public or externally observable boundary
- Cover the happy path and the boundary, error, and regression cases required by the proof obligation
- Do not assert private state or private call order unless that internal contract is itself the named proof target

## Test Quality Criteria [MANDATORY]

1. **Literal expectations**: Use hardcoded literal values in assertions — expected value ≠ mock return value (implementation processes data)
2. **Result verification**: Assert return values and state, not call order
3. **Meaningful assertions**: Every test MUST have at least one assertion — a test without assertions provides zero value
4. **Boundary fidelity**: Mock only boundaries intentionally isolated at the selected test level; keep every dependency named as real by the proof obligation or Design Doc boundary decision
5. **Boundary coverage**: Include empty/zero/max/error cases with happy paths

**ENFORCEMENT**: Tests violating ANY criterion MUST be rewritten

## Verification Requirements [MANDATORY for VERIFY phase]

### Before Commit Checklist

☐ All tests pass
☐ No tests skipped or commented
☐ No debug code left in tests
☐ Coverage threshold passes when the project, task file, work plan, or Design Doc defines one
☐ Tests run in reasonable time

### Zero Tolerance Policy

- **Zero failing tests**: Fix immediately
- **Zero skipped tests**: Delete or fix
- **Zero flaky tests**: Make deterministic
- **Zero unreviewed slow tests**: When a test or suite exceeds the project's accepted feedback window, optimize it, split it, move it to the appropriate test level, or record the accepted exception in the governing task or Design Doc

**ENFORCEMENT**: Cannot proceed with task completion if ANY quality check fails

## Common Anti-Patterns

Detect and eliminate these patterns immediately:

- Tests that test nothing (always pass)
- Tests that depend on execution order
- Tests that depend on external state
- Tests with complex logic (tests that need their own tests)
- Testing implementation details instead of observable behavior
- Excessive mocking (mock boundaries only, use real internals)
- Test code duplication

### Flaky Tests

Eliminate tests that fail intermittently:
- Remove timing dependencies
- Use deterministic data instead of random values
- Ensure proper cleanup
- Fix race conditions
- Make all tests deterministic

## Regression Testing

- Add test for every bug fix
- Maintain comprehensive test suite
- Run full suite regularly
- Delete a test only when the covered behavior no longer exists or the same behavior is covered by a stronger test at the correct level

### Legacy Code

- Add characterization tests before refactoring
- Test existing behavior first
- Gradually improve coverage
- Refactor with confidence
