export const utmSources = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "facebook", label: "Facebook" },
] as const;

export type UtmSource = (typeof utmSources)[number]["id"];

export const utmSiteUrl = "https://hacktheandes.com";

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
  readonly postId: string;
}

/** Returns null when the post id has no usable characters. */
export function buildUtmLink({ source, postId }: UtmLinkInput): string | null {
  const content = normalizePostId(postId);
  if (!content) return null;

  const url = new URL("/", utmSiteUrl);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_content", content);
  return url.toString();
}
