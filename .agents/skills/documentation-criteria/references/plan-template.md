# Work Plan: [Feature Name] Implementation

Created Date: YYYY-MM-DD
Type: feature|fix|refactor
Related Issue/PR: #XXX (if any)
Review Scope: [repository responsibilities or expected files derived from the Design Doc]

## WorkPlan Review

Plan creation and material updates set this to `pending`. Record `approved` after the user approves the reviewed implementation scope.

- **Status**: pending|approved

## Governing Documents

- Design Doc: [docs/design/XXX.md]
- UI Spec: [docs/ui-spec/XXX.md] (when applicable)
- ADR: [docs/adr/ADR-XXXX-title.md] (when applicable)
- PRD: [docs/prd/XXX.md] (when applicable)
- Test skeletons: [paths] (when generated)

## Implementation Scope

[One concise statement of the repository implementation outcome defined by the Design Doc.]

## Implementation Phases

Use the implementation approach and dependency order from the Design Doc. Each phase groups work that reaches a shared observable verification point. Keep implementation, tests, configuration, wiring, and documentation together when they become complete at that point.

### Phase 1: [First implementation outcome]

#### Tasks

- [ ] **P1-T1: [Repository implementation outcome]**
  - **Source**: [every directly constraining Design Doc, ADR, or UI Spec path and section; AC IDs]
  - **Scope**: [responsibility, component, or expected files]
  - **Depends on**: none | [task IDs]
  - **Verification**: [Design Doc verification method or repository command]
  - **Primary failure**: [optional: most material false-green state]
  - **Observable check**: [optional: smallest check that detects the primary failure]

#### Phase Completion

- [ ] Phase tasks are complete and their verification passes

### Phase 2: [Next implementation outcome] (when required)

#### Tasks

- [ ] **P2-T1: [Repository implementation outcome]**
  - **Source**: [every directly constraining Design Doc, ADR, or UI Spec path and section; AC IDs]
  - **Scope**: [responsibility, component, or expected files]
  - **Depends on**: [task IDs]
  - **Verification**: [Design Doc verification method or repository command]
  - **Primary failure**: [optional]
  - **Observable check**: [optional]

#### Phase Completion

- [ ] Phase tasks are complete and their verification passes

## Completion Criteria

- [ ] Every Design Doc obligation needed for implementation is covered by at least one task
- [ ] Every task cites each directly constraining governing section and its applicable ACs
- [ ] Every task produces a repository implementation outcome required by the Design Doc
- [ ] Dependencies permit execution in the listed order
- [ ] Verification is executable from repository artifacts or the task's own output
- [ ] Task verification passes and the cited acceptance criteria are satisfied

## Progress Notes

[Record execution-relevant discoveries only when they change task order, scope, or verification.]
