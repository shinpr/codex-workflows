---
name: external-resource-context
description: "Resolves and records one external evidence source required by a current design or verification decision. Use when repository and supplied evidence cannot determine that decision."
---

# External Resource Context

## Purpose

This skill resolves a concrete external evidence dependency for a current design or verification decision, records its stable access method, and lets later consumers reuse that evidence.

Potential resources include design origin, design system, API or database schema sources, IaC, and verification environments. A workflow selects only the resource axis needed by its current decision.

## Scope Boundaries

**In scope**: resolving a named external evidence need, storage location, single-source ownership, and lookup of a known resource.

**Freshness handling**: record access methods and feature identifiers here. The consuming workflow checks current resource content at use time.

## Storage Locations

| Tier | Location | Holds | Update Frequency |
|------|----------|-------|------------------|
| Project | `docs/project-context/external-resources.md` | Environment-stable facts: resource labels, presence, and access methods | When the project environment changes |
| Feature | `## External Resources Used` section in the relevant UI Spec or Design Doc | Feature-specific identifiers that reference project-tier labels | Per feature |

### Single Source Rule

The project tier owns environment facts such as URLs, MCP server names, file paths, commands, and secret-store locations. Feature-tier sections list feature-specific identifiers such as design node ids, API paths, schema names, or IaC module names, then reference the project-tier label.

## Hearing Protocol

### When to Hear

| Condition | Action |
|-----------|--------|
| Repository or supplied evidence resolves the current decision | Continue without hearing |
| A recorded matching axis has a usable access method | Reuse it without hearing |
| A named axis required by the current decision is missing or stale | Ask only for that axis and the access method needed to inspect it |

State which decision or verification result the requested resource controls. Leave unrelated axes unrecorded. Use N/A only for a selected or inspected axis confirmed to be outside the project.

### Domain Routing

Load the domain reference matching the current task:

| Task type | References to load |
|-----------|--------------------|
| Frontend UI work | [references/frontend.md](references/frontend.md) |
| Backend or data work | [references/backend.md](references/backend.md) |
| API contract work | [references/api.md](references/api.md) |
| Infrastructure or deployment | [references/infra.md](references/infra.md) |
| Fullstack | Load each relevant domain reference |

Each domain reference defines candidate axes and question templates. Record only the axes selected for the current decision; use `N/A` when an inspected axis is outside the current project.

### Focused Hearing

Ask for the selected axis, its stable access method, and the feature identifier when known. Accept MCP server name, URL, file path, command, repository-owned source, or existing implementation. One answer completes the hearing when it makes the named decision inspectable.

When the resource remains unavailable, return the exact decision it leaves unsupported. The consuming workflow first selects a repository-evidenced alternative, contract substitute, or explicit fallback that preserves the approved outcome. Continue without external-owner approval; request user input when no available option can resolve a product requirement or approved major design decision.

## Storage Protocol

After hearing completes:

1. Merge the selected axis into the project-tier content using [references/template.md](references/template.md); preserve unrelated existing entries.
2. Write `docs/project-context/external-resources.md`, creating `docs/project-context/` as needed.
3. When a target UI Spec or Design Doc exists, update its `External Resources Used` section with project-tier labels plus feature-specific identifiers.
4. If a write fails, return the error with the intended path and leave completion status unresolved.
5. Report touched file paths to the calling workflow.

## Lookup Protocol

Consumers resolve external context in this order:

1. Read the matching label from `docs/project-context/external-resources.md`.
2. Read the matching feature identifier from the target UI Spec or Design Doc when present.
3. Fetch or inspect only the resource needed by the current decision.

Codex custom agents inherit parent `mcp_servers` when the agent file omits `mcp_servers`. Preserve that inheritance for agents that may need project-specific MCP tools. Reserve MCP `enabled_tools` for a deliberately narrow server-level allow list.

## Output Format

The project-tier file follows [references/template.md](references/template.md). Feature-tier sections use the fixed heading `External Resources Used`; heading level follows the parent document structure.

## Quality Checklist

- [ ] Every requested axis names the decision or verification result it controls
- [ ] Each requested axis has a usable access method or records the exact unsupported decision for its consuming workflow
- [ ] Project-tier file contains environment facts
- [ ] Feature-tier sections contain feature identifiers and project-tier labels
- [ ] Unrelated project-tier entries are preserved

## References

- [references/frontend.md](references/frontend.md)
- [references/backend.md](references/backend.md)
- [references/api.md](references/api.md)
- [references/infra.md](references/infra.md)
- [references/template.md](references/template.md)
