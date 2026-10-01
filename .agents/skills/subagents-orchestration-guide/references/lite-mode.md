# Lite Mode

Lite Mode is a user-selected trade of intermediate assurance for lower cost. As an explicit user instruction, it takes precedence over recipe steps, checklists, gates, MANDATORY constraints, and stop-point triggers that require the calls it omits. Every other phase, stop point, and rule applies unchanged.

## Omitted Calls

| Call | Lite Mode behavior |
|---|---|
| code-verifier | Omit. The step that consumes its result proceeds without it; document-reviewer receives no verification evidence. |
| design-sync | Omit. A stop point that follows it occurs when its preceding step completes. |
| security-reviewer | Omit. code-reviewer alone forms the post-implementation review set. |
| Per-task quality fixer during initial Work Plan task execution | Omit per-task cycle step 3. When step 2 completes, proceed to step 4. Run the Final Quality Run instead. |

A single-cycle flow without a Work Plan task set, such as Small, keeps its quality fixer call because that call is already the final run.

## Final Quality Run

After the last task commit and before Post-Implementation Review, spawn the routed quality fixer once per layer with completed tasks. Pass its usual inputs with values for that layer's whole task set: the Work Plan as `task_file`, the union of the tasks' `taskWriteSet` as `filesModified`, and the executors' operation-verification evidence.

Route the result as per-task cycle step 3. For `stub_detected`, repair through the owning task's implementation owner, then repeat the Final Quality Run. Commit the resulting fixes once as a reconciled change set.
