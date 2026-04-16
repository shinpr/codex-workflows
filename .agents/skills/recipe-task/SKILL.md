---
name: recipe-task
description: "Execute tasks with metacognitive analysis and appropriate rule selection."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `task-analyzer` — task analysis and skill selection (rule-advisor handles remaining skill selection)

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

# Task Execution with Metacognitive Analysis

Task: $ARGUMENTS

## Mandatory Execution Process

**Step 1: Rule Selection via rule-advisor (REQUIRED)**

Spawn rule-advisor agent: "Analyze the task and select appropriate rules for: $ARGUMENTS. Provide context about current situation and prerequisites."

ENFORCEMENT: Skipping rule-advisor produces unguided execution with high failure risk.

**Step 2: Utilize rule-advisor Output**

After receiving rule-advisor's response, proceed with:

1. **Understand Task Essence** (from `metaCognitiveGuidance.taskEssence`)
   - Focus on fundamental purpose, not surface-level work
   - Distinguish between "quick fix" vs "proper solution"

2. **Follow Selected Rules** (from `selectedRules`)
   - Review each selected rule section
   - Apply concrete procedures and guidelines

3. **Recognize Past Failures** (from `metaCognitiveGuidance.pastFailures`)
   - Apply countermeasures for known failure patterns
   - Use suggested alternative approaches

4. **Execute First Action** (from `metaCognitiveGuidance.firstStep`)
   - Start with recommended action and rationale
   - Use suggested tools first

**Step 3: Create Task List**

Register work steps. Always include: first "Confirm skill constraints", final "Verify skill fidelity".

Break down the task based on rule-advisor's guidance:
- Reflect `metaCognitiveGuidance.taskEssence` in task descriptions
- Apply `metaCognitiveGuidance.firstStep` to first task
- Restructure tasks considering `warningPatterns`
- Set appropriate priorities

**Step 4: Execute Implementation**

Proceed with task execution following:
- Selected rules from rule-advisor
- Task structure
- Quality standards from applicable rules

## Important Notes

- **Spawn rule-advisor first**: MUST complete metacognitive step before implementation
- **Update tasks after rule-advisor**: MUST reflect insights in task structure
- **Follow metaCognitiveGuidance.firstStep**: MUST start with the recommended action
- **Monitor warningPatterns**: MUST watch for failure patterns throughout execution

## Completion Criteria

- [ ] rule-advisor spawned and output received
- [ ] Task essence understood from `metaCognitiveGuidance.taskEssence`
- [ ] Selected rules reviewed and applied
- [ ] Past failure patterns recognized and countermeasures applied
- [ ] Task list created with skill constraint confirmation and fidelity verification
- [ ] Implementation executed following rule-advisor guidance
- [ ] Warning patterns monitored throughout execution
