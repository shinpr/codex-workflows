---
name: recipe-front-build
description: "Execute frontend tasks in autonomous execution mode using task-executor-frontend and quality-fixer-frontend."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` -- coding standards
2. [LOAD IF NOT ACTIVE] `testing` -- test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` -- AI development patterns
4. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and workflow flows

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Spawn agents for all work** -- your role is to invoke sub-agents, pass data between them, and report results
2. **Follow the 4-step task cycle exactly**: task-executor-frontend -> escalation check -> quality-fixer-frontend -> commit
3. **Enter autonomous mode** when user provides execution instruction with existing task files -- this IS the batch approval
4. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: MUST run quality-fixer-frontend before every commit.
ENFORCEMENT: Commits without quality-fixer-frontend approval are invalid and MUST be reverted.

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
Spawn task-decomposer agent: "Read work plan at docs/plans/[plan-name].md and decompose into atomic tasks. Output: Individual task files in docs/plans/tasks/. Granularity: 1 task = 1 commit = independently executable"

### 3. Verify Generation
Verify generated task files exist in docs/plans/tasks/.

## Pre-execution Checklist

- [ ] Confirmed task files exist in docs/plans/tasks/
- [ ] Identified task execution order (dependencies)
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable -> Escalate before autonomous mode
  - Other environments (tests, quality tools) -> Subagents will escalate

## Task Execution Cycle (4-Step Cycle) - Frontend Specialized

**MANDATORY EXECUTION CYCLE**: `task-executor-frontend -> escalation check -> quality-fixer-frontend -> commit`

### Structured Response Specification
Each sub-agent responds in JSON format:
- **task-executor-frontend**: status, filesModified, testsAdded, requiresTestReview, readyForQualityCheck
- **integration-test-reviewer**: status (approved/needs_revision/blocked), requiredFixes
- **quality-fixer-frontend**: status, checksPerformed, fixesApplied

### Execution Flow for Each Task

For EACH task, YOU MUST:
1. **Register tasks**: Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity"
2. **Spawn task-executor-frontend agent**: "Task file: docs/plans/tasks/[filename].md Execute frontend implementation"
3. **CHECK task-executor-frontend response**:
   - `status: "escalation_needed"` or `"blocked"` -> STOP and escalate to user
   - `requiresTestReview` is `true` -> Spawn integration-test-reviewer agent: "Review integration tests in [test-files]"
     - `needs_revision` -> Return to step 2 with `requiredFixes`
     - `approved` -> Proceed to step 4
   - `readyForQualityCheck: true` -> Proceed to step 4
4. **Spawn quality-fixer-frontend agent**: "Execute all frontend quality checks and fixes. Task file: docs/plans/tasks/[filename].md. The task file path above is also the `task_file` input. Read its `Quality Assurance Mechanisms` section as supplementary quality-check hints. filesModified: [task-executor-frontend response filesModified]. Use these files as the stub-detection scope."
5. **CHECK quality-fixer-frontend response**:
   - `status: "stub_detected"` -> Return to step 2 with `stubFindings`
   - `status: "blocked"` -> STOP and escalate to user
   - `status: "approved"` -> Proceed to step 6
6. **COMMIT on approval**: After `status: "approved"` from quality-fixer-frontend -> Execute git commit. Use `changeSummary` for commit message.

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

After all task cycles finish, collect all `filesModified` from every task-executor-frontend response (deduplicated), then run both verification agents before the completion report:
1. Spawn code-verifier agent: "Verify implementation consistency against the Design Doc. `doc_type: design-doc`. `document_path`: [path]. `code_paths`: [collected filesModified list]."
2. Spawn security-reviewer agent: "Design Doc: [path]. Implementation files: [collected filesModified list]. Review security compliance."
3. Consolidate results:
   - code-verifier passes when `summary.status` is `consistent` or `mostly_consistent`
   - code-verifier fails when `summary.status` is `needs_review` or `inconsistent`
   - security-reviewer passes when `status` is `approved` or `approved_with_notes`
   - security-reviewer fails when `status` is `needs_revision`
   - security-reviewer `blocked` -> Escalate to user
4. If either verifier fails:
   - Create a single fix task covering verifier discrepancies and security requiredFixes
   - Spawn task-executor-frontend with that consolidated task
   - Spawn quality-fixer-frontend
   - Re-run only the verifier(s) that failed
   - Maximum retry count is 1 verification fix cycle; if any failed verifier still fails after re-run, escalate to the user
5. If both verifiers pass -> Proceed to completion report

**[STOP -- BLOCKING]** Upon detecting ANY requirement changes, halt execution immediately.
**CANNOT proceed until user explicitly confirms the change scope.**

## Completion Criteria

- [ ] Task files verified in docs/plans/tasks/
- [ ] Task execution order identified with dependencies
- [ ] Environment check completed (commit capability confirmed)
- [ ] All tasks executed through 4-step cycle (task-executor-frontend -> check -> quality-fixer-frontend -> commit)
- [ ] System constraint suffix appended to all sub-agent prompts
- [ ] All quality gates passed
- [ ] All tasks committed or escalation completed

## Output Example
Frontend implementation phase completed.
- Task decomposition: Generated under docs/plans/tasks/
- Implemented tasks: [number] tasks
- Quality checks: All passed (Lighthouse, bundle size, tests)
- Commits: [number] commits created
