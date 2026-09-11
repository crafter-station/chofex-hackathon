import {
  type ApiSuccess,
  type BadgeResult,
  type CreatedRegistration,
  type RegistrationResult,
  RequirementSchema,
} from "@chofex/registration-contract";
import { Console, Effect, Result, Schema } from "effect";

import { type CliError, exitCodeFor } from "./errors.js";

export type OutputMode = "human" | "json";

export const printJson = (value: unknown): Effect.Effect<void> =>
  Effect.sync(() => {
    process.stdout.write(`${JSON.stringify(value)}\n`);
  });

const humanErrorDetails = (details: unknown): string => {
  if (details === undefined) return "";

  if (typeof details === "object" && details !== null && "issues" in details) {
    const issues = details.issues;
    if (Array.isArray(issues)) {
      const decoded = Schema.decodeUnknownResult(
        Schema.Array(RequirementSchema),
      )(issues);
      if (Result.isSuccess(decoded) && decoded.success.length > 0) {
        const lines = decoded.success.map(
          (issue) => `  - ${issue.field}: ${issue.reason}`,
        );
        return `\nDetails:\n${lines.join("\n")}`;
      }
    }
    if (typeof issues === "string") return `\nDetails:\n${issues}`;
  }

  if (typeof details === "string") return `\nDetails:\n${details}`;
  return `\nDetails:\n${JSON.stringify(details, null, 2)}`;
};

export const execute = <A, R>(
  mode: OutputMode,
  operation: Effect.Effect<ApiSuccess<A>, CliError, R>,
  human: (value: A) => string,
): Effect.Effect<void, never, R> =>
  operation.pipe(
    Effect.flatMap((response) => {
      if (mode === "json") return printJson(response);
      return Console.log(human(response.data));
    }),
    Effect.catch((error) => {
      process.exitCode = exitCodeFor(error);
      if (mode === "json") {
        return printJson({
          version: 1,
          ok: false,
          requestId: error.requestId,
          error: {
            code: error.code,
            message: error.message,
            retryable: error.retryable,
            details: error.details,
          },
        });
      }
      const details = humanErrorDetails(error.details);
      return Console.error(
        `Error [${error.code}]: ${error.message}${details}\nRequest ID: ${error.requestId}`,
      );
    }),
  );

const requirementsText = (result: RegistrationResult): string => {
  const { registration, requirements } = result;
  if (registration.status === "withdrawn") {
    return "Application withdrawn. You may submit a new application.";
  }
  if (requirements.stage === "complete") return "Attendance details: complete";
  if (requirements.stage === "review")
    return "No action needed while your application is reviewed.";
  let feedback = "";
  if (requirements.rejectionReason) {
    feedback = `\nReview feedback: ${requirements.rejectionReason}`;
  }

  let nextCommand = "";
  if (requirements.stage === "accepted") {
    nextCommand = "\nNext command: chofex confirm";
  }

  let missing = "";
  if (requirements.missing.length > 0) {
    const items = requirements.missing
      .map((item) => `  - ${item.field}: ${item.reason}`)
      .join("\n");
    missing = `\nStill required:\n${items}`;
  }

  return `Next stage: ${requirements.stage}${feedback}${missing}${nextCommand}`;
};

export const registrationText = (result: RegistrationResult): string =>
  [
    `Registration: ${result.registration.id}`,
    `Participant: ${result.registration.firstName} ${result.registration.lastName}`,
    `Status: ${result.registration.status}`,
    requirementsText(result),
  ].join("\n");

export const createdText = (result: CreatedRegistration): string =>
  ["Application submitted successfully.", registrationText(result)].join("\n");

export const requirementsOnlyText = (result: RegistrationResult): string =>
  requirementsText(result);

export const badgeText = (result: BadgeResult): string => {
  if (result.url) return result.url;
  return "You don't have a badge yet.";
};
