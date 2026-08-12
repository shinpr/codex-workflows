# Code Review Findings

## Quality Objective

Optimize for maintainability at the responsibility that owns the behavior. A durable code response keeps contracts coherent, dependencies directional, state ownership clear, and future changes localized while preserving required behavior.

## Evidence to Inspect

Inspect only the paths needed to establish the cause and affected boundary:

- the failing or questioned behavior and its callers;
- the responsibility that owns the relevant rule or state;
- public, serialized, persistent, generated, or integration contracts;
- representative repository patterns with the same responsibility;
- focused tests and broader regression evidence at changed boundaries;
- migration, rollout, and rollback constraints when state or compatibility changes.

Treat a reviewer's patch suggestion as evidence of intent, not repository authority.

## Cause Tests

Classify a code problem as structural when one or more observed failures originate from misplaced ownership, duplicated policy, contradictory contracts, invalid dependency direction, or an unnecessary abstraction. Similar functions or repeated syntax alone do not justify a shared abstraction.

Classify it as local when the responsible unit and its contract remain sound after one bounded correction and no same-cause instance remains.

For a newly introduced mechanism that produces internal contradictions, compare removing it, simplifying it, or routing the behavior through the existing owner. Patching each contradiction is eligible only when the mechanism itself remains the most maintainable owner.

For a defective existing structure, compare:

- refactoring the existing owner when that alone resolves the requested behavior;
- refactoring it first and then adding the new behavior;
- changing the responsibility or architecture when the current boundary cannot remain coherent;
- a local or interim patch with its retained structural debt made explicit.

## Candidate Comparison

Compare code candidates using this sequence after the core outcome and validity gates:

1. Does the change occur at the responsibility that owns the rule?
2. Does it remove or reduce contradictory states, duplicated decisions, and parallel paths?
3. Does it preserve or intentionally migrate external contracts?
4. Does it localize the next likely change?
5. Can the affected behavior, callers, data, and integration boundary be verified?
6. Among candidates that satisfy the above, which has the best lifecycle value?

A smaller diff is evidence of lower change volume, not evidence of better maintainability. A larger refactor is eligible when it is causally necessary and adequately protected.

## Verification Safety

Select proof from the changed boundary outward:

- focused tests for the responsible rule;
- contract or integration tests for changed consumers and providers;
- migration checks for persisted or serialized state;
- repository-required static, build, and regression checks.

When current tests cannot protect a preferred structural change, identify the exact unprotected behavior and the proof needed. Keep the preferred response visible, compare the cost of adding that proof, and state what an interim patch leaves harder to maintain. Missing tests constrain safe execution; they do not convert a patch into the best design.

Security, data-loss, and irreversible compatibility risks are hard safety boundaries. Escalate them even when the finding frames them as local cleanup.

