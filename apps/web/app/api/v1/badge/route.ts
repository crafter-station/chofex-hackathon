import { requireAuthenticatedParticipantProfile } from "@/lib/auth";
import { getParticipantBadge } from "@/lib/badges/service";
import { jsonSuccess, withApiHandler } from "@/lib/registration/http";

export const runtime = "nodejs";

export const GET = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participant = await requireAuthenticatedParticipantProfile(request);
    const badge = await getParticipantBadge(participant.clerkUserId);
    return jsonSuccess(requestId, badge);
  });
