import { playableChallenges } from "@chofex/challenges-contract";
import type { db } from "@chofex/db";
import { sql } from "@chofex/db/orm";

import { currentChallengeVersion } from "./engine";

export interface ChallengeActivityCounts {
  readonly completed: number;
  readonly inProgress: number;
}

export type ChallengeMetricsDatabase = Pick<typeof db, "execute">;

interface ChallengeActivityCountsRow extends Record<string, unknown> {
  readonly completed: number;
  readonly in_progress: number;
}

const metricsDatabase = async (
  database: ChallengeMetricsDatabase | undefined,
): Promise<ChallengeMetricsDatabase> => {
  if (database) return database;
  return (await import("@chofex/db")).db;
};

export const challengeActivityCounts = async (
  database?: ChallengeMetricsDatabase,
): Promise<ChallengeActivityCounts> => {
  const playableSlugs = playableChallenges.map((challenge) => challenge.slug);
  if (playableSlugs.length === 0) return { completed: 0, inProgress: 0 };

  const playableSlugList = sql.join(
    playableSlugs.map((slug) => sql`${slug}`),
    sql.raw(", "),
  );
  const client = await metricsDatabase(database);
  const result = await client.execute<ChallengeActivityCountsRow>(sql`
    select
      count(*) filter (
        where exists (
          select 1
          from "challenge_evaluations" as evaluation
          where evaluation."attempt_id" = attempt."id"
        )
      )::integer as "completed",
      count(*) filter (
        where
          not exists (
            select 1
            from "challenge_evaluations" as evaluation
            where evaluation."attempt_id" = attempt."id"
          )
          and (
            attempt."queries_used" > 0
            or attempt."evaluations_used" > 0
          )
      )::integer as "in_progress"
    from "challenge_attempts" as attempt
    where
      attempt."challenge_version" = ${currentChallengeVersion}
      and attempt."challenge_slug" in (${playableSlugList})
      and exists (
        select 1
        from "applications" as application
        where application."participant_id" = attempt."participant_id"
      )
  `);
  const row = result.rows[0];
  return {
    completed: row?.completed ?? 0,
    inProgress: row?.in_progress ?? 0,
  };
};
