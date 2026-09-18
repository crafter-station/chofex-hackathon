---
name: release-cli
description: Release chofex-cli to npm and GitHub. Use when asked to publish the CLI, and after changes that can affect the installed CLI under apps/cli, its bundled workspace dependencies, the lockfile, or its publishing workflow.
---

# Release CLI

Use `.github/workflows/publish-cli.yml` as the single release path. It assigns
the version, tests and publishes `chofex-cli`, promotes npm's `latest` tag, and
creates the matching GitHub release.

## Gate

1. Inspect the changes since the latest GitHub release, or the repository's
   history when no release exists. Account for changes in `apps/cli`, the
   workspace packages bundled by it, `bun.lock`, and the publishing workflow.
2. If the skill was invoked because CLI-affecting work was detected but the
   user did not request a release, summarize the impact and ask whether to
   release. Publishing requires explicit approval in the current conversation.
3. Release only committed code from the remote default branch. Keep unrelated
   working-tree files out of the release commit. A release request authorizes
   pushing its committed release changes; report any other unpushed commits and
   ask before including them.

The gate is complete when the user has approved the exact commit that will be
released and that commit is the remote default branch tip.

## Run

1. Find a publish run for the approved commit:

   ```sh
   gh run list --workflow publish-cli.yml --commit "$(git rev-parse HEAD)" --limit 1 \
     --json databaseId,status,conclusion,url
   ```

2. If no run exists, dispatch one and then find the run for the commit:

   ```sh
   gh workflow run publish-cli.yml --ref main
   ```

3. Watch the run through completion with `gh run watch <run-id> --exit-status`.
   On failure, inspect it with `gh run view <run-id> --log-failed`, fix the
   cause, and obtain fresh approval before dispatching another release.

## Verify

Read the latest npm version without activating the root workspace's
package-manager guard, then inspect both the matching release and GitHub's
latest marker:

```sh
npm_version="$(npm --prefix apps/cli --workspaces=false view chofex-cli version)"
gh release view "v${npm_version}" \
  --json tagName,isDraft,publishedAt,url,targetCommitish
gh release list --limit 1 --json tagName,isLatest
```

The release is complete only when the workflow succeeded, npm returns the new
version, the matching non-draft GitHub release exists, and GitHub marks it as
latest. Report the version, npm package URL, GitHub release URL, and workflow
run URL.
