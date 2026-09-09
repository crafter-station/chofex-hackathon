import { describe, expect, test } from "bun:test";

const cliDirectory = new URL("../", import.meta.url).pathname;

const runCli = async (...arguments_: ReadonlyArray<string>) => {
  const child = Bun.spawn([process.execPath, "src/index.ts", ...arguments_], {
    cwd: cliDirectory,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { exitCode, stdout, stderr };
};

describe("CLI JSON mode", () => {
  test("returns one JSON error document for invalid arguments", async () => {
    const { exitCode, stderr, stdout } = await runCli(
      "--output",
      "json",
      "schema",
      "--stage",
      "invalid",
    );

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    expect(stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(stdout)).toMatchObject({
      version: 1,
      ok: false,
      error: {
        code: "CLI_PARSE_ERROR",
        retryable: false,
      },
    });
  });

  test("returns JSON for built-in help and version flags", async () => {
    const help = await runCli("--output", "json", "--help");
    const version = await runCli("--output=json", "--version");

    expect(help.exitCode).toBe(0);
    expect(JSON.parse(help.stdout)).toMatchObject({
      version: 1,
      ok: true,
      data: { helpRequested: true },
    });
    expect(version.exitCode).toBe(0);
    expect(JSON.parse(version.stdout)).toMatchObject({
      version: 1,
      ok: true,
      data: { cliVersion: "0.1.0" },
    });
  });
});
