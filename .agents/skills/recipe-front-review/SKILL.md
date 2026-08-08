---
name: recipe-front-review
description: "Frontend Design Doc compliance and security validation with optional auto-fixes using React-specific quality checks."
---

**Context**: Post-implementation quality assurance for React/TypeScript frontend

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` -- repository implementation rules
2. [LOAD IF NOT ACTIVE] `testing` -- verification and test quality rules
3. [LOAD IF NOT ACTIVE] `ai-development-guide` -- review and repair discipline
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` -- task file contract
5. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and result handling

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

## Execution Method

- Compliance validation -> performed by code-reviewer
- Security validation -> performed by security-reviewer
- Code-side fix path -> performed by task-executor-frontend
- Design-side update path -> performed by technical-designer-frontend in update mode, then document-reviewer, then design-sync when multiple Design Docs exist
- Quality checks -> performed by quality-fixer-frontend
- Re-validation -> performed by code-reviewer / security-reviewer

Orchestrator spawns agents and passes structured data between them.

Design Doc (uses most recent if omitted): $ARGUMENTS

## Execution Flow

### 1. Prerequisite Check
Identify the Design Doc in docs/design/ and check implementation files changed from the default branch (detect via `git symbolic-ref refs/remotes/origin/HEAD` or fall back to current branch diff).
If a single active work plan is explicitly provided or unambiguously resolved for that Design Doc, read its `Review Scope` line. Otherwise set `Work Plan: none` and `Review Scope: none`; do not infer.

**[STOP -- BLOCKING]** If no Design Doc or implementation files found, notify user and halt.
**CANNOT proceed without both a Design Doc and implementation files.**

### 2. Execute code-reviewer
Spawn code-reviewer agent: "Validate Design Doc compliance for [design-doc-path]. Work Plan: [resolved work plan path or none]. Review Scope: [literal Review Scope value or none]. Implementation files: [git diff file list]. Review mode: full. Return structured JSON report per your Output Format specification."

**Store output as**: `$STEP_2_OUTPUT`

### 3. Execute security-reviewer
Spawn security-reviewer with `governingDocuments: [{type: "design-doc", path: [path]}]` and `implementationFiles: [file list from git diff in Step 1]`.

**Store output as**: `$STEP_3_OUTPUT` and `$STEP_1_FILES` (the initial file list)

### 4. Verdict and Response

If either reviewer returns a blocked or otherwise unusable result, apply Orchestrator Escalation Resolution before continuing.

**Code compliance criteria (considering project stage)**:
- `code-reviewer` verdict is `pass`

**Security criteria**:
- `approved` -> Pass
- `needs_revision` -> Fail

Report both results from their evidence, then apply Review Resolution before proposing corrections:

```
Code Compliance: [verdict]
  Acceptance Criteria: [fulfilled/unfulfilled items with evidence]
  Findings: [blocking findings with basis and effect]
  Recommendations: [non-blocking items]

Security Review: [status from security-reviewer]
  Findings by category:
  - [confirmed_risk] [location]: [description] — [rationale]
  - [defense_gap] [location]: [description] — [rationale]

Proposed corrections:
  c) Code-side fix
  d) Design-side update
Declined recommendations:
  - [finding and evidence-backed reason]
```

Apply Review Resolution before presenting results. Recommend a correction route only for findings classified `apply` or `user_decision_required`:
- Use `d` when implementation intent matches the requirement but the Design Doc is stale or too narrow.
- Use `c` when code drifted from a still-correct Design Doc, or when the finding is reliability, security, or maintainability related.

Present the review and internally declined recommendations. When no correction remains, proceed to Final Report. Because this recipe is a review request rather than prior implementation authority, ask once before applying the proposed code or document corrections.

If the user declines corrections, skip fix steps and proceed to Final Report.

## Pre-fix Metacognition

1. **Design-side update**: If any accepted finding is routed to `d`, spawn technical-designer-frontend in update mode, then document-reviewer with `doc_type: DesignDoc` and `review_context: update`, then design-sync when multiple Design Docs exist. If both `d` and `c` routes exist, re-evaluate the `c` findings against the updated Design Doc and drop any now satisfied.
2. **Plan fixes**: Use the active execution plan when one exists. When none exists, create one for the accepted fix flow. Create `docs/plans/tasks/review-fixes-YYYYMMDD.md` with only accepted code compliance issues and security required fixes routed to `c`.
3. **Execute fixes**: Start the Per-Task Change Set, invoke task-executor-frontend with the task file, inspect its result and repository diff, and accumulate its paths.
4. **Quality check**: Invoke quality-fixer-frontend with `task_file`, `filesModified: taskWriteSet`, and executor operation-verification evidence. On approval, add its paths and commit the reconciled set; repair stubs through task-executor-frontend, accumulate their paths, and resolve blocked results through Orchestrator Escalation Resolution.
5. **Re-validate**: Run code-reviewer and security-reviewer against the updated Design Doc and actual implementation and fix files. Pass both `prior_feedback: [applied corrections and declined finding IDs with reasons and evidence]` and review the current result normally.

After any code fix, both review agents must re-run. Delete the task file only after both pass.

ENFORCEMENT: Auto-fixes MUST go through quality-fixer-frontend before re-validation. Skipping quality checks invalidates fixes.

### Final Report
Delete the review-fix task file this recipe created, if present. Its work is committed; `docs/plans/` is ephemeral working state.

```
Code Compliance:
  Initial: [verdict]
  Final: [verdict] (if fixes executed)

Security Review:
  Initial: [status]
  Final: [status] (if fixes executed)

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

- [ ] Design Doc compliance validated
- [ ] Security review completed
- [ ] Compliance verdict is evidence-backed
- [ ] User informed of results
- [ ] Fixes executed if requested and approved
- [ ] Quality gates passed for all fixes
- [ ] Final compliance and security re-validated

**Scope**: Design Doc compliance validation, security review, and auto-fixes.
