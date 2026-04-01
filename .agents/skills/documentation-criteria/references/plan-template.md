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
- [ ] Task 1: Specific work content
- [ ] Task 2: Verification for this value unit
- [ ] Quality check: Implement staged quality checks (refer to ai-development-guide skill)

#### Phase Completion Criteria
- [ ] Early verification point passed
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]

### Phase 2: [Value Unit 2] (Estimated commits: X)
**Purpose**: [Subsequent slice]
**Verification**: [Verification for this value unit]

#### Tasks
- [ ] Task 1: Specific work content
- [ ] Task 2: Verification for this value unit
- [ ] Quality check

#### Phase Completion Criteria
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]

### Option B: Horizontal Slice Phase Structure

Use when implementation approach is Horizontal Slice. Phases follow Foundation -> Core -> Integration -> QA.

### Phase 1: [Foundation] (Estimated commits: X)
**Purpose**: Contract definitions, interfaces, test preparation

#### Tasks
- [ ] Task 1: Specific work content
- [ ] Task 2: Specific work content
- [ ] Quality check: Implement staged quality checks (refer to ai-development-guide skill)
- [ ] Unit tests: All related tests pass

#### Phase Completion Criteria
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]

### Phase 2: [Core Feature] (Estimated commits: X)
**Purpose**: Business logic, unit tests

#### Tasks
- [ ] Task 1: Specific work content
- [ ] Task 2: Specific work content
- [ ] Quality check
- [ ] Integration tests: Verify overall feature functionality

#### Phase Completion Criteria
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]

### Phase 3: [Integration] (Estimated commits: X)
**Purpose**: External connections, presentation layer

#### Tasks
- [ ] Task 1: Specific work content
- [ ] Task 2: Specific work content
- [ ] Quality check
- [ ] Integration tests: Verify component coordination

#### Phase Completion Criteria
- [ ] [Functional completion criteria]
- [ ] [Quality completion criteria]

### Final Phase: Quality Assurance (Required) (Estimated commits: 1)
This phase is required for all implementation approaches.

**Purpose**: Cross-cutting quality assurance and Design Doc consistency verification

#### Tasks
- [ ] Verify all Design Doc acceptance criteria achieved
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
