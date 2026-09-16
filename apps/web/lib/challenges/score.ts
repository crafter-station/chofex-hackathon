import type { ChallengeScore } from "@chofex/challenges-contract";

export interface StoredChallengeScore {
  readonly accuracy: number;
  readonly exactCount: number;
  readonly sampleSize: number;
  readonly meanError: number;
  readonly queriesUsed: number;
  readonly runtimeMs: number;
}

export const scoreFromStored = (
  score: StoredChallengeScore,
): ChallengeScore => ({
  accuracy: score.accuracy,
  exactCount: score.exactCount,
  sampleSize: score.sampleSize,
  meanError: score.meanError,
  queriesUsed: score.queriesUsed,
  runtimeMs: score.runtimeMs,
});
