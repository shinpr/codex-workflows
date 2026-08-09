---
name: recipe-diagnose
description: "Investigate problem, verify findings, and derive solutions through structured diagnosis."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `ai-development-guide` — AI development patterns
2. [LOAD IF NOT ACTIVE] `coding-rules` — coding standards
3. [LOAD IF NOT ACTIVE] `llm-friendly-context` — clear prompts, handoffs, and generated artifacts

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

**Context**: Diagnosis flow to identify concrete failure points and present solutions

Target problem: $ARGUMENTS

## Orchestrator Definition

**Execution Method**:
- Investigation -> Spawn investigator agent
- Verification -> Spawn verifier agent
- Solution derivation -> Spawn solver agent

The orchestrator structures the reported problem, coordinates the three specialist stages, evaluates their results, and passes only the context needed by the next stage.

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification. Complete a plan step after verifying its result; start a dependent step after its prerequisites are satisfied.

## Step 0: Problem Structuring (Before spawning investigator)

### 0.1 Problem Type Determination

| Type | Criteria |
|------|----------|
| Change Failure | Indicates some change occurred before the problem appeared |
| New Discovery | No relation to changes is indicated |

If uncertain, keep the type provisional and let repository history and investigation evidence resolve it.

### 0.2 Information Supplementation for Change Failures

For change failures, resolve the following from the supplied report and repository evidence when available:
- What was changed (cause change)
- What broke (affected area)
- Relationship between both (shared components, etc.)

Carry unresolved details into the investigator prompt as investigation targets and continue.

## Diagnosis Flow Overview

```
Problem -> investigator -> verifier
verifier needs_more_investigation -> investigator while new evidence can change coverage
verifier ready_for_solution -> solver
solver recommendation -> Report
solver null recommendation -> investigator while new evidence can change the result
evidence saturated before recommendation -> unresolved Report
```

**Context Separation**: Pass only structured output to each step. Each step starts fresh with the data only.

## Execution Steps

Execute the registered steps:

### Step 1: Investigation (investigator)

Spawn investigator agent with the following prompt:

```text
Comprehensively collect information related to the following phenomenon.

Phenomenon: [Problem reported by user]

For change failures, include available facts and unresolved investigation targets for:
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
- [ ] `investigationSources` covers the source types needed to support or refute the causal path
- [ ] each failure point has supporting evidence with a concrete source

When required evidence is missing, re-run investigator with the missing items and previous output. Proceed to verifier when the causal path and its material unknowns are explicit.

Proceed to verifier once quality is satisfied.

### Step 3: Verification (verifier)

Spawn verifier agent: "Verify the following investigation results. Investigation results: [Investigation output]"

**Expected output**: Path coverage findings, independent failure-point evaluation, final conclusion, coverageAssessment/finalStatus

**Coverage Criteria**:
- **sufficient**: No major uncovered boundary affects solution selection or implementation
- **partial**: Some uncertainty remains, but the cause, applicable contract or expected behavior, and affected boundary are usable; verifier states which response-selection constraints remain uncertain
- **insufficient**: Fundamental information gap exists on the relevant path

### Step 4: Solution Derivation (solver)

When `finalStatus=ready_for_solution`, spawn solver agent: "Derive solutions based on the following verified conclusion. Verified conclusion: [verifier's conclusion]. Failure-point evaluations: [verifier's failurePointsEvaluation]. Verification limitations: [verifier's verificationLimitations]. Impact analysis: [investigator output impactAnalysis]."

**Expected output**: Credible materially distinct solutions, relevant tradeoffs, and either a supported recommendation with implementation steps or a null recommendation with exact missing evidence. One solution is sufficient when evidence rules out a meaningful alternative.

**Completion condition**: `finalStatus=ready_for_solution` and solver returns a non-null evidence-supported recommendation.

**When not reached**: Return to Step 1 with the verifier's material unknowns or solver's `uncertaintyHandling.missingEvidence` as investigation targets while repository or supplied evidence can change the result. When further investigation produces no new decision-relevant evidence, report the unresolved input and its effect instead of repeating the loop.

### Step 5: Final Report Creation

**Prerequisite**: a non-null solver recommendation. When available evidence stops changing without producing one, report the exact unresolved input and its effect, and mark recommendation, implementation steps, and alternatives N/A.

After diagnosis completion, report to user in the following format:

```
## Diagnosis Result Summary

### Identified Failure Points
[Failure point list from verification results]
- Failure-point relationships: [independent/upstream_of/downstream_of/amplifies/same_boundary]

### Verification Process
- Investigation scope: [Scope confirmed in investigation]
- Additional investigation: [material evidence added, or none]
- Coverage assessment: [sufficient/partial/insufficient]

### Recommended Solution
[Solution derivation recommendation]

Rationale: [Selection rationale]

### Implementation Steps
1. [Step 1]
2. [Step 2]
...

### Alternatives
[Material alternative descriptions, or none]

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
- [ ] Spawned solver when `finalStatus=ready_for_solution`
- [ ] Reached `ready_for_solution` with a supported recommendation, or reported the exact unresolved input after available evidence stopped changing coverage
- [ ] Presented final report to user
