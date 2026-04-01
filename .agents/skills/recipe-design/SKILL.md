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
2. **Follow the design flow defined in subagents-orchestration-guide**:
   - Apply the scale-specific and layer-specific branches defined there, including PRD, ADR, and UI Spec steps when required
   - Use `requirement-analyzer -> codebase-analyzer -> technical-designer -> code-verifier -> document-reviewer -> design-sync` as the core design-document path after prerequisite branches are resolved
   - **[STOP — BLOCKING]** At every `[Stop: ...]` marker -> Present status to user for confirmation. **CANNOT proceed until user explicitly confirms.**
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: MUST execute document-reviewer, design-sync, and all stopping points defined in subagents-orchestration-guide skill flows -- each serves as a quality gate.
ENFORCEMENT: Skipping any quality gate invalidates the design output.

## Workflow Overview

Core design-document path after prerequisite branches such as PRD, ADR, or UI Spec are resolved:

```
Requirements -> requirement-analyzer -> [Stop: Scale determination]
                                             |
                                     codebase-analyzer
                                             |
                                     technical-designer -> code-verifier -> document-reviewer
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

Pass the user requirements directly to requirement-analyzer as the first action. If clarification is needed, handle it at the requirement-analysis stop point before proceeding.

MUST clearly present design alternatives and trade-offs.

Execute the process below within design scope.

## Execution Process

### Step 1: Requirement Analysis
Spawn requirement-analyzer agent: "Analyze the following requirements and determine scale: $ARGUMENTS"

### Step 2: Codebase Analysis
Spawn codebase-analyzer agent: "Analyze the existing codebase to provide evidence for Design Doc creation. requirement_analysis: [output from Step 1]. requirements: $ARGUMENTS"

### Step 3: Design Document Creation
Spawn technical-designer agent: "Create design document based on requirement analysis output and codebase analysis output. Include architecture decisions, component design, and acceptance criteria."

### Step 4: Code Verification
Spawn code-verifier agent: "Verify the design document against the current codebase. document_path: [output from Step 3]. doc_type: design-doc."

### Step 5: Document Review
Spawn document-reviewer agent: "Review the design document created in the previous step. Verify completeness, consistency, and quality. code_verification: [output from Step 4]"

### Step 6: Consistency Verification
Spawn design-sync agent: "Verify consistency of the design document with other existing design documents and project constraints."

**Note**: design-sync returns `sync_status: "SKIPPED"` when only 1 Design Doc exists. This is distinct from `NO_CONFLICTS` and MUST be reported as such to the user.

## Completion Criteria

- [ ] Spawned requirement-analyzer and determined scale
- [ ] Spawned codebase-analyzer and passed its findings into design creation
- [ ] Created appropriate design document (ADR or Design Doc) via technical-designer
- [ ] Spawned code-verifier and passed its findings into document review
- [ ] Spawned document-reviewer and addressed feedback
- [ ] Spawned design-sync for consistency verification
- [ ] Obtained user approval for design document
- [ ] All `[Stop: ...]` markers honored with user confirmation

## Output Example
Design phase completed.
- Design document: docs/design/[document-name].md or docs/adr/[document-name].md
- Approval status: User approved
