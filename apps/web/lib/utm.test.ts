import { expect, test } from "bun:test";

import {
  buildUtmLink,
  defaultUtmCampaign,
  normalizePostId,
  utmMediums,
  utmSources,
} from "./utm";

const input = {
  source: "instagram" as const,
  medium: "organic_social" as const,
  campaign: defaultUtmCampaign,
  postId: "post-123",
};

test("builds a complete campaign landing link", () => {
  expect(buildUtmLink(input)).toBe(
    "https://hacktheandes.com/?utm_source=instagram&utm_medium=organic_social&utm_campaign=hack-the-andes-2026&utm_content=post-123",
  );
});

test("normalizes messy post ids into a single slug", () => {
  expect(normalizePostId("  Reel 42 / Carrusel  ")).toBe("reel-42-carrusel");
  expect(normalizePostId("DM_ábc")).toBe("dm-bc");
});

test("rejects post ids without usable characters", () => {
  expect(buildUtmLink({ ...input, source: "x", postId: "   " })).toBeNull();
  expect(buildUtmLink({ ...input, source: "x", postId: "///" })).toBeNull();
});

test("rejects campaigns without usable characters", () => {
  expect(buildUtmLink({ ...input, campaign: "///" })).toBeNull();
});

test("covers every configured source", () => {
  for (const source of utmSources) {
    const link = buildUtmLink({ ...input, source: source.id });
    expect(link).toContain(`utm_source=${source.id}`);
  }
});

test("covers every configured medium", () => {
  for (const medium of utmMediums) {
    const link = buildUtmLink({ ...input, medium: medium.id });
    expect(link).toContain(`utm_medium=${medium.id}`);
  }
});
