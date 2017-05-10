import spawn from "cross-spawn-promise";
import path from "path";

function ensureRelativePath(s) {
  if (path.isAbsolute(s)) {
    return path.relative(process.cwd(), s);
  }
  return s;
}

async function getAllStaged() {
  const diffOut =
    (await spawn(
      "git",
      [
        "diff-index",
        "--cached",
        "--name-only",
        "--diff-filter=ACDMRTUXB",
        "HEAD"
      ],
      {
        encoding: "utf8"
      }
    )) || "";
  return diffOut.split("\n").filter(s => s !== "");
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
