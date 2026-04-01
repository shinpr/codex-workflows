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
**STEP 3**: Confirm test FAILS (if it passes, the test is wrong)

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

### Coverage Standards

- **Minimum 80% code coverage** for production code
- Prioritize critical paths and business logic
- Use coverage as a guide, not a goal

### Test Characteristics

All tests MUST be:

- **Independent**: No dependencies between tests
- **Reproducible**: Same input always produces same output
- **Fast**: Complete test suite runs in reasonable time
- **Self-checking**: Clear pass/fail without manual verification
- **Timely**: Written close to the code they test

**ENFORCEMENT**: Tests failing ANY characteristic MUST be fixed immediately

## Test Types

### Unit Tests

**Purpose**: Test individual components in isolation

**Characteristics**:
- Test single function, method, or class
- Fast execution (milliseconds)
- No external dependencies
- Mock external services
- Majority of your test suite

### Integration Tests

**Purpose**: Test interactions between components

**Characteristics**:
- Test multiple components together
- May include database, file system, or APIs
- Slower than unit tests
- Verify contracts between modules
- Smaller portion of test suite

### End-to-End (E2E) Tests

**Purpose**: Test complete workflows from user perspective

**Characteristics**:
- Test entire application stack
- Simulate real user interactions
- Slowest test type
- Fewest in number
- Highest confidence level

### Test Pyramid

Follow the test pyramid structure:
```
    /\    <- Few E2E Tests (High confidence, slow)
   /  \
  /    \  <- Some Integration Tests (Medium confidence, medium speed)
 /      \
/________\ <- Many Unit Tests (Fast, foundational)
```

## Test Design Principles

### AAA Pattern (Arrange-Act-Assert)

Structure every test in three clear phases:

```
// Arrange: Setup test data and conditions
user = createTestUser()
validator = createValidator()

// Act: Execute the code under test
result = validator.validate(user)

// Assert: Verify expected outcome
assert(result.isValid == true)
```

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
- Keep setup minimal and focused
- Ensure teardown runs even if test fails

## Mocking and Test Doubles

### When to Use Mocks

- **Mock external dependencies**: APIs, databases, file systems
- **Mock slow operations**: Network calls, heavy computations
- **Mock unpredictable behavior**: Random values, current time
- **Mock unavailable services**: Third-party services

### Mocking Principles [MANDATORY]

- Mock at boundaries, not internally — use real implementations for internal utilities
- Keep mocks simple and focused
- Verify mock expectations when relevant
- Use adapters for external libraries/frameworks you do not control

### Types of Test Doubles

- **Stub**: Returns predetermined values
- **Mock**: Verifies it was called correctly
- **Spy**: Records information about calls
- **Fake**: Simplified working implementation
- **Dummy**: Passed but never used

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

### Focus on Behavior

**Test observable behavior, not implementation**:

- Good: Test that function returns expected output
- Good: Test that correct API endpoint is called
- Bad: Test that internal variable was set
- Bad: Test order of private method calls

### Test Edge Cases

Always test:
- **Boundary conditions**: Min/max values, empty collections
- **Error cases**: Invalid input, null values, missing data
- **Edge cases**: Special characters, extreme values
- **Happy path**: Normal, expected usage

## Test Quality Criteria [MANDATORY]

1. **Literal expectations**: Use hardcoded literal values in assertions — expected value ≠ mock return value (implementation processes data)
2. **Result verification**: Assert return values and state, not call order
3. **Meaningful assertions**: Every test MUST have at least one assertion — a test without assertions provides zero value
4. **Mock external I/O only**: Mock DB/API/filesystem, use real internal utilities
5. **Boundary coverage**: Include empty/zero/max/error cases with happy paths

**ENFORCEMENT**: Tests violating ANY criterion MUST be rewritten

## Verification Requirements [MANDATORY for VERIFY phase]

### Before Commit Checklist

☐ All tests pass
☐ No tests skipped or commented
☐ No debug code left in tests
☐ Test coverage meets standards (≥ 80%)
☐ Tests run in reasonable time

### Zero Tolerance Policy

- **Zero failing tests**: Fix immediately
- **Zero skipped tests**: Delete or fix
- **Zero flaky tests**: Make deterministic
- **Zero slow tests**: Optimize or split

**ENFORCEMENT**: Cannot proceed with task completion if ANY quality check fails

## Test Organization

### File Structure

- **Mirror production structure**: Tests follow code organization
- **Clear naming conventions**: Follow project's test file patterns
- **Logical grouping**: Group related tests together
- **Separate test types**: Unit, integration, e2e in separate directories

### Test Suite Organization

```
tests/
├── unit/           # Fast, isolated unit tests
├── integration/    # Integration tests
├── e2e/            # End-to-end tests
├── fixtures/       # Test data and fixtures
└── helpers/        # Shared test utilities
```

## Performance Considerations

### Test Speed

- **Unit tests**: < 100ms each
- **Integration tests**: < 1s each
- **Full suite**: Should run frequently (< 10 minutes)

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
- Don't delete tests without good reason

### Legacy Code

- Add characterization tests before refactoring
- Test existing behavior first
- Gradually improve coverage
- Refactor with confidence
