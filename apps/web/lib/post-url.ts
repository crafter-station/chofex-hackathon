import type { UtmSource } from "./utm";

/** What the link points at, so the builder can name what it recognised. */
export type PostUrlKind =
  | "post"
  | "reel"
  | "story"
  | "video"
  | "photo"
  | "article"
  | "share";

export const postUrlKindLabels: Record<PostUrlKind, string> = {
  post: "post",
  reel: "reel",
  story: "story",
  video: "video",
  photo: "photo",
  article: "article",
  share: "share link",
};

export interface PostUrlMatch {
  /** Null when the host is not one of the networks we build links for. */
  readonly network: UtmSource | null;
  readonly kind: PostUrlKind | null;
  /** Null when the link carries no id we can read without following a redirect. */
  readonly id: string | null;
}

const networkDomains = [
  ["instagram", ["instagram.com", "instagr.am"]],
  ["linkedin", ["linkedin.com", "lnkd.in"]],
  ["x", ["x.com", "twitter.com", "t.co"]],
  ["facebook", ["facebook.com", "fb.com", "fb.watch"]],
] as const satisfies ReadonlyArray<readonly [UtmSource, readonly string[]]>;

function hostNetwork(hostname: string): UtmSource | null {
  const host = hostname.toLowerCase();
  for (const [network, domains] of networkDomains) {
    const owned = domains.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
    if (owned) return network;
  }
  return null;
}

function hostIs(url: URL, domain: string): boolean {
  const host = url.hostname.toLowerCase();
  return host === domain || host.endsWith(`.${domain}`);
}

const schemePattern = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * Without a scheme we only read the text as a link when the host is a network we
 * know, so plain ids like "launch-reel" keep working as ids.
 */
function parseLink(value: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  const explicit = schemePattern.test(trimmed);
  let url: URL;
  try {
    url = new URL(explicit ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!explicit && !hostNetwork(url.hostname)) return null;
  return url;
}

function segmentsOf(url: URL): readonly string[] {
  return url.pathname.split("/").filter(Boolean);
}

/** Routes are matched case-insensitively; ids keep the casing they were pasted with. */
function routesOf(segments: readonly string[]): readonly string[] {
  return segments.map((segment) => segment.toLowerCase());
}

function miss(network: UtmSource): PostUrlMatch {
  return { network, kind: null, id: null };
}

function share(network: UtmSource): PostUrlMatch {
  return { network, kind: "share", id: null };
}

const instagramKinds = new Map<string, PostUrlKind>([
  ["p", "post"],
  ["reel", "reel"],
  ["reels", "reel"],
  ["tv", "video"],
]);

/** Shortcodes are Instagram's base64url media ids: 10 or 11 characters today. */
const instagramShortcode = /^[A-Za-z0-9_-]{5,20}$/;
const mediaPk = /^\d{5,25}$/;

function detectInstagram(url: URL): PostUrlMatch {
  const segments = segmentsOf(url);
  const routes = routesOf(segments);

  // Share links are redirect tokens; the shortcode only exists after following them.
  if (routes[0] === "share") return share("instagram");

  if (routes[0] === "stories") {
    const last = segments.at(-1) ?? "";
    return {
      network: "instagram",
      kind: "story",
      id: mediaPk.test(last) ? last : null,
    };
  }

  // Posts are addressed either directly or under the author's profile.
  const offset = instagramKinds.has(routes[0] ?? "") ? 0 : 1;
  const kind = instagramKinds.get(routes[offset] ?? "");
  const shortcode = segments[offset + 1] ?? "";
  if (kind && instagramShortcode.test(shortcode)) {
    return { network: "instagram", kind, id: shortcode };
  }
  return miss("instagram");
}

/** Snowflake ids are decimal and top out at 19 digits. */
const tweetId = /^\d{1,19}$/;

function detectX(url: URL): PostUrlMatch {
  if (hostIs(url, "t.co")) return share("x");

  const segments = segmentsOf(url);
  const at = routesOf(segments).findIndex(
    (route) => route === "status" || route === "statuses",
  );
  const id = at === -1 ? "" : (segments[at + 1] ?? "");
  if (tweetId.test(id)) return { network: "x", kind: "post", id };
  return miss("x");
}

/** Activity ids are 19-digit snowflakes, in both the /posts/ and urn: shapes. */
const linkedinActivity = /activity[:-](\d{15,25})(?!\d)/i;
const linkedinUrn = /urn:li:(?:share|ugcPost):(\d{4,25})(?!\d)/i;

function detectLinkedin(url: URL): PostUrlMatch {
  if (hostIs(url, "lnkd.in")) return share("linkedin");

  const path = url.pathname;
  const activity = linkedinActivity.exec(path) ?? linkedinUrn.exec(path);
  if (activity?.[1]) {
    return { network: "linkedin", kind: "post", id: activity[1] };
  }

  // Pulse articles expose no numeric id, so the slug is the only stable handle.
  const segments = segmentsOf(url);
  if (routesOf(segments)[0] === "pulse" && segments[1]) {
    return { network: "linkedin", kind: "article", id: segments[1] };
  }
  return miss("linkedin");
}

const facebookPostId = /^(?:pfbid[0-9A-Za-z]+|\d{5,25})$/;
const facebookNumericId = /^\d{5,25}$/;

function detectFacebook(url: URL): PostUrlMatch {
  if (hostIs(url, "fb.watch")) return share("facebook");

  // l.facebook.com only wraps outbound links, so there is no post behind it.
  const host = url.hostname.toLowerCase();
  if (host.startsWith("l.") || host.startsWith("lm.")) return miss("facebook");

  const segments = segmentsOf(url);
  const routes = routesOf(segments);
  if (routes[0] === "share") return share("facebook");

  // permalink.php and story.php carry the page id too; the post is story_fbid.
  const story = url.searchParams.get("story_fbid");
  if (story && facebookPostId.test(story)) {
    return { network: "facebook", kind: "post", id: story };
  }
  const photo = url.searchParams.get("fbid");
  if (photo && facebookNumericId.test(photo)) {
    return { network: "facebook", kind: "photo", id: photo };
  }
  const watched = url.searchParams.get("v");
  if (watched && facebookNumericId.test(watched)) {
    return { network: "facebook", kind: "video", id: watched };
  }

  if (routes[0] === "groups") {
    const at = routes.findIndex(
      (route) => route === "posts" || route === "permalink",
    );
    const id = at === -1 ? "" : (segments[at + 1] ?? "");
    if (facebookPostId.test(id))
      return { network: "facebook", kind: "post", id };
    return miss("facebook");
  }

  const reelId = routes[0] === "reel" ? (segments[1] ?? "") : "";
  if (facebookNumericId.test(reelId)) {
    return { network: "facebook", kind: "reel", id: reelId };
  }

  const postId = routes[0] === "posts" ? "" : (segments[2] ?? "");
  if (routes[1] === "posts" && facebookPostId.test(postId)) {
    return { network: "facebook", kind: "post", id: postId };
  }

  // Legacy video paths can carry a vb.<actor> segment before the real id.
  if (routes[1] === "videos") {
    const last = segments.at(-1) ?? "";
    if (facebookNumericId.test(last)) {
      return { network: "facebook", kind: "video", id: last };
    }
  }
  return miss("facebook");
}

/** Returns null when the value is not a link, so it stays usable as a typed id. */
export function detectPostUrl(value: string): PostUrlMatch | null {
  const url = parseLink(value);
  if (!url) return null;

  const network = hostNetwork(url.hostname);
  if (!network) return { network: null, kind: null, id: null };

  switch (network) {
    case "instagram":
      return detectInstagram(url);
    case "linkedin":
      return detectLinkedin(url);
    case "x":
      return detectX(url);
    case "facebook":
      return detectFacebook(url);
  }
}
