#!/usr/bin/env node

import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";

import { command } from "./commands.js";
import { printJson } from "./output.js";

const jsonOutputRequested = (arguments_: ReadonlyArray<string>): boolean => {
  if (arguments_.includes("--output=json")) return true;
  const outputFlag = arguments_.lastIndexOf("--output");
  return outputFlag >= 0 && arguments_[outputFlag + 1] === "json";
};

const jsonMode = jsonOutputRequested(process.argv.slice(2));

const quietConsole: Console.Console = Object.assign(Object.create(console), {
  log: () => undefined,
  error: () => undefined,
});

command.pipe(
  Command.run({ version: "0.1.0", renderErrors: !jsonMode }),
  Effect.catch((error) => {
    if (!jsonMode) return Effect.fail(error);
    if (error._tag === "ShowHelp" && error.errors.length === 0) {
      return printJson({
        version: 1,
        ok: true,
        requestId: crypto.randomUUID(),
        data: {
          helpRequested: true,
          commandPath: error.commandPath,
          hint: "Run without --output json to view formatted help",
        },
      });
    }
    process.exitCode = 2;
    const errors = error._tag === "ShowHelp" ? error.errors : [error];
    return printJson({
      version: 1,
      ok: false,
      requestId: crypto.randomUUID(),
      error: {
        code: "CLI_PARSE_ERROR",
        message: errors.map((item) => item.message).join("; "),
        retryable: false,
        details: { types: errors.map((item) => item._tag) },
      },
    });
  }),
  (program) => {
    if (!jsonMode) return program;
    return Effect.provideService(program, Console.Console, quietConsole);
  },
  Effect.provide(NodeServices.layer),
  (program) => NodeRuntime.runMain(program, { disableErrorReporting: true }),
);
