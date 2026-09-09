import { Schema } from "effect";

export class CliError extends Schema.TaggedError<CliError>()("CliError", {
  code: Schema.String,
  message: Schema.String,
  retryable: Schema.Boolean,
  details: Schema.optional(Schema.Unknown),
  requestId: Schema.String,
}) {}

export const cliError = (
  code: string,
  message: string,
  retryable = false,
  details?: unknown,
  requestId: string = crypto.randomUUID(),
): CliError => new CliError({ code, message, retryable, details, requestId });

export const exitCodeFor = (error: CliError): number => {
  if (error.code.includes("AUTH") || error.code === "INVALID_TOKEN") return 3;
  if (error.code === "REGISTRATION_NOT_FOUND") return 4;
  if (error.retryable) return 5;
  return 2;
};
