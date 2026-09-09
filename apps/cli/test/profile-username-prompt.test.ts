import { describe, expect, test } from "bun:test";
import { NodeServices } from "@effect/platform-node";
import { Effect, Option, Queue } from "effect";
import type * as Cause from "effect/Cause";
import * as Terminal from "effect/Terminal";
import { Prompt } from "effect/unstable/cli";

import { profileUsernamePrompt } from "../src/profile-username-prompt.js";

const input = (value: string, name = value): Terminal.UserInput => ({
  input: Option.some(value),
  key: { name, ctrl: false, meta: false, shift: false },
});

describe("profile username prompt", () => {
  test("renders a muted prefix directly beside the entered username", async () => {
    const output: Array<string> = [];
    const program = Effect.gen(function* () {
      const inputs = yield* Queue.make<Terminal.UserInput, Cause.Done>();
      yield* Queue.offerAll(inputs, [
        input("\b", "backspace"),
        input("cuevaio"),
        input("\r", "return"),
      ]);
      const terminal = Terminal.make({
        columns: Effect.succeed(120),
        rows: Effect.succeed(40),
        readInput: Effect.succeed(inputs),
        readLine: Effect.never,
        display: (text) => Effect.sync(() => output.push(text)),
      });

      return yield* profileUsernamePrompt(
        "GitHub username (optional)",
        "github.com/",
      ).pipe(Effect.provideService(Terminal.Terminal, terminal));
    }).pipe(Effect.provide(NodeServices.layer));

    expect(await Effect.runPromise(program)).toBe("cuevaio");

    const rendered = output.join("");
    const theme = Prompt.makeTheme();
    expect(rendered).toContain(
      `${theme.mutedColor}github.com/\x1B[0m${theme.submittedColor}cuevaio`,
    );
    expect(rendered).not.toContain("github.com/ cuevaio");
    expect(rendered.match(/GitHub username/g)).toHaveLength(3);
  });
});
