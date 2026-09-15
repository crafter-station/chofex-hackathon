import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import {
  completeEvaluationReservation,
  completeQueryReservation,
  consumeFailedEvaluationReservation,
  type ReservationDatabase,
  releaseChallengeReservation,
  reserveChallengeUse,
} from "./reservations";

const migration = readFileSync(
  new URL(
    "../../../../packages/db/drizzle/0010_strong_blackheart.sql",
    import.meta.url,
  ),
  "utf8",
).replaceAll("--> statement-breakpoint", "");

describe("challenge reservations", () => {
  let client: PGlite;
  let database: ReservationDatabase;
  let attemptId: string;

  beforeEach(async () => {
    client = new PGlite();
    await client.exec(`
      create table challenge_attempts (
        id uuid primary key,
        share_code varchar(8) not null,
        queries_used integer default 0 not null,
        queries_limit integer not null,
        evaluations_used integer default 0 not null,
        evaluations_limit integer not null,
        best_evaluation_id uuid,
        updated_at timestamp with time zone default now() not null
      );
      create table challenge_observations (
        id uuid primary key default gen_random_uuid(),
        attempt_id uuid not null references challenge_attempts(id),
        sequence integer not null,
        input jsonb not null,
        output jsonb not null,
        created_at timestamp with time zone default now() not null,
        updated_at timestamp with time zone default now() not null,
        unique (attempt_id, sequence)
      );
      create table challenge_evaluations (
        id uuid primary key default gen_random_uuid(),
        attempt_id uuid not null references challenge_attempts(id),
        solution_kind varchar(32) not null,
        solution jsonb not null,
        accuracy double precision not null,
        exact_count integer not null,
        sample_size integer not null,
        mean_error double precision not null,
        queries_used integer not null,
        runtime_ms integer not null,
        created_at timestamp with time zone default now() not null,
        updated_at timestamp with time zone default now() not null
      );
    `);
    await client.exec(migration);
    const drizzleDatabase = drizzle(client);
    database = drizzleDatabase as unknown as ReservationDatabase;
    attemptId = crypto.randomUUID();
    await client.query(
      `insert into challenge_attempts (
        id,
        share_code,
        queries_limit,
        evaluations_limit
      ) values ($1, 'ABCD', 25, 3)`,
      [attemptId],
    );
  });

  afterEach(async () => {
    await client.close();
  });

  test("bounds concurrent work and commits only persisted queries", async () => {
    const reservations = await Promise.all(
      Array.from({ length: 30 }, () =>
        reserveChallengeUse(attemptId, "query", database),
      ),
    );
    const admitted = reservations.filter(
      (reservation) => reservation !== undefined,
    );
    expect(admitted).toHaveLength(25);

    const first = admitted[0];
    const second = admitted[1];
    if (!first || !second) throw new Error("missing reservations");
    await releaseChallengeReservation(first, "query", database);
    const completed = await completeQueryReservation(
      second,
      { distanceKm: 10 },
      42,
      database,
    );
    expect(completed?.queriesUsed).toBe(1);
    expect(completed?.observation.sequence).toBe(1);

    const replacement = await reserveChallengeUse(attemptId, "query", database);
    expect(replacement?.queriesUsed).toBe(1);
  });

  test("keeps budget when observation persistence fails", async () => {
    const reservation = await reserveChallengeUse(attemptId, "query", database);
    if (!reservation) throw new Error("missing reservation");
    await client.exec("drop table challenge_observations");

    await expect(
      completeQueryReservation(reservation, { distanceKm: 10 }, 42, database),
    ).rejects.toThrow();
    const result = await client.query<{
      queries_used: number;
      queries_pending: number;
    }>(
      "select queries_used, queries_pending from challenge_attempts where id = $1",
      [attemptId],
    );
    expect(result.rows[0]).toEqual({ queries_used: 0, queries_pending: 1 });

    await releaseChallengeReservation(reservation, "query", database);
    const replacement = await reserveChallengeUse(attemptId, "query", database);
    expect(replacement).toBeDefined();
  });

  test("keeps sequences monotonic while old workers are still running", async () => {
    const oldWorkerUpdate = await client.query<{
      queries_used: number;
      query_sequence: number;
    }>(
      `update challenge_attempts
      set queries_used = queries_used + 1
      where id = $1
      returning queries_used, query_sequence`,
      [attemptId],
    );
    const oldWorker = oldWorkerUpdate.rows[0];
    if (!oldWorker) throw new Error("missing attempt");
    expect(oldWorker.query_sequence).toBe(oldWorker.queries_used);
    await client.query(
      `insert into challenge_observations (
        attempt_id,
        sequence,
        input,
        output
      ) values ($1, $2, '{}', '1')`,
      [attemptId, oldWorker.queries_used],
    );

    const reservation = await reserveChallengeUse(attemptId, "query", database);
    if (!reservation) throw new Error("missing reservation");
    const completed = await completeQueryReservation(
      reservation,
      { distanceKm: 20 },
      2,
      database,
    );
    expect(completed?.observation.sequence).toBe(2);
  });

  test("database limits protect reservations from old workers", async () => {
    const queryReservations = await Promise.all(
      Array.from({ length: 25 }, () =>
        reserveChallengeUse(attemptId, "query", database),
      ),
    );
    expect(queryReservations.every(Boolean)).toBe(true);
    await expect(
      client.query(
        `update challenge_attempts
        set queries_used = queries_used + 1
        where id = $1`,
        [attemptId],
      ),
    ).rejects.toThrow("challenge query limit exceeded");

    const evaluationReservations = await Promise.all(
      Array.from({ length: 3 }, () =>
        reserveChallengeUse(attemptId, "evaluation", database),
      ),
    );
    expect(evaluationReservations.every(Boolean)).toBe(true);
    await expect(
      client.query(
        `update challenge_attempts
        set evaluations_used = evaluations_used + 1
        where id = $1`,
        [attemptId],
      ),
    ).rejects.toThrow("challenge evaluation limit exceeded");
  });

  test("reclaims expired reservations after process termination", async () => {
    const reservations = await Promise.all(
      Array.from({ length: 25 }, () =>
        reserveChallengeUse(attemptId, "query", database),
      ),
    );
    expect(reservations.every(Boolean)).toBe(true);
    await client.query(
      "update challenge_reservations set expires_at = now() - interval '1 second'",
    );

    const replacement = await reserveChallengeUse(attemptId, "query", database);
    expect(replacement).toBeDefined();
    const result = await client.query<{
      queries_used: number;
      queries_pending: number;
    }>(
      "select queries_used, queries_pending from challenge_attempts where id = $1",
      [attemptId],
    );
    expect(result.rows[0]).toEqual({ queries_used: 0, queries_pending: 1 });
  });

  test("atomically persists successful and confirmed failed evaluations", async () => {
    const successful = await reserveChallengeUse(
      attemptId,
      "evaluation",
      database,
    );
    if (!successful) throw new Error("missing reservation");
    const completion = await completeEvaluationReservation(
      successful,
      { kind: "javascript_source", source: "return 42" },
      {
        accuracy: 1,
        exactCount: 1_000,
        sampleSize: 1_000,
        meanError: 0,
        queriesUsed: 10,
        runtimeMs: 5,
      },
      database,
    );
    expect(completion?.evaluationsUsed).toBe(1);

    const failed = await reserveChallengeUse(attemptId, "evaluation", database);
    if (!failed) throw new Error("missing reservation");
    const failedCompletion = await consumeFailedEvaluationReservation(
      failed,
      database,
    );
    expect(failedCompletion?.evaluationsUsed).toBe(2);

    const result = await client.query<{
      evaluations: number;
      best_evaluation_id: string | null;
    }>(
      `select
        (select count(*)::integer from challenge_evaluations) as evaluations,
        best_evaluation_id
      from challenge_attempts
      where id = $1`,
      [attemptId],
    );
    expect(result.rows[0]?.evaluations).toBe(1);
    expect(result.rows[0]?.best_evaluation_id).not.toBeNull();
  });

  test("keeps the better evaluation when completions race", async () => {
    const better = await reserveChallengeUse(attemptId, "evaluation", database);
    const worse = await reserveChallengeUse(attemptId, "evaluation", database);
    if (!better || !worse) throw new Error("missing reservations");

    await Promise.all([
      completeEvaluationReservation(
        better,
        { kind: "javascript_source", source: "return 1" },
        {
          accuracy: 1,
          exactCount: 1_000,
          sampleSize: 1_000,
          meanError: 0,
          queriesUsed: 10,
          runtimeMs: 5,
        },
        database,
      ),
      completeEvaluationReservation(
        worse,
        { kind: "javascript_source", source: "return 0" },
        {
          accuracy: 0.5,
          exactCount: 500,
          sampleSize: 1_000,
          meanError: 10,
          queriesUsed: 5,
          runtimeMs: 1,
        },
        database,
      ),
    ]);

    const result = await client.query<{ accuracy: number }>(
      `select evaluation.accuracy
      from challenge_attempts as attempt
      join challenge_evaluations as evaluation
        on evaluation.id = attempt.best_evaluation_id
      where attempt.id = $1`,
      [attemptId],
    );
    expect(result.rows[0]?.accuracy).toBe(1);
  });
});
