import { PostHog } from "posthog-node";

import { isPostHogConfigured, posthogHost, posthogKey } from "./analytics";

type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface ProductEvent {
  readonly distinctId: string;
  readonly event: string;
  readonly properties?: EventProperties;
}

let client: PostHog | undefined;
let reportedMissingConfiguration = false;

const posthogClient = (): PostHog | undefined => {
  if (!isPostHogConfigured(posthogKey)) {
    if (
      process.env.NODE_ENV === "development" &&
      !reportedMissingConfiguration
    ) {
      reportedMissingConfiguration = true;
      console.error(
        new Error(
          "NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured",
        ),
      );
    }
    return undefined;
  }

  client ??= new PostHog(posthogKey, {
    host: posthogHost,
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
};

/** Analytics failures must never turn a successful participant action into a failure. */
export async function captureProductEvent({
  distinctId,
  event,
  properties,
}: ProductEvent): Promise<void> {
  const posthog = posthogClient();
  if (!posthog) return;

  try {
    posthog.capture({
      distinctId,
      event,
      properties,
      disableGeoip: true,
    });
    await posthog.flush();
  } catch (error) {
    console.error("Could not send PostHog product event", { event, error });
  }
}
