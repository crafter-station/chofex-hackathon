import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const workflow = readFileSync(
  new URL("../.github/workflows/publish-cli.yml", import.meta.url),
  "utf8",
);

test("publishes the CLI for every main branch push", () => {
  expect(workflow).toMatch(
    /on:\s+push:\s+branches:\s+- main\s+workflow_dispatch:/,
  );
});
