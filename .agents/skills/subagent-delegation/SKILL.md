---
name: subagent-delegation
description: "Sets delegation scope, completion waiting, and evidence-based intervention. Use when spawning, waiting for, or steering any subagent, including a single ad hoc agent or a custom workflow agent."
---

# Subagent Delegation

Apply this skill before delegating work or managing a running subagent. It covers both custom agents and agents created for the current task.

## Assignment

Give the child its expected outcome, scope, governing inputs, and the result needed by the next consumer. Follow a custom agent's input contract and pass artifact paths instead of repeating their contents. Leave in-scope methods and reversible choices to the child.

Accept semantically equivalent wording in natural-language inputs while preserving exact contracts where software parses them.

Choose the delegation level before spawning, based on which decisions the child owns:

| Task type | Default delegation |
|---|---|
| Implementation or fixes within confirmed scope; review or verification against supplied criteria; research with a defined question | Delegate through completion, including the required verification. Receive the completed result or an escalation for a blocker requiring help beyond the child's assigned scope. |
| Exploration or design that needs the parent to settle the objective, selection criteria, or a major decision during the work | Name the decision retained by the parent in the assignment. Have the child request that decision when it becomes necessary, with the evidence needed to answer. |

Research and design also use completion delegation when the child can make the required decisions from its assigned scope and evidence. Use these defaults directly; only a retained parent decision needs additional consultation instructions.

## Waiting and Intervention

Minimize total parent-and-child token cost while meeting required quality and user time constraints. While the child works, perform only necessary work outside its delegated responsibility, or wait for its notification. Notification-driven subagent waits resume on child notifications or user input, preserving the user's ability to intervene; the 60-second blocking-wait guidance does not apply to these interruptible waits. The user prioritizes preserving their usage budget over routine progress updates. Use waits longer than 60 seconds, increasing the duration with the child's delegated autonomy and expected task duration. Shorten it only for a concrete earlier parent action whose expected benefit outweighs the extra coordination cost.

On a timeout or notification, assess the available evidence of progress against the expected task duration. After a long wait, obtain enough information to judge whether continued waiting is useful: ask the child for its current operation, latest results, and next step when the available evidence is insufficient. A running status alone does not establish progress. Continue long waits when the evidence supports the child's approach.

Intervene during execution for a child decision request, a user change or cancellation, a material assignment error learned through other necessary work, or evidence that the child's approach is ineffective or progress has stalled. Investigate enough to provide an actionable correction or diagnostic approach before resuming the wait. Return in-scope execution to the child once the next step addresses the problem.

Preserve the running assignment until completion or a correction or redirection makes it obsolete. Inspect the deliverable after receiving the completed result and apply the required verification and review. Receive every required child result before producing the final deliverable.
