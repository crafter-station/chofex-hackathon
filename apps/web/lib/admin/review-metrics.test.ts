import { describe, expect, test } from "bun:test";

import {
  applicationDataStatus,
  challengeReviewStatus,
  completedChallengeAccuracy,
  completedChallengeDurationMs,
  formatChallengeCompletionDuration,
} from "./review-metrics";

const challenge = {
  slug: "black-box" as const,
  title: "The Shipping Machine",
  theme: "Black Box",
  status: "not_started" as const,
  open: true,
  playable: true,
  queriesUsed: 0,
  queriesLimit: 25,
  evaluationsUsed: 0,
  evaluationsLimit: 3,
};

describe("admin review metrics", () => {
  test("distinguishes saved drafts from submitted application data", () => {
    expect(applicationDataStatus()).toBe("Draft saved, not submitted");
    expect(applicationDataStatus("2026-09-14T12:00:00.000Z")).toBe(
      "Submitted for review",
    );
  });

  test("labels every challenge progress state for reviewers", () => {
    expect(challengeReviewStatus(challenge)).toBe("Not started");
    expect(challengeReviewStatus({ ...challenge, status: "in_progress" })).toBe(
      "In progress",
    );
    expect(challengeReviewStatus({ ...challenge, status: "evaluated" })).toBe(
      "Completed",
    );
  });

  test("returns a score only for a completed playable challenge", () => {
    expect(
      completedChallengeAccuracy([
        { ...challenge, status: "evaluated", bestAccuracy: 0.9876 },
      ]),
    ).toBe(0.9876);
    expect(
      completedChallengeAccuracy([
        { ...challenge, status: "in_progress", bestAccuracy: 0.5 },
      ]),
    ).toBeUndefined();
    expect(
      completedChallengeAccuracy([
        {
          ...challenge,
          playable: false,
          status: "evaluated",
          bestAccuracy: 0.5,
        },
      ]),
    ).toBeUndefined();
  });

  test("returns and formats the completion time for a completed challenge", () => {
    expect(
      completedChallengeDurationMs([
        {
          ...challenge,
          status: "evaluated",
          completionDurationMs: 95 * 60_000,
        },
      ]),
    ).toBe(95 * 60_000);
    expect(
      completedChallengeDurationMs([
        {
          ...challenge,
          status: "in_progress",
          completionDurationMs: 95 * 60_000,
        },
      ]),
    ).toBeUndefined();
    expect(formatChallengeCompletionDuration(30_000)).toBe("<1m");
    expect(formatChallengeCompletionDuration(95 * 60_000)).toBe("1h 35m");
    expect(formatChallengeCompletionDuration(1_565 * 60_000)).toBe("1d 2h 5m");
  });
});
