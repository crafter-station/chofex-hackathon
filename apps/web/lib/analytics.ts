export const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

const campaignParameters = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type CampaignParameter = (typeof campaignParameters)[number];
export type CampaignProperties = Partial<
  Record<`$${CampaignParameter}`, string>
>;

export function isPostHogConfigured(key: string | undefined): key is string {
  return Boolean(key && !key.includes("replace_me"));
}

/**
 * Registers the latest campaign as event properties so a conversion still has
 * its UTM dimensions after the visitor navigates away from the landing URL.
 */
export function campaignPropertiesFromUrl(url: string): CampaignProperties {
  const searchParams = new URL(url).searchParams;
  const properties: CampaignProperties = {};
  for (const parameter of campaignParameters) {
    const value = searchParams.get(parameter)?.trim();
    if (!value) continue;
    properties[`$${parameter}`] = value.slice(0, 200);
  }
  return properties;
}

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
