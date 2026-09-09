import { describe, expect, test } from "bun:test";
import { unlink } from "node:fs/promises";

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

  test("prints an application template containing only applicant-provided fields", async () => {
    const result = await runCli("schema");

    expect(result.exitCode).toBe(0);
    const template = JSON.parse(result.stdout);
    expect(template).toMatchObject({ city: "Lima" });
    expect(template).not.toHaveProperty("email");
    expect(template).not.toHaveProperty("countryCode");
    expect(template).not.toHaveProperty("participationMode");
    expect(template).not.toHaveProperty("teamName");
  });

  test("submits a normalized on-site application without identity fields", async () => {
    let submittedBody: unknown;
    const server = Bun.serve({
      port: 0,
      async fetch(request) {
        submittedBody = await request.json();
        return Response.json(
          {
            version: 1,
            ok: true,
            requestId: "request-registration",
            data: {
              registration: {
                id: "registration-123",
                status: "submitted",
                firstName: "Anthony",
                lastName: "Cueva",
                email: "hi@cueva.io",
                countryCode: "PE",
                city: "Lima",
                participationMode: "in_person",
                experienceLevel: "advanced",
                skills: ["React", "Next.js"],
                bio: "I build things.",
                githubUrl: "https://github.com/cuevaio",
                teamPreference: "solo",
                nationalIdProvided: false,
                mediaConsent: true,
                submittedAt: "2026-09-09T00:00:00.000Z",
                createdAt: "2026-09-09T00:00:00.000Z",
                updatedAt: "2026-09-09T00:00:00.000Z",
              },
              requirements: {
                stage: "review",
                canSubmitNewApplication: false,
                canSubmitAcceptedDetails: false,
                missing: [],
              },
            },
          },
          { status: 201 },
        );
      },
    });
    const inputPath = `${cliDirectory}.application-${crypto.randomUUID()}.json`;

    try {
      await Bun.write(
        inputPath,
        JSON.stringify({
          firstName: " Anthony ",
          lastName: "Cueva",
          city: "Lima",
          experienceLevel: "advanced",
          skills: ["React", "Next.js"],
          bio: "I build things.",
          githubUrl: "github.com/cuevaio",
          teamPreference: "solo",
          codeOfConductAccepted: true,
          privacyPolicyAccepted: true,
          mediaConsent: true,
        }),
      );
      const apiUrl = server.url.toString().replace(/\/$/, "");
      const result = await runCli(
        "--api-url",
        apiUrl,
        "--token",
        "oauth-token",
        "register",
        "--input",
        inputPath,
      );

      expect(result.exitCode).toBe(0);
      expect(submittedBody).toEqual({
        firstName: "Anthony",
        lastName: "Cueva",
        city: "Lima",
        experienceLevel: "advanced",
        skills: ["React", "Next.js"],
        bio: "I build things.",
        githubUrl: "https://github.com/cuevaio",
        teamPreference: "solo",
        codeOfConductAccepted: true,
        privacyPolicyAccepted: true,
        mediaConsent: true,
      });
      expect(submittedBody).not.toHaveProperty("email");
      expect(submittedBody).not.toHaveProperty("countryCode");
      expect(submittedBody).not.toHaveProperty("participationMode");
      expect(submittedBody).not.toHaveProperty("teamName");
    } finally {
      server.stop(true);
      await unlink(inputPath).catch(() => undefined);
    }
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
            email: "ada@example.com",
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
        "Authenticated as ada@example.com (user_123, oauth_token).",
      );
      expect(json.exitCode).toBe(0);
      expect(JSON.parse(json.stdout)).toMatchObject({
        ok: true,
        data: {
          authenticated: true,
          userId: "user_123",
          email: "ada@example.com",
          tokenType: "oauth_token",
        },
      });
    } finally {
      server.stop(true);
    }
  });

  test("prints structured API validation details in human mode", async () => {
    const server = Bun.serve({
      port: 0,
      fetch() {
        return Response.json(
          {
            version: 1,
            ok: false,
            requestId: "request-validation",
            error: {
              code: "VALIDATION_ERROR",
              message: "Input validation failed",
              retryable: false,
              details: {
                issues: [{ field: "teamName", reason: "Required" }],
              },
            },
          },
          { status: 422 },
        );
      },
    });

    try {
      const apiUrl = server.url.toString().replace(/\/$/, "");
      const result = await runCli(
        "--api-url",
        apiUrl,
        "--token",
        "oauth-token",
        "status",
      );

      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("teamName: Required");
      expect(result.stderr).toContain("Request ID: request-validation");
    } finally {
      server.stop(true);
    }
  });
});
