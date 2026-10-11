"""Exercise the watcher process boundary with a local Codex stand-in."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest


WATCH = Path(__file__).resolve().parents[2] / ".agents/skills/recipe-outcome-watch/scripts/watch.py"
FAKE = '''#!/usr/bin/env python3
import json, os, pathlib, subprocess, sys, time
request=json.load(sys.stdin)
pathlib.Path('request.json').write_text(json.dumps(request))
mode=os.environ['WATCH_TEST_MODE']
if mode=='hang':
 child=subprocess.Popen([sys.executable,'-c','import time; time.sleep(60)'])
 pathlib.Path('child.pid').write_text(str(child.pid))
 time.sleep(60)
elif mode=='error': sys.exit(7)
else:
 out=pathlib.Path(sys.argv[sys.argv.index('--output-last-message')+1])
 out.write_text(json.dumps({'status':mode,'message':'' if mode=='clear' else 'evidence-backed finding'}))
'''


class WatchTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        executable = self.root / "codex"
        executable.write_text(FAKE)
        executable.chmod(0o755)
        (self.root / "design.md").write_text("Preserve the requested outcome.")

    def start(self, mode, *extra):
        return subprocess.Popen(
            [sys.executable, str(WATCH), "--cwd", str(self.root), "--source", "design.md",
             "--interval", "10", "--duration", ".6", *extra],
            env={**os.environ, "PATH": str(self.root) + os.pathsep + os.environ["PATH"],
                 "WATCH_TEST_MODE": mode}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    def test_clear_is_silent_and_source_is_passed_as_path(self):
        process = self.start("clear")
        out, err = process.communicate(timeout=5)
        self.assertEqual(process.returncode, 0, err)
        self.assertEqual(len(out.splitlines()), 2)  # lifecycle notices only
        import json
        request = json.loads((self.root / "request.json").read_text())
        self.assertEqual(request["governing_documents"], [str((self.root / "design.md").resolve())])

    def test_drift_is_delivered(self):
        process = self.start("drift")
        out, err = process.communicate(timeout=5)
        self.assertEqual(process.returncode, 0, err)
        self.assertIn("evidence-backed finding", out)

    def test_interval_repeats_until_deadline(self):
        process = self.start("drift", "--interval", ".05", "--duration", "1")
        out, err = process.communicate(timeout=5)
        self.assertEqual(process.returncode, 0, err)
        self.assertGreaterEqual(out.count("evidence-backed finding"), 2)
        self.assertIn("duration reached", out)

    def test_failure_and_unknown_end_the_watch(self):
        for mode in ("error", "unknown"):
            with self.subTest(mode=mode):
                process = self.start(mode, "--duration", "60")
                out, err = process.communicate(timeout=5)
                self.assertEqual(process.returncode, 1)
                self.assertIn("Outcome watch stopped:", err)

    def test_stop_handle_is_idempotent_and_control_files_are_removed(self):
        process = self.start("clear", "--duration", "60")
        try:
            handle = process.stdout.readline().split("stop_handle=", 1)[1].strip()
            until = time.monotonic() + 3
            while not (self.root / "request.json").exists() and time.monotonic() < until:
                time.sleep(.01)
            self.assertTrue((self.root / "request.json").exists())
            stopped = subprocess.run([sys.executable, str(WATCH), "--stop", handle],
                                     capture_output=True, text=True, timeout=5)
            self.assertEqual(stopped.returncode, 0, stopped.stderr)
            out, err = process.communicate(timeout=5)
            self.assertEqual(process.returncode, 0, err)
            self.assertIn("requested", out)
            self.assertFalse(Path(handle).parent.exists())
            stopped = subprocess.run([sys.executable, str(WATCH), "--stop", handle],
                                     capture_output=True, text=True, timeout=5)
            self.assertEqual(stopped.returncode, 0, stopped.stderr)
        finally:
            if process.poll() is None:
                process.kill()
                process.communicate()

    def test_stop_deadline_and_timeout_clean_up_active_review(self):
        for reason in ("stop", "deadline", "timeout"):
            with self.subTest(reason=reason):
                pidfile = self.root / "child.pid"
                pidfile.unlink(missing_ok=True)
                extra = ["--duration", "60"] if reason != "deadline" else []
                if reason == "timeout":
                    extra += ["--review-timeout", ".3"]
                process = self.start("hang", *extra)
                try:
                    handle = process.stdout.readline().split("stop_handle=", 1)[1].strip()
                    until = time.monotonic() + 3
                    while not pidfile.exists() and time.monotonic() < until:
                        time.sleep(.01)
                    self.assertTrue(pidfile.exists())
                    if reason == "stop":
                        stopped = subprocess.run([sys.executable, str(WATCH), "--stop", handle],
                                                 capture_output=True, text=True, timeout=5)
                        self.assertEqual(stopped.returncode, 0, stopped.stderr)
                    out, err = process.communicate(timeout=5)
                    self.assertEqual(process.returncode, 1 if reason == "timeout" else 0, err)
                    # An unreaped zombie cannot run or spend tokens either.
                    state = subprocess.run(["ps", "-o", "stat=", "-p", pidfile.read_text()],
                                           capture_output=True, text=True).stdout.strip()
                    self.assertTrue(not state or state.startswith("Z"), state)
                finally:
                    if process.poll() is None:
                        process.kill()
                        process.communicate()


if __name__ == "__main__":
    unittest.main()
