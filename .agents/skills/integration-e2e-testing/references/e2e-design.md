# Browser E2E Design

Use this reference only after the parent skill Selection Gate has chosen a browser-level claim.

## UI Evidence

Map the selected claim to the smallest UI journey that exercises its required browser boundary:

| Source | Use |
|---|---|
| Design Doc AC / Verification Strategy | Binding observable result and required boundary |
| UI Spec flow or interaction | Entry, action, and visible states needed by that result |
| Existing browser tests and harness | Repository setup, fixture, locator, and cleanup conventions |

Do not turn every screen transition, UI state, responsive row, or accessibility row into a candidate. It becomes part of the selected E2E only when the binding claim cannot be proven at a cheaper boundary.

## Lane

- Use `fixture-e2e` when the real browser/UI is the boundary and controlled backend or fixture state is sufficient.
- Use `service-integration-e2e` only when the selected claim depends on real local cross-service behavior such as persistence, event delivery, or transaction consistency.
- Use RTL or integration instead when navigation and browser behavior are not material to the claim.

## Journey Record

```text
Claim / AC: [binding source]
Journey: [shortest entry -> action -> observable result]
Real boundary: [browser/UI and any required local service]
Controlled boundary: [fixture/mock and why it is permitted]
Primary failure mode: [regression the assertions detect]
Assertions: [consumer-visible result]
Lane: fixture-e2e | service-integration-e2e
```

## Repository Fit

Use the project's existing browser harness, setup, locator, fixture, and cleanup pattern. Introduce page objects or shared helpers only when existing conventions use them or repeated selected journeys need the same stable responsibility.

Test only breakpoints, browser APIs, keyboard behavior, or assistive semantics named by the governing claim. Start from isolated state and leave changed state clean under repository conventions.

The parent skill lane ceilings remain limits, not targets.
