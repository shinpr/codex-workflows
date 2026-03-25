---
name: recipe-add-integration-tests
description: "Add integration/E2E tests to existing codebase using Design Doc acceptance criteria."
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

Design Doc path: $ARGUMENTS

## Prerequisites

- Design Doc must exist (created manually or via reverse-engineer)
- Existing implementation to test

## Execution Flow

### Step 0: Prepare Context

Reference documentation-criteria skill for task file template in Step 3.

### Step 1: Validate Design Doc

Verify Design Doc exists at $ARGUMENTS or find the most recent in docs/design/.

### Step 2: Skeleton Generation

Spawn acceptance-test-generator agent: "Generate test skeletons from Design Doc at [path from Step 1]."

**Expected output**: `generatedFiles` containing integration and e2e paths

### Step 3: Create Task File [GATE]

**[STOP — BLOCKING]** Present task file content to user for confirmation before proceeding to implementation.
**CANNOT proceed until user explicitly confirms.**

Create task file at: `docs/plans/tasks/integration-tests-YYYYMMDD.md`

**Template**:
```markdown
---
name: Implement integration tests for [feature name]
type: test-implementation
---

## Objective

Implement test cases defined in skeleton files.

## Target Files

- Skeleton: [path from Step 2 generatedFiles]
- Design Doc: [path from Step 1]

## Tasks

- [ ] Implement each test case in skeleton
- [ ] Verify all tests pass
- [ ] Ensure coverage meets requirements

## Acceptance Criteria

- All skeleton test cases implemented
- All tests passing
- No quality issues
```

**Output**: "Task file created at [path]. Ready for Step 4."

### Step 4: Test Implementation

Spawn task-executor agent: "Implement integration tests. Task file: docs/plans/tasks/integration-tests-YYYYMMDD.md. Implement tests following the task file."

**Expected output**: `status`, `testsAdded`

### Step 5: Test Review

Spawn integration-test-reviewer agent: "Review test quality. Test files: [paths from Step 4 testsAdded]. Skeleton files: [paths from Step 2 generatedFiles]."

**Expected output**: `status` (approved/needs_revision), `requiredFixes`

### Step 6: Apply Review Fixes

Check Step 5 result:
- `status: approved` -> Mark complete, proceed to Step 7
- `status: needs_revision` -> Spawn task-executor agent: "Fix the following issues in test files: [requiredFixes from Step 5]." Then return to Step 5.

### Step 7: Quality Check

Spawn quality-fixer agent: "Final quality assurance for test files added in this workflow. Run all tests and verify coverage."

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
