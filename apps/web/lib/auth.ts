import { clerkClient } from "@clerk/nextjs/server";

export interface AuthenticatedParticipant {
  readonly clerkUserId: string;
  readonly tokenType: "oauth_token" | "session_token";
}

interface ClerkAuthenticationState {
  readonly isAuthenticated: boolean;
  readonly toAuth: () => {
    readonly tokenType: string | null;
    readonly userId?: string | null;
    readonly clientId?: string | null;
  };
}

interface ClerkRequestAuthenticator {
  authenticateRequest(
    request: Request,
    options: {
      readonly acceptsToken: "oauth_token" | "session_token";
      readonly authorizedParties?: ReadonlyArray<string>;
    },
  ): Promise<ClerkAuthenticationState>;
}

export const authenticateUserWithClerk = async (
  request: Request,
  clerk: ClerkRequestAuthenticator,
  cliOAuthClientId: string,
  authorizedWebOrigins: ReadonlyArray<string>,
): Promise<AuthenticatedParticipant | null> => {
  const oauthState = await clerk.authenticateRequest(request, {
    acceptsToken: "oauth_token",
  });
  if (oauthState.isAuthenticated) {
    const oauth = oauthState.toAuth();
    if (
      oauth.tokenType === "oauth_token" &&
      oauth.clientId === cliOAuthClientId &&
      oauth.userId
    ) {
      return { clerkUserId: oauth.userId, tokenType: "oauth_token" };
    }
    return null;
  }

  const sessionState = await clerk.authenticateRequest(request, {
    acceptsToken: "session_token",
    authorizedParties: authorizedWebOrigins,
  });
  if (!sessionState.isAuthenticated) return null;
  const session = sessionState.toAuth();
  if (session.tokenType !== "session_token" || !session.userId) return null;
  return { clerkUserId: session.userId, tokenType: "session_token" };
};

export const authenticateParticipant = async (
  request: Request,
): Promise<AuthenticatedParticipant | null> => {
  const clientId = process.env.CLERK_CLI_OAUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error("CLERK_CLI_OAUTH_CLIENT_ID is not configured");
  }
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigins = (process.env.CLERK_AUTHORIZED_PARTIES ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origins = [...new Set([requestOrigin, ...configuredOrigins])];
  return authenticateUserWithClerk(
    request,
    (await clerkClient()) as ClerkRequestAuthenticator,
    clientId,
    origins,
  );
};
