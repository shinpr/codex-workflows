---
name: recipe-plan
description: "Create work plan from design document with optional test skeleton generation."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `implementation-approach` — implementation strategy
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — clear prompts, handoffs, and generated artifacts

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

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
- Work plan review with document-reviewer
- Plan approval obtainment

**Responsibility Boundary**: This skill completes with work plan approval.

Follow the planning process below:

## Execution Process

### Step 1: Design Document Selection
Check for existence of design documents in docs/design/, notify user if none exist.
Present options if multiple exist (can be specified with $ARGUMENTS).

### Step 2: Integration/E2E Test Skeleton Generation Confirmation
- Confirm with user whether to generate integration and E2E test skeletons first
- If user wants generation: Spawn acceptance-test-generator agent: "Generate test skeletons from Design Doc at [design-doc-path]"
- Pass generation results to next process according to subagents-orchestration-guide skill coordination specification
- If no E2E file is generated for a lane, carry the explicit lane-specific `e2eAbsenceReason` forward as a valid planning input

### Step 3: Work Plan Creation
- Spawn work-planner agent: "Create work plan from design document at [design-doc-path]. Include deliverables from previous process according to subagents-orchestration-guide skill coordination specification. If `generatedFiles.fixtureE2e` or `generatedFiles.serviceE2e` is null, use the corresponding `e2eAbsenceReason` and accept the null E2E lane as a valid planning input. Include `Implementation Readiness: pending` in the work plan header."

### Step 4: Work Plan Review
Spawn document-reviewer agent: "Review the work plan. doc_type: WorkPlan. target: docs/plans/[plan-name].md. mode: composite. Review semantic traceability to the Design Doc, Reference Contract Values fidelity, early verification placement, real-boundary verification coverage, Proof Strategy, Failure Mode Checklist, Review Scope, and Quality Assurance coverage."

Branch on `verdict.decision`:
- `approved` -> spawn work-planner in update mode once to record `Status: approved` and `Conditions: none` in WorkPlan Review, then proceed to Step 5
- `approved_with_conditions` or `needs_revision` -> spawn work-planner in update mode with the findings or conditions, then repeat Step 4. Use max 2 revision iterations as defined by the `needs_revision` row in subagents-orchestration-guide Approval Status Vocabulary.
- `rejected` -> stop and present the blocking findings to the user.

### Step 5: Plan Approval
- Present the reviewed work plan to the user for batch approval
- If the user requests changes, spawn work-planner in update mode and re-run Step 4
- Clarify specific implementation steps and risks

**Scope**: Up to work plan creation and obtaining approval for plan content.

## Completion Criteria

- [ ] Design document identified and selected
- [ ] Integration/E2E test skeleton generation confirmed with user (generated if requested)
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
