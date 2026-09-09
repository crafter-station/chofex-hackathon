const oauthIssuer = "https://close-newt-8265.clerk.accounts.dev";

export const config = {
  apiUrl: process.env.CHOFEX_API_URL ?? "http://localhost:3000",
  oauthClientId: "1YfuXKgOXkdH094s",
  authorizationUrl: `${oauthIssuer}/oauth/authorize`,
  tokenUrl: `${oauthIssuer}/oauth/token`,
  revocationUrl: `${oauthIssuer}/oauth/token/revoke`,
};
