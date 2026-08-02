---
name: recipe-plan
description: "Creates a reviewed Work Plan with value-filtered integration/E2E test skeletons. Use when planning implementation from a Design Doc."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — Work Plan scope and template
2. [LOAD IF NOT ACTIVE] `implementation-approach` — implementation ordering and verification strategy
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flow
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — planning handoffs and artifact contract

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

**Context**: Dedicated to the planning phase.

## Orchestrator Definition

**Core Identity**: Coordinate the planning workflow and complete lightweight routing, file selection, approval recording, and status updates directly.

**Execution Plan Gate**: Use the active execution plan when one exists. When none exists, call `update_plan` once with the planning steps before document selection and update that plan through completion.

**Execution Protocol**:
1. Invoke the named specialist for test generation, Work Plan creation, and semantic review. The orchestrator owns deterministic coordination and status changes.
2. **Follow subagents-orchestration-guide skill planning flow exactly**:
   - Execute steps defined below
   - **[STOP — BLOCKING]** Present plan content to user for approval. **CANNOT proceed until user explicitly confirms.**
3. **Scope**: Complete when work plan receives approval

## Scope Boundaries

**Included in this skill**:
- Design document selection
- Test skeleton generation with acceptance-test-generator
- Work plan creation with work-planner
- Work plan review with document-reviewer
- Plan approval obtainment

**Responsibility Boundary**: This skill completes with work plan approval.

Follow the planning process below:

## Execution Process

### Step 1: Design Document Selection
Check for existence of design documents in docs/design/, notify user if none exist.
Present options if multiple exist (can be specified with $ARGUMENTS).

### Step 2: Integration/E2E Test Skeleton Selection
- Spawn acceptance-test-generator agent: "Generate the value-selected integration/E2E test skeletons from Design Doc at [design-doc-path]."
- Verify generated artifact paths and pass them to Step 3; an empty selection is valid

### Step 3: Work Plan Creation
- Spawn work-planner agent: "Create an implementation-focused work plan from design document at [design-doc-path]. Include generated test skeleton artifact paths from the previous step when present. Plan only repository implementation outcomes required by the Design Doc."
- Verify the returned Work Plan path and use it as the Step 4 review target

### Step 4: Work Plan Review
Spawn document-reviewer agent: "Review the work plan. doc_type: WorkPlan. target: [work-planner completed path]. mode: composite. Verify Design Doc implementation coverage, absence of added operational scope, dependency order, executable verification, optional Verification Focus, and Review Scope."

Branch on `verdict.decision`:
- `approved` -> proceed to Step 5 with the plan-level status pending
- `approved_with_conditions` or `needs_revision` -> apply Review Resolution with work-planner, then review the updated plan
- `rejected` -> apply Orchestrator Escalation Resolution using the cited governing sources

### Step 5: Plan Approval
- Present the reviewed work plan to the user for batch approval
- Handle user-requested changes through subagents-orchestration-guide Work Plan Approval
- Summarize the implementation task set and any material choice the user is approving
- After explicit approval, record the plan-level status as approved

**Scope**: Up to work plan creation and obtaining approval for plan content.

## Completion Criteria

- [ ] Design document identified and selected
- [ ] Integration/E2E test skeleton selection completed and its artifact paths passed to work-planner
- [ ] Work plan created via work-planner
- [ ] Work plan reviewed via document-reviewer
- [ ] Plan content approved by user
- [ ] All stopping points honored with user confirmation

## Response at Completion
```
Planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```
