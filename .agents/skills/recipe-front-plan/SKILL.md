---
name: recipe-front-plan
description: "Create frontend work plan from design document with test skeleton generation."
---

**Context**: Dedicated to the frontend planning phase.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` -- document quality standards
2. [LOAD IF NOT ACTIVE] `implementation-approach` -- implementation methodology
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and workflow flows

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Method**:
- Test skeleton generation -> performed by acceptance-test-generator
- Work plan creation -> performed by work-planner
- Work plan review -> performed by document-reviewer

Orchestrator spawns agents and passes structured data between them.

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

### Step 3: Work Plan Creation
Spawn work-planner agent: "Create work plan from Design Doc at [path]. Integration test file: [path from step 2]. fixture-e2e test file: [path from step 2 or null]. service-integration-e2e test file: [path from step 2 or null]. E2E absence reasons by lane: [values from step 2 when an E2E lane is null]. Integration tests are created with each phase implementation, fixture-e2e runs alongside UI implementation, service-integration-e2e runs only in the final phase when a service E2E file exists. Include `Implementation Readiness: pending` in the work plan header."

### Step 4: Work Plan Review
Spawn document-reviewer agent: "Review the frontend work plan. doc_type: WorkPlan. target: docs/plans/[plan-name].md. mode: composite. Review semantic traceability to the Design Doc and UI Spec, early verification placement, real-boundary verification coverage, Proof Strategy, Failure Mode Checklist, Review Scope, and Quality Assurance coverage."

Branch on `verdict.decision`:
- `approved` -> spawn work-planner in update mode once to record `Status: approved` and `Conditions: none` in WorkPlan Review, then proceed to Step 5
- `approved_with_conditions` or `needs_revision` -> spawn work-planner in update mode with the findings or conditions, then repeat Step 4. Use max 2 revision iterations as defined by the `needs_revision` row in subagents-orchestration-guide Approval Status Vocabulary.
- `rejected` -> stop and present the blocking findings to the user.

### Step 5: Plan Approval
**[STOP -- BLOCKING]** Interact with user to complete plan and obtain approval for plan content. Clarify specific implementation steps and risks.
**CANNOT proceed until user explicitly approves the work plan.**

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
