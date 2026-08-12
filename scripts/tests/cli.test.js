const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { afterEach, test } = require("node:test");

const REPOSITORY_ROOT = path.resolve(__dirname, "../..");
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

  return spawnSync(process.execPath, [options.cliPath ?? CLI_PATH, ...args], {
    cwd,
    env,
    encoding: "utf8",
  });
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function createPackageFixture({ version, files, changes }) {
  const sourceDir = makeTemporaryDirectory("codex-workflows-package");
  const cliPath = path.join(sourceDir, "bin/cli.js");
  fs.mkdirSync(path.dirname(cliPath), { recursive: true });
  fs.copyFileSync(CLI_PATH, cliPath);
  fs.writeFileSync(
    path.join(sourceDir, "package.json"),
    `${JSON.stringify({ name: "codex-workflows-test", version }, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(sourceDir, "bin/update-history.json"),
    `${JSON.stringify({ changes }, null, 2)}\n`
  );
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(sourceDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
  return { cliPath, sourceDir };
}

function writeInstalledFixture({ cwd, version, files }) {
  const hashes = {};
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(cwd, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    hashes[relativePath] = sha256(content);
  }
  fs.writeFileSync(
    path.join(cwd, ".codex-workflows-manifest.json"),
    `${JSON.stringify({ version, installedAt: new Date().toISOString(), scope: "project", files: hashes }, null, 2)}\n`
  );
}

test("custom agents declare required skills by name", () => {
  const agentsDirectory = path.join(REPOSITORY_ROOT, ".codex/agents");
  const agentFiles = fs.readdirSync(agentsDirectory).filter(file => file.endsWith(".toml"));

  for (const agentFile of agentFiles) {
    const agentPath = path.join(agentsDirectory, agentFile);
    const content = fs.readFileSync(agentPath, "utf8");
    const declaration = content.match(
      /^Load and read each skill completely before taking task actions: (.+)\.$/m
    );

    assert.ok(declaration, `${agentFile} must declare its Required Skills by name`);
    assert.doesNotMatch(content, /\[\[skills\.config\]\]/, agentFile);
    assert.doesNotMatch(content, /\.agents\/skills\//, agentFile);

    const skillNames = [...declaration[1].matchAll(/`([a-z0-9-]+)`/g)].map(match => match[1]);
    assert.ok(skillNames.length > 0, `${agentFile} must name at least one required skill`);
    for (const skillName of skillNames) {
      assert.equal(
        fs.existsSync(path.join(REPOSITORY_ROOT, ".agents/skills", skillName, "SKILL.md")),
        true,
        `${agentFile} references unknown skill ${skillName}`
      );
    }
  }
});

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
  assert.match(updateResult.stdout, /modified locally, preserving/);
  assert.match(fs.readFileSync(modifiedAgent, "utf8"), /personal override/);

  const statusResult = runCli(["status", "--user"], { cwd, codexHome });
  assert.equal(statusResult.status, 0, statusResult.stderr);
  assert.match(statusResult.stdout, /Scope:\s+user/);
});

test("applies file moves in version order across skipped releases", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const oldPath = ".agents/skills/example/old.md";
  const middlePath = ".agents/skills/example/middle.md";
  const newPath = ".agents/skills/example/new.md";
  const packageFixture = createPackageFixture({
    version: "3.0.0",
    files: { [newPath]: "package v3\n" },
    changes: [
      { version: "2.0.0", operations: [{ type: "move", from: oldPath, to: middlePath }] },
      { version: "3.0.0", operations: [{ type: "move", from: middlePath, to: newPath }] },
    ],
  });
  writeInstalledFixture({ cwd, version: "1.0.0", files: { [oldPath]: "package v1\n" } });

  const result = runCli(["update"], { cwd, cliPath: packageFixture.cliPath });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(cwd, oldPath)), false);
  assert.equal(fs.existsSync(path.join(cwd, middlePath)), false);
  assert.equal(fs.readFileSync(path.join(cwd, newPath), "utf8"), "package v3\n");
  const manifest = JSON.parse(
    fs.readFileSync(path.join(cwd, ".codex-workflows-manifest.json"), "utf8")
  );
  assert.deepEqual(Object.keys(manifest.files), [newPath]);
  assert.equal(manifest.files[newPath], sha256("package v3\n"));
});

test("installs a moved destination when the legacy source is absent from the manifest", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const oldPath = ".agents/skills/example/old.md";
  const newPath = ".agents/skills/example/new.md";
  const packageFixture = createPackageFixture({
    version: "2.0.0",
    files: { [newPath]: "package v2\n" },
    changes: [
      { version: "2.0.0", operations: [{ type: "move", from: oldPath, to: newPath }] },
    ],
  });
  writeInstalledFixture({ cwd, version: "1.0.0", files: {} });

  const result = runCli(["update"], { cwd, cliPath: packageFixture.cliPath });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(cwd, oldPath)), false);
  assert.equal(fs.readFileSync(path.join(cwd, newPath), "utf8"), "package v2\n");
});

test("preserves an untracked legacy move source and installs the current destination", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const oldPath = ".agents/skills/example/old.md";
  const newPath = ".agents/skills/example/new.md";
  const packageFixture = createPackageFixture({
    version: "2.0.0",
    files: { [newPath]: "package v2\n" },
    changes: [
      { version: "2.0.0", operations: [{ type: "move", from: oldPath, to: newPath }] },
    ],
  });
  writeInstalledFixture({ cwd, version: "1.0.0", files: {} });
  fs.mkdirSync(path.dirname(path.join(cwd, oldPath)), { recursive: true });
  fs.writeFileSync(path.join(cwd, oldPath), "unknown legacy content\n");

  const result = runCli(["update"], { cwd, cliPath: packageFixture.cliPath });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(cwd, oldPath)), false);
  assert.equal(fs.readFileSync(path.join(cwd, newPath), "utf8"), "package v2\n");
  assert.equal(
    fs.readFileSync(
      path.join(cwd, ".codex-workflows-preserved/2.0.0", oldPath),
      "utf8"
    ),
    "unknown legacy content\n"
  );
});

test("moves a locally modified managed file to its current path without overwriting it", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const oldPath = ".agents/skills/example/old.md";
  const newPath = ".agents/skills/example/new.md";
  const packageFixture = createPackageFixture({
    version: "2.0.0",
    files: { [newPath]: "package v2\n" },
    changes: [
      { version: "2.0.0", operations: [{ type: "move", from: oldPath, to: newPath }] },
    ],
  });
  writeInstalledFixture({ cwd, version: "1.0.0", files: { [oldPath]: "package v1\n" } });
  fs.appendFileSync(path.join(cwd, oldPath), "local override\n");

  const result = runCli(["update"], { cwd, cliPath: packageFixture.cliPath });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /modified locally, preserving/);
  assert.equal(fs.existsSync(path.join(cwd, oldPath)), false);
  assert.equal(
    fs.readFileSync(path.join(cwd, newPath), "utf8"),
    "package v1\nlocal override\n"
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(cwd, ".codex-workflows-manifest.json"), "utf8")
  );
  assert.equal(manifest.files[newPath], sha256("package v2\n"));
  assert.equal(Object.hasOwn(manifest.files, oldPath), false);
});

test("maps project history paths to user-scoped installation paths", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const codexHome = makeTemporaryDirectory("codex-workflows-codex-home");
  const sourceOldPath = ".agents/skills/example/old.md";
  const sourceNewPath = ".agents/skills/example/new.md";
  const installedOldPath = "skills/example/old.md";
  const installedNewPath = "skills/example/new.md";
  const packageFixture = createPackageFixture({
    version: "2.0.0",
    files: { [sourceNewPath]: "package v2\n" },
    changes: [
      {
        version: "2.0.0",
        operations: [{ type: "move", from: sourceOldPath, to: sourceNewPath }],
      },
    ],
  });
  writeInstalledFixture({
    cwd: codexHome,
    version: "1.0.0",
    files: { [installedOldPath]: "package v1\n" },
  });
  const manifestPath = path.join(codexHome, ".codex-workflows-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.scope = "user";
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const result = runCli(["update", "--user"], {
    cwd,
    codexHome,
    cliPath: packageFixture.cliPath,
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(codexHome, installedOldPath)), false);
  assert.equal(
    fs.readFileSync(path.join(codexHome, installedNewPath), "utf8"),
    "package v2\n"
  );
});

test("removes retired managed files and automatically installs additions without touching unrelated files", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const deletedPath = ".codex/agents/retired.toml";
  const addedPath = ".codex/agents/new.toml";
  const unrelatedPath = ".codex/agents/personal.toml";
  const packageFixture = createPackageFixture({
    version: "2.0.0",
    files: { [addedPath]: "new agent\n" },
    changes: [
      {
        version: "2.0.0",
        operations: [{ type: "delete", path: deletedPath }],
      },
    ],
  });
  writeInstalledFixture({ cwd, version: "1.0.0", files: { [deletedPath]: "retired agent\n" } });
  fs.writeFileSync(path.join(cwd, unrelatedPath), "personal agent\n");

  const result = runCli(["update"], { cwd, cliPath: packageFixture.cliPath });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(cwd, deletedPath)), false);
  assert.equal(fs.readFileSync(path.join(cwd, addedPath), "utf8"), "new agent\n");
  assert.equal(fs.readFileSync(path.join(cwd, unrelatedPath), "utf8"), "personal agent\n");
});

test("reports a move destination conflict before changing installed files", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");
  const oldPath = ".agents/skills/example/old.md";
  const newPath = ".agents/skills/example/new.md";
  const packageFixture = createPackageFixture({
    version: "2.0.0",
    files: { [newPath]: "package v2\n" },
    changes: [
      { version: "2.0.0", operations: [{ type: "move", from: oldPath, to: newPath }] },
    ],
  });
  writeInstalledFixture({ cwd, version: "1.0.0", files: { [oldPath]: "package v1\n" } });
  fs.mkdirSync(path.dirname(path.join(cwd, newPath)), { recursive: true });
  fs.writeFileSync(path.join(cwd, newPath), "personal file\n");

  const result = runCli(["update"], { cwd, cliPath: packageFixture.cliPath });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /update conflict/i);
  assert.equal(fs.readFileSync(path.join(cwd, oldPath), "utf8"), "package v1\n");
  assert.equal(fs.readFileSync(path.join(cwd, newPath), "utf8"), "personal file\n");
});

test("rejects unsupported options instead of ignoring them", () => {
  const cwd = makeTemporaryDirectory("codex-workflows-project");

  const result = runCli(["install", "--global"], { cwd });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown option/i);
  assert.equal(fs.existsSync(path.join(cwd, ".agents")), false);
});
