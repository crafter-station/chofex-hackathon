import { describe, expect, test } from "bun:test";

const cliDirectory = new URL("../", import.meta.url).pathname;

describe("CLI JSON mode", () => {
  test("returns one JSON error document for invalid arguments", async () => {
    const child = Bun.spawn(
      [
        process.execPath,
        "src/index.ts",
        "--output",
        "json",
        "schema",
        "--stage",
        "invalid",
      ],
      {
        cwd: cliDirectory,
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [exitCode, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);

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
});
