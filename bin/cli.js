#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const MANIFEST_FILE = ".codex-workflows-manifest.json";
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

function updateManagedFile({ file, installedHashes, dryRun, preservedFiles }) {
  if (!fs.existsSync(file.destinationPath)) {
    if (dryRun) console.log(`  + ${file.manifestPath} (new)`);
    else {
      fs.mkdirSync(path.dirname(file.destinationPath), { recursive: true });
      fs.copyFileSync(file.sourcePath, file.destinationPath);
    }
    return "added";
  }

  const sourceContent = fs.readFileSync(file.sourcePath);
  const destinationContent = fs.readFileSync(file.destinationPath);
  if (sourceContent.equals(destinationContent)) return "skipped";

  const storedHash = installedHashes[file.manifestPath];
  if (storedHash && fileHash(file.destinationPath) !== storedHash) {
    console.log(`  ~ ${file.manifestPath} (modified locally, skipping)`);
    preservedFiles.add(file.manifestPath);
    return "preserved";
  }

  if (dryRun) console.log(`  * ${file.manifestPath} (updated)`);
  else fs.copyFileSync(file.sourcePath, file.destinationPath);
  return "updated";
}

function buildUpdatedHashes({ files, installedHashes, preservedFiles }) {
  return Object.fromEntries(files.map(file => {
    const storedHash = installedHashes[file.manifestPath];
    const hash = preservedFiles.has(file.manifestPath) && storedHash
      ? storedHash
      : fileHash(file.destinationPath);
    return [file.manifestPath, hash];
  }));
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
  const preservedFiles = new Set();
  const counts = { added: 0, updated: 0, skipped: 0, preserved: 0 };
  for (const file of files) {
    const result = updateManagedFile({ file, installedHashes, dryRun, preservedFiles });
    counts[result]++;
  }

  if (!dryRun) {
    const fileHashes = buildUpdatedHashes({ files, installedHashes, preservedFiles });
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
