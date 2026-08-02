---
name: llm-friendly-context
description: "Clarifies inputs, outputs, success criteria, decisions, and unresolved conditions so downstream agents can execute without guessing. Use when writing or revising LLM-facing prompts, handoffs, planning artifacts, reviews, reports, or generated instructions."
---

# LLM-Friendly Context

## Purpose

Use this skill when writing or revising any content another agent will execute or judge: prompts, handoffs, planning artifacts, review findings, completion reports, generated instructions, test skeleton comments, work plans, and task files.

The goal is stable downstream execution. The next agent should know the target action, required inputs, accepted decisions, observable success criteria, and the condition that requires escalation.

## Core Rules

1. **Use positive, executable instructions**
   - State the action the next agent should perform.
   - Convert quality policies into observable acceptance criteria.
   - Keep a prohibition only when it protects an irreversible boundary or shipped contract. Name the protected condition and the allowed action.
   - Example: `Preserve existing public API behavior across the documented compatibility cases.`

2. **Make vague instructions concrete**
   - Replace subjective terms with observable conditions, paths, commands, schemas, examples, or decision rules.
   - Terms that usually need clarification before handoff: `appropriate`, `proper`, `related`, `existing behavior`, `optional`, `as needed`, `if needed`, `per convention`, unresolved alternatives, `TBD`, and `placeholder`.

3. **Specify output shape**
   - Define only the sections or fields the next consumer uses.
   - For agent handoffs, name produced artifact paths and the result needed by the next action. Require exact serialization only when a program parses it.

4. **Provide necessary context**
   - Include purpose, source artifacts, hard constraints, accepted decisions, and unresolved conditions.
   - Prefer concrete file paths and section hints over broad module names.
   - Follow references only while they can change an in-scope decision, action, or verification result.

5. **Decompose complex work into verifiable steps**
   - Expose dependency order when a later action relies on an earlier result.
   - Reuse one execution plan to retain all required steps and final verification during multi-step work. Simple, single-action work proceeds directly.

6. **Permit uncertainty explicitly**
   - State missing, contradictory, or unverifiable source material and its effect on the current action.
   - Return unresolved decisions to the orchestrator with the evidence needed to resolve them; the orchestrator decides whether user input is necessary.

7. **Keep constraints proportionate**
   - Add constraints that reduce ambiguity or preserve a real requirement.
   - Keep simple downstream tasks lightweight when target action, context, and success criteria are already clear.

## Rewrite Patterns

Use these rewrites before treating a prompt, handoff, or artifact as complete.

| Ambiguous form | Rewrite as |
|---|---|
| `optional` used as an unresolved choice | Required, omitted, or required only under a named condition |
| Multiple alternatives that the next agent must choose between | The selected option, or the evidence boundary within which the agent may choose |
| `as needed` / `if needed` | The triggering condition and required action |
| `per convention` | The file, function, test, or documented convention to follow |
| `related files` | Specific paths, globs, or search hints |
| `existing behavior` | The observable behavior, source file, test, API response, or UI state to preserve |
| `placeholder` | Exact temporary value or behavior, allowed dependencies, and verification expectation |
| `TBD` used for required information | A blocking unresolved item with owner, required input, or escalation condition |
| `appropriate` / `proper` | A measurable criterion or checklist |

## Handoff Checklist

Before sending a prompt or artifact to another agent, verify:

- [ ] The target action is explicit.
- [ ] Required input paths and source artifacts are named.
- [ ] Accepted decisions and constraints are stated once with stable wording.
- [ ] The next consumer can identify the artifact or result it needs.
- [ ] Success criteria are observable.
- [ ] Ambiguous expressions have been rewritten or marked as unresolved.
- [ ] Every retained prohibition names the protected condition and allowed alternative.
- [ ] Dependencies needed by the next action are visible.
- [ ] The next agent can complete its scope or return the unresolved decision with evidence.

## Generated Artifact Checklist

Before writing or finalizing a generated document:

- [ ] Each requirement, claim, task, test skeleton, or review finding has enough source context to trace why it exists.
- [ ] Every executable instruction names the target, action, and expected result.
- [ ] Verification steps say what to run or observe and what result proves success.
- [ ] Every retained prohibition names the protected condition and allowed alternative.
- [ ] Derived artifacts preserve copied decisions with the same wording and meaning as their source artifacts.
- [ ] Blocking missing information records the missing input and escalation condition.

## References

- [Task File Contract](references/task-template.md) — execution-carrier fields and filename routing for task-decomposer, build recipes, and Small flows
