---
name: subagents-orchestration-guide
description: "Coordinates custom specialists through workflow phases, artifact handoffs, approval gates, and autonomous implementation. Use when executing a workflow recipe or routing its next specialist."
---

# Subagents Orchestration Guide

Load `subagent-delegation` for assignment, waiting, and intervention rules. This guide owns workflow-specific coordination.

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

## Role: The Orchestrator

The orchestrator owns workflow state and directly performs lightweight coordination: locating artifacts, reading status fields, resolving paths, applying explicit user answers, updating execution plans and continuation records, running deterministic repository checks, and composing specialist inputs. Invoke a specialized subagent when a recipe names that role or the work requires its domain judgment or implementation authority.

### Purpose and Decision Authority

Every role owns the smallest sufficient result within its assigned scope. Unnecessary mechanisms create downstream implementation, verification, and maintenance work. Apply ai-development-guide's Outcome Boundary: evidence and prior passage do not establish necessity or lifecycle value.

A phase `pass` means the current evidence permits progression. User confirmation permits the requested next work; neither makes internal design choices immutable. Final user acceptance concerns the delivered outcome. Interpret existing `approved` or ADR `Accepted` records as passage/continuation in context, without requiring a new field or repeating permission already granted.

Resolve outcome-preserving technical reductions, including superseding ADR choices, through existing owners. Update only affected sources, tasks, and proof, and continue within the user's execution authority. Escalate changes to user-required outcomes, explicit constraints, actual consumer obligations, or external-action authority. Optional new requirements remain unadopted; propose a requirement change only with evidence that the current conditions cannot deliver the requested result.

### Execution Plans

Reuse one active execution plan for the recipe. When none exists, create it before substantive multi-step work with the recipe phases and final verification, then update the same plan as evidence is produced. Agent-internal execution plans remain local to each agent. Plans prevent skipped work; their wording or presence is not a user approval gate.

### Entry Ownership

The invoked recipe determines the workflow entry point. Recipes for new or scope-changing requirements may invoke requirement-analyzer for compact scope and cost evidence. The user and orchestrator retain requirements, Structural Scale, and ADR decisions. Continuation, build, review, diagnosis, document update, and reverse-engineering recipes resume from their declared artifacts and request new scope evidence only when their own scope-change rule fires.

### Requirement Convergence

The orchestrator builds the `convergence` object from the user's wording and uses requirement-analyzer's scope and cost evidence for trade-offs, questions, and routing decisions. At the requirements stop, run the requirement-convergence hearing, then determine Structural Scale from the confirmed requirements and supplied evidence. User-confirmed boundaries supply requirements; orchestrator decisions supply routing.

Before a PRD or Design Doc exists, include the object only in the handoff that needs it. After it is persisted, pass the document path instead of copying the object through later prompts.

A PRD is both a binding product contract and a Product Context carrier. Downstream design and planning prompts consume the converged outcome, confirmed requirements, acceptance criteria, user-decided exclusions, and explicit constraints. They load Product Context only when one of those binding items cites it. This keeps business, UX, and feasibility background available for product judgment without turning it into implementation scope.

### Requirement Change Detection During Flow [MANDATORY]

During flow execution, compare a user addition with the approved outcome, requirements, and exclusions:

- A clarification that preserves all three is applied by the orchestrator to the active artifact or task.

Resume from the earliest artifact affected by a confirmed scope change while preserving completed unaffected work.

## Orchestration Principles

### Task Assignment with Responsibility Separation [MANDATORY]

Assign work based on each subagent's responsibilities:

**What the orchestrator completes directly**:
- Artifact discovery, path and status resolution, and exact task-set computation
- Execution-plan and approval-field updates
- Applying explicit user answers and governing-source resolutions
- Deterministic commands and lightweight evidence collection needed to route the next step

**What to spawn task-executor for**:
- Implementation work and test addition
- Confirmation of added tests passing (existing tests are not covered)
- Spawn quality-fixer exclusively for quality assurance

**What to spawn quality-fixer for**:
- Applicable repository checks discovered from the task, changed files, manifests, configuration, and CI
- Complete execution of quality error fixes
- Self-contained processing until fix completion
- Final approved judgment (only after fixes are complete)

## How to Spawn Agents

Apply the Spawn rule above. Resolve missing workflow inputs that affect the next action or its verification from repository and governing evidence; route remaining blockers through Orchestrator Escalation Resolution.

### Spawn Prompt Requirements

- For requirement, design, or scope judgment, supply relevant user wording and explicit constraints through the existing requirement carrier or task message, separately from agent-selected means. A target document alone suffices only when it retains that provenance; otherwise include the source excerpt needed for the decision.

- When the assigned action writes repository files, include: `The orchestrator has delegated this repository-writing task from the user's requested workflow. This invocation authorizes the repository writes required to produce or update the assigned deliverable within the supplied scope. Perform the writes and return the result.` The orchestrator applies any workflow review or approval gate to the returned artifact afterward.
- When invoking `task-executor*`, also include the exact task file path, for example: `Execute the implementation task. Task file: docs/plans/tasks/[filename].md.`

### Analysis Assignment

For `codebase-analyzer` and `ui-analyzer`, determine the effective child model, including known inheritance. Pass `exploration_mode: autonomous` only for `gpt-6-astra`; pass `guided` for every other or unknown model.

Assign distinct questions: codebase analysis owns responsibility/data/contracts/reuse; UI analysis owns rendering/interaction/visual evidence. Pass existing relevant findings as `prior_evidence` to reuse them. Carry evidence-backed simplifications as candidates, retaining their conditions; technical choices remain revisable under Purpose and Decision Authority.

## Explicit Stop Points [MANDATORY]

Use these stops when the active recipe reaches a user decision or authority not already supplied. Outcome-preserving technical corrections return through their owners without repeating these stops.

| Phase | Stop Point | User Action Required |
|-------|------------|---------------------|
| Requirements | After an entry recipe invokes requirement-analyzer | Converge fields below `ready`, then confirm requirements |
| PRD | After document-reviewer completes PRD review | Confirm the required outcome and continue |
| UI Spec | After document-reviewer completes UI Spec review (frontend/fullstack) | Confirm the UI outcome and continue |
| ADR | After document-reviewer completes the complete ADR-batch review (when ADRs were created) | Continue with the current technical choices |
| Design | After design-sync completes consistency verification | Continue with the current design |
| Work Plan | After document-reviewer completes WorkPlan review for Medium/Large | Authorize implementation within this outcome |

After implementation authorization, continue autonomously until completion or a user-owned decision requires input. A repeated review is not a new permission gate.

### Design Confirmation

At the existing design confirmation stop, read the current PRD (when present) and Design Doc(s). Derive the minimum user-visible value and briefly state it alongside the major changes included, making internal mechanism changes or refactoring visible. Ask whether this MVP and scope match the user's intent. Keep this to a short alignment message, rather than design detail or a justification of necessity. Apply corrections through the existing scope-change flow.

### Common Status Meanings

Use agent statuses as routing signals, not as a parser contract. Prefer `pass` for new review results; interpret legacy `approved` as the same phase passage. Interpret the artifact and evidence when a field is absent or worded differently. Reviewer passage alone grants no user-held execution authority.

| Status | Scope | Meaning | Next Action |
|--------|-------|---------|-------------|
| `pass` (legacy `approved`) | Review/check agents | Current evidence passes this phase | Proceed; technical means remain revisable |
| `needs_revision` | Review/approval agents | Significant issues repairable within approved repository scope | Resolve through the normal review or verifier-fix cycle |
| `rejected` | Document agents | Fundamental problems | Apply Orchestrator Escalation Resolution |
| `blocked` | Agents whose schema permits it | An agent-specific blocking condition prevents a usable result | Apply Orchestrator Escalation Resolution |
| `skipped` | Review/approval agents whose schema permits skipping | Preconditions not met for this step | Report reason, proceed |

### Review Resolution

Apply [references/review-resolution.md](references/review-resolution.md) wherever review or verification results can generate work. Before assigning repairs, record the disposition; retaining or adding a mechanism requires a reason subtraction cannot deliver the required result. Pass user outcomes and explicit constraints separately from revisable technical decisions.

### Orchestrator Escalation Resolution [MANDATORY]

Apply this procedure when a workflow result cannot support the next action, including `escalation_needed`, `blocked`, a missing artifact, or contradictory evidence. The response returns control to the orchestrator; it is not itself a human stop. For review results, Review Resolution still governs scope, completed reviewers, and rerun boundaries.

1. Resolve the issue from user requirements, governing artifacts, repository evidence, and prior agent outputs. For missing invocation context, supply it and rerun the interrupted agent; assign artifact changes only when the evidence requires them. Choose the smallest resolution that preserves user intent.
2. Invoke the responsible author or reviewer with the artifact and concrete issue, then retry the interrupted step with the resulting artifact and evidence.
3. Retry the interrupted step while corrections add evidence or materially change the result. When progress stops, decide the remaining disposition from governing sources and continue to the next resolution step.
4. Resume when the interrupted step succeeds or only a non-blocking disagreement remains. Apply Purpose and Decision Authority to user escalation; a smaller technical design alone is resolved by the orchestrator and relevant owners. Preserve unaffected work and still-valid evidence.

### Work Plan Resolution

Resolve an exact Work Plan path from the first applicable source: an explicit recipe argument, the active execution plan's Work Plan, or Work Plans derived from task files matching the recipe's managed task patterns. When no managed task file yields a candidate, treat non-template Work Plans as candidates. Use the sole candidate; when multiple candidates remain, present them for selection; when none exists, report the exact missing prerequisite.

### Work Plan Authorization

Planning recipes create and review the Work Plan, then resolve implementation authority from the user's instructions. Record its source and scope in Implementation Authorization; obtain it only when absent. Review passage remains in the reviewer response, not a second plan status.

A build proceeds from the user's authorization to implement, recorded in the conversation or existing plan. Accept equivalent continuation wording and legacy approval records; a reviewer-only pass is not user authorization. Ask only when that authority is absent. Route technical reductions through affected plan/task updates without asking again; user-outcome or authority changes follow Purpose and Decision Authority. Regenerate affected uncommitted task files and preserve unaffected work.

## Scale Determination and Document Requirements

Use documentation-criteria Structural Scale as the single scale definition.

| Scale | PRD | ADR | Design Doc | Work Plan |
|-------|-----|-----|------------|-----------|
| Small | None | None | None | None |
| Medium | Update* | Conditional batch** | **Required** | **Required** |
| Large | **Required*** | Conditional batch** | **Required** | **Required** |

\* Update if PRD exists for the relevant feature
\*\* One ADR per durable technical choice that requires comparison between at least two credible materially distinct options; the Choice and Durability filters determine qualification independently of scale
\*\*\* New creation/update existing/reverse PRD (when no existing PRD)

## Using Agent Results

Agent schemas describe their full internal result. The orchestrator consumes only the fields needed for the next action:

| Producer | Consumer-required result |
|---|---|
| Artifact producer | completion or blocked state, plus produced artifact path(s) |
| Task executor | completion or escalation state, `filesModified`, `requiresTestReview`, and operation-verification evidence |
| Quality fixer | pass, `stub_detected`, or blocked state; `filesModified`; reason or findings when not passed |
| Reviewer | decision, actionable findings, governing basis, and whether each finding blocks the approved outcome |
| Analyzer | only reuse, invalidation, decision-point, cost, contract, verification, and decision-changing unknown material needed by the next consumer |

Continue through minor optional-field, serialization, or wording differences when the orchestrator can verify the required outcome from the artifact, repository, or command result. Verify claimed paths before passing them onward. Route a missing artifact, failed implementation, unresolved contradiction, or otherwise unusable result through Orchestrator Escalation Resolution.

### Per-Task Change Set

For each implementation task, record `diffBase` and maintain one `taskWriteSet`:

1. Initialize it from the first executor's `filesModified` and the repository diff from `diffBase`.
2. Union files changed by executor retries, review fixes, stub repairs, and the quality fixer.
3. Before quality review and before commit, reconcile it with repository state so earlier changes are retained and unrelated user changes are excluded.
4. Pass the accumulated `taskWriteSet` to the quality fixer. After quality pass, commit only implementation, test, and required generated files in that set. After that commit succeeds, mark the Task File's satisfied Completion Criteria and the corresponding Work Plan task and phase complete, then update the active execution plan.

Task Files and Work Plans are local workflow state. Exclude both from implementation commits; their checkboxes record completion only after quality pass and a successful implementation commit.

## Handling Requirement Changes

### Handling Requirement Changes in requirement-analyzer
Pass requirement changes to requirement-analyzer as complete self-contained input.

#### How to Integrate Requirements

Integrate initial requirements and later additions as complete sentences, preserving all contextual information communicated by the user. The updated input must remain self-contained without relying on prior conversation turns.

### Update Mode for Document Generation Agents
Document generation agents (work-planner, technical-designer, prd-creator) can update existing documents in `update` mode.

- **Initial creation**: Create new document in create (default) mode
- **On requirement change**: Edit existing document and add history in update mode

## Basic Flow for Work Planning

After the selected entry recipe completes its requirement stop, follow the minimum flow required by scale and affected layers. Continuation recipes resume from their declared artifact.

| Scale | Required flow |
|-------|---------------|
| Large | scope evidence + orchestrator convergence **[Stop]** -> `prd-creator` -> `document-reviewer` **[Stop]** -> layer analysis -> frontend/fullstack UI Spec + `document-reviewer` **[Stop]** -> optional ADR batch + one batch `document-reviewer` **[Stop]** -> `technical-designer*` -> `code-verifier` + Review Resolution -> `document-reviewer` -> `design-sync` **[Stop]** -> `acceptance-test-generator` -> `work-planner` -> `document-reviewer` (doc_type: WorkPlan) **[Stop]** -> `task-decomposer` |
| Medium | scope evidence + orchestrator convergence **[Stop]** -> layer analysis -> frontend/fullstack UI Spec + `document-reviewer` **[Stop]** -> optional ADR batch + one batch `document-reviewer` **[Stop]** -> `technical-designer*` -> `code-verifier` + Review Resolution -> `document-reviewer` -> `design-sync` **[Stop]** -> `acceptance-test-generator` -> `work-planner` -> `document-reviewer` (doc_type: WorkPlan) **[Stop]** -> `task-decomposer` |
| Small | scope evidence + orchestrator convergence **[Stop]** -> one standard task file -> task execution cycle |

Flow rules:
- Backend layer analysis runs `codebase-analyzer`. Frontend layer analysis resolves decision-relevant external or prototype inputs, then runs `codebase-analyzer` and `ui-analyzer`; independent calls may run in parallel. Fullstack layer analysis follows `references/monorepo-flow.md`.
- Frontend and fullstack flows create the UI Spec from completed layer analysis before ADR or Design Doc creation.
- When a frontend or fullstack UI Spec uses a prototype, pass `prototype_reference_strength` to ui-spec-designer. Use `binding` when the supplied context makes the prototype's rendering the implementation target; otherwise use `reference`. Ask the user only when the choice changes the current UI outcome and the supplied context materially supports both readings.
- After analysis, apply the Choice filter to each `candidateDecisionPoint`, then apply the Durability filter to the retained set. Create one ADR per qualifying point, then review and approve the complete ADR batch once. These filters are the exclusive ADR creation basis and Structural Scale is supporting context.
- Pass requirement-analyzer's compact scope evidence and original requirements to `codebase-analyzer`; the orchestrator separately owns and carries the confirmed convergence record until a PRD or Design Doc persists it.
- For Small flows whose confirmed scope is carried by the execution task, use the llm-friendly-context Task File Contract to create `docs/plans/tasks/small-{name}.md`. Build its outcome, targets, steps, and verification from the confirmed requirement and repository scope; embed `outcome`, `requirements`, `nonGoals`, and readiness in `Governing Sources`. Pass the exact file to the layer-appropriate executor. Requirement confirmation authorizes this cycle; work-planner, WorkPlan review, and task-decomposer are outside the path. Remove the task file after Post-Implementation Review passes.
- Pass only codebase-analyzer material that changes reuse, simplification, option validity or selection, lifecycle cost, a preserved contract, design, or verification to the relevant ADR/Design Doc owner.
- Pass a Design Doc path to `code-verifier`, apply Review Resolution to its discrepancies, and pass only resolved verification evidence to `document-reviewer`.
- Fullstack layer sequencing is defined in `references/monorepo-flow.md`
- Run WorkPlan review after every Medium/Large work plan creation or update. Resolve `needs_revision` through Review Resolution with work-planner, then apply Work Plan Authorization. Route governing-source contradictions through Orchestrator Escalation Resolution.

## Autonomous Execution Mode

### Conditional Environment Preparation

Build recipes proceed with the approved task set. `recipe-prepare-implementation` runs when the user explicitly requests repository-local setup or when a concrete task-local capability failure makes preparation the smallest authorized Orchestrator Escalation Resolution. Unaffected implementation continues.

### Definition of Autonomous Execution Mode

Within execution authority established by Work Plan Authorization or the Small flow, autonomously execute:

```
Authorized scope -> task decomposition when needed -> each task:
implementation -> optional integration-test review -> quality-fixer -> commit
-> final code/security review -> completion report
```

Reviewer findings in this mode are candidates, not work orders; create repair work only from the Review Resolution `apply` set.

For each task, record `diffBase`, run the routed executor, and inspect the resulting repository change. Add each execution or repair result to the Per-Task Change Set. Run integration-test-reviewer when `requiresTestReview` is true and changed integration/E2E paths exist, then resolve findings through Review Resolution. Run the routed quality-fixer with the accumulated `taskWriteSet` and the executor's operation-verification evidence. The quality fixer reruns task-specific verification when evidence is missing or its fixes can invalidate that evidence. On quality pass, add its changed paths to the set and commit the implementation files. After the commit succeeds, mark the Task File's satisfied Completion Criteria and the corresponding Work Plan task and phase complete, then update the active execution plan. Repair `stub_detected` through the same implementation owner. Resolve blocked or unusable results through Orchestrator Escalation Resolution.

### Conditions for Stopping Autonomous Execution

Stop autonomous execution and request user input in the following cases:

1. **Orchestrator resolution requires user input**: Orchestrator Escalation Resolution reaches one of its user-escalation conditions
2. **Confirmed scope change needs approval**: Requirement Change Detection routes the addition through Requirement Convergence
3. **User explicitly stops**: Direct stop instruction or interruption

Agent `blocked` results, maintained blocking findings, and implementation deviations first enter Orchestrator Escalation Resolution. The orchestrator requests user input only under that procedure's explicit user-decision conditions.

Continue autonomous execution in the following situations:
- A workflow subagent is still pending
- `wait_agent` returns `timed_out=true`
- The orchestrator has partial context but is still waiting on a required subagent output

Use the task loop defined in the autonomous execution diagram above. The canonical per-task cycle is:
1. capture `diffBase`, execute the task, and accumulate its change set
2. resolve escalation or integration-test review when applicable
3. run the quality fixer on the accumulated change set and resolve findings until the required checks pass
4. commit implementation files, then record Task File, Work Plan task/phase, and execution-plan completion locally

### Post-Implementation Review

| Reviewer | Pass | Requires disposition | Blocked |
|----------|------|------|---------|
| code-reviewer | `verdict` is `pass` | `verdict` is `needs-improvement` or `needs-redesign` | `verdict` is `blocked` |
| security-reviewer | `status` is `pass` (legacy `approved`) | `status` is `needs_revision` | `status` is `blocked` |

Run code-reviewer against the complete implementation change set and its governing Design Docs, or the active task file for a Small flow. Rerun only unresolved findings and evidence invalidated by corrections, with `prior_feedback` containing the previous result, dispositions, and correction paths or diff. A previous pass preserves only still-valid evidence. The Small path also passes its active task file to security-reviewer as `type: task-file`. Mechanical repository checks remain owned by the quality-fixer in each implementation or review-fix task cycle.

Apply Review Resolution to reviewer findings. Apply a security-reviewer finding only when leaving it unresolved would violate an explicit governing requirement or repository rule, or leave a concrete material security failure in the actual reachable trust model. The violated requirement, rule, or failure defines implementation scope: route the smallest correction that resolves it, treating the reviewer's suggestion as one candidate implementation.

## Main Orchestrator Roles

1. **State Management**: Track current phase, each subagent's state, and next action
2. **Lightweight Workflow Work**: Resolve artifact paths and statuses, decide convergence and finding dispositions exclusively from supplied materials, update execution plans and approval fields, and run deterministic routing checks
3. **Information Bridging**: Data conversion and transmission between subagents
   - Extract only facts that can change the next consumer's decision, action, or verification
   - Pass artifact paths instead of copied content when the artifact is the next consumer's governing input
   - Explicitly integrate initial and additional requirements when requirements change
4. **Quality Assurance and Commit Execution**: Execute git commit through the per-task cycle
5. **Autonomous Execution Mode Management**: Start/stop autonomous execution after approval and escalation decisions
6. **ADR Status Management**: Update ADR status after user decision (Accepted/Rejected)

### Required Handoffs

| From | To | Required pass-through |
|------|----|-----------------------|
| `requirement-analyzer` | orchestrator requirement hearing and `codebase-analyzer` | request signals plus compact scope and cost evidence; the orchestrator decides convergence and scale |
| convergence record | PRD or Design Doc owner | `prd-creator` persists PRD fields; `technical-designer*` persists Design Doc fields when no PRD exists; both record open requirement fields while cost remains ephemeral |
| convergence record | Small-flow implementation | compact record in the task file's `Governing Sources` when no PRD or Design Doc exists |
| `codebase-analyzer` | orchestrator and `technical-designer*` | relevant `simplifications`, `reuse`, `invalidations`, `candidateDecisionPoints`, `verification`, decision-changing `unknowns`, and material limitations; the orchestrator passes confirmed ADR points to the designer |
| `technical-designer*` | ADR batch reviewer | complete ADR `paths[]` from the invocation |
| `technical-designer*` | `code-verifier` | Design Doc path |
| `code-verifier` | orchestrator Review Resolution, then technical designer or document reviewer | `apply` discrepancies for the author; declined reasons and resolved verification evidence for the next reviewer |
| `task-executor*` | `integration-test-reviewer` | `diffBase`, changed integration/E2E paths, exact task file, and matching skeleton paths when available |
| implementation task | `quality-fixer*` | exact task file, accumulated `taskWriteSet`, and operation-verification evidence |
| `acceptance-test-generator` | `work-planner` | `artifacts[].path` |
| `work-planner` | `document-reviewer` | completed `path` |
| `task-decomposer` | routed `task-executor*` | completed `taskFiles[]` |
| Design Doc | `work-planner` | Design Doc path; work-planner reads only sections that control task outcome, order, or verification |

Handoff rules:
- Until persistence, pass the compact convergence object only to the next consumer that needs it. After persistence, pass its PRD or Design Doc path
- Downstream consumers exclude `nonGoals` and `speculative` requirements from current work
- Verify generated artifact paths before passing them onward
- Require each Work Plan task to cite its design basis; user instructions supply authority, and technical choices remain revisable.

## Important Constraints [MANDATORY]

- **Quality check is REQUIRED**: quality-fixer pass MUST be obtained before commit
- **Usable result required**: Continue from verified artifacts and repository evidence; resolve missing or unusable results before passing them onward
- **Phase progression**: Complete review resolution, then apply Explicit Stop Points and Work Plan Authorization.
- **Flow confirmation**: After approval, select the next step from the active recipe and current artifact state
- **Consistency verification**: If subagent determinations contradict, MUST prioritize the constraints and decision rules defined in this orchestration guide

## Required Dialogue Points with Humans [MANDATORY]

### Basic Principles
- Wait for a response when Explicit Stop Points requires a new user decision.
- **Confirmation then Agreement cycle**: After document generation, complete review resolution before requesting approval or proceeding from an existing approval
- **Specific questions**: Make decisions easy with options (A/B/C) or comparison tables

## Action Checklist

When receiving a task, check the following:

- [ ] Confirmed whether the user provided a specific workflow recipe or explicit execution constraint
- [ ] Determined task type (new feature/fix/research, etc.)
- [ ] Selected the next subagent according to the active recipe and current phase
- [ ] Decided the next action from the active recipe and current artifact state
- [ ] Monitored requirement changes and errors during autonomous execution mode

## References

- `references/review-resolution.md`: Evidence- and ROI-based review finding resolution
- `references/monorepo-flow.md`: Fullstack (monorepo) orchestration flow
