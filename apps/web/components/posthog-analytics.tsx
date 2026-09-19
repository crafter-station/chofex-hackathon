"use client";

import { useAuth } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

import {
  type CampaignProperties,
  campaignPropertyNames,
  isPostHogConfigured,
  isTrackableUrl,
  postHogEventForPublicAnalytics,
  posthogHost,
  posthogKey,
  replaceCampaignProperties,
} from "@/lib/analytics";
import {
  campaignAttributionCookieForLanding,
  expiredCampaignAttributionCookie,
  latestCampaignProperties,
} from "@/lib/campaign-attribution";
import {
  type IdentityState,
  syncPostHogIdentity,
} from "@/lib/posthog-identity";

function writeBrowserCookie(cookie: string): void {
  // biome-ignore lint/suspicious/noDocumentCookie: the server must receive pre-auth landing attribution
  document.cookie = cookie;
}

function persistCampaignLanding(): void {
  if (!isTrackableUrl(window.location.href)) return;
  const attributionCookie = campaignAttributionCookieForLanding(
    window.location.href,
    document.cookie,
    Date.now(),
    window.location.protocol === "https:",
  );
  if (attributionCookie) writeBrowserCookie(attributionCookie);
}

function syncRegisteredCampaign(): CampaignProperties {
  const campaign = latestCampaignProperties(document.cookie);
  for (const property of campaignPropertyNames) posthog.unregister(property);
  posthog.register(campaign);
  return campaign;
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
  const attributionSuppressed = useRef(false);

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
        if (!publicEvent) return null;
        if (publicEvent.event === "$pageview") {
          attributionSuppressed.current = false;
          persistCampaignLanding();
        }
        let campaign: CampaignProperties = {};
        if (!attributionSuppressed.current) {
          campaign = syncRegisteredCampaign();
        }
        return {
          ...publicEvent,
          properties: replaceCampaignProperties(
            publicEvent.properties,
            campaign,
          ),
        };
      },
    });
    initialized.current = true;
    if (!identitySyncEnabled) {
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
    const beforeReset = () => {
      writeBrowserCookie(
        expiredCampaignAttributionCookie(window.location.protocol === "https:"),
      );
      if (initialPageviewCaptured.current) {
        attributionSuppressed.current = true;
      }
    };
    syncPostHogIdentity(
      { isLoaded: identityIsLoaded, userId: identityUserId },
      posthog,
      window.localStorage,
      beforeReset,
    );
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
