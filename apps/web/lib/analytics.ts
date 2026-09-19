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

export function normalizeCampaignProperties(
  value: unknown,
): CampaignProperties {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const candidate = value as Record<string, unknown>;
  const properties: CampaignProperties = {};
  for (const parameter of campaignParameters) {
    const property = `$${parameter}` as const;
    const rawValue = candidate[property];
    if (typeof rawValue !== "string") continue;
    const normalizedValue = rawValue.trim();
    if (!normalizedValue) continue;
    properties[property] = normalizedValue.slice(0, 200);
  }
  return properties;
}

export function isPostHogConfigured(key: string | undefined): key is string {
  return Boolean(key && !key.includes("replace_me"));
}

/**
 * Registers the latest campaign as event properties so a conversion still has
 * its UTM dimensions after the visitor navigates away from the landing URL.
 */
export function campaignPropertiesFromUrl(url: string): CampaignProperties {
  const searchParams = new URL(url).searchParams;
  const properties: Record<string, string> = {};
  for (const parameter of campaignParameters) {
    const value = searchParams.get(parameter)?.trim();
    if (!value) continue;
    properties[`$${parameter}`] = value;
  }
  return normalizeCampaignProperties(properties);
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

/**
 * A browser extension rejects a promise with a plain string on almost every
 * page. Exception autocapture reports it as a synthetic $exception that carries
 * no first-party stack frame, and its value changes only by an incrementing id.
 * This marker is the stable part of that value, so it identifies the noise.
 */
const extensionRejectionMarker = "Object Not Found Matching Id:";

type AnalyticsEvent = {
  event?: string;
  properties?: Record<string, unknown>;
};

/** Extension promise rejections are not our code, so they never belong in error tracking. */
export function isExtensionNoiseException(event: AnalyticsEvent): boolean {
  if (event.event !== "$exception") return false;
  const exceptions = event.properties?.$exception_list;
  if (!Array.isArray(exceptions)) return false;
  return exceptions.some(
    (exception) =>
      typeof exception?.value === "string" &&
      exception.value.includes(extensionRejectionMarker),
  );
}

function isLocationProperty(property: string): boolean {
  const normalizedProperty = property.toLowerCase();
  return (
    normalizedProperty.includes("url") ||
    normalizedProperty.includes("path") ||
    normalizedProperty.includes("referr")
  );
}

/** Excluded screens may link identity, but their location data must never leave the app. */
export function postHogEventForPublicAnalytics<T extends AnalyticsEvent>(
  event: T | null,
): T | null {
  if (!event) return event;
  if (isExtensionNoiseException(event)) return null;
  if (isTrackableUrl(event.properties?.$current_url)) return event;
  if (event.event !== "$identify") return null;

  const properties = { ...event.properties };
  for (const property of Object.keys(properties)) {
    if (isLocationProperty(property)) delete properties[property];
  }
  return { ...event, properties };
}
