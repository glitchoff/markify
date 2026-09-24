import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const cliDistDir = path.dirname(__filename);

export interface ShadcnConfig {
  aliases?: Record<string, string>;
}

export interface TargetInfo {
  /** Absolute directory the markify scaffold is written to. */
  targetDir: string;
  /** Import alias prefix for the scaffold (e.g. "@/components/markify"). */
  importPrefix: string;
  /** Package manager detected for the project. */
  packageManager: "npm" | "pnpm" | "yarn" | "bun" | null;
}

export function findUp(startDir: string, filename: string): string | null {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, filename);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Locate the project root (nearest dir containing package.json). */
export function findProjectRoot(startDir: string): string {
  const pkg = findUp(startDir, "package.json");
  return pkg ? path.dirname(pkg) : startDir;
}

function readJsonFile(filePath: string): any | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function parseTsConfig(root: string): any | null {
  for (const configName of ["tsconfig.json", "jsconfig.json"]) {
    const configPath = path.join(root, configName);
    if (!fs.existsSync(configPath)) continue;
    /* tsconfig allows comments — strip them for JSON.parse. */
    const raw = fs.readFileSync(configPath, "utf8").replace(/^\s*\/\/.*$/gm, "");
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "markify-"));
    const tmpFile = path.join(tmpDir, "tsconfig.json");
    fs.writeFileSync(tmpFile, raw);
    const parsed = readJsonFile(tmpFile);
    if (parsed) return parsed;
  }
  return null;
}

/**
 * Resolve a path alias like "@/components" to a filesystem path using
 * tsconfig/jsconfig baseUrl + paths.
 */
export function resolveAliasToPath(root: string, alias: string): string | null {
  const config = parseTsConfig(root);
  if (!config) return null;

  const compilerOptions = config.compilerOptions ?? {};
  const baseUrl = compilerOptions.baseUrl ?? ".";
  const paths: Record<string, string[]> = compilerOptions.paths ?? {};

  const bare = alias.replace(/\/\*$/, "");
  if (paths[bare]?.length) {
    return path.resolve(root, baseUrl, paths[bare][0].replace(/\/\*$/, ""));
  }
  if (paths[`${bare}/*`]?.length) {
    return path.resolve(root, baseUrl, paths[`${bare}/*`][0].replace(/\/\*$/, ""));
  }
  /* No explicit mapping: assume the alias root is baseUrl. */
  return path.resolve(root, baseUrl, bare.replace(/^@\/?/, ""));
}

export function detectPackageManager(root: string): TargetInfo["packageManager"] {
  if (fs.existsSync(path.join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(root, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(root, "bun.lockb")) || fs.existsSync(path.join(root, "bun.lock"))) return "bun";
  if (fs.existsSync(path.join(root, "package-lock.json"))) return "npm";
  return null;
}

/**
 * Determine where the markify scaffold should be written:
 * 1. `--dir <path>` CLI override
 * 2. shadcn components.json → aliases.components
 * 3. default: <root>/components/markify
 */
export function resolveTarget(root: string, dirOverride?: string): TargetInfo {
  const shadcnPath = findUp(root, "components.json");
  const shadcn = shadcnPath ? (readJsonFile(shadcnPath) as ShadcnConfig | null) : null;
  const componentsAlias: string | undefined = shadcn?.aliases?.components;

  let baseDir: string | null = null;
  let importPrefix = "@/components/markify";

  if (componentsAlias) {
    const resolved = resolveAliasToPath(root, componentsAlias);
    if (resolved) {
      baseDir = resolved;
      importPrefix = `${componentsAlias.replace(/\/$/, "")}/markify`;
    }
  }

  if (dirOverride) {
    baseDir = path.resolve(root, dirOverride);
    const atAlias = resolveAliasToPath(root, "@");
    const srcDir = path.join(root, "src");
    const aliasRoot = atAlias && fs.existsSync(atAlias) ? atAlias : fs.existsSync(srcDir) ? srcDir : root;
    const rel = path.relative(aliasRoot, baseDir).split(path.sep).filter(Boolean).join("/");
    importPrefix = rel.startsWith("..") ? path.relative(root, baseDir).split(path.sep).join("/") : `@/${rel}`;
  }

  const targetDir = baseDir ? path.join(baseDir, "markify") : path.join(root, "components", "markify");
  return { targetDir, importPrefix, packageManager: detectPackageManager(root) };
}

/** Path of the bundled registry directory inside the installed package. */
export function registryDir(): string {
  /* The CLI is bundled to dist/cli.js; registry ships alongside the package root. */
  const candidates = [
    path.resolve(cliDistDir, "..", "registry"),
    path.resolve(process.cwd(), "node_modules", "@glitchoff", "markify", "registry"),
    path.resolve(process.cwd(), "registry"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "registry.json"))) return c;
  }
  throw new Error("Could not locate the markify registry. Is @glitchoff/markify installed?");
}

export function readRegistry(): any {
  const dir = registryDir();
  return JSON.parse(fs.readFileSync(path.join(dir, "registry.json"), "utf8"));
}

export function copyFiles(registryPath: string, files: string[], targetDir: string): string[] {
  const written: string[] = [];
  for (const file of files) {
    const src = path.join(registryPath, file);
    if (!fs.existsSync(src)) throw new Error(`Registry file missing: ${file}`);
    const dest = path.join(targetDir, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    written.push(dest);
  }
  return written;
}

export function installDeps(root: string, pm: TargetInfo["packageManager"], deps: string[], dev = false): void {
  if (!pm || deps.length === 0) return;
  const flag = dev ? " -D" : "";
  const cmd = pm === "npm" ? `npm install${dev ? " --save-dev" : ""} ${deps.join(" ")}` : `${pm} add${flag} ${deps.join(" ")}`;
  console.log(`\nInstalling dependencies with ${pm}…`);
  try {
    execSync(cmd, { cwd: root, stdio: "inherit" });
  } catch {
    console.warn(`\n⚠  Dependency install failed. Add these manually:\n   ${deps.join(" ")}`);
  }
}

export function hasDependency(root: string, name: string): boolean {
  const pkg = readJsonFile(path.join(root, "package.json"));
  if (!pkg) return false;
  return Boolean(pkg.dependencies?.[name] || pkg.devDependencies?.[name]);
}

/** Re-write the scaffold import paths for the resolved alias prefix. */
export function rewriteImports(content: string, defaultPrefix: string, actualPrefix: string): string {
  if (defaultPrefix === actualPrefix) return content;
  /* Only rewrite self-references like "@/components/markify/..." */
  const escaped = defaultPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.replace(new RegExp(escaped, "g"), actualPrefix);
}
