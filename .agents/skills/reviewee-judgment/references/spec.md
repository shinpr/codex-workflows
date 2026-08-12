# Specification Review Findings

## Quality Objective

Optimize for decision integrity across downstream consumers. A durable specification response preserves the product outcome, makes decision ownership and exclusions explicit, maintains one authoritative source for each decision, and lets implementation proceed without guessing.

This reference applies to requirements, PRDs, ADRs, design documents, UI specifications, work plans, task files, and other decision-carrying artifacts.

## Evidence to Inspect

Inspect the smallest decision chain that can establish the problem:

- the governing requirement, approved decision, and explicit non-goals;
- the artifact responsible for the disputed decision;
- upstream sources and downstream artifacts or executors that consume it;
- repository or product evidence cited by the decision;
- acceptance, rollout, compatibility, and verification obligations.

Document hierarchy is not automatic decision authority. Determine which artifact actually owns the decision under review.

## Cause Tests

Group specification findings when they share the same missing decision, contradictory source of truth, unowned tradeoff, invalid assumption, or broken downstream contract. Similar headings, wording, or template omissions alone do not establish the same problem.

Classify a problem as structural when one decision is duplicated across artifacts, a downstream document silently changes an upstream outcome, or responsibilities between product, design, planning, and implementation are unclear.

Classify it as local when one authoritative statement is incomplete or incorrect and correcting it restores a coherent downstream chain without moving the decision.

For a newly introduced artifact or section that creates inconsistency, compare removing it, merging its unique decision into the existing authority, or redefining its consumer contract before adding cross-document patches.

For a defective existing decision structure, compare correcting the authoritative source alone, propagating an intentional revision to consumers, and changing ownership when the current artifact lacks the evidence or authority to decide.

## Candidate Comparison

Compare specification candidates using this sequence after the core outcome and validity gates:

1. Does the change occur in the artifact that owns the decision?
2. Does it preserve or explicitly revise the approved outcome and exclusions?
3. Does it eliminate conflicting sources of truth and hidden assumptions?
4. Can downstream consumers execute without inventing product or architecture decisions?
5. Can acceptance and verification evidence prove the revised decision chain?
6. Among candidates that satisfy the above, which has the best lifecycle value?

Adding another document or section is eligible only when it has a distinct durable consumer and decision responsibility. A local wording patch is sufficient only when no contradictory decision remains upstream or downstream.

## Verification Safety

Verify the changed decision from source to consumer:

- trace each revised decision to its governing outcome and evidence;
- inspect affected downstream artifacts for contradiction or stale assumptions;
- confirm that acceptance criteria observe the intended result;
- identify product, architecture, compatibility, or scope decisions that remain user-owned;
- state unresolved evidence needs without filling them with plausible prose.

When a broad rewrite is preferable but downstream impact is uncertain, name the affected consumers and the proof needed before propagation. If an interim clarification is used, state which conflicting authority or deferred decision remains.

