# Frontend-Specific AI Development Guide (React/TypeScript)

## Frontend Judgment

- Back a type assertion with a boundary check or an existing contract that establishes the asserted type.
- Move state ownership only when a broader owner reduces pass-through coordination; retain local props when responsibility is local.
- Split a component when rendering, state/data ownership, or reusable behavior changes independently and the split avoids added synchronization.
- Add a catch only for a distinct failure mode with a defined recovery owner and a user-visible outcome.

## Frontend Verification

Read `package.json` scripts and `packageManager`, then run only the repository or task checks applicable to the changed behavior. Run coverage when the repository or task defines it as required. Verify that failures remain visible through the selected UI boundary.

## Frontend Technical Decisions

### Performance vs Readability
- Prioritize readability unless clear bottleneck exists
- Measure before optimizing
- When React Compiler is enabled, routine memoization is automatic. Use manual memoization only for a measured bottleneck or stable reference identity required by third-party APIs or effect dependencies.

## Frontend Impact Analysis

Inspect representative callers, component ownership, and relevant props/state/event flow until the implementation and verification boundary is determined. Record findings only when another worker or the final decision needs them.
