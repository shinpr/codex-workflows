---
name: recipe-quality-profile
description: "Creates or maintains docs/project-context/quality.yaml from repository-specific review requirements. Use when asked to generate, update, or audit a repository quality profile."
disable-model-invocation: true
---

## Required Skills [LOAD BEFORE EXECUTION]

1. `llm-friendly-context` — make each generated condition unambiguous, executable, and observable
2. `coding-rules` — distinguish repository-specific policy from general code quality knowledge

## Purpose

Generate or update repository-specific code-quality acceptance conditions at `docs/project-context/quality.yaml`. Create `docs/project-context/` when the directory is absent.

Target repository or requested policy change: $ARGUMENTS

## Profile Contract

Use this shape:

```yaml
version: 1
review_dimensions:
  - id: stable-kebab-case-id
    applies_when: Observable condition that makes this repository rule relevant to a change.
    pass: Observable accepted state to verify.
    evidence:
      - "repository/path: section, identifier, or contract"
```

Each dimension represents one repository-specific decision. `id` identifies it across reviews, `applies_when` limits its review surface, `pass` defines acceptance, and `evidence` records why the repository owns the rule.

## Authoring Flow

1. Resolve the target repository and read its existing `docs/project-context/quality.yaml` when present.
2. For initial creation, inspect the smallest relevant set of repository instructions, contributor documentation, CI, manifests and scripts, schemas and public contracts, representative tests, and implementation patterns. For maintenance, begin with the requested change and evidence cited by existing dimensions; expand only when it can change a dimension.
3. Retain a candidate only when its failure would change implementation acceptance and its repository-specific meaning is supported by a cited source or explicit user policy. A general language or framework concern qualifies when repository evidence adds a distinct local rule.
4. Write each retained dimension as one positive `pass` condition with the narrowest useful `applies_when` boundary. Consolidate dimensions that would produce the same finding and correction.
5. On maintenance, preserve supported dimensions outside the requested change, update criteria whose governing evidence changed, and remove criteria whose cited repository rule no longer exists. Preserve explicit user policy as evidence until the user changes it.
6. A request to create or update the profile authorizes the corresponding repository write. A proposal-only request stops before writing. Ask for a user decision only when the requested profile depends on a policy choice that repository evidence cannot determine.
7. Read the resulting YAML and verify version `1`, unique IDs, all four dimension fields, positive observable pass conditions, and readable evidence references.

When no repository-specific dimension survives this process and no profile exists, report that no profile content is supported and leave the repository unchanged.

## Result

Report:

- profile path and whether it was created, updated, or left unchanged;
- dimensions added, changed, or removed;
- evidence used for each changed dimension;
- an exact validation limitation when the profile could not be verified.

## Completion Check

- [ ] `llm-friendly-context` was read before authoring criteria
- [ ] Every dimension changes a review decision and cites repository or user-policy evidence
- [ ] Conditions are positive, observable, and limited by `applies_when`
- [ ] The profile contains only repository-specific acceptance conditions
- [ ] Existing supported dimensions survive maintenance unchanged
- [ ] The written profile satisfies the Profile Contract
