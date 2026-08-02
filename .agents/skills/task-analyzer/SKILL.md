---
name: task-analyzer
description: "Analyzes standalone task essence, task type, applicable skills, and metacognitive execution risks."
---

# Task Analyzer

Use [references/skills-index.yaml](references/skills-index.yaml) as the available workflow-skill catalog.

## Task Analysis Process

### 1. Understand Task Essence

Identify the fundamental purpose beyond the surface request.

- What problem or outcome is the user actually asking to resolve?
- What observable result marks completion?
- Which superficial response could miss that result?

Return the essence as a concise purpose, not a restatement of the requested operation.

### 2. Identify Task Type

Classify the immediate work as implementation, fix, refactoring, design, documentation, quality/review, diagnosis, research, or continuation. Preserve an explicitly invoked recipe or supplied governing artifact as the entry point.

### 3. Match Skills by Task Evidence

Extract task tags and match them to `skills-index.yaml`. Consider implicit relationships that materially change execution:

| Task evidence | Consider |
|---|---|
| Observed failure or error handling | `ai-development-guide`, `testing` |
| Code implementation or refactoring | `coding-rules`, `testing` |
| Design or implementation planning | `documentation-criteria`, `implementation-approach` |
| Real boundary proof | `integration-e2e-testing` |
| Agent handoff or multi-agent workflow | `llm-friendly-context`, `subagents-orchestration-guide` |

Select skills in this priority order:

1. Essential — changes the primary action.
2. Quality — changes proof or failure handling.
3. Process — governs the explicitly selected workflow.
4. Supplementary — resolves a concrete remaining risk.

Select the smallest set whose rules change execution or verification. A recipe's Required Skills already define its set.

### 4. Generate Metacognitive Guidance

Generate only questions and warnings that can change the current approach. Cover, when applicable:

- the task's essential quality criterion;
- evidence needed before the first change;
- a likely superficial or local-only failure;
- a dependency, boundary, or verification risk;
- the smallest useful first action and its rationale.

Warning patterns include symptom-only repair, unsupported broad changes, implementation without observable proof, and planning that does not preserve the requested outcome. Describe the applicable mitigation rather than forcing a fixed ceremony.

### 5. Common Decision Points

| Decision | Owning skill or evidence |
|---|---|
| Documentation needed | Explicit recipe or `documentation-criteria` |
| Implementation strategy | `implementation-approach` |
| Test boundary | `testing` and, when a wider boundary is indispensable, `integration-e2e-testing` |
| Root cause or impact | `ai-development-guide` |
| Frontend-specific rules | selected skill's frontend reference after loading that skill |

Task analysis does not own Structural Scale, file-count estimation, documentation requirements, approval gates, implementation phases, or subagent topology.

## Output

```yaml
taskAnalysis:
  essence: <fundamental purpose>
  taskType: <implementation|fix|refactoring|design|documentation|quality|diagnosis|research|continuation>
  extractedTags: [<task evidence tag>]
selectedRules:
  - skill: <skill name>
    priority: <essential|quality|process|supplementary>
    reason: <how it changes execution or verification>
    sections: [<relevant section name>]
metaCognitiveGuidance:
  taskEssence: <fundamental purpose>
  pastFailures: [<applicable known failure pattern>]
  potentialPitfalls: [<task-specific risk>]
  firstStep:
    action: <smallest evidence-gathering or execution action>
    rationale: <why it comes first>
metaCognitiveQuestions: [<question that can change the approach>]
warningPatterns:
  - pattern: <applicable warning>
    mitigation: <proportionate response>
unresolvedRouting: <material workflow choice and effect | null>
```

## Completion Check

- Task essence, type, tags, and first action are evidence-linked.
- The selected set is the smallest set that changes execution or verification.
- Warnings and questions are task-specific and proportionate.
- Output contains skill names and relevant section names, not copied skill bodies or filesystem paths.
