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
const releaseSkill = readFileSync(
  new URL("../.agents/skills/release-cli/SKILL.md", import.meta.url),
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
  expect(workflow).toContain("releases/latest");
  expect(workflow).toContain("turbo ls --affected --output=json");
  expect(workflow).toContain('.name == "chofex-cli"');
  expect(workflow).toContain("needs: detect-release");
  expect(workflow).toContain(
    "if: needs.detect-release.outputs.should_publish == 'true'",
  );
  expect(workflow).toContain(automaticReleaseCommit);
  const publishJob = workflow.indexOf("  publish:");
  const releaseConcurrency = workflow.indexOf("    concurrency:");
  expect(releaseConcurrency).toBeGreaterThan(publishJob);
  expect(workflow.slice(releaseConcurrency)).toMatch(
    /concurrency:\s+group: publish-cli\s+cancel-in-progress: false/,
  );
});

test("validates manual targets before they enter release concurrency", () => {
  const detectionJob = workflow.slice(0, workflow.indexOf("  publish:"));

  expect(detectionJob).toContain('if [[ "$GITHUB_SHA" != "$RELEASE_COMMIT" ]]');
  expect(detectionJob).toContain(
    'if [[ "$default_branch_sha" != "$RELEASE_COMMIT" ]]',
  );
});

test("does not reuse an automatic run that skipped publishing", () => {
  expect(releaseSkill).toContain("Publish chofex-cli");
  expect(releaseSkill).toContain('"skipped"');
  expect(releaseSkill).toContain("workflow_dispatch");
});

test("does not share release concurrency with production deployment", () => {
  expect(productionWorkflow).toMatch(/concurrency:\s+group: production-image-/);
  expect(productionWorkflow).not.toContain("group: publish-cli");
});
