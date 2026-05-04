# Infrastructure External Resource Axes

Use these axes when infrastructure, deployment, or runtime environment work depends on resources outside the repository.

| Axis | Purpose | Presence Choices | Access Method Examples |
|------|---------|------------------|------------------------|
| IaC Source | Terraform, Pulumi, CDK, or deployment source | Present / Repository-owned / N/A | repo path, module registry, docs URL |
| Environment Inventory | Accounts, regions, clusters, services | Present / N/A | cloud console URL, inventory file, command |
| Deployment Pipeline | CI/CD workflow and promotion process | Present / Repository-owned / N/A | pipeline URL, workflow file path |
| Observability Source | Logs, metrics, traces, dashboards | Present / N/A | dashboard URL, MCP, CLI command |
| Runtime Access Method | How to inspect deployed state | Present / N/A | kubectl context, cloud CLI profile, bastion docs |

## Question Template

Ask each axis in positive form:

1. "Which infrastructure external resources are available for this work?"
2. "For each applicable resource, what access method or reference method should Codex use?"
3. "Which feature-specific identifier applies, such as module name, service name, environment, account, or dashboard?"

Record `N/A` for axes outside the project.
