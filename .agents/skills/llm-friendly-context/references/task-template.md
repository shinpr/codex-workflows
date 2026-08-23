# Task File Contract

Task files are ephemeral execution carriers. Write them under `docs/plans/tasks/` using the route that will consume them:

| Flow | Filename |
|------|----------|
| Single-layer backend or non-layered | `{plan-name}-task-{NN}.md` |
| Single-layer frontend | `{plan-name}-frontend-task-{NN}.md` |
| Fullstack backend | `{plan-name}-backend-task-{NN}.md` |
| Fullstack frontend | `{plan-name}-frontend-task-{NN}.md` |
| Fullstack shared | `{plan-name}-task-{NN}.md` |
| Small | `small-{name}.md` |

## Template

# Task: [Task Name]

Metadata:
- Source Plan Tasks: [P1-T1] | N/A — Small or standalone test-addition flow
- Dependencies: none | [task file paths]

## Implementation Outcome

[Repository change that completes the source Work Plan task or confirmed Small outcome.]

## Governing Sources

List every directly constraining section for this task. Preserve the Work Plan citations unchanged so the executor reads the authoritative contract directly.

- [Design Doc path (§ section); AC IDs]
- [UI Spec or ADR path (§ section), when it directly constrains this task]

For a Small flow whose scope is carried by this task file, replace the path entries with the compact confirmed scope:

- Confirmed outcome: [observable result]
- Desired-future requirements: [current buildable requirements]
- Non-goals: [excluded items or confirmed none]
- Open fields: [weak-but-explicit items or none]

## Target Files

- [Implementation file or responsibility]
- [Test file, when required]

## Investigation Targets

Read the smallest representative set needed to implement the task:

- [Governing document section or confirmed Small scope]
- [Existing implementation]
- [Adjacent representative test]

## Investigation Notes

- [Record only facts that change the implementation, scope, or verification.]

## Implementation Steps

1. Read the Investigation Targets and record relevant repository facts.
2. Add or update the focused test required by the cited verification strategy.
3. Implement the smallest repository change that completes the outcome.
4. Refactor within the same outcome while focused checks remain green.
5. Run the task verification.

## Operation Verification Methods

- **Verification method**: [Governing verification method or repository command]
- **Success criteria**: [Observable result tied to the cited ACs or confirmed requirement]
- **Verification level**: [L1 unit/local | L2 integration | L3 end-to-end]

## Verification Focus

Include this section only when a material false-green state exists or a generated test skeleton already defines one.

- **Primary failure**: [Implementation appears complete while the cited AC or confirmed outcome remains false]
- **Observable check**: [Smallest check that detects that state]

## Completion Criteria

- [ ] The cited implementation outcome is complete
- [ ] The cited ACs or confirmed Small requirements are satisfied
- [ ] Required focused tests pass
- [ ] Operation verification succeeds
- [ ] Verification Focus is satisfied when present

## Notes

- [Execution-relevant information only]
