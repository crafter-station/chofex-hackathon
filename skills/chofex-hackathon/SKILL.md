---
name: chofex-hackathon
description: Apply to the Chofex Hackathon for a human with the Chofex CLI, check an existing application, or guide accepted-participant next steps. Use when a person wants an agent to apply, check their Chofex status, understand requirements, reapply after rejection, or confirm attendance.
---

# Chofex Hackathon

Use the Chofex CLI to act on the participant's behalf while keeping identity,
consent, and final submission decisions with the participant.

## Pace

Move quickly and proactively. Run routine, non-destructive setup, schema, status,
and requirements commands without asking permission or narrating each command.
Batch participant questions into the fewest practical turns. Pause only for:

- browser authentication;
- confirmation that the authenticated email belongs to the participant;
- application answers that are missing or genuinely ambiguous;
- the participant's own consent decisions;
- final submission approval; and
- private accepted-participant details.

Mechanical formatting is not personal-data invention. Normalize obvious handles
and domains, show the result in the final application summary, and let the
participant correct it before submission:

- GitHub `cuevaio` or `@cuevaio` becomes `https://github.com/cuevaio`.
- LinkedIn `cuevaio` or `@cuevaio` becomes
  `https://linkedin.com/in/cuevaio`.
- A profile URL or bare domain missing a scheme gets `https://`.
- Comma-separated skills become a trimmed array of skills.

Ask a follow-up only when the input is malformed or has more than one plausible
meaning that would materially change the application. Use the final application
summary as the correction point for low-risk parsing instead of interrupting the
interview. For example, map “community at Crafter Station” to role `community`
and organization `Crafter Station`, and parse recognizable technology names in
“nextjs react, opencode” as three skills. Preserve participant-provided wording
and casing for personal answers.

## Command setup

1. Check for the CLI with `chofex --version`.
2. If it is unavailable, install it proactively by running
   `npm install --global chofex-cli@latest`; do not delegate installation to
   the participant.
3. Verify the installation with `chofex --version`. If global installation is
   unsupported or fails for lack of permission, use
   `npx --yes chofex-cli@latest` as the command prefix. When working inside the
   Chofex repository, `bun run --filter chofex-cli dev --` is also an acceptable
   fallback. Ask the participant for help only when installation requires an
   interactive administrator or credential step that the agent cannot perform.
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

The template contains every supported JSON key. Copy those keys exactly; for
example, use `githubUrl`, `linkedInUrl`, and `portfolioUrl`.

Collect every field in one compact batch when practical. Accept a natural,
unlabeled reply and map it using context; numbered formatting is optional. For
open-ended fields, ask directly in chat or use an input whose selectable choices
are actual answers such as “Omit.” A placeholder choice such as “Enter all
answers” is not an answer and must not be offered. Ask only for fields the
participant has not already answered. Explain these rules while collecting
answers:

- Registration is for the in-person event in Lima, Peru. The application uses
  the authenticated account's primary email and records Peru as the country.
- `experienceLevel` is `beginner`, `intermediate`, or `advanced`.
- `skills` contains between 1 and 30 non-empty items.
- `teamPreference` is `have_team`, `looking_for_team`, or `solo`.
- `teamName` is required when `teamPreference` is `have_team`.
- `codeOfConductAccepted` and `privacyPolicyAccepted` must each be the
  participant's explicit `true`; an agent cannot consent for them.
- `mediaConsent` is optional and must reflect the participant's choice.

Treat the fresh schema as authoritative. On local validation errors, use
`error.details.acceptedFields` to correct payload keys. Inspect CLI source only
when the schema and error details do not resolve the problem.

Before requesting required consent, give the participant these links:

- `https://andes.crafter.run/terms`
- `https://andes.crafter.run/privacy`

If they do not accept either required document, do not discard the answers
already collected. Ask whether they want to cancel registration or read the
document and explicitly accept it. Continue from the consent step if they
accept; do not submit if they cancel.

Write only participant-provided answers to the temporary file. Omit unanswered
optional fields rather than guessing. Show a readable summary, including every
consent, and ask: **Submit this application now?** Run the submission only after
an explicit yes given at this point.

```sh
chofex --output json register --input "$application_file"
```

Keep the mode-600 temporary file through correctable validation failures so a
retry does not require rebuilding it. Delete it after success, cancellation, or
an unrecoverable error. Report success only when the envelope has `ok: true`.
Then proactively read status once and give one concise result with next steps.

## Next steps

Read the application and server-calculated requirements together:

```sh
chofex --output json status
```

The `status` response includes `requirements`. Run the separate `requirements`
command only when the status response omits them or the participant specifically
asks for requirements alone.

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
mechanical validation errors directly when the displayed application does not
change; involve the participant when an answer or consent must change. Retry an
unchanged failed request only when `retryable` is true. A corrected validation
request is a new submission attempt and follows the final-approval rule. For
authentication failures, return to **Authenticate the participant**. Preserve
the request ID for support instead of claiming success or bypassing a failed
state.
