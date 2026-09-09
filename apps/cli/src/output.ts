import type {
  ApiSuccess,
  CreatedRegistration,
  RegistrationRequirements,
  RegistrationResult,
} from "@repo/registration-contract";
import { Console, Effect } from "effect";

import { type CliError, exitCodeFor } from "./errors.js";

export type OutputMode = "human" | "json";

export const printJson = (value: unknown): Effect.Effect<void> =>
  Effect.sync(() => {
    process.stdout.write(`${JSON.stringify(value)}\n`);
  });

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
      return Console.error(
        `Error [${error.code}]: ${error.message}\nRequest ID: ${error.requestId}`,
      );
    }),
  );

const requirementsText = (requirements: RegistrationRequirements): string => {
  if (requirements.stage === "complete") return "Attendance details: complete";
  if (requirements.stage === "review")
    return "No action needed while your application is reviewed.";
  let feedback = "";
  if (requirements.rejectionReason) {
    feedback = `\nReview feedback: ${requirements.rejectionReason}`;
  }

  let missing = "";
  if (requirements.missing.length > 0) {
    const items = requirements.missing
      .map((item) => `  - ${item.field}: ${item.reason}`)
      .join("\n");
    missing = `\nStill required:\n${items}`;
  }

  return `Next stage: ${requirements.stage}${feedback}${missing}`;
};

export const registrationText = (result: RegistrationResult): string =>
  [
    `Registration: ${result.registration.id}`,
    `Participant: ${result.registration.firstName} ${result.registration.lastName}`,
    `Status: ${result.registration.status}`,
    requirementsText(result.requirements),
  ].join("\n");

export const createdText = (result: CreatedRegistration): string =>
  ["Application submitted successfully.", registrationText(result)].join("\n");

export const requirementsOnlyText = (result: RegistrationResult): string =>
  requirementsText(result.requirements);
