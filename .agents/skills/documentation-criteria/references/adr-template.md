# [ADR Number] [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded | Rejected]

`Accepted` records the current selected means, not an obligation to retain it. Later evidence may justify a smaller sufficient choice; update or supersede the affected decision while preserving user outcomes and explicit constraints.

## Context

[Describe the background and reasons why this decision is needed. Include the essence of the problem, current challenges, and constraints]

## Decision Point

- **Question**: [The technical choice requiring comparison and selection]
- **Why a decision exists**: [Evidence for at least two credible materially distinct options]
- **Scope boundary**: [Approved requirement or existing contract this decision serves]

## Decision

[Describe the actual decision made. Aim for specific and clear descriptions]

### Decision Details

| Item | Content |
|------|---------|
| **Decision** | [The decision in one sentence] |
| **Why this** | [Why this option over alternatives (1-3 lines)] |
| **Known unknowns** | [Uncertainty that changes implementation or verification; otherwise N/A] |
| **Reconsider when** | [Observable condition that changes the option comparison; otherwise N/A] |

## Rationale

[Explain why this decision was made and why it is the best option compared to alternatives]

### Options Considered

Compare every credible materially distinct option supported by current requirements and repository evidence. Relative, evidence-backed cost is sufficient for the selection.

| Option | Requirement and repository fit | Current-scope benefit | Lifecycle cost | Maintainability | Material trade-offs |
|---|---|---|---|---|---|
| [Option 1] | [fit and evidence] | [benefit required now] | [implementation, operation, change, reversal] | [fit with ownership and representative patterns] | [trade-offs] |
| [Option 2] | [fit and evidence] | [benefit required now] | [implementation, operation, change, reversal] | [fit with ownership and representative patterns] | [trade-offs] |

**Selected**: [The smallest sufficient option whose maintainability and lifecycle cost are justified by its current-scope benefit]

## Consequences

- [List decision-relevant positive, negative, or neutral consequences and the affected owner; omit empty categories]

## Architecture Impact

[Describe how this decision affects existing architecture: components changed, dependencies introduced or removed, and new architectural constraints]

## Implementation Guidance

[Principled direction only. Implementation procedures go to Design Doc]

## Related Information

- [Links to related ADRs, documents, issues, PRs, etc.]
