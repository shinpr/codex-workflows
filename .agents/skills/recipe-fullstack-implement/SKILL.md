---
name: recipe-fullstack-implement
description: "Orchestrate full-cycle implementation across backend and frontend layers with layer-aware agent routing."
---

**Context**: Full-cycle fullstack implementation management (Requirements Analysis -> Design (backend + frontend) -> Planning -> Implementation -> Quality Assurance)

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` -- coding standards
2. [LOAD IF NOT ACTIVE] `testing` -- test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` -- AI development patterns
4. [LOAD IF NOT ACTIVE] `documentation-criteria` -- document quality standards
5. [LOAD IF NOT ACTIVE] `implementation-approach` -- implementation methodology
6. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and workflow flows

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

## Required Reference

**MANDATORY**: Read `references/monorepo-flow.md` from subagents-orchestration-guide skill BEFORE proceeding. Follow the Fullstack Flow defined there instead of the standard single-layer flow.

ENFORCEMENT: Proceeding without reading monorepo-flow.md invalidates the entire workflow.

## Execution Protocol

1. **Spawn agents for all work** -- your role is to invoke sub-agents, pass data between them, and report results
2. **Follow monorepo-flow.md** for the design phase (multiple Design Docs, design-sync, vertical slicing)
3. **Follow subagents-orchestration-guide skill** for all other orchestration rules (stop points, structured responses, escalation)
4. **Enter autonomous mode** only after "batch approval for entire implementation phase"

**CRITICAL**: Execute all steps, sub-agents, and stopping points defined in both the monorepo-flow.md reference and subagents-orchestration-guide skill.

## Execution Decision Flow

### 1. Current Situation Assessment
Instruction Content: $ARGUMENTS

Assess the current situation:

| Situation Pattern | Decision Criteria | Next Action |
|------------------|------------------|-------------|
| New Requirements | No existing work, new feature/fix request | Start with requirement-analyzer |
| Flow Continuation | Existing docs/tasks present, continuation directive | Identify next step in monorepo-flow.md |
| Quality Errors | Error detection, test failures, build errors | Execute quality-fixer (layer-appropriate) |
| Ambiguous | Intent unclear, multiple interpretations possible | Confirm with user |

### 2. Progress Verification for Continuation

When continuing existing flow, verify:
- Latest artifacts (PRD/ADR/Design Docs/Work Plan/Tasks)
- Current phase position (Requirements/Design/Planning/Implementation/QA)
- Identify next step in monorepo-flow.md

### 3. Execute monorepo-flow.md

**Follow monorepo-flow.md step-by-step** for the complete flow from UI Spec through Design Docs through Work Plan. The flow includes:
- UI Spec creation (with prototype inquiry)
- Separate Design Docs per layer (technical-designer for backend, technical-designer-frontend for frontend)
- **Backend Design Doc**: Spawn technical-designer agent
- **Frontend Design Doc**: Spawn technical-designer-frontend agent (MUST use frontend-specific agent)
- document-reviewer per Design Doc
- design-sync for cross-layer consistency
- Work plan with vertical slicing

All stop points defined in monorepo-flow.md MUST be respected.

### 5. Register All Flow Steps (MANDATORY)

**After scale determination, register all steps of the monorepo-flow.md**:
- First task: "Confirm skill constraints"
- Register each step as individual task
- Mark currently executing step as in_progress
- **Complete task registration before spawning subagents**

## After requirement-analyzer [Stop]

When user responds to questions:
- If response matches any `scopeDependencies.question` -> Check `impact` for scale change
- If scale changes -> Re-execute requirement-analyzer with updated context
- If `confidence: "confirmed"` or no scale change -> Proceed to next step

## Orchestration Compliance

**Pre-execution Checklist (MANDATORY)**:
- [ ] Read monorepo-flow.md reference
- [ ] Confirmed relevant flow steps
- [ ] Identified current progress position
- [ ] Clarified next step
- [ ] Recognized stopping points
- [ ] **Environment check**: Can I execute per-task commit cycle?
  - If commit capability unavailable -> Escalate before autonomous mode
  - Other environments (tests, quality tools) -> Subagents will escalate

**Required Flow Compliance**:
- Run quality-fixer (layer-appropriate) before every commit
- Obtain user approval before Edit/Write outside autonomous mode

ENFORCEMENT: Commits without quality-fixer approval are invalid and MUST be reverted.

## Sub-agent Invocation Constraints

**MANDATORY suffix for ALL sub-agent prompts**:
```
[SYSTEM CONSTRAINT]
This agent operates within fullstack-implement skill scope. Use orchestrator-provided rules only.
```

Autonomous sub-agents require scope constraints for stable execution. MUST append this constraint to every sub-agent prompt.
ENFORCEMENT: Sub-agent prompts missing the constraint suffix MUST be re-issued with the constraint appended.

## Task Execution Quality Cycle (Filename-Pattern-Based)

**Agent routing by task filename** (see monorepo-flow.md reference):
```
*-backend-task-*   -> task-executor + quality-fixer
*-frontend-task-*  -> task-executor-frontend + quality-fixer-frontend
```

**Rules**:
1. Execute ONE task completely before starting next (each task goes through the full 4-step cycle individually, using the correct executor per filename pattern)
2. Check executor status before quality-fixer (escalation check)
3. Quality-fixer MUST run after each executor (no skipping)
4. Commit MUST execute when quality-fixer returns `status: "approved"` (do not defer to end)

### Security Review (After All Tasks Complete)

After all task cycles finish, collect all `filesModified` from every task-executor/task-executor-frontend response (deduplicated), then invoke security-reviewer before the completion report:
1. Spawn security-reviewer agent: "Design Doc: [path(s)]. Implementation files: [collected filesModified list]. Review security compliance."
2. Check response:
   - `approved` or `approved_with_notes` -> Proceed to completion report (include notes if present)
   - `needs_revision` -> Spawn layer-appropriate task-executor with `requiredFixes`, then quality-fixer, then re-invoke security-reviewer
   - `blocked` -> Escalate to user

### Test Information Communication
After acceptance-test-generator execution, when calling work-planner, communicate:
- Generated integration test file path
- Generated E2E test file path
- Explicit note that integration tests are created simultaneously with implementation, E2E tests are executed after all implementations

**[STOP -- BLOCKING]** Upon detecting ANY requirement changes, halt execution immediately.
**CANNOT proceed until user explicitly confirms the change scope.**

## Completion Criteria

- [ ] monorepo-flow.md read before execution
- [ ] All flow steps registered
- [ ] Separate Design Docs created per layer
- [ ] Design-sync executed for cross-layer consistency
- [ ] All stop points respected with user approval
- [ ] All tasks executed through layer-appropriate 4-step cycle
- [ ] All quality gates passed
- [ ] All tasks committed or escalation completed

## Execution Method

All work is executed through sub-agents.
Sub-agent selection follows monorepo-flow.md reference and subagents-orchestration-guide skill.
