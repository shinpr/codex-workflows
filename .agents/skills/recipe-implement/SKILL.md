---
name: recipe-implement
description: "Orchestrate the complete implementation lifecycle from requirements through verified repository implementation."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows
2. [LOAD IF NOT ACTIVE] `documentation-criteria` — scale-selected document path
3. [LOAD IF NOT ACTIVE] `requirement-convergence` — outcome, exclusion, and rough-cost convergence before design
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — cross-agent handoffs and task carrier

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

# Full-Cycle Implementation

$ARGUMENTS

## Orchestrator Definition

**Core Identity**: Coordinate the lifecycle, complete lightweight workflow operations directly, and invoke named specialists for their domain work.

Follow the scale-selected flow and its user approval points from subagents-orchestration-guide.

## Step 1: Requirement Analysis

Spawn requirement-analyzer agent to determine scale and affected layers.

At the existing requirements stop, apply subagents-orchestration-guide `Requirement Convergence` and resolve any `scopeDependencies` through requirement-analyzer before routing.

**[STOP — BLOCKING]** Present the converged requirement record, scale, affectedLayers, and scope to the user for confirmation. **CANNOT proceed until user explicitly confirms.**

## Step 2: Canonical Workflow Routing

Apply the subagents-orchestration-guide `Basic Flow for Work Planning` using `scale` as the primary route. Use `affectedLayers` only to select the layer-specific additions and agents within that route:

| affectedLayers | Layer-specific routing |
|---|---|
| `["backend"]` only | Backend agents |
| `["frontend"]` only | UI Spec when required by the canonical flow, then frontend designer, executor, and quality fixer |
| `["backend", "frontend"]` | Fullstack monorepo flow with layer-specific analysis, design, and task routing |

The scale-selected Large, Medium, or Small flow remains authoritative for document creation, codebase analysis, design verification, planning, and execution.

## Autonomous Execution Mode

Enter autonomous execution when the subagents-orchestration-guide `Authority Grant` is satisfied.

### Per-Task Execution Cycle

For a fullstack task set, apply the Fullstack Flow filename routing exposed by `subagents-orchestration-guide`. For a single-layer task set, use the executor and quality fixer selected by `affectedLayers`. Execute each task through the canonical autonomous task cycle.

### Post-Implementation Verification (After All Tasks Complete)

Apply subagents-orchestration-guide `Post-Implementation Verification Pass/Fail Criteria` to the actual repository changes and governing documents. Use the active Small task file as the security source when no durable document exists. Resolve required fixes through the normal task cycle and `Post-Verification Rerun Rule`.

### Test Information Communication
Verify acceptance-test-generator artifact paths and pass them to work-planner.

## Completion Criteria

- [ ] Requirement analysis completed and user-confirmed
- [ ] Layer routing determined (backend / frontend / fullstack)
- [ ] Correct workflow followed per layer routing
- [ ] codebase-analyzer included before Design Doc creation for Medium/Large flows
- [ ] code-verifier included before document-reviewer for Design Doc review
- [ ] All stopping points honored with user confirmation obtained
- [ ] Quality-fixer spawned before every commit
- [ ] All tasks committed or user input requested
