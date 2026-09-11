import { db } from "@chofex/db";
import { eq } from "@chofex/db/orm";
import { participantBadges } from "@chofex/db/schema";
import { tasks } from "@trigger.dev/sdk";

import type { generateParticipantBadge } from "../../trigger/generate-participant-badge";

export const enqueueBadgeGeneration = async (
  applicationId: string,
): Promise<void> => {
  await db
    .insert(participantBadges)
    .values({ applicationId, status: "pending" })
    .onConflictDoNothing();

  const [badge] = await db
    .select({ status: participantBadges.status })
    .from(participantBadges)
    .where(eq(participantBadges.applicationId, applicationId))
    .limit(1);
  if (badge?.status === "completed") return;

  const handle = await tasks.trigger<typeof generateParticipantBadge>(
    "generate-participant-badge",
    { applicationId },
    {
      idempotencyKey: `participant-badge/${applicationId}`,
      idempotencyKeyTTL: "1h",
      tags: [`application_${applicationId}`],
    },
  );

  await db
    .update(participantBadges)
    .set({
      status: "pending",
      triggerRunId: handle.id,
      error: null,
      updatedAt: new Date(),
    })
    .where(eq(participantBadges.applicationId, applicationId));
};
