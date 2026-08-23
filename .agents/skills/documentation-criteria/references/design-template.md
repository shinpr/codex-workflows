# Design Document: [Feature Name]

## Overview

- Outcome: [confirmed observable result]
- Scope: [repository responsibility being changed]
- UI Spec: [path when applicable]
- Governing ADRs: [paths when applicable]

## Requirement Boundary

- PRD or convergence carrier: [path | embedded record | eligible N/A]
- Current requirements: [binding requirements implemented by this design]
- Non-goals: [user-decided exclusions | user confirmed none]
- Open requirement fields: [weak-but-explicit item and effect | none]

Reverse-engineered documents use only `N/A — reverse-engineered as-is document` for convergence and describe existing behavior rather than future requirements.

## Acceptance Criteria

Use the smallest representative set that proves the outcome and material failure boundaries. Each criterion cites its source requirement.

- **AC-001** — **When** [trigger], the system shall [observable result]. Source: [requirement]
- **AC-002** — **If** [material failure condition], **then** the system shall [observable result]. Source: [requirement]

## Existing Evidence

Record only evidence that constrains an implementation or verification decision.

| Evidence | Location | Design effect |
|---|---|---|
| Existing responsibility or representative pattern | [file:symbol] | [reuse, preserve, or replace] |
| Applicable explicit/implicit standard | [rule/config/file] | [constraint] |
| Repository quality mechanism | [command/config] | [applicable verification] |

## Design

### Selected Design

[Describe only the selected end-to-end implementation. Each element serves a current requirement, verified constraint, observed problem, or evidence-backed in-scope risk, and has justified total complexity over the smaller design. Keep evaluation-only ideas and unselected candidates in the active design context; ADRs alone retain alternatives as decision history.]

### Change Surface

| Responsibility or expected file | Change | Governing source | Unaffected boundary to preserve |
|---|---|---|---|
| [component/module/path] | [implementation outcome] | [section / AC] | [contract or behavior] |

### Components and Flow

[Describe the components and control/data flow needed to implement the change. Use a diagram only when prose or a compact table does not make a material relationship clear.]

### Contracts, State, and Persistence (When Applicable)

Include only changed or newly relied-upon boundaries.

| Boundary | Input / exact format | Output / exact format | Error or state behavior | Compatibility |
|---|---|---|---|---|
| [caller → consumer, storage, message, route, file, etc.] | [contract] | [contract] | [observable behavior] | [preserved/change] |

For a value crossing multiple serialization boundaries, add its actual propagation steps beneath the row. Omit this section when the change has no cross-boundary contract, state, or persistence effect.

### Security Boundary (When Applicable)

[Authentication, authorization, untrusted input, sensitive data, or output handling changed by this design. Omit when the change does not cross a relevant trust boundary.]

### Repository-Owned Migration, Flag, or Deployment Behavior (When Applicable)

[Schema cutover, compatibility path, feature-flag behavior, or checked-in deployment configuration that changes implementation or an AC. Exclude release execution, production access, external account setup, and organizational approval.]

## Implementation Approach

- Slicing: [vertical | foundation-first | hybrid]
- Dependency order: [only verified ordering constraints]
- First observable checkpoint: [earliest implementation state that proves useful behavior]
- Rationale: [why this is the smallest sufficient order]

## Verification Strategy

| Claim / AC | Level | Repository command or operation | Observable pass condition |
|---|---|---|---|
| [behavior or contract] | [L1/L2/L3] | [existing command / task-created operation] | [result proving the claim] |

- Early verification point: [first task and proof]
- Data/persistence boundary: [real boundary used or N/A]
- Existing observable-output comparison: [representative input and comparison method when behavior, external contract, or persisted shape changes; otherwise omit]

Limit live external services, production access, new dashboards, and new test lanes to confirmed requirements that make them part of repository implementation.

## Material Risks

| Risk | Evidence | In-scope response or verification |
|---|---|---|
| [risk that can change implementation correctness] | [source] | [mitigation/check] |

A residual implementation uncertainty belongs here only when its in-scope verification or guard cannot change the selected design or add optional scope. Premises that can change design selection are resolved before this document is finalized.

Omit when no material implementation risk remains beyond the normal verification above.

## References

- [governing and evidence paths]

## Update History

| Date | Version | Changes |
|---|---|---|
| YYYY-MM-DD | 1.0 | Initial design |
