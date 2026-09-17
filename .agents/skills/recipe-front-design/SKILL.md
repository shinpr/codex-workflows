---
name: recipe-front-design
description: "Execute from codebase-scoped analysis to frontend design document creation including UI Spec."
---

**Context**: Dedicated to the frontend design phase.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` -- document quality standards
2. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and review resolution
3. [LOAD IF NOT ACTIVE] `requirement-convergence` -- requirements hearing and scope-confirmation output
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` -- document and review handoffs

Load `external-resource-context` in Step 4 only when a named external source is required for the current design or verification decision.

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

## Orchestrator Definition

**Core Identity**: Coordinate frontend design, make workflow decisions from compact specialist materials, and invoke specialists for analysis, authoring, and review.

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

**Execution Method**:
- Scope and cost evidence -> performed by requirement-analyzer
- Scope confirmation -> performed by the orchestrator with user confirmation
- Codebase analysis -> performed by codebase-analyzer against the confirmed scope
- UI fact gathering -> performed by ui-analyzer
- UI Specification creation -> performed by ui-spec-designer
- Design document creation -> performed by technical-designer-frontend
- Design Doc verification -> performed by code-verifier
- Document review -> performed by document-reviewer

Orchestrator spawns agents and passes structured data between them.

## Scope Boundaries

**Included in this skill**:
- Compact scope and cost evidence from requirement-analyzer; the user owns product requirements and exclusions, while the orchestrator owns evidence comparison, readiness, scale, and document routing
- Scope confirmation with the user, grounded in compact scope and cost evidence
- Codebase analysis of the confirmed frontend scope
- Focused external resource hearing when a current design decision requires it
- UI fact gathering with ui-analyzer
- UI Specification creation with ui-spec-designer (prototype code inquiry included)
- One ADR per qualifying decision point found in the current scope, created and reviewed as one batch
- Design Doc creation with technical-designer-frontend
- Document review with document-reviewer

**Responsibility Boundary**: This skill completes with approval of the UI Spec, Design Doc, and its preceding ADR when required. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

## Execution Flow

### Step 1: Scope and Cost Evidence

Apply the subagents-orchestration-guide Requirement Evidence Handoff, then spawn requirement-analyzer with that minimum contract. Step 1 completes when the evidence result returns.

### Step 2: Scope Confirmation
Confirm requirements and determine Structural Scale from the user's wording and Step 1 scope and cost evidence:
1. Compare the retained user wording with the returned evidence. Matching facts are evidenced impact. Present additional UI or functional responsibilities with their current treatment and observable consequence for user judgment, and present repository mismatches that affect the requested outcome. User selection establishes product requirements and exclusions.
2. Locate a related PRD and read its Converged Outcome, MVP scope, Future / Out of Scope, and open requirement fields. If the related PRD is ambiguous, ask the user to select or provide its path, or confirm none exists, before continuing.
3. When those fields match the current request and returned scope facts, use the PRD path as the current carrier and proceed directly to scope confirmation.
4. When a current carrier is absent, build the `requirement-convergence` record from the user's wording and judge readiness, using Step 1 scope and cost evidence for trade-offs, questions, and routing decisions. Mark an existing but incomplete or scope-mismatched PRD for update; otherwise mark the carrier as absent.
5. Determine Structural Scale and set `prdRequired` when the scale is Large and the current PRD carrier is absent.

Immediately before the stop, read `requirement-convergence`'s `references/scope-confirmation.md` and render that output from the retained user wording and Step 1 evidence. Render each unanswered product, UX, or operational decision under **User decisions** as an unresolved question followed by its answer-dependent effects. Only an explicit user selection moves it into **Confirmed scope**. Record Structural Scale and document routing under **Workflow**.

Request the listed user decisions and any separate document-route authorization still required, including a PRD path or approval to proceed without one when `prdRequired` is true. Re-run requirement-analyzer only when the user's answer changes its analysis target or scope/cost evidence.

If `prdRequired` is true and the user neither provides a PRD path nor explicitly approves proceeding without a PRD, stop. This recipe does not create PRDs.

**[STOP -- BLOCKING]** Wait for user confirmation before proceeding.

After confirmation, record the final scale. When the user's answer changes the analysis target or scope/cost evidence, re-run requirement-analyzer; otherwise update the convergence record directly. The Choice and Durability filters supply ADR decision points independently of scale. Use the current PRD path as carrier when available; otherwise use the compact `convergence` object.

### Step 3: Upstream Confirmation and Codebase Analysis
When Step 2 marked an existing PRD for update, spawn prd-creator in update mode with that PRD path and the confirmed `convergence` object. Review the updated PRD with document-reviewer using its path as `target`, then resolve findings through Review Resolution. After the review permits approval, present the updated PRD for user confirmation. Continue with its path as the carrier after approval.

**[STOP -- BLOCKING when a PRD was updated]** Wait for user confirmation of the updated PRD.

When analysis is required under the subagents-orchestration-guide reuse rule, spawn codebase-analyzer for the confirmed frontend scope: "exploration_mode: [mode from Analysis Assignment]. Analyze the existing codebase to provide compact decision materials for ADR selection, minimal Design Doc creation, and verification. requirement_analysis: [confirmed Step 1 scopeEvidence]. requirements: [confirmed requirements]. prd_path: [current PRD path when present]. layer: frontend. target_paths: [confirmed scopeEvidence.affectedFiles]. focus_areas: responsibility ownership, state/data paths, contracts, and reuse."

### Step 4: External Resource Hearing
After scope confirmation, identify whether a current UI or verification decision requires evidence unavailable from the repository, supplied artifacts, or a recorded resource. When it does, run the focused hearing from `external-resource-context` for that exact axis and persist its access method. Ask the user only when the missing access method controls the design decision. Otherwise record no external-resource dependency and continue.

### Step 5: Prototype Inquiry
Use prototype code when the user supplied it or the confirmed UI target references it. Ask for a prototype path only when the UI target cannot otherwise be determined and the answer would change the UI specification. In all other cases set `prototype_path` to unavailable and continue.

When `prototype_path` is available, apply the subagents-orchestration-guide UI Spec rule to resolve `prototype_reference_strength`. Omit the field when no prototype is available.

### Step 6: UI Fact Gathering Phase
Use the prototype path as an input when one was provided; otherwise set `prototype_path` to unavailable.

Spawn ui-analyzer agent: "exploration_mode: [mode from Analysis Assignment]. prior_evidence: [relevant Step 3 findings]. Gather UI facts for frontend design. requirement_analysis: { affectedFiles: [confirmed frontend affected files] }. requirements: [Step 2 confirmed current requirements]. target_paths: [confirmed frontend affected files and directories]. target_components: [frontend target components when known]. ui_spec_path: [path if an existing UI Spec covers this feature]. prototype_path: [path if provided]. externalResourceRefs: [{label, featureIdentifier} selected in Step 4, or []]. focus_areas: [remaining rendering, interaction, and visual questions]."

### Step 7: UI Specification Phase

**Review reception:** Unnecessary repairs create lasting work. Before assigning a fix, use Review Resolution to judge no change, removal or narrowing, and reuse first; record why any retained or added mechanism is necessary.
After UI fact gathering completes, create the UI Specification:
- Spawn ui-spec-designer agent: "Create UI Spec [from PRD at [path] if PRD exists; read its binding requirements and only Product Context entries they explicitly cite]. Confirmed requirements and exclusions: [Step 2 current requirements and nonGoals]. Codebase analysis: [JSON from codebase-analyzer]. UI analysis: [JSON from ui-analyzer]. [Prototype code is at [user-provided path]. Prototype reference strength: [binding | reference]. Place prototype in docs/ui-spec/assets/{feature-name}/ | Prototype path unavailable; proceed from PRD/requirements and UI analysis.] External resource refs: [ui_analysis.externalResources.selectedRefs]."
- Spawn document-reviewer agent: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"
- Resolve `needs_revision` through Review Resolution with ui-spec-designer, then review the updated UI Spec. Route governing-source contradictions through Orchestrator Escalation Resolution before the user confirmation stop.

**[STOP -- BLOCKING]** Present UI Spec for user confirmation.
Proceed after the user explicitly confirms the UI Spec.

### Step 8: Design Document Creation Phase
Create appropriate design documents from confirmed scope and decision materials:
- Start with codebase analysis `candidateDecisionPoints`, then add a technical choice from UI analysis or the approved UI Spec when its evidence establishes at least two credible materially distinct options. Apply the Choice filter, then the Durability filter, to the complete candidate set.
- When the retained array is non-empty, spawn technical-designer-frontend once with `document_to_create: ADRBatch`, `decision_points: [retained array]`, confirmed requirements, and `decision_materials: [only analysis material that changes the options, lifecycle cost, maintainability, or validity of those points]`. Review all returned `paths[]` in one document-reviewer invocation using `doc_type: ADRBatch` and `targets: [all paths]`. Apply Review Resolution to the batch, rerun the batch review when an accepted correction changes a file, then present one ADR-batch confirmation request.

  **[STOP -- BLOCKING when ADRs were created]** Wait for one user confirmation of the reviewed ADR batch before creating the Design Doc.

- Record every approved ADR file as `Accepted` when ADRs were created. For Design Doc, spawn technical-designer-frontend with `document_to_create: DesignDoc`, `adr_paths: [accepted ADR paths or []]`, confirmed requirements, approved UI Spec, and `decision_materials: [only analysis material that changes reuse, simplification, implementation validity, a selected ADR decision, a preserved contract, or verification]`. The confirmed requirements define scope, and selected ADR decisions supply the current technical choices, revisable when a smaller sufficient design is supported.
- Spawn code-verifier agent: "Verify Design Doc against code. doc_type: design-doc. document_path: [document path]."
- Apply Review Resolution to every code-verifier discrepancy, using technical-designer-frontend in update mode for selected corrections and its bounded rerun rule. Carry the resolved verification summary, declines with reasons, and material limitations after the `apply` set becomes empty.
- Review the Design Doc: Spawn document-reviewer agent: "Review the Design Doc for consistency, completeness, and adopted design validity. doc_type: DesignDoc. review_context: creation. target: [Design Doc path]. requirements_verbatim: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 2]. decision_materials: [only analysis material that constrains this design]. verification_resolution: [resolved code-verifier evidence]."
- Resolve `needs_revision` through Review Resolution with technical-designer-frontend, then review the updated Design Doc. Route governing-source contradictions through Orchestrator Escalation Resolution. Reach the user confirmation stop after review succeeds.

**[STOP -- BLOCKING]** Obtain user confirmation using the shared Design Confirmation alignment.
Proceed after the user explicitly confirms the design document.

## Completion Criteria

- [ ] Obtained compact scope and cost evidence while the user retained product requirements and exclusions and the orchestrator handled comparison, readiness, scale, and routing
- [ ] Codebase analysis completed before UI and design work
- [ ] Converged the requirement and carried exclusions into UI/design creation
- [ ] Confirmed the frontend design scope before codebase, UI, and design work
- [ ] External resource hearing completed when applicable
- [ ] UI analysis completed before Design Doc creation when applicable
- [ ] UI Specification reviewed and confirmed
- [ ] One ADR was created per qualifying decision point and the complete batch was reviewed once, or the empty set routed directly to Design Doc
- [ ] All document reviews passed

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- ADRs: docs/adr/[document-name].md paths or N/A
- Design document: docs/design/[document-name].md or N/A
- Continuation: User confirmed continuation
