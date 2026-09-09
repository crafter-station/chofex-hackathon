# chofex-cli

Command-line client for the Chofex Hackathon.

## Install

```sh
npm install --global chofex-cli@latest
```

The installed command is `chofex`:

```sh
chofex whoami
chofex register
chofex status
chofex requirements
```

For agent or script input, `chofex schema --stage application` and
`chofex schema --stage acceptance` print complete templates containing every
accepted JSON key. Local validation errors include `acceptedFields` in JSON
mode. The `status` response already includes both the registration and its
requirements; use `requirements` only when requirements-only human output is
preferred.

Run `chofex login` to authenticate. For automation, provide an OAuth access
token with `CHOFEX_TOKEN`.

API requests use `https://andes.crafter.run` by default. Use `CHOFEX_API_URL` to
override the API URL when running against a local or preview Chofex instance.

Registration links use `https://andes.crafter.run` by default. Local or preview
environments can override that origin with `CHOFEX_PUBLIC_SITE_URL`.
