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

**Core Identity**: Coordinate frontend design, perform lightweight workflow operations directly, and invoke specialists for design judgment and review.

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

**Execution Method**:
- Scope bootstrap -> performed by the orchestrator as a file-location pass
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
- Scope bootstrap: locating seed files so codebase-analyzer receives a populated input
- Codebase analysis with codebase-analyzer (entry point of the frontend design phase)
- Scope confirmation with the user, grounded in codebase-analyzer findings
- Focused external resource hearing when a current design decision requires it
- UI fact gathering with ui-analyzer
- UI Specification creation with ui-spec-designer (prototype code inquiry included)
- ADR creation when documentation-criteria identifies a durable technical decision
- Design Doc creation with technical-designer-frontend
- Document review with document-reviewer

**Responsibility Boundary**: This skill completes with approval of the UI Spec, Design Doc, and its preceding ADR when required. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

## Execution Flow

### Step 1: Scope Bootstrap
Build a lightweight seed for codebase-analyzer. This is a file-location pass only, with no deep reading and no design decisions.

1. Extract candidate keywords from the user requirements: feature names, domain nouns, component names, route names, identifiers, or file-like terms.
2. Search each keyword separately with `rg -l --glob '!**/{node_modules,dist,build,coverage,.git}/**' --glob '!**/*.{lock,min.js,map}' '<keyword>'`. If `rg` is unavailable, use `grep -RIl` with the same exclusions where possible.
3. Bucket matches as `source`, `test`, `docs`, and `generated_or_vendor`. Exclude `generated_or_vendor` from the seed.
4. Rank matches in this order: path or filename match, component/route/hook/API symbol match, source content match, tests for selected source files, docs for selected source files.
5. Collect matched frontend and shared file paths as `affectedFiles`, and keep a one-line `seedRationale` for each file.
6. If the search returns no frontend or shared source files, expand once to likely route, component, and shared-state boundaries plus representative siblings. An empty direct-match set is valid for a new surface; pass the relevant boundary evidence to codebase-analyzer. Ask the user only when the requested UI target still cannot be identified from the request and repository.
7. For a broad match set, pass the highest-signal files and their containing responsibility boundaries. File count does not create a user stop.

Construct `requirement_analysis` with:
- `affectedFiles`: the Step 1 seed
- `affectedLayers`: `["frontend"]` plus `shared` when shared files are included
- `scale`: provisional Structural Scale from the apparent outcomes, responsibility boundaries, and durable design decisions; affected paths are supporting evidence
- `purpose`: the user requirements
- `confidence`: `confirmed` when target files are explicit or the ranked seed is focused; otherwise `provisional`
- `adrRequired`: apply the documentation-criteria durable-decision conditions; local component, state, routing, or data-flow changes that follow an accepted design remain in the Design Doc
- `adrReason`: the specific matched ADR condition, or `null`
- `prdRequired`: `true` when scale is `large` and no existing PRD covers the scope; otherwise `false`
- `scopeDependencies`: questions whose answers can change the target files, scale, UI surface, or document type
- `questions`: user-facing questions needed before design
- `documentTypeRationale`: whether the Design Doc requires a preceding ADR and the governing ADR condition
- `seedRationale`: one-line reason for each file in `affectedFiles`
- `technicalConsiderations`: include any obvious user-stated constraints, risks, and dependencies; use empty lists only when none are stated

### Step 2: Codebase Analysis
Spawn codebase-analyzer agent: "Analyze the existing codebase to provide evidence for frontend Design Doc creation. Focus on existing implementations, state paths, API integrations, and constraints the design should respect. requirement_analysis: [Step 1 requirement_analysis]. requirements: [original user requirements]. layer: frontend. target_paths: [Step 1 affectedFiles]. focus_areas: component hierarchy, state management, UI interactions, data fetching."

### Step 3: Scope Confirmation
After codebase-analyzer returns, determine whether the Design Doc also requires an ADR:
1. Locate a related PRD and read its Converged Outcome, MVP scope, Future / Out of Scope, and open requirement fields. If the related PRD is ambiguous, ask the user to select or provide its path, or confirm none exists, before continuing.
2. When those fields match the current request and returned scope facts, use the PRD path as the current carrier and proceed directly to scope confirmation.
3. When no current carrier exists, load `requirement-convergence`, build and judge its record from the request and scope facts, estimate rough cost, and run the hearing on fields below `ready`. Mark an existing but incomplete or scope-mismatched PRD for update; otherwise mark the carrier as absent.

Present the frontend design scope to the user:
- Target files/modules: `analysisScope.filesAnalyzed` and directly relevant components, routes, or modules
- Affected layers: inferred from `analysisScope.categoriesDetected`, `focusAreas`, and paths
- Recommended document path: Design Doc alone or ADR followed by Design Doc, with `documentTypeRationale`, `adrRequired`, and `adrReason`
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

After confirmation, set the final scale from documentation-criteria Structural Scale and recompute `adrRequired`, `adrReason`, `prdRequired`, `confidence`, and `documentTypeRationale`. A current PRD carrier is passed by path. Carry the compact `convergence` object only when a Design Doc has no current PRD carrier.

Run Steps 1 through 8. When an ADR is required, create it before the Design Doc in Step 8.

**[STOP -- BLOCKING]** Wait for user confirmation before proceeding.

After confirmation, when Step 3 marked an existing PRD for update, spawn prd-creator in update mode with that PRD path and the confirmed `convergence` object. Review the updated PRD with document-reviewer using its path as `target`, then resolve findings through Review Resolution. After the review permits approval, present the updated PRD for user approval. Continue with its path as the carrier after approval.

**[STOP -- BLOCKING when a PRD was updated]** Wait for user approval of the updated PRD.

### Step 4: External Resource Hearing
After scope confirmation, identify whether a current UI or verification decision requires evidence unavailable from the repository, supplied artifacts, or a recorded resource. When it does, run the focused hearing from `external-resource-context` for that exact axis and persist its access method. Ask the user only when the missing access method controls the design decision. Otherwise record no external-resource dependency and continue.

### Step 5: Prototype Inquiry
Use prototype code when the user supplied it or the confirmed UI target references it. Ask for a prototype path only when the UI target cannot otherwise be determined and the answer would change the UI specification. In all other cases set `prototype_path` to unavailable and continue.

### Step 6: UI Fact Gathering Phase
Use the prototype path as an input when one was provided; otherwise set `prototype_path` to unavailable.

Spawn ui-analyzer agent: "Gather UI facts for frontend design. requirement_analysis: [confirmed requirement context]. requirements: [original user requirements]. target_paths: [confirmed frontend affected files and directories]. target_components: [frontend target components when known]. ui_spec_path: [path if an existing UI Spec covers this feature]. prototype_path: [path if provided]. externalResourceRefs: [{label, featureIdentifier} selected in Step 4, or []]. Analyze component structure, props patterns, CSS layout, sourced state displays, accessibility, generated artifacts, and candidate write set."

### Step 7: UI Specification Phase
After UI fact gathering completes, create the UI Specification:
- Spawn ui-spec-designer agent: "Create UI Spec [from PRD at [path] if PRD exists; read its binding requirements and only Product Context entries they explicitly cite]. Requirements: [original user requirements]. Confirmed scope and convergence exclusions: [Step 3 confirmed scope, nonGoals, and speculative requirements]. Codebase analysis: [JSON from codebase-analyzer]. UI analysis: [JSON from ui-analyzer]. [Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-name}/ | Prototype path unavailable; proceed from PRD/requirements and UI analysis.] External resource refs: [ui_analysis.externalResources.selectedRefs]."
- Spawn document-reviewer agent: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"
- Resolve `approved_with_conditions` or `needs_revision` through Review Resolution with ui-spec-designer, then review the updated UI Spec. Route governing-source contradictions through Orchestrator Escalation Resolution before the user approval stop.

**[STOP -- BLOCKING]** Present UI Spec for user approval.
**CANNOT proceed until user explicitly approves the UI Spec.**

### Step 8: Design Document Creation Phase
Create appropriate design documents according to confirmed scope and scale:
- When ADR is required: Spawn technical-designer-frontend agent: "document_to_create: ADR. Create ADR for [technical decision]. Requirements: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3, including confirmed scope, confirmed scale, adrRequired, adrReason, prdRequired, PRD path or explicit no-PRD approval when applicable, documentTypeRationale, scopeDependencies, questions, and seedRationale]. Follow `document_to_create` for this invocation; `documentTypeRationale` describes the overall confirmed path. Codebase Analysis: [JSON from codebase-analyzer]. UI Analysis: [JSON from ui-analyzer]. Present credible alternatives with trade-offs." Review the created ADR with document-reviewer using `doc_type: ADR`, `target: [ADR path]`, `mode: composite`, and the codebase and UI analysis outputs. Resolve findings through Review Resolution, then present it for user approval and record its status as `Accepted`.

  **[STOP -- BLOCKING when an ADR was created]** Wait for user approval of the ADR before creating the Design Doc.

- For Design Doc: Spawn technical-designer-frontend agent: "document_to_create: DesignDoc. Create Design Doc based on requirements. requirements_verbatim: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3, including the current PRD carrier path or convergence when no carrier exists, confirmed scope, user answers, confirmed scale, adrRequired, adrReason, prdRequired, explicit no-PRD approval when applicable, documentTypeRationale, scopeDependencies, questions, and seedRationale]. Follow `document_to_create` for this invocation; `documentTypeRationale` describes the overall confirmed path. Codebase Analysis: [JSON from codebase-analyzer]. UI Analysis: [JSON from ui-analyzer]. UI Spec is at [ui-spec path]. Inherit component structure and state design from UI Spec. External resource refs: [ui_analysis.externalResources.selectedRefs]. Record Direct MVP, failed current constraints or Material Risks, necessary additions, and subtraction evidence. Record only larger alternatives actually considered; `None` is valid."
  - When an ADR is required, create the Design Doc with `document_to_create: DesignDoc` and `adr_path: [accepted ADR path]`; the Design Doc must reference the accepted ADR decision.
- Spawn code-verifier agent: "Verify Design Doc against code. doc_type: design-doc. document_path: [document path]. verbose: false."
- Review the Design Doc: Spawn document-reviewer agent: "Review the Design Doc for consistency, completeness, and adopted design validity. doc_type: DesignDoc. review_context: creation. target: [Design Doc path]. mode: composite. requirements_verbatim: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3]. codebase_analysis: [JSON from codebase-analyzer]. ui_analysis: [JSON from ui-analyzer]. code_verification: [JSON from code-verifier]."
- Resolve `approved_with_conditions` or `needs_revision` through Review Resolution with technical-designer-frontend, then review the updated Design Doc. Route governing-source contradictions through Orchestrator Escalation Resolution. Reach the user approval stop after review succeeds.

**[STOP -- BLOCKING]** Present the Design Doc and its recorded trade-offs, then obtain user approval.
**CANNOT proceed until user explicitly approves the design document.**

ENFORCEMENT: Every stop point MUST be respected. Skipping user approval invalidates the entire workflow.

## Completion Criteria

- [ ] Built the Step 1 scope bootstrap seed or obtained target files/modules from the user
- [ ] Codebase analysis completed before UI and design work
- [ ] Converged the requirement and carried exclusions into UI/design creation
- [ ] Confirmed the frontend design scope with the user before UI and design work
- [ ] External resource hearing completed when applicable
- [ ] UI analysis completed before Design Doc creation when applicable
- [ ] UI Specification created and approved
- [ ] All documents required by `documentTypeRationale` created and approved
- [ ] All document reviews passed

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- ADR: docs/adr/[document-name].md or N/A
- Design document: docs/design/[document-name].md or N/A
- Approval status: User approved
