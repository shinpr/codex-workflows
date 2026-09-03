# Fullstack (Monorepo) Flow

This reference defines the orchestration flow for projects spanning multiple layers (backend + frontend). It extends the standard orchestration guide without modifying it.

## When This Flow Applies

- Multiple Design Docs exist targeting different layers (backend, frontend)
- A single feature requires implementation across both backend and frontend
- The orchestrator is invoked for fullstack implementation

## Design Phase

### Large Structural Scale Fullstack - 18 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer + orchestrator | Compact scope/cost evidence followed by orchestrator convergence and scale determination **[Stop]** | Converged requirements + scale |
| 2 | prd-creator | PRD covering entire feature (all layers) | Single PRD |
| 3 | document-reviewer | PRD review **[Stop]** | Approval |
| 4 | (orchestrator) | Resolve a required external evidence axis when repository and supplied context cannot decide it | `externalResourceRefs` or `[]` |
| 5 | (orchestrator) | Use a supplied or target-referenced prototype; request its path only when the UI target otherwise cannot be determined, then resolve its reference strength | Prototype path plus `binding` or `reference`, or none |
| 6 | codebase-analyzer x2 + ui-analyzer x1 | Per-layer codebase analysis plus frontend UI analysis | Analysis JSON |
| 7 | ui-spec-designer | UI Spec from PRD + UI analysis + optional prototype | UI Spec |
| 8 | document-reviewer | UI Spec review **[Stop]** | Approval |
| 9 | orchestrator + technical-designer* | Apply both ADR filters and create one ADR per qualifying decision point | Created ADR paths or `[]` |
| 10 | document-reviewer | Review the complete ADR batch together **[Stop when batch exists]** | Batch approval |
| 11 | technical-designer | **Backend** Design Doc | Backend Design Doc |
| 12 | technical-designer-frontend | **Frontend** Design Doc (references backend Integration Points + UI Spec + UI analysis) | Frontend Design Doc |
| 13 | code-verifier x2 + orchestrator | Verify each Design Doc and apply Review Resolution | Resolved verification evidence |
| 14 | document-reviewer x2 | Review each Design Doc with resolved verification evidence | Reviews |
| 15 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 16 | acceptance-test-generator | Integration/E2E test skeleton from cross-layer contracts | Test skeletons |
| 17 | work-planner | Work plan from all Design Docs | Work plan |
| 18 | document-reviewer | WorkPlan review **[Stop: Batch approval]** | Approval |

### Medium Structural Scale Fullstack - 16 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer + orchestrator | Compact scope/cost evidence followed by orchestrator convergence and scale determination **[Stop]** | Converged requirements + scale |
| 2 | (orchestrator) | Resolve a required external evidence axis when repository and supplied context cannot decide it | `externalResourceRefs` or `[]` |
| 3 | (orchestrator) | Use a supplied or target-referenced prototype; request its path only when the UI target otherwise cannot be determined, then resolve its reference strength | Prototype path plus `binding` or `reference`, or none |
| 4 | codebase-analyzer x2 + ui-analyzer x1 | Per-layer codebase analysis plus frontend UI analysis | Analysis JSON |
| 5 | ui-spec-designer | UI Spec from requirements + UI analysis + optional prototype | UI Spec |
| 6 | document-reviewer | UI Spec review **[Stop]** | Approval |
| 7 | orchestrator + technical-designer* | Apply both ADR filters and create one ADR per qualifying decision point | Created ADR paths or `[]` |
| 8 | document-reviewer | Review the complete ADR batch together **[Stop when batch exists]** | Batch approval |
| 9 | technical-designer | **Backend** Design Doc | Backend Design Doc |
| 10 | technical-designer-frontend | **Frontend** Design Doc (references backend Integration Points + UI Spec + UI analysis) | Frontend Design Doc |
| 11 | code-verifier x2 + orchestrator | Verify each Design Doc and apply Review Resolution | Resolved verification evidence |
| 12 | document-reviewer x2 | Review each Design Doc with resolved verification evidence | Reviews |
| 13 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 14 | acceptance-test-generator | Integration/E2E test skeleton from cross-layer contracts | Test skeletons |
| 15 | work-planner | Work plan from all Design Docs | Work plan |
| 16 | document-reviewer | WorkPlan review **[Stop: Batch approval]** | Approval |

### Parallelization in Multi-Agent Steps

Steps marked `x2` run independently per layer and can execute in parallel when supported. `ui-analyzer x1` runs once for the frontend layer alongside frontend codebase analysis and consumes the selected `externalResourceRefs`. For the ADR step, route layer-owned decision points to the matching technical designer and cross-layer points to technical-designer, collect every returned path, and invoke document-reviewer once with `doc_type: ADRBatch` and the complete `targets` array.

External evidence and prototype inputs are conditional. Load `external-resource-context` when external evidence changes the current UI or verification decision; otherwise continue with `none`. Prototype input follows the frontend rule: use a supplied or target-referenced prototype, request its path only when the UI target otherwise cannot be determined, and resolve and deliver `prototype_reference_strength` through the shared UI Spec rule.

### Layer Context in Design Doc Creation

When spawning Design Doc creation for each layer, pass explicit context:

| Scale | Concrete context value |
|-------|------------------------|
| Large | `context: { scale: "large", prd_path: "[path]", scope_evidence: [layer-filtered compact evidence] }` |
| Medium | `context: { scale: "medium", prd_path: null, scope_evidence: [layer-filtered compact evidence], convergence: [confirmed record] }` |

Before spawning, replace every context placeholder with a concrete context object for the active flow scale. For filtered context placeholders, use the same `scale` and `prd_path` values and the layer-filtered compact evidence.

**Backend Design Doc**:
**Agent**: Spawn technical-designer
> "Create a backend Design Doc. context: [context]. adr_paths: [accepted ADR paths]. decision_materials: [backend analysis material that changes reuse, validity, a selected decision, contract, or verification]. Reference approved UI Spec at [path] only for displayed values whose source data crosses a backend-owned contract."

**Backend Codebase Analysis**:
**Agent**: Spawn codebase-analyzer
> "Analyze the existing codebase to provide compact decision materials for requirement confirmation, ADR selection, minimal backend design, and verification. context: [layer scope evidence]. requirements: [original user requirements]. layer: backend. target_paths: [backend scope]. focus_areas: API contracts, data layer, business logic, service architecture."

**Frontend Design Doc**:
**Agent**: Spawn technical-designer-frontend
> "Create a frontend Design Doc. context: [context]. adr_paths: [accepted ADR paths]. decision_materials: [frontend/UI material that changes reuse, validity, a selected decision, contract, or verification]. Reference backend Design Doc at [path] for API contracts and Integration Points. Reference UI Spec at [path] for component structure and state design."

**Frontend Codebase Analysis**:
**Agent**: Spawn codebase-analyzer
> "Analyze the existing codebase to provide compact decision materials for requirement confirmation, ADR selection, minimal frontend design, and verification. context: [layer scope evidence]. requirements: [original user requirements]. layer: frontend. target_paths: [frontend scope]. focus_areas: component hierarchy, state management, UI interactions, data fetching."

### Verification Resolution

Apply Review Resolution independently to each code-verifier result. Send the `apply` discrepancies to the matching technical designer, rerun the affected verifier, and provide document-reviewer with resolved verification evidence after each `apply` set becomes empty.

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

> "Review the fullstack work plan. doc_type: WorkPlan. target: [work plan path]. Verify Design Doc and UI Spec implementation coverage, repository-only scope, cross-layer dependency order, executable verification, optional Verification Focus, and Review Scope."

On `needs_revision`, apply Review Resolution with work-planner and review the updated plan. Route governing-source contradictions through Orchestrator Escalation Resolution. Stop for batch approval after WorkPlan review succeeds; after explicit user approval, record the plan-level status as approved.

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
