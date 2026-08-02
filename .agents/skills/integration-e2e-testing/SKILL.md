---
name: integration-e2e-testing
description: "Selects and specifies only integration/E2E tests whose observable boundary cannot be proven more cheaply."
---

# Integration and E2E Testing

## Reference

Read [references/e2e-design.md](references/e2e-design.md) only when a selected browser-level claim needs UI Spec mapping or browser harness guidance. Use the repository's browser harness when it differs from the examples.

## Selection Gate

Select an integration or E2E test only when all conditions hold:

1. a confirmed AC, preserved behavior, or task Verification Focus names an observable claim;
2. correctness depends on a component, persistence, process, browser, or service boundary that a local/unit proof cannot exercise;
3. existing tests do not already prove the same failure mode at that boundary;
4. the expected regression-detection value justifies the fixture, environment, runtime, and maintenance cost.

When any condition fails, leave the claim to its focused local or task verification. An empty integration/E2E selection is a successful result and needs no absence artifact.

## Lanes and Ceilings

| Lane | Use when | Ceiling per outcome |
|---|---|---|
| `integration` | In-process component, persistence, or contract interaction must stay real | 3 |
| `fixture-e2e` | Browser-visible interaction needs the real UI but controlled backend/fixture state is sufficient | 3 |
| `service-integration-e2e` | The claim specifically depends on a running local cross-service boundary that other lanes cannot prove | 2 |

Ceilings are limits, not targets or reserved slots. Prefer the lowest-cost lane that proves the named claim. Real external production services are outside these lanes; verify their repository-owned contract instead.

## Candidate Selection

For each boundary-dependent claim:

1. state the material failure that could remain falsely green;
2. identify the boundary that must remain real and what may be controlled or mocked;
3. compare with existing tests and lower-cost proof;
4. select the candidate only when it adds distinct material detection value;
5. combine claims that share setup, boundary, and observable outcome when one test can prove them clearly.

Do not invent revenue, frequency, legal, or probability scores. Use supplied product evidence and observed repository/test cost; when that evidence is weak, prefer no new wider-lane test unless the boundary is the only proof of a binding claim.

## Skeleton Contract

A generated skeleton is a non-runnable design artifact containing comments only until its implementation task makes it executable. Adapt comment syntax and filename conventions to the repository.

Each selected case records:

```text
AC: [binding observable claim]
Behavior: [trigger] -> [boundary exercised] -> [observable result]
@lane: integration | fixture-e2e | service-integration-e2e
@dependency: [boundary components]
@real-dependency: [dependencies that must remain real]
Primary failure mode: [regression this test must detect]
Proof obligation: [assertions and permitted controlled boundaries]
```

Add verification items only when the proof cannot be stated clearly in the obligation. Do not add complexity scores, category taxonomies, or metadata without a downstream consumer.

## Review Criteria

A changed test passes review when it:

- exercises the selected real boundary rather than a substitute path;
- contains substantive assertions for the named observable result and primary failure;
- controls only dependencies permitted by the proof obligation;
- is deterministic and isolated enough for the repository's normal execution model.

AAA comments, naming style, extra assertions, and generic readability improvements are non-blocking unless they obscure or invalidate the proof.

## Completion Check

- Every selected case passed the Selection Gate.
- The selected lane is the lowest-cost boundary that proves the claim.
- The set stays below the lane ceilings and may be empty.
- Each skeleton carries enough proof information for implementation and review without copying the Design Doc.
