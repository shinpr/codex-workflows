---
name: ai-development-guide
description: "Anti-pattern detection, debugging techniques, quality check workflow, and implementation completeness assurance. Use when: fixing bugs, reviewing code quality, refactoring, making technical decisions, or performing quality assurance."
---

# AI Developer Guide - Technical Decision Criteria and Anti-pattern Collection

## Language-Specific References

For frontend-specific anti-patterns, debugging, and quality checks:
- **React/TypeScript Frontend**: [references/frontend.md](references/frontend.md)

## Technical Anti-patterns (Red Flag Patterns) [MANDATORY]

**IMMEDIATELY stop and reconsider design** when detecting the following patterns:

### Code Quality Anti-patterns
1. **Writing similar code 3 or more times** - Violates Rule of Three
2. **Multiple responsibilities mixed in a single file** - Violates Single Responsibility Principle (SRP)
3. **Defining same content in multiple files** - Violates DRY principle
4. **Making changes without checking dependencies** - Potential for unexpected impacts
5. **Disabling code with comments** - Should use version control
6. **Error suppression** - Hiding problems creates technical debt
7. **Bypassing safety mechanisms (type systems, validation, contracts)** - Circumventing correctness guarantees

### Design Anti-patterns
- **"Make it work for now" thinking** - Accumulation of technical debt
- **Patchwork implementation** - Unplanned additions to existing code
- **Optimistic implementation of uncertain technology** - EVALUATE unknown elements with minimal verification code first
- **Symptomatic fixes** - Identify root cause with 5 Whys instead of applying surface-level patches
- **Unplanned large-scale changes** - Use incremental approach with phased implementation

**ENFORCEMENT**: Detecting ANY anti-pattern requires IMMEDIATE design review before proceeding

## Fail-Fast Fallback Design Principles

### Core Principle [MANDATORY]
Make errors explicit with full context. Prioritize primary code reliability over fallback implementations. Silent fallbacks are PROHIBITED.

### Implementation Guidelines

#### Default Approach [MANDATORY]
- **Prohibit unconditional fallbacks**: NEVER automatically return default values on errors
- **Make failures explicit**: Errors MUST be visible and traceable
- **Preserve error context**: Include original error information when re-throwing

#### When Fallbacks Are Acceptable
- **Only with explicit Design Doc approval**: Document why fallback is necessary
- **Business-critical continuity**: When partial functionality is better than none
- **Graceful degradation paths**: Clearly defined degraded service levels

#### Layer Responsibilities
- **Infrastructure Layer**: Always throw errors upward; no business logic decisions; provide detailed error context
- **Application Layer**: Make business-driven error handling decisions; implement fallbacks only when specified in requirements; log all fallback activations

### Error Masking Detection

**Review Triggers** (require design review):
- Writing 3rd error handler in the same feature
- Multiple error handling blocks in single function/method
- Nested error handling structures
- Error handlers that return default values without logging

**Before Implementing Any Fallback** [MANDATORY]:
**STEP 1**: Verify Design Doc explicitly defines this fallback
**STEP 2**: Document the business justification
**STEP 3**: Ensure error is logged with full context
**STEP 4**: Add monitoring/alerting for fallback activation

**ENFORCEMENT**: Fallbacks without Design Doc approval are PROHIBITED

### Implementation Pattern

```
AVOID: Silent fallback that hides errors
    <handle error>:
        return DEFAULT_VALUE  // Error hidden, debugging impossible

PREFERRED: Explicit failure with context
    <handle error>:
        log_error('Operation failed', context, error)
        <propagate error>  // Re-throw, return Error type, return error tuple
```

## Rule of Three - Criteria for Code Duplication

How to handle duplicate code based on Martin Fowler's "Refactoring":

| Duplication Count | Action | Reason |
|-------------------|--------|--------|
| 1st time | Inline implementation | Cannot predict future changes |
| 2nd time | Consider future consolidation | Pattern beginning to emerge |
| 3rd time | Implement commonalization | Pattern established |

### Criteria for Commonalization

**Cases for Commonalization**:
- Business logic duplication
- Complex processing algorithms
- Areas likely requiring bulk changes
- Validation rules

**Cases to Avoid Commonalization**:
- Accidental matches (coincidentally same code)
- Possibility of evolving in different directions
- Significant readability decrease from commonalization
- Simple helpers in test code

## Common Failure Patterns and Avoidance Methods

### Pattern 1: Error Fix Chain
**Symptom**: Fixing one error causes new errors
**Cause**: Surface-level fixes without understanding root cause
**Avoidance**: Identify root cause with 5 Whys before fixing

### Pattern 2: Circumventing Correctness Guarantees
**Symptom**: Bypassing safety mechanisms (type systems, validation, contracts)
**Cause**: Impulse to avoid correctness errors
**Avoidance**: Use language-appropriate safety mechanisms

### Pattern 3: Implementation Without Sufficient Testing
**Symptom**: Many bugs after implementation
**Cause**: Ignoring Red-Green-Refactor process
**Avoidance**: Always start with failing tests

### Pattern 4: Ignoring Technical Uncertainty
**Symptom**: Frequent unexpected errors when introducing new technology
**Cause**: Assuming things work without prior investigation
**Avoidance**:
- Record certainty evaluation at the beginning of task files
- For low certainty cases, create minimal verification code first

### Pattern 5: Insufficient Existing Code Investigation
**Symptom**: Duplicate implementations, architecture inconsistency, integration failures
**Cause**: Insufficient understanding of existing code before implementation
**Avoidance**:
- Before implementation, always search for similar functionality
- Similar functionality found: Use that implementation (do not create new)
- Similar functionality is technical debt: Create ADR improvement proposal
- No similar functionality: Implement following existing design philosophy

## Debugging Techniques

### 1. Error Analysis Procedure
1. Read error message (first line) accurately
2. Focus on first and last of stack trace
3. Identify first line where your code appears

### 2. 5 Whys - Root Cause Analysis
```
Example:
Symptom: Build error
Why1: Contract definitions don't match
Why2: Interface was updated
Why3: Dependency change
Why4: Package update impact
Why5: Major version upgrade with breaking changes
Root cause: Inappropriate version specification in dependency manifest
```

### 3. Minimal Reproduction Code
To isolate problems, attempt reproduction with minimal code:
- Remove unrelated parts
- Replace external dependencies with mocks
- Create minimal configuration that reproduces problem

### 4. Debug Log Output
```
Pattern: Structured logging with context
{
  context: 'operation-name',
  input: { relevant, input, data },
  state: currentState,
  timestamp: current_time_ISO8601
}
```

## Quality Check Workflow [MANDATORY]

Universal quality assurance phases applicable to all languages:

### Phase 1: Static Analysis
1. **Code Style Checking**: Verify adherence to style guidelines
2. **Code Formatting**: Ensure consistent formatting
3. **Unused Code Detection**: Identify dead code and unused imports/variables
4. **Static Type Checking**: Verify type correctness (for statically typed languages)
5. **Static Analysis**: Detect potential bugs, security issues, code smells

### Phase 2: Build Verification
1. **Compilation/Build**: Verify code builds successfully
2. **Dependency Resolution**: Ensure all dependencies are available and compatible
3. **Resource Validation**: Check configuration files, assets are valid

### Phase 3: Testing
1. **Unit Tests**: Run all unit tests
2. **Integration Tests**: Run integration tests
3. **Test Coverage**: Measure and verify coverage meets standards
4. **E2E Tests**: Run end-to-end tests

### Phase 4: Final Quality Gate [MANDATORY]
All checks MUST pass before proceeding:
- Zero static analysis errors
- Build succeeds
- All tests pass
- Coverage meets threshold

**ENFORCEMENT**: Cannot proceed with ANY quality check failures — fix ALL errors before marking task complete

## Situations Requiring Technical Decisions

### Timing of Abstraction
- Extract patterns after writing concrete implementation 3 times (Rule of Three)
- Apply YAGNI — implement only currently needed features
- Prioritize current simplicity over future extensibility

### Performance vs Readability
- Prioritize readability unless clear bottleneck exists
- **Measure first** — profile before optimizing (no guessing)
- Document reason with comments when optimizing

### Granularity of Contracts and Interfaces
- Overly detailed contracts reduce maintainability
- Design interfaces that appropriately express domain
- Use abstraction mechanisms to reduce duplication

## Implementation Completeness Assurance

### Impact Analysis: Mandatory 3-Stage Process [MANDATORY]

Complete these stages sequentially before any implementation:

**1. Discovery** - Identify all affected code:
- Implementation references (imports, calls, instantiations)
- Interface dependencies (contracts, types, data structures)
- Test coverage
- Configuration (build configs, env settings, feature flags)
- Documentation (comments, docs, diagrams)

**2. Understanding** - Analyze each discovered location:
- Role and purpose in the system
- Dependency direction (consumer or provider)
- Data flow (origin to transformations to destination)
- Coupling strength

**3. Identification** - Produce structured report:
```
## Impact Analysis
### Direct Impact
- [Unit]: [Reason and modification needed]

### Indirect Impact
- [System]: [Integration path and reason]

### Data Flow
[Source] -> [Transformation] -> [Consumer]

### Risk Assessment
- High: [Complex dependencies, fragile areas]
- Medium: [Moderate coupling, test gaps]
- Low: [Isolated, well-tested areas]

### Implementation Order
1. [Start with lowest risk or deepest dependency]
2. [...]
```

**ENFORCEMENT**: CANNOT implement until all 3 stages are documented

### Unused Code Deletion

When unused code is detected:
- Will it be used in this work? Yes: Implement now | No: Delete now (Git preserves)
- Applies to: Code, tests, docs, configs, assets

### Existing Code Modification

```
In use? No -> Delete
       Yes -> Working? No -> Delete + Reimplement
                     Yes -> Fix/Extend
```

**Principle**: Prefer clean implementation over patching broken code
