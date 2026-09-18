export const utmSources = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "facebook", label: "Facebook" },
] as const;

export type UtmSource = (typeof utmSources)[number]["id"];

export const utmMediums = [
  { id: "organic_social", label: "Organic social" },
  { id: "paid_social", label: "Paid social" },
] as const;

export type UtmMedium = (typeof utmMediums)[number]["id"];

export const utmSiteUrl = "https://hacktheandes.com";
export const defaultUtmCampaign = "hack-the-andes-2026";

/** Keeps post ids comparable across reports: one lowercase slug per post. */
export function normalizePostId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface UtmLinkInput {
  readonly source: UtmSource;
  readonly medium: UtmMedium;
  readonly campaign: string;
  readonly postId: string;
}

/** Returns null when the campaign or post id has no usable characters. */
export function buildUtmLink({
  source,
  medium,
  campaign,
  postId,
}: UtmLinkInput): string | null {
  const campaignId = normalizePostId(campaign);
  const content = normalizePostId(postId);
  if (!campaignId || !content) return null;

  const url = new URL("/", utmSiteUrl);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaignId);
  url.searchParams.set("utm_content", content);
  return url.toString();
}
