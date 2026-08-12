---
name: reviewee-judgment
description: "Evaluates received review results before they generate work by separating problems from proposed fixes and comparing responses in a fixed decision order. Use whenever review results may lead to artifact changes; does not produce reviews."
---

# Reviewee Judgment

## Purpose and Value

Treat review findings as evidence about an artifact, not as work orders. A finding can expose a real problem while proposing the wrong fix, the wrong owner, or a response whose cost exceeds its value.

This skill prevents automatic finding-closure and automatic rejection from replacing product judgment. It preserves the requested outcome while favoring durable quality: maintainability for code, execution precision for prompts, and decision integrity for specifications. It also makes structural debt, verification limits, and user-owned tradeoffs visible before implementation begins.

Apply, decline, reuse, and no change are candidates; none is the default. Justify the response from governing obligations, expected effect, durable quality, and total lifecycle cost in that order.

Use this process before planning or performing changes derived from received review results. Success is an evidence-backed response to the underlying problems, not a larger change set or a higher count of closed findings.

Its input is a completed set of review results. Producing review findings remains outside this skill's scope.

The flow is: establish the outcome boundary, separate each problem from its proposed fix, group findings by underlying problem, locate the responsible cause, compare eligible responses in order, then recommend or execute within the granted authority.

## Artifact Context

Read the current artifact, the received findings, and the governing outcome, constraints, exclusions, and contracts. Mark material claims as observed, inferred, or unknown.

Load the reference that matches each reviewed artifact:

- Code, configuration, schema, or migration: [references/code.md](references/code.md)
- Prompt, agent instruction, or skill content: [references/prompt.md](references/prompt.md)
- Requirement, ADR, design document, plan, or other decision-carrying specification: [references/spec.md](references/spec.md)

For mixed findings, load every matching reference and apply this core process once across the shared problem set.

## Core Distinctions

### Problem and Proposed Fix

Extract the reported behavior, its evidence, and its consequence independently from the reviewer's proposed change. Evaluate the proposal only after the problem is confirmed and owned.

### Same Problem and Similar Surface

Group findings when they arise from the same responsibility, contract, decision, state transition, or causal rule. Similar wording, syntax, file shape, or patch mechanics alone does not establish the same problem.

Search for other instances of the confirmed underlying problem. Apply a shared response only when the instances share the responsible cause; otherwise preserve their intentional differences.

### Local Defect and Structural Defect

A local defect is fully owned by one otherwise sound unit and can be corrected without retaining the same causal failure elsewhere.

A structural defect is owned by a misplaced responsibility, contradictory contract, duplicated decision, or unnecessary mechanism. Repeated local edits do not resolve that owner.

## Decision Order

Evaluate candidates through these gates in order. A later gate cannot compensate for a failure at an earlier gate.

1. **Outcome boundary**: Preserve the requested outcome, governing constraints, explicit exclusions, and compatibility obligations.
2. **Finding validity**: Confirm the reported behavior and its material effect. Base validity on that evidence, and record the reviewer's priority and proposed fix separately as context.
3. **Cause and ownership**: Identify the underlying problem and the artifact or responsibility that owns it.
4. **Causal sufficiency**: Compare responses that resolve the owner, including subtraction, simplification, reuse, correction of an existing structure, redesign, and a local patch when each is applicable.
5. **Durable quality**: Apply the matching reference's Quality Objective and Candidate Comparison. Prefer the candidate that improves the artifact's long-term quality without adding unnecessary concepts or parallel sources of truth.
6. **Verification safety**: Determine whether the change and its affected boundaries can be proved safe with available evidence.
7. **Lifecycle value**: Compare implementation, verification, migration, maintenance, execution risk, and retained-debt cost only among candidates that passed the earlier gates. When the artifact contradicts the requested outcome, a governing constraint, an explicit exclusion, or a compatibility obligation, or has materially incorrect, non-executable, or non-verifiable behavior at a required boundary, use lifecycle value to select a sufficient response while the correction remains required. For a discretionary improvement, establish benefit with evidence of an observable effect on the outcome, maintainability, execution precision, or decision integrity. Treat reviewer preference as context rather than benefit evidence. A small supported benefit is sufficient when the response is correspondingly cheap, safe, and keeps persistent surface unchanged.
8. **Authority**: Execute only changes already authorized; surface product, architecture, compatibility, or scope decisions to the user.

Establish causal sufficiency before cost can favor a response. A required correction remains required regardless of cost; cost ranks its sufficient responses. Once a discretionary response passes the causal, durable-quality, and verification gates, low cost favors applying it when its observable benefit is positive and its maintenance, verification, and execution risk remain immaterial. When the best structural response lacks adequate verification, retain it as the preferred target, state the exact proof needed to make it safe, and explain the debt carried by any executable interim response.

These gates constrain the decision, not the route used to reach it. They require no fixed number of alternatives, separate decision artifact, or edit for every finding.

## Resolution Method

### 1. Normalize the Findings

Separate these elements before accepting any proposed fix, consolidating repeated evidence across findings:

- the supplied finding identifier, or the shortest source label needed for traceability;
- the reported problem;
- the supporting evidence and confidence;
- the observable or downstream effect;
- the proposed fix, if any;
- the governing outcome or contract it may affect.

### 2. Form Problem Groups

Group findings by shared cause or owner. Keep independent findings separate even when their suggested fixes look alike. Add unreported instances only when evidence shows the same underlying problem.

Preserve supplied finding identifiers within each group. For every source finding, record whether its reported problem is confirmed, unsupported, or unresolved. The group-level response resolves the shared problem without replacing these source assessments.

### 3. Classify the Owner

Classify each problem group by the responsibility that owns the cause. When evidence supports more than one layer, retain the causal chain and evaluate the highest owner whose correction can remove the downstream failures.

- **New mechanism**: the recently introduced mechanism creates its own inconsistency or duplicates an existing responsibility. Compare removing or simplifying it, redesigning it at the owner, and using the existing structure before considering patches inside it.
- **Existing structure**: the pre-existing responsibility, contract, or decision is the cause. Compare correcting that structure alone, correcting it before adding the requested behavior, and changing its ownership when justified.
- **Local unit**: one otherwise sound unit owns the entire problem. A local correction is eligible when no instance of the same causal failure remains.
- **No confirmed defect**: evidence does not establish an outcome-relevant problem. Decline the finding when the available evidence is sufficient, or request the material evidence needed to resolve it. End candidate comparison for this group because no confirmed cause is available to resolve.

This classification selects candidates; it does not predetermine the answer. Structural change must earn its place through durable quality and verification safety, just as a patch must account for the debt it retains.

### 4. Compare Complete Candidates

Before selecting a response, test it against applicable causal alternatives that could change the decision: subtraction, reuse, correction of an existing owner, structural change, and a bounded patch. Expand the comparison only when evidence makes an alternative decision-relevant.

The resulting comparison must make clear:

- which cause it resolves;
- which concepts, responsibilities, or constraints it adds or removes;
- what same-problem instances remain;
- what evidence proves the changed boundary;
- what compatibility or migration work it requires;
- what debt and future change cost it retains.

Exclude speculative alternatives that do not map to evidence. The goal is a sufficient decision, not an architecture exercise.

### 5. Choose a Disposition

Assign one disposition to each problem group:

- **apply**: the problem or improvement is confirmed and the selected response passed all gates. A required correction is apply when a sufficient, safe response passes the gates; lifecycle cost ranks the eligible responses. A discretionary improvement is apply when its observable benefit exceeds its total change cost. The Authority gate separately determines whether to recommend or execute it;
- **decline**: evidence establishes no outcome-relevant problem or observable quality benefit, the finding is outside the outcome boundary or reverses an exclusion, or a discretionary improvement's maintenance, verification, or execution cost equals or exceeds its supported benefit;
- **evidence required**: a material unknown could change finding validity, ownership, response selection, or verification. Pause changes for that problem group, continue independent groups, and report the exact evidence needed, its source when known, the decision it controls, and the condition for resuming;
- **user decision required**: the preferred response changes an approved outcome, architecture, compatibility promise, or scope boundary.

If an interim patch is the only safely executable response, label it as interim, describe the retained structural problem, and present the enabling work for the preferred response. The user decides whether that tradeoff is worth taking.

### 6. Execute and Verify

When changes are authorized, implement the selected response at the responsible owner and verify the affected boundary described by the applicable reference. Re-evaluate the original problem groups after verification; completion requires their observable causes to be resolved or explicitly dispositioned.

## Response Contract

Report decisions by underlying problem group rather than by comment count:

```text
Problem:
Findings grouped:
  - <finding ID or source label>: confirmed | unsupported | unresolved
Evidence: observed | inferred | unknown
Cause and owner:
Decision-changing alternatives considered:
Recommendation and disposition:
Authority: recommend only | execute selected response
Why it wins in the decision order:
Retained debt or required proof:
Required evidence and resume condition, if any:
User decision, if any:
```

Keep the report proportional. Omit fields that have no material content, but always preserve the problem/fix separation, the causal owner, the alternatives that could change the decision, and any user-owned tradeoff.

## Completion Check

- Every accepted finding maps to a confirmed underlying problem and material effect.
- Every supplied finding identifier remains traceable to its source assessment and problem group.
- Required corrections were identified before lifecycle comparison, and lifecycle cost selected among their sufficient responses.
- Every discretionary apply names its observable benefit to the outcome, maintainability, execution precision, or decision integrity.
- Apply, decline, reuse, and no change each have evidence at the gates that determine the response.
- Reviewer-proposed fixes were evaluated as candidates rather than inherited as requirements.
- Same-problem instances were grouped by cause, not by surface similarity.
- Candidate selection followed the fixed decision order without using cost to skip causal or quality analysis.
- Disposition and execution authority are explicit and separate.
- Patches state the debt they retain; structural changes state the proof and migration safety they require.
- Artifact-specific quality and verification criteria came from the matching reference.
- Evidence-required groups remain unchanged until their named resume condition is satisfied; independent groups may continue.
- Other unknowns and user-owned decisions are explicit.
- Completion is measured against outcomes and resolved causes, not the number of findings changed.
