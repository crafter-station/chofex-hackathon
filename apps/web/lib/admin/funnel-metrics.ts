import type { CandidateCounts } from "./types";

export interface CandidateFunnelMilestones {
  readonly registrationStarted: number;
  readonly registrationCompleted: number;
  readonly challengeStarted: number;
  readonly challengeCompleted: number;
}

export const candidateFunnelMilestones = (
  counts: CandidateCounts,
): CandidateFunnelMilestones => ({
  registrationStarted: counts.all,
  registrationCompleted:
    counts.registration_completed +
    counts.challenge_started +
    counts.challenge_completed +
    counts.approved +
    counts.declined,
  challengeStarted:
    counts.challenge_started +
    counts.challenge_completed +
    counts.approved +
    counts.declined,
  challengeCompleted:
    counts.challenge_completed + counts.approved + counts.declined,
});
