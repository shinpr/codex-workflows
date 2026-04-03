# codex-workflows

[![Codex CLI](https://img.shields.io/badge/Codex%20CLI-Compatible-10a37f)](https://developers.openai.com/codex/cli)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-Spec%20Compliant-blue)](https://developers.openai.com/codex/skills/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Structured agentic coding workflows for [OpenAI Codex CLI](https://developers.openai.com/codex/cli)** — specialized AI coding agents plan, implement, test, and review changes with traceable docs, task-level commits, and quality gates.

Built on the [Agent Skills specification](https://developers.openai.com/codex/skills/) and [Codex subagents](https://developers.openai.com/codex/subagents). Designed for long-running tasks, large refactors, and reviewable changes.

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

Small changes stay lightweight. Larger tasks get structure: requirements → design → task decomposition → TDD implementation → quality gates.

codex-workflows is the Codex-native counterpart of [Claude Code Workflows](https://github.com/shinpr/claude-code-workflows): same document-driven development style, adapted for Codex CLI, subagents, and GPT models.

---

## Why codex-workflows?

Codex is already strong at one-shot implementation. The problem starts when a change spans multiple files, needs design decisions to stay visible, or has to survive review, testing, and follow-up edits.

For larger tasks, explicit planning changes the job from raw generation into verification against a design, a task breakdown, and acceptance criteria. That matters because review loops are more reliable than first-shot generation once scope and ambiguity grow.

codex-workflows adds the missing structure around those jobs:
- Traceable artifacts: PRD → Design Doc → Task → Commit
- Built-in TDD and quality gates before code is ready to commit
- Agent context separation for large refactors, migrations, and PR-sized changes
- Diagnosis and reverse-engineering flows for bugs and legacy code

## Not Designed For

- One-shot toy scripts or vibe-coding sessions where speed matters more than traceability
- Repositories that do not use tests, lint, builds, or reviewable commits
- Teams that do not want design docs, task breakdowns, or explicit quality gates

---

## What It Does

A single request becomes a structured development process. The framework chooses the level of ceremony based on scope:

| Scale | File Count | What Happens |
|-------|------------|-------------|
| Small | 1-2 | Simplified plan → direct implementation |
| Medium | 3-5 | Design Doc → work plan → task execution |
| Large | 6+ | PRD → ADR → Design Doc → test skeletons → work plan → autonomous execution |

For larger work, the path usually looks like this: understand the problem, analyze the codebase, design the change, break it into atomic tasks, implement with tests, and run quality checks before commit.

Each step is handled by a specialized subagent in its own context, using context engineering to prevent context pollution and reduce error accumulation in long-running tasks:

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
quality-fixer         →  Lint, test, build — no failing checks
    ↓
Ready to commit
```

### The Diagnosis Pipeline

```
Problem → investigator → verifier (ACH + Devil's Advocate) → solver → Actionable solutions
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
| `$recipe-plan` | Design Doc → test skeletons → work plan | Planning phase |
| `$recipe-build` | Execute backend tasks autonomously | Resume backend implementation |
| `$recipe-review` | Design Doc compliance and security validation with auto-fixes | Post-implementation check |
| `$recipe-diagnose` | Problem investigation → verification → solution | Bug investigation |
| `$recipe-reverse-engineer` | Generate PRD + Design Docs from existing code | Legacy system documentation |
| `$recipe-add-integration-tests` | Add integration/E2E tests from Design Doc | Test coverage for existing code |
| `$recipe-update-doc` | Update existing Design Doc / PRD / ADR with review | Spec changes, document maintenance |

### Frontend (React/TypeScript)

| Recipe | What it does | When to use |
|--------|-------------|-------------|
| `$recipe-front-design` | Requirements → UI Spec → frontend Design Doc | Frontend architecture planning |
| `$recipe-front-plan` | Frontend Design Doc → test skeletons → work plan | Frontend planning phase |
| `$recipe-front-build` | Execute frontend tasks with RTL + quality checks | Resume frontend implementation |
| `$recipe-front-review` | Frontend compliance and security validation with React-specific fixes | Frontend post-implementation check |

### Fullstack (Cross-Layer)

| Recipe | What it does | When to use |
|--------|-------------|-------------|
| `$recipe-fullstack-implement` | Full lifecycle with separate Design Docs per layer | Cross-layer features |
| `$recipe-fullstack-build` | Execute tasks with layer-aware agent routing | Resume cross-layer implementation |

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

These load automatically when the conversation context matches — no explicit invocation needed:

| Skill | What it provides |
|-------|-----------------|
| `coding-rules` | Code quality, function design, error handling, refactoring |
| `testing` | TDD Red-Green-Refactor, test types, AAA pattern, mocking |
| `ai-development-guide` | Anti-patterns, debugging (5 Whys), quality check workflow |
| `documentation-criteria` | Document creation rules and templates (PRD, ADR, Design Doc, Work Plan) |
| `implementation-approach` | Strategy selection: vertical / horizontal / hybrid slicing |
| `integration-e2e-testing` | Integration/E2E test design, ROI calculation, review criteria |
| `task-analyzer` | Task analysis, scale estimation, skill selection |
| `subagents-orchestration-guide` | Multi-agent coordination, workflow flows, autonomous execution |

Language-specific references are included for TypeScript/React projects (`coding-rules/references/typescript.md`, `testing/references/typescript.md`).

---

## Subagents

Codex spawns these as needed during recipe execution. Each agent runs in its own context with specialized instructions and skill configurations.

### Document Creation Agents

| Agent | Role |
|-------|------|
| `requirement-analyzer` | Requirements analysis and work scale determination |
| `prd-creator` | PRD creation and structuring |
| `technical-designer` | ADR and Design Doc creation (backend) |
| `technical-designer-frontend` | Frontend ADR and Design Doc creation (React) |
| `ui-spec-designer` | UI Specification from PRD and optional prototype code |
| `codebase-analyzer` | Existing codebase analysis before Design Doc creation |
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
| `investigator` | Evidence collection and hypothesis enumeration |
| `verifier` | Hypothesis validation (ACH + Devil's Advocate) |
| `solver` | Solution derivation with tradeoff analysis |

---

## How It Works

### Autonomous Execution Mode

After work plan approval, the framework enters guided autonomous execution with escalation points:

1. **task-executor** implements each task with TDD
2. **quality-fixer** runs all checks (lint, tests, build) before every commit
3. Escalation pauses execution when design deviation or ambiguity is detected
4. Each task produces one commit — rollback-friendly granularity

### Context Separation

Each subagent runs in a fresh context. This context-engineering pattern keeps long-running agentic coding tasks legible and reviewable:
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
│   ├── task-analyzer/
│   ├── subagents-orchestration-guide/
│   ├── recipe-implement/     # Recipes ($recipe-*)
│   ├── recipe-design/
│   ├── recipe-build/
│   ├── recipe-plan/
│   ├── recipe-review/
│   ├── recipe-diagnose/
│   ├── recipe-task/
│   ├── recipe-update-doc/
│   ├── recipe-reverse-engineer/
│   └── recipe-add-integration-tests/
├── .codex/agents/            # Subagent TOML definitions
│   ├── requirement-analyzer.toml
│   ├── technical-designer.toml
│   ├── task-executor.toml
│   └── ... (23 agents total)
└── docs/                     # Created as you use the recipes
    ├── prd/
    ├── design/
    ├── adr/
    ├── ui-spec/
    └── plans/
        └── tasks/
```

---

## FAQ

**Q: What models does this work with?**

A: Designed for the latest GPT models. Lightweight subagents (e.g. rule-advisor) can use smaller models for faster analysis. Models are configurable per agent in the TOML files.

**Q: Can I customize the agents?**

A: Yes. Edit the TOML files in `.codex/agents/` — change model, sandbox_mode, developer_instructions, or skills.config. Files you modify locally are preserved during `npx codex-workflows update`.

**Q: What's the difference between `$recipe-implement` and `$recipe-fullstack-implement`?**

A: `$recipe-implement` is the universal entry point. It runs requirement-analyzer first, detects affected layers from the codebase, and automatically routes to backend, frontend, or fullstack flow. `$recipe-fullstack-implement` skips the detection and goes straight into the fullstack flow (separate Design Docs per layer, design-sync, layer-aware task execution). Use `$recipe-implement` when you're not sure; use `$recipe-fullstack-implement` when you know upfront that the feature spans both layers.

**Q: Does this work with MCP servers?**

A: Yes. Codex skills and subagents work alongside [MCP](https://developers.openai.com/codex/mcp) — skills operate at the instruction layer while MCP operates at the tool transport layer. You can add MCP servers to any agent's TOML configuration.

**Q: What if a subagent gets stuck?**

A: Subagents escalate to the user when they encounter design deviations, ambiguous requirements, or specification conflicts. The framework stops autonomous execution and presents the issue with options.

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
