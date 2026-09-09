const oauthIssuer =
  process.env.CHOFEX_OAUTH_ISSUER ??
  "https://close-newt-8265.clerk.accounts.dev";

export const config = {
  apiUrl: process.env.CHOFEX_API_URL ?? "https://andes.crafter.run",
  publicSiteUrl:
    process.env.CHOFEX_PUBLIC_SITE_URL ?? "https://andes.crafter.run",
  oauthClientId: process.env.CHOFEX_OAUTH_CLIENT_ID ?? "1YfuXKgOXkdH094s",
  authorizationUrl: `${oauthIssuer}/oauth/authorize`,
  tokenUrl: `${oauthIssuer}/oauth/token`,
  revocationUrl: `${oauthIssuer}/oauth/token/revoke`,
};
