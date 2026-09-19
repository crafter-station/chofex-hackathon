import { requireAuthenticatedParticipantProfile } from "@/lib/auth";
import { enqueueFunnelReminderBestEffort } from "@/lib/funnel-reminders/enqueue";
import { captureProductEvent } from "@/lib/posthog-server";
import { jsonSuccess, withApiHandler } from "@/lib/registration/http";
import { submitRegistration } from "@/lib/registration/service";

export const runtime = "nodejs";

export const POST = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participant = await requireAuthenticatedParticipantProfile(request);
    const result = await submitRegistration({
      clerkUserId: participant.clerkUserId,
      email: participant.email,
    });
    await enqueueFunnelReminderBestEffort({
      clerkUserId: participant.clerkUserId,
      stage: "challenge_start",
    });
    await captureProductEvent({
      distinctId: participant.clerkUserId,
      event: "application_submitted",
      properties: {
        auth_token_type: participant.tokenType,
        application_status: result.registration.status,
      },
    });
    return jsonSuccess(requestId, result, 201);
  });
