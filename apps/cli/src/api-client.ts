import {
  ApiFailureSchema,
  type ApiSuccess,
  ApiSuccessSchema,
  type CreatedRegistration,
  CreatedRegistrationSchema,
  type RegistrationResult,
  RegistrationResultSchema,
} from "@repo/registration-contract";
import { Effect, Result, Schema } from "effect";

import { accessToken } from "./auth.js";
import { type CliError, cliError } from "./errors.js";

export interface ApiClientOptions {
  readonly apiUrl: string;
  readonly token?: string;
}

const endpoint = (apiUrl: string, path: string): string =>
  `${apiUrl.replace(/\/$/, "")}${path}`;

const resolveAccessToken = (
  suppliedToken: string | undefined,
  forceRefresh = false,
): Effect.Effect<string, CliError> => {
  if (suppliedToken) return Effect.succeed(suppliedToken);
  return Effect.tryPromise({
    try: () => accessToken(forceRefresh),
    catch: (error) => cliError("AUTHENTICATION_REQUIRED", String(error), false),
  });
};

const sendRequest = (
  options: ApiClientOptions,
  path: string,
  init: RequestInit,
  token: string,
): Effect.Effect<Response, CliError> =>
  Effect.tryPromise({
    try: () => {
      const headers = new Headers(init.headers);
      headers.set("accept", "application/json");
      headers.set("authorization", `Bearer ${token}`);
      headers.set("x-request-id", crypto.randomUUID());
      if (init.body !== undefined) {
        headers.set("content-type", "application/json");
      }
      return fetch(endpoint(options.apiUrl, path), {
        ...init,
        headers,
        signal: AbortSignal.timeout(20_000),
      });
    },
    catch: (error) =>
      cliError(
        "NETWORK_ERROR",
        `Could not reach the registration API: ${String(error)}`,
        true,
      ),
  });

const request = Effect.fn("apiRequest")(function* <A, R>(
  options: ApiClientOptions,
  path: string,
  init: RequestInit,
  decodeResponse: (input: unknown) => Effect.Effect<ApiSuccess<A>, unknown, R>,
): Effect.fn.Return<ApiSuccess<A>, CliError, R> {
  const suppliedToken = options.token ?? process.env.CHOFEX_TOKEN;
  let token = yield* resolveAccessToken(suppliedToken);
  let response = yield* sendRequest(options, path, init, token);
  if (response.status === 401 && !suppliedToken) {
    token = yield* resolveAccessToken(undefined, true);
    response = yield* sendRequest(options, path, init, token);
  }

  const body = yield* Effect.tryPromise({
    try: () => response.json() as Promise<unknown>,
    catch: () =>
      cliError(
        "INVALID_API_RESPONSE",
        `The API returned a non-JSON response (${response.status})`,
        response.status >= 500,
      ),
  });

  if (!response.ok) {
    const failure = Schema.decodeUnknownResult(ApiFailureSchema)(body);
    if (Result.isSuccess(failure)) {
      return yield* cliError(
        failure.success.error.code,
        failure.success.error.message,
        failure.success.error.retryable,
        failure.success.error.details,
        failure.success.requestId,
      );
    }
    return yield* cliError(
      "HTTP_ERROR",
      `The API request failed with status ${response.status}`,
      response.status >= 500,
    );
  }

  return yield* decodeResponse(body).pipe(
    Effect.mapError((error) =>
      cliError(
        "INVALID_API_RESPONSE",
        "The API response did not match protocol version 1",
        false,
        { issues: String(error) },
      ),
    ),
  );
});

const decodeCreatedRegistration = Schema.decodeUnknownEffect(
  ApiSuccessSchema(CreatedRegistrationSchema),
);
const decodeRegistrationResult = Schema.decodeUnknownEffect(
  ApiSuccessSchema(RegistrationResultSchema),
);

export const register = (
  options: ApiClientOptions,
  input: unknown,
): Effect.Effect<ApiSuccess<CreatedRegistration>, CliError> =>
  request(
    options,
    "/api/v1/registrations",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    decodeCreatedRegistration,
  );

export const getRegistration = (
  options: ApiClientOptions,
): Effect.Effect<ApiSuccess<RegistrationResult>, CliError> =>
  request(
    options,
    "/api/v1/registration",
    { method: "GET" },
    decodeRegistrationResult,
  );

export const confirmAttendance = (
  options: ApiClientOptions,
  input: unknown,
): Effect.Effect<ApiSuccess<RegistrationResult>, CliError> =>
  request(
    options,
    "/api/v1/registration/attendance",
    { method: "PUT", body: JSON.stringify(input) },
    decodeRegistrationResult,
  );
