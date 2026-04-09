---
name: integration-e2e-testing
description: "Integration and E2E test design principles, value-based selection, test skeleton specification, and review criteria. Use when: designing integration tests, E2E tests, generating test skeletons, or reviewing test quality."
---

# Integration and E2E Testing Principles

## References

**E2E test design with Playwright**: See [references/e2e-design.md](references/e2e-design.md) for UI Spec-driven E2E test candidate selection and Playwright test architecture.

## Test Type Definition and Limits [MANDATORY]

| Test Type | Purpose | Scope | Limit per Feature | Implementation Timing |
|-----------|---------|-------|-------------------|----------------------|
| Integration | Verify component interactions | Partial system integration | MAX 3 | Created alongside implementation |
| E2E | Verify critical user journeys | Full system | MAX 1-2 | Executed in final phase only |

**ENFORCEMENT**: Exceeding test limits requires explicit justification

## Behavior-First Principle [MANDATORY]

### MUST Include (High Value)
- Business logic correctness (calculations, state transitions, data transformations)
- Data integrity and persistence behavior
- User-visible functionality completeness
- Error handling behavior (what user sees/experiences)

### MUST Exclude (Low Value in CI/CD)
- External service real connections — use contract/interface verification instead
- Performance metrics — non-deterministic, defer to load testing
- Implementation details — test observable behavior only
- UI layout specifics — test information availability instead

**ENFORCEMENT**: Test = User-observable behavior verifiable in isolated CI environment

## Value and Selection Model

```
Value Score = (Business Value x User Frequency) + (Legal Requirement x 10) + Defect Detection
```

Use `Value Score` for ranking candidates of the same test type. Handle E2E cost through budget limits and reserved-slot rules instead of cost-division scoring.

### E2E Threshold

- `E2E threshold = Value Score >= 50`
- Use this threshold for non-reserved E2E selection only
- Reserved-slot eligibility overrides the threshold when the candidate is the highest-value user-facing multi-step journey

### Selection Rules

| Test Type | Ranking Basis | Selection Rule |
|-----------|---------------|----------------|
| Integration | Highest `Value Score` among integration candidates | Select up to budget |
| E2E | Highest `Value Score` among E2E candidates | Select when `reservedSlotEligible = true`, or when `Value Score >= 50` |

### E2E Candidate Rules

- Treat integration and E2E as complementary coverage layers
- Retain an E2E candidate when it validates a user-facing multi-step journey, even if integration tests partially cover the behavior
- Preserve E2E candidates for user-facing multi-step journeys that validate cross-screen or cross-boundary continuity
- Distinguish user-facing journeys from service-internal chains; reserved E2E coverage applies only to user-facing journeys

### Reserved E2E Slot

Reserve 1 E2E slot for the highest-value user-facing multi-step journey when such a journey exists, even if it does not satisfy `Value Score >= 50`.

### E2E Absence Contract

When no E2E test is generated, downstream artifacts must treat that as an explicit decision, not an error. Carry:
- `generatedFiles.e2e: null`
- `e2eAbsenceReason`: one of `no_user_facing_multi_step_journey`, `all_e2e_candidates_below_threshold`, `covered_by_existing_e2e`, `budget_not_justified`

### E2E Selection Decision Table

| Condition | Result |
|-----------|--------|
| At least one user-facing multi-step journey exists | Reserve 1 E2E slot for the highest-value such journey |
| Remaining E2E candidate has `Value Score >= 50` | Eligible for non-reserved E2E selection |
| Remaining E2E candidate has `Value Score < 50` | Exclude and use `all_e2e_candidates_below_threshold` if no E2E remains |
| Existing E2E already covers the same journey | Exclude and use `covered_by_existing_e2e` if no E2E remains |

## Test Skeleton Specification [MANDATORY]

### Required Comment Patterns

Each test MUST include the following annotations:

```
// AC: [Original acceptance criteria text]
// Behavior: [Trigger] -> [Process] -> [Observable Result]
// @category: core-functionality | integration | edge-case | e2e
// @dependency: none | [component names] | full-system
// @real-dependency: [component names] (optional)
// @complexity: low | medium | high
// Value Score: [score]
```

Adapt comment syntax to the project's language when generating or reviewing test skeletons.

### Verification Items (Optional)

When verification points need explicit enumeration:
```
// Verification items:
// - [Item 1]
// - [Item 2]
```

### E2E Preconditions (Optional but Recommended)

When an E2E test requires environment setup, seed data, login state, or external dependency control, annotate it explicitly:

```text
// Preconditions:
// - Seeded user with active subscription
// - Authenticated browser session
// - Payment provider mocked or available in local environment
```

These annotations allow work-planner to create prerequisite tasks before E2E execution.

## EARS Format Mapping

| EARS Keyword | Test Type | Generation Approach |
|--------------|-----------|---------------------|
| **When** | Event-driven | Trigger event -> verify outcome |
| **While** | State condition | Setup state -> verify behavior |
| **If-then** | Branch coverage | Both condition paths verified |
| (none) | Basic functionality | Direct invocation -> verify result |

## Test File Naming Convention

- Integration tests: `*.int.test.*` or `*.integration.test.*`
- E2E tests: `*.e2e.test.*`

The test runner or framework in the project determines the appropriate file extension.

## Review Criteria

### Skeleton and Implementation Consistency

| Check | Failure Condition |
|-------|-------------------|
| Behavior Verification | No assertion for "observable result" in skeleton |
| Verification Item Coverage | Listed items not all covered by assertions |
| Mock Boundary | Real dependencies from `@real-dependency` are isolated away or internal components are mocked without rationale |

### Implementation Quality

| Check | Failure Condition |
|-------|-------------------|
| AAA Structure | Arrange/Act/Assert separation unclear |
| Independence | State sharing between tests, order dependency |
| Reproducibility | Date/random dependency, varying results |
| Readability | Test name doesn't match verification content |

## Quality Standards [MANDATORY]

### REQUIRED
- Each test MUST verify one behavior
- Clear AAA (Arrange-Act-Assert) structure
- No test interdependencies
- Deterministic execution

### PROHIBITED
- Testing implementation details — test observable behavior only
- Multiple behaviors per test — split into separate tests
- Shared mutable state — each test creates its own state
- Time-dependent assertions without mocking — use deterministic time

**ENFORCEMENT**: Tests violating ANY standard MUST be rewritten before merge
