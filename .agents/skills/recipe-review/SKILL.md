---
name: recipe-review
description: "Design Doc compliance and security validation with optional auto-fixes."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` — coding standards
2. [LOAD IF NOT ACTIVE] `testing` — test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` — AI development patterns

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

**Context**: Post-implementation quality assurance

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**First Action**: Register Steps 1-11 before any execution.

## Execution Method

- Compliance validation -> Spawn code-reviewer agent
- Security validation -> Spawn security-reviewer agent
- Code-side fix path -> Spawn task-executor agent
- Design-side update path -> Spawn technical-designer in update mode, then document-reviewer, then design-sync when multiple Design Docs exist
- Quality checks -> Spawn quality-fixer agent
- Re-validation -> Spawn code-reviewer / security-reviewer agents

Orchestrator spawns sub-agents and passes structured data between them.

Design Doc (uses most recent if omitted): $ARGUMENTS

## Execution Flow

### Step 1: Prerequisite Check
Identify Design Doc in docs/design/ and check implementation files via git diff.
If a single active work plan is explicitly provided or unambiguously resolved for that Design Doc, read its `Review Scope` line. Otherwise set `Work Plan: none` and `Review Scope: none`; do not infer.

### Step 2: Execute code-reviewer
Spawn code-reviewer agent: "Validate Design Doc compliance for the implementation. Design Doc path: [path]. Work Plan: [resolved work plan path or none]. Review Scope: [literal Review Scope value or none]. Implementation files: [git diff file list]. Review mode: full. Return structured JSON report per your Output Format specification."

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
  Identifier Match Rate: [identifierMatchRate from code-reviewer]
  Acceptance Criteria:
  - [fulfilled] [item] (confidence: [high/medium/low])
  - [partially_fulfilled] [item]: [gap] — [suggestion]
  - [unfulfilled] [item]: [gap] — [suggestion]
  Identifier Mismatches (show only mismatches; write `None` if all identifiers match):
  - None
  - [identifier]: DD=[designDocValue] Code=[codeValue] at [location] (confidence: [high/medium/low])
  Quality Findings:
  - [category] [location]: [description] — [rationale]

Security Review: [status from security-reviewer]
  Findings by category:
  - [confirmed_risk] [location]: [description] — [rationale]
  - [defense_gap] [location]: [description] — [rationale]
  - [hardening] [location]: [description] — [rationale]
  - [policy] [location]: [description] — [rationale]
  Notes: [notes from security-reviewer, if present]

Resolve discrepancies by route:
  c) Code-side fix
  d) Design-side update
  s) Skip

Default: accept all recommended routes.

Accepted response formats:
- empty input -- accept every recommended route
- `all-recommended` -- accept every recommended route
- `all:c`, `all:d`, or `all:s` -- apply one route to every finding
- Per-finding routes, e.g. `F1:c, F2:d, F3:s`
```

Before presenting results, recommend a route for each finding:
- Use `d` when implementation intent matches the requirement but the Design Doc is stale or too narrow.
- Use `c` when code drifted from a still-correct Design Doc, or when the finding is reliability, security, or maintainability related.
- Use `s` only when the user explicitly accepts the current state without changes.

**[STOP — BLOCKING]** Present results and recommended routes to user for confirmation.
**CANNOT proceed until user explicitly confirms routes.**

If all findings are skipped: Skip Steps 5-10, proceed to Step 11.

### Step 5: Prepare Fix Context

Reference documentation-criteria skill for task file template.

### Step 5d: Design-Side Update

Run this step only when the user routes at least one finding to `d`.

1. Spawn technical-designer agent in update mode: "Update Design Doc at [path]. The implementation is being accepted as correct for these findings: [d-routed findings with code locations and current Design Doc values]. Update the relevant sections and add change history."
2. Spawn document-reviewer agent: "Review updated Design Doc at [path] for consistency and completeness."
3. If multiple Design Docs exist in `docs/design/`, spawn design-sync agent: "Check cross-Design Doc consistency after updating [path]."
4. If the user selected both `d` and `c` routes, re-evaluate the `c` findings against the updated Design Doc and drop any that are now satisfied.

### Step 6: Create Task File

Create task file at `docs/plans/tasks/review-fixes-YYYYMMDD.md`
Include only code-side compliance issues and security requiredFixes routed to `c`.

### Step 7: Execute Fixes

Spawn task-executor agent: "Execute review fixes. Task file: docs/plans/tasks/review-fixes-YYYYMMDD.md. Apply staged fixes (stops at 5 files)."

### Step 8: Quality Check

Spawn quality-fixer agent: "Confirm quality gate passage for fixed files."

### Step 9: Re-validate code-reviewer

Spawn code-reviewer agent: "Re-validate Design Doc compliance after fixes. Prior compliance issues: $STEP_2_OUTPUT. Verify each prior issue is resolved."

### Step 10: Re-validate security-reviewer (only if security fixes were applied)

Spawn security-reviewer agent: "Re-validate security after fixes. Prior findings: $STEP_3_OUTPUT. Design Doc: [path]. Implementation files: [union of $STEP_1_FILES and task-executor filesModified from Step 7, deduplicated]."

### Step 11: Final Report

Delete the review-fix task file this recipe created, if present. Its work is committed; `docs/plans/` is ephemeral working state.

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
