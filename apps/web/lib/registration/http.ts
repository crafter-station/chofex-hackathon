import type { ApiFailure, ApiSuccess } from "@repo/registration-contract";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryable = false,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const responseHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

const requestIdFor = (request: Request): string => {
  const supplied = request.headers.get("x-request-id");
  if (supplied && /^[A-Za-z0-9_-]{1,128}$/.test(supplied)) return supplied;
  return crypto.randomUUID();
};

export const jsonSuccess = <A>(
  requestId: string,
  data: A,
  status = 200,
): Response => {
  const body: ApiSuccess<A> = { version: 1, ok: true, requestId, data };
  return Response.json(body, { status, headers: responseHeaders });
};

const jsonFailure = (
  requestId: string,
  error: HttpError,
  request: Request,
): Response => {
  const body: ApiFailure = {
    version: 1,
    ok: false,
    requestId,
    error: {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      details: error.details,
    },
  };
  const headers: Record<string, string> = { ...responseHeaders };
  if (error.status === 401) {
    const origin = new URL(request.url).origin;
    headers["www-authenticate"] =
      `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource"`;
  }
  return Response.json(body, {
    status: error.status,
    headers,
  });
};

export const withApiHandler = async (
  request: Request,
  handler: (requestId: string) => Promise<Response>,
): Promise<Response> => {
  const requestId = requestIdFor(request);
  try {
    return await handler(requestId);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonFailure(requestId, error, request);
    }
    console.error("Unhandled registration API error", { requestId, error });
    return jsonFailure(
      requestId,
      new HttpError(
        500,
        "INTERNAL_ERROR",
        "The registration service encountered an unexpected error",
        true,
      ),
      request,
    );
  }
};

export const readJson = async (request: Request): Promise<unknown> => {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be application/json",
    );
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 65_536) {
    throw new HttpError(
      413,
      "PAYLOAD_TOO_LARGE",
      "Request body exceeds 64 KiB",
    );
  }
  let contents: string;
  try {
    contents = await request.text();
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body is not valid JSON");
  }
  if (new TextEncoder().encode(contents).byteLength > 65_536) {
    throw new HttpError(
      413,
      "PAYLOAD_TOO_LARGE",
      "Request body exceeds 64 KiB",
    );
  }
  try {
    return JSON.parse(contents) as unknown;
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body is not valid JSON");
  }
};
