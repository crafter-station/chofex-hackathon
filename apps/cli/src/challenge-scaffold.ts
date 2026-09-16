import { writeFile } from "node:fs/promises";

import { Effect, Predicate } from "effect";

import { type CliError, cliError } from "./errors.js";

const solutionPath = "shipping.js";

const starterSource = `/**
 * The Shipping Machine
 *
 * Replace an undocumented service that calculates delivery prices.
 * Use your notebook observations to infer the hidden rules.
 *
 * input.distanceKm  number  0.1–2000
 * input.weightKg    number  0.1–500
 * input.hour        integer 0–23
 * input.fragile     boolean
 * input.express     boolean
 *
 * Return one finite number: your predicted shipping price.
 */
function calculateShipping(input) {
  // TODO: replace this baseline with the rules you discover.
  return 0;
}
`;

export interface ChallengeScaffoldResult {
  readonly path: typeof solutionPath;
  readonly status: "created" | "exists";
}

export const createChallengeScaffold = Effect.fn("createChallengeScaffold")(
  function* (): Effect.fn.Return<ChallengeScaffoldResult, CliError> {
    const status = yield* Effect.tryPromise({
      try: async () => {
        await writeFile(solutionPath, starterSource, {
          encoding: "utf8",
          flag: "wx",
        });
        return "created" as const;
      },
      catch: (error) => error,
    }).pipe(
      Effect.catch((error) => {
        if (Predicate.hasProperty(error, "code") && error.code === "EEXIST") {
          return Effect.succeed("exists" as const);
        }
        return Effect.fail(
          cliError(
            "SCAFFOLD_FAILED",
            `Could not create ${solutionPath}: ${String(error)}`,
          ),
        );
      }),
    );

    return { path: solutionPath, status };
  },
);
