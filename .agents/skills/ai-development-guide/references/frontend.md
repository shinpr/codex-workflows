# Frontend-Specific AI Development Guide (React/TypeScript)

## Frontend Anti-patterns (Additional Red Flags)

In addition to the general anti-patterns in SKILL.md, detect these frontend-specific patterns:

1. **Excessive use of type assertions (`as`)** - Abandoning type safety; use `unknown` + type guards instead
2. **Prop drilling through 3+ levels** - Use Context API or state management
3. **Massive components (300+ lines)** - Split into smaller, focused components
4. **Commented-out JSX or component code** - Delete it; Git preserves history

## Frontend Commonalization Criteria

**Cases for Commonalization** (in addition to general criteria):
- Component patterns (form fields, cards, modals, etc.)
- Custom hooks with shared logic
- Validation rules for form inputs

**Implementation Example**:
```typescript
// Bad: Immediate commonalization on 1st duplication
function UserEmailInput() { /* ... */ }
function ContactEmailInput() { /* ... */ }

// Good: Commonalize on 3rd occurrence
function EmailInput({ context }: { context: 'user' | 'contact' | 'admin' }) { /* ... */ }
```

## Frontend Fallback Design

### Layer Responsibilities (React-specific)
- **Component Layer**: Use Error Boundary for error handling
- **Hook Layer**: Implement decisions based on business requirements
- **API Layer**: Convert fetch errors to domain errors

### Detection of Excessive Fallbacks
- Require design review when writing the 3rd catch statement in the same feature
- Verify Design Doc definition before implementing fallbacks
- Log errors explicitly and make failures visible

## Frontend Debugging Techniques

### Error Analysis (React-specific)
1. Read error message (first line) accurately
2. Focus on first and last of stack trace
3. Identify first line where your code appears
4. **Check React DevTools for component hierarchy**

### 5 Whys Example (Frontend)
```
Symptom: Component not rendering
Why1: Props are undefined
Why2: Parent component didn't pass props
Why3: Parent using old prop names
Why4: Component interface was updated
Why5: No update to parent after refactoring
Root cause: Incomplete refactoring, missing call-site updates
```

### Minimal Reproduction (React-specific)
- Remove unrelated components
- Replace API calls with mocks
- Create minimal configuration that reproduces the problem
- Use React DevTools to inspect component tree

### Debug Log Pattern (Frontend)
```typescript
console.log('DEBUG:', {
  context: 'user-form-submission',
  props: { email, name },
  state: currentState,
  timestamp: new Date().toISOString()
})
```

## Frontend Quality Check Workflow

Read `package.json` scripts and run them with the project's package manager from the `packageManager` field. Map the phases below using the script names declared in `package.json`.

### Phases
1. **Lint/format** - the project's formatter and linter, such as Biome or ESLint plus Prettier
2. **Type check** - type check without emit when the project has a dedicated command
3. **Build** - production build
4. **Test** - unit and integration tests
5. **Coverage** - coverage run when configured or when the task added or changed behavior

### Troubleshooting
- **Port already in use**: stop the stale dev, preview, or test process holding the port
- **Stale cache**: re-run with the project's fresh or clean-cache option
- **Dependency errors**: clean reinstall dependencies

## Frontend Technical Decisions

### Component/Type Granularity
- Overly detailed components/types reduce maintainability
- Design components that appropriately express UI patterns
- Use composition over inheritance

### Performance vs Readability
- Prioritize readability unless clear bottleneck exists
- Measure before optimizing (use React DevTools Profiler, not guesses)
- When React Compiler is enabled, routine memoization is automatic. Use manual memoization only for a measured bottleneck or stable reference identity required by third-party APIs or effect dependencies.
- Document reason with comments when optimizing

## Frontend Impact Analysis

### Discovery (React-specific search)
```bash
# Search for component, hook, and type references
grep -rn "ComponentName\|hookName" --include="*.tsx" --include="*.ts"
grep -rn "importedFunction" --include="*.tsx" --include="*.ts"
grep -rn "propsType\|StateType" --include="*.tsx" --include="*.ts"
```

### Understanding (React-specific)
Read all discovered files and analyze:
- Caller's purpose and context
- Component hierarchy
- Data flow: Props -> State -> Event handlers -> Callbacks

### Identification (React-specific)
```
## Impact Analysis
### Direct Impact: ComponentA, ComponentB (with reasons)
### Indirect Impact: FeatureX, PageY (with integration paths)
### Processing Flow: Props -> Render -> Events -> Callbacks
```
