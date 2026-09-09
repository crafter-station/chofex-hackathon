CREATE TYPE "public"."application_status" AS ENUM('draft', 'submitted', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TABLE "acceptance_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"phone" varchar(32),
	"date_of_birth" date,
	"national_id_number" text,
	"shirt_size" "shirt_size",
	"dietary_restrictions" text,
	"accessibility_needs" text,
	"emergency_contact_name" varchar(200),
	"emergency_contact_phone" varchar(32),
	"media_consent" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'draft' NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"email" varchar(320),
	"pronouns" varchar(50),
	"country_code" varchar(2),
	"city" varchar(120),
	"participation_mode" "participation_mode",
	"organization" varchar(200),
	"role" varchar(120),
	"field_of_study" varchar(160),
	"graduation_year" integer,
	"experience_level" "experience_level",
	"skills" text[],
	"bio" text,
	"github_url" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"team_preference" "team_preference",
	"team_name" varchar(120),
	"code_of_conduct_accepted_at" timestamp with time zone,
	"privacy_policy_accepted_at" timestamp with time zone,
	"media_consent" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"decided_by_clerk_user_id" varchar(255),
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "applications" (
	"id",
	"participant_id",
	"status",
	"first_name",
	"last_name",
	"email",
	"pronouns",
	"country_code",
	"city",
	"participation_mode",
	"organization",
	"role",
	"field_of_study",
	"graduation_year",
	"experience_level",
	"skills",
	"bio",
	"github_url",
	"linkedin_url",
	"portfolio_url",
	"team_preference",
	"team_name",
	"code_of_conduct_accepted_at",
	"privacy_policy_accepted_at",
	"media_consent",
	"submitted_at",
	"created_at",
	"updated_at"
)
SELECT
	r."id",
	r."participant_id",
	CASE
		WHEN r."status" IN ('under_review', 'waitlisted') THEN 'submitted'
		ELSE r."status"::text
	END::"application_status",
	p."first_name",
	p."last_name",
	p."email",
	p."pronouns",
	p."country_code",
	p."city",
	r."participation_mode",
	r."organization",
	r."role",
	r."field_of_study",
	r."graduation_year",
	r."experience_level",
	r."skills",
	r."bio",
	r."github_url",
	r."linkedin_url",
	r."portfolio_url",
	r."team_preference",
	r."team_name",
	r."code_of_conduct_accepted_at",
	r."privacy_policy_accepted_at",
	r."media_consent",
	r."submitted_at",
	r."created_at",
	r."updated_at"
FROM "registrations" r
INNER JOIN "participants" p ON p."id" = r."participant_id";
--> statement-breakpoint
INSERT INTO "acceptance_details" (
	"application_id",
	"phone",
	"date_of_birth",
	"shirt_size",
	"dietary_restrictions",
	"accessibility_needs",
	"emergency_contact_name",
	"emergency_contact_phone",
	"media_consent",
	"checked_in_at",
	"created_at",
	"updated_at"
)
SELECT
	r."id",
	p."phone",
	p."date_of_birth",
	r."shirt_size",
	r."dietary_restrictions",
	r."accessibility_needs",
	r."emergency_contact_name",
	r."emergency_contact_phone",
	r."media_consent",
	r."checked_in_at",
	r."created_at",
	r."updated_at"
FROM "registrations" r
INNER JOIN "participants" p ON p."id" = r."participant_id"
WHERE r."status" = 'accepted';
--> statement-breakpoint
DROP TABLE "registrations" CASCADE;--> statement-breakpoint
ALTER TABLE "acceptance_details" ADD CONSTRAINT "acceptance_details_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "acceptance_details_application_id_unique" ON "acceptance_details" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "applications_one_active_per_participant" ON "applications" USING btree ("participant_id") WHERE "applications"."status" in ('draft', 'submitted', 'accepted');--> statement-breakpoint
CREATE INDEX "applications_status_index" ON "applications" USING btree ("status");--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN "date_of_birth";--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN "pronouns";--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN "country_code";--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN "city";--> statement-breakpoint
DROP TYPE "public"."registration_status";
