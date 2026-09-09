CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."participation_mode" AS ENUM('in_person', 'remote');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('draft', 'submitted', 'under_review', 'waitlisted', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."shirt_size" AS ENUM('xs', 's', 'm', 'l', 'xl', '2xl', '3xl', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."team_preference" AS ENUM('have_team', 'looking_for_team', 'solo');--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(32),
	"date_of_birth" date,
	"pronouns" varchar(50),
	"country_code" varchar(2),
	"city" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"status" "registration_status" DEFAULT 'draft' NOT NULL,
	"participation_mode" "participation_mode" DEFAULT 'in_person' NOT NULL,
	"organization" varchar(200),
	"role" varchar(120),
	"field_of_study" varchar(160),
	"graduation_year" integer,
	"experience_level" "experience_level",
	"skills" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"bio" text,
	"github_url" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"team_preference" "team_preference",
	"team_name" varchar(120),
	"shirt_size" "shirt_size",
	"dietary_restrictions" text,
	"accessibility_needs" text,
	"emergency_contact_name" varchar(200),
	"emergency_contact_phone" varchar(32),
	"code_of_conduct_accepted_at" timestamp with time zone,
	"privacy_policy_accepted_at" timestamp with time zone,
	"media_consent" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "participants_clerk_user_id_unique" ON "participants" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_participant_id_unique" ON "registrations" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "registrations_status_index" ON "registrations" USING btree ("status");