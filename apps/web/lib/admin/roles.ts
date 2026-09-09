export const APPLICATION_REVIEWER_ROLE = "application_reviewer";

interface RoleMetadata {
  readonly role?: unknown;
  readonly roles?: unknown;
}

export const grantsApplicationReviewAccess = (
  metadata: RoleMetadata,
): boolean => {
  if (metadata.role === "admin") return true;
  if (metadata.role === APPLICATION_REVIEWER_ROLE) return true;
  if (!Array.isArray(metadata.roles)) return false;

  return (
    metadata.roles.includes("admin") ||
    metadata.roles.includes(APPLICATION_REVIEWER_ROLE)
  );
};
