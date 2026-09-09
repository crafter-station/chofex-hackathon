# Chofex Hackathon

Participant registration API and Effect v4 CLI. The CLI supports guided input
for people and stable JSON input/output for agents.

## Setup

```sh
bun install
cp apps/web/.env.example apps/web/.env.local
bun --filter @repo/db db:migrate
bun dev
```

Configure the Clerk and database values in `apps/web/.env.local`. The national
ID or passport number requested after acceptance is encrypted with AES-256-GCM,
so `PARTICIPANT_DATA_ENCRYPTION_KEY` is required for attendance confirmation.

## CLI authentication

The CLI signs in through the same Clerk instance as the web app using OAuth
authorization code flow with PKCE:

```sh
bun run --filter @chofex/cli dev -- login
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
```

A rejected application remains in history. Running `chofex register` again
creates a new application instead of overwriting the rejected submission.

For agents and scripts, print an input template and request JSON output:

```sh
chofex schema --stage application > application.json
chofex --output json register --input application.json
chofex --output json status

chofex schema --stage acceptance > attendance.json
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

Responses use a versioned `{ version, ok, requestId, data | error }` envelope.
Authentication failures advertise OAuth discovery through
`/.well-known/oauth-protected-resource`.

## Verification

```sh
bun test
bun run lint
bun run check-types
DATABASE_URL=postgresql://user:pass@localhost:5432/db bun run build
```
