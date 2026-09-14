import { describe, expect, test } from "bun:test";

import {
  challengeBySlug,
  compareChallengeScores,
  isChallengeOpenAt,
  scoreFromPredictions,
} from "./index.js";

describe("challenge catalog", () => {
  test("keeps Black Box playable and later challenges locked", () => {
    expect(challengeBySlug("last-mile")?.playable).toBe(false);
    expect(challengeBySlug("black-box")?.queryLimit).toBe(25);
    expect(challengeBySlug("black-box")?.evaluationLimit).toBe(3);
  });

  test("opens Black Box on 18 September 2026", () => {
    const challenge = challengeBySlug("black-box");
    if (!challenge) throw new Error("missing black-box");
    expect(
      isChallengeOpenAt(challenge, new Date("2026-09-17T23:59:59.000Z")),
    ).toBe(false);
    expect(
      isChallengeOpenAt(challenge, new Date("2026-09-18T05:00:00.000Z")),
    ).toBe(true);
    expect(
      isChallengeOpenAt(challenge, new Date("2026-09-17T00:00:00.000Z"), true),
    ).toBe(true);
  });
});

describe("challenge scoring", () => {
  test("treats exact matches as full accuracy and uses query count as a tie breaker", () => {
    const perfect = scoreFromPredictions([10, 20, 30], [10, 20, 30], 12, 8);
    const close = scoreFromPredictions([10, 20, 30], [10, 20, 35], 4, 1);
    expect(perfect.accuracy).toBe(1);
    expect(perfect.exactCount).toBe(3);
    expect(close.accuracy).toBeCloseTo(2 / 3);
    expect(close.meanError).toBeCloseTo(5 / 3);
    expect(compareChallengeScores(perfect, close)).toBeLessThan(0);

    const fewerQueries = { ...perfect, queriesUsed: 8 };
    expect(compareChallengeScores(fewerQueries, perfect)).toBeLessThan(0);
  });
});
