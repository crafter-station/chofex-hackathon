import type { ParticipantChallengeProgress } from "@chofex/challenges-contract";
import { type SQL, sql } from "@chofex/db/orm";
import { applications } from "@chofex/db/schema";

import {
  completedChallengeParticipantCondition,
  startedChallengeParticipantCondition,
} from "../challenges/metrics";
import type { CandidateFunnelStatus, CandidateStatus } from "./types";

export const candidateFunnelStatusFor = (
  applicationStatus: CandidateStatus,
  submittedAt: string | undefined,
  challenges: ReadonlyArray<ParticipantChallengeProgress>,
): CandidateFunnelStatus => {
  if (applicationStatus === "accepted") return "approved";
  if (applicationStatus === "rejected") return "declined";
  if (!submittedAt) return "registration_started";
  const playableChallenges = challenges.filter(
    (challenge) => challenge.playable,
  );
  if (
    playableChallenges.some((challenge) => challenge.status === "evaluated")
  ) {
    return "challenge_completed";
  }
  if (
    playableChallenges.some((challenge) => challenge.status === "in_progress")
  ) {
    return "challenge_started";
  }
  return "registration_completed";
};

export const candidateFunnelIncludesApplication = (
  applicationStatus: CandidateStatus,
): boolean => applicationStatus !== "withdrawn";

export const candidateFunnelApplicationCondition = (): SQL =>
  sql`${applications.status} <> 'withdrawn'`;

export const candidateFunnelStatusExpression =
  (): SQL<CandidateFunnelStatus> => {
    // Challenge progress belongs to the participant and intentionally survives
    // rejected or withdrawn application attempts.
    const participantId = sql`${applications.participantId}`;
    const completedChallenge =
      completedChallengeParticipantCondition(participantId);
    const startedChallenge =
      startedChallengeParticipantCondition(participantId);

    return sql<CandidateFunnelStatus>`case
    when ${applications.status} = 'accepted' then 'approved'
    when ${applications.status} = 'rejected' then 'declined'
    when ${applications.submittedAt} is null then 'registration_started'
    when ${completedChallenge} then 'challenge_completed'
    when ${startedChallenge} then 'challenge_started'
    else 'registration_completed'
  end`;
  };
