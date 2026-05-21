---
name: recipe-design
description: "Execute from codebase-scoped analysis to design document creation."
---

## Required Skills [LOAD BEFORE EXECUTION]

1. [LOAD IF NOT ACTIVE] `documentation-criteria` — document creation rules and templates
2. [LOAD IF NOT ACTIVE] `implementation-approach` — implementation strategy

**Spawn rule**: every `spawn_agent` call MUST pass `fork_turns="none"` or `fork_context=false` for context isolation.

**Context**: Dedicated to the design phase.

## Orchestrator Definition

**Core Identity**: "I am not a worker. I am an orchestrator."

**Execution Protocol**:
1. **Spawn agents for analysis and document work** -- your role is to invoke sub-agents, pass data between them, and report results. The Step 1 scope bootstrap is an orchestrator-local pass limited to locating seed files.
2. **Run the design flow below in order**:
   - Execute: scope bootstrap -> codebase-analyzer -> [Stop: Scope confirmation] -> technical-designer -> code-verifier -> document-reviewer -> design-sync -> [Stop: Design approval]
   - `code-verifier` and `design-sync` apply to Design Docs; skip them for ADR-only output.
   - **[STOP — BLOCKING]** At every `[Stop: ...]` marker -> Present status to user for confirmation. **CANNOT proceed until user explicitly confirms.**
3. **Scope**: Complete when design documents receive approval

**CRITICAL**: MUST execute document-reviewer and all stopping points. MUST execute design-sync for Design Docs. Each serves as a quality gate.
ENFORCEMENT: Skipping any quality gate invalidates the design output.

## Workflow Overview

```
Requirements -> scope bootstrap -> codebase-analyzer -> [Stop: Scope confirmation]
                                                            |
                                                    technical-designer
                                                            |
                                                    code-verifier -> document-reviewer
                                                            |
                                                    design-sync -> [Stop: Design approval]
```

`code-verifier` and `design-sync` are Design Doc steps. ADR-only output skips them.

## Scope Boundaries

**Included in this skill**:
- Scope bootstrap: locating seed files so codebase-analyzer receives a populated input
- Codebase analysis with codebase-analyzer (entry point of the design phase)
- Scope confirmation with the user, grounded in codebase-analyzer findings
- ADR creation (if architecture changes, new technology, or data flow changes)
- Design Doc creation with technical-designer
- Document review with document-reviewer
- Design Doc consistency verification with design-sync

**Responsibility Boundary**: This skill completes with design document (ADR/Design Doc) approval. Work planning and beyond are outside scope.

Requirements: $ARGUMENTS

MUST clearly present design alternatives and trade-offs.

Execute the process below within design scope.

## Execution Process

### Step 1: Scope Bootstrap
Build a lightweight seed for codebase-analyzer. This is a file-location pass only, with no deep reading and no design decisions.

1. Extract candidate keywords from the user requirements: feature names, domain nouns, identifiers, route names, API names, or file-like terms.
2. Search each keyword separately with `rg -l --glob '!**/{node_modules,dist,build,coverage,.git}/**' --glob '!**/*.{lock,min.js,map}' '<keyword>'`. If `rg` is unavailable, use `grep -RIl` with the same exclusions where possible.
3. Bucket matches as `source`, `test`, `docs`, and `generated_or_vendor`. Exclude `generated_or_vendor` from the seed.
4. Rank matches in this order: path or filename match, exported symbol or route/API match, source content match, tests for selected source files, docs for selected source files.
5. Collect the final seed as `affectedFiles`, and keep a one-line `seedRationale` for each file.
6. If the search returns no source files, ask the user which files or modules the design targets. Use the user's answer as `affectedFiles`. If the user confirms no related code exists, confirm whether to proceed with a new-surface design before invoking codebase-analyzer.
7. If the ranked seed has more than 20 files, present the top-ranked candidates and ask the user to narrow the seed before invoking codebase-analyzer.

Construct `requirement_analysis` with:
- `affectedFiles`: the Step 1 seed
- `affectedLayers`: layers inferred from paths, or `["unknown"]` when unclear
- `scale`: provisional scale from file count (`small` 1-2, `medium` 3-5, `large` 6+)
- `purpose`: the user requirements
- `confidence`: `confirmed` when target files are explicit or the ranked seed is focused; otherwise `provisional`
- `adrRequired`: `true` when the request changes architecture, introduces technology or dependencies, changes data flow/storage/contract ownership, or changes shared cross-boundary contracts; otherwise `false`
- `adrReason`: the specific matched ADR condition, or `null`
- `prdRequired`: `true` when scale is `large` and no existing PRD covers the scope; otherwise `false`
- `scopeDependencies`: questions whose answers can change the target files, scale, or document type
- `questions`: user-facing questions needed before design
- `documentTypeRationale`: why ADR, Design Doc, or both are needed from the provisional seed
- `seedRationale`: one-line reason for each file in `affectedFiles`
- `technicalConsiderations`: include any obvious user-stated constraints, risks, and dependencies; use empty lists only when none are stated

### Step 2: Codebase Analysis
Spawn codebase-analyzer agent: "Analyze the existing codebase to provide evidence for Design Doc creation. requirement_analysis: [Step 1 requirement_analysis]. requirements: $ARGUMENTS. target_paths: [Step 1 affectedFiles]."

### Step 3: Scope Confirmation
After codebase-analyzer returns, present the design scope to the user before design work:
- Target files/modules: `analysisScope.filesAnalyzed` and directly relevant modules
- Affected layers: inferred from `analysisScope.categoriesDetected`, `focusAreas`, and paths
- Recommended document path: ADR, Design Doc, or both, with `documentTypeRationale`, `adrRequired`, and `adrReason`
- PRD status: whether `prdRequired` is true, whether an existing PRD path is available, and what decision is needed before design
- Unknowns/assumptions: `limitations` and unresolved risks
- Questions before design: scope questions that change the design target or scale

Ask the user to choose one:
- Proceed with the recommended document path
- Correct the scope and re-run codebase-analyzer
- Answer open questions, then proceed
- Provide an existing PRD path when `prdRequired` is true
- Explicitly approve proceeding without a PRD when `prdRequired` is true and no PRD will be provided

If `prdRequired` is true and the user neither provides a PRD path nor explicitly approves proceeding without a PRD, stop. This recipe does not create PRDs.

After confirmation, set the final scale from the confirmed target file count (`small` 1-2, `medium` 3-5, `large` 6+), recompute `adrRequired`, `adrReason`, `prdRequired`, `confidence`, and `documentTypeRationale`, then carry the complete confirmed requirement context into design creation.

**[STOP — BLOCKING]** Wait for user confirmation before proceeding.

### Step 4: Design Document Creation
Create documents according to `documentTypeRationale`:
- ADR only: Spawn technical-designer agent: "document_to_create: ADR. Create ADR based on the requirements, confirmed_requirement_context: [complete confirmed requirement context from Step 3, including confirmed scope, confirmed scale, adrRequired, adrReason, prdRequired, PRD path or explicit no-PRD approval when applicable, documentTypeRationale, scopeDependencies, questions, and seedRationale], and codebase analysis output. Follow `document_to_create` for this invocation; `documentTypeRationale` describes the overall confirmed path. Include architecture decisions and clear alternatives with trade-offs."
- Design Doc only: Spawn technical-designer agent: "document_to_create: DesignDoc. Create Design Doc based on the requirements, confirmed_requirement_context: [complete confirmed requirement context from Step 3, including confirmed scope, confirmed scale, adrRequired, adrReason, prdRequired, PRD path or explicit no-PRD approval when applicable, documentTypeRationale, scopeDependencies, questions, and seedRationale], and codebase analysis output. Follow `document_to_create` for this invocation; `documentTypeRationale` describes the overall confirmed path. Include component design, acceptance criteria, and clear alternatives with trade-offs."
- Both ADR and Design Doc: first spawn technical-designer with `document_to_create: ADR`. After the ADR path is available, spawn technical-designer again with `document_to_create: DesignDoc`, `adr_path: [ADR path]`, the same `confirmed_requirement_context`, and the same codebase analysis output. The Design Doc must reference the ADR decision.

### Step 5: Code Verification
For Design Docs only, spawn code-verifier agent: "Verify the Design Doc against the current codebase. document_path: [Design Doc path from Step 4]. doc_type: design-doc."

Skip this step for ADR-only output.

### Step 6: Document Review
Review each created document:
- ADR: Spawn document-reviewer agent: "Review the ADR for consistency and completeness. doc_type: ADR. target: [ADR path]. codebase_analysis: [output from Step 2]."
- Design Doc: Spawn document-reviewer agent: "Review the Design Doc for consistency and completeness. doc_type: DesignDoc. target: [Design Doc path]. codebase_analysis: [output from Step 2]. code_verification: [output from Step 5]."

### Step 7: Consistency Verification
For Design Docs only, spawn design-sync agent: "Verify consistency of the design document with other existing design documents and project constraints."

Skip this step for ADR-only output.

**Note**: design-sync returns `sync_status: "SKIPPED"` when only 1 Design Doc exists. This is distinct from `NO_CONFLICTS` and MUST be reported as such to the user.

## Completion Criteria

- [ ] Built the Step 1 scope bootstrap seed or obtained target files/modules from the user
- [ ] Spawned codebase-analyzer with populated requirement context and passed its findings into design creation
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
