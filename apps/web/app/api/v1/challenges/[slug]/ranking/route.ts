import { getChallengeRanking } from "@/lib/challenges/ranking";
import { jsonSuccess, withApiHandler } from "@/lib/registration/http";

export const runtime = "nodejs";

export const GET = (
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const { slug } = await context.params;
    return jsonSuccess(requestId, await getChallengeRanking(slug));
  });
