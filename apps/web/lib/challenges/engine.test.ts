import { describe, expect, test } from "bun:test";

import type { Shipment } from "@chofex/challenges-contract";

import {
  ChallengeEngineError,
  createChallengeEngine,
  currentChallengeVersion,
} from "./engine";

const shipment: Shipment = {
  distanceKm: 12,
  weightKg: 3,
  hour: 14,
  fragile: false,
  express: false,
};

describe("private challenge engine adapter", () => {
  test("authenticates and maps query and evaluation responses", async () => {
    const requests: Array<{ url: string; init: RequestInit }> = [];
    const fetch = async (url: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(url), init: init ?? {} });
      if (String(url).endsWith("/query")) {
        return Response.json({ version: 1, output: 14 });
      }
      return Response.json({
        version: 1,
        score: {
          accuracy: 0.75,
          exactCount: 750,
          sampleSize: 1000,
          meanError: 1.25,
          queriesUsed: 7,
          runtimeMs: 12,
        },
      });
    };
    const engine = createChallengeEngine({
      baseUrl: "https://private-engine.example/",
      apiSecret: "private-secret",
      fetch,
    });

    await expect(engine.query("participant_1", shipment)).resolves.toBe(14);
    await expect(
      engine.evaluate(
        "participant_1",
        "function calculateShipping() { return 10; }",
        7,
      ),
    ).resolves.toEqual({
      accuracy: 0.75,
      exactCount: 750,
      sampleSize: 1000,
      meanError: 1.25,
      queriesUsed: 7,
      runtimeMs: 12,
    });

    expect(requests).toHaveLength(2);
    expect(requests[0]?.url).toBe(
      "https://private-engine.example/api/v1/query",
    );
    expect(requests[0]?.init.headers).toEqual({
      authorization: "Bearer private-secret",
      "content-type": "application/json",
    });
    expect(JSON.parse(String(requests[0]?.init.body))).toEqual({
      version: 1,
      challengeVersion: currentChallengeVersion,
      participantKey: "participant_1",
      input: shipment,
    });
  });

  test("returns a typed error without leaking an invalid engine response", async () => {
    const engine = createChallengeEngine({
      baseUrl: "https://private-engine.example",
      apiSecret: "private-secret",
      fetch: async () =>
        Response.json(
          {
            version: 1,
            error: {
              code: "SOLUTION_EXECUTION_FAILED",
              message: "Define function calculateShipping(input)",
            },
          },
          { status: 422 },
        ),
    });

    await expect(
      engine.evaluate("participant_1", "const value = 1", 2),
    ).rejects.toEqual(
      new ChallengeEngineError(
        422,
        "SOLUTION_EXECUTION_FAILED",
        "Define function calculateShipping(input)",
      ),
    );
  });
});
