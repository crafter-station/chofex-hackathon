"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

import {
  campaignPropertiesFromUrl,
  isPostHogConfigured,
  isTrackableUrl,
  posthogHost,
  posthogKey,
} from "@/lib/analytics";

/**
 * Pageviews capture the campaign landing URL. Registering the UTM dimensions
 * also carries that campaign into later conversion events in the same browser.
 */
export function PostHogAnalytics() {
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
      before_send: (event) => {
        if (!event) return event;
        if (isTrackableUrl(event.properties?.$current_url)) return event;
        return null;
      },
    });
    posthog.register(campaignPropertiesFromUrl(window.location.href));
  }, []);

  return null;
}
