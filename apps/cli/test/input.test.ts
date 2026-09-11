import { describe, expect, test } from "bun:test";
import { NodeServices } from "@effect/platform-node";
import { Effect, Option, Queue } from "effect";
import type * as Cause from "effect/Cause";
import * as Terminal from "effect/Terminal";

import { dateOfBirthPrompt, publicDocumentUrl } from "../src/input.js";

const input = (value: string, name = value): Terminal.UserInput => ({
  input: Option.some(value),
  key: { name, ctrl: false, meta: false, shift: false },
});

describe("CLI registration input", () => {
  test("builds public policy links from API URLs with or without a slash", () => {
    expect(publicDocumentUrl("https://apply.chofex.com", "/terms")).toBe(
      "https://apply.chofex.com/terms",
    );
    expect(publicDocumentUrl("https://apply.chofex.com/", "/privacy")).toBe(
      "https://apply.chofex.com/privacy",
    );
  });

  test("rejects an invalid date of birth before advancing", async () => {
    const output: Array<string> = [];
    const program = Effect.gen(function* () {
      const inputs = yield* Queue.make<Terminal.UserInput, Cause.Done>();
      yield* Queue.offerAll(inputs, [
        input("32"),
        input("\r", "return"),
        input("\b", "backspace"),
        input("\b", "backspace"),
        input("1990-01-01"),
        input("\r", "return"),
      ]);
      const terminal = Terminal.make({
        columns: Effect.succeed(120),
        rows: Effect.succeed(40),
        readInput: Effect.succeed(inputs),
        readLine: Effect.never,
        display: (text) => Effect.sync(() => output.push(text)),
      });

      return yield* dateOfBirthPrompt().pipe(
        Effect.provideService(Terminal.Terminal, terminal),
      );
    }).pipe(Effect.provide(NodeServices.layer));

    expect(await Effect.runPromise(program)).toBe("1990-01-01");
    expect(output.join("")).toContain("Must use YYYY-MM-DD format");
  });
});
