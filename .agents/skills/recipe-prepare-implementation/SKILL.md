---
name: recipe-prepare-implementation
description: "Verify that an approved work plan is implementable before build execution, resolving readiness gaps through Phase 0 prep tasks when needed."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `coding-rules` -- coding standards
2. [LOAD IF NOT ACTIVE] `testing` -- test strategy and quality gates
3. [LOAD IF NOT ACTIVE] `ai-development-guide` -- AI development patterns
4. [LOAD IF NOT ACTIVE] `documentation-criteria` -- document templates
5. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

## Purpose

Run this recipe after work-plan approval and before any build or implementation execution. It verifies that the plan can be executed from Phase 1 onward without missing verification references, test prerequisites, UI render surfaces, or local execution instructions.

The recipe is safe to invoke unconditionally. If all readiness criteria pass, it only updates the work plan readiness marker and report.

Work plan: $ARGUMENTS

## Readiness Marker Contract

Use the Implementation Readiness Marker Contract defined in `subagents-orchestration-guide`. If the line is absent, treat the work plan as `pending` and insert it after `Related Issue/PR:` when persisting the report.

## Readiness Criteria

Each criterion produces `pass`, `fail`, or `not_applicable`, with file:line evidence where possible.

| ID | Criterion | Pass Evidence |
|----|-----------|---------------|
| R1 | Verification Strategy and binding references resolve | Every command, file path, function, endpoint, fixture, seed, and test reference in the work plan's Verification Strategies either exists now or is the deliverable of a task in the plan; every Reference Contract Values `covered` row references existing task IDs; every Reference Contract Values `gap` row has Notes with user-confirmation handling; every ADR Bindings source path resolves; every ADR Bindings `covered` row references existing task IDs |
| R2 | E2E prerequisites are addressed | For each fixture-e2e or service-integration-e2e skeleton, every noted precondition is present in the codebase or covered by a Phase 0 task |
| R3 | Phase 1 observability exists | The first implementation phase includes at least one operation verification method executable at task completion using existing files, prior Phase 0 deliverables, or the task's own output |
| R4 | UI rendering surface exists | When the plan implements UI components, a fixture entry, dev route, Storybook story, preview harness, or equivalent render surface exists or is covered by a Phase 0 task |
| R5 | Local lane procedure exists | The work plan or referenced docs record commands needed to run the relevant local service stack or browser harness, including startup commands, ports, seed steps, and required environment variables |

R4 applies only to UI work. R5 applies when the plan uses a local service stack or browser harness.

## Execution Flow

### Step 1: Load Inputs

Read the work plan passed in `$ARGUMENTS`; if absent, select the most recent non-template `docs/plans/*.md`. Extract:
- Verification Strategies
- Quality Assurance Mechanisms
- Design-to-Plan Traceability
- Reference Contract Values
- ADR Bindings
- UI Spec Component -> Task Mapping
- Connection Map
- test skeleton references and E2E absence reasons
- phase structure and task IDs
- referenced Design Docs, ADRs, and UI Specs

If no work plan exists, stop and report the missing prerequisite.

### Step 2: Readiness Scan

Evaluate R1-R5 using repository search and the work plan content. Build a `## Implementation Readiness Report` regardless of outcome.

For each `fail`, identify the smallest concrete prep task that closes the gap. Examples:
- Add fixture data for a UI state
- Add an API mock handler for fixture-e2e
- Add a seed script for service-integration-e2e
- Add a Storybook story, dev route, or equivalent render surface
- Document local startup commands and required environment variables
- Add a missing verification helper or script referenced by the plan

### Step 3: No-Op Success

When all applicable criteria are `pass`:
1. Persist `## Implementation Readiness Report` in the work plan immediately after the header block.
2. Set `Implementation Readiness: ready`.
3. Do not create task files.
4. Report `outcome: ready`.

### Step 4: Create Resolution Tasks

When one or more criteria fail:
1. Present the proposed prep tasks to the user and continue only after explicit approval.
   - If the user declines prep execution, persist `Implementation Readiness: escalated` with the current Readiness Report and stop before creating prep task files.
2. Create task files in `docs/plans/tasks/` using the task template:
   - Backend prep: `{plan-name}-backend-task-prep-{NN}.md`
   - Frontend prep: `{plan-name}-frontend-task-prep-{NN}.md`
   - Single-layer prep: `{plan-name}-task-prep-{NN}.md`
3. Insert the tasks into the work plan's existing Phase 0 when one exists. If no Phase 0 exists, create `Phase 0: Implementation Readiness Prep` before Phase 1. Keep existing Phase 0 task IDs stable; assign prep task IDs after existing Phase 0 tasks or use a clearly labeled `P0-PREP-N` identifier when the plan's numbering would otherwise require renumbering.
4. Each prep task must include Investigation Targets, concrete implementation steps, and Operation Verification Methods.

Layer selection:
- Use frontend prep when every target is UI, browser harness, component, page, or frontend fixture work.
- Use backend prep when every target is API, server, service, repository, database, seed, or backend fixture work.
- Use single-layer prep for non-layered repositories.
- Escalate if the gap crosses layers and cannot be split into separate prep tasks.

### Step 5: Execute Prep Tasks

Run each prep task through the standard 4-step cycle:
1. Spawn the layer-appropriate task executor with the exact prep task path in the prompt: "Execute implementation-readiness prep task. Task file: [exact prep task path]."
2. Check for `blocked` or `escalation_needed`.
3. Spawn the layer-appropriate quality fixer with the task file as `task_file`.
4. Commit only when the quality fixer returns `approved`.

Append this scope boundary to every subagent prompt:

```
[SYSTEM CONSTRAINT]
This agent operates within implementation-readiness prep scope. Use the task file as the primary instruction source. Do not implement feature behavior beyond the readiness gap described by the task.
```

### Step 6: Re-Scan and Persist

After prep tasks are complete:
1. Re-run the readiness scan.
2. Persist or replace `## Implementation Readiness Report` in the work plan.
3. Set the header to `Implementation Readiness: ready` when all applicable criteria pass, otherwise `Implementation Readiness: escalated`.
4. Collapse completed prep tasks out of active plan execution: remove the Phase 0 readiness prep task entries from the work plan and record their committed evidence under `Resolution Tasks Executed` in the Readiness Report. If Phase 0 becomes empty and was created only by this recipe, remove that Phase 0 section. Preserve any pre-existing Phase 0 content.
5. Delete only these files for the current `{plan-name}`:
   - `docs/plans/tasks/{plan-name}-task-prep-*.md`
   - `docs/plans/tasks/{plan-name}-backend-task-prep-*.md`
   - `docs/plans/tasks/{plan-name}-frontend-task-prep-*.md`
   - `docs/plans/tasks/{plan-name}-phase0-completion.md`
6. Report remaining gaps if any.

## Readiness Report Format

```markdown
## Implementation Readiness Report

Work plan: [path]
Outcome: ready | escalated
Gaps resolved: [N]
phase0_created_by_recipe: true | false

### Readiness Criteria

| ID | Result | Evidence |
|----|--------|----------|
| R1 | pass / fail / not_applicable | [file:line or missing reference] |
| R2 | ... | ... |
| R3 | ... | ... |
| R4 | ... | ... |
| R5 | ... | ... |

### Resolution Tasks Executed
- [task file path] - [one-line summary] - committed

### Remaining Gaps
- [criterion ID]: [unresolved reference] - Next action: [recommendation]
```

## Completion Criteria

- [ ] Work plan loaded and relevant sections extracted
- [ ] Readiness scan completed with evidence per criterion
- [ ] No-op success handled when all criteria pass
- [ ] Failing criteria converted to approved prep tasks when needed
- [ ] Prep tasks executed through executor -> quality-fixer -> commit
- [ ] Re-scan completed after prep tasks
- [ ] Work plan readiness marker updated to `ready` or `escalated`
- [ ] Readiness Report persisted in the work plan
- [ ] Completed prep task references collapsed into the Readiness Report
- [ ] Prep task files created by this recipe removed from `docs/plans/tasks/`
