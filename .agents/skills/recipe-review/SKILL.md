---
name: recipe-review
description: "Design Doc compliance validation with optional auto-fixes."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` — coding standards
2. [LOAD IF NOT ACTIVE] `testing` — test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` — AI development patterns

**Context**: Post-implementation quality assurance

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**First Action**: Register Steps 1-9 before any execution.

## Execution Method

- Compliance validation -> Spawn code-reviewer agent
- Fix implementation -> Spawn task-executor agent
- Quality checks -> Spawn quality-fixer agent
- Re-validation -> Spawn code-reviewer agent

Orchestrator spawns sub-agents and passes structured data between them.

Design Doc (uses most recent if omitted): $ARGUMENTS

## Execution Flow

### Step 1: Prerequisite Check
Identify Design Doc in docs/design/ and check implementation files via git diff.

### Step 2: Execute code-reviewer
Spawn code-reviewer agent: "Validate Design Doc compliance for the implementation. Check acceptance criteria fulfillment, code quality, and implementation completeness. Design Doc path: [path]"

**Store output as**: `$STEP_2_OUTPUT`

### Step 3: Verdict and Response

**Criteria (considering project stage)**:
- Prototype: Pass at 70%+
- Production: 90%+ REQUIRED
- Critical items (security, etc.): REQUIRED regardless of rate

**Compliance-based response**:

For low compliance (production <90%):
```
Validation Result: [X]% compliance
Unfulfilled items:
- [item list]

Execute fixes? (y/n):
```

**[STOP — BLOCKING]** Present compliance results to user for confirmation.
**CANNOT proceed until user explicitly confirms.**

### Step 4: Prepare Fix Context

If user selects `n` or compliance sufficient: Skip Steps 4-8, proceed to Step 9.

Reference documentation-criteria skill for task file template.

### Step 5: Create Task File

Create task file at `docs/plans/tasks/review-fixes-YYYYMMDD.md`

### Step 6: Execute Fixes

Spawn task-executor agent: "Execute review fixes. Task file: docs/plans/tasks/review-fixes-YYYYMMDD.md. Apply staged fixes (stops at 5 files)."

### Step 7: Quality Check

Spawn quality-fixer agent: "Confirm quality gate passage for fixed files."

### Step 8: Re-validate

Spawn code-reviewer agent: "Re-validate Design Doc compliance after fixes. Prior compliance issues: $STEP_2_OUTPUT. Verify each prior issue is resolved."

### Step 9: Final Report

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

- [ ] Design Doc identified and implementation files checked
- [ ] code-reviewer spawned and compliance validated
- [ ] Compliance results presented to user
- [ ] Fixes executed if user approved (with quality-fixer gate)
- [ ] Re-validation completed after fixes
- [ ] Final report presented to user

**Scope**: Design Doc compliance validation and auto-fixes.
