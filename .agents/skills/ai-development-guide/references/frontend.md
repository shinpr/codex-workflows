# Frontend-Specific AI Development Guide (React/TypeScript)

## Frontend Anti-patterns (Additional Red Flags)

In addition to the general anti-patterns in SKILL.md, detect these frontend-specific patterns:

1. **Excessive use of type assertions (`as`)** - Abandoning type safety; use `unknown` + type guards instead
2. **Pass-through prop chains that obscure state ownership** - Use composition, Context, or the repository's state layer when intermediate components only forward values and a broader owner is clearer; retain explicit props when responsibility remains local and moving ownership upward would add coordination
3. **Components mixing independently changing responsibilities** - Split when rendering, state/data ownership, or reusable/testable behavior forms an independent responsibility; retain cohesive components when splitting would add avoidable prop/state synchronization
4. **Commented-out JSX or component code** - Delete it; Git preserves history

## Frontend Commonalization Criteria

**Cases for Commonalization** (in addition to general criteria):
- Component patterns (form fields, cards, modals, etc.)
- Custom hooks with shared logic
- Validation rules for form inputs

## Frontend Fallback Design

### Layer Responsibilities (React-specific)
- **Component Layer**: Use Error Boundary for error handling
- **Hook Layer**: Implement decisions based on business requirements
- **API Layer**: Convert fetch errors to domain errors

### Detection of Excessive Fallbacks
- Require design review when adding a catch that duplicates or fragments an existing recovery responsibility; retain it for a distinct failure mode whose recovery owner is defined in the Design Doc and whose outcome is visible in the UI
- Verify Design Doc definition before implementing fallbacks
- Log errors explicitly and make failures visible

## Frontend Quality Check Workflow

Read `package.json` scripts and run them with the project's package manager from the `packageManager` field. Map the phases below using the script names declared in `package.json`.

### Phases
1. **Lint/format** - the project's formatter and linter, such as Biome or ESLint plus Prettier
2. **Type check** - type check without emit when the project has a dedicated command
3. **Build** - production build
4. **Test** - unit and integration tests
5. **Coverage** - coverage run when configured or when the task added or changed behavior

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
