"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

import { isTrackableUrl, posthogHost, posthogKey } from "@/lib/analytics";

/**
 * Campaign reporting. Pageviews are captured on history changes, so the UTM
 * parameters the campaign links carry ride along in `$current_url` without any
 * wiring here.
 */
export function PostHogAnalytics() {
  useEffect(() => {
    if (!posthogKey) return;

    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: "2025-05-24",
      before_send: (event) => {
        if (!event) return event;
        if (isTrackableUrl(event.properties?.$current_url)) return event;
        return null;
      },
    });
  }, []);

  return null;
}
