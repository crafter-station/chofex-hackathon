---
name: release-cli
description: Release chofex-cli to npm and GitHub. Use when asked to publish the CLI, and after changes that can affect the installed CLI under apps/cli, its bundled workspace dependencies, the lockfile, or its publishing workflow.
---

# Release CLI

Use `.github/workflows/publish-cli.yml` as the single release path.

## Gate

1. Inspect the changes since the latest GitHub release, or the repository's
   history when no release exists. Account for changes in `apps/cli`, the
   workspace packages bundled by it, `bun.lock`, and the publishing workflow.
2. Resolve the candidate's full commit SHA and show it with the CLI impact. Ask
   the user to approve that exact SHA. Record the approved SHA as an immutable
   value for every later step; do not derive it from `HEAD` again.
3. Release only committed code from the remote default branch. Keep unrelated
   working-tree files out of the release commit. If the skill was invoked by
   detected CLI work rather than a release request, this approval is the point
   where the user decides whether to release. Report other unpushed commits and
   ask before including them.

The gate is complete when the user has approved the exact commit that will be
released and that commit is the remote default branch tip.

## Run

1. Resolve the default branch, verify its remote tip still equals the recorded
   approved commit, and capture the URL of the newly dispatched run:

   ```sh
   default_branch="$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name')"
   approved_sha="<full SHA approved above>"
   remote_sha="$(git ls-remote origin "refs/heads/${default_branch}" | cut -f1)"
   test "$approved_sha" = "$remote_sha"
   run_url="$(gh workflow run publish-cli.yml --ref "$default_branch" \
     -f commit_sha="$approved_sha")"
   run_id="${run_url##*/}"
   test -n "$run_id"
   ```

2. Read that run by its captured ID and verify it uses the approved commit.
   GitHub may need a few seconds to expose a new run, so use bounded retries:

   ```sh
   gh run view "$run_id" \
     --json databaseId,headSha,status,conclusion,url
   ```

3. Watch the run through completion with `gh run watch <run-id> --exit-status`.
   Verify `headSha` equals the approved SHA.
   On failure, inspect it with `gh run view <run-id> --log-failed`, fix the
   cause, and obtain fresh approval before dispatching another release.

## Verify

Inspect GitHub's latest release, verify it targets the approved commit, then
compare its tag with npm's `latest` version:

```sh
npm_version="$(npm --prefix apps/cli --workspaces=false view chofex-cli version)"
release_tag="$(gh release list --limit 1 --json tagName,isLatest --jq 'map(select(.isLatest))[0].tagName')"
release_target="$(gh release view "$release_tag" --json targetCommitish --jq '.targetCommitish')"
gh release view "$release_tag" \
  --json tagName,isDraft,publishedAt,url,targetCommitish
test "$release_tag" = "v${npm_version}"
test "$release_target" = "$approved_sha"
```

The release is complete only when the workflow succeeded, npm returns the new
version, the matching non-draft GitHub release targets the approved commit, and
GitHub marks it as latest. npm propagation may take a few minutes; use bounded
retries before reporting a mismatch. Report the version, npm package URL,
GitHub release URL, and workflow run URL.
