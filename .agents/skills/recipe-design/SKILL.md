---
name: recipe-design
description: "Execute from codebase-scoped analysis to design document creation."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `implementation-approach` — design convergence and verification strategy
3. [LOAD IF NOT ACTIVE] `subagents-orchestration-guide` — agent coordination and review resolution
4. [LOAD IF NOT ACTIVE] `llm-friendly-context` — document and review handoffs

**Spawn rule**: every `spawn_agent` call uses `fork_turns="none"` so the subagent receives only the task message and explicitly provided context.

**Context**: Dedicated to the design phase.

## Orchestrator Definition

**Core Identity**: Coordinate design, perform lightweight workflow operations directly, and invoke specialists for design judgment and review.

**Execution Plan**: Reuse the active execution plan. When the workflow has multiple dependent actions and no plan exists, create one that tracks them through final verification.

**Execution Protocol**:
1. **Spawn agents for analysis and document work** -- your role is to invoke sub-agents, pass data between them, and report results. The Step 1 scope bootstrap is an orchestrator-local pass limited to locating seed files.
2. **Run the design flow below in order**:
   - Execute: scope bootstrap -> codebase-analyzer -> [Stop: Scope confirmation] -> optional PRD update/review/[Stop: PRD approval] -> optional ADR/review/[Stop: ADR approval] -> Design Doc -> code-verifier -> document-reviewer -> design-sync -> [Stop: Design approval]
   - **[STOP — BLOCKING]** At every `[Stop: ...]` marker -> Present status to user for confirmation. **CANNOT proceed until user explicitly confirms.**
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: MUST execute document-reviewer and all stopping points. MUST execute design-sync for Design Docs. Each serves as a quality gate.
ENFORCEMENT: Skipping any quality gate invalidates the design output.

## Workflow Overview

```
Requirements -> scope bootstrap -> codebase-analyzer -> [Stop: Scope confirmation]
                                                            |
                                      optional PRD update/review -> [Stop: PRD approval]
                                                            |
                                             optional ADR/review -> [Stop: ADR approval]
                                                            |
                                      Design Doc -> code-verifier -> document-reviewer
                                                            |
                                                    design-sync -> [Stop: Design approval]
```

## Scope Boundaries

**Included in this skill**:
- Scope bootstrap: locating seed files so codebase-analyzer receives a populated input
- Codebase analysis with codebase-analyzer (entry point of the design phase)
- Scope confirmation with the user, grounded in codebase-analyzer findings
- ADR creation when documentation-criteria identifies a durable technical decision
- Design Doc creation with technical-designer
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with approval of the Design Doc and its preceding ADR when required. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

For ADRs, clearly present design alternatives and trade-offs. For Design Docs, record the Direct MVP, failed current constraints or Material Risks, necessary additions, and subtraction evidence. Record only larger alternatives actually considered; `None` is valid.

Execute the process below within design scope.

## Execution Process

### Step 1: Scope Bootstrap
Build a lightweight seed for codebase-analyzer. This is a file-location pass only, with no deep reading and no design decisions.

1. Extract candidate keywords from the user requirements: feature names, domain nouns, identifiers, route names, API names, or file-like terms.
2. Search each keyword separately with `rg -l --glob '!**/{node_modules,dist,build,coverage,.git}/**' --glob '!**/*.{lock,min.js,map}' '<keyword>'`. If `rg` is unavailable, use `grep -RIl` with the same exclusions where possible.
3. Bucket matches as `source`, `test`, `docs`, and `generated_or_vendor`. Exclude `generated_or_vendor` from the seed.
4. Rank matches in this order: path or filename match, exported symbol or route/API match, source content match, tests for selected source files, docs for selected source files.
5. Collect the final seed as `affectedFiles`, and keep a one-line `seedRationale` for each file.
6. If the search returns no source files, expand once to likely responsibility boundaries and representative siblings. An empty direct-match set is valid for a new surface; pass the relevant boundary evidence to codebase-analyzer. Ask the user only when the requested design target still cannot be identified from the request and repository.
7. For a broad match set, pass the highest-signal files and their containing responsibility boundaries. File count does not create a user stop.

Construct `requirement_analysis` with:
- `affectedFiles`: the Step 1 seed
- `affectedLayers`: layers inferred from paths, or `["unknown"]` when unclear
- `scale`: provisional Structural Scale from the apparent outcomes, responsibility boundaries, and durable design decisions; affected paths are supporting evidence
- `purpose`: the user requirements
- `confidence`: `confirmed` when target files are explicit or the ranked seed is focused; otherwise `provisional`
- `adrRequired`: apply the documentation-criteria durable-decision conditions; local changes that follow an accepted design remain in the Design Doc
- `adrReason`: the specific matched ADR condition, or `null`
- `prdRequired`: `true` when scale is `large` and no existing PRD covers the scope; otherwise `false`
- `scopeDependencies`: questions whose answers can change the target files, scale, or document type
- `questions`: user-facing questions needed before design
- `documentTypeRationale`: whether the Design Doc requires a preceding ADR and the governing ADR condition
- `seedRationale`: one-line reason for each file in `affectedFiles`
- `technicalConsiderations`: include any obvious user-stated constraints, risks, and dependencies; use empty lists only when none are stated

### Step 2: Codebase Analysis
Spawn codebase-analyzer agent: "Analyze the existing codebase to provide evidence for Design Doc creation. requirement_analysis: [Step 1 requirement_analysis]. requirements: $ARGUMENTS. target_paths: [Step 1 affectedFiles]."

### Step 3: Scope Confirmation
After codebase-analyzer returns, confirm the requirements and determine whether an ADR precedes the Design Doc:
1. Locate a related PRD and read its Converged Outcome, MVP scope, Future / Out of Scope, and open requirement fields. If the related PRD is ambiguous, ask the user to select or provide its path, or confirm none exists, before continuing.
2. When those fields match the current request and returned scope facts, use the PRD path as the current carrier and proceed directly to scope confirmation.
3. When no current carrier exists, load `requirement-convergence`, build and judge its record from the request and scope facts, estimate rough cost, and run the hearing on fields below `ready`. Mark an existing but incomplete or scope-mismatched PRD for update; otherwise mark the carrier as absent.

Present the design scope to the user:
- Target files/modules: `analysisScope.filesAnalyzed` and directly relevant modules
- Affected layers: inferred from `analysisScope.categoriesDetected`, `focusAreas`, and paths
- Recommended document path: Design Doc alone or ADR followed by Design Doc, with `documentTypeRationale`, `adrRequired`, and `adrReason`
- PRD status: whether `prdRequired` is true and whether the convergence carrier is current, requires update, or is absent
- Unknowns/assumptions: `limitations` and unresolved risks
- Questions before design: scope questions that change the design target or scale, including technical wording whose mandatory/candidate status is outcome-relevant and ambiguous

Ask the user to choose one:
- Proceed with the recommended document path
- Correct the scope and re-run codebase-analyzer
- Answer open questions, then proceed
- Provide an existing PRD path when `prdRequired` is true
- Explicitly approve proceeding without a PRD when `prdRequired` is true and no PRD will be provided

If `prdRequired` is true and the user neither provides a PRD path nor explicitly approves proceeding without a PRD, stop. This recipe does not create PRDs.

After confirmation, set the final scale from documentation-criteria Structural Scale and recompute `adrRequired`, `adrReason`, `prdRequired`, `confidence`, and `documentTypeRationale`. A current PRD carrier is passed by path. Carry the compact `convergence` object only when a Design Doc has no current PRD carrier.

**[STOP — BLOCKING]** Wait for user confirmation before proceeding.

### Step 4: Upstream Approval and Design Document Creation
When Step 3 marked an existing PRD for update, spawn prd-creator in update mode with that PRD path and the confirmed `convergence` object. Review the updated PRD with document-reviewer using its path as `target`, then resolve findings through Review Resolution. After the review permits approval, present the updated PRD for user approval. Continue with its path as the carrier after approval.

**[STOP — BLOCKING when a PRD was updated]** Wait for user approval of the updated PRD.

Create documents according to `documentTypeRationale`:
- Design Doc only: Spawn technical-designer agent: "document_to_create: DesignDoc. Create Design Doc based on the requirements. requirements_verbatim: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3, including the current PRD carrier path or convergence when no carrier exists, confirmed scope, user answers, confirmed scale, adrRequired, adrReason, prdRequired, explicit no-PRD approval when applicable, documentTypeRationale, scopeDependencies, questions, and seedRationale]. Codebase analysis: [output from Step 2]. Follow `document_to_create` for this invocation; `documentTypeRationale` describes the overall confirmed path. Include component design, acceptance criteria, Direct MVP, failed current constraints or Material Risks, necessary additions, and subtraction evidence."
- Both ADR and Design Doc: first spawn technical-designer with `document_to_create: ADR`. Review the created ADR with document-reviewer using `doc_type: ADR`, `target: [ADR path]`, and the Step 2 codebase analysis, then resolve findings through Review Resolution. After the review permits approval, present the ADR for user approval and record its status as `Accepted`. Only then spawn technical-designer with `document_to_create: DesignDoc`, `adr_path: [accepted ADR path]`, the original user requirements as `requirements_verbatim`, the same `confirmed_requirement_context`, and the same codebase analysis output. The Design Doc must reference the accepted ADR decision.

**[STOP — BLOCKING when an ADR was created]** Wait for user approval of the ADR before creating the Design Doc.

### Step 5: Code Verification
Spawn code-verifier agent: "Verify the Design Doc against the current codebase. document_path: [Design Doc path from Step 4]. doc_type: design-doc."

### Step 6: Document Review
Spawn document-reviewer agent: "Review the Design Doc for consistency, completeness, and adopted design validity. doc_type: DesignDoc. review_context: creation. target: [Design Doc path]. requirements_verbatim: [original user requirements]. confirmed_requirement_context: [complete confirmed requirement context from Step 3]. codebase_analysis: [output from Step 2]. code_verification: [output from Step 5]."

Route the result before consistency verification:
- `approved`: continue
- `approved_with_conditions` or `needs_revision`: apply Review Resolution with the creating technical-designer, then review the updated document
- `rejected`: apply Orchestrator Escalation Resolution. Continue after an evidence-based self-resolution; ask the user only when that procedure reaches a user-decision condition

### Step 7: Consistency Verification
Spawn design-sync agent: "Verify consistency of the design document with other existing design documents and project constraints."

**Note**: design-sync returns `sync_status: "SKIPPED"` when only 1 Design Doc exists. This is distinct from `NO_CONFLICTS` and MUST be reported as such to the user.

## Completion Criteria

- [ ] Built the Step 1 scope bootstrap seed or obtained target files/modules from the user
- [ ] Spawned codebase-analyzer with populated requirement context and passed its findings into design creation
- [ ] Converged the requirement and persisted the record
- [ ] Confirmed the design scope with the user before document creation
- [ ] Created all documents required by `documentTypeRationale` via technical-designer
- [ ] Spawned code-verifier and passed its findings into document review for Design Docs
- [ ] Spawned document-reviewer and addressed feedback
- [ ] Spawned design-sync for consistency verification for Design Docs
- [ ] Obtained user approval for design document
- [ ] All `[Stop: ...]` markers honored with user confirmation

## Output Example
Design phase completed.
- ADR: docs/adr/[document-name].md or N/A
- Design document: docs/design/[document-name].md or N/A
- Approval status: User approved
