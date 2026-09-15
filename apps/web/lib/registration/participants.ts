import { db } from "@chofex/db";
import { eq } from "@chofex/db/orm";
import { participants } from "@chofex/db/schema";

export const participantIdFor = async (
  clerkUserId: string,
): Promise<string> => {
  const [existing] = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.clerkUserId, clerkUserId))
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(participants)
    .values({ clerkUserId })
    .onConflictDoNothing()
    .returning({ id: participants.id });
  if (created) return created.id;

  const [concurrent] = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.clerkUserId, clerkUserId))
    .limit(1);
  if (!concurrent) throw new Error("Participant creation returned no row");
  return concurrent.id;
};
