import { authenticateParticipant } from "@/lib/auth";
import {
  HttpError,
  jsonSuccess,
  withApiHandler,
} from "@/lib/registration/http";
import { getRegistration } from "@/lib/registration/service";

export const runtime = "nodejs";

export const GET = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const authentication = await authenticateParticipant(request);
    if (!authentication) {
      throw new HttpError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication failed",
      );
    }
    return jsonSuccess(
      requestId,
      await getRegistration(authentication.clerkUserId),
    );
  });
