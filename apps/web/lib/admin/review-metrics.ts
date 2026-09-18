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

export interface CompletedChallengeMetrics {
  readonly accuracy?: number;
  readonly durationMs?: number;
}

export const completedChallengeMetrics = (
  challenges: ReadonlyArray<ParticipantChallengeProgress>,
): CompletedChallengeMetrics | undefined => {
  const challenge = challenges.find(
    (challenge) => challenge.playable && challenge.status === "evaluated",
  );
  if (!challenge) return undefined;
  return {
    accuracy: challenge.bestAccuracy,
    durationMs: challenge.completionDurationMs,
  };
};

export const formatChallengeCompletionDuration = (
  durationMs: number,
): string => {
  const minuteMs = 60_000;
  if (durationMs < minuteMs) return "<1m";

  const totalMinutes = Math.floor(durationMs / minuteMs);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts: Array<string> = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  return parts.join(" ");
};
