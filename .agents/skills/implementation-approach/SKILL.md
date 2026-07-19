---
name: implementation-approach
description: "Implementation strategy selection framework with meta-cognitive approach. Use when: planning implementation strategy, selecting between vertical/horizontal slicing, or defining verification criteria for tasks."
---

# Implementation Strategy Selection Framework (Meta-cognitive Approach)

## Meta-cognitive Strategy Selection Process [MANDATORY]

### Phase 1: Comprehensive Current State Analysis

**Core Question**: "What does the existing implementation look like?"

#### Analysis Framework
```yaml
Architecture Analysis: Responsibility separation, data flow, dependencies, technical debt
Implementation Quality Assessment: Code quality, test coverage, performance, security
Historical Context Understanding: Current form rationale, past decision validity, constraint changes, requirement evolution
```

#### Meta-cognitive Question List [MANDATORY CHECKPOINTS]
- What is the true responsibility of this implementation?
- Which parts are business essence and which derive from technical constraints?
- What dependencies or implicit preconditions are unclear from the code?
- What benefits and constraints does the current design bring?

**ENFORCEMENT**: CANNOT proceed to Phase 2 without answering all questions

### Phase 2: Direct MVP

Describe the simplest end-to-end design that delivers the minimum user value or required outcome from the governing artifact using the existing architecture, dependencies, persistence, and established patterns. Preserve explicit user-stated technical requirements as constraints; treat only wording framed as a suggestion or option as a candidate, and resolve outcome-relevant ambiguity before design. Record the result as `Direct MVP` before considering additional mechanisms.

### Phase 3: Failure Check [MANDATORY]

Test the Direct MVP against every current requirement, verified constraint, observed problem, and evidence-backed material risk within confirmed scope or dependencies required for its outcome. Record only unmet items as `Failed Items`, with evidence; record `None` when all pass. Report verified problems outside that boundary separately for a scope decision.

**ENFORCEMENT**: CANNOT add design surface before the Failure Check is complete.

### Phase 4: Targeted Expansion

For each Failed Item, choose the sufficient candidate with the lowest lifecycle cost. Treat persistent state, public-contract or cross-boundary fields and props, behavioral modes, flags or variants, reusable abstractions, extracted services, shared utilities, and component splits as maintenance-surface-bearing cost factors. Prefer fewer new elements only when candidates are otherwise sufficient and equivalent. Record the choice as `Adopted Additions`; record `None` when no expansion is needed. An addition without a Failed Item is excluded.

### Phase 5: Subtraction Check [MANDATORY]

Remove each Adopted Addition in turn and re-run its Failed Item. At design time, this means evaluating the design without the addition against the evidence recorded for that Failed Item. Keep the addition only when the item becomes unmet again; record removed or larger options in `Rejected Additions` with a brief reason, or `None` when no addition was considered.

### Phase 6: Implementation Approach Decision

After the design converges, select its implementation slicing approach:

#### Vertical Slice (Feature-driven)
**Characteristics**: Vertical implementation across all layers by feature unit
**Application Conditions**: Low inter-feature dependencies, output in user-usable form, changes needed across all architecture layers
**Verification Method**: End-user value delivery at each feature completion

#### Horizontal Slice (Foundation-driven)
**Characteristics**: Phased construction by architecture layer
**Application Conditions**: Foundation system stability important, multiple features depend on common foundation, layer-by-layer verification effective
**Verification Method**: Integrated operation verification when all foundation layers complete

#### Hybrid
**Characteristics**: Combination of vertical and horizontal slices
**Application Conditions**: Verified dependencies require foundation work before some, but not all, user-value slices
**Verification Method**: Use the task verification level required by each phase's proof obligation

### Phase 7: Decision Rationale Documentation

**Design Doc Documentation**: Record Direct MVP, Failed Items, Adopted Additions, Rejected Additions, and slicing rationale.

## Verification Level Definitions

Task verification levels describe the boundary exercised by the task's runnable check:

- **L1: Unit or Local Verification** - Exercises one unit or an in-process behavior without crossing an integration boundary
- **L2: Integration Verification** - Exercises interaction across components, persistence, processes, or another named integration boundary
- **L3: End-to-End Verification** - Exercises the complete user, browser, process, or service journey required by the proof obligation

Select the level that exercises the boundary named by the task's proof obligation. A broader level does not replace a required narrower check, and a narrower level does not prove a required integration or end-to-end boundary.

### Completion Evidence Priority

When judging whether implementation is complete, prefer evidence in this order:

1. **Functional operation evidence** - The required end-user or externally observable behavior operates
2. **Test operation evidence** - The relevant tests execute and pass
3. **Build evidence** - The code builds or runs without errors

Build success alone does not prove required behavior when functional or test evidence is applicable.

## Integration Point Definitions

Define integration points according to selected strategy:
- **Strangler-based**: When switching between old and new systems for each feature
- **Feature-driven**: When users can actually use the feature
- **Foundation-driven**: When all architecture layers are ready and E2E tests pass
- **Hybrid**: When individual goals defined for each phase are achieved

## Anti-patterns [MANDATORY to detect]

- **Premature Expansion**: Adding design surface before the Direct MVP and Failure Check
- **Unsupported Addition**: Adding a mechanism with no Failed Item
- **Scope Deferral**: Deferring a verified problem without a material behavior, architecture, or effort reason
- **Insufficient Analysis**: MUST complete Phase 1 analysis framework before strategy selection
- **Rationale Omission**: MUST record Phase 7 outputs when selecting strategy

**ENFORCEMENT**: Detecting ANY anti-pattern requires IMMEDIATE correction before proceeding

## Guidelines for Meta-cognitive Execution

1. **Investigate Broadly**: Identify impacts, existing problems, and constraints before designing
2. **Converge Sequentially**: Complete Direct MVP, Failure Check, Targeted Expansion, and Subtraction Check in order
3. **Use Patterns on Demand**: Apply a design pattern only when it resolves a recorded Failed Item
4. **Preserve Context**: Record adopted and rejected decisions concisely
