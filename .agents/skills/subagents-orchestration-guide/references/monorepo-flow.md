# Fullstack (Monorepo) Flow

This reference defines the orchestration flow for projects spanning multiple layers (backend + frontend). It extends the standard orchestration guide without modifying it.

## When This Flow Applies

- Multiple Design Docs exist targeting different layers (backend, frontend)
- A single feature requires implementation across both backend and frontend
- The orchestrator is invoked for fullstack implementation

## Design Phase

### Large Scale Fullstack (6+ Files) - 16 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer | Requirement analysis + scale determination **[Stop]** | Requirements + scale |
| 2 | prd-creator | PRD covering entire feature (all layers) | Single PRD |
| 3 | document-reviewer | PRD review **[Stop]** | Approval |
| 4 | (orchestrator) | External resource hearing **[Stop]** | Project context |
| 5 | (orchestrator) | Ask user for prototype code **[Stop]** | Prototype path or none |
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

### Medium Scale Fullstack (3-5 Files) - 14 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer | Requirement analysis + scale determination **[Stop]** | Requirements + scale |
| 2 | (orchestrator) | External resource hearing **[Stop]** | Project context |
| 3 | (orchestrator) | Ask user for prototype code **[Stop]** | Prototype path or none |
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

Steps marked `x2` run independently per layer and can execute in parallel when supported. `ui-analyzer x1` runs once for the frontend layer alongside frontend codebase analysis and consumes the saved external resource context.

### Layer Context in Design Doc Creation

When spawning Design Doc creation for each layer, pass explicit context:

| Scale | Concrete context value |
|-------|------------------------|
| Large | `context: { scale: "large", prd_path: "[path]", requirement_analysis: [requirement-analyzer output] }` |
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
> "Gather UI facts for frontend design. context: [context with requirement_analysis filtered to frontend files]. requirements: [original user requirements]. target_paths: [frontend file and directory scope]. target_components: [frontend target components]. prototype_path: [path if provided]. Read docs/project-context/external-resources.md, resolve relevant UI external resources through declared access methods, and analyze component structure, props patterns, CSS layout, state displays, accessibility, generated artifacts, and candidate write set."

### design-sync for Cross-Layer Verification

Spawn design-sync with `source_design` = frontend Design Doc (created last, referencing backend's Integration Points). design-sync auto-discovers other Design Docs in `docs/design/` for comparison.

## Test Skeleton Generation Phase

Spawn acceptance-test-generator with all Design Docs and UI Spec:

> "Generate test skeletons from the following documents: Design Doc (backend): [path], Design Doc (frontend): [path], UI Spec: [path] (if exists)"

## Work Planning Phase

Spawn work-planner with all Design Docs:

> "Create a work plan from the following documents: PRD: [path] (Large Scale only), Design Doc (backend): [path], Design Doc (frontend): [path], UI Spec: [path] (if exists). Test skeletons from acceptance-test-generator: integration: [path or null], fixtureE2e: [path or null], serviceE2e: [path or null], e2eAbsenceReason: { fixtureE2e: [value or null], serviceE2e: [value or null] }. Compose phases as vertical feature slices where possible -- each phase should contain both backend and frontend work for the same feature area, enabling early integration verification per phase. Include `Implementation Readiness: pending` in the work plan header."

work-planner's existing Integration Complete criteria naturally covers cross-layer verification when given multiple Design Docs.

After work-planner creates or updates the plan, spawn document-reviewer:

> "Review the fullstack work plan. doc_type: WorkPlan. target: [work plan path]. mode: composite. Review semantic traceability to all Design Docs, UI Spec when present, Reference Contract Values fidelity, cross-layer boundary coverage, early verification placement, real-boundary verification coverage, Proof Strategy, Failure Mode Checklist, Review Scope, and Quality Assurance coverage."

On `needs_revision` or `approved_with_conditions`, return to work-planner in update mode and re-review for max 2 revision iterations as defined by the `needs_revision` row in Approval Status Vocabulary. On `rejected`, halt and escalate to the user. Stop for batch approval only after WorkPlan review returns `approved` and the plan's `WorkPlan Review` section records `Status: approved` with `Conditions: none`.

## Task Decomposition Phase

task-decomposer follows standard decomposition from the work plan. The key addition is the **layer-aware naming convention**:

| Filename Pattern | Meaning |
|-----------------|---------|
| `{plan}-backend-task-{n}.md` | Backend only |
| `{plan}-frontend-task-{n}.md` | Frontend only |

Layer is determined from the task's **Target files** paths -- this is a factual determination, not inference.

## Task Cycle

Each task uses the standard 4-step cycle with layer-appropriate agents:

### backend-task
1. task-executor: Implementation
2. Escalation check
3. quality-fixer: Quality check and fixes
4. git commit (on status: "approved")

### frontend-task
1. task-executor-frontend: Implementation
2. Escalation check
3. quality-fixer-frontend: Quality check and fixes
4. git commit (on status: "approved")

### integration-test-reviewer Placement

When `requiresTestReview` is `true`:
- Standard flow (integration-test-reviewer after task-executor, before quality-fixer)

## Agent Routing Summary

The orchestrator selects agents by **filename pattern matching** -- no conditional inference required:

```
*-backend-task-*   -> task-executor + quality-fixer
*-frontend-task-*  -> task-executor-frontend + quality-fixer-frontend
```

All other orchestration rules (stop points, structured responses, escalation handling, task management) follow the standard subagents-orchestration-guide.
