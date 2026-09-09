import { pgEnum } from "drizzle-orm/pg-core";

export const applicationStatus = pgEnum("application_status", [
  "draft",
  "submitted",
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
