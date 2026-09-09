import { Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import {
  confirmAttendance,
  getCurrentUser,
  getRegistration,
  register,
} from "./api-client.js";
import { login as oauthLogin, logout as oauthLogout } from "./auth.js";
import { config } from "./config.js";
import { cliError } from "./errors.js";
import { acceptedDetailsInput, applicationInput } from "./input.js";
import {
  createdText,
  execute,
  printJson,
  registrationText,
  requirementsOnlyText,
} from "./output.js";

type InputStage = "application" | "acceptance";

const inputFlag = Flag.string("input").pipe(
  Flag.optional,
  Flag.withDescription("Read JSON from a file, or use - for stdin"),
);

const stageFlag = Flag.choice("stage", ["application", "acceptance"]).pipe(
  Flag.withDefault("application"),
);

const root = Command.make("chofex").pipe(
  Command.withSharedFlags({
    apiUrl: Flag.string("api-url").pipe(
      Flag.withDefault(config.apiUrl),
      Flag.withDescription("Registration API base URL"),
    ),
    output: Flag.choice("output", ["human", "json"]).pipe(
      Flag.withDefault("human"),
      Flag.withDescription("Output format"),
    ),
    token: Flag.string("token").pipe(
      Flag.optional,
      Flag.withDescription(
        "Clerk OAuth token (prefer CHOFEX_TOKEN to avoid shell history)",
      ),
    ),
  }),
  Command.withDescription(
    "Register for and manage your Chofex hackathon application",
  ),
);

const registerCommand = Command.make(
  "register",
  { input: inputFlag },
  Effect.fn("registerCommand")(function* ({ input }) {
    const options = yield* root;
    const operation = Effect.gen(function* () {
      const token = Option.getOrUndefined(options.token);
      const client = { apiUrl: options.apiUrl, token };
      const current = yield* getRegistration(client).pipe(
        Effect.map(Option.some),
        Effect.catch((error) => {
          if (error.code === "REGISTRATION_NOT_FOUND") {
            return Effect.succeed(Option.none());
          }
          return Effect.fail(error);
        }),
      );
      if (Option.isSome(current)) {
        const { status } = current.value.data.registration;
        const isAwaitingApproval =
          status === "submitted" ||
          status === "under_review" ||
          status === "waitlisted";
        if (isAwaitingApproval) {
          return yield* cliError(
            "ACTIVE_APPLICATION_EXISTS",
            "Already registered. Wait for approval.",
            false,
            { currentStatus: status },
          );
        }
      }
      const body = yield* applicationInput(
        Option.getOrUndefined(input),
        config.publicSiteUrl,
      );
      return yield* register(client, body);
    });
    yield* execute(options.output, operation, createdText);
  }),
).pipe(
  Command.withDescription(
    "Submit an application, or apply again after a rejection",
  ),
  Command.withExamples([
    {
      command: "chofex register",
      description: "Complete the application interactively",
    },
    {
      command: "chofex --output json register --input application.json",
      description: "Submit an application from an agent or script",
    },
  ]),
);

const statusCommand = Command.make(
  "status",
  {},
  Effect.fn("statusCommand")(function* () {
    const options = yield* root;
    const operation = Effect.gen(function* () {
      const token = Option.getOrUndefined(options.token);
      return yield* getRegistration({ apiUrl: options.apiUrl, token });
    });
    yield* execute(options.output, operation, registrationText);
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
    yield* execute(options.output, operation, requirementsOnlyText);
  }),
).pipe(Command.withDescription("Show information you still need to provide"));

const confirmCommand = Command.make(
  "confirm",
  { input: inputFlag },
  Effect.fn("confirmCommand")(function* ({ input }) {
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
      const body = yield* acceptedDetailsInput(
        Option.getOrUndefined(input),
        current.data.registration.participationMode,
      );
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

const inputValidation = (
  stage: InputStage,
  path: string | undefined,
) => {
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
  experienceLevel: "advanced",
  skills: ["TypeScript", "AI"],
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
  phone: "+44 20 0000 0000",
  dateOfBirth: "1990-01-01",
  nationalIdNumber: "passport-or-national-id",
  shirtSize: "m",
  dietaryRestrictions: "Vegetarian",
  accessibilityNeeds: "Wheelchair-accessible workspace",
  emergencyContactName: "Grace Hopper",
  emergencyContactPhone: "+1 555 0100",
  mediaConsent: false,
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
    confirmCommand,
    schemaCommand,
  ]),
);
