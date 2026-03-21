---
name: recipe-review
description: "Design Doc compliance and security validation with optional auto-fixes."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` — coding standards
2. [LOAD IF NOT ACTIVE] `testing` — test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` — AI development patterns

**Context**: Post-implementation quality assurance

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**First Action**: Register Steps 1-11 before any execution.

## Execution Method

- Compliance validation -> Spawn code-reviewer agent
- Security validation -> Spawn security-reviewer agent
- Fix implementation -> Spawn task-executor agent
- Quality checks -> Spawn quality-fixer agent
- Re-validation -> Spawn code-reviewer / security-reviewer agents

Orchestrator spawns sub-agents and passes structured data between them.

Design Doc (uses most recent if omitted): $ARGUMENTS

## Execution Flow

### Step 1: Prerequisite Check
Identify Design Doc in docs/design/ and check implementation files via git diff.

### Step 2: Execute code-reviewer
Spawn code-reviewer agent: "Validate Design Doc compliance for the implementation. Design Doc path: [path]. Implementation files: [git diff file list]. Review mode: full. Return structured JSON report with complianceRate, verdict, acceptanceCriteria, and qualityIssues."

**Store output as**: `$STEP_2_OUTPUT`

### Step 3: Execute security-reviewer
Spawn security-reviewer agent: "Design Doc: [path]. Implementation files: [file list from git diff in Step 1]. Review security compliance."

**Store output as**: `$STEP_3_OUTPUT` and `$STEP_1_FILES` (the initial file list)

### Step 4: Verdict and Response

**If security-reviewer returned `blocked`**: Stop immediately. Report the blocked finding and escalate to user. Do not proceed to fix steps.

**Code compliance criteria (considering project stage)**:
- Prototype: Pass at 70%+
- Production: 90%+ REQUIRED

**Security criteria**:
- `approved` or `approved_with_notes` -> Pass
- `needs_revision` -> Fail

**Report both results independently using subagent output fields only** (do not add fields that are not in the subagent response):

```
Code Compliance: [complianceRate from code-reviewer]
  Verdict: [verdict from code-reviewer]
  Acceptance Criteria:
  - [fulfilled] [item]
  - [partially_fulfilled] [item]: [gap] — [suggestion]
  - [unfulfilled] [item]: [gap] — [suggestion]

Security Review: [status from security-reviewer]
  Findings by category:
  - [confirmed_risk] [location]: [description] — [rationale]
  - [defense_gap] [location]: [description] — [rationale]
  - [hardening] [location]: [description] — [rationale]
  - [policy] [location]: [description] — [rationale]
  Notes: [notes from security-reviewer, if present]

Execute fixes? (y/n):
```

**[STOP — BLOCKING]** Present results to user for confirmation.
**CANNOT proceed until user explicitly confirms.**

If both pass and user selects `n`: Skip Steps 5-10, proceed to Step 11.

### Step 5: Prepare Fix Context

Reference documentation-criteria skill for task file template.

### Step 6: Create Task File

Create task file at `docs/plans/tasks/review-fixes-YYYYMMDD.md`
Include both code compliance issues and security requiredFixes.

### Step 7: Execute Fixes

Spawn task-executor agent: "Execute review fixes. Task file: docs/plans/tasks/review-fixes-YYYYMMDD.md. Apply staged fixes (stops at 5 files)."

### Step 8: Quality Check

Spawn quality-fixer agent: "Confirm quality gate passage for fixed files."

### Step 9: Re-validate code-reviewer

Spawn code-reviewer agent: "Re-validate Design Doc compliance after fixes. Prior compliance issues: $STEP_2_OUTPUT. Verify each prior issue is resolved."

### Step 10: Re-validate security-reviewer (only if security fixes were applied)

Spawn security-reviewer agent: "Re-validate security after fixes. Prior findings: $STEP_3_OUTPUT. Design Doc: [path]. Implementation files: [union of $STEP_1_FILES and task-executor filesModified from Step 7, deduplicated]."

### Step 11: Final Report

```
Code Compliance:
  Initial: [X]%
  Final: [Y]% (if fixes executed)

Security Review:
  Initial: [status]
  Final: [status] (if fixes executed)
  Notes: [notes from approved_with_notes, if any]

Remaining issues:
- [items requiring manual intervention]
```

## Auto-fixable Items
- Simple unimplemented acceptance criteria
- Error handling additions
- Contract definition fixes
- Function splitting (length/complexity improvements)
- Security confirmed_risk and defense_gap fixes (input validation, auth checks, output encoding)

## Non-fixable Items
- Fundamental business logic changes
- Architecture-level modifications
- Design Doc deficiencies
- Committed secrets (blocked -> human intervention)

## Completion Criteria

- [ ] Design Doc identified and implementation files checked
- [ ] code-reviewer spawned and compliance validated
- [ ] security-reviewer spawned and security reviewed
- [ ] Results presented to user
- [ ] Fixes executed if user approved (with quality-fixer gate)
- [ ] Re-validation completed after fixes (both code and security)
- [ ] Final report presented to user

**Scope**: Design Doc compliance validation, security review, and auto-fixes.
