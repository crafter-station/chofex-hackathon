import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { applications } from "./applications";
import { auditTimestamps } from "./common";
import { badgeGenerationStatus } from "./enums";

export const participantBadges = pgTable("participant_badges", {
  applicationId: uuid("application_id")
    .primaryKey()
    .references(() => applications.id, { onDelete: "cascade" }),
  status: badgeGenerationStatus("status").default("pending").notNull(),
  triggerRunId: text("trigger_run_id"),
  pixelArtUrl: text("pixel_art_url"),
  pixelArtPathname: text("pixel_art_pathname"),
  badgeUrl: text("badge_url"),
  badgePathname: text("badge_pathname"),
  error: text("error"),
  notificationSentAt: timestamp("notification_sent_at", {
    withTimezone: true,
  }),
  ...auditTimestamps(),
});

export type ParticipantBadge = typeof participantBadges.$inferSelect;
