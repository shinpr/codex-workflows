---
name: recipe-front-review
description: "Frontend Design Doc compliance validation with optional auto-fixes using React-specific quality checks."
---

**Context**: Post-implementation quality assurance for React/TypeScript frontend

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` -- coding standards
2. [LOAD IF NOT ACTIVE] `testing` -- test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` -- AI development patterns

## Execution Method

- Compliance validation -> performed by code-reviewer
- Rule analysis -> performed by rule-advisor
- Fix implementation -> performed by task-executor-frontend
- Quality checks -> performed by quality-fixer-frontend
- Re-validation -> performed by code-reviewer

Orchestrator spawns agents and passes structured data between them.

Design Doc (uses most recent if omitted): $ARGUMENTS

## Execution Flow

### 1. Prerequisite Check
Identify the Design Doc in docs/design/ and check implementation files changed from the default branch (detect via `git symbolic-ref refs/remotes/origin/HEAD` or fall back to current branch diff).

**[STOP -- BLOCKING]** If no Design Doc or implementation files found, notify user and halt.
**CANNOT proceed without both a Design Doc and implementation files.**

### 2. Execute code-reviewer
Spawn code-reviewer agent: "Validate Design Doc compliance for [design-doc-path]. Check: acceptance criteria fulfillment, code quality, implementation completeness."

### 3. Verdict and Response

**Criteria (considering project stage)**:
- Prototype: Pass at 70%+
- Production: 90%+ recommended
- Critical items (security, etc.): Required regardless of rate

**Compliance-based response**:

For low compliance (production <90%):
```
Validation Result: [X]% compliance
Unfulfilled items:
- [item list]

Execute fixes? (y/n):
```

**[STOP -- BLOCKING]** Wait for user response on whether to execute fixes.
**CANNOT proceed with auto-fixes without user approval.**

If user selects `y`:

## Pre-fix Metacognition
**Required flow**: rule-advisor -> task registration -> task-executor-frontend -> quality-fixer-frontend

1. **Spawn rule-advisor agent**: "Analyze fixes needed for [unfulfilled items]. Determine root solutions vs symptomatic treatments."
2. **Register tasks**: Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity". Create task file -> `docs/plans/tasks/review-fixes-YYYYMMDD.md`
3. **Spawn task-executor-frontend agent**: "Execute staged auto-fixes for [task-file-path]. Stop at 5 files."
4. **Spawn quality-fixer-frontend agent**: "Execute all frontend quality checks and confirm quality gate passage"
5. **Re-validate**: Spawn code-reviewer agent: "Re-validate compliance for [design-doc-path]. Measure improvement."

ENFORCEMENT: Auto-fixes MUST go through quality-fixer-frontend before re-validation. Skipping quality checks invalidates fixes.

### 4. Final Report
```
Initial compliance: [X]%
Final compliance: [Y]% (if fixes executed)
Improvement: [Y-X]%

Remaining issues:
- [items requiring manual intervention]
```

## Auto-fixable Items
- Simple unimplemented acceptance criteria
- Error handling additions
- Contract definition fixes
- Function splitting (length/complexity improvements)

## Non-fixable Items
- Fundamental business logic changes
- Architecture-level modifications
- Design Doc deficiencies

## Completion Criteria

- [ ] Design Doc compliance validated
- [ ] Compliance percentage calculated
- [ ] User informed of results
- [ ] Fixes executed if requested and approved
- [ ] Quality gates passed for all fixes
- [ ] Final compliance re-measured

**Scope**: Design Doc compliance validation and auto-fixes.
