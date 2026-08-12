#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const MANIFEST_FILE = ".codex-workflows-manifest.json";
const UPDATE_HISTORY_FILE = "bin/update-history.json";
const PRESERVED_DIRECTORY = ".codex-workflows-preserved";
const PROJECT_COPY_MAPPINGS = [
  { source: ".agents", destination: ".agents" },
  { source: ".codex", destination: ".codex" },
];
const USER_COPY_MAPPINGS = [
  { source: ".agents/skills", destination: "skills" },
  { source: ".codex/agents", destination: "agents" },
];
const COMMAND_OPTIONS = {
  install: new Set(["--user"]),
  update: new Set(["--dry-run", "--user"]),
  status: new Set(["--user"]),
  "--version": new Set(),
  "-v": new Set(),
  "--help": new Set(),
  "-h": new Set(),
};

class CliError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function parseCommand(argv) {
  const command = argv[2];
  const args = argv.slice(3);
  const allowedOptions = COMMAND_OPTIONS[command];

  if (allowedOptions) {
    const unknownOption = args.find(arg => !allowedOptions.has(arg));
    if (unknownOption) {
      throw new CliError(`Unknown option for '${command}': ${unknownOption}`);
    }
  }

  return {
    command,
    dryRun: args.includes("--dry-run"),
    scope: args.includes("--user") ? "user" : "project",
  };
}

function resolveCodexHome() {
  const configuredHome = process.env.CODEX_HOME;
  if (!configuredHome) return path.join(os.homedir(), ".codex");
  if (!path.isAbsolute(configuredHome)) {
    throw new CliError("CODEX_HOME must be an absolute path.");
  }
  return configuredHome;
}

function createInstallation({ scope, cwd, sourceDir }) {
  const targetDir = scope === "user" ? resolveCodexHome() : cwd;
  return {
    copyMappings: scope === "user" ? USER_COPY_MAPPINGS : PROJECT_COPY_MAPPINGS,
    manifestPath: path.join(targetDir, MANIFEST_FILE),
    scope,
    sourceDir,
    targetDir,
  };
}

function getVersion(sourceDir) {
  try {
    const packagePath = path.join(sourceDir, "package.json");
    return JSON.parse(fs.readFileSync(packagePath, "utf8")).version;
  } catch (error) {
    throw new CliError(`Error reading package.json: ${error.message}`, 2);
  }
}

function fileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function compareVersions(left, right) {
  const parse = version => {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
    if (!match) throw new CliError(`Invalid version in update metadata: ${version}`, 2);
    return match.slice(1).map(Number);
  };
  const leftParts = parse(left);
  const rightParts = parse(right);
  for (let index = 0; index < leftParts.length; index++) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] - rightParts[index];
    }
  }
  return 0;
}

function assertSafeRelativePath(relativePath, label) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    path.posix.isAbsolute(relativePath) ||
    path.posix.normalize(relativePath) !== relativePath ||
    relativePath === ".." ||
    relativePath.startsWith("../")
  ) {
    throw new CliError(`Invalid ${label} path in update history: ${relativePath}`, 2);
  }
}

function readUpdateHistory(sourceDir, installedVersion, targetVersion) {
  if (compareVersions(installedVersion, targetVersion) > 0) {
    throw new CliError(
      `Installed version v${installedVersion} is newer than package version v${targetVersion}.`
    );
  }

  const historyPath = path.join(sourceDir, UPDATE_HISTORY_FILE);
  if (!fs.existsSync(historyPath)) return [];

  let history;
  try {
    history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
  } catch (error) {
    throw new CliError(`Error reading ${UPDATE_HISTORY_FILE}: ${error.message}`, 2);
  }
  if (!history || !Array.isArray(history.changes)) {
    throw new CliError(`${UPDATE_HISTORY_FILE} must contain a changes array.`, 2);
  }

  const versions = new Set();
  for (const change of history.changes) {
    compareVersions(change.version, change.version);
    if (versions.has(change.version)) {
      throw new CliError(`Duplicate update history version: ${change.version}`, 2);
    }
    versions.add(change.version);
    if (!Array.isArray(change.operations)) {
      throw new CliError(`Update history ${change.version}.operations must be an array.`, 2);
    }
    for (const operation of change.operations) {
      if (!operation || typeof operation !== "object") {
        throw new CliError(
          `Update history ${change.version}.operations contains an invalid entry.`,
          2
        );
      }
      if (operation.type === "delete") {
        assertSafeRelativePath(operation.path, "delete");
      } else if (operation.type === "move") {
        assertSafeRelativePath(operation.from, "move source");
        assertSafeRelativePath(operation.to, "move destination");
      } else {
        throw new CliError(
          `Unknown update operation in ${change.version}: ${operation.type}`,
          2
        );
      }
    }
  }

  return history.changes
    .filter(change => (
      compareVersions(change.version, installedVersion) > 0 &&
      compareVersions(change.version, targetVersion) <= 0
    ))
    .sort((left, right) => compareVersions(left.version, right.version));
}

function copyDirRecursive(source, destination) {
  let copied = 0;
  if (!fs.existsSync(source)) return copied;
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copied += copyDirRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
      copied++;
    }
  }
  return copied;
}

function collectRelativeFiles(directory, base = "") {
  const files = [];
  if (!fs.existsSync(directory)) return files;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectRelativeFiles(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

function collectManagedFiles(installation) {
  const files = [];
  for (const mapping of installation.copyMappings) {
    const sourceRoot = path.join(installation.sourceDir, mapping.source);
    for (const relativePath of collectRelativeFiles(sourceRoot)) {
      files.push({
        destinationPath: path.join(
          installation.targetDir,
          mapping.destination,
          relativePath
        ),
        manifestPath: path.join(mapping.destination, relativePath),
        sourcePath: path.join(sourceRoot, relativePath),
      });
    }
  }
  return files;
}

function readManifest(installation) {
  if (!fs.existsSync(installation.manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(installation.manifestPath, "utf8"));
  } catch (error) {
    throw new CliError(
      `Error: ${MANIFEST_FILE} is corrupt: ${error.message}\n` +
      "Delete the file and run 'install' again, or fix it manually.",
      2
    );
  }
}

function writeManifest({ installation, fileHashes, version }) {
  const manifest = {
    version,
    installedAt: new Date().toISOString(),
    scope: installation.scope,
    files: fileHashes,
  };
  fs.mkdirSync(installation.targetDir, { recursive: true });
  fs.writeFileSync(
    installation.manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

function assertNoUserConflicts(scope, files) {
  if (scope !== "user") return;
  const conflicts = files.filter(file => {
    if (!fs.existsSync(file.destinationPath)) return false;
    return !fs.readFileSync(file.sourcePath).equals(
      fs.readFileSync(file.destinationPath)
    );
  });
  if (conflicts.length === 0) return;

  const conflictList = conflicts.map(file => `  ${file.manifestPath}`).join("\n");
  throw new CliError(
    `Install conflict: existing user files would be overwritten:\n${conflictList}\n` +
    "Move or remove the conflicting files, then run install again."
  );
}

function install(installation) {
  const existingManifest = readManifest(installation);
  if (existingManifest) {
    throw new CliError(
      `codex-workflows v${existingManifest.version} is already installed. ` +
      "Use 'update' to upgrade."
    );
  }

  const version = getVersion(installation.sourceDir);
  const files = collectManagedFiles(installation);
  assertNoUserConflicts(installation.scope, files);
  console.log(`Installing codex-workflows v${version} (${installation.scope})...\n`);

  let totalCopied = 0;
  for (const mapping of installation.copyMappings) {
    const source = path.join(installation.sourceDir, mapping.source);
    const destination = path.join(installation.targetDir, mapping.destination);
    const copied = copyDirRecursive(source, destination);
    totalCopied += copied;
    if (copied > 0) console.log(`  ${mapping.destination}/ — ${copied} files`);
  }

  const fileHashes = Object.fromEntries(
    files.map(file => [file.manifestPath, fileHash(file.destinationPath)])
  );
  writeManifest({ installation, fileHashes, version });
  console.log(`\nDone. ${totalCopied} files installed.`);
}

function resolveHistoryPath(installation, sourcePath) {
  for (const mapping of installation.copyMappings) {
    const mappingSource = mapping.source.split(path.sep).join("/");
    if (sourcePath !== mappingSource && !sourcePath.startsWith(`${mappingSource}/`)) {
      continue;
    }
    const relativePath = sourcePath.slice(mappingSource.length).replace(/^\//, "");
    const manifestPath = path.join(mapping.destination, ...relativePath.split("/"));
    return {
      destinationPath: path.join(installation.targetDir, manifestPath),
      manifestPath,
    };
  }
  return null;
}

function assertManagedManifestPath(installation, manifestPath) {
  if (typeof manifestPath !== "string" || manifestPath.length === 0) {
    throw new CliError(`Invalid managed path in ${MANIFEST_FILE}: ${manifestPath}`, 2);
  }
  const normalizedPath = path.normalize(manifestPath);
  const managedRoots = installation.copyMappings.map(mapping => mapping.destination);
  const managed = managedRoots.some(root => (
    normalizedPath === root || normalizedPath.startsWith(`${root}${path.sep}`)
  ));
  if (
    path.isAbsolute(manifestPath) ||
    normalizedPath !== manifestPath ||
    normalizedPath === ".." ||
    normalizedPath.startsWith(`..${path.sep}`) ||
    !managed
  ) {
    throw new CliError(`Invalid managed path in ${MANIFEST_FILE}: ${manifestPath}`, 2);
  }
}

function readInstalledState(installation, installedHashes) {
  return new Map(Object.entries(installedHashes).map(([manifestPath, baselineHash]) => {
    assertManagedManifestPath(installation, manifestPath);
    const destinationPath = path.join(installation.targetDir, manifestPath);
    const exists = fs.existsSync(destinationPath);
    return [manifestPath, {
      baselineHash,
      currentHash: exists ? fileHash(destinationPath) : null,
      destinationPath,
      exists,
    }];
  }));
}

function preservedPath(installation, version, manifestPath) {
  return path.join(
    installation.targetDir,
    PRESERVED_DIRECTORY,
    version,
    manifestPath
  );
}

function addRetirementAction({ actions, entry, installation, manifestPath, version }) {
  if (!entry.exists) return;
  const modified = entry.baselineHash && entry.currentHash !== entry.baselineHash;
  if (modified) {
    const backupPath = preservedPath(installation, version, manifestPath);
    if (fs.existsSync(backupPath)) {
      throw new CliError(
        `Update conflict: preservation path already exists:\n  ${backupPath}`
      );
    }
    actions.push({
      backupPath,
      destinationPath: entry.destinationPath,
      manifestPath,
      type: "preserve-retired",
    });
    return;
  }
  actions.push({
    destinationPath: entry.destinationPath,
    manifestPath,
    type: "remove",
  });
}

function addUntrackedRetirementAction({ actions, installation, manifestPath, version }) {
  const destinationPath = path.join(installation.targetDir, manifestPath);
  if (!fs.existsSync(destinationPath)) return;
  const backupPath = preservedPath(installation, version, manifestPath);
  if (fs.existsSync(backupPath)) {
    throw new CliError(
      `Update conflict: preservation path already exists:\n  ${backupPath}`
    );
  }
  actions.push({
    backupPath,
    destinationPath,
    manifestPath,
    type: "preserve-retired",
  });
}

function planUpdate({ installation, installedHashes, version, files, changes }) {
  const actions = [];
  const state = readInstalledState(installation, installedHashes);
  const vacatedPaths = new Set();

  for (const change of changes) {
    for (const operation of change.operations) {
      if (operation.type === "delete") {
        const deleted = resolveHistoryPath(installation, operation.path);
        if (!deleted) continue;
        const entry = state.get(deleted.manifestPath);
        if (entry) {
          addRetirementAction({
            actions,
            entry,
            installation,
            manifestPath: deleted.manifestPath,
            version,
          });
          state.delete(deleted.manifestPath);
        } else {
          addUntrackedRetirementAction({
            actions,
            installation,
            manifestPath: deleted.manifestPath,
            version,
          });
        }
        vacatedPaths.add(deleted.destinationPath);
        continue;
      }

      const source = resolveHistoryPath(installation, operation.from);
      const destination = resolveHistoryPath(installation, operation.to);
      if (!source && !destination) continue;

      if (source && !destination) {
        const entry = state.get(source.manifestPath);
        if (entry) {
          addRetirementAction({
            actions,
            entry,
            installation,
            manifestPath: source.manifestPath,
            version,
          });
          state.delete(source.manifestPath);
        } else {
          addUntrackedRetirementAction({
            actions,
            installation,
            manifestPath: source.manifestPath,
            version,
          });
        }
        vacatedPaths.add(source.destinationPath);
        continue;
      }
      if (!source) continue;

      const entry = state.get(source.manifestPath);
      if (!entry) {
        addUntrackedRetirementAction({
          actions,
          installation,
          manifestPath: source.manifestPath,
          version,
        });
        vacatedPaths.add(source.destinationPath);
        continue;
      }
      if (state.has(destination.manifestPath)) {
        throw new CliError(
          `Update conflict: move destination is already managed:\n  ${destination.manifestPath}`
        );
      }
      if (fs.existsSync(destination.destinationPath) && !vacatedPaths.has(destination.destinationPath)) {
        throw new CliError(
          `Update conflict: move destination already exists:\n  ${destination.manifestPath}`
        );
      }

      actions.push({
        from: entry.destinationPath,
        fromManifestPath: source.manifestPath,
        to: destination.destinationPath,
        toManifestPath: destination.manifestPath,
        type: "move",
      });
      state.delete(source.manifestPath);
      state.set(destination.manifestPath, {
        ...entry,
        destinationPath: destination.destinationPath,
      });
      vacatedPaths.add(source.destinationPath);
    }
  }

  const currentPaths = new Set(files.map(file => file.manifestPath));
  for (const [manifestPath, entry] of state) {
    if (currentPaths.has(manifestPath)) continue;
    addRetirementAction({ actions, entry, installation, manifestPath, version });
    state.delete(manifestPath);
    vacatedPaths.add(entry.destinationPath);
  }

  for (const file of files) {
    const sourceHash = fileHash(file.sourcePath);
    const entry = state.get(file.manifestPath);
    if (entry) {
      if (!entry.exists) {
        actions.push({ ...file, type: "add" });
      } else if (entry.currentHash === sourceHash) {
        actions.push({ ...file, type: "skip" });
      } else if (entry.baselineHash && entry.currentHash !== entry.baselineHash) {
        actions.push({ ...file, type: "preserve" });
      } else {
        actions.push({ ...file, type: "update" });
      }
      continue;
    }

    const destinationExists = (
      fs.existsSync(file.destinationPath) && !vacatedPaths.has(file.destinationPath)
    );
    if (!destinationExists) {
      actions.push({ ...file, type: "add" });
    } else if (fileHash(file.destinationPath) === sourceHash) {
      actions.push({ ...file, type: "skip" });
    } else {
      throw new CliError(
        `Update conflict: new managed path already contains a different file:\n  ${file.manifestPath}`
      );
    }
  }

  return actions;
}

function executeUpdateActions(actions, dryRun) {
  const counts = {
    added: 0,
    moved: 0,
    preserved: 0,
    removed: 0,
    skipped: 0,
    updated: 0,
  };

  for (const action of actions) {
    switch (action.type) {
      case "move":
        console.log(`  > ${action.fromManifestPath} -> ${action.toManifestPath} (moved)`);
        if (!dryRun && fs.existsSync(action.from)) {
          fs.mkdirSync(path.dirname(action.to), { recursive: true });
          fs.renameSync(action.from, action.to);
        }
        counts.moved++;
        break;
      case "remove":
        console.log(`  - ${action.manifestPath} (removed)`);
        if (!dryRun && fs.existsSync(action.destinationPath)) {
          fs.unlinkSync(action.destinationPath);
        }
        counts.removed++;
        break;
      case "preserve-retired":
        console.log(
          `  ~ ${action.manifestPath} (modified locally, preserved at ${action.backupPath})`
        );
        if (!dryRun) {
          fs.mkdirSync(path.dirname(action.backupPath), { recursive: true });
          fs.renameSync(action.destinationPath, action.backupPath);
        }
        counts.preserved++;
        break;
      case "add":
        console.log(`  + ${action.manifestPath} (new)`);
        if (!dryRun) {
          fs.mkdirSync(path.dirname(action.destinationPath), { recursive: true });
          fs.copyFileSync(action.sourcePath, action.destinationPath);
        }
        counts.added++;
        break;
      case "update":
        console.log(`  * ${action.manifestPath} (updated)`);
        if (!dryRun) fs.copyFileSync(action.sourcePath, action.destinationPath);
        counts.updated++;
        break;
      case "preserve":
        console.log(`  ~ ${action.manifestPath} (modified locally, preserving)`);
        counts.preserved++;
        break;
      case "skip":
        counts.skipped++;
        break;
    }
  }
  return counts;
}

function update(installation, dryRun) {
  const manifest = readManifest(installation);
  if (!manifest) throw new CliError("codex-workflows is not installed. Run 'install' first.");

  const installedHashes = Array.isArray(manifest.files)
    ? Object.fromEntries(manifest.files.map(file => [file, null]))
    : manifest.files;
  const version = getVersion(installation.sourceDir);
  const prefix = dryRun ? "[DRY RUN] " : "";
  console.log(`${prefix}Updating codex-workflows v${manifest.version} → v${version}\n`);

  const files = collectManagedFiles(installation);
  const changes = readUpdateHistory(installation.sourceDir, manifest.version, version);
  const actions = planUpdate({ installation, installedHashes, version, files, changes });
  const counts = executeUpdateActions(actions, dryRun);

  if (!dryRun) {
    const fileHashes = Object.fromEntries(
      files.map(file => [file.manifestPath, fileHash(file.sourcePath)])
    );
    writeManifest({ installation, fileHashes, version });
  }
  printUpdateSummary(counts, dryRun);
}

function printUpdateSummary(counts, dryRun) {
  const parts = [
    `${counts.added} added`,
    `${counts.updated} updated`,
    `${counts.skipped} unchanged`,
  ];
  if (counts.moved > 0) parts.push(`${counts.moved} moved`);
  if (counts.removed > 0) parts.push(`${counts.removed} removed`);
  if (counts.preserved > 0) {
    parts.push(`${counts.preserved} preserved (local changes)`);
  }
  console.log(`\n${dryRun ? "[DRY RUN] " : ""}${parts.join(", ")}.`);
}

function status(installation) {
  const manifest = readManifest(installation);
  if (!manifest) {
    console.log("codex-workflows is not installed.");
    return;
  }
  const fileCount = Array.isArray(manifest.files)
    ? manifest.files.length
    : Object.keys(manifest.files).length;
  console.log(`Version:   ${manifest.version}`);
  console.log(`Installed: ${manifest.installedAt}`);
  console.log(`Scope:     ${manifest.scope ?? installation.scope}`);
  console.log(`Files:     ${fileCount} managed`);
}

function showHelp() {
  console.log(`
codex-workflows — Agentic coding skills & subagents for Codex CLI

Usage:
  npx codex-workflows install [--user]             Install skills and agents
  npx codex-workflows update [--user]              Update managed files
  npx codex-workflows update [--user] --dry-run    Preview changes without applying
  npx codex-workflows status [--user]              Show installation info
  npx codex-workflows --version                    Show version
  npx codex-workflows --help                       Show this help

Scopes:
  default   Install into the current project
  --user    Install into CODEX_HOME (defaults to ~/.codex)
`);
}

function run({ command, dryRun, installation }) {
  switch (command) {
    case "install": install(installation); break;
    case "update": update(installation, dryRun); break;
    case "status": status(installation); break;
    case "--version": case "-v": console.log(getVersion(installation.sourceDir)); break;
    case "--help": case "-h": case undefined: showHelp(); break;
    default:
      showHelp();
      throw new CliError(`Unknown command: ${command}`);
  }
}

function main(argv = process.argv, cwd = process.cwd()) {
  try {
    const parsed = parseCommand(argv);
    const installation = createInstallation({
      scope: parsed.scope,
      cwd,
      sourceDir: path.resolve(__dirname, ".."),
    });
    run({ ...parsed, installation });
  } catch (error) {
    console.error(error.message);
    process.exitCode = error.exitCode ?? 2;
  }
}

if (require.main === module) main();

module.exports = { main };
