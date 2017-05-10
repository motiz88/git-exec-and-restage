import mockGit from "mock-git";
import mockBin from "mock-bin";
import tmp from "tmp-promise";
import path from "path";
import fs from "mz/fs";
import pmock from "pmock";

export default class TestEnvironment {
  _unmock = [];
  _spyLogFile = undefined;
  __makeSpyJs = undefined;

  async setAllStagedFiles(files = [], failOnHead = false) {
    this._unmock.push(
      await mockGit(
        `${this._makeSpyJs("git")} 
          ${failOnHead ? `
            if (process.argv.indexOf("HEAD") > 1) {
              console.error("fatal: bad revision 'HEAD'");
              process.exitCode = 1;
              return;
            }
          ` : ""}
        for (const file of ${JSON.stringify(files)}) console.log(file);`,
        "diff-index"
      )
    );
  }

  async setPartialFiles(files = []) {
    this._unmock.push(
      await mockGit(
        `${this._makeSpyJs("git")} for (const file of ${JSON.stringify(files)}) console.log(file);`,
        "diff"
      )
    );
  }

  get log() {
    return (async () => {
      if (await fs.exists(this._spyLogFile)) {
        const logContent = await fs.readFile(this._spyLogFile, "utf8");
        return logContent
          .split("\n")
          .filter(Boolean)
          .map(line => JSON.parse(line).join(" "));
      }
      return [];
    })();
  }

  async mockBin(name) {
    this._unmock.push(await mockBin(name, "node", this._makeSpyJs(name)));
  }

  _makeSpyJs(...prefix) {
    return `
      require("fs").appendFileSync(${JSON.stringify(this._spyLogFile)}, JSON.stringify(${JSON.stringify(prefix)}.concat(process.argv.slice(2))) + "\\n", "utf8");
    `;
  }

  async setup() {
    this._spyLogFile = await tmp.tmpName();
    this._unmock.push(await mockGit(this._makeSpyJs("git"), "add"));
    const cwdMock = pmock.cwd("/path/to/repo");
    this._unmock.push(() => cwdMock.reset());
    await this.setAllStagedFiles();
    await this.setPartialFiles();
  }
  cleanup() {
    for (const unmockOne of this._unmock) {
      unmockOne();
    }
    this._unmock = [];
  }
}
