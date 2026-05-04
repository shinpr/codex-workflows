# API External Resource Axes

Use these axes when work depends on API contracts outside the repository.

| Axis | Purpose | Presence Choices | Access Method Examples |
|------|---------|------------------|------------------------|
| API Schema Source | OpenAPI, GraphQL SDL, proto, or typed contract source | Present / Repository-owned / N/A | schema repo path, docs URL, MCP |
| API Explorer | Interactive or generated contract inspection | Present / N/A | Swagger UI URL, GraphQL explorer URL |
| Mock Server | Contract-backed mock or sandbox endpoint | Present / N/A | mock URL, command, docker compose service |
| Consumer Contract Source | Downstream expectations or contract tests | Present / N/A | contract repo, pact broker URL, file path |

## Question Template

Ask each axis in positive form:

1. "Which API contract resources are available for this work?"
2. "For each applicable resource, what access method or reference method should Codex use?"
3. "Which feature-specific identifier applies, such as endpoint path, operation id, schema name, or event name?"

Record `N/A` for axes outside the project.
