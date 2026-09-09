# Review Resolution

Review and correction preserve the agreed MVP and design. Added requirements, responsibilities, layers, services, operations, or proof obligations are outside this authority: neither recommend nor adopt them. Escalate a design change only when concrete evidence shows the MVP cannot be achieved within the agreed boundary; report the failing condition before making that change. Technical preference or optional improvement is insufficient.

## 1. Assess Findings

Apply `reviewee-judgment` within this boundary. Separate each evidenced defect from its proposed fix. Select only in-scope corrections; decline expansion instead of forwarding it as work. Existing required verification remains binding.

## 2. Correct and Recheck

Pass the agreed boundary and selected corrections to the responsible author. Retain each passing reviewer/verifier as complete for this review cycle, including after another reviewer's correction. Rerun only the still-unpassed reviewer that owns the findings being resolved.

Supply its original governing inputs, previous complete result, dispositions, and correction diff or paths. Recheck only resolution of those findings and inconsistencies directly introduced by the correction; carry forward unaffected evidence. This replaces the initial full review. A new finding needs a causal link to the correction, not merely a newly noticed pre-existing problem.

## 3. Finish

Advance when no blocking in-scope finding remains. A supported decline or non-blocking recommendation permits progression. A repeated unresolved claim goes to orchestrator disposition rather than restarting the review chain; only evidenced MVP infeasibility warrants scope-change escalation. Missing authority or access is handled as that specific blocker, not as permission to expand the design.
