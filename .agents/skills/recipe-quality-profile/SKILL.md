---
name: recipe-quality-profile
description: "Proposes and, after user confirmation, creates or maintains docs/project-context/quality.yaml from repository-specific review requirements. Use when asked to generate or update a repository quality profile."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. `llm-friendly-context` — make each generated condition unambiguous, executable, and observable
2. `coding-rules` — distinguish repository-specific policy from general code quality knowledge

## Purpose

Establish repository-specific code-quality acceptance conditions with the user, then create or update `docs/project-context/quality.yaml`. Create `docs/project-context/` when the directory is absent.

Target repository and, when a profile already exists, requested policy change: $ARGUMENTS

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

1. Resolve the target repository and read its existing `docs/project-context/quality.yaml` when present. When a profile exists without a requested policy change, ask for the intended change and keep the profile unchanged.
2. Establish candidate dimensions before deciding profile content:
   - For initial creation, derive candidates from acceptance conditions that repository instructions, contributor documentation, CI, manifests and scripts, schemas and public contracts, tests, or established implementation patterns express or enforce.
   - For an update, translate the requested policy change into candidate additions, changes, or removals. Match it to the current dimension that owns the same policy when one exists and preserve other dimensions as the proposed unchanged set.
3. State a candidate `applies_when` and `pass`, then identify the repository claims that must hold for that criterion to mean what it says. Inspect supporting and contradicting evidence, following declarations, workflows, contracts, tests, and usages wherever their difference could change the candidate's applicability, accepted state, or ownership.
4. Compare the candidate with the current profile and repository evidence. Record duplicated policy ownership, contradictory accepted states under overlapping `applies_when` conditions, conflicting evidence, and current accepted behavior that the candidate would newly reject. Separate repository facts from policy choices that only the user can make.
5. Retain a candidate for the proposal only when its failure would change implementation acceptance and every repository fact it depends on is supported by cited evidence. Present remaining policy choices for user confirmation. When a required repository fact cannot be established, report the exact evidence needed and omit that candidate from the proposal. A general language or framework concern qualifies when repository evidence adds a distinct local rule. Express each retained dimension as one positive observable `pass` condition with the narrowest useful `applies_when` boundary, and consolidate dimensions that would produce the same finding and correction.
6. Before writing, present the proposed additions, changes, and removals; confirm that other dimensions remain unchanged; show the supporting and contradicting evidence for each proposed modification; and state every unresolved policy choice with its effect on review acceptance. **[STOP — BLOCKING]** Keep the repository unchanged until the user explicitly confirms a proposal with no unresolved choices.
7. When the user's response changes a proposed criterion or resolves a policy choice, repeat its repository comparison and present the revised proposal for confirmation. After confirmation, write only the confirmed profile content.
8. Read the resulting YAML and verify version `1`, unique IDs, all four dimension fields, positive observable pass conditions, readable evidence references, and consistency with the confirmed proposal.

When no repository-specific dimension survives this process and no profile exists, report that no profile content is supported and leave the repository unchanged.

## Result

Before confirmation, report:

- proposed additions, changes, and removals, plus confirmation that other dimensions remain unchanged;
- supporting and contradicting repository evidence for each proposed modification, plus exact evidence needed for any candidate that cannot yet be proposed;
- policy choices requiring the user's decision and how each choice changes review acceptance.

After confirmation, report:

- profile path and whether it was created, updated, or left unchanged;
- dimensions added, changed, or removed;
- evidence used for each changed dimension;
- an exact validation limitation when the profile could not be verified.

## Completion Check

- [ ] `llm-friendly-context` was read before authoring criteria
- [ ] Every dimension changes a review decision and cites repository or user-policy evidence
- [ ] Conditions are positive, observable, and limited by `applies_when`
- [ ] The profile contains only repository-specific acceptance conditions
- [ ] Candidate criteria were compared with supporting and contradicting repository evidence
- [ ] The user confirmed the proposed profile content before any repository write
- [ ] Dimensions outside the requested update remain unchanged and the resulting set is internally consistent
- [ ] The written profile satisfies the Profile Contract
