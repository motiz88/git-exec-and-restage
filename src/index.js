#!/usr/bin/env node

import spawn from "cross-spawn-promise";
import CliError from "./CliError";
import { getAllStaged, getFullyStaged, stageFiles } from "./gitUtils";

export { CliError };

const ARG_SEPARATOR = "--";

async function main(argv = []) {
  const { command, commandArgs, files } = parseArgs(argv);
  if (!command) {
    throw new CliError(
      "Usage: git-exec-and-restage <command> [...command-args --] [...files]"
    );
  }
  const fullyStaged = await getFullyStaged(files);
  await spawn(command, commandArgs.concat(files), { stdio: "inherit" });
  if (fullyStaged.length) {
    await stageFiles(fullyStaged);
  }
}

export function parseArgs(argv) {
  const separatorPos = argv.lastIndexOf(ARG_SEPARATOR);
  if (separatorPos === -1) {
    const [command, ...files] = argv;
    return { command, commandArgs: [], files };
  }
  const command = argv[0];
  const commandArgs = argv
    .slice(1, separatorPos)
    .filter(s => s !== ARG_SEPARATOR);
  const files = argv.slice(separatorPos + 1).filter(s => s !== ARG_SEPARATOR);
  return { command, commandArgs, files };
}

export default main;

// istanbul ignore next: not captured by tests
if (require.main === module) {
  require("./polyfills");
  main(process.argv.slice(2)).catch(e => {
    if (e instanceof CliError) {
      process.stderr.write(e.message + "\n");
    } else {
      process.stderr.write(e.stack || e);
    }
    process.exit(64);
  });
}
