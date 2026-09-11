CREATE TYPE "public"."badge_generation_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "participant_badges" (
	"application_id" uuid PRIMARY KEY NOT NULL,
	"status" "badge_generation_status" DEFAULT 'pending' NOT NULL,
	"trigger_run_id" text,
	"pixel_art_url" text,
	"pixel_art_pathname" text,
	"badge_url" text,
	"badge_pathname" text,
	"error" text,
	"notification_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "participant_badges" ADD CONSTRAINT "participant_badges_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;