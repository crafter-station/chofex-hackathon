import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { playableChallenges } from "@chofex/challenges-contract";
import type { db } from "@chofex/db";
import { sql } from "@chofex/db/orm";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import { currentChallengeVersion } from "../challenges/engine";
import { candidateFunnelStatusExpression } from "./funnel-status";

type FunnelStatusDatabase = Pick<typeof db, "execute">;

describe("candidate funnel status SQL", () => {
  let client: PGlite;

  beforeEach(async () => {
    client = new PGlite();
    await client.exec(`
      create table applications (
        id uuid primary key,
        participant_id uuid not null,
        status text not null,
        submitted_at timestamptz
      );
      create table challenge_attempts (
        id uuid primary key,
        participant_id uuid not null,
        challenge_slug varchar(64) not null,
        challenge_version varchar(64) not null,
        queries_used integer default 0 not null,
        evaluations_used integer default 0 not null
      );
      create table challenge_evaluations (
        id uuid primary key,
        attempt_id uuid not null references challenge_attempts(id)
      );
    `);
  });

  afterEach(async () => {
    await client.close();
  });

  test("matches the operating funnel and keeps decisions terminal", async () => {
    const playableSlug = playableChallenges[0]?.slug;
    if (!playableSlug) throw new Error("A playable challenge is required");
    const ids = Array.from(
      { length: 6 },
      (_, index) =>
        `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
    );

    await client.query(
      `insert into applications (id, participant_id, status, submitted_at)
       values
        ($1, $1, 'draft', null),
        ($2, $2, 'submitted', now()),
        ($3, $3, 'submitted', now()),
        ($4, $4, 'submitted', now()),
        ($5, $5, 'accepted', now()),
        ($6, $6, 'rejected', now())`,
      ids,
    );
    await client.query(
      `insert into challenge_attempts (
        id,
        participant_id,
        challenge_slug,
        challenge_version,
        queries_used,
        evaluations_used
      ) values
        ($1, $1, $5, $6, 1, 0),
        ($2, $2, $5, $6, 1, 1),
        ($3, $3, $5, $6, 1, 1),
        ($4, $4, $5, $6, 1, 1)`,
      [ids[2], ids[3], ids[4], ids[5], playableSlug, currentChallengeVersion],
    );
    await client.query(
      `insert into challenge_evaluations (id, attempt_id)
       values (gen_random_uuid(), $1), (gen_random_uuid(), $2), (gen_random_uuid(), $3)`,
      [ids[3], ids[4], ids[5]],
    );

    const database = drizzle(client) as unknown as FunnelStatusDatabase;
    const result = await database.execute<{ status: string }>(sql`
      select ${candidateFunnelStatusExpression()} as status
      from applications
      order by id
    `);

    expect(result.rows.map((row) => row.status)).toEqual([
      "registration_started",
      "registration_completed",
      "challenge_started",
      "challenge_completed",
      "approved",
      "declined",
    ]);

    const grouped = await database.execute<{ status: string; value: number }>(
      sql`
        select status, count(*)::integer as value
        from (
          select ${candidateFunnelStatusExpression()} as status
          from applications
        ) as funnel_summary
        group by status
        order by status
      `,
    );
    expect(grouped.rows.every((row) => row.value === 1)).toBe(true);
    expect(grouped.rows).toHaveLength(6);
  });
});
