#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MANIFEST_FILE = ".codex-workflows-manifest.json";
const COPY_DIRS = [".agents", ".codex"];

function main(argv = process.argv, cwd = process.cwd()) {
  const command = argv[2];
  const targetDir = cwd;
  const sourceDir = path.resolve(__dirname, "..");

  function getVersion() {
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(sourceDir, "package.json"), "utf8")
      );
      return pkg.version;
    } catch (e) {
      console.error(`Error reading package.json: ${e.message}`);
      process.exit(2);
    }
  }

  function fileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  function copyDirRecursive(src, dest) {
    let copied = 0;
    if (!fs.existsSync(src)) return copied;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copied += copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }
    return copied;
  }

  function collectFiles(dir, base) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(base, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectFiles(fullPath, relPath));
      } else {
        files.push(relPath);
      }
    }
    return files;
  }

  function readManifest() {
    const manifestPath = path.join(targetDir, MANIFEST_FILE);
    if (!fs.existsSync(manifestPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (e) {
      console.error(`Error: ${MANIFEST_FILE} is corrupt: ${e.message}`);
      console.error("Delete the file and run 'install' again, or fix it manually.");
      process.exit(2);
    }
  }

  function writeManifest(fileHashes) {
    const manifestPath = path.join(targetDir, MANIFEST_FILE);
    const manifest = {
      version: getVersion(),
      installedAt: new Date().toISOString(),
      files: fileHashes,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  }

  function install() {
    const manifest = readManifest();
    if (manifest) {
      console.log(
        `codex-workflows v${manifest.version} is already installed. Use 'update' to upgrade.`
      );
      process.exit(1);
    }

    const version = getVersion();
    console.log(`Installing codex-workflows v${version}...\n`);

    const fileHashes = {};
    let totalCopied = 0;

    for (const dir of COPY_DIRS) {
      const src = path.join(sourceDir, dir);
      const dest = path.join(targetDir, dir);
      const copied = copyDirRecursive(src, dest);
      totalCopied += copied;
      for (const relPath of collectFiles(dest, dir)) {
        fileHashes[relPath] = fileHash(path.join(targetDir, relPath));
      }
      if (copied > 0) console.log(`  ${dir}/ — ${copied} files`);
    }

    writeManifest(fileHashes);
    console.log(`\nDone. ${totalCopied} files installed.`);
  }

  function update(dryRun) {
    const manifest = readManifest();
    if (!manifest) {
      console.log("codex-workflows is not installed. Run 'install' first.");
      process.exit(1);
    }

    // Migrate old manifest format (array) to new format (hash map)
    const installedHashes = Array.isArray(manifest.files)
      ? Object.fromEntries(manifest.files.map(f => [f, null]))
      : manifest.files;

    const currentVersion = manifest.version;
    const newVersion = getVersion();
    console.log(
      `${dryRun ? "[DRY RUN] " : ""}Updating codex-workflows v${currentVersion} → v${newVersion}\n`
    );

    let updated = 0;
    let added = 0;
    let skipped = 0;
    let preserved = 0;
    const preservedFiles = new Set();

    for (const dir of COPY_DIRS) {
      const src = path.join(sourceDir, dir);
      if (!fs.existsSync(src)) continue;
      const sourceFiles = collectFiles(src, dir);
      for (const relPath of sourceFiles) {
        const srcFile = path.join(sourceDir, relPath);
        const destFile = path.join(targetDir, relPath);

        // New file — always add
        if (!fs.existsSync(destFile)) {
          if (dryRun) console.log(`  + ${relPath} (new)`);
          else {
            fs.mkdirSync(path.dirname(destFile), { recursive: true });
            fs.copyFileSync(srcFile, destFile);
          }
          added++;
          continue;
        }

        const srcContent = fs.readFileSync(srcFile);
        const destContent = fs.readFileSync(destFile);

        // Identical — skip
        if (srcContent.equals(destContent)) { skipped++; continue; }

        // Check if user modified the file since last install/update
        const storedHash = installedHashes[relPath];
        if (storedHash) {
          const currentHash = crypto.createHash("sha256").update(destContent).digest("hex");
          if (currentHash !== storedHash) {
            // User modified this file — preserve their changes
            console.log(`  ~ ${relPath} (modified locally, skipping)`);
            preservedFiles.add(relPath);
            preserved++;
            continue;
          }
        }

        // File unchanged by user (or not previously tracked) — safe to update
        if (dryRun) console.log(`  * ${relPath} (updated)`);
        else fs.copyFileSync(srcFile, destFile);
        updated++;
      }
    }

    if (!dryRun) {
      const newHashes = {};
      for (const dir of COPY_DIRS) {
        for (const relPath of collectFiles(path.join(targetDir, dir), dir)) {
          if (preservedFiles.has(relPath) && installedHashes[relPath]) {
            // Keep original hash so preserved files stay protected on next update
            newHashes[relPath] = installedHashes[relPath];
          } else {
            newHashes[relPath] = fileHash(path.join(targetDir, relPath));
          }
        }
      }
      writeManifest(newHashes);
    }

    const parts = [`${added} added`, `${updated} updated`, `${skipped} unchanged`];
    if (preserved > 0) parts.push(`${preserved} preserved (local changes)`);
    console.log(`\n${dryRun ? "[DRY RUN] " : ""}${parts.join(", ")}.`);
  }

  function status() {
    const manifest = readManifest();
    if (!manifest) {
      console.log("codex-workflows is not installed.");
      return;
    }
    const fileCount = Array.isArray(manifest.files)
      ? manifest.files.length
      : Object.keys(manifest.files).length;
    console.log(`Version:   ${manifest.version}`);
    console.log(`Installed: ${manifest.installedAt}`);
    console.log(`Files:     ${fileCount} managed`);
  }

  function showHelp() {
    console.log(`
codex-workflows — Agentic coding skills & subagents for Codex CLI

Usage:
  npx codex-workflows install              Install skills and agents
  npx codex-workflows update               Update managed files
  npx codex-workflows update --dry-run     Preview changes without applying
  npx codex-workflows status               Show installation info
  npx codex-workflows --version            Show version
  npx codex-workflows --help               Show this help
`);
  }

  switch (command) {
    case "install": install(); break;
    case "update": update(argv.includes("--dry-run")); break;
    case "status": status(); break;
    case "--version": case "-v": console.log(getVersion()); break;
    case "--help": case "-h": case undefined: showHelp(); break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main();
module.exports = { main };
