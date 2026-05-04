---
name: recipe-front-design
description: "Execute from requirement analysis to frontend design document creation including UI Spec."
---

**Context**: Dedicated to the frontend design phase.

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` -- document quality standards
2. [LOAD IF NOT ACTIVE] `implementation-approach` -- implementation methodology
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` -- agent coordination and workflow flows
4. [LOAD IF NOT ACTIVE] `external-resource-context` -- external resource hearing and lookup

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Method**:
- Requirement analysis -> performed by requirement-analyzer
- Codebase analysis -> performed by codebase-analyzer and ui-analyzer
- UI Specification creation -> performed by ui-spec-designer
- Design document creation -> performed by technical-designer-frontend
- Design verification -> performed by code-verifier
- Document review -> performed by document-reviewer

Orchestrator spawns agents and passes structured data between them.

## Scope Boundaries

**Included in this skill**:
- Requirement analysis with requirement-analyzer
- External resource hearing with external-resource-context
- UI fact gathering with ui-analyzer alongside codebase-analyzer
- UI Specification creation with ui-spec-designer (prototype code inquiry included)
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer-frontend
- Document review with document-reviewer

**Responsibility Boundary**: This skill completes with frontend design document (UI Spec/ADR/Design Doc) approval. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

## Execution Flow

### Step 1: Requirement Analysis Phase
Considering the deep impact on design, first engage in dialogue to understand the background and purpose of requirements:
- What problems do you want to solve?
- Expected outcomes and success criteria
- Relationship with existing systems

Once requirements are moderately clarified:
- Spawn requirement-analyzer agent: "Requirements: [user requirements] Execute requirement analysis and scale determination"

**[STOP -- BLOCKING]** Review requirement analysis results and address question items.
**CANNOT proceed until user explicitly confirms the requirement analysis.**

### Step 2: External Resource Hearing
After requirement analysis approval, run the frontend domain hearing protocol from `external-resource-context`.

Persist project-level access methods in `docs/project-context/external-resources.md`. When the file already exists, ask whether to keep current axes, refresh all axes, or refresh selected axes.

**[STOP -- BLOCKING]** Complete external resource hearing before UI fact gathering.
Proceed to UI fact gathering after project-level external resources are written or the update is explicitly skipped.

### Step 3: Prototype Inquiry
After external resource hearing completes, ask the user about prototype code:

**Ask the user**: "Do you have prototype code for this feature? If so, please provide the path to the code. The prototype will be placed in `docs/ui-spec/assets/` as reference material for the UI Spec."

**[STOP -- BLOCKING]** Wait for user response about prototype code availability.
**CANNOT proceed until user responds.**

### Step 4: UI Fact Gathering Phase
After prototype inquiry completes, use the prototype path as an input when one was provided.

Spawn codebase-analyzer and ui-analyzer in parallel:
- Spawn codebase-analyzer agent: "Analyze the existing codebase to provide evidence for frontend Design Doc creation. Focus on existing implementations, state paths, API integrations, and constraints the design should respect. requirement_analysis: [JSON from requirement-analyzer]. requirements: [original user requirements]. layer: frontend. target_paths: [frontend affected files and directories from requirement-analyzer]. focus_areas: component hierarchy, state management, UI interactions, data fetching."
- Spawn ui-analyzer agent: "Gather UI facts for frontend design. requirement_analysis: [JSON from requirement-analyzer]. requirements: [original user requirements]. target_paths: [frontend affected files and directories from requirement-analyzer]. target_components: [frontend target components when known]. ui_spec_path: [path if an existing UI Spec covers this feature]. prototype_path: [path if provided]. Read docs/project-context/external-resources.md, resolve relevant UI external resources through declared access methods, and analyze component structure, props patterns, CSS layout, state displays, accessibility, generated artifacts, and candidate write set."

### Step 5: UI Specification Phase
After UI fact gathering completes, create the UI Specification:
- Spawn ui-spec-designer agent: "Create UI Spec [from PRD at [path] if PRD exists]. UI analysis: [JSON from ui-analyzer]. [Prototype code is at [user-provided path]. Place prototype in docs/ui-spec/assets/{feature-name}/ | Prototype path unavailable; proceed from PRD/requirements and UI analysis.] Fill External Resources Used from docs/project-context/external-resources.md and feature identifiers."
- Spawn document-reviewer agent: "doc_type: UISpec target: [ui-spec path] Review for consistency and completeness"

**[STOP -- BLOCKING]** Present UI Spec for user approval.
**CANNOT proceed until user explicitly approves the UI Spec.**

### Step 6: Design Document Creation Phase
Create appropriate design documents according to scale determination:
- For ADR: Spawn technical-designer-frontend agent: "Create ADR for [technical decision]"
- For Design Doc: Spawn technical-designer-frontend agent: "Create Design Doc based on requirements. Codebase Analysis: [JSON from codebase-analyzer]. UI Analysis: [JSON from ui-analyzer]. UI Spec is at [ui-spec path]. Inherit component structure and state design from UI Spec. Fill External Resources Used from docs/project-context/external-resources.md and feature identifiers."
- Spawn code-verifier agent: "Verify Design Doc against code. doc_type: design-doc. document_path: [document path]. verbose: false."
- Spawn document-reviewer agent: "Review the Design Doc for consistency and completeness. doc_type: DesignDoc. target: [document path]. mode: composite. code_verification: [JSON from code-verifier]"

**[STOP -- BLOCKING]** Present design alternatives and trade-offs, obtain user approval.
**CANNOT proceed until user explicitly approves the design document.**

ENFORCEMENT: Every stop point MUST be respected. Skipping user approval invalidates the entire workflow.

## Completion Criteria

- [ ] Requirement analysis completed and approved
- [ ] External resource hearing completed
- [ ] Codebase analysis and UI analysis completed before document creation
- [ ] UI Specification created and approved
- [ ] Design document created and approved
- [ ] All document reviews passed

## Output Example
Frontend design phase completed.
- UI Specification: docs/ui-spec/[feature-name]-ui-spec.md
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
