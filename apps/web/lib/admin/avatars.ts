export { githubAvatarUrl } from "@/lib/registration/pictures";

import { githubAvatarUrl } from "@/lib/registration/pictures";

export const preferredAvatarUrl = (
  clerkImageUrl: string | undefined,
  githubUrl: string | null | undefined,
): string | undefined => clerkImageUrl ?? githubAvatarUrl(githubUrl);
