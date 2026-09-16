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
   - Execute: scope evidence -> [Stop: Scope confirmation] -> optional PRD update/review/[Stop: PRD confirmation] -> codebase-analyzer -> optional ADR batch/batch review/[Stop: ADR-batch confirmation] -> Design Doc -> code-verifier/Review Resolution -> document-reviewer -> design-sync -> [Stop: Design confirmation]
   - **[STOP — BLOCKING]** At every `[Stop: ...]` marker -> Present status to user for confirmation and proceed after explicit confirmation.
3. **Scope**: Complete when design documents pass review and receive user confirmation

## Workflow Overview

```
Requirements -> scope evidence -> [Stop: Scope confirmation]
                                      |
                optional PRD update/review -> [Stop: PRD confirmation]
                                      |
                             codebase-analyzer
                                      |
             optional ADR batch/review -> [Stop: ADR-batch confirmation]
                                      |
           Design Doc -> code-verifier -> Review Resolution -> document-reviewer
                                      |
                              design-sync -> [Stop: Design confirmation]
```

## Scope Boundaries

**Included in this skill**:
- Compact scope and cost evidence from requirement-analyzer; the orchestrator owns requirement, scale, and ADR decisions
- Scope confirmation with the user, grounded in compact scope and cost evidence
- Codebase analysis of the confirmed scope before design creation
- One ADR per qualifying decision point found in the current scope, created and reviewed as one batch
- Design Doc creation with technical-designer
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with approval of the Design Doc and its preceding ADR when required. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

ADRs record the considered options and one selected decision. PRDs and Design Docs contain only confirmed requirements and selected conclusions; evaluation-only ideas and unselected design candidates remain in the active workflow context.

Execute the process below within design scope.

## Execution Process

### Step 1: Scope and Cost Evidence

Spawn requirement-analyzer with the original requirements. Treat exact user quotes according to their returned signal type: implementation requirements and exclusions can enter confirmed scope; evaluation requests, speculation, and prescribed mechanisms remain non-binding until the orchestrator resolves them against the user's wording. Treat scope evidence, cost evidence, and questions as material; the orchestrator determines requirements, scale, and ADR routing.

### Step 2: Scope Confirmation
Confirm the requirements and determine Structural Scale from the user's wording and Step 1 scope and cost evidence:
1. Locate a related PRD and read its Converged Outcome, MVP scope, Future / Out of Scope, and open requirement fields. If the related PRD is ambiguous, ask the user to select or provide its path, or confirm none exists, before continuing.
2. When those fields match the current request and returned scope facts, use the PRD path as the current carrier and proceed directly to scope confirmation.
3. When a current carrier is absent, load `requirement-convergence`. The orchestrator builds and judges its record from the user's wording, using Step 1 scope and cost evidence for trade-offs, questions, and routing decisions. Mark an existing but incomplete or scope-mismatched PRD for update; otherwise mark the carrier as absent.
4. Determine Structural Scale and set `prdRequired` when the scale is Large and the current PRD carrier is absent.

Present the design scope to the user:
- Candidate files/modules: `scopeEvidence.affectedFiles` and responsibility boundaries
- Affected layers: `scopeEvidence.affectedLayers`
- Recommended document path: the scale-selected Design Doc, with an ADR batch only when post-confirmation analysis finds a qualifying decision point
- PRD status: whether `prdRequired` is true and whether the convergence carrier is current, requires update, or is absent
- Unknowns/assumptions: Step 1 cost unknowns and decision-changing questions
- Questions before design: scope questions that change the design target or scale, including technical wording whose mandatory/candidate status is outcome-relevant and ambiguous

Ask the user to choose one:
- Proceed with the recommended document path
- Correct the scope and re-run requirement-analyzer
- Answer open questions, then proceed
- Provide an existing PRD path when `prdRequired` is true
- Explicitly approve proceeding without a PRD when `prdRequired` is true and no PRD will be provided

If `prdRequired` is true and the user neither provides a PRD path nor explicitly approves proceeding without a PRD, stop. This recipe does not create PRDs.

**[STOP — BLOCKING]** Wait for user confirmation before proceeding.

After confirmation, record the final scale. When the user's answer changes the analysis target or scope/cost evidence, re-run requirement-analyzer; otherwise update the convergence record directly. Use the current PRD path as carrier when available; otherwise use the compact `convergence` object.

### Step 3: Upstream Confirmation and Codebase Analysis
When Step 2 marked an existing PRD for update, spawn prd-creator in update mode with that PRD path and the confirmed `convergence` object. Review the updated PRD with document-reviewer using its path as `target`, then resolve findings through Review Resolution. After the review permits approval, present the updated PRD for user confirmation. Continue with its path as the carrier after approval.

**[STOP — BLOCKING when a PRD was updated]** Wait for user confirmation of the updated PRD.

When analysis is required under the subagents-orchestration-guide reuse rule, use the Fullstack Codebase Analysis assignment in `subagents-orchestration-guide/references/monorepo-flow.md` for a fullstack scope; otherwise spawn codebase-analyzer: "exploration_mode: [mode from Analysis Assignment]. Analyze the existing codebase to provide compact decision materials for ADR selection, minimal Design Doc creation, and verification. requirement_analysis: [confirmed Step 1 scopeEvidence]. requirements: [confirmed requirements]. prd_path: [current PRD path when present]. target_paths: [confirmed scopeEvidence.affectedFiles]."

Apply the documentation-criteria Choice filter, then the Durability filter, to `decisionMaterials.candidateDecisionPoints`. `adrDecisionPoints` contains every current-scope point that passes both filters; an empty array routes directly to Design Doc. Record `documentTypeRationale` from the retained points.

### Step 4: Design Document Creation
Create documents according to `documentTypeRationale`:
- When `adrDecisionPoints` is non-empty, spawn technical-designer once with `document_to_create: ADRBatch`, `decision_points: [adrDecisionPoints]`, confirmed requirements, and `decision_materials: [only the Step 3 simplification, reuse, invalidation, option/cost, contract, and decision-changing unknown material relevant to those points]`. Review all returned `paths[]` in one document-reviewer invocation using `doc_type: ADRBatch` and `targets: [all paths]`. Apply Review Resolution to the batch, rerun the batch review when an accepted correction changes a file, then present one ADR-batch confirmation request.

**[STOP — BLOCKING when ADRs were created]** Wait for one user confirmation of the reviewed ADR batch before creating the Design Doc.

Record every approved ADR file as `Accepted` when ADRs were created. Spawn technical-designer with `document_to_create: DesignDoc`, `adr_paths: [accepted ADR paths or []]`, the confirmed requirement carrier, and `decision_materials: [only Step 3 material that changes reuse, simplification, implementation validity, a selected ADR decision, a preserved contract, or verification]`. The confirmed requirements define scope, and selected ADR decisions supply the current technical choices, revisable when a smaller sufficient design is supported.

### Step 5: Code Verification

**Review reception:** Unnecessary repairs create lasting work. Before assigning a fix, use Review Resolution to judge no change, removal or narrowing, and reuse first; record why any retained or added mechanism is necessary.
Spawn code-verifier agent: "Verify the Design Doc against the current codebase. document_path: [Design Doc path from Step 4]. doc_type: design-doc."

Apply Review Resolution to every discrepancy before document review, using technical-designer in update mode for selected corrections and its bounded rerun rule. When the `apply` set is empty, carry the resolved verification summary, declines with reasons, and material limitations to Step 6.

### Step 6: Document Review
Spawn document-reviewer agent: "Review the Design Doc for consistency, completeness, and adopted design validity. doc_type: DesignDoc. review_context: creation. target: [Design Doc path]. requirements_verbatim: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 2]. decision_materials: [only Step 3 material that constrains this design]. verification_resolution: [resolved Step 5 evidence]."

Route the result before consistency verification:
- `pass`: continue
- `needs_revision`: apply Review Resolution with the creating technical-designer, then review the updated document
- `rejected`: apply Orchestrator Escalation Resolution. Continue after an evidence-based self-resolution; ask the user only when that procedure reaches a user-decision condition

### Step 7: Consistency Verification
Spawn design-sync agent: "Verify consistency of the design document with other existing design documents and project constraints."

**Note**: design-sync returns `sync_status: "SKIPPED"` when only 1 Design Doc exists. This is distinct from `NO_CONFLICTS` and MUST be reported as such to the user.

Request user confirmation using the shared Design Confirmation alignment.

## Completion Criteria

- [ ] Obtained compact scope and cost evidence while retaining requirement, scale, and ADR decisions in the orchestrator
- [ ] Spawned codebase-analyzer and passed only decision-relevant material into ADR/Design Doc creation
- [ ] Converged the requirement and persisted the record
- [ ] Confirmed the design scope before codebase analysis and document creation
- [ ] Created one ADR per qualifying decision point and reviewed the complete batch once, or routed an empty decision-point set directly to Design Doc
- [ ] Applied Review Resolution to code-verifier discrepancies before document review
- [ ] Spawned document-reviewer and addressed feedback
- [ ] Spawned design-sync for consistency verification for Design Docs
- [ ] Obtained user confirmation for design document
- [ ] All `[Stop: ...]` markers honored with user confirmation

## Output Example
Design phase completed.
- ADR: docs/adr/[document-name].md or N/A
- Design document: docs/design/[document-name].md or N/A
- Continuation: User confirmed continuation
