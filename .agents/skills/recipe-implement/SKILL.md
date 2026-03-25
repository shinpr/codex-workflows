---
name: recipe-implement
description: "Orchestrate the complete implementation lifecycle from requirements to deployment."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows
2. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates

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

**[STOP — BLOCKING]** Present requirement-analyzer output (scale, affectedLayers, scope) to user for confirmation. **CANNOT proceed until user explicitly confirms.**

When user responds to questions:
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

**STEP 4**: Spawn acceptance-test-generator agent → spawn work-planner agent.
**[STOP — BLOCKING]** Present Work Plan for user approval. **CANNOT proceed until user explicitly confirms.**

**STEP 5**: Enter guided autonomous execution (see Autonomous Execution Mode below) using task-executor-frontend + quality-fixer-frontend agents.

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

### Task Execution Quality Cycle (4-Step Cycle per Task)

**Agent routing by task filename** (for fullstack projects):
```
*-backend-task-*   -> Spawn task-executor agent + quality-fixer agent
*-frontend-task-*  -> Spawn task-executor-frontend agent + quality-fixer-frontend agent
*-task-* (no layer prefix) -> Spawn task-executor agent + quality-fixer agent (default)
```

**Per-task cycle** (complete each task before starting next):
1. Spawn task-executor (or task-executor-frontend) agent: "Implement task [task-file-path]"
2. Check task-executor response:
   - `status: escalation_needed` or `blocked` -> Escalate to user
   - `requiresTestReview` is `true` -> Spawn integration-test-reviewer agent
     - `needs_revision` -> Return to step 1 with `requiredFixes`
     - `approved` -> Proceed to step 3
   - Otherwise -> Proceed to step 3
3. Spawn quality-fixer (or quality-fixer-frontend) agent: "Quality check and fixes"
4. git commit -> Execute on `status: "approved"`

### Security Review (After All Tasks Complete)

After all task cycles finish, collect all `filesModified` from every executor response (task-executor and task-executor-frontend, deduplicated), then invoke security-reviewer before the completion report:
1. Spawn security-reviewer agent: "Design Doc: [path]. Implementation files: [collected filesModified list]. Review security compliance."
2. Check response:
   - `approved` or `approved_with_notes` -> Proceed to completion report (include notes if present)
   - `needs_revision` -> Spawn layer-appropriate executor (task-executor or task-executor-frontend per task filename routing) with `requiredFixes`, then layer-appropriate quality-fixer, then re-invoke security-reviewer
   - `blocked` -> Escalate to user

### Test Information Communication
After acceptance-test-generator execution, when spawning work-planner, communicate:
- Generated integration test file path
- Generated E2E test file path
- Note: integration tests are created with implementation; E2E tests run after all implementations

## Completion Criteria

- [ ] Requirement analysis completed and user-confirmed
- [ ] Layer routing determined (backend / frontend / fullstack)
- [ ] Correct workflow followed per layer routing
- [ ] All stopping points honored with user confirmation obtained
- [ ] Quality-fixer spawned before every commit
- [ ] All tasks committed or escalation completed
- [ ] System constraint suffix appended to all sub-agent prompts
