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

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

**Execution Protocol**:
1. Invoke the named specialist for test generation, Work Plan creation, and semantic review. The orchestrator owns deterministic coordination and status changes.
2. **Follow subagents-orchestration-guide skill planning flow exactly**:
   - Execute steps defined below
   - Present plan content and apply Work Plan Authorization; obtain missing implementation authority without repeating permission already granted.
3. **Scope**: Complete when the reviewed plan's implementation authority is resolved

## Scope Boundaries

**Included in this skill**:
- Design document selection
- Test skeleton generation with acceptance-test-generator
- Work plan creation with work-planner
- Work plan review with document-reviewer
- Implementation authorization resolution

**Responsibility Boundary**: This skill completes with a reviewed plan and resolved implementation authority.

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

**Review reception:** Unnecessary repairs create lasting work. Before assigning a fix, use Review Resolution to judge no change, removal or narrowing, and reuse first; record why any retained or added mechanism is necessary.
Spawn document-reviewer agent: "Review the work plan. doc_type: WorkPlan. target: [work-planner completed path]. Verify Design Doc implementation coverage, absence of added operational scope, dependency order, executable verification, optional Verification Focus, and Review Scope."

Branch on `verdict.decision`:
- `pass` -> proceed to Step 5
- `needs_revision` -> apply Review Resolution with work-planner, then review the updated plan
- `rejected` -> apply Orchestrator Escalation Resolution using the cited governing sources

### Step 5: Plan Authorization
- Present the reviewed scope and apply Work Plan Authorization
- Handle user-requested changes through subagents-orchestration-guide Work Plan Authorization
- Summarize the implementation task set and any material choice the user is approving
- After explicit authorization, record the user's instruction and scope in Implementation Authorization

**Scope**: Reviewed work plan and implementation authorization.

## Completion Criteria

- [ ] Design document identified and selected
- [ ] Integration/E2E test skeleton selection completed and its artifact paths passed to work-planner
- [ ] Work plan created via work-planner
- [ ] Work plan reviewed via document-reviewer
- [ ] User authorization for the implementation scope is recorded
- [ ] Any required user decisions were resolved

## Response at Completion
```
Planning phase completed.
- Work plan: docs/plans/[plan-name].md
- Review: pass
- Implementation authorization: [user instruction and scope]

Continue implementation when already requested; otherwise this planning recipe is complete.
```
