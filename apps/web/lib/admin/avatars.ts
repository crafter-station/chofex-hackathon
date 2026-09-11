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

export const preferredAvatarUrl = (
  clerkImageUrl: string | undefined,
  githubUrl: string | null | undefined,
): string | undefined => clerkImageUrl ?? githubAvatarUrl(githubUrl);
