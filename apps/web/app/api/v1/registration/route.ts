import { requireParticipantUserId } from "@/lib/auth";
import { jsonSuccess, withApiHandler } from "@/lib/registration/http";
import { getRegistration } from "@/lib/registration/service";

export const runtime = "nodejs";

export const GET = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participantUserId = await requireParticipantUserId(request);
    return jsonSuccess(requestId, await getRegistration(participantUserId));
  });
