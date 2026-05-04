---
name: external-resource-context
description: "Discovers, confirms, and records external resource access methods for project design and implementation work, including design sources, design systems, API schemas, database schemas, IaC sources, secret stores, environment config, and verification environments. Use when external resource context needs to be discovered or refreshed, recorded in docs/project-context/external-resources.md, or referenced from a Design Doc/UI Spec."
---

# External Resource Context

## Purpose

This skill helps Codex discover required external resources, record stable access methods, and reuse recorded context during design, planning, implementation, and review work.

Covered resources include design origin, design system, guidelines, visual verification environment, database schema source, migration history, secret store location, API schema source, mock environment, IaC source, and environment configuration.

## Scope Boundaries

**In scope**: hearing protocol for unclear external resources, storage location, single-source ownership rule, and lookup protocol for known resources.

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
| `docs/project-context/external-resources.md` is absent | Run full hearing for the relevant domain |
| File exists | Ask for one choice: keep current axes, refresh all axes, or refresh selected axes |

When the user chooses `refresh selected axes`, ask for the exact domain and axis labels before updating. Confirm the selected labels against the loaded domain reference, then hear only those axes.

### Domain Routing

Load the domain reference matching the current task:

| Task type | References to load |
|-----------|--------------------|
| Frontend UI work | [references/frontend.md](references/frontend.md) |
| Backend or data work | [references/backend.md](references/backend.md) |
| API contract work | [references/api.md](references/api.md) |
| Infrastructure or deployment | [references/infra.md](references/infra.md) |
| Fullstack | Load each relevant domain reference |

Each domain reference defines axes and question templates. Use `N/A` for axes outside the current project.

### Two-Phase Hearing

1. **Structured hearing**: ask each axis from the domain reference. For each non-N/A axis, collect the access or reference method: MCP server name, URL, file path, command, repository-owned source, project convention, manual confirmation path, or existing implementation.
2. **Self-declaration**: ask for additional external resources outside the structured axes. Append any resources the user provides under `Additional Resources`.

## Storage Protocol

After hearing completes:

1. Build project-tier content from the answers using [references/template.md](references/template.md).
2. Write `docs/project-context/external-resources.md`, creating `docs/project-context/` as needed.
3. When a target UI Spec or Design Doc exists, update its `External Resources Used` section with project-tier labels plus feature-specific identifiers.
4. If a write fails, return the error with the intended path and leave completion status unresolved.
5. Report touched file paths to the calling workflow.

## Lookup Protocol

Consumers resolve external context in this order:

1. Read `docs/project-context/external-resources.md`.
2. Read the target UI Spec or Design Doc `External Resources Used` section for feature-specific identifiers.
3. Use the project-tier access method to fetch or inspect the resource.

Codex custom agents inherit parent `mcp_servers` when the agent file omits `mcp_servers`. Preserve that inheritance for agents that may need project-specific MCP tools. Reserve MCP `enabled_tools` for a deliberately narrow server-level allow list.

## Output Format

The project-tier file follows [references/template.md](references/template.md). Feature-tier sections use the fixed heading `External Resources Used`; heading level follows the parent document structure.

## Quality Checklist

- [ ] Each relevant axis has a presence indicator and access method, or is marked `N/A`
- [ ] Self-declaration phase completed
- [ ] Project-tier file contains environment facts
- [ ] Feature-tier sections contain feature identifiers and project-tier labels
- [ ] Existing project-tier updates are confirmed before writes

## References

- [references/frontend.md](references/frontend.md)
- [references/backend.md](references/backend.md)
- [references/api.md](references/api.md)
- [references/infra.md](references/infra.md)
- [references/template.md](references/template.md)
