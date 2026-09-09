import { Effect, Option } from "effect";
import type * as Terminal from "effect/Terminal";
import { Prompt } from "effect/unstable/cli";

interface ProfileUsernameState {
  readonly cursor: number;
  readonly value: string;
  readonly error?: string;
}

const ansi = {
  bold: "\x1B[1m",
  underlined: "\x1B[4m",
  italicized: "\x1B[3m",
  reset: "\x1B[0m",
  eraseLine: "\x1B[2K",
  cursorStart: "\x1B[G",
  cursorSave: "\x1B[s",
  cursorRestore: "\x1B[u",
  cursorUp: "\x1B[1A",
  cursorDown: "\x1B[1B",
  beep: "\x07",
};

const annotate = (text: string, ...styles: ReadonlyArray<string>): string => {
  if (text === "") return "";
  return `${styles.join("")}${text}${ansi.reset}`;
};

const nextFrame = (
  state: ProfileUsernameState,
): Prompt.Action<ProfileUsernameState, string> => ({
  _tag: "NextFrame",
  state,
});

const beep = (): Prompt.Action<ProfileUsernameState, string> => ({
  _tag: "Beep",
});

const renderProfileUsername = (
  state: ProfileUsernameState,
  message: string,
  profilePrefix: string,
  submitted: boolean,
): string => {
  const theme = Prompt.makeTheme();
  const leadingSymbol = submitted ? theme.tick : theme.prefix;
  const trailingSymbol = submitted ? theme.ellipsis : theme.pointerSmall;
  const leadingColor = submitted ? theme.successColor : theme.primaryColor;
  let valueColor = `${ansi.underlined}${theme.primaryColor}`;
  if (submitted) valueColor = theme.submittedColor;
  if (state.error !== undefined) valueColor = theme.errorColor;

  const line = [
    annotate(leadingSymbol, leadingColor),
    annotate(message, ansi.bold),
    annotate(trailingSymbol, theme.mutedColor),
    `${annotate(profilePrefix, theme.mutedColor)}${annotate(state.value, valueColor)}`,
  ].join(" ");

  const cursorOffset = state.cursor - state.value.length;
  let output = line;
  if (cursorOffset < 0) output += `\x1B[${-cursorOffset}D`;
  if (state.error !== undefined && !submitted) {
    const error = `${annotate(theme.pointerSmall, theme.errorColor)} ${annotate(
      state.error,
      ansi.italicized,
      theme.errorColor,
    )}`;
    output += `${ansi.cursorSave}\n${error}${ansi.cursorRestore}`;
  }
  if (submitted) output += "\n";
  return output;
};

const clearProfileUsername = (state: ProfileUsernameState): string => {
  if (state.error === undefined) {
    return ansi.eraseLine + ansi.cursorStart;
  }
  return (
    ansi.cursorDown +
    ansi.eraseLine +
    ansi.cursorUp +
    ansi.eraseLine +
    ansi.cursorStart
  );
};

const insertInput = (
  state: ProfileUsernameState,
  input: string,
): Prompt.Action<ProfileUsernameState, string> => {
  const beforeCursor = state.value.slice(0, state.cursor);
  const afterCursor = state.value.slice(state.cursor);
  return nextFrame({
    cursor: state.cursor + input.length,
    value: `${beforeCursor}${input}${afterCursor}`,
  });
};

const processProfileUsername = (
  input: Terminal.UserInput,
  state: ProfileUsernameState,
): Effect.Effect<Prompt.Action<ProfileUsernameState, string>> => {
  if (input.key.ctrl) {
    if (input.key.name === "u") {
      return Effect.succeed(nextFrame({ cursor: 0, value: "" }));
    }
    if (input.key.name === "a") {
      return Effect.succeed(nextFrame({ ...state, cursor: 0 }));
    }
    if (input.key.name === "e") {
      return Effect.succeed(
        nextFrame({ ...state, cursor: state.value.length }),
      );
    }
    return Effect.succeed(beep());
  }

  if (input.key.name === "backspace") {
    if (state.cursor === 0) return Effect.succeed(beep());
    return Effect.succeed(
      nextFrame({
        cursor: state.cursor - 1,
        value:
          state.value.slice(0, state.cursor - 1) +
          state.value.slice(state.cursor),
      }),
    );
  }
  if (input.key.name === "left") {
    if (state.cursor === 0) return Effect.succeed(beep());
    return Effect.succeed(
      nextFrame({ ...state, cursor: state.cursor - 1, error: undefined }),
    );
  }
  if (input.key.name === "right") {
    if (state.cursor === state.value.length) return Effect.succeed(beep());
    return Effect.succeed(
      nextFrame({ ...state, cursor: state.cursor + 1, error: undefined }),
    );
  }
  if (input.key.name === "home") {
    return Effect.succeed(
      nextFrame({ ...state, cursor: 0, error: undefined }),
    );
  }
  if (input.key.name === "end") {
    return Effect.succeed(
      nextFrame({
        ...state,
        cursor: state.value.length,
        error: undefined,
      }),
    );
  }
  if (input.key.name === "enter" || input.key.name === "return") {
    if (state.value === "" || /^[A-Za-z0-9._-]+$/.test(state.value)) {
      return Effect.succeed({ _tag: "Submit", value: state.value });
    }
    return Effect.succeed(
      nextFrame({ ...state, error: "Enter only your username" }),
    );
  }
  if (input.key.meta) return Effect.succeed(beep());
  return Effect.succeed(
    Option.match(input.input, {
      onNone: beep,
      onSome: (value) => insertInput(state, value),
    }),
  );
};

export const profileUsernamePrompt = (
  message: string,
  profilePrefix: string,
): Prompt.Prompt<string> =>
  Prompt.custom(
    { cursor: 0, value: "" },
    {
      render: (state, action) => {
        if (action._tag === "Beep") return Effect.succeed(ansi.beep);
        return Effect.succeed(
          renderProfileUsername(
            state,
            message,
            profilePrefix,
            action._tag === "Submit",
          ),
        );
      },
      process: processProfileUsername,
      clear: (state) => Effect.succeed(clearProfileUsername(state)),
    },
  );
