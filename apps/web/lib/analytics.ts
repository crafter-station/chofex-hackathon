export const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

const staffPrefixes = [
  "/admin",
  "/sign-in",
  "/sign-up",
  "/auth",
  "/welcome",
] as const;

/**
 * Admin screens carry participant names and emails in the query string, so
 * their URLs must never leave the app. Campaign reporting only needs the
 * public funnel anyway.
 */
export function isTrackablePath(pathname: string): boolean {
  return !staffPrefixes.some((prefix) => {
    if (pathname === prefix) return true;
    return pathname.startsWith(`${prefix}/`);
  });
}

/** Fails closed: a URL we cannot parse is never worth reporting. */
export function isTrackableUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  try {
    return isTrackablePath(new URL(url).pathname);
  } catch {
    return false;
  }
}
