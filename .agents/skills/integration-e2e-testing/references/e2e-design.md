# E2E Test Design

## When to Create E2E Tests

E2E tests target critical user journeys that span multiple interaction boundaries or require browser-level verification. Apply the parent skill rules exactly:
- Reserve 1 fixture-e2e slot for the highest-value user-facing multi-step journey
- Use `Value Score >= 20` for additional fixture-e2e candidates
- Use service-integration-e2e only when correctness depends on real cross-service behavior
- Use `Value Score > 50` for additional service-integration-e2e candidates

### Candidate Sources

| Source | What to Extract |
|--------|----------------|
| **Design Doc ACs** | User journeys with EARS "When" keyword spanning multiple screens |
| **UI Spec Screen Transitions** | Multi-step flows (e.g., form wizard, checkout) |
| **UI Spec State x Display Matrix** | Error/empty/loading states requiring browser-level verification |
| **UI Spec Interaction Definitions** | Complex interactions (drag-drop, keyboard navigation, responsive behavior) |

### Selection Criteria

**Include** (high-value E2E coverage):
- Multi-page user journeys (login -> dashboard -> action -> confirmation)
- Flows requiring real browser APIs (navigation, cookies, localStorage)
- Accessibility verification requiring actual DOM rendering
- Responsive behavior across viewports
- Live-stack verification where DB persistence, queue/event delivery, transaction consistency, or external service payloads are the behavior under test

**Exclude** (use integration tests instead):
- Single-component state changes (use RTL)
- API response handling (use MSW + RTL)
- Pure data transformations

## UI Spec to E2E Test Mapping

When a UI Spec exists, use it as the primary source for E2E test design:

1. **Extract screen transitions** -> Each multi-step transition = 1 E2E candidate
2. **Check state x display matrix** -> Error states requiring navigation = E2E candidate
3. **Review interaction definitions** -> Browser-dependent interactions = E2E candidate
4. **Cross-reference with Design Doc ACs** -> Ensure E2E candidates map to acceptance criteria

### Mapping Template

```
Screen Transition: [Screen A] -> [Screen B] -> [Screen C]
AC Reference: AC-{id}
User Journey: [Description of what the user accomplishes]
Preconditions: [Auth state, data state]
Verification Points:
  - [What to assert at each step]
E2E Value Score: [calculated score]
Lane: fixture-e2e | service-integration-e2e
```

## Browser Test Architecture

### Page Object Pattern

Organize browser interactions through page objects or the project's equivalent harness pattern for maintainability:

```
tests/
├── e2e/
│   ├── pages/           # Page objects
│   ├── fixtures/        # Test fixtures and helpers
│   ├── *.fixture.e2e.test.ts
│   └── *.service.e2e.test.ts
```

### Test Isolation

- Each test starts from a clean browser context
- No shared state between tests
- Use `beforeEach` for common setup (auth, navigation)
- Prefer `page.goto()` over in-test navigation for setup

### Viewport Testing

When UI Spec defines responsive behavior, test critical breakpoints:

| Breakpoint | Width | When to Test |
|-----------|-------|-------------|
| Mobile | 375px | If UI Spec defines mobile-specific interactions |
| Tablet | 768px | If UI Spec defines tablet layout differences |
| Desktop | 1280px | Default -- always test |

## Budget Enforcement

Hard limits per feature (same as parent skill):
- **fixture-e2e**: MAX 3 tests
- **service-integration-e2e**: MAX 1-2 tests
- Generate the reserved fixture-e2e user journey when eligible
- Generate service-integration-e2e only when live cross-service behavior must be verified
- Prefer fewer, comprehensive journey tests over many granular tests
