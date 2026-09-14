import {
  type ChallengeAttemptView,
  type ChallengeCatalogItem,
  type ChallengeDefinition,
  type ChallengeEvaluationResult,
  type ChallengeLocalTestResult,
  type ChallengeObservation,
  type ChallengeQueryResult,
  type ChallengeScore,
  ChallengeSolutionSchema,
  challengeBySlug,
  challengeCatalog,
  compareChallengeScores,
  isChallengeOpenAt,
  type ParticipantChallengeProgress,
  type Shipment,
  ShipmentSchema,
  scoreFromPredictions,
} from "@chofex/challenges-contract";
import { db } from "@chofex/db";
import { and, asc, eq, sql } from "@chofex/db/orm";
import {
  challengeAttempts,
  challengeEvaluations,
  challengeObservations,
} from "@chofex/db/schema";
import { Schema } from "effect";

import { isUniqueViolation } from "../db-errors";
import { HttpError } from "../registration/http";
import { participantIdFor } from "../registration/participants";
import { catalogItemFor, rankingPathFor } from "./catalog";
import { challengesForceOpen, currentChallengeTime } from "./clock";
import { rankedEvaluationsFor, rankForAttempt } from "./ranking";
import { runShippingSolution } from "./sandbox";
import { attemptSeed, shareCodeFromSeed } from "./seed";
import { hiddenShipmentsForSeed, oraclePriceForSeed } from "./shipping";

type AttemptRecord = typeof challengeAttempts.$inferSelect;
type EvaluationRecord = typeof challengeEvaluations.$inferSelect;

const parseInput = <S extends Schema.ConstraintDecoder<unknown>>(
  schema: S,
  input: unknown,
): S["Type"] => {
  try {
    return Schema.decodeUnknownSync(schema, { onExcessProperty: "error" })(
      input,
    );
  } catch (error) {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      "Input validation failed",
      false,
      { issues: String(error) },
    );
  }
};

const requireChallenge = (slug: string): ChallengeDefinition => {
  const challenge = challengeBySlug(slug);
  if (!challenge) {
    throw new HttpError(404, "CHALLENGE_NOT_FOUND", "Challenge not found");
  }
  return challenge;
};

const requirePlayableChallenge = (
  slug: string,
  now: Date,
): ChallengeDefinition => {
  const challenge = requireChallenge(slug);
  if (!challenge.playable) {
    throw new HttpError(
      404,
      "CHALLENGE_NOT_AVAILABLE",
      `${challenge.title} is not available yet`,
    );
  }
  if (!isChallengeOpenAt(challenge, now, challengesForceOpen())) {
    throw new HttpError(
      403,
      "CHALLENGE_NOT_OPEN",
      `${challenge.title} opens on ${challenge.opensAt.slice(0, 10)}`,
      false,
      { opensAt: challenge.opensAt },
    );
  }
  return challenge;
};

const requireImplementedChallenge = (
  slug: string,
  now: Date,
): ChallengeDefinition => {
  const challenge = requirePlayableChallenge(slug, now);
  if (challenge.slug !== "black-box") {
    throw new HttpError(
      404,
      "CHALLENGE_NOT_AVAILABLE",
      `${challenge.title} is not available yet`,
    );
  }
  return challenge;
};

const createAttempt = async (
  participantId: string,
  challenge: ChallengeDefinition,
): Promise<AttemptRecord> => {
  const seed = attemptSeed(participantId, challenge.slug);
  for (let length = 4; length <= 8; length += 1) {
    try {
      const [created] = await db
        .insert(challengeAttempts)
        .values({
          participantId,
          challengeSlug: challenge.slug,
          shareCode: shareCodeFromSeed(seed, length),
          queriesLimit: challenge.queryLimit,
          evaluationsLimit: challenge.evaluationLimit,
        })
        .returning();
      if (created) return created;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      const [existing] = await db
        .select()
        .from(challengeAttempts)
        .where(
          and(
            eq(challengeAttempts.participantId, participantId),
            eq(challengeAttempts.challengeSlug, challenge.slug),
          ),
        )
        .limit(1);
      if (existing) return existing;
    }
  }
  throw new Error("Could not allocate a challenge share code");
};

const attemptFor = async (
  participantId: string,
  challenge: ChallengeDefinition,
): Promise<AttemptRecord> => {
  const [existing] = await db
    .select()
    .from(challengeAttempts)
    .where(
      and(
        eq(challengeAttempts.participantId, participantId),
        eq(challengeAttempts.challengeSlug, challenge.slug),
      ),
    )
    .limit(1);
  if (existing) return existing;
  return createAttempt(participantId, challenge);
};

const progressStatus = (
  attempt: AttemptRecord | undefined,
): ParticipantChallengeProgress["status"] => {
  if (!attempt) return "not_started";
  if (attempt.bestEvaluationId || attempt.evaluationsUsed > 0) {
    return "evaluated";
  }
  if (attempt.queriesUsed > 0) return "in_progress";
  return "not_started";
};

const progressFrom = (
  challenge: ChallengeDefinition,
  item: ChallengeCatalogItem,
  attempt: AttemptRecord | undefined,
  evaluation: EvaluationRecord | undefined,
  rank?: number,
): ParticipantChallengeProgress => ({
  slug: challenge.slug,
  title: challenge.title,
  theme: challenge.theme,
  status: progressStatus(attempt),
  open: item.open,
  playable: challenge.playable,
  requiredForApplication: challenge.requiredForApplication,
  queriesUsed: attempt?.queriesUsed ?? 0,
  queriesLimit: attempt?.queriesLimit ?? challenge.queryLimit,
  evaluationsUsed: attempt?.evaluationsUsed ?? 0,
  evaluationsLimit: attempt?.evaluationsLimit ?? challenge.evaluationLimit,
  bestAccuracy: evaluation?.accuracy,
  bestExactCount: evaluation?.exactCount,
  shareCode: attempt?.shareCode,
  rank,
});

const observationView = (row: {
  sequence: number;
  input: unknown;
  output: unknown;
  createdAt: Date;
}): ChallengeObservation => ({
  sequence: row.sequence,
  input: row.input,
  output: row.output,
  createdAt: row.createdAt.toISOString(),
});

const scoreFromEvaluation = (evaluation: EvaluationRecord): ChallengeScore => ({
  accuracy: evaluation.accuracy,
  exactCount: evaluation.exactCount,
  sampleSize: evaluation.sampleSize,
  meanError: evaluation.meanError,
  queriesUsed: evaluation.queriesUsed,
  runtimeMs: evaluation.runtimeMs,
});

const percentileFor = (rank: number, competitorCount: number): number => {
  if (competitorCount <= 0) return 100;
  return (rank / competitorCount) * 100;
};

const shareTextFor = (
  challenge: ChallengeDefinition,
  result: {
    accuracy: number;
    queriesUsed: number;
    rank: number;
    competitorCount: number;
    shareCode: string;
  },
): string => {
  const accuracyPercent = (result.accuracy * 100).toFixed(2);
  const topPercent = percentileFor(result.rank, result.competitorCount).toFixed(
    1,
  );
  return [
    `🕵️ BLACK BOX #${result.shareCode}`,
    `${accuracyPercent}% replication`,
    `${result.queriesUsed} / ${challenge.queryLimit} queries used`,
    `Top ${topPercent}%`,
    "Can you reverse engineer yours?",
  ].join("\n");
};

const loadBestEvaluation = async (
  attempt: AttemptRecord,
): Promise<EvaluationRecord | undefined> => {
  if (!attempt.bestEvaluationId) return undefined;
  const [evaluation] = await db
    .select()
    .from(challengeEvaluations)
    .where(eq(challengeEvaluations.id, attempt.bestEvaluationId))
    .limit(1);
  return evaluation;
};

const loadObservations = async (
  attemptId: string,
): Promise<Array<ChallengeObservation>> => {
  const rows = await db
    .select()
    .from(challengeObservations)
    .where(eq(challengeObservations.attemptId, attemptId))
    .orderBy(asc(challengeObservations.sequence));
  return rows.map(observationView);
};

const isBetterScore = (
  candidate: ChallengeScore,
  current: ChallengeScore | undefined,
): boolean => {
  if (!current) return true;
  return compareChallengeScores(candidate, current) < 0;
};

export const challengeProgressForParticipant = async (
  participantId: string,
  now: Date = currentChallengeTime(),
): Promise<Array<ParticipantChallengeProgress>> => {
  const attempts = await db
    .select()
    .from(challengeAttempts)
    .where(eq(challengeAttempts.participantId, participantId));
  const attemptBySlug = new Map(
    attempts.map((attempt) => [attempt.challengeSlug, attempt]),
  );

  const evaluationEntries = await Promise.all(
    attempts.map(async (attempt) => {
      const evaluation = await loadBestEvaluation(attempt);
      return [attempt.id, evaluation] as const;
    }),
  );
  const evaluationByAttempt = new Map(evaluationEntries);

  return challengeCatalog.map((challenge) => {
    const item = catalogItemFor(challenge, now, challengesForceOpen());
    const attempt = attemptBySlug.get(challenge.slug);
    const evaluation = attempt
      ? evaluationByAttempt.get(attempt.id)
      : undefined;
    return progressFrom(challenge, item, attempt, evaluation);
  });
};

export const getChallengeAttempt = async (
  clerkUserId: string,
  slug: string,
  now: Date = currentChallengeTime(),
): Promise<ChallengeAttemptView> => {
  const challenge = requireChallenge(slug);
  const participantId = await participantIdFor(clerkUserId);
  const item = catalogItemFor(challenge, now, challengesForceOpen());
  const [existing] = await db
    .select()
    .from(challengeAttempts)
    .where(
      and(
        eq(challengeAttempts.participantId, participantId),
        eq(challengeAttempts.challengeSlug, challenge.slug),
      ),
    )
    .limit(1);

  let rank: number | undefined;
  if (existing?.bestEvaluationId) {
    const ranked = await rankedEvaluationsFor(challenge.slug);
    rank = rankForAttempt(ranked, existing.id)?.rank;
  }

  const evaluation = existing ? await loadBestEvaluation(existing) : undefined;
  const observations = existing ? await loadObservations(existing.id) : [];
  const progress = progressFrom(challenge, item, existing, evaluation, rank);

  let latestEvaluation: ChallengeAttemptView["latestEvaluation"];
  if (evaluation && existing) {
    const ranked = await rankedEvaluationsFor(challenge.slug);
    const standing = rankForAttempt(ranked, existing.id);
    latestEvaluation = {
      ...scoreFromEvaluation(evaluation),
      shareCode: existing.shareCode,
      rank: standing?.rank,
      percentile: standing
        ? percentileFor(standing.rank, standing.competitorCount)
        : undefined,
      createdAt: evaluation.createdAt.toISOString(),
    };
  }

  return {
    challenge: item,
    progress,
    observations,
    latestEvaluation,
    aiAllowed: true,
    localTestHint:
      "Test against your notebook with `chofex challenge test black-box --source ./shipping.js`. Official evaluation consumes one attempt.",
  };
};

export const queryChallenge = async (
  clerkUserId: string,
  slug: string,
  rawInput: unknown,
  now: Date = currentChallengeTime(),
): Promise<ChallengeQueryResult> => {
  const challenge = requireImplementedChallenge(slug, now);
  const input = parseInput(ShipmentSchema, rawInput) as Shipment;
  const participantId = await participantIdFor(clerkUserId);
  const attempt = await attemptFor(participantId, challenge);
  const seed = attemptSeed(participantId, challenge.slug);

  const [consumed] = await db
    .update(challengeAttempts)
    .set({
      queriesUsed: sql`${challengeAttempts.queriesUsed} + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(challengeAttempts.id, attempt.id),
        sql`${challengeAttempts.queriesUsed} < ${challengeAttempts.queriesLimit}`,
      ),
    )
    .returning();

  if (!consumed) {
    throw new HttpError(
      429,
      "QUERY_LIMIT_REACHED",
      `No Black Box queries remaining (${attempt.queriesLimit}/${attempt.queriesLimit})`,
    );
  }

  const output = oraclePriceForSeed(seed, input);
  const [observation] = await db
    .insert(challengeObservations)
    .values({
      attemptId: attempt.id,
      sequence: consumed.queriesUsed,
      input,
      output,
    })
    .returning();
  if (!observation) throw new Error("Observation insert returned no row");

  return {
    observation: observationView(observation),
    queriesUsed: consumed.queriesUsed,
    queriesRemaining: consumed.queriesLimit - consumed.queriesUsed,
    queriesLimit: consumed.queriesLimit,
  };
};

const numericOutput = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
};

export const testChallengeSolution = async (
  clerkUserId: string,
  slug: string,
  rawInput: unknown,
  now: Date = currentChallengeTime(),
): Promise<ChallengeLocalTestResult> => {
  const challenge = requireImplementedChallenge(slug, now);
  const solution = parseInput(ChallengeSolutionSchema, rawInput);
  const participantId = await participantIdFor(clerkUserId);
  const attempt = await attemptFor(participantId, challenge);
  const observations = await loadObservations(attempt.id);
  if (observations.length === 0) {
    throw new HttpError(
      422,
      "NO_OBSERVATIONS",
      "Query the Black Box before running local tests",
    );
  }

  const shipments = observations.map((row) =>
    parseInput(ShipmentSchema, row.input),
  );
  const actual = runShippingSolution(solution.source, shipments);
  const mismatches: Array<{
    sequence: number;
    expected: unknown;
    actual: unknown;
  }> = [];
  let exactCount = 0;
  let absoluteError = 0;

  for (const [index, observation] of observations.entries()) {
    const expected = numericOutput(observation.output);
    const predicted = actual[index];
    if (expected === undefined || predicted === undefined) {
      mismatches.push({
        sequence: observation.sequence,
        expected: observation.output,
        actual: predicted,
      });
      continue;
    }
    if (expected === predicted) exactCount += 1;
    else {
      mismatches.push({
        sequence: observation.sequence,
        expected,
        actual: predicted,
      });
    }
    absoluteError += Math.abs(expected - predicted);
  }

  return {
    matchedObservations: exactCount,
    observationCount: observations.length,
    accuracy: exactCount / observations.length,
    meanError: absoluteError / observations.length,
    mismatches: mismatches.slice(0, 20),
  };
};

export const evaluateChallenge = async (
  clerkUserId: string,
  slug: string,
  rawInput: unknown,
  now: Date = currentChallengeTime(),
): Promise<ChallengeEvaluationResult> => {
  const challenge = requireImplementedChallenge(slug, now);
  const solution = parseInput(ChallengeSolutionSchema, rawInput);
  const participantId = await participantIdFor(clerkUserId);
  const attempt = await attemptFor(participantId, challenge);
  const seed = attemptSeed(participantId, challenge.slug);

  const [consumed] = await db
    .update(challengeAttempts)
    .set({
      evaluationsUsed: sql`${challengeAttempts.evaluationsUsed} + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(challengeAttempts.id, attempt.id),
        sql`${challengeAttempts.evaluationsUsed} < ${challengeAttempts.evaluationsLimit}`,
      ),
    )
    .returning();

  if (!consumed) {
    throw new HttpError(
      429,
      "EVALUATION_LIMIT_REACHED",
      `No official evaluations remaining (${attempt.evaluationsLimit}/${attempt.evaluationsLimit})`,
    );
  }

  const shipments = hiddenShipmentsForSeed(seed, challenge.hiddenSampleSize);
  const expected = shipments.map((input) => oraclePriceForSeed(seed, input));
  const startedAt = Date.now();
  const actual = runShippingSolution(solution.source, shipments);
  const runtimeMs = Date.now() - startedAt;
  const score = scoreFromPredictions(
    expected,
    actual,
    consumed.queriesUsed,
    runtimeMs,
  );

  const [evaluation] = await db
    .insert(challengeEvaluations)
    .values({
      attemptId: attempt.id,
      solutionKind: solution.kind,
      solution,
      accuracy: score.accuracy,
      exactCount: score.exactCount,
      sampleSize: score.sampleSize,
      meanError: score.meanError,
      queriesUsed: score.queriesUsed,
      runtimeMs: score.runtimeMs,
    })
    .returning();
  if (!evaluation) throw new Error("Evaluation insert returned no row");

  const currentBest = await loadBestEvaluation(consumed);
  if (isBetterScore(score, currentBest && scoreFromEvaluation(currentBest))) {
    await db
      .update(challengeAttempts)
      .set({
        bestEvaluationId: evaluation.id,
        updatedAt: new Date(),
      })
      .where(eq(challengeAttempts.id, attempt.id));
  }

  const ranked = await rankedEvaluationsFor(challenge.slug);
  const standing = rankForAttempt(ranked, attempt.id) ?? {
    rank: ranked.length + 1,
    competitorCount: Math.max(ranked.length, 1),
  };

  return {
    ...score,
    shareCode: consumed.shareCode,
    rank: standing.rank,
    competitorCount: standing.competitorCount,
    percentile: percentileFor(standing.rank, standing.competitorCount),
    evaluationsUsed: consumed.evaluationsUsed,
    evaluationsRemaining: consumed.evaluationsLimit - consumed.evaluationsUsed,
    evaluationsLimit: consumed.evaluationsLimit,
    rankingPath: rankingPathFor(challenge.slug),
    shareText: shareTextFor(challenge, {
      accuracy: score.accuracy,
      queriesUsed: score.queriesUsed,
      rank: standing.rank,
      competitorCount: standing.competitorCount,
      shareCode: consumed.shareCode,
    }),
  };
};
