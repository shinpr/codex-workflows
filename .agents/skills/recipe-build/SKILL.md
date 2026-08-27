---
name: recipe-build
description: "Execute an approved backend Work Plan autonomously through task execution, quality fixes, commits, and final verification."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. `coding-rules`
2. `testing`
3. `ai-development-guide`
4. `subagents-orchestration-guide`
5. `llm-friendly-context`

Every `spawn_agent` call uses `fork_turns="none"` and supplies the exact artifact paths needed by that specialist.

## Orchestrator Role

The orchestrator owns plan selection, approval dialogue, task-set computation, routing, commits, and completion reporting. Invoke specialist agents for task decomposition, implementation, test review, quality repair, and final verification. A user-requested plan revision follows Work Plan Approval.

Work plan: $ARGUMENTS

## 1. Resolve the Work Plan

Apply subagents-orchestration-guide `Work Plan Resolution` with `docs/plans/tasks/{plan-name}-task-*.md` as the managed task pattern, excluding basenames that start with `integration-tests-`.

Report a missing Work Plan as the exact missing prerequisite.

## 2. Approval Gate

Apply subagents-orchestration-guide `Work Plan Approval`. When plan-level user approval is absent or ambiguous, ask before agent invocation or task analysis:

> Approve this Work Plan as the implementation scope and authorize task decomposition, implementation, quality fixes, and per-task commits? `[path]`

Record approval in the plan's existing plan-level status field and proceed to Step 3. A requested change returns through work-planner and document review before this gate.

## 3. Conditional Environment Preparation

Proceed directly to task generation. Run `recipe-prepare-implementation` only when the user explicitly requests repository-local setup. If task-local execution later identifies a concrete missing repository capability, resolve it through Orchestrator Escalation Resolution and run the preparation side path when that is the smallest authorized resolution.

## 4. Compute the Consumed Task Set

The managed set is exactly `docs/plans/tasks/{plan-name}-task-*.md` implementation task files, excluding basenames that start with `integration-tests-`. The pending set contains managed files with at least one unchecked task checkbox.

When the managed set is empty, invoke task-decomposer with the exact approved Work Plan path. Verify the generated task files, then recompute both sets. Batch approval already authorizes this decomposition. When the managed set exists and the pending set is empty, proceed to final verification.

Order pending tasks by their declared dependencies.

## 5. Execution Plan

Use the active execution plan when one exists. When none exists, create one after the task set is known with one step per task cycle and a final verification step. Update the same plan throughout execution.

## 6. Autonomous Task Cycle

Execute each pending task through the `subagents-orchestration-guide` autonomous task cycle using task-executor and quality-fixer. Pass the exact task file and preserve the canonical Per-Task Change Set. After quality approval and a successful implementation commit, update the Task File, corresponding Work Plan task and phase, and execution plan locally; keep Task Files and the Work Plan outside the implementation commit.

## 7. Requirement Changes During Build

Apply subagents-orchestration-guide `Requirement Change Detection During Flow` and resume from its named artifact while preserving unaffected completed work.

## 8. Final Verification

Apply `subagents-orchestration-guide` Post-Implementation Verification to the actual files changed by completed tasks and their governing documents. Route required fixes through the same task cycle.

Apply a security-reviewer finding only when leaving it unresolved would violate an explicit governing requirement or repository rule, or leave a concrete material security failure in the actual reachable trust model. The violated requirement, rule, or failure defines implementation scope: route the smallest correction that resolves it, treating the reviewer's suggestion as one candidate implementation.

## 9. Cleanup and Report

Remove the consumed task files after final verification and preserve the Work Plan as the progress record. A cleanup failure is reported with its exact path and leaves completed implementation valid.

Report the Work Plan path, completed tasks, commits, verification results, and any verification limitation that could not be exercised in the available environment.
