import { expect, test } from "bun:test";

import {
  campaignPropertiesFromUrl,
  isExtensionNoiseException,
  isPostHogConfigured,
  isTrackablePath,
  isTrackableUrl,
  postHogEventForPublicAnalytics,
} from "./analytics";

test("reads campaign dimensions for conversion events", () => {
  expect(
    campaignPropertiesFromUrl(
      "https://hacktheandes.com/?utm_source=instagram&utm_medium=organic_social&utm_campaign=launch&utm_content=reel-42",
    ),
  ).toEqual({
    $utm_source: "instagram",
    $utm_medium: "organic_social",
    $utm_campaign: "launch",
    $utm_content: "reel-42",
  });
});

test("ignores empty campaign dimensions and bounds their size", () => {
  expect(
    campaignPropertiesFromUrl(
      `https://hacktheandes.com/?utm_source=&utm_campaign=${"a".repeat(250)}`,
    ),
  ).toEqual({ $utm_campaign: "a".repeat(200) });
});

test("recognizes real PostHog configuration", () => {
  expect(isPostHogConfigured("phc_project_key")).toBe(true);
  expect(isPostHogConfigured("phc_replace_me")).toBe(false);
  expect(isPostHogConfigured(undefined)).toBe(false);
});

test("tracks the public marketing funnel", () => {
  expect(isTrackablePath("/")).toBe(true);
  expect(isTrackablePath("/challenges")).toBe(true);
  expect(isTrackablePath("/challenges/black-box")).toBe(true);
  expect(isTrackablePath("/terms")).toBe(true);
});

test("never tracks staff screens that carry participant data", () => {
  expect(isTrackablePath("/admin")).toBe(false);
  expect(isTrackablePath("/admin/participants")).toBe(false);
  expect(isTrackablePath("/admin/utm")).toBe(false);
  expect(isTrackablePath("/sign-in")).toBe(false);
  expect(isTrackablePath("/auth/complete")).toBe(false);
  expect(isTrackablePath("/welcome")).toBe(false);
});

test("does not mistake a prefix for a path segment", () => {
  expect(isTrackablePath("/administration")).toBe(true);
  expect(isTrackablePath("/welcome-back")).toBe(true);
});

test("reads the pathname out of a full url, query string included", () => {
  expect(isTrackableUrl("https://hacktheandes.com/?utm_source=instagram")).toBe(
    true,
  );
  expect(
    isTrackableUrl("https://hacktheandes.com/admin/participants?q=emmy"),
  ).toBe(false);
});

test("fails closed on anything it cannot parse", () => {
  expect(isTrackableUrl("not a url")).toBe(false);
  expect(isTrackableUrl(undefined)).toBe(false);
  expect(isTrackableUrl(null)).toBe(false);
});

test("drops the browser extension promise rejection, whatever its id", () => {
  const extensionEvent = (id: number) => ({
    event: "$exception",
    properties: {
      $exception_list: [
        {
          value: `Non-Error promise rejection captured with value: Object Not Found Matching Id:${id}, MethodName:update, ParamCount:4`,
        },
      ],
    },
  });

  expect(isExtensionNoiseException(extensionEvent(1))).toBe(true);
  expect(isExtensionNoiseException(extensionEvent(2))).toBe(true);
});

test("keeps first-party exceptions and non-exception events", () => {
  expect(
    isExtensionNoiseException({
      event: "$exception",
      properties: {
        $exception_list: [{ value: "Failed to fetch model.glb" }],
      },
    }),
  ).toBe(false);
  expect(isExtensionNoiseException({ event: "$pageview" })).toBe(false);
  expect(
    isExtensionNoiseException({ event: "$exception", properties: {} }),
  ).toBe(false);
});

test("allows identity linking without exposing an excluded URL", () => {
  const identityEvent: {
    event?: string;
    properties?: Record<string, unknown>;
  } = {
    event: "$identify",
    properties: {
      $anon_distinct_id: "anonymous-123",
      $current_url:
        "https://hacktheandes.com/admin/participants?q=private@example.com",
      $pathname: "/admin/participants",
      $referrer: "https://hacktheandes.com/auth/complete?token=private",
      distinct_id: "user_test_123",
    },
  };
  expect(postHogEventForPublicAnalytics(identityEvent)).toEqual({
    event: "$identify",
    properties: {
      $anon_distinct_id: "anonymous-123",
      distinct_id: "user_test_123",
    },
  });
});
