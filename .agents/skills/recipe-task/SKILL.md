---
name: recipe-task
description: "Execute standalone tasks with metacognitive analysis and applicable skill selection."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `task-analyzer` — task analysis and skill selection
2. [LOAD IF NOT ACTIVE] `llm-friendly-context` — clear prompts, handoffs, and generated artifacts

**Spawn rule**: invoke rule-advisor with `fork_turns="none"` so it receives only the task and explicit context.

Task: $ARGUMENTS

## Mandatory Execution Process

### 1. Select rules with rule-advisor

Invoke rule-advisor first with the standalone task, current context, and any explicit recipe or governing artifact. Its result supplies task essence, selected skill names and sections, warning patterns, and the first evidence-gathering action.

### 2. Apply the result

1. Use `metaCognitiveGuidance.taskEssence` as the task's purpose.
2. Load and read each skill in `selectedRules` completely by skill name, then apply the selected sections in context.
3. Use `metaCognitiveGuidance.pastFailures`, `potentialPitfalls`, and `warningPatterns` to prevent a known failure that is applicable to this task.
4. Begin with `metaCognitiveGuidance.firstStep` unless current evidence already satisfies it.

### 3. Register multi-step work

For multi-step work, reuse the active execution plan or create one from the material actions implied by the rule-advisor result. Keep one step in progress and finish with verification of the requested outcome and applicable rules. Simple work proceeds directly.

### 4. Execute and verify

Execute in the parent session unless an applicable recipe assigns domain work to a named specialist. Apply the selected skills and verify the requested observable outcome.

## Boundaries

- An explicitly invoked recipe or supplied governing artifact remains the workflow entry point.
- rule-advisor selects standalone skills and metacognitive guidance; it does not determine requirement scope, documentation scale, approvals, or implementation routing.
- Skill handoff uses skill names and section names. The executing session reads each selected skill completely.

## Completion Check

- rule-advisor returned task essence, selected skills/sections, and metacognitive guidance.
- The execution used the selected guidance where applicable.
- The requested outcome and applicable verification are complete.
