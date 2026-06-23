# [Feature Name] Design Document

## Overview

[Explain the purpose and overview of this feature in 2-3 sentences]

### Referenced UI Spec (when feature includes frontend)
- UI Spec path: [docs/ui-spec/xxx-ui-spec.md]
- Component structure and state design are inherited from UI Spec

## Design Summary (Meta)

```yaml
design_type: "new_feature|extension|refactoring"
risk_level: "low|medium|high"
complexity_level: "low|medium|high"
complexity_rationale: "[Required if medium/high: (1) which requirements/ACs necessitate this complexity, (2) which constraints/risks it addresses]"
main_constraints:
  - "[constraint 1]"
  - "[constraint 2]"
biggest_risks:
  - "[risk 1]"
  - "[risk 2]"
unknowns:
  - "[uncertainty 1]"
  - "[uncertainty 2]"
```

## Background and Context

### Prerequisite ADRs

- docs/adr/ADR-XXXX-title.md: [Related decision items]
- Reference common technical ADRs when applicable
- ADR placeholders use the repository ADR filename convention: replace `XXXX` with the four-digit ADR number and `title` with the file slug.

### External Resources Used

| Project Resource Label | Feature Identifier | Purpose |
|------------------------|--------------------|---------|
| frontend-design-origin | [screen / node / frame / route / story id] | [why this feature uses it] |
| api-schema-source | [endpoint / operation id / schema name] | [why this feature uses it] |
| infra-iac-source | [service / module / environment] | [why this feature uses it] |

### Agreement Checklist

#### Scope
- [ ] [Features/components to change]
- [ ] [Features to add]

#### Non-Scope (Explicitly not changing)
- [ ] [Features/components not to change]
- [ ] [Existing logic to preserve]

#### Constraints
- [ ] Parallel operation: [Yes/No]
- [ ] Backward compatibility: [Required/Not required]
- [ ] Performance measurement: [Required/Not required]

#### Applicable Standards
- [ ] [Standard/convention] `[explicit]` - Source: [config / rule file / documentation path]
- [ ] [Observed pattern] `[implicit]` - Evidence: [file paths] - Confirmed: [Yes/No]

#### Quality Assurance Mechanisms
How quality is enforced in the change area. Each item is either adopted for this change or noted with a reason.

- [ ] [Tool/check name] — Enforces: [what] — Config: [path] — Covers: [file paths/patterns or "project-wide"] — Status: `adopted` / `noted (reason)`
- [ ] [Domain-specific constraint] — Enforces: [what] — Source: [path] — Covers: [file paths/patterns or "project-wide"] — Status: `adopted` / `noted (reason)`

### Problem to Solve

[Specific problems or challenges this feature aims to address]

### Current Challenges

[Current system issues or limitations]

### Requirements

#### Functional Requirements

- [List mandatory functional requirements]

#### Non-Functional Requirements

- **Performance**: [Response time, throughput requirements]
- **Scalability**: [Requirements for handling increased load]
- **Reliability**: [Error rate, availability requirements]
- **Maintainability**: [Code readability and changeability]

## Acceptance Criteria (AC) - EARS Format

Each AC is written in EARS (Easy Approach to Requirements Syntax) format.

**EARS Keywords**:
| Keyword | Usage | Test Type |
|---------|-------|-----------|
| **When** | Event-triggered behavior | Event-driven test |
| **While** | State-dependent behavior | State condition test |
| **If-then** | Conditional behavior | Branch coverage test |
| (none) | Ubiquitous behavior | Basic functionality test |

**Format**: `[Keyword] <trigger/condition>, the system shall <expected behavior>`

### [Functional Requirement 1]

- [ ] **When** user clicks login button with valid credentials, the system shall authenticate and redirect to dashboard
- [ ] **If** credentials are invalid, **then** the system shall display error message "Invalid credentials"
- [ ] **While** user is logged in, the system shall maintain the session for configured timeout period

### [Functional Requirement 2]

- [ ] The system shall display data list with pagination of 10 items per page
- [ ] **When** input is entered in search field, the system shall apply real-time filtering

## Existing Codebase Analysis

### Implementation Path Mapping
| Type | Path | Description |
|------|------|-------------|
| Existing | src/[actual-path] | [Current implementation] |
| New | src/[planned-path] | [Planned new creation] |

### Integration Points (Include even for new implementations)
- **Integration Target**: [What to connect with]
- **Invocation Method**: [How it will be invoked]

### Dependency Verification
| Dependency | Status | Evidence |
|------------|--------|----------|
| [Service / hook / type / table / endpoint] | [verified-existing / requires-new-creation / external-dependency] | [path:line, search evidence, or authoritative external source] |

### Code Inspection Evidence

| File/Function | Relevance |
|---------------|-----------|
| [path:function] | [similar functionality / integration point / pattern reference] |

## Design

### Change Impact Map

```yaml
Change Target: [Component/feature to change]
Direct Impact:
  - [Files/functions requiring direct changes]
  - [Interface change points]
Indirect Impact:
  - [Data format changes]
  - [Processing time changes]
No Ripple Effect:
  - [Explicitly specify unaffected features]
```

### Interface Change Impact Analysis

Use this table for interface or contract compatibility decisions. Record what changes at the boundary and how compatibility is preserved.

| Existing Interface | New Interface | Conversion Required | Adapter / Wrapper Required | Compatibility Method |
|-------------------|---------------|---------------------|----------------------------|----------------------|
| [Function / method / props / contract] | [Function / method / props / contract] | [Yes / No] | [Required / Not Required] | [Adapter, wrapper, migration path, deprecation policy, or `-`] |

### Architecture Overview

[How this feature is positioned within the overall system]

### Data Flow

```
[Express data flow using diagrams or pseudo-code]
```

### Integration Points List

Use this table for runtime wiring, switching, or registration points. Record how the integration is connected and how the switching behavior is verified.

| Integration Point | Location | Old Implementation | New Implementation | Switching Method | Verification Method |
|-------------------|----------|-------------------|-------------------|------------------|---------------------|
| Integration Point 1 | [Class/Function] | [Existing Process] | [New Process] | [DI/Factory etc.] | [How this switching or integration will be verified] |

### Main Components

Repeat the block below for each component.

#### Component 1

- **Responsibility**: [Scope of responsibility for this component]
- **Interface**: [APIs and contract definitions provided]
- **Dependencies**: [Relationships with other components]

### Data Representation Decision (When Introducing New Structures)

| Criterion | Assessment | Reason |
|-----------|-----------|--------|
| Semantic Fit | [Yes/No] | [Does existing structure's meaning align?] |
| Responsibility Fit | [Yes/No] | [Same bounded context?] |
| Lifecycle Fit | [Yes/No] | [Same creation/mutation/deletion timing?] |
| Boundary/Interop Cost | [Low/Medium/High] | [Cost of sharing across boundaries?] |

**Decision**: [reuse / extend / new] -- [rationale in 1-2 sentences]

### Minimal Surface Alternatives (When Introducing Maintenance-Surface Elements)

One entry per new in-scope element as defined by coding-rules "Minimum Surface Terms". Mark this section as N/A with brief rationale when the design introduces no in-scope elements.

#### Element 1: [name of the new element]

**Step 1 - Fixed Requirements**
- [AC ID or constraint ID]: [requirement / constraint text]
- [AC ID or constraint ID]: [requirement / constraint text]

**Steps 2-3 - Alternatives Compared**

| Alternative | Current requirements covered (AC or constraint IDs) | New state introduced (count) | New concept / mode / flag / prop / variant (count) | Crosses component boundary (yes/no) | Breaking change or migration required (yes/no) | Subjective cost notes |
|-------------|------------------------------------------------------|------------------------------|------------------------------------|--------------------------------------|-------------------------------------------------|-----------------------|
| [The added element as proposed] | | | | | | |
| [Subtractive alternative: derive / compute on demand / keep at caller / reuse existing / do not introduce new state] | | | | | | |
| [Optional third alternative] | | | | | | |

**Step 4 - Selected Alternative and Rationale**
- **Selected**: [alternative name]
- **Rationale**:
  - If selected = smallest alternative considered: state "smallest alternative considered; no further reduction available"
  - If selected > smallest: name the current requirement(s) from step 1 that smaller alternatives fail to satisfy

**Step 5 - Rejected Alternatives Log**
- [Alternative name]: [1-2 lines on what it was and why rejected]
- [Alternative name]: [1-2 lines on what it was and why rejected]

(Repeat the Element block above for each additional in-scope element.)

Rejected Alternatives Log is element-level. Future Extensibility below is design-level.

### Contract Definitions

```
// Record major contract/interface definitions here
```

### Data Contracts

#### [Component or Boundary] (repeat per component/boundary)

```yaml
Contract: [interface / function / API / schema name]
Input:
  Type: [Data shape, contract, or schema]
  Preconditions: [Required items, format constraints]
  Validation: [Validation method]

Output:
  Type: [Data shape, contract, or schema]
  Guarantees: [Conditions that must always be met]
  On Error: [Exception/null/default value]

Invariants:
  - [Conditions that remain unchanged before and after processing]
```

### Observable Contract Values (When Applicable)

Use this section when the design defines observable values the implementation must reproduce exactly. Omit it when the Design Doc has no such values.

| Contract Type | Required Observable Value |
|---------------|---------------------------|
| structure-order / derived-display / state-lifecycle-negative | [Exact column/field/label set and order, derived display rule, or condition where persisted/restored/cached/derived/client/session/UI state remains unused, including reset/clear behavior that returns state to its unused/default value] |

### Test Boundaries

#### Mock Boundary Decisions

| Dependency / Boundary | Test Level | Use Real Dependency | Isolation Method | Rationale |
|-----------------------|------------|---------------------|------------------|-----------|
| [Repository / API / queue / hook] | [integration / e2e] | [Yes / No] | [mock / fake / local test env / browser harness] | [Why this boundary should behave this way in tests] |

#### Data Layer Verification Strategy

- Data storage involved: [Yes / No]
- Schema or model references: [table / collection / model names or N/A]
- Real verification approach: [container DB / dedicated test DB / in-memory adapter / browser fixture / N/A]
- Query and repository coverage: [How repository, ORM, or query paths will be verified]
- Migration compatibility check: [How schema drift will be detected or why N/A]

### Field Propagation Map (When Fields Cross Boundaries)

A boundary includes a serialized boundary: a value encoded on one side and parsed on the other through a medium such as a query string, CLI argument, environment variable, config entry, message payload, storage key, or file. For those rows, record the exact encoded representation and how the consumer parses it. Use "-" only when the row is not a serialized boundary.

| Field | Boundary | Status | Serialized Format | Consumer Parse Rule | Detail |
|-------|----------|--------|-------------------|---------------------|--------|
| [field name] | [Component A to B] | preserved / transformed / dropped | [exact representation the producer emits when serialized; "-" otherwise] | [how the consumer decodes and validates it; "-" otherwise] | [logic or reason] |

## Verification Strategy

Verification Strategy defines what correctness means and how to prove it at design time. L1/L2/L3 (from implementation-approach) define task-level verification depth at execution time.
Use the minimal form only when the change is low-risk or the verification path is self-evident. Otherwise fill all fields concretely.
Low-risk: changes affecting 1-2 files with no external contract, integration, or data-flow changes.
Self-evident: internal-only refactoring with identical observable inputs and outputs.

### Correctness Proof Method

- **Correctness definition**: [What "correct" means for this change]
- **Target comparison**: [What is being compared or validated against what]
- **Verification method**: [How correctness will be verified]
- **Observable success indicator**: [What observable result proves the verification succeeded]
- **Verification timing**: [`phase_1` | `per_phase` | `integration_phase` | `final_phase`]
- **Timing note**: [Optional free-text clarification when the enum alone is insufficient]

### Early Verification Point

- **First verification target**: [The smallest unit that proves the approach works]
- **Success criteria**: [Observable outcome that proves correctness]
- **Failure response**: [What to do if early verification fails]

### Output Comparison (When Changing Existing Observable Behavior, an External Contract, or a Persisted Data Shape)

- **Comparison input**: [Identical input used for both the current and new implementation]
- **Expected output fields**: [Specific fields, columns, or output format to compare]
- **Diff method**: [How the outputs are compared, such as field-by-field diff, file diff, or snapshot comparison]
- **Transformation pipeline coverage**: [Map each listed step from codebase analysis `dataTransformationPipelines` to the comparison that verifies its output. If a step passes data through unchanged, mark it excluded with rationale]

Mark as `N/A` with a brief rationale only when the change does not alter existing observable behavior, an external contract, or a persisted data shape.

### State Transitions and Invariants (When Applicable)

```yaml
State Definition:
  - Initial State: [Initial values and conditions]
  - Possible States: [List of states]

State Transitions:
  Current State -> Event -> Next State

System Invariants:
  - [Conditions that hold in any state]
```

### UI Error State Design (when feature includes frontend)

| Component / Screen | Loading | Empty | Error | Partial |
|-------------------|---------|-------|-------|---------|
| [Component name] | [Skeleton / spinner] | [Empty state + CTA] | [Error message + Retry] | [Cached display + Banner] |

### Client State Design (when feature includes frontend)

| State Category | State | Management Method | Sync Strategy | Reset/Clear Behavior |
|---------------|-------|-------------------|---------------|----------------------|
| Server state | [Fetched data] | [Cache library / custom hook] | [Polling / WebSocket / manual refresh] | [Cleared on clear-all / preserved] |
| Local UI state | [Modal open, tab selection] | [useState / useReducer] | - | [Reset to default / preserved] |
| Temporary state | [Form input, draft] | [useState / form library] | [Auto-save / manual save] | [Cleared on reset / persisted] |

Fill `Reset/Clear Behavior` when the feature has a reset or clear-all operation. A state that must return to its unused/default value on reset is a `state-lifecycle-negative` observable contract.

### UI Action - API Contract Mapping (when feature includes frontend)

| UI Action | API Endpoint | Request | Response | Error Contract |
|-----------|-------------|---------|----------|----------------|
| [Button click / form submit] | [POST /api/xxx] | [Request body fields] | [Response fields] | [Error codes and UI handling] |

### Error Handling

| Error Category | Example | Detection | Recovery Strategy | User Impact |
|---------------|---------|-----------|-------------------|-------------|
| [Validation / External / Infrastructure / Business logic] | [Specific error] | [How detected] | [Retry / Fallback / Propagate / Log-and-continue] | [User-facing message or silent handling] |

### Logging and Monitoring

- **Log events**: [Key events to log: state transitions, external calls, error occurrences, performance thresholds]
- **Log levels**: [Which events use DEBUG / INFO / WARN / ERROR]
- **Sensitive data**: [Fields to mask or exclude; align with Security Considerations]
- **Monitoring**: [Metrics to track, alert thresholds, dashboard requirements]

## Implementation Plan

### Implementation Approach

**Selected Approach**: [Approach name or combination]
**Selection Reason**: [Reason considering project constraints and technical dependencies]

### Technical Dependencies and Implementation Order

#### Required Implementation Order
1. **[Component/Feature A]**
   - Technical Reason: [Why this needs to be implemented first]
   - Dependent Elements: [Other components that depend on this]

2. **[Component/Feature B]**
   - Technical Reason: [Technical necessity to implement after A]
   - Prerequisites: [Required pre-implementations]

### Migration Strategy

[Technical migration approach, ensuring backward compatibility]

## Security Considerations

Evaluate the following for this feature's trust boundaries and data flow:

- **Authentication & Authorization**: What authentication is required for new entry points? What authorization checks protect resource access?
- **Input Validation**: Where does external input enter the system? How is it validated before processing?
- **Sensitive Data Handling**: What data requires protection (encryption, masking, access control)? What data is safe to include in logs and error responses?

Mark items as N/A with brief rationale when the feature has no relevant trust boundary.

## Future Extensibility

This section records what was excluded from the current design surface. Speculative inclusions belong in a separate proposal.

- **Deferred possibilities**: [Capabilities considered during design and explicitly excluded from the current design surface. Each entry names either the current requirement it would have served, or marks itself as speculative]
- **Intentional limitations**: [What was deliberately kept small and why]
- **Extension points (existing, with current consumers)**: [Interfaces or hooks already in use by named current consumers. Each entry names a current consumer]

## Alternative Solutions

### Alternative 1

- **Overview**: [Description of alternative solution]
- **Advantages**: [Advantages]
- **Disadvantages**: [Disadvantages]
- **Reason for Rejection**: [Why it wasn't adopted]

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Countermeasure] |

## References

- [Related documentation and links]

## Update History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| YYYY-MM-DD | 1.0 | Initial version | [Name] |
