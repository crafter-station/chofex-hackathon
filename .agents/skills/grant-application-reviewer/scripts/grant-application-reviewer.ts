const APPLICATION_REVIEWER_ROLE = "application_reviewer";
const CLERK_API_URL = "https://api.clerk.com/v1";
const CLERK_API_VERSION = "2026-05-12";

interface ClerkEmailAddress {
  readonly email_address: string;
}

interface ClerkUser {
  readonly id: string;
  readonly email_addresses: readonly ClerkEmailAddress[];
  readonly private_metadata?: Record<string, unknown>;
}

interface ClerkError {
  readonly errors?: readonly {
    readonly long_message?: string;
    readonly message?: string;
  }[];
}

const fail = (message: string): never => {
  throw new Error(message);
};

const parseArguments = (): {
  readonly email: string;
  readonly apply: boolean;
} => {
  const argumentsWithoutRuntime = process.argv.slice(2);
  const apply = argumentsWithoutRuntime.includes("--apply");
  const positionalArguments = argumentsWithoutRuntime.filter(
    (argument) => argument !== "--apply",
  );

  if (positionalArguments.length !== 1) {
    fail("Usage: grant-application-reviewer.ts <email> [--apply]");
  }

  const email = positionalArguments[0]?.trim().toLowerCase();
  if (!email?.includes("@")) {
    fail("Provide a valid email address");
  }

  return { email, apply };
};

const clerkEnvironmentFor = (secretKey: string): string => {
  if (secretKey.startsWith("sk_live_")) return "production";
  if (secretKey.startsWith("sk_test_")) return "development";
  return "unknown";
};

const errorMessageFrom = (body: unknown): string | undefined => {
  if (!body || typeof body !== "object") return undefined;
  const errors = (body as ClerkError).errors;
  const firstError = errors?.[0];
  return firstError?.long_message ?? firstError?.message;
};

const clerkRequest = async <ResponseBody>(
  secretKey: string,
  path: string,
  init?: RequestInit,
): Promise<ResponseBody> => {
  const response = await fetch(`${CLERK_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Clerk-API-Version": CLERK_API_VERSION,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body: unknown = await response.json();
  if (!response.ok) {
    const detail = errorMessageFrom(body);
    let message = `Clerk API request failed with status ${response.status}`;
    if (detail) message = `${message}: ${detail}`;
    fail(message);
  }

  return body as ResponseBody;
};

const exactUserFor = async (
  secretKey: string,
  email: string,
): Promise<ClerkUser> => {
  const parameters = new URLSearchParams();
  parameters.append("email_address", email);
  parameters.set("limit", "10");

  const users = await clerkRequest<readonly ClerkUser[]>(
    secretKey,
    `/users?${parameters.toString()}`,
  );
  const exactUsers = users.filter((user) =>
    user.email_addresses.some(
      (address) => address.email_address.toLowerCase() === email,
    ),
  );

  if (exactUsers.length === 0) {
    fail(`No Clerk user has the exact email address ${email}`);
  }
  if (exactUsers.length > 1) {
    fail(`More than one Clerk user has the exact email address ${email}`);
  }

  const user = exactUsers[0];
  if (!user) fail(`No Clerk user has the exact email address ${email}`);
  return user;
};

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const rolesFor = (user: ClerkUser): readonly string[] => {
  const roles = user.private_metadata?.roles;
  if (roles === undefined) return [];
  if (!isStringArray(roles)) {
    throw new Error(
      `Clerk user ${user.id} has malformed private metadata roles`,
    );
  }
  return roles;
};

const proposedRolesFor = (
  currentRoles: readonly string[],
): readonly string[] => {
  if (currentRoles.includes(APPLICATION_REVIEWER_ROLE)) return currentRoles;
  return [...currentRoles, APPLICATION_REVIEWER_ROLE];
};

const main = async (): Promise<void> => {
  const { email, apply } = parseArguments();
  const secretKey =
    process.env.CLERK_SECRET_KEY ?? fail("CLERK_SECRET_KEY is not configured");

  const clerkEnvironment = clerkEnvironmentFor(secretKey);
  const user = await exactUserFor(secretKey, email);
  const currentRoles = rolesFor(user);
  const proposedRoles = proposedRolesFor(currentRoles);
  const changed = proposedRoles !== currentRoles;

  if (!apply) {
    console.log(
      JSON.stringify(
        {
          mode: "preview",
          clerkEnvironment,
          email,
          userId: user.id,
          currentRoles,
          proposedRoles,
          changed,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (changed) {
    await clerkRequest<ClerkUser>(
      secretKey,
      `/users/${encodeURIComponent(user.id)}/metadata`,
      {
        method: "PATCH",
        body: JSON.stringify({ private_metadata: { roles: proposedRoles } }),
      },
    );
  }

  const verifiedUser = await clerkRequest<ClerkUser>(
    secretKey,
    `/users/${encodeURIComponent(user.id)}`,
  );
  const finalRoles = rolesFor(verifiedUser);
  const verified = finalRoles.includes(APPLICATION_REVIEWER_ROLE);
  if (!verified) fail("Clerk did not persist the application reviewer role");

  console.log(
    JSON.stringify(
      {
        mode: "apply",
        clerkEnvironment,
        email,
        userId: user.id,
        changed,
        finalRoles,
        verified,
      },
      null,
      2,
    ),
  );
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exitCode = 1;
});
