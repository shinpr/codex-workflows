---
name: recipe-front-design
description: "Execute from codebase-scoped analysis to frontend design document creation including UI Spec."
---

**Context**: Dedicated to the frontend design phase.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` -- document quality standards
2. [LOAD IF NOT ACTIVE] `implementation-approach` -- implementation methodology
3. [LOAD IF NOT ACTIVE] `external-resource-context` -- external resource hearing and lookup
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` -- clear prompts, handoffs, and generated artifacts

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

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
- External resource hearing with external-resource-context
- UI fact gathering with ui-analyzer
- UI Specification creation with ui-spec-designer (prototype code inquiry included)
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer-frontend
- Document review with document-reviewer

**Responsibility Boundary**: This skill completes with frontend design document (UI Spec/ADR/Design Doc) approval. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

## Execution Flow

### Step 1: Scope Bootstrap
Build a lightweight seed for codebase-analyzer. This is a file-location pass only, with no deep reading and no design decisions.

1. Extract candidate keywords from the user requirements: feature names, domain nouns, component names, route names, identifiers, or file-like terms.
2. Search each keyword separately with `rg -l --glob '!**/{node_modules,dist,build,coverage,.git}/**' --glob '!**/*.{lock,min.js,map}' '<keyword>'`. If `rg` is unavailable, use `grep -RIl` with the same exclusions where possible.
3. Bucket matches as `source`, `test`, `docs`, and `generated_or_vendor`. Exclude `generated_or_vendor` from the seed.
4. Rank matches in this order: path or filename match, component/route/hook/API symbol match, source content match, tests for selected source files, docs for selected source files.
5. Collect matched frontend and shared file paths as `affectedFiles`, and keep a one-line `seedRationale` for each file.
6. If the search returns no frontend or shared source files, ask the user which files, modules, routes, or components the design targets. Use the user's answer as `affectedFiles`. If the user confirms no related code exists, confirm whether to proceed with a new-surface design before invoking codebase-analyzer.
7. If the ranked seed has more than 20 files, present the top-ranked candidates and ask the user to narrow the seed before invoking codebase-analyzer.

Construct `requirement_analysis` with:
- `affectedFiles`: the Step 1 seed
- `affectedLayers`: `["frontend"]` plus `shared` when shared files are included
- `scale`: provisional scale from file count (`small` 1-2, `medium` 3-5, `large` 6+)
- `purpose`: the user requirements
- `confidence`: `confirmed` when target files are explicit or the ranked seed is focused; otherwise `provisional`
- `adrRequired`: `true` when the request changes component architecture, state ownership, routing architecture, data flow, external dependencies, or shared cross-boundary contracts; otherwise `false`
- `adrReason`: the specific matched ADR condition, or `null`
- `prdRequired`: `true` when scale is `large` and no existing PRD covers the scope; otherwise `false`
- `scopeDependencies`: questions whose answers can change the target files, scale, UI surface, or document type
- `questions`: user-facing questions needed before design
- `documentTypeRationale`: why ADR, Design Doc, or both are needed from the provisional seed
- `seedRationale`: one-line reason for each file in `affectedFiles`
- `technicalConsiderations`: include any obvious user-stated constraints, risks, and dependencies; use empty lists only when none are stated

### Step 2: Codebase Analysis
Spawn codebase-analyzer agent: "Analyze the existing codebase to provide evidence for frontend Design Doc creation. Focus on existing implementations, state paths, API integrations, and constraints the design should respect. requirement_analysis: [Step 1 requirement_analysis]. requirements: [original user requirements]. layer: frontend. target_paths: [Step 1 affectedFiles]. focus_areas: component hierarchy, state management, UI interactions, data fetching."

### Step 3: Scope Confirmation
After codebase-analyzer returns, present the frontend design scope to the user before UI or design work:
- Target files/modules: `analysisScope.filesAnalyzed` and directly relevant components, routes, or modules
- Affected layers: inferred from `analysisScope.categoriesDetected`, `focusAreas`, and paths
- Recommended document path: ADR, Design Doc, or both, with `documentTypeRationale`, `adrRequired`, and `adrReason`
- PRD status: whether `prdRequired` is true, whether an existing PRD path is available, and what decision is needed before UI/design work
- Unknowns/assumptions: `limitations` and unresolved risks
- Questions before design: scope questions that change the UI surface, design target, or scale

Ask the user to choose one:
- Proceed with the recommended document path
- Correct the scope and re-run codebase-analyzer
- Answer open questions, then proceed
- Provide an existing PRD path when `prdRequired` is true
- Explicitly approve proceeding without a PRD when `prdRequired` is true and no PRD will be provided

If `prdRequired` is true and the user neither provides a PRD path nor explicitly approves proceeding without a PRD, stop. This recipe does not create PRDs.

After confirmation, set the final scale from the confirmed target file count (`small` 1-2, `medium` 3-5, `large` 6+), recompute `adrRequired`, `adrReason`, `prdRequired`, `confidence`, and `documentTypeRationale`, then carry the complete confirmed requirement context into UI and design creation.

ADR-only path: run Steps 1, 2, 3, and 8. Also run Step 4 only when the ADR depends on external frontend resources, and Step 6 only when the ADR depends on existing UI facts beyond Step 2. Skip Steps 5 and 7.

Design Doc path: run Steps 1 through 8.

Both ADR and Design Doc path: run the Design Doc path, creating the ADR before the Design Doc in Step 8.

**[STOP -- BLOCKING]** Wait for user confirmation before proceeding.

### Step 4: External Resource Hearing
For Design Doc output, run this step before UI fact gathering. For ADR-only output, run it only when the ADR depends on external frontend resources.

After scope confirmation, run the frontend domain hearing protocol from `external-resource-context`.

Persist project-level access methods in `docs/project-context/external-resources.md`. When the file already exists, ask whether to keep current axes, refresh all axes, or refresh selected axes.

**[STOP -- BLOCKING]** Complete external resource hearing before UI fact gathering.
Proceed to UI fact gathering after project-level external resources are written or the update is explicitly skipped.

### Step 5: Prototype Inquiry
For Design Doc output only. Skip this step for ADR-only output.

After external resource hearing completes, ask the user about prototype code:

**Ask the user**: "Do you have prototype code for this feature? If so, please provide the path to the code. The prototype will be placed in `docs/ui-spec/assets/` as reference material for the UI Spec."

**[STOP -- BLOCKING]** Wait for user response about prototype code availability.
**CANNOT proceed until user responds.**

### Step 6: UI Fact Gathering Phase
For Design Doc output, run this step before UI Specification creation. For ADR-only output, run it only when the ADR decision depends on existing UI facts beyond the Step 2 codebase analysis.

When Step 5 ran, use the prototype path as an input when one was provided. When Step 5 was skipped, set `prototype_path` to unavailable.

Spawn ui-analyzer agent: "Gather UI facts for frontend design. requirement_analysis: [confirmed requirement context]. requirements: [original user requirements]. target_paths: [confirmed frontend affected files and directories]. target_components: [frontend target components when known]. ui_spec_path: [path if an existing UI Spec covers this feature]. prototype_path: [path if provided]. Read docs/project-context/external-resources.md, resolve relevant UI external resources through declared access methods, and analyze component structure, props patterns, CSS layout, state displays, accessibility, generated artifacts, and candidate write set."

### Step 7: UI Specification Phase
For Design Doc output only. Skip this step for ADR-only output.

After UI fact gathering completes, create the UI Specification:
- Spawn ui-spec-designer agent: "Create UI Spec [from PRD at [path] if PRD exists]. Requirements: [original user requirements]. Confirmed scope: [Step 3 confirmed scope]. Codebase analysis: [JSON from codebase-analyzer]. UI analysis: [JSON from ui-analyzer]. [Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-name}/ | Prototype path unavailable; proceed from PRD/requirements and UI analysis.] Fill External Resources Used from docs/project-context/external-resources.md and feature identifiers."
- Spawn document-reviewer agent: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"

**[STOP -- BLOCKING]** Present UI Spec for user approval.
**CANNOT proceed until user explicitly approves the UI Spec.**

### Step 8: Design Document Creation Phase
Create appropriate design documents according to confirmed scope and scale:
- For ADR: Spawn technical-designer-frontend agent: "document_to_create: ADR. Create ADR for [technical decision]. Requirements: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3, including confirmed scope, confirmed scale, adrRequired, adrReason, prdRequired, PRD path or explicit no-PRD approval when applicable, documentTypeRationale, scopeDependencies, questions, and seedRationale]. Follow `document_to_create` for this invocation; `documentTypeRationale` describes the overall confirmed path. Codebase Analysis: [JSON from codebase-analyzer]. UI Analysis: [JSON from ui-analyzer, only if Step 6 ran]. Present at least two alternatives with trade-offs."
- For Design Doc: Spawn technical-designer-frontend agent: "document_to_create: DesignDoc. Create Design Doc based on requirements. Requirements: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3, including confirmed scope, confirmed scale, adrRequired, adrReason, prdRequired, PRD path or explicit no-PRD approval when applicable, documentTypeRationale, scopeDependencies, questions, and seedRationale]. Follow `document_to_create` for this invocation; `documentTypeRationale` describes the overall confirmed path. Codebase Analysis: [JSON from codebase-analyzer]. UI Analysis: [JSON from ui-analyzer]. UI Spec is at [ui-spec path]. Inherit component structure and state design from UI Spec. Fill External Resources Used from docs/project-context/external-resources.md and feature identifiers. Present at least two alternatives with trade-offs."
  - When both ADR and Design Doc are required, create the ADR first. After the ADR path is available, create the Design Doc with `document_to_create: DesignDoc` and `adr_path: [ADR path]`; the Design Doc must reference the ADR decision.
- For Design Docs only, spawn code-verifier agent: "Verify Design Doc against code. doc_type: design-doc. document_path: [document path]. verbose: false."
- Review each created document:
  - ADR: Spawn document-reviewer agent: "Review the ADR for consistency and completeness. doc_type: ADR. target: [ADR path]. mode: composite. codebase_analysis: [JSON from codebase-analyzer]. ui_analysis: [JSON from ui-analyzer, when available]."
  - Design Doc: Spawn document-reviewer agent: "Review the Design Doc for consistency and completeness. doc_type: DesignDoc. target: [Design Doc path]. mode: composite. codebase_analysis: [JSON from codebase-analyzer]. ui_analysis: [JSON from ui-analyzer]. code_verification: [JSON from code-verifier]."

**[STOP -- BLOCKING]** Present design alternatives and trade-offs, obtain user approval.
**CANNOT proceed until user explicitly approves the design document.**

ENFORCEMENT: Every stop point MUST be respected. Skipping user approval invalidates the entire workflow.

## Completion Criteria

- [ ] Built the Step 1 scope bootstrap seed or obtained target files/modules from the user
- [ ] Codebase analysis completed before UI and design work
- [ ] Confirmed the frontend design scope with the user before UI and design work
- [ ] External resource hearing completed when applicable
- [ ] UI analysis completed before Design Doc creation when applicable
- [ ] UI Specification created and approved for Design Docs
- [ ] All documents required by `documentTypeRationale` created and approved
- [ ] All document reviews passed

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- ADR: docs/adr/[document-name].md or N/A
- Design document: docs/design/[document-name].md or N/A
- Approval status: User approved
