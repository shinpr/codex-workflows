#!/usr/bin/env python3
"""Finite, read-only Codex reviews; stdout is the host's notification stream."""

import argparse
import json
import math
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import threading
import time


def positive_seconds(value):
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError("must be a finite positive number of seconds")
    return number


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stop", type=Path, help="stop handle printed by a running watch")
    parser.add_argument("--cwd", type=Path, default=Path.cwd())
    basis = parser.add_mutually_exclusive_group()
    basis.add_argument("--source", action="append", default=[])
    basis.add_argument("--purpose", help="explicit or user-confirmed purpose, unchanged")
    parser.add_argument("--activity", action="append", default=[])
    parser.add_argument("--interval", type=positive_seconds, default=3600)
    parser.add_argument("--duration", type=positive_seconds, default=14400)
    parser.add_argument("--review-timeout", type=positive_seconds, default=600)
    parser.add_argument("--language", default="English")
    args = parser.parse_args()
    if args.stop is not None:
        return args
    if not args.source and args.purpose is None:
        parser.error("provide --source or --purpose")
    args.cwd = args.cwd.resolve()
    if not args.cwd.is_dir():
        parser.error("--cwd must be an existing directory")
    if args.purpose is not None and not args.purpose.strip():
        parser.error("--purpose must not be empty")
    for field in ("source", "activity"):
        paths = [(args.cwd / path).resolve() for path in getattr(args, field)]
        for path in paths:
            if not path.is_file():
                parser.error(f"{field} file does not exist: {path}")
        setattr(args, field, [str(path) for path in paths])
    return args


def terminate_group(process):
    if os.name == "nt":
        subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
        process.wait(timeout=5)
        return
    # Descendants may outlive the CLI leader; always address its process group.
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        process.wait(timeout=2)
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    process.wait()


class StopRequest:
    def __init__(self, handle):
        self.handle = handle
        self.event = threading.Event()

    def is_set(self):
        return self.event.is_set() or self.handle.exists()

    def wait(self, seconds):
        until = time.monotonic() + seconds
        while not self.is_set() and time.monotonic() < until:
            self.event.wait(min(.2, max(0, until - time.monotonic())))

    def set(self):
        self.event.set()


def review(args, stop, deadline):
    instructions = (Path(__file__).resolve().parent.parent / "references/review.md").read_text(encoding="utf-8")
    schema = {
        "type": "object",
        "properties": {
            "status": {"type": "string", "enum": ["clear", "drift", "unknown"]},
            "message": {"type": "string"},
        },
        "required": ["status", "message"],
        "additionalProperties": False,
    }
    request = json.dumps({
        "governing_documents": args.source,
        "user_confirmed_purpose": args.purpose,
        "activity_logs": args.activity,
        "working_directory": str(args.cwd),
        "output_language": args.language,
        "task": "Review current work direction using the supplied basis and actual artifacts.",
    }, ensure_ascii=False)
    with tempfile.TemporaryDirectory(prefix="outcome-watch-") as folder:
        root = Path(folder)
        (root / "schema.json").write_text(json.dumps(schema), encoding="utf-8")
        output = root / "result.json"
        command = [
            "codex", "exec", "--ephemeral", "--sandbox", "read-only",
            "--skip-git-repo-check", "--cd", str(args.cwd),
            "-c", "developer_instructions=" + json.dumps(instructions),
            "--output-schema", str(root / "schema.json"),
            "--output-last-message", str(output), "-",
        ]
        with (root / "execution.log").open("w", encoding="utf-8") as log:
            process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=log,
                                       stderr=subprocess.STDOUT, text=True, encoding="utf-8", start_new_session=True,
                                       cwd=args.cwd)
            try:
                process.stdin.write(request)
                process.stdin.close()
                review_deadline = min(deadline, time.monotonic() + args.review_timeout)
                while process.poll() is None:
                    if stop.is_set() or time.monotonic() >= deadline:
                        return None
                    if time.monotonic() >= review_deadline:
                        raise RuntimeError("review timed out")
                    stop.wait(min(0.2, max(0, review_deadline - time.monotonic())))
                if stop.is_set() or time.monotonic() >= deadline:
                    return None
                if process.returncode != 0:
                    detail = (root / "execution.log").read_text(encoding="utf-8", errors="replace")[-2000:].strip()
                    raise RuntimeError(f"codex exec exited with status {process.returncode}: {detail}")
                result = json.loads(output.read_text(encoding="utf-8"))
                if (not isinstance(result, dict)
                        or result.get("status") not in ("clear", "drift", "unknown")
                        or not isinstance(result.get("message"), str)
                        or (result["status"] != "clear" and not result["message"].strip())):
                    raise ValueError("invalid review result")
                return result
            finally:
                if not process.stdin.closed:
                    process.stdin.close()
                terminate_group(process)


def main():
    args = parse_args()
    if args.stop is not None:
        try:
            # The private directory exists only while its owning watch is running.
            with args.stop.open("x"):
                pass
        except (FileNotFoundError, FileExistsError):
            pass
        print("Outcome watch stop requested.", flush=True)
        return 0
    with tempfile.TemporaryDirectory(prefix="outcome-watch-control-") as folder:
        return watch(args, StopRequest(Path(folder) / "stop"))


def watch(args, stop):
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, lambda *_: stop.set())
    deadline = time.monotonic() + args.duration
    completed = 0
    print(f"Outcome watch started: duration={args.duration:g}s, "
          f"interval={args.interval:g}s; stop_handle={stop.handle}", flush=True)
    try:
        while not stop.is_set() and time.monotonic() < deadline:
            started = time.monotonic()
            result = review(args, stop, deadline)
            if result is None:
                break
            completed += 1
            if result["status"] == "unknown":
                raise RuntimeError("direction could not be assessed: " + result["message"])
            if result["status"] == "drift":
                print(result["message"], flush=True)
            now = time.monotonic()
            stop.wait(max(0, min(started + args.interval, deadline) - now))
    except (OSError, ValueError, RuntimeError) as error:
        print(f"Outcome watch stopped: {error}", file=sys.stderr, flush=True)
        return 1
    reason = "requested" if stop.is_set() else "duration reached"
    print(f"Outcome watch stopped: {reason}; completed reviews={completed}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
