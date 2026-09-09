import { describe, expect, test } from "bun:test";

import { authenticateUserWithClerk } from "./auth";

const request = new Request("http://localhost:3000/api/v1/registration", {
  headers: { authorization: "Bearer test-token" },
});

describe("registration API authentication", () => {
  test("accepts an OAuth token issued to the Chofex CLI", async () => {
    const calls: unknown[] = [];
    const clerk = {
      async authenticateRequest(_request: Request, options: unknown) {
        calls.push(options);
        return {
          isAuthenticated: true,
          toAuth: () => ({
            clientId: "cli-client",
            tokenType: "oauth_token" as const,
            userId: "user_123",
          }),
        };
      },
    };

    await expect(
      authenticateUserWithClerk(request, clerk, "cli-client", [
        "http://localhost:3000",
      ]),
    ).resolves.toEqual({
      clerkUserId: "user_123",
      tokenType: "oauth_token",
    });
    expect(calls).toEqual([{ acceptsToken: "oauth_token" }]);
  });

  test("rejects an OAuth token issued to another client", async () => {
    const clerk = {
      async authenticateRequest() {
        return {
          isAuthenticated: true,
          toAuth: () => ({
            clientId: "other-client",
            tokenType: "oauth_token" as const,
            userId: "user_123",
          }),
        };
      },
    };

    expect(
      await authenticateUserWithClerk(request, clerk, "cli-client", [
        "http://localhost:3000",
      ]),
    ).toBeNull();
  });

  test("accepts browser sessions only from configured web origins", async () => {
    const calls: unknown[] = [];
    const clerk = {
      async authenticateRequest(
        _request: Request,
        options: { acceptsToken: string },
      ) {
        calls.push(options);
        if (options.acceptsToken === "oauth_token") {
          return {
            isAuthenticated: false,
            toAuth: () => ({ tokenType: "oauth_token" as const, userId: "" }),
          };
        }
        return {
          isAuthenticated: true,
          toAuth: () => ({
            tokenType: "session_token" as const,
            userId: "user_123",
          }),
        };
      },
    };

    await expect(
      authenticateUserWithClerk(request, clerk, "cli-client", [
        "http://localhost:3000",
      ]),
    ).resolves.toEqual({
      clerkUserId: "user_123",
      tokenType: "session_token",
    });
    expect(calls).toEqual([
      { acceptsToken: "oauth_token" },
      {
        acceptsToken: "session_token",
        authorizedParties: ["http://localhost:3000"],
      },
    ]);
  });
});
