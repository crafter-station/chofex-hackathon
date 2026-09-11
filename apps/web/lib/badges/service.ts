import { db } from "@chofex/db";
import { desc, eq } from "@chofex/db/orm";
import {
  applications,
  participantBadges,
  participants,
} from "@chofex/db/schema";
import type { BadgeResult } from "@chofex/registration-contract";

export const getParticipantBadge = async (
  clerkUserId: string,
): Promise<BadgeResult> => {
  const [record] = await db
    .select({ badge: participantBadges })
    .from(participants)
    .innerJoin(applications, eq(applications.participantId, participants.id))
    .leftJoin(
      participantBadges,
      eq(participantBadges.applicationId, applications.id),
    )
    .where(eq(participants.clerkUserId, clerkUserId))
    .orderBy(desc(applications.createdAt))
    .limit(1);

  if (!record) return { status: "not_started" };
  if (!record.badge) return { status: "not_started" };
  if (record.badge.status === "completed" && record.badge.badgeUrl) {
    return { status: "completed", url: record.badge.badgeUrl };
  }
  return { status: record.badge.status };
};
