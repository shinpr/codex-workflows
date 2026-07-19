---
name: ai-development-guide
description: "Anti-pattern detection, root-cause discipline, quality check workflow, and implementation completeness assurance. Use when: fixing bugs, reviewing code quality, refactoring, making technical decisions, or performing quality assurance."
---

# AI Developer Guide - Technical Decision Criteria and Anti-pattern Collection

## Language-Specific References

For frontend-specific anti-patterns, debugging, and quality checks:
- **React/TypeScript Frontend**: [references/frontend.md](references/frontend.md)

**Value-First Engineering [MANDATORY]**

Explore broadly, then converge on the lowest-lifecycle-cost solution that delivers user value and leaves the system correct and maintainable.
- Resolve verified bugs, failing quality checks, and technical debt within confirmed scope or dependencies required for its outcome; report other findings separately.
- Introduce capabilities, infrastructure, abstractions, or speculative edge-case handling only when a current outcome, verified constraint, or evidence-backed material risk requires them.
- When resolving a known problem falls outside that boundary or materially changes behavior, architecture, or effort, obtain an explicit scope decision.

## Technical Anti-patterns (Red Flag Patterns) [MANDATORY]

**IMMEDIATELY stop and reconsider design** when detecting the following patterns:

### Code Quality Anti-patterns
1. **Writing similar code 3 or more times** - Violates Rule of Three
2. **Multiple responsibilities mixed in a single file** - Violates Single Responsibility Principle (SRP)
3. **Maintaining the same runtime rule or data in multiple implementation sources when one source can safely serve all consumers** - Creates synchronization risk
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

## Pattern 5: Existing Code Investigation [MANDATORY]

Before implementation:
- Search for similar functionality
- Similar functionality found: Verify that it satisfies the current requirement and is representative of the repository; reuse or extend it when both checks pass
- Similar functionality is technical debt: Repair it when it blocks the current outcome, was caused by the current change, or lies in confirmed scope; otherwise report it separately. When the repair requires an architectural decision, record the decision in an ADR
- No suitable similar functionality: Implement using representative repository patterns
- When adopting a pattern or dependency from nearby code, verify it is representative across the repository before adopting it

## Quality Assurance Mechanism Awareness

Before executing quality checks, discover applicable quality tools and constraints by inspecting the affected files' types, project manifests, CI pipelines, and configuration:
- Primary detection: inspect affected file types, manifests, configuration, and CI pipelines to identify applicable quality tools
- Check for domain-specific linters or validators such as schema validators, API spec validators, or configuration-file checkers
- Check for domain-specific constraints in project configuration such as naming rules, length limits, or format requirements
- When a task file lists `Quality Assurance Mechanisms`, use that section as supplementary guidance for what to verify
- Include discovered domain-specific checks alongside the standard quality phases below

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
3. **Test Coverage**: Measure coverage when configured and use it to find gaps
4. **E2E Tests**: Run end-to-end tests

### Phase 4: Final Quality Gate [MANDATORY]
All checks MUST pass before proceeding:
- Zero static analysis errors
- Build succeeds
- All tests pass
- Coverage threshold passes when the project, task file, work plan, or Design Doc defines one. When no threshold is configured, use coverage output only to identify untested critical paths.

**ENFORCEMENT**: Cannot proceed with ANY quality check failures — fix ALL errors before marking task complete

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
- Within confirmed scope or dependencies required for the current outcome: Will it be used in this work? Yes: Implement now | No: Delete now (Git preserves)
- Outside that boundary: Report it separately for a scope decision
- Applies to: Code, tests, docs, configs, assets

### Existing Code Modification

```
Within confirmed scope or required dependency?
  No  -> Report separately
  Yes -> In use?
           No  -> Delete
           Yes -> Working?
                    No  -> Delete + Reimplement
                    Yes -> Fix/Extend
```

**Principle**: Prefer clean implementation over patching broken code
