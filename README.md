# codex-workflows

[![Codex CLI](https://img.shields.io/badge/Codex%20CLI-Compatible-10a37f)](https://developers.openai.com/codex/cli)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-Spec%20Compliant-blue)](https://developers.openai.com/codex/skills/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Structured workflows for [OpenAI Codex CLI](https://developers.openai.com/codex/cli).**

They help when multi-step changes stop being easy to reason about, test, or review.

Built on the [Agent Skills specification](https://developers.openai.com/codex/skills/) and [Codex subagents](https://developers.openai.com/codex/subagents). This starts to matter when tasks get large: refactors, migrations, or anything that spans multiple files and needs to stay reviewable.

---

## Quick Start

```bash
cd your-project
npx codex-workflows install
```

Then in Codex CLI:

```
$recipe-implement Add user authentication with JWT
```

`$` is Codex CLI's syntax for invoking a skill explicitly. Type `$recipe-` to see all available recipes via tab completion.

Small changes stay lightweight. Larger tasks are broken into requirements, design, task decomposition, TDD implementation, and quality checks.

---

## Why codex-workflows?

Codex works well for short, focused tasks. The problems start when a change spans multiple files, needs design decisions to stay visible, or has to survive review, testing, and follow-up edits.

Many developers have seen the same pattern: things work at first, then drift. Context grows, assumptions accumulate, intermediate decisions disappear, and results become harder to trust.

codex-workflows is built around those failure modes. Instead of asking Codex to "just implement it", it turns a request into a sequence of steps you can inspect and verify:
- Traceable artifacts: PRD → Design Doc → Task → Commit
- Built-in TDD and quality checks before code is ready to commit
- Agent context separation for large refactors, migrations, and PR-sized changes
- Diagnosis and reverse-engineering flows for bugs and legacy code

## Background

The recipes, subagents, and quality checks in this repo were not designed top-down. Each piece was added in response to a concrete failure mode encountered during delivery work.

That is why the workflow separates requirements, design, verification, implementation, and quality checks instead of treating them as one long session.

## Not Designed For

- One-shot scripts or exploratory sessions where speed matters more than traceability
- Repositories without tests, lint, builds, or reviewable commits
- Teams that would rather skip design docs and quality checks entirely

---

## What It Does

Instead of forcing a fixed workflow, the framework adjusts how much structure it adds based on scope:

| Scale | File Count | What Happens |
|-------|------------|-------------|
| Small | 1-2 | Simplified plan → direct implementation |
| Medium | 3-5 | Design Doc → work plan → task execution |
| Large | 6+ | PRD → ADR → Design Doc → test skeletons → work plan → guided autonomous execution |

For larger work, the path usually looks like this: understand the problem, analyze the codebase, design the change, break it into atomic tasks, implement with tests, and run quality checks before commit.

Each step isolates one concern, so decisions can be checked before they carry into later stages. Specialized subagents run in their own contexts to reduce carry-over assumptions during changes that would otherwise require long sessions:

```
User Request
    ↓
requirement-analyzer  →  Scale determination (Small / Medium / Large)
    ↓
prd-creator           →  Product requirements (Large scale)
    ↓
codebase-analyzer     →  Existing codebase facts + focus areas
    ↓
technical-designer    →  ADR + Design Doc with acceptance criteria
    ↓
code-verifier         →  Design Doc vs existing code verification
    ↓
document-reviewer     →  Quality gate with verification evidence
    ↓
acceptance-test-gen   →  Test skeletons from ACs
    ↓
work-planner          →  Phased execution plan
    ↓
task-decomposer       →  Atomic tasks (1 task = 1 commit)
    ↓
task-executor         →  TDD implementation per task
    ↓
quality-fixer         →  Lint, test, build; no failing checks
    ↓
Ready to commit
```

### The Diagnosis Pipeline

```
Problem → investigator (path map + failure points) → verifier (path coverage + independent failure-point evaluation) → solver → Actionable solutions
```

### Reverse Engineering

```
Existing code → scope-discoverer (discoveredUnits + prdUnits) → prd-creator → code-verifier → document-reviewer → Design Docs
```

This works best when repository knowledge is explicit and local. Short `AGENTS.md` files can act as entry points, while design docs, plans, and task files hold the deeper instructions that agents need to execute reliably.

---

## Installation

### Requirements

- [Codex CLI](https://developers.openai.com/codex/cli) (latest)
- Node.js >= 22

### Install

```bash
cd your-project
npx codex-workflows install
```

This copies into your project:
- `.agents/skills/` — Codex skills (foundational + recipes)
- `.codex/agents/` — Subagent TOML definitions
- Manifest file for tracking managed files

### Update

```bash
# Preview what will change
npx codex-workflows update --dry-run

# Apply updates
npx codex-workflows update
```

Files you've modified locally are preserved — the updater compares each file against its hash at install time and skips any file you've changed. New files from the update are added automatically.

```bash
# Check installed version
npx codex-workflows status
```

---

## Recipe Workflows

Invoke recipes with `$recipe-name` in Codex. Type `$recipe-` and use tab completion to see all available recipes.

### Backend & General

| Recipe | What it does | When to use |
|--------|-------------|-------------|
| `$recipe-implement` | Full lifecycle with layer routing (backend/frontend/fullstack) | New features — universal entry point |
| `$recipe-task` | Single task with rule selection | Bug fixes, small changes |
| `$recipe-design` | Requirements → ADR/Design Doc | Architecture planning |
| `$recipe-plan` | Design Doc → test skeletons → work plan | Planning phase, including nullable E2E skeleton handling |
| `$recipe-prepare-implementation` | Verify work plan readiness and resolve prep gaps | Pre-build check that the plan is implementable |
| `$recipe-build` | Execute backend tasks with validation between steps | Resume backend implementation |
| `$recipe-review` | Design Doc compliance and security validation with auto-fixes | Post-implementation check |
| `$recipe-diagnose` | Problem investigation → failure-point verification → solution | Bug investigation |
| `$recipe-reverse-engineer` | Generate PRD + Design Docs from existing code | Legacy system documentation |
| `$recipe-add-integration-tests` | Add integration/E2E tests from Design Doc | Test coverage for existing code |
| `$recipe-update-doc` | Update existing Design Doc / PRD / ADR with review | Spec changes, document maintenance |

### Frontend (React/TypeScript)

| Recipe | What it does | When to use |
|--------|-------------|-------------|
| `$recipe-front-design` | Requirements → UI Spec → frontend Design Doc | Frontend architecture planning |
| `$recipe-front-adjust` | Implemented UI adjustment with external context and verification | Focused UI changes after implementation |
| `$recipe-front-plan` | Frontend Design Doc → test skeletons → work plan | Frontend planning phase |
| `$recipe-front-build` | Execute frontend tasks with RTL + quality checks | Resume frontend implementation |
| `$recipe-front-review` | Frontend compliance and security validation with React-specific fixes | Frontend post-implementation check |

### Fullstack (Cross-Layer)

| Recipe | What it does | When to use |
|--------|-------------|-------------|
| `$recipe-fullstack-implement` | Full lifecycle with separate Design Docs per layer | Cross-layer features |
| `$recipe-fullstack-build` | Execute tasks with layer-aware agent routing | Resume cross-layer implementation |

### Working State

Recipes use `docs/plans/` as ephemeral working state for work plans, decomposed task files, prep tasks, review-fix tasks, and intermediate analysis files. Add it to your project's `.gitignore` unless your team intentionally wants to review those transient files:

```gitignore
docs/plans/
```

PRDs, ADRs, UI Specs, and Design Docs are durable project documents and are intended to be committed.

### Examples

**Full feature development:**
```
$recipe-implement Add user authentication with JWT and role-based access control
```

**Quick fix with proper rule selection:**
```
$recipe-task Fix validation error message in checkout form
```

**Investigate a bug:**
```
$recipe-diagnose API returns 500 error on user login after deployment
```

**Document undocumented legacy code:**
```
$recipe-reverse-engineer src/auth module
```

---

## Foundational Skills

These are applied automatically based on context. You rarely need to think about them directly.

| Skill | What it provides |
|-------|-----------------|
| `coding-rules` | Code quality, function design, error handling, refactoring |
| `testing` | TDD Red-Green-Refactor, test types, AAA pattern, mocking |
| `ai-development-guide` | Anti-patterns, debugging (5 Whys), quality check workflow |
| `documentation-criteria` | Document creation rules and templates (PRD, ADR, Design Doc, Work Plan) |
| `implementation-approach` | Strategy selection: vertical / horizontal / hybrid slicing |
| `integration-e2e-testing` | Integration/E2E test design, value-based selection, review criteria |
| `external-resource-context` | Access methods for design sources, design systems, API schemas, and verification environments |
| `llm-friendly-context` | Clear prompts, handoffs, generated artifacts, task files, and review findings for downstream agents |
| `task-analyzer` | Task analysis, scale estimation, skill selection |
| `subagents-orchestration-guide` | Multi-agent coordination, workflow flows, guided autonomous execution |

Language-specific references are included for TypeScript/React projects (`coding-rules/references/typescript.md`, `testing/references/typescript.md`).

---

## Subagents

Codex spawns these as needed during recipe execution. You do not need to learn them first; recipes route work to the right agents automatically. Each agent runs in its own context with specialized instructions and skill configurations.

### Document Creation Agents

| Agent | Role |
|-------|------|
| `requirement-analyzer` | Requirements analysis and work scale determination |
| `prd-creator` | PRD creation and structuring |
| `technical-designer` | ADR and Design Doc creation (backend) |
| `technical-designer-frontend` | Frontend ADR and Design Doc creation (React) |
| `ui-spec-designer` | UI Specification from PRD and optional prototype code |
| `codebase-analyzer` | Existing codebase analysis before Design Doc creation |
| `ui-analyzer` | UI facts from external resources (design tools, design-system docs, deployed UI) and frontend code |
| `work-planner` | Work plan creation from Design Docs |
| `document-reviewer` | Document consistency and approval |
| `design-sync` | Cross-document consistency verification |

### Implementation Agents

| Agent | Role |
|-------|------|
| `task-decomposer` | Work plan → atomic task files |
| `task-executor` | TDD implementation following task files (backend) |
| `task-executor-frontend` | React implementation with Testing Library |
| `quality-fixer` | Quality checks and fixes until all pass (backend) |
| `quality-fixer-frontend` | React-specific quality checks (TypeScript, RTL, bundle) |
| `acceptance-test-generator` | Test skeleton generation from acceptance criteria |
| `integration-test-reviewer` | Test quality review |

### Analysis Agents

| Agent | Role |
|-------|------|
| `code-reviewer` | Design Doc compliance validation |
| `code-verifier` | Document-code consistency verification |
| `security-reviewer` | Security compliance review after implementation |
| `rule-advisor` | Skill selection via metacognitive analysis |
| `scope-discoverer` | Codebase scope discovery for reverse docs, including PRD unit grouping |

### Diagnosis Agents

| Agent | Role |
|-------|------|
| `investigator` | Evidence collection, path mapping, and failure-point discovery |
| `verifier` | Path coverage validation and independent failure-point evaluation |
| `solver` | Solution derivation with tradeoff analysis |

---

## How It Works

### Guided Autonomous Execution Mode

After work plan approval, the framework executes task files with explicit validation points:

1. **task-executor** implements each task with TDD
2. **quality-fixer** first rejects incomplete task-scoped implementations, then runs lint, tests, and build before every commit
3. Escalation pauses execution when design deviation or ambiguity is detected
4. Each task produces one commit for rollback-friendly granularity

### Context Separation

Each subagent runs in a fresh context. This pattern keeps multi-step coding tasks legible and reviewable:
- generation and verification happen in separate contexts, reducing author bias and carry-over assumptions
- **document-reviewer** reviews without the author's bias
- **investigator** collects evidence without confirmation bias
- **code-reviewer** validates compliance without implementation context

---

## Project Structure

After installation, your project gets:

```
your-project/
├── .agents/skills/           # Codex skills
│   ├── coding-rules/         # Foundational (auto-loaded)
│   ├── testing/
│   ├── ai-development-guide/
│   ├── documentation-criteria/
│   ├── implementation-approach/
│   ├── integration-e2e-testing/
│   ├── external-resource-context/
│   ├── task-analyzer/
│   ├── subagents-orchestration-guide/
│   ├── recipe-implement/     # Recipes ($recipe-*)
│   ├── recipe-design/
│   ├── recipe-build/
│   ├── recipe-front-adjust/
│   ├── recipe-plan/
│   ├── recipe-prepare-implementation/
│   ├── recipe-review/
│   ├── recipe-diagnose/
│   ├── recipe-task/
│   ├── recipe-update-doc/
│   ├── recipe-reverse-engineer/
│   └── recipe-add-integration-tests/
├── .codex/agents/            # Subagent TOML definitions
│   ├── requirement-analyzer.toml
│   ├── technical-designer.toml
│   ├── ui-analyzer.toml
│   ├── task-executor.toml
│   └── ... (25 agents total)
└── docs/                     # Created as you use the recipes
    ├── prd/
    ├── design/
    ├── adr/
    ├── ui-spec/
    └── plans/
        └── tasks/
```

---

## Works With

If your requirements already live in Linear or an existing PRD, [linear-prism](https://github.com/shinpr/linear-prism) can decompose them into implementation-ready tasks by reading the codebase, making dependencies explicit, and preserving Design Doc boundaries.

Those tasks can then be passed into `$recipe-design` to enter the design phase with clearer scope and better task visibility.

---

## FAQ

**Q: What models does this work with?**

A: Designed for the latest GPT models. Lightweight subagents (e.g. rule-advisor) can use smaller models for faster analysis. Models are configurable per agent in the TOML files.

**Q: Can I customize the agents?**

A: Yes. Edit the TOML files in `.codex/agents/` — change model, sandbox_mode, developer_instructions, or skills.config. Files you modify locally are preserved during `npx codex-workflows update`.

**Q: What's the difference between `$recipe-implement` and `$recipe-fullstack-implement`?**

A: `$recipe-implement` is the universal entry point. It runs requirement-analyzer first, detects affected layers from the codebase, and automatically routes to backend, frontend, or fullstack flow. `$recipe-fullstack-implement` skips the detection and goes straight into the fullstack flow (separate Design Docs per layer, design-sync, layer-aware task execution). Use `$recipe-implement` when you're not sure; use `$recipe-fullstack-implement` when you know upfront that the feature spans both layers.

**Q: Does this work with MCP servers?**

A: Yes. Codex skills and subagents work alongside [MCP](https://developers.openai.com/codex/mcp) — skills operate at the instruction layer while MCP operates at the tool transport layer. Custom agents inherit parent `mcp_servers` when the agent TOML omits `mcp_servers`; add agent-local MCP config only for agent-specific servers or tool filtering.

**Q: How is this related to claude-code-workflows?**

A: [claude-code-workflows](https://github.com/shinpr/claude-code-workflows) is the Claude Code counterpart. The repositories share the same workflow philosophy, adapted to each tool's native extension points. They can coexist in the same project because Codex uses `.agents/skills/`, `.codex/agents/`, and `AGENTS.md`, while Claude Code uses its own `.claude/` files and `CLAUDE.md`.

**Q: What if a subagent seems stuck?**

A: Long waits can be normal in this workflow because many subagents perform substantial multi-step work. The orchestrator keeps ownership of the pending deliverable, continues waiting for the required output, and uses diagnostics only to confirm missing inputs or restate the pending deliverable. User direction remains the boundary for interrupting that work.

---

## Design Rationale

<details>
<summary>Background reading behind the workflow design</summary>

- [Planning Is the Real Superpower of Agentic Coding](https://www.norsica.jp/blog/planning-superpower-agentic-coding) — why explicit planning turns large-task execution from raw generation into verification against a design and task breakdown
- [Why LLMs Are Bad at 'First Try' and Great at Verification](https://www.norsica.jp/blog/llm-verification-over-generation) — why review loops and session separation are more reliable than first-shot generation on complex work
- [Stop Putting Everything in AGENTS.md](https://www.norsica.jp/blog/stop-putting-everything-in-agents-md) — why `AGENTS.md` should stay lean while rules, docs, and task instructions live near the point of use

</details>

---

## License

MIT License — free to use, modify, and distribute.

---

Built and maintained by [@shinpr](https://github.com/shinpr)
