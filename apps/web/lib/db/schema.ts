import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const auditTimestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const registrationStatus = pgEnum("registration_status", [
  "draft",
  "submitted",
  "under_review",
  "waitlisted",
  "accepted",
  "rejected",
  "withdrawn",
]);

export const participationMode = pgEnum("participation_mode", [
  "in_person",
  "remote",
]);

export const experienceLevel = pgEnum("experience_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const teamPreference = pgEnum("team_preference", [
  "have_team",
  "looking_for_team",
  "solo",
]);

export const shirtSize = pgEnum("shirt_size", [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "2xl",
  "3xl",
  "prefer_not_to_say",
]);

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    dateOfBirth: date("date_of_birth", { mode: "date" }),
    pronouns: varchar("pronouns", { length: 50 }),
    countryCode: varchar("country_code", { length: 2 }),
    city: varchar("city", { length: 120 }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("participants_clerk_user_id_unique").on(table.clerkUserId),
  ],
);

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    status: registrationStatus("status").default("draft").notNull(),
    participationMode: participationMode("participation_mode")
      .default("in_person")
      .notNull(),

    organization: varchar("organization", { length: 200 }),
    role: varchar("role", { length: 120 }),
    fieldOfStudy: varchar("field_of_study", { length: 160 }),
    graduationYear: integer("graduation_year"),
    experienceLevel: experienceLevel("experience_level"),
    skills: text("skills")
      .array()
      .default(sql`ARRAY[]::text[]`)
      .notNull(),
    bio: text("bio"),

    githubUrl: text("github_url"),
    linkedInUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),

    teamPreference: teamPreference("team_preference"),
    teamName: varchar("team_name", { length: 120 }),

    shirtSize: shirtSize("shirt_size"),
    dietaryRestrictions: text("dietary_restrictions"),
    accessibilityNeeds: text("accessibility_needs"),
    emergencyContactName: varchar("emergency_contact_name", { length: 200 }),
    emergencyContactPhone: varchar("emergency_contact_phone", {
      length: 32,
    }),

    codeOfConductAcceptedAt: timestamp("code_of_conduct_accepted_at", {
      withTimezone: true,
    }),
    privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at", {
      withTimezone: true,
    }),
    mediaConsent: boolean("media_consent").default(false).notNull(),

    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    ...auditTimestamps(),
  },
  (table) => [
    uniqueIndex("registrations_participant_id_unique").on(table.participantId),
    index("registrations_status_index").on(table.status),
  ],
);

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
