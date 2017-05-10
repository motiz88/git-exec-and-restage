import gitExecAndRestage from "../";
import TestEnvironment from "TestEnvironment";

describe("git-exec-and-restage", () => {
  const env = new TestEnvironment();
  beforeEach(() => env.setup());
  afterEach(() => env.cleanup());
  it("no command, no args and no files staged", async () => {
    await expect(gitExecAndRestage()).rejects.toMatchSnapshot();
  });
  it("with command, no args and no files", async () => {
    await env.mockBin("prettier");
    await gitExecAndRestage(["prettier"]);
    expect(await env.log).toMatchSnapshot();
  });
  it("with command and arguments, no files", async () => {
    await env.mockBin("prettier");
    await gitExecAndRestage(["prettier", "--write", "--"]);
    expect(await env.log).toMatchSnapshot();
  });
  it("with command, arguments, fully staged file, no partials", async () => {
    await env.mockBin("prettier");
    await gitExecAndRestage(["prettier", "--write", "--", "fullystaged.js"]);
    expect(await env.log).toMatchSnapshot();
  });
  it("with command+args, mix of fully and partially staged files", async () => {
    await env.mockBin("prettier");
    await env.setPartialFiles(["partiallystaged.js"]);
    await gitExecAndRestage([
      "prettier",
      "--write",
      "--",
      "fullystaged.js",
      "partiallystaged.js"
    ]);
    expect(await env.log).toMatchSnapshot();
  });
  it("with command+args, files implicit", async () => {
    await env.mockBin("prettier");
    await env.setAllStagedFiles(["fullystaged.js", "partiallystaged.js"]);
    await env.setPartialFiles(["partiallystaged.js"]);
    await gitExecAndRestage(["prettier", "--write", "--"]);
    expect(await env.log).toMatchSnapshot();
  });
  it("with command+args, pick one of multiple files", async () => {
    await env.mockBin("prettier");
    await env.setAllStagedFiles([
      "fullystaged1.js",
      "fullystaged2.js",
      "partiallystaged1.js",
      "partiallystaged2.js"
    ]);
    await env.setPartialFiles(["partiallystaged1.js", "partiallystaged2.js"]);
    await gitExecAndRestage(["prettier", "--write", "--", "fullystaged1.js"]);
    expect(await env.log).toMatchSnapshot();
  });
});
