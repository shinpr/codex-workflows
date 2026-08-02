# Fullstack (Monorepo) Flow

This reference defines the orchestration flow for projects spanning multiple layers (backend + frontend). It extends the standard orchestration guide without modifying it.

## When This Flow Applies

- Multiple Design Docs exist targeting different layers (backend, frontend)
- A single feature requires implementation across both backend and frontend
- The orchestrator is invoked for fullstack implementation

## Design Phase

### Large Structural Scale Fullstack - 16 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer + orchestrator | Requirement analysis, convergence hearing, and scale determination **[Stop]** | Converged requirements + scale |
| 2 | prd-creator | PRD covering entire feature (all layers) | Single PRD |
| 3 | document-reviewer | PRD review **[Stop]** | Approval |
| 4 | (orchestrator) | Resolve a required external evidence axis when repository and supplied context cannot decide it | `externalResourceRefs` or `[]` |
| 5 | (orchestrator) | Resolve prototype input only when the UI target cannot otherwise be determined | Prototype path or none |
| 6 | codebase-analyzer x2 + ui-analyzer x1 | Per-layer codebase analysis plus frontend UI analysis | Analysis JSON |
| 7 | ui-spec-designer | UI Spec from PRD + UI analysis + optional prototype | UI Spec |
| 8 | document-reviewer | UI Spec review **[Stop]** | Approval |
| 9 | technical-designer | **Backend** Design Doc | Backend Design Doc |
| 10 | technical-designer-frontend | **Frontend** Design Doc (references backend Integration Points + UI Spec + UI analysis) | Frontend Design Doc |
| 11 | code-verifier x2 | Verify each Design Doc against code | Verification JSON |
| 12 | document-reviewer x2 | Review each Design Doc with verification evidence | Reviews |
| 13 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 14 | acceptance-test-generator | Integration/E2E test skeleton from cross-layer contracts | Test skeletons |
| 15 | work-planner | Work plan from all Design Docs | Work plan |
| 16 | document-reviewer | WorkPlan review **[Stop: Batch approval]** | Approval |

### Medium Structural Scale Fullstack - 14 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer + orchestrator | Requirement analysis, convergence hearing, and scale determination **[Stop]** | Converged requirements + scale |
| 2 | (orchestrator) | Resolve a required external evidence axis when repository and supplied context cannot decide it | `externalResourceRefs` or `[]` |
| 3 | (orchestrator) | Resolve prototype input only when the UI target cannot otherwise be determined | Prototype path or none |
| 4 | codebase-analyzer x2 + ui-analyzer x1 | Per-layer codebase analysis plus frontend UI analysis | Analysis JSON |
| 5 | ui-spec-designer | UI Spec from requirements + UI analysis + optional prototype | UI Spec |
| 6 | document-reviewer | UI Spec review **[Stop]** | Approval |
| 7 | technical-designer | **Backend** Design Doc | Backend Design Doc |
| 8 | technical-designer-frontend | **Frontend** Design Doc (references backend Integration Points + UI Spec + UI analysis) | Frontend Design Doc |
| 9 | code-verifier x2 | Verify each Design Doc against code | Verification JSON |
| 10 | document-reviewer x2 | Review each Design Doc with verification evidence | Reviews |
| 11 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 12 | acceptance-test-generator | Integration/E2E test skeleton from cross-layer contracts | Test skeletons |
| 13 | work-planner | Work plan from all Design Docs | Work plan |
| 14 | document-reviewer | WorkPlan review **[Stop: Batch approval]** | Approval |

### Parallelization in Multi-Agent Steps

Steps marked `x2` run independently per layer and can execute in parallel when supported. `ui-analyzer x1` runs once for the frontend layer alongside frontend codebase analysis and consumes the selected `externalResourceRefs`.

External evidence and prototype inputs are conditional. Load `external-resource-context` when external evidence changes the current UI or verification decision; otherwise continue with `none`. Ask the user only when a missing user-held access method or prototype is necessary to determine that decision.

### Layer Context in Design Doc Creation

When spawning Design Doc creation for each layer, pass explicit context:

| Scale | Concrete context value |
|-------|------------------------|
| Large | `context: { scale: "large", prd_path: "[path]", requirement_analysis: [routing fields without the persisted convergence object] }` |
| Medium | `context: { scale: "medium", prd_path: null, requirement_analysis: [requirement-analyzer output] }` |

Before spawning, replace every context placeholder with a concrete context object for the active flow scale. For filtered context placeholders, use the same `scale` and `prd_path` values, and replace `requirement_analysis` with the layer-filtered requirement analysis.

**Backend Design Doc**:
**Agent**: Spawn technical-designer
> "Create a backend Design Doc. context: [context]. Codebase analysis: [backend analysis JSON]. Focus on: API contracts, data layer, business logic, service architecture."

**Backend Codebase Analysis**:
**Agent**: Spawn codebase-analyzer
> "Analyze the existing codebase to provide evidence for backend Design Doc creation. context: [context with requirement_analysis filtered to backend files]. requirements: [original user requirements]. layer: backend. target_paths: [backend file and directory scope]. focus_areas: API contracts, data layer, business logic, service architecture."

**Frontend Design Doc**:
**Agent**: Spawn technical-designer-frontend
> "Create a frontend Design Doc. context: [context]. Codebase analysis: [frontend analysis JSON]. UI analysis: [ui-analyzer JSON]. Reference backend Design Doc at [path] for API contracts and Integration Points. Reference UI Spec at [path] for component structure and state design. Focus on: component hierarchy, state management, UI interactions, data fetching."

**Frontend Codebase Analysis**:
**Agent**: Spawn codebase-analyzer
> "Analyze the existing codebase to provide evidence for frontend Design Doc creation. context: [context with requirement_analysis filtered to frontend files]. requirements: [original user requirements]. layer: frontend. target_paths: [frontend file and directory scope]. focus_areas: component hierarchy, state management, UI interactions, data fetching."

**Frontend UI Analysis**:
**Agent**: Spawn ui-analyzer
> "Gather UI facts for frontend design. context: [context with requirement_analysis filtered to frontend files]. requirements: [original user requirements]. target_paths: [frontend file and directory scope]. target_components: [frontend target components]. prototype_path: [path if provided]. externalResourceRefs: [{label, featureIdentifier} selected by the external-evidence step, or []]. Analyze component structure, props patterns, CSS layout, sourced state displays, accessibility, generated artifacts, and candidate write set."

### design-sync for Cross-Layer Verification

Spawn design-sync with `source_design` = frontend Design Doc (created last, referencing backend's Integration Points). design-sync auto-discovers other Design Docs in `docs/design/` for comparison.

## Test Skeleton Generation Phase

Spawn acceptance-test-generator with all Design Docs and UI Spec:

> "Generate test skeletons from the following documents: Design Doc (backend): [path], Design Doc (frontend): [path], UI Spec: [path] (if exists)"

Verify generated artifact paths and continue with them; an empty selection is valid.

## Work Planning Phase

Spawn work-planner with all Design Docs:

> "Create an implementation-focused work plan from the following documents: PRD: [path] (Large Scale only), Design Doc (backend): [path], Design Doc (frontend): [path], UI Spec: [path] (if exists). Test skeleton artifact paths from acceptance-test-generator: [artifacts[].path]. Compose phases around shared backend/frontend verification points and plan only repository implementation outcomes required by the Design Docs."

Verify the returned Work Plan path and use it as the document-reviewer target. Work-planner's existing Integration Complete criteria naturally covers cross-layer verification when given multiple Design Docs.

After work-planner creates or updates the plan, spawn document-reviewer:

> "Review the fullstack work plan. doc_type: WorkPlan. target: [work plan path]. mode: composite. Verify Design Doc and UI Spec implementation coverage, repository-only scope, cross-layer dependency order, executable verification, optional Verification Focus, and Review Scope."

On `needs_revision` or `approved_with_conditions`, apply Review Resolution with work-planner and review the updated plan. Route governing-source contradictions through Orchestrator Escalation Resolution. Stop for batch approval after WorkPlan review succeeds; after explicit user approval, record the plan-level status as approved.

## Task Decomposition Phase

task-decomposer follows standard decomposition from the work plan and the llm-friendly-context Task File Contract. The task's **Target Files** provide the layer evidence used by that filename contract.

## Task Cycle

Route each task by filename:

| Filename Pattern | Executor | Quality fixer |
|---|---|---|
| `*-backend-task-*` | task-executor | quality-fixer |
| `*-frontend-task-*` | task-executor-frontend | quality-fixer-frontend |
| Otherwise, shared `*-task-*` | task-executor | quality-fixer |

For each task, use the subagents-orchestration-guide autonomous task cycle with the executor and quality fixer selected above.

### integration-test-reviewer Placement

When changed integration/E2E tests need review, run integration-test-reviewer after the executor and before quality-fixer with the changed paths, `diffBase`, task file, and matching skeletons when available.

All other orchestration rules follow the standard subagents-orchestration-guide.
