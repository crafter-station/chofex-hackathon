import { Command, Flag } from "effect/unstable/cli";

import { eventName } from "./brand.js";
import { config } from "./config.js";

export const root = Command.make("chofex").pipe(
  Command.withSharedFlags({
    apiUrl: Flag.string("api-url").pipe(
      Flag.withDefault(config.apiUrl),
      Flag.withDescription("Chofex API base URL"),
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
    `Register for and manage your ${eventName} application`,
  ),
);
