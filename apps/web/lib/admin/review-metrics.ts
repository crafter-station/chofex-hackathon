import type { ParticipantChallengeProgress } from "@chofex/challenges-contract";

export const applicationDataStatus = (submittedAt?: string): string => {
  if (submittedAt) return "Submitted for review";
  return "Draft saved, not submitted";
};

export const challengeReviewStatus = (
  challenge: ParticipantChallengeProgress,
): string => {
  if (challenge.status === "evaluated") return "Completed";
  if (challenge.status === "in_progress") return "In progress";
  return "Not started";
};
