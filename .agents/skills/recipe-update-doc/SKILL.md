---
name: recipe-update-doc
description: "Update existing design documents (Design Doc / PRD / ADR) with review and consistency verification."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows

**Context**: Dedicated to updating existing design documents.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator." (see subagents-orchestration-guide skill)

**First Action**: Register Steps 1-6 before any execution.

**Execution Protocol**:
1. **Spawn agents for all work** -- your role is to invoke sub-agents, pass data between them, and report results
2. **Execute update flow**:
   - Identify target -> Clarify changes -> Update document -> Review -> Consistency check
   - **[STOP — BLOCKING]** At every `[Stop: ...]` marker -> Present status to user for confirmation. **CANNOT proceed until user explicitly confirms.**
3. **Scope**: Complete when updated document receives approval

**CRITICAL**: MUST execute document-reviewer and all stopping points -- each serves as a quality gate for document accuracy.
ENFORCEMENT: Skipping document-reviewer risks propagating inconsistencies to downstream workflows.

## Workflow Overview

```
Target document -> [Stop: Confirm changes]
                        |
              technical-designer / technical-designer-frontend / prd-creator (update mode)
                        |
              document-reviewer -> [Stop: Review approval]
                        | (Design Doc only)
              design-sync -> [Stop: Final approval]
```

## Scope Boundaries

**Included in this skill**:
- Existing document identification and selection
- Change content clarification with user
- Document update with appropriate agent (update mode)
- Document review with document-reviewer
- Consistency verification with design-sync (Design Doc only)

**Out of scope** (redirect to appropriate skills):
- New requirement analysis -> $recipe-design
- Work planning or implementation -> $recipe-plan or $recipe-task

**Responsibility Boundary**: This skill completes with updated document approval.

Target document: $ARGUMENTS

## Execution Flow

### Step 1: Target Document Identification

Check for existing documents in docs/design/, docs/prd/, docs/adr/.

**Decision flow**:

| Situation | Action |
|-----------|--------|
| $ARGUMENTS specifies a path | Use specified document |
| $ARGUMENTS describes a topic | Search documents matching the topic |
| Multiple candidates found | Present options to user |
| No documents found | Report and end (suggest $recipe-design instead) |

### Step 2: Document Type and Layer Determination

Determine type from document path, then determine the layer to select the correct update agent:

| Path Pattern | Type | Update Agent | Notes |
|-------------|------|--------------|-------|
| `docs/design/*.md` | Design Doc | technical-designer or technical-designer-frontend | See layer detection below |
| `docs/prd/*.md` | PRD | prd-creator | - |
| `docs/adr/*.md` | ADR | technical-designer or technical-designer-frontend | See layer detection below |

**Layer detection** (for Design Doc and ADR):
Read the document and determine its layer from content signals:
- **Frontend** (-> technical-designer-frontend): Document title/scope mentions React, components, UI, frontend; or file contains component hierarchy, state management, UI interactions
- **Backend** (-> technical-designer): All other cases (API, data layer, business logic, infrastructure)

**ADR Update Guidance**:
- **Minor changes** (clarification, typo fix, small scope adjustment): Update the existing ADR file
- **Major changes** (decision reversal, significant scope change): Create a new ADR that supersedes the original

### Step 3: Change Content Clarification [Stop]

**[STOP — BLOCKING]** Present change summary to user for confirmation.
**CANNOT proceed until user explicitly confirms.**

Ask the user to clarify what changes are needed:
- What sections need updating
- Reason for the change (bug fix findings, spec change, review feedback, etc.)
- Expected outcome after the update

Confirm understanding of changes with user before proceeding.

### Step 4: Document Update

Spawn [Update Agent from Step 2] agent: "Operation Mode: update. Existing Document: [path from Step 1]. Changes Required: [Changes clarified in Step 3]. Update the document to reflect the specified changes. Add change history entry."

### Step 5: Document Review [Stop]

**[STOP — BLOCKING]** Present review results to user for approval.
**CANNOT proceed until user explicitly confirms.**

Spawn document-reviewer agent: "Review the following updated document. doc_type: [Design Doc / PRD / ADR]. target: [path from Step 1]. mode: standard. Focus on: Consistency of updated sections with rest of document, no contradictions introduced by changes, completeness of change history."

**Store output as**: `$STEP_5_OUTPUT`

**On review result**:
- Approved -> Proceed to Step 6
- Needs revision -> Return to Step 4 with review feedback (max 2 iterations):
  Spawn [Update Agent from Step 2] agent: "Operation Mode: update. Existing Document: [path from Step 1]. Review Feedback to Address: $STEP_5_OUTPUT. Address each issue raised in the review feedback."
- **After 2 rejections** -> Flag for human review, present accumulated feedback to user and end

Present review result to user for approval.

### Step 6: Consistency Verification (Design Doc only) [Stop]

**[STOP — BLOCKING]** Present consistency verification results to user for final approval.
**CANNOT proceed until user explicitly confirms.**

**Skip condition**: Document type is PRD or ADR -> Proceed to completion.

For Design Doc, spawn design-sync agent: "Verify consistency of the updated Design Doc with other design documents. Updated document: [path from Step 1]"

**On consistency result**:
- No conflicts -> Present result to user for final approval
- Conflicts detected -> Present conflicts to user:
  - A: Return to Step 4 to resolve conflicts in this document
  - B: End and address conflicts separately

## Error Handling

| Error | Action |
|-------|--------|
| Target document not found | Report and end (suggest $recipe-design instead) |
| Sub-agent update fails | Log failure, present error to user, retry once |
| Review rejects after 2 revisions | Stop loop, flag for human intervention |
| design-sync detects conflicts | Present to user for resolution decision |

## Completion Criteria

- [ ] Identified target document
- [ ] Clarified change content with user
- [ ] Updated document via appropriate agent (update mode)
- [ ] Spawned document-reviewer and addressed feedback
- [ ] Spawned design-sync for consistency verification (Design Doc only)
- [ ] Obtained user approval for updated document

## Output Example
Document update completed.
- Updated document: docs/design/[document-name].md
- Approval status: User approved
