import type { ParticipantChallengeProgress } from "@chofex/challenges-contract";

export const challengeProgressStatus = (input: {
  readonly hasPersistedEvaluation: boolean;
  readonly queriesUsed: number;
  readonly evaluationsUsed: number;
}): ParticipantChallengeProgress["status"] => {
  if (input.hasPersistedEvaluation) return "evaluated";
  if (input.queriesUsed > 0 || input.evaluationsUsed > 0) return "in_progress";
  return "not_started";
};
