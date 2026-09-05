# Convergence Criteria

Use these rules when eliciting or judging a convergence record.

## outcome

Record one observable result, not a feature list. A proposed requirement that cannot be traced to the outcome is excess: remove it or ask the user whether the outcome should widen.

## requirements[]

| Layer | Meaning | Buildable now |
|-------|---------|---------------|
| `current-state` | Behavior that already exists | Evidence only |
| `desired-future` | Change the user has chosen | Current scope |
| `speculative` | User-raised idea not selected for current scope | Deferred in the active convergence context; omit from durable downstream documents |

Ask when the layer is unclear. Treating all three as equally binding turns exploration into accidental scope.

## nonGoals[]

Present cost and its unknowns before asking what to exclude. Record exclusions in the user's wording. Treat an empty `nonGoals` list as ready only when the user considered exclusions and chose none.

Agent-proposed capabilities are candidates, not user decisions. Ask about a candidate only when accepting or excluding it is necessary to settle the requested scope; leave unnecessary suggestions out of the convergence record.

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

Set the band from established evidence and explain material unknowns. Resolve factual unknowns through the shallow inspection above; ask the user when the remaining uncertainty requires a scope or trade-off decision.

## Challenge Intensity

| Cost band | Response |
|-----------|----------|
| `low` | Record and accept when the fields converge |
| `moderate` | Present the cost; include a credible lower-cost alternative when it materially changes the user's decision |
| `high` | Present the trade-off and require the user's explicit choice before design |

The goal is a cost-proportionate decision that preserves user intent. Cost selects challenge intensity; documentation-criteria Structural Scale independently selects the workflow.

## Solution-in-Disguise Test

Distinguish a user-selected mechanism from a suggested means to an outcome. Preserve an explicit selection unless evidence exposes a material feasibility, cost, or contract issue. For a suggested mechanism, present a credible alternative when its trade-off could change the scope decision. If constraints establish the route, or alternatives offer no material benefit for the outcome, record the relevant evidence and proceed.
