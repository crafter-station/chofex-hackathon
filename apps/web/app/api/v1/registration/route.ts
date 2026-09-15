import {
  requireAuthenticatedParticipantProfile,
  requireParticipantUserId,
} from "@/lib/auth";
import { jsonSuccess, readJson, withApiHandler } from "@/lib/registration/http";
import {
  getRegistration,
  saveRegistrationDraft,
} from "@/lib/registration/service";

export const runtime = "nodejs";

export const GET = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participantUserId = await requireParticipantUserId(request);
    return jsonSuccess(requestId, await getRegistration(participantUserId));
  });

export const PUT = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participant = await requireAuthenticatedParticipantProfile(request);
    return jsonSuccess(
      requestId,
      await saveRegistrationDraft(
        {
          clerkUserId: participant.clerkUserId,
          email: participant.email,
        },
        await readJson(request),
      ),
    );
  });
