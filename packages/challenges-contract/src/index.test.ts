import { describe, expect, test } from "bun:test";
import { Schema } from "effect";

import {
  challengeBySlug,
  challengeOpeningNotice,
  compareChallengeScores,
  formatChallengeOpeningInPeru,
  isChallengeOpenAt,
  isChallengeRankingVisibleAt,
  ShipmentSchema,
  scoreFromPredictions,
} from "./index.js";

describe("challenge catalog", () => {
  test("keeps Black Box playable and later challenges locked", () => {
    expect(challengeBySlug("last-mile")?.playable).toBe(false);
    expect(challengeBySlug("black-box")?.queryLimit).toBe(25);
    expect(challengeBySlug("black-box")?.evaluationLimit).toBe(3);
  });

  test("opens Black Box on 17 September 2026 at 09:00 UTC-5", () => {
    const challenge = challengeBySlug("black-box");
    if (!challenge) throw new Error("missing black-box");
    expect(
      isChallengeOpenAt(challenge, new Date("2026-09-17T13:59:59.999Z")),
    ).toBe(false);
    expect(
      isChallengeOpenAt(challenge, new Date("2026-09-17T14:00:00.000Z")),
    ).toBe(true);
    expect(formatChallengeOpeningInPeru(challenge.opensAt)).toBe(
      "September 17, 2026 at 09:00 (UTC-5)",
    );
    expect(challengeOpeningNotice(challenge.title, challenge.opensAt)).toBe(
      "The Shipping Machine opens September 17, 2026 at 09:00 (UTC-5). Queries and evaluations are disabled until then; no attempts will be consumed.",
    );
    expect(
      isChallengeOpenAt(challenge, new Date("2026-09-17T00:00:00.000Z"), true),
    ).toBe(true);
  });

  test("reveals the Black Box ranking on 18 September 2026 at 21:00 UTC-5", () => {
    const challenge = challengeBySlug("black-box");
    if (!challenge) throw new Error("missing black-box");

    expect(challenge.rankingVisibleAt).toBe("2026-09-19T02:00:00.000Z");
    expect(
      isChallengeRankingVisibleAt(
        challenge,
        new Date("2026-09-19T01:59:59.999Z"),
      ),
    ).toBe(false);
    expect(
      isChallengeRankingVisibleAt(
        challenge,
        new Date("2026-09-19T02:00:00.000Z"),
      ),
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

  test("does not use runtime to break otherwise identical scores", () => {
    const score = scoreFromPredictions([10, 20], [10, 20], 8, 1);
    expect(compareChallengeScores(score, { ...score, runtimeMs: 10_000 })).toBe(
      0,
    );
  });
});

describe("challenge inputs", () => {
  test("accepts only whole distance and weight values", () => {
    const decode = Schema.decodeUnknownSync(ShipmentSchema);
    const base = {
      distanceKm: 10,
      weightKg: 3,
      hour: 14,
      fragile: false,
      express: false,
    };

    expect(decode(base)).toEqual(base);
    expect(() => decode({ ...base, distanceKm: 10.5 })).toThrow();
    expect(() => decode({ ...base, weightKg: 3.5 })).toThrow();
  });
});
