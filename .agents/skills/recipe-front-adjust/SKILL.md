---
name: recipe-front-adjust
description: "Adjust an implemented UI with external resource context, focused write-set confirmation, verification, and quality checks."
---

**Context**: UI adjustment for implemented frontend features. The parent session owns the edit and verification loop; subagents handle bounded fact gathering, planning, and quality checks.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` -- scale and planning criteria
2. [LOAD IF NOT ACTIVE] `external-resource-context` -- external resource hearing and lookup
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination rules
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` -- clear prompts, handoffs, and generated artifacts

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

## Execution Pattern

**Core Identity**: "I am a guided executor. I run the UI adjustment and verification loop in the parent session."

**Execution Protocol**:
1. Delegate bounded one-shot work to `ui-analyzer`, `work-planner`, and `quality-fixer-frontend`.
2. Run user dialogue, write-set confirmation, edits, and verification in the parent session.
3. Respect every `[STOP]` marker before moving to the next phase.

Adjustment request: $ARGUMENTS

## Execution Flow

### Step 1: External Resource Hearing

Run the frontend domain hearing protocol from `external-resource-context`.

### Step 2: UI Fact Gathering

Spawn `ui-analyzer`:

`requirement_analysis: { affectedFiles: [files inferred from request], purpose: "UI adjustment", technicalConsiderations: [] }. requirements: [adjustment request]. target_paths: [paths named or inferred from request]. target_components: [components named in request]. ui_spec_path: [path if available]. Read docs/project-context/external-resources.md, resolve relevant UI sources through declared access methods, analyze existing UI code, and populate candidateWriteSet[].`

### Step 3: Confirm Write Set and Scale

1. Present `candidateWriteSet[]` to the user.
2. Ask the user to confirm high-confidence entries, confirm all entries, or provide an edited file list.
3. Apply documentation-criteria Creation Decision Matrix to the confirmed write set:
   - `0 files`: ask the user for the component or path that owns the change, then pause this recipe.
   - `1-2 files`: proceed with direct adjustment.
   - `3-5 files`: create a focused work plan.
   - `6+ files` or ADR conditions: route to the frontend design flow.

### Step 4: Plan Creation When Needed

For `3-5 files`, spawn `work-planner`:

`Create a focused UI adjustment plan. Adjustment request: [verbatim]. ui_analysis: [ui-analyzer JSON]. External resources: docs/project-context/external-resources.md. Confirmed write set: [files]. Each phase should be implementable as 1-3 commits. Include visual verification, accessibility, i18n parity, and generated artifact checks when relevant. Output path: docs/plans/[YYYYMMDD]-adjust-[short-description].md.`

**[STOP]** Present the plan and wait for approval.

For `1-2 files`, present a concise adjustment context:
- request
- confirmed write set
- relevant `focusAreas[]`
- relevant external resource summaries and access methods

**[STOP]** Wait for user confirmation that the context covers the work.

### Step 5: Adjustment and Verification

For each adjustment unit:
1. Plan the edit from `focusAreas[]`, confirmed write set, and relevant external resource summaries.
2. Apply the edit in the parent session.
3. Verify against declared access methods:
   - design origin: compare implementation target to the recorded design source
   - visual verification: use the recorded browser, test runner, Storybook, dev server, or manual confirmation path
   - design system: confirm tokens, variants, and usage rules through the recorded source
4. Refine until the implemented UI matches the design source or the user-confirmed adjustment target.

### Step 6: Quality Verification

Spawn `quality-fixer-frontend` for each unit:

- Direct adjustment: pass `filesModified: [edited files]`
- Planned adjustment: pass `task_file: [work plan path]` and `filesModified: [edited files]`

Route `quality-fixer-frontend` results:
- `approved`: proceed to commit
- `stub_detected`: complete the implementation gap and rerun quality verification
- `blocked`: surface missing prerequisites or unclear specification points to the user

### Step 7: Commit

Commit each approved adjustment unit with affected files and relevant generated artifacts.

## Completion Criteria

- [ ] External resource hearing completed or update explicitly skipped
- [ ] `ui-analyzer` returned JSON with external resource status and `candidateWriteSet`
- [ ] User confirmed write set before scale judgment
- [ ] Scale judgment completed with matching branch
- [ ] Direct context or work plan approved
- [ ] Adjustment units edited and verified through declared resource paths
- [ ] Each unit passed `quality-fixer-frontend`
- [ ] Each approved unit committed

## Output Example

```
Frontend adjustment completed.
- External resources: docs/project-context/external-resources.md (updated|unchanged)
- UI analysis: [N] components, [M] focus areas
- Scale: 1-2 files | 3-5 files
- Work plan: path | N/A
- Adjustment units committed: [count]
- Quality status: approved
```
