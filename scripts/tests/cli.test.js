const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { afterEach, test } = require("node:test");

const CLI_PATH = path.resolve(__dirname, "../../bin/cli.js");
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function makeTemporaryDirectory(name) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `${name}-`));
  temporaryDirectories.push(directory);
  return directory;
}

function runCli(args, options = {}) {
  const cwd = options.cwd ?? makeTemporaryDirectory("codex-workflows-cwd");
  const home = options.home ?? makeTemporaryDirectory("codex-workflows-home");
  const env = { ...process.env, HOME: home };

  if (options.codexHome) env.CODEX_HOME = options.codexHome;
  else delete env.CODEX_HOME;

  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    cwd,
    env,
    encoding: "utf8",
  });
}

test("installs into the current directory by default", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");

  const result = runCli(["install"], { cwd });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(cwd, ".agents/skills/coding-rules/SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".codex/agents/solver.toml")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".codex-workflows-manifest.json")), true);
});

test("installs skills and agents into CODEX_HOME with --user", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const codexHome = makeTemporaryDirectory("codex-workflows-codex-home");
  const unrelatedFile = path.join(codexHome, "skills/personal/SKILL.md");
  fs.mkdirSync(path.dirname(unrelatedFile), { recursive: true });
  fs.writeFileSync(unrelatedFile, "personal skill\n");

  const result = runCli(["install", "--user"], { cwd, codexHome });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(codexHome, "skills/coding-rules/SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(codexHome, "agents/solver.toml")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agents")), false);
  assert.equal(fs.existsSync(path.join(cwd, ".codex")), false);

  const manifest = JSON.parse(
    fs.readFileSync(path.join(codexHome, ".codex-workflows-manifest.json"), "utf8")
  );
  assert.equal(manifest.scope, "user");
  assert.equal(Object.hasOwn(manifest.files, "skills/coding-rules/SKILL.md"), true);
  assert.equal(Object.hasOwn(manifest.files, "agents/solver.toml"), true);
  assert.equal(Object.hasOwn(manifest.files, "skills/personal/SKILL.md"), false);
});

test("uses ~/.codex when CODEX_HOME is not set", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const home = makeTemporaryDirectory("codex-workflows-home");

  const result = runCli(["install", "--user"], { cwd, home });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    fs.existsSync(path.join(home, ".codex/skills/coding-rules/SKILL.md")),
    true
  );
  assert.equal(fs.existsSync(path.join(home, ".codex/agents/solver.toml")), true);
});

test("fails before writing when a user-scoped file conflicts", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const codexHome = makeTemporaryDirectory("codex-workflows-codex-home");
  const conflictingFile = path.join(codexHome, "agents/solver.toml");
  fs.mkdirSync(path.dirname(conflictingFile), { recursive: true });
  fs.writeFileSync(conflictingFile, "user-owned content\n");

  const result = runCli(["install", "--user"], { cwd, codexHome });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /install conflict/i);
  assert.equal(fs.readFileSync(conflictingFile, "utf8"), "user-owned content\n");
  assert.equal(fs.existsSync(path.join(codexHome, "skills/coding-rules/SKILL.md")), false);
  assert.equal(fs.existsSync(path.join(codexHome, ".codex-workflows-manifest.json")), false);
});

test("updates and reports status for a user-scoped installation", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const codexHome = makeTemporaryDirectory("codex-workflows-codex-home");
  const installResult = runCli(["install", "--user"], { cwd, codexHome });
  assert.equal(installResult.status, 0, installResult.stderr);

  const modifiedAgent = path.join(codexHome, "agents/solver.toml");
  fs.appendFileSync(modifiedAgent, "\n# personal override\n");

  const updateResult = runCli(["update", "--user"], { cwd, codexHome });
  assert.equal(updateResult.status, 0, updateResult.stderr);
  assert.match(updateResult.stdout, /modified locally, skipping/);
  assert.match(fs.readFileSync(modifiedAgent, "utf8"), /personal override/);

  const statusResult = runCli(["status", "--user"], { cwd, codexHome });
  assert.equal(statusResult.status, 0, statusResult.stderr);
  assert.match(statusResult.stdout, /Scope:\s+user/);
});

test("rejects unsupported options instead of ignoring them", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");

  const result = runCli(["install", "--global"], { cwd });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown option/i);
  assert.equal(fs.existsSync(path.join(cwd, ".agents")), false);
});
