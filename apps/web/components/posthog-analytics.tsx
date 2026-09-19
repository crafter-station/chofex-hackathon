"use client";

import { useAuth } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect } from "react";

import {
  campaignPropertiesFromUrl,
  isPostHogConfigured,
  isTrackableUrl,
  postHogEventForPublicAnalytics,
  posthogHost,
  posthogKey,
} from "@/lib/analytics";
import {
  campaignAttributionCookieForLanding,
  expiredCampaignAttributionCookie,
} from "@/lib/campaign-attribution";
import { syncPostHogIdentity } from "@/lib/posthog-identity";

type AuthenticatedIdentity = {
  readonly isLoaded: boolean;
  readonly userId: string | null;
};

function writeBrowserCookie(cookie: string): void {
  // biome-ignore lint/suspicious/noDocumentCookie: the server must receive pre-auth landing attribution
  document.cookie = cookie;
}

function captureCampaignLanding(): void {
  if (!isTrackableUrl(window.location.href)) return;
  posthog.register(campaignPropertiesFromUrl(window.location.href));
  const attributionCookie = campaignAttributionCookieForLanding(
    window.location.href,
    document.cookie,
    Date.now(),
    window.location.protocol === "https:",
  );
  if (attributionCookie) writeBrowserCookie(attributionCookie);
}

/**
 * Pageviews capture the campaign landing URL. Registering the UTM dimensions
 * also carries that campaign into later conversion events in the same browser.
 */
export function PostHogAnalytics({
  identity,
}: {
  readonly identity?: AuthenticatedIdentity;
}) {
  const hasIdentity = identity !== undefined;
  const identityIsLoaded = identity?.isLoaded ?? false;
  const identityUserId = identity?.userId ?? null;

  useEffect(() => {
    if (!isPostHogConfigured(posthogKey)) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          new Error(
            "NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured",
          ),
        );
      }
      return;
    }

    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: "2025-05-24",
      before_send: postHogEventForPublicAnalytics,
    });
    captureCampaignLanding();
  }, []);

  useEffect(() => {
    if (!hasIdentity || !isPostHogConfigured(posthogKey)) return;
    const didReset = syncPostHogIdentity(
      { isLoaded: identityIsLoaded, userId: identityUserId },
      posthog,
      window.localStorage,
    );
    if (didReset) {
      writeBrowserCookie(
        expiredCampaignAttributionCookie(window.location.protocol === "https:"),
      );
      if (identityUserId) captureCampaignLanding();
    }
  }, [hasIdentity, identityIsLoaded, identityUserId]);

  return null;
}

export function AuthenticatedPostHogAnalytics() {
  const { isLoaded, userId } = useAuth();
  return <PostHogAnalytics identity={{ isLoaded, userId: userId ?? null }} />;
}
