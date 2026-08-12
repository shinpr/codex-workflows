# Prompt Review Findings

## Quality Objective

Optimize for reliable execution of the intended outcome across representative inputs. A durable prompt response keeps instructions coherent, places constraints at the boundary where they matter, preserves useful model freedom, and makes success observable.

## Evidence to Inspect

Inspect the complete instruction path that governs execution:

- the requested outcome and user-owned decisions;
- system, developer, skill, task, and generated instructions that reach the executor;
- required inputs, outputs, consumers, and success evidence;
- representative successful, failing, ambiguous, and boundary cases;
- constraints that prevent material failure versus instructions that merely prescribe a route.

When execution evidence is available, use it as the primary basis for prompt quality.

## Cause Tests

Group prompt findings when they share the same missing boundary, conflicting priority, undefined decision owner, hidden input, or unverifiable success condition. Similar phrases or the same proposed rewrite do not establish the same problem.

Classify a problem as structural when instructions create contradictory priorities, distribute one decision across multiple authorities, or add procedural constraints that generate work without protecting the outcome.

Classify it as local when one bounded instruction is ambiguous or incorrect and the surrounding priority, authority, and execution path remain coherent after correction.

For a newly introduced instruction mechanism that creates inconsistency, compare removing it, consolidating it into the existing authority, or rewriting the governing boundary before adding more exceptions.

For a defective existing prompt structure, compare correcting the existing authority alone, correcting it before adding new behavior, and moving the decision to the layer that has the required context.

## Candidate Comparison

Compare prompt candidates using this sequence after the core outcome and validity gates:

1. Does the instruction live at the boundary that owns the decision?
2. Are priorities, authority, and success conditions coherent across the full instruction path?
3. Does it constrain the failure mode while leaving reversible execution choices flexible?
4. Does it remove duplicated rules, exception chains, and work-generating procedure?
5. Can representative executions distinguish success from plausible-looking failure?
6. Among candidates that satisfy the above, which has the best lifecycle value?

A short wording patch is sufficient only when the causal instruction structure remains sound. Additional detail is valuable only when it resolves outcome-relevant ambiguity, protects a material boundary, or supplies evidence needed by the executor.

## Verification Safety

Verify the changed instruction against representative execution paths rather than checking text presence alone. When execution is available, include a fresh run without conversational steering and the reported failure mode. Add these paths when they protect a decision-relevant boundary:

- the ordinary successful path;
- a same-problem variant with different surface wording;
- a boundary case where the model should escalate, abstain, or preserve user authority;
- downstream output shape and evidence required by the real consumer.

When deterministic evaluation is unavailable, state the expected observable behavior, run the strongest representative checks available, and label residual uncertainty. Judge a prompt fixed from representative execution results that demonstrate the intended behavior. Treat completed textual edits as change evidence rather than execution evidence.
