# Frontend External Resource Axes

Use these axes when frontend UI work depends on resources outside the repository.

| Axis | Purpose | Presence Choices | Access Method Examples |
|------|---------|------------------|------------------------|
| Design Origin | Canonical visual or interaction source | Present / Existing implementation / N/A | Figma MCP, public URL, exported file path |
| Design System | Component catalog, tokens, variants, usage rules | Present / Existing package only / N/A | Storybook URL, package docs, MCP, local docs |
| Guidelines | Accessibility, responsive, copy, brand, i18n, or platform rules | Present / Project conventions only / N/A | URL, file path, wiki export |
| Visual Verification Environment | Rendered UI inspection path | Present / Manual confirmation / N/A | browser MCP, Playwright command, Storybook URL, dev server URL |
| Generated UI Artifacts | Generated CSS typings, route typings, message catalogs, snapshots | Present / N/A | generator command, config path |

## Question Template

Ask each axis in positive form:

1. "Which frontend external resources are available for this work?"
2. "For each applicable resource, what access method or reference method should Codex use?"
3. "Which feature-specific identifier applies, such as screen name, node id, route, story id, or component name?"

Record `N/A` for axes outside the project.
