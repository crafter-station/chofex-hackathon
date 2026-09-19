const identifiedUserStorageKey = "chofex_posthog_identified_user";

type IdentityState = {
  readonly isLoaded: boolean;
  readonly userId: string | null;
};

type IdentityAnalytics = {
  identify(userId: string): void;
  reset(): void;
};

type IdentityStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

/** Synchronizes trusted Clerk identity and reports whether a prior identity was reset. */
export function syncPostHogIdentity(
  state: IdentityState,
  analytics: IdentityAnalytics,
  storage: IdentityStorage,
): boolean {
  if (!state.isLoaded) return false;

  let previousUserId: string | null = null;
  try {
    previousUserId = storage.getItem(identifiedUserStorageKey);
  } catch {
    // Identification still works when browser storage is unavailable.
  }

  if (!state.userId) {
    if (!previousUserId) return false;
    analytics.reset();
    try {
      storage.removeItem(identifiedUserStorageKey);
    } catch {
      // PostHog has still been reset, which is the privacy-critical behavior.
    }
    return true;
  }

  let didReset = false;
  if (previousUserId && previousUserId !== state.userId) {
    analytics.reset();
    didReset = true;
  }
  analytics.identify(state.userId);
  try {
    storage.setItem(identifiedUserStorageKey, state.userId);
  } catch {
    // The current browser session remains identified even without persistence.
  }
  return didReset;
}
