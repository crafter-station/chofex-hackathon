import { tasks } from "@trigger.dev/sdk";

import type { sendFunnelReminder } from "../../trigger/send-funnel-reminder";
import type { FunnelReminderPayload } from "./types";

export const funnelReminderDelay = "2h";

export const enqueueFunnelReminder = async (
  payload: FunnelReminderPayload,
): Promise<void> => {
  await tasks.trigger<typeof sendFunnelReminder>(
    "send-funnel-reminder",
    payload,
    {
      delay: funnelReminderDelay,
      idempotencyKey: `funnel-reminder/${payload.stage}/${payload.clerkUserId}`,
      idempotencyKeyTTL: "7d",
      tags: [`funnel_${payload.stage}`, `clerk_user_${payload.clerkUserId}`],
    },
  );
};

export const enqueueFunnelReminderBestEffort = async (
  payload: FunnelReminderPayload,
): Promise<void> => {
  try {
    await enqueueFunnelReminder(payload);
  } catch (error) {
    console.error("Could not schedule funnel reminder", {
      clerkUserId: payload.clerkUserId,
      stage: payload.stage,
      error,
    });
  }
};
