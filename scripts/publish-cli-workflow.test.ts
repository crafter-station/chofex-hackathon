import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const workflow = readFileSync(
  new URL("../.github/workflows/publish-cli.yml", import.meta.url),
  "utf8",
);
const productionWorkflow = readFileSync(
  new URL("../.github/workflows/production-image.yml", import.meta.url),
  "utf8",
);
const automaticReleaseCommit =
  "RELEASE_COMMIT: $" + "{{ inputs.commit_sha || github.sha }}";
const mainPushTrigger = `  push:
    branches:
      - main
  workflow_dispatch:`;

test("publishes the CLI only for main pushes that can affect the package", () => {
  expect(workflow).toContain(mainPushTrigger);
  expect(workflow).toContain("name: Detect CLI release changes");
  expect(workflow).toContain("needs: detect-release");
  expect(workflow).toContain(
    "if: needs.detect-release.outputs.should_publish == 'true'",
  );
  for (const releaseInput of [
    "apps/cli",
    "packages/challenges-contract",
    "packages/registration-contract",
    "bun.lock",
    ".github/workflows/publish-cli.yml",
  ]) {
    expect(workflow).toContain(releaseInput);
  }
  expect(workflow).toContain(automaticReleaseCommit);
  expect(workflow).toMatch(
    /concurrency:\s+group: publish-cli\s+cancel-in-progress: false/,
  );
});

test("does not share release concurrency with production deployment", () => {
  expect(productionWorkflow).toMatch(/concurrency:\s+group: production-image-/);
  expect(productionWorkflow).not.toContain("group: publish-cli");
});
