---
name: recipe-build
description: "Execute decomposed backend tasks in autonomous execution mode using task-executor and quality-fixer."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` — coding standards
2. [LOAD IF NOT ACTIVE] `testing` — test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` — AI development patterns
4. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows

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

### Task File Existence Check
Check for work plans in docs/plans/ and task files in docs/plans/tasks/.

### Task Generation Decision Flow

Analyze task file existence state and determine the action required:

| State | Criteria | Next Action |
|-------|----------|-------------|
| Tasks exist | .md files in tasks/ directory | User's execution instruction serves as batch approval -> Enter autonomous execution immediately |
| No tasks + plan exists | Plan exists but no task files | Confirm with user -> spawn task-decomposer |
| Neither exists | No plan or task files | Error: Prerequisites not met |

## Task Decomposition Phase (Conditional)

When task files don't exist:

### 1. User Confirmation
```
No task files found.
Work plan: docs/plans/[plan-name].md

Generate tasks from the work plan? (y/n):
```

### 2. Task Decomposition (if approved)
Spawn task-decomposer agent: "Read work plan at docs/plans/[plan-name].md and decompose into atomic tasks. Output: Individual task files in docs/plans/tasks/. Granularity: 1 task = 1 commit = independently executable."

### 3. Verify Generation
Verify generated task files exist in docs/plans/tasks/.

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
4. **Spawn quality-fixer agent**: "Execute all quality checks and fixes"
5. **COMMIT on approval**: After `approved: true` from quality-fixer -> Execute git commit

**CRITICAL**: MUST monitor ALL structured responses WITHOUT EXCEPTION and ENSURE every quality gate is passed.
ENFORCEMENT: Proceeding past a failed quality gate invalidates all subsequent work.

## Sub-agent Invocation Constraints

**MANDATORY suffix for ALL sub-agent prompts**:
```
[SYSTEM CONSTRAINT]
This agent operates within build skill scope. Use orchestrator-provided rules only.
```

Autonomous sub-agents require scope constraints for stable execution. MUST append this constraint to every sub-agent prompt.
ENFORCEMENT: Sub-agent prompts missing the constraint suffix MUST be re-issued with the constraint appended.

VERIFY approval status before proceeding. Once confirmed, INITIATE autonomous execution mode.

## Security Review (After All Tasks Complete)

After all task cycles finish, collect all `filesModified` from every task-executor response (deduplicated), then invoke security-reviewer before the completion report:
1. Spawn security-reviewer agent: "Design Doc: [path]. Implementation files: [collected filesModified list]. Review security compliance."
2. Check response:
   - `approved` or `approved_with_notes` -> Proceed to completion report (include notes if present)
   - `needs_revision` -> Spawn task-executor with `requiredFixes`, then quality-fixer, then re-invoke security-reviewer
   - `blocked` -> Escalate to user

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
