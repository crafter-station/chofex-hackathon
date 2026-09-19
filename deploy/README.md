# Production deployment

The public website and private challenge engine run as separate Dokploy projects on `vps.cueva.io`. GitHub Actions builds SHA-addressable GHCR images from each repository; Dokploy pulls those images and serves them through Let's Encrypt domains.

The initial production rehearsal uses `andes.cueva.io` and `andes-engine.cueva.io`. It intentionally does not modify `hacktheandes.com`, which remains on Vercel until a separately approved cutover.

## Local secrets

The deploy script reads `.env.production.local`, then applies process-environment overrides. It deliberately does not fall back to development env files. Keep this file untracked and complete; a missing required value stops the plan before Dokploy is changed. Dokploy authentication defaults to `~/.vps/config.json`; set `domain` to `https://vps.cueva.io` and use an API key generated from Dokploy's Profile page.

The script obtains the GHCR username and token from `GHCR_USERNAME` / `GHCR_TOKEN` when provided, otherwise from the authenticated GitHub CLI. The token must be able to pull the private `chofex-challenges-private` package.

## Commands

```sh
bun run deploy:plan
bun run deploy:apply -- --confirm-production
bun run deploy:status
```

`deploy:plan` and `deploy:status` are read-only. `deploy:apply` idempotently creates or reconciles both projects, applications, runtime variables, domains, and TLS settings, then deploys both immutable commit-tagged images. It never prints secret values.

On the first release, push both repositories and wait for their image workflows before applying. The initial workflows publish images but skip Dokploy because application IDs do not exist yet. The apply command installs each new application ID and the API key into that repository's `Production` GitHub environment; later main-branch builds update Dokploy to the exact image tag they just published.

Database migrations remain explicit:

```sh
bun --env-file=.env.production.local --filter @chofex/db db:migrate
```

DNS is a separate cutover. Point `andes.cueva.io` and `andes-engine.cueva.io` at the IP reported by `deploy:plan` after both images are available and the Dokploy applications have been created. A first `deploy:apply` creates HTTP routes without requesting certificates; after DNS resolves to the VPS, a second apply enables Let's Encrypt.
