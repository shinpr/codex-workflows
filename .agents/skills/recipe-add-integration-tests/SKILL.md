---
name: recipe-add-integration-tests
description: "Add integration/E2E tests to existing codebase using Design Docs."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `testing` — repository-aware test execution
2. [LOAD IF NOT ACTIVE] `integration-e2e-testing` — value-based integration/E2E selection
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — review resolution and agent coordination
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — task file contract

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

**Context**: Test addition workflow for existing implementations

## Orchestrator Definition

**Core Identity**: Coordinate test addition, perform lightweight evidence collection and routing directly, and invoke specialists for generation, implementation, and review judgment.

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

**Why Spawn**: Orchestrator's context is shared across all steps. Direct implementation consumes context needed for review and quality check phases. Task files create context boundaries. Subagents work in isolated context.

**Execution Method**:
- Skeleton generation -> Spawn acceptance-test-generator agent
- Task file creation -> Orchestrator creates directly (minimal context usage)
- Test implementation -> Spawn task-executor agent
- Test review -> Spawn integration-test-reviewer agent
- Quality checks -> Spawn quality-fixer agent

Document paths: $ARGUMENTS

## Prerequisites

- At least one Design Doc must exist (created manually or via reverse-engineer)
- Existing implementation to test

## Execution Flow

### Step 0: Prepare Context

Use the llm-friendly-context Task File Contract in Step 3.

### Step 1: Discover and Validate Documents

```bash
# Verify at least one document path was provided
test -n "$ARGUMENTS" || { echo "ERROR: No document paths provided"; exit 1; }

# Verify provided paths exist
ls $ARGUMENTS
```

Treat the user-provided paths in `$ARGUMENTS` as the complete document selection.

Treat paths under `docs/ui-spec/` as UI Specs and the supplied `docs/design/` paths as Design Docs. When a filename is unclear, use the document title and content; layer classification is not an execution gate because the generator returns each artifact's implementation kind.

### Step 2: Skeleton Generation

Spawn acceptance-test-generator with the validated document paths from Step 1. Include UI Specs as optional UI evidence.
```text
Generate test skeletons from the following documents:
- Design Docs: [paths]
- UI Specs: [paths, when supplied]
```

**Expected output**: consume the acceptance-test-generator contract directly:
```json
{
  "status": "completed",
  "artifacts": [{"path": "path", "implementationKind": "general | frontend"}]
}
```

Verify returned artifact paths. When the selected set is empty, report that no integration/E2E skeleton was valuable and finish; otherwise continue to Step 3.

### Step 3: Create Task Files

Group the returned artifacts by `implementationKind` and create at most one task per non-empty group:

| implementationKind | Task file | Executor | Quality fixer |
|---|---|---|---|
| `general` | `docs/plans/tasks/integration-tests-task-YYYYMMDD.md` | `task-executor` | `quality-fixer` |
| `frontend` | `docs/plans/tasks/integration-tests-frontend-task-YYYYMMDD.md` | `task-executor-frontend` | `quality-fixer-frontend` |

Populate the llm-friendly-context Task File Contract with:

- `Source Plan Tasks: N/A — standalone test-addition flow`
- `Implementation Outcome`: implement every skeleton in this task's artifact group as a runnable integration/E2E test
- `Governing Sources`: the supplied Design Doc/UI Spec paths and the ACs cited by the skeletons
- `Target Files`: the `path` of every artifact in this task's group
- `Investigation Targets`: the governing sections, generated skeletons, and one representative existing test per selected lane
- `Implementation Steps`: implement the skeleton proof obligations, run their focused commands, and keep the selected boundaries observable
- `Operation Verification Methods`: repository commands and observable pass conditions for the selected lanes
- `Verification Focus`: when one material false-green condition controls completion, copy its Primary failure and smallest observable proof check
- `Completion Criteria`: every selected skeleton is executable and its observable checks pass

**Output**: "Task file created at [path]. Ready for Step 4."

### Step 4: Test Implementation

Start the subagents-orchestration-guide Per-Task Change Set before invoking the executor for each task.

For each task file from Step 3, invoke the executor from its table row with: "Task file: [task file path from Step 3]. Implement tests following the task file."

Inspect the executor result and repository diff, then add its paths to `taskWriteSet`. Resolve an incomplete or unusable implementation through Orchestrator Escalation Resolution.

Execute one task file at a time through Steps 4 -> 5 -> 6 -> 7 before starting the next.

**Expected output**: completion or escalation state, `filesModified`, `testsAdded`, `requiresTestReview`, and operation-verification evidence

### Step 5: Test Review

Use integration/E2E paths from `taskWriteSet` as the test-review input set.
Spawn integration-test-reviewer with `changedTestFiles`, `diffBase`, `skeletonFiles: [artifact paths in the current task]`, and `taskFile`.
Keep `testsAdded` as reporting metadata only.

Consume the reviewer decision, actionable findings, and governing basis. Apply Orchestrator Escalation Resolution when the result is blocked or cannot support the next action.

### Step 6: Apply Review Fixes

Proceed when the review is approved. When it contains actionable revision findings, apply Review Resolution with the layer-appropriate executor, add repair paths to `taskWriteSet`, and rerun the reviewer.

### Step 7: Quality Check

Spawn the quality fixer from the current task's Step 3 table row with `task_file`, `filesModified: taskWriteSet`, and the executor's operation-verification evidence.

**Expected output**: `status` (`stub_detected`/`approved`/`blocked`)

### Step 8: Commit

On quality approval, add its `filesModified`, reconcile and commit the Per-Task Change Set, then mark the temporary task file complete. Repair stubs through the current task's executor and accumulate their paths; resolve blocked results through Orchestrator Escalation Resolution.

## Completion Criteria

- [ ] Design Doc validated and located
- [ ] acceptance-test-generator returned `status: completed`
- [ ] Every returned artifact was implemented, reviewed, quality-checked, and committed
- [ ] Task files created by this recipe deleted from `docs/plans/tasks/`

## Final Cleanup

Before the completion report, delete only the integration-test task files this recipe created for the current run. Their work is committed; `docs/plans/` is ephemeral working state.

If cleanup fails, preserve completed test work and report the failed path.
