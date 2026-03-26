---
name: recipe-reverse-engineer
description: "Generate PRD and Design Docs from existing codebase through discovery, generation, verification, and review."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `ai-development-guide` — AI development patterns
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows

**Context**: Reverse engineering workflow to create documentation from existing code

Target: $ARGUMENTS

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Protocol**:
1. **Spawn agents for all work** -- your role is to invoke sub-agents, pass data between them, and report results
2. **Process one step at a time**: Execute steps sequentially within each unit (2 -> 3 -> 4 -> 5). Each step's output is the required input for the next step. Complete all steps for one unit before starting the next
3. **Pass `$STEP_N_OUTPUT` as-is** to sub-agents -- the orchestrator bridges data without processing or filtering it, except for steps that explicitly define a deterministic transformation with an input schema, output schema, and mapping rules

**Task Registration**: Register phases first, then steps within each phase as you enter it. Track status for each step.

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

**Register tasks**:
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

Spawn prd-creator agent: "Create reverse-engineered PRD for the following feature. Operation Mode: reverse-engineer. External Scope Provided: true. Feature: $PRD_UNIT_NAME. Description: $PRD_UNIT_DESCRIPTION. Related Files: $PRD_UNIT_COMBINED_RELATED_FILES. Entry Points: $PRD_UNIT_COMBINED_ENTRY_POINTS. Source Units: $PRD_UNIT_SOURCE_UNITS. Use provided scope as an investigation starting point. If tracing entry points reveals directly connected files outside this scope, include them. Create final version PRD based on thorough code investigation."

**Store output as**: `$STEP_2_OUTPUT` (PRD path)

#### Step 3: Code Verification

**Prerequisite**: $STEP_2_OUTPUT (PRD path from Step 2)

Spawn code-verifier agent: "Verify consistency between PRD and code implementation. doc_type: prd. document_path: $STEP_2_OUTPUT. verbose: false."

**Store output as**: `$STEP_3_OUTPUT`

**Quality Gate**:
- consistencyScore >= 70 and verifiableClaimCount >= 20 -> proceed to review (guards against shallow verification passes with too few extracted claims)
- consistencyScore >= 70 and verifiableClaimCount < 20 -> re-run verifier because investigation depth is insufficient
- consistencyScore < 70 -> flag for detailed review

#### Step 4: Review

**Required Input**: $STEP_3_OUTPUT (verification data from Step 3)

Spawn document-reviewer agent: "Review the following PRD considering code verification findings. doc_type: PRD. target: $STEP_2_OUTPUT. mode: composite. Code Verification Results: $STEP_3_OUTPUT. Additional Review Focus: Alignment between PRD claims and verification evidence, resolution recommendations for each discrepancy, completeness of undocumented feature coverage."

**Store output as**: `$STEP_4_OUTPUT`

#### Step 5: Revision (conditional)

**Trigger Conditions** (any one of the following):
- Review status is "Needs Revision" or "Rejected"
- Critical discrepancies exist in `$STEP_3_OUTPUT`
- consistencyScore < 70

Spawn prd-creator agent: "Update PRD based on review feedback and code verification results. Operation Mode: update. Existing PRD: $STEP_2_OUTPUT. Review Feedback: $STEP_4_OUTPUT. Code Verification Results: $STEP_3_OUTPUT. Address discrepancies by severity. Critical and major items require correction. Minor items: correct if straightforward, otherwise leave as-is with rationale."

**Loop Control**: Maximum 2 revision cycles. After 2 cycles, flag for human review regardless of status.
ENFORCEMENT: Exceeding 2 revision cycles without flagging produces unreviewed output.

#### Unit Completion

- [ ] Review status is "Approved" or "Approved with Conditions"
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next unit. After all units -> Phase 2.

## Phase 2: Design Doc Generation

*Execute only if Design Docs were requested in Step 0*

**Register tasks**:
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
- `unitInventory` -> Unit Inventory

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
- `mappingRationale` explicitly states whether the mapping is default 1:1 or an intentional split

### Step 7-10: Per-Unit Processing

**FOR** each unit in `$STEP_6_OUTPUT` **(sequential, one unit at a time)**:

#### Step 7: Design Doc Generation

**Scope**: Document current architecture as-is. This is a documentation task, not a design improvement task.

Spawn technical-designer agent: "Create Design Doc for the following feature based on existing code. Operation Mode: reverse-engineer. Feature: $UNIT_NAME. Description: $UNIT_DESCRIPTION. Primary Files: $UNIT_PRIMARY_MODULES. Public Interfaces: $UNIT_PUBLIC_INTERFACES. Dependencies: $UNIT_DEPENDENCIES. Unit Inventory: $UNIT_INVENTORY. Parent PRD: $APPROVED_PRD_PATH. Document current architecture as-is. Use Unit Inventory as the completeness baseline."

**Store output as**: `$STEP_7_OUTPUT`

#### Step 8: Code Verification

Spawn code-verifier agent: "Verify consistency between Design Doc and code implementation. doc_type: design-doc. document_path: $STEP_7_OUTPUT. verbose: false."

**Store output as**: `$STEP_8_OUTPUT`

#### Step 9: Review

**Required Input**: $STEP_8_OUTPUT (verification data from Step 8)

Spawn document-reviewer agent: "Review the following Design Doc considering code verification findings. doc_type: DesignDoc. target: $STEP_7_OUTPUT. mode: composite. Code Verification Results: $STEP_8_OUTPUT. Parent PRD: $APPROVED_PRD_PATH. Additional Review Focus: Technical accuracy of documented interfaces, consistency with parent PRD scope, completeness of unit boundary definitions."

**Store output as**: `$STEP_9_OUTPUT`

#### Step 10: Revision (conditional)

**Trigger Conditions** (same as Step 5):
- Review status is "Needs Revision" or "Rejected"
- Critical discrepancies exist in `$STEP_8_OUTPUT`
- consistencyScore < 70

Spawn technical-designer agent: "Update Design Doc based on review feedback and code verification results. Operation Mode: update. Existing Design Doc: $STEP_7_OUTPUT. Review Feedback: $STEP_9_OUTPUT. Code Verification Results: $STEP_8_OUTPUT. Address discrepancies by severity. Critical and major items require correction. Minor items: correct if straightforward, otherwise leave as-is with rationale."

**Loop Control**: Maximum 2 revision cycles. After 2 cycles, flag for human review regardless of status.

#### Unit Completion

- [ ] Review status is "Approved" or "Approved with Conditions"
- [ ] Human review passed (if enabled in Step 0)

**Next**: Proceed to next unit. After all units -> Final Report.

## Final Report

Output summary including:
- Generated documents table (Type, Name, Consistency Score, Review Status)
- Action items (critical discrepancies, undocumented features, flagged items)
- Next steps checklist

## Error Handling

| Error | Action |
|-------|--------|
| Discovery finds nothing | Ask user for project structure hints |
| Generation fails | Log failure, continue with other units, report in summary |
| consistencyScore < 50 | **[STOP — BLOCKING]** Flag for mandatory human review. **CANNOT proceed until user explicitly confirms.** |
| Review rejects after 2 revisions | Stop loop, flag for human intervention |

## Completion Criteria

- [ ] Scope confirmed with user (target path, depth, architecture, human review preference)
- [ ] Output directories verified/created
- [ ] Phase 1: All PRD units discovered and processed (generation -> verification -> review -> revision)
- [ ] Phase 2: All Design Doc units processed (if requested)
- [ ] All human review points honored (if enabled)
- [ ] Final report presented with document table, action items, and next steps
