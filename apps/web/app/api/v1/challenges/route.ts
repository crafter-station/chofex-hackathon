import { listPublicChallenges } from "@/lib/challenges/catalog";
import { jsonSuccess, withApiHandler } from "@/lib/registration/http";

export const runtime = "nodejs";

export const GET = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) =>
    jsonSuccess(requestId, listPublicChallenges()),
  );
