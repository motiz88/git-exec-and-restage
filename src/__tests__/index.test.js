import gitExecAndRestage from "../";
import TestEnvironment from "TestEnvironment";
import path from "path";
import flip from "invert-promise";

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
  it("throws when command fails", async () => {
    await env.mockBinError("prettier");
    const error = await flip(gitExecAndRestage(["prettier"]));
    expect(error.__isExpectedError).toBe(true);
    expect(error.message).toMatchSnapshot();
  });
  it("with command and arguments, no files", async () => {
    await env.mockBin("prettier");
    await gitExecAndRestage(["prettier", "--write", "--"]);
    expect(await env.log).toMatchSnapshot();
  });
  it("with command, arguments, fully staged file, no partials", async () => {
    await env.mockBin("prettier");
    await env.setAllStagedFiles(["fullystaged.js"]);
    await gitExecAndRestage(["prettier", "--write", "--", "fullystaged.js"]);
    expect(await env.log).toMatchSnapshot();
  });
  it("with command+args, mix of fully and partially staged files", async () => {
    await env.mockBin("prettier");
    await env.setAllStagedFiles(["fullystaged.js", "partiallystaged.js"]);
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
  it("with command+args, files implicit with invalid HEAD", async () => {
    await env.mockBin("prettier");
    await env.setAllStagedFiles(
      ["fullystaged.js", "partiallystaged.js"],
      true /* fail on HEAD */
    );
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
  it("with command+args and mixed status, absolute paths", async () => {
    await env.mockBin("prettier");
    await env.setAllStagedFiles(["fullystaged.js", "partiallystaged.js"]);
    await env.setPartialFiles(["partiallystaged.js"]);
    await gitExecAndRestage([
      "prettier",
      "--write",
      "--",
      path.join(process.cwd(), "fullystaged.js"),
      path.join(process.cwd(), "partiallystaged.js")
    ]);
    expect(await env.log).toMatchSnapshot();
  });
});
