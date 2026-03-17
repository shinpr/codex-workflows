---
name: recipe-design
description: "Execute from requirement analysis to design document creation."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `implementation-approach` — implementation strategy
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows

**Context**: Dedicated to the design phase.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**Execution Protocol**:
1. **Spawn agents for all work** -- your role is to invoke sub-agents, pass data between them, and report results
2. **Follow subagents-orchestration-guide skill design flow exactly**:
   - Execute: requirement-analyzer -> technical-designer -> document-reviewer -> design-sync
   - **[STOP — BLOCKING]** At every `[Stop: ...]` marker -> Present status to user for confirmation. **CANNOT proceed until user explicitly confirms.**
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: MUST execute document-reviewer, design-sync, and all stopping points defined in subagents-orchestration-guide skill flows -- each serves as a quality gate.
ENFORCEMENT: Skipping any quality gate invalidates the design output.

## Workflow Overview

```
Requirements -> requirement-analyzer -> [Stop: Scale determination]
                                             |
                                     technical-designer -> document-reviewer
                                             |
                                        design-sync -> [Stop: Design approval]
```

## Scope Boundaries

**Included in this skill**:
- Requirement analysis with requirement-analyzer
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with design document (ADR/Design Doc) approval. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

Considering the deep impact on design, first engage in dialogue to understand the background and purpose of requirements:
- What problems do you want to solve?
- Expected outcomes and success criteria
- Relationship with existing systems

Once requirements are moderately clarified, analyze with requirement-analyzer and create appropriate design documents according to scale.

MUST clearly present design alternatives and trade-offs.

Execute the process below within design scope.

## Execution Process

### Step 1: Requirement Analysis
Spawn requirement-analyzer agent: "Analyze the following requirements and determine scale: $ARGUMENTS"

### Step 2: Design Document Creation
Spawn technical-designer agent: "Create design document based on requirement analysis output. Include architecture decisions, component design, and acceptance criteria."

### Step 3: Document Review
Spawn document-reviewer agent: "Review the design document created in the previous step. Verify completeness, consistency, and quality."

### Step 4: Consistency Verification
Spawn design-sync agent: "Verify consistency of the design document with other existing design documents and project constraints."

**Note**: design-sync returns `sync_status: "SKIPPED"` when only 1 Design Doc exists. This is distinct from `NO_CONFLICTS` and MUST be reported as such to the user.

## Completion Criteria

- [ ] Spawned requirement-analyzer and determined scale
- [ ] Created appropriate design document (ADR or Design Doc) via technical-designer
- [ ] Spawned document-reviewer and addressed feedback
- [ ] Spawned design-sync for consistency verification
- [ ] Obtained user approval for design document
- [ ] All `[Stop: ...]` markers honored with user confirmation

## Output Example
Design phase completed.
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
