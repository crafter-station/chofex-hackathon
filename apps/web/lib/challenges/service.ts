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
} from "@chofex/challenges-contract";
import { db } from "@chofex/db";
import { and, asc, desc, eq, inArray, sql } from "@chofex/db/orm";
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
import {
  challengeEngine,
  ChallengeEngineError,
  currentChallengeVersion,
} from "./engine";
import { challengeProgressStatus } from "./progress";
import { rankedEvaluationsFor, rankForAttempt } from "./ranking";
import { runShippingSolution } from "./sandbox";
import { attemptSeed, shareCodeFromSeed } from "./seed";

type AttemptRecord = typeof challengeAttempts.$inferSelect;
type EvaluationRecord = typeof challengeEvaluations.$inferSelect;

const engineHttpError = (error: ChallengeEngineError): HttpError => {
  if (error.status === 422 && error.code === "SOLUTION_EXECUTION_FAILED") {
    return new HttpError(422, error.code, error.message, false);
  }
  return new HttpError(
    503,
    "CHALLENGE_ENGINE_UNAVAILABLE",
    "The challenge engine is temporarily unavailable",
  );
};

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
  const seed = attemptSeed(
    participantId,
    `${challenge.slug}:${currentChallengeVersion}`,
  );
  for (let length = 4; length <= 8; length += 1) {
    try {
      const [created] = await db
        .insert(challengeAttempts)
        .values({
          participantId,
          challengeSlug: challenge.slug,
          challengeVersion: currentChallengeVersion,
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
            eq(challengeAttempts.challengeVersion, currentChallengeVersion),
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
        eq(challengeAttempts.challengeVersion, currentChallengeVersion),
      ),
    )
    .limit(1);
  if (existing) return existing;
  return createAttempt(participantId, challenge);
};

const progressStatus = (
  attempt: AttemptRecord | undefined,
  evaluation: EvaluationRecord | undefined,
): ParticipantChallengeProgress["status"] => {
  return challengeProgressStatus({
    hasPersistedEvaluation: Boolean(evaluation),
    queriesUsed: attempt?.queriesUsed ?? 0,
    evaluationsUsed: attempt?.evaluationsUsed ?? 0,
  });
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
  status: progressStatus(attempt, evaluation),
  open: item.open,
  playable: challenge.playable,
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
  const [evaluation] = await db
    .select()
    .from(challengeEvaluations)
    .where(eq(challengeEvaluations.attemptId, attempt.id))
    .orderBy(
      desc(challengeEvaluations.accuracy),
      desc(challengeEvaluations.exactCount),
      asc(challengeEvaluations.queriesUsed),
      asc(challengeEvaluations.runtimeMs),
      asc(challengeEvaluations.createdAt),
      asc(challengeEvaluations.id),
    )
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

export const challengeProgressForParticipants = async (
  participantIds: ReadonlyArray<string>,
  now: Date = currentChallengeTime(),
): Promise<
  ReadonlyMap<string, ReadonlyArray<ParticipantChallengeProgress>>
> => {
  const uniqueParticipantIds = [...new Set(participantIds)];
  if (uniqueParticipantIds.length === 0) return new Map();

  const attempts = await db
    .select()
    .from(challengeAttempts)
    .where(
      and(
        inArray(challengeAttempts.participantId, uniqueParticipantIds),
        eq(challengeAttempts.challengeVersion, currentChallengeVersion),
      ),
    );

  const attemptIds = attempts.map((attempt) => attempt.id);
  let evaluations: ReadonlyArray<EvaluationRecord> = [];
  if (attemptIds.length > 0) {
    evaluations = await db
      .select()
      .from(challengeEvaluations)
      .where(inArray(challengeEvaluations.attemptId, attemptIds));
  }
  const evaluationByAttemptId = new Map<string, EvaluationRecord>();
  for (const evaluation of evaluations) {
    const current = evaluationByAttemptId.get(evaluation.attemptId);
    if (
      !current ||
      compareChallengeScores(
        scoreFromEvaluation(evaluation),
        scoreFromEvaluation(current),
      ) < 0
    ) {
      evaluationByAttemptId.set(evaluation.attemptId, evaluation);
    }
  }

  const rankedSlugs = [
    ...new Set(
      attempts.flatMap((attempt) => {
        if (evaluationByAttemptId.has(attempt.id))
          return [attempt.challengeSlug];
        return [];
      }),
    ),
  ];
  const rankings = await Promise.all(
    rankedSlugs.map(
      async (slug) => [slug, await rankedEvaluationsFor(slug)] as const,
    ),
  );
  const rankByAttemptId = new Map<string, number>();
  for (const [, ranked] of rankings) {
    for (const [index, entry] of ranked.entries()) {
      rankByAttemptId.set(entry.attemptId, index + 1);
    }
  }

  const progressByParticipant = new Map<
    string,
    ReadonlyArray<ParticipantChallengeProgress>
  >();
  for (const participantId of uniqueParticipantIds) {
    const attemptBySlug = new Map(
      attempts
        .filter((attempt) => attempt.participantId === participantId)
        .map((attempt) => [attempt.challengeSlug, attempt]),
    );
    const progress = challengeCatalog.map((challenge) => {
      const item = catalogItemFor(challenge, now, challengesForceOpen());
      const attempt = attemptBySlug.get(challenge.slug);
      let evaluation: EvaluationRecord | undefined;
      if (attempt) evaluation = evaluationByAttemptId.get(attempt.id);
      const rank = attempt ? rankByAttemptId.get(attempt.id) : undefined;
      return progressFrom(challenge, item, attempt, evaluation, rank);
    });
    progressByParticipant.set(participantId, progress);
  }
  return progressByParticipant;
};

export const challengeProgressForParticipant = async (
  participantId: string,
  now: Date = currentChallengeTime(),
): Promise<Array<ParticipantChallengeProgress>> => {
  const progressByParticipant = await challengeProgressForParticipants(
    [participantId],
    now,
  );
  return [...(progressByParticipant.get(participantId) ?? [])];
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
        eq(challengeAttempts.challengeVersion, currentChallengeVersion),
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
    let percentile: number | undefined;
    if (standing) {
      percentile = percentileFor(standing.rank, standing.competitorCount);
    }
    latestEvaluation = {
      ...scoreFromEvaluation(evaluation),
      shareCode: existing.shareCode,
      rank: standing?.rank,
      percentile,
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

  let output: number;
  try {
    output = await challengeEngine().query(attempt.id, input);
  } catch (error) {
    if (error instanceof ChallengeEngineError) {
      throw engineHttpError(error);
    }
    throw error;
  }
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
  const actual = await runShippingSolution(solution.source, shipments);
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

  let score: ChallengeScore;
  try {
    score = await challengeEngine().evaluate(
      attempt.id,
      solution.source,
      consumed.queriesUsed,
    );
  } catch (error) {
    if (error instanceof ChallengeEngineError) {
      throw engineHttpError(error);
    }
    throw error;
  }

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

  await db.execute(sql`
    update "challenge_attempts"
    set
      "best_evaluation_id" = (
        select "id"
        from "challenge_evaluations"
        where "attempt_id" = ${attempt.id}
        order by
          "accuracy" desc,
          "exact_count" desc,
          "queries_used" asc,
          "runtime_ms" asc,
          "created_at" asc,
          "id" asc
        limit 1
      ),
      "updated_at" = now()
    where "id" = ${attempt.id}
  `);

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
