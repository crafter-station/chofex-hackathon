import { readFile } from "node:fs/promises";

import {
  AcceptedDetailsInput,
  ApplicationInput,
  acceptedDetailsSemanticRequirements,
  applicationSemanticRequirements,
} from "@repo/registration-contract";
import { Effect, Schema } from "effect";
import { Prompt } from "effect/unstable/cli";
import type * as PromptModule from "effect/unstable/cli/Prompt";

import { type CliError, cliError } from "./errors.js";

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
): Effect.Effect<S["Type"], CliError, S["DecodingServices"]> =>
  Schema.decodeUnknownEffect(schema, { onExcessProperty: "error" })(input).pipe(
    Effect.mapError((error) =>
      cliError("VALIDATION_ERROR", "Input validation failed", false, {
        issues: String(error),
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
  experienceLevel: Prompt.select({
    message: "Experience level",
    choices: [
      { title: "Beginner", value: "beginner" as const },
      { title: "Intermediate", value: "intermediate" as const },
      { title: "Advanced", value: "advanced" as const },
    ],
  }),
  skills: Prompt.list({ message: "Skills (comma-separated)", delimiter: "," }),
  bio: requiredText("Short bio"),
  githubUrl: optionalText("GitHub URL (optional)"),
  linkedInUrl: optionalText("LinkedIn URL (optional)"),
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

const applicationConsentPrompts = Prompt.all({
  codeOfConductAccepted: Prompt.confirm({
    message: "Do you accept the code of conduct?",
  }),
  privacyPolicyAccepted: Prompt.confirm({
    message: "Do you accept the privacy policy?",
  }),
  mediaConsent: Prompt.confirm({
    message: "Do you consent to appearing in event media?",
  }),
});

const interactiveApplication = Effect.gen(function* () {
  const details = yield* Prompt.run(applicationDetailsPrompts);
  const teamPreference = yield* Prompt.run(teamPreferencePrompt);
  let teamName: string | undefined;
  if (teamPreference === "have_team") {
    teamName = yield* Prompt.run(requiredText("Team name"));
  }
  const consents = yield* Prompt.run(applicationConsentPrompts);
  return { ...details, teamPreference, teamName, ...consents };
}).pipe(
  Effect.map((input) => {
    const normalized = withoutEmptyStrings(input);
    if (input.graduationYear !== "") {
      normalized.graduationYear = Number(input.graduationYear);
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
    Effect.mapError(() =>
      cliError("PROMPT_CANCELLED", "Interactive input was cancelled"),
    ),
  );
};

export const applicationInput = (
  path?: string,
): Effect.Effect<ApplicationInput, CliError, PromptModule.Environment> =>
  inputOrInteractive(path, interactiveApplication).pipe(
    Effect.flatMap((input) => decode(ApplicationInput, input)),
    Effect.flatMap((input) =>
      validateSemantics(input, applicationSemanticRequirements(input)),
    ),
  );

export const acceptedDetailsInput = (
  path: string | undefined,
  participationMode: "in_person" | "remote",
): Effect.Effect<AcceptedDetailsInput, CliError, PromptModule.Environment> =>
  inputOrInteractive(path, interactiveAcceptedDetails(participationMode)).pipe(
    Effect.flatMap((input) => decode(AcceptedDetailsInput, input)),
    Effect.flatMap((input) =>
      validateSemantics(
        input,
        acceptedDetailsSemanticRequirements(input, participationMode),
      ),
    ),
  );
