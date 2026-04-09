---
name: recipe-fullstack-build
description: "Execute decomposed fullstack tasks with layer-aware agent routing between backend and frontend executors."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` -- coding standards
2. [LOAD IF NOT ACTIVE] `testing` -- test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` -- AI development patterns
4. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and workflow flows

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

## Required Reference

**MANDATORY**: Read `references/monorepo-flow.md` from subagents-orchestration-guide skill BEFORE proceeding. Follow the Extended Task Cycle and Agent Routing defined there.

ENFORCEMENT: Proceeding without reading monorepo-flow.md invalidates the entire workflow.

## Execution Protocol

1. **Spawn agents for all work** -- your role is to invoke sub-agents, pass data between them, and report results
2. **Route agents by task filename pattern** (see monorepo-flow.md reference):
   - `*-backend-task-*` -> task-executor + quality-fixer
   - `*-frontend-task-*` -> task-executor-frontend + quality-fixer-frontend
3. **Follow the 4-step task cycle exactly**: executor -> escalation check -> quality-fixer -> commit
4. **Enter autonomous mode** when user provides execution instruction with existing task files -- this IS the batch approval
5. **Scope**: Complete when all tasks are committed or escalation occurs

**CRITICAL**: MUST run layer-appropriate quality-fixer before every commit.
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
Spawn task-decomposer agent: "Read work plan at docs/plans/[plan-name].md and decompose into atomic tasks. Output: Individual task files in docs/plans/tasks/. Granularity: 1 task = 1 commit = independently executable. Use layer-aware naming: {plan}-backend-task-{n}.md, {plan}-frontend-task-{n}.md based on target file paths."

### 3. Verify Generation
Verify generated task files exist in docs/plans/tasks/.

## Pre-execution Checklist

- [ ] Confirmed task files exist in docs/plans/tasks/
- [ ] Identified task execution order (dependencies)
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable -> Escalate before autonomous mode
  - Other environments (tests, quality tools) -> Subagents will escalate

## Agent Routing Table

| Filename Pattern | Executor | Quality Fixer |
|-----------------|----------|---------------|
| `*-backend-task-*` | task-executor | quality-fixer |
| `*-frontend-task-*` | task-executor-frontend | quality-fixer-frontend |
| `*-task-*` (no layer prefix) | task-executor | quality-fixer (default) |

## Task Execution Cycle (4-Step Cycle)

**MANDATORY EXECUTION CYCLE**: `executor -> escalation check -> quality-fixer -> commit`

For EACH task, YOU MUST:
1. **Register tasks**: Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity"
2. **Spawn task-executor or task-executor-frontend agent** (per routing table): "Execute the task implementation for [task-file-path]"
3. **CHECK executor response**:
   - `status: "escalation_needed"` or `"blocked"` -> STOP and escalate to user
   - `requiresTestReview` is `true` -> Spawn integration-test-reviewer agent: "Review integration tests in [test-files]"
     - `needs_revision` -> Return to step 2 with `requiredFixes`
     - `approved` -> Proceed to step 4
   - `readyForQualityCheck: true` -> Proceed to step 4
4. **Spawn quality-fixer agent** (layer-appropriate per routing table): "Execute all quality checks and fixes. Task file: [task-file-path]. filesModified: [executor response filesModified]. Use these files as the stub-detection scope."
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
This agent operates within build skill scope. Use the task file as the primary instruction source. Use the active Design Docs or work plan only as supporting context when the task file references them. Constraints explicitly passed in this prompt by the orchestrator take precedence over supporting context. The agent's own role contract and required quality rules remain in force.
```

Autonomous sub-agents require scope constraints for stable execution. MUST append this constraint to every sub-agent prompt.
ENFORCEMENT: Sub-agent prompts missing the constraint suffix MUST be re-issued with the constraint appended.

VERIFY approval status before proceeding. Once confirmed, INITIATE autonomous execution mode.

## Post-Implementation Verification (After All Tasks Complete)

After all task cycles finish, collect all `filesModified` from every task-executor/task-executor-frontend response (deduplicated), then run both verification agents before the completion report:
1. Spawn code-verifier once per Design Doc: "Verify implementation consistency against the Design Doc. `doc_type: design-doc`. `document_path`: [single design doc path]. `code_paths`: [collected filesModified list]."
2. Spawn security-reviewer agent: "Design Doc: [path(s)]. Implementation files: [collected filesModified list]. Review security compliance."
3. Consolidate results:
   - each code-verifier run passes when `summary.status` is `consistent` or `mostly_consistent`
   - a code-verifier run fails when `summary.status` is `needs_review` or `inconsistent`
   - security-reviewer passes when `status` is `approved` or `approved_with_notes`
   - security-reviewer fails when `status` is `needs_revision`
   - security-reviewer `blocked` -> Escalate to user
4. If any verifier fails:
   - Create a single fix task covering verifier discrepancies and security requiredFixes
   - Spawn the layer-appropriate task-executor
   - Spawn the layer-appropriate quality-fixer
   - Re-run only the verifier(s) that failed
   - Maximum retry count is 1 verification fix cycle; if any failed verifier still fails after re-run, escalate to the user
5. If all verifiers pass -> Proceed to completion report

**[STOP -- BLOCKING]** Upon detecting ANY requirement changes, halt execution immediately.
**CANNOT proceed until user explicitly confirms the change scope.**

## Completion Criteria

- [ ] monorepo-flow.md read before execution
- [ ] Task files verified in docs/plans/tasks/
- [ ] Task execution order identified with dependencies
- [ ] Environment check completed (commit capability confirmed)
- [ ] All tasks routed to correct layer-appropriate agents
- [ ] All tasks executed through 4-step cycle (executor -> check -> quality-fixer -> commit)
- [ ] System constraint suffix appended to all sub-agent prompts
- [ ] All quality gates passed
- [ ] All tasks committed or escalation completed

## Output Example
Fullstack implementation phase completed.
- Task decomposition: Generated under docs/plans/tasks/
- Implemented tasks: [number] tasks (backend: X, frontend: Y)
- Quality checks: All passed
- Commits: [number] commits created
