---
name: recipe-outcome-watch
description: "Monitors development work against its governing outcome at a user-selected interval. Use when asked for periodic independent checks for scope drift or unnecessary work."
---

# Outcome Watch

Run a finite, independent direction review alongside the current task. Use governing documents or an explicit purpose, with any development task.

Request: $ARGUMENTS

## Resolve the basis

1. Use governing document paths or an explicit purpose supplied in the arguments. Pass documents as paths, preserving their authority.
2. Otherwise inspect documents under the working directory and their relationship to the current task. Select a document whose content establishes that relationship, with its relevant references. If multiple plausible targets remain, ask the user to select one.
3. When no governing document exists, use the user's explicit task purpose. If you must infer or synthesize the purpose or completion condition from the session, present that wording for confirmation before starting and pass the confirmed wording unchanged.

Reuse existing task evidence. Supply an exact activity-log path when available and relevant. Resolve a changed monitoring scope from explicit user instructions and restart with that basis.

## Start and deliver

Resolve `scripts/watch.py` relative to this skill and use an available Python 3 interpreter. The script owns timing, `codex exec` reviews, and cleanup. Run it through the host's asynchronous execution facility, forwarding its output automatically into the active session while continuing the task. Establish that delivery from the available tool contracts before starting. If the host offers only manual polling or next-turn message queues, explain that live delivery is unavailable and end this recipe.

Start in the target directory with `--source PATH` for each governing document, or `--purpose TEXT` for the explicit or confirmed purpose. Optional `--activity PATH` supplies existing evidence; `--cwd PATH` selects the target directory. Quote arguments for the available shell. Use `--interval SECONDS`, `--duration SECONDS`, and `--language LANGUAGE` for the user's choices.

Defaults are a 60-minute interval and a 4-hour duration. The first review runs immediately, with subsequent starts spaced by the interval. Each review is bounded by 10 minutes and the remaining duration. Use the host's normal permission mechanism to launch the authenticated CLI; reviews run read-only.

Confirm the startup output and retain its `stop_handle` plus the host's running-job handle in the active context. Continue the user's task while findings arrive. Clear reviews are silent. Evaluate findings against their cited basis and act on justified corrections. Failure or an unknown judgment ends the watch with a reason; report that termination.

## Stop

On a stop request or when the monitored work ends, invoke the same script with `--stop HANDLE`, using the startup `stop_handle`. Collect the running job's completion before releasing its delivery channel. The script stops its active review and removes its temporary control files. The duration limit also ends the watch if the session loses its handle. Resume monitoring through an explicit new invocation.
