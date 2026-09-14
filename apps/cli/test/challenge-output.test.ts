import { describe, expect, test } from "bun:test";

import { challengeEvaluateText } from "../src/challenge-output.js";

describe("challenge output", () => {
  test("prints official evaluation score details and a share card", () => {
    const text = challengeEvaluateText({
      accuracy: 0.9742,
      exactCount: 812,
      sampleSize: 1000,
      meanError: 1.84,
      queriesUsed: 18,
      runtimeMs: 12,
      shareCode: "7A3F",
      rank: 17,
      competitorCount: 120,
      percentile: 14.2,
      evaluationsUsed: 1,
      evaluationsRemaining: 2,
      evaluationsLimit: 3,
      rankingPath: "/challenges/black-box",
      shareText: [
        "🕵️ BLACK BOX #7A3F",
        "97.42% replication",
        "18 / 25 queries used",
        "Top 14.2%",
        "Can you reverse engineer yours?",
      ].join("\n"),
    });

    expect(text).toContain("BLACK BOX REPLICATION");
    expect(text).toContain("97.42%");
    expect(text).toContain("812 / 1000");
    expect(text).toContain("#17");
    expect(text).toContain("2 / 3");
    expect(text).toContain("BLACK BOX #7A3F");
  });
});
