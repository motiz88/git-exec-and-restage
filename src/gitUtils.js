import spawn from "cross-spawn-promise";
import path from "path";

function ensureRelativePath(s) {
  if (path.isAbsolute(s)) {
    return path.relative(process.cwd(), s);
  }
  return s;
}

const GIT_EMPTY_HASH = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

async function getAllStagedFromRevision(revision) {
  const diffOut =
    (await spawn(
      "git",
      [
        "diff-index",
        "--cached",
        "--name-only",
        "--diff-filter=ACDMRTUXB",
        revision,
        "--"
      ],
      {
        encoding: "utf8"
      }
    )) || "";
  return diffOut.split("\n").filter(s => s !== "");
}

async function getAllStaged() {
  try {
    return await getAllStagedFromRevision("HEAD");
  } catch (e) {
    // istanbul ignore else: simple exception passthrough
    if (
      e.stderr &&
      e.stderr.toString().indexOf("fatal: bad revision 'HEAD'") !== -1
    ) {
      return await getAllStagedFromRevision(GIT_EMPTY_HASH);
    }
    throw e;
  }
}

async function getFullyStaged(
  /* istanbul ignore next: convenience default */
  files = []
) {
  if (!files.length) {
    files = await getAllStaged();
  }
  const diffOut =
    (await spawn(
      "git",
      [
        "diff",
        "--name-only",
        "--diff-filter=ACDMRTUXB",
        ...files.map(filename => ensureRelativePath(filename))
      ],
      {
        encoding: "utf8"
      }
    )) || "";
  const notFullyStaged = new Set(
    diffOut
      .split("\n")
      .filter(s => s !== "")
      .map(filename => path.resolve(process.cwd(), filename))
  );
  return files.filter(
    file => !notFullyStaged.has(path.resolve(process.cwd(), file))
  );
}

async function stageFiles(
  /* istanbul ignore next: convenience default */
  files = []
) {
  await spawn(
    "git",
    ["add", ...files.map(filename => ensureRelativePath(filename))],
    { stdio: "inherit" }
  );
}

export { getAllStaged, getFullyStaged, stageFiles };
