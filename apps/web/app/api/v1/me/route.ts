import { requireAuthenticatedParticipantProfile } from "@/lib/auth";
import { jsonSuccess, withApiHandler } from "@/lib/registration/http";

export const runtime = "nodejs";

export const GET = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const authentication = await requireAuthenticatedParticipantProfile(request);
    return jsonSuccess(requestId, {
      authenticated: true as const,
      userId: authentication.clerkUserId,
      email: authentication.email,
      tokenType: authentication.tokenType,
    });
  });
