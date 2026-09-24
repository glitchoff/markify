#!/usr/bin/env node
/**
 * @glitchoff/markify CLI
 *
 *   markify init          Copy the full markify scaffold into your project
 *   markify add <comp>    Re-copy a single component from the registry
 *
 * shadcn/ui compatible: reads your components.json for paths and detects
 * your package manager.
 */

import { init } from "./init";
import { add } from "./add";

const [, , command, ...args] = process.argv;

async function main() {
  switch (command) {
    case "init":
      await init();
      break;
    case "add":
      await add(args[0]);
      break;
    case "--version":
    case "-v":
      console.log("markify CLI v3.0.0");
      break;
    case "--help":
    case "-h":
    case undefined:
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`markify — streaming-first markdown components, shadcn style

Usage
  $ markify init           Copy the full markify scaffold (config + tokens + comps)
                           into your project and install dependencies
  $ markify add <name>     Re-copy a single component, restoring its default
                           (e.g. $ markify add code-block)

Options
  -h, --help               Show this help
  -v, --version            Show version`);
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
