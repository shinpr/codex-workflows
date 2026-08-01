# Convergence Criteria

Use these rules when eliciting or judging a convergence record.

## outcome

Record one observable result, not a feature list. A proposed requirement that cannot be traced to the outcome is excess: remove it or ask the user whether the outcome should widen.

## requirements[]

| Layer | Meaning | Buildable now |
|-------|---------|---------------|
| `current-state` | Behavior that already exists | No; it is evidence |
| `desired-future` | Change the user has chosen | Yes |
| `speculative` | Idea raised without a decision | No; record a deferral reason |

Ask when the layer is unclear. Treating all three as equally binding turns exploration into accidental scope.

## nonGoals[]

Present cost and its unknowns before asking what to exclude. Record exclusions in the user's wording. Set `userAgreedNone` only when the user considered exclusions and chose none.

An adjacent capability noticed by an agent is a candidate question, not a non-goal.

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

File count is supporting evidence, not a scale rule: languages and architectures distribute the same change differently. Do not read implementation behavior deeply or produce person-day estimates here; design and planning refine the estimate later.

Mark each supporting item `observed` or `inferred`, with its source. Keep unresolved facts in `unknowns`. Record one band:

| Band | Meaning |
|------|---------|
| `low-reversible` | Additive, isolated, flagged, or easily removed |
| `medium` | Coordinates across a boundary or makes reversal affect related work |
| `high-irreversible` | Changes a public contract, persisted data shape, dependency platform, or staged migration |

An unknown that could raise the band is a question, not permission to assume the lower band.

## Challenge Intensity

| Cost band | Response |
|-----------|----------|
| `low-reversible` | Record and accept when the fields converge |
| `medium` | Present the cost and one lower-cost alternative |
| `high-irreversible` | Present the trade-off and require the user's explicit choice before design |

The goal is a decision proportionate to cost, not resistance to user intent.

## Solution-in-Disguise Test

When a requirement names a mechanism rather than an outcome, identify materially different ways to achieve the outcome. If alternatives exist, present the named mechanism as one option with its trade-off. If repository or platform constraints make it the only credible route, record that evidence and proceed.
