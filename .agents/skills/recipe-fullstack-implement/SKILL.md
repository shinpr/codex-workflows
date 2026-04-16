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

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

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
- [ ] codebase-analyzer included before each Design Doc creation
- [ ] code-verifier included before each Design Doc review
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
3. Quality-fixer MUST run after each executor (no skipping), MUST receive the executor `filesModified` list as stub-detection scope, and MUST receive the current task file as the `task_file` input so it reads the task file's `Quality Assurance Mechanisms` section as supplementary quality-check hints
4. If quality-fixer returns `status: "stub_detected"`, route the task back to the same executor with `stubFindings`
5. Commit MUST execute only when quality-fixer returns `status: "approved"` (do not defer to end)

### Post-Implementation Verification (After All Tasks Complete)

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

### Test Information Communication
After acceptance-test-generator execution, when calling work-planner, communicate:
- Generated integration test file path
- Generated E2E test file path or `null`
- E2E absence reason when no E2E file is generated
- Explicit note that integration tests are created simultaneously with implementation, E2E tests are executed after all implementations only when an E2E file exists

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
