---
name: documentation-criteria
description: "Documentation creation criteria for PRD, ADR, Design Doc, UI Spec, and Work Plan with templates. Use when: creating or reviewing technical documents, determining which documents are required, or following document templates."
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

Apply both filters in order for each technical topic within the confirmed implementation scope:

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

## Detailed Document Definitions

### PRD (Product Requirements Document)
**Purpose**: Define business requirements and user value
**Scope**: Binding product requirements and non-binding Product Context. Binding content includes the converged outcome, MVP requirements, acceptance criteria with sequential IDs, and user-decided exclusions. Product Context may record business value, user value, UX evidence, success signals, and feasibility or rough-effort evidence as `user-provided`, `observed`, `inferred`, or `unknown`. Unknown context does not block implementation unless the user must decide it to define the outcome or an acceptance criterion. Technical implementation details belong in Design Doc, technical decision rationale in ADR, and implementation phases or task breakdown belong in Work Plan.

### ADR (Architecture Decision Record)
**Purpose**: Record technical decision rationale and background
**Scope**: One qualifying technical decision point, its credible alternatives, requirement and repository fit, current-scope benefit, lifecycle cost, maintainability, selected necessary-and-sufficient option, consequences, and reconsideration conditions. An ADR narrows the technical solution space; the confirmed requirements remain the product and implementation scope. Implementation procedures and code examples belong in Design Doc, while schedule and resource assignments belong in Work Plan.

### UI Specification
**Purpose**: Define UI structure, screen transitions, component decomposition, and interaction design
**Scope**: Screen list and transitions, component state x display matrix, component decomposition, interaction definitions, AC traceability, existing component reuse map, visual acceptance criteria, and accessibility requirements only. Technical implementation and API contracts belong in Design Doc, test implementation belongs in generated test skeletons, and schedule belongs in Work Plan.

### Design Document
**Purpose**: Define technical implementation methods in detail
**Scope**: Existing repository evidence, technical approach, applicable dependencies and constraints, interface and contract definitions, data flow, acceptance criteria, change surface, and verification strategy. Include deployment, migration, feature-flag, or measurement design only when it changes repository implementation or an acceptance criterion. External approval, production access, release execution, and organizational operation are context rather than implementation gates. Technology selection rationale belongs in ADR, schedule and assignments belong in Work Plan, and detailed test strategy or case selection belongs in generated test skeletons.

**Required Structural Elements**:
- Existing repository evidence that constrains implementation decisions
- Technical approach and implementation approach decision
- Change surface and applicable interface/contract definitions
- Applicable standards with explicit/implicit classification
- Verification Strategy
  - Correctness proof method
  - Early verification point
  - Minimal form allowed for low-risk or self-evident changes: concise entries or explicit `N/A` with rationale
    Low-risk: one reversible change following an existing pattern with no external contract, integration, or data-flow changes
    Self-evident: internal-only refactoring with identical observable inputs and outputs

### Work Plan
**Purpose**: Implementation task management and progress tracking
**Scope**: Repository implementation outcomes from approved Design Docs, task dependencies, source section and acceptance-criteria references, executable verification, optional task-level false-green focus, and progress tracking only. The Work Plan references governing documents instead of reproducing their design details.

**Phase Division Criteria**:

- Follow the implementation approach and dependency order selected by the Design Doc
- Group implementation, tests, repository configuration, wiring, and documentation that reach the same observable verification point
- Put the Design Doc's early verification point in the earliest applicable phase
- Verify each task against its cited acceptance criteria

## Creation Process [MANDATORY]

**STEP 1**: **Problem Analysis** — Determine Structural Scale, applicable documents, and candidate technical decision points
**STEP 2**: **ADR Choice Check when candidates exist** — Retain in-scope topics whose selection requires comparison between at least two credible materially distinct options and has durable impact
**STEP 3**: **Creation** — Create each applicable document from its template; complete every qualifying ADR file before ADR review
**STEP 4**: **Approval** — Review applicable artifacts and obtain user approval; supply the complete ADR path set to one review and one approval request

**ENFORCEMENT**: Begin implementation when the documents required for the relevant scale are approved.

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

## AI Automation Rules [MANDATORY]
- Apply the Choice filter before the Durability filter and independently from Structural Scale
- Check existing ADRs that govern the changed responsibility
- Create one ADR per decision point that passes both filters, then review the complete batch together

## Diagram Requirements

| Document | Required Diagrams | Purpose |
|----------|------------------|---------|
| PRD | User journey or scope boundary when prose does not make the relationship clear | Clarify a material experience or scope relationship |
| ADR | Option comparison when option relationships are not clear in the table | Visualize trade-offs |
| UI Spec | Screen transition or component tree when the material interaction or hierarchy remains unclear in prose/tables | Clarify screen flow and structure |
| Design Doc | Architecture or data flow when the changed relationships are not clear in prose/tables | Understand technical structure |
| Work Plan | Task dependency when order is not evident | Clarify implementation order |

## Common ADR Relationships
1. **At creation**: Identify common technical areas, reference existing common ADRs
2. **When missing**: Consider creating necessary common ADRs
3. **Design Doc**: Specify common ADRs in "Prerequisite ADRs" section
4. **Compliance check**: Verify design aligns with common ADR decisions
