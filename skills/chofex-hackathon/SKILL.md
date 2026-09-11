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

Ask a follow-up only when the input is malformed or has more than one plausible
meaning that would materially change the application. State low-risk parsing in
a concise interpretation note immediately before the final summary instead of
interrupting the interview. For example, map “community at Crafter Station” to
role `community` and organization `Crafter Station`. Preserve participant-provided
wording and casing for personal answers.

## Command setup

1. Check for the current CLI capabilities with `chofex --version` and
   `chofex validate --help`.
2. If either command is unavailable, install or upgrade proactively with
   `npm install --global chofex-cli@latest`; do not delegate installation to the
   participant.
3. Verify both commands. If global installation is unsupported or fails for
   lack of permission, use `npx --yes chofex-cli@latest` as the command prefix.
   When working inside the Chofex repository,
   `bun run --filter chofex-cli dev --` is also an acceptable fallback. Ask the
   participant for help only when installation requires an interactive
   administrator or credential step that the agent cannot perform.
4. Use `--output json` for every command the agent needs to interpret. JSON
   responses are versioned envelopes with `ok`, `requestId`, and either `data`
   or `error`.

Use one consistent command prefix for the whole session. The CLI already targets
the Hack the Andes service, so use the default URL.

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

Get a fresh input template instead of relying on a memorized schema:

```sh
chofex schema --stage application
```

The output is an example shape, not an application draft. It contains every
supported JSON key. Copy those keys exactly; for example, use `githubUrl`,
`linkedInUrl`, and `portfolioUrl`. Never save or submit the example values.

Collect every field in one compact batch when practical. Accept a natural,
unlabeled reply and map it using context; numbered formatting is optional. For
open-ended fields, ask directly in chat or use an input whose selectable choices
are actual answers such as “Omit.” A placeholder choice such as “Enter all
answers” is not an answer and must not be offered. Ask only for fields the
participant has not already answered. Group the questionnaire so the participant
can scan and answer it naturally:

- required profile: name, city, and bio;
- optional profile: pronouns, organization, role, education, and profile URLs;
- shipping: “What have you shipped?” and “What do you want to ship at the
  hackathon?”;
- team preference and team name when applicable; and
- required agreements and optional media consent.

Explain these rules while collecting answers:

- Registration is for the in-person event in Lima, Peru. The application uses
  the authenticated account's primary email and records Peru as the country.
- `shippedProject` and `hackathonProject` are required free-text answers.
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

Ask for the Terms / Code of Conduct and Privacy Policy decisions by name. “Yes
to both” is explicit consent when it directly answers a prompt naming both
documents. Keep media consent separate: never derive it from accepting the
required documents, “agree to all,” or “omit all.” Keep optional-profile
omissions separate from consent questions, and clarify any answer whose target
is ambiguous rather than relying on the final submission approval to resolve it.

If they do not accept either required document, do not discard the answers
already collected. Ask whether they want to cancel registration or read the
document and explicitly accept it. Continue from the consent step if they
accept; do not submit if they cancel.

Once every answer and consent choice is settled, create exactly one mode-600
temporary application file outside the project. On a POSIX system:

```sh
application_file="$(mktemp)"
chmod 600 "$application_file"
printf '%s\n' "$application_file"
```

Record the exact printed path and reuse it for every later operation. When shell
state does not persist between commands, use that literal path; never guess,
shorten, or replace it. One application uses one payload file, one recorded path,
and one cleanup.

Write only participant-provided answers to that file and omit unanswered optional
fields. Validate it locally before asking for submission approval:

```sh
chofex --output json validate --stage application --input "$application_file"
```

Resolve validation errors before continuing. First state every low-risk
interpretation or normalization in a concise note. Then show a readable summary
of the exact validated payload, include every consent, and ask: **Submit this
application now?** Run the submission only after an explicit yes given at this
point.

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
event. Validate the file with
`chofex --output json validate --stage acceptance --input /path/to/private-attendance.json`;
the success response does not echo its contents. Resolve validation errors, then
obtain a fresh **Submit these private attendance details now?** approval and run:

```sh
chofex --output json confirm --input /path/to/private-attendance.json
```

Delete the file immediately after the command completes. Run `status` again
and verify that the requirements stage is `complete` before reporting that
attendance confirmation is done.

## Failures

On `ok: false`, report `error.code`, `error.message`, and `requestId`. Resolve
local validation failures before showing the final summary. Correct mechanical
issues directly when the participant's answers do not change; involve them when
an answer or consent must change. Any payload change after final approval
invalidates that approval: show the updated summary and ask again. Retry an
unchanged failed request only when `retryable` is true and after fresh submission
approval. For authentication failures, return to **Authenticate the
participant**. Preserve the request ID for support instead of claiming success
or bypassing a failed state.
