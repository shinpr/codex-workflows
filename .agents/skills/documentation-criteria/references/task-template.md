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

## Change Category
(Include this field only when the task is a bug fix, regression, state-change, or boundary-change. Omit otherwise.)

`Change Category: <one or more of bug-fix, regression, state-change, boundary-change, comma-separated>`

When present, sweep cases sharing the same path, contract, persisted state, or external boundary for the same class of defect during the Red Phase.

## Binding Decisions
(Include this section when the work plan's ADR Bindings table covers this task. Omit otherwise.)

Each row is an ADR decision the implementation in this task must comply with.

| Source | Axis | Decision | Compliance Check |
|--------|------|----------|------------------|
| docs/adr/ADR-XXXX-title.md (§ <Source Section>) | [Axis value copied verbatim from the work plan's ADR Bindings row] | [Binding decision copied from the work plan's ADR Bindings row] | [Y/N-answerable positive predicate that evaluates whether the planned and final implementation satisfy the decision] |

## Reference Contracts
(Include this section when the work plan's Reference Contract Values table covers this task. Omit otherwise.)

Each row is a Design Doc-derived observable contract the implementation in this task must reproduce exactly. Serialized boundaries are carried by Boundary Context from the work plan's Connection Map. ADR-derived structural decisions are carried by Binding Decisions above.

| Source | Contract Type | Required Observable Value | Compliance Check |
|--------|---------------|---------------------------|------------------|
| docs/design/xxx-design.md (§ Section name) | structure-order / derived-display / state-lifecycle-negative | [Required Observable Value copied verbatim from the work plan row] | [Y/N-answerable positive predicate that evaluates whether the planned and final implementation reproduces the value] |

## Investigation Notes
Brief observations recorded after reading Investigation Targets:
- [path] - [interfaces, control/data flow, state transitions, side effects relevant to this task]
- When Binding Decisions or Reference Contracts exist, record the planned implementation approach and each Compliance Check result here.

## Implementation Steps (TDD: Red-Green-Refactor)
### 1. Red Phase
- [ ] Read all Investigation Targets and update Investigation Notes
- [ ] (When Change Category is set) Sweep adjacent cases sharing the same path, contract, persisted state, or external boundary for the same class of defect; fold any in-scope residual into failing tests
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

## Proof Obligations
(Include one entry per acceptance criterion, user journey, boundary, or state transition this task implements or verifies. Derive from test skeleton annotations when present; otherwise derive from the acceptance criterion's primary failure mode.)
- **AC / Claim ID**: [AC-XXX, user journey identifier, boundary identifier, or task claim identifier]
- **Claim**: [behavior the acceptance criterion or task promises]
- **Primary failure mode**: [regression the test should turn red on]
- **Boundary to exercise**: [public/integration/browser/process/service/persistence boundary, or "in-process unit"]
- **State assertion**: [observable state before -> action -> after for state-changing claims; "N/A" otherwise]
- **Mock boundary rationale**: [which external boundaries may be mocked and why; "none" when all real]
- **Residual**: [what this task-level proof leaves unestablished, and which later task or phase closes it]

## Completion Criteria
- [ ] All listed AC / Claim IDs are implemented or verified by this task
- [ ] All added tests pass
- [ ] Operation verified per Operation Verification Methods above
- [ ] Each Proof Obligation is met: the test turns red under its primary failure mode and exercises the stated boundary
- [ ] Deliverables created (for research/design tasks)
- [ ] When Binding Decisions exist, every Compliance Check evaluates to `Y` against the final implementation, with evidence recorded in Investigation Notes
- [ ] When Reference Contracts exist, every Compliance Check evaluates to `Y` against the final implementation, with evidence recorded in Investigation Notes

## Notes
- Impact scope: [Areas where changes may propagate]
- Constraints: [Areas not to be modified]
