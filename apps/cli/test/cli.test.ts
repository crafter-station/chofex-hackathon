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

  test("advertises a command that verifies authentication", async () => {
    const help = await runCli("--help");

    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain("whoami");
    expect(help.stdout).toContain("Verify the current Clerk authentication");
  });

  test("renders verified authentication in human and JSON modes", async () => {
    const server = Bun.serve({
      port: 0,
      fetch(request) {
        if (
          new URL(request.url).pathname !== "/api/v1/me" ||
          request.method !== "GET" ||
          request.headers.get("authorization") !== "Bearer oauth-token"
        ) {
          return new Response(null, { status: 404 });
        }
        return Response.json({
          version: 1,
          ok: true,
          requestId: "request-whoami",
          data: {
            authenticated: true,
            userId: "user_123",
            tokenType: "oauth_token",
          },
        });
      },
    });

    try {
      const apiUrl = server.url.toString().replace(/\/$/, "");
      const human = await runCli(
        "--api-url",
        apiUrl,
        "--token",
        "oauth-token",
        "whoami",
      );
      const json = await runCli(
        "--api-url",
        apiUrl,
        "--token",
        "oauth-token",
        "--output",
        "json",
        "whoami",
      );

      expect(human.exitCode).toBe(0);
      expect(human.stdout.trim()).toBe(
        "Authenticated as user_123 (oauth_token).",
      );
      expect(json.exitCode).toBe(0);
      expect(JSON.parse(json.stdout)).toMatchObject({
        ok: true,
        data: {
          authenticated: true,
          userId: "user_123",
          tokenType: "oauth_token",
        },
      });
    } finally {
      server.stop(true);
    }
  });
});
