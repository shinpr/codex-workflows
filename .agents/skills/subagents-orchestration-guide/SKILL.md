---
name: subagents-orchestration-guide
description: "Guides subagent coordination through implementation workflows. Use when: orchestrating multiple agents, managing workflow phases, determining autonomous execution mode, or coordinating recipe execution."
---

# Subagents Orchestration Guide

## Role: The Orchestrator

**The orchestrator coordinates subagents like a conductor -- directing the musicians without playing the instruments.**

All investigation, analysis, and implementation work flows through specialized subagents.

### Prompt Construction Rule
Every subagent prompt must include:
1. Input deliverables with file paths (from previous step or prerequisite check)
2. Expected action (what the agent should do)

Construct the prompt from the agent's Input Parameters section and the deliverables available at that point in the flow.

### Automatic Responses

| Trigger | Action |
|---------|--------|
| New task | Spawn **requirement-analyzer** |
| Flow in progress | Check scale determination table for next subagent |
| Phase completion | Spawn the appropriate agent |
| Stop point reached | Wait for user approval |

### First Action Rule [MANDATORY]

To accurately analyze user requirements, pass them directly to requirement-analyzer and determine the workflow based on its analysis results.

**ENFORCEMENT**: MUST spawn requirement-analyzer as first action for every new task

## Decision Flow When Receiving Tasks

```
Receive New Task -> Analyze requirements with requirement-analyzer
                 -> Scale assessment
                 -> Execute flow based on scale
```

**During flow execution, determine next subagent according to scale determination table**

### Requirement Change Detection During Flow [MANDATORY]

**During flow execution**, if detecting the following in user response, MUST stop flow and go to requirement-analyzer:
- Mentions of new features/behaviors (additional operation methods, display on different screens, etc.)
- Additions of constraints/conditions (data volume limits, permission controls, etc.)
- Changes in technical requirements (processing methods, output format changes, etc.)

**ENFORCEMENT**: If any one applies — MUST restart from requirement-analyzer with integrated requirements

## Available Subagents

The following subagents are available:

### Implementation Support Agents
1. **quality-fixer**: Self-contained processing for overall quality assurance and fixes until completion
2. **task-decomposer**: Appropriate task decomposition of work plans
3. **task-executor**: Individual task execution and structured response
4. **integration-test-reviewer**: Review integration/E2E tests for skeleton compliance and quality
5. **security-reviewer**: Security compliance review against Design Doc and coding-rules after all tasks complete

### Document Creation Agents
6. **requirement-analyzer**: Requirement analysis and work scale determination
7. **codebase-analyzer**: Existing codebase analysis before Design Doc creation
8. **prd-creator**: Product Requirements Document creation
9. **ui-spec-designer**: UI Specification creation from PRD and optional prototype code (frontend/fullstack features)
10. **technical-designer**: ADR/Design Doc creation
11. **work-planner**: Work plan creation from Design Doc and test skeletons
12. **document-reviewer**: Single document quality and rule compliance check
13. **code-verifier**: Document-code consistency verification for review inputs
14. **design-sync**: Design Doc consistency verification across multiple documents
15. **acceptance-test-generator**: Generate integration and E2E test skeletons from Design Doc ACs

## Orchestration Principles

### Task Assignment with Responsibility Separation [MANDATORY]

Assign work based on each subagent's responsibilities:

**What to spawn task-executor for**:
- Implementation work and test addition
- Confirmation of added tests passing (existing tests are not covered)
- Spawn quality-fixer exclusively for quality assurance

**What to spawn quality-fixer for**:
- Overall quality assurance (static analysis, style check, all test execution, etc.)
- Complete execution of quality error fixes
- Self-contained processing until fix completion
- Final approved judgment (only after fixes are complete)

## Constraints Between Subagents [MANDATORY]

Subagents CANNOT directly call other subagents — all coordination MUST flow through the orchestrator.

**ENFORCEMENT**: Direct subagent-to-subagent communication is PROHIBITED

## How to Spawn Agents

Spawn agents using natural language prompts. Provide clear context about what the agent should accomplish.

### Spawn Examples

**requirement-analyzer**:
> "Analyze the following requirements and determine the work scale: [user requirements]. Perform requirement analysis and scale determination."

**codebase-analyzer**:
> "Analyze the existing codebase to provide evidence for Design Doc creation. Focus on existing implementations, data model elements, and constraints the design should respect. requirement_analysis: [JSON]. prd_path: [path if available]. requirements: [original user requirements]. layer: [target layer if applicable]. target_paths: [paths if narrowed]. Return codebase facts and focus areas."

**task-executor**:
> "Execute the implementation task defined in docs/plans/tasks/[filename].md. Complete the implementation following TDD Red-Green-Refactor."

**quality-fixer**:
> "Run quality checks on the codebase: static analysis, style check, all test execution. Fix any issues found and report when all checks pass."

**document-reviewer**:
> "Review the document at [path] for quality and rule compliance. Check against documentation-criteria standards."

**design-sync**:
> "Verify consistency between Design Docs in docs/design/. Use [path] as the source document for comparison."

## Explicit Stop Points [MANDATORY]

Autonomous execution MUST stop and wait for user input at these points.

| Phase | Stop Point | User Action Required |
|-------|------------|---------------------|
| Requirements | After requirement-analyzer completes | Confirm requirements / Answer questions |
| PRD | After document-reviewer completes PRD review | Approve PRD |
| UI Spec | After document-reviewer completes UI Spec review (frontend/fullstack) | Approve UI Spec |
| ADR | After document-reviewer completes ADR review (if ADR created) | Approve ADR |
| Design | After design-sync completes consistency verification | Approve Design Doc |
| Work Plan | After work-planner creates plan | Batch approval for implementation phase |

**ENFORCEMENT**: After batch approval, autonomous execution proceeds without stops until completion or escalation. Skipping stop points is a CRITICAL VIOLATION.

### Approval Status Vocabulary [MANDATORY]

All agents MUST use this vocabulary consistently:

| Status | Scope | Meaning | Next Action |
|--------|-------|---------|-------------|
| `approved` | All agents | All criteria met | Proceed to next phase |
| `approved_with_conditions` | Document agents | Criteria met with minor open items | Proceed — carry conditions as input to next phase |
| `approved_with_notes` | security-reviewer | Only hardening/policy findings | Proceed — include notes in completion report (no resolution required) |
| `needs_revision` | All agents | Significant issues found | Return to author agent for revision (max 2 iterations) |
| `rejected` | Document agents | Fundamental problems | Halt workflow, escalate to user |
| `blocked` | security-reviewer | Committed secrets or high-confidence exploitable risk | Halt workflow immediately, escalate to user (requires human intervention) |
| `skipped` | All agents | Preconditions not met for this step | Report reason, proceed |

**approved_with_conditions handling** (document agents):
- Conditions MUST be listed explicitly in the agent's output
- Orchestrator MUST append conditions to the document's "Undetermined Items" or "Open Items" section before proceeding
- Orchestrator MUST pass conditions to the next phase's agent as context
- Conditions do not block progression but MUST be resolved before implementation phase

**approved_with_notes handling** (security-reviewer):
- Notes are informational — they do NOT require resolution before proceeding
- Orchestrator MUST include notes in the completion report for awareness
- Do not apply approved_with_conditions handling (no resolution tracking)

**ENFORCEMENT**: Using any status value outside this vocabulary is a VIOLATION.

## Scale Determination and Document Requirements

| Scale | File Count | PRD | ADR | Design Doc | Work Plan |
|-------|------------|-----|-----|------------|-----------|
| Small | 1-2 | Update* | Not needed | Not needed | Simplified |
| Medium | 3-5 | Update* | Conditional** | **Required** | **Required** |
| Large | 6+ | **Required*** | Conditional** | **Required** | **Required** |

\* Update if PRD exists for the relevant feature
\*\* When there are architecture changes, new technology introduction, or data flow changes
\*\*\* New creation/update existing/reverse PRD (when no existing PRD)

## Structured Response Specification

Subagents respond in JSON format. The final response from each JSON-returning subagent must be the JSON payload itself, with no trailing prose. Key fields for orchestrator decisions:
- **requirement-analyzer**: scale, confidence, affectedLayers, adrRequired, scopeDependencies, questions
- **codebase-analyzer**: analysisScope, existingElements, dataModel, focusAreas, limitations
- **task-executor**: status (escalation_needed/completed), escalation_type (design_compliance_violation/similar_function_found/similar_component_found/investigation_target_not_found/out_of_scope_file/test_environment_not_ready), testsAdded, requiresTestReview
- **quality-fixer**: status (approved/blocked). For blocked responses, discriminate by `reason`: specification conflicts use `blockingIssues[]`; execution prerequisites use `missingPrerequisites[]`, and each item provides its own `resolutionSteps`
- **document-reviewer**: verdict.decision (approved/approved_with_conditions/needs_revision/rejected)
- **code-verifier**: summary, discrepancies, reverseCoverage
- **design-sync**: sync_status (CONFLICTS_FOUND/NO_CONFLICTS) — text format with [SUMMARY] block
- **integration-test-reviewer**: status (approved/needs_revision/blocked), requiredFixes
- **security-reviewer**: status (approved/approved_with_notes/needs_revision/blocked), findings, notes, requiredFixes
- **acceptance-test-generator**: status, generatedFiles

## Handling Requirement Changes

### Handling Requirement Changes in requirement-analyzer
requirement-analyzer follows the "completely self-contained" principle and processes requirement changes as new input.

#### How to Integrate Requirements

**Important**: To maximize accuracy, integrate requirements as complete sentences, including all contextual information communicated by the user.

```yaml
Integration example:
  Initial: "I want to create user management functionality"
  Addition: "Permission management is also needed"
  Result: "I want to create user management functionality. Permission management is also needed.

          Initial requirement: I want to create user management functionality
          Additional requirement: Permission management is also needed"
```

### Update Mode for Document Generation Agents
Document generation agents (work-planner, technical-designer, prd-creator) can update existing documents in `update` mode.

- **Initial creation**: Create new document in create (default) mode
- **On requirement change**: Edit existing document and add history in update mode

## Basic Flow for Work Planning

When receiving new features or change requests, start with requirement-analyzer.

### Large Scale (6+ Files) - 13 Steps (backend) / 15 Steps (frontend/fullstack)

1. requirement-analyzer: Requirement analysis + Check existing PRD **[Stop]**
2. prd-creator: PRD creation
3. document-reviewer: PRD review **[Stop: PRD Approval]**
4. **(frontend/fullstack only)** Ask user for prototype code; ui-spec-designer: UI Spec creation
5. **(frontend/fullstack only)** document-reviewer: UI Spec review **[Stop: UI Spec Approval]**
6. technical-designer: ADR creation (if architecture/technology/data flow changes)
7. document-reviewer: ADR review (if ADR created) **[Stop: ADR Approval]**
8. codebase-analyzer: Codebase analysis (pass requirement-analyzer output and PRD path when available)
9. technical-designer: Design Doc creation
10. code-verifier: Design Doc verification against code
11. document-reviewer: Design Doc review with code verification evidence
12. design-sync: Consistency verification **[Stop: Design Doc Approval]**
13. acceptance-test-generator: Test skeleton generation, pass to work-planner
14. work-planner: Work plan creation **[Stop: Batch approval]**
15. task-decomposer: Autonomous execution to Completion report

### Medium Scale (3-5 Files) - 9 Steps (backend) / 11 Steps (frontend/fullstack)

1. requirement-analyzer: Requirement analysis **[Stop]**
2. codebase-analyzer: Codebase analysis
3. **(frontend/fullstack only)** Ask user for prototype code; ui-spec-designer: UI Spec creation
4. **(frontend/fullstack only)** document-reviewer: UI Spec review **[Stop: UI Spec Approval]**
5. technical-designer: Design Doc creation
6. code-verifier: Design Doc verification against code
7. document-reviewer: Design Doc review with code verification evidence
8. design-sync: Consistency verification **[Stop: Design Doc Approval]**
9. acceptance-test-generator: Test skeleton generation, pass to work-planner
10. work-planner: Work plan creation **[Stop: Batch approval]**
11. task-decomposer: Autonomous execution to Completion report

### Design Flow Data Passing

- Pass requirement-analyzer output and original requirements to codebase-analyzer
- Pass codebase-analyzer JSON to technical-designer or technical-designer-frontend as `Codebase Analysis`
- Pass Design Doc path to code-verifier
- Pass code-verifier JSON to document-reviewer as `code_verification`

### Small Scale (1-2 Files) - 2 Steps

1. Create simplified plan **[Stop: Batch approval]**
2. Direct implementation to Completion report

## Autonomous Execution Mode

### Pre-Execution Environment Check

**Principle**: Verify subagents can complete their responsibilities

**Required environments**:
- Commit capability (for per-task commit cycle)
- Quality check tools (quality-fixer will detect and escalate if missing)
- Test runner (task-executor will detect and escalate if missing)

**If critical environment unavailable**: Escalate with specific missing component before entering autonomous mode

### Authority Grant

**After environment check passes**:
- Batch approval for entire implementation phase grants authority to agents
- task-executor: Implementation authority
- quality-fixer: Fix authority (automatic quality error fixes)

### Definition of Autonomous Execution Mode

After "batch approval for entire implementation phase" with work-planner, autonomously execute the following processes without human approval:

```
Batch approval -> Start autonomous execution mode
  -> task-decomposer: Task decomposition
  -> Task execution loop:
      -> task-executor: Implementation
      -> Escalation judgment:
          - escalation_needed/blocked -> Escalate to user
          - requiresTestReview: true -> integration-test-reviewer
              - needs_revision -> back to task-executor
              - approved -> quality-fixer
          - No issues -> quality-fixer
      -> quality-fixer: Quality check and fixes
      -> Orchestrator: Execute git commit
      -> Check remaining tasks:
          - Yes -> next task
          - No -> security-reviewer: Security review
              - approved/approved_with_notes -> Completion report
              - needs_revision -> layer-appropriate task-executor: Security fixes -> quality-fixer -> security-reviewer
              - blocked -> Escalate to user
```

### Conditions for Stopping Autonomous Execution

Stop autonomous execution and escalate to user in the following cases:

1. **Escalation from subagent**: When receiving `status: "escalation_needed"` or `status: "blocked"`
2. **Requirement change detected**: Any match in requirement change detection checklist
3. **Work-planner update restriction violated**: Requirement changes after task-decomposer starts require overall redesign
4. **User explicitly stops**: Direct stop instruction or interruption

### Task Management: 4-Step Cycle

**Per-task cycle**:
1. task-executor: Implementation
2. Check task-executor response:
   - `escalation_needed` or `blocked`: Escalate to user
   - `requiresTestReview` is `true`: Execute integration-test-reviewer
     - `needs_revision`: Return to step 1 with requiredFixes
     - `approved`: Proceed to step 3
   - Otherwise: Proceed to step 3
3. quality-fixer: Quality check and fixes
4. git commit (on `status: "approved"`)

## Main Orchestrator Roles

1. **State Management**: Track current phase, each subagent's state, and next action
2. **Information Bridging**: Data conversion and transmission between subagents
   - Convert each subagent's output to next subagent's input format
   - **Always pass deliverables from previous process to next agent**
   - Extract necessary information from structured responses
   - Compose commit messages from changeSummary
   - Explicitly integrate initial and additional requirements when requirements change
3. **Quality Assurance and Commit Execution**: Execute git commit per the 4-step task cycle
4. **Autonomous Execution Mode Management**: Start/stop autonomous execution after approval, escalation decisions
5. **ADR Status Management**: Update ADR status after user decision (Accepted/Rejected)

### acceptance-test-generator to work-planner Bridge

**Pass to acceptance-test-generator**:
- Design Doc: [path]
- UI Spec: [path] (if exists)

**Orchestrator verification items**:
- Verify integration test file path retrieval and existence
- Verify E2E test file path retrieval and existence

**Pass to work-planner**:
- Integration test file: [path] (create and execute simultaneously with each phase implementation)
- E2E test file: [path] (execute only in final phase)

**On error**: Escalate to user if files are not generated

### Design Doc to Work Plan Verification Handoff

When a Design Doc contains a Verification Strategy section, the orchestrator must carry forward:
- Design Doc path
- Verification Strategy details:
  - Correctness definition
  - Target comparison
  - Verification method
  - Observable success indicator
  - Verification timing
  - Early verification point (first target, success criteria, failure response)

The resulting work plan must include this summary in its header so the plan remains self-sufficient for downstream task generation and execution planning.

## Important Constraints [MANDATORY]

- **Quality check is REQUIRED**: quality-fixer approval MUST be obtained before commit
- **Structured response REQUIRED**: Information transmission between subagents MUST use JSON format
- **Approval management**: Document creation -> Execute document-reviewer -> Get user approval before proceeding
- **Flow confirmation**: After getting approval, MUST check next step with work planning flow (large/medium/small scale)
- **Consistency verification**: If subagent determinations contradict, MUST prioritize guidelines

**ENFORCEMENT**: Violating ANY constraint requires immediate correction

## Required Dialogue Points with Humans [MANDATORY]

### Basic Principles
- **Stopping is REQUIRED**: MUST wait for human response at stop points
- **Confirmation then Agreement cycle**: After document generation, proceed to next step after agreement or fix instructions in update mode
- **Specific questions**: Make decisions easy with options (A/B/C) or comparison tables

## Action Checklist

When receiving a task, check the following:

- [ ] Confirmed if there is an orchestrator instruction
- [ ] Determined task type (new feature/fix/research, etc.)
- [ ] Considered appropriate subagent utilization
- [ ] Decided next action according to decision flow
- [ ] Monitored requirement changes and errors during autonomous execution mode

## References

- `references/monorepo-flow.md`: Fullstack (monorepo) orchestration flow
