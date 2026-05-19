# Task: [Task Name]

Metadata:
- Dependencies: task-01 -> Deliverable: docs/plans/analysis/research-results.md
- Provides: docs/plans/analysis/api-spec.md (for research/design tasks)
- Size: Small (1-2 files)

## Implementation Content
[What this task will achieve]
*Reference dependency deliverables if applicable

## Target Files
- [ ] [Implementation file path]
- [ ] [Test file path]

## Investigation Targets
Files to read before starting implementation. Use concrete file paths, optionally with a section/function hint:
- [e.g., src/orders/checkout.ts (processOrder function)]

## Binding Decisions
(Include this section when the work plan's ADR Bindings table covers this task. Omit otherwise.)

Each row is an ADR decision the implementation in this task must comply with.

| Source | Axis | Decision | Compliance Check |
|--------|------|----------|------------------|
| docs/adr/ADR-XXXX-title.md (§ <Source Section>) | [Axis value copied verbatim from the work plan's ADR Bindings row] | [Binding decision copied from the work plan's ADR Bindings row] | [Y/N-answerable positive predicate that evaluates whether the planned and final implementation satisfy the decision] |

## Investigation Notes
Brief observations recorded after reading Investigation Targets:
- [path] - [interfaces, control/data flow, state transitions, side effects relevant to this task]
- When Binding Decisions exist, record the planned implementation approach and each Compliance Check result here.

## Implementation Steps (TDD: Red-Green-Refactor)
### 1. Red Phase
- [ ] Read all Investigation Targets and update Investigation Notes
- [ ] Review dependency deliverables (if any)
- [ ] Verify/create contract definitions
- [ ] Write failing tests
- [ ] Run tests and confirm failure

### 2. Green Phase
- [ ] Add minimal implementation to pass tests
- [ ] Run only added tests and confirm they pass

### 3. Refactor Phase
- [ ] Improve code (maintain passing tests)
- [ ] Confirm added tests still pass

## Quality Assurance Mechanisms
(From the work plan header — include only mechanisms relevant to this task's target files)
- [Tool/check name] — Enforces: [what] — Config: [path]

## Operation Verification Methods
(Derived from Verification Strategy in the work plan)
- **Verification method**: [What to verify and how]
- **Success criteria**: [Observable outcome that proves correctness]
- **Failure response**: [What to do if verification fails]
- **Verification level**: [L1 unit/local verification, L2 integration verification, or L3 end-to-end verification]

## Completion Criteria
- [ ] All added tests pass
- [ ] Operation verified per Operation Verification Methods above
- [ ] Deliverables created (for research/design tasks)
- [ ] When Binding Decisions exist, every Compliance Check evaluates to `Y` against the final implementation, with evidence recorded in Investigation Notes

## Notes
- Impact scope: [Areas where changes may propagate]
- Constraints: [Areas not to be modified]
