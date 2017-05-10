import { parseArgs } from "../";

describe("parseArgs", () => {
  it("empty", () => {
    expect(parseArgs([])).toMatchSnapshot();
  });
  it("command only", () => {
    expect(parseArgs(["prettier"])).toMatchSnapshot();
  });
  it("command and 1 file", () => {
    expect(parseArgs(["prettier", "a.js"])).toMatchSnapshot();
  });
  it("command and 2 files", () => {
    expect(parseArgs(["prettier", "a.js", "b.js"])).toMatchSnapshot();
  });
  it("command, separator and 1 file", () => {
    expect(parseArgs(["prettier", "--", "a.js"])).toMatchSnapshot();
  });
  it("command, 1 option and 1 file", () => {
    expect(parseArgs(["prettier", "--write", "--", "a.js"])).toMatchSnapshot();
  });
  it("command, 1 option, two separators, 1 file", () => {
    expect(
      parseArgs(["prettier", "--write", "--", "--", "a.js"])
    ).toMatchSnapshot();
  });
});
