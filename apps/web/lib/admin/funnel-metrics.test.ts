import { expect, test } from "bun:test";

import { candidateFunnelMilestones } from "./funnel-metrics";

test("turns current candidate states into cumulative funnel milestones", () => {
  expect(
    candidateFunnelMilestones({
      all: 40,
      registration_started: 7,
      registration_completed: 12,
      challenge_started: 8,
      challenge_completed: 6,
      approved: 4,
      declined: 3,
    }),
  ).toEqual({
    registrationStarted: 40,
    registrationCompleted: 33,
    challengeStarted: 21,
    challengeCompleted: 13,
  });
});

test("returns an empty funnel when there are no candidates", () => {
  expect(
    candidateFunnelMilestones({
      all: 0,
      registration_started: 0,
      registration_completed: 0,
      challenge_started: 0,
      challenge_completed: 0,
      approved: 0,
      declined: 0,
    }),
  ).toEqual({
    registrationStarted: 0,
    registrationCompleted: 0,
    challengeStarted: 0,
    challengeCompleted: 0,
  });
});
