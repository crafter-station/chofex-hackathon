ALTER TABLE "acceptance_details" DROP CONSTRAINT "acceptance_details_completed_fields_required";--> statement-breakpoint
ALTER TABLE "acceptance_details" ADD COLUMN "full_name" varchar(200);--> statement-breakpoint
UPDATE "acceptance_details"
SET "full_name" = trim(concat_ws(' ', "applications"."first_name", "applications"."last_name"))
FROM "applications"
WHERE "acceptance_details"."application_id" = "applications"."id"
  AND "acceptance_details"."completed_at" is not null
  AND "acceptance_details"."full_name" is null;--> statement-breakpoint
ALTER TABLE "acceptance_details" ADD CONSTRAINT "acceptance_details_completed_fields_required" CHECK ("acceptance_details"."completed_at" is null or (
        "acceptance_details"."full_name" is not null and
        "acceptance_details"."phone" is not null and
        "acceptance_details"."date_of_birth" is not null and
        "acceptance_details"."national_id_number" is not null and
        "acceptance_details"."emergency_contact_name" is not null and
        "acceptance_details"."emergency_contact_phone" is not null
      ));
