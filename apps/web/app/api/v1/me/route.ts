import { clerkClient } from "@clerk/nextjs/server";
import { requireAuthenticatedParticipant } from "@/lib/auth";
import {
  HttpError,
  jsonSuccess,
  withApiHandler,
} from "@/lib/registration/http";

export const runtime = "nodejs";

export const GET = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const authentication = await requireAuthenticatedParticipant(request);
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(authentication.clerkUserId);
    const emailAddress = user.emailAddresses.find(
      (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
    );
    if (!emailAddress) {
      throw new HttpError(
        422,
        "PRIMARY_EMAIL_REQUIRED",
        "The authenticated Clerk user does not have a primary email address",
      );
    }
    return jsonSuccess(requestId, {
      authenticated: true as const,
      userId: authentication.clerkUserId,
      email: emailAddress.emailAddress,
      tokenType: authentication.tokenType,
    });
  });
