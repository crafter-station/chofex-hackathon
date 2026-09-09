import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";

import { getCurrentUser, getRegistration } from "../src/api-client.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const registrationResult = {
  registration: {
    id: "registration-123",
    status: "submitted",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    participationMode: "in_person",
    skills: ["TypeScript"],
    nationalIdProvided: false,
    mediaConsent: false,
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
} as const;

describe("registration API client", () => {
  test("verifies the supplied token without requiring a registration", async () => {
    let authorization: string | null = null;
    let method: string | undefined;
    let url = "";
    globalThis.fetch = async (input, init) => {
      url = String(input);
      method = init?.method;
      authorization = new Headers(init?.headers).get("authorization");
      return Response.json({
        version: 1,
        ok: true,
        requestId: "request-auth",
        data: {
          authenticated: true,
          userId: "user_123",
          email: "ada@example.com",
          tokenType: "oauth_token",
        },
      });
    };

    const response = await Effect.runPromise(
      getCurrentUser({
        apiUrl: "https://hack.example",
        token: "oauth-token",
      }),
    );

    expect(authorization).toBe("Bearer oauth-token");
    expect(method).toBe("GET");
    expect(url).toBe("https://hack.example/api/v1/me");
    expect(response.data).toEqual({
      authenticated: true,
      userId: "user_123",
      email: "ada@example.com",
      tokenType: "oauth_token",
    });
  });

  test("sends the supplied bearer token and decodes a v1 response", async () => {
    let authorization: string | null = null;
    globalThis.fetch = async (_input, init) => {
      authorization = new Headers(init?.headers).get("authorization");
      return Response.json({
        version: 1,
        ok: true,
        requestId: "request-123",
        data: registrationResult,
      });
    };

    const response = await Effect.runPromise(
      getRegistration({ apiUrl: "https://hack.example", token: "oauth-token" }),
    );

    expect(authorization).toBe("Bearer oauth-token");
    expect(response.data.registration.status).toBe("submitted");
  });

  test("preserves structured API errors", async () => {
    globalThis.fetch = async () =>
      Response.json(
        {
          version: 1,
          ok: false,
          requestId: "request-456",
          error: {
            code: "REGISTRATION_NOT_FOUND",
            message: "Registration not found",
            retryable: false,
          },
        },
        { status: 404 },
      );

    const error = await Effect.runPromise(
      Effect.flip(
        getRegistration({
          apiUrl: "https://hack.example",
          token: "oauth-token",
        }),
      ),
    );

    expect(error.code).toBe("REGISTRATION_NOT_FOUND");
    expect(error.requestId).toBe("request-456");
  });

  test("ignores additive fields in a v1 response", async () => {
    globalThis.fetch = async () =>
      Response.json({
        version: 1,
        ok: true,
        requestId: "request-789",
        data: registrationResult,
        unexpected: true,
      });

    const response = await Effect.runPromise(
      getRegistration({
        apiUrl: "https://hack.example",
        token: "oauth-token",
      }),
    );

    expect(response.data.registration.id).toBe("registration-123");
  });
});
