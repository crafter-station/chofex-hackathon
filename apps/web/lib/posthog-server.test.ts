import { expect, test } from "bun:test";

import {
  captureProductEvent,
  productEventWithCampaignAttribution,
} from "./posthog-server";

const capturedAt = Date.UTC(2026, 8, 1, 12);

test("adds attribution without changing application or challenge semantics", async () => {
  const { campaignAttributionCookieForLanding } = await import(
    "./campaign-attribution"
  );
  const cookie = campaignAttributionCookieForLanding(
    "https://hacktheandes.com/challenges/black-box?utm_source=email&utm_campaign=challenge-link",
    "",
    capturedAt,
    true,
  );
  const request = new Request("https://hacktheandes.com/api/v1/test", {
    headers: { cookie: cookie ?? "" },
  });

  const application = productEventWithCampaignAttribution(
    request,
    {
      distinctId: "user_test",
      event: "application_submitted",
      properties: { application_status: "submitted" },
    },
    capturedAt,
  );
  const challenge = productEventWithCampaignAttribution(
    request,
    {
      distinctId: "user_test",
      event: "challenge_evaluation_submitted",
      properties: { challenge_slug: "black-box" },
    },
    capturedAt,
  );

  expect(application.event).toBe("application_submitted");
  expect(application.properties).toMatchObject({
    application_status: "submitted",
    first_utm_source: "email",
    latest_utm_campaign: "challenge-link",
  });
  expect(challenge.event).toBe("challenge_evaluation_submitted");
  expect(challenge.properties).toMatchObject({
    challenge_slug: "black-box",
    first_utm_source: "email",
    latest_utm_campaign: "challenge-link",
  });
});

test("server capture remains a safe no-op without PostHog configuration", async () => {
  await expect(
    captureProductEvent({
      distinctId: "user_test",
      event: "application_draft_saved",
    }),
  ).resolves.toBeUndefined();
});
