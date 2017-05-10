import spawn from "cross-spawn-promise";

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
      ["diff", "--name-only", "--diff-filter=ACDMRTUXB", ...files],
      {
        encoding: "utf8"
      }
    )) || "";
  const notFullyStaged = new Set(diffOut.split("\n").filter(s => s !== ""));
  return files.filter(file => !notFullyStaged.has(file));
}

export { getAllStaged, getFullyStaged };
