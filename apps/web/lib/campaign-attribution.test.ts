import { expect, test } from "bun:test";

import {
  campaignAttributionCookieForLanding,
  campaignAttributionProperties,
  latestCampaignProperties,
} from "./campaign-attribution";

const firstTouchAt = Date.UTC(2026, 8, 1, 12);

test("preserves first-touch attribution while replacing the latest touch", () => {
  const firstCookie = campaignAttributionCookieForLanding(
    "https://hacktheandes.com/?utm_source=email&utm_medium=outbound&utm_campaign=andes&utm_content=invite-a",
    "",
    firstTouchAt,
    true,
  );
  expect(firstCookie).toBeDefined();

  const latestTouchAt = firstTouchAt + 24 * 60 * 60 * 1000;
  const latestCookie = campaignAttributionCookieForLanding(
    "https://hacktheandes.com/challenges/black-box?utm_source=linkedin&utm_medium=paid_social&utm_campaign=challenge&utm_term=ml",
    firstCookie ?? "",
    latestTouchAt,
    true,
  );

  expect(campaignAttributionProperties(latestCookie, latestTouchAt)).toEqual({
    first_campaign_at: "2026-09-01T12:00:00.000Z",
    first_utm_campaign: "andes",
    first_utm_content: "invite-a",
    first_utm_medium: "outbound",
    first_utm_source: "email",
    latest_campaign_at: "2026-09-02T12:00:00.000Z",
    latest_utm_campaign: "challenge",
    latest_utm_medium: "paid_social",
    latest_utm_source: "linkedin",
    latest_utm_term: "ml",
  });
});

test("normalizes campaign values and ignores unknown query parameters", () => {
  const cookie = campaignAttributionCookieForLanding(
    `https://hacktheandes.com/?utm_campaign=${"a".repeat(250)}&email=private%40example.com&unexpected=value`,
    "",
    firstTouchAt,
    false,
  );

  expect(campaignAttributionProperties(cookie, firstTouchAt)).toEqual({
    first_campaign_at: "2026-09-01T12:00:00.000Z",
    first_utm_campaign: "a".repeat(200),
    latest_campaign_at: "2026-09-01T12:00:00.000Z",
    latest_utm_campaign: "a".repeat(200),
  });
  expect(cookie).toContain("SameSite=Lax");
  expect(cookie).not.toContain("Secure");
  expect(cookie).not.toContain("private");
});

test("revalidates values from the browser-writable cookie", () => {
  const storedAttribution = encodeURIComponent(
    JSON.stringify({
      version: 1,
      first: {
        at: firstTouchAt,
        campaign: {
          $utm_source: `  ${"x".repeat(250)}  `,
          email: "private@example.com",
        },
      },
      latest: {
        at: firstTouchAt,
        campaign: { $utm_campaign: " challenge " },
      },
    }),
  );

  expect(
    campaignAttributionProperties(
      `chofex_campaign_attribution=${storedAttribution}`,
      firstTouchAt,
    ),
  ).toEqual({
    first_campaign_at: "2026-09-01T12:00:00.000Z",
    first_utm_source: "x".repeat(200),
    latest_campaign_at: "2026-09-01T12:00:00.000Z",
    latest_utm_campaign: "challenge",
  });
});

test("rejects malformed, expired, and non-public attribution", () => {
  expect(
    campaignAttributionProperties(
      "chofex_campaign_attribution=%7Bnot-json",
      firstTouchAt,
    ),
  ).toEqual({});

  const cookie = campaignAttributionCookieForLanding(
    "https://hacktheandes.com/?utm_source=email",
    "",
    firstTouchAt,
    true,
  );
  expect(
    campaignAttributionProperties(
      cookie,
      firstTouchAt + 91 * 24 * 60 * 60 * 1000,
    ),
  ).toEqual({});
  expect(
    campaignAttributionCookieForLanding(
      "https://hacktheandes.com/admin?utm_source=email",
      "",
      firstTouchAt,
      true,
    ),
  ).toBeUndefined();
});

test("retains a fresh latest touch after the older first touch expires", () => {
  const firstCookie = campaignAttributionCookieForLanding(
    "https://hacktheandes.com/?utm_campaign=old-campaign",
    "",
    firstTouchAt,
    true,
  );
  const latestTouchAt = firstTouchAt + 89 * 24 * 60 * 60 * 1000;
  const latestCookie = campaignAttributionCookieForLanding(
    "https://hacktheandes.com/challenges/black-box?utm_campaign=fresh-campaign",
    firstCookie,
    latestTouchAt,
    true,
  );
  const readAt = firstTouchAt + 91 * 24 * 60 * 60 * 1000;

  expect(campaignAttributionProperties(latestCookie, readAt)).toEqual({
    first_campaign_at: new Date(latestTouchAt).toISOString(),
    first_utm_campaign: "fresh-campaign",
    latest_campaign_at: new Date(latestTouchAt).toISOString(),
    latest_utm_campaign: "fresh-campaign",
  });
});

test("keeps encoded Unicode and escaped values within browser cookie limits", () => {
  for (const largeValue of [
    "🏔️".repeat(200),
    "\\".repeat(200),
    "\u0000".repeat(200),
  ]) {
    const url = new URL("https://hacktheandes.com/");
    for (const parameter of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ]) {
      url.searchParams.set(parameter, largeValue);
    }

    const firstCookie = campaignAttributionCookieForLanding(
      url.toString(),
      "",
      firstTouchAt,
      true,
    );
    const latestCookie = campaignAttributionCookieForLanding(
      url.toString(),
      firstCookie,
      firstTouchAt + 1,
      true,
    );

    expect(latestCookie?.length).toBeLessThan(4096);
    expect(
      campaignAttributionProperties(latestCookie, firstTouchAt + 1),
    ).toMatchObject({
      first_utm_campaign: expect.any(String),
      latest_utm_campaign: expect.any(String),
    });
  }
});

test("returns only a validated latest campaign for browser registration", () => {
  const cookie = campaignAttributionCookieForLanding(
    "https://hacktheandes.com/?utm_source=email&utm_campaign=launch",
    "",
    firstTouchAt,
    true,
  );

  expect(latestCampaignProperties(cookie, firstTouchAt)).toEqual({
    $utm_campaign: "launch",
    $utm_source: "email",
  });
  expect(
    latestCampaignProperties(cookie, firstTouchAt + 91 * 24 * 60 * 60 * 1000),
  ).toEqual({});
});
