"use client";

import { useAuth } from "@clerk/nextjs";
import posthog, {
  type CaptureOptions,
  type CaptureResult,
  type Properties,
} from "posthog-js";
import { useCallback, useEffect, useRef } from "react";

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

function replayProperties(event: CaptureResult): Properties {
  if (event.event === "$identify" || event.event === "$set") {
    return event.properties;
  }
  const properties = { ...event.properties };
  for (const property of [
    "distinct_id",
    "$anon_distinct_id",
    "$device_id",
    "$user_id",
  ]) {
    delete properties[property];
  }
  return properties;
}

function replayEvent(event: CaptureResult): void {
  const options: CaptureOptions = {
    timestamp: event.timestamp,
    uuid: event.uuid,
  };
  if (event.$set) options.$set = event.$set;
  if (event.$set_once) options.$set_once = event.$set_once;
  posthog.capture(event.event, replayProperties(event), options);
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
  const initialized = useRef(false);
  const initialPageviewCaptured = useRef(false);
  const attributionSuppressed = useRef(false);
  const identityReady = useRef(!identitySyncEnabled);
  const queuedEvents = useRef<CaptureResult[]>([]);

  const beforeIdentityReset = useCallback(() => {
    writeBrowserCookie(
      expiredCampaignAttributionCookie(window.location.protocol === "https:"),
    );
    if (initialPageviewCaptured.current) {
      attributionSuppressed.current = true;
    }
  }, []);

  const completeAnalyticsReadiness = useCallback(() => {
    identityReady.current = true;
    const queued = queuedEvents.current.splice(0);
    const identityEvents = queued.filter(
      (event) => event.event === "$identify" || event.event === "$set",
    );
    for (const event of identityEvents) replayEvent(event);

    if (!initialPageviewCaptured.current) {
      posthog.capture("$pageview");
      posthog.set_config({ capture_pageview: "history_change" });
      initialPageviewCaptured.current = true;
    }

    for (const event of queued) {
      if (event.event === "$identify" || event.event === "$set") continue;
      replayEvent(event);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
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
      save_campaign_params: false,
      save_referrer: false,
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
        const eventWithCampaign = {
          ...publicEvent,
          properties: replaceCampaignProperties(
            publicEvent.properties,
            campaign,
          ),
        };
        if (publicEvent.$set) {
          eventWithCampaign.$set = replaceCampaignProperties(
            publicEvent.$set,
            {},
          );
        }
        if (publicEvent.$set_once) {
          eventWithCampaign.$set_once = replaceCampaignProperties(
            publicEvent.$set_once,
            {},
          );
        }
        if (!identityReady.current) {
          queuedEvents.current.push(eventWithCampaign);
          return null;
        }
        return eventWithCampaign;
      },
    });
    initialized.current = true;
    persistCampaignLanding();
    if (!identitySyncEnabled) completeAnalyticsReadiness();
  }, [completeAnalyticsReadiness, identitySyncEnabled]);

  useEffect(() => {
    if (
      !identitySyncEnabled ||
      !identityIsLoaded ||
      !initialized.current ||
      !isPostHogConfigured(posthogKey)
    ) {
      return;
    }
    syncPostHogIdentity(
      { isLoaded: identityIsLoaded, userId: identityUserId },
      posthog,
      window.localStorage,
      beforeIdentityReset,
    );
    completeAnalyticsReadiness();
  }, [
    beforeIdentityReset,
    completeAnalyticsReadiness,
    identitySyncEnabled,
    identityIsLoaded,
    identityUserId,
  ]);

  useEffect(() => {
    if (
      !identitySyncEnabled ||
      identityIsLoaded ||
      !initialized.current ||
      !isPostHogConfigured(posthogKey)
    ) {
      return;
    }
    const fallback = window.setTimeout(() => {
      if (identityReady.current) return;
      syncPostHogIdentity(
        { isLoaded: true, userId: null },
        posthog,
        window.localStorage,
        beforeIdentityReset,
      );
      completeAnalyticsReadiness();
    }, 5000);
    return () => window.clearTimeout(fallback);
  }, [
    beforeIdentityReset,
    completeAnalyticsReadiness,
    identitySyncEnabled,
    identityIsLoaded,
  ]);

  return null;
}

export function AuthenticatedPostHogAnalytics() {
  const { isLoaded, userId } = useAuth();
  return <PostHogAnalytics identity={{ isLoaded, userId: userId ?? null }} />;
}
