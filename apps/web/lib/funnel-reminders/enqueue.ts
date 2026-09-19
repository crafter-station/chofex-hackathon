import { tasks } from "@trigger.dev/sdk";

import type { sendFunnelReminder } from "../../trigger/send-funnel-reminder";
import type { FunnelReminderPayload } from "./types";

export const funnelReminderDelay = "2h";

export const enqueueFunnelReminder = async (
  payload: FunnelReminderPayload,
  idempotencyKeySuffix = "event",
): Promise<void> => {
  await tasks.trigger<typeof sendFunnelReminder>(
    "send-funnel-reminder",
    payload,
    {
      delay: funnelReminderDelay,
      idempotencyKey: `funnel-reminder/${payload.stage}/${payload.clerkUserId}/${idempotencyKeySuffix}`,
      idempotencyKeyTTL: "7d",
      tags: [`funnel_${payload.stage}`, `clerk_user_${payload.clerkUserId}`],
    },
  );
};

export const enqueueFunnelReminderBestEffort = async (
  payload: FunnelReminderPayload,
  idempotencyKeySuffix?: string,
): Promise<void> => {
  try {
    await enqueueFunnelReminder(payload, idempotencyKeySuffix);
  } catch (error) {
    console.error("Could not schedule funnel reminder", {
      clerkUserId: payload.clerkUserId,
      stage: payload.stage,
      error,
    });
  }
};

export const enqueuePostSubmissionRemindersBestEffort = async (
  clerkUserId: string,
  applicationId: string,
  challengeAlreadyStarted: boolean,
): Promise<void> => {
  const idempotencyKeySuffix = `application/${applicationId}`;
  await enqueueFunnelReminderBestEffort(
    { clerkUserId, stage: "challenge_start", applicationId },
    idempotencyKeySuffix,
  );
  if (challengeAlreadyStarted) {
    await enqueueFunnelReminderBestEffort(
      { clerkUserId, stage: "challenge_finish", applicationId },
      idempotencyKeySuffix,
    );
  }
};
