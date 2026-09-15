import { requireParticipantUserId } from "@/lib/auth";
import { evaluateChallenge } from "@/lib/challenges/service";
import { jsonSuccess, readJson, withApiHandler } from "@/lib/registration/http";

export const runtime = "nodejs";

export const POST = (
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const { slug } = await context.params;
    const clerkUserId = await requireParticipantUserId(request);
    return jsonSuccess(
      requestId,
      await evaluateChallenge(clerkUserId, slug, await readJson(request)),
    );
  });
