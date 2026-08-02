---
name: coding-rules
description: "Repository-aware implementation rules for minimal design surface, contract safety, representative patterns, and verifiable changes. Use when implementing, refactoring, or reviewing code."
---

# Coding Rules

## Reference

Read [references/typescript.md](references/typescript.md) only for TypeScript used in web frontend work, including React applications. It does not apply to backend or non-web TypeScript. Read [references/security-checks.md](references/security-checks.md) when the change crosses an input, authorization, secret, persistence, or output boundary.

## Source Order

Follow, in order:

1. Task, acceptance criteria, and cited governing sources
2. Governing Design Doc, ADR, Work Plan, and repository instructions
3. Representative repository patterns
4. Language/framework defaults

Do not substitute generic best practice for a sourced project contract.

## Minimal Design Surface

Deliver the current requirement with the least new persistent surface. Persistent state, public/cross-boundary fields, modes, flags, reusable abstractions, shared utilities, and component/service splits require a current requirement, verified constraint, observed problem, or evidence-backed material risk.

Private local implementation details and test fixtures are not new design surface. If an element matches both categories, treat it as design surface. If several sufficient options remain, prefer the one with lower lifecycle cost.

## Contract and Boundary Safety

- Preserve required signatures, schemas, serialized values, field order, state transitions, dependency direction, and error behavior.
- Validate untrusted input at the boundary and encode output for its destination.
- Propagate or handle errors with useful context; do not silently suppress them.
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
- Report adjacent debt outside scope; do not expand the change silently.

## Completion Gate

- [ ] Every addition maps to a governing requirement or verified risk
- [ ] Public and cross-boundary contracts remain exact
- [ ] Repository-local pattern choice is supported by evidence
- [ ] Errors, sensitive data, and persistent state boundaries are handled
- [ ] Focused and repository-required checks pass
