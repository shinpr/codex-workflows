---
name: recipe-fullstack-implement
description: "Run the full-cycle implementation workflow for one outcome spanning backend and frontend layers."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — canonical Fullstack Flow, approvals, and autonomous execution
2. [LOAD IF NOT ACTIVE] `documentation-criteria` — scale-selected document path
3. [LOAD IF NOT ACTIVE] `requirement-convergence` — outcome, exclusions, and rough-cost challenge
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — cross-agent handoffs and Small task carrier

Every `spawn_agent` call uses `fork_turns="none"` and supplies only the exact artifacts needed by that specialist.

Requirements or continuation instruction: $ARGUMENTS

## Entry

- New or scope-changing requirements: invoke requirement-analyzer for compact scope/cost evidence; the orchestrator completes Requirement Convergence, determines scale and layer routing, and obtains requirement confirmation.
- Existing PRD, UI Spec, Design Docs, Work Plan, or tasks: resume at the next incomplete Fullstack Flow phase. Restart requirement analysis when the approved outcome, requirement, or exclusion changes.
- Quality failure during an existing implementation: resume its task cycle and Orchestrator Escalation Resolution.

Resolve the entry from supplied artifacts and repository state. Ask only when different interpretations require a user-owned product or approved-design decision.

## Flow

Apply the Fullstack Flow exposed by `subagents-orchestration-guide` with backend, frontend, and shared routing. The orchestrator directly owns artifact/path resolution, execution-plan updates, approval recording, task-set computation, commits, and lightweight checks; invoke the named specialists for analysis, authoring, implementation, review, and quality judgment.

Reuse the active execution plan or register the material remaining phases once. Follow the Fullstack Flow's document approvals. After implementation-scope approval, execute tasks autonomously through its filename routing, Per-Task Change Set, quality gate, commit, and Post-Implementation Verification.

External evidence, prototypes, and repository environment preparation remain conditional under the canonical flow. A missing optional input does not create a stop.

## Completion Check

- The existing workflow state was resumed rather than duplicated.
- Backend, frontend, and shared work used the canonical Fullstack Flow routing.
- Required document approvals and quality-before-commit gates were preserved.
- After implementation approval, work stopped only for a genuine user-owned escalation condition.
- Final code/security verification and completion reporting finished.
