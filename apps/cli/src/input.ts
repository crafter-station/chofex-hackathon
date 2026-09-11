import { readFile } from "node:fs/promises";

import {
  AcceptedDetailsInput,
  ApplicationInput,
  acceptedDetailsInputFieldNames,
  acceptedDetailsInputFields,
  acceptedDetailsSemanticRequirements,
  applicationInputFieldNames,
  applicationInputFields,
  applicationSemanticRequirements,
  dateOfBirthRequirement,
  type RegistrationView,
} from "@chofex/registration-contract";
import { Effect, Schema } from "effect";
import { Prompt } from "effect/unstable/cli";
import type * as PromptModule from "effect/unstable/cli/Prompt";

import { CliError, cliError } from "./errors.js";
import { profileUsernamePrompt } from "./profile-username-prompt.js";

const validatePromptValue = (
  schema: Schema.Decoder<unknown, never>,
  value: unknown,
): Effect.Effect<void, string> =>
  Schema.decodeUnknownEffect(schema)(value).pipe(
    Effect.asVoid,
    Effect.mapError((error) => error.message),
  );

const requiredText = (
  message: string,
  schema: Schema.Decoder<unknown, never>,
  defaultValue = "",
): Prompt.Prompt<string> =>
  Prompt.text({
    message,
    default: defaultValue,
    validate: (value) =>
      validatePromptValue(schema, value).pipe(Effect.as(value)),
  });

const optionalText = (
  message: string,
  schema: Schema.Decoder<unknown, never>,
  defaultValue = "",
): Prompt.Prompt<string> =>
  Prompt.text({
    message,
    default: defaultValue,
    validate: (value) => {
      if (value === "") return Effect.succeed(value);
      return validatePromptValue(schema, value).pipe(Effect.as(value));
    },
  });

export const dateOfBirthPrompt = (): Prompt.Prompt<string> =>
  Prompt.text({
    message: "Date of birth (YYYY-MM-DD)",
    validate: Effect.fn("validateDateOfBirth")(function* (value) {
      yield* validatePromptValue(acceptedDetailsInputFields.dateOfBirth, value);
      const requirement = dateOfBirthRequirement(value);
      if (requirement) return yield* Effect.fail(requirement.reason);
      return value;
    }),
  });

const githubProfilePrefix = "github.com/";
const linkedInProfilePrefix = "linkedin.com/in/";

const profileUsernameFromUrl = (
  profileUrl: string | undefined,
  profilePrefix: string,
): string => {
  if (!profileUrl) return "";
  const normalized = profileUrl
    .replace(/^https?:\/\/(?:www\.)?/i, "")
    .replace(/\/$/, "");
  if (!normalized.toLowerCase().startsWith(profilePrefix)) return "";
  const username = normalized.slice(profilePrefix.length);
  if (!/^[A-Za-z0-9._-]+$/.test(username)) return "";
  return username;
};

const profileUrlPrompt = (
  usernameMessage: string,
  urlMessage: string,
  profilePrefix: string,
  schema: Schema.Decoder<unknown, never>,
  defaultUrl: string | undefined,
): Prompt.Prompt<string> => {
  const defaultUsername = profileUsernameFromUrl(defaultUrl, profilePrefix);
  if (defaultUrl && !defaultUsername) {
    return optionalText(urlMessage, schema, defaultUrl);
  }
  return profileUsernamePrompt(
    usernameMessage,
    profilePrefix,
    (value) => {
      if (value === "") return Effect.succeed(value);
      return validatePromptValue(schema, `${profilePrefix}${value}`).pipe(
        Effect.as(value),
      );
    },
    defaultUsername,
  ).pipe(
    Prompt.map((value) => {
      if (value === "") return value;
      return `${profilePrefix}${value}`;
    }),
  );
};

const withoutEmptyStrings = (
  input: Readonly<Record<string, unknown>>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== "" && value !== undefined,
    ),
  );

export const applicationDefaultsFromRegistration = (
  registration: RegistrationView,
): Partial<ApplicationInput> => ({
  firstName: registration.firstName,
  lastName: registration.lastName,
  pronouns: registration.pronouns,
  city: registration.city,
  organization: registration.organization,
  role: registration.role,
  fieldOfStudy: registration.fieldOfStudy,
  graduationYear: registration.graduationYear,
  shippedProject: registration.shippedProject,
  hackathonProject: registration.hackathonProject,
  bio: registration.bio,
  githubUrl: registration.githubUrl,
  linkedInUrl: registration.linkedInUrl,
  portfolioUrl: registration.portfolioUrl,
  teamPreference: registration.teamPreference,
  teamName: registration.teamName,
  codeOfConductAccepted: true,
  privacyPolicyAccepted: true,
  mediaConsent: registration.mediaConsent,
});

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

const applicationDetailsPrompts = (defaults: Partial<ApplicationInput>) =>
  Prompt.all({
    firstName: requiredText(
      "First name",
      applicationInputFields.firstName,
      defaults.firstName,
    ),
    lastName: requiredText(
      "Last name",
      applicationInputFields.lastName,
      defaults.lastName,
    ),
    pronouns: optionalText(
      "Pronouns (optional)",
      applicationInputFields.pronouns,
      defaults.pronouns,
    ),
    city: requiredText(
      "City of residence in Peru",
      applicationInputFields.city,
      defaults.city,
    ),
    organization: optionalText(
      "Organization (optional)",
      applicationInputFields.organization,
      defaults.organization,
    ),
    role: optionalText(
      "Role (optional)",
      applicationInputFields.role,
      defaults.role,
    ),
    fieldOfStudy: optionalText(
      "Field of study (optional)",
      applicationInputFields.fieldOfStudy,
      defaults.fieldOfStudy,
    ),
    graduationYear: Prompt.text({
      message: "Graduation year (optional)",
      default: defaults.graduationYear?.toString() ?? "",
      validate: (value) => {
        if (value === "") return Effect.succeed(value);
        return validatePromptValue(
          applicationInputFields.graduationYear,
          Number(value),
        ).pipe(Effect.as(value));
      },
    }),
    shippedProject: requiredText(
      "What have you shipped?",
      applicationInputFields.shippedProject,
      defaults.shippedProject,
    ),
    hackathonProject: requiredText(
      "What do you want to ship at the hackathon?",
      applicationInputFields.hackathonProject,
      defaults.hackathonProject,
    ),
    bio: requiredText("Short bio", applicationInputFields.bio, defaults.bio),
    githubUrl: profileUrlPrompt(
      "GitHub username (optional)",
      "GitHub URL (optional)",
      githubProfilePrefix,
      applicationInputFields.githubUrl,
      defaults.githubUrl,
    ),
    linkedInUrl: profileUrlPrompt(
      "LinkedIn username (optional)",
      "LinkedIn URL (optional)",
      linkedInProfilePrefix,
      applicationInputFields.linkedInUrl,
      defaults.linkedInUrl,
    ),
    portfolioUrl: optionalText(
      "Portfolio URL (optional)",
      applicationInputFields.portfolioUrl,
      defaults.portfolioUrl,
    ),
  });

const teamPreferencePrompt = (
  defaultValue?: ApplicationInput["teamPreference"],
) =>
  Prompt.select({
    message: "Team preference",
    choices: [
      {
        title: "I have a team",
        value: "have_team" as const,
        selected: defaultValue === "have_team",
      },
      {
        title: "I am looking for a team",
        value: "looking_for_team" as const,
        selected: defaultValue === "looking_for_team",
      },
      {
        title: "I will participate solo",
        value: "solo" as const,
        selected: defaultValue === "solo",
      },
    ],
  });

export const publicDocumentUrl = (baseUrl: string, path: string): string =>
  `${baseUrl.replace(/\/$/, "")}${path}`;

const requiredAgreement = Effect.fn("requiredAgreement")(function* (
  name: string,
  url: string,
  initial = false,
) {
  const accepted = yield* Prompt.run(
    Prompt.confirm({
      message: `Do you accept the ${name}? Read it at ${url}`,
      initial,
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

const interactiveApplication = (
  publicBaseUrl: string,
  defaults: Partial<ApplicationInput>,
) =>
  Effect.gen(function* () {
    const details = yield* Prompt.run(applicationDetailsPrompts(defaults));
    const teamPreference = yield* Prompt.run(
      teamPreferencePrompt(defaults.teamPreference),
    );
    let teamName: string | undefined;
    if (teamPreference === "have_team") {
      teamName = yield* Prompt.run(
        requiredText(
          "Team name",
          applicationInputFields.teamName,
          defaults.teamName,
        ),
      );
    }
    const codeOfConductAccepted = yield* requiredAgreement(
      "Terms and Code of Conduct",
      publicDocumentUrl(publicBaseUrl, "/terms"),
      defaults.codeOfConductAccepted,
    );
    const privacyPolicyAccepted = yield* requiredAgreement(
      "Privacy Policy",
      publicDocumentUrl(publicBaseUrl, "/privacy"),
      defaults.privacyPolicyAccepted,
    );
    const mediaConsent = yield* Prompt.run(
      Prompt.confirm({
        message: "Do you consent to appearing in event media? (optional)",
        initial: defaults.mediaConsent ?? false,
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
  pictures: {
    readonly clerkPictureUrl?: string;
    readonly githubUrl?: string;
    readonly currentFullName?: string;
  },
) =>
  Effect.gen(function* () {
    let fullName = pictures.currentFullName;
    if (fullName) {
      const nameChoice = yield* Prompt.run(
        Prompt.select({
          message: `Is "${fullName}" your full name exactly as it appears on your ID document?`,
          choices: [
            { title: "Yes, use this name", value: "keep" as const },
            { title: "No, update it", value: "update" as const },
          ],
        }),
      );
      if (nameChoice === "update") fullName = undefined;
    }
    if (!fullName) {
      fullName = yield* Prompt.run(
        requiredText(
          "Full name exactly as it appears on your ID document",
          acceptedDetailsInputFields.fullName,
        ),
      );
    }
    const details = yield* Prompt.run(
      Prompt.all({
        phone: requiredText("Phone number", acceptedDetailsInputFields.phone),
        dateOfBirth: dateOfBirthPrompt(),
        nationalIdNumber: requiredText(
          "National ID or passport number",
          acceptedDetailsInputFields.nationalIdNumber,
        ),
        shirtSize: shirtSizePrompt(participationMode),
        dietaryRestrictions: optionalText(
          "Dietary restrictions (optional)",
          acceptedDetailsInputFields.dietaryRestrictions,
        ),
        accessibilityNeeds: optionalText(
          "Accessibility needs (optional)",
          acceptedDetailsInputFields.accessibilityNeeds,
        ),
        emergencyContactName: requiredText(
          "Emergency contact name",
          acceptedDetailsInputFields.emergencyContactName,
        ),
        emergencyContactPhone: requiredText(
          "Emergency contact phone",
          acceptedDetailsInputFields.emergencyContactPhone,
        ),
        mediaConsent: Prompt.confirm({
          message: "Do you consent to appearing in event media?",
        }),
      }),
    );
    const pictureChoices: Array<{
      readonly title: string;
      readonly value: "clerk" | "github" | "upload";
    }> = [];
    if (pictures.clerkPictureUrl) {
      pictureChoices.push({
        title: `Use my Clerk picture (${pictures.clerkPictureUrl})`,
        value: "clerk",
      });
    }
    if (pictures.githubUrl) {
      pictureChoices.push({
        title: `Use my GitHub picture (${pictures.githubUrl})`,
        value: "github",
      });
    }
    pictureChoices.push({
      title: "Upload a different picture",
      value: "upload",
    });
    const pictureSource = yield* Prompt.run(
      Prompt.select({
        message: "Confirm the profile picture reviewers should use",
        choices: pictureChoices,
      }),
    );
    return withoutEmptyStrings({ fullName, ...details, pictureSource });
  });

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
  defaults: Partial<ApplicationInput> = {},
): Effect.Effect<ApplicationInput, CliError, PromptModule.Environment> =>
  inputOrInteractive(
    path,
    interactiveApplication(publicBaseUrl, defaults),
  ).pipe(
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
  pictures: {
    readonly clerkPictureUrl?: string;
    readonly githubUrl?: string;
    readonly currentFullName?: string;
  } = {},
): Effect.Effect<AcceptedDetailsInput, CliError, PromptModule.Environment> =>
  inputOrInteractive(
    path,
    interactiveAcceptedDetails(participationMode, pictures),
  ).pipe(
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

export const picturePathInput = (
  suppliedPath: string | undefined,
): Effect.Effect<string, CliError, PromptModule.Environment> => {
  if (suppliedPath) return Effect.succeed(suppliedPath);
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return Effect.fail(
      cliError(
        "PICTURE_PATH_REQUIRED",
        "Use --picture <path> when pictureSource is upload",
      ),
    );
  }
  return Prompt.run(
    requiredText(
      "Path to a JPEG, PNG, or WebP picture (5 MB maximum)",
      Schema.String.pipe(Schema.check(Schema.isMinLength(1))),
    ),
  ).pipe(
    Effect.mapError(() =>
      cliError("PROMPT_CANCELLED", "Interactive input was cancelled"),
    ),
  );
};
