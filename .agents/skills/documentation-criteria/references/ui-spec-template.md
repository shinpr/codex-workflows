# [Feature Name] UI Specification

## Overview

[Purpose and scope of this UI Specification in 2-3 sentences]

### Target PRD
- PRD path: [docs/prd/xxx-prd.md | "N/A -- based on requirement-analyzer output"]
- Feature scope: [Which PRD requirements this UI Spec covers | Summary of analyzed requirements]

### Design Source
| Source | Path | Version |
|--------|------|---------|
| Prototype code | [docs/ui-spec/assets/xxx/] | [commit SHA / tag] |

## Prototype Management

Prototype code is an **attachment** to this UI Spec. The canonical specification is always this document + the Design Doc.

- **Attachment path**: [docs/ui-spec/assets/{feature-name}/]
- **Version identification**: [commit SHA / tag]
- **Compliance premise**: [e.g., design system compliance, component library usage]
- **Relationship to canonical spec**: Differences between prototype and this spec are resolved in favor of this document. Prototype serves as visual/behavioral reference only.

## AC Traceability (Prototype)

Map PRD acceptance criteria to prototype references. Skip this section if no prototype is provided.

| AC ID | AC Summary | Screen / State | Prototype Reference (element ID / path) | Adoption Decision |
|-------|-----------|----------------|----------------------------------------|-------------------|
| AC-001 | [EARS AC summary] | [Screen / state name] | [element or file reference] | Adopted / Not adopted / On hold |

## Screen List and Transitions

### Screen List

| Screen ID | Screen Name | Description | Entry Condition |
|-----------|------------|-------------|-----------------|
| S-01 | [Screen name] | [Purpose] | [How user reaches this screen] |

### Transition Conditions

| Source | Destination | Trigger | Guard Condition |
|--------|------------|---------|-----------------|
| S-01 | S-02 | [User action] | [Precondition if any] |

## Component Decomposition

### Component Tree

```
[Page/Screen]
  +-- [Container Component]
  |   +-- [Presentational Component A]
  |   +-- [Presentational Component B]
  +-- [Container Component]
      +-- [Presentational Component C]
```

### Component: [ComponentName]

#### State x Display Matrix

List only states that actually exist for this component. Remove unused rows. Include fallback or degraded states only when explicitly required by the PRD or existing behavior.

| State | Trigger / Condition | Display | Recovery / Notes |
|-------|---------------------|---------|------------------|
| Default | [Initial or ready condition] | [Normal display] | [Notes if needed] |
| Loading | [Data or action in progress] | [e.g., skeleton matching final layout] | [Cancellation, timeout, or transition notes if relevant] |
| Error | [Failure condition] | [e.g., inline `Alert` + "Retry"] | [Recovery action required by product behavior] |

#### Interaction Definition

| AC ID | EARS Condition | User Action | System Response | State Transition | Error Handling |
|-------|---------------|-------------|-----------------|-----------------|----------------|
| AC-001 | When [trigger] | [Click / input / etc.] | [Expected behavior] | [From state -> To state] | [Retry / Reset / Explicitly defined degraded behavior if any] |

### Component: [ComponentName2]

[Repeat State x Display Matrix and Interaction Definition for each component]

## Design Tokens and Component Map

### Environment Constraints
- Target browsers: [e.g., Chrome 120+, Safari 17+]
- Theme support: [e.g., light/dark, system preference]

#### Responsive Behavior

| Breakpoint | Width | Key Changes |
|-----------|-------|-------------|
| Mobile | [e.g., < 768px] | [e.g., single-column layout, compact navigation, reduced non-critical detail] |
| Tablet | [e.g., 768px - 1023px] | [e.g., two-column layout, condensed sidebar, larger touch targets] |
| Desktop | [e.g., >= 1024px] | [e.g., full layout, persistent navigation, expanded comparison views] |

### Existing Component Reuse Map

| UI Element | Decision | Existing Component | Notes |
|-----------|----------|-------------------|-------|
| [Button] | Reuse | [components/ui/Button] | [No modifications needed] |
| [DataTable] | Extend | [components/ui/Table] | [Add sorting support] |
| [FeatureCard] | New | - | [No similar component exists] |

### Design Tokens (include only when existing tokens must be referenced or a new visual system must be defined)

Prefer existing design-system tokens, theme variables, or component-library primitives. If the project does not define tokens at this level, replace this section with a short note such as `N/A - existing component library styles are used without new token definitions`. If the entire Design Tokens section is `N/A`, skip all subsections below.

#### Color Roles

Remove unused subsections and rows. Do not invent token names or values that are not supported by the codebase, design system, or approved design direction.

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Background Surface | [existing token] | [actual value if defined] | [Page or container background] |
| Brand / Accent | [existing token] | [actual value if defined] | [Primary actions and emphasis] |

#### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Body | [existing token or family] | [actual size if defined] | [actual weight if defined] | [actual line height if defined] | [actual letter spacing if defined] |

#### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| [existing token] | [actual value if defined] | [Relevant spacing usage] |

#### Elevation

| Level | Treatment | Usage |
|-------|-----------|-------|
| [Relevant level] | [actual token or shadow treatment if defined] | [Where it is used] |

#### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| [existing token] | [actual value if defined] | [Relevant usage] |

## Visual Acceptance

### Golden States
Define the key visual states that serve as acceptance benchmarks:

1. **[State name]**: [Description of what should be visually confirmed]
2. **[State name]**: [Description]

### Layout Constraints
- [Min/max width, height constraints]
- [Spacing rules between components]
- [Overflow behavior]

## Accessibility Requirements

### Keyboard Navigation

| Component | Tab Order | Key Binding | Behavior |
|-----------|-----------|-------------|----------|
| [Component] | [Order number] | [Enter / Space / Arrow] | [Expected behavior] |

### Screen Reader

| Component | Role | Accessible Name | Live Region |
|-----------|------|-----------------|-------------|
| [Component] | [ARIA role] | [aria-label / aria-labelledby] | [polite / assertive / none] |

### Contrast Requirements

| Element | Foreground | Background | Ratio Target |
|---------|-----------|------------|-------------|
| [Text element] | [Color] | [Color] | [4.5:1 for normal text / 3:1 for large text] |

## Open Items

| ID | Description | Owner | Deadline |
|----|-------------|-------|----------|
| TBD-01 | [Unresolved question or decision] | [Who resolves] | [Target date] |

*All TBDs must have an owner and deadline. Resolve before Design Doc creation.*

## Update History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| YYYY-MM-DD | 1.0 | Initial version | [Name] |
