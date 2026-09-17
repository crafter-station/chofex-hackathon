#!/usr/bin/env bash
set -euo pipefail

# Idempotent Cloud Agent bootstrap for the Chofex Hackathon monorepo.
# Installs the pinned Bun toolchain, restores workspace dependencies, and
# seeds a local web env file so the dev server can boot for demos.

BUN_VERSION="1.3.14"

if ! command -v bun >/dev/null 2>&1 || [ "$(bun --version 2>/dev/null || true)" != "$BUN_VERSION" ]; then
  curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_VERSION}"
fi
export PATH="$HOME/.bun/bin:$PATH"

bun --version

# Restore dependencies from the committed lockfile without rewriting it.
bun install --frozen-lockfile

# Seed apps/web/.env.local from the example so `next dev` can boot the public
# landing page. Real Clerk/DB/Blob/Trigger credentials supplied as environment
# secrets take precedence over these placeholders (Next.js prefers process.env
# over .env files). The encryption key is filled with a real 32-byte value
# because attendance confirmation refuses to start without one.
ENV_FILE="apps/web/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  cp apps/web/.env.example "$ENV_FILE"
  ENCRYPTION_KEY="$(openssl rand -base64 32)"
  sed -i "s|^PARTICIPANT_DATA_ENCRYPTION_KEY=.*|PARTICIPANT_DATA_ENCRYPTION_KEY=${ENCRYPTION_KEY}|" "$ENV_FILE"
fi
