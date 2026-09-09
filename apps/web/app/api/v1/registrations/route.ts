import { authenticateParticipant } from "@/lib/auth";
import {
  HttpError,
  jsonSuccess,
  readJson,
  withApiHandler,
} from "@/lib/registration/http";
import { createRegistration } from "@/lib/registration/service";

export const runtime = "nodejs";

export const POST = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const authentication = await authenticateParticipant(request);
    if (!authentication) {
      throw new HttpError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication failed",
      );
    }
    const result = await createRegistration(
      authentication.clerkUserId,
      await readJson(request),
    );
    return jsonSuccess(requestId, result, 201);
  });
