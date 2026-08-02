---
name: recipe-front-plan
description: "Create frontend work plan from design document with test skeleton generation."
---

**Context**: Dedicated to the frontend planning phase.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` -- Work Plan scope and template
2. [LOAD IF NOT ACTIVE] `implementation-approach` -- implementation ordering and verification strategy
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and workflow flow
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` -- planning handoffs and artifact contract

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

## Orchestrator Definition

**Core Identity**: Coordinate the frontend planning workflow and complete lightweight routing, file selection, approval recording, and status updates directly.

**Execution Plan Gate**: Use the active execution plan when one exists. When none exists, call `update_plan` once with Steps 1-5 before document selection and update that plan through completion.

**Execution Method**:
- Test skeleton generation -> performed by acceptance-test-generator
- Work plan creation -> performed by work-planner
- Work plan review -> performed by document-reviewer

The orchestrator invokes these specialists and directly handles deterministic coordination and status changes.

## Scope Boundaries

**Included in this skill**:
- Design document selection
- Test skeleton generation with acceptance-test-generator
- Work plan creation with work-planner
- Work plan review with document-reviewer
- Plan approval obtainment

**Responsibility Boundary**: This skill completes with work plan approval.

Create frontend work plan with the following process:

## Execution Process

### Step 1: Design Document Selection
Check for existence of design documents in docs/design/.
- Present options if multiple exist (can be specified with $ARGUMENTS)

**[STOP -- BLOCKING]** If no design documents exist, notify user and halt.
**CANNOT proceed without a design document.**

### Step 2: Test Skeleton Generation
Spawn acceptance-test-generator agent: "Generate test skeletons from Design Doc at [path]. [UI Spec at [ui-spec path] if exists.]"
Verify generated artifact paths and pass them to Step 3; an empty selection is valid.

### Step 3: Work Plan Creation
Spawn work-planner agent: "Create an implementation-focused work plan from Design Doc at [path]. Include generated test skeleton artifact paths from Step 2 when present. Plan only repository implementation outcomes required by the Design Doc and UI Spec."
Verify the returned Work Plan path and use it as the Step 4 review target.

### Step 4: Work Plan Review
Spawn document-reviewer agent: "Review the frontend work plan. doc_type: WorkPlan. target: [work-planner completed path]. mode: composite. Verify Design Doc and UI Spec implementation coverage, absence of added operational scope, dependency order, executable verification, optional Verification Focus, and Review Scope."

Branch on `verdict.decision`:
- `approved` -> proceed to Step 5 with the plan-level status pending
- `approved_with_conditions` or `needs_revision` -> apply Review Resolution with work-planner, then review the updated plan
- `rejected` -> apply Orchestrator Escalation Resolution using the cited governing sources

### Step 5: Plan Approval
**[STOP -- BLOCKING]** Present the implementation task set and any material choice, then obtain approval for the plan content.
**CANNOT proceed until user explicitly approves the work plan.**

After explicit approval, record the plan-level status as approved.

ENFORCEMENT: Plan content MUST be approved before declaring completion. Unapproved plans are invalid.

## Completion Criteria

- [ ] Design document selected
- [ ] Test skeletons generated
- [ ] Work plan created
- [ ] Work plan reviewed via document-reviewer
- [ ] User approved plan content

## Output Example
Frontend planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
