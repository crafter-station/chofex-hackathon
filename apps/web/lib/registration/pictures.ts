import { HttpError } from "./http";

export const githubAvatarUrl = (
  githubUrl: string | null | undefined,
): string | undefined => {
  if (!githubUrl) return undefined;
  try {
    const url = new URL(githubUrl);
    const isGitHub =
      url.protocol === "https:" &&
      (url.hostname === "github.com" || url.hostname === "www.github.com");
    if (!isGitHub) return undefined;
    const [username] = url.pathname.split("/").filter(Boolean);
    if (!username) return undefined;
    return `https://github.com/${encodeURIComponent(username)}.png?size=112`;
  } catch {
    return undefined;
  }
};

export const confirmedPictureUrl = (
  source: "clerk" | "github" | "upload",
  options: {
    readonly clerkPictureUrl?: string;
    readonly githubUrl?: string | null;
    readonly uploadedPictureUrl?: string | null;
  },
): string => {
  let url: string | undefined;
  if (source === "clerk") url = options.clerkPictureUrl;
  if (source === "github") url = githubAvatarUrl(options.githubUrl);
  if (source === "upload") url = options.uploadedPictureUrl ?? undefined;
  if (url) return url;
  throw new HttpError(
    422,
    "PICTURE_SOURCE_UNAVAILABLE",
    `The selected ${source} picture is not available`,
  );
};
