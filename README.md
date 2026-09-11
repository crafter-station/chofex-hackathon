# Chofex Hackathon

Participant registration API and Effect v4 CLI. The CLI supports guided input
for people and stable JSON input/output for agents.

## Agent skill

Install the Chofex Hackathon skill in a supported coding agent with
[skills.sh](https://skills.sh):

```sh
npx skills add https://github.com/crafter-station/chofex-hackathon --skill chofex-hackathon -g -y
```

This installs the skill globally for agents that support global skills; the
installer may skip agents that do not support global installation.

The skill teaches an agent the complete application and post-acceptance flow,
including the boundaries that keep authentication, personal answers, consent,
and final submission approval with the participant. It lives at
[`skills/chofex-hackathon/SKILL.md`](skills/chofex-hackathon/SKILL.md).

## Setup

```sh
bun install
cp apps/web/.env.example apps/web/.env.local
bun --filter @chofex/db db:migrate
bun dev
```

Configure the Clerk and database values in `apps/web/.env.local`. The national
ID or passport number requested after acceptance is encrypted with AES-256-GCM,
so `PARTICIPANT_DATA_ENCRYPTION_KEY` is required for attendance confirmation.
Connect a public Vercel Blob store and set `BLOB_READ_WRITE_TOKEN` for profile
picture uploads.

Badge generation runs in Trigger.dev after an accepted participant confirms
attendance. Set a trigger-only `TRIGGER_SECRET_KEY` in the web app, then
configure `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`,
`AI_GATEWAY_API_KEY`, and `RESEND_API_KEY` in the matching Trigger.dev environment.
Run tasks locally with `bun --filter @chofex/web trigger:dev` and deploy them
with `bun --filter @chofex/web trigger:deploy`.

## CLI authentication

Install the latest CLI globally so the `chofex` command is available:

```sh
npm install --global chofex-cli@latest
chofex whoami
```

The CLI signs in through the same Clerk instance as the web app using OAuth
authorization code flow with PKCE:

```sh
bun run --filter chofex-cli dev -- login
```

Access and refresh tokens are stored in the operating-system credential store:
Keychain on macOS, Secret Service on Linux, and Password Vault on Windows. Use
`chofex logout` to revoke and remove them. Automation can provide a Clerk OAuth
access token through `CHOFEX_TOKEN` without storing it.

The API must set `CLERK_CLI_OAUTH_CLIENT_ID`. Set
`CLERK_AUTHORIZED_PARTIES` to the comma-separated list of trusted web origins;
it defaults to `http://localhost:3000` for local development. The CLI's OAuth
issuer and client can be overridden with `CHOFEX_OAUTH_ISSUER` and
`CHOFEX_OAUTH_CLIENT_ID`.

## Participant flow

```sh
# Submit an application interactively
chofex login
chofex whoami
chofex register

# Check review status and required next steps
chofex status
chofex requirements

# Provide private details after acceptance
chofex confirm
# The badge URL appears here once background generation finishes
chofex badge
# To use a local picture non-interactively:
chofex confirm --input attendance.json --picture /path/to/picture.png
```

A rejected application remains in history. Running `chofex register` again
creates a new application instead of overwriting the rejected submission. In
interactive mode, the rejected application's answers are shown as editable
defaults, so pressing Enter keeps an answer and Ctrl+U clears it for a
replacement.
Registration is for the on-site event in Lima: the API uses the participant's
primary Clerk email, records Peru as the country, and only asks for their city
of residence in Peru.

For agents and scripts, inspect the templates, save completed answers in separate
JSON files, validate them locally, and request JSON output:

```sh
chofex schema --stage application > application-template.json
chofex --output json validate --stage application --input application.json
chofex --output json register --input application.json
chofex --output json status

chofex schema --stage acceptance > attendance-template.json
chofex --output json validate --stage acceptance --input attendance.json
chofex --output json confirm --input attendance.json
```

Use `--input -` to read JSON from stdin. In JSON mode, stdout contains only the
versioned result envelope; prompts and diagnostics use the terminal or stderr.

## Registration API

All participant endpoints accept Clerk browser session tokens or OAuth tokens
issued specifically to the Chofex CLI.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/me` | Verify the current Clerk identity |
| `POST` | `/api/v1/registrations` | Submit a new application |
| `GET` | `/api/v1/registration` | Read the latest application and requirements |
| `PUT` | `/api/v1/registration/attendance` | Complete post-acceptance details |
| `POST` | `/api/v1/profile-picture` | Authorize one accepted-participant Blob upload |
| `PUT` | `/api/v1/profile-picture` | Verify and record a completed Blob upload |
| `GET` | `/api/v1/badge` | Read the participant's generated badge status and URL |

Responses use a versioned `{ version, ok, requestId, data | error }` envelope.
Authentication failures advertise OAuth discovery through
`/.well-known/oauth-protected-resource`.

Picture uploads are limited to authenticated participants whose latest
application is accepted. The API allows JPEG, PNG, or WebP files up to 5 MB,
issues a token scoped to one random Blob pathname, verifies the stored bytes,
and permits at most five upload attempts per 24-hour window.

## Verification

```sh
bun test
bun run lint
bun run check-types
DATABASE_URL=postgresql://user:pass@localhost:5432/db bun run build
```
