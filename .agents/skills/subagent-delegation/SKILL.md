---
name: subagent-delegation
description: "Sets delegation scope, completion waiting, and evidence-based intervention. Use when spawning, waiting for, or steering any subagent, including a single ad hoc agent or a custom workflow agent."
---

# Subagent Delegation

Apply this skill before delegating work or managing a running subagent. It covers both custom agents and agents created for the current task.

Delegation gives the child a responsibility and the authority to complete it from an isolated context. Pass only the task's minimum input contract; preloading the parent's conclusions, target list, or classifications turns delegation into confirmation work, suppresses independent judgment, and defeats context isolation.

## Assignment

Give the child its expected outcome, scope, governing inputs required by its input contract, and the result needed by the next consumer. Pass each source (the user's words, a governing artifact, a review finding, another agent's result) by its path or copied unchanged, and label the parent's own decisions as the parent's. The sources already make the child self-contained, so this takes precedence over writing a delegation prompt out in full: text the parent writes about a source, such as a restatement, summary, reading list, added constraint, estimate, or advice, reaches the child as a requirement no user confirmed and no reviewer checked. It drifts from the source, changes scope without a decision, and overrides the child's judgment of what to read. A gap in a source goes to whoever owns that decision: the child decides in-scope choices, the parent passes its own decisions labeled as such, and any other gap returns to the source's owner instead of being filled. Leave in-scope methods and reversible choices to the child. Tell the child to notify the parent when its decision or intervention is needed or an update is explicitly requested, and otherwise work through to the completed result; include the evidence needed to act.

Accept semantically equivalent wording in natural-language inputs while preserving exact contracts where software parses them.

Choose the delegation level before spawning, based on which decisions the child owns:

| Task type | Default delegation |
|---|---|
| Implementation or fixes within confirmed scope; review or verification against supplied criteria; research with a defined question | Delegate through completion, including the required verification. Receive the completed result or an escalation for a blocker requiring help beyond the child's assigned scope. |
| Exploration or design that needs the parent to settle the objective, selection criteria, or a major decision during the work | Name the decision retained by the parent in the assignment. Have the child request that decision when it becomes necessary, with the evidence needed to answer. |

Research and design also use completion delegation when the child can make the required decisions from its assigned scope and evidence. Use these defaults directly; only a retained parent decision needs additional consultation instructions.

## Waiting and Intervention

Preserve the delegated context boundary while the child works. Parallel parent work qualifies as independent when it has a separate decision and evidence boundary and all of its inputs are already available; perform such independent work or wait for notification. Notification-driven waits resume on child notifications or user input and preserve the user's ability to intervene. Use the tool's maximum timeout for notification-driven subagent waits, shortening it only when a concrete parent action is due earlier.

After a timeout or routine progress notification, continue waiting. Base progress checks on explicit requests or received evidence of a problem.

Intervene during execution for a child decision request, a user change or cancellation, a material assignment error learned through other necessary work, or evidence that the child's approach is ineffective or progress has stalled. Investigate enough to provide an actionable correction or diagnostic approach before resuming the wait. Return in-scope execution to the child once the next step addresses the problem.

Preserve the running assignment until completion or a correction or redirection makes it obsolete. Inspect the deliverable after receiving the completed result and apply the required verification and review. Receive every required child result before producing the final deliverable.
