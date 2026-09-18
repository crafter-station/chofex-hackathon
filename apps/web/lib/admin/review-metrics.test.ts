import { describe, expect, test } from "bun:test";

import {
  applicationDataStatus,
  challengeReviewStatus,
  completedChallengeAccuracy,
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
});
