# Fullstack (Monorepo) Flow

This reference defines the orchestration flow for projects spanning multiple layers (backend + frontend). It extends the standard orchestration guide without modifying it.

## When This Flow Applies

- Multiple Design Docs exist targeting different layers (backend, frontend)
- A single feature requires implementation across both backend and frontend
- The orchestrator is invoked for fullstack implementation

## Design Phase

### Large Scale Fullstack (6+ Files) - 12 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer | Requirement analysis + scale determination **[Stop]** | Requirements + scale |
| 2 | prd-creator | PRD covering entire feature (all layers) | Single PRD |
| 3 | document-reviewer | PRD review **[Stop]** | Approval |
| 4 | (orchestrator) | Ask user for prototype code **[Stop]** | Prototype path or none |
| 5 | ui-spec-designer | UI Spec from PRD + optional prototype | UI Spec |
| 6 | document-reviewer | UI Spec review **[Stop]** | Approval |
| 7 | technical-designer | **Backend** Design Doc | Backend Design Doc |
| 8 | technical-designer-frontend | **Frontend** Design Doc (references backend Integration Points + UI Spec) | Frontend Design Doc |
| 9 | document-reviewer x2 | Review each Design Doc (one invocation per doc) | Reviews |
| 10 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 11 | acceptance-test-generator | Integration/E2E test skeleton from cross-layer contracts | Test skeletons |
| 12 | work-planner | Work plan from all Design Docs **[Stop: Batch approval]** | Work plan |

### Medium Scale Fullstack (3-5 Files) - 10 Steps

| Step | Agent | Purpose | Output |
|------|-------|---------|--------|
| 1 | requirement-analyzer | Requirement analysis + scale determination **[Stop]** | Requirements + scale |
| 2 | (orchestrator) | Ask user for prototype code **[Stop]** | Prototype path or none |
| 3 | ui-spec-designer | UI Spec from requirements + optional prototype | UI Spec |
| 4 | document-reviewer | UI Spec review **[Stop]** | Approval |
| 5 | technical-designer | **Backend** Design Doc | Backend Design Doc |
| 6 | technical-designer-frontend | **Frontend** Design Doc (references backend Integration Points + UI Spec) | Frontend Design Doc |
| 7 | document-reviewer x2 | Review each Design Doc (one invocation per doc) | Reviews |
| 8 | design-sync | Cross-layer consistency verification (source: frontend Design Doc) **[Stop]** | Sync status |
| 9 | acceptance-test-generator | Integration/E2E test skeleton from cross-layer contracts | Test skeletons |
| 10 | work-planner | Work plan from all Design Docs **[Stop: Batch approval]** | Work plan |

### Layer Context in Design Doc Creation

When spawning Design Doc creation for each layer, pass explicit context:

**Large Scale (PRD available) -- Backend Design Doc**:
**Agent**: Spawn technical-designer
> "Create a backend Design Doc from PRD at [path]. Focus on: API contracts, data layer, business logic, service architecture."

**Large Scale (PRD available) -- Frontend Design Doc**:
**Agent**: Spawn technical-designer-frontend
> "Create a frontend Design Doc from PRD at [path]. Reference backend Design Doc at [path] for API contracts and Integration Points. Reference UI Spec at [path] for component structure and state design. Focus on: component hierarchy, state management, UI interactions, data fetching."

**Medium Scale (no PRD) -- Backend Design Doc**:
**Agent**: Spawn technical-designer
> "Create a backend Design Doc based on the following requirements: [requirement-analyzer output]. Focus on: API contracts, data layer, business logic, service architecture."

**Medium Scale (no PRD) -- Frontend Design Doc**:
**Agent**: Spawn technical-designer-frontend
> "Create a frontend Design Doc based on the following requirements: [requirement-analyzer output]. Reference backend Design Doc at [path] for API contracts and Integration Points. Reference UI Spec at [path] for component structure and state design. Focus on: component hierarchy, state management, UI interactions, data fetching."

### design-sync for Cross-Layer Verification

Spawn design-sync with `source_design` = frontend Design Doc (created last, referencing backend's Integration Points). design-sync auto-discovers other Design Docs in `docs/design/` for comparison.

## Test Skeleton Generation Phase

Spawn acceptance-test-generator with all Design Docs and UI Spec:

> "Generate test skeletons from the following documents: Design Doc (backend): [path], Design Doc (frontend): [path], UI Spec: [path] (if exists)"

## Work Planning Phase

Spawn work-planner with all Design Docs:

> "Create a work plan from the following documents: PRD: [path] (Large Scale only), Design Doc (backend): [path], Design Doc (frontend): [path]. Compose phases as vertical feature slices where possible -- each phase should contain both backend and frontend work for the same feature area, enabling early integration verification per phase."

work-planner's existing Integration Complete criteria naturally covers cross-layer verification when given multiple Design Docs.

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
