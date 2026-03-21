---
name: coding-rules
description: "Language-agnostic coding standards for maintainability, readability, and quality. Use when: implementing features, refactoring code, reviewing code quality, or writing functions."
---

# Coding Rules

## Language-Specific References

For language-specific rules, also read:
- **TypeScript/React**: [references/typescript.md](references/typescript.md)

## Core Philosophy [MANDATORY]

1. **Maintainability over Speed**: Prioritize long-term code health
2. **Simplicity First**: YAGNI principle — simplest solution that meets requirements
3. **Explicit over Implicit**: Clear intentions through code structure and naming
4. **Delete over Comment**: Remove unused code instead of commenting it out

**ENFORCEMENT**: Every code change MUST align with these principles

## Code Quality [MANDATORY]

- Refactor as you go — eliminate technical debt immediately
- Use meaningful, descriptive names from the problem domain
- Extract magic numbers and strings into named constants
- Keep code self-documenting

## Function Design [MANDATORY]

- **0-2 parameters** per function (use objects for 3+)
- Single responsibility — each function MUST do one thing well
- Keep functions < 50 lines
- Use pure functions where possible — separate data transformation from side effects
- Use early returns to keep nesting ≤ 3 levels
- **Inject external dependencies explicitly** — pass as parameters for testability

## Error Handling [MANDATORY]

- **Always handle errors**: Log with context or propagate explicitly — error suppression is PROHIBITED
- **Fail fast**: Detect and report errors early
- **Protect sensitive data**: Mask passwords, tokens, PII from logs
- Use language-appropriate error handling mechanisms
- Include error context when re-throwing

**ENFORCEMENT**: Zero silent error suppression — every error MUST have log output and appropriate handling

## Dependency Management

- **Inject external dependencies explicitly** — pass as parameters for testability
- Depend on abstractions, not concrete implementations
- Minimize inter-module dependencies

## Performance

- **Measure first**: Profile before optimizing — no premature optimization
- Focus on algorithms over micro-optimizations
- Choose data structures based on access patterns

## Code Organization

- One primary responsibility per file
- Group related functionality together
- Separate concerns: domain logic, data access, presentation
- Keep files ≤ 500 lines

## Commenting Principles

- Document "what" and "why", not "how"
- No historical information — use version control
- Remove commented-out code
- Keep comments concise and timeless

## Refactoring [SAFE CHANGE PROTOCOL]

**STEP 1**: Understand current state
**STEP 2**: Make one small change
**STEP 3**: Run tests — confirm all pass
**STEP 4**: Repeat from STEP 2

**Triggers**: duplication, functions > 50 lines, complex conditionals

**ENFORCEMENT**: Each step MUST maintain working state

## Security

### Secure Defaults
- Store credentials and secrets through environment variables or dedicated secret managers
- Use parameterized queries (prepared statements) for all database access
- Use established cryptographic libraries provided by the language or framework
- Generate security-critical values (tokens, IDs, nonces) with cryptographically secure random generators
- Encrypt sensitive data at rest and in transit using standard protocols

### Input and Output Boundaries
- Validate all external input at system entry points for expected format, type, and length
- Encode output appropriately for its rendering context (HTML, SQL, shell, URL)
- Return only information necessary for the caller in error responses; log detailed diagnostics server-side

### Access Control
- Apply authentication to all entry points that handle user data or trigger state changes
- Verify authorization for each resource access, not only at the entry point
- Grant only the permissions required for the operation (files, database connections, API scopes)

### Knowledge Cutoff Supplement (2026-03)
- OWASP Top 10:2025 shifted from symptoms to root causes; added "Software Supply Chain Failures" (A03) and "Mishandling of Exceptional Conditions" (A10)
- Recent research indicates AI-generated code shows elevated rates of access control gaps — treat authentication and authorization as high-priority review targets
- OpenSSF published "Security-Focused Guide for AI Code Assistant Instructions" — recommends language-specific, actionable constraints over generic advice
- For detailed detection patterns, see `references/security-checks.md`

## Version Control [MANDATORY]

- Atomic, focused commits with clear messages
- Commit working code that passes all tests
- Never commit debug code or secrets

**ENFORCEMENT**: Code MUST pass all quality checks before commit
