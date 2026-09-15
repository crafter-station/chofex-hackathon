import { requireParticipantUserId } from "@/lib/auth";
import { getChallengeAttempt } from "@/lib/challenges/service";
import { jsonSuccess, withApiHandler } from "@/lib/registration/http";

export const runtime = "nodejs";

export const GET = (
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const { slug } = await context.params;
    const clerkUserId = await requireParticipantUserId(request);
    return jsonSuccess(requestId, await getChallengeAttempt(clerkUserId, slug));
  });
