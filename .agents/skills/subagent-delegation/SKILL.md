---
name: subagent-delegation
description: "Sets delegation scope, child-initiated consultation, and completion waiting. Use when spawning, waiting for, or steering any subagent, including a single ad hoc agent or a custom workflow agent."
---

# Subagent Delegation

Apply this skill before delegating work or managing a running subagent. It covers both custom agents and agents created for the current task.

## Assignment

Give the child its expected outcome, scope, governing inputs, and the result needed by the next consumer. Follow a custom agent's input contract and pass artifact paths instead of repeating their contents. Leave in-scope methods and reversible choices to the child.

Accept semantically equivalent wording in natural-language inputs while preserving exact contracts where software parses them.

Choose the delegation level before spawning, based on which decisions the child owns:

| Task type | Default delegation |
|---|---|
| Implementation or fixes within confirmed scope; review or verification against supplied criteria; research with a defined question | Delegate through completion, including the required verification. Receive the completed result or an escalation when the child cannot resolve a blocker within its scope. |
| Exploration or design that needs the parent to settle the objective, selection criteria, or a major decision during the work | Name the decision retained by the parent in the assignment. Have the child request that decision when it becomes necessary, with the evidence needed to answer. |

Research and design also use completion delegation when the child can make the required decisions from its assigned scope and evidence. Uncertainty alone does not require parent consultation. Use these defaults directly; only a retained parent decision needs additional consultation instructions.

## Waiting and Intervention

While the child works, perform only necessary work outside its delegated responsibility, or wait for its notification. For either delegation level, use the longest wait allowed by the active instructions and tool. A wait timeout or routine progress notification leaves the assignment pending; continue waiting.

The child initiates consultation. Inspect its deliverable after receiving the completed result, and preserve the workflow's required verification and review. Intervene during execution for a child decision request, a user change or cancellation, or a material assignment error learned through other necessary work. These triggers use incoming information rather than periodic inspection of the child's output or files.

Preserve the running assignment until completion or a correction or redirection makes it obsolete. Elapsed time alone leaves it pending. Receive every required child result before producing the final deliverable.
