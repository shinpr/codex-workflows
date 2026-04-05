# Work Plan: [Feature Name] Implementation

Created Date: YYYY-MM-DD
Type: feature|fix|refactor
Estimated Duration: X days
Estimated Impact: X files
Related Issue/PR: #XXX (if any)

## Related Documents
- Design Doc(s):
  - [docs/design/XXX.md]
  - [docs/design/YYY.md] (if multiple, e.g. backend + frontend)
- ADR: [docs/adr/ADR-XXXX.md] (if any)
- PRD: [docs/prd/XXX.md] (if any)

## Verification Strategies (from Design Docs)

Repeat this block for each Design Doc when multiple Design Docs exist. Preserve each strategy's identity and source document path. Merge strategies only when the Design Docs explicitly define a shared one.

### Verification Strategy: [docs/design/XXX.md]

#### Correctness Proof Method
- **Correctness definition**: [extracted from Design Doc]
- **Target comparison**: [extracted from Design Doc]
- **Verification method**: [extracted from Design Doc]
- **Observable success indicator**: [extracted from Design Doc]
- **Verification timing**: [`phase_1` | `per_phase` | `integration_phase` | `final_phase`]
- **Timing note**: [optional clarification]

#### Early Verification Point
- **First verification target**: [extracted from Design Doc]
- **Success criteria**: [extracted from Design Doc]
- **Failure response**: [extracted from Design Doc]

## Design-to-Plan Traceability

Map each Design Doc technical requirement to the task or phase that covers it. Use one row per extracted requirement item. Every row must have at least one covering task, or an explicit justified gap.

| Source Design Doc | DD Section | DD Item | Category | Covered By Task(s) | Gap Status | Notes |
|-------------------|------------|---------|----------|--------------------|------------|-------|
| [docs/design/xxx-design.md] | [Section name] | [Specific implementation-relevant item] | impl-target / connection-switching / contract-change / verification / prerequisite / scope-boundary | [P1-T1, P1-T2] | covered | |

**Category values**: `impl-target` (implementation target), `connection-switching` (connection, switching, registration, dependency wiring), `contract-change` (interface change and propagation across boundaries), `verification` (verification method, test boundary, comparison point), `prerequisite` (migration, setup, security, environment preparation), `scope-boundary` (explicit non-target or no-ripple boundary that must remain unchanged)

**Gap Status values**: `covered` (mapped to one or more tasks), `gap` (no task exists yet; include justification in Notes and require user confirmation before plan approval)

**Task ID format**:
- Implementation tasks: `P<phase-number>-T<task-number>` such as `P1-T1`, `P2-T3`
- Phase completion tasks: `P<phase-number>-COMPLETE` such as `P1-COMPLETE`
- Final quality task: `FINAL-QA`
- Multiple covering tasks: comma-separated IDs in display order, for example `P1-T1, P1-T2`

**DD Item normalization rules**:
- One row = one independently plannable obligation that can be covered, deferred, or verified without relying on a hidden sub-obligation
- Split compound obligations joined by `and`, `or`, or separate boundary crossings when they can be implemented or verified independently
- Normalize same-boundary field propagation into one row when the fields must move together through the same boundary for the same reason
- Merge duplicate restatements of the same obligation from multiple DD sections into one row and cite the primary section in `DD Section`
- Keep `scope-boundary` rows concrete: name the protected file group, component boundary, contract, or workflow that must remain unchanged

## Objective
[Why this change is necessary, what problem it solves]

## Background
[Current state and why changes are needed]

## Risks and Countermeasures

### Technical Risks
- **Risk**: [Risk description]
  - **Impact**: [Impact assessment]
  - **Countermeasure**: [How to address it]

### Schedule Risks
- **Risk**: [Risk description]
  - **Impact**: [Impact assessment]
  - **Countermeasure**: [How to address it]

## Implementation Phases

Select one phase structure based on the implementation approach from the Design Doc.
Delete every unused option before finalizing the work plan. The final document must contain only the selected phase structure.

### Option A: Vertical Slice Phase Structure

Use when implementation approach is Vertical Slice. Each phase represents one value unit and includes its own verification.

### Phase 1: [Value Unit 1] (Estimated commits: X)
**Purpose**: [First slice that proves the approach works]
**Verification**: [Use the early verification point when applicable]

#### Tasks
- [ ] [P1-T1] Specific work content
- [ ] [P1-T2] Verification for this value unit
- [ ] Quality check: Implement staged quality checks (refer to ai-development-guide skill)

#### Phase Completion Criteria
- [ ] Early verification point passed
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]
- [ ] [P1-COMPLETE] Phase completion verification recorded

### Phase 2: [Value Unit 2] (Estimated commits: X)
**Purpose**: [Subsequent slice]
**Verification**: [Verification for this value unit]

#### Tasks
- [ ] [P2-T1] Specific work content
- [ ] [P2-T2] Verification for this value unit
- [ ] Quality check

#### Phase Completion Criteria
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]
- [ ] [P2-COMPLETE] Phase completion verification recorded

### Option B: Horizontal Slice Phase Structure

Use when implementation approach is Horizontal Slice. Phases follow Foundation -> Core -> Integration -> QA.

### Phase 1: [Foundation] (Estimated commits: X)
**Purpose**: Contract definitions, interfaces, test preparation

#### Tasks
- [ ] [P1-T1] Specific work content
- [ ] [P1-T2] Specific work content
- [ ] Quality check: Implement staged quality checks (refer to ai-development-guide skill)
- [ ] Unit tests: All related tests pass

#### Phase Completion Criteria
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]
- [ ] [P1-COMPLETE] Phase completion verification recorded

### Phase 2: [Core Feature] (Estimated commits: X)
**Purpose**: Business logic, unit tests

#### Tasks
- [ ] [P2-T1] Specific work content
- [ ] [P2-T2] Specific work content
- [ ] Quality check
- [ ] Integration tests: Verify overall feature functionality

#### Phase Completion Criteria
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]
- [ ] [P2-COMPLETE] Phase completion verification recorded

### Phase 3: [Integration] (Estimated commits: X)
**Purpose**: External connections, presentation layer

#### Tasks
- [ ] [P3-T1] Specific work content
- [ ] [P3-T2] Specific work content
- [ ] Quality check
- [ ] Integration tests: Verify component coordination

#### Phase Completion Criteria
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]
- [ ] [P3-COMPLETE] Phase completion verification recorded

### Final Phase: Quality Assurance (Required) (Estimated commits: 1)
This phase is required for all implementation approaches.

**Purpose**: Cross-cutting quality assurance and Design Doc consistency verification

#### Tasks
- [ ] [FINAL-QA] Verify all Design Doc acceptance criteria achieved
- [ ] Security review: Verify security considerations from Design Doc are implemented
- [ ] Quality checks (types, lint, format)
- [ ] Execute all tests (including integration/E2E from test skeletons, when provided)
- [ ] Coverage 70%+
- [ ] Document updates

### Quality Assurance
- [ ] Implement staged quality checks (details: refer to ai-development-guide skill)
- [ ] All tests pass
- [ ] Static check pass
- [ ] Lint check pass
- [ ] Build success

## Completion Criteria
- [ ] All phases completed
- [ ] All integration/E2E tests passing (when test skeletons provided)
- [ ] Acceptance criteria manually verified (when test skeletons are not provided)
- [ ] Design Doc acceptance criteria satisfied
- [ ] Staged quality checks completed (zero errors)
- [ ] All tests pass
- [ ] Necessary documentation updated
- [ ] User review approval obtained

## Progress Tracking
### Phase 1
- Start: YYYY-MM-DD HH:MM
- Complete: YYYY-MM-DD HH:MM
- Notes: [Any special remarks]

### Phase 2
- Start: YYYY-MM-DD HH:MM
- Complete: YYYY-MM-DD HH:MM
- Notes: [Any special remarks]

## Notes
[Special notes, reference information, important points, etc.]
