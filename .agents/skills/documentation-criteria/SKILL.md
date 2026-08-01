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
- **[task-template.md](references/task-template.md)** - Task file template for implementation tasks

## Creation Decision Matrix [MANDATORY]

| Condition | Required Documents | Creation Order |
|-----------|-------------------|----------------|
| Large new feature (backend) | PRD -> [ADR] -> Design Doc -> Work Plan | After PRD approval |
| Large new feature (frontend/fullstack) | PRD -> **UI Spec** -> [ADR] -> Design Doc -> Work Plan | UI Spec before Design Doc |
| ADR Conditions Met (see below) | ADR -> Design Doc -> Work Plan | Start immediately |
| Large structural scale | PRD -> [ADR if conditions apply] -> Design Doc -> Work Plan | After PRD approval |
| Medium structural scale | Design Doc -> Work Plan (REQUIRED) | Start immediately |
| Small structural scale | None | Direct implementation |

**ENFORCEMENT**: EVALUATE structural scale and ADR conditions BEFORE starting implementation

## Structural Scale

Classify the decision burden, not repository layout. File count is supporting evidence only.

| Scale | Structural condition |
|-------|----------------------|
| Small | One coherent outcome follows existing patterns, stays within one responsibility boundary, and is easy to reverse |
| Medium | One coherent outcome coordinates across a boundary or requires a durable design decision |
| Large | Multiple independently valuable outcomes, separate layer-specific designs, or a staged migration/rollout must converge |

An ADR condition makes the work at least Medium because it creates a durable decision. It does not by itself make the work Large. Choose Large only when the work must be decomposed into separately designed or staged outcomes.

## ADR Creation Conditions [MANDATORY if Any Apply]

### 1. Contract System Changes
- **Adding nested contracts with 3+ levels**
- **Changing/deleting contracts used in 3+ locations**
- **Contract responsibility changes** (e.g., DTO to Entity, Request to Domain)

### 2. Data Flow Changes
- **Storage location changes** (DB to File, Memory to Cache)
- **Processing order changes with 3+ steps**
- **Data passing method changes** (parameter passing to shared state, direct reference to event-based)

### 3. Architecture Changes
- Layer addition, responsibility changes, component relocation

### 4. External Dependency Changes
- Library/framework/external API introduction or replacement

### 5. Complex Implementation Logic (Regardless of Scale)
- Managing 3+ states
- Coordinating 5+ asynchronous processes

## Detailed Document Definitions

### PRD (Product Requirements Document)
**Purpose**: Define business requirements and user value
**Scope**: Business requirements, user value, success metrics, user stories, converged MVP requirements, Future/Out of Scope capabilities with reasons, user journey diagram, scope boundary diagram, and acceptance criteria with sequential IDs (for example `AC-001`, `AC-002`, continuing across all requirements in the document) only. Technical implementation details belong in Design Doc, technical decision rationale in ADR, and implementation phases or task breakdown belong in Work Plan.

### ADR (Architecture Decision Record)
**Purpose**: Record technical decision rationale and background
**Scope**: Decision, rationale, option comparison (minimum 3 options), architecture impact, and principled implementation guidance only. Implementation procedures and code examples belong in Design Doc, while schedule and resource assignments belong in Work Plan.

### UI Specification
**Purpose**: Define UI structure, screen transitions, component decomposition, and interaction design
**Scope**: Screen list and transitions, component state x display matrix, component decomposition, interaction definitions, AC traceability, existing component reuse map, visual acceptance criteria, and accessibility requirements only. Technical implementation and API contracts belong in Design Doc, test implementation belongs in generated test skeletons, and schedule belongs in Work Plan.

### Design Document
**Purpose**: Define technical implementation methods in detail
**Scope**: Existing codebase analysis, technical approach, dependencies and constraints, interface and contract definitions, data flow, acceptance criteria, change impact map, code inspection evidence, and verification strategy only. Technology selection rationale belongs in ADR, schedule and assignments belong in Work Plan, and detailed test strategy or case selection belongs in generated test skeletons.

**Required Structural Elements**:
- Existing codebase analysis and code inspection evidence
- Technical approach and implementation approach decision
- Change impact map and interface/contract definitions
- Applicable standards with explicit/implicit classification
- Verification Strategy
  - Correctness proof method
  - Early verification point
  - Minimal form allowed for low-risk or self-evident changes: concise entries or explicit `N/A` with rationale
    Low-risk: one reversible change following an existing pattern with no external contract, integration, or data-flow changes
    Self-evident: internal-only refactoring with identical observable inputs and outputs

### Work Plan
**Purpose**: Implementation task management and progress tracking
**Scope**: Task breakdown, dependencies, schedule estimates, test skeleton file paths, Verification Strategy summaries from each Design Doc, Design-to-Plan Traceability mapping for implementation-relevant technical requirements, Reference Contract Values for binding observable Design Doc values, ADR Bindings for implementation-binding ADR decisions, final Quality Assurance phase, and progress tracking only. Technical rationale belongs in ADR and design details belong in Design Doc.

**Phase Division Criteria**:

**When Vertical Slice is selected**:
- Each phase represents one value unit and includes its own implementation and verification
- The earliest phase should contain the early verification point when defined
- Final phase is always Quality Assurance

**When Horizontal Slice is selected**:
1. **Phase 1: Foundation Implementation** - Contract definitions, interfaces, test preparation
2. **Phase 2: Core Feature Implementation** - Business logic, unit tests
3. **Phase 3: Integration Implementation** - External connections, presentation layer
4. **Final Phase: Quality Assurance (Required)** - Acceptance criteria, all tests, quality checks

**When Hybrid is selected**:
- Combine vertical and horizontal phase structures as defined in the Design Doc
- Final phase is always Quality Assurance with acceptance criteria verification, all tests passing, and quality checks complete

## Creation Process [MANDATORY]

**STEP 1**: **Problem Analysis** — Change scale assessment, ADR condition check
**STEP 2**: **ADR Option Consideration** (ADR only) — Compare 3+ options, specify trade-offs
**STEP 3**: **Creation** — Use templates, include measurable conditions
**STEP 4**: **Approval** — "Accepted" after review enables implementation

**ENFORCEMENT**: Implementation CANNOT begin without approved documents for the relevant scale

## Storage Locations

| Document | Path | Naming Convention |
|----------|------|------------------|
| PRD | `docs/prd/` | `[feature-name]-prd.md` |
| ADR | `docs/adr/` | `ADR-[4-digits]-[title].md` |
| UI Spec | `docs/ui-spec/` | `[feature-name]-ui-spec.md` |
| Design Doc | `docs/design/` | `[feature-name]-design.md` |
| Work Plan | `docs/plans/` | `YYYYMMDD-{type}-{description}.md` |
| Task File | `docs/plans/tasks/` | `{plan-name}-task-{number}.md` |

## ADR Status
`Proposed` -> `Accepted` -> `Deprecated`/`Superseded`/`Rejected`

## AI Automation Rules [MANDATORY]
- Evaluate ADR conditions for every task; do not infer them from file count
- Contract/data flow change detected: ADR REQUIRED
- Check existing ADRs before implementation — ALWAYS verify alignment

## Diagram Requirements

| Document | Required Diagrams | Purpose |
|----------|------------------|---------|
| PRD | User journey, Scope boundary | Clarify user experience and scope |
| ADR | Option comparison (when needed) | Visualize trade-offs |
| UI Spec | Screen transition, Component tree | Clarify screen flow and structure |
| Design Doc | Architecture, Data flow | Understand technical structure |
| Work Plan | Phase structure, Task dependency | Clarify implementation order |

## Common ADR Relationships
1. **At creation**: Identify common technical areas, reference existing common ADRs
2. **When missing**: Consider creating necessary common ADRs
3. **Design Doc**: Specify common ADRs in "Prerequisite ADRs" section
4. **Compliance check**: Verify design aligns with common ADR decisions
