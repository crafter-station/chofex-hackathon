import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { auditTimestamps } from "./common";
import { participants } from "./participants";

export const challengeAttempts = pgTable(
  "challenge_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    challengeSlug: varchar("challenge_slug", { length: 64 }).notNull(),
    shareCode: varchar("share_code", { length: 8 }).notNull(),
    queriesUsed: integer("queries_used").default(0).notNull(),
    queriesLimit: integer("queries_limit").notNull(),
    evaluationsUsed: integer("evaluations_used").default(0).notNull(),
    evaluationsLimit: integer("evaluations_limit").notNull(),
    bestEvaluationId: uuid("best_evaluation_id"),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("challenge_attempts_participant_slug_unique").on(
      table.participantId,
      table.challengeSlug,
    ),
    uniqueIndex("challenge_attempts_share_code_unique").on(table.shareCode),
    index("challenge_attempts_slug_index").on(table.challengeSlug),
  ],
);

export const challengeObservations = pgTable(
  "challenge_observations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => challengeAttempts.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    input: jsonb("input").notNull(),
    output: jsonb("output").notNull(),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("challenge_observations_attempt_sequence_unique").on(
      table.attemptId,
      table.sequence,
    ),
    index("challenge_observations_attempt_id_index").on(table.attemptId),
  ],
);

export const challengeEvaluations = pgTable(
  "challenge_evaluations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => challengeAttempts.id, { onDelete: "cascade" }),
    solutionKind: varchar("solution_kind", { length: 32 }).notNull(),
    solution: jsonb("solution").notNull(),
    accuracy: doublePrecision("accuracy").notNull(),
    exactCount: integer("exact_count").notNull(),
    sampleSize: integer("sample_size").notNull(),
    meanError: doublePrecision("mean_error").notNull(),
    queriesUsed: integer("queries_used").notNull(),
    runtimeMs: integer("runtime_ms").notNull(),
    ...auditTimestamps(),
  },
  (table) => [
    index("challenge_evaluations_attempt_id_index").on(table.attemptId),
    index("challenge_evaluations_ranking_index").on(
      table.attemptId,
      table.accuracy,
      table.exactCount,
      table.queriesUsed,
      table.runtimeMs,
    ),
  ],
);

export type ChallengeAttempt = typeof challengeAttempts.$inferSelect;
export type ChallengeObservation = typeof challengeObservations.$inferSelect;
export type ChallengeEvaluation = typeof challengeEvaluations.$inferSelect;
