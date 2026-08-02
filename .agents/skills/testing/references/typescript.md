# Web Frontend Testing Reference (TypeScript + Vitest + RTL + MSW + Playwright)

## Unit and Integration Tests

### Where to Concentrate Test Rigor

Apply the strongest focused coverage to shared components, custom hooks, utilities, and business rules reused across features. Use integration or E2E coverage for higher-composition surfaces whose proof obligation crosses component or browser boundaries. Numeric thresholds come from the project's CI, task file, work plan, or Design Doc.

### Test Level and Boundary Rules

- **Unit/local with RTL or Vitest**: Exercise one component, hook, function, or in-process behavior; isolate external I/O
- **Integration with RTL and MSW**: Exercise component coordination while controlling only the API boundary named for isolation
- Keep internal validators, formatters, and other project logic real unless the governing test-boundary decision says otherwise
- Keep mocks type-safe and limited to the behavior the test controls or observes

### Naming Conventions

- Test files: `{ComponentName}.test.tsx`
- Integration test files: `{FeatureName}.integration.test.tsx`

### Observable Behavior

- Verify rendered output, user interactions, accessibility behavior, and error states
- Use semantic queries that reflect how users and assistive technologies find the element
- Assert literal expected outputs and state transitions rather than deriving expectations from the same mock or implementation path
- Exercise behavior through the public component or hook boundary; internal state, private call order, and CSS class names are not proof targets

## E2E Tests (Playwright)

### Locator Strategy

Use locators in this priority order:

1. `page.getByRole()`
2. `page.getByLabel()`
3. `page.getByText()`
4. `page.getByTestId()` only when no semantic locator can identify the target

### Viewport Testing

| Breakpoint | Width | When to Test |
|-----------|-------|-------------|
| Mobile | 375px | UI Spec defines mobile-specific interactions |
| Tablet | 768px | UI Spec defines tablet layout differences |
| Desktop | 1280px | The selected UI claim requires a desktop journey |

### E2E Budget

- Limit fixture-e2e to 3 tests and service-integration-e2e to 1-2 tests per feature
- Treat limits as ceilings, not reserved slots or targets
- Apply the integration-e2e-testing Selection Gate before generating any browser test
- Prefer fewer comprehensive journey tests over many granular tests

### Test Isolation

- Start each test from a clean browser context
- Give each test independent fixture and persisted state
- Use setup hooks only for state shared by every test in their scope
- Enter the journey at the shortest setup path that preserves the behavior under test
