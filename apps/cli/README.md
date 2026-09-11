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
chofex confirm
```

For agent or script input, `chofex schema --stage application` and
`chofex schema --stage acceptance` print complete templates containing every
accepted JSON key. Validate a completed input file locally before submitting it:

```sh
chofex --output json validate --stage application --input application.json
```

Validation does not contact the API, and a successful result does not echo input
values. Local validation errors include `acceptedFields` in JSON mode. The
`status` response already includes both the registration and its requirements;
use `requirements` only when requirements-only human output is preferred.

Run `chofex login` to authenticate. For automation, provide an OAuth access
token with `CHOFEX_TOKEN`.

When applying again after a rejection, interactive registration pre-fills the
previous application's answers. Keep a value by pressing Enter, or press Ctrl+U
and type a replacement for an answer that needs to change.

Accepted participants must confirm which profile picture reviewers should use:
their Clerk picture, their GitHub avatar, or a custom upload. Interactive
confirmation prompts for the choice and local file path. For JSON input, set
`pictureSource` and pass `--picture /path/to/image` when its value is `upload`.
Uploads show percentage progress and accept JPEG, PNG, or WebP files up to 5 MB.

API requests use `https://andes.crafter.run` by default. Use `CHOFEX_API_URL` to
override the API URL when running against a local or preview Chofex instance.

Registration links use `https://andes.crafter.run` by default. Local or preview
environments can override that origin with `CHOFEX_PUBLIC_SITE_URL`.
