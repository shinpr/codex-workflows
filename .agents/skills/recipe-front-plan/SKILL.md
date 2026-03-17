---
name: recipe-front-plan
description: "Create frontend work plan from design document with test skeleton generation."
---

**Context**: Dedicated to the frontend planning phase.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` -- document quality standards
2. [LOAD IF NOT ACTIVE] `implementation-approach` -- implementation methodology
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and workflow flows

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Method**:
- Test skeleton generation -> performed by acceptance-test-generator
- Work plan creation -> performed by work-planner

Orchestrator spawns agents and passes structured data between them.

## Scope Boundaries

**Included in this skill**:
- Design document selection
- Test skeleton generation with acceptance-test-generator
- Work plan creation with work-planner
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
Spawn work-planner agent: "Create work plan from Design Doc at [path]. Integration test file: [path from step 2]. E2E test file: [path from step 2]. Integration tests are created simultaneously with each phase implementation, E2E tests are executed only in final phase."

**[STOP -- BLOCKING]** Interact with user to complete plan and obtain approval for plan content. Clarify specific implementation steps and risks.
**CANNOT proceed until user explicitly approves the work plan.**

ENFORCEMENT: Plan content MUST be approved before declaring completion. Unapproved plans are invalid.

## Completion Criteria

- [ ] Design document selected
- [ ] Test skeletons generated
- [ ] Work plan created
- [ ] User approved plan content

## Output Example
Frontend planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
