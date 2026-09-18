import { expect, test } from "bun:test";

import {
  campaignPropertiesFromUrl,
  isPostHogConfigured,
  isTrackablePath,
  isTrackableUrl,
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
