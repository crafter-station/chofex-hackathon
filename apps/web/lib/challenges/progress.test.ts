import { describe, expect, test } from "bun:test";

import { challengeProgressStatus } from "./progress";

describe("challenge progress", () => {
  test("requires a persisted evaluation before reporting completion", () => {
    expect(
      challengeProgressStatus({
        hasPersistedEvaluation: false,
        queriesUsed: 0,
        evaluationsUsed: 0,
      }),
    ).toBe("not_started");
    expect(
      challengeProgressStatus({
        hasPersistedEvaluation: false,
        queriesUsed: 4,
        evaluationsUsed: 0,
      }),
    ).toBe("in_progress");
    expect(
      challengeProgressStatus({
        hasPersistedEvaluation: false,
        queriesUsed: 0,
        evaluationsUsed: 1,
      }),
    ).toBe("in_progress");
    expect(
      challengeProgressStatus({
        hasPersistedEvaluation: true,
        queriesUsed: 0,
        evaluationsUsed: 1,
      }),
    ).toBe("evaluated");
  });
});
