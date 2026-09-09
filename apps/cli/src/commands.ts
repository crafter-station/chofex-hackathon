import { Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { confirmAttendance, getRegistration, register } from "./api-client.js";
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

const inputFlag = Flag.string("input").pipe(
  Flag.optional,
  Flag.withDescription("Read JSON from a file, or use - for stdin"),
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
      const body = yield* applicationInput(Option.getOrUndefined(input));
      return yield* register({ apiUrl: options.apiUrl, token }, body);
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

const applicationTemplate = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  countryCode: "GB",
  city: "London",
  participationMode: "in_person",
  experienceLevel: "advanced",
  skills: ["TypeScript", "AI"],
  bio: "What I hope to build and contribute.",
  teamPreference: "looking_for_team",
  codeOfConductAccepted: true,
  privacyPolicyAccepted: true,
  mediaConsent: false,
};

const acceptanceTemplate = {
  phone: "+44 20 0000 0000",
  dateOfBirth: "1990-01-01",
  nationalIdNumber: "passport-or-national-id",
  shirtSize: "m",
  emergencyContactName: "Grace Hopper",
  emergencyContactPhone: "+1 555 0100",
  mediaConsent: false,
};

const templateFor = (stage: "application" | "acceptance") => {
  if (stage === "application") return applicationTemplate;
  return acceptanceTemplate;
};

const schemaCommand = Command.make(
  "schema",
  {
    stage: Flag.choice("stage", ["application", "acceptance"]).pipe(
      Flag.withDefault("application"),
    ),
  },
  Effect.fn("schemaCommand")(function* ({ stage }) {
    yield* printJson(templateFor(stage));
  }),
).pipe(
  Command.withDescription("Print a machine-readable input template"),
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
    registerCommand,
    statusCommand,
    requirementsCommand,
    confirmCommand,
    schemaCommand,
  ]),
);
