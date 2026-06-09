---
name: recipe-build
description: "Execute decomposed backend tasks in autonomous execution mode using task-executor and quality-fixer."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` — coding standards
2. [LOAD IF NOT ACTIVE] `testing` — test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` — AI development patterns
4. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Spawn agents for all work** -- your role is to invoke sub-agents, pass data between them, and report results
2. **Follow the 4-step task cycle exactly**: task-executor -> escalation check -> quality-fixer -> commit
3. **Enter autonomous mode** when user provides execution instruction with existing task files -- this IS the batch approval
4. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: MUST run quality-fixer before every commit.
ENFORCEMENT: Commits without quality-fixer approval are invalid and MUST be reverted.

Work plan: $ARGUMENTS

## Pre-execution Prerequisites

### Implementation Readiness Resolution

Before task processing, locate the work plan and resolve implementation readiness.

Resolution rule:
1. If `$ARGUMENTS` contains a work plan path, use that exact file and derive `{plan-name}` from its basename. This takes precedence over task-file mtimes.
2. If `$ARGUMENTS` is empty, list task files in `docs/plans/tasks/` matching the single-layer pattern `{plan-name}-task-*.md`.
3. Exclude `*-task-prep-*.md`, `_overview-*.md`, `*-phase*-completion.md`, `review-fixes-*.md`, and `integration-tests-*-task-*.md`.
4. If matching task files exist, infer `{plan-name}` from the most recent matching task file and use `docs/plans/{plan-name}.md`.
5. If no matching task files exist, use the most recent non-template work plan in `docs/plans/`.

Read the work plan header and apply this readiness rule:

| Header state | Action |
|--------------|--------|
| `Implementation Readiness: ready` | Proceed to Consumed Task Set computation |
| `Implementation Readiness: pending` | Execute the Implementation Readiness Preflight Procedure from `subagents-orchestration-guide` for the resolved work plan. Re-read the resulting marker: proceed to Consumed Task Set only when it is `ready`; if it is `escalated`, follow the `escalated` row |
| `Implementation Readiness: escalated` | Present the persisted Readiness Report remaining gaps, then continue only on explicit user approval |
| marker absent | Execute the Implementation Readiness Preflight Procedure from `subagents-orchestration-guide` for the resolved work plan. Re-read the resulting marker: proceed to Consumed Task Set only when it is `ready`; if it is `escalated`, follow the `escalated` row |

### Consumed Task Set

Compute the **Consumed Task Set** for this run: task files in `docs/plans/tasks/` matching `{plan-name}-task-*.md`, excluding `*-task-prep-*.md`, `_overview-*.md`, `*-phase*-completion.md`, `review-fixes-*.md`, and `integration-tests-*-task-*.md`.

Every subsequent reference to task files in this recipe uses this set, not an unrestricted `docs/plans/tasks/*.md` scan.

### Task Generation Decision Flow

Analyze task file existence state and determine the action required:

| State | Criteria | Next Action |
|-------|----------|-------------|
| Tasks exist | Consumed Task Set is non-empty | User's execution instruction serves as batch approval -> Enter autonomous execution immediately |
| No tasks + plan exists + reviewed plan | Consumed Task Set is empty and WorkPlan Review records `Status: approved`, `Conditions: none` | Confirm with user -> spawn task-decomposer |
| No tasks + small simplified plan | Consumed Task Set is empty, plan exists, and the plan references no Design Doc | Confirm with user -> spawn task-decomposer |
| No tasks + plan exists + unreviewed plan | Consumed Task Set is empty, the plan references a Design Doc, and WorkPlan Review is absent, pending, conditional, or not approved | Run work plan review, then confirm with user -> spawn task-decomposer |
| Neither exists | No plan or task files | Error: Prerequisites not met |

## Task Decomposition Phase (Conditional)

When task files don't exist, the plan references a Design Doc, and the WorkPlan Review section is absent, pending, conditional, or not approved:

### 1. Work Plan Review

Spawn document-reviewer agent: "Review the work plan before task decomposition. doc_type: WorkPlan. target: docs/plans/[plan-name].md. mode: composite. Review semantic traceability to the Design Doc, early verification placement, real-boundary verification coverage, Proof Strategy, Failure Mode Checklist, Review Scope, and Quality Assurance coverage."

Branch on `verdict.decision`:
- `approved` -> spawn work-planner in update mode once to record `Status: approved` and `Conditions: none` in WorkPlan Review, then continue to user confirmation
- `approved_with_conditions` -> stop before task decomposition and report that the work plan needs update via recipe-plan
- `needs_revision` -> stop before task decomposition and report that the work plan needs update via recipe-plan
- `rejected` -> stop before task decomposition and present the blocking findings to the user

When task files don't exist and the WorkPlan Review section records `Status: approved` and `Conditions: none`, skip Work Plan Review and continue to user confirmation.

### 2. User Confirmation
```
No task files found.
Work plan: docs/plans/[plan-name].md

Generate tasks from the work plan? (y/n):
```

### 3. Task Decomposition (if approved)
Spawn task-decomposer agent: "Read work plan at docs/plans/[plan-name].md and decompose into atomic tasks. Output: Individual task files in docs/plans/tasks/. Granularity: 1 task = 1 commit = independently executable."

### 4. Verify Generation
Recompute the Consumed Task Set and verify it is non-empty.

## Pre-execution Checklist

- [ ] Confirmed task files exist in docs/plans/tasks/
- [ ] Identified task execution order (dependencies)
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable -> Escalate before autonomous mode
  - Other environments (tests, quality tools) -> Subagents will escalate

## Task Execution Cycle (4-Step Cycle)

**MANDATORY EXECUTION CYCLE**: `task-executor -> escalation check -> quality-fixer -> commit`

For EACH task, YOU MUST:
1. **Register tasks**: Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity"
2. **Spawn task-executor agent**: "Execute the task implementation for [task-file-path]"
3. **CHECK task-executor response**:
   - `status: "escalation_needed"` or `"blocked"` -> STOP and escalate to user
   - `requiresTestReview` is `true` -> Spawn integration-test-reviewer agent: "Review integration tests in [test-files]"
     - `needs_revision` -> Return to step 2 with `requiredFixes`
     - `approved` -> Proceed to step 4
   - `readyForQualityCheck: true` -> Proceed to step 4
4. **Spawn quality-fixer agent**: "Execute all quality checks and fixes. Task file: [task-file-path]. The task file path above is also the `task_file` input. Read its `Quality Assurance Mechanisms` section as supplementary quality-check hints. filesModified: [task-executor response filesModified]. Use these files as the stub-detection scope."
5. **CHECK quality-fixer response**:
   - `status: "stub_detected"` -> Return to step 2 with `stubFindings`
   - `status: "blocked"` -> STOP and escalate to user
   - `status: "approved"` -> Proceed to step 6
6. **COMMIT on approval**: After `status: "approved"` from quality-fixer -> Execute git commit

**CRITICAL**: MUST monitor ALL structured responses WITHOUT EXCEPTION and ENSURE every quality gate is passed.
ENFORCEMENT: Proceeding past a failed quality gate invalidates all subsequent work.

## Sub-agent Invocation Constraints

**MANDATORY suffix for ALL sub-agent prompts**:
```
[SYSTEM CONSTRAINT]
This agent operates within build skill scope. Use the task file as the primary instruction source. Use the active Design Doc or work plan only as supporting context when the task file references them. Constraints explicitly passed in this prompt by the orchestrator take precedence over supporting context. The agent's own role contract and required quality rules remain in force.
```

Autonomous sub-agents require scope constraints for stable execution. MUST append this constraint to every sub-agent prompt.
ENFORCEMENT: Sub-agent prompts missing the constraint suffix MUST be re-issued with the constraint appended.

VERIFY approval status before proceeding. Once confirmed, INITIATE autonomous execution mode.

## Post-Implementation Verification (After All Tasks Complete)

After all task cycles finish, collect all `filesModified` from every task-executor response (deduplicated), then run both verification agents before the completion report:
1. Spawn code-verifier agent: "Verify implementation consistency against the Design Doc. `doc_type: design-doc`. `document_path`: [path]. `code_paths`: [collected filesModified list]. Work Plan Review Scope: [Review Scope value from the active work plan, used only to confirm the collected file set is complete]."
2. Spawn security-reviewer agent: "Design Doc: [path]. Implementation files: [collected filesModified list]. Review security compliance."
3. Consolidate results:
   - code-verifier passes when `summary.status` is `consistent` or `mostly_consistent`
   - code-verifier fails when `summary.status` is `needs_review` or `inconsistent`
   - security-reviewer passes when `status` is `approved` or `approved_with_notes`
   - security-reviewer fails when `status` is `needs_revision`
   - security-reviewer `blocked` -> Escalate to user
4. If either verifier fails:
   - Create a single fix task covering verifier discrepancies and security requiredFixes
   - Spawn task-executor with that consolidated task
   - Spawn quality-fixer
   - Re-run only the verifier(s) that failed
   - Maximum retry count is 1 verification fix cycle; if any failed verifier still fails after re-run, escalate to the user
5. If both verifiers pass -> Proceed to completion report

## Final Cleanup

Before the completion report, delete only these files for the current `{plan-name}`:
- Every file in the Consumed Task Set
- `docs/plans/tasks/{plan-name}-phase*-completion.md`
- `docs/plans/tasks/_overview-{plan-name}.md`

Preserve the work plan itself.

If cleanup fails, report the failed path but do not invalidate completed implementation work.

**[STOP — BLOCKING]** Upon detecting ANY requirement changes, halt execution immediately.
**CANNOT proceed until user explicitly confirms the change scope.**

## Completion Criteria

- [ ] Task files verified in docs/plans/tasks/
- [ ] Task execution order identified with dependencies
- [ ] Environment check completed (commit capability confirmed)
- [ ] All tasks executed through 4-step cycle (task-executor -> check -> quality-fixer -> commit)
- [ ] System constraint suffix appended to all sub-agent prompts
- [ ] All quality gates passed
- [ ] All tasks committed or escalation completed

## Output Example
Backend implementation phase completed.
- Task decomposition: Generated under docs/plans/tasks/
- Implemented tasks: [number] tasks
- Quality checks: All passed
- Commits: [number] commits created
