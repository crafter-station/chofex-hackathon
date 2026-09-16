CREATE TABLE "challenge_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"challenge_slug" varchar(64) NOT NULL,
	"share_code" varchar(8) NOT NULL,
	"queries_used" integer DEFAULT 0 NOT NULL,
	"queries_limit" integer NOT NULL,
	"evaluations_used" integer DEFAULT 0 NOT NULL,
	"evaluations_limit" integer NOT NULL,
	"best_evaluation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"solution_kind" varchar(32) NOT NULL,
	"solution" jsonb NOT NULL,
	"accuracy" double precision NOT NULL,
	"exact_count" integer NOT NULL,
	"sample_size" integer NOT NULL,
	"mean_error" double precision NOT NULL,
	"queries_used" integer NOT NULL,
	"runtime_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"input" jsonb NOT NULL,
	"output" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD CONSTRAINT "challenge_attempts_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_evaluations" ADD CONSTRAINT "challenge_evaluations_attempt_id_challenge_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."challenge_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_observations" ADD CONSTRAINT "challenge_observations_attempt_id_challenge_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."challenge_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_attempts_participant_slug_unique" ON "challenge_attempts" USING btree ("participant_id","challenge_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_attempts_share_code_unique" ON "challenge_attempts" USING btree ("share_code");--> statement-breakpoint
CREATE INDEX "challenge_attempts_slug_index" ON "challenge_attempts" USING btree ("challenge_slug");--> statement-breakpoint
CREATE INDEX "challenge_evaluations_attempt_id_index" ON "challenge_evaluations" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "challenge_evaluations_ranking_index" ON "challenge_evaluations" USING btree ("attempt_id","accuracy","exact_count","queries_used","runtime_ms");--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_observations_attempt_sequence_unique" ON "challenge_observations" USING btree ("attempt_id","sequence");--> statement-breakpoint
CREATE INDEX "challenge_observations_attempt_id_index" ON "challenge_observations" USING btree ("attempt_id");