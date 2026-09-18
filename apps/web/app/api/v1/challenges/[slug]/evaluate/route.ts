import { requireParticipantUserId } from "@/lib/auth";
import { evaluateChallenge } from "@/lib/challenges/service";
import { captureProductEvent } from "@/lib/posthog-server";
import { jsonSuccess, readJson, withApiHandler } from "@/lib/registration/http";

export const runtime = "nodejs";

export const POST = (
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const { slug } = await context.params;
    const clerkUserId = await requireParticipantUserId(request);
    const result = await evaluateChallenge(
      clerkUserId,
      slug,
      await readJson(request),
    );
    await captureProductEvent({
      distinctId: clerkUserId,
      event: "challenge_evaluation_submitted",
      properties: {
        challenge_slug: slug,
        accuracy: result.accuracy,
        exact_count: result.exactCount,
        evaluations_used: result.evaluationsUsed,
        evaluations_remaining: result.evaluationsRemaining,
        rank: result.rank,
      },
    });
    return jsonSuccess(requestId, result);
  });
