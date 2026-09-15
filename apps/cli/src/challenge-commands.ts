import { Effect, Option } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import {
  evaluateChallenge,
  getChallengeAttempt,
  getChallengeRanking,
  listChallenges,
  queryChallenge,
  testChallenge,
} from "./api-client.js";
import {
  defaultChallengeSlug,
  javascriptSourceFromPath,
  shipmentInput,
} from "./challenge-input.js";
import {
  challengeEvaluateText,
  challengeListText,
  challengeQueryText,
  challengeRankingText,
  challengeShowText,
  challengeTestText,
  notebookCsvText,
  notebookTableText,
} from "./challenge-output.js";
import { root } from "./cli-root.js";
import { execute } from "./output.js";

const optionalString = (name: string, description: string) =>
  Flag.string(name).pipe(Flag.optional, Flag.withDescription(description));

const challengeFlag = Flag.string("challenge").pipe(
  Flag.withDefault(defaultChallengeSlug),
  Flag.withDescription("Challenge slug (default: black-box)"),
);

const sourceFlag = optionalString(
  "source",
  "JavaScript file exporting function calculateShipping(input)",
);

const inputFlag = optionalString("input", "JSON file, or - for stdin");

const formatFlag = Flag.choice("format", ["table", "json", "csv"]).pipe(
  Flag.withDefault("table"),
  Flag.withDescription("Notebook format"),
);

const numberFromOption = (value: Option.Option<string>): number | undefined => {
  if (Option.isNone(value)) return undefined;
  return Number(value.value);
};

const booleanFromOption = (
  value: Option.Option<string>,
): boolean | undefined => {
  if (Option.isNone(value)) return undefined;
  if (value.value === "true") return true;
  if (value.value === "false") return false;
};

const listCommand = Command.make(
  "list",
  {},
  Effect.fn("challengeListCommand")(function* () {
    const options = yield* root;
    yield* execute(
      options.output,
      listChallenges({ apiUrl: options.apiUrl }),
      challengeListText,
    );
  }),
).pipe(Command.withDescription("List mini technical challenges"));

const showCommand = Command.make(
  "show",
  { challenge: challengeFlag },
  Effect.fn("challengeShowCommand")(function* ({ challenge }) {
    const options = yield* root;
    const token = Option.getOrUndefined(options.token);
    yield* execute(
      options.output,
      getChallengeAttempt({ apiUrl: options.apiUrl, token }, challenge),
      challengeShowText,
    );
  }),
).pipe(
  Command.withDescription("Show your Black Box status and remaining budget"),
);

const queryCommand = Command.make(
  "query",
  {
    challenge: challengeFlag,
    input: inputFlag,
    distance: optionalString("distance", "Shipment distance in km"),
    weight: optionalString("weight", "Shipment weight in kg"),
    hour: optionalString("hour", "Hour of day, 0-23"),
    fragile: Flag.choice("fragile", ["true", "false"]).pipe(
      Flag.optional,
      Flag.withDescription("Fragile surcharge flag"),
    ),
    express: Flag.choice("express", ["true", "false"]).pipe(
      Flag.optional,
      Flag.withDescription("Express surcharge flag"),
    ),
  },
  Effect.fn("challengeQueryCommand")(function* ({
    challenge,
    input,
    distance,
    weight,
    hour,
    fragile,
    express,
  }) {
    const options = yield* root;
    const token = Option.getOrUndefined(options.token);
    const operation = Effect.gen(function* () {
      const shipment = yield* shipmentInput(Option.getOrUndefined(input), {
        distanceKm: numberFromOption(distance),
        weightKg: numberFromOption(weight),
        hour: numberFromOption(hour),
        fragile: booleanFromOption(fragile),
        express: booleanFromOption(express),
      });
      return yield* queryChallenge(
        { apiUrl: options.apiUrl, token },
        challenge,
        shipment,
      );
    });
    yield* execute(options.output, operation, challengeQueryText);
  }),
).pipe(
  Command.withDescription(
    "Query the undocumented Black Box (uses one request)",
  ),
  Command.withExamples([
    {
      command:
        "chofex challenge query --distance 10 --weight 3 --hour 14 --fragile false --express false",
      description: "Spend one oracle query",
    },
  ]),
);

const notebookCommand = Command.make(
  "notebook",
  { challenge: challengeFlag, format: formatFlag },
  Effect.fn("challengeNotebookCommand")(function* ({ challenge, format }) {
    const options = yield* root;
    const token = Option.getOrUndefined(options.token);
    const operation = getChallengeAttempt(
      { apiUrl: options.apiUrl, token },
      challenge,
    );
    yield* execute(options.output, operation, (attempt) => {
      if (format === "csv") return notebookCsvText(attempt.observations);
      if (format === "json") {
        return JSON.stringify(attempt.observations, null, 2);
      }
      return notebookTableText(attempt.observations);
    });
  }),
).pipe(
  Command.withDescription(
    "Export Black Box observations as a table, JSON, or CSV",
  ),
);

const testCommand = Command.make(
  "test",
  { challenge: challengeFlag, source: sourceFlag },
  Effect.fn("challengeTestCommand")(function* ({ challenge, source }) {
    const options = yield* root;
    const token = Option.getOrUndefined(options.token);
    const operation = Effect.gen(function* () {
      const solution = yield* javascriptSourceFromPath(
        Option.getOrUndefined(source),
      );
      return yield* testChallenge(
        { apiUrl: options.apiUrl, token },
        challenge,
        solution,
      );
    });
    yield* execute(options.output, operation, challengeTestText);
  }),
).pipe(
  Command.withDescription(
    "Test a replacement against your notebook without consuming an official evaluation",
  ),
);

const evaluateCommand = Command.make(
  "evaluate",
  { challenge: challengeFlag, source: sourceFlag },
  Effect.fn("challengeEvaluateCommand")(function* ({ challenge, source }) {
    const options = yield* root;
    const token = Option.getOrUndefined(options.token);
    const operation = Effect.gen(function* () {
      const solution = yield* javascriptSourceFromPath(
        Option.getOrUndefined(source),
      );
      return yield* evaluateChallenge(
        { apiUrl: options.apiUrl, token },
        challenge,
        solution,
      );
    });
    yield* execute(options.output, operation, challengeEvaluateText);
  }),
).pipe(
  Command.withDescription(
    "Run an official hidden-set evaluation (limited attempts)",
  ),
);

const rankingCommand = Command.make(
  "ranking",
  { challenge: challengeFlag },
  Effect.fn("challengeRankingCommand")(function* ({ challenge }) {
    const options = yield* root;
    yield* execute(
      options.output,
      getChallengeRanking({ apiUrl: options.apiUrl }, challenge),
      challengeRankingText,
    );
  }),
).pipe(Command.withDescription("Show the public read-only challenge ranking"));

export const challengeCommand = Command.make("challenge").pipe(
  Command.withDescription(
    "Play mini technical challenges and inspect public rankings",
  ),
  Command.withSubcommands([
    listCommand,
    showCommand,
    queryCommand,
    notebookCommand,
    testCommand,
    evaluateCommand,
    rankingCommand,
  ]),
);
