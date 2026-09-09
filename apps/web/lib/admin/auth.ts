import { auth, clerkClient } from "@clerk/nextjs/server";

import { HttpError } from "@/lib/registration/http";

export interface AdminIdentity {
  readonly clerkUserId: string;
}

const configuredAdminIds = (): ReadonlySet<string> =>
  new Set(
    (process.env.ADMIN_CLERK_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );

export const getAdminIdentity = async (): Promise<AdminIdentity | null> => {
  const authentication = await auth();
  if (!authentication.userId) return null;

  if (configuredAdminIds().has(authentication.userId)) {
    return { clerkUserId: authentication.userId };
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(authentication.userId);
  const publicRole = user.publicMetadata.role;
  const privateRole = user.privateMetadata.role;
  if (publicRole === "admin" || privateRole === "admin") {
    return { clerkUserId: authentication.userId };
  }
  return null;
};

export const requireAdminIdentity = async (): Promise<AdminIdentity> => {
  const identity = await getAdminIdentity();
  if (!identity) {
    throw new HttpError(403, "ADMIN_REQUIRED", "Administrator access required");
  }
  return identity;
};
