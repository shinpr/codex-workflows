# [Feature Name] UI Specification

## Overview

- Outcome: [confirmed user-visible result]
- Scope: [affected views/components]
- PRD or requirement carrier: [path or confirmed context]
- Explicit exclusions: [non-goals | none]

## Design Evidence

Include only sources used by a current UI decision.

| Source | Path / identifier | Decision supplied |
|---|---|---|
| Existing UI | [file:component] | [reuse/preserved behavior] |
| Prototype | [asset path/version] | [adopted behavior] |
| External resource | [label + feature identifier] | [visual/system decision] |

- Prototype reference strength: [`binding` — implementation follows the attachment's rendering except where this UI Spec differs | `reference` — only decisions recorded in this UI Spec reach implementation]

Omit unused source rows and the reference-strength field when no prototype is used. Under either strength, this UI Spec and the Design Doc remain authoritative; differences resolve in their favor.

## UI Surface and Flow

| View or state | Entry / trigger | User-visible result | Governing requirement / AC |
|---|---|---|---|
| [view/state] | [condition or action] | [display/transition] | [source] |

Add a transition diagram only when this table cannot make a material multi-step flow clear.

## Components and Interactions

| Component responsibility | Reuse / extend / new | Inputs or state | Interaction and response | Governing source |
|---|---|---|---|---|
| [responsibility] | [decision + existing path when reused] | [only relevant values] | [observable behavior] | [requirement / AC / preserved behavior] |

Create separate component detail only when a state matrix or interaction cannot be expressed clearly in the table above.

### State / Display Detail (When Applicable)

| Component | State or condition | Display | Recovery / transition | Source |
|---|---|---|---|---|
| [component] | [loading/error/empty/etc.] | [observable display] | [behavior] | [governing source] |

Include only sourced states. Omit the section when the primary interaction table is sufficient.

## Visual Constraints (When Applicable)

| Element / view | Constraint | Repository or approved design source | Acceptance observation |
|---|---|---|---|
| [element] | [layout, token, breakpoint, or golden state] | [source] | [what must be visible] |

Record token names, browser targets, breakpoints, and visual variants from confirmed requirements or repository evidence. Omit the section when existing component behavior is sufficient.

## Accessibility Requirements (When Applicable)

| Component / interaction | Keyboard, semantic, announcement, or contrast behavior | Source | Acceptance observation |
|---|---|---|---|
| [component] | [required behavior] | [requirement / preserved rule] | [observable check] |

Omit when no confirmed requirement, preserved behavior, or applicable repository/design-system rule supplies an accessibility change.

## Acceptance Traceability

| AC / requirement | View, component, or interaction | Observable UI proof |
|---|---|---|
| [AC-001] | [target] | [visible state or interaction result] |

## Open User Decisions

| Decision | Effect on current UI |
|---|---|
| [unresolved binding decision] | [affected behavior] |

Omit when none remain. Contextual unknowns may remain in source context and need no owner or deadline here.

## Update History

| Date | Version | Changes |
|---|---|---|
| YYYY-MM-DD | 1.0 | Initial specification |
