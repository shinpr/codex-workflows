# TypeScript Testing Reference (Vitest + RTL + MSW + Playwright)

## Unit & Integration Tests (Vitest + React Testing Library + MSW)

### Test Framework Setup

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

### Coverage Requirements

- **Overall minimum**: 60%
- **Atoms (Button, Text)**: 70%+
- **Molecules (FormField)**: 65%+
- **Organisms (Header, Footer)**: 60%+
- **Custom Hooks**: 65%+
- **Utils**: 70%+

### Test Types

1. **Unit Tests (RTL)**: Verify individual components/functions, mock all external dependencies
2. **Integration Tests (RTL + MSW)**: Verify component coordination, mock APIs with MSW

### Directory Structure (Co-location)

```
src/
└── components/
    └── Button/
        ├── Button.tsx
        ├── Button.test.tsx  # Co-located with component
        └── index.ts
```

### Naming Conventions

- Test files: `{ComponentName}.test.tsx`
- Integration test files: `{FeatureName}.integration.test.tsx`

### Test Granularity: User-Observable Behavior Only

**MUST Test**: Rendered output, user interactions, accessibility, error states
**MUST NOT Test**: Component internal state, implementation details, CSS class names

```typescript
// Good: Test user-observable behavior
expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()

// Bad: Test implementation details
expect(component.state.count).toBe(0)
```

### RTL Test Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button label="Click me" onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'Click me' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

### MSW (Mock Service Worker) Setup

```typescript
import { http, HttpResponse } from 'msw'

const handlers = [
  http.get('/api/users/:id', () => {
    return HttpResponse.json({ id: '1', name: 'John' } satisfies User)
  })
]
```

### Mock Type Safety

```typescript
type TestProps = Pick<ButtonProps, 'label' | 'onClick'>
const mockProps: TestProps = { label: 'Click', onClick: vi.fn() }
```

### Mock Scope

```typescript
vi.mock('./api/userApi')  // External API - mock
vi.mock('./lib/database') // External I/O - mock
// Internal utils like validators/formatters - use real implementations
```

### Test Helpers

```typescript
// Builder pattern for test data
const testUser = createTestUser({ name: 'Test User', email: 'test@example.com' })

// Custom render function with providers
function renderWithProviders(ui: React.ReactElement) {
  return render(<TestProvider>{ui}</TestProvider>)
}
```

### Literal Expected Values

```typescript
expect(formatPrice(1000)).toBe('$1,000')
expect(calculateTax(100)).toBe(10)
expect(user.role).toBe('admin')
```

## E2E Tests (Playwright)

### Directory Layout

```
tests/
└── e2e/
    ├── pages/              # Page objects
    │   ├── login.page.ts
    │   └── dashboard.page.ts
    ├── fixtures/           # Test fixtures
    │   └── auth.fixture.ts
    └── *.e2e.test.ts       # Test files
```

### Page Object Pattern

```typescript
import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign in' })
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
```

### Locator Strategy (Priority Order)

1. `page.getByRole()` — best for accessibility
2. `page.getByLabel()` — form elements
3. `page.getByText()` — visible text
4. `page.getByTestId()` — last resort

### Basic E2E Test

```typescript
import { test, expect } from '@playwright/test'

test('user can navigate to dashboard after login', async ({ page }) => {
  // Arrange
  await page.goto('/login')

  // Act
  await page.getByLabel('Email').fill('user@example.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Assert
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
```

### Auth Fixture

```typescript
import { test as base } from '@playwright/test'

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('/dashboard')
    await use(page)
  },
})
```

### Viewport Testing

| Breakpoint | Width | When to Test |
|-----------|-------|-------------|
| Mobile | 375px | If responsive interactions defined |
| Tablet | 768px | If tablet layout differs |
| Desktop | 1280px | Default — always test |

### E2E Budget

- **MAX 1-2 E2E tests per feature**
- Only generate an additional non-reserved E2E test when `Value Score >= 50`
- Prefer fewer comprehensive journey tests over many granular tests

### Test Isolation

- Each test starts from a clean browser context
- No shared state between tests
- Use `beforeEach` for common setup
- Prefer `page.goto()` over in-test navigation for setup
