import { expect, test } from "bun:test";

import { buildUtmLink, normalizePostId, utmSources } from "./utm";

test("builds a landing link with source and post id", () => {
  expect(buildUtmLink({ source: "instagram", postId: "post-123" })).toBe(
    "https://andes.crafter.run/?utm_source=instagram&utm_content=post-123",
  );
});

test("normalizes messy post ids into a single slug", () => {
  expect(normalizePostId("  Reel 42 / Carrusel  ")).toBe("reel-42-carrusel");
  expect(normalizePostId("DM_ábc")).toBe("dm-bc");
});

test("rejects post ids without usable characters", () => {
  expect(buildUtmLink({ source: "x", postId: "   " })).toBeNull();
  expect(buildUtmLink({ source: "x", postId: "///" })).toBeNull();
});

test("covers every configured source", () => {
  for (const source of utmSources) {
    const link = buildUtmLink({ source: source.id, postId: "launch" });
    expect(link).toContain(`utm_source=${source.id}`);
  }
});
