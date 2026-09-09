import { requireAdminIdentity } from "@/lib/admin/auth";
import { decideCandidate } from "@/lib/admin/candidates";
import {
  HttpError,
  jsonSuccess,
  readJson,
  withApiHandler,
} from "@/lib/registration/http";

export const runtime = "nodejs";

interface DecisionBody {
  readonly decision?: unknown;
  readonly message?: unknown;
  readonly notify?: unknown;
}

const parseDecisionBody = (
  value: unknown,
): Omit<DecisionBody, "decision"> & {
  readonly decision: "accepted" | "rejected";
} => {
  if (!value || typeof value !== "object") {
    throw new HttpError(422, "VALIDATION_ERROR", "A decision is required");
  }
  const body = value as DecisionBody;
  if (body.decision !== "accepted" && body.decision !== "rejected") {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      "Decision must be accepted or rejected",
    );
  }
  if (body.message !== undefined && typeof body.message !== "string") {
    throw new HttpError(422, "VALIDATION_ERROR", "Message must be a string");
  }
  if (typeof body.notify !== "boolean") {
    throw new HttpError(422, "VALIDATION_ERROR", "Notify must be a boolean");
  }
  return {
    decision: body.decision,
    message: body.message,
    notify: body.notify,
  };
};

export const PATCH = async (
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> =>
  withApiHandler(request, async (requestId) => {
    const admin = await requireAdminIdentity();
    const body = parseDecisionBody(await readJson(request));
    const { id } = await context.params;
    const result = await decideCandidate({
      applicationId: id,
      decision: body.decision,
      message: typeof body.message === "string" ? body.message : undefined,
      notify: body.notify === true,
      decidedByClerkUserId: admin.clerkUserId,
    });
    return jsonSuccess(requestId, result);
  });
