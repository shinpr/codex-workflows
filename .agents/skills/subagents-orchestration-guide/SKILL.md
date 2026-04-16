---
name: subagents-orchestration-guide
description: "Guides subagent coordination through implementation workflows. Use when: orchestrating multiple agents, managing workflow phases, determining autonomous execution mode, or coordinating recipe execution."
---

# Subagents Orchestration Guide

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

## Role: The Orchestrator

The orchestrator coordinates subagents. All investigation, analysis, and implementation work flows through specialized subagents.

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
13. **code-verifier**: Document-code consistency verification for review inputs and post-implementation verification
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

### Subagent Completion Discipline [MANDATORY]

The orchestrator owns subagent completion. Base waiting decisions on assigned responsibility and observed state, not on an expectation of quick completion. Multi-step search, review, verification, generation, implementation, and quality work can run for extended periods.

Use this contract:
- Wait for required subagent outputs with `wait_agent`
- Keep the current task assignment while the subagent remains `running`
- Treat missing intermediate output as a normal execution state while the subagent remains `running`
- Hold final artifact production until every required subagent output is available
- After repeated empty waits, run non-destructive diagnostics: re-check prompt, inputs, expected deliverable, and agent-task fit; send a focused follow-up when it would clarify the pending deliverable
- Resume waiting after diagnostics unless the user redirects the workflow or the orchestrator confirms a launch mistake

Treat the following as explicit contradictory evidence:
- The subagent returns a terminal status such as `approved`, `needs_revision`, `blocked`, `skipped`, `completed`, or `escalation_needed`
- The orchestrator verifies that it launched the wrong subagent or sent materially incorrect inputs
- A newer explicit user instruction changes or cancels the task

Close a running subagent only when the user redirects the workflow, the orchestrator corrects a launch mistake, or a newer user instruction supersedes the pending task.

**ENFORCEMENT**: Preserve subagent execution until completion, user redirection, or explicit correction of an orchestrator launch mistake. Speed-based early termination is a CRITICAL VIOLATION.

## How to Spawn Agents

Spawn agents using natural language prompts. Provide clear context about what the agent should accomplish. Every `spawn_agent` call MUST include `fork_turns="none"` or `fork_context=false` (see Spawn rule at top of this skill).

### Spawn Examples

Each example below is a spawn with `fork_turns="none"` or `fork_context=false` plus the quoted prompt.

**requirement-analyzer** (`fork_turns="none"` or `fork_context=false`):
> "Analyze the following requirements and determine the work scale: [user requirements]. Perform requirement analysis and scale determination."

**codebase-analyzer** (`fork_turns="none"` or `fork_context=false`):
> "Analyze the existing codebase to provide evidence for Design Doc creation. Focus on existing implementations, data model elements, and constraints the design should respect. requirement_analysis: [JSON]. prd_path: [path if available]. requirements: [original user requirements]. layer: [target layer if applicable]. target_paths: [paths if narrowed]. Return codebase facts and focus areas."

**task-executor** (`fork_turns="none"` or `fork_context=false`):
> "Execute the implementation task defined in docs/plans/tasks/[filename].md. Complete the implementation following TDD Red-Green-Refactor."

**quality-fixer** (`fork_turns="none"` or `fork_context=false`):
> "Run quality checks on the codebase: static analysis, style check, all test execution. Fix any issues found and report when all checks pass."

**document-reviewer** (`fork_turns="none"` or `fork_context=false`):
> "Review the document at [path] for quality and rule compliance. Check against documentation-criteria standards."

**design-sync** (`fork_turns="none"` or `fork_context=false`):
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

Handling rules:
- `approved_with_conditions`: append the listed conditions to the document's open-items section, carry them into the next phase, and resolve them before implementation
- `approved_with_notes`: include the notes in the completion report for awareness

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

Subagents respond in JSON format. The final response from each JSON-returning subagent must be the JSON payload itself, with no trailing prose. Agent TOML files define the full schemas; the orchestrator only relies on these routing keys:

| Agent | Routing fields the orchestrator uses |
|-------|--------------------------------------|
| `requirement-analyzer` | `scale`, `confidence`, `affectedLayers`, `adrRequired`, `scopeDependencies`, `questions` |
| `codebase-analyzer` | `focusAreas`, `dataModel`, `qualityAssurance`, `dataTransformationPipelines`, `limitations` |
| `task-executor*` | `status`, `escalation_type`, `filesModified`, `requiresTestReview` |
| `quality-fixer*` | `status`, `reason`, `stubFindings`, `blockingIssues`, `missingPrerequisites` |
| `document-reviewer` | `verdict.decision`, `verdict.conditions` |
| `code-verifier` | `summary.status`, `discrepancies`, `reverseCoverage` |
| `design-sync` | `sync_status` |
| `integration-test-reviewer` | `status`, `requiredFixes` |
| `security-reviewer` | `status`, `findings`, `notes`, `requiredFixes` |
| `acceptance-test-generator` | `status`, `generatedFiles`, `e2eAbsenceReason` |

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

Always start with `requirement-analyzer`, then follow the minimum flow required by scale and affected layers.

| Scale | Required flow |
|-------|---------------|
| Large | `requirement-analyzer` **[Stop]** -> `prd-creator` -> `document-reviewer` **[Stop]** -> optional `ui-spec-designer` + `document-reviewer` **[Stop]** -> optional ADR + `document-reviewer` **[Stop]** -> `codebase-analyzer` -> `technical-designer*` -> `code-verifier` -> `document-reviewer` -> `design-sync` **[Stop]** -> `acceptance-test-generator` -> `work-planner` **[Stop]** -> `task-decomposer` |
| Medium | `requirement-analyzer` **[Stop]** -> `codebase-analyzer` -> optional `ui-spec-designer` + `document-reviewer` **[Stop]** -> `technical-designer*` -> `code-verifier` -> `document-reviewer` -> `design-sync` **[Stop]** -> `acceptance-test-generator` -> `work-planner` **[Stop]** -> `task-decomposer` |
| Small | `requirement-analyzer` **[Stop]** -> simplified plan **[Stop: Batch approval]** -> direct implementation |

Flow rules:
- Frontend and fullstack flows add UI Spec before Design Doc creation
- Create ADR only when architecture, technology, or data-flow changes require it
- Pass requirement-analyzer output and original requirements to `codebase-analyzer`
- Pass `codebase-analyzer` output to the designer as `Codebase Analysis`
- Pass Design Doc path to `code-verifier`, then pass `code_verification` to `document-reviewer`
- Fullstack layer sequencing is defined in `references/monorepo-flow.md`

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
      -> quality-fixer: Quality check and fixes using the executor `filesModified` set as the stub-detection scope
          - stub_detected -> task-executor/task-executor-frontend: complete implementation -> re-run quality-fixer
      -> Orchestrator: Execute git commit
      -> Check remaining tasks:
          - Yes -> next task
          - No -> code-verifier + security-reviewer: Post-implementation verification
              - all pass -> Completion report
              - any fail -> layer-appropriate task-executor: Verification fixes -> quality-fixer -> re-run failed verifiers
              - blocked -> Escalate to user
```

### Conditions for Stopping Autonomous Execution

Stop autonomous execution and escalate to user in the following cases:

1. **Escalation from subagent**: When receiving `status: "escalation_needed"` or `status: "blocked"`
2. **Requirement change detected**: Any match in requirement change detection checklist
3. **Work-planner update restriction violated**: Requirement changes after task-decomposer starts require overall redesign
4. **User explicitly stops**: Direct stop instruction or interruption

Continue autonomous execution in the following situations:
- A subagent takes longer than expected
- `wait_agent` returns without a completion payload while the subagent remains `running`
- The orchestrator has partial context but is still waiting on a required subagent output

If repeated waits return the same `running` state, apply the completion-diagnostics contract above.

Use the task loop defined in the autonomous execution diagram above. The canonical per-task cycle is:
1. task-executor implementation
2. escalation or integration-test-reviewer decision
3. quality-fixer quality gate
4. git commit on approval

### Post-Implementation Verification Pass/Fail Criteria

| Verifier | Pass | Fail | Blocked |
|----------|------|------|---------|
| code-verifier | `summary.status` is `consistent` or `mostly_consistent` | `summary.status` is `needs_review` or `inconsistent` | — |
| security-reviewer | `status` is `approved` or `approved_with_notes` | `status` is `needs_revision` | `status` is `blocked` |

Re-run only verifiers that failed on the previous verification cycle.
Maximum retry count is 1 verification fix cycle. If any failed verifier still fails after the re-run, escalate to the user.

## Main Orchestrator Roles

1. **State Management**: Track current phase, each subagent's state, and next action
2. **Information Bridging**: Data conversion and transmission between subagents
   - Convert each subagent's output to next subagent's input format
   - **Always pass deliverables from previous process to next agent**
   - Extract the routing fields listed above
   - Explicitly integrate initial and additional requirements when requirements change
3. **Quality Assurance and Commit Execution**: Execute git commit per the 4-step task cycle
4. **Autonomous Execution Mode Management**: Start/stop autonomous execution after approval, escalation decisions
5. **ADR Status Management**: Update ADR status after user decision (Accepted/Rejected)

### Required Handoffs

| From | To | Required pass-through |
|------|----|-----------------------|
| `requirement-analyzer` | `codebase-analyzer` | requirement analysis JSON, original requirements, PRD path when available |
| `codebase-analyzer` | `technical-designer*` | `Codebase Analysis`, including `focusAreas`, `dataModel`, `qualityAssurance`, `dataTransformationPipelines`, `limitations` |
| `technical-designer*` | `code-verifier` | Design Doc path |
| `code-verifier` | `document-reviewer` | `code_verification` JSON |
| `acceptance-test-generator` | `work-planner` | integration test path, E2E path or `null`, `e2eAbsenceReason` when E2E is absent |
| Design Doc | `work-planner` | Verification Strategy summary, Output Comparison details, implementation-relevant technical requirements, protected no-change boundaries |

Handoff rules:
- Verify generated integration and E2E file paths exist before passing them onward
- Escalate only when required outputs are missing without a valid absence reason
- Require work-planner to map every carried-forward technical requirement to a covering task or a justified `gap`

## Important Constraints [MANDATORY]

- **Quality check is REQUIRED**: quality-fixer approval MUST be obtained before commit
- **Structured response REQUIRED**: Information transmission between subagents MUST use JSON format
- **Approval management**: Document creation -> Execute document-reviewer -> Get user approval before proceeding
- **Flow confirmation**: After getting approval, MUST check next step with work planning flow (large/medium/small scale)
- **Consistency verification**: If subagent determinations contradict, MUST prioritize the constraints and decision rules defined in this orchestration guide

**ENFORCEMENT**: Violating ANY constraint requires immediate correction

## Required Dialogue Points with Humans [MANDATORY]

### Basic Principles
- **Stopping is REQUIRED**: MUST wait for human response at stop points
- **Confirmation then Agreement cycle**: After document generation, proceed to next step after agreement or fix instructions in update mode
- **Specific questions**: Make decisions easy with options (A/B/C) or comparison tables

## Action Checklist

When receiving a task, check the following:

- [ ] Confirmed whether the user provided a specific workflow recipe or explicit execution constraint
- [ ] Determined task type (new feature/fix/research, etc.)
- [ ] Selected the next subagent according to the decision flow and current phase
- [ ] Decided next action according to decision flow
- [ ] Monitored requirement changes and errors during autonomous execution mode

## References

- `references/monorepo-flow.md`: Fullstack (monorepo) orchestration flow
