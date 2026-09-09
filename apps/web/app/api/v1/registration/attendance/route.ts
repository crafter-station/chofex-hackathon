import { requireParticipantUserId } from "@/lib/auth";
import { jsonSuccess, readJson, withApiHandler } from "@/lib/registration/http";
import { submitAcceptedDetails } from "@/lib/registration/service";

export const runtime = "nodejs";

export const PUT = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participantUserId = await requireParticipantUserId(request);
    const result = await submitAcceptedDetails(
      participantUserId,
      await readJson(request),
    );
    return jsonSuccess(requestId, result);
  });
