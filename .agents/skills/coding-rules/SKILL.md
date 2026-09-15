---
name: coding-rules
description: "Repository-aware implementation rules for minimal design surface, contract safety, representative patterns, and verifiable changes. Use when implementing, refactoring, or reviewing code."
---

# Coding Rules

## Reference

Read [references/typescript.md](references/typescript.md) only for TypeScript used in web frontend work, including React applications. It does not apply to backend or non-web TypeScript. Read [references/security-checks.md](references/security-checks.md) when the change crosses an input, authorization, secret, persistence, or output boundary.

## Source Order

Follow, in order:

1. User-required outcome, explicit constraints, repository rules, and actual consumer contracts
2. Task, acceptance criteria, Design Doc, ADR, and Work Plan as the current implementation plan
3. Representative repository patterns
4. Language/framework defaults

Use a sourced project contract in preference to generic best practice. When a planned mechanism is unnecessary or incorrect, preserve user outcomes and explicit constraints while reducing it: document passage and a generated AC do not make that mechanism mandatory. Keep the affected plan and proof aligned with the selected reduction.

## Minimal Design Surface

Deliver the current requirement with the least justified total complexity. Before detailing new state, fields, modes, abstractions, or component splits, establish what required result a direct implementation cannot deliver. Evidence of a possible benefit makes the addition a candidate; retain it only when necessary now and worth its total lifecycle cost over subtraction or reuse.

Private local implementation details and test fixtures are not new design surface. If an element matches both categories, treat it as design surface. If several sufficient options remain, prefer the one with lower lifecycle cost.

## Contract and Boundary Safety

- Preserve contracts required by remaining consumers and explicit user constraints; authorized removal includes the retired entry point and its unused implementation. Absence of repository call sites does not establish absence of external consumers. Resolve uncertainty only when it changes the removal or compatibility decision.
- Validate untrusted input at the boundary and encode output for its destination.
- Propagate or handle errors with useful context and keep failures observable.
- Keep secrets and sensitive values out of source, client bundles, errors, and logs.
- Use parameterized data access and verify authorization at resource access points when applicable.
- For persistent or shared state, verify when partial, stale, committed, and rollback-only states become observable.

## Repository-Local Choice

Before adopting a pattern, API, or dependency:

1. Inspect the changed feature and relevant siblings.
2. Check whether the pattern is representative where alternatives coexist.
3. Follow the dominant compatible pattern or record why another existing pattern is required.
4. Escalate dependency/version or architecture choices when repository evidence cannot resolve them.

Nearby code is evidence, not authority by itself.

When choosing whether to reuse, extend, or add a data structure, check its semantic meaning, owning responsibility, lifecycle, and boundary or interoperability cost. Reuse or extend it when those dimensions remain compatible; choose a separate structure when sharing would merge responsibilities or lifecycles that can change independently.

When the changed behavior implements a runtime rule that exists in multiple locations, inspect the other instances for synchronization impact. Centralize or update them together when they share responsibility and contract; preserve separate implementations when their responsibilities can evolve independently.

## Change Discipline

- Keep the change within the accepted outcome and responsibility boundary. Treat task target files as the expected set; include an adjacent file when the same outcome requires it and report the expanded write set.
- Use names and structure that expose domain intent.
- Remove unused code and obsolete comments in the changed scope.
- Optimize only from measurements or a sourced requirement.
- Refactor in reversible increments and run the focused verification after each behavior-affecting step.
- Report adjacent debt outside scope and expand the change only with an explicit in-scope reason.

## Completion Gate

- [ ] Every addition is necessary for the required outcome and worth its cost over a smaller response
- [ ] Actual consumer contracts and explicit constraints remain satisfied
- [ ] Repository-local pattern choice is supported by evidence
- [ ] Errors, sensitive data, and persistent state boundaries are handled
- [ ] Focused and repository-required checks pass
