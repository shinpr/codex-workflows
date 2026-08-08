---
name: recipe-front-design
description: "Execute from codebase-scoped analysis to frontend design document creation including UI Spec."
---

**Context**: Dedicated to the frontend design phase.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` -- document quality standards
2. [LOAD IF NOT ACTIVE] `implementation-approach` -- design convergence and verification strategy
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and review resolution
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` -- document and review handoffs

Load `external-resource-context` in Step 4 only when a named external source is required for the current design or verification decision.

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

## Orchestrator Definition

**Core Identity**: Coordinate frontend design, make workflow decisions from compact specialist materials, and invoke specialists for analysis, authoring, and review.

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

**Execution Method**:
- Scope and cost evidence -> performed by requirement-analyzer
- Codebase analysis -> performed by codebase-analyzer
- Scope confirmation -> performed by the orchestrator with user confirmation
- UI fact gathering -> performed by ui-analyzer
- UI Specification creation -> performed by ui-spec-designer
- Design document creation -> performed by technical-designer-frontend
- Design Doc verification -> performed by code-verifier
- Document review -> performed by document-reviewer

Orchestrator spawns agents and passes structured data between them.

## Scope Boundaries

**Included in this skill**:
- Compact scope and cost evidence from requirement-analyzer; the orchestrator owns requirement, scale, UI scope, and ADR decisions
- Codebase analysis with codebase-analyzer (entry point of the frontend design phase)
- Scope confirmation with the user, grounded in codebase-analyzer findings
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

Spawn requirement-analyzer with the original requirements. Treat its request signals, scope evidence, cost evidence, and questions as material; the orchestrator determines requirements, scale, UI scope, and ADR routing.

### Step 2: Codebase Analysis
Spawn codebase-analyzer agent: "Analyze the existing codebase to provide compact decision materials for frontend requirement confirmation, ADR selection, minimal Design Doc creation, and verification. requirement_analysis: [Step 1 scopeEvidence]. requirements: [original user requirements]. layer: frontend. target_paths: [Step 1 scopeEvidence.affectedFiles]. focus_areas: component hierarchy, state management, UI interactions, data fetching."

### Step 3: Scope Confirmation
After codebase-analyzer returns, confirm requirements, determine Structural Scale, and collect candidate ADR decision points:
1. Locate a related PRD and read its Converged Outcome, MVP scope, Future / Out of Scope, and open requirement fields. If the related PRD is ambiguous, ask the user to select or provide its path, or confirm none exists, before continuing.
2. When those fields match the current request and returned scope facts, use the PRD path as the current carrier and proceed directly to scope confirmation.
3. When a current carrier is absent, load `requirement-convergence`. The orchestrator builds and judges its record from the user's wording, using Step 1 scope/cost evidence and Step 2 analysis for trade-offs, questions, and routing decisions. Mark an existing but incomplete or scope-mismatched PRD for update; otherwise mark the carrier as absent.
4. Retain Step 2 `decisionMaterials.candidateDecisionPoints` within confirmed scope. Final ADR qualification occurs after UI analysis and UI Spec evidence are available.
5. Determine Structural Scale and set `prdRequired` when the scale is Large and the current PRD carrier is absent.

Present the frontend design scope to the user:
- Target files/modules: `analysisScope.filesAnalyzed` and directly relevant components, routes, or modules
- Affected layers: `analysisScope.affectedLayers`
- Recommended document path: UI Spec and Design Doc, plus a conditional ADR batch for listed candidate decision points that later pass both ADR filters
- PRD status: whether `prdRequired` is true and whether the convergence carrier is current, requires update, or is absent
- Unknowns/assumptions: `limitations` and unresolved risks
- Questions before design: scope questions that change the UI surface, design target, or scale, including technical wording whose mandatory/candidate status is outcome-relevant and ambiguous

Ask the user to choose one:
- Proceed with the recommended document path
- Correct the scope and re-run codebase-analyzer
- Answer open questions, then proceed
- Provide an existing PRD path when `prdRequired` is true
- Explicitly approve proceeding without a PRD when `prdRequired` is true and no PRD will be provided

If `prdRequired` is true and the user neither provides a PRD path nor explicitly approves proceeding without a PRD, stop. This recipe does not create PRDs.

**[STOP -- BLOCKING]** Wait for user confirmation before proceeding.

After confirmation, record the final scale and carry the candidate decision points forward for final filtering after UI analysis. When the user's answer changes the scope or PRD carrier, recompute the affected values before proceeding. The Choice and Durability filters supply ADR decision points independently of scale. Use the current PRD path as carrier when available; otherwise use the compact `convergence` object.

After confirmation, when Step 3 marked an existing PRD for update, spawn prd-creator in update mode with that PRD path and the confirmed `convergence` object. Review the updated PRD with document-reviewer using its path as `target`, then resolve findings through Review Resolution. After the review permits approval, present the updated PRD for user approval. Continue with its path as the carrier after approval.

**[STOP -- BLOCKING when a PRD was updated]** Wait for user approval of the updated PRD.

### Step 4: External Resource Hearing
After scope confirmation, identify whether a current UI or verification decision requires evidence unavailable from the repository, supplied artifacts, or a recorded resource. When it does, run the focused hearing from `external-resource-context` for that exact axis and persist its access method. Ask the user only when the missing access method controls the design decision. Otherwise record no external-resource dependency and continue.

### Step 5: Prototype Inquiry
Use prototype code when the user supplied it or the confirmed UI target references it. Ask for a prototype path only when the UI target cannot otherwise be determined and the answer would change the UI specification. In all other cases set `prototype_path` to unavailable and continue.

### Step 6: UI Fact Gathering Phase
Use the prototype path as an input when one was provided; otherwise set `prototype_path` to unavailable.

Spawn ui-analyzer agent: "Gather UI facts for frontend design. requirement_analysis: { affectedFiles: [confirmed frontend affected files] }. requirements: [original user requirements]. target_paths: [confirmed frontend affected files and directories]. target_components: [frontend target components when known]. ui_spec_path: [path if an existing UI Spec covers this feature]. prototype_path: [path if provided]. externalResourceRefs: [{label, featureIdentifier} selected in Step 4, or []]. Analyze component structure, props patterns, CSS layout, sourced state displays, accessibility, generated artifacts, and candidate write set."

### Step 7: UI Specification Phase
After UI fact gathering completes, create the UI Specification:
- Spawn ui-spec-designer agent: "Create UI Spec [from PRD at [path] if PRD exists; read its binding requirements and only Product Context entries they explicitly cite]. Requirements: [original user requirements]. Confirmed scope and convergence exclusions: [Step 3 confirmed scope, nonGoals, and speculative requirements]. Codebase analysis: [JSON from codebase-analyzer]. UI analysis: [JSON from ui-analyzer]. [Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-name}/ | Prototype path unavailable; proceed from PRD/requirements and UI analysis.] External resource refs: [ui_analysis.externalResources.selectedRefs]."
- Spawn document-reviewer agent: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"
- Resolve `approved_with_conditions` or `needs_revision` through Review Resolution with ui-spec-designer, then review the updated UI Spec. Route governing-source contradictions through Orchestrator Escalation Resolution before the user approval stop.

**[STOP -- BLOCKING]** Present UI Spec for user approval.
**CANNOT proceed until user explicitly approves the UI Spec.**

### Step 8: Design Document Creation Phase
Create appropriate design documents from confirmed scope and decision materials:
- Start with codebase analysis `candidateDecisionPoints`, then add a technical choice from UI analysis or the approved UI Spec when its evidence establishes at least two credible materially distinct options. Apply the Choice filter, then the Durability filter, to the complete candidate set.
- When the retained array is non-empty, spawn technical-designer-frontend once with `document_to_create: ADRBatch`, `decision_points: [retained array]`, confirmed requirements, and `decision_materials: [only analysis material that changes the options, lifecycle cost, maintainability, or validity of those points]`. Review all returned `paths[]` in one document-reviewer invocation using `doc_type: ADRBatch` and `targets: [all paths]`. Apply Review Resolution to the batch, rerun the batch review when an accepted correction changes a file, then present one ADR-batch approval request.

  **[STOP -- BLOCKING when ADRs were created]** Wait for one user approval of the reviewed ADR batch before creating the Design Doc.

- Record every approved ADR file as `Accepted` when ADRs were created. For Design Doc, spawn technical-designer-frontend with `document_to_create: DesignDoc`, `adr_paths: [accepted ADR paths or []]`, confirmed requirements, approved UI Spec, and `decision_materials: [only analysis material that changes reuse, implementation validity, a selected ADR decision, a preserved contract, or verification]`. The confirmed requirements define scope, and selected ADR decisions constrain their relevant technical questions.
- Spawn code-verifier agent: "Verify Design Doc against code. doc_type: design-doc. document_path: [document path]. verbose: false."
- Apply Review Resolution to every code-verifier discrepancy. Pass only the `apply` discrepancies to technical-designer-frontend in update mode, rerun code-verifier, and carry the resolved verification summary, declines with reasons, and material limitations after the `apply` set becomes empty.
- Review the Design Doc: Spawn document-reviewer agent: "Review the Design Doc for consistency, completeness, and adopted design validity. doc_type: DesignDoc. review_context: creation. target: [Design Doc path]. requirements_verbatim: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3]. decision_materials: [only analysis material that constrains this design]. verification_resolution: [resolved code-verifier evidence]."
- Resolve `approved_with_conditions` or `needs_revision` through Review Resolution with technical-designer-frontend, then review the updated Design Doc. Route governing-source contradictions through Orchestrator Escalation Resolution. Reach the user approval stop after review succeeds.

**[STOP -- BLOCKING]** Present the Design Doc and its recorded trade-offs, then obtain user approval.
**CANNOT proceed until user explicitly approves the design document.**

ENFORCEMENT: Every stop point MUST be respected. Skipping user approval invalidates the entire workflow.

## Completion Criteria

- [ ] Obtained compact scope and cost evidence while retaining requirement, scale, UI scope, and ADR decisions in the orchestrator
- [ ] Codebase analysis completed before UI and design work
- [ ] Converged the requirement and carried exclusions into UI/design creation
- [ ] Confirmed the frontend design scope with the user before UI and design work
- [ ] External resource hearing completed when applicable
- [ ] UI analysis completed before Design Doc creation when applicable
- [ ] UI Specification created and approved
- [ ] One ADR was created per qualifying decision point and the complete batch was reviewed once, or the empty set routed directly to Design Doc
- [ ] All document reviews passed

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- ADRs: docs/adr/[document-name].md paths or N/A
- Design document: docs/design/[document-name].md or N/A
- Approval status: User approved
