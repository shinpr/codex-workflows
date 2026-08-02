---
name: recipe-update-doc
description: "Update existing design documents (Design Doc / PRD / ADR) with review and consistency verification."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and workflow flows
3. [LOAD IF NOT ACTIVE] `llm-friendly-context` — document update and review handoffs

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

**Context**: Dedicated to updating existing design documents.

## Orchestrator Definition

**Core Identity**: Coordinate document updates, perform lightweight routing and status changes directly, and invoke document specialists for semantic authoring and review.

**Execution Plan Gate**: Use the active execution plan when one exists. When none exists, create one with first "Map active rules to this task", Steps 1-6, and final "Verify outputs and rule adherence". While work remains, keep exactly one step `in_progress`; after final verification evidence exists, mark every step `completed`.

**Execution Protocol**:
1. Invoke the named author and reviewer for document judgment; perform artifact selection, routing, explicit-answer application, and status updates directly
2. **Execute update flow**:
   - Identify target -> Clarify and classify changes -> converge scope changes -> Update document -> Review -> Consistency check
   - Ask for missing change intent only when it cannot be recovered from the request and target document; obtain one document approval after review and applicable consistency verification
3. **Scope**: Complete when updated document receives approval

**CRITICAL**: MUST execute document-reviewer and all stopping points -- each serves as a quality gate for document accuracy.
ENFORCEMENT: Skipping document-reviewer risks propagating inconsistencies to downstream workflows.

## Workflow Overview

```
Target document -> Clarify and classify changes
                        | scope-changing PRD/Design Doc -> requirement-analyzer -> convergence hearing
                        | ADR or scope-preserving ------------------------------|
                                                                                 v
                                      technical-designer / technical-designer-frontend / prd-creator (update mode)
                        | (Design Doc only)
              code-verifier -> document-reviewer
                        | (Design Doc only)
              design-sync -> [Stop: Document approval]
```

## Scope Boundaries

**Included in this skill**:
- Existing document identification and selection
- Change content clarification with user
- Requirement Convergence for scope-changing PRD and Design Doc updates
- Document update with appropriate agent (update mode)
- Document review with document-reviewer
- Consistency verification with design-sync (Design Doc only)

**Out of scope** (redirect to appropriate skills):
- New document design -> $recipe-design
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

### Step 3: Change Content Clarification

Derive the sections, reason, and expected outcome from the user request and target document. Ask only for a missing item that changes the requested outcome or update classification.

After confirmation, classify the update:
- ADR: `convergence: N/A`.
- Scope-preserving PRD or Design Doc update: the outcome, buildable requirements, and exclusions remain unchanged. Preserve the existing convergence record; when none exists, use the eligible update N/A value.
- Scope-changing PRD or Design Doc update: the outcome, buildable requirements, or exclusions change. Load `requirement-convergence`, spawn requirement-analyzer with the document's current requirements plus the confirmed changes as self-contained input, and run the hearing on fields below `ready`. Continue when all four fields are `ready` or user-approved `weak-but-explicit`.

Retain the classification for routing and, when scope-changing, the confirmed `convergence` object for Steps 4 and 5.

### Step 4: Document Update

For PRD or Design Doc, spawn [Update Agent from Step 2]: "Operation Mode: update. Existing Document: [path from Step 1]. Changes Required: [Changes clarified in Step 3]. confirmed_requirement_context: [confirmed convergence for scope-changing updates | existing carrier or eligible N/A for scope-preserving updates]. Update the document to reflect the specified changes. Add change history entry."

For ADR, spawn the update agent with the existing path and confirmed changes; Requirement Convergence is outside this update.

### Step 5: Document Review

For Design Doc updates, first verify the updated document against code:

Spawn code-verifier agent: "Verify the updated Design Doc against current code. doc_type: design-doc. document_path: [path from Step 1]. verbose: false. Focus especially on literal identifier referential integrity for concrete paths, endpoints, type names, config keys, and other exact identifiers changed in this update."

**Store output as**: `$CODE_VERIFICATION_OUTPUT`

For Design Doc updates:
Spawn document-reviewer agent: "Review the following updated document. doc_type: DesignDoc. review_context: update. target: [path from Step 1]. mode: composite. confirmed_requirement_context: [Step 3 convergence or existing carrier/N/A]. code_verification: $CODE_VERIFICATION_OUTPUT. Focus on: Consistency of updated sections with rest of document, no contradictions introduced by changes, completeness of change history."

For PRD updates, spawn document-reviewer with the target, `mode: composite`, and `confirmed_requirement_context` from Step 3. For ADR updates, pass the target and `mode: composite` without requirement-convergence context. Review consistency, contradictions, and change history.

**Store output as**: `$STEP_5_OUTPUT`

**On review result**:
- `approved` -> proceed to Step 6
- `approved_with_conditions` or `needs_revision` -> Apply Review Resolution with the update agent, then review the updated document
- `rejected` -> Apply Orchestrator Escalation Resolution. Continue after self-resolution; ask the user only when that procedure reaches a user-decision condition

### Step 6: Consistency Verification and Approval

For PRD or ADR, skip design-sync and present the reviewed document for user approval.

For Design Doc, spawn design-sync agent: "Verify consistency of the updated Design Doc with other design documents. Updated document: [path from Step 1]"

**On consistency result**:
- No conflicts -> Present the reviewed and consistency-checked document for user approval
- Conflicts detected -> Apply Orchestrator Escalation Resolution using both governing documents. Return to the responsible author when one document can be corrected without changing an approved decision; ask the user only when a governing decision must change

## Error Handling

| Error | Action |
|-------|--------|
| Target document not found | Report and end (suggest $recipe-design instead) |
| Sub-agent update fails or returns an unusable result | Apply Orchestrator Escalation Resolution |
| Review Resolution requires a user-owned decision | Apply Orchestrator Escalation Resolution |
| design-sync detects conflicts | Apply Orchestrator Escalation Resolution against the governing sources |

## Completion Criteria

- [ ] Identified target document
- [ ] Resolved change content from the request and target document, asking only when material intent was missing
- [ ] Classified the update and converged scope-changing PRD/Design Doc requirements
- [ ] Updated document via appropriate agent (update mode)
- [ ] Ran code-verifier before document-reviewer for Design Doc updates
- [ ] Spawned document-reviewer and addressed feedback
- [ ] Spawned design-sync for consistency verification (Design Doc only)
- [ ] Obtained user approval for updated document

## Output Example
Document update completed.
- Updated document: docs/design/[document-name].md
- Approval status: User approved
