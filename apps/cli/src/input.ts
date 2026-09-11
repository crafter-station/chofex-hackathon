import { readFile } from "node:fs/promises";

import {
  AcceptedDetailsInput,
  ApplicationInput,
  acceptedDetailsInputFieldNames,
  acceptedDetailsSemanticRequirements,
  applicationInputFieldNames,
  applicationSemanticRequirements,
} from "@chofex/registration-contract";
import { Effect, Schema } from "effect";
import { Prompt } from "effect/unstable/cli";
import type * as PromptModule from "effect/unstable/cli/Prompt";

import { CliError, cliError } from "./errors.js";
import { profileUsernamePrompt } from "./profile-username-prompt.js";

const requiredText = (message: string): Prompt.Prompt<string> =>
  Prompt.text({
    message,
    validate: (value) => {
      if (value.trim().length > 0) return Effect.succeed(value);
      return Effect.fail("This value is required");
    },
  });

const optionalText = (message: string): Prompt.Prompt<string> =>
  Prompt.text({ message, default: "" });

const githubProfilePrefix = "github.com/";
const linkedInProfilePrefix = "linkedin.com/in/";

const withoutEmptyStrings = (
  input: Readonly<Record<string, unknown>>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== "" && value !== undefined,
    ),
  );

const readStdin = async (): Promise<string> => {
  const chunks: Array<Buffer> = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf8");
};

const readJsonInput = (path: string): Effect.Effect<unknown, CliError> =>
  Effect.tryPromise({
    try: async () => {
      let contents: string;
      if (path === "-") {
        contents = await readStdin();
      } else {
        contents = await readFile(path, "utf8");
      }
      return JSON.parse(contents) as unknown;
    },
    catch: (error) =>
      cliError(
        "INVALID_INPUT_FILE",
        `Could not read JSON input from ${path}: ${String(error)}`,
      ),
  });

const decode = <S extends Schema.ConstraintDecoder<unknown>>(
  schema: S,
  input: unknown,
  acceptedFields: ReadonlyArray<string>,
): Effect.Effect<S["Type"], CliError, S["DecodingServices"]> =>
  Schema.decodeUnknownEffect(schema, { onExcessProperty: "error" })(input).pipe(
    Effect.mapError((error) =>
      cliError("VALIDATION_ERROR", "Input validation failed", false, {
        issues: String(error),
        acceptedFields,
      }),
    ),
  );

const validateSemantics = <A>(
  input: A,
  requirements: ReadonlyArray<{
    readonly field: string;
    readonly reason: string;
  }>,
): Effect.Effect<A, CliError> => {
  if (requirements.length === 0) return Effect.succeed(input);
  return Effect.fail(
    cliError("VALIDATION_ERROR", "Input validation failed", false, {
      issues: requirements,
    }),
  );
};

const applicationDetailsPrompts = Prompt.all({
  firstName: requiredText("First name"),
  lastName: requiredText("Last name"),
  pronouns: optionalText("Pronouns (optional)"),
  city: requiredText("City of residence in Peru"),
  organization: optionalText("Organization (optional)"),
  role: optionalText("Role (optional)"),
  fieldOfStudy: optionalText("Field of study (optional)"),
  graduationYear: optionalText("Graduation year (optional)"),
  shippedProject: requiredText("What have you shipped?"),
  hackathonProject: requiredText(
    "What do you want to ship at the hackathon?",
  ),
  bio: requiredText("Short bio"),
  githubUsername: profileUsernamePrompt(
    "GitHub username (optional)",
    githubProfilePrefix,
  ),
  linkedInUsername: profileUsernamePrompt(
    "LinkedIn username (optional)",
    linkedInProfilePrefix,
  ),
  portfolioUrl: optionalText("Portfolio URL (optional)"),
});

const teamPreferencePrompt = Prompt.select({
  message: "Team preference",
  choices: [
    { title: "I have a team", value: "have_team" as const },
    { title: "I am looking for a team", value: "looking_for_team" as const },
    { title: "I will participate solo", value: "solo" as const },
  ],
});

export const publicDocumentUrl = (baseUrl: string, path: string): string =>
  `${baseUrl.replace(/\/$/, "")}${path}`;

const requiredAgreement = Effect.fn("requiredAgreement")(function* (
  name: string,
  url: string,
) {
  const accepted = yield* Prompt.run(
    Prompt.confirm({
      message: `Do you accept the ${name}? Read it at ${url}`,
    }),
  );
  if (accepted) return true as const;

  const nextStep = yield* Prompt.run(
    Prompt.select({
      message: `You must accept the ${name} to register. What would you like to do?`,
      choices: [
        {
          title: "I accept and want to continue",
          value: "accept" as const,
        },
        { title: "Cancel registration", value: "cancel" as const },
      ],
    }),
  );
  if (nextStep === "accept") return true as const;

  return yield* cliError(
    "REGISTRATION_CANCELLED",
    "Registration cancelled. Your answers were not submitted.",
  );
});

const interactiveApplication = (publicBaseUrl: string) =>
  Effect.gen(function* () {
    const details = yield* Prompt.run(applicationDetailsPrompts);
    const teamPreference = yield* Prompt.run(teamPreferencePrompt);
    let teamName: string | undefined;
    if (teamPreference === "have_team") {
      teamName = yield* Prompt.run(requiredText("Team name"));
    }
    const codeOfConductAccepted = yield* requiredAgreement(
      "Terms and Code of Conduct",
      publicDocumentUrl(publicBaseUrl, "/terms"),
    );
    const privacyPolicyAccepted = yield* requiredAgreement(
      "Privacy Policy",
      publicDocumentUrl(publicBaseUrl, "/privacy"),
    );
    const mediaConsent = yield* Prompt.run(
      Prompt.confirm({
        message: "Do you consent to appearing in event media? (optional)",
      }),
    );
    return {
      ...details,
      teamPreference,
      teamName,
      codeOfConductAccepted,
      privacyPolicyAccepted,
      mediaConsent,
    };
  }).pipe(
    Effect.map((input) => {
      const { githubUsername, linkedInUsername, ...application } = input;
      const normalized = withoutEmptyStrings(application);
      if (input.graduationYear !== "") {
        normalized.graduationYear = Number(input.graduationYear);
      }
      if (githubUsername !== "") {
        normalized.githubUrl = `${githubProfilePrefix}${githubUsername}`;
      }
      if (linkedInUsername !== "") {
        normalized.linkedInUrl = `${linkedInProfilePrefix}${linkedInUsername}`;
      }
      return normalized;
    }),
  );

const shirtSizePrompt = (
  participationMode: "in_person" | "remote",
): PromptModule.Prompt<string | undefined> => {
  if (participationMode === "remote") return Prompt.succeed(undefined);
  return Prompt.select({
    message: "Shirt size",
    choices: ["xs", "s", "m", "l", "xl", "2xl", "3xl", "prefer_not_to_say"].map(
      (value) => ({ title: value.toUpperCase(), value }),
    ),
  });
};

const interactiveAcceptedDetails = (
  participationMode: "in_person" | "remote",
) =>
  Prompt.run(
    Prompt.all({
      phone: requiredText("Phone number"),
      dateOfBirth: requiredText("Date of birth (YYYY-MM-DD)"),
      nationalIdNumber: requiredText("National ID or passport number"),
      shirtSize: shirtSizePrompt(participationMode),
      dietaryRestrictions: optionalText("Dietary restrictions (optional)"),
      accessibilityNeeds: optionalText("Accessibility needs (optional)"),
      emergencyContactName: requiredText("Emergency contact name"),
      emergencyContactPhone: requiredText("Emergency contact phone"),
      mediaConsent: Prompt.confirm({
        message: "Do you consent to appearing in event media?",
      }),
    }),
  ).pipe(Effect.map(withoutEmptyStrings));

const inputOrInteractive = (
  path: string | undefined,
  interactive: Effect.Effect<unknown, unknown, PromptModule.Environment>,
): Effect.Effect<unknown, CliError, PromptModule.Environment> => {
  if (path) return readJsonInput(path);
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return Effect.fail(
      cliError(
        "INPUT_REQUIRED",
        "Non-interactive use requires --input <file>, or --input - for stdin",
      ),
    );
  }
  return interactive.pipe(
    Effect.mapError((error) => {
      if (error instanceof CliError) return error;
      return cliError("PROMPT_CANCELLED", "Interactive input was cancelled");
    }),
  );
};

export const applicationInput = (
  path: string | undefined,
  publicBaseUrl: string,
): Effect.Effect<ApplicationInput, CliError, PromptModule.Environment> =>
  inputOrInteractive(path, interactiveApplication(publicBaseUrl)).pipe(
    Effect.flatMap((input) =>
      decode(ApplicationInput, input, applicationInputFieldNames),
    ),
    Effect.flatMap((input) =>
      validateSemantics(input, applicationSemanticRequirements(input)),
    ),
  );

export const acceptedDetailsInput = (
  path: string | undefined,
  participationMode: "in_person" | "remote",
): Effect.Effect<AcceptedDetailsInput, CliError, PromptModule.Environment> =>
  inputOrInteractive(path, interactiveAcceptedDetails(participationMode)).pipe(
    Effect.flatMap((input) =>
      decode(AcceptedDetailsInput, input, acceptedDetailsInputFieldNames),
    ),
    Effect.flatMap((input) =>
      validateSemantics(
        input,
        acceptedDetailsSemanticRequirements(input, participationMode),
      ),
    ),
  );
