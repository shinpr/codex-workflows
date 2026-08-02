# PRD: [Feature Name]

## Overview

### One-line Summary
[Describe this feature in one line]

### Background
[Why is this feature needed? What problem does it solve?]

## Product Context (Non-binding)

Record context that helps the user judge product value. Use `user-provided`, `observed`, `inferred`, or `unknown` as the evidence state. Unknown context remains valid unless the user must decide it to define the outcome or an acceptance criterion. Downstream design and planning consume only requirements or decisions that explicitly cite this context.

| Dimension | Current Understanding | Evidence State | Source |
|-----------|-----------------------|----------------|--------|
| Business value | [Value or unknown] | [state] | [user statement / artifact / observation / N/A] |
| User value | [Value or unknown] | [state] | [source] |
| UX clarity | [Known interaction evidence or unknown] | [state] | [source] |
| Success signal | [Known signal or unknown] | [state] | [source] |
| Feasibility / rough effort | [Known constraint or rough assessment] | [state] | [source] |

## User Stories

### Primary Users
[Define the main target users]

### User Stories
```
As a [user type]
I want to [goal/desire]
So that [expected value/benefit]
```

### Use Cases
[Add a use case when it changes a requirement or acceptance criterion; otherwise N/A]

## Functional Requirements

### MVP Requirements
- [ ] Requirement 1: [Detailed description]
  - AC-001: [Acceptance criteria - Given/When/Then format or measurable standard]
  - AC-002: [Acceptance criteria]
[Repeat only for additional confirmed requirements]

### Future / Out of Scope

| Capability | Disposition | Reason |
|---|---|---|
| [Capability the user decided to exclude during requirement convergence] | future / out-of-scope | [Why it is not required for the current outcome] |

If the user considered exclusions and chose none, record: `User confirmed no non-goals.`
Reverse-engineered PRDs mark convergence-derived entries N/A because code contains no user decision. A scope-preserving update may retain existing convergence content or use the update N/A value when none exists.

## Non-Functional Requirements (When They Constrain the Current Outcome)

| Area | Requirement | Evidence / Source |
|------|-------------|-------------------|
| [performance / reliability / security / accessibility / other] | [Confirmed constraint or measurable acceptance condition] | [Source] |

Use `N/A — no confirmed non-functional requirement changes the current outcome` when none apply. General quality preferences remain non-binding context until the user approves them as product requirements.

## Success Criteria

### Converged Outcome

[The one observable result from requirement convergence | N/A — reverse-engineered as-is document | N/A — requirement convergence not part of this update]

### Success Evidence

| Signal | Method | Evidence State | Source |
|--------|--------|----------------|--------|
| [Quantitative or qualitative signal] | [How it can be observed, or unknown] | [user-provided / observed / inferred / unknown] | [Source] |

Unknown success evidence is valid product context. It becomes a binding metric only when the user approves it as a requirement or acceptance criterion.

## Product Feasibility Context

### Dependencies
- [Dependency that materially affects feasibility, or unknown]

### Constraints
- [Constraint that materially affects product scope or rough effort, or unknown]

### Assumptions
- [Assumption with evidence state and source]

### Risks and Mitigation
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Material product risk, or N/A] | High/Medium/Low | High/Medium/Low/Unknown | [Current response or unknown] |

## Undetermined Items

| Item | Kind | Why It Matters | Evidence State | Next Handling |
|------|------|----------------|----------------|---------------|
| [Question or unknown] | binding-decision / contextual | [Affected outcome, requirement, or context] | [state] | [Exact user decision needed before approval / retain as unknown] |

Only a `binding-decision` item prevents approval of the requirement or acceptance criterion it controls. Contextual items may remain unknown.

## Appendix

### References
- [Related document 1]
- [Related document 2]

### Glossary
- **Term 1**: [Definition]
- **Term 2**: [Definition]
