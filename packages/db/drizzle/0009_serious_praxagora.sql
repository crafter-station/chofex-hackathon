DROP INDEX "challenge_attempts_participant_slug_unique";--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD COLUMN "challenge_version" varchar(64) DEFAULT 'black-box-v1' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_attempts_participant_slug_version_unique" ON "challenge_attempts" USING btree ("participant_id","challenge_slug","challenge_version");