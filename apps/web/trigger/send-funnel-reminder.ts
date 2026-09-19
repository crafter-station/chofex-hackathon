import { playableChallenges } from "@chofex/challenges-contract";
import { and, desc, eq, inArray } from "@chofex/db/orm";
import {
  applications,
  challengeAttempts,
  challengeEvaluations,
  funnelEmailDeliveries,
  participants,
} from "@chofex/db/schema";
import { db } from "@chofex/db/worker";
import { logger, task } from "@trigger.dev/sdk";

import { currentChallengeVersion } from "../lib/challenges/engine";
import {
  type FunnelProgress,
  needsFunnelReminder,
} from "../lib/funnel-reminders/eligibility";
import { sendFunnelReminderEmail } from "../lib/funnel-reminders/email";
import type {
  FunnelReminderPayload,
  FunnelReminderRecipient,
} from "../lib/funnel-reminders/types";

interface ReminderContext {
  readonly progress: FunnelProgress;
  readonly recipient?: FunnelReminderRecipient;
}

interface FunnelReminderResult {
  readonly status: "sent" | "skipped" | "duplicate";
}

const playableChallengeSlugs = playableChallenges.map(
  (challenge) => challenge.slug,
);

const loadReminderContext = async (
  payload: FunnelReminderPayload,
): Promise<ReminderContext> => {
  const [record] = await db
    .select({ participantId: participants.id, application: applications })
    .from(participants)
    .leftJoin(applications, eq(applications.participantId, participants.id))
    .where(eq(participants.clerkUserId, payload.clerkUserId))
    .orderBy(desc(applications.createdAt))
    .limit(1);
  const application = record?.application ?? undefined;

  let challengeStarted = false;
  let challengeCompleted = false;
  if (record && playableChallengeSlugs.length > 0) {
    const attempts = await db
      .select({
        id: challengeAttempts.id,
        queriesUsed: challengeAttempts.queriesUsed,
        evaluationsUsed: challengeAttempts.evaluationsUsed,
      })
      .from(challengeAttempts)
      .where(
        and(
          eq(challengeAttempts.participantId, record.participantId),
          eq(challengeAttempts.challengeVersion, currentChallengeVersion),
          inArray(challengeAttempts.challengeSlug, playableChallengeSlugs),
        ),
      );
    challengeStarted = attempts.some(
      (attempt) => attempt.queriesUsed > 0 || attempt.evaluationsUsed > 0,
    );

    const attemptIds = attempts.map((attempt) => attempt.id);
    if (attemptIds.length > 0) {
      const [evaluation] = await db
        .select({ id: challengeEvaluations.id })
        .from(challengeEvaluations)
        .where(inArray(challengeEvaluations.attemptId, attemptIds))
        .limit(1);
      challengeCompleted = Boolean(evaluation);
    }
  }

  let recipient = payload.recipient;
  if (application?.email) {
    recipient = {
      email: application.email,
      firstName: application.firstName ?? payload.recipient?.firstName ?? "",
    };
  }

  return {
    progress: {
      applicationStatus: application?.status,
      applicationSubmitted: Boolean(application?.submittedAt),
      challengeStarted,
      challengeCompleted,
    },
    recipient,
  };
};

const claimDelivery = async (
  payload: FunnelReminderPayload,
  triggerRunId: string,
): Promise<boolean> => {
  const now = new Date();
  const [created] = await db
    .insert(funnelEmailDeliveries)
    .values({
      clerkUserId: payload.clerkUserId,
      stage: payload.stage,
      status: "sending",
      triggerRunId,
    })
    .onConflictDoNothing()
    .returning({ id: funnelEmailDeliveries.id });
  if (created) return true;

  const [delivery] = await db
    .select({
      status: funnelEmailDeliveries.status,
      triggerRunId: funnelEmailDeliveries.triggerRunId,
    })
    .from(funnelEmailDeliveries)
    .where(
      and(
        eq(funnelEmailDeliveries.clerkUserId, payload.clerkUserId),
        eq(funnelEmailDeliveries.stage, payload.stage),
      ),
    )
    .limit(1);
  if (!delivery || delivery.status === "sent") return false;
  if (delivery.status === "sending") {
    return delivery.triggerRunId === triggerRunId;
  }

  const [claimed] = await db
    .update(funnelEmailDeliveries)
    .set({
      status: "sending",
      triggerRunId,
      error: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(funnelEmailDeliveries.clerkUserId, payload.clerkUserId),
        eq(funnelEmailDeliveries.stage, payload.stage),
        eq(funnelEmailDeliveries.status, "failed"),
      ),
    )
    .returning({ id: funnelEmailDeliveries.id });
  return Boolean(claimed);
};

const updateDelivery = async (
  payload: FunnelReminderPayload,
  triggerRunId: string,
  update:
    | { readonly status: "sent"; readonly sentAt: Date; readonly error: null }
    | { readonly status: "failed"; readonly error: string },
): Promise<void> => {
  await db
    .update(funnelEmailDeliveries)
    .set({ ...update, updatedAt: new Date() })
    .where(
      and(
        eq(funnelEmailDeliveries.clerkUserId, payload.clerkUserId),
        eq(funnelEmailDeliveries.stage, payload.stage),
        eq(funnelEmailDeliveries.triggerRunId, triggerRunId),
      ),
    );
};

export const sendFunnelReminder = task<
  "send-funnel-reminder",
  FunnelReminderPayload,
  FunnelReminderResult
>({
  id: "send-funnel-reminder",
  queue: { concurrencyLimit: 5 },
  onFailure: async ({ payload, ctx, error }) => {
    await updateDelivery(payload, ctx.run.id, {
      status: "failed",
      error: String(error).slice(0, 4_000),
    });
  },
  run: async (payload: FunnelReminderPayload, { ctx }) => {
    const reminder = await loadReminderContext(payload);
    if (!needsFunnelReminder(payload.stage, reminder.progress)) {
      logger.info("Skipping stale funnel reminder", {
        clerkUserId: payload.clerkUserId,
        stage: payload.stage,
      });
      return { status: "skipped" as const };
    }
    if (!reminder.recipient?.email) {
      throw new Error("Funnel reminder recipient has no email address");
    }

    const claimed = await claimDelivery(payload, ctx.run.id);
    if (!claimed) {
      logger.info("Skipping duplicate funnel reminder", {
        clerkUserId: payload.clerkUserId,
        stage: payload.stage,
      });
      return { status: "duplicate" as const };
    }

    try {
      await sendFunnelReminderEmail({
        clerkUserId: payload.clerkUserId,
        stage: payload.stage,
        ...reminder.recipient,
      });
    } catch (error) {
      await updateDelivery(payload, ctx.run.id, {
        status: "failed",
        error: String(error).slice(0, 4_000),
      });
      throw error;
    }

    await updateDelivery(payload, ctx.run.id, {
      status: "sent",
      sentAt: new Date(),
      error: null,
    });
    logger.info("Sent funnel reminder", {
      clerkUserId: payload.clerkUserId,
      stage: payload.stage,
    });
    return { status: "sent" as const };
  },
});
