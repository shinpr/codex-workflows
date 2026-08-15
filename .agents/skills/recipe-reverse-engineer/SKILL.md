---
name: recipe-reverse-engineer
description: "Generate PRD and Design Docs from existing codebase through discovery, generation, verification, and review."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `ai-development-guide` — evidence and completeness discipline
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and review resolution
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — generated document handoffs

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

**Context**: Reverse engineering workflow to create documentation from existing code

Target: $ARGUMENTS

## Orchestrator Definition

**Core Identity**: Coordinate reverse engineering, perform lightweight artifact routing directly, and invoke specialists for discovery, document generation, and semantic review.

**Execution Protocol**:
1. Invoke the named specialists for discovery, generation, and semantic review; perform artifact selection, routing, deterministic transformations, and status updates directly
2. **Process one step at a time**: Execute steps sequentially within each unit (2 -> 3 -> 4 -> 5). Each step's output is the required input for the next step. Complete all steps for one unit before starting the next
3. **Pass `$STEP_N_OUTPUT` as-is** to sub-agents -- the orchestrator bridges data without processing or filtering it, except for steps that explicitly define a deterministic transformation with an input schema, output schema, and mapping rules

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

## Step 0: Initial Configuration

### 0.1 Scope Confirmation

Ask the user to confirm:
1. **Target path**: Which directory/module to document
2. **Depth**: PRD only, or PRD + Design Docs
3. **Reference Architecture**: layered / mvc / clean / hexagonal / none
4. **Human review**: Yes (recommended) / No (fully autonomous)

### 0.2 Output Configuration

- PRD output: `docs/prd/` or existing PRD directory
- Design Doc output: `docs/design/` or existing design directory
- Verify directories exist, create if needed

## Workflow Overview

```
Phase 1: PRD Generation
  Step 1: Scope Discovery (unified, single pass -> group into PRD units -> human review)
  Step 2-5: Per-unit loop (Generation -> Verification -> Review -> Revision)

Phase 2: Design Doc Generation (if requested)
  Step 6: Design Doc Scope Mapping (reuse Step 1 results, no re-discovery)
  Step 7-10: Per-unit loop (Generation -> Verification -> Review -> Revision)
```

## Phase 1: PRD Generation

**Confirm these steps are present in the plan**:
- Step 1: PRD Scope Discovery
- Per-unit processing (Steps 2-5 for each unit)

### Step 1: PRD Scope Discovery

Spawn scope-discoverer agent: "Discover functional scope targets in the codebase. target_path: $USER_TARGET_PATH. reference_architecture: $USER_RA_CHOICE. focus_area: $USER_FOCUS_AREA (if specified)."

**Store output as**: `$STEP_1_OUTPUT`

**Quality Gate**:
- At least one unit discovered -> proceed
- No units discovered -> ask user for hints
- `$STEP_1_OUTPUT.prdUnits` exists
- All `sourceUnits` across `prdUnits` (flattened, deduplicated) match the set of `discoveredUnits` IDs — no unit missing, no unit duplicated
- Each discovered unit's `unitInventory` has at least one non-empty category. If all categories are empty, re-run discovery with focus on that unit

**[STOP — BLOCKING]** If human review enabled: Present `$STEP_1_OUTPUT.prdUnits` with their source unit mapping to user for confirmation.
**CANNOT proceed until user explicitly confirms.**

### Step 2-5: Per-Unit Processing

**FOR** each unit in `$STEP_1_OUTPUT.prdUnits` **(sequential, one unit at a time)**:

#### Step 2: PRD Generation

Set `$PRD_UNIT_INVENTORY` to the category-wise deduplicated union of `unitInventory` from the `$STEP_1_OUTPUT.discoveredUnits` named by `$PRD_UNIT_SOURCE_UNITS`, preserving its `routes`, `testFiles`, and `publicExports` arrays.

Spawn prd-creator agent: "Create reverse-engineered PRD for the following feature. Operation Mode: reverse-engineer. External Scope Provided: true. Feature: $PRD_UNIT_NAME. Description: $PRD_UNIT_DESCRIPTION. Related Files: $PRD_UNIT_COMBINED_RELATED_FILES. Entry Points: $PRD_UNIT_COMBINED_ENTRY_POINTS. Source Units: $PRD_UNIT_SOURCE_UNITS. Unit Inventory: $PRD_UNIT_INVENTORY. Use provided scope as an investigation starting point. If tracing entry points reveals directly connected files outside this scope, include them. Create final version PRD based on thorough code investigation."

**Store output as**: `$STEP_2_OUTPUT` (PRD path)

#### Step 3: Code Verification

**Prerequisite**: $STEP_2_OUTPUT (PRD path from Step 2)

Spawn code-verifier agent: "Verify consistency between PRD and code implementation. doc_type: prd. document_path: $STEP_2_OUTPUT. code_paths: $PRD_UNIT_COMBINED_RELATED_FILES. unit_inventory: $PRD_UNIT_INVENTORY. verbose: false."

Apply Review Resolution to every discrepancy. Pass the `apply` discrepancies to prd-creator in update mode, rerun code-verifier, and store the resolved summary, declines with reasons, and material limitations as `$STEP_3_RESOLUTION` after the `apply` set becomes empty. A blocked or unusable result enters Orchestrator Escalation Resolution.

#### Step 4: Review

**Required Input**: $STEP_3_RESOLUTION (resolved verification evidence from Step 3)

Spawn document-reviewer agent: "Review the following PRD. doc_type: PRD. target: $STEP_2_OUTPUT. verification_resolution: $STEP_3_RESOLUTION. Review alignment between PRD claims, resolved verification evidence, and in-scope inventory coverage."

**Store output as**: `$STEP_4_OUTPUT`

If `verdict.decision` is `rejected`, apply Orchestrator Escalation Resolution. Continue after an evidence-based self-resolution; ask the user only when that procedure reaches a user-decision condition.

#### Step 5: Revision (conditional)

- If `verdict.decision` is `approved_with_conditions` or `needs_revision`, apply Review Resolution with prd-creator, then retain the review of the updated artifact as the current review.
- After the applicable revision bullets complete, continue to Unit Completion.

#### Unit Completion

- [ ] `verdict.decision` is `approved`
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next unit. After all units -> Phase 2.

## Phase 2: Design Doc Generation

*Execute only if Design Docs were requested in Step 0*

**Confirm these steps are present in the plan**:
- Step 6: Design Doc Scope Mapping
- Per-unit processing (Steps 7-10 for each unit)

### Step 6: Design Doc Scope Mapping

**Step type**: Deterministic transformation step executed by the orchestrator.

**No additional discovery required.** Use `$STEP_1_OUTPUT.discoveredUnits` (implementation-granularity units) for technical profiles. Use `$STEP_1_OUTPUT.prdUnits[].sourceUnits` to trace which discovered units belong to each PRD unit.

**Default mapping rule**: Each PRD unit maps to exactly 1 Design Doc unit.

Only split one PRD unit into multiple Design Doc units when BOTH are true:
1. The source units contain clearly separate technical boundaries with low shared-file overlap
2. Separate Design Docs would improve verification clarity (different public interfaces, dependencies, or module groups)

If the split conditions are not clearly met, keep 1 PRD unit -> 1 Design Doc unit.

Transform `$STEP_1_OUTPUT` into `$STEP_6_OUTPUT` using only the mapping rules in this step.

Map PRD units to Design Doc generation targets by resolving each PRD unit's `sourceUnits` back to `$STEP_1_OUTPUT.discoveredUnits`, carrying forward:
- `technicalProfile.primaryModules` -> Primary Files
- `technicalProfile.publicInterfaces` -> Public Interfaces
- `dependencies` -> Dependencies
- `relatedFiles` -> Scope boundary
- the category-wise deduplicated union of `unitInventory` from all resolved `sourceUnits` -> Unit Inventory

**Store output as**: `$STEP_6_OUTPUT`

`$STEP_6_OUTPUT` MUST be a JSON array of Design Doc generation targets in the following shape:

```json
[
  {
    "unitId": "DD-001",
    "parentPrdUnitId": "PRD-001",
    "unitName": "Authentication",
    "unitDescription": "Current implementation for sign-in and session management",
    "sourceUnits": ["UNIT-001", "UNIT-002"],
    "primaryModules": ["src/auth/service.ts", "src/auth/controller.ts"],
    "publicInterfaces": ["AuthService.login()", "AuthController.handleLogin()"],
    "dependencies": ["UNIT-003"],
    "scopeBoundary": ["src/auth/*"],
    "unitInventory": {
      "routes": [],
      "testFiles": [],
      "publicExports": []
    },
    "mappingRationale": "Default 1:1 mapping from PRD unit because technical scope is cohesive"
  }
]
```

**Quality Gate**:
- Every PRD unit appears in at least one `$STEP_6_OUTPUT` item
- Every `$STEP_6_OUTPUT` item references only discovered units from its parent PRD unit
- Every `$STEP_6_OUTPUT.unitInventory` is the union of `routes`, `testFiles`, and `publicExports` from all of its `sourceUnits`
- `mappingRationale` explicitly states whether the mapping is default 1:1 or an intentional split

### Step 7-10: Per-Unit Processing

**FOR** each unit in `$STEP_6_OUTPUT` **(sequential, one unit at a time)**:

#### Step 7: Design Doc Generation

**Scope**: Document current architecture as-is. This is a documentation task, not a design improvement task.

Spawn technical-designer agent: "Create Design Doc for the following feature based on existing code. Operation Mode: reverse-engineer. Feature: $UNIT_NAME. Description: $UNIT_DESCRIPTION. Primary Files: $UNIT_PRIMARY_MODULES. Public Interfaces: $UNIT_PUBLIC_INTERFACES. Dependencies: $UNIT_DEPENDENCIES. Unit Inventory: $UNIT_INVENTORY. Parent PRD: $APPROVED_PRD_PATH. Document current architecture as-is. Use Unit Inventory as the completeness baseline."

**Store output as**: `$STEP_7_OUTPUT`

#### Step 8: Code Verification

Spawn code-verifier agent: "Verify consistency between Design Doc and code implementation. doc_type: design-doc. document_path: $STEP_7_OUTPUT. code_paths: $UNIT_SCOPE_BOUNDARY. unit_inventory: $UNIT_INVENTORY. verbose: false."

Apply Review Resolution to every discrepancy. Pass the `apply` discrepancies to technical-designer in update mode, rerun code-verifier, and store the resolved summary, declines with reasons, and material limitations as `$STEP_8_RESOLUTION` after the `apply` set becomes empty. A blocked or unusable result enters Orchestrator Escalation Resolution.

#### Step 9: Review

**Required Input**: $STEP_8_RESOLUTION (resolved verification evidence from Step 8)

Spawn document-reviewer agent: "Review the following Design Doc. doc_type: DesignDoc. review_context: as-is. target: $STEP_7_OUTPUT. verification_resolution: $STEP_8_RESOLUTION. Parent PRD: $APPROVED_PRD_PATH. Review technical accuracy, parent PRD scope, and in-scope unit boundary coverage."

**Store output as**: `$STEP_9_OUTPUT`

If `verdict.decision` is `rejected`, apply Orchestrator Escalation Resolution. Continue after an evidence-based self-resolution; ask the user only when that procedure reaches a user-decision condition.

#### Step 10: Revision (conditional)

- If `verdict.decision` is `approved_with_conditions` or `needs_revision`, apply Review Resolution with technical-designer, then retain the review of the updated artifact as the current review.
- After the applicable revision bullets complete, continue to Unit Completion.

#### Unit Completion

- [ ] `verdict.decision` is `approved`
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next unit. After all units -> Final Report.

## Final Report

Output summary including:
- Generated documents table (Type, Name, Verification Status, Review Status)
- Remaining issues requiring manual intervention, with source ID and effect
- Next steps checklist

## Error Handling

| Error | Action |
|-------|--------|
| Discovery finds nothing | Ask user for project structure hints |
| Generation fails | Log failure, continue with other units, report in summary |
| Code verification is blocked or unusable | Apply Orchestrator Escalation Resolution with the exact input or evidence problem |
| Review Resolution requires a user-owned decision | Apply Orchestrator Escalation Resolution |

## Completion Criteria

- [ ] Scope confirmed with user (target path, depth, architecture, human review preference)
- [ ] Output directories verified/created
- [ ] Phase 1: All PRD units discovered and processed (generation -> verification -> review -> revision)
- [ ] Phase 2: All Design Doc units processed (if requested)
- [ ] All human review points honored (if enabled)
- [ ] Final report presented with document table, action items, and next steps
