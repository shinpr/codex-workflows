---
name: recipe-plan
description: "Create work plan from design document with optional test skeleton generation."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `implementation-approach` — implementation strategy
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows

**Context**: Dedicated to the planning phase.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Spawn agents for all work** -- your role is to invoke sub-agents, pass data between them, and report results
2. **Follow subagents-orchestration-guide skill planning flow exactly**:
   - Execute steps defined below
   - **[STOP — BLOCKING]** Present plan content to user for approval. **CANNOT proceed until user explicitly confirms.**
3. **Scope**: Complete when work plan receives approval

**CRITICAL**: When the user requests test generation, MUST spawn acceptance-test-generator agent first -- it provides the test skeleton that work-planner depends on.
ENFORCEMENT: Work-planner spawned without test skeleton data (when tests were requested) produces incomplete plans.

## Scope Boundaries

**Included in this skill**:
- Design document selection
- Test skeleton generation with acceptance-test-generator
- Work plan creation with work-planner
- Plan approval obtainment

**Responsibility Boundary**: This skill completes with work plan approval.

Follow the planning process below:

## Execution Process

### Step 1: Design Document Selection
Check for existence of design documents in docs/design/, notify user if none exist.
Present options if multiple exist (can be specified with $ARGUMENTS).

### Step 2: E2E Test Skeleton Generation Confirmation
- Confirm with user whether to generate E2E test skeleton first
- If user wants generation: Spawn acceptance-test-generator agent: "Generate test skeletons from Design Doc at [design-doc-path]"
- Pass generation results to next process according to subagents-orchestration-guide skill coordination specification
- If no E2E file is generated, carry the explicit `e2eAbsenceReason` forward as a valid planning input

### Step 3: Work Plan Creation
- Spawn work-planner agent: "Create work plan from design document at [design-doc-path]. Include deliverables from previous process according to subagents-orchestration-guide skill coordination specification. If `generatedFiles.e2e` is null, use `e2eAbsenceReason` and accept the null E2E file as a valid planning input."
- Interact with user to complete plan and obtain approval for plan content
- Clarify specific implementation steps and risks

**Scope**: Up to work plan creation and obtaining approval for plan content.

## Completion Criteria

- [ ] Design document identified and selected
- [ ] E2E test skeleton generation confirmed with user (generated if requested)
- [ ] Work plan created via work-planner
- [ ] Plan content approved by user
- [ ] All stopping points honored with user confirmation

## Response at Completion
```
Planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Status: Approved

Please provide separate instructions for implementation.
```
