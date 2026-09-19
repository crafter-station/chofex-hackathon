"use client";

import { useAuth } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

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
  shouldCaptureCampaignLandingAfterIdentitySync,
} from "@/lib/campaign-attribution";
import {
  type IdentityState,
  syncPostHogIdentity,
} from "@/lib/posthog-identity";

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
  readonly identity?: IdentityState;
}) {
  const identitySyncEnabled = identity !== undefined;
  const identityIsLoaded = identity?.isLoaded ?? false;
  const identityUserId = identity?.userId ?? null;
  const canInitialize = !identitySyncEnabled || identityIsLoaded;
  const initialized = useRef(false);
  const initialPageviewCaptured = useRef(false);

  useEffect(() => {
    if (!canInitialize || initialized.current) return;
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
      capture_pageview: false,
      defaults: "2025-05-24",
      before_send: (event) => {
        const publicEvent = postHogEventForPublicAnalytics(event);
        if (publicEvent?.event === "$pageview") captureCampaignLanding();
        return publicEvent;
      },
    });
    initialized.current = true;
    if (!identitySyncEnabled) {
      captureCampaignLanding();
      posthog.capture("$pageview");
      posthog.set_config({ capture_pageview: "history_change" });
      initialPageviewCaptured.current = true;
    }
  }, [canInitialize, identitySyncEnabled]);

  useEffect(() => {
    if (
      !identitySyncEnabled ||
      !identityIsLoaded ||
      !initialized.current ||
      !isPostHogConfigured(posthogKey)
    ) {
      return;
    }
    const didReset = syncPostHogIdentity(
      { isLoaded: identityIsLoaded, userId: identityUserId },
      posthog,
      window.localStorage,
    );
    if (didReset) {
      writeBrowserCookie(
        expiredCampaignAttributionCookie(window.location.protocol === "https:"),
      );
    }
    const shouldCaptureLanding = shouldCaptureCampaignLandingAfterIdentitySync({
      didReset,
      hasCapturedInitialPageview: initialPageviewCaptured.current,
    });
    if (shouldCaptureLanding) captureCampaignLanding();
    if (!initialPageviewCaptured.current) {
      posthog.capture("$pageview");
      posthog.set_config({ capture_pageview: "history_change" });
      initialPageviewCaptured.current = true;
    }
  }, [identitySyncEnabled, identityIsLoaded, identityUserId]);

  return null;
}

export function AuthenticatedPostHogAnalytics() {
  const { isLoaded, userId } = useAuth();
  return <PostHogAnalytics identity={{ isLoaded, userId: userId ?? null }} />;
}
