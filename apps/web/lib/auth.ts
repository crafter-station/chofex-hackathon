import { clerkClient } from "@clerk/nextjs/server";

import { HttpError } from "./registration/http";

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
  cliOAuthClientId: string | undefined,
  authorizedWebOrigins: ReadonlyArray<string>,
): Promise<AuthenticatedParticipant | null> => {
  if (cliOAuthClientId) {
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
  const authorizedParties =
    process.env.CLERK_AUTHORIZED_PARTIES ?? "http://localhost:3000";
  const configuredOrigins = authorizedParties
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (configuredOrigins.length === 0) {
    configuredOrigins.push("http://localhost:3000");
  }
  return authenticateUserWithClerk(
    request,
    (await clerkClient()) as ClerkRequestAuthenticator,
    clientId,
    configuredOrigins,
  );
};

export const requireAuthenticatedParticipant = async (
  request: Request,
): Promise<AuthenticatedParticipant> => {
  const authentication = await authenticateParticipant(request);
  if (!authentication) {
    throw new HttpError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication failed",
    );
  }
  return authentication;
};

export const requireParticipantUserId = async (
  request: Request,
): Promise<string> => {
  const authentication = await requireAuthenticatedParticipant(request);
  return authentication.clerkUserId;
};
