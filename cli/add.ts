import path from "node:path";
import { findProjectRoot, resolveTarget, readRegistry, copyFiles, registryDir } from "./lib";

/**
 * `markify add <component>`
 *
 * Re-copies one component from the registry into the scaffold, restoring
 * its default implementation (e.g. after local edits, or to add a component
 * skipped by a partial copy).
 */
export async function add(name?: string): Promise<void> {
  if (!name) {
    const registry = readRegistry();
    console.error("Usage: markify add <component>\n");
    console.error("Available components:");
    for (const c of registry.components) {
      console.error(`  ${c.name.padEnd(14)} ${c.description}`);
    }
    process.exit(1);
  }

  const root = findProjectRoot(process.cwd());
  const registryPath = registryDir();
  const registry = readRegistry();

  const component = registry.components.find((c: any) => c.name === name);
  if (!component) {
    console.error(`Unknown component: ${name}`);
    console.error(`Available: ${registry.components.map((c: any) => c.name).join(", ")}`);
    process.exit(1);
  }

  const { targetDir } = resolveTarget(root);

  const written = copyFiles(registryPath, component.files, targetDir);
  console.log(`\nRestored ${component.name}:`);
  for (const file of written) {
    console.log(`  + ${path.relative(root, file)}`);
  }
}
