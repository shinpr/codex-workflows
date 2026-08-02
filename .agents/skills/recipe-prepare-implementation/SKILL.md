---
name: recipe-prepare-implementation
description: "Prepare repository-local execution tools when the user requests setup or a concrete build capability is unavailable."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — capability failure resolution and caller-return rules

## Purpose

Run this optional side path when the user explicitly requests setup or Orchestrator Escalation Resolution identifies one concrete missing repository-local capability. Prepare existing repository-local tools needed to execute the approved Work Plan, then return a capability summary to the caller.

Work plan: $ARGUMENTS

## Scope

Repository-local preparation includes existing project mechanisms for:

- dependency installation
- local containers or services
- repository-provided bootstrap commands
- test runner, browser harness, fixtures, and seed commands already referenced by the Work Plan or governing Design Doc
- non-secret local configuration derived from checked-in examples

Feature implementation, new product behavior, external account creation, credential acquisition, organizational approval, production access, deployment, and release execution remain in their owning workflows. The caller continues with the capabilities available after this side path.

## Process

1. Resolve the exact Work Plan path from `$ARGUMENTS`, or from the build caller when invoked as its side path.
2. Read repository manifests, lockfiles, checked-in setup documentation, and scripts that control commands used by the Work Plan.
3. Select the smallest existing setup commands that enable the planned repository checks.
4. Execute those commands and capture their observable results.
5. Classify each planned capability as `available` or `unavailable` with concrete evidence.
6. Return the capability summary to the caller. In a build flow, unavailable capabilities become task-local verification limitations handled through Orchestrator Escalation Resolution. The approved Work Plan and its implementation task set remain unchanged.

Use the active execution plan when one exists. When none exists and setup has three or more dependent commands, create one plan and update it through completion.

## Output

```text
Environment Preparation Result
Status: completed
Work Plan: [path]
Available:
- [capability]: [command or evidence]
Unavailable:
- [capability]: [concrete reason]
Caller action: continue with available capabilities
```

## Completion Check

- The exact Work Plan is identified.
- Selected commands come from repository-owned setup mechanisms.
- Command results provide evidence for every reported capability.
- The Work Plan content and approval status remain unchanged.
- The capability summary is returned to the caller.
