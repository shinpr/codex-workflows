# Convergence Criteria

Use these rules when eliciting or judging a convergence record.

## outcome

Record one observable result, not a feature list. A proposed requirement that cannot be traced to the outcome is excess: remove it or ask the user whether the outcome should widen.

## requirements[]

| Layer | Meaning | Buildable now |
|-------|---------|---------------|
| `current-state` | Behavior that already exists | Evidence only |
| `desired-future` | Change the user has chosen | Current scope |
| `speculative` | User-raised idea deferred from current scope | Deferred; record a reason |

Ask when the layer is unclear. Treating all three as equally binding turns exploration into accidental scope.

## nonGoals[]

Present cost and its unknowns before asking what to exclude. Record exclusions in the user's wording. Set `userAgreedNone` only when the user considered exclusions and chose none.

An agent-proposed capability remains a question until the user accepts or excludes it. Only then does it enter the record as a user decision.

## cost

Estimate cost from shallow structural inspection:

| Input | Evidence |
|-------|----------|
| Targets and their kinds | Relevant paths and components found by search |
| Boundaries crossed | Affected layers, contracts, callers, and integrations |
| Reuse versus new work | Existing equivalent shapes or mechanisms |
| Persistent-state conversion | Schema, migration, or compatibility needs |
| Verification support | Existing harnesses and representative test boundaries |
| Unknowns | Facts shallow inspection cannot establish |

Keep inspection shallow and express cost as a rough band; design and planning refine behavior and effort later.

Mark each supporting item `observed` or `inferred`, with its source. Keep unresolved facts in `unknowns`. Record one band:

| Band | Meaning |
|------|---------|
| `low` | Existing support makes the change localized and straightforward |
| `moderate` | The change coordinates across a boundary or adds notable supporting work |
| `high` | The change affects a public contract, persisted data shape, or dependency platform |

Treat an unknown that could raise the band as a question, and set the band from established evidence.

## Challenge Intensity

| Cost band | Response |
|-----------|----------|
| `low` | Record and accept when the fields converge |
| `moderate` | Present the cost and one lower-cost alternative |
| `high` | Present the trade-off and require the user's explicit choice before design |

The goal is a cost-proportionate decision that preserves user intent. Cost selects challenge intensity; documentation-criteria Structural Scale independently selects the workflow.

## Solution-in-Disguise Test

When a requirement names a mechanism rather than an outcome, identify materially different ways to achieve the outcome. If alternatives exist, present the named mechanism as one option with its trade-off. If repository or platform constraints make it the only credible route, record that evidence and proceed.
