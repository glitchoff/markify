import fs from "node:fs";
import path from "node:path";
import {
  findProjectRoot,
  resolveTarget,
  readRegistry,
  copyFiles,
  installDeps,
  hasDependency,
  registryDir,
} from "./lib";

/**
 * `markify init`
 *
 * Copies the entire markify scaffold (config + tokens + comps) into the
 * project and installs the required dependencies. shadcn/ui compatible:
 * if a components.json exists, its components alias decides where the
 * scaffold lands.
 */
export async function init(dirOverride?: string): Promise<void> {
  const root = findProjectRoot(process.cwd());
  const registryPath = registryDir();
  const registry = readRegistry();

  const { targetDir, importPrefix, packageManager } = resolveTarget(root, dirOverride);

  console.log(`\nmarkify init`);
  console.log(`  target : ${path.relative(root, targetDir) || targetDir}`);
  console.log(`  import : ${importPrefix}/config`);
  console.log(`  shadcn : ${fs.existsSync(path.join(root, "components.json")) ? "detected ✓" : "not found (using defaults)"}`);

  /* Copy the full scaffold. */
  const written = copyFiles(registryPath, registry.files, targetDir);
  console.log(`\nCopied ${written.length} files:`);
  for (const file of written) {
    console.log(`  + ${path.relative(root, file)}`);
  }

  /* Point config.ts at the right import prefix. */
  const configPath = path.join(targetDir, "config.tsx");
  if (fs.existsSync(configPath)) {
    let config = fs.readFileSync(configPath, "utf8");
    config = config.replace(/\(from "\.\/comps/g, `(from "./comps`);
    fs.writeFileSync(configPath, config);
  }

  /* Install dependencies (skip ones already present). */
  const deps: string[] = registry.install.dependencies;
  const missing = deps.filter((d) => !hasDependency(root, d));
  if (missing.length > 0) {
    if (packageManager) {
      installDeps(root, packageManager, missing);
    } else {
      console.log(`\n⚠  Could not detect a package manager. Install these manually:\n   ${missing.join(" ")}`);
    }
  } else {
    console.log(`\nAll dependencies already installed.`);
  }

  /* Environment checks. */
  const pkgPath = path.join(root, "package.json");
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, "utf8")) : {};
  const depsAll = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!depsAll.react) console.warn(`\n⚠  React was not found in package.json — Markify requires React 18/19.`);
  if (!fs.existsSync(path.join(root, "tailwind.config.js")) &&
      !fs.existsSync(path.join(root, "tailwind.config.ts")) &&
      !hasTailwindV4(pkg)) {
    console.warn(`\n⚠  Tailwind CSS was not detected — Markify components are styled with Tailwind + shadcn tokens.`);
  }

  console.log(`\nDone! Use it like this:\n`);
  console.log(`  import { Markify } from "${importPrefix}/config";`);
  console.log(`\n  <Markify>{markdown}</Markify>`);
  console.log(`\nCustomize anything in ${path.relative(root, targetDir)} — it's all yours.`);
}

function hasTailwindV4(pkg: Record<string, any>): boolean {
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  const tw = all.tailwindcss ?? "";
  /* v4 needs no config file. */
  return typeof tw === "string" && tw.startsWith("4");
}
