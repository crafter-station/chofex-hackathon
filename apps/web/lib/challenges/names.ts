const githubHandleFromUrl = (
  url: string | null | undefined,
): string | undefined => {
  if (!url) return undefined;
  const match = url.match(/github\.com\/([^/?#]+)/i);
  const handle = match?.[1];
  if (!handle || handle === "") return undefined;
  return handle;
};

export const rankingDisplayName = (identity: {
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly githubUrl?: string | null;
  readonly shareCode: string;
}): string => {
  const handle = githubHandleFromUrl(identity.githubUrl);
  if (handle) return handle;

  const firstName = identity.firstName?.trim();
  if (firstName) {
    const lastInitial = identity.lastName?.trim().charAt(0);
    if (lastInitial) return `${firstName} ${lastInitial.toUpperCase()}.`;
    return firstName;
  }

  return `BOX-${identity.shareCode}`;
};
