import { describe, expect, test } from "bun:test";

import { needsFunnelReminder } from "./eligibility";

const progress = {
  applicationStatus: undefined,
  applicationSubmitted: false,
  challengeStarted: false,
  challengeCompleted: false,
};

describe("funnel reminder eligibility", () => {
  test("nudges an authenticated user who has not submitted an application", () => {
    expect(needsFunnelReminder("registration", progress)).toBe(true);
    expect(
      needsFunnelReminder("registration", {
        ...progress,
        applicationStatus: "submitted",
        applicationSubmitted: true,
      }),
    ).toBe(false);
  });

  test("nudges an active applicant who has not started the challenge", () => {
    expect(
      needsFunnelReminder("challenge_start", {
        ...progress,
        applicationStatus: "submitted",
        applicationSubmitted: true,
      }),
    ).toBe(true);
    expect(
      needsFunnelReminder("challenge_start", {
        ...progress,
        applicationStatus: "submitted",
        applicationSubmitted: true,
        challengeStarted: true,
      }),
    ).toBe(false);
  });

  test("nudges an active applicant who started but has not finished", () => {
    expect(
      needsFunnelReminder("challenge_finish", {
        ...progress,
        applicationStatus: "under_review",
        applicationSubmitted: true,
        challengeStarted: true,
      }),
    ).toBe(true);
    expect(
      needsFunnelReminder("challenge_finish", {
        applicationStatus: "under_review",
        applicationSubmitted: true,
        challengeStarted: true,
        challengeCompleted: true,
      }),
    ).toBe(false);
  });

  test("does not send challenge nudges after a decision", () => {
    for (const applicationStatus of ["accepted", "rejected", "withdrawn"]) {
      expect(
        needsFunnelReminder("challenge_start", {
          ...progress,
          applicationStatus,
          applicationSubmitted: true,
        }),
      ).toBe(false);
    }
  });
});
