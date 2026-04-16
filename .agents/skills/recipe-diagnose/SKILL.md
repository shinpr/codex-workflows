---
name: recipe-diagnose
description: "Investigate problem, verify findings, and derive solutions through structured diagnosis."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `ai-development-guide` — AI development patterns
2. [LOAD IF NOT ACTIVE] `coding-rules` — coding standards

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

**Context**: Diagnosis flow to identify concrete failure points and present solutions

Target problem: $ARGUMENTS

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Method**:
- Investigation -> Spawn investigator agent
- Verification -> Spawn verifier agent
- Solution derivation -> Spawn solver agent

Orchestrator spawns sub-agents and passes structured data between them.

**Task Registration**: Register execution steps and proceed systematically. Track status for each step.

## Step 0: Problem Structuring (Before spawning investigator)

### 0.1 Problem Type Determination

| Type | Criteria |
|------|----------|
| Change Failure | Indicates some change occurred before the problem appeared |
| New Discovery | No relation to changes is indicated |

If uncertain, ask the user whether any changes were made right before the problem occurred.

### 0.2 Information Supplementation for Change Failures

If the following are unclear, MUST **ask the user** before proceeding:
- What was changed (cause change)
- What broke (affected area)
- Relationship between both (shared components, etc.)

### 0.3 Problem Essence Understanding

Spawn rule-advisor agent: "Identify the essence and required rules for this problem: [Problem reported by user]"

Confirm from rule-advisor output:
- `taskAnalysis.essence`: Root problem beyond surface symptoms
- `taskAnalysis.taskType`: Classification of the problem
- `selectedRules`: Applicable rule sections
- `warningPatterns`: Patterns to avoid

### 0.4 Reflecting in investigator Prompt

**Include the following in investigator prompt**:
1. Problem essence (`taskAnalysis.essence`)
2. Key applicable rules summary (from selectedRules)
3. Investigation focus (investigationFocus): Convert warningPatterns to "points prone to confusion or oversight in this investigation"
4. **For change failures, additionally include**:
   - Detailed analysis of the change content
   - Commonalities between cause change and affected area
   - Determination of whether the change is a "correct fix" or "new bug" with comparison baseline selection

## Diagnosis Flow Overview

```
Problem -> investigator -> verifier -> solver --+
                 ^                              |
                 +-- coverage insufficient -----+
                      (max 2 iterations)

coverage sufficient -> Report
```

**Context Separation**: Pass only structured output to each step. Each step starts fresh with the data only.

## Execution Steps

Register the following and execute:

### Step 1: Investigation (investigator)

Spawn investigator agent with the following prompt:

```text
Comprehensively collect information related to the following phenomenon.

Phenomenon: [Problem reported by user]
Problem essence: [taskEssence]
Investigation focus: [investigationFocus]
Applicable rules: [selectedRules summary]

For change failures, also include:
- what changed
- what broke
- what both areas share
```

**Expected output**: Evidence matrix, path map, failure points, comparison analysis results, list of unexplored areas, investigation limitations

### Step 2: Investigation Quality Check

Review investigation output:

**Quality Check** (verify output contains the following):
- [ ] `comparisonAnalysis` is present and `normalImplementation` is non-null, or explicitly states that no working implementation was found
- [ ] `pathMap` is present with ordered nodes or explicit unknown segments
- [ ] causalChain for each failure point reaches a stop condition
- [ ] causeCategory for each failure point
- [ ] `investigationSources` covers at least 3 distinct source types
- [ ] each failure point has supporting evidence with a concrete source
- [ ] Investigation covering investigationFocus items (when provided)

**If quality insufficient**: MUST re-spawn investigator agent specifying the missing items and include the previous investigation output for context
ENFORCEMENT: Proceeding to verifier with incomplete investigation data produces unreliable conclusions.

**design_gap Escalation**:

When investigator output contains `causeCategory: design_gap` or `recurrenceRisk: high`:
1. **[STOP — BLOCKING]** Present design gap findings to user for confirmation. **CANNOT proceed until user explicitly confirms.**
2. Ask user:
   "A design-level issue was detected. How should we proceed?"
   - A: Attempt fix within current design
   - B: Include design reconsideration
3. If user selects B, pass `includeRedesign: true` to solver

Proceed to verifier once quality is satisfied.

### Step 3: Verification (verifier)

Spawn verifier agent: "Verify the following investigation results. Investigation results: [Investigation output]"

**Expected output**: Path coverage findings, independent failure-point evaluation, final conclusion, coverageAssessment/finalStatus

**Coverage Criteria**:
- **sufficient**: No major uncovered boundary affects solution selection or implementation
- **partial**: Some uncertainty exists but a bounded next investigation is possible
- **insufficient**: Fundamental information gap exists on the relevant path

### Step 4: Solution Derivation (solver)

Spawn solver agent: "Derive solutions based on the following verified conclusion. Failure points: [verifier's conclusion.confirmedFailurePoints]. Failure-point relationships: [verifier's conclusion.failurePointRelationships]. Coverage assessment: [verifier's conclusion.coverageAssessment]. Final status: [verifier's conclusion.finalStatus]. Impact analysis: [investigator output impactAnalysis]."

**Expected output**: Multiple solutions (at least 3), tradeoff analysis, recommendation and implementation steps, residual risks

**Completion condition**: `coverageAssessment=sufficient` and `finalStatus=ready_for_solution`

**When not reached**:
1. Return to Step 1 with uncertainties identified by solver as investigation targets
2. Maximum 2 additional investigation iterations
3. After 2 iterations without reaching sufficient coverage, present user with options:
   - Continue additional investigation
   - Execute solution at current coverage level

### Step 5: Final Report Creation

**Prerequisite**: sufficient coverage achieved

After diagnosis completion, report to user in the following format:

```
## Diagnosis Result Summary

### Identified Failure Points
[Failure point list from verification results]
- Failure-point relationships: [independent/upstream_of/downstream_of/amplifies/same_boundary]

### Verification Process
- Investigation scope: [Scope confirmed in investigation]
- Additional investigation iterations: [0/1/2]
- Coverage assessment: [sufficient/partial/insufficient]

### Recommended Solution
[Solution derivation recommendation]

Rationale: [Selection rationale]

### Implementation Steps
1. [Step 1]
2. [Step 2]
...

### Alternatives
[Alternative description]

### Residual Risks
[solver's residualRisks]

### Post-Resolution Verification Items
- [Verification item 1]
- [Verification item 2]
```

## Completion Criteria

- [ ] Spawned investigator and obtained evidence matrix, comparison analysis, and causal tracking
- [ ] Performed investigation quality check and re-ran if insufficient
- [ ] Spawned verifier and obtained coverage assessment
- [ ] Spawned solver
- [ ] Achieved sufficient coverage (or obtained user approval after 2 additional iterations)
- [ ] Presented final report to user
