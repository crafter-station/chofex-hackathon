---
name: chofex-hackathon
description: Apply to the Chofex Hackathon for a human with the Chofex CLI, check an existing application, or guide accepted-participant next steps. Use when a person wants an agent to apply, check their Chofex status, understand requirements, reapply after rejection, or confirm attendance.
---

# Chofex Hackathon

Use the Chofex CLI to act on the participant's behalf while keeping identity,
consent, and final submission decisions with the participant.

## Command setup

1. Check for the CLI with `chofex --version`.
2. When working inside the Chofex repository and `chofex` is unavailable, use
   `bun run --filter chofex-cli dev --` in place of `chofex`.
3. Otherwise, ask the participant to install the Chofex CLI, then resume only
   after `chofex --version` succeeds.
4. Use `--output json` for every command the agent needs to interpret. JSON
   responses are versioned envelopes with `ok`, `requestId`, and either `data`
   or `error`.

If the participant supplied an application-site URL, pass it as the global
`--api-url` value. The global flags belong before the subcommand:

```sh
chofex --api-url https://example.com --output json status
```

Use one consistent command prefix and API URL for the whole session.

## Authenticate the participant

Run:

```sh
chofex --output json whoami
```

If authentication is required, ask the participant to run `chofex login` in
their own interactive terminal and finish the browser flow. Then run `whoami`
again and ask them to confirm that the returned email is theirs. Login tokens
belong in the operating-system credential store. Treat `CHOFEX_TOKEN` as a
secret and keep it out of chat, command arguments, logs, and files.

Authentication is complete only when `whoami` succeeds and the participant
confirms the email.

## Apply

First, check whether the participant already has an application:

```sh
chofex --output json status
```

If one exists, report its status and follow **Next steps**. Create a new
application only when there is no application or the response says a rejected
participant may apply again. A rejected application remains in history.

Create a mode-600 temporary file outside the project, and get a fresh input
template instead of relying on a memorized schema. On a POSIX system:

```sh
application_file="$(mktemp)"
chmod 600 "$application_file"
chofex schema --stage application > "$application_file"
```

Interview the participant for every field in the template. Also offer these
optional fields when absent from the example: pronouns, organization, role,
field of study, graduation year, GitHub URL, LinkedIn URL, portfolio URL, and
team name. Explain these rules while collecting answers:

- Registration is for the in-person event in Lima, Peru. The application uses
  the authenticated account's primary email and records Peru as the country.
- `experienceLevel` is `beginner`, `intermediate`, or `advanced`.
- `skills` contains between 1 and 30 non-empty items.
- `teamPreference` is `have_team`, `looking_for_team`, or `solo`.
- `teamName` is required when `teamPreference` is `have_team`.
- `codeOfConductAccepted` and `privacyPolicyAccepted` must each be the
  participant's explicit `true`; an agent cannot consent for them.
- `mediaConsent` is optional and must reflect the participant's choice.

Write only participant-provided answers to the temporary file. Omit unanswered
optional fields rather than guessing. Show a readable summary, including every
consent, and ask: **Submit this application now?** Run the submission only after
an explicit yes given at this point.

```sh
chofex --output json register --input "$application_file"
```

Delete the temporary file after the CLI has read it. Report success only when
the envelope has `ok: true`; include the resulting status and next steps.

## Next steps

Read both the application and server-calculated requirements:

```sh
chofex --output json status
chofex --output json requirements
```

Interpret the returned state as follows:

- `draft`, `submitted`, `under_review`, or `waitlisted`: report the exact
  status and requirements. When the requirements stage is `review`, no action
  is needed while organizers review the application.
- `rejected`: show the review feedback when present. Offer a new application
  only if `canSubmitNewApplication` is true; repeat the full interview and
  submission approval rather than silently resubmitting old answers.
- `accepted`: congratulate the participant and explain any `missing`
  acceptance fields. Continue to **Confirm attendance** only when
  `canSubmitAcceptedDetails` is true.
- `withdrawn`: report the status and follow only the actions returned by the
  server.
- requirements stage `complete`: attendance details are complete; report that
  there is no remaining CLI action.

Return the exact rejection reason, missing-field reasons, and server state.
The server response is authoritative when it differs from this summary.

## Confirm attendance

Acceptance details include a birth date, national ID or passport number,
emergency contact, and other private information. Recommend that the
participant keep these values out of agent chat by running this themselves in
an interactive terminal:

```sh
chofex confirm
```

If the participant explicitly asks the agent to submit them instead, fetch a
fresh template with `chofex schema --stage acceptance`, collect every required
value without guessing, store it in a mode-600 temporary file outside the
project, and avoid printing its contents. `dateOfBirth` uses `YYYY-MM-DD` and
must be a real date in the past. Shirt size is required for this in-person
event. Obtain a fresh **Submit these private attendance details now?** approval,
then run:

```sh
chofex --output json confirm --input /path/to/private-attendance.json
```

Delete the file immediately after the command completes. Run `status` again
and verify that the requirements stage is `complete` before reporting that
attendance confirmation is done.

## Failures

On `ok: false`, report `error.code`, `error.message`, and `requestId`. Correct
validation errors with the participant. Retry only when `error.retryable` is
true and say that a retry is happening. For authentication failures, return to
**Authenticate the participant**. Preserve the request ID for support instead
of claiming success or bypassing a failed state.
