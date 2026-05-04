# Project External Resources Template

Use this structure for `docs/project-context/external-resources.md`.

```markdown
# External Resources

## Overview

This file records project-level access methods for resources outside the repository. Feature documents reference these labels and add feature-specific identifiers.

## Frontend

| Label | Axis | Status | Access Method | Owner / Notes |
|-------|------|--------|---------------|---------------|
| frontend-design-origin | Design Origin | present / existing-implementation / N/A | MCP / URL / file path / command | [owner or notes] |
| frontend-design-system | Design System | present / existing-package / N/A | MCP / URL / file path / command | [owner or notes] |
| frontend-guidelines | Guidelines | present / project-conventions / N/A | URL / file path | [owner or notes] |
| frontend-visual-verification | Visual Verification Environment | present / manual-confirmation / N/A | MCP / URL / command | [owner or notes] |
| frontend-generated-artifacts | Generated UI Artifacts | present / N/A | command / config path | [owner or notes] |

## Backend

| Label | Axis | Status | Access Method | Owner / Notes |
|-------|------|--------|---------------|---------------|
| backend-schema-source | Database Schema Source | present / repository-owned / N/A | URL / file path / command | [owner or notes] |
| backend-migration-history | Migration History | present / repository-owned / N/A | URL / file path / command | [owner or notes] |
| backend-secret-store | Secret Store | present / N/A | store path / docs path | [owner or notes] |
| backend-environment-config | Environment Configuration | present / repository-owned / N/A | URL / file path / command | [owner or notes] |
| backend-mock-environment | Mock or Fixture Environment | present / N/A | URL / command | [owner or notes] |

## API

| Label | Axis | Status | Access Method | Owner / Notes |
|-------|------|--------|---------------|---------------|
| api-schema-source | API Schema Source | present / repository-owned / N/A | URL / file path / MCP | [owner or notes] |
| api-explorer | API Explorer | present / N/A | URL / MCP | [owner or notes] |
| api-mock-server | Mock Server | present / N/A | URL / command | [owner or notes] |
| api-consumer-contract | Consumer Contract Source | present / N/A | URL / file path | [owner or notes] |

## Infrastructure

| Label | Axis | Status | Access Method | Owner / Notes |
|-------|------|--------|---------------|---------------|
| infra-iac-source | IaC Source | present / repository-owned / N/A | URL / file path | [owner or notes] |
| infra-environment-inventory | Environment Inventory | present / N/A | URL / file path / command | [owner or notes] |
| infra-deployment-pipeline | Deployment Pipeline | present / repository-owned / N/A | URL / file path | [owner or notes] |
| infra-observability-source | Observability Source | present / N/A | URL / MCP / command | [owner or notes] |
| infra-runtime-access | Runtime Access Method | present / N/A | command / docs path | [owner or notes] |

## Additional Resources

| Label | Description | Access Method | Owner / Notes |
|-------|-------------|---------------|---------------|
| [label] | [description] | [URL / MCP / file path / command] | [owner or notes] |

## Update History

| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial capture | [name] |
```

Feature-tier sections use this compact table:

```markdown
## External Resources Used

| Project Resource Label | Feature Identifier | Purpose |
|------------------------|--------------------|---------|
| frontend-design-origin | [screen / node / frame id] | [why this feature uses it] |
```
