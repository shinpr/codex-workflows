---
name: recipe-front-build
description: "Execute an approved frontend Work Plan autonomously through frontend implementation, quality fixes, commits, and final verification."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. `coding-rules`
2. `testing`
3. `ai-development-guide`
4. `subagents-orchestration-guide`
5. `llm-friendly-context`

Every `spawn_agent` call uses `fork_turns="none"` and supplies exact artifact paths.

## Orchestrator Role

The orchestrator owns plan selection, approval dialogue, task-set computation, routing, commits, and completion reporting. Invoke specialist agents for task decomposition, frontend implementation, test review, quality repair, and final verification. A user-requested plan revision follows Work Plan Approval.

Work plan: $ARGUMENTS

## 1. Resolve the Work Plan

Apply subagents-orchestration-guide `Work Plan Resolution` with `docs/plans/tasks/{plan-name}-frontend-task-*.md` as the managed task pattern, excluding basenames that start with `integration-tests-`. Report a missing plan as the exact prerequisite.

## 2. Approval Gate

Apply subagents-orchestration-guide `Work Plan Approval`. When plan-level user approval is absent or ambiguous, ask before agent invocation or task analysis:

> Approve this Work Plan as the implementation scope and authorize task decomposition, frontend implementation, quality fixes, and per-task commits? `[path]`

Record approval in the plan's existing plan-level status field and proceed to Step 3. A requested change returns through work-planner and document review before this gate.

## 3. Conditional Environment Preparation

Proceed directly to task generation. Run `recipe-prepare-implementation` only when the user explicitly requests repository-local setup. If task-local execution later identifies a concrete missing repository capability, resolve it through Orchestrator Escalation Resolution and run the preparation side path when that is the smallest authorized resolution.

## 4. Task Set and Execution Plan

The managed set is exactly `docs/plans/tasks/{plan-name}-frontend-task-*.md` implementation task files whose basename does not start with `integration-tests-`. The pending set contains managed files with at least one unchecked task checkbox. When the managed set is empty, invoke task-decomposer with the exact approved Work Plan path, verify the generated task files, and recompute both sets. Batch approval authorizes decomposition. When the managed set exists and the pending set is empty, proceed to final verification.

Order pending tasks by dependencies. Use the active execution plan when one exists; otherwise create one after the task set is known and update it through final verification.

## 5. Autonomous Task Cycle

Execute each pending task through the `subagents-orchestration-guide` autonomous task cycle using task-executor-frontend and quality-fixer-frontend. Pass the exact task file and preserve the canonical Per-Task Change Set. After quality approval and a successful implementation commit, update the Task File, corresponding Work Plan task and phase, and execution plan locally; keep Task Files and the Work Plan outside the implementation commit.

## 6. Requirement Changes

Apply subagents-orchestration-guide `Requirement Change Detection During Flow` and preserve unaffected completed work.

## 7. Final Verification

Apply `subagents-orchestration-guide` Post-Implementation Verification to the actual files changed by completed tasks and their governing documents. Route required fixes through the frontend task cycle.

Apply a security-reviewer finding only when leaving it unresolved would violate an explicit governing requirement or repository rule, or leave a concrete material security failure in the actual reachable trust model. The violated requirement, rule, or failure defines implementation scope: route the smallest correction that resolves it, treating the reviewer's suggestion as one candidate implementation.

## 8. Cleanup and Report

Remove consumed task files after final verification and preserve the Work Plan. Report completed tasks, commits, verification results, and any verification limitation that could not be exercised in the available environment.
