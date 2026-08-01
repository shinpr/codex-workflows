---
name: recipe-implement
description: "Orchestrate the complete implementation lifecycle from requirements to deployment."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows
2. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
3. [LOAD IF NOT ACTIVE] `requirement-convergence` — outcome, exclusion, and rough-cost convergence before design
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — clear prompts, handoffs, and generated artifacts

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

# Full-Cycle Implementation

$ARGUMENTS

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**CRITICAL**: MUST execute all steps, sub-agents, and stopping points defined in subagents-orchestration-guide skill flows.
ENFORCEMENT: Skipping any step or stopping point invalidates the entire workflow output.

## CRITICAL Sub-agent Invocation Constraints

**MANDATORY suffix for ALL sub-agent prompts**:
```
[SYSTEM CONSTRAINT]
This agent operates within implement skill scope. Use orchestrator-provided rules only.
```
ENFORCEMENT: Sub-agent prompts missing the constraint suffix MUST be re-issued with the constraint appended.

## Step 1: Requirement Analysis

Spawn requirement-analyzer agent to determine scale and affected layers.

At the requirements stop, run the requirement-convergence hearing on fields below `ready`. Present the analyzer's observed scope facts, inferred implications, and cost evidence before questions.

**[STOP — BLOCKING]** Present the converged requirement record, scale, affectedLayers, and scope to the user for confirmation. **CANNOT proceed until user explicitly confirms.**

When user responds to questions:
- If an answer changes structural scope or cost evidence -> Re-execute requirement-analyzer with the original requirements and hearing answers; otherwise update the field directly
- Continue only when every applicable convergence field is `ready` or user-approved `weak-but-explicit`
- If response matches any `scopeDependencies.question` -> Check `impact` for scale change
- If scale changes -> Re-execute requirement-analyzer with updated context
- If `confidence: "confirmed"` or no scale change -> Proceed to Step 2

## Step 2: Layer-Based Workflow Routing

Based on requirement-analyzer output `affectedLayers`, route to the appropriate workflow:

| affectedLayers | Workflow | Reference |
|---|---|---|
| `["backend"]` only | Backend Flow | subagents-orchestration-guide skill (Large/Medium/Small scale) |
| `["frontend"]` only | Frontend Flow | See Frontend Flow below |
| `["backend", "frontend"]` | Fullstack Flow | subagents-orchestration-guide `references/monorepo-flow.md` |

---

### Backend Flow

Follow subagents-orchestration-guide skill Large/Medium/Small scale flow exactly. All steps, stopping points, and sub-agent sequencing are defined there.

---

### Frontend Flow

**STEP 1**: Ask user if they have prototype code or UI references to provide.

**STEP 2**: Spawn ui-spec-designer agent → spawn document-reviewer agent.
**[STOP — BLOCKING]** Present UI Spec for user approval. **CANNOT proceed until user explicitly confirms.**

**STEP 3**: Spawn technical-designer-frontend agent → spawn document-reviewer agent → spawn design-sync agent.
**[STOP — BLOCKING]** Present Frontend Design Doc for user approval. **CANNOT proceed until user explicitly confirms.**

**STEP 4**: Spawn acceptance-test-generator agent → spawn work-planner agent → spawn document-reviewer agent with `doc_type: WorkPlan`.
**[STOP — BLOCKING]** Present Work Plan for user approval. **CANNOT proceed until user explicitly confirms.**

**STEP 5**: Run implementation readiness preflight.
Execute the Implementation Readiness Preflight Procedure from `subagents-orchestration-guide` for the approved work plan exact path. This means loading the work plan, evaluating R1-R5, resolving approved prep gaps through exact prep task files when needed, persisting the Readiness Report, and setting `Implementation Readiness: ready` or `escalated`. Apply the Implementation Readiness Marker Contract before entering autonomous execution.

**STEP 6**: Enter guided autonomous execution (see Autonomous Execution Mode below) using task-executor-frontend + quality-fixer-frontend agents.

---

### Fullstack Flow

Follow subagents-orchestration-guide `references/monorepo-flow.md` for the complete cross-layer workflow, including:
- Separate Design Docs per layer
- design-sync for cross-layer consistency
- Vertical slicing in work-planner
- Layer-aware task execution routing

---

## Autonomous Execution Mode

After user grants "batch approval for entire implementation phase", enter autonomous execution.

### Implementation Readiness Gate

Before executing task files, read the associated work plan header and apply the Implementation Readiness Marker Contract from `subagents-orchestration-guide`.

### Task Execution Quality Cycle (4-Step Cycle per Task)

**Agent routing by task filename** (for fullstack projects):
```
*-backend-task-*   -> Spawn task-executor agent + quality-fixer agent
*-frontend-task-*  -> Spawn task-executor-frontend agent + quality-fixer-frontend agent
*-task-* (no layer prefix) -> Spawn task-executor agent + quality-fixer agent (default)
```

**Per-task cycle** (complete each task before starting next):
Before the first task, call `update_plan` once with first "Map active rules to this task", one step per task cycle, and final "Verify outputs and rule adherence". While work remains, keep exactly one step `in_progress`; after final verification evidence exists, mark every step `completed`.

1. Record the current revision as `diffBase`, then spawn task-executor (or task-executor-frontend): "Implement task [task-file-path]"
2. Check task-executor response:
   - `status: escalation_needed` or `blocked` -> Apply Orchestrator Escalation Resolution
   - `requiresTestReview` is `true` -> Spawn integration-test-reviewer with changed integration/E2E paths from `filesModified`, `diffBase`, and `taskFile`; when matching integration/E2E skeleton paths are available from acceptance-test-generator output or task/work-plan references, pass only those paths as `skeletonFiles`
     - `needs_revision` -> Apply Review Revision Convergence (`author`: layer-appropriate executor; `artifact`: changed test files); on `progression`, proceed to step 3
     - `approved` -> Proceed to step 3
     - `blocked` or unrecognized status -> Apply Orchestrator Escalation Resolution
   - Otherwise -> Proceed to step 3
3. Spawn quality-fixer (or quality-fixer-frontend) with `task_file` and executor `filesModified`.
4. Check quality-fixer response:
   - `status: "stub_detected"` -> Return to step 1 with `stubFindings`
   - `status: "blocked"` -> Apply Orchestrator Escalation Resolution
   - `status: "approved"` -> Proceed to step 5
5. git commit -> Execute on `status: "approved"`

### Post-Implementation Verification (After All Tasks Complete)

After all task cycles finish, collect all `filesModified` from every executor response (task-executor and task-executor-frontend, deduplicated). Resolve governing documents to Design Docs, or the Work Plan when no Design Doc governs the change:
1. Spawn code-verifier for every governing document with matching `doc_type`, `document_path`, and collected `code_paths`.
2. Spawn security-reviewer with typed `governingDocuments: [{type, path}]` and `implementationFiles`.
3. Consolidate results:
   - code-verifier passes when `summary.status` is `consistent` or `mostly_consistent`
   - code-verifier fails when `summary.status` is `needs_review` or `inconsistent`
   - code-verifier `blocked` or unrecognized status -> Apply Orchestrator Escalation Resolution
   - security-reviewer passes when `status` is `approved` or `approved_with_notes`
   - security-reviewer fails when `status` is `needs_revision`
   - security-reviewer `blocked` -> Apply Orchestrator Escalation Resolution
4. If either verifier fails:
   - Create one ephemeral fix task per executor route covering verifier discrepancies and security requiredFixes
   - Pass each exact path through the layer-appropriate executor and quality-fixer
   - Re-run both verification agents after any fix
   - Delete ephemeral task files only after both pass
   - If any verifier still fails after re-run, apply Orchestrator Escalation Resolution
5. If both verifiers pass -> Proceed to completion report

### Test Information Communication
After acceptance-test-generator execution, when spawning work-planner, communicate:
- Generated integration test file path
- Generated fixture-e2e test file path or `null`
- Generated service-integration-e2e test file path or `null`
- E2E absence reason per lane when no E2E file is generated
- Note: integration tests are created with implementation; fixture-e2e runs alongside UI implementation; service-integration-e2e runs after all implementations when a service E2E file exists

## Completion Criteria

- [ ] Requirement analysis completed and user-confirmed
- [ ] Layer routing determined (backend / frontend / fullstack)
- [ ] Correct workflow followed per layer routing
- [ ] codebase-analyzer included before Design Doc creation for Medium/Large flows
- [ ] code-verifier included before document-reviewer for Design Doc review
- [ ] All stopping points honored with user confirmation obtained
- [ ] Quality-fixer spawned before every commit
- [ ] All tasks committed or user input requested
- [ ] System constraint suffix appended to all sub-agent prompts
