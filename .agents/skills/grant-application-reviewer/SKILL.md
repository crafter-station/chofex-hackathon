---
name: grant-application-reviewer
description: Grant the Chofex application_reviewer role to a Clerk user by email.
disable-model-invocation: true
---

# Grant application reviewer

Grant a known Clerk user permission to review Chofex applications. Resolve the
user by an exact email address and write the role only to Clerk private
metadata.

## Preview

1. Obtain the email address from the invocation. Ask for it when absent.
2. Locate `scripts/grant-application-reviewer.ts` relative to this file.
3. From the Chofex repository, run the script without `--apply`:

   ```sh
   bun --env-file=apps/web/.env.local <skill-directory>/scripts/grant-application-reviewer.ts "person@example.com"
   ```

   When `CLERK_SECRET_KEY` is already present in the environment, omit
   `--env-file`. Keep the secret out of chat, command arguments, output, and
   files created by the skill.
4. Stop if the script cannot find exactly one Clerk user. It must not create a
   user or select a partial match.
5. Show the user the preview's Clerk environment, exact email, user ID, current
   roles, and proposed roles. Ask:

   **Grant `application_reviewer` to this Clerk user now?**

The preview is complete only when one exact user has been resolved and the
human has seen the target environment and proposed role change.

## Apply

Run the same command with `--apply` only after an explicit confirmation given
after the preview:

```sh
bun --env-file=apps/web/.env.local <skill-directory>/scripts/grant-application-reviewer.ts "person@example.com" --apply
```

Report success only when the output has `verified: true`. Include the email,
user ID, Clerk environment, and final roles. The script preserves existing
private metadata and roles; this skill grants access and does not revoke or
replace roles.
