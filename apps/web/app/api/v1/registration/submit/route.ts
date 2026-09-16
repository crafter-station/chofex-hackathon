import { requireAuthenticatedParticipantProfile } from "@/lib/auth";
import { jsonSuccess, withApiHandler } from "@/lib/registration/http";
import { submitRegistration } from "@/lib/registration/service";

export const runtime = "nodejs";

export const POST = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const participant = await requireAuthenticatedParticipantProfile(request);
    return jsonSuccess(
      requestId,
      await submitRegistration({
        clerkUserId: participant.clerkUserId,
        email: participant.email,
      }),
      201,
    );
  });
