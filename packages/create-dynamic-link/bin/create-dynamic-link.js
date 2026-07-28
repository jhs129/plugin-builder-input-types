#!/usr/bin/env node

// Scaffolds the DynamicLink component and its /dynamiclink redirect route
// directly into the consumer's Next.js App Router project (shadcn-style copy,
// not an npm runtime dependency). Safe to re-run: existing files are left
// alone unless --force is passed.

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

function parseArgs(argv) {
  const args = { force: false, appDir: null, componentsDir: null, help: false };
  for (const arg of argv) {
    if (arg === "--force" || arg === "-f") args.force = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg.startsWith("--app-dir=")) args.appDir = arg.slice("--app-dir=".length);
    else if (arg.startsWith("--components-dir=")) args.componentsDir = arg.slice("--components-dir=".length);
  }
  return args;
}

function printHelp() {
  console.log(`
create-dynamic-link — scaffold the Builder.io DynamicLink component + redirect route

Usage:
  npx @jhsdc/create-dynamic-link [options]

Options:
  --app-dir=<path>          Next.js App Router directory (default: auto-detected "app" or "src/app")
  --components-dir=<path>  Where to write the DynamicLink component (default: "components/DynamicLink"
                            or "src/components/DynamicLink" if a "src" directory exists)
  --force, -f               Overwrite files that already exist
  --help, -h                Show this help
`);
}

function detectAppDir(cwd, override) {
  if (override) return path.resolve(cwd, override);
  const candidates = ["src/app", "app"];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(cwd, candidate))) return path.join(cwd, candidate);
  }
  return null;
}

function detectComponentsDir(cwd, override) {
  if (override) return path.resolve(cwd, override);
  if (fs.existsSync(path.join(cwd, "src"))) return path.join(cwd, "src", "components", "DynamicLink");
  return path.join(cwd, "components", "DynamicLink");
}

function copyFile(src, dest, force, results) {
  const exists = fs.existsSync(dest);
  if (exists && !force) {
    results.skipped.push(dest);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  results[exists ? "overwritten" : "written"].push(dest);
}

function copyDir(srcDir, destDir, force, results) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath, force, results);
    else copyFile(srcPath, destPath, force, results);
  }
}

function relative(p) {
  return path.relative(process.cwd(), p) || ".";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const cwd = process.cwd();
  const results = { written: [], overwritten: [], skipped: [] };

  const appDir = detectAppDir(cwd, args.appDir);
  if (!appDir) {
    console.error(
      'Could not find an "app" or "src/app" directory. Pass --app-dir=<path> to point at your Next.js App Router directory.'
    );
    process.exitCode = 1;
    return;
  }

  const componentsDir = detectComponentsDir(cwd, args.componentsDir);
  const routeDestDir = path.join(appDir, "dynamiclink");
  const routeSrcDir = path.join(TEMPLATES_DIR, "app", "dynamiclink");

  copyDir(path.join(TEMPLATES_DIR, "components", "DynamicLink"), componentsDir, args.force, results);
  copyDir(routeSrcDir, routeDestDir, args.force, results);

  console.log(`\nDynamicLink component -> ${relative(componentsDir)}`);
  console.log(`Redirect route        -> ${relative(routeDestDir)}\n`);

  for (const file of results.written) console.log(`  created     ${relative(file)}`);
  for (const file of results.overwritten) console.log(`  overwritten ${relative(file)}`);
  for (const file of results.skipped) console.log(`  skipped     ${relative(file)} (already exists, use --force to overwrite)`);

  console.log(`
Next steps:
  1. Make sure these peer packages are installed: react, react-dom, next, @builder.io/sdk-react
  2. Set NEXT_PUBLIC_BUILDER_API_KEY in your environment — the redirect route uses it to query the Content API.
  3. Register the component in Builder.io: import { registration } from "${path.posix.join(
    path.relative(cwd, componentsDir).split(path.sep).join("/"),
    "DynamicLink.builder.registration"
  )}" and pass its entries to builder.registerComponent / your Gen2 registration list.
  4. Open ${relative(path.join(routeDestDir, "[model]", "[type]", "[id]", "route.ts"))} and add an entry to
     MODEL_CONFIG for every content model DynamicLink should be able to deep-link to.
`);
}

main();
