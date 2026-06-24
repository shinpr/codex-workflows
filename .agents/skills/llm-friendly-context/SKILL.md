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
   - Example: `Preserve existing public API behavior across the documented compatibility cases.`

2. **Make vague instructions concrete**
   - Replace subjective terms with observable conditions, paths, commands, schemas, examples, or decision rules.
   - Terms that usually need clarification before handoff: `appropriate`, `proper`, `related`, `existing behavior`, `optional`, `as needed`, `if needed`, `per convention`, unresolved alternatives, `TBD`, and `placeholder`.

3. **Specify output shape**
   - Define required sections, fields, table columns, JSON keys, checklist items, or status values.
   - For handoffs, include produced artifact paths and the exact status fields the caller must inspect.

4. **Provide necessary context**
   - Include purpose, source artifacts, hard constraints, accepted decisions, and unresolved conditions.
   - Prefer concrete file paths and section hints over broad module names.

5. **Decompose complex work into verifiable steps**
   - Split work with 3+ objectives or sequential dependencies into ordered steps.
   - Each step needs a checkpoint stating the evidence that proves completion.

6. **Permit uncertainty explicitly**
   - If source material is missing, contradictory, or unverifiable, state the uncertainty and required escalation.
   - Record unknown business, product, security, compatibility, or contract decisions as blocking unresolved items with the input needed to resolve them.

7. **Keep constraints proportionate**
   - Add constraints that reduce ambiguity or preserve a real requirement.
   - Keep simple downstream tasks lightweight when target action, context, and success criteria are already clear.

## Rewrite Patterns

Use these rewrites before treating a prompt, handoff, or artifact as complete.

| Ambiguous form | Rewrite as |
|---|---|
| `optional` used as an unresolved choice | Required, omitted, or required only under a named condition |
| Multiple alternatives that the next agent must choose between | The selected option, or a deterministic decision rule |
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
- [ ] Output format or expected status fields are specified.
- [ ] Success criteria are observable.
- [ ] Ambiguous expressions have been rewritten or marked as unresolved.
- [ ] The next agent can complete its scope through explicit choices, decision rules, or blocking unresolved items.

## Generated Artifact Checklist

Before writing or finalizing a generated document:

- [ ] Each requirement, claim, task, test skeleton, or review finding has enough source context to trace why it exists.
- [ ] Every executable instruction names the target, action, and expected result.
- [ ] Verification steps say what to run or observe and what result proves success.
- [ ] Derived artifacts preserve copied decisions with the same wording and meaning as their source artifacts.
- [ ] Blocking missing information records the missing input and escalation condition.
