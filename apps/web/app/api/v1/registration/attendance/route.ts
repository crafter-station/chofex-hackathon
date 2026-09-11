import { requireAuthenticatedParticipantProfile } from "@/lib/auth";
import { jsonSuccess, readJson, withApiHandler } from "@/lib/registration/http";
import { submitAcceptedDetails } from "@/lib/registration/service";

export const runtime = "nodejs";

export const PUT = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participant = await requireAuthenticatedParticipantProfile(request);
    const result = await submitAcceptedDetails(
      {
        clerkUserId: participant.clerkUserId,
        email: participant.email,
        clerkPictureUrl: participant.clerkPictureUrl,
      },
      await readJson(request),
    );
    return jsonSuccess(requestId, result);
  });
