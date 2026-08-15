---
name: documentation-criteria
description: "Determines which PRD, ADR, UI Spec, Design Doc, and Work Plan a change requires and where each document lives. Use when deciding documentation scope or creating or reviewing one of these artifacts."
---

# Documentation Creation Criteria

## Templates

- **[prd-template.md](references/prd-template.md)** - Product Requirements Document template
- **[adr-template.md](references/adr-template.md)** - Architecture Decision Record template
- **[ui-spec-template.md](references/ui-spec-template.md)** - UI Specification template (frontend/fullstack features)
- **[design-template.md](references/design-template.md)** - Technical Design Document template
- **[plan-template.md](references/plan-template.md)** - Work Plan template

## Creation Decision Matrix [MANDATORY]

| Structural Scale | Base Documents | Creation Order |
|------------------|----------------|----------------|
| Small | None | N/A |
| Medium | Design Doc -> Work Plan | Start with Design Doc |
| Large | PRD -> Design Doc -> Work Plan | Continue after PRD approval |

Build one path in this order:

1. Select the base path from Structural Scale.
2. Frontend or fullstack scope inserts UI Spec immediately before the Design Doc.
3. One or more qualifying ADR decision points insert an ADR batch immediately before the Design Doc. A qualifying decision point sets the scale floor to Medium.

**ENFORCEMENT**: EVALUATE structural scale and ADR conditions BEFORE starting implementation

## Structural Scale

Classify the decision burden, not repository layout. File count is supporting evidence only.

| Scale | Structural condition |
|-------|----------------------|
| Small | One coherent outcome follows existing patterns within one responsibility boundary |
| Medium | One coherent outcome coordinates across a boundary or requires a durable design decision |
| Large | Multiple independently valuable outcomes require separate design decisions |

A qualifying ADR decision point sets the floor at Medium because it creates a durable decision. Large applies when multiple independently valuable outcomes require separate design decisions; one coherent outcome remains Medium across multiple layers. ADR decision points come from the Choice and Durability filters independently of scale.

## ADR Creation Conditions

First check accepted ADRs that govern the changed responsibility. Then apply both filters in order for each technical topic within the confirmed implementation scope:

1. **Choice requires judgment** — current requirements, accepted decisions, and representative repository patterns support at least two credible materially distinct options whose selection requires comparison.
2. **Decision is durable** — choosing among those options materially changes a responsibility, dependency direction, shared contract, persistence model, technology dependency, reversibility, or lifecycle cost that future work must understand or preserve.

Create one ADR for each topic that passes both filters. Route topics with one evident choice, generic technical concerns, operational possibilities, and rejected activities directly to the Design Doc or out of current design as applicable.

Treat choices as one decision point when they must be selected or reconsidered together. Use separate decision points when each choice can be selected and revisited independently.

Qualifying durable choices include:

- introducing or replacing a technology, library, platform, storage model, or external dependency;
- changing ownership, dependency direction, trust boundary, or a shared public contract in a way with credible materially different alternatives;
- reversing or superseding an accepted architecture decision;
- choosing an irreversible or high-cost-to-reverse data or compatibility strategy.

A local contract, data-flow, state, or component change that follows an accepted design, has one evident repository-supported implementation, or remains cheaply reversible belongs in the Design Doc. Counts of files, consumers, nesting levels, states, steps, and Structural Scale remain supporting evidence rather than ADR criteria.

## What Each Document Fixes

Each document fixes one class of decision needed by its downstream consumer. The decision matrix determines whether the document is required; the applicable template defines its content.

| Document | Decision it fixes | Consumer and effect when missing |
|----------|-------------------|----------------------------------|
| PRD | Confirmed product outcome, requirements, acceptance criteria, and exclusions | Design and test selection would have to infer product scope |
| ADR | One qualifying durable technical choice and the alternatives it resolves | Design and future changes could not distinguish an accepted decision from a local implementation choice |
| UI Spec | Approved UI structure, states, interactions, and visual acceptance | Frontend design and implementation would have to infer user-interface decisions |
| Design Doc | Repository-grounded implementation approach, contracts, change surface, and verification strategy | Planning and implementation would have to make technical design decisions locally |
| Work Plan | Implementation outcome order, dependencies, and executable verification | Task decomposition and execution would have to choose sequencing and proof boundaries locally |

## Storage Locations

| Document | Path | Naming Convention |
|----------|------|------------------|
| PRD | `docs/prd/` | `[feature-name]-prd.md` |
| ADR | `docs/adr/` | `ADR-[4-digits]-[title].md` |
| UI Spec | `docs/ui-spec/` | `[feature-name]-ui-spec.md` |
| Design Doc | `docs/design/` | `[feature-name]-design.md` |
| Work Plan | `docs/plans/` | `YYYYMMDD-{type}-{description}.md` |

## ADR Status
`Proposed` -> `Accepted` -> `Deprecated`/`Superseded`/`Rejected`
