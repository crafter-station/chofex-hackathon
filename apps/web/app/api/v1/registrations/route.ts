import { requireAuthenticatedParticipantProfile } from "@/lib/auth";
import { jsonSuccess, readJson, withApiHandler } from "@/lib/registration/http";
import { createRegistration } from "@/lib/registration/service";

export const runtime = "nodejs";

export const POST = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participant = await requireAuthenticatedParticipantProfile(request);
    const result = await createRegistration(
      {
        clerkUserId: participant.clerkUserId,
        email: participant.email,
      },
      await readJson(request),
    );
    return jsonSuccess(requestId, result, 201);
  });
