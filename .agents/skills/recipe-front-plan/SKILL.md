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

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

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
- Implementation authorization resolution

**Responsibility Boundary**: This skill completes with a reviewed plan and resolved implementation authority.

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

**Review reception:** Unnecessary repairs create lasting work. Before assigning a fix, use Review Resolution to judge no change, removal or narrowing, and reuse first; record why any retained or added mechanism is necessary.
Spawn document-reviewer agent: "Review the frontend work plan. doc_type: WorkPlan. target: [work-planner completed path]. Verify Design Doc and UI Spec implementation coverage, absence of added operational scope, dependency order, executable verification, optional Verification Focus, and Review Scope."

Branch on `verdict.decision`:
- `pass` -> proceed to Step 5
- `needs_revision` -> apply Review Resolution with work-planner, then review the updated plan
- `rejected` -> apply Orchestrator Escalation Resolution using the cited governing sources

### Step 5: Plan Authorization
Present the implementation task set and any material user-owned choice. Apply Work Plan Authorization: obtain implementation authority when absent; retain authority already granted for outcome-preserving technical revisions.

After explicit authorization, record the user's instruction and scope in Implementation Authorization.

## Completion Criteria

- [ ] Design document selected
- [ ] Test skeletons generated
- [ ] Work plan created
- [ ] Work plan reviewed via document-reviewer
- [ ] User authorization for the implementation scope is recorded

## Output Example
Frontend planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Review: pass
- Implementation authorization: [user instruction and scope]

Continue implementation when already requested; otherwise this planning recipe is complete.
