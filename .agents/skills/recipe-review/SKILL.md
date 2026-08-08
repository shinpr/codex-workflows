---
name: recipe-review
description: "Design Doc compliance and security validation with optional auto-fixes."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` — repository implementation rules
2. [LOAD IF NOT ACTIVE] `testing` — verification and test quality rules
3. [LOAD IF NOT ACTIVE] `ai-development-guide` — review and repair discipline
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — task file contract
5. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and result handling

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

**Context**: Post-implementation quality assurance

## Orchestrator Definition

**Core Identity**: Coordinate review, perform lightweight evidence collection and routing directly, and invoke specialists for semantic review and implementation repair.

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

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
Spawn security-reviewer with `governingDocuments: [{type: "design-doc", path: [path]}]` and `implementationFiles: [file list from git diff in Step 1]`.

**Store output as**: `$STEP_3_OUTPUT` and `$STEP_1_FILES` (the initial file list)

### Step 4: Verdict and Response

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

Present the review and internally declined recommendations. When no correction remains, proceed to Step 11. Because this recipe is a review request rather than prior implementation authority, ask once before applying the proposed code or document corrections.

If the user declines corrections, skip Steps 5-10 and proceed to Step 11.

### Step 5: Prepare Fix Context

Use the llm-friendly-context Task File Contract.

### Step 5d: Design-Side Update

Run this step only when the user routes at least one finding to `d`.

1. Spawn technical-designer agent in update mode: "Update Design Doc at [path]. The implementation is being accepted as correct for these findings: [d-routed findings with code locations and current Design Doc values]. Update the relevant sections and add change history."
2. Spawn document-reviewer agent: "Review updated Design Doc at [path] for consistency and completeness. doc_type: DesignDoc. review_context: update."
3. If multiple Design Docs exist in `docs/design/`, spawn design-sync agent: "Check cross-Design Doc consistency after updating [path]."
4. If the user selected both `d` and `c` routes, re-evaluate the `c` findings against the updated Design Doc and drop any that are now satisfied.

### Step 6: Create Task File

Create task file at `docs/plans/tasks/review-fixes-YYYYMMDD.md`
Include only code-side compliance issues and security findings routed to `c`.

### Step 7: Execute Fixes

Spawn task-executor agent: "Execute the accepted review fixes. Task file: docs/plans/tasks/review-fixes-YYYYMMDD.md."

Start the Per-Task Change Set before execution. Inspect the executor result and repository diff, add its paths, and continue when the requested fixes are present; resolve an incomplete or unusable result through Orchestrator Escalation Resolution.

### Step 8: Quality Check

Spawn quality-fixer with `task_file`, `filesModified: taskWriteSet`, and executor operation-verification evidence. On approval, add its paths and commit the reconciled Per-Task Change Set; repair stubs through task-executor, accumulate their paths, and resolve blocked results through Orchestrator Escalation Resolution.

### Step 9: Re-validate code-reviewer

Spawn code-reviewer with the Design Doc, actual implementation and fix files, and `prior_feedback: [applied corrections and declined finding IDs with reasons and evidence from Step 4]`. Review the current implementation normally and verify the applied corrections.

### Step 10: Re-validate security-reviewer

Spawn security-reviewer with `governingDocuments: [{type: "design-doc", path: [path]}]`, the actual implementation and fix files, and `prior_feedback: [applied corrections and declined finding IDs with reasons and evidence from Step 4]`.

After any code fix, both Steps 9 and 10 are mandatory even when only one reviewer initially reported a finding. Delete the task file only after both pass.

### Step 11: Final Report

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

- [ ] Design Doc identified and implementation files checked
- [ ] code-reviewer spawned and compliance validated
- [ ] security-reviewer spawned and security reviewed
- [ ] Results presented to user
- [ ] Fixes executed if user approved (with quality-fixer gate)
- [ ] Re-validation completed after fixes (both code and security)
- [ ] Final report presented to user

**Scope**: Design Doc compliance validation, security review, and auto-fixes.
