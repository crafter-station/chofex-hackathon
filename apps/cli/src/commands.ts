import { Console, Effect, Option } from "effect";
import { Command, Flag, Prompt } from "effect/unstable/cli";
import {
  confirmAttendance,
  getBadge,
  getChallengeAttempt,
  getCurrentUser,
  getRegistration,
  saveRegistrationDraft,
  submitRegistration,
} from "./api-client.js";
import { login as oauthLogin, logout as oauthLogout } from "./auth.js";
import { challengeCommand } from "./challenge-commands.js";
import {
  challengeShowText,
  draftSavedText,
  registrationPartsText,
} from "./challenge-output.js";
import { root } from "./cli-root.js";
import { config } from "./config.js";
import { cliError } from "./errors.js";
import {
  acceptedDetailsInput,
  applicationDefaultsFromRegistration,
  applicationDraftInput,
  applicationInput,
  collectAgreementsPart,
  collectExperiencePart,
  collectIdentityPart,
  collectTeamPart,
  picturePathInput,
} from "./input.js";
import {
  badgeText,
  createdText,
  execute,
  printJson,
  registrationLookupErrorText,
  registrationText,
  requirementsOnlyText,
} from "./output.js";
import { uploadPicture } from "./picture-upload.js";

type InputStage = "application" | "acceptance";

const inputFlag = Flag.string("input").pipe(
  Flag.optional,
  Flag.withDescription("Read JSON from a file, or use - for stdin"),
);

const stageFlag = Flag.choice("stage", ["application", "acceptance"]).pipe(
  Flag.withDefault("application"),
);

const submitFlag = Flag.boolean("submit").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Submit the saved application draft"),
);

const currentRegistration = (client: {
  readonly apiUrl: string;
  readonly token?: string;
}) =>
  getRegistration(client).pipe(
    Effect.map(Option.some),
    Effect.catch((error) => {
      if (error.code === "REGISTRATION_NOT_FOUND") {
        return Effect.succeed(Option.none());
      }
      return Effect.fail(error);
    }),
  );

const rejectIfApplicationLocked = Effect.fn("rejectIfApplicationLocked")(
  function* (
    current: Option.Option<{
      data: {
        registration: { status: string };
        requirements: { stage: string };
      };
    }>,
  ) {
    if (Option.isNone(current)) return;
    const { registration, requirements } = current.value.data;
    const { status } = registration;
    const registrationAlreadyExists =
      status === "submitted" ||
      status === "under_review" ||
      status === "waitlisted" ||
      status === "accepted";
    if (!registrationAlreadyExists) return;
    let message = "Already registered. Wait for approval.";
    if (status === "accepted") {
      message = "Already accepted. Your registration is complete.";
      if (requirements.stage === "accepted") {
        message =
          "Already accepted. Run `chofex confirm` to complete your registration.";
      }
    }
    return yield* cliError("ACTIVE_APPLICATION_EXISTS", message, false, {
      currentStatus: status,
    });
  },
);

const registerCommand = Command.make(
  "register",
  { input: inputFlag, submit: submitFlag },
  Effect.fn("registerCommand")(function* ({ input, submit }) {
    const options = yield* root;
    const operation = Effect.gen(function* () {
      const token = Option.getOrUndefined(options.token);
      const client = { apiUrl: options.apiUrl, token };
      const current = yield* currentRegistration(client);
      yield* rejectIfApplicationLocked(current);

      if (Option.isSome(input) || submit) {
        if (Option.isSome(input)) {
          const body = yield* applicationDraftInput(input.value);
          const saved = yield* saveRegistrationDraft(client, body);
          if (submit) return yield* submitRegistration(client);
          return saved;
        }
        return yield* submitRegistration(client);
      }

      if (!process.stdin.isTTY || !process.stdout.isTTY) {
        return yield* cliError(
          "INPUT_REQUIRED",
          "Non-interactive use requires --input <file>, or --input - for stdin",
        );
      }

      return yield* interactiveRegister(client, current);
    });
    yield* execute(options.output, operation, (result) => {
      if (result.registration.status === "submitted")
        return createdText(result);
      return draftSavedText(result);
    });
  }),
).pipe(
  Command.withDescription(
    "Save an application draft in parts, then submit once the Black Box is complete",
  ),
  Command.withExamples([
    {
      command: "chofex register",
      description: "Fill or resume application parts interactively",
    },
    {
      command: "chofex --output json register --input application.json",
      description:
        "Save a draft from JSON; submits when every part is complete",
    },
    {
      command: "chofex register --submit",
      description: "Submit a completed draft",
    },
  ]),
);

const interactiveRegister = (
  client: { readonly apiUrl: string; readonly token?: string },
  initial: Option.Option<{
    data: import("@chofex/registration-contract").RegistrationResult;
  }>,
) =>
  Effect.gen(function* () {
    let latest = Option.isSome(initial) ? initial.value.data : undefined;
    while (true) {
      if (latest) {
        yield* Console.log(registrationPartsText(latest));
      } else {
        yield* Console.log(
          "No draft yet. Choose a part to start. Progress is saved on the server.",
        );
      }
      const defaults = latest
        ? applicationDefaultsFromRegistration(latest.registration)
        : {};
      const choice = yield* Prompt.run(
        Prompt.select({
          message: "What would you like to do?",
          choices: [
            { title: "Edit identity", value: "identity" as const },
            { title: "Edit experience", value: "experience" as const },
            { title: "Edit team", value: "team" as const },
            {
              title: "Black Box challenge status",
              value: "challenges" as const,
            },
            { title: "Review agreements", value: "agreements" as const },
            { title: "Submit application", value: "submit" as const },
            { title: "Save and exit", value: "exit" as const },
          ],
        }),
      ).pipe(
        Effect.mapError(() =>
          cliError("PROMPT_CANCELLED", "Interactive input was cancelled"),
        ),
      );
      if (choice === "exit") {
        if (!latest) {
          latest = (yield* saveRegistrationDraft(client, {})).data;
        }
        return {
          version: 1 as const,
          ok: true as const,
          requestId: crypto.randomUUID(),
          data: latest,
        };
      }
      if (choice === "submit") {
        return yield* submitRegistration(client);
      }
      if (choice === "challenges") {
        const attempt = yield* getChallengeAttempt(client, "black-box");
        yield* Console.log(`\n${challengeShowText(attempt.data)}\n`);
        latest = (yield* getRegistration(client)).data;
        continue;
      }
      let partBody: Record<string, unknown> = {};
      if (choice === "identity") {
        partBody = yield* collectIdentityPart(defaults);
      } else if (choice === "experience") {
        partBody = yield* collectExperiencePart(defaults);
      } else if (choice === "team") {
        partBody = yield* collectTeamPart(defaults);
      } else {
        partBody = yield* collectAgreementsPart(config.publicSiteUrl, defaults);
      }
      latest = (yield* saveRegistrationDraft(client, partBody)).data;
    }
  });

const statusCommand = Command.make(
  "status",
  {},
  Effect.fn("statusCommand")(function* () {
    const options = yield* root;
    const operation = Effect.gen(function* () {
      const token = Option.getOrUndefined(options.token);
      return yield* getRegistration({ apiUrl: options.apiUrl, token });
    });
    yield* execute(
      options.output,
      operation,
      registrationText,
      registrationLookupErrorText,
    );
  }),
).pipe(Command.withDescription("Show your latest application and next steps"));

const requirementsCommand = Command.make(
  "requirements",
  {},
  Effect.fn("requirementsCommand")(function* () {
    const options = yield* root;
    const operation = Effect.gen(function* () {
      const token = Option.getOrUndefined(options.token);
      return yield* getRegistration({ apiUrl: options.apiUrl, token });
    });
    yield* execute(
      options.output,
      operation,
      requirementsOnlyText,
      registrationLookupErrorText,
    );
  }),
).pipe(Command.withDescription("Show information you still need to provide"));

const badgeCommand = Command.make(
  "badge",
  {},
  Effect.fn("badgeCommand")(function* () {
    const options = yield* root;
    const token = Option.getOrUndefined(options.token);
    const operation = getBadge({ apiUrl: options.apiUrl, token });
    yield* execute(options.output, operation, badgeText);
  }),
).pipe(Command.withDescription("Show your generated participant badge"));

const confirmCommand = Command.make(
  "confirm",
  {
    input: inputFlag,
    picture: Flag.string("picture").pipe(
      Flag.optional,
      Flag.withDescription("Path to a JPEG, PNG, or WebP picture (5 MB max)"),
    ),
  },
  Effect.fn("confirmCommand")(function* ({ input, picture }) {
    const options = yield* root;
    const operation = Effect.gen(function* () {
      const token = Option.getOrUndefined(options.token);
      const client = { apiUrl: options.apiUrl, token };
      const current = yield* getRegistration(client);
      if (!current.data.requirements.canSubmitAcceptedDetails) {
        return yield* Effect.fail(
          cliError(
            "INVALID_APPLICATION_STATE",
            "Acceptance details can only be submitted after acceptance",
          ),
        );
      }
      const currentUser = yield* getCurrentUser(client);
      const body = yield* acceptedDetailsInput(
        Option.getOrUndefined(input),
        current.data.registration.participationMode,
        {
          clerkPictureUrl: currentUser.data.clerkPictureUrl,
          githubUrl: current.data.registration.githubUrl,
          currentFullName:
            `${current.data.registration.firstName} ${current.data.registration.lastName}`.trim(),
        },
      );
      const picturePath = Option.getOrUndefined(picture);
      if (body.pictureSource === "upload") {
        const path = yield* picturePathInput(picturePath);
        yield* uploadPicture(client, path);
      } else if (picturePath) {
        return yield* cliError(
          "UNEXPECTED_PICTURE_PATH",
          "--picture can only be used when pictureSource is upload",
        );
      }
      return yield* confirmAttendance(client, body);
    });
    yield* execute(options.output, operation, registrationText);
  }),
).pipe(
  Command.withDescription(
    "Provide private attendance details after acceptance",
  ),
  Command.withExamples([
    {
      command: "chofex confirm",
      description: "Complete accepted-participant details interactively",
    },
    {
      command: "chofex --output json confirm --input attendance.json",
      description: "Submit accepted-participant details from JSON",
    },
  ]),
);

const loginCommand = Command.make(
  "login",
  {},
  Effect.fn("loginCommand")(function* () {
    const options = yield* root;
    const operation = Effect.tryPromise({
      try: async () => {
        await oauthLogin();
        return {
          version: 1 as const,
          ok: true as const,
          requestId: crypto.randomUUID(),
          data: { authenticated: true as const },
        };
      },
      catch: (error) => cliError("LOGIN_FAILED", String(error)),
    });
    yield* execute(options.output, operation, () => "Signed in successfully.");
  }),
).pipe(Command.withDescription("Sign in through Clerk OAuth in your browser"));

const logoutCommand = Command.make(
  "logout",
  {},
  Effect.fn("logoutCommand")(function* () {
    const options = yield* root;
    const operation = Effect.tryPromise({
      try: async () => {
        await oauthLogout();
        const environmentTokenActive = Boolean(process.env.CHOFEX_TOKEN);
        return {
          version: 1 as const,
          ok: true as const,
          requestId: crypto.randomUUID(),
          data: {
            storedCredentialsRemoved: true as const,
            environmentTokenActive,
          },
        };
      },
      catch: (error) => cliError("LOGOUT_FAILED", String(error)),
    });
    yield* execute(options.output, operation, (result) => {
      if (result.environmentTokenActive) {
        return "Stored credentials removed. CHOFEX_TOKEN remains active; unset it to stop using that token.";
      }
      return "Signed out successfully.";
    });
  }),
).pipe(Command.withDescription("Revoke and remove locally stored credentials"));

const whoamiCommand = Command.make(
  "whoami",
  {},
  Effect.fn("whoamiCommand")(function* () {
    const options = yield* root;
    const token = Option.getOrUndefined(options.token);
    const operation = getCurrentUser({ apiUrl: options.apiUrl, token });
    yield* execute(
      options.output,
      operation,
      (result) =>
        `Authenticated as ${result.email} (${result.userId}, ${result.tokenType}).`,
    );
  }),
).pipe(Command.withDescription("Verify the current Clerk authentication"));

const inputValidation = (stage: InputStage, path: string | undefined) => {
  if (stage === "application") {
    return applicationInput(path, config.publicSiteUrl).pipe(Effect.asVoid);
  }
  return acceptedDetailsInput(path, "in_person").pipe(Effect.asVoid);
};

const validateCommand = Command.make(
  "validate",
  { input: inputFlag, stage: stageFlag },
  Effect.fn("validateCommand")(function* ({ input, stage }) {
    const options = yield* root;
    const operation = inputValidation(stage, Option.getOrUndefined(input)).pipe(
      Effect.map(() => ({
        version: 1 as const,
        ok: true as const,
        requestId: crypto.randomUUID(),
        data: { valid: true as const, stage },
      })),
    );
    yield* execute(
      options.output,
      operation,
      (result) => `${result.stage} input is valid.`,
    );
  }),
).pipe(
  Command.withDescription("Validate input without submitting it"),
  Command.withExamples([
    {
      command:
        "chofex --output json validate --stage application --input application.json",
      description: "Validate an application file locally",
    },
  ]),
);

const applicationTemplate = {
  firstName: "Ada",
  lastName: "Lovelace",
  pronouns: "she/her",
  city: "Lima",
  organization: "Analytical Engines",
  role: "Programmer",
  fieldOfStudy: "Computer Science",
  graduationYear: 2026,
  shippedProject: "An open-source tool that helps teams analyze their data.",
  hackathonProject: "A collaborative AI prototyping workspace.",
  bio: "What I hope to build and contribute.",
  githubUrl: "https://github.com/ada-lovelace",
  linkedInUrl: "https://linkedin.com/in/ada-lovelace",
  portfolioUrl: "https://example.com",
  teamPreference: "have_team",
  teamName: "Analytical Engines",
  codeOfConductAccepted: true,
  privacyPolicyAccepted: true,
  mediaConsent: false,
};

const acceptanceTemplate = {
  fullName: "Ada Lovelace",
  phone: "+44 20 0000 0000",
  dateOfBirth: "1990-01-01",
  nationalIdNumber: "passport-or-national-id",
  shirtSize: "m",
  dietaryRestrictions: "Vegetarian",
  accessibilityNeeds: "Wheelchair-accessible workspace",
  emergencyContactName: "Grace Hopper",
  emergencyContactPhone: "+1 555 0100",
  mediaConsent: false,
  pictureSource: "github",
};

const templateFor = (stage: InputStage) => {
  if (stage === "application") return applicationTemplate;
  return acceptanceTemplate;
};

const schemaCommand = Command.make(
  "schema",
  { stage: stageFlag },
  Effect.fn("schemaCommand")(function* ({ stage }) {
    yield* printJson(templateFor(stage));
  }),
).pipe(
  Command.withDescription("Print a complete machine-readable input template"),
  Command.withExamples([
    {
      command: "chofex schema --stage acceptance",
      description: "Print the post-acceptance input template",
    },
  ]),
);

export const command = root.pipe(
  Command.withSubcommands([
    loginCommand,
    logoutCommand,
    whoamiCommand,
    validateCommand,
    registerCommand,
    statusCommand,
    requirementsCommand,
    badgeCommand,
    confirmCommand,
    schemaCommand,
    challengeCommand,
  ]),
);
