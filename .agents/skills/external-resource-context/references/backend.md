# Backend External Resource Axes

Use these axes when backend or data work depends on resources outside the repository.

| Axis | Purpose | Presence Choices | Access Method Examples |
|------|---------|------------------|------------------------|
| Database Schema Source | Canonical schema, ERD, or generated model source | Present / Repository-owned / N/A | schema repo path, DB docs URL, MCP |
| Migration History | Deployment-applied migration sequence | Present / Repository-owned / N/A | migration repo, migration table query command |
| Secret Store | Runtime secret names and lookup location | Present / N/A | cloud secret manager path, vault path |
| Environment Configuration | Runtime config source and environment matrix | Present / Repository-owned / N/A | config repo, deployment docs, command |
| Mock or Fixture Environment | Local or shared backend verification setup | Present / N/A | docker compose path, seeded DB command, service URL |

## Question Template

Ask each axis in positive form:

1. "Which backend external resources are available for this work?"
2. "For each applicable resource, what access method or reference method should Codex use?"
3. "Which feature-specific identifier applies, such as table name, service name, secret name, or environment name?"

Record `N/A` for axes outside the project.
