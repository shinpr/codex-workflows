---
name: recipe-add-integration-tests
description: "Add integration/E2E tests to existing codebase using Design Docs."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `testing` — test strategy and quality gates
2. [LOAD IF NOT ACTIVE] `integration-e2e-testing` — integration and E2E test patterns
3. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates

**Context**: Test addition workflow for existing implementations

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**First Action**: Register Steps 0-8 before any execution.

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

Reference documentation-criteria skill for task file template in Step 3.

### Step 1: Discover and Validate Documents

```bash
# Verify at least one document path was provided
test -n "$ARGUMENTS" || { echo "ERROR: No document paths provided"; exit 1; }

# Verify provided paths exist
ls $ARGUMENTS
```

Use only the user-provided paths in `$ARGUMENTS`. Do not auto-discover additional Design Docs or UI Specs.

Classify provided documents by path and filename, using first-match-wins:
- Path matches `docs/ui-spec/*.md` -> **UI Spec**
- Path matches `docs/design/*-backend-*.md` or `docs/design/*backend*.md` -> **Design Doc (backend)**
- Path matches `docs/design/*-frontend-*.md` or `docs/design/*frontend*.md` -> **Design Doc (frontend)**
- Path matches `docs/design/*.md` and none of the above -> **single-layer Design Doc**

If a filename appears to match both backend and frontend, halt and ask the user which layer it belongs to.

### Step 2: Skeleton Generation

Spawn acceptance-test-generator agent with only the documents that exist from Step 1:
```text
Generate test skeletons from the following documents:
- Design Doc (backend): [path]    <- include only if exists
- Design Doc (frontend): [path]   <- include only if exists
- UI Spec: [path]                 <- include only if exists
```

**Expected output**: `generatedFiles` as a structured object grouped by layer, for example:
```json
{
  "backend": ["path/to/backend.int.test.ts"],
  "frontend": ["path/to/frontend.int.test.ts"],
  "e2e": ["path/to/flow.e2e.test.ts"]
}
```

### Step 3: Create Task Files [GATE]

**[STOP — BLOCKING]** Present task file content to user for confirmation before proceeding to implementation.
**CANNOT proceed until user explicitly confirms.**

Create one task file per layer, using the monorepo-flow.md naming convention for deterministic agent routing:
- Backend skeletons exist -> `docs/plans/tasks/integration-tests-backend-task-YYYYMMDD.md`
- Frontend skeletons exist -> `docs/plans/tasks/integration-tests-frontend-task-YYYYMMDD.md`
- Single-layer (no backend/frontend distinction) -> `docs/plans/tasks/integration-tests-backend-task-YYYYMMDD.md`

**Template** (per task file):
```markdown
---
name: Implement [layer] integration tests for [feature name]
type: test-implementation
---

## Objective

Implement test cases defined in skeleton files.

## Target Files

- Skeleton: [layer-specific paths from Step 2 generatedFiles]
- Design Doc: [layer-specific Design Doc from Step 1]

## Tasks

- [ ] Implement each test case in skeleton
- [ ] Verify all tests pass
- [ ] Ensure coverage meets requirements

## Acceptance Criteria

- All skeleton test cases implemented
- All tests passing
- No quality issues
```

**Output**: "Task file(s) created at [path(s)]. Ready for Step 4."

### Step 4: Test Implementation

For each task file from Step 3, invoke task-executor routed by filename pattern:
- `*-backend-task-*` -> Spawn `task-executor`
- `*-frontend-task-*` -> Spawn `task-executor-frontend`
- Prompt: "Task file: [task file path from Step 3]. Implement tests following the task file."

Execute one task file at a time through Steps 4 -> 5 -> 6 -> 7 before starting the next.

**Expected output**: `status`, `testsAdded`

### Step 5: Test Review

Spawn integration-test-reviewer agent: "Review test quality. Test files: [paths from Step 4 testsAdded]. Skeleton files: [layer-specific paths from Step 2 generatedFiles matching current task's layer]."

**Expected output**: `status` (approved/needs_revision), `requiredFixes`

### Step 6: Apply Review Fixes

Check Step 5 result:
- `status: approved` -> Mark complete, proceed to Step 7
- `status: needs_revision` -> Spawn the layer-appropriate executor with: "Fix the following issues in test files: [requiredFixes from Step 5]." Then return to Step 5. Maximum 2 revision cycles per task file; if still `needs_revision`, escalate to the user.

### Step 7: Quality Check

Spawn quality-fixer routed by task filename pattern:
- `*-backend-task-*` -> Spawn `quality-fixer`
- `*-frontend-task-*` -> Spawn `quality-fixer-frontend`
- Prompt: "Final quality assurance for test files added in this workflow. Run all tests and verify coverage."

**Expected output**: `status` (`approved`/`blocked`)

### Step 8: Commit

On `status: "approved"` from quality-fixer:
- MUST commit test files with appropriate message
ENFORCEMENT: Commits without quality-fixer approval are invalid.

## Completion Criteria

- [ ] Design Doc validated and located
- [ ] Skeleton generated via acceptance-test-generator
- [ ] Task file created and confirmed
- [ ] Tests implemented via task-executor
- [ ] Tests reviewed via integration-test-reviewer (approved or fixes applied)
- [ ] Quality check passed via quality-fixer
- [ ] Test files committed
