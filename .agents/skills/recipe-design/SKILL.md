---
name: recipe-design
description: "Execute from codebase-scoped analysis to design document creation."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `implementation-approach` — design convergence and verification strategy
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and review resolution
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — document and review handoffs

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

**Context**: Dedicated to the design phase.

## Orchestrator Definition

**Core Identity**: Coordinate design, make workflow decisions from compact specialist materials, and invoke specialists for analysis, authoring, and review.

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

**Execution Protocol**:
1. **Spawn agents for analysis and document work** -- your role is to invoke sub-agents, select from their compact evidence against governing requirements, pass the selected material onward, and report results.
2. **Run the design flow below in order**:
   - Execute: scope evidence -> codebase-analyzer -> [Stop: Scope confirmation] -> optional PRD update/review/[Stop: PRD approval] -> optional ADR batch/batch review/[Stop: ADR-batch approval] -> Design Doc -> code-verifier/Review Resolution -> document-reviewer -> design-sync -> [Stop: Design approval]
   - **[STOP — BLOCKING]** At every `[Stop: ...]` marker -> Present status to user for confirmation. **CANNOT proceed until user explicitly confirms.**
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: MUST execute document-reviewer and all stopping points. MUST execute design-sync for Design Docs. Each serves as a quality gate.
ENFORCEMENT: Skipping any quality gate invalidates the design output.

## Workflow Overview

```
Requirements -> scope evidence -> codebase-analyzer -> [Stop: Scope confirmation]
                                                            |
                                      optional PRD update/review -> [Stop: PRD approval]
                                                            |
                                   optional ADR batch/review -> [Stop: ADR-batch approval]
                                                            |
                         Design Doc -> code-verifier -> Review Resolution -> document-reviewer
                                                            |
                                                    design-sync -> [Stop: Design approval]
```

## Scope Boundaries

**Included in this skill**:
- Compact scope and cost evidence from requirement-analyzer; the orchestrator owns requirement, scale, and ADR decisions
- Codebase analysis with codebase-analyzer (entry point of the design phase)
- Scope confirmation with the user, grounded in codebase-analyzer findings
- One ADR per qualifying decision point found in the current scope, created and reviewed as one batch
- Design Doc creation with technical-designer
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with approval of the Design Doc and its preceding ADR when required. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

For ADRs, clearly present design alternatives and trade-offs. For Design Docs, record the Direct MVP, failed current constraints or Material Risks, necessary additions, and subtraction evidence. Record only larger alternatives actually considered; `None` is valid.

Execute the process below within design scope.

## Execution Process

### Step 1: Scope and Cost Evidence

Spawn requirement-analyzer with the original requirements. Treat its request signals, scope evidence, cost evidence, and questions as material; the orchestrator determines requirements, scale, and ADR routing.

### Step 2: Codebase Analysis
Spawn codebase-analyzer agent: "Analyze the existing codebase to provide compact decision materials for requirement confirmation, ADR selection, minimal Design Doc creation, and verification. requirement_analysis: [Step 1 scopeEvidence]. requirements: $ARGUMENTS. target_paths: [Step 1 scopeEvidence.affectedFiles]."

### Step 3: Scope Confirmation
After codebase-analyzer returns, confirm the requirements, determine Structural Scale, and identify qualifying ADR decision points:
1. Locate a related PRD and read its Converged Outcome, MVP scope, Future / Out of Scope, and open requirement fields. If the related PRD is ambiguous, ask the user to select or provide its path, or confirm none exists, before continuing.
2. When those fields match the current request and returned scope facts, use the PRD path as the current carrier and proceed directly to scope confirmation.
3. When a current carrier is absent, load `requirement-convergence`. The orchestrator builds and judges its record from the user's wording, using Step 1 scope/cost evidence and Step 2 analysis for trade-offs, questions, and routing decisions. Mark an existing but incomplete or scope-mismatched PRD for update; otherwise mark the carrier as absent.
4. Apply the documentation-criteria Choice filter, then the Durability filter, to Step 2 `decisionMaterials.candidateDecisionPoints`. `adrDecisionPoints` contains every current-scope point that passes both filters; an empty array routes directly to Design Doc regardless of scale.
5. Determine Structural Scale and set `prdRequired` when the scale is Large and the current PRD carrier is absent.

Present the design scope to the user:
- Target files/modules: `analysisScope.filesAnalyzed` and directly relevant modules
- Affected layers: `analysisScope.affectedLayers`
- Recommended document path: Design Doc alone or an ADR batch followed by Design Doc, with every qualifying `adrDecisionPoint` and its filter evidence
- PRD status: whether `prdRequired` is true and whether the convergence carrier is current, requires update, or is absent
- Unknowns/assumptions: `limitations` and unresolved risks
- Questions before design: scope questions that change the design target or scale, including technical wording whose mandatory/candidate status is outcome-relevant and ambiguous

Ask the user to choose one:
- Proceed with the recommended document path
- Correct the scope and re-run codebase-analyzer
- Answer open questions, then proceed
- Provide an existing PRD path when `prdRequired` is true
- Explicitly approve proceeding without a PRD when `prdRequired` is true and no PRD will be provided

If `prdRequired` is true and the user neither provides a PRD path nor explicitly approves proceeding without a PRD, stop. This recipe does not create PRDs.

**[STOP — BLOCKING]** Wait for user confirmation before proceeding.

After confirmation, record the final scale, derive `adrRequired` from `adrDecisionPoints.length > 0`, and record `documentTypeRationale` from the actual ADR decision points. When the user's answer changes the scope or PRD carrier, recompute the affected values before proceeding. Use the current PRD path as carrier when available; otherwise use the compact `convergence` object.

### Step 4: Upstream Approval and Design Document Creation
When Step 3 marked an existing PRD for update, spawn prd-creator in update mode with that PRD path and the confirmed `convergence` object. Review the updated PRD with document-reviewer using its path as `target`, then resolve findings through Review Resolution. After the review permits approval, present the updated PRD for user approval. Continue with its path as the carrier after approval.

**[STOP — BLOCKING when a PRD was updated]** Wait for user approval of the updated PRD.

Create documents according to `documentTypeRationale`:
- When `adrDecisionPoints` is non-empty, spawn technical-designer once with `document_to_create: ADRBatch`, `decision_points: [adrDecisionPoints]`, confirmed requirements, and `decision_materials: [only the Step 2 reuse, invalidation, option/cost, contract, and decision-changing unknown material relevant to those points]`. Review all returned `paths[]` in one document-reviewer invocation using `doc_type: ADRBatch` and `targets: [all paths]`. Apply Review Resolution to the batch, rerun the batch review when an accepted correction changes a file, then present one ADR-batch approval request.

**[STOP — BLOCKING when ADRs were created]** Wait for one user approval of the reviewed ADR batch before creating the Design Doc.

Record every approved ADR file as `Accepted` when ADRs were created. Spawn technical-designer with `document_to_create: DesignDoc`, `adr_paths: [accepted ADR paths or []]`, the confirmed requirement carrier, and `decision_materials: [only Step 2 material that changes reuse, implementation validity, a selected ADR decision, a preserved contract, or verification]`. The confirmed requirements define scope, and selected ADR decisions constrain their relevant technical questions.

### Step 5: Code Verification
Spawn code-verifier agent: "Verify the Design Doc against the current codebase. document_path: [Design Doc path from Step 4]. doc_type: design-doc."

Apply Review Resolution to every discrepancy before document review. Pass only the `apply` discrepancies to technical-designer in update mode, then rerun code-verifier. When the `apply` set is empty, carry the resolved verification summary, declines with reasons, and material limitations to Step 6.

### Step 6: Document Review
Spawn document-reviewer agent: "Review the Design Doc for consistency, completeness, and adopted design validity. doc_type: DesignDoc. review_context: creation. target: [Design Doc path]. requirements_verbatim: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3]. decision_materials: [only Step 2 material that constrains this design]. verification_resolution: [resolved Step 5 evidence]."

Route the result before consistency verification:
- `approved`: continue
- `approved_with_conditions` or `needs_revision`: apply Review Resolution with the creating technical-designer, then review the updated document
- `rejected`: apply Orchestrator Escalation Resolution. Continue after an evidence-based self-resolution; ask the user only when that procedure reaches a user-decision condition

### Step 7: Consistency Verification
Spawn design-sync agent: "Verify consistency of the design document with other existing design documents and project constraints."

**Note**: design-sync returns `sync_status: "SKIPPED"` when only 1 Design Doc exists. This is distinct from `NO_CONFLICTS` and MUST be reported as such to the user.

## Completion Criteria

- [ ] Obtained compact scope and cost evidence while retaining requirement, scale, and ADR decisions in the orchestrator
- [ ] Spawned codebase-analyzer and passed only decision-relevant material into ADR/Design Doc creation
- [ ] Converged the requirement and persisted the record
- [ ] Confirmed the design scope with the user before document creation
- [ ] Created one ADR per qualifying decision point and reviewed the complete batch once, or routed an empty decision-point set directly to Design Doc
- [ ] Applied Review Resolution to code-verifier discrepancies before document review
- [ ] Spawned document-reviewer and addressed feedback
- [ ] Spawned design-sync for consistency verification for Design Docs
- [ ] Obtained user approval for design document
- [ ] All `[Stop: ...]` markers honored with user confirmation

## Output Example
Design phase completed.
- ADR: docs/adr/[document-name].md or N/A
- Design document: docs/design/[document-name].md or N/A
- Approval status: User approved
