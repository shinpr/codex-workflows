---
name: recipe-front-adjust
description: "Adjust an implemented UI with focused evidence, verification, and quality checks."
---

**Context**: UI adjustment for implemented frontend features. The parent session owns the edit and verification loop; subagents handle bounded fact gathering, planning, and quality checks.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination rules
2. [LOAD IF NOT ACTIVE] `llm-friendly-context` -- adjustment handoff and verification context

Load `external-resource-context` in Step 1 only when a named external source is required for the requested adjustment.

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

## Execution Pattern

**Core Identity**: "I am a guided executor. I run the UI adjustment and verification loop in the parent session."

**Execution Plan Gate**: Use the active execution plan when one exists. Create one only when this adjustment has three or more dependent objectives.

**Execution Protocol**:
1. Delegate bounded one-shot work to `ui-analyzer` and `quality-fixer-frontend`.
2. Run evidence resolution, edits, and verification in the parent session.

Adjustment request: $ARGUMENTS

## Execution Flow

### Step 1: External Resource Hearing

Identify whether the requested adjustment depends on an external design or verification source unavailable from the repository or supplied input. Reuse a matching recorded resource when available. Otherwise run the focused `external-resource-context` hearing for that exact source. When repository or user-supplied evidence defines the target, continue with no external resource.

### Step 2: UI Fact Gathering

Spawn `ui-analyzer`:

`requirement_analysis: { affectedFiles: [files inferred from request], purpose: "UI adjustment", technicalConsiderations: [] }. requirements: [adjustment request]. target_paths: [paths named or inferred from request]. target_components: [components named in request]. ui_spec_path: [path if available]. externalResourceRefs: [{label, featureIdentifier} selected in Step 1, or []]. Analyze existing UI code and populate candidateWriteSet[].`

### Step 3: Resolve Write Set and Route

Resolve the smallest write set supported by the request, `candidateWriteSet[]`, and repository evidence. Search by component ownership and call sites when the first candidates are incomplete; ask the user only when the requested UI target still cannot be identified.

- Existing component architecture, state ownership, routing, and API contracts remain unchanged: proceed to Step 4.
- Any of those design contracts changes: hand the request, resolved write set, and relevant `focusAreas[]` to `recipe-front-design`, then end this recipe.

Concise adjustment context:
- request
- resolved write set
- relevant `focusAreas[]`
- relevant external resource summaries and access methods

### Step 4: Adjustment and Verification

For each adjustment unit:
1. Start the Per-Task Change Set and plan the edit from `focusAreas[]`, resolved write set, and relevant external resource summaries.
2. Apply the edit in the parent session and add its paths and generated artifacts to `taskWriteSet`.
3. Verify against declared access methods:
   - design origin: compare implementation target to the recorded design source
   - visual verification: use the recorded browser, test runner, Storybook, dev server, or manual confirmation path
   - design system: confirm tokens, variants, and usage rules through the recorded source
4. Refine until the implemented UI matches the design source or the user-confirmed adjustment target.

### Step 5: Quality Verification

For each unit, spawn `quality-fixer-frontend` with `filesModified: taskWriteSet` and the Step 4 verification evidence. Repair reported stubs in the parent session, accumulate every repair and quality-fixer path, and rerun quality-fixer. On approval, reconcile and commit the Per-Task Change Set; resolve blocked results through Orchestrator Escalation Resolution.

## Completion Criteria

- [ ] The UI target is grounded in repository, supplied, or focused external evidence
- [ ] `ui-analyzer` returned JSON with external resource status and `candidateWriteSet`
- [ ] The write set is supported by the request and repository evidence
- [ ] Route completed:
  - Direct adjustment: edits verified, quality-fixer approved, and units committed
  - Frontend design: request, resolved write set, and relevant `focusAreas[]` handed to `recipe-front-design`

## Output Example

```
Frontend adjustment completed.
- External resources: docs/project-context/external-resources.md (updated|unchanged)
- Route: direct adjustment | frontend design
- Result: [committed adjustment count | frontend design handoff]
```
