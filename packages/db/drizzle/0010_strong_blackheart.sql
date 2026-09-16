CREATE TABLE "challenge_best_evaluations" (
	"attempt_id" uuid PRIMARY KEY NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"accuracy" double precision NOT NULL,
	"exact_count" integer NOT NULL,
	"queries_used" integer NOT NULL,
	"runtime_ms" integer NOT NULL,
	"evaluated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_reservations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"attempt_id" uuid NOT NULL,
	"kind" varchar(16) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD COLUMN "query_sequence" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD COLUMN "queries_pending" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD COLUMN "evaluations_pending" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "challenge_attempts" SET "query_sequence" = "queries_used";--> statement-breakpoint
CREATE FUNCTION "advance_challenge_query_sequence"() RETURNS trigger AS $$
BEGIN
	IF NEW."queries_used" > OLD."queries_used" THEN
		NEW."query_sequence" := GREATEST(
			NEW."query_sequence",
			OLD."query_sequence" + (NEW."queries_used" - OLD."queries_used")
		);
	ELSE
		NEW."query_sequence" := GREATEST(NEW."query_sequence", OLD."query_sequence");
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "challenge_attempts_query_sequence_trigger"
BEFORE UPDATE OF "queries_used", "query_sequence" ON "challenge_attempts"
FOR EACH ROW EXECUTE FUNCTION "advance_challenge_query_sequence"();--> statement-breakpoint
CREATE FUNCTION "enforce_challenge_usage_limits"() RETURNS trigger AS $$
BEGIN
	IF NEW."queries_used" + NEW."queries_pending" > NEW."queries_limit" THEN
		RAISE EXCEPTION 'challenge query limit exceeded' USING ERRCODE = '23514';
	END IF;
	IF NEW."evaluations_used" + NEW."evaluations_pending" > NEW."evaluations_limit" THEN
		RAISE EXCEPTION 'challenge evaluation limit exceeded' USING ERRCODE = '23514';
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "challenge_attempts_usage_limit_insert_trigger"
BEFORE INSERT ON "challenge_attempts"
FOR EACH ROW EXECUTE FUNCTION "enforce_challenge_usage_limits"();--> statement-breakpoint
CREATE TRIGGER "challenge_attempts_usage_limit_update_trigger"
BEFORE UPDATE OF
	"queries_used",
	"queries_pending",
	"queries_limit",
	"evaluations_used",
	"evaluations_pending",
	"evaluations_limit"
ON "challenge_attempts"
FOR EACH ROW EXECUTE FUNCTION "enforce_challenge_usage_limits"();--> statement-breakpoint
ALTER TABLE "challenge_best_evaluations" ADD CONSTRAINT "challenge_best_evaluations_attempt_id_challenge_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."challenge_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_best_evaluations" ADD CONSTRAINT "challenge_best_evaluations_evaluation_id_challenge_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."challenge_evaluations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_reservations" ADD CONSTRAINT "challenge_reservations_attempt_id_challenge_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."challenge_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_reservations_attempt_expiry_index" ON "challenge_reservations" USING btree ("attempt_id","expires_at");--> statement-breakpoint
INSERT INTO "challenge_best_evaluations" (
	"attempt_id",
	"evaluation_id",
	"accuracy",
	"exact_count",
	"queries_used",
	"runtime_ms",
	"evaluated_at"
)
SELECT DISTINCT ON (evaluation."attempt_id")
	evaluation."attempt_id",
	evaluation."id",
	evaluation."accuracy",
	evaluation."exact_count",
	evaluation."queries_used",
	evaluation."runtime_ms",
	evaluation."created_at"
FROM "challenge_evaluations" AS evaluation
ORDER BY
	evaluation."attempt_id",
	evaluation."accuracy" DESC,
	evaluation."exact_count" DESC,
	evaluation."queries_used" ASC,
	evaluation."runtime_ms" ASC,
	evaluation."created_at" ASC,
	evaluation."id" ASC;--> statement-breakpoint
UPDATE "challenge_attempts" AS attempt
SET "best_evaluation_id" = best."evaluation_id"
FROM "challenge_best_evaluations" AS best
WHERE attempt."id" = best."attempt_id";--> statement-breakpoint
CREATE FUNCTION "upsert_challenge_best_evaluation"() RETURNS trigger AS $$
BEGIN
	INSERT INTO "challenge_best_evaluations" (
		"attempt_id",
		"evaluation_id",
		"accuracy",
		"exact_count",
		"queries_used",
		"runtime_ms",
		"evaluated_at"
	) VALUES (
		NEW."attempt_id",
		NEW."id",
		NEW."accuracy",
		NEW."exact_count",
		NEW."queries_used",
		NEW."runtime_ms",
		NEW."created_at"
	)
	ON CONFLICT ("attempt_id") DO UPDATE
	SET
		(
			"evaluation_id",
			"accuracy",
			"exact_count",
			"queries_used",
			"runtime_ms",
			"evaluated_at"
		) = (
			SELECT
				candidate."evaluation_id",
				candidate."accuracy",
				candidate."exact_count",
				candidate."queries_used",
				candidate."runtime_ms",
				candidate."evaluated_at"
			FROM (
				VALUES
					(
						excluded."evaluation_id",
						excluded."accuracy",
						excluded."exact_count",
						excluded."queries_used",
						excluded."runtime_ms",
						excluded."evaluated_at"
					),
					(
						"challenge_best_evaluations"."evaluation_id",
						"challenge_best_evaluations"."accuracy",
						"challenge_best_evaluations"."exact_count",
						"challenge_best_evaluations"."queries_used",
						"challenge_best_evaluations"."runtime_ms",
						"challenge_best_evaluations"."evaluated_at"
					)
			) AS candidate(
				"evaluation_id",
				"accuracy",
				"exact_count",
				"queries_used",
				"runtime_ms",
				"evaluated_at"
			)
			ORDER BY
				candidate."accuracy" DESC,
				candidate."exact_count" DESC,
				candidate."queries_used" ASC,
				candidate."runtime_ms" ASC,
				candidate."evaluated_at" ASC,
				candidate."evaluation_id" ASC
			LIMIT 1
		),
		"updated_at" = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "challenge_evaluations_best_trigger"
AFTER INSERT ON "challenge_evaluations"
FOR EACH ROW EXECUTE FUNCTION "upsert_challenge_best_evaluation"();--> statement-breakpoint
CREATE FUNCTION "complete_challenge_evaluation"(
	p_reservation_id uuid,
	p_attempt_id uuid,
	p_solution_kind text,
	p_solution jsonb,
	p_accuracy double precision,
	p_exact_count integer,
	p_sample_size integer,
	p_mean_error double precision,
	p_queries_used integer,
	p_runtime_ms integer
) RETURNS TABLE (
	share_code varchar,
	evaluations_used integer,
	evaluations_limit integer
) AS $$
DECLARE
	reserved_attempt_id uuid;
	selected_best_evaluation_id uuid;
BEGIN
	DELETE FROM "challenge_reservations"
	WHERE
		"id" = p_reservation_id
		AND "attempt_id" = p_attempt_id
		AND "kind" = 'evaluation'
	RETURNING "attempt_id" INTO reserved_attempt_id;

	IF reserved_attempt_id IS NULL THEN
		RETURN;
	END IF;

	INSERT INTO "challenge_evaluations" (
		"attempt_id",
		"solution_kind",
		"solution",
		"accuracy",
		"exact_count",
		"sample_size",
		"mean_error",
		"queries_used",
		"runtime_ms"
	) VALUES (
		reserved_attempt_id,
		p_solution_kind,
		p_solution,
		p_accuracy,
		p_exact_count,
		p_sample_size,
		p_mean_error,
		p_queries_used,
		p_runtime_ms
	);

	SELECT best."evaluation_id"
	INTO selected_best_evaluation_id
	FROM "challenge_best_evaluations" AS best
	WHERE best."attempt_id" = reserved_attempt_id;

	RETURN QUERY
	UPDATE "challenge_attempts" AS attempt
	SET
		"evaluations_pending" = GREATEST(attempt."evaluations_pending" - 1, 0),
		"evaluations_used" = attempt."evaluations_used" + 1,
		"best_evaluation_id" = selected_best_evaluation_id,
		"updated_at" = now()
	WHERE attempt."id" = reserved_attempt_id
	RETURNING
		attempt."share_code",
		attempt."evaluations_used",
		attempt."evaluations_limit";
END;
$$ LANGUAGE plpgsql;
